import { formatUsdCurrency } from "../lib/money";
import { useInvoicesSelection } from "./InvoicesSelectionContext";

type PaymentSummaryProps = {
  onPayClick?: () => void;
};

export function PaymentSummary({ onPayClick }: PaymentSummaryProps) {
  const { selectedInvoices, feeAmount, payAmount } = useInvoicesSelection();
  const hasSelection = selectedInvoices.length > 0;

  return (
    <aside>
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
        <p className="text-right text-xs font-medium">Payment summary</p>

        <div className="mt-2 max-h-28 space-y-1 overflow-auto pt-3 text-xs">
          {hasSelection ? (
            selectedInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate">{invoice.id}</span>
                <span className="whitespace-nowrap font-mono text-slate-500">
                  {formatUsdCurrency(invoice.amount).replace("$", "$ ")}
                </span>
              </div>
            ))
          ) : (
            <p className="text-right text-slate-400">No invoices selected</p>
          )}
          <div className="flex items-center justify-between gap-4">
            <span>Fee</span>
            <span className="whitespace-nowrap font-mono">
              {formatUsdCurrency(feeAmount).replace("$", "$ ")}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onPayClick}
        className="mt-4 w-full rounded-md bg-[var(--color-brand)] px-4 py-3 text-xl font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!hasSelection}
      >
        Pay {formatUsdCurrency(payAmount).replace("$", "$ ")}
      </button>
    </aside>
  );
}
