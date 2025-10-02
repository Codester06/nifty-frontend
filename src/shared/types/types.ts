export interface Stock {
  symbol: string;
  name: string;
  fullName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  description: string;
  hasOptions?: boolean;     // Whether options are available
  optionChain?: OptionChainData; // Cached option chain data
}

export interface User {
  id: string;
  name: string;
  username?: string;
  mobile?: string;
  email?: string;
  role?: 'user' | 'admin' | 'superadmin';
  walletBalance: number;
  coinBalance: number;
  totalCoinsEarned: number;
  totalCoinsPurchased: number;
  lastCoinUpdate?: Date;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'add_funds' | 'withdraw';
  stockSymbol?: string;
  stockName?: string;
  quantity?: number;
  price?: number;
  amount: number;
  timestamp: Date;
  instrumentType: 'stock' | 'option';
  optionDetails?: {
    strike: number;
    expiry: string;
    optionType: 'CE' | 'PE';
    premium: number;
    lotSize: number;
  };
}

export interface Portfolio {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  instrumentType: 'stock' | 'option';
  optionDetails?: {
    strike: number;
    expiry: string;
    optionType: 'CE' | 'PE';
    lotSize: number;
  };
  pnl?: number;
  pnlPercent?: number;
  // Coin-based tracking
  coinInvested: number;      // Total coins invested in this position
  currentCoinValue: number;  // Current value in coins
  coinPnL: number;          // P&L in coins
  coinPnLPercent: number;   // P&L percentage based on coins
  entryDate: Date;          // When the position was opened
}

export interface WishlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Re-export options types
export * from './options';

// Options Trading Types

export interface OptionContract {
  symbol: string;           // e.g., "NIFTY25OCT19400CE"
  underlying: string;       // e.g., "NIFTY"
  strike: number;          // Strike price
  expiry: string;          // Expiry date (ISO format)
  optionType: 'CE' | 'PE'; // Call or Put
  bid: number;             // Bid price
  ask: number;             // Ask price
  ltp: number;             // Last traded price
  volume: number;          // Trading volume
  oi: number;              // Open interest
  iv: number;              // Implied volatility
  lotSize: number;         // Lot size for the option
  greeks?: OptionGreeks;   // Greeks data
}

export interface OptionChainData {
  underlying: string;
  spotPrice: number;
  expiry: string;
  lastUpdated: string;
  options: {
    [strike: number]: {
      call: OptionContract;
      put: OptionContract;
    }
  };
}

export interface OptionGreeks {
  delta: number;    // Price sensitivity to underlying
  gamma: number;    // Delta sensitivity to underlying
  theta: number;    // Time decay
  vega: number;     // Volatility sensitivity to underlying
  rho?: number;     // Interest rate sensitivity (optional)
}

export interface OptionsOrder {
  userId: string;
  symbol: string;
  optionType: 'CE' | 'PE';
  strike: number;
  expiry: string;
  action: 'BUY' | 'SELL';
  quantity: number;        // In lots
  orderType: 'MARKET' | 'LIMIT';
  price?: number;          // For limit orders
  premium: number;         // Option premium
  totalCost: number;       // Premium × Lot Size × Quantity
}

export interface OptionsPosition {
  id: string;
  userId: string;
  symbol: string;
  optionType: 'CE' | 'PE';
  strike: number;
  expiry: string;
  quantity: number;        // In lots
  avgPrice: number;        // Average premium paid
  currentPrice: number;    // Current market price
  pnl: number;            // Profit/Loss
  pnlPercent: number;     // P&L percentage
  entryDate: string;
  status: 'OPEN' | 'CLOSED';
}

// Component Props Types

export interface OptionChainProps {
  underlying?: string; // Default to NIFTY
  variant: 'dashboard' | 'stock-detail';
  onOptionSelect?: (option: OptionContract) => void;
  className?: string;
}



export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock;
  type: 'buy' | 'sell';
  instrumentType: 'stock' | 'option';
  optionContract?: OptionContract;
  orderType: 'market' | 'limit';
}