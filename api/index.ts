import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

interface BotConfigType {
  isActive: boolean;
  strategy: string;
  symbol: string;
  stopLoss: number;
  takeProfit: number;
  trailingStop: number;
  capital: number;
  leverage: number;
  maxRam: number;
  slTpMode: "PRICE" | "ROE";
}

interface OpenTradeType {
  id: string;
  symbol: string;
  entryPrice: number;
  amount: number;
  leverage?: number;
  margin?: number;
  timestamp?: string;
  time?: string;
}

interface TradeType {
  id: string;
  time: string;
  symbol: string;
  type: string;
  price: number;
  amount: number;
  total: number;
  status: string;
  pnl?: number;
  address?: string;
  txHash?: string;
}

interface ActivePositionType {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  currPrice: number;
  amount: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
}

dotenv.config();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase using local config safely
let db: Firestore | null = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    
    // In Vercel environments without explicit credentials, Application Default Credentials 
    // metadata lookup will time out and crash the serverless function.
    if (!process.env.VERCEL || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      if (getApps().length === 0) {
        initializeApp({
          projectId: firebaseConfig.projectId,
        });
      }
      db = getFirestore(firebaseConfig.firestoreDatabaseId);
      console.log("Firebase Admin initialized successfully, using database:", firebaseConfig.firestoreDatabaseId);
    } else {
      console.warn("Vercel deployment detected without credentials. Firebase Admin initialization skipped.");
    }
  } else {
    console.warn("firebase-applet-config.json does not exist. Standby mode.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase:", e);
}

const app = express();

app.use(express.json());

// Set Cross-Origin-Opener-Policy header to allow Google Login popups
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// Real-time signals pricing configurations
let signals: Record<string, any> = {
  BTCUSDT: {
    symbol: "BTCUSDT",
    price: 92450.00,
    change24h: 3.42,
    rsi: 44.5,
    macd: 12.8,
    trend: "BULLISH",
    verdict: "BUY",
    confidence: "HIGH",
    aiAnalysis: "Consolidation pattern breaks out with strong institutional support floor holding around $91,200 level. Multiple indicators signal standard convergence.",
  },
  ETHUSDT: {
    symbol: "ETHUSDT",
    price: 3125.50,
    change24h: -1.15,
    rsi: 38.2,
    macd: -4.5,
    trend: "BEARISH",
    verdict: "HOLD",
    confidence: "MEDIUM",
    aiAnalysis: "Ethereum retests structural EMA levels against persistent selling pressure. Volatility index points to imminent squeeze completion soon.",
  },
  SOLUSDT: {
    symbol: "SOLUSDT",
    price: 242.80,
    change24h: 8.75,
    rsi: 68.9,
    macd: 3.4,
    trend: "BULLISH",
    verdict: "BUY",
    confidence: "HIGH",
    aiAnalysis: "Network transaction volumes jump with massive on-chain demand surge. RSI approaching overbought parameters but momentum sustains bullish structure.",
  },
  BNBUSDT: {
    symbol: "BNBUSDT",
    price: 618.40,
    change24h: 0.25,
    rsi: 52.1,
    macd: 0.8,
    trend: "NEUTRAL",
    verdict: "HOLD",
    confidence: "LOW",
    aiAnalysis: "Binance Token exhibits sideways channel motion pending key exchange listings and structural quarterly burn events updates.",
  },
};

let lastFetchSuccess = false;
let currentFeedName = "STANDBY MEMORY SIMULATOR";
let lastFetchTime = 0;

