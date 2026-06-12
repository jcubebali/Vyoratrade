import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { Sparkles, Key, Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";

interface LoginViewProps {
  onBackToHome?: () => void;
}

export default function LoginView({ onBackToHome }: LoginViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password authentication method is disabled in your Firebase console.");
      } else if (err.code === "auth/weak-password") {
        setError("The password provided is too weak. It must be at least 6 characters.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("The email or password entered is incorrect.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email address is already registered. Please sign in instead.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Google Sign-In is disabled in your Firebase console.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Authentication error (invalid-credential): Ensure your Project support email and Google Provider are configured in the Firebase console.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is unauthorized. Please whitelist it in your Firebase console.");
      } else {
        setError(err.message || "Google Authentication session failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Ambient background visual glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl transition-all duration-300 relative hover:border-slate-700/60">
          
          {/* Subtle accent light border across the top */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          
          {/* Header Area */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src="https://res.cloudinary.com/dbckdslrw/image/upload/v1777721734/Vyora_20260502_110933_0000_2_tz8a1k.jpg" 
              alt="Vyora Logo" 
              className="h-24 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="w-12 h-0.5 bg-emerald-500/30 mt-4 rounded-full" />
          </div>

          {!isLogin && (
            <div className="text-center mb-8 animate-fadeIn">
              <h1 className="text-xl font-bold text-slate-100 tracking-wide">
                Create Account
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Register your email address to access the Vyora workspace
              </p>
            </div>
          )}

          {/* Feedback message overlay */}
          {error && (
            <div className="mb-6 p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex flex-col gap-3 text-rose-300 text-xs animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-1">
                  <span className="font-bold block text-rose-400 text-[10px] uppercase tracking-wider font-mono">Authentication Error</span>
                  <span className="leading-relaxed font-mono text-slate-200">{error}</span>
                </div>
              </div>
              
              {/* Detailed setup guide for unauthorized domain error */}
              {(error.toLowerCase().includes("unauthorized") || error.toLowerCase().includes("domain")) && (
                <div className="mt-2 pt-3 border-t border-rose-500/20 space-y-2">
                  <span className="font-semibold text-rose-400 block font-mono text-[11px]">💡 PENYELESAIAN / HOW TO FIX:</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Firebase Authentication membutuhkan domain website Anda untuk didaftarkan ke whitelist. Ikuti langkah berikut:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-[11px] font-mono">
                    <li>
                      Buka Firebase Console di link berikut:
                      <a 
                        href="https://console.firebase.google.com/project/nexus-trade-e449e/authentication/providers" 
                        target="_blank" 
                        rel="noreferrer"
                        className="block mt-1 underline text-emerald-400 hover:text-emerald-300 break-all font-semibold"
                      >
                        Firebase Auth Providers &rarr;
                      </a>
                    </li>
                    <li>
                      Scroll ke bagian paling bawah ke tabel bernama <strong className="text-slate-100">Authorized domains</strong> (Domain resmi).
                    </li>
                    <li>
                      Klik tombol <strong className="text-slate-100">Add domain</strong> lalu masukkan domain berikut satu per satu:
                      <div className="mt-1 bg-slate-950/95 border border-slate-800 rounded-lg p-2 space-y-1 select-all hover:border-slate-700 transition">
                        <code className="block text-[10px] text-emerald-400 font-bold">vyoratrade.vercel.app</code>
                        <code className="block text-[10px] text-emerald-300 font-bold">ais-dev-uoiqyvxind22qektuuufkt-23678121758.asia-southeast1.run.app</code>
                        <code className="block text-[10px] text-emerald-300 font-bold">ais-pre-uoiqyvxind22qektuuufkt-23678121758.asia-southeast1.run.app</code>
                      </div>
                    </li>
                    <li>
                      Simpan perubahan di Firebase, lalu coba klik tombol "Sign in with Google" kembali!
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* User Sign In/Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono pl-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 text-sm placeholder-slate-650 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 transition-all font-mono"
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono pl-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 text-sm placeholder-slate-650 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 transition-all font-mono"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            </div>

            {/* Email-password action button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <span className="tracking-wider text-xs font-mono uppercase">
                  {isLogin ? "Sign In" : "Register"}
                </span>
              )}
            </button>
          </form>

          {/* Elegant Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-[1px] bg-slate-800" />
            <span className="relative px-4 text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 rounded-full py-0.5 uppercase tracking-wider font-mono">
              or sign in with
            </span>
          </div>

          {/* Google Sign In option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-xs tracking-wide font-mono">Sign in with Google</span>
          </button>

          {/* Toggle View Link */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="group inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-all duration-200"
            >
              <span>
                {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in here"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {onBackToHome && (
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={onBackToHome}
              className="text-[10px] uppercase tracking-widest font-mono text-slate-500 hover:text-emerald-400 transition"
            >
              &larr; Kembali ke Beranda
            </button>
          </div>
        )}

        {/* Quiet premium footer details */}
        <div className="mt-6 text-center text-[10px] text-slate-600 font-mono tracking-wider uppercase">
          SECURE CONNECTION • TLS SECURE GATEWAY
        </div>
      </div>
    </div>
  );
}
