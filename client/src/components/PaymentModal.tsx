import { useMemo, useState } from "react";
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
  INITIAL_VALUES,
  type PaymentFormValues,
} from "./payment-modal/paymentModal.types";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { selectedInvoiceIds } = useInvoicesSelection();
  const [values, setValues] = useState<PaymentFormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof PaymentFormValues, boolean>>>({});
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => validatePaymentForm(values), [values]);
  const isFormValid = Object.keys(errors).length === 0;
  const detectedBrand = detectCardBrand(digitsOnly(values.cardNumber));

  function updateField<K extends keyof PaymentFormValues>(
    field: K,
    nextValue: PaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: nextValue }));
  }

  function markTouched(field: keyof PaymentFormValues) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDidAttemptSubmit(true);

    if (!isFormValid || selectedInvoiceIds.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Wire to backend payment endpoint once checkout payload mapping is finalized.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onClose();
      setValues(INITIAL_VALUES);
      setTouched({});
      setDidAttemptSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <form className="space-y-5 sm:p-12" onSubmit={handleSubmit} noValidate>
        <Field label="Email" htmlFor="payment-email" error={showError("email", touched, didAttemptSubmit, errors)}>
          <input
            id="payment-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => markTouched("email")}
            className={inputClass(showError("email", touched, didAttemptSubmit, errors))}
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label="Card information"
          htmlFor="payment-card-number"
          error={showError("cardNumber", touched, didAttemptSubmit, errors)}
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
                  updateField("cardNumber", formatCardNumber(event.target.value))
                }
                onBlur={() => markTouched("cardNumber")}
                className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                placeholder="1234 1234 1234 1234"
              />
              <CardBrandLogos activeBrand={detectedBrand} />
            </div>

            <div className="grid grid-cols-[1fr_180px] border-t border-zinc-200">
              <div className="border-r border-zinc-200 px-4 py-3">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={values.expiry}
                  onChange={(event) =>
                    updateField("expiry", formatExpiry(event.target.value))
                  }
                  onBlur={() => markTouched("expiry")}
                  className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                  placeholder="MM / YY"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-3">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={values.cvc}
                  onChange={(event) => updateField("cvc", formatCvc(event.target.value))}
                  onBlur={() => markTouched("cvc")}
                  className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                  placeholder="CVC"
                />
                <SecurityCodeMonoOutline
                  format="flatRounded"
                  className="h-4 shrink-0 text-zinc-400"
                />
              </div>
            </div>
          </div>

          {showError("expiry", touched, didAttemptSubmit, errors) ? (
            <p className="mt-1 text-xs text-red-600">
              {showError("expiry", touched, didAttemptSubmit, errors)}
            </p>
          ) : null}
          {showError("cvc", touched, didAttemptSubmit, errors) ? (
            <p className="mt-1 text-xs text-red-600">
              {showError("cvc", touched, didAttemptSubmit, errors)}
            </p>
          ) : null}
        </Field>

        <Field
          label="Cardholder name"
          htmlFor="payment-cardholder"
          error={showError("cardholderName", touched, didAttemptSubmit, errors)}
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
            className={inputClass(showError("cardholderName", touched, didAttemptSubmit, errors))}
            placeholder="Full name on card"
          />
        </Field>

        <Field
          label="Country or region"
          htmlFor="payment-country"
          error={showError("countryRegion", touched, didAttemptSubmit, errors)}
        >
          <div className="rounded-xl border border-zinc-300 bg-white">
            <div className="px-4 py-3">
              <select
                id="payment-country"
                value={values.countryRegion}
                onChange={(event) => updateField("countryRegion", event.target.value)}
                onBlur={() => markTouched("countryRegion")}
                className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 focus:outline-none"
              >
                <option value="United States">United States</option>
              </select>
            </div>
            <div className="border-t border-zinc-200 px-4 py-3">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={values.zip}
                onChange={(event) => updateField("zip", event.target.value)}
                onBlur={() => markTouched("zip")}
                className="w-full border-0 bg-transparent p-0 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                placeholder="ZIP"
              />
            </div>
          </div>
          {showError("zip", touched, didAttemptSubmit, errors) ? (
            <p className="mt-1 text-xs text-red-600">
              {showError("zip", touched, didAttemptSubmit, errors)}
            </p>
          ) : null}
        </Field>

        {selectedInvoiceIds.length === 0 ? (
          <p className="text-sm text-red-600">Select at least one invoice to continue.</p>
        ) : null}

        <div className="pt-1">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || selectedInvoiceIds.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-3 text-lg font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#1a2143]"
          >
            {isSubmitting ? <LoadingSpinner /> : null}
            <span>Pay</span>
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
            By clicking Pay, you agree to the Link Terms and Privacy Policy.
          </p>
        </div>
      </form>
    </Modal>
  );
}
