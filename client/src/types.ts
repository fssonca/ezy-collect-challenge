export type Priority = "normal" | "high" | "urgent" | "critical";

export type Invoice = {
  id: string;
  vendor: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  priority: Priority;
};

export type InvoicesResponse = {
  invoices: Invoice[];
  totalAmount: number;
  lastUpdated: string;
};
