import { formatReceiptDateTime } from "../lib/date";
import { formatUsdCurrency } from "../lib/money";
import { Modal } from "./Modal";

export type ReceiptData = {
  refNumber: string;
  paymentTimeIso: string;
  amount: number;
  fee: number;
  totalPaid: number;
};

type ReceiptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
};

export function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  if (!receipt) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Payment receipt">
      <div className="py-2 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-2xl font-semibold text-white">
              ✓
            </div>
          </div>
          <h2 className="mt-6 text-2xl text-zinc-600">Payment Success!</h2>
          <p className="mt-4 font-mono text-3xl font-semibold tracking-tight text-zinc-900">
            {formatUsdCurrency(receipt.totalPaid).replace("$", "$ ")}
          </p>
        </div>

        <div className="space-y-2 mt-[6rem] pb-6 text-sm sm:text-base">
          <div className="flex items-center justify-between gap-4 text-zinc-500">
            <span>Ref Number</span>
            <span className="font-mono text-zinc-900">{receipt.refNumber}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-zinc-500">
            <span>Payment Time</span>
            <span className="font-medium text-zinc-900">
              {formatReceiptDateTime(receipt.paymentTimeIso)}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-zinc-200 pt-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-zinc-500">
              <span>Amount</span>
              <span className="font-mono font-semibold text-zinc-900">
                {formatUsdCurrency(receipt.amount).replace("$", "$ ")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-zinc-500">
              <span>Fee</span>
              <span className="font-mono font-semibold text-zinc-900">
                {formatUsdCurrency(receipt.fee).replace("$", "$ ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
