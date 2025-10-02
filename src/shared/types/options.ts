// Options Trading Constants and Utility Types

export const OPTION_TYPES = {
  CALL: 'CE' as const,
  PUT: 'PE' as const,
} as const;

export const ORDER_TYPES = {
  MARKET: 'MARKET' as const,
  LIMIT: 'LIMIT' as const,
} as const;

export const ORDER_ACTIONS = {
  BUY: 'BUY' as const,
  SELL: 'SELL' as const,
} as const;

export const POSITION_STATUS = {
  OPEN: 'OPEN' as const,
  CLOSED: 'CLOSED' as const,
} as const;

// Underlying assets with their lot sizes
export const UNDERLYING_ASSETS = {
  NIFTY: {
    symbol: 'NIFTY',
    name: 'NIFTY 50',
    lotSize: 50,
    tickSize: 0.05,
  },
  BANKNIFTY: {
    symbol: 'BANKNIFTY',
    name: 'BANK NIFTY',
    lotSize: 15,
    tickSize: 0.05,
  },
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    lotSize: 250,
    tickSize: 0.05,
  },
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    lotSize: 150,
    tickSize: 0.05,
  },
  INFY: {
    symbol: 'INFY',
    name: 'Infosys Limited',
    lotSize: 300,
    tickSize: 0.05,
  },
} as const;

// Market hours configuration
export const MARKET_HOURS = {
  OPEN: '09:15',
  CLOSE: '15:30',
  PRE_MARKET_START: '09:00',
  PRE_MARKET_END: '09:15',
  TIMEZONE: 'Asia/Kolkata',
} as const;

// Option chain display configuration
export const OPTION_CHAIN_CONFIG = {
  DEFAULT_STRIKES_COUNT: 20, // 10 above and 10 below ATM
  MAX_STRIKES_COUNT: 50,
  UPDATE_INTERVAL: 2000, // 2 seconds
  DEMO_MODE_KEY: 'options_demo_mode',
} as const;

// Greeks calculation constants
export const GREEKS_CONFIG = {
  RISK_FREE_RATE: 0.06, // 6% risk-free rate
  DIVIDEND_YIELD: 0.01, // 1% dividend yield
  VOLATILITY_DEFAULT: 0.20, // 20% default volatility
} as const;

// Utility types for option chain filtering
export type OptionMoneyness = 'ITM' | 'ATM' | 'OTM';
export type OptionChainFilter = {
  moneyness?: OptionMoneyness[];
  optionType?: ('CE' | 'PE')[];
  minVolume?: number;
  minOI?: number;
  strikeRange?: {
    min: number;
    max: number;
  };
};

// Error types for options trading
export type OptionsError = 
  | 'INSUFFICIENT_COINS'
  | 'INVALID_LOT_SIZE'
  | 'MARKET_CLOSED'
  | 'OPTION_EXPIRED'
  | 'INVALID_STRIKE'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'UNKNOWN_ERROR';

// API response types
export interface OptionsApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: OptionsError;
    message: string;
  };
}

export interface TradeResponse {
  tradeId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message: string;
  executedPrice?: number;
  executedQuantity?: number;
  timestamp: string;
}