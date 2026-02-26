import {
  ApiClientError,
  api,
  type ApiFieldError,
  type CreatePaymentResponse,
} from "../../lib/api";
import { digitsOnly } from "./paymentFormUtils";
import type { PaymentFormValues } from "./paymentModal.types";

export type ServerFieldErrors = Partial<
  Record<keyof PaymentFormValues, string>
>;

export type SubmitPaymentResult =
  | { ok: true; payment: CreatePaymentResponse }
  | {
      ok: false;
      apiErrorMessage: string;
      serverFieldErrors?: ServerFieldErrors;
      retryable?: boolean;
    };

export function createPaymentFingerprint(values: PaymentFormValues) {
  return JSON.stringify({
    cardholderName: values.cardholderName.trim(),
    cardNumber: digitsOnly(values.cardNumber),
    expiry: values.expiry.replace(/\s+/g, ""),
    cvc: digitsOnly(values.cvc),
  });
}

export function shouldRotateIdempotencyKeyOnFieldChange(
  field: keyof PaymentFormValues,
  lastFailedPaymentFingerprint: string | null,
) {
  if (!lastFailedPaymentFingerprint) {
    return false;
  }

  return (
    field === "cardholderName" ||
    field === "cardNumber" ||
    field === "expiry" ||
    field === "cvc"
  );
}

export async function submitPaymentRequest(params: {
  idempotencyKey: string;
  values: PaymentFormValues;
  selectedInvoiceIds: string[];
}): Promise<SubmitPaymentResult> {
  const cardholderNameParts = params.values.cardholderName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (cardholderNameParts.length < 2) {
    return {
      ok: false,
      apiErrorMessage: "Please review the payment form.",
      serverFieldErrors: { cardholderName: "Enter first and last name" },
    };
  }

  const [firstName, ...lastNameParts] = cardholderNameParts;
  const lastName = lastNameParts.join(" ");

  try {
    const payment = await api.postPayment(params.idempotencyKey, {
      invoiceIds: params.selectedInvoiceIds,
      firstName,
      lastName,
      expiry: params.values.expiry.replace(/\s+/g, ""),
      cvv: digitsOnly(params.values.cvc),
      cardNumber: digitsOnly(params.values.cardNumber),
    });

    return { ok: true, payment };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status === 409) {
        return {
          ok: false,
          apiErrorMessage:
            "This payment attempt was already submitted with a different payload. Please reopen the payment form and try again.",
        };
      }

      if (error.status === 400) {
        return {
          ok: false,
          apiErrorMessage:
            error.responseBody?.message ?? "Please review the payment form.",
          serverFieldErrors: mapApiFieldErrors(error.responseBody?.fieldErrors),
        };
      }

      return {
        ok: false,
        apiErrorMessage: "Payment failed. Please try again.",
        retryable: true,
      };
    }

    return {
      ok: false,
      apiErrorMessage: "Network error while submitting payment. Please retry.",
      retryable: true,
    };
  }
}

function mapApiFieldErrors(fieldErrors?: ApiFieldError[]): ServerFieldErrors {
  if (!fieldErrors?.length) {
    return {};
  }

  const mapped: ServerFieldErrors = {};
  for (const fieldError of fieldErrors) {
    const normalized = normalizeApiFieldName(fieldError.field);
    if (normalized && !mapped[normalized]) {
      mapped[normalized] = fieldError.message;
    }
  }
  return mapped;
}

function normalizeApiFieldName(field: string): keyof PaymentFormValues | null {
  if (field === "cardNumber") return "cardNumber";
  if (field === "expiry") return "expiry";
  if (field === "cvv") return "cvc";
  if (field === "firstName" || field === "lastName") return "cardholderName";
  return null;
}
