import { useState, FormEvent } from "react";
import { 
  Play, 
  Square, 
  Sliders, 
  Check, 
  ShieldAlert, 
  Coins 
} from "lucide-react";
import { CompleteState } from "../types";

interface BotControlViewProps {
  state: CompleteState;
  onToggleBot: () => void;
  onConfigureBot: (updates: any) => Promise<void>;
}

export default function BotControlView({ state, onToggleBot, onConfigureBot }: BotControlViewProps) {
  const { botConfig } = state;
  const [strategy, setStrategy] = useState(botConfig.strategy);
  const [symbol, setSymbol] = useState(botConfig.symbol);
  const [stopLoss, setStopLoss] = useState(botConfig.stopLoss.toString());
  const [takeProfit, setTakeProfit] = useState(botConfig.takeProfit.toString());
  const [trailingStop, setTrailingStop] = useState(botConfig.trailingStop.toString());
  const [capital, setCapital] = useState(botConfig.capital.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onConfigureBot({
        strategy,
        symbol,
        stopLoss,
        takeProfit,
        trailingStop,
        capital
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const strategiesList = [
    { name: "EMA_CROSS + RSI", desc: "Launches buy positions when the short-term EMA cross triggers over major supports coupled with an RSI metric below 40." },
    { name: "MACD DIVERGENCE SCALPER", desc: "Scalps localized trends by evaluating MACD divergence overlays on shorter 5M candles." },
    { name: "SURE-STRIKE BREAKOUT", desc: "Identifies consolidations and places boundary breakout triggers with immediate trailing stop-losses." }
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Auto-Trading Algorithm Console
          </h2>
          <p className="text-xs text-slate-400">
            Design risk management thresholds and choose indicators guiding your automated Vyora system.
          </p>
        </div>

        {/* Master Control Button */}
        <button
          onClick={onToggleBot}
          className={`px-5 py-2.5 rounded-xl font-bold font-mono text-sm cursor-pointer select-none transition flex items-center gap-2 ${
            botConfig.isActive
              ? "bg-rose-500 hover:bg-rose-600 text-slate-100 border border-rose-500/10"
              : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
          }`}
        >
          {botConfig.isActive ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              <span>TERMINATE BOT PROCESS</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>INITIATE ALGORITHM RUN</span>
            </>
          )}
        </button>
      </header>

      {/* Settings Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core parameters Adjustment Panel */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4.5 w-4.5 text-emerald-400" />
            <span>Risk Dial Controls</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Asset Pair */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                Target Trading Asset
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="BTCUSDT">BTCUSDT (Bitcoin)</option>
                <option value="ETHUSDT">ETHUSDT (Ethereum)</option>
                <option value="SOLUSDT">SOLUSDT (Solana)</option>
                <option value="BNBUSDT">BNBUSDT (Binance Coin)</option>
              </select>
            </div>

            {/* Trading Capital */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                Max Capital Per Trade (USDT)
              </label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="2500"
                min="10"
              />
            </div>

            {/* Stop Loss % */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                Hard Stop Loss Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="2.0"
                min="0.1"
              />
            </div>

            {/* Take Profit % */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                Target Take Profit Level (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="5.0"
                min="0.1"
              />
            </div>

            {/* Trailing Stop % Gap */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                Trailing Stop Activation Interval (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={trailingStop}
                onChange={(e) => setTrailingStop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="0.5"
                min="0.01"
              />
              <p className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed font-sans">
                Automatically adjusts the dynamic sell ceiling higher if the token surges by the set threshold interval, protecting realized profits.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50 mt-4">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-4 w-4" /> Config Locked Successfully!
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer select-none text-xs tracking-wider uppercase flex items-center gap-1 transition"
            >
              {isSaving ? "LOCKING..." : "Lock Config & Adjust Parameters"}
            </button>
          </div>
        </form>

        {/* Dynamic strategies information column */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 h-full space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2 border-b border-slate-800 pb-3">
            <Coins className="h-4.5 w-4.5 text-emerald-400" />
            <span>Active Indicators</span>
          </div>

          <div className="space-y-4">
            {strategiesList.map((strat) => {
              const isActive = strategy === strat.name;
              return (
                <div
                  key={strat.name}
                  onClick={() => setStrategy(strat.name)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isActive
                      ? "bg-slate-950/70 border-emerald-500/50"
                      : "bg-slate-950/20 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-200 font-mono">
                      {strat.name}
                    </h4>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {strat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[11px] text-orange-350 leading-relaxed font-sans flex gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-450 shrink-0" />
            <div>
              <b>Audit warning:</b> Ensure you hold appropriate USDT collateral within your exchange wallets before running. All parameters are executed instantly inside active market timelines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
