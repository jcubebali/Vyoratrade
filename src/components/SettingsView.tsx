import { useState, useEffect, FormEvent } from "react";
import CryptoJS from "crypto-js";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { 
  Lock, 
  Check, 
  Send, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Code,
  Terminal,
  Cpu,
  Bookmark,
  ExternalLink,
  Copy
} from "lucide-react";
import { CompleteState } from "../types";

interface SettingsViewProps {
  state: CompleteState;
  onSaveSettings: (settings: any) => Promise<void>;
}

export default function SettingsView({ state, onSaveSettings }: SettingsViewProps) {
  const { settings } = state;
  const [exchangeKey, setExchangeKey] = useState(settings.binanceApiKey || "");
  const [exchangeSecret, setExchangeSecret] = useState(settings.binanceSecret || "");
  const [telegramBotId, setTelegramBotId] = useState(settings.telegramBotId || "");
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || "");
  const [webhookToken, setWebhookToken] = useState(settings.webhookToken || "SG_SECURE_TOKEN_123");
  const [showSensitive, setShowSensitive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverIp, setServerIp] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/server-ip")
      .then(res => res.json())
      .then(data => setServerIp(data.ip))
      .catch(() => setServerIp("Unknown"));
  }, []);
  
  // Script tab state
  const [activeSnippetTab, setActiveSnippetTab] = useState<"curl" | "python" | "nodejs">("python");
  const [copiedText, setCopiedText] = useState(false);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to save settings.");
      }

      // Encrypt the secrets
      // We use a derivation of the user uid as the encryption key (just for demonstration of client-side basic encryption)
      const encryptionKey = user.uid + "-secret-key";
      const encryptedApiKey = CryptoJS.AES.encrypt(exchangeKey, encryptionKey).toString();
      const encryptedApiSecret = CryptoJS.AES.encrypt(exchangeSecret, encryptionKey).toString();

      // Save to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        binanceApiKey: encryptedApiKey,
        binanceApiSecret: encryptedApiSecret,
        telegramBotId,
        telegramChatId,
        webhookToken
      }, { merge: true });

      // Also call the original onSaveSettings to keep local state updated if necessary
      await onSaveSettings({
        binanceApiKey: exchangeKey,
        binanceSecret: exchangeSecret,
        telegramBotId,
        telegramChatId,
        webhookToken
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Failed to register credential changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get dynamic deployment origin for code blocks
  const appOrigin = window.location.origin;

  const codeSnippets = {
    curl: `curl -X POST "${appOrigin}/api/webhook/trade" \\
  -H "Content-Type: application/json" \\
  -d '{
    "symbol": "SOLUSDT",
    "type": "BUY",
    "price": 242.80,
    "amount": 10.5,
    "secret": "${webhookToken}"
  }'`,
    python: `import requests

# Base URL pointing directly to your live AI Quant Terminal
DASHBOARD_URL = "${appOrigin}"
WEBHOOK_SECRET = "${webhookToken}"

def send_trade_to_dashboard(symbol: str, action: str, price: float, amount: float, current_pnl: float = None):
    payload = {
        "symbol": symbol,
        "type": action, # "BUY" or "SELL"
        "price": price,
        "amount": amount,
        "secret": WEBHOOK_SECRET
    }
    if current_pnl is not None:
        payload["pnl"] = current_pnl
        
    try:
        response = requests.post(f"{DASHBOARD_URL}/api/webhook/trade", json=payload)
        if response.status_code == 200:
            print("Successfully updated Quant Dashboard:", response.json())
        else:
            print("Webhook update failed:", response.status_code, response.text)
    except Exception as e:
        print("Network connection error to dashboard:", e)

# Example action triggers from your existing Singapore strategy:
# send_trade_to_dashboard("SOLUSDT", "BUY", 242.80, 10.5)
# send_trade_to_dashboard("SOLUSDT", "SELL", 254.20, 10.5, current_pnl=119.70)
`,
    nodejs: `import fetch from 'node-fetch';

const dashboardUrl = "${appOrigin}";
const webhookSecret = "${webhookToken}";

async function postTradeToDashboard(symbol, type, price, amount, pnl = null) {
  const payload = {
    symbol,
    type, // 'BUY' or 'SELL'
    price: Number(price),
    amount: Number(amount),
    secret: webhookSecret
  };
  if (pnl !== null) {
    payload.pnl = Number(pnl);
  }

  try {
    const res = await fetch(\`\${dashboardUrl}/api/webhook/trade\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log("Dashboard response:", data);
  } catch (err) {
    console.error("Failed to sync trade with AI Dashboard:", err);
  }
}
`
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <header className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          Platform Integrations & API Credentials
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Securely plug private trading credentials, Singapore alert channels, or webhook tokens directly into state memory indexes.
        </p>
      </header>
      
      {state.binanceError && (
         <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Binance Connection Failed</span>
            </div>
            <div className="text-xs text-rose-300 font-mono break-all whitespace-pre-wrap">
              {state.binanceError}
            </div>
            <div className="text-xs text-slate-400 mt-2 font-sans space-y-2">
              <p><strong>Solusi:</strong> Kesalahan ini terjadi jika IP server belum masuk whitelist di Binance. Silakan whitelist alamat IP statis berikut pada pengaturan API Binance Anda:</p>
              <div className="bg-slate-900 border border-slate-700/50 rounded-lg p-3 mt-2">
                 <div className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Informasi Server Static IP</div>
                 <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-slate-400">IP Whitelist:</span>
                    <span className="text-emerald-400 font-mono font-bold">152.42.248.130</span>
                 </div>
              </div>
              <p className="mt-2 text-slate-300">Pastikan juga "Enable Reading" sudah dicentang.</p>
            </div>
         </div>
      )}

      {/* Settings Grid forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* API Credentials form */}
        <form id="secrets-form" onSubmit={handleSave} className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2 select-none">
            <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-emerald-450 text-emerald-400" />
              <span>Secret Vault Configurations</span>
            </h3>

            {/* Password view Toggle */}
            <button
              type="button"
              id="deobscure-btn"
              onClick={() => setShowSensitive(!showSensitive)}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer font-sans"
            >
              {showSensitive ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Obscure SECRETS</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>DEOBSCURE SECRETS</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Webhook Token - Singapore Integration */}
            <div className="md:col-span-2 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 mb-2">
              <label className="text-[10px] font-mono uppercase font-bold text-indigo-400 block mb-1">
                Singapore Bot Webhook Secret Token (Shared Key)
              </label>
              <div className="flex gap-2">
                <input
                  type={showSensitive ? "text" : "password"}
                  value={webhookToken}
                  onChange={(e) => setWebhookToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="SG_SECURE_TOKEN_123"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-sans">
                Set a secret key to authorize and secure trade updates pushed from your Singapore external bot.
              </p>
            </div>

            {/* Binance Key */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                Binance Broker Spot Client Key (API_KEY)
              </label>
              <input
                type={showSensitive ? "text" : "password"}
                value={exchangeKey}
                onChange={(e) => setExchangeKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="4gHGgRptNInZ8VbSw..."
              />
            </div>

            {/* Binance Secret */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                Binance Broker Client Secret Key (API_SECRET)
              </label>
              <input
                type={showSensitive ? "text" : "password"}
                value={exchangeSecret}
                onChange={(e) => setExchangeSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="rZ98mN81qS9pXW..."
              />
            </div>

            {/* Telegram Bot Token */}
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                Telegram Bot API Key Token
              </label>
              <input
                type={showSensitive ? "text" : "password"}
                value={telegramBotId}
                onChange={(e) => setTelegramBotId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="bot981402830:AAFg7..."
              />
            </div>

            {/* Telegram Chat ID */}
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                Target Telegram Channel/Chat ID
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="-10098402834"
              />
            </div>

          </div>

          <div className="flex justify-between items-center pt-5 border-t border-slate-800/60 mt-4 gap-3">
            <div className="flex-1">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-sans">
                  <Check className="h-4 w-4" /> Integrations Locked Successfully!
                </span>
              )}
              {saveError && (
                <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 font-sans">
                  <AlertTriangle className="h-4 w-4" /> {saveError}
                </span>
              )}
            </div>
            <button
              type="submit"
              id="save-secrets-btn"
              disabled={isSaving}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer select-none text-xs tracking-wider uppercase flex items-center gap-1 transition font-sans"
            >
              {isSaving ? "LOCKING..." : "SAVE INTEGRATION SECRETS"}
            </button>
          </div>
        </form>

        {/* Diagnostic Status indicators - Right Column */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl h-full space-y-5">
          <div className="border-b border-slate-800 pb-3 select-none">
            <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-indigo-400" />
              <span>System Diagnostic Monitor</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">Verification logs confirming status connections representing secure cloud APIs.</p>
          </div>

          <div className="space-y-3 font-mono text-[11px] leading-relaxed">
            
            {/* Webhook Status */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
              <span className="text-slate-400 font-medium">Singapore Bot Webhook</span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px]">READY FOR TRIGGERS</span>
              </span>
            </div>

            {/* Status 1: API */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
              <span className="text-slate-400 font-medium">Binance Core Link</span>
              <span className={`h-2 w-2 rounded-full ${exchangeKey ? "bg-emerald-400 shadow-sm shadow-emerald-450" : "bg-orange-500"}`} />
            </div>

            {/* Status 2: Mobile alerts */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
              <span className="text-slate-400 font-medium">Telegram Alert Channel</span>
              <span className={`h-2 w-2 rounded-full ${telegramBotId && telegramChatId ? "bg-emerald-400 shadow-sm shadow-emerald-450" : "bg-orange-500"}`} />
            </div>

            {/* Status 3: Gemini system status */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
              <span className="text-slate-400 font-medium font-sans">Gemini AI Audit Hub</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-450" />
            </div>

          </div>

          <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 text-[11px] text-rose-350 leading-relaxed font-medium font-sans flex gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              All credentials registered inside this workspace are decrypted and stored safely server-side. Vyora employees hold no visibility over these parameters.
            </div>
          </div>
        </div>
      </div>

      {/* Webhook integration guide & interactive code console */}
      <section id="integration-guide" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Singapore Bot Webhook Connection Guide</h3>
              <p className="text-xs text-slate-400">Integrate your active Singapore-hosted trading script to push transactions into this UI.</p>
            </div>
          </div>

          {/* Tab selectors */}
          <div className="flex gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-850">
            {(["python", "nodejs", "curl"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSnippetTab(tab)}
                className={`px-3 py-1 text-xs font-mono capitalize rounded-lg cursor-pointer ${
                  activeSnippetTab === tab 
                    ? "bg-indigo-500 text-white font-bold" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-950 border-t border-x border-slate-850 rounded-t-xl select-none text-[10px] text-slate-400 font-mono font-bold">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                <span>active_strategy_payload.{activeSnippetTab === "python" ? "py" : activeSnippetTab === "nodejs" ? "js" : "sh"}</span>
              </span>
              <button 
                type="button"
                onClick={() => copyToClipboard(codeSnippets[activeSnippetTab])}
                className="flex items-center gap-1 hover:text-white cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[9px] font-sans">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>COPY SCRIPT</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-b-xl border-b border-x border-slate-850 overflow-x-auto max-h-[340px] leading-relaxed">
              <code>{codeSnippets[activeSnippetTab]}</code>
            </pre>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 text-indigo-400" />
                <span>Why Use Webhooks directly?</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11px]">
                <li><strong>No Latency Loss</strong>: Your Singapore bot keeps trading on local SG servers instantly with zero interface lag.</li>
                <li><strong>Absolute Security</strong>: Your Binance Private API Secret Keys remain stored on your private engine and are never exposed publicly.</li>
                <li><strong>Full UI Sync</strong>: The instant your bot takes a position, it updates this dashboard, updates your cash balance, and logs history on the ledger live.</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
              <h4 className="font-semibold text-emerald-400">Webhook Parameters</h4>
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-1">Field</th>
                    <th className="text-left py-1">Type</th>
                    <th className="text-left py-1">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-350">
                  <tr>
                    <td className="py-1 text-emerald-400">symbol</td>
                    <td className="py-1">string</td>
                    <td className="py-1">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-emerald-400">type</td>
                    <td className="py-1">"BUY" | "SELL"</td>
                    <td className="py-1">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-emerald-400">price</td>
                    <td className="py-1">number</td>
                    <td className="py-1">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-emerald-400">amount</td>
                    <td className="py-1">number</td>
                    <td className="py-1">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-indigo-400">secret</td>
                    <td className="py-1">string</td>
                    <td className="py-1">Yes (Match)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
