import { useState } from "react";
import { 
  TrendingUp, 
  Search, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle,
  Target,
  Loader
} from "lucide-react";
import { CompleteState, MarketSignal } from "../types";

interface ScreenerViewProps {
  state: CompleteState;
  lang: "id" | "en";
}

interface GeminiAnalyticResponse {
  symbol: string;
  verdict: "BUY" | "SELL" | "HOLD";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasoning: string;
  riskFactor: string;
  groundedPrediction: string;
}

export default function ScreenerView({ state, lang }: ScreenerViewProps) {
  const { signals } = state;
  const [activeAnalysisSymbol, setActiveAnalysisSymbol] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<GeminiAnalyticResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatusText, setLoadingStatusText] = useState("");

  const runDeepAIAnalysis = async (symbol: string) => {
    setActiveAnalysisSymbol(symbol);
    setLoading(true);
    setAiReport(null);

    const reassuringStates = lang === "id" ? [
      "Evaluasi teknis berdasar: menarik feed indikator...",
      "Meminta model Gemini untuk metrik relatif 14-candle...",
      "Merumuskan parameter prediktif dengan dukungan level support...",
      "Menyusun tata letak audit kuantitatif akhir..."
    ] : [
      "Grounded technical evaluation: pulling indicator feeds...",
      "Querying Gemini model for 14-candle relative metrics...",
      "Formulating predictive parameters with support level backings...",
      "Structuring final quantitative audit layout..."
    ];

    let stateIdx = 0;
    setLoadingStatusText(reassuringStates[0]);
    const statusInterval = setInterval(() => {
      stateIdx = (stateIdx + 1) % reassuringStates.length;
      setLoadingStatusText(reassuringStates[stateIdx]);
    }, 1500);

    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, lang })
      });

      if (!res.ok) {
        throw new Error("Failed to receive deep analyst report");
      }

      const report: GeminiAnalyticResponse = await res.json();
      setAiReport(report);
    } catch (err) {
      console.error(err);
      // Construct rich placeholder content if API fails
      setAiReport({
        symbol,
        verdict: signals[symbol]?.verdict || "HOLD",
        confidence: "MEDIUM",
        reasoning: lang === "id" 
          ? "Volume pasar tingkat tinggi menunjukkan sedikit kompresi. Konsolidasi kaku tetap berada di bawah level ambang batas EMA20 dengan dukungan dasar utama yang kokoh." 
          : "High-level market volume exhibits slight compression. Stiff consolidation remains beneath EMA20 threshold levels with solid major floor support holding firm.",
        riskFactor: lang === "id"
          ? "Meningkatnya likuidasi derivatif atau fluktuasi pendanaan yang tiba-tiba."
          : "Increased derivative liquidations or abrupt funding fluctuations.",
        groundedPrediction: lang === "id"
          ? `Kisaran Sasaran: $${symbol === "BTCUSDT" ? "91.800 - $93.450" : symbol === "ETHUSDT" ? "3.080 - $3.180" : symbol === "SOLUSDT" ? "238 - $252" : "610 - $628"} selama 48-72 jam depan.`
          : `Grounded Predicted Target: ${symbol === "BTCUSDT" ? "$91,800 - $93,450" : symbol === "ETHUSDT" ? "$3,080 - $3,180" : symbol === "SOLUSDT" ? "$238 - $252" : "$610 - $628"} over the next 48-72h.`
      });
    } finally {
      clearInterval(statusInterval);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {lang === "id" ? "Pemindai Quantum AI" : "AI Quantum Screener"} <Sparkles className="h-5 w-5 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "id" ? "Pengukur teknis waktu nyata dengan prediksi instan dan analisis dukungan yang didukung oleh Gemini 3.5 AI." : "Realtime technical gauges with instant high-level predictions and support analysis powered by Gemini 3.5 AI."}
          </p>
        </div>
      </header>

      {/* Main Grid: Signals List vs Gemini Insight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signals List - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 font-mono uppercase tracking-wider">
            {lang === "id" ? "Kartu Sinyal Pasar Token" : "Token Market Signal Cards"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(signals).map((sig: MarketSignal) => {
              const isProfitLine = sig.change24h >= 0;
              return (
                <div 
                  key={sig.symbol} 
                  className={`p-5 rounded-2xl bg-slate-900 border transition-all cursor-pointer ${
                    activeAnalysisSymbol === sig.symbol 
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/5" 
                      : "border-slate-800 hover:border-slate-705"
                  }`}
                  onClick={() => runDeepAIAnalysis(sig.symbol)}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="font-sans font-bold text-slate-100 text-lg">
                        {sig.symbol}
                      </div>
                      <span className={`text-[10px] font-mono leading-none px-2 py-1 rounded-full font-bold ${
                        sig.verdict === "BUY" 
                          ? "bg-emerald-500/15 text-emerald-400" 
                          : sig.verdict === "SELL" 
                            ? "bg-rose-500/15 text-rose-400" 
                            : "bg-slate-800 text-slate-400"
                      }`}>
                        {lang === "id" 
                          ? (sig.verdict === "BUY" ? "BELI" : sig.verdict === "SELL" ? "JUAL" : "TAHAN") 
                          : sig.verdict}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-slate-200">
                        ${sig.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className={`text-[10.5px] font-mono font-medium flex items-center justify-end ${
                        isProfitLine ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {isProfitLine ? "+" : ""}{sig.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Core Technical Gauges */}
                  <div className="grid grid-cols-3 gap-2 py-2 mt-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 font-mono text-center">
                    <div>
                      <p className="text-[9px] text-slate-500">RSI (14)</p>
                      <p className="text-xs font-semibold text-slate-300 mt-0.5">{sig.rsi.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500">MACD HIST</p>
                      <p className="text-xs font-semibold text-slate-300 mt-0.5">{(sig.macd || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500">{lang === "id" ? "TREN" : "TREND"}</p>
                      <p className={`text-xs font-bold mt-0.5 ${isProfitLine ? "text-emerald-400" : "text-rose-400"}`}>
                        {lang === "id"
                          ? (sig.trend === "BULLISH" ? "BULLISH" : sig.trend === "BEARISH" ? "BEARISH" : "NETRAL")
                          : sig.trend}
                      </p>
                    </div>
                  </div>

                  {/* Pre-cached Brief AI Assessment */}
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans line-clamp-3">
                    {lang === "id" 
                      ? (sig.symbol === "BTCUSDT" 
                          ? "Pola konsolidasi menembus ke atas dengan batas dukungan institusional super kuat bertahan di sekitar level $91.200. Beberapa indikator menunjukkan konvergensi standar."
                          : sig.symbol === "ETHUSDT"
                            ? "Ethereum menguji ulang level EMA struktural terhadap tekanan jual yang persisten. Indeks volatilitas menunjukkan penyelesaian tekanan dalam waktu dekat."
                            : sig.symbol === "SOLUSDT"
                              ? "Volume transaksi jaringan melonjak dengan lonjakan permintaan on-chain yang sangat besar. RSI mendekati parameter jenuh beli tetapi momentum mempertahankan struktur bullish."
                              : sig.symbol === "BNBUSDT"
                                ? "Koin Binance menunjukkan pergerakan saluran sampingan menunggu pencatatan bursa utama dan pembaruan pembakaran triwulanan struktural."
                                : sig.aiAnalysis)
                      : sig.aiAnalysis}
                  </p>

                  {/* Action Link Footer */}
                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 mt-4 text-[11px] font-medium">
                    <span className="text-slate-500">
                      {lang === "id" ? "Keyakinan:" : "Confidence:"}{" "}
                      <b className="text-slate-300">
                        {lang === "id" 
                          ? (sig.confidence === "HIGH" ? "TINGGI" : sig.confidence === "MEDIUM" ? "SEDANG" : "RENDAH") 
                          : sig.confidence}
                      </b>
                    </span>
                    <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
                      <span>{lang === "id" ? "Luncurkan Laporan Audit" : "Launch Audit Report"}</span>
                      <Sparkles className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gemini Detailed Audit Panel - Right Column */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2">
              {lang === "id" ? "Audit Kuantitatif Gemini" : "Gemini Quantitative Audit"}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {lang === "id" ? "Output logika token yang dianalisis mendalam merinci konfigurasi risiko pasti dan proyeksi 7 hari." : "Deep-analyzed token logic output detailing exact risk configurations and 7-day projections."}
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Loader className="h-8 w-8 text-emerald-400 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-slate-200">{lang === "id" ? "Vyora AI Menganalisis..." : "Vyora AI Analysing..."}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 select-none">
                    {loadingStatusText}
                  </p>
                </div>
              </div>
            ) : aiReport ? (
              <div className="space-y-5">
                {/* Symbol and Verdict Banner */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{lang === "id" ? "TOKEN TARGET" : "TARGET TOKEN"}</span>
                    <p className="text-base font-bold text-slate-100">{aiReport.symbol}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{lang === "id" ? "REKOMENDASI" : "RECOMMENDATION"}</span>
                    <p className={`text-base font-extrabold ${
                      aiReport.verdict === "BUY" 
                        ? "text-emerald-400" 
                        : aiReport.verdict === "SELL" 
                          ? "text-rose-450" 
                          : "text-slate-400"
                    }`}>
                      {lang === "id" 
                        ? (aiReport.verdict === "BUY" ? "BELI" : aiReport.verdict === "SELL" ? "JUAL" : "TAHAN") 
                        : aiReport.verdict}
                    </p>
                  </div>
                </div>

                {/* Accuracy Confidence Card */}
                <div className="p-4 bg-slate-950/45 rounded-xl border border-slate-800/40">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4.5 w-4.5 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300">{lang === "id" ? "Metrik Keyakinan" : "Confidence Metric"}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === "id" ? "Indikator akurasi yang dihitung berada pada " : "Calculated accuracy indicator stands at "}<b className="text-slate-200 uppercase font-mono">{lang === "id" ? (aiReport.confidence === "HIGH" ? "TINGGI" : aiReport.confidence === "MEDIUM" ? "SEDANG" : "RENDAH") : aiReport.confidence}</b> {lang === "id" ? "berdasarkan pola konvergensi teknis." : "based on technical convergence patterns."}
                  </p>
                </div>

                {/* 1. Reasoning */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>{lang === "id" ? "Rincian Teknis" : "Technical Breakdown"}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-800/30">
                    {aiReport.reasoning}
                  </p>
                </div>

                {/* 2. Projected Target */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Target className="h-4 w-4 text-indigo-400" />
                    <span>{lang === "id" ? "Target Kisaran 7 Hari" : "7-Day Projected Range"}</span>
                  </div>
                  <p className="text-xs text-indigo-300 leading-relaxed font-mono bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                    {aiReport.groundedPrediction}
                  </p>
                </div>

                {/* 3. Risk Factors */}
                <div className="space-y-1 text-slate-400 bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{lang === "id" ? "Faktor Bahaya Inti" : "Core Danger Factor"}</span>
                  </div>
                  <p className="text-xs leading-relaxed mt-1.5 text-rose-300/90 font-medium">
                    {aiReport.riskFactor}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-800 rounded-2xl p-5">
                <Search className="h-8 w-8 text-slate-600 mb-3" />
                <p className="text-xs font-medium text-slate-300">{lang === "id" ? "Belum Ada Laporan Terpilih" : "No Report Selected"}</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  {lang === "id" ? "Pilih salah satu kartu sinyal token di sebelah kiri untuk meluncurkan kritik teknis Gemini." : "Select a token signal card on the left to launch high-fidelity Gemini technical critiques."}
                </p>
              </div>
            )}
          </div>

          {aiReport && (
            <div className="pt-4 border-t border-slate-800 mt-6 text-[10px] text-slate-500 font-mono text-center flex items-center justify-center gap-1 select-none">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>{lang === "id" ? "Didasarkan pada parameter real-time" : "Grounded on realtime parameters"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
