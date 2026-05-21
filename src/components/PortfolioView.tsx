import { useState } from "react";
import { 
  PieChart as ChartIcon, 
  Wallet, 
  ArrowRightLeft, 
  Coins, 
  ArrowUpRight 
} from "lucide-react";
import { CompleteState } from "../types";

interface PortfolioViewProps {
  state: CompleteState;
}

export default function PortfolioView({ state }: PortfolioViewProps) {
  const { assets, balance } = state;
  const cashUsdt = balance?.cashUsdt || 0;

  // Calculate stats
  const totalCryptoNAV = assets
    .filter(a => a.symbol !== "USDT")
    .reduce((sum, a) => sum + (a.amount * a.price), 0);
  const totalNAV = cashUsdt + totalCryptoNAV;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Valuation & Balance Breakout
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual division ratios representing active exchange assets, collateral pools, and idle spot cash.
          </p>
        </div>
      </header>

      {/* Grid: Pie Visualizer vs Asset list breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation list - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 font-mono uppercase tracking-wider">
            Collateral Assets Breakdown
          </h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-905 bg-slate-900/40 flex justify-between items-center select-none">
              <span className="text-xs font-bold text-slate-200">Asset List</span>
              <span className="text-[10px] text-slate-500 font-mono">100% Consolidated</span>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono">
              {assets.map((asset) => {
                const totalValue = asset.amount * asset.price;
                const ratio = ((totalValue / totalNAV) * 100).toFixed(1);
                const isUsdt = asset.symbol === "USDT";

                return (
                  <div key={asset.symbol} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-sans font-extrabold text-slate-100 uppercase text-xs">
                        {asset.symbol}
                      </div>
                      <div>
                        <p className="text-xs text-slate-200 font-bold font-mono">
                          {asset.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.symbol}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {isUsdt ? "Stable USDT Reserve" : `$${asset.price.toLocaleString()} unit pricing`}
                        </p>
                      </div>
                    </div>

                    {/* Progress Ratio Bar */}
                    <div className="flex-1 max-w-none sm:max-w-xs space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">Allocation Weight</span>
                        <span className="text-slate-300 font-extrabold">{ratio}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-501" 
                          style={{ width: `${ratio}%` }} 
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-200 font-extrabold text-left sm:text-right">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 font-sans mt-1">
                        Live valuation size
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart Allocation Circle ratio representation - Right Column */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-350 font-mono uppercase tracking-wider mb-2">
              Ratio Distribution
            </h3>

            {/* Custom Pie-style Donut stack list using standard beautiful visual tailwind gradients */}
            <div className="flex flex-col items-center justify-center py-5 space-y-6 select-none relative">
              <div className="h-44 w-44 rounded-full border-[10px] border-indigo-500/10 flex items-center justify-center relative">
                {/* Visual Circle center text */}
                <div className="text-center">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold">TOTAL NAV</span>
                  <span className="text-sm font-extrabold text-slate-100 font-mono block mt-1">
                    ${totalNAV.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">USDT EQUIV</span>
                </div>

                {/* Sub-halo visual arcs */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-slate-850" />
              </div>

              {/* Simplified Legend items */}
              <div className="w-full grid grid-cols-2 gap-2 text-[11px] font-mono">
                {assets.map((asset) => {
                  const val = asset.amount * asset.price;
                  const ratio = ((val / totalNAV) * 100).toFixed(0);
                  return (
                    <div key={asset.symbol} className="flex items-center gap-1.5 text-slate-400 font-medium whitespace-nowrap">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                      <span>{asset.symbol}: <b className="text-slate-200">{ratio}%</b></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-400 text-center font-medium font-sans">
            Total assets undergo mathematical spot rebalancing evaluations automatically every quarter timeline to shield core trading reserves.
          </div>
        </div>
      </div>
    </div>
  );
}
