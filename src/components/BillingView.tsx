import { useState } from "react";
import { 
  Check, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader,
  X 
} from "lucide-react";
import { CompleteState } from "../types";

interface BillingViewProps {
  state: CompleteState;
  onUpgradePlan: (plan: string) => Promise<void>;
  lang: "id" | "en";
}

export default function BillingView({ state, onUpgradePlan, lang }: BillingViewProps) {
  const { subscription } = state;
  const [activePlan, setActivePlan] = useState(subscription.plan);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "gateway" | "success">("details");

  const plans = [
    {
      name: "trial",
      title: lang === "id" ? "Retail Trial Block" : "Retail Trial Block",
      price: "$0",
      desc: lang === "id" ? "Tinjauan khusus bagi trader ritel untuk memeriksa harga secara manual." : "Perfect overview space for retail quantitative hobbyists testing indicators manually.",
      features: lang === "id" ? [
        "Ticker Harga Token Realtime",
        "Sinyal Persilangan EMA Standar",
        "Seting Parameter Manual",
        "Penyimpanan in-memory statis yang terbatas"
      ] : [
        "Realtime token pricing tickers",
        "Standard EMA crossover signals",
        "Manual parameter locking",
        "Limited in-memory state preservation"
      ]
    },
    {
      name: "pro",
      title: lang === "id" ? "Alpha Quant Premium" : "Alpha Quant Premium",
      price: "$29",
      desc: lang === "id" ? "Trading bot full auto dengan analis dari Gemini & eksekusi cepat API." : "Improves execution latency with high-frequency Gemini deep analyses enabled.",
      features: lang === "id" ? [
        "Akses penuh Audit Teknis Gemini 3.5 Tanpa Batas",
        "Jadwal Interval Trading Siklus Bot Otomatis Penuh",
        "Sinyal Analisis Tambahan MACD Divergence",
        "Dukungan Peringatan Telegram Webhook Resmi"
      ] : [
        "Uncapped Gemini 3.5 technical audits",
        "Full-auto bot cycle trades interval",
        "Advanced MACD divergence scalping index",
        "Telegram webhook alert support"
      ]
    },
    {
      name: "institutional",
      title: lang === "id" ? "Hedge Fund Elite" : "Hedge Fund Elite",
      price: "$199",
      desc: lang === "id" ? "Prioritas utama node VPS & koneksi khusus Binance." : "Maximum capability block with priority API channels and low latency configurations.",
      features: lang === "id" ? [
        "Batasan token prioritas dari Penasihat AI Gemini Quant",
        "Integrasi Strategi Kustom sesuai permintaan",
        "Hook API Binance Broker Tanpa Potong Latensi",
        "Sandbox Cloud khusus"
      ] : [
        "Priority Gemini quant advisor tokens limit",
        "Custom strategy integrations",
        "Binance broker API hooks",
        "Dedicated cloud sandboxed runs"
      ]
    }
  ];

  const handleLaunchCheckout = (planName: string, price: string) => {
    setTargetUpgradePlan(planName);
    setTargetPrice(price);
    setPaymentStep("details");
    setIsCheckoutOpen(true);
  };

  const handleTriggerSimulatedPayment = () => {
    if (!clientEmail.trim() || !clientName.trim()) {
      alert("Please provide name and email to initialize checkout token.");
      return;
    }
    
    setPaymentStep("processing");
    setTimeout(() => {
      setPaymentStep("gateway");
    }, 1500);
  };

  const handleConfirmMockStatus = async (success: boolean) => {
    if (success) {
      setPaymentStep("processing");
      try {
        await onUpgradePlan(targetUpgradePlan);
        setActivePlan(targetUpgradePlan);
        setPaymentStep("success");
      } catch (err) {
        console.error(err);
        alert("Simulated transaction failed. Review state records.");
      }
    } else {
      setIsCheckoutOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {lang === "id" ? "Paket Berlangganan (Tingkatan)" : "Subscription Plan Tiers"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === "id" ? "Sinkronisasi parameter harga dan tingkatkan batas kuantitas inti Vyora secara instan." : "Synchronize pricing parameters and upgrade core Vyora quant bounds instantly."}
          </p>
        </div>

        {/* Plan Header status indicator */}
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/15 rounded-xl text-xs flex items-center gap-2 font-mono text-indigo-300 font-extrabold select-none">
          <Sparkles className="h-4.5 w-4.5" />
          <span>{lang === "id" ? "PAKET SAAT INI:" : "CURRENT ACTIVE PLAN:"} {activePlan.toUpperCase()} BLOCK</span>
        </div>
      </header>

      {/* Grid: 3 Plans Column cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = activePlan === p.name;
          return (
            <div 
              key={p.name} 
              className={`p-5 rounded-2xl bg-slate-900 border transition relative flex flex-col justify-between ${
                isCurrent 
                  ? "border-emerald-500 shadow-md shadow-emerald-500/5 bg-gradient-to-b from-slate-900 to-slate-950" 
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-4">
                {/* Visual Accent for current active plan */}
                {isCurrent && (
                  <span className="absolute top-4 right-4 bg-emerald-500/15 text-emerald-400 text-[9px] font-mono leading-none rounded-full px-2.5 py-1 font-bold">
                    {lang === "id" ? "DIGUNAKAN" : "IN USE"}
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 font-mono uppercase tracking-wider">
                    {p.title}
                  </h3>
                  <div className="flex items-baseline space-x-1.5 mt-2.5">
                    <span className="text-3xl font-extrabold text-slate-100 font-mono select-none">{p.price}</span>
                    <span className="text-xs text-slate-500 font-mono">/ {lang === "id" ? "Bulan USD" : "Month USD"}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed font-sans min-h-[48px]">
                    {p.desc}
                  </p>
                </div>

                <div className="border-t border-slate-800/60 pt-4 space-y-3">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-medium font-sans">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 w-full">
                {isCurrent ? (
                  <button 
                    disabled 
                    className="w-full bg-slate-800 border border-slate-750 text-slate-500 font-bold px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase font-mono select-none"
                  >
                    {lang === "id" ? "PAKET SEDANG DITERAPKAN" : "PLAN CURRENTLY ENFORCED"}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleLaunchCheckout(p.name, p.price)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.01] active:translate-y-0.5 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition cursor-pointer select-none font-sans"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>{p.price === "$0" ? (lang === "id" ? "TURUNKAN PAKET" : "DOWNGRADE PLAN") : `${lang === "id" ? "TINGKATKAN LISENSI" : "UPGRADE LICENSE"} ${p.price}`}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Midtrans Sandbox Simulated Payment Modal Overlay */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-850 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00AFEF] animate-pulse" />
                <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wider uppercase">
                  {lang === "id" ? "PENAGIHAN KOTAK PASIR SIMULASI" : "SIMULATED SANDBOX BILLING"}
                </h3>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Contents based on current Checkout Step */}
            <div className="p-5 space-y-4">
              
              {paymentStep === "details" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">{lang === "id" ? "PRODUK YANG DIKEHENDAKI" : "DESIRED PRODUCT"}</span>
                    <p className="text-xs font-semibold text-slate-200">{lang === "id" ? "Aktivasi Paket" : "Activation"} Vyora {targetUpgradePlan.toUpperCase()}</p>
                    <p className="text-sm font-bold text-slate-100 font-mono mt-1">{targetPrice} / {lang === "id" ? "bulan" : "month"}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                        {lang === "id" ? "Nama Lengkap Klien" : "Client Full Name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                        {lang === "id" ? "Alamat Email Penagihan" : "Billing Email Address"}
                      </label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerSimulatedPayment}
                    className="w-full bg-[#00AFEF] hover:bg-[#009bde] text-slate-950 font-bold text-xs uppercase py-2.5 rounded-lg select-none cursor-pointer tracking-wider"
                  >
                    {lang === "id" ? "LANJUTKAN KE SIMULASI SANDBOX MIDTRANS" : "PROCEED TO SIMULATED MIDTRANS SANDBOX"}
                  </button>
                </div>
              )}

              {paymentStep === "processing" && (
                <div className="py-12 text-center space-y-4">
                  <Loader className="h-8 w-8 text-[#00AFEF] animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{lang === "id" ? "Mengamankan Token Gerbang Pembayaran..." : "Securing Payment Gateway Tokens..."}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 select-none">{lang === "id" ? "Menghubungi saluran pembayaran tiruan Midtrans." : "Contacting Midtrans mock payment channels."}</p>
                  </div>
                </div>
              )}

              {paymentStep === "gateway" && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 border border-indigo-500/20 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
                      <span className="font-extrabold text-[#00AFEF] tracking-wider font-mono">MIDTRANS SANDBOX</span>
                      <span className="text-[11px] text-slate-400 font-mono">{targetPrice}</span>
                    </div>

                    <p className="text-xs text-slate-350 leading-relaxed font-sans">
                      {lang === "id" ? "Ini adalah halaman simulasi waktu nyata yang mewakili jendela kartu kredit/debit Indonesia aman Midtrans Anda. Klik **Otorisasi** untuk menyimulasikan penyelesaian transaksi, atau **Tolak** untuk membatalkan." : "This is a real-time simulation page representing your Midtrans secure Indonesian credit/debit card window. Click **Authorize** to mock transaction completion, or **Decline** to cancel."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <button
                      onClick={() => handleConfirmMockStatus(false)}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-400 font-bold text-xs uppercase py-2.5 rounded-lg cursor-pointer select-none"
                    >
                      {lang === "id" ? "TOLAK" : "DECLINE"}
                    </button>
                    <button
                      onClick={() => handleConfirmMockStatus(true)}
                      className="bg-[#00AFEF] hover:bg-[#009bde] text-slate-950 font-bold text-xs uppercase py-2.5 rounded-lg cursor-pointer select-none"
                    >
                      {lang === "id" ? "OTORISASI PEMBAYARAN" : "AUTHORIZE PAYMENT"}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">{lang === "id" ? "Lisensi Berhasil Ditingkatkan!" : "License Upgraded Successfully!"}</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                      {lang === "id" ? "Saluran saldo mesin Vyora Anda telah ditingkatkan ke parameter" : "Your Vyora engine balance channels have been upgraded to"} **{targetUpgradePlan.toUpperCase()}** {lang === "id" ? "segera. Semua batas kecepatan diperluas." : "parameters immediately. All rate limits are expanded."}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="bg-emerald-500 hover:bg-emerald-650 hover:bg-emerald-601 text-slate-950 font-bold text-xs uppercase px-5 py-2 rounded-lg cursor-pointer select-none font-mono"
                  >
                    {lang === "id" ? "LANJUTKAN TRADING" : "RESUME TRADING"}
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
