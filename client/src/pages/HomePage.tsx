import { InvoicesSelectionProvider } from "../components/InvoicesSelectionContext";
import { InvoicesTable } from "../components/InvoicesTable";
import { PaymentSummary } from "../components/PaymentSummary";
import { TotalAmountCard } from "../components/TotalAmountCard";
import { HOME_PAGE_TITLE } from "../data/home";
import { mockInvoicesResponse } from "../data/invoices";

export function HomePage() {
  const lastUpdatedDate = mockInvoicesResponse.lastUpdated.split("T")[0];

  return (
    <InvoicesSelectionProvider invoices={mockInvoicesResponse.invoices}>
      <section className="py-6">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-lg font-semibold uppercase tracking-[0.03em] text-slate-700">
            {HOME_PAGE_TITLE}
          </h1>
        </div>

        <div className="mt-4 lg:items-start">
          <div className="space-y-6">
            <TotalAmountCard
              totalAmount={mockInvoicesResponse.totalAmount}
              lastUpdatedDate={lastUpdatedDate}
            />

            <div className="hidden lg:block">
              <InvoicesTable invoices={mockInvoicesResponse.invoices} />
            </div>
          </div>
        </div>

        <div className="mt-8 hidden lg:mt-10 lg:ml-auto lg:block lg:w-1/4 lg:min-w-[300px] lg:max-w-[336px]">
          <PaymentSummary />
        </div>

        <div className="mt-6 lg:hidden">
          <InvoicesTable invoices={mockInvoicesResponse.invoices} />
          <div className="mt-6">
            <PaymentSummary />
          </div>
        </div>
      </section>
    </InvoicesSelectionProvider>
  );
}
