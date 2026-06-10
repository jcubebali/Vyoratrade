import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { Sparkles, Key, Mail, Lock, Loader2, AlertCircle, Chrome } from "lucide-react";
import firebaseConfig from "../../firebase-applet-config.json";

export default function LoginView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);
  const [isCredentialError, setIsCredentialError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Password harus setidaknya 6 karakter.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsDomainError(false);
    setIsCredentialError(false);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Login dengan Email/Password belum diaktifkan di Firebase Console.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password terlalu lemah, minimal 6 karakter.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email atau password yang Anda masukkan salah.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email ini sudah terdaftar. Silahkan login.");
      } else {
        setError(err.message || "Terjadi kesalahan saat autentikasi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setIsDomainError(false);
    setIsCredentialError(false);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Proses login Google dibatalkan.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("Permintaan login Google dibatalkan karena popup lain terbuka.");
      } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setIsDomainError(true);
        setError("Firebase: Error (auth/unauthorized-domain).");
      } else if (err.code === 'auth/invalid-credential' || (err.message && err.message.includes('invalid-credential'))) {
        setIsCredentialError(true);
        setError("Firebase: Error (auth/invalid-credential).");
      } else {
        setError(err.message || "Gagal login dengan Google Account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <span className="text-emerald-400 font-extrabold text-2xl flex items-center gap-2 font-mono tracking-tight">
            VYORA <Sparkles className="h-6 w-6 fill-current text-emerald-400" />
          </span>
        </div>
        
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-100">
            {isLogin ? "System Access" : "Create Account"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isLogin ? "Authenticate to access trading dashboard" : "Register to access Vyora platform"}
          </p>
        </div>

        {error && (
          <div className="mb-6 space-y-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>

            {isDomainError && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-slate-350 text-xs leading-relaxed space-y-3 font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PANDUAN SOLUSI / FIX GUIDE</span>
                </div>
                <p className="text-slate-450 text-[11px] leading-normal">
                  Firebase membatasi Google Sign-In hanya pada domain terdaftar demi keamanan. Mari tambahkan domain web Anda sekarang.
                </p>
                <div className="text-[11px] space-y-2.5 bg-slate-950/65 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Langkah-langkah (Bahasa Indonesia):</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                    <li>
                      Buka langsung halaman{" "}
                      <a 
                        href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-400 underline hover:text-emerald-350 transition-colors font-bold"
                      >
                        Firebase Console Setelan Auth
                      </a>
                    </li>
                    <li>Klik tab <strong>Setelan</strong> (Settings) di bar atas menu Authentication.</li>
                    <li>Di menu sebelah kiri setelan, pilih <strong>Domain resmi</strong> (Authorized domains).</li>
                    <li>Klik tombol <strong>Tambahkan domain</strong> (Add Domain), lalu masukkan (paste) kedua domain di bawah.</li>
                  </ol>

                  <div className="pt-2 border-t border-slate-900" />

                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Steps (English):</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                    <li>
                      Open{" "}
                      <a 
                        href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-400 underline hover:text-emerald-350 transition-colors font-bold"
                      >
                        Firebase Auth Settings Console
                      </a>
                    </li>
                    <li>Go to the <strong>Settings</strong> tab at the top.</li>
                    <li>In the left sidebar of the settings, select <strong>Authorized domains</strong>.</li>
                    <li>Click <strong>Add Domain</strong> and enter the domains below.</li>
                  </ol>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 select-all">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Salin domain ini / Copy these domains:</div>
                  <code className="block text-[11px] text-emerald-400 break-all font-mono leading-none bg-slate-900/40 p-1.5 rounded border border-slate-800">
                    ais-dev-uoiqyvxind22qektuuufkt-23678121758.asia-southeast1.run.app
                  </code>
                  <code className="block text-[11px] text-emerald-400 break-all font-mono leading-none bg-slate-900/40 p-1.5 rounded border border-slate-800">
                    ais-pre-uoiqyvxind22qektuuufkt-23678121758.asia-southeast1.run.app
                  </code>
                </div>
              </div>
            )}

            {isCredentialError && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-slate-350 text-xs leading-relaxed space-y-3 font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AKHIFKAN GOOGLE SIGN-IN / ENABLE GOOGLE SIGN-IN</span>
                </div>
                <p className="text-slate-450 text-[11px] leading-normal">
                  Error <strong>auth/invalid-credential</strong> pada Google login paling sering terjadi karena Anda belum mengaktifkan provider Google atau belum memilih <strong>Email Dukungan Proyek (Project support email)</strong> di Firebase Console Anda.
                </p>
                
                <div className="text-[11px] space-y-2.5 bg-slate-950/65 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Cara Memperbaiki (Langkah Kunci):</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                    <li>
                      Buka langsung halaman{" "}
                      <a 
                        href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-400 underline hover:text-emerald-350 transition-colors font-bold"
                      >
                        Firebase Console Auth Providers
                      </a>
                    </li>
                    <li>
                      Klik provider <strong>Google</strong> (atau klik <strong>Add new provider</strong> (Tambahkan penyedia baru) jika Google belum ada, lalu pilih <strong>Google</strong>).
                    </li>
                    <li>
                      Nyalakan toggle <strong>Enable</strong> (Aktifkan) di kanan atas card Google tersebut.
                    </li>
                    <li>
                      <strong className="text-emerald-400">BAGIAN KRUSIAL:</strong> Pada pilihan dropdown <strong>Project support email</strong> (Email dukungan proyek), Anda **Wajib** memilih email Anda (misalnya <code>jcube.bali@gmail.com</code>). Jika dikosongkan, Google Login akan selalu gagal!
                    </li>
                    <li>
                      Klik tombol <strong>Save</strong> (Simpan) berwarna biru di bagian bawah setelan Google tersebut.
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                placeholder="system@vyora.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Secret Passkey</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
            {isLogin ? "INITIALIZE SESSION" : "PROVISION ACCOUNT"}
          </button>
        </form>

        <div className="relative my-6 select-none">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800/60" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono">
            <span className="bg-slate-900 px-3 text-slate-500 font-bold">OR SECURE ENDPOINT</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-350 hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2.5 font-bold font-mono text-xs tracking-wider"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          ) : (
            <Chrome className="w-4 h-4" />
          )}
          <span>CONTINUE WITH GOOGLE ACC</span>
        </button>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
          >
            {isLogin ? "Need access? Request an invite" : "Already provisioned? Authenticate"}
          </button>
        </div>
      </div>
    </div>
  );
}
