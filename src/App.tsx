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
  LogOut,
  Lock
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
import LoginView from "./components/LoginView";
import LandingPage from "./components/LandingPage";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, limit, doc, where, updateDoc } from "firebase/firestore";

const DEFAULT_STATE: CompleteState = {
  signals: {},
  botConfig: { isActive: false, strategy: "", symbol: "", stopLoss: 0, takeProfit: 0, trailingStop: 0, capital: 0, leverage: 1, maxRam: 0, slTpMode: "PRICE" },
  trades: [],
  assets: [],
  subscription: { plan: "trial", isActive: false },
  settings: { binanceApiKey: "", binanceSecret: "", telegramBotId: "", telegramChatId: "", groqApiKey: "" },
  balance: { cashUsdt: 0 },
  activePositions: []
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [state, setState] = useState<CompleteState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    let unsubUserDoc: (() => void) | undefined;
    let unsubTrades: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthChecking(false);

      if (user) {
        setShowLoginScreen(false);
        // Listen to user document
        const userRef = doc(db, "users", user.uid);
        unsubUserDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setState(prev => ({
              ...prev,
              balance: { cashUsdt: data.totalUsdt || 0 },
              subscription: { plan: data.plan || "trial", isActive: true },
              botConfig: {
                ...prev.botConfig,
                isActive: data.botStatus === "RUNNING",
                strategy: data.strategy || "EMA_CROSS + RSI",
                symbol: data.symbol || "SOLUSDT",
                stopLoss: data.stopLoss !== undefined ? data.stopLoss : 2.5,
                takeProfit: data.takeProfit !== undefined ? data.takeProfit : 5.0,
                trailingStop: data.trailingStop !== undefined ? data.trailingStop : 0.5,
                capital: data.capital !== undefined ? data.capital : 1500,
                leverage: data.leverage !== undefined ? data.leverage : 10,
                maxRam: data.maxRam !== undefined ? data.maxRam : 512,
                slTpMode: data.slTpMode || "PRICE"
              },
              userData: {
                totalPnl: data.totalPnl || 0,
                winRate: data.winRate || 0,
                totalTrades: data.totalTrades || 0,
                botStatus: data.botStatus || "STOPPED",
                botCycle: data.botCycle || 0,
                openPosition: data.openPosition || null,
                name: data.name || ""
              }
            }));
          }
        });

        // Listen to user trades only
        const tradesQuery = query(
          collection(db, "trades"),
          where("uid", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        unsubTrades = onSnapshot(tradesQuery, (snapshot) => {
          const tradesData = snapshot.docs.map(dDoc => {
            const data = dDoc.data();
            return {
              id: dDoc.id,
              time: data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString(),
              symbol: data.symbol || "",
              type: data.type || "BUY",
              price: data.price || 0,
              amount: data.amount || 0,
              total: (data.price || 0) * (data.amount || 0),
              status: data.status || "COMPLETED",
              pnl: data.pnl,
              address: data.address,
              txHash: data.txHash
            };
          });
          // @ts-ignore
          setState(prev => ({ ...prev, trades: tradesData }));
        });
      } else {
        if (unsubUserDoc) { unsubUserDoc(); unsubUserDoc = undefined; }
        if (unsubTrades) { unsubTrades(); unsubTrades = undefined; }
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
      if (unsubTrades) unsubTrades();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSignalsData = async () => {
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const data = await res.json();
          if (data.signals) {
            setState(prev => ({
              ...prev,
              signals: data.signals,
              dataSource: data.dataSource || (prev as any).dataSource
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch state signals:", err);
      }
    };

    fetchSignalsData();
    const timer = setInterval(fetchSignalsData, 5000);
    return () => clearInterval(timer);
  }, [user]);

  if (authChecking) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Initializing System Auth...</div>;
  }
  
  if (!user) {
    if (showLoginScreen) {
      return <LoginView lang={lang} onBackToHome={() => setShowLoginScreen(false)} />;
    }
    return (
      <LandingPage 
        lang={lang}
        setLang={setLang}
        onLogin={() => setShowLoginScreen(true)} 
        onRegister={() => setShowLoginScreen(true)} 
      />
    );
  }

  const handleSignOut = () => {
    signOut(auth);
  };


  const handleToggleBot = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const currentStatus = state.userData?.botStatus || "STOPPED";
      const newStatus = currentStatus === "RUNNING" ? "STOPPED" : "RUNNING";
      await updateDoc(userRef, {
        botStatus: newStatus
      });
    } catch (err) {
      console.error('Failed to toggle bot in Firestore:', err);
    }
  };

  const handleConfigureBot = async (updates: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const firestoreUpdates: any = {};
      
      if (updates.strategy !== undefined) firestoreUpdates.strategy = updates.strategy;
      if (updates.symbol !== undefined) firestoreUpdates.symbol = updates.symbol;
      if (updates.stopLoss !== undefined) firestoreUpdates.stopLoss = parseFloat(updates.stopLoss);
      if (updates.takeProfit !== undefined) firestoreUpdates.takeProfit = parseFloat(updates.takeProfit);
      if (updates.trailingStop !== undefined) firestoreUpdates.trailingStop = parseFloat(updates.trailingStop);
      if (updates.capital !== undefined) firestoreUpdates.capital = parseFloat(updates.capital);
      if (updates.leverage !== undefined) firestoreUpdates.leverage = parseInt(updates.leverage);
      if (updates.maxRam !== undefined) firestoreUpdates.maxRam = parseInt(updates.maxRam);
      if (updates.slTpMode !== undefined) firestoreUpdates.slTpMode = updates.slTpMode;

      if (Object.keys(firestoreUpdates).length > 0) {
        await updateDoc(userRef, firestoreUpdates);
        console.log("Successfully updated bot configuration in Firestore:", firestoreUpdates);
      }
    } catch (err) {
      console.error('Failed to update bot config in Firestore:', err);
    }
  };

  const handleSaveSettings = async (updates: any) => {
    // Save API keys securely to VPS via secure Express Server local proxy to bypass Mixed Content SSL blocker
    if (updates.binanceApiKey && updates.binanceSecret && user) {
      try {
        await fetch('/api/proxy/save-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: 'SG_SECURE_TOKEN_123',
            uid: user.uid,
            apiKey: updates.binanceApiKey,
            apiSecret: updates.binanceSecret
          })
        });
      } catch (err) {
        console.error('Failed to save API keys via proxy:', err);
      }
    }

    // Save other settings to Firestore
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const firestoreUpdates: any = {};
        if (updates.telegramBotId !== undefined) firestoreUpdates.telegramBotId = updates.telegramBotId;
        if (updates.telegramChatId !== undefined) firestoreUpdates.telegramChatId = updates.telegramChatId;
        if (Object.keys(firestoreUpdates).length > 0) {
          await updateDoc(userRef, firestoreUpdates);
        }
      } catch (err) {
        console.error('Failed to save settings to Firestore:', err);
      }
    }
  };

  const handleUpgradePlan = async (plan: string) => {
    alert('Untuk upgrade plan, hubungi admin via WhatsApp: +62881037763388');
  };

  const isPro = ["pro", "elite"].includes(state.subscription?.plan?.toLowerCase() || "");
  const isElite = state.subscription?.plan?.toLowerCase() === "elite";

  const navItems = [
    { id: "dashboard", label: lang === "id" ? "Ringkasan" : "Overview", icon: LayoutDashboard },
    { id: "screener", label: lang === "id" ? "Screener Kuantum" : "Quantum Screener", icon: LineChart },
    { id: "bot", label: lang === "id" ? "Kontrol Bot" : "Bot Controls", icon: Bot },
    { id: "trades", label: lang === "id" ? "Riwayat Buku Besar" : "Ledger history", icon: History },
    { id: "chat", label: lang === "id" ? "Obrolan Penasihat" : "Advisor chat", icon: MessageSquare },
    { id: "portfolio", label: lang === "id" ? "Breakout Portofolio" : "Portfolio breakout", icon: PieChart },
    { id: "billing", label: lang === "id" ? "Paket Berlangganan" : "Subscription Plans", icon: CreditCard },
    { id: "settings", label: lang === "id" ? "Brankas Rahasia" : "Secret Vault", icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView lang={lang} state={state} onToggleBot={handleToggleBot} onSetActiveTab={setActiveTab} />;
      case "screener":
        return <ScreenerView lang={lang} state={state} />;
      case "bot":
        return isPro ? (
          <BotControlView lang={lang} state={state} onToggleBot={handleToggleBot} onConfigureBot={handleConfigureBot} />
        ) : (
          <BillingView lang={lang} state={state} onUpgradePlan={handleUpgradePlan} />
        );
      case "trades":
        return <TradesView lang={lang} state={state} />;
      case "chat":
        return isPro ? (
          <ChatroomView lang={lang} state={state} />
        ) : (
          <BillingView lang={lang} state={state} onUpgradePlan={handleUpgradePlan} />
        );
      case "portfolio":
        return <PortfolioView lang={lang} state={state} />;
      case "billing":
        return <BillingView lang={lang} state={state} onUpgradePlan={handleUpgradePlan} />;
      case "settings":
        return <SettingsView lang={lang} state={state} onSaveSettings={handleSaveSettings} />;
      default:
        return <DashboardView lang={lang} state={state} onToggleBot={handleToggleBot} onSetActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans leading-relaxed tracking-normal antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. Mobile Top Bar Header Navigation */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 border-b border-slate-805 border-slate-800 z-40 px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <span className="flex items-center font-mono">
            <img 
              src="https://res.cloudinary.com/dbckdslrw/image/upload/v1781410573/vyora-logo_hjxxld.png" 
              alt="Vyora" 
              className="h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </span>
          <span className="text-[10px] font-mono leading-none bg-emerald-500/10 text-emerald-400 py-1 px-2 rounded-full font-bold">
            v3.5 PRIME
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex">
            <button 
              onClick={() => setLang("id")} 
              className={`font-sans text-[10px] font-bold py-1 px-2.5 rounded-l border cursor-pointer transition-colors ${lang === "id" ? "bg-emerald-400/15 text-emerald-400 border-emerald-400 z-10 relative" : "bg-transparent text-slate-400 border-slate-700/80 hover:text-slate-200 z-0 relative"}`}
            >
              ID
            </button>
            <button 
              onClick={() => setLang("en")} 
              className={`font-sans text-[10px] font-bold py-1 px-2.5 rounded-r border-t border-b border-r -ml-px cursor-pointer transition-colors ${lang === "en" ? "bg-emerald-400/15 text-emerald-400 border-emerald-400 border-l z-10 relative" : "bg-transparent text-slate-400 border-slate-700/80 border-l hover:text-slate-200 z-0 relative"}`}
            >
              EN
            </button>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-400 hover:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-800 rounded-lg cursor-pointer"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* 2. Responsive Primary Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-850 flex flex-col justify-between transform transition-transform duration-300 select-none
        lg:static lg:transform-none lg:w-64 max-w-[260px] shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col flex-1">
          {/* Header Branding */}
          <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-900/60 font-mono">
            <div className="flex items-center space-x-2">
              <span className="flex items-center font-mono">
                <img 
                  src="https://res.cloudinary.com/dbckdslrw/image/upload/v1781410573/vyora-logo_hjxxld.png" 
                  alt="Vyora" 
                  className="h-16 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
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
              const isRestricted = !isPro && (item.id === "bot" || item.id === "chat");
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isRestricted) {
                      setActiveTab("billing");
                    } else {
                      setActiveTab(item.id);
                    }
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer select-none text-left ${
                    isActive 
                      ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/5 hover:bg-emerald-500" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-950/40"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <IconComponent className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-slate-950 font-bold" : "text-slate-450"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isRestricted && (
                    <Lock className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 font-mono text-[10px] text-slate-500 space-y-3 select-none">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sans font-medium">{lang === "id" ? "Status Auto-Sync:" : "Auto-Sync status:"}</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans font-medium">{lang === "id" ? "Paket Lisensi:" : "Licensed Plan:"}</span>
              <span className="text-slate-300 font-extrabold uppercase">{state.subscription.plan?.toUpperCase()} {lang === "id" ? "PAKET" : "PLAN"}</span>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-bold">{lang === "id" ? "Akhiri Sesi" : "Terminate Session"}</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Display Screen Content Panel */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pt-20 lg:pt-0 bg-slate-950 relative">
        <div className="hidden lg:flex absolute top-6 right-8 z-50">
          <button 
            onClick={() => setLang("id")} 
            className={`font-sans text-[10px] font-bold py-1 px-2.5 rounded-l border cursor-pointer transition-colors ${lang === "id" ? "bg-emerald-400/15 text-emerald-400 border-emerald-400 z-10 relative" : "bg-transparent text-slate-400 border-slate-700/80 hover:text-slate-200 z-0 relative"}`}
          >
            ID
          </button>
          <button 
            onClick={() => setLang("en")} 
            className={`font-sans text-[10px] font-bold py-1 px-2.5 rounded-r border-t border-b border-r -ml-px cursor-pointer transition-colors ${lang === "en" ? "bg-emerald-400/15 text-emerald-400 border-emerald-400 border-l z-10 relative" : "bg-transparent text-slate-400 border-slate-700/80 border-l hover:text-slate-200 z-0 relative"}`}
          >
            EN
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="min-h-full max-w-7xl mx-auto flex flex-col"
            >
              <div className="flex-1">
                {renderActiveView()}
              </div>
              
              {/* Dashboard Footer */}
              <footer className="mt-12 py-6 border-t border-slate-800/50 flex flex-col items-center sm:items-end justify-center text-xs text-slate-500 font-mono">
                <div className="text-center sm:text-right">
                  <p>&copy; {new Date().getFullYear()} Vyora Systems by J-CUBE.</p>
                  <p>All rights reserved.</p>
                </div>
              </footer>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}