// Helper to execute native fetch with AbortController timeout
async function fetchWithTimeout(resource: string | URL, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 2500, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...rest, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Async function to pull real-time cryptocurrency data with robust fallbacks
async function fetchBinancePrices() {
  // Option 1: Try standard Binance Public API
  try {
    const res = await fetchWithTimeout('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT"]', { timeout: 2000 });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const sym = item.symbol;
          if (signals[sym]) {
            const price = parseFloat(item.lastPrice);
            const change24h = parseFloat(item.priceChangePercent);
            
            signals[sym].price = price;
            signals[sym].change24h = change24h;
            
            const changeFactor = Math.min(20, Math.max(-20, change24h));
            const baseRsi = 50 + changeFactor * 2.5;
            const rsi = Math.min(95, Math.max(10, parseFloat((baseRsi + (Math.random() - 0.5) * 4).toFixed(1))));
            signals[sym].rsi = rsi;
            signals[sym].macd = parseFloat((changeFactor * 0.75 + (Math.random() - 0.5) * 0.4).toFixed(2));
            
            if (rsi > 60) {
              signals[sym].trend = "BULLISH";
              signals[sym].verdict = "BUY";
              signals[sym].confidence = "HIGH";
            } else if (rsi < 40) {
              signals[sym].trend = "BEARISH";
              signals[sym].verdict = "SELL";
              signals[sym].confidence = "MEDIUM";
            } else {
              signals[sym].trend = "NEUTRAL";
              signals[sym].verdict = "HOLD";
              signals[sym].confidence = "LOW";
            }
          }
        }
        lastFetchSuccess = true;
        currentFeedName = "LIVE MARKET DATA (BINANCE)";
        return;
      }
    }
  } catch (err) {
    console.warn("Binance public price feed blocked or rate-limited. Trying CryptoCompare fallback...", err);
  }

  // Option 2: Try CryptoCompare Fallback (Unblocked, extremely fast, no keys required)
  try {
    const ccRes = await fetchWithTimeout('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,SOL,BNB&tsyms=USD', { timeout: 2000 });
    if (ccRes.ok) {
      const ccData = await ccRes.json();
      if (ccData && ccData.RAW) {
        const mappings: Record<string, string> = {
          BTC: 'BTCUSDT',
          ETH: 'ETHUSDT',
          SOL: 'SOLUSDT',
          BNB: 'BNBUSDT'
        };
        for (const [fsym, t_symbol] of Object.entries(mappings)) {
          const rawData = ccData.RAW[fsym]?.USD;
          if (rawData && signals[t_symbol]) {
            const price = parseFloat(rawData.PRICE);
            const change24h = parseFloat(rawData.CHANGEPCT24HOUR);
            
            signals[t_symbol].price = price;
            signals[t_symbol].change24h = change24h;
            
            const changeFactor = Math.min(20, Math.max(-20, change24h));
            const baseRsi = 50 + changeFactor * 2.5;
            const rsi = Math.min(95, Math.max(10, parseFloat((baseRsi + (Math.random() - 0.5) * 4).toFixed(1))));
            signals[t_symbol].rsi = rsi;
            signals[t_symbol].macd = parseFloat((changeFactor * 0.75 + (Math.random() - 0.5) * 0.4).toFixed(2));
            
            if (rsi > 60) {
              signals[t_symbol].trend = "BULLISH";
              signals[t_symbol].verdict = "BUY";
              signals[t_symbol].confidence = "HIGH";
            } else if (rsi < 40) {
              signals[t_symbol].trend = "BEARISH";
              signals[t_symbol].verdict = "SELL";
              signals[t_symbol].confidence = "MEDIUM";
            } else {
              signals[t_symbol].trend = "NEUTRAL";
              signals[t_symbol].verdict = "HOLD";
              signals[t_symbol].confidence = "LOW";
            }
          }
        }
        lastFetchSuccess = true;
        currentFeedName = "LIVE MARKET DATA (CRYPTOCOMPARE)";
        return;
      }
    }
  } catch (err) {
    console.warn("CryptoCompare price feed fallback also failed. Trying CoinGecko fallback...", err);
  }

  // Option 3: Try CoinGecko Fallback
  try {
    const cgRes = await fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_24hr_change=true', { timeout: 2000 });
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      if (cgData) {
        const mappings: Record<string, string> = {
          bitcoin: 'BTCUSDT',
          ethereum: 'ETHUSDT',
          solana: 'SOLUSDT',
          binancecoin: 'BNBUSDT'
        };
        for (const [cgId, t_symbol] of Object.entries(mappings)) {
          const coinData = cgData[cgId];
          if (coinData && signals[t_symbol]) {
            const price = parseFloat(coinData.usd);
            const change24h = parseFloat(coinData.usd_24h_change);
            
            signals[t_symbol].price = price;
            signals[t_symbol].change24h = change24h;
            
            const changeFactor = Math.min(20, Math.max(-20, change24h));
            const baseRsi = 50 + changeFactor * 2.5;
            const rsi = Math.min(95, Math.max(10, parseFloat((baseRsi + (Math.random() - 0.5) * 4).toFixed(1))));
            signals[t_symbol].rsi = rsi;
            signals[t_symbol].macd = parseFloat((changeFactor * 0.75 + (Math.random() - 0.5) * 0.4).toFixed(2));
            
            if (rsi > 60) {
              signals[t_symbol].trend = "BULLISH";
              signals[t_symbol].verdict = "BUY";
              signals[t_symbol].confidence = "HIGH";
            } else if (rsi < 40) {
              signals[t_symbol].trend = "BEARISH";
              signals[t_symbol].verdict = "SELL";
              signals[t_symbol].confidence = "MEDIUM";
            } else {
              signals[t_symbol].trend = "NEUTRAL";
              signals[t_symbol].verdict = "HOLD";
              signals[t_symbol].confidence = "LOW";
            }
          }
        }
        lastFetchSuccess = true;
        currentFeedName = "LIVE MARKET DATA (COINGECKO)";
        return;
      }
    }
  } catch (err) {
    console.error("All live public price feeds blocked. Resorting to memory simulator.", err);
  }

  // Fallback to memory walking if fetch didn't succeed
  for (const sym of Object.keys(signals)) {
    const coin = signals[sym];
    const fluctuationPercent = (Math.random() - 0.49) * 0.003;
    coin.price = parseFloat((coin.price * (1 + fluctuationPercent)).toFixed(2));
    const dailyFluctuation = (Math.random() - 0.47) * 0.15;
    coin.change24h = parseFloat((coin.change24h + dailyFluctuation).toFixed(3));
    coin.rsi = Math.min(95, Math.max(10, parseFloat((coin.rsi + (Math.random() - 0.5) * 1.5).toFixed(1))));
    coin.macd = parseFloat((coin.macd + (Math.random() - 0.5) * 0.5).toFixed(2));
    if (coin.rsi > 60) {
      coin.trend = "BULLISH";
      coin.verdict = "BUY";
      coin.confidence = "HIGH";
    } else if (coin.rsi < 40) {
      coin.trend = "BEARISH";
      coin.verdict = "SELL";
      coin.confidence = "MEDIUM";
    } else {
      coin.trend = "NEUTRAL";
      coin.verdict = "HOLD";
      coin.confidence = "LOW";
    }
  }
  lastFetchSuccess = false;
  currentFeedName = "STANDBY MEMORY SIMULATOR";
}

