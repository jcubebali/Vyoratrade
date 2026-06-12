import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Plus } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [lang, setLang] = useState<"id" | "en">("id");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real-time ticker price states
  const [tickerItems, setTickerItems] = useState<Record<string, { price: string; change: string; isPositive: boolean }>>({
    BTCUSDT: { price: "$--", change: "--", isPositive: true },
    ETHUSDT: { price: "$--", change: "--", isPositive: true },
    BNBUSDT: { price: "$--", change: "--", isPositive: true },
    SOLUSDT: { price: "$--", change: "--", isPositive: true },
    XRPUSDT: { price: "$--", change: "--", isPositive: true },
    DOGEUSDT: { price: "$--", change: "--", isPositive: true },
    ADAUSDT: { price: "$--", change: "--", isPositive: true },
    AVAXUSDT: { price: "$--", change: "--", isPositive: true },
  });

  // Signal demo states
  const [demoPrice, setDemoPrice] = useState<string>("Loading...");
  const [demoTp, setDemoTp] = useState<string>("--");
  const [demoSl, setDemoSl] = useState<string>("--");
  const [demoRsi, setDemoRsi] = useState<string>("56.1");

  // FAQ state & data
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqItems = [
    {
      id: 1,
      q: {
        id: "Apa itu Vyora?",
        en: "What is Vyora?"
      },
      a: {
        id: "Vyora adalah asisten perdagangan aset kripto berbasis kecerdasan buatan (AI) yang membantu menganalisis pasar secara real-time, menyuguhkan parameter Take Profit (TP) & Stop Loss (SL) cerdas, serta membantu Anda mengotomatiskan eksekusi order sesuai toleransi risiko Anda.",
        en: "Vyora is an AI-powered cryptocurrency trading assistant that analyzes markets in real-time, designs smart parameters for Take Profit (TP) & Stop Loss (SL), and helps automate order executions according to your risk tolerance."
      }
    },
    {
      id: 2,
      q: {
        id: "Bagaimana cara kerja uji coba gratis 7 hari?",
        en: "How does the 7-day free trial work?"
      },
      a: {
        id: "Anda dapat mendaftar tanpa kartu kredit dan langsung menikmati seluruh fitur unggulan Vyora selama 7 hari penuh secara gratis. Jika Anda merasa layanan ini bermanfaat, Anda dapat memilih paket berlangganan setelah masa uji coba berakhir.",
        en: "You can sign up without a credit card and immediately enjoy Vyora's premium features for 7 days absolutely free. If you find the service valuable, you can choose a subscription plan once the trial period ends."
      }
    },
    {
      id: 3,
      q: {
        id: "Apakah dana investasi saya aman di Vyora?",
        en: "Is my investment fund safe with Vyora?"
      },
      a: {
        id: "Sangat aman. Vyora tidak pernah menyentuh, menerima, atau menyimpan dana deposit pengguna. Semua transaksi tetap berjalan langsung di bursa terpercaya Anda sendiri (seperti Binance, Tokocrypto, dll.) melalui enkripsi kunci API yang aman tanpa hak akses penarikan (withdrawal).",
        en: "Completely safe. Vyora never touches, receives, or stores user deposits. All transactions remain and execute directly on your own trusted exchange account (such as Binance, Tokocrypto, etc.) via secure encrypted API keys with withdrawal permissions locked."
      }
    },
    {
      id: 4,
      q: {
        id: "Apakah saya perlu menjaga komputer/laptop tetap menyala?",
        en: "Do I need to keep my computer/laptop turned on?"
      },
      a: {
        id: "Tidak. Vyora beroperasi sepenuhnya di infrastruktur server cloud kami secara 24/7. Setelah konfigurasi Anda diaktifkan, Anda dapat mematikan seluruh perangkat Anda dan membiarkan asisten AI menjalankan tugasnya secara otomatis.",
        en: "No. Vyora operates 24/7 entirely on our ultra-reliable cloud server infrastructure. Once your configurations are set, you can shut down your device and let our AI assistant run automatically."
      }
    },
    {
      id: 5,
      q: {
        id: "Bagaimana cara membatalkan langganan atau trial?",
        en: "How do I cancel my subscription or trial?"
      },
      a: {
        id: "Anda dapat mematikan atau membatalkan uji coba gratis / langganan aktif kapan saja secara instan melalui dasbor pengaturan akun Vyora Anda dengan satu klik. Tidak ada tagihan atau komitmen tersembunyi.",
        en: "You can deactivate or cancel your free trial / active subscription at any time instantly through your Vyora account settings dashboard with a single click. There are no hidden fees or commitments."
      }
    }
  ];

  // Translation values dictionary
  const translations = {
    id: {
      "hero-h1": <>BIARKAN <span className="accent text-emerald-400">AI</span><br /><span className="solid-white">YANG TRADING</span><br /><span className="solid-white">UNTUK KAMU</span></>,
      "hero-sub": <>Vyora menggunakan kecerdasan buatan untuk menganalisis pasar crypto, mengeksekusi order otomatis, dan menghasilkan <strong>passive income</strong> — bahkan saat kamu tidur.</>,
      "hero-btn1": "🚀 Coba Gratis 7 Hari",
      "hero-btn2": "Lihat Cara Kerja →",
      "how-label": "// Cara Kerja",
      "how-title": "3 LANGKAH\nMULAI PROFIT",
      "how-sub": "Setup sekali, bot jalan terus. Tidak perlu pengalaman trading.",
      "cta-btn": "🚀 Daftar Sekarang — Gratis",
      "cta-note": "✓ No credit card  ·  ✓ 7 hari free trial  ·  ✓ Cancel anytime",
    },
    en: {
      "hero-h1": <>LET <span className="accent text-emerald-400">AI</span><br /><span className="solid-white">TRADE</span><br /><span className="solid-white">FOR YOU</span></>,
      "hero-sub": <>Vyora uses artificial intelligence to analyze crypto markets, execute orders automatically, and generate <strong>passive income</strong> — even while you sleep.</>,
      "hero-btn1": "🚀 Start Free 7 Days",
      "hero-btn2": "See How It Works →",
      "how-label": "// How It Works",
      "how-title": "3 STEPS TO\nSTART EARNING",
      "how-sub": "Setup once, bot runs forever. No trading experience needed.",
      "cta-btn": "🚀 Sign Up Now — Free",
      "cta-note": "✓ No credit card  ·  ✓ 7-day free trial  ·  ✓ Cancel anytime",
    }
  };

  const t = translations[lang];

  // Fetch real-time BTC price for Demo Signal
  useEffect(() => {
    const updateDemoSignal = async () => {
      try {
        const r = await fetch("/api/binance/ticker-price?symbol=BTCUSDT");
        const data = await r.json();
        const price = parseFloat(data.price);
        if (isNaN(price)) return;
        const tp = (price * 1.03).toFixed(2);
        const sl = (price * 0.985).toFixed(2);
        
        setDemoPrice("$" + price.toLocaleString("en-US", { minimumFractionDigits: 2 }));
        setDemoTp("$" + parseFloat(tp).toLocaleString("en-US", { minimumFractionDigits: 2 }));
        setDemoSl("$" + parseFloat(sl).toLocaleString("en-US", { minimumFractionDigits: 2 }));
      } catch (e) {
        console.warn("Price fetch error (falling back to simulator):", e);
        const price = 92450.00 + (Math.random() - 0.5) * 50;
        const tp = (price * 1.03).toFixed(2);
        const sl = (price * 0.985).toFixed(2);
        setDemoPrice("$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setDemoTp("$" + parseFloat(tp).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setDemoSl("$" + parseFloat(sl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    };

    updateDemoSignal();
    const interval = setInterval(updateDemoSignal, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live market data for Ticker Tracker (WebSocket + HTTP Fallback)
  useEffect(() => {
    const pairs = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "AVAXUSDT"];
    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;
    let isMounted = true;

    const updateTickerHTTP = async () => {
      try {
        const r = await fetch("/api/binance/tickers-24hr");
        const results = await r.json();
        if (!isMounted || !Array.isArray(results)) return;

        const newTickerItems: Record<string, { price: string; change: string; isPositive: boolean }> = {};
        results.forEach(d => {
          if (d && d.symbol) {
            const price = parseFloat(d.lastPrice || d.price || "0");
            const change = parseFloat(d.priceChangePercent || d.change24h || "0");
            let priceStr = "";
            if (price >= 1000) {
              priceStr = "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (price >= 1) {
              priceStr = "$" + price.toFixed(4);
            } else {
              priceStr = "$" + price.toFixed(6);
            }
            newTickerItems[d.symbol] = {
              price: priceStr,
              change: (change >= 0 ? "+" : "") + change.toFixed(2) + "%",
              isPositive: change >= 0
            };
          }
        });
        setTickerItems(prev => ({ ...prev, ...newTickerItems }));
      } catch (e) {
        console.warn("HTTP Ticker error (falling back to simulator):", e);
        if (!isMounted) return;
        setTickerItems(prev => {
          const sims: Record<string, { price: string; change: string; isPositive: boolean }> = {};
          const defaultBases: Record<string, { base: number; changeBase: number }> = {
            BTCUSDT: { base: 92450.00, changeBase: 3.42 },
            ETHUSDT: { base: 3125.50, changeBase: -1.15 },
            BNBUSDT: { base: 618.40, changeBase: 0.25 },
            SOLUSDT: { base: 242.80, changeBase: 8.75 },
            XRPUSDT: { base: 1.1512, changeBase: 2.45 },
            DOGEUSDT: { base: 0.3848, changeBase: -1.20 },
            ADAUSDT: { base: 0.6251, changeBase: 0.85 },
            AVAXUSDT: { base: 34.50, changeBase: 4.12 }
          };
          Object.entries(defaultBases).forEach(([sym, val]) => {
            const currentItem = prev[sym];
            const currentPrice = currentItem && currentItem.price !== "$--" ? parseFloat(currentItem.price.replace(/[$,]/g, "")) : val.base;
            const price = currentPrice * (1 + (Math.random() - 0.49) * 0.001);
            const change = val.changeBase + (Math.random() - 0.5) * 0.05;
            let priceStr = "";
            if (price >= 1000) {
              priceStr = "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (price >= 1) {
              priceStr = "$" + price.toFixed(4);
            } else {
              priceStr = "$" + price.toFixed(6);
            }
            sims[sym] = {
              price: priceStr,
              change: (change >= 0 ? "+" : "") + change.toFixed(2) + "%",
              isPositive: change >= 0
            };
          });
          return sims;
        });
      }
    };

    // Initialize with direct HTTP pull immediately to prevent waiting
    updateTickerHTTP();

    // Establish WebSocket Connection
    const connectWS = () => {
      if (!isMounted) return;
      try {
        const streams = pairs.map(p => `${p.toLowerCase()}@ticker`).join("/");
        ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(event.data);
            const data = payload.data;
            if (data && data.s) {
              const symbol = data.s as string;
              const price = parseFloat(data.c);
              const change = parseFloat(data.P);
              
              let priceStr = "";
              if (price >= 1000) {
                priceStr = "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              } else if (price >= 1) {
                priceStr = "$" + price.toFixed(4);
              } else {
                priceStr = "$" + price.toFixed(6);
              }

              setTickerItems(prev => ({
                ...prev,
                [symbol]: {
                  price: priceStr,
                  change: (change >= 0 ? "+" : "") + change.toFixed(2) + "%",
                  isPositive: change >= 0
                }
              }));
            }
          } catch (err) {
            console.error("WS Parse Error:", err);
          }
        };

        ws.onclose = () => {
          console.log("Binance Ticker WS closed. Reconnecting...");
          setTimeout(() => {
            if (isMounted) {
              connectWS();
            }
          }, 10000); // 10s wait before reconnecting to prevent thrashing
        };

        ws.onerror = (err) => {
          console.warn("WS connection error (will rely on server proxy fallback):", err);
        };
      } catch (err) {
        console.warn("WebSocket setup failed:", err);
      }
    };

    connectWS();

    // Secondary layer: Fallback HTTP polling every 12 seconds to ensure data integrity
    fallbackInterval = setInterval(updateTickerHTTP, 12000);

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
      clearInterval(fallbackInterval);
    };
  }, []);

  // Live RSI fluctuation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoRsi(prev => {
        const current = parseFloat(prev);
        const deviation = (Math.random() - 0.5) * 1.5;
        const newRsi = Math.max(30, Math.min(80, current + deviation));
        return newRsi.toFixed(1);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll reveal Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  // Dual canvas interactive background line paths & glowing dots
  useEffect(() => {
    const lineC = lineCanvasRef.current;
    const dotC = dotCanvasRef.current;
    if (!lineC || !dotC) return;

    const lctx = lineC.getContext("2d");
    const dctx = dotC.getContext("2d");
    if (!lctx || !dctx) return;

    let W: number;
    let H: number;
    let DPR: number;
    let animationFrameId: number;

    const resize = () => {
      DPR = window.devicePixelRatio || 1;
      const parent = lineC.parentElement;
      const pW = parent ? parent.clientWidth : window.innerWidth;
      const pH = parent ? parent.clientHeight : window.innerHeight;
      W = pW * DPR;
      H = pH * DPR;
      if (lineC && dotC) {
        lineC.width = dotC.width = W;
        lineC.height = dotC.height = H;
        lineC.style.width = dotC.style.width = pW + "px";
        lineC.style.height = dotC.style.height = pH + "px";
      }
    };
    resize();

    interface Point {
      x: number;
      y: number;
    }

    interface Line {
      pts: Point[];
      drawIdx: number;
      done: boolean;
      hasSpawnedNext: boolean;
    }

    const CONFIGS = [
      { upBias: 0.74, segments: 15, volatility: 0.35 },
      { upBias: 0.82, segments: 12, volatility: 0.20 },
      { upBias: 0.68, segments: 18, volatility: 0.50 },
      { upBias: 0.78, segments: 14, volatility: 0.40 }
    ];
    let patIdx = 0;

    const makePoints = (cfg: typeof CONFIGS[0]): Point[] => {
      const pts: Point[] = [];
      const startY = H * 0.72;
      const endY = H * 0.10;
      const totalRise = startY - endY;
      const upCount = Math.round(cfg.segments * cfg.upBias);
      const downCount = cfg.segments - upCount;
      const segArr: number[] = [];
      let i: number;
      for (i = 0; i < upCount; i++) segArr.push(1);
      for (i = 0; i < downCount; i++) segArr.push(-1);
      for (i = segArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = segArr[i];
        segArr[i] = segArr[j];
        segArr[j] = tmp;
      }
      const upMag = totalRise / Math.max(0.1, upCount - cfg.volatility * downCount);
      const downMag = upMag * cfg.volatility;
      const segLens = segArr.map(() => 0.5 + Math.random() * 1.5);
      const totalLen = segLens.reduce((a, b) => a + b, 0);
      const scaledLens = segLens.map(l => (l / totalLen) * W);
      let x = 0;
      let y = startY;
      pts.push({ x, y });
      for (i = 0; i < segArr.length; i++) {
        x += scaledLens[i];
        y += segArr[i] === 1 ? -upMag : downMag;
        y = Math.max(H * 0.06, Math.min(H * 0.72, y));
        pts.push({ x, y });
      }
      return pts;
    };

    let lines: Line[] = [];
    let tick = 0;
    let sub = 0;

    const spawnLine = () => {
      const cfg = CONFIGS[patIdx % CONFIGS.length];
      patIdx++;
      const pts = makePoints(cfg);
      lines.push({ pts, drawIdx: 0, done: false, hasSpawnedNext: false });
      if (lines.length > 5) lines.shift();
    };

    const init = () => {
      lctx.clearRect(0, 0, W, H);
      dctx.clearRect(0, 0, W, H);
      lines = [];
      patIdx = 0;
      tick = 0;
      sub = 0;
      spawnLine();
    };
    init();

    const handleResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", handleResize);

    const SPEED = 0.18; // Significantly faster draw movement

    const drawLines = () => {
      lctx.clearRect(0, 0, W, H);
      lctx.fillStyle = "#030611"; // Seamless with Vyora dark wrapper background CSS
      lctx.fillRect(0, 0, W, H);

      const SIZE = 48 * DPR;
      let x: number, y: number;
      lctx.lineWidth = 0.8 * DPR;
      lctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      for (x = 0; x <= W; x += SIZE) {
        lctx.beginPath(); lctx.moveTo(x, 0); lctx.lineTo(x, H); lctx.stroke();
      }
      for (y = 0; y <= H; y += SIZE) {
        lctx.beginPath(); lctx.moveTo(0, y); lctx.lineTo(W, y); lctx.stroke();
      }
      lctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      lctx.lineWidth = 1.2 * DPR;
      for (x = 0; x <= W; x += SIZE * 5) {
        lctx.beginPath(); lctx.moveTo(x, 0); lctx.lineTo(x, H); lctx.stroke();
      }
      for (y = 0; y <= H; y += SIZE * 5) {
        lctx.beginPath(); lctx.moveTo(0, y); lctx.lineTo(W, y); lctx.stroke();
      }

      const total = lines.length;
      for (let li = 0; li < total; li++) {
        const line = lines[li];
        const isNewest = li === total - 1;
        const alpha = line.done 
          ? (0.05 + (li / (total || 1)) * 0.12) // finished lines fade elegantly into background grid
          : (0.40 + (li / (total || 1)) * 0.45); // drawing active lines are vivid

        if (line.drawIdx < 1) continue;

        // Draw standard line chart with ultra-sharp raw trading corners
        lctx.beginPath();
        lctx.moveTo(line.pts[0].x, line.pts[0].y);
        for (let k = 1; k <= line.drawIdx && k < line.pts.length; k++) {
          lctx.lineTo(line.pts[k].x, line.pts[k].y);
        }
        lctx.strokeStyle = "rgba(0, 255, 170, " + alpha + ")";
        lctx.lineWidth = (isNewest ? 2.2 : 1.4) * DPR; 
        lctx.lineJoin = "miter";
        lctx.lineCap = "square";
        lctx.miterLimit = 10;
        lctx.stroke();

        // Shaded emerald gradient background under the newest active line
        if (isNewest && line.pts.length > 0) {
          const areaPath = new Path2D();
          areaPath.moveTo(line.pts[0].x, H);
          for (let k = 0; k <= line.drawIdx && k < line.pts.length; k++) {
            areaPath.lineTo(line.pts[k].x, line.pts[k].y);
          }
          const lastPointIdx = Math.min(line.drawIdx, line.pts.length - 1);
          areaPath.lineTo(line.pts[lastPointIdx].x, H);
          areaPath.closePath();

          const fillGrad = lctx.createLinearGradient(0, H * 0.15, 0, H);
          fillGrad.addColorStop(0, "rgba(0, 255, 170, 0.08)");
          fillGrad.addColorStop(1, "rgba(0, 255, 170, 0)");
          lctx.fillStyle = fillGrad;
          lctx.fill(areaPath);
        }
      }
    };

    const drawDot = () => {
      dctx.clearRect(0, 0, W, H);
      
      lines.forEach((line, li) => {
        // Draw dot indicators only for actively plotting curves
        if (line.drawIdx < 1 || line.done) return;

        const lastIdx = Math.min(line.drawIdx, line.pts.length - 1);
        const cur = line.pts[lastIdx];
        const isNewest = li === lines.length - 1;
        const opacity = isNewest ? 1.0 : 0.6;

        // Subtle crosshair dotted tracker lines matching premium trading screens
        dctx.strokeStyle = "rgba(0, 255, 170, " + (0.12 * opacity) + ")";
        dctx.lineWidth = 1 * DPR;
        dctx.setLineDash([4 * DPR, 4 * DPR]);

        dctx.beginPath();
        dctx.moveTo(0, cur.y);
        dctx.lineTo(W, cur.y);
        dctx.stroke();

        dctx.beginPath();
        dctx.moveTo(cur.x, 0);
        dctx.lineTo(cur.x, H);
        dctx.stroke();

        dctx.setLineDash([]);

        const glowR = (14 + Math.sin(tick * 0.08 + li) * 4) * DPR;
        const grd = dctx.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, glowR);
        grd.addColorStop(0, "rgba(0, 255, 170, " + (0.45 * opacity) + ")");
        grd.addColorStop(1, "rgba(0, 255, 170, 0)");
        dctx.fillStyle = grd;
        dctx.beginPath();
        dctx.arc(cur.x, cur.y, glowR, 0, Math.PI * 2);
        dctx.fill();

        const blink = (0.5 + 0.5 * Math.sin(tick * 0.25 + li)) * opacity;
        dctx.fillStyle = "rgba(0, 255, 170, " + blink + ")";
        dctx.beginPath();
        dctx.arc(cur.x, cur.y, 4 * DPR, 0, Math.PI * 2);
        dctx.fill();

        dctx.strokeStyle = "rgba(0, 255, 170, " + (blink * 0.4) + ")";
        dctx.lineWidth = 1 * DPR;
        dctx.beginPath();
        dctx.arc(cur.x, cur.y, 9 * DPR, 0, Math.PI * 2);
        dctx.stroke();
      });
    };

    const frame = () => {
      tick++;
      sub += SPEED;
      const steps = Math.floor(sub);
      sub -= steps;

      if (steps > 0) {
        // Advance all active trends
        lines.forEach(line => {
          if (!line.done) {
            line.drawIdx = Math.min(line.drawIdx + steps, line.pts.length - 1);
            if (line.drawIdx >= line.pts.length - 1) {
              line.done = true;
            }
          }
        });

        // Spawn a brand new trend path BEFORE the active latest path reaches the top-right (e.g. at 45% progress)
        const newest = lines[lines.length - 1];
        if (newest && newest.drawIdx >= Math.floor(newest.pts.length * 0.45) && !newest.hasSpawnedNext) {
          newest.hasSpawnedNext = true;
          spawnLine();
        }
      }

      drawLines();
      drawDot();
      animationFrameId = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="landing-page-wrapper selection:bg-emerald-500 selection:text-slate-950 min-h-screen text-slate-400 font-sans leading-relaxed tracking-normal antialiased">
      
      {/* HTML STYLE TAG PRESERVING PERFECT CSS SPECIFICATION Scoped to wrapping wrapper class */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;650;700&family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

        .landing-page-wrapper {
          --black: #030611;
          --dark: #070c1e;
          --panel: #0d152a;
          --border: rgba(255, 255, 255, 0.05);
          --border2: rgba(255, 255, 255, 0.09);
          --green: #00ffaa;
          --green2: #00cca3;
          --green-glow: rgba(0, 255, 170, 0.15);
          --red: #ff3c74;
          --gold: #f5b72e;
          --blue: #0ea5e9;
          --text: #94a3b8;
          --text-dim: #475569;
          --text-bright: #f8fafc;
          background: var(--black);
          color: var(--text);
          position: relative;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Ensure all structural sections sit nicely on top of our fixed decorative animation canvas background */
        .landing-page-wrapper nav,
        .landing-page-wrapper section,
        .landing-page-wrapper footer {
          position: relative;
          z-index: 2;
        }

        .landing-page-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0, 255, 170, 0.007) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 170, 0.007) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .landing-page-wrapper nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 300;
          height: 80px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(3, 6, 17, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
        }

        .landing-page-wrapper .nav-logo {
          transition: transform 0.25s ease;
        }
        .landing-page-wrapper .nav-logo:hover {
          transform: scale(1.02);
        }

        .landing-page-wrapper .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
          list-style: none;
        }
        .landing-page-wrapper .nav-links a {
          color: var(--text);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
          position: relative;
        }
        .landing-page-wrapper .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: var(--green);
          transition: width 0.2s ease;
        }
        .landing-page-wrapper .nav-links a:hover { 
          color: var(--text-bright); 
        }
        .landing-page-wrapper .nav-links a:hover::after {
          width: 100%;
        }

        .landing-page-wrapper .nav-cta {
          background: linear-gradient(135deg, var(--green) 0%, #00ffca 100%);
          color: #01040a !important;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 700 !important;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-size: 0.75rem !important;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px -5px rgba(0, 255, 170, 0.3);
          cursor: pointer;
        }
        .landing-page-wrapper .nav-cta:hover { 
          background: linear-gradient(135deg, #00ffca 0%, var(--green) 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px -3px rgba(0, 255, 170, 0.45);
        }

        .landing-page-wrapper .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .landing-page-wrapper .nav-hamburger:hover {
          background: rgba(255,255,255,0.06);
          border-color: var(--border2);
        }
        .landing-page-wrapper .nav-hamburger .bar {
          width: 20px;
          height: 2px;
          background: var(--text-bright);
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .landing-page-wrapper .nav-hamburger.open .bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .landing-page-wrapper .nav-hamburger.open .bar:nth-child(2) { opacity: 0; }
        .landing-page-wrapper .nav-hamburger.open .bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        
        .landing-page-wrapper .nav-mobile-menu {
          display: block;
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          background: rgba(3, 6, 17, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          z-index: 290;
          padding: 0;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s ease;
        }
        .landing-page-wrapper .nav-mobile-menu.open {
          max-height: 320px;
          padding: 20px 24px 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .landing-page-wrapper .nav-mobile-menu ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .landing-page-wrapper .nav-mobile-menu ul a {
          display: block;
          color: var(--text);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: all 0.2s ease;
        }
        .landing-page-wrapper .nav-mobile-menu ul a:hover { 
          color: var(--text-bright); 
          padding-left: 6px;
        }
        .landing-page-wrapper .nav-mobile-cta {
          display: block;
          margin-top: 20px;
          text-align: center;
          background: linear-gradient(135deg, var(--green) 0%, #00ffca 100%);
          color: #01040a !important;
          font-weight: 800;
          font-size: 14px;
          padding: 14px;
          border-radius: 8px;
          text-decoration: none;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          border: none;
          cursor: pointer;
        }

        .landing-page-wrapper .hero {
          position: relative;
          z-index: 50;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 40px 60px;
          overflow: hidden;
        }

        .landing-page-wrapper .hero-bottom-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 400px;
          background: linear-gradient(to bottom, transparent 0%, rgba(3, 6, 17, 0.4) 40%, var(--black) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .landing-page-wrapper .hero-glow {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(0, 255, 170, 0.05) 0%, transparent 65%);
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .landing-page-wrapper .hero-content {
          max-width: 950px;
          text-align: center;
          position: relative;
          z-index: 5;
        }

        .landing-page-wrapper .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 255, 170, 0.05);
          border: 1px solid rgba(0, 255, 170, 0.16);
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 0.72rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--green);
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          backdrop-filter: blur(8px);
        }

        .landing-page-wrapper .hero-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .landing-page-wrapper .hero h1 {
          font-family: 'Outfit', -apple-system, sans-serif;
          font-size: clamp(3rem, 7.5vw, 5.8rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #ffffff 40%, #8ca3bf 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
        }

        .landing-page-wrapper .hero h1 .accent {
          background: linear-gradient(135deg, #00ffaa 0%, #00ffcb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--green);
        }

        .landing-page-wrapper .hero h1 .outline {
          -webkit-text-stroke: 1.5px rgba(248, 250, 252, 0.85);
          color: transparent;
          letter-spacing: -1px;
        }

        .landing-page-wrapper .hero h1 .solid-white {
          background: none !important;
          -webkit-background-clip: initial !important;
          -webkit-text-fill-color: #ffffff !important;
          color: #ffffff !important;
          -webkit-text-stroke: unset !important;
        }

        .landing-page-wrapper .hero-sub {
          font-size: clamp(0.95rem, 1.8vw, 1.15rem);
          color: #94a3b8;
          font-weight: 400;
          line-height: 1.65;
          max-width: 680px;
          margin: 28px auto 44px;
        }

        .landing-page-wrapper .hero-sub strong { 
          color: var(--text-bright); 
          font-weight: 600; 
        }

        .landing-page-wrapper .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .landing-page-wrapper .btn-primary {
          background: linear-gradient(135deg, var(--green) 0%, #00ffca 100%);
          color: #01040a;
          padding: 16px 36px;
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 24px -5px rgba(0, 255, 170, 0.4);
        }
        .landing-page-wrapper .btn-primary:hover { 
          background: linear-gradient(135deg, #00ffca 0%, var(--green) 100%);
          transform: translateY(-2px); 
          box-shadow: 0 8px 30px -3px rgba(0, 255, 170, 0.55);
        }

        .landing-page-wrapper .btn-secondary {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-bright);
          padding: 16px 36px;
          border-radius: 8px;
          border: 1px solid var(--border2);
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }
        .landing-page-wrapper .btn-secondary:hover { 
          border-color: rgba(0, 255, 170, 0.4); 
          color: var(--green); 
          background: rgba(0, 255, 170, 0.04);
          transform: translateY(-1px);
        }

        .landing-page-wrapper .stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 900px;
          margin: 80px auto 0;
          border: none;
        }

        .landing-page-wrapper .stat-item {
          background: linear-gradient(145deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.002) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 24px 16px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .landing-page-wrapper .stat-item:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 255, 170, 0.15);
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%);
          box-shadow: 0 10px 30px -15px rgba(0, 255, 170, 0.1);
        }

        .landing-page-wrapper .stat-num {
          font-family: 'Outfit', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -1px;
          color: var(--text-bright);
          display: block;
          line-height: 1.2;
        }
        .landing-page-wrapper .stat-item:first-child .stat-num,
        .landing-page-wrapper .stat-item:nth-child(2) .stat-num {
          background: linear-gradient(135deg, #10b981, #00ffaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .landing-page-wrapper .stat-label {
          font-size: 0.72rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 6px;
          display: block;
        }

        .landing-page-wrapper .ticker {
          background: rgba(3, 6, 17, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          border-top: 1px solid var(--border);
          padding: 14px 0;
          overflow: hidden;
          position: relative;
          z-index: 100;
        }

        @keyframes scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        .landing-page-wrapper .ticker-track {
          display: flex;
          animation: scroll 35s linear infinite;
          width: max-content;
        }

        .landing-page-wrapper .ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-right: 56px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .landing-page-wrapper .ticker-pair { color: var(--text-bright); font-weight: 700; }
        .landing-page-wrapper .ticker-price { color: #adc6e6; }
        .landing-page-wrapper .ticker-change-up { color: #10b981; font-weight: 600; }
        .landing-page-wrapper .ticker-change-down { color: var(--red); font-weight: 600; }

        .landing-page-wrapper section { position: relative; z-index: 1; }

        .landing-page-wrapper .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .landing-page-wrapper .how-it-works {
          padding: 80px 0;
        }

        .landing-page-wrapper .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: var(--green);
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: inline-block;
        }

        .landing-page-wrapper .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.4rem);
          font-weight: 800;
          letter-spacing: -1.5px;
          color: var(--text-bright);
          line-height: 1.15;
          margin-bottom: 20px;
        }

        .landing-page-wrapper .section-sub {
          font-size: 1.05rem;
          color: #94a3b8;
          font-weight: 400;
          max-width: 580px;
          line-height: 1.65;
        }

        .landing-page-wrapper .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
          background: transparent;
        }

        .landing-page-wrapper .step-card {
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.4) 0%, rgba(3, 6, 17, 0.2) 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          padding: 48px 36px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .landing-page-wrapper .step-card:hover { 
          transform: translateY(-6px);
          border-color: rgba(0, 255, 170, 0.2);
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.6) 0%, rgba(3, 6, 17, 0.3) 100%);
          box-shadow: 0 15px 35px -15px rgba(0, 255, 170, 0.15);
        }

        .landing-page-wrapper .step-num {
          font-family: 'Outfit', sans-serif;
          font-size: 5rem;
          font-weight: 900;
          background: linear-gradient(180deg, rgba(0,255,170,0.08) 0%, transparent 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
          position: absolute;
          top: 16px;
          right: 24px;
        }

        .landing-page-wrapper .step-icon {
          width: 48px;
          height: 48px;
          background: rgba(0, 255, 170, 0.07);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 24px;
          border: 1px solid rgba(0, 255, 170, 0.15);
        }

        .landing-page-wrapper .step-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-bright);
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .landing-page-wrapper .step-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.6;
          font-weight: 400;
        }

        .landing-page-wrapper .features {
          padding: 80px 0;
          background: linear-gradient(180deg, var(--black) 0%, rgba(13, 21, 42, 0.2) 50%, var(--black) 100%);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .landing-page-wrapper .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 48px;
          background: transparent;
        }

        .landing-page-wrapper .feature-card {
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.3) 0%, rgba(3, 6, 17, 0.1) 100%);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          padding: 44px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(8px);
        }
        .landing-page-wrapper .feature-card:hover { 
          transform: translateY(-4px);
          border-color: rgba(0, 255, 170, 0.18);
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.5) 0%, rgba(3, 6, 17, 0.2) 100%);
          box-shadow: 0 15px 35px -20px rgba(0, 255, 170, 0.15);
        }

        .landing-page-wrapper .feature-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--green);
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 18px;
          display: inline-block;
          background: rgba(0, 255, 170, 0.05);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .landing-page-wrapper .feature-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-bright);
          margin-bottom: 14px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .landing-page-wrapper .feature-desc {
          font-size: 0.9rem;
          color: #94a3b8;
          line-height: 1.6;
          font-weight: 400;
        }

        .landing-page-wrapper .feature-metric {
          margin-top: 28px;
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .landing-page-wrapper .metric-num {
          font-family: 'Outfit', sans-serif;
          font-size: 2.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 40%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }

        .landing-page-wrapper .metric-label {
          font-size: 0.72rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text);
          text-transform: uppercase;
        }

        .landing-page-wrapper .signal-demo { 
          padding: 80px 0; 
        }
        .landing-page-wrapper .demo-layout {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 56px;
          align-items: center;
          margin-top: 48px;
        }

        .landing-page-wrapper .demo-card {
          background: linear-gradient(135deg, rgba(13, 21, 42, 0.45) 0%, rgba(3, 6, 17, 0.3) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }

        .landing-page-wrapper .demo-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--green), transparent);
        }

        .landing-page-wrapper .signal-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          background: rgba(0, 255, 170, 0.04);
          border: 1px solid rgba(0, 255, 170, 0.12);
          padding: 6px 14px;
          border-radius: 8px;
        }

        .landing-page-wrapper .signal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 10px var(--green);
          animation: pulse 1.5s infinite;
        }

        .landing-page-wrapper .signal-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--green);
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .landing-page-wrapper .signal-action {
          font-family: 'Outfit', sans-serif;
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -1.5px;
          color: var(--green);
          line-height: 1.05;
          margin-bottom: 8px;
        }

        .landing-page-wrapper .signal-confidence {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #10b981;
          font-weight: 650;
          letter-spacing: 1.5px;
          margin-bottom: 24px;
        }

        .landing-page-wrapper .signal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .landing-page-wrapper .signal-item {
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.25s ease;
        }
        .landing-page-wrapper .signal-item:hover {
          background: rgba(13,21,42,0.3);
          border-color: rgba(255,255,255,0.06);
        }

        .landing-page-wrapper .signal-item-label {
          font-size: 0.65rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
          font-family: 'JetBrains Mono', monospace;
        }

        .landing-page-wrapper .signal-item-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          color: var(--text-bright);
          font-weight: 650;
        }

        .landing-page-wrapper .tp-value { color: #10b981 !important; }
        .landing-page-wrapper .sl-value { color: var(--red) !important; }

        .landing-page-wrapper .indicators {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .landing-page-wrapper .indicator {
          padding: 6px 12px;
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .landing-page-wrapper .indicator.pass {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
        }
        .landing-page-wrapper .indicator.fail {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          color: #475569;
        }

        .landing-page-wrapper .demo-points {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .landing-page-wrapper .demo-point {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .landing-page-wrapper .demo-point-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(0, 255, 170, 0.06);
          border: 1px solid rgba(0, 255, 170, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
          color: var(--green);
        }

        .landing-page-wrapper .demo-point-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: var(--text-bright);
          margin-bottom: 6px;
        }

        .landing-page-wrapper .demo-point-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.6;
          font-weight: 400;
        }

        .landing-page-wrapper .pricing {
          padding: 80px 0;
          background: linear-gradient(180deg, var(--black) 0%, rgba(13, 21, 42, 0.25) 50%, var(--black) 100%);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .landing-page-wrapper .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 48px;
          background: transparent;
        }

        .landing-page-wrapper .price-card {
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.4) 0%, rgba(3, 6, 17, 0.25) 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 48px 36px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .landing-page-wrapper .price-card:hover { 
          transform: translateY(-8px);
          border-color: rgba(0, 255, 170, 0.3);
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.6) 0%, rgba(3, 6, 17, 0.35) 100%);
          box-shadow: 0 20px 45px -15px rgba(0, 255, 170, 0.2);
        }
        .landing-page-wrapper .price-card.featured { 
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.7) 0%, rgba(3, 6, 17, 0.45) 100%);
          border-color: rgba(0, 255, 170, 0.4);
          box-shadow: 0 20px 45px -10px rgba(0, 255, 170, 0.15);
        }
        .landing-page-wrapper .price-card.featured::before {
          content: 'RECOMMENDED';
          position: absolute;
          top: 20px;
          right: 24px;
          background: linear-gradient(90deg, var(--green), #00ffbc);
          color: #01040a;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 4px 12px;
          border-radius: 6px;
        }

        .landing-page-wrapper .price-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--text-bright);
          margin-bottom: 12px;
        }

        .landing-page-wrapper .price-amount {
          font-family: 'Outfit', sans-serif;
          font-size: 3.2rem;
          font-weight: 950;
          letter-spacing: -1.5px;
          color: var(--text-bright);
          line-height: 1;
        }

        .landing-page-wrapper .price-period {
          font-size: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          color: #64748b;
          font-weight: 600;
          margin-top: 8px;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .landing-page-wrapper .price-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          margin-bottom: 28px;
          line-height: 1.6;
          min-height: 48px;
        }

        .landing-page-wrapper .price-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 36px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 24px;
        }

        .landing-page-wrapper .price-features li {
          font-size: 0.88rem;
          color: #e2e8f0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          line-height: 1.4;
        }

        .landing-page-wrapper .price-features li::before {
          content: '✓';
          color: var(--green);
          font-weight: 700;
          flex-shrink: 0;
          font-size: 0.95rem;
        }

        .landing-page-wrapper .price-features li.dim::before { color: #334155; content: '—'; }
        .landing-page-wrapper .price-features li.dim { color: #475569; }

        .landing-page-wrapper .price-btn {
          width: 100%;
          padding: 16px;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          text-decoration: none;
          display: block;
          text-align: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .landing-page-wrapper .price-btn-outline {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-bright);
          border: 1px solid var(--border2);
        }
        .landing-page-wrapper .price-btn-outline:hover { 
          border-color: rgba(0, 255, 170, 0.3);
          color: var(--green);
          background: rgba(0, 255, 170, 0.03);
        }

        .landing-page-wrapper .price-btn-solid {
          background: linear-gradient(135deg, var(--green) 0%, #00ffca 100%);
          color: #01040a;
          box-shadow: 0 4px 18px rgba(0, 255, 170, 0.35);
        }
        .landing-page-wrapper .price-btn-solid:hover { 
          background: linear-gradient(135deg, #00ffca 0%, var(--green) 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0, 255, 170, 0.55);
        }

        .landing-page-wrapper .testimonials { 
          padding: 80px 0; 
        }
        .landing-page-wrapper .testi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
          background: transparent;
        }

        .landing-page-wrapper .testi-card {
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.4) 0%, rgba(3, 6, 17, 0.25) 100%);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 40px 36px;
          backdrop-filter: blur(8px);
          transition: border-color 0.3s;
        }
        .landing-page-wrapper .testi-card:hover {
          border-color: rgba(0, 255, 170, 0.12);
        }

        .landing-page-wrapper .testi-stars {
          color: #fbbf24;
          font-size: 0.85rem;
          letter-spacing: 3px;
          margin-bottom: 20px;
        }

        .landing-page-wrapper .testi-text {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.65;
          font-weight: 400;
          font-style: italic;
          margin-bottom: 28px;
        }

        .landing-page-wrapper .testi-author {
          display: flex;
          align-items: center;
          gap: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 20px;
        }

        .landing-page-wrapper .testi-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0, 255, 170, 0.05);
          border: 1px solid rgba(0, 255, 170, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .landing-page-wrapper .testi-name {
          font-size: 0.9rem;
          color: var(--text-bright);
          font-weight: 650;
        }

        .landing-page-wrapper .testi-role {
          font-size: 0.72rem;
          color: #64748b;
          font-family: 'JetBrains Mono', monospace;
          margin-top: 2px;
        }

        /* FAQ SECTION STYLES */
        .landing-page-wrapper .faq-section {
          padding: 80px 0;
          background: transparent;
        }
        .landing-page-wrapper .faq-container {
          max-width: 800px;
          margin: 48px auto 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .landing-page-wrapper .faq-item {
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.4) 0%, rgba(3, 6, 17, 0.25) 100%);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.3s, background 0.3s;
          cursor: pointer;
        }
        .landing-page-wrapper .faq-item:hover {
          border-color: rgba(0, 255, 170, 0.12);
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.45) 0%, rgba(3, 6, 17, 0.3) 100%);
        }
        .landing-page-wrapper .faq-item.active {
          border-color: rgba(0, 255, 170, 0.25);
          background: linear-gradient(145deg, rgba(13, 21, 42, 0.5) 0%, rgba(3, 6, 17, 0.3) 100%);
        }
        .landing-page-wrapper .faq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          user-select: none;
        }
        .landing-page-wrapper .faq-question {
          font-family: 'Outfit', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-bright);
        }
        .landing-page-wrapper .faq-icon {
          color: var(--green);
          font-size: 1.15rem;
          transition: transform 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .landing-page-wrapper .faq-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          padding: 0 28px;
        }
        .landing-page-wrapper .faq-item.active .faq-content {
          padding-bottom: 24px;
        }
        .landing-page-wrapper .faq-answer {
          font-size: 0.92rem;
          color: #94a3b8;
          line-height: 1.6;
        }

        .landing-page-wrapper .cta-section {
          padding: 100px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .landing-page-wrapper .cta-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(0, 255, 170, 0.06) 0%, transparent 65%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .landing-page-wrapper .cta-section h2 {
          font-family: 'Outfit', -apple-system, sans-serif;
          font-size: clamp(2.5rem, 6vw, 4.8rem);
          font-weight: 900;
          letter-spacing: -2px;
          color: var(--text-bright);
          line-height: 1.1;
          margin-bottom: 24px;
        }
        .landing-page-wrapper .cta-section h2 span { 
          background: linear-gradient(135deg, var(--green) 0%, #00ffca 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--green); 
        }

        .landing-page-wrapper .cta-section p {
          font-size: 1.05rem;
          color: #94a3b8;
          font-weight: 400;
          margin-bottom: 44px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.65;
        }

        .landing-page-wrapper .cta-note {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.25);
          margin-top: 20px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 1px;
        }

        .landing-page-wrapper footer {
          border-top: 1px solid var(--border);
          padding: 64px 40px 48px;
          background: #02040c;
        }

        .landing-page-wrapper .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
        }

        .landing-page-wrapper .footer-logo {
          transition: transform 0.2s ease;
        }

        .landing-page-wrapper .footer-links {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          gap: 32px;
          list-style: none;
          align-items: center;
          text-align: center;
        }
        .landing-page-wrapper .footer-links a {
          font-size: 0.85rem;
          color: #475569;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .landing-page-wrapper .footer-links a:hover { 
          color: var(--text-bright); 
        }

        .landing-page-wrapper .footer-copy {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.15);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
          width: 100%;
          text-align: center;
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.02);
        }

        @media (max-width: 768px) {
          .landing-page-wrapper nav { height: 80px; padding: 0 24px; }
          .landing-page-wrapper .nav-hamburger { display: flex; }
          .landing-page-wrapper .nav-links { display: none; }
          .landing-page-wrapper .hero { padding: 100px 24px 60px; }
          .landing-page-wrapper .container { padding: 0 24px; }
          .landing-page-wrapper .steps-grid, 
          .landing-page-wrapper .features-grid, 
          .landing-page-wrapper .pricing-grid, 
          .landing-page-wrapper .testi-grid { grid-template-columns: 1fr; gap: 20px; }
          .landing-page-wrapper .demo-layout { grid-template-columns: 1fr; gap: 40px; }
          .landing-page-wrapper .stats-strip { grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 60px; }
          .landing-page-wrapper .stat-item { padding: 20px 12px; }
          .landing-page-wrapper footer { padding: 48px 24px 32px; }
          .landing-page-wrapper .footer-inner { flex-direction: column; align-items: center; gap: 16px; text-align: center; }
          .landing-page-wrapper .footer-links { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 16px; align-items: center; }
        }

        /* SCROLL REVEAL CLASS COUPLING */
        .landing-page-wrapper .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .landing-page-wrapper .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      ` }} />

      {/* NAV CONTAINER */}
      <nav>
        <div className="nav-logo flex items-center gap-2">
          <img 
            src="https://res.cloudinary.com/dbckdslrw/image/upload/v1777721734/Vyora_20260502_110933_0000_2_tz8a1k.jpg" 
            alt="Vyora" 
            className="h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <ul className="nav-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><button onClick={onLogin} className="nav-cta border-none outline-none">Mulai Gratis</button></li>
        </ul>

        <div className="flex items-center gap-2">
          <div className="flex">
            <button 
              onClick={() => setLang("id")} 
              className="font-sans text-[10px] font-bold py-1 px-2.5 rounded-l border border-slate-700/80 cursor-pointer"
              style={{
                background: lang === "id" ? "rgba(0,255,136,0.15)" : "transparent",
                color: lang === "id" ? "#00ff88" : "#445566",
                borderColor: lang === "id" ? "#00ff88" : "var(--border2)"
              }}
            >
              ID
            </button>
            <button 
              onClick={() => setLang("en")} 
              className="font-sans text-[10px] font-bold py-1 px-2.5 rounded-r border-t border-b border-r border-slate-700/80 cursor-pointer"
              style={{
                background: lang === "en" ? "rgba(0,255,136,0.15)" : "transparent",
                color: lang === "en" ? "#00ff88" : "#445566",
                borderColor: lang === "en" ? "#00ff88" : "var(--border2)"
              }}
            >
              EN
            </button>
          </div>

          <button 
            className={`nav-hamburger ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            aria-label="Toggle menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU PANEL */}
      <div className={`nav-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <ul>
          <li><a href="#how" onClick={() => setMobileMenuOpen(false)} className="mobile-link">How It Works</a></li>
          <li><a href="#features" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Features</a></li>
          <li><a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Pricing</a></li>
        </ul>
        <button onClick={onLogin} className="nav-mobile-cta w-full border-none outline-none">🚀 Mulai Gratis</button>
      </div>

      {/* LIVE MARKET HORIZONTAL COIN TICKER */}
      <div className="ticker md:mt-[80px] mt-[72px]">
        <div className="ticker-track">
          {(Object.entries(tickerItems) as [string, { price: string; change: string; isPositive: boolean }][]).map(([symbol, item]) => (
            <div key={symbol} className="ticker-item">
              <span className="ticker-pair">{symbol}</span>
              <span className="ticker-price">{item.price}</span>
              <span className={item.isPositive ? "ticker-change-up" : "ticker-change-down"}>{item.change}</span>
            </div>
          ))}
          {/* Double map for non-breaking seamless slide loop */}
          {(Object.entries(tickerItems) as [string, { price: string; change: string; isPositive: boolean }][]).map(([symbol, item]) => (
            <div key={`${symbol}-dup`} className="ticker-item">
              <span className="ticker-pair">{symbol}</span>
              <span className="ticker-price">{item.price}</span>
              <span className={item.isPositive ? "ticker-change-up" : "ticker-change-down"}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO HERO HERO */}
      <section className="hero">
        {/* LOCAL BACKGROUND CANVAS SEGMENTS WHICH SCROLL NATURALLY */}
        <canvas ref={lineCanvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", opacity: 0.4 }}></canvas>
        <canvas ref={dotCanvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}></canvas>

        <div className="hero-bottom-fade"></div>
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">INTELLIGENT CRYPTO TRADING</div>
          <h1>{t["hero-h1"]}</h1>
          <p className="hero-sub">{t["hero-sub"]}</p>
          <div className="hero-actions">
            <button onClick={onRegister} className="btn-primary border-none outline-none">{t["hero-btn1"]}</button>
            <a href="#how" className="btn-secondary flex items-center justify-center">{t["hero-btn2"]}</a>
          </div>
          <div className="stats-strip">
            <div className="stat-item">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Bot Aktif</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">61%+</span>
              <span className="stat-label">Win Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">3%</span>
              <span className="stat-label">Take Profit</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">47</span>
              <span className="stat-label">Trades Bulan Ini</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works" id="how">
        <div className="container">
          <div className="reveal">
            <div className="section-label">{t["how-label"]}</div>
            <h2 className="section-title text-slate-100">{lang === "id" ? "3 LANGKAH" : "3 STEPS"}<br />{lang === "id" ? "MULAI PROFIT" : "TO START EARNING"}</h2>
            <p className="section-sub">{t["how-sub"]}</p>
          </div>
          <div className="steps-grid reveal">
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-icon">🔐</div>
              <h3 className="step-title">{lang === "id" ? "Daftar & Connect" : "Register & Connect"}</h3>
              <p className="step-desc">
                {lang === "id" 
                  ? "Buat akun Vyora dalam 60 detik. Hubungkan akun Binance kamu via API key read-only — dana tetap aman di exchange kamu."
                  : "Create a Vyora account in 60 seconds. Connect your Binance account via read-only API keys — funds remain stored on your exchange."}
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-icon">⚙️</div>
              <h3 className="step-title">{lang === "id" ? "Set Strategi" : "Set Strategy"}</h3>
              <p className="step-desc">
                {lang === "id"
                  ? "Pilih pair trading, set modal, dan tentukan risk tolerance. AI kami akan otomatis kalibrasi strategi EMA + RSI + Volume terbaik."
                  : "Choose trading pairs, allocate capital, and specify risk thresholds. Our AI automatically calibrates complex EMA + RSI + Volume strategies."}
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-icon">💰</div>
              <h3 className="step-title">{lang === "id" ? "Kumpulkan Profit" : "Collect Profit"}</h3>
              <p className="step-desc">
                {lang === "id"
                  ? "Bot bekerja 24/7. Pantau performance real-time di dashboard. Withdraw kapan saja langsung dari Binance kamu."
                  : "Bots run 24/7. Track performance real-time via the active console. Withdraw instantly at any time from your Binance wallet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ALL FEATURES HIGHLIGHTS SECTION */}
      <section className="features" id="features">
        <div className="container">
          <div className="reveal">
            <div className="section-label">// Features</div>
            <h2 className="section-title text-slate-100">
              {lang === "id" ? "SEMUA YANG" : "EVERYTHING"}<br />{lang === "id" ? "KAMU BUTUHKAN" : "YOU NEED"}
            </h2>
            <p className="section-sub">
              {lang === "id" ? "Platform lengkap dari sinyal hingga eksekusi otomatis." : "Comprehensive ecosystem spanning signals, AI insights and auto execution."}
            </p>
          </div>
          <div className="features-grid reveal">
            <div className="feature-card">
              <div className="feature-tag">// AI Engine</div>
              <h3 className="feature-title">{lang === "id" ? "SINYAL TRADING\nAKURASI TINGGI" : "HIGH PRECISION\nTRADING SIGNALS"}</h3>
              <p className="feature-desc">
                {lang === "id"
                  ? "Model AI kami memproses 200+ indikator teknikal secara real-time untuk menghasilkan sinyal BUY/SELL dengan confidence score."
                  : "Our analytical AI models scan over 200 technical indicators in real-time to compute premium BUY/SELL signals."}
              </p>
              <div className="feature-metric">
                <span className="metric-num">71%</span>
                <span className="metric-label">Avg. Confidence Score</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-tag">// Auto Bot</div>
              <h3 className="feature-title">{lang === "id" ? "BOT OTOMATIS\n24/7 NON-STOP" : "AUTOMATED BOTS\n24/7 RUNNING"}</h3>
              <p className="feature-desc">
                {lang === "id"
                  ? "Auto entry, auto TP/SL, auto compounding. Bot berjalan di server kami — tidak perlu PC menyala atau internet stabil."
                  : "Automatic entry, trailing take-profit, instant circuit breakers. Bot runs persistently on Singapore VPS servers."}
              </p>
              <div className="feature-metric">
                <span className="metric-num">99.9%</span>
                <span className="metric-label">Bot Uptime</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-tag">// Risk Management</div>
              <h3 className="feature-title">{lang === "id" ? "PROTEKSI MODAL\nOTOMATIS" : "AUTOMATED FUNDS\nPROTECTION"}</h3>
              <p className="feature-desc">
                {lang === "id"
                  ? "Stop loss otomatis, trailing TP, dan circuit breaker melindungi modal kamu dari volatilitas ekstrem dan flash crash."
                  : "Rigid stop-losses, trailing profit parameters, and custom margin thresholds block extreme liquidity volatility."}
              </p>
              <div className="feature-metric">
                <span className="metric-num">1.5%</span>
                <span className="metric-label">Max Stop Loss Per Trade</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-tag">// AI Advisor</div>
              <h3 className="feature-title">{lang === "id" ? "AI CHAT\nADVISOR" : "PREMIUM AI CHAT\nPORTAL"}</h3>
              <p className="feature-desc">
                {lang === "id"
                  ? "Tanya apapun tentang pasar, strategi, atau posisi kamu ke AI advisor kami. Seperti punya analyst pribadi yang tersedia 24/7."
                  : "Inquire about global structures, trend breakouts, or parameters 24/7. Your virtual trading analyst is always active."}
              </p>
              <div className="feature-metric">
                <span className="metric-num">Gemini 3.5 Flash</span>
                <span className="metric-label">Powered by Google AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SIGNAL DEMO GRID */}
      <section className="signal-demo">
        <div className="container">
          <div className="demo-layout">
            <div className="reveal">
              <div className="demo-card">
                <div className="signal-badge">
                  <div className="signal-dot"></div>
                  <span className="signal-label">AI Signal · BTC/USDT · Live</span>
                </div>
                <div className="signal-action">BUY</div>
                <div className="signal-confidence">HIGH CONFIDENCE · {demoRsi > "50" ? "74%" : "68%"}</div>
                
                <div className="signal-grid">
                  <div className="signal-item">
                    <div className="signal-item-label">{lang === "id" ? "Harga BTC" : "BTC Price"}</div>
                    <div className="signal-item-value">{demoPrice}</div>
                  </div>
                  <div className="signal-item">
                    <div className="signal-item-label">RSI (14)</div>
                    <div className="signal-item-value text-amber-500">{demoRsi}</div>
                  </div>
                  <div className="signal-item">
                    <div className="signal-item-label">Take Profit</div>
                    <div className="signal-item-value tp-value">{demoTp}</div>
                  </div>
                  <div className="signal-item">
                    <div className="signal-item-label">Stop Loss</div>
                    <div className="signal-item-value sl-value">{demoSl}</div>
                  </div>
                </div>

                <div className="indicators">
                  <span className="indicator pass">EMA ✓</span>
                  <span className="indicator pass">RSI ✓</span>
                  <span className="indicator fail">VOL ✗</span>
                  <span className="indicator pass">MA200 ✓</span>
                </div>

                <div className="mt-4 p-2 bg-white/5 border border-slate-850 rounded text-[9px] text-slate-500 uppercase text-center tracking-wider">
                  ⚠️ DEMO SIGNAL · BUKAN REKOMENDASI INVESTASI · SELALU LAKUKAN RISET SENDIRI
                </div>
              </div>
            </div>

            <div className="demo-points reveal">
              <div className="section-label">// Real-time Signals</div>
              <h2 className="section-title text-slate-100" style={{ fontSize: "2.5rem" }}>
                {lang === "id" ? "SINYAL AKURAT," : "ACCURATE SIGNALS,"}<br />{lang === "id" ? "EKSEKUSI CEPAT" : "HIGH-SPEED EXECUTION"}
              </h2>
              <div className="demo-point">
                <div className="demo-point-icon">⚡</div>
                <div>
                  <h4 className="demo-point-title">Eksekusi &lt; 100ms</h4>
                  <p className="demo-point-desc">
                    {lang === "id"
                      ? "Bot mengeksekusi order dalam milidetik setelah sinyal terkonfirmasi — lebih cepat dari trader manual manapun."
                      : "The bot fires trades in milliseconds once validation triggers — far outperforming any human response."}
                  </p>
                </div>
              </div>
              <div className="demo-point">
                <div className="demo-point-icon">🧠</div>
                <div>
                  <h4 className="demo-point-title">Multi-indikator Analysis</h4>
                  <p className="demo-point-desc">
                    {lang === "id"
                      ? "EMA, RSI, Volume, MA200 dianalisa bersamaan. Sinyal hanya dieksekusi jika minimal 3 dari 4 indikator konfirmasi."
                      : "Joint scanning of EMA, RSI, Volume patterns and MA200 levels. Signal is rejected unless 3 criteria align."}
                  </p>
                </div>
              </div>
              <div className="demo-point">
                <div className="demo-point-icon">📱</div>
                <div>
                  <h4 className="demo-point-title">Notifikasi Real-time</h4>
                  <p className="demo-point-desc">
                    {lang === "id"
                      ? "Dapat notifikasi setiap order masuk, TP tercapai, atau SL triggered langsung ke WhatsApp/Telegram kamu."
                      : "Receive instant triggers when order entries execute, TP/SL gets locked, or stop-losses clear."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS GRID */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="reveal text-center">
            <div className="section-label">// Pricing</div>
            <h2 className="section-title text-slate-100">
              {lang === "id" ? "PILIH PAKET" : "CHOOSE YOUR"}<br />{lang === "id" ? "YANG TEPAT" : "DEDICATED PLAN"}
            </h2>
            <p className="section-sub mx-auto">
              {lang === "id" ? "Mulai gratis 7 hari. Tidak perlu kartu kredit." : "Start your 7-day free trial. No credit cards needed."}
            </p>
          </div>

          <div className="pricing-grid reveal">
            {/* RETAIL TRIAL BLOCK */}
            <div className="price-card">
              <div>
                <div className="price-name text-slate-400">
                  {lang === "id" ? "RETAIL TRIAL BLOCK" : "RETAIL TRIAL BLOCK"}
                </div>
                <div className="price-amount">$0</div>
                <div className="price-period">
                  {lang === "id" ? "UJI COBA MAKSIMAL" : "RETAIL FREE TRIAL"}
                </div>
                <p className="price-desc font-sans text-xs">
                  {lang === "id" 
                    ? "Tinjauan strategi perdagangan paling pas untuk pehobi ritel kuantitatif yang menguji indikator secara manual."
                    : "Perfect overview space for retail quantitative hobbyists testing indicators manually."}
                </p>
                <ul className="price-features">
                  <li>
                    <span>{lang === "id" ? "Ticker harga token real-time" : "Realtime token pricing tickers"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Sinyal persilangan EMA standar" : "Standard EMA crossover signals"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Penguncian parameter kuantitatif manual" : "Manual parameter locking"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Penyimpanan status memori terbatas" : "Limited in-memory state preservation"}</span>
                  </li>
                  <li className="dim">
                    <span>{lang === "id" ? "Audit teknikal Gemini 3.5 tanpa batasan" : "Uncapped Gemini 3.5 technical audits"}</span>
                  </li>
                  <li className="dim">
                    <span>{lang === "id" ? "Integrasi bot otomatis Binance" : "Binance broker API hooks"}</span>
                  </li>
                </ul>
              </div>
              <button onClick={onLogin} className="price-btn price-btn-outline mt-4 outline-none">
                {lang === "id" ? "Mulai Gratis" : "Start For Free"}
              </button>
            </div>

            {/* ALPHA QUANT PREMIUM */}
            <div className="price-card featured">
              <div>
                <div className="price-name text-emerald-400">
                  {lang === "id" ? "ALPHA QUANT PREMIUM" : "ALPHA QUANT PREMIUM"}
                </div>
                <div className="price-amount text-slate-100">$29</div>
                <div className="price-period">
                  {lang === "id" ? "per bulan" : "per month"}
                </div>
                <p className="price-desc font-sans text-xs">
                  {lang === "id" 
                    ? "Tingkatkan latensi eksekusi persilangan bursa lebih tinggi yang didukung oleh analisis teknikal mendalam AI Gemini."
                    : "Improves execution latency with high-frequency Gemini deep analyses enabled."}
                </p>
                <ul className="price-features">
                  <li>
                    <span className="text-emerald-400">
                      {lang === "id" ? "Audit teknikal Gemini 3.5 tanpa batasan" : "Uncapped Gemini 3.5 technical audits"}
                    </span>
                  </li>
                  <li>
                    <span className="text-emerald-400">
                      {lang === "id" ? "Siklus interval trading bot penuh otomatis" : "Full-auto bot cycle trades interval"}
                    </span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Indeks scalping divergensi MACD canggih" : "Advanced MACD divergence scalping index"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Dukungan Telegram webhook alert" : "Telegram webhook alert support"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Termasuk semua fitur Trial" : "All Trial features included"}</span>
                  </li>
                  <li className="dim">
                    <span>{lang === "id" ? "Integrasi strategi trading kustom" : "Custom strategy integrations"}</span>
                  </li>
                </ul>
              </div>
              <button onClick={onLogin} className="price-btn price-btn-solid mt-4 border-none outline-none">
                {lang === "id" ? "Upgrade ke Pro ⚡" : "Upgrade to Pro ⚡"}
              </button>
            </div>

            {/* HEDGE FUND ELITE */}
            <div className="price-card">
              <div>
                <div className="price-name text-slate-400">
                  {lang === "id" ? "HEDGE FUND ELITE" : "HEDGE FUND ELITE"}
                </div>
                <div className="price-amount">$199</div>
                <div className="price-period">
                  {lang === "id" ? "per bulan" : "per month"}
                </div>
                <p className="price-desc font-sans text-xs">
                  {lang === "id"
                    ? "Kapasitas bursa perdagangan level institusi tangguh dengan kanal prioritas API latensi super rendah."
                    : "Maximum capability block with priority API channels and low latency configurations."}
                </p>
                <ul className="price-features">
                  <li>
                    <span>{lang === "id" ? "Prioritas token penasihat Gemini AI" : "Priority Gemini quant advisor token limit"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Integrasi algoritma strategi perdagangan kustom" : "Custom strategy integrations"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Hubungan koneksi bursa API Binance Broker" : "Binance broker API hooks"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Ruang cloud sandbox terdedikasi" : "Dedicated cloud sandboxed runs"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Termasuk semua fitur Premium" : "All Premium features included"}</span>
                  </li>
                  <li>
                    <span>{lang === "id" ? "Dukungan VIP khusus 24/7" : "Priority 24/7 VIP Support"}</span>
                  </li>
                </ul>
              </div>
              <button onClick={onLogin} className="price-btn price-btn-outline mt-4 outline-none">
                {lang === "id" ? "Mulai Elite" : "Get Elite Now"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="reveal text-center mb-12">
            <div className="section-label">// Testimonials</div>
            <h2 className="section-title text-slate-100">
              {lang === "id" ? "APA KATA" : "WHAT THEY"}<br />{lang === "id" ? "MEREKA" : "ARE SAYING"}
            </h2>
          </div>
          <div className="testi-grid reveal">
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Udah 3 bulan pakai Vyora Pro. Bot-nya konsisten profit tiap minggu. Setup-nya gampang banget, cocok buat yang sibuk kayak saya."</p>
              <div className="testi-author">
                <div className="testi-avatar">👨</div>
                <div>
                  <h5 className="testi-name">Rizky A.</h5>
                  <span className="testi-role">Pengusaha · Jakarta</span>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"Sinyal-nya akurat dan bot langsung eksekusi otomatis. Profit bulan pertama udah nutup biaya langganan 3x lipat. Worth banget!"</p>
              <div className="testi-author">
                <div className="testi-avatar">👩</div>
                <div>
                  <h5 className="testi-name">Sari M.</h5>
                  <span className="testi-role">Freelancer · Bali</span>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">★★★★☆</div>
              <p className="testi-text">"AI Advisor-nya berguna banget buat belajar analisa. Dashboard-nya clean dan informatif. Highly recommended buat pemula crypto."</p>
              <div className="testi-author">
                <div className="testi-avatar">👨</div>
                <div>
                  <h5 className="testi-name">Doni P.</h5>
                  <span className="testi-role">Mahasiswa · Surabaya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ FAQ FAQ */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="reveal text-center mb-12">
            <div className="section-label">// FAQ</div>
            <h2 className="section-title text-slate-100">
              {lang === "id" ? "PERTANYAAN UMUM" : "FREQUENTLY ASKED QUESTIONS"}
            </h2>
          </div>
          
          <div className="faq-container reveal">
            {faqItems.map((item) => {
              const isOpen = activeFaq === item.id;
              return (
                <div 
                  key={item.id} 
                  className={`faq-item ${isOpen ? "active" : ""}`}
                  onClick={() => setActiveFaq(isOpen ? null : item.id)}
                >
                  <div className="faq-header">
                    <span className="faq-question">
                      {lang === "id" ? item.q.id : item.q.en}
                    </span>
                    <span className="faq-icon">
                      <Plus className="w-5 h-5 transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "none" }} />
                    </span>
                  </div>
                  <div className="faq-content" style={{ maxHeight: isOpen ? "200px" : "0" }}>
                    <p className="faq-answer">
                      {lang === "id" ? item.a.id : item.a.en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DYNAMIC CALL TO ACTION */}
      <section className="cta-section">
        <div className="cta-glow"></div>
        <div className="container">
          <div className="reveal">
            <h2>{lang === "id" ? <>MULAI <span className="text-emerald-400">GRATIS</span><br />HARI INI</> : <>START <span className="text-emerald-400">FREE</span><br />TODAY</>}</h2>
            <p className="text-slate-400">
              {lang === "id"
                ? "7 hari trial penuh tanpa biaya. Tidak perlu kartu kredit. Cancel kapan saja."
                : "A full 7-day test-drive of all features. No credit cards required. Cancel anytime."}
            </p>
            <button onClick={onRegister} className="btn-primary border-none outline-none" style={{ fontSize: "1rem", padding: "16px 40px" }}>
              {t["cta-btn"]}
            </button>
            <p className="cta-note">{t["cta-note"]}</p>
          </div>
        </div>
      </section>

      {/* FOOTER AREA */}
      <footer>
        <div className="footer-inner mb-6">
          <div className="footer-logo">
            <img 
              src="https://res.cloudinary.com/dbckdslrw/image/upload/v1777721734/Vyora_20260502_110933_0000_2_tz8a1k.jpg" 
              alt="Vyora" 
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <ul className="footer-links">
            <li><a href="#how">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">{lang === "id" ? "Pertanyaan Umum" : "FAQ"}</a></li>
            <li><button onClick={onLogin} className="bg-transparent border-none text-slate-500 hover:text-slate-355 cursor-pointer hover:text-slate-300">Login</button></li>
          </ul>
        </div>
        <div className="footer-inner mt-4 border-t border-slate-900/60 pt-6">
          <p className="footer-copy">© 2026 Vyora by J-CUBE  |  All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
