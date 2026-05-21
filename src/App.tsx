import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as motionReact from "motion/react";
const motion = motionReact.motion;

import { 
  LayoutDashboard, 
  LineChart, 
  Bot, 
  History, 
  MessageSquare, 
  PieChart, 
  CreditCard, 
  Settings, 
  Menu, 
  X, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";

import { CompleteState } from "./types";
import DashboardView from "./components/DashboardView";
import ScreenerView from "./components/ScreenerView";
import BotControlView from "./components/BotControlView";
import TradesView from "./components/TradesView";
import ChatroomView from "./components/ChatroomView";
import PortfolioView from "./components/PortfolioView";
import BillingView from "./components/BillingView";
import SettingsView from "./components/SettingsView";

const DEFAULT_STATE: CompleteState = {
  signals: {
    BTCUSDT: { symbol: "BTCUSDT", price: 92450.00, change24h: 3.42, rsi: 44.5, macd: 12.8, trend: "BULLISH", verdict: "BUY", confidence: "HIGH", aiAnalysis: "" },
    ETHUSDT: { symbol: "ETHUSDT", price: 3125.50, change24h: -1.15, rsi: 38.2, macd: -4.5, trend: "BEARISH", verdict: "HOLD", confidence: "MEDIUM", aiAnalysis: "" },
    SOLUSDT: { symbol: "SOLUSDT", price: 242.80, change24h: 8.75, rsi: 68.9, macd: 3.4, trend: "BULLISH", verdict: "BUY", confidence: "HIGH", aiAnalysis: "" },
    BNBUSDT: { symbol: "BNBUSDT", price: 618.40, change24h: 0.25, rsi: 52.1, macd: 0.8, trend: "NEUTRAL", verdict: "HOLD", confidence: "LOW", aiAnalysis: "" }
  },
  botConfig: { isActive: false, strategy: "EMA_CROSS + RSI", symbol: "SOLUSDT", stopLoss: 2.5, takeProfit: 5.0, trailingStop: 0.5, capital: 1500, leverage: 10 },
  trades: [],
  assets: [
    { symbol: "USDT", amount: 12450.75, price: 1.0, change24h: 0.0 },
    { symbol: "BTC", amount: 0.15, price: 92450.0, change24h: 3.42 },
    { symbol: "ETH", amount: 2.22, price: 3125.5, change24h: -1.15 },
    { symbol: "SOL", amount: 15.54, price: 242.8, change24h: 8.75 },
  ],
  subscription: { plan: "free", isActive: true },
  settings: { binanceApiKey: "", binanceSecret: "", telegramBotId: "", telegramChatId: "", groqApiKey: "" },
  balance: { cashUsdt: 12450.75 },
  activePositions: []
};

export default function App() {
  const [state, setState] = useState<CompleteState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const fetchState = async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.warn("Express server polling standby; utilizing technical pricing simulation states.", err);
    }
  };

  // Poll state every 2.5s for real-time tickers and continuous simulated active positions updates
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBot = async () => {
    try {
      const res = await fetch("/api/bot/toggle", { method: "POST" });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
      // Fallback state toggle when running in isolated preview environments
      setState(prev => ({
        ...prev,
        botConfig: {
          ...prev.botConfig,
          isActive: !prev.botConfig.isActive
        }
      }));
    }
  };

  const handleConfigureBot = async (updates: any) => {
    try {
      const res = await fetch("/api/bot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (updates: any) => {
    try {
      const res = await fetch("/api/bot/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradePlan = async (plan: string) => {
    try {
      const res = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "screener", label: "Quantum Screener", icon: LineChart },
    { id: "bot", label: "Bot Controls", icon: Bot },
    { id: "trades", label: "Ledger history", icon: History },
    { id: "chat", label: "Advisor chat", icon: MessageSquare },
    { id: "portfolio", label: "Portfolio breakout", icon: PieChart },
    { id: "billing", label: "Subscription Plans", icon: CreditCard },
    { id: "settings", label: "Secret Vault", icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView state={state} onToggleBot={handleToggleBot} onSetActiveTab={setActiveTab} />;
      case "screener":
        return <ScreenerView state={state} />;
      case "bot":
        return <BotControlView state={state} onToggleBot={handleToggleBot} onConfigureBot={handleConfigureBot} />;
      case "trades":
        return <TradesView state={state} />;
      case "chat":
        return <ChatroomView state={state} />;
      case "portfolio":
        return <PortfolioView state={state} />;
      case "billing":
        return <BillingView state={state} onUpgradePlan={handleUpgradePlan} />;
      case "settings":
        return <SettingsView state={state} onSaveSettings={handleSaveSettings} />;
      default:
        return <DashboardView state={state} onToggleBot={handleToggleBot} onSetActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans leading-relaxed tracking-normal antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. Mobile Top Bar Header Navigation */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-805 border-slate-800 z-40 px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <span className="text-emerald-400 font-extrabold text-lg flex items-center gap-1 font-mono">
            VYORA <Sparkles className="h-4.5 w-4.5 fill-current text-emerald-400" />
          </span>
          <span className="text-[10px] font-mono leading-none bg-emerald-500/10 text-emerald-400 py-1 px-2 rounded-full font-bold">
            v3.5 PRIME
          </span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-800 rounded-lg cursor-pointer"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* 2. Responsive Primary Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-850 flex flex-col justify-between transform transition-transform duration-300 select-none
        lg:static lg:transform-none lg:w-64 max-w-[260px] shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col flex-1">
          {/* Header Branding */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-900/60 font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-extrabold text-xl tracking-tight flex items-center gap-1 font-mono">
                VYORA <Sparkles className="h-5 w-5 fill-current text-emerald-400 animate-pulse" />
              </span>
              <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 py-0.5 px-1.5 rounded-full font-bold">
                PRO-SYSTEM
              </span>
            </div>
            {/* Close Sidebar button only on Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer select-none text-left ${
                    isActive 
                      ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/5 hover:bg-emerald-500" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-950/40"
                  }`}
                >
                  <IconComponent className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-slate-950 font-bold" : "text-slate-450"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 font-mono text-[10px] text-slate-500 space-y-1.5 select-none">
          <div className="flex items-center justify-between">
            <span className="font-sans font-medium">Auto-Sync status:</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans font-medium">Licensed Plan:</span>
            <span className="text-slate-300 font-extrabold uppercase">{state.subscription.plan} BLOCK</span>
          </div>
        </div>
      </aside>

      {/* 3. Main Display Screen Content Panel */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pt-16 lg:pt-0 bg-slate-950 relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="h-full max-w-7xl mx-auto"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}
