import { useMemo, useState } from "react";
import { InvoicesSelectionProvider } from "../components/InvoicesSelectionContext";
import { InvoicesTable } from "../components/InvoicesTable";
import { PaymentModal } from "../components/PaymentModal";
import { PaymentSummary } from "../components/PaymentSummary";
import { ReceiptModal, type ReceiptData } from "../components/ReceiptModal";
import { TotalAmountCard } from "../components/TotalAmountCard";
import { HOME_PAGE_TITLE } from "../data/home";
import { mockInvoicesResponse } from "../data/invoices";
import type { Invoice } from "../types";
import type { PaymentSuccessResult } from "../components/PaymentModal";

export function HomePage() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(
    mockInvoicesResponse.invoices,
  );
  const [lastUpdatedIso, setLastUpdatedIso] = useState<string>(
    mockInvoicesResponse.lastUpdated,
  );

  const totalAmount = useMemo(
    () => invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    [invoices],
  );
  const lastUpdatedDate = lastUpdatedIso.split("T")[0];
  const hasInvoices = invoices.length > 0;

  function handlePaymentSuccess(result: PaymentSuccessResult) {
    const nowIso = new Date().toISOString();

    setInvoices((current) =>
      current.filter((invoice) => !result.paidInvoiceIds.includes(invoice.id)),
    );
    setLastUpdatedIso(nowIso);
    setReceipt({
      refNumber: generateReceiptReference(),
      paymentTimeIso: nowIso,
      amount: result.amount,
      fee: result.fee,
      totalPaid: result.totalPaid,
    });
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  }

  return (
    <InvoicesSelectionProvider invoices={invoices}>
      <section className="py-6">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-lg font-semibold uppercase tracking-[0.03em] text-slate-700">
            {HOME_PAGE_TITLE}
          </h1>
        </div>

        <div className="mt-4 lg:items-start">
          <div className="space-y-6">
            <TotalAmountCard
              totalAmount={totalAmount}
              lastUpdatedDate={lastUpdatedDate}
            />

            {hasInvoices ? (
              <div className="hidden lg:block">
                <InvoicesTable invoices={invoices} />
              </div>
            ) : (
              <div className="hidden rounded-lg border border-slate-200 bg-white p-8 text-center lg:block">
                <p className="text-lg font-medium text-slate-700">
                  No invoices to pay
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  You&apos;re all caught up. New invoices will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {hasInvoices ? (
          <div className="mt-8 hidden lg:mt-10 lg:ml-auto lg:block lg:w-1/4 lg:min-w-[300px] lg:max-w-[336px]">
            <PaymentSummary onPayClick={() => setIsPaymentModalOpen(true)} />
          </div>
        ) : null}

        <div className="mt-6 lg:hidden">
          {hasInvoices ? (
            <>
              <InvoicesTable invoices={invoices} />
              <div className="mt-6">
                <PaymentSummary
                  onPayClick={() => setIsPaymentModalOpen(true)}
                />
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
              <p className="text-base font-medium text-slate-700">
                No invoices to pay
              </p>
              <p className="mt-2 text-sm text-slate-500">
                You&apos;re all caught up. New invoices will appear here.
              </p>
            </div>
          )}
        </div>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          receipt={receipt}
        />
      </section>
    </InvoicesSelectionProvider>
  );
}

function generateReceiptReference() {
  const randomDigits = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return randomDigits;
}