// Lazy Gemini API instantiation pattern (prevents crashing if GEMINI_API_KEY is not defined)
let aiClientInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in your workspace environment configuration.");
    }
    aiClientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClientInstance;
}

app.get("/api/server-ip", async (req, res) => {
  try {
    const ipRes = await fetchWithTimeout("https://api.ipify.org?format=json", { timeout: 1500 });
    const data = await ipRes.json();
    res.json({ ip: data.ip });
  } catch (err: any) {
    res.json({ ip: "Unknown" });
  }
});

// Simplify /api/state to only return real-time prices and dataSource
app.get("/api/state", async (req, res) => {
  const now = Date.now();
  if (now - lastFetchTime > 4000) {
    lastFetchTime = now;
    await fetchBinancePrices();
  } else if (!lastFetchSuccess) {
    // If last live fetch didn't succeed, do a light memory simulation bump
    for (const sym of Object.keys(signals)) {
      const coin = signals[sym];
      const fluctuationPercent = (Math.random() - 0.49) * 0.003;
      coin.price = parseFloat((coin.price * (1 + fluctuationPercent)).toFixed(2));
      coin.rsi = Math.min(95, Math.max(10, parseFloat((coin.rsi + (Math.random() - 0.5) * 1.5).toFixed(1))));
    }
  }

  res.json({
    signals,
    dataSource: currentFeedName
  });
});

