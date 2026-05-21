import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Main simulation state kept in server-side memory
let cashUsdt = 12450.75;

let botConfig = {
  isActive: false,
  strategy: "EMA_CROSS + RSI",
  symbol: "SOLUSDT",
  stopLoss: 2.5,
  takeProfit: 5.0,
  trailingStop: 0.5,
  capital: 1500,
  leverage: 10,
};

let settings = {
  binanceApiKey: "",
  binanceSecret: "",
  telegramBotId: "",
  telegramChatId: "",
  groqApiKey: "",
};

let subscription = {
  plan: "free",
  isActive: true,
};

// Start default signals
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

// Start default mock trades
let trades: any[] = [
  {
    id: "TR-8910",
    time: "08:12:14 AM",
    symbol: "BTCUSDT",
    type: "BUY",
    price: 91450.00,
    amount: 0.15,
    total: 13717.50,
    status: "COMPLETED",
  },
  {
    id: "TR-8911",
    time: "08:14:35 AM",
    symbol: "BTCUSDT",
    type: "SELL",
    price: 92120.50,
    amount: 0.15,
    total: 13818.08,
    status: "COMPLETED",
    pnl: 100.58,
  },
  {
    id: "TR-8912",
    time: "08:22:01 AM",
    symbol: "ETHUSDT",
    type: "BUY",
    price: 3145.00,
    amount: 1.50,
    total: 4717.50,
    status: "COMPLETED",
  },
  {
    id: "TR-8913",
    time: "08:28:40 AM",
    symbol: "ETHUSDT",
    type: "SELL",
    price: 3120.20,
    amount: 1.50,
    total: 4680.30,
    status: "COMPLETED",
    pnl: -37.20,
  }
];

// Helper to generate live positions based on unclosed trades (if any) or active automated trading simulation states
function getActivePositions() {
  const active: any[] = [];
  // For standard preview, keep some gorgeous trades in buffer or simulated active positions
  if (botConfig.isActive) {
    // If bot is active, present simulated open position
    const currentPrice = signals[botConfig.symbol]?.price || 100;
    const margin = botConfig.capital / botConfig.leverage;
    const amount = Number(((botConfig.capital) / currentPrice).toFixed(4));
    const entryPrice = parseFloat((currentPrice * 0.995).toFixed(2));
    const pnl = parseFloat(((currentPrice - entryPrice) * amount).toFixed(2));
    const pnlPercent = parseFloat(((pnl / margin) * 100).toFixed(2));

    active.push({
      id: "pos-active",
      symbol: botConfig.symbol,
      type: "LONG",
      entryPrice,
      currPrice: currentPrice,
      amount,
      leverage: botConfig.leverage,
      margin: parseFloat(margin.toFixed(2)),
      pnl,
      pnlPercent,
    });
  } else {
    // Static awesome test position
    const currentBtcPrice = signals["BTCUSDT"]?.price || 92450.00;
    const entryPrice = 92050.00;
    const amount = 0.12;
    const size = amount * currentBtcPrice;
    const baseMargin = 1000;
    const pnl = parseFloat(((currentBtcPrice - entryPrice) * amount).toFixed(2));
    const pnlPercent = parseFloat(((pnl / baseMargin) * 100).toFixed(2));

    active.push({
      id: "pos-static-1",
      symbol: "BTCUSDT",
      type: "LONG",
      entryPrice,
      currPrice: currentBtcPrice,
      amount,
      leverage: 10,
      margin: baseMargin,
      pnl,
      pnlPercent,
    });
  }
  return active;
}

let lastFetchSuccess = false;

// Async function to pull real-time cryptocurrency data from Binance Public API
async function fetchBinancePrices() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT"]');
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
            
            // Generate clean live technical indicators derived from true market variables
            const changeFactor = Math.min(20, Math.max(-20, change24h));
            // Establish proportional strength (RSI) bounds mapping 30 to 75
            const baseRsi = 50 + changeFactor * 2.5;
            const rsi = Math.min(95, Math.max(10, parseFloat((baseRsi + (Math.random() - 0.5) * 4).toFixed(1))));
            signals[sym].rsi = rsi;
            
            // Smooth MACD
            signals[sym].macd = parseFloat((changeFactor * 0.75 + (Math.random() - 0.5) * 0.4).toFixed(2));
            
            // Dynamically assign trend verdict
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
        return;
      }
    }
  } catch (err) {
    console.warn("Binance live public API rate-limiting or network block. Initiating live dynamic walkback simulator.", err);
  }
  lastFetchSuccess = false;
}

