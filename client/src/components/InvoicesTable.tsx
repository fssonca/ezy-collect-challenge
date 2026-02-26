import { useState } from "react";
import { formatDateDayMonthYear } from "../lib/date";
import { formatUsdCurrency } from "../lib/money";
import type { Invoice, Priority } from "../types";

type SortKey =
  | "id"
  | "vendor"
  | "issueDate"
  | "dueDate"
  | "amount"
  | "priority";
type SortDirection = "asc" | "desc";

type InvoicesTableProps = {
  invoices: Invoice[];
  selectedInvoiceId?: string | null;
  onSelectedInvoiceIdChange?: (invoiceId: string | null) => void;
};

const priorityRank: Record<Priority, number> = {
  normal: 0,
  high: 1,
  urgent: 2,
  critical: 3,
};

const headers: Array<{ key: SortKey; label: string }> = [
  { key: "id", label: "Number" },
  { key: "vendor", label: "Vendor" },
  { key: "issueDate", label: "Date" },
  { key: "dueDate", label: "Due Date" },
  { key: "amount", label: "Amount" },
  { key: "priority", label: "Priority" },
];

export function InvoicesTable({
  invoices,
  selectedInvoiceId: controlledSelectedInvoiceId,
  onSelectedInvoiceIdChange,
}: InvoicesTableProps) {
  const [internalSelectedInvoiceId, setInternalSelectedInvoiceId] = useState<
    string | null
  >(invoices[invoices.length - 1]?.id ?? null);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const selectedInvoiceId =
    controlledSelectedInvoiceId === undefined
      ? internalSelectedInvoiceId
      : controlledSelectedInvoiceId;

  function setSelectedInvoiceId(next: string | null) {
    if (controlledSelectedInvoiceId === undefined) {
      setInternalSelectedInvoiceId(next);
    }
    onSelectedInvoiceIdChange?.(next);
  }

  const sortedInvoices = [...invoices].sort((a, b) => {
    let result = 0;

    switch (sortKey) {
      case "id":
        result = a.id.localeCompare(b.id);
        break;
      case "vendor":
        result = a.vendor.localeCompare(b.vendor);
        break;
      case "issueDate":
        result = a.issueDate.localeCompare(b.issueDate);
        break;
      case "dueDate":
        result = a.dueDate.localeCompare(b.dueDate);
        break;
      case "amount":
        result = a.amount - b.amount;
        break;
      case "priority":
        result = priorityRank[a.priority] - priorityRank[b.priority];
        break;
      default:
        result = 0;
    }

    return sortDirection === "asc" ? result : -result;
  });

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  function toggleSelectAll() {
    if (selectedInvoiceId) {
      setSelectedInvoiceId(null);
      return;
    }

    setSelectedInvoiceId(sortedInvoices[0]?.id ?? null);
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-50/90">
            <tr className="border-b border-slate-200">
              <th className="w-12 px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-blue-500 bg-white text-[11px] font-bold leading-none text-blue-600"
                  aria-label="Toggle invoice selection"
                >
                  <span className={` ${selectedInvoiceId ?? "text-white"}`}>
                    —
                  </span>
                </button>
              </th>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={`px-4 py-3 ${
                    header.key === "amount" || header.key === "priority"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(header.key)}
                    className={`inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 ${
                      header.key === "amount" || header.key === "priority"
                        ? "justify-end"
                        : ""
                    }`}
                  >
                    <span>{header.label}</span>
                    <span className="text-xs text-slate-500" aria-hidden="true">
                      {sortKey === header.key
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedInvoices.map((invoice) => {
              const isSelected = selectedInvoiceId === invoice.id;

              return (
                <tr
                  key={invoice.id}
                  className={`border-b border-slate-200 transition-colors`}
                >
                  <td className="px-4 py-2.5">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelectedInvoiceId(isSelected ? null : invoice.id)
                        }
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-1 focus:ring-blue-500"
                        aria-label={`Select invoice ${invoice.id}`}
                      />
                    </label>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">
                    <span className="whitespace-nowrap">{invoice.id}</span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-slate-500">
                    {invoice.vendor}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-slate-500">
                    {formatDateDayMonthYear(invoice.issueDate)}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-slate-500">
                    {formatDateDayMonthYear(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-semibold text-slate-600">
                    <span className="whitespace-nowrap font-mono">
                      {formatCurrencyTable(invoice.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <PriorityBadge priority={invoice.priority} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCurrencyTable(amount: number) {
  return formatUsdCurrency(amount).replace("$", "$ ");
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styleMap: Record<Priority, string> = {
    normal: "bg-slate-100 text-slate-500",
    high: "bg-amber-100 text-amber-700",
    urgent: "bg-orange-100 text-orange-600",
    critical: "bg-red-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styleMap[priority]}`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          priority === "critical" ? "bg-white" : "bg-current"
        }`}
      />
      {priority}
    </span>
  );
}
