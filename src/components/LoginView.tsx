import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Sparkles, Key, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Password harus setidaknya 6 karakter.");
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
      if (err.code === 'auth/operation-not-allowed') {
        setError("Login dengan Email/Password belum diaktifkan di Firebase Console.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password terlalu lemah, minimal 6 karakter.");
      } else {
        setError(err.message || "Terjadi kesalahan saat autentikasi.");
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
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
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