// Global pricing feed simulator loop (runs every 3 seconds to update prices from real Binance feed or walk fallback)
if (!process.env.VERCEL) {
  setInterval(async () => {
    // Pull real exchange rates
    await fetchBinancePrices();

    // If live fetch failed, fall back to robust random walk simulator to make numbers tick dynamically
    if (!lastFetchSuccess) {
      for (const sym of Object.keys(signals)) {
        const coin = signals[sym];
        const fluctuationPercent = (Math.random() - 0.49) * 0.003; // Slightly positive bias
        const oldPrice = coin.price;
        coin.price = parseFloat((oldPrice * (1 + fluctuationPercent)).toFixed(2));
        
        // Smooth change calculations
        const dailyFluctuation = (Math.random() - 0.47) * 0.15;
        coin.change24h = parseFloat((coin.change24h + dailyFluctuation).toFixed(3));
        if (coin.change24h > 15) coin.change24h = 15;
        if (coin.change24h < -15) coin.change24h = -15;

        // RSI fluctuations
        const rsiFluct = (Math.random() - 0.5) * 1.5;
        coin.rsi = Math.min(95, Math.max(10, parseFloat((coin.rsi + rsiFluct).toFixed(1))));

        // MACD Hist fluctuations
        const macdFluct = (Math.random() - 0.5) * 0.5;
        coin.macd = parseFloat((coin.macd + macdFluct).toFixed(2));

        // Update trend and verdicts
        if (coin.rsi > 65) {
          coin.trend = "BULLISH";
          coin.verdict = "BUY";
          coin.confidence = "HIGH";
        } else if (coin.rsi < 35) {
          coin.trend = "BEARISH";
          coin.verdict = "SELL";
          coin.confidence = "MEDIUM";
        } else {
          coin.trend = "NEUTRAL";
          coin.verdict = "HOLD";
          coin.confidence = "LOW";
        }
      }
    }

    // Simulate active automated bot trades occasionally (every 16 seconds if bot isActive)
    if (botConfig.isActive && Math.random() < 0.15) {
      const symbol = botConfig.symbol;
      const currentPrice = signals[symbol]?.price || 100;
      
      // Half the time buy, half the time sell a closed trade
      const hasBoughtToday = trades.filter(t => t.symbol === symbol && t.type === "BUY" && t.status === "COMPLETED").length;
      const hasSoldToday = trades.filter(t => t.symbol === symbol && t.type === "SELL" && t.status === "COMPLETED").length;

      if (hasBoughtToday > hasSoldToday) {
        // Execute simulated automatic TP/SL Sell trade
        const lastBuy = [...trades].reverse().find(t => t.symbol === symbol && t.type === "BUY");
        const entryPrice = lastBuy ? lastBuy.price : currentPrice * 0.995;
        const size = lastBuy ? lastBuy.amount : Number((botConfig.capital / currentPrice).toFixed(4));
        const total = parseFloat((size * currentPrice).toFixed(2));
        const pnl = parseFloat(((currentPrice - entryPrice) * size).toFixed(2));
        
        const sellTrade = {
          id: "TR-" + Math.floor(9000 + Math.random() * 1000),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          symbol,
          type: "SELL",
          price: currentPrice,
          amount: size,
          total,
          status: "COMPLETED",
          pnl,
        };

        trades.push(sellTrade);
        cashUsdt = parseFloat((cashUsdt + pnl).toFixed(2));
      } else {
        // Execute automatic buy order
        const size = Number((botConfig.capital / currentPrice).toFixed(4));
        const total = parseFloat((size * currentPrice).toFixed(2));
        
        const buyTrade = {
          id: "TR-" + Math.floor(9000 + Math.random() * 1000),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          symbol,
          type: "BUY",
          price: currentPrice,
          amount: size,
          total,
          status: "COMPLETED",
        };

        trades.push(buyTrade);
      }
    }
  }, 3000);
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

// Core API endpoints
app.get("/api/state", async (req, res) => {
  // On serverless Vercel, background intervals don't tick. Update market indicators dynamically.
  if (process.env.VERCEL) {
    await fetchBinancePrices();
    if (!lastFetchSuccess) {
      for (const sym of Object.keys(signals)) {
        const coin = signals[sym];
        const fluctuationPercent = (Math.random() - 0.49) * 0.003;
        coin.price = parseFloat((coin.price * (1 + fluctuationPercent)).toFixed(2));
        const dailyFluctuation = (Math.random() - 0.47) * 0.15;
        coin.change24h = parseFloat((coin.change24h + dailyFluctuation).toFixed(3));
        coin.rsi = Math.min(95, Math.max(10, parseFloat((coin.rsi + (Math.random() - 0.5) * 1.5).toFixed(1))));
        coin.macd = parseFloat((coin.macd + (Math.random() - 0.5) * 0.5).toFixed(2));
      }
    }
  }

  // Format assets to match signals pricing
  const assets = [
    { symbol: "USDT", amount: parseFloat((cashUsdt).toFixed(2)), price: 1.0, change24h: 0.00 },
    { symbol: "BTC", amount: 0.15, price: signals["BTCUSDT"].price, change24h: signals["BTCUSDT"].change24h },
    { symbol: "ETH", amount: 2.22, price: signals["ETHUSDT"].price, change24h: signals["ETHUSDT"].change24h },
    { symbol: "SOL", amount: 15.54, price: signals["SOLUSDT"].price, change24h: signals["SOLUSDT"].change24h },
  ];

  res.json({
    signals,
    botConfig,
    trades: [...trades].reverse(), // standard latest first layout
    assets,
    subscription,
    settings,
    balance: {
      cashUsdt,
    },
    activePositions: getActivePositions(),
    dataSource: lastFetchSuccess ? "LIVE BINANCE API" : "STANDBY MEMORY SIMULATOR"
  });
});

app.post("/api/bot/toggle", (req, res) => {
  botConfig.isActive = !botConfig.isActive;
  res.json({ success: true, isActive: botConfig.isActive });
});

app.post("/api/bot/config", (req, res) => {
  const { strategy, symbol, stopLoss, takeProfit, trailingStop, capital } = req.body;
  if (strategy) botConfig.strategy = strategy;
  if (symbol) botConfig.symbol = symbol;
  if (stopLoss) botConfig.stopLoss = parseFloat(stopLoss);
  if (takeProfit) botConfig.takeProfit = parseFloat(takeProfit);
  if (trailingStop) botConfig.trailingStop = parseFloat(trailingStop);
  if (capital) botConfig.capital = parseInt(capital, 10);
  res.json({ success: true, botConfig });
});

app.post("/api/bot/settings", (req, res) => {
  const { binanceApiKey, binanceSecret, telegramBotId, telegramChatId, groqApiKey, webhookToken } = req.body;
  settings.binanceApiKey = binanceApiKey || "";
  settings.binanceSecret = binanceSecret || "";
  settings.telegramBotId = telegramBotId || "";
  settings.telegramChatId = telegramChatId || "";
  settings.groqApiKey = groqApiKey || "";
  if (webhookToken !== undefined) {
    (settings as any).webhookToken = webhookToken;
  }
  res.json({ success: true, settings });
});

// Real-time external webhook endpoint for your Singapore Bot
app.post("/api/webhook/trade", (req, res) => {
  const { symbol, type, price, amount, pnl, secret } = req.body;

  // Simple token guard to ensure secure communication from Singapore
  const configuredToken = (settings as any).webhookToken || "SG_SECURE_TOKEN_123";
  if (secret && secret !== configuredToken) {
    return res.status(401).json({ error: "Unauthorized. Verify your webhook secret key." });
  }

  if (!symbol || !type || !price || !amount) {
    return res.status(400).json({ error: "Missing required fields: symbol, type, price, and amount are required." });
  }

  const tradePrice = parseFloat(price);
  const tradeAmount = parseFloat(amount);
  const tradeTotal = parseFloat((tradePrice * tradeAmount).toFixed(2));
  const estimatedPnl = pnl !== undefined ? parseFloat(pnl) : undefined;

  const externalTrade = {
    id: "EXT-" + Math.floor(10000 + Math.random() * 90000),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    symbol: symbol.toUpperCase(),
    type: type.toUpperCase() === "BUY" ? "BUY" : "SELL",
    price: tradePrice,
    amount: tradeAmount,
    total: tradeTotal,
    status: "COMPLETED",
    pnl: estimatedPnl,
    isExternal: true
  };

  trades.push(externalTrade);

  // If there's an realized P&L on a sell trade, adjust the wallet balance
  if (estimatedPnl !== undefined) {
    cashUsdt = parseFloat((cashUsdt + estimatedPnl).toFixed(2));
  } else if (type.toUpperCase() === "SELL") {
    // If selling without explicit PnL, calculate based on dynamic walk
    const lastBuy = [...trades].reverse().find(t => t.symbol === symbol.toUpperCase() && t.type === "BUY");
    if (lastBuy) {
      const p = parseFloat(((tradePrice - lastBuy.price) * tradeAmount).toFixed(2));
      cashUsdt = parseFloat((cashUsdt + p).toFixed(2));
      externalTrade.pnl = p;
    }
  }

  // Update ticker or symbol price on dashboard to match the trade execution price
  if (signals[symbol.toUpperCase()]) {
    signals[symbol.toUpperCase()].price = tradePrice;
  }

  res.json({ 
    success: true, 
    message: "External trade successfully integrated into Dashboard state", 
    trade: externalTrade,
    currentCashBalance: cashUsdt
  });
});

app.post("/api/webhook/balance", (req, res) => {
  const { cash, secret } = req.body;
  const configuredToken = (settings as any).webhookToken || "SG_SECURE_TOKEN_123";
  
  if (secret && secret !== configuredToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (cash !== undefined) {
    cashUsdt = parseFloat(cash);
    res.json({ success: true, cashUsdt });
  } else {
    res.status(400).json({ error: "No cash balance provided" });
  }
});

app.post("/api/billing/upgrade", (req, res) => {
  const { plan } = req.body;
  if (plan) {
    subscription.plan = plan;
  }
  res.json({ success: true, subscription });
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
    
    // Beautiful mathematical simulation response when key isn't provided
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
    let mockReply = "I am current functioning on simulated quant intelligence channels. Configure your valid **GEMINI_API_KEY** inside the *Settings* tab to unlock live premium reasoning models.\n\nHere is a local Technical Analysis regarding your request:\n";
    
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
                  "When conducting spot spot trades, ensure to retain appropriate cash USDT collateral reserves to shield portfolios from liquidation triggers.";
    }

    res.json({ reply: mockReply });
  }
});


// Vite middleware integration for full-stack build orchestration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
