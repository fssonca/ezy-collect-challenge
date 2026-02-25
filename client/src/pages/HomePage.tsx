import { HOME_PAGE_TITLE } from "../data/home";
import { mockInvoicesResponse } from "../data/invoices";
import { formatDateDayMonthYear } from "../lib/date";
import { formatUsdCurrency } from "../lib/money";

export function HomePage() {
  return (
    <section className="py-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {HOME_PAGE_TITLE}
          </h1>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
            Total amount to pay
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {formatUsdCurrency(mockInvoicesResponse.totalAmount)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Last updated{" "}
            {formatDateDayMonthYear(mockInvoicesResponse.lastUpdated)}
          </p>
        </aside>
      </div>
    </section>
  );
}
