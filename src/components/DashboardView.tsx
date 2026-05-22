import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Square, 
  AlertCircle, 
  ArrowUpRight, 
  Activity, 
  Wallet, 
  Clock, 
  ShieldCheck 
} from "lucide-react";
import { CompleteState } from "../types";

interface DashboardViewProps {
  state: CompleteState;
  onToggleBot: () => void;
  onSetActiveTab: (tab: string) => void;
}

export default function DashboardView({ state, onToggleBot, onSetActiveTab }: DashboardViewProps) {
  const { signals, botConfig, assets, activePositions, balance, trades } = state;

  // Calculate Net Asset Value (NAV) dynamically
  const cashVal = balance?.cashUsdt || 0;
  const cryptoVal = assets
    .filter(a => a.symbol !== "USDT")
    .reduce((sum, a) => sum + (a.amount * a.price), 0);
  const totalNAV = cashVal + cryptoVal;

  const closedTrades = trades.filter(t => t.pnl !== undefined);
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Real-time feed header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            AI Quant Terminal Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time quantum signals, bot activity bounds, and decentralized collateral indexes instantly.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono font-bold select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>FEED: {state.dataSource || "LIVE BINANCE API"}</span>
        </div>
      </div>

      {/* Ticker Tape Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(signals).slice(0, 4).map((coin: any) => {
          const isProfit = coin.change24h >= 0;
          return (
            <div 
              key={coin.symbol} 
              className="p-4 rounded-xl bg-slate-905 bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all font-mono"
            >
              <div className="flex items-center justify-between text-xs mb-1 select-none">
                <span className="font-sans font-bold text-slate-300">{coin.symbol}</span>
                <span className={`text-[10px] font-bold ${isProfit ? "text-emerald-400 font-extrabold" : "text-rose-450"}`}>
                  {isProfit ? "+" : ""}{coin.change24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-100 mt-1">
                ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Core Overview Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Net Asset Value */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              Net Capital Valuation (NAV)
            </span>
            <Wallet className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
            ${totalNAV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Cash USDT collateral: <b className="text-slate-200">${cashVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b>
          </p>
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-2xl" />
        </div>

        {/* Metric 2: Smart Bot Config Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              Vyora Engine
            </span>
            <Activity className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2.5">
            <span className={`w-3 h-3 rounded-full ${botConfig.isActive ? "bg-emerald-400 animate-pulse shadow-md shadow-emerald-400" : "bg-slate-700"}`} />
            <h3 className="text-xl font-bold text-slate-100 uppercase font-mono">
              {botConfig.isActive ? "ACTIVE" : "STANDBY"}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Risk strategy: <b className="text-slate-200">{botConfig.strategy}</b>
          </p>
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-2xl" />
        </div>

        {/* Metric 3: Total Realized PnL */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              Total Realized PnL
            </span>
            <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <h3 className={`text-xl font-bold font-mono tracking-tight ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            From <b className="text-slate-200">{closedTrades.length}</b> completed trades
          </p>
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-2xl" />
        </div>

        {/* Metric 4: Win Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              Strategy Win Rate
            </span>
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
            {winRate.toFixed(1)}%
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            <b className="text-emerald-400">{winningTrades}</b> Winning / <b className="text-rose-400">{closedTrades.length - winningTrades}</b> Losing
          </p>
          <div className="absolute top-0 right-0 h-16 w-16 bg-violet-500/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Bot master fast toggle switch & warnings */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-200">Vyora Bot Risk Engine Status</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans max-w-xl">
              When enabled, our high-frequency quantum framework utilizes in-memory API cycles to simulate or execute orders under live intervals. Double-check margin bounds.
            </p>
          </div>
        </div>
        <button
          onClick={onToggleBot}
          className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs tracking-wider uppercase shrink-0 transition cursor-pointer select-none flex items-center gap-2 ${
            botConfig.isActive
              ? "bg-rose-500 hover:bg-rose-650 hover:bg-rose-600 text-slate-100"
              : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
          }`}
        >
          {botConfig.isActive ? (
            <>
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>TERMINATE ACTIVE PROCESS</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>ACTIVATE AUTO RUNNERS</span>
            </>
          )}
        </button>
      </div>

      {/* Active Trades & Positions Grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center select-none">
            <h3 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              REAL-TIME MARGIN POSITIONS
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-medium">Auto-refreshing live tickers</span>
          </div>

          <div className="overflow-x-auto">
            {activePositions.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <Clock className="mx-auto h-8 w-8 text-slate-750 mb-3" />
                <p className="text-xs font-medium text-slate-400">No active positions open in market corridors.</p>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Lock parameters inside Bot Risk tab and trigger Initiate Run to start automatic market sweeps.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse font-mono text-slate-300">
                <thead className="bg-slate-950/45 text-slate-500 font-semibold font-mono uppercase tracking-wider border-b border-slate-800 select-none">
                  <tr>
                    <th className="py-3 px-5">Target symbol</th>
                    <th className="py-3 px-4 text-center">Direction</th>
                    <th className="py-3 px-4 text-right">Size Amount</th>
                    <th className="py-3 px-4 text-right">Entry Price</th>
                    <th className="py-3 px-4 text-right">Current Price</th>
                    <th className="py-3 px-4 text-right">Allocated Margin</th>
                    <th className="py-3 px-4 text-right">Accumulated profit (PNL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-350">
                  {activePositions.map((p: any) => {
                    const isProfit = p.pnl >= 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-950/20 transition-all">
                        {/* Target Symbol */}
                        <td className="py-4 px-5 font-sans font-extrabold text-slate-105 text-slate-200">
                          {p.symbol}
                        </td>

                        {/* Direction */}
                        <td className="py-4 px-4 text-center">
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-sans rounded-full px-2.5 py-0.5">
                            {p.type} {p.leverage}X
                          </span>
                        </td>

                        {/* Size Amount */}
                        <td className="py-4 px-4 text-right text-slate-300">
                          {p.amount.toFixed(4)} Units
                        </td>

                        {/* Entry Price */}
                        <td className="py-4 px-4 text-right font-medium text-slate-400">
                          ${p.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Current Price */}
                        <td className="py-4 px-4 text-right font-bold text-slate-200">
                          ${p.currPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Margin */}
                        <td className="py-4 px-4 text-right text-slate-300">
                          ${p.margin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Accumulated PnL */}
                        <td className="py-4 px-4 text-right">
                          <div className={`font-bold flex items-center justify-end gap-1 ${isProfit ? "text-emerald-400 font-extrabold" : "text-rose-400"}`}>
                            {isProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            <span>
                              {isProfit ? "+" : ""}${p.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({isProfit ? "+" : ""}{p.pnlPercent}%)
                            </span>
                          </div>
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
    </div>
  );
}
