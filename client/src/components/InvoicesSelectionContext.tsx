import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Invoice } from "../types";

type InvoicesSelectionContextValue = {
  invoices: Invoice[];
  selectedInvoiceIds: string[];
  selectedInvoices: Invoice[];
  selectedInvoiceIdSet: Set<string>;
  toggleInvoice: (invoiceId: string) => void;
  setSelectedInvoiceIds: (invoiceIds: string[]) => void;
  clearSelection: () => void;
  subtotalAmount: number;
  feeAmount: number;
  payAmount: number;
};

const InvoicesSelectionContext =
  createContext<InvoicesSelectionContextValue | null>(null);

type InvoicesSelectionProviderProps = PropsWithChildren<{
  invoices: Invoice[];
}>;

const FEE_PER_INVOICE = 5;

export function InvoicesSelectionProvider({
  invoices,
  children,
}: InvoicesSelectionProviderProps) {
  const [selectedInvoiceIds, setSelectedInvoiceIdsState] = useState<string[]>(
    () =>
      invoices[invoices.length - 1]?.id
        ? [invoices[invoices.length - 1].id]
        : [],
  );

  const selectedInvoiceIdSet = useMemo(
    () => new Set(selectedInvoiceIds),
    [selectedInvoiceIds],
  );

  const selectedInvoices = useMemo(
    () => invoices.filter((invoice) => selectedInvoiceIdSet.has(invoice.id)),
    [invoices, selectedInvoiceIdSet],
  );

  const subtotalAmount = selectedInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  );
  const feeAmount = selectedInvoices.length * FEE_PER_INVOICE;
  const payAmount = subtotalAmount + feeAmount;

  function setSelectedInvoiceIds(invoiceIds: string[]) {
    const allowedIds = new Set(invoices.map((invoice) => invoice.id));
    const deduped = Array.from(
      new Set(invoiceIds.filter((invoiceId) => allowedIds.has(invoiceId))),
    );
    setSelectedInvoiceIdsState(deduped);
  }

  function toggleInvoice(invoiceId: string) {
    setSelectedInvoiceIdsState((current) =>
      current.includes(invoiceId)
        ? current.filter((id) => id !== invoiceId)
        : [...current, invoiceId],
    );
  }

  function clearSelection() {
    setSelectedInvoiceIdsState([]);
  }

  useEffect(() => {
    setSelectedInvoiceIdsState((current) => {
      const allowedIds = new Set(invoices.map((invoice) => invoice.id));
      const next = current.filter((invoiceId) => allowedIds.has(invoiceId));
      return next.length === current.length ? current : next;
    });
  }, [invoices]);

  const value = useMemo<InvoicesSelectionContextValue>(
    () => ({
      invoices,
      selectedInvoiceIds,
      selectedInvoices,
      selectedInvoiceIdSet,
      toggleInvoice,
      setSelectedInvoiceIds,
      clearSelection,
      subtotalAmount,
      feeAmount,
      payAmount,
    }),
    [
      invoices,
      selectedInvoiceIds,
      selectedInvoices,
      selectedInvoiceIdSet,
      subtotalAmount,
      feeAmount,
      payAmount,
    ],
  );

  return (
    <InvoicesSelectionContext.Provider value={value}>
      {children}
    </InvoicesSelectionContext.Provider>
  );
}

export function useInvoicesSelection() {
  const context = useContext(InvoicesSelectionContext);

  if (!context) {
    throw new Error(
      "useInvoicesSelection must be used within InvoicesSelectionProvider",
    );
  }

  return context;
}
