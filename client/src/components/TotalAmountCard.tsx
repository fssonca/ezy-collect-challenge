import { formatUsdCurrency } from "../lib/money";

type TotalAmountCardProps = {
  totalAmount: number;
  lastUpdatedDate: string;
};

export function TotalAmountCard({
  totalAmount,
  lastUpdatedDate,
}: TotalAmountCardProps) {
  return (
    <div className="text-slate-600 lg:flex lg:justify-end">
      <aside className="w-fullsm:max-w-[336px] rounded-md bg-zinc-100 px-4 py-3">
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-5 min-w-0">
            <div className="text-xs leading-tight text-slate-500">
              Total amount to pay
            </div>
            <div className="mt-1 font-mono text-xs text-slate-500 font-medium tracking-tight">
              {lastUpdatedDate}
            </div>
          </div>
          <div className="col-span-7 min-w-0 whitespace-nowrap text-right font-mono text-2xl leading-none tracking-tight">
            {formatUsdCurrency(totalAmount).replace("$", "$ ")}
          </div>
        </div>
      </aside>
    </div>
  );
}