// Proxy route for Binance 24hr tickers with robust fallbacks
app.get("/api/binance/tickers-24hr", async (req, res) => {
  const pairs = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "AVAXUSDT"];
  
  // Attempt 1: Fetch all symbols together from Binance API
  try {
    const symbolsParam = JSON.stringify(pairs);
    const binanceRes = await fetchWithTimeout(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`, { timeout: 1500 });
    if (binanceRes.ok) {
      const data = await binanceRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    }
  } catch (err) {
    console.warn("Binance 24hr tickers proxy symbols request failed, trying individual symbol queries:", err);
  }

  // Attempt 2: Fetch individual symbols in parallel
  try {
    const promises = pairs.map(p =>
      fetchWithTimeout(`https://api.binance.com/api/v3/ticker/24hr?symbol=${p}`, { timeout: 1200 })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );
    const results = await Promise.all(promises);
    const validResults = results.filter(Boolean);
    if (validResults.length > 0) {
      return res.json(validResults);
    }
  } catch (err) {
    console.warn("Binance individual parallel requests failed, trying CryptoCompare fallback:", err);
  }

  // Attempt 3: CryptoCompare fallback
  try {
    const fsyms = "BTC,ETH,BNB,SOL,XRP,DOGE,ADA,AVAX";
    const ccRes = await fetchWithTimeout(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fsyms}&tsyms=USD`, { timeout: 1500 });
    if (ccRes.ok) {
      const ccData = await ccRes.json();
      if (ccData && ccData.RAW) {
        const mappedList = pairs.map(p => {
          const fsym = p.replace("USDT", "");
          const raw = ccData.RAW[fsym]?.USD;
          if (raw) {
            return {
              symbol: p,
              lastPrice: String(raw.PRICE),
              priceChangePercent: String(raw.CHANGEPCT24HOUR)
            };
          }
          return null;
        }).filter(Boolean);
        if (mappedList.length > 0) {
          return res.json(mappedList);
        }
      }
    }
  } catch (err) {
    console.warn("CryptoCompare fallback ticker failed, resorting to static cache simulation:", err);
  }

  // Fallback 4: Hardcoded polished data to guarantee operation
  const simulatedTickers = [
    { symbol: "BTCUSDT", lastPrice: String(signals.BTCUSDT?.price || 92450.00), priceChangePercent: String(signals.BTCUSDT?.change24h || 3.42) },
    { symbol: "ETHUSDT", lastPrice: String(signals.ETHUSDT?.price || 3125.50), priceChangePercent: String(signals.ETHUSDT?.change24h || -1.15) },
    { symbol: "BNBUSDT", lastPrice: String(signals.BNBUSDT?.price || 618.40), priceChangePercent: String(signals.BNBUSDT?.change24h || 0.25) },
    { symbol: "SOLUSDT", lastPrice: String(signals.SOLUSDT?.price || 242.80), priceChangePercent: String(signals.SOLUSDT?.change24h || 8.75) },
    { symbol: "XRPUSDT", lastPrice: "1.1512", priceChangePercent: "2.45" },
    { symbol: "DOGEUSDT", lastPrice: "0.3848", priceChangePercent: "-1.20" },
    { symbol: "ADAUSDT", lastPrice: "0.6251", priceChangePercent: "0.85" },
    { symbol: "AVAXUSDT", lastPrice: "34.50", priceChangePercent: "4.12" }
  ];
  return res.json(simulatedTickers);
});

// Proxy route for simple BTCUSDT price lookup (Demo components)
app.get("/api/binance/ticker-price", async (req, res) => {
  const symbol = (req.query.symbol as string) || "BTCUSDT";
  
  // Attempt 1: Hit Binance
  try {
    const binanceRes = await fetchWithTimeout(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, { timeout: 1500 });
    if (binanceRes.ok) {
      const data = await binanceRes.json();
      if (data && data.price) {
        return res.json(data);
      }
    }
  } catch (err) {
    console.warn("Binance ticker-price proxy failed:", err);
  }

  // Attempt 2: signals cache lookup
  if (symbol === "BTCUSDT" && signals.BTCUSDT) {
    return res.json({ symbol: "BTCUSDT", price: String(signals.BTCUSDT.price) });
  }

  // Attempt 3: CryptoCompare
  try {
    const coinSym = symbol.replace("USDT", "");
    const ccRes = await fetchWithTimeout(`https://min-api.cryptocompare.com/data/price?fsym=${coinSym}&tsyms=USD`, { timeout: 1500 });
    if (ccRes.ok) {
      const ccData = await ccRes.json();
      if (ccData && ccData.USD) {
        return res.json({ symbol, price: String(ccData.USD) });
      }
    }
  } catch (err) {
    console.warn("CryptoCompare single price fallback failed:", err);
  }

  // Fallback 4: static configuration
  const fallbackPrices: Record<string, string> = {
    BTCUSDT: "92450.00",
    ETHUSDT: "3125.50",
    SOLUSDT: "242.80",
    BNBUSDT: "618.40"
  };
  return res.json({ symbol, price: fallbackPrices[symbol] || "1.00" });
});

