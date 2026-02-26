import type { Invoice } from "../types";
import { formatUsdCurrency } from "../lib/money";

type PaymentSummaryProps = {
  selectedInvoice: Invoice | null;
  feeAmount: number;
  payAmount: number;
};

export function PaymentSummary({
  selectedInvoice,
  feeAmount,
  payAmount,
}: PaymentSummaryProps) {
  return (
    <aside>
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
        <p className="text-right text-xs font-medium">Payment summary</p>
        <div className="mt-8 grid grid-cols-12 items-center gap-y-2">
          <div className="col-span-5 truncate pr-4 text-right">
            {selectedInvoice?.id ?? "No invoice selected"}
          </div>
          <div className="col-span-7 whitespace-nowrap text-right font-mono">
            {selectedInvoice
              ? formatUsdCurrency(selectedInvoice.amount).replace("$", "$ ")
              : "$ 0.00"}
          </div>

          <div className="col-span-5 pr-4 text-right">Fee</div>
          <div className="col-span-7 whitespace-nowrap text-right font-mono">
            {formatUsdCurrency(feeAmount).replace("$", "$ ")}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-md bg-[var(--color-brand)] px-4 py-3 text-xl font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!selectedInvoice}
      >
        Pay {formatUsdCurrency(payAmount)}
      </button>
    </aside>
  );
}
