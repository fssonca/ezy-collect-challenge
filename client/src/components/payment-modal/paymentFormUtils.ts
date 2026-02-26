import type {
  CardBrand,
  PaymentFormErrors,
  PaymentFormValues,
} from "./paymentModal.types";

export function inputClass(hasError?: string) {
  return `w-full rounded-xl border px-4 py-3 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-400"
      : "border-zinc-300 focus:border-zinc-400 focus:ring-zinc-400"
  }`;
}

export function showError(
  field: keyof PaymentFormValues,
  touched: Partial<Record<keyof PaymentFormValues, boolean>>,
  didAttemptSubmit: boolean,
  errors: PaymentFormErrors,
) {
  if (!touched[field] && !didAttemptSubmit) {
    return undefined;
  }
  return errors[field];
}

export function validatePaymentForm(values: PaymentFormValues): PaymentFormErrors {
  const errors: PaymentFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email";
  }

  const cardDigits = digitsOnly(values.cardNumber);
  if (!cardDigits) {
    errors.cardNumber = "Card number is required";
  } else if (!/^\d{12,19}$/.test(cardDigits)) {
    errors.cardNumber = "Enter a valid card number";
  }

  if (!values.expiry.trim()) {
    errors.expiry = "Expiry is required";
  } else if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(values.expiry.trim())) {
    errors.expiry = "Use MM/YY";
  }

  const cvcDigits = digitsOnly(values.cvc);
  if (!cvcDigits) {
    errors.cvc = "CVC is required";
  } else if (!/^\d{3,4}$/.test(cvcDigits)) {
    errors.cvc = "CVC must be 3 or 4 digits";
  }

  if (!values.cardholderName.trim()) {
    errors.cardholderName = "Cardholder name is required";
  }

  if (!values.countryRegion.trim()) {
    errors.countryRegion = "Country/region is required";
  }

  if (!values.zip.trim()) {
    errors.zip = "ZIP is required";
  } else if (!/^[A-Za-z0-9 -]{3,10}$/.test(values.zip.trim())) {
    errors.zip = "Enter a valid ZIP";
  }

  return errors;
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string) {
  const digits = digitsOnly(value).slice(0, 19);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(" ") : "";
}

export function formatExpiry(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function formatCvc(value: string) {
  return digitsOnly(value).slice(0, 4);
}

export function detectCardBrand(cardDigits: string): CardBrand {
  if (!cardDigits) {
    return "unknown";
  }
  if (/^4/.test(cardDigits)) {
    return "visa";
  }
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(cardDigits)) {
    return "mastercard";
  }
  if (/^3[47]/.test(cardDigits)) {
    return "amex";
  }
  if (/^(6011|65|64[4-9])/.test(cardDigits)) {
    return "discover";
  }
  return "unknown";
}
