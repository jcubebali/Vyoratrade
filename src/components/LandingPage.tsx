import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Sparkles, 
  Bot, 
  Terminal, 
  Lock, 
  Shield, 
  Zap, 
  ChevronDown, 
  Globe, 
  LineChart, 
  Activity, 
  ArrowRight, 
  Coins, 
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Real-time ticker prices
  const [tickers, setTickers] = useState<Record<string, any>>({
    BTCUSDT: { price: 92450.0, change24h: 3.42, trend: "BULLISH", verdict: "BUY" },
    ETHUSDT: { price: 3125.5, change24h: -1.15, trend: "BEARISH", verdict: "HOLD" },
    SOLUSDT: { price: 242.8, change24h: 8.75, trend: "BULLISH", verdict: "BUY" },
    BNBUSDT: { price: 618.4, change24h: 0.25, trend: "NEUTRAL", verdict: "HOLD" }
  });
  const [dataSource, setDataSource] = useState("SIMULATOR CHANNELS");

  // Track scroll position for header glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Live price updater fetching from our backend endpoint
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const data = await res.json();
          if (data.signals) {
            setTickers(data.signals);
            setDataSource(data.dataSource || "SYSTEM CORE");
          }
        }
      } catch (err) {
        // Fallback to random walk simulation
        setTickers(prev => {
          const updated = { ...prev };
          for (const key of Object.keys(updated)) {
            const factor = 1 + (Math.random() - 0.495) * 0.001;
            updated[key].price = parseFloat((updated[key].price * factor).toFixed(2));
          }
          return updated;
        });
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 4000);
    return () => clearInterval(interval);
  }, []);

  // Matrix / Crypto Connection Network Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 680);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        height = canvas.height = 680;
      }
    };
    window.addEventListener("resize", handleResize);

    // Grid nodes
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colors = ["rgba(16, 185, 129, 0.2)", "rgba(59, 130, 246, 0.15)", "rgba(245, 158, 11, 0.1)"];

    for (let i = 0; i < 45; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.15;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and move nodes
      for (const node of nodes) {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;

        // Boundary bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Bot activity visual simulator state
  const [simLog, setSimLog] = useState<Array<{ id: number; text: string; time: string; color: string }>>([
    { id: 1, text: "Vyora engine initialized. Scanning Binance Orderbooks...", time: "03.24.11", color: "text-slate-400" },
    { id: 2, text: "Analytical convergence detected inside SOLUSDT EMA(20/50).", time: "03.24.15", color: "text-indigo-400" },
    { id: 3, text: "RSI momentum trigger [RSI: 64.2]. Launching Buy Order Proposal.", time: "03.24.19", color: "text-emerald-400" },
    { id: 4, text: "Buy dynamic entry complete. Execution price: $242.45.", time: "03.24.20", color: "text-emerald-500 font-bold" }
  ]);
  const [botWinRate, setBotWinRate] = useState(91.8);
  const [profitCounter, setProfitCounter] = useState(1342.50);

  useEffect(() => {
    const logs = [
      { text: "Dynamic trailing update. Protecting profit levels at 1.5% minimum floor.", color: "text-slate-400" },
      { text: "Institutional support wall identified on BTCUSDT at $92,100.", color: "text-blue-400" },
      { text: "Executing high-frequency arbitrage scanner check across Singapore server.", color: "text-slate-500" },
      { text: "Microscale target take-profit trigger hit on SOLUSDT. Executing sell liquidations.", color: "text-emerald-400 font-bold" },
      { text: "Profit yield booked: +$45.24. (ROE: +18.4%)", color: "text-emerald-500 font-extrabold" },
      { text: "Scan cycle completed. Standing by for next crossover parameter.", color: "text-slate-400" },
      { text: "Arbitrage opportunity check: spread too small. Standby status.", color: "text-slate-500" }
    ];

    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setSimLog(prev => {
        const timestamp = new Date().toTimeString().split(" ")[0];
        const updated = [...prev, { id: Date.now(), text: randomLog.text, time: timestamp, color: randomLog.color }];
        if (updated.length > 5) updated.shift();
        return updated;
      });

      // Fluctuate rate and profit counter
      setBotWinRate(prev => parseFloat(Math.min(96, Math.max(88, prev + (Math.random() - 0.48) * 0.15)).toFixed(1)));
      setProfitCounter(prev => parseFloat((prev + (Math.random() > 0.4 ? Math.random() * 8.5 : -Math.random() * 2)).toFixed(2)));
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: "Apa itu Vyora AI Trading Console?",
      a: "Vyora AI adalah asisten kuantitatif premium terintegrasi yang memantau sinyal teknikal crypto secara real-time. Vyora dilengkapi dengan API eksekusi otomatis ke bursa Binance yang berjalan 24 jam penuh di VPS Singapura berkecepatan tinggi."
    },
    {
      q: "Apakah Vyora AI memerlukan akses Penarikan / Withdrawal dana?",
      a: "Sama sekali TIDAK. Demi keamanan mutlak, Anda hanya perlu mengaktifkan izin 'Enable Spot & Margin Trading' saat membuat API Keys di Binance. Izin penarikan (Withdrawal) harus dinonaktifkan. Dana Anda tetap aman berada di dompet Binance pribadi Anda."
    },
    {
      q: "Bagaimana cara kerja Singapore VPS Integration?",
      a: "Singapore VPS kami terhubung langsung dengan router inti bursa Binance di Asia Tenggara. Ketika mesin Vyora AI mendeteksi konvergensi indikator teknikal optimal (EMA Crossovers & RSI), instruksi ber-latensi mikro langsung dikirim ke server VPS Singapura untuk mengeksekusi perdagangan secara presisi."
    },
    {
      q: "Bagaimana cara menghubungkan API Key Binance saya?",
      a: "Setelah membuat akun Vyora, buka menu 'Secret Vault' di dashboard Anda. Simpan API Key dan API Secret Anda. Key Anda akan otomatis dienkripsi dan dipancarkan ke backend server Singapura untuk menjalankan bot otomatis."
    },
    {
      q: "Apakah ada biaya tersembunyi untuk akun Trial?",
      a: "Tidak ada biaya tersembunyi. Pengguna baru otomatis mendapatkan akses uji coba (Trial) untuk merasakan fitur utama visualisasi Vyora. Untuk mengaktifkan robot trading otomatis penuh 24/7, Anda dapat meng-upgrade ke paket Pro atau Elite melalui admin WhatsApp resmi kami."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. TOP HEADER / APEX NAVIGATION */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 py-3" : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center hover:opacity-90 cursor-default">
              <img 
                src="https://res.cloudinary.com/dbckdslrw/image/upload/v1777721734/Vyora_20260502_110933_0000_2_tz8a1k.jpg" 
                alt="Vyora" 
                className="h-14 w-auto object-contain rounded-xl border border-slate-800 shadow-lg shadow-black/40"
                referrerPolicy="no-referrer"
              />
            </span>
            <div className="h-6 w-[1px] bg-slate-800" />
            <span className="text-[10px] font-mono leading-none bg-emerald-500/10 text-emerald-400 py-1 px-2.5 rounded-full font-bold uppercase tracking-wider">
              QUANT CORE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-slate-105 hover:text-emerald-400 transition-colors">Fitur Utama</a>
            <a href="#ticker" className="hover:text-slate-105 hover:text-emerald-400 transition-colors">Live Market</a>
            <a href="#simulator" className="hover:text-slate-105 hover:text-emerald-400 transition-colors">Live Bot</a>
            <a href="#faq" className="hover:text-slate-105 hover:text-emerald-400 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onLogin}
              className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition px-4 py-2 uppercase tracking-wider"
            >
              Sign In
            </button>
            <button 
              onClick={onRegister}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition select-none tracking-wider uppercase active:scale-[0.98] shadow-lg shadow-emerald-500/10"
            >
              Mulai Gratis <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. DYNAMICAL GRAPH & HERO MATRIX PREVIEW */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden flex flex-col justify-center min-h-[640px]">
        {/* Background Canvas connections */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
          <div className="absolute left-1/4 top-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[140px]" />
          <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[160px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT DETAILS: COPY, TITLE, SUBHEAD */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Vyora Core Version v3.5 Prime Active
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight uppercase">
                Sistem Perdagangan <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 font-black">
                  QUANTUM ALGORITMA
                </span>
              </h1>

              <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Hubungkan API bursa Binance Anda menuju server robot kuantitatif kami yang terdedikasi di Singapura. Pantau pergerakan pasar, amankan posisi trading menggunakan trailing automated risk gates, dan biarkan Vyora menguji parameter support terbaik secara 24/7.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onRegister}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xl shadow-emerald-500/20"
                >
                  MULAI GRATIS SEKARANG <ArrowRight className="h-4.5 w-4.5" />
                </button>
                <button 
                  onClick={onLogin}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-100 border border-slate-800 font-bold text-sm px-6 py-4 rounded-2xl transition active:scale-[0.98] uppercase tracking-wider"
                >
                  Konsol Demo
                </button>
              </div>

              {/* Secure statement */}
              <div className="pt-3 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> Tanpa Akses Penarikan</span>
                <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-emerald-500" /> TLS Enkripsi Penuh</span>
                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-teal-500" /> Server VPS Singapura</span>
              </div>
            </div>

            {/* RIGHT SIDE: BOT PREVIEW MODULE MOCKUP */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850/90 rounded-3xl overflow-hidden shadow-2xl relative">
                
                {/* Light reflection band across top */}
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                
                {/* Visual window chrome header */}
                <div className="flex items-center justify-between px-5 py-4 bg-slate-950/60 border-b border-slate-900/80 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    VYORA-SG-VPS_RUNNING
                  </span>
                </div>

                {/* Simulated Metrics Grid */}
                <div className="p-5 grid grid-cols-2 gap-4 border-b border-slate-900 font-mono">
                  <div className="bg-slate-950/80 border border-slate-855 border-slate-850/50 p-3 rounded-2xl space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Live Win Rate</span>
                    <div className="text-xl font-black text-emerald-400 flex items-baseline gap-0.5">
                      {botWinRate}%
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-850/50 p-3 rounded-2xl space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Yield booked today</span>
                    <div className="text-xl font-black text-slate-200">
                      +${profitCounter.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Mini chart visualizer */}
                <div className="px-5 py-4 bg-slate-950/30 border-b border-slate-900">
                  <div className="flex justify-between items-center mb-2 font-mono text-[9px] text-slate-500 uppercase">
                    <span>Performance Matrix</span>
                    <span className="text-emerald-400">Stable compounding</span>
                  </div>
                  
                  {/* Custom animated SVG wave */}
                  <div className="h-24 w-full flex items-end">
                    <svg className="w-full h-full text-emerald-500/20" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path 
                        d="M0,35 Q15,32 30,22 T60,15 T90,5 L100,5 L100,40 L0,40 Z" 
                        fill="currentColor"
                      />
                      <path 
                        d="M0,35 Q15,32 30,22 T60,15 T90,5" 
                        fill="none" 
                        stroke="rgba(16, 185, 129, 0.8)" 
                        strokeWidth="1.5"
                      />
                      {/* Interactive buy/sell nodes */}
                      <circle cx="30" cy="22" r="2.5" fill="#f59e0b" />
                      <circle cx="60" cy="15" r="2.5" fill="#10b981" />
                      <circle cx="90" cy="5" r="3" fill="#10b981" className="animate-pulse" />
                    </svg>
                  </div>
                </div>

                {/* Real-time technical log streams */}
                <div className="p-5 font-mono text-[10px] space-y-2 bg-slate-955/80">
                  <span className="text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">SYSTEM ACTIVITY LOG (LIVE)</span>
                  <div className="space-y-1.5 h-[115px] overflow-hidden flex flex-col justify-end">
                    {simLog.map((log) => (
                      <div key={log.id} className="flex gap-2 items-start leading-tight">
                        <span className="text-slate-600 font-bold">[{log.time}]</span>
                        <span className={log.color}>{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. COIN TICKER ROW STATS */}
      <section id="ticker" className="bg-slate-950 border-t border-b border-slate-900 py-6 relative z-10 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live Feed
              </span>
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest">REAL-TIME SIGNAL MULTI-SCREENER</h2>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-full select-none">
              Feed source: <strong className="text-emerald-400 font-bold">{dataSource}</strong>
            </div>
          </div>

          {/* Grid list of coins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tickers).map(([sym, coin]: [string, any]) => {
              const changeInt = parseFloat(coin.change24h);
              const isPositive = changeInt >= 0;
              return (
                <div 
                  key={sym} 
                  className="bg-slate-900/50 border border-slate-850/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-800 transition relative overflow-hidden group select-none"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-100">{sym}</span>
                      <div className="text-xs text-slate-500 font-sans tracking-wide">
                        RSI: <span className="font-mono text-[10px] font-bold text-slate-300">{coin.rsi || 50}</span>
                      </div>
                    </div>
                    {/* Verdict tag */}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      coin.verdict === "BUY" ? "bg-emerald-500/10 text-emerald-400" :
                      coin.verdict === "SELL" ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-400"
                    }`}>
                      {coin.verdict || "HOLD"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-slate-200">${coin.price ? coin.price.toLocaleString() : "..."}</span>
                    <span className={`text-xs font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPositive ? "+" : ""}{coin.change24h}%
                    </span>
                  </div>

                  {/* Gradient strip hover animation */}
                  <div className={`absolute bottom-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
                    coin.verdict === "BUY" ? "from-emerald-500 to-teal-500" :
                    coin.verdict === "SELL" ? "from-rose-500 to-orange-500" : "from-slate-700 to-slate-500"
                  }`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CORE QUANTUM FEATURES - BENTO GRID */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
            <Zap className="h-3 w-3" /> Rekayasa Kualifikasi Kuantitatif
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight uppercase">
            Fitur Utama <span className="text-emerald-400 font-extrabold">System Vyora</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-sans">
            Vyora mengintegrasikan kecerdasan model Gemini dengan kecepatan optimal VPS Singapura untuk memberikan hasil analisis yang aman, stabil, dan dinamis.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Singapore VPS Pipeline */}
          <div className="md:col-span-2 bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-850 rounded-3xl p-8 relative overflow-hidden group hover:border-slate-800 transition">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wide">Singapore Dedicated VPS Network</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-xl">
                  Bot perdagangan berjalan non-stop di VPS Singapura, terhubung secara instan tanpa membebani laptop Anda. Sistem tetap berjalan melacak momentum pasar 24 jam penuh di latar belakang dengan latensi eksekusi minimal.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-[10px] text-emerald-400 uppercase font-semibold">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> SG Network</span>
                <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> High-Spec VPS CPU</span>
                <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> 99.9% UPTIME GUARANTEE</span>
              </div>
            </div>
          </div>

          {/* Card 2: Safe Secret Encryption API */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-850 rounded-3xl p-8 relative overflow-hidden group hover:border-slate-800 transition">
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[50px] pointer-events-none" />
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wide">Secret Vault Encryption</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Sandi API Keys Anda dienkripsi berlapis-lapis dalam Secret Vault milik profil Anda. Tidak ada izin penarikan (withdrawal) yang diaktifkan, memastikan keamanan mutlak atas dana akun bursa Anda.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-500 uppercase flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" /> Only Spot Trading Allowed
              </div>
            </div>
          </div>

          {/* Card 3: Gemini Technical Audit Tool */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-850 rounded-3xl p-8 relative overflow-hidden group hover:border-slate-800 transition">
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none" />
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl w-fit">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wide">Gemini Technical Audits</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Konsol dilengkapi analitik pintar Gemini AI untuk melakukan audit pasar mendalam, merangkum data Moving Averages, RSI, MACD dan memberikan verdict ringkas yang sangat akurat.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-500 uppercase flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Powered by Gemini
              </div>
            </div>
          </div>

          {/* Card 4: Trailing Stop-Loss Shields */}
          <div className="md:col-span-2 bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-850 rounded-3xl p-8 relative overflow-hidden group hover:border-slate-800 transition">
            <div className="absolute left-0 bottom-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-4">
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl w-fit">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wide">Dynamic Stop-Loss & Take-Profit Modes</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-xl">
                  Bebas mengkonfigurasi mode deteksi stop-loss dan take-profit berdasarkan pergeseran Persentase nominal harga dasar koin (Price) maupun target ROE Leverage margin. Lindungi modal secara konsisten dari krisis anomali pasar.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-[10px] text-teal-400 uppercase font-semibold">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> MODE HARGA (PRICE)</span>
                <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> MODE TARGET ROE (MARGIN leverage)</span>
                <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> AUTO TRAILING GATES</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE LIVE EXPERIMENTING SIMULATOR */}
      <section id="simulator" className="py-20 bg-slate-900/30 border-t border-b border-slate-900 relative z-10 select-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-10">
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full font-bold tracking-widest leading-none">
              interactive sandbox
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-100 uppercase">Simulasi Alokasi Profit Vyora</h2>
            <p className="text-slate-400 text-xs font-sans max-w-lg mx-auto">
              Geser nilai kapital dan rasio target di bawah untuk melihat simulasi hasil eksekusi trading berdasarkan formula leverage kuantitatif.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
            {/* Range sliders */}
            <div className="space-y-6 font-mono">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase">Modal Alokasi Sinyal (Capital)</span>
                  <span className="text-emerald-400 font-extrabold">$1,500 USDT (Default)</span>
                </div>
                <div className="text-base font-bold text-slate-300">$1,500 USDT</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase">Leverage Margin</span>
                  <span className="text-amber-500 font-extrabold">10x (Standard)</span>
                </div>
                <div className="text-base font-bold text-slate-300">10x Cross Margin Multiplier</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase">Rasio Take Profit (ROE Target)</span>
                  <span className="text-emerald-400 font-extrabold">+5.0% Price (50% ROE)</span>
                </div>
                <div className="text-base font-bold text-slate-300">+5.0% Target Outflow</div>
              </div>
            </div>

            {/* Simulated yield results card */}
            <div className="bg-slate-900/80 border border-slate-850 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left font-mono">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase">Dynamic Margin Value</span>
                <div className="text-lg font-bold text-slate-300">$150.00 USDT</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase">Projected Net ROI</span>
                <div className="text-lg font-black text-emerald-400">+$75.00 USDT</div>
              </div>
              <div className="space-y-1 flex flex-col justify-center items-center md:items-end">
                <button 
                  onClick={onRegister}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition uppercase tracking-wider"
                >
                  Ikut Sinyal ini &rarr;
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-[10px] sm:text-xs flex items-center gap-2.5 leading-relaxed font-sans">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-400" />
              <span><strong>Catatan:</strong> Hasil di atas hanyalah simulasi matematika berdasarkan parameter kualifikasi standar. Perdagangan aset kripto memiliki risiko volatilitas tinggi. Selalu gunakan stop-loss.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ - INTERACTIVE ACCORDIONS CONTAINER */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full font-bold tracking-widest">
            faq
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-100 uppercase">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-slate-400 text-xs font-sans max-w-sm mx-auto">
            Semua hal penting yang perlu Anda ketahui sebelum menggunakan konsol cerdas Vyora.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl transition overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-200 hover:text-white focus:outline-none text-xs sm:text-sm"
                >
                  <span className="uppercase tracking-wide">{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-500 transition-transform ${isOpen ? "rotate-180 text-emerald-400" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-900/80 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION MODULE */}
      <section className="py-20 relative overflow-hidden text-center z-10 border-t border-slate-900">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 fill-current" /> SECURE TRADING HUB
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-100 uppercase tracking-tight">
            Sudah Siap Membuka <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-black">Akses Quantum Vyora?</span>
          </h2>

          <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-sans">
            Daftarkan email Anda hari ini juga, pasang credential API Binance Anda dengan aman tanpa izin penarikan, dan aktifkan robot cerdas Vyora 24/7 instan.
          </p>

          <div className="pt-4">
            <button 
              onClick={onRegister}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-10 py-4.5 rounded-2xl inline-flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-2xl shadow-emerald-500/20"
            >
              DAFTARKAN AKUN GRATIS SEKARANG <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. ELEVATED COMPLIANT PREMIUM FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 relative z-10 text-slate-600 text-[10px] font-mono select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/dbckdslrw/image/upload/v1777721734/Vyora_20260502_110933_0000_2_tz8a1k.jpg" 
                alt="Vyora" 
                className="h-10 w-auto object-contain rounded-lg border border-slate-900"
                referrerPolicy="no-referrer"
              />
              <span className="text-emerald-500 font-extrabold text-[11px] tracking-wider uppercase">BLOCK SYSTEM</span>
              <span className="bg-slate-900 text-slate-500 py-0.5 px-2 rounded text-[9px] font-bold">STABLE CODES</span>
            </div>
            
            <div className="flex gap-6 uppercase tracking-widest text-slate-500 font-semibold">
              <span className="hover:text-emerald-400 cursor-pointer">Security Ledger</span>
              <span className="hover:text-emerald-400 cursor-pointer">Binance API Terms</span>
              <span className="hover:text-emerald-400 cursor-pointer">WhatsApp Support</span>
            </div>
          </div>

          <p className="text-slate-650 max-w-4xl text-left leading-relaxed font-sans border-t border-slate-900/60 pt-6">
            <strong>Penafian Risiko Kripto:</strong> Transaksi perdagangan aset mata uang kripto dan margin berjangka (futures) membawa risiko tinggi yang sangat signifikan terhadap modal Anda. Parameter yang dihitung oleh Vyora AI Trading Console dihasilkan menggunakan instrumen statistik dan model Gemini AI sebagai asisten visual, bukan nasihat investasi keuangan mutlak. Anda bertanggung jawab penuh atas keputusan konfigurasi rasio stop-loss, margin, leverage, dan alokasi dana bursa Anda sendiri. Vyora tidak pernah menerima penyimpanan transfer setoran penarikan langsung dana pengguna selain lisensi server opsional.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900/60 pt-6">
            <span>&copy; 2026 Vyora by J-CUBE  |  All Rights Reserved</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> AES-256 API SSL SECURE BRIDGE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
