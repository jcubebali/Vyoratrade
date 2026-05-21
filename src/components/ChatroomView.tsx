import { useState, useRef, useEffect, FormEvent } from "react";
import { 
  Send, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  HelpCircle,
  TrendingUp,
  Loader
} from "lucide-react";
import { CompleteState } from "../types";

interface ChatroomViewProps {
  state: CompleteState;
}

interface ChatMessage {
  role: "user" | "bot";
  content: string;
  time: string;
}

export default function ChatroomView({ state }: ChatroomViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "Welcome to the Vyora Prime advisory workspace. I am Vyora-AI (v3.5 stable model). I have integrated your real-time ledger outputs. Ask me regarding market triggers, indicator crossovers, token balances or optimal risk configs.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg = input;
    setInput("");
    setIsSending(true);

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Add User Message
    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: userMsg, time: currentTime }
    ];
    setMessages(updatedMessages);

    try {
      // Send chat request along with chat history to maintain conversational context
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Chat service did not respond correctly");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.reply || "Unable to retrieve advisor recommendations.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Trading assistant remains temporarily offline. Ensure you have configured a valid `GEMINI_API_KEY` under the Settings tab to sync remote quant reasoning.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    "Assess Solana support and resistance levels.",
    "Recommend a stop-loss config for BTC leverage scalping.",
    "Explain Dual EMA crossovers vs RSI indicators."
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)] min-h-[500px]">
      {/* Advisor Chat Panel - Left 3 cols */}
      <div className="lg:col-span-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between overflow-hidden h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 select-none">
          <div className="flex items-center space-x-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Vyora AI Quantum Advisor <Sparkles className="h-4 w-4 text-emerald-400" />
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">CONVERSATIONAL TRADING COMPILER • SHIELD PROT v2</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">model: gemini-3.5-flash</span>
        </div>

        {/* Message Container streams */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20"
        >
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div 
                key={idx} 
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 space-y-1 ${
                  isUser 
                    ? "bg-emerald-500 text-slate-950 rounded-br-none" 
                    : "bg-slate-900 text-slate-300 border border-slate-850 rounded-bl-none"
                }`}>
                  <div className="flex items-center justify-between pb-1 text-[9.5px] border-b border-slate-950/5 font-mono select-none">
                    <span className="font-extrabold tracking-wider uppercase">
                      {isUser ? "You (Client)" : "Vyora AI Advisor"}
                    </span>
                    <span className="opacity-60">{m.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium pt-1">
                    {m.content}
                  </p>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-4 bg-slate-900 border border-slate-850 rounded-bl-none flex items-center space-x-2.5">
                <Loader className="h-4 w-4 text-emerald-400 animate-spin" />
                <span className="text-[11px] font-mono text-slate-400">Vyora Advisor is writing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/40 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            required
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-40"
            placeholder="Query Vyora regarding RSI parameters, stop losses, or indicators..."
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 rounded-xl px-5 font-bold text-xs uppercase cursor-pointer select-none transition flex items-center gap-1 shrink-0"
          >
            <span>SEND</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Guide/Shortcuts Column - Right 1 col */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 h-full">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
            Quick Actions
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Click a prompt below to automatically populate chat inputs.</p>
        </div>

        <div className="space-y-2">
          {samplePrompts.map((p, index) => (
            <button
              key={index}
              onClick={() => setInput(p)}
              className="w-full text-left p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 hover:bg-slate-950/60 transition text-xs text-slate-450 leading-relaxed font-semibold cursor-pointer"
            >
              "{p}"
            </button>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] leading-relaxed font-sans text-indigo-350 space-y-2 mt-4">
          <div className="flex items-center gap-1.5 font-bold font-mono text-slate-200">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <span>Grounded metrics context</span>
          </div>
          <p>
            Our Advisor possesses real-time visibility over the active coin pricing list, active positions, and recent transaction history. Your secret API keys remain fully isolated and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
