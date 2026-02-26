import { useEffect, useMemo, useRef, useState } from "react";
import { Code as SecurityCodeMonoOutline } from "react-svg-credit-card-payment-icons/icons/mono-outline";
import { useInvoicesSelection } from "./InvoicesSelectionContext";
import { Modal } from "./Modal";
import { CardBrandLogos } from "./payment-modal/CardBrandLogos";
import { Field } from "./payment-modal/Field";
import { LoadingSpinner } from "./payment-modal/LoadingSpinner";
import {
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  formatCvc,
  formatExpiry,
  inputClass,
  showError,
  validatePaymentForm,
} from "./payment-modal/paymentFormUtils";
import {
  createPaymentFingerprint,
  type ServerFieldErrors,
  shouldRotateIdempotencyKeyOnFieldChange,
  submitPaymentRequest,
} from "./payment-modal/paymentSubmission";
import {
  INITIAL_VALUES,
  type PaymentFormValues,
} from "./payment-modal/paymentModal.types";
import type { CreatePaymentResponse } from "../lib/api";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (result: PaymentSuccessResult) => void;
};

type FormTouched = Partial<Record<keyof PaymentFormValues, boolean>>;
export type PaymentSuccessResult = {
  payment: CreatePaymentResponse;
  paidInvoiceIds: string[];
  amount: number;
  fee: number;
  totalPaid: number;
};

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const {
    selectedInvoiceIds,
    subtotalAmount,
    feeAmount,
    payAmount,
    clearSelection,
  } = useInvoicesSelection();
  const [values, setValues] = useState<PaymentFormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<FormTouched>({});
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isRetryableError, setIsRetryableError] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<ServerFieldErrors>(
    {},
  );
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [lastFailedPaymentFingerprint, setLastFailedPaymentFingerprint] =
    useState<string | null>(null);

  const clientErrors = useMemo(() => validatePaymentForm(values), [values]);
  const paymentFingerprint = useMemo(
    () => createPaymentFingerprint(values),
    [values],
  );
  const errors = useMemo(
    () => ({ ...clientErrors, ...serverFieldErrors }),
    [clientErrors, serverFieldErrors],
  );
  const isFormValid = Object.keys(clientErrors).length === 0;
  const detectedBrand = detectCardBrand(digitsOnly(values.cardNumber));
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resetRequestStateForOpen();
  }, [isOpen]);

  function resetRequestStateForOpen() {
    setApiErrorMessage(null);
    setIsRetryableError(false);
    setServerFieldErrors({});
    setLastFailedPaymentFingerprint(null);
    setIdempotencyKey(crypto.randomUUID());
  }

  function updateField<K extends keyof PaymentFormValues>(
    field: K,
    nextValue: PaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setApiErrorMessage(null);
    setIsRetryableError(false);
    setServerFieldErrors({});

    if (
      shouldRotateIdempotencyKeyOnFieldChange(
        field,
        lastFailedPaymentFingerprint,
      )
    ) {
      setIdempotencyKey(crypto.randomUUID());
      setLastFailedPaymentFingerprint(null);
    }
  }

  function markTouched(field: keyof PaymentFormValues) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDidAttemptSubmit(true);
    setApiErrorMessage(null);
    setIsRetryableError(false);
    setServerFieldErrors({});

    if (!isFormValid || selectedInvoiceIds.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPaymentRequest({
        idempotencyKey,
        values,
        selectedInvoiceIds,
      });

      if (!result.ok) {
        setLastFailedPaymentFingerprint(paymentFingerprint);
        setApiErrorMessage(result.apiErrorMessage);
        setIsRetryableError(Boolean(result.retryable));
        setServerFieldErrors(result.serverFieldErrors ?? {});
        return;
      }

      const paidInvoiceIds = [...selectedInvoiceIds];
      onPaymentSuccess?.({
        payment: result.payment,
        paidInvoiceIds,
        amount: subtotalAmount,
        fee: feeAmount,
        totalPaid: payAmount,
      });

      onClose();
      clearSelection();
      setValues(INITIAL_VALUES);
      setTouched({});
      setDidAttemptSubmit(false);
      setApiErrorMessage(null);
      setIsRetryableError(false);
      setServerFieldErrors({});
      setLastFailedPaymentFingerprint(null);
      setIdempotencyKey("");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }
    setApiErrorMessage(null);
    setIsRetryableError(false);
    setServerFieldErrors({});
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      ariaLabel="Payment form"
      initialFocusRef={emailInputRef}
    >
      <form className="space-y-5 sm:p-12" onSubmit={handleSubmit} noValidate>
        <Field
          label="Email"
          htmlFor="payment-email"
          error={showError("email", touched, didAttemptSubmit, errors)}
          errorId="payment-email-error"
        >
          <input
            id="payment-email"
            ref={emailInputRef}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => markTouched("email")}
            className={inputClass(
              showError("email", touched, didAttemptSubmit, errors),
            )}
            aria-invalid={Boolean(
              showError("email", touched, didAttemptSubmit, errors),
            )}
            aria-describedby={
              showError("email", touched, didAttemptSubmit, errors)
                ? "payment-email-error"
                : undefined
            }
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label="Card information"
          htmlFor="payment-card-number"
          error={showError("cardNumber", touched, didAttemptSubmit, errors)}
          errorId="payment-card-number-error"
        >
          <div className="rounded-xl border border-zinc-300 bg-white">
            <div className="flex items-center gap-3 px-4 py-3">
              <input
                id="payment-card-number"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={values.cardNumber}
                onChange={(event) =>
                  updateField(
                    "cardNumber",
                    formatCardNumber(event.target.value),
                  )
                }
                onBlur={() => markTouched("cardNumber")}
                className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                aria-invalid={Boolean(
                  showError("cardNumber", touched, didAttemptSubmit, errors),
                )}
                aria-describedby={
                  showError("cardNumber", touched, didAttemptSubmit, errors)
                    ? "payment-card-number-error"
                    : undefined
                }
                placeholder="1234 1234 1234 1234"
              />
              <CardBrandLogos activeBrand={detectedBrand} />
            </div>

            <div className="grid grid-cols-[1fr_180px] border-t border-zinc-200">
              <div className="border-r border-zinc-200 px-4 py-3">
                <input
                  id="payment-expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={values.expiry}
                  onChange={(event) =>
                    updateField("expiry", formatExpiry(event.target.value))
                  }
                  onBlur={() => markTouched("expiry")}
                  className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                  aria-invalid={Boolean(
                    showError("expiry", touched, didAttemptSubmit, errors),
                  )}
                  aria-describedby={
                    showError("expiry", touched, didAttemptSubmit, errors)
                      ? "payment-expiry-error"
                      : undefined
                  }
                  placeholder="MM / YY"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-3">
                <input
                  id="payment-cvc"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={values.cvc}
                  onChange={(event) =>
                    updateField("cvc", formatCvc(event.target.value))
                  }
                  onBlur={() => markTouched("cvc")}
                  className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                  aria-invalid={Boolean(
                    showError("cvc", touched, didAttemptSubmit, errors),
                  )}
                  aria-describedby={
                    showError("cvc", touched, didAttemptSubmit, errors)
                      ? "payment-cvc-error"
                      : undefined
                  }
                  placeholder="CVC"
                />
                <SecurityCodeMonoOutline className="h-4 shrink-0 text-zinc-400" />
              </div>
            </div>
          </div>

          {showError("expiry", touched, didAttemptSubmit, errors) ? (
            <p id="payment-expiry-error" className="mt-1 text-xs text-red-600">
              {showError("expiry", touched, didAttemptSubmit, errors)}
            </p>
          ) : null}
          {showError("cvc", touched, didAttemptSubmit, errors) ? (
            <p id="payment-cvc-error" className="mt-1 text-xs text-red-600">
              {showError("cvc", touched, didAttemptSubmit, errors)}
            </p>
          ) : null}
        </Field>

        <Field
          label="Cardholder name"
          htmlFor="payment-cardholder"
          error={showError("cardholderName", touched, didAttemptSubmit, errors)}
          errorId="payment-cardholder-error"
        >
          <input
            id="payment-cardholder"
            type="text"
            autoComplete="cc-name"
            value={values.cardholderName}
            onChange={(event) =>
              updateField("cardholderName", event.target.value.toUpperCase())
            }
            onBlur={() => markTouched("cardholderName")}
            className={inputClass(
              showError("cardholderName", touched, didAttemptSubmit, errors),
            )}
            aria-invalid={Boolean(
              showError("cardholderName", touched, didAttemptSubmit, errors),
            )}
            aria-describedby={
              showError("cardholderName", touched, didAttemptSubmit, errors)
                ? "payment-cardholder-error"
                : undefined
            }
            placeholder="Full name on card"
          />
        </Field>

        <Field
          label="Country or region"
          htmlFor="payment-country"
          error={showError("countryRegion", touched, didAttemptSubmit, errors)}
          errorId="payment-country-error"
        >
          <div className="rounded-xl border border-zinc-300 bg-white">
            <div className="px-4 py-3">
              <select
                id="payment-country"
                value={values.countryRegion}
                onChange={(event) =>
                  updateField("countryRegion", event.target.value)
                }
                onBlur={() => markTouched("countryRegion")}
                className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 focus:outline-none"
                aria-invalid={Boolean(
                  showError("countryRegion", touched, didAttemptSubmit, errors),
                )}
                aria-describedby={
                  showError("countryRegion", touched, didAttemptSubmit, errors)
                    ? "payment-country-error"
                    : undefined
                }
              >
                <option value="United States">United States</option>
              </select>
            </div>
            <div className="border-t border-zinc-200 px-4 py-3">
              <input
                id="payment-zip"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={values.zip}
                onChange={(event) => updateField("zip", event.target.value)}
                onBlur={() => markTouched("zip")}
                className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                aria-invalid={Boolean(
                  showError("zip", touched, didAttemptSubmit, errors),
                )}
                aria-describedby={
                  showError("zip", touched, didAttemptSubmit, errors)
                    ? "payment-zip-error"
                    : undefined
                }
                placeholder="ZIP"
              />
            </div>
          </div>
          {showError("zip", touched, didAttemptSubmit, errors) ? (
            <p id="payment-zip-error" className="mt-1 text-xs text-red-600">
              {showError("zip", touched, didAttemptSubmit, errors)}
            </p>
          ) : null}
        </Field>

        {selectedInvoiceIds.length === 0 ? (
          <p className="text-sm text-red-600">
            Select at least one invoice to continue.
          </p>
        ) : null}

        {apiErrorMessage ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
            aria-live="polite"
          >
            <p>{apiErrorMessage}</p>
            {isRetryableError ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="pt-1">
          <button
            type="submit"
            disabled={
              !isFormValid || isSubmitting || selectedInvoiceIds.length === 0
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-3 text-lg font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#1a2143]"
          >
            {isSubmitting ? <LoadingSpinner /> : null}
            <span>{isSubmitting ? "Processing..." : "Pay"}</span>
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
            By clicking Pay, you agree to the Link Terms and Privacy Policy.
          </p>
        </div>
      </form>
    </Modal>
  );
}
