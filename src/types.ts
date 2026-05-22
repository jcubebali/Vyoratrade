export interface MarketSignal {
  symbol: string;
  price: number;
  change24h: number;
  rsi: number;
  macd: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  verdict: "BUY" | "SELL" | "HOLD";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  aiAnalysis: string;
}

export interface Trade {
  id: string;
  time: string;
  symbol: string;
  type: "BUY" | "SELL";
  price: number;
  amount: number;
  total: number;
  status: "COMPLETED" | "PENDING";
  pnl?: number;
}

export interface Asset {
  symbol: string;
  amount: number;
  price: number;
  change24h: number;
}

export interface BotConfig {
  isActive: boolean;
  strategy: string;
  symbol: string;
  stopLoss: number;
  takeProfit: number;
  trailingStop: number;
  capital: number;
  leverage: number;
}

export interface VyoraSettings {
  binanceApiKey: string;
  binanceSecret: string;
  telegramBotId: string;
  telegramChatId: string;
  groqApiKey: string;
  webhookToken?: string;
}

export interface Subscription {
  plan: string;
  isActive: boolean;
}

export interface CompleteState {
  signals: Record<string, MarketSignal>;
  botConfig: BotConfig;
  trades: Trade[];
  assets: Asset[];
  subscription: Subscription;
  settings: VyoraSettings;
  balance: {
    cashUsdt: number;
  };
  activePositions: any[];
  dataSource?: string;
  binanceError?: string | null;
}
