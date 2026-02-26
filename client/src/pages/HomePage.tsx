import { useMemo, useState } from "react";
import { InvoicesTable } from "../components/InvoicesTable";
import { PaymentSummary } from "../components/PaymentSummary";
import { TotalAmountCard } from "../components/TotalAmountCard";
import { HOME_PAGE_TITLE } from "../data/home";
import { mockInvoicesResponse } from "../data/invoices";
import { formatDateDayMonthYear } from "../lib/date";
import { formatUsdCurrency } from "../lib/money";

export function HomePage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    mockInvoicesResponse.invoices[mockInvoicesResponse.invoices.length - 1]
      ?.id ?? null,
  );

  const selectedInvoice = useMemo(
    () =>
      mockInvoicesResponse.invoices.find(
        (invoice) => invoice.id === selectedInvoiceId,
      ) ?? null,
    [selectedInvoiceId],
  );

  const feeAmount = selectedInvoice ? 5 : 0;
  const payAmount = (selectedInvoice?.amount ?? 0) + feeAmount;
  const lastUpdatedDate = mockInvoicesResponse.lastUpdated.split("T")[0];

  return (
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
            <InvoicesTable
              invoices={mockInvoicesResponse.invoices}
              selectedInvoiceId={selectedInvoiceId}
              onSelectedInvoiceIdChange={setSelectedInvoiceId}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 hidden lg:mt-10 lg:ml-auto lg:block lg:w-1/4 lg:min-w-[300px] lg:max-w-[336px]">
        <PaymentSummary
          selectedInvoice={selectedInvoice}
          feeAmount={feeAmount}
          payAmount={payAmount}
        />
      </div>

      <div className="mt-6 lg:hidden">
        <div className="mb-4 rounded-md bg-slate-100 px-4 py-3">
          <p className="text-xs text-slate-600">Total amount to pay</p>
          <p className="mt-1 text-xl font-semibold text-slate-700">
            {formatUsdCurrency(mockInvoicesResponse.totalAmount)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Last updated{" "}
            {formatDateDayMonthYear(mockInvoicesResponse.lastUpdated)}
          </p>
        </div>
        <InvoicesTable
          invoices={mockInvoicesResponse.invoices}
          selectedInvoiceId={selectedInvoiceId}
          onSelectedInvoiceIdChange={setSelectedInvoiceId}
        />
        <div className="mt-6">
          <PaymentSummary
            selectedInvoice={selectedInvoice}
            feeAmount={feeAmount}
            payAmount={payAmount}
          />
        </div>
      </div>
    </section>
  );
}