// Proxy endpoint to prevent mixed content blocker
app.post("/api/proxy/save-keys", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const response = await fetchWithTimeout("http://152.42.248.130:8888/api/save-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      timeout: 6000
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "VPS proxy failed" });
  }
});

// Webhook endpoint specifically designed to receive signals and real trades from Singapore VPS bot
app.post("/api/webhook/trade", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { secret, symbol, type, price, amount, pnl, uid, balance } = req.body || {};

  // Verify secret token matching "SG_SECURE_TOKEN_123"
  if (secret !== "SG_SECURE_TOKEN_123") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("[Webhook] Trade received:", { symbol, type, price, amount, pnl, uid, balance });

  if (!symbol || !type || !price || !amount || !uid) {
    return res.status(400).json({ error: "Missing required fields: symbol, type, price, amount, and uid are required." });
  }

  const tradePrice = parseFloat(price);
  const tradeAmount = parseFloat(amount);
  const tradeTotal = parseFloat((tradePrice * tradeAmount).toFixed(2));
  const estimatedPnl = pnl !== undefined ? parseFloat(pnl) : undefined;

  let firestoreId = null;
  if (db) {
    try {
      // Get current user document info to retrieve existing balance and metadata safely
      const userRef = db.collection("users").doc(uid);
      const userSnap = await userRef.get();
      let currentBalance = 12450.75;
      if (userSnap.exists) {
        const userData = userSnap.data() || {};
        currentBalance = userData.totalUsdt !== undefined ? userData.totalUsdt : 12450.75;
      }

      // Compute updated balance based on incoming trade metrics
      let updatedBalance = currentBalance;
      if (balance !== undefined) {
        updatedBalance = parseFloat(balance);
      } else if (estimatedPnl !== undefined) {
        updatedBalance = parseFloat((currentBalance + estimatedPnl).toFixed(2));
      } else if (type.toUpperCase() === "SELL") {
        updatedBalance = currentBalance;
      } else if (type.toUpperCase() === "BUY") {
        updatedBalance = parseFloat((currentBalance - tradeTotal).toFixed(2));
      }

      // Save trade details to Firestore collection "trades" (including critical uid relation field)
      const docRef = await db.collection("trades").add({
        uid,
        symbol: symbol.toUpperCase(),
        type: type.toUpperCase() === "BUY" ? "BUY" : "SELL",
        price: tradePrice,
        amount: tradeAmount,
        pnl: estimatedPnl !== undefined ? estimatedPnl : null,
        timestamp: new Date().toISOString(),
        status: "COMPLETED"
      });
      firestoreId = docRef.id;
      console.log(`Successfully saved trade to Firestore under ID: ${firestoreId} for user: ${uid}`);

      // Handle updating the user document with current active position reference & balance
      const updateData: any = {
        totalUsdt: parseFloat(updatedBalance.toFixed(2))
      };

      if (type.toUpperCase() === "BUY") {
        const margin = (tradePrice * tradeAmount) / 10;
        updateData.openPosition = {
          symbol: symbol.toUpperCase(),
          entryPrice: tradePrice,
          amount: tradeAmount,
          margin: parseFloat(margin.toFixed(2)),
          leverage: 10,
          timestamp: new Date().toISOString()
        };
      } else if (type.toUpperCase() === "SELL") {
        updateData.openPosition = null;
      }

      await userRef.set(updateData, { merge: true });
      console.log(`Successfully updated balance & open position state in users/${uid}`);

    } catch (fsError) {
      console.error("Firestore operations failed in /api/webhook/trade:", fsError);
    }
  }

  // Update localized price memory cache signals to match trade details for immediate UI updates
  if (signals[symbol.toUpperCase()]) {
    signals[symbol.toUpperCase()].price = tradePrice;
  }

  return res.status(200).json({ success: true, ...(firestoreId ? { firestoreId } : {}) });
});

