// Cara penggunaan di halaman lain:
// import { PricingCard } from '@/components/PricingCard';
// import { useSubscription } from '@/hooks/useSubscription';

import { useState } from "react";
import { useSubscription } from "../hooks/useSubscription.js";
import { Check, Sparkles, Loader, Award } from "lucide-react";

export function PricingCard() {
  const {
    isPro,
    status,
    subscriptionId,
    currentPeriodEnd,
    planName,
    loading,
    startCheckout,
  } = useSubscription();

  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const monthlyVariantId = (import.meta as any).env.VITE_LS_VARIANT_MONTHLY || "";
  const yearlyVariantId = (import.meta as any).env.VITE_LS_VARIANT_YEARLY || "";

  const handlePurchase = async (variantId: string) => {
    if (!variantId) {
      alert("Error: ID Varian Lemon Squeezy tidak terkonfigurasi di environment!");
      return;
    }
    setPurchasingId(variantId);
    try {
      await startCheckout(variantId);
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasingId(null);
    }
  };

  const proFeatures = [
    "Akses Realtime Semua Signal Bot",
    "Batas Alokasi RAM VPS hingga 1024MB",
    "Komunikasi Unlocked dengan Vyora AI Advisor",
    "Analisis Teknis & Grafik Prediktif Harian",
    "Prioritas Dukungan Teknis 24/7",
    "Tanpa Batas Kuota Eksekusi Bulanan",
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-3">
        <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Memeriksa status langganan...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {isPro ? (
        <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
          {/* Subtle green pattern accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold font-mono tracking-wider text-slate-100 uppercase">
                LISENSI PRO AKTIF 🚀
              </h3>
              <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
                Akun Anda dalam status kualifikasi premium. Seluruh kontrol kustomisasi bot tingkat lanjut, analisis signal real-time, dan Vyora Obrolan cerdas telah terbuka sepenuhnya.
              </p>
            </div>

            <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-left space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono font-semibold">STATUS LANGGANAN:</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {status ? status : "Active"}
                </span>
              </div>
              
              {planName && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono font-semibold">NAMA PAKET:</span>
                  <span className="font-bold text-slate-200">
                    {planName}
                  </span>
                </div>
              )}

              {currentPeriodEnd && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono font-semibold">PERPANJANGAN BERIKUTNYA:</span>
                  <span className="font-extrabold text-[#00AFEF] font-mono">
                    {new Date(currentPeriodEnd).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {subscriptionId && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono font-semibold">ID SUBSCRIPTION:</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {subscriptionId}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono uppercase bg-slate-950 px-3 py-1 rounded border border-slate-900 leading-relaxed font-semibold">
              KOTAK PASIR SISTEM PENAGIHAN VYORATRADE
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-wider font-sans">
              Tingkatkan Potensi Trading Anda
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Pilih paket yang paling sesuai dengan aktivitas trading Anda. Akses instrumen premium, performa RAM andal, dan sinyal bot tanpa batas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* PRICING CARD 1: Pro Monthly */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition relative">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded">
                    PRO MONTHLY
                  </span>
                  <div className="flex items-baseline space-x-1.5 mt-4">
                    <span className="text-4xl font-extrabold text-slate-100 font-mono">$9</span>
                    <span className="text-xs text-slate-500 font-mono">/ bulan</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    Sempurna untuk trader awal yang ingin mencoba otomatisasi sinyal lengkap secara bulanan dengan fleksibilitas tinggi.
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  <span className="text-[10px] font-bold font-mono text-slate-500 block uppercase tracking-wider">
                    Fitur Premium Termasuk:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {proFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handlePurchase(monthlyVariantId)}
                  disabled={purchasingId !== null}
                  className="w-full bg-slate-800 hover:bg-slate-75 * bg-slate-800/80 hover:bg-slate-700 active:translate-y-0.5 text-slate-100 font-bold px-4 py-3 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer select-none font-sans border border-slate-750"
                >
                  {purchasingId === monthlyVariantId ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-indigo-400" />
                      <span>SINKRONISASI...</span>
                    </>
                  ) : (
                    <span>Mulai Pro Monthly</span>
                  )}
                </button>
              </div>
            </div>

            {/* PRICING CARD 2: Pro Yearly (Highlighted Blue) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-blue-500 flex flex-col justify-between shadow-xl shadow-blue-500/5 relative overflow-hidden">
              {/* Badge "TERBAIK" */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-500 text-slate-950 text-[9px] font-bold leading-none rounded-full px-3 py-1 font-mono uppercase tracking-wider shadow">
                <Award className="h-3 w-3" />
                <span>TERBAIK</span>
              </div>

              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded">
                    PRO YEARLY
                  </span>
                  <div className="flex items-baseline space-x-1.5 mt-4">
                    <span className="text-4xl font-extrabold text-slate-100 font-mono">$79</span>
                    <span className="text-xs text-slate-500 font-mono">/ tahun</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    Hemat lebih dari 25% setiap tahunnya! Direkomendasikan untuk trader profesional yang konsisten memanfaatkan analisis kuantitatif secara intensif.
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                      Semua Fitur Pro & Tambahan:
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded leading-none">
                      HEMAT ~27%
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {proFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <Check className="h-4 w-4 text-emerald-450 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 leading-relaxed font-semibold text-blue-300">
                      <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
                      <span>Alokasi Cadangan Server VIP Eksklusif</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handlePurchase(yearlyVariantId)}
                  disabled={purchasingId !== null}
                  className="w-full bg-blue-500 hover:bg-blue-600 hover:scale-[1.01] active:translate-y-0.5 text-slate-950 font-extrabold px-4 py-3 rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer select-none font-sans"
                >
                  {purchasingId === yearlyVariantId ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-slate-950" />
                      <span>SINKRONISASI...</span>
                    </>
                  ) : (
                    <span>Mulai Pro Yearly</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
