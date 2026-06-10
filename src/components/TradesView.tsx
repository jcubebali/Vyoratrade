import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  HelpCircle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Wallet
} from "lucide-react";
import { CompleteState, Trade } from "../types";

interface TradesViewProps {
  state: CompleteState;
}

export default function TradesView({ state }: TradesViewProps) {
  const { trades } = state;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          Automated Ledger History
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete compliance list of buy orders, target take-profits, stop-out logs, and manual portfolio adjust transactions.
        </p>
      </header>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
            Consolidated Ledger
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-400 font-mono py-0.5 px-2 rounded-full font-bold">
            {trades.length} RECORDED ENTRIES
          </span>
        </div>

        <div className="overflow-x-auto">
          {trades.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <Clock className="mx-auto h-8 w-8 text-slate-700 mb-3" />
              <p className="text-xs">No active ledger entry records compiled.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/40 text-slate-500 font-semibold font-mono uppercase tracking-wider border-b border-slate-800/60 select-none">
                <tr>
                  <th className="py-3.5 px-5">Time / ID</th>
                  <th className="py-3.5 px-4">Asset symbol</th>
                  <th className="py-3.5 px-4 text-center">Trade Type</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Amount Filled</th>
                  <th className="py-3.5 px-4 text-right">Total Size</th>
                  <th className="py-3.5 px-4 text-right">Realized PnL</th>
                  <th className="py-3.5 px-5 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-350">
                {trades.map((tr: Trade) => {
                  const isBuy = tr.type === "BUY";
                  const isWithdraw = tr.type === "WITHDRAW";
                  return (
                    <tr key={tr.id} className="hover:bg-slate-950/20 transition-all font-mono">
                      {/* Time / ID */}
                      <td className="py-4 px-5">
                        <p className="text-xs font-semibold text-slate-300 font-sans">{tr.time}</p>
                        <span className="text-[10px] text-slate-500 font-mono font-medium">{tr.id}</span>
                      </td>

                      {/* Asset Symbol */}
                      <td className="py-4 px-4 font-sans font-extrabold text-slate-200">
                        <div>
                          <span>{tr.symbol}</span>
                          {isWithdraw && tr.address && (
                            <p className="text-[9px] font-mono font-normal text-slate-500 mt-0.5 flex items-center gap-1">
                              <Wallet className="h-3 w-3 text-amber-500/80" />
                              <span className="text-slate-400">to {tr.address.slice(0, 6)}...{tr.address.slice(-4)}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Trade Type */}
                      <td className="py-4 px-4 text-center">
                        {isWithdraw ? (
                          <span className="inline-flex items-center gap-1 leading-none rounded-full px-2.5 py-1 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            <Wallet className="h-2.5 w-2.5" />
                            <span>METAMASK OUT</span>
                          </span>
                        ) : isBuy ? (
                          <span className="inline-flex items-center gap-1 leading-none rounded-full px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                            <ArrowUpRight className="h-2.5 w-2.5" />
                            <span>BUY / ENTRY</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 leading-none rounded-full px-2.5 py-1 text-[10px] font-bold bg-rose-500/10 text-rose-400">
                            <ArrowDownLeft className="h-2.5 w-2.5" />
                            <span>SELL / EXIT</span>
                          </span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-4 text-right text-slate-200 font-bold">
                        ${tr.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right text-slate-300">
                        {tr.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </td>

                      {/* Total Value */}
                      <td className="py-4 px-4 text-right text-slate-200 font-semibold">
                        ${tr.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Realized PNL */}
                      <td className="py-4 px-4 text-right">
                        {isWithdraw ? (
                          tr.txHash ? (
                            <a
                              href={`https://etherscan.io/tx/${tr.txHash}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors uppercase font-bold"
                            >
                              <span>TX HASH</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-slate-500 font-medium">—</span>
                          )
                        ) : tr.pnl !== undefined ? (
                          <span className={`font-bold ${tr.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {tr.pnl >= 0 ? "+" : ""}${tr.pnl.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-right font-sans">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>COMPLETED</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