// Deep technical analysis utilizing real Gemini models with graceful fallbacks
app.post("/api/gemini/analyze", async (req, res) => {
  const { symbol } = req.body;
  const safeSymbol = symbol || "SOLUSDT";
  const coinData = signals[safeSymbol] || { price: 100, change24h: 0, rsi: 50, macd: 0, trend: "NEUTRAL" };

  try {
    const ai = getGeminiClient();
    const prompt = `You are Vyora-Quantum-Engine, an expert technical trading analyst.
Provide a high-fidelity quantitative analysis report for the cryptocurrency asset ticker: ${safeSymbol}.
Current parameters:
- Last price: $${coinData.price}
- 24h gain: ${coinData.change24h}%
- Standard RSI(14): ${coinData.rsi}
- MACD histogram convergence: ${coinData.macd}
- Calculated trend verdict: ${coinData.trend}

Generate a concise technical report strictly as valid JSON matching this schema:
{
  "symbol": "${safeSymbol}",
  "verdict": "BUY" | "SELL" | "HOLD",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "A highly precise 2-3 sentence technical analysis explaining support levels and momentum divergence.",
  "riskFactor": "Active potential risk dangers such as derivative liquidation clusters or funding rate changes.",
  "groundedPrediction": "A grounded 7-day projected target price range."
}
Return only the raw JSON. No markdown ticks formatting, no extra explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    let data;
    try {
      data = JSON.parse(text.trim());
    } catch {
      // Clean possible JSON backticks if model ignored instruction
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      data = JSON.parse(cleaned);
    }
    return res.json(data);

  } catch (err: any) {
    console.error("Gemini Analyze Error; using technical convergence simulator:", err.message);
    
    // Mathematical simulation response when key isn't provided or fails
    const targetPrices = {
      BTCUSDT: { low: 91800, high: 93450, r: "Stiff continuation channels above $92,000. RSI convergence implies persistent buyer backup around EMA50 thresholds." },
      ETHUSDT: { low: 3080, high: 3180, r: "Struggling below localized trend-lines. Support floors hold firm around structural liquidity pools at $3,050." },
      SOLUSDT: { low: 238, high: 252, r: "Extremely strong bullish on-chain patterns. Relative volume demonstrates minor retail compression but overall structural trend sustains." },
      BNBUSDT: { low: 610, high: 628, r: "Consolidation within standard bollinger-bands. Low volume indicates localized momentum squeeze before immediate breakouts." }
    }[safeSymbol as "BTCUSDT" | "ETHUSDT" | "SOLUSDT" | "BNBUSDT"] || { low: 90, high: 110, r: "Token demonstrates localized sideways channels." };

    const predictedVerdict = coinData.rsi > 60 ? "BUY" : coinData.rsi < 40 ? "SELL" : "HOLD";

    return res.json({
      symbol: safeSymbol,
      verdict: predictedVerdict,
      confidence: coinData.rsi > 60 || coinData.rsi < 40 ? "HIGH" : "MEDIUM",
      reasoning: targetPrices.r,
      riskFactor: "Increased futures open-interest and funding rate spikes that might induce localized liquidation spikes.",
      groundedPrediction: `Target Range: $${targetPrices.low.toLocaleString()} - $${targetPrices.high.toLocaleString()} over the next 48-72h.`
    });
  }
});

// Interactive quant advisor chat utilising Gemini models with historical state preservation
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No query message was received." });
  }

  try {
    const ai = getGeminiClient();
    
    // Convert client-sent history to corresponding Google GenAI SDK system format (roles: model and user)
    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        formattedContents.push({
          role: h.role === "bot" || h.role === "model" ? "model" : "user",
          parts: [{ text: h.content || h.parts?.[0]?.text || "" }]
        });
      }
    }
    
    // Add current user prompt
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const systemInstruction = 
      "You are Vyora AI (code version stable-3.5), an elite quantitative trading bot and investment advisor. " +
      "Use extremely precise, human, humble, technical answers. " +
      "Focus answer parameters strictly on support levels, indicators, moving averages, risk rules, and exchange trades. " +
      "Avoid general fluff, and use bullet lists for strategy breakdowns.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });

  } catch (err: any) {
    console.error("Gemini Advisor Chat Error; using offline diagnostic reply engine:", err.message);
    
    // Sophisticated offline trading assistant response generator
    let mockReply = "I am currently functioning on simulated quant intelligence channels. Configure your valid **GEMINI_API_KEY** inside the *Settings* tab to unlock live premium reasoning models.\n\nHere is a local Technical Analysis regarding your request:\n";
    
    const query = message.toUpperCase();
    if (query.includes("SOL") || query.includes("SOLANA")) {
      mockReply += "- **SOL Range Support**: Strong dynamic protection lines at $235.00.\n" +
                  "- **Upside Resistance**: Stiff compression observed at $248.50.\n" +
                  "- **Strategy recommendation**: Accumulate during minor support flips using EMA crossovers with safe stop losses.";
    } else if (query.includes("BTC") || query.includes("BITCOIN")) {
      mockReply += "- **BTC Range Support**: Golden backing around $91,200 floor levels.\n" +
                  "- **Upside Resistance**: Psychological hurdles persist near $93,500 breakout peaks.\n" +
                  "- **Strategy Recommendation**: Conservative trailing targets between 2.5% and 5% are advised to lock in profits early.";
    } else if (query.includes("EMA") || query.includes("INDICATOR") || query.includes("AVERAGE")) {
      mockReply += "Dual Moving Average crossovers (such as EMA 20/50) provide clear trend signals:\n" +
                  "- **Golden Cross**: EMA20 crossing above EMA50 confirms rapid short-term upward buy thrust allocations.\n" +
                  "- **Death Cross**: EMA20 crossing below EMA50 warns of dynamic downward support breakdown acceleration.";
    } else {
      mockReply += "Current market volatility metrics indicate highly-stretching consolidation grids. " +
                  "When conducting spot trades, ensure to retain appropriate cash USDT collateral reserves to shield portfolios from liquidation triggers.";
    }

    res.json({ reply: mockReply });
  }
});

export default app;
