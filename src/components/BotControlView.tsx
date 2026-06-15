import { useState, FormEvent, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Sliders, 
  Check, 
  ShieldAlert, 
  Coins,
  Users,
  Cpu,
  Zap,
  RotateCcw,
  Terminal,
  Activity
} from "lucide-react";
import { CompleteState } from "../types";

interface BotControlViewProps {
  state: CompleteState;
  onToggleBot: () => void;
  onConfigureBot: (updates: any) => Promise<void>;
  lang: "id" | "en";
}

export default function BotControlView({ state, onToggleBot, onConfigureBot, lang }: BotControlViewProps) {
  const { botConfig } = state;
  const [strategy, setStrategy] = useState(botConfig.strategy);
  const [symbol, setSymbol] = useState(botConfig.symbol);
  const [stopLoss, setStopLoss] = useState(botConfig.stopLoss.toString());
  const [takeProfit, setTakeProfit] = useState(botConfig.takeProfit.toString());
  const [trailingStop, setTrailingStop] = useState(botConfig.trailingStop.toString());
  const [capital, setCapital] = useState(botConfig.capital.toString());
  const [maxRam, setMaxRam] = useState((botConfig.maxRam || 512).toString());
  const [leverage, setLeverage] = useState((botConfig.leverage || 10).toString());
  const [slTpMode, setSlTpMode] = useState<"PRICE" | "ROE">(botConfig.slTpMode || "PRICE");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Testing simulation state
  const limitRam = parseInt(maxRam) || 512;
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedBots, setSimulatedBots] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Initialize simulated bots on boot or limit changes
  useEffect(() => {
    const list: any[] = [];
    for (let i = 1; i <= 24; i++) {
      const idNum = i < 10 ? `0${i}` : `${i}`;
      const initialRam = Math.floor(Math.random() * (limitRam * 0.4)) + Math.floor(limitRam * 0.15);
      list.push({
        id: `SG_DAEMON_${idNum}`,
        status: "ACTIVE",
        allocatedRam: initialRam,
        tradesCount: Math.floor(Math.random() * 5) + 1,
        pnl: parseFloat((Math.random() * 60 - 20).toFixed(2)),
        lastAction: `Thread initialized. Monitoring trade feeds for ${symbol}.`,
      });
    }
    setSimulatedBots(list);
    setLogs([
      `[${new Date().toLocaleTimeString()}] Concurrency Supervisor Sandbox idle. Ready to simulate 20+ daemon threads concurrently.`
    ]);
  }, [limitRam, symbol]);

  // Auto scroll console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Actively running simulation thread loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulatedBots((prevBots) => {
        const newBots = [...prevBots];
        const numToChange = Math.floor(Math.random() * 3) + 2; // change 2 to 4 bots
        const activeLogs: string[] = [];

        for (let k = 0; k < numToChange; k++) {
          const randIndex = Math.floor(Math.random() * newBots.length);
          const bot = { ...newBots[randIndex] };

          if (bot.status === "RESTARTING") {
            bot.status = "ACTIVE";
            bot.allocatedRam = Math.floor(limitRam * 0.15) + Math.floor(Math.random() * 60);
            bot.lastAction = `Position metrics restored. Active and trading on ${symbol}.`;
            activeLogs.push(`[${new Date().toLocaleTimeString()}] ✔️ [${bot.id}] Supervisor Autorestart Complete. Restored memory stack. Resuming trade operations.`);
          } else {
            const isSpike = Math.random() < 0.22;
            const ramDelta = isSpike 
              ? Math.floor(Math.random() * 110) + 50 
              : Math.floor(Math.random() * 30) - 12;

            const nextRam = Math.max(32, bot.allocatedRam + ramDelta);

            if (nextRam >= limitRam) {
              bot.status = "RESTARTING";
              bot.allocatedRam = limitRam;
              bot.lastAction = `RAM Limit breached (${nextRam}MB >= config limit ${limitRam}MB)`;
              activeLogs.push(`[${new Date().toLocaleTimeString()}] ⚠️ [${bot.id}] MEMORY LIMIT REACHED (${nextRam}MB > ${limitRam}MB). Vanguard daemon executing SIGTERM & recycling virtual heap...`);
            } else {
              bot.allocatedRam = nextRam;
              bot.status = nextRam > limitRam * 0.85 ? "RAM-LIMIT" : "ACTIVE";

              if (Math.random() < 0.35) {
                const isWin = Math.random() < 0.58;
                const tradeDelta = parseFloat(((isWin ? 1 : -1) * (Math.random() * 18 + 2)).toFixed(2));
                bot.tradesCount += 1;
                bot.pnl = parseFloat((bot.pnl + tradeDelta).toFixed(2));
                const actionText = tradeDelta > 0 ? "TAKE PROFIT (ROE %)" : "STOP LOSS (ROE %)";
                bot.lastAction = `Executed orders under strategy: ${actionText} ($${tradeDelta > 0 ? "+" : ""}${tradeDelta})`;
                activeLogs.push(`[${new Date().toLocaleTimeString()}] ⚡ [${bot.id}] Triggered automation: ${actionText}! Accrued profit: $${tradeDelta > 0 ? "+" : ""}${tradeDelta}`);
              } else {
                bot.lastAction = `${strategy} evaluation: Holding indexes. Current RAM: ${nextRam}MB.`;
              }
            }
          }

          newBots[randIndex] = bot;
        }

        if (activeLogs.length > 0) {
          setLogs(prev => [...prev.slice(-30), ...activeLogs]);
        }
        return newBots;
      });
    }, 1300);

    return () => clearInterval(interval);
  }, [isSimulating, limitRam, symbol, strategy]);

  const handleStartSim = () => {
    setIsSimulating(true);
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating dynamic Stress-Testing & Load simulation frameworks...`,
      `[${new Date().toLocaleTimeString()}] 📁 Spawning 24 sequential automated SG_DAEMON threads running concurrently.`,
      `[${new Date().toLocaleTimeString()}] 🔧 Restrict limit set to config: ${limitRam}MB Max RAM allocated per instance.`
    ]);
  };

  const handleStopSim = () => {
    setIsSimulating(false);
    setLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ⏹️ Concurrency testing stopped. Safely halted simulated active instances.`
    ]);
  };

  const handleResetSim = () => {
    const list: any[] = [];
    for (let i = 1; i <= 24; i++) {
      const idNum = i < 10 ? `0${i}` : `${i}`;
      const initialRam = Math.floor(Math.random() * (limitRam * 0.35)) + Math.floor(limitRam * 0.15);
      list.push({
        id: `SG_DAEMON_${idNum}`,
        status: "ACTIVE",
        allocatedRam: initialRam,
        tradesCount: 0,
        pnl: 0,
        lastAction: `Thread standby. Awaiting activation workload.`,
      });
    }
    setSimulatedBots(list);
    setLogs([
      `[${new Date().toLocaleTimeString()}] 🔁 Concurrency simulator stats & memory stacks wiped cleanly. Ready to restart.`
    ]);
  };

  const isElite = ["elite", "institutional", "hedge_fund_elite"].includes(state.subscription?.plan?.toLowerCase() || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    if (!isElite && parseInt(maxRam) > 1024) {
      alert(lang === "id" 
        ? "Paket Alpha Quant Premium membatasi RAM hingga maks 1024MB per bot. Silakan tingkatkan ke paket Hedge Fund Elite untuk kapasitas RAM hingga 4096MB!" 
        : "Alpha Quant Premium plan limits RAM to maximum 1024MB per bot. Please upgrade to Hedge Fund Elite plan for up to 4096MB allocation!"
      );
      setIsSaving(false);
      return;
    }

    try {
      await onConfigureBot({
        strategy,
        symbol,
        stopLoss,
        takeProfit,
        trailingStop,
        capital,
        maxRam,
        leverage,
        slTpMode
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
    { 
      name: "EMA_CROSS + RSI", 
      desc: lang === "id" ? "Meluncurkan posisi beli ketika persilangan EMA jangka pendek memicu batas dukungan dengan metrik RSI kurang dari 40." : "Launches buy positions when the short-term EMA cross triggers over major supports coupled with an RSI metric below 40." 
    },
    { 
      name: "MACD DIVERGENCE SCALPER", 
      desc: lang === "id" ? "Melakukan scalping dengan mengevaluasi tumpang tindih divergensi MACD pada candle 5M pendek." : "Scalps localized trends by evaluating MACD divergence overlays on shorter 5M candles." 
    },
    { 
      name: "SURE-STRIKE BREAKOUT", 
      desc: lang === "id" ? "Teridentifikasi konsolidasi dan menempatkan pemicu penembusan rentang batas dengan stop-loss mengikuti." : "Identifies consolidations and places boundary breakout triggers with immediate trailing stop-losses." 
    },
    { 
      name: "QUANTUM AI CHOP-REVERSION", 
      requiresElite: true,
      desc: lang === "id" ? "Indikator tingkat lanjut bertenaga analisis saraf quant (Khusus paket Hedge Fund Elite)." : "Advanced neural quant analysis indicator (Exclusive to Hedge Fund Elite plan)." 
    },
    { 
      name: "INSTITUTIONAL LIQUIDITY SWEEP", 
      requiresElite: true,
      desc: lang === "id" ? "Mendeteksi area likuiditas institusi besar & order-books imbalance (Khusus paket Hedge Fund Elite)." : "Stalks massive corporate/institutional order book imbalances and pools (Exclusive to Hedge Fund Elite plan)." 
    }
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {lang === "id" ? "Konsol Algoritma Auto-Trading" : "Auto-Trading Algorithm Console"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "id" ? "Atur batasan risiko dan indikator untuk sistem Vyora otomatis Anda." : "Design risk management thresholds and choose indicators guiding your automated Vyora system."}
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
              <span>{lang === "id" ? "HENTIKAN PROSES BOT" : "TERMINATE BOT PROCESS"}</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>{lang === "id" ? "MULAI JALAN ALGORITMA" : "INITIATE ALGORITHM RUN"}</span>
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
            <span>{lang === "id" ? "Kontrol Risiko" : "Risk Dial Controls"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Asset Pair */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                {lang === "id" ? "Aset Trading Target" : "Target Trading Asset"}
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
                {lang === "id" ? "Maks Modal Per Perdagangan (USDT)" : "Max Capital Per Trade (USDT)"}
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

            {/* Leverage Multiplier select */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                {lang === "id" ? "Pengali Leverage (Futures)" : "Leverage Multiplier (Futures)"}
              </label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="1">{lang === "id" ? "1x (Tanpa Leverage)" : "1x (No Leverage - Spot equivalent)"}</option>
                <option value="3">{lang === "id" ? "3x Leverage" : "3x Leverage"}</option>
                <option value="5">{lang === "id" ? "5x Leverage" : "5x Leverage"}</option>
                <option value="10">{lang === "id" ? "10x Leverage" : "10x Leverage"}</option>
                <option value="20">{lang === "id" ? "20x Leverage" : "20x Leverage"}</option>
                <option value="50">{lang === "id" ? "50x Leverage" : "50x Leverage"}</option>
              </select>
            </div>

            {/* SL/TP Mode Basis selector */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                {lang === "id" ? "Basis Perhitungan SL/TP" : "SL/TP Calculation Basis"}
              </label>
              <select
                value={slTpMode}
                onChange={(e) => setSlTpMode(e.target.value as "PRICE" | "ROE")}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="PRICE">{lang === "id" ? "Pergerakan Harga Aset %" : "Asset Price Movement % (Spot-Style)"}</option>
                <option value="ROE">{lang === "id" ? "Pengembalian Leverage ROE %" : "Leveraged Return ROE % (Futures-Style)"}</option>
              </select>
            </div>

            {/* Stop Loss % */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                {slTpMode === "ROE" 
                  ? (lang === "id" ? "Batas Stop Loss Target (ROE %)" : "Target Stop Loss (ROE %)") 
                  : (lang === "id" ? "Ambang Batas Stop Loss (%)" : "Hard Stop Loss Threshold (%)")}
              </label>
              <input
                type="number"
                step="0.1"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder={slTpMode === "ROE" ? "25.0" : "2.0"}
                min="0.1"
              />
            </div>

            {/* Take Profit % */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                {slTpMode === "ROE" 
                  ? (lang === "id" ? "Batas Take Profit Target (ROE %)" : "Target Take Profit (ROE %)") 
                  : (lang === "id" ? "Tingkat Target Take Profit (%)" : "Target Take Profit Level (%)")}
              </label>
              <input
                type="number"
                step="0.1"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder={slTpMode === "ROE" ? "50.0" : "5.0"}
                min="0.1"
              />
            </div>

            {/* Leverage-Adjusted Explanation Audit Box */}
            <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 font-sans space-y-1.5 my-1">
              <div className="font-bold uppercase tracking-wider text-emerald-400 font-mono text-[10px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>🛡️ FUTURES RISK PARAMETER AUDIT</span>
              </div>
              {slTpMode === "ROE" ? (
                <p className="leading-relaxed">
                  In <b className="text-emerald-400">Leveraged ROE (%)</b> mode, your stop-loss of <b className="text-slate-100">{stopLoss}%</b> (ROE) triggers when the underlying asset price changes by <b className="text-emerald-400">{((parseFloat(stopLoss) || 0) / (parseFloat(leverage) || 1)).toFixed(2)}%</b>. 
                  Your take-profit of <b className="text-slate-100">{takeProfit}%</b> (ROE) triggers when the asset price moves by <b className="text-emerald-400">{((parseFloat(takeProfit) || 0) / (parseFloat(leverage) || 1)).toFixed(2)}%</b>.
                </p>
              ) : (
                <p className="leading-relaxed">
                  In <b className="text-emerald-400">Asset Price Movement (%)</b> mode, your stop-loss triggers when the underlying asset price drops by <b className="text-slate-100">{stopLoss}%</b>. 
                  At <b className="text-emerald-400">{leverage}x</b> leverage, this corresponds to an investment-relative margin profit or loss (ROE) of <b className="text-emerald-400">{((parseFloat(stopLoss) || 0) * (parseFloat(leverage) || 1)).toFixed(2)}%</b>.
                  Take-profit triggers at a <b className="text-slate-100">{takeProfit}%</b> price change, yielding <b className="text-emerald-400">{((parseFloat(takeProfit) || 0) * (parseFloat(leverage) || 1)).toFixed(2)}% ROE</b>.
                </p>
              )}
              <p className="text-[10px] text-slate-500 font-medium select-none border-t border-slate-800/60 pt-1.5">
                ⚠️ Futures positions differ fundamentally from spot: standard Spot parameters will shut down or liquidate your leverage positions immediately. Keep your ROE SL proportional to your leverage multiplier!
              </p>
            </div>

            {/* Trailing Stop % Gap */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                {lang === "id" ? "Interval Aktivasi Trailing Stop (%)" : "Trailing Stop Activation Interval (%)"}
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
                {lang === "id" 
                  ? "Secara otomatis menyesuaikan batas atas penjualan jika token melonjak sesuai ambang batas yang ditentukan, melindungi profit." 
                  : "Automatically adjusts the dynamic sell ceiling higher if the token surges by the set threshold interval, protecting realized profits."}
              </p>
            </div>

            {/* Bot Manager Resource Limits */}
            <div className="md:col-span-2 border-t border-slate-800/80 pt-4 mt-2">
              <h3 className="text-xs font-mono uppercase font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                <span>⚙️ Bot Manager Resource Allocations</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold flex items-center justify-between">
                    <span>Maximum RAM Allocation limit per bot process (MB)</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${isElite ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                      {isElite ? "ELITE METRIC: MAX 4096MB" : "PREMIUM LIMIT: MAX 1024MB"}
                    </span>
                  </label>
                  <input
                    type="number"
                    value={maxRam}
                    onChange={(e) => setMaxRam(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="512"
                    min="64"
                    max={isElite ? "4096" : "1024"}
                  />
                  <p className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed font-sans">
                    {isElite 
                      ? (lang === "id" 
                          ? "Batas alokasi memori VPS Anda. Sebagai pengguna HEDGE FUND ELITE, batas alokasi optimal didukung hingga 4096MB secara real-time."
                          : "Your VPS memory allocation limit. As a HEDGE FUND ELITE user, optimal allocations up to 4096MB are supported in real-time.")
                      : (lang === "id"
                          ? "Membatasi alokasi memori VPS. Lisensi Premium membatasi RAM hingga 1024MB. Tingkatkan ke Elite untuk alokasi ultra-cepat hingga 4096MB."
                          : "Restricts VPS heap allocation. Premium license limits RAM up to 1024MB. Upgrade to Elite for lightning-fast allocations up to 4096MB.")
                    }
                  </p>
                </div>
                
                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1.5 font-semibold">
                    Supervisor Autorestart Strategy
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-705 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 focus:outline-none focus:border-emerald-500"
                    disabled
                  >
                    <option value="always">Always Restart on Memory-Limit-Reached</option>
                  </select>
                  <p className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed font-sans">
                    Vanguard supervisor daemon instantly restarts the bot process. Position caches are synchronized automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50 mt-4">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-4 w-4" /> {lang === "id" ? "Konfig Terkunci!" : "Config Locked Successfully!"}
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer select-none text-xs tracking-wider uppercase flex items-center gap-1 transition"
            >
              {isSaving ? (lang === "id" ? "MENGUNCI..." : "LOCKING...") : (lang === "id" ? "Kunci Konfig & Terapkan" : "Lock Config & Adjust Parameters")}
            </button>
          </div>
        </form>

        {/* Dynamic strategies information column */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 h-full space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2 border-b border-slate-800 pb-3">
            <Coins className="h-4.5 w-4.5 text-emerald-400" />
            <span>{lang === "id" ? "Indikator Aktif" : "Active Indicators"}</span>
          </div>

          <div className="space-y-4">
            {strategiesList.map((strat) => {
              const isActive = strategy === strat.name;
              const isLocked = strat.requiresElite && !isElite;
              return (
                <div
                  key={strat.name}
                  onClick={() => {
                    if (isLocked) {
                      alert(lang === "id" 
                        ? `Strategi "${strat.name}" memerlukan paket HEDGE FUND ELITE. Silakan tingkatkan lisensi Anda di menu Paket Berlangganan.` 
                        : `The "${strat.name}" strategy is exclusive to the HEDGE FUND ELITE plan. Please upgrade your license in the Subscription Plans tab.`
                      );
                      return;
                    }
                    setStrategy(strat.name);
                  }}
                  className={`p-4 rounded-xl border transition relative ${
                    isLocked 
                      ? "bg-slate-950/10 border-slate-900 opacity-60 hover:opacity-80 cursor-not-allowed" 
                      : isActive
                        ? "bg-slate-950/70 border-emerald-500/50 cursor-pointer"
                        : "bg-slate-950/20 border-slate-800 hover:border-slate-700 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                      {strat.name}
                      {isLocked && <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1 rounded font-sans">LOCK 🔒</span>}
                    </h4>
                    {isActive && !isLocked && (
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
              <b>{lang === "id" ? "Peringatan audit:" : "Audit warning:"}</b> {lang === "id" ? "Pastikan Anda memiliki jaminan USDT yang memadai di dompet bursa Anda sebelum menjalankan. Semua parameter dieksekusi secara instan dalam jadwal pasar yang aktif." : "Ensure you hold appropriate USDT collateral within your exchange wallets before running. All parameters are executed instantly inside active market timelines."}
            </div>
          </div>
        </div>
      </div>

      {/* Concurrency Load Simulator and Stress Testing Section */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5 text-slate-100 font-bold text-base">
              <Users className="h-5 w-5 text-emerald-400" />
              <span>⚡ Concurrent Daemon Stress-Testing Sandbox</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-full font-mono">
                20+ Active Workers Simulate
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test localized high-concurrency loads in real time to witness Vanguard memory-supervisor garbage collection and cache-restored thread reboot dynamics.
            </p>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-2">
            {isSimulating ? (
              <button
                type="button"
                onClick={handleStopSim}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-slate-100 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition select-none border border-transparent"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>HALT STRESS TEST</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartSim}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition select-none border border-transparent"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>SPAWN 24 CONCURRENT DAEMONS</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetSim}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition select-none"
              title="Reset Sandbox Stats"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>RE-WIPE</span>
            </button>
          </div>
        </header>

        {/* Live Aggregated stress indexes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">
              Active Threads Multiplier
            </span>
            <div className="text-lg font-mono font-bold text-slate-200">
              {simulatedBots.filter(b => b.status !== "STANDBY" && b.status !== "RESTARTING").length} / 24 <span className="text-xs text-slate-500">Virtual Devs</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5 align-middle">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${(simulatedBots.filter(b => b.status !== "STANDBY" && b.status !== "RESTARTING").length / 24) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">
              Aggregated Heap allocation
            </span>
            <div className="text-lg font-mono font-bold text-slate-200">
              {simulatedBots.reduce((sum, b) => sum + b.allocatedRam, 0).toLocaleString()} <span className="text-xs text-slate-400 font-sans">MB</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              Virtual pool footprint
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">
              Total virtual positions
            </span>
            <div className="text-lg font-mono font-bold text-slate-200">
              {simulatedBots.reduce((sum, b) => sum + b.tradesCount, 0)} <span className="text-xs text-slate-400 font-sans font-normal">orders</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium font-sans">
              Cumulative bot operations
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">
              Simulated aggregate PNL
            </span>
            <div className={`text-lg font-mono font-bold ${
              simulatedBots.reduce((sum, b) => sum + b.pnl, 0) >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {simulatedBots.reduce((sum, b) => sum + b.pnl, 0) >= 0 ? "+" : ""}${simulatedBots.reduce((sum, b) => sum + b.pnl, 0).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium font-sans">
              Hypothetical return indexes
            </p>
          </div>
        </div>

        {/* Console outputs and interactive processes visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Processes visualizer grid */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>THREADING MULTIPLEX VISUALIZER</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {isSimulating ? "● SCANNING LIVE ALLOCATIONS" : "○ SANDBOX IDLE"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {simulatedBots.map((bot) => {
                const isWarning = bot.status === "RAM-LIMIT";
                const isRestarting = bot.status === "RESTARTING";
                const ramPercent = Math.min((bot.allocatedRam / limitRam) * 100, 100);

                return (
                  <div 
                    key={bot.id} 
                    className={`p-3 rounded-xl bg-slate-950 border relative transition-all duration-300 ${
                      isRestarting 
                        ? "border-red-500/40 bg-red-950/5" 
                        : isWarning 
                        ? "border-amber-500/30 hover:border-amber-500/50 bg-amber-950/5" 
                        : "border-slate-800 hover:border-slate-705"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-300 tracking-tight">
                        {bot.id.replace("SG_DAEMON_", "TS-")}
                      </span>
                      {isRestarting ? (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase animate-pulse">
                          REBOOT
                        </span>
                      ) : isWarning ? (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold uppercase">
                          RAM LIMIT
                        </span>
                      ) : (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* RAM gauge bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 font-semibold">
                        <span>Allocated:</span>
                        <span className={isWarning ? "text-amber-400 font-bold" : "text-slate-300"}>
                          {bot.allocatedRam}MB / {limitRam}MB
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isRestarting ? "bg-red-500" : isWarning ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                          }`}
                          style={{ width: `${ramPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Miniature trading tracker */}
                    <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>Trades: <b>{bot.tradesCount}</b></span>
                      <span className={bot.pnl >= 0 ? "text-emerald-400" : "text-rose-455"}>
                        {bot.pnl >= 0 ? "+" : ""}${bot.pnl.toFixed(1)}
                      </span>
                    </div>

                    {/* Hover text / bottom description */}
                    <div className="text-[8px] text-slate-500 font-medium truncate mt-1 leading-normal select-none pointer-events-none" title={bot.lastAction}>
                      {bot.lastAction}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supervisor Live Console Log Streamer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>SUPERVISOR TELEMETRY FEED</span>
              </span>
              {isSimulating && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[10px] text-slate-300 h-[380px] overflow-y-auto space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                {logs.map((log, idx) => {
                  let logColorClass = "text-slate-400";
                  if (log.includes("⚠️")) logColorClass = "text-amber-300 font-semibold";
                  if (log.includes("✔️")) logColorClass = "text-emerald-400 font-semibold";
                  if (log.includes("⚡")) logColorClass = "text-cyan-300";
                  if (log.includes("🚀") || log.includes("📂")) logColorClass = "text-emerald-300";
                  if (log.includes("⏹️") || log.includes("🔁")) logColorClass = "text-slate-200";

                  return (
                    <div key={idx} className={`${logColorClass} leading-relaxed break-words`}>
                      {log}
                    </div>
                  );
                })}
                <div ref={consoleEndRef} />
              </div>
              
              <div className="border-t border-slate-900 pt-3 text-[9px] text-slate-500 select-none flex items-center gap-1 mt-auto font-sans leading-relaxed">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span>Stress telemetry feed represents synchronous Singapore-VPS thread state operations.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
