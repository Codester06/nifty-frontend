// Trading-specific types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  stocks: PortfolioStock[];
  options: PortfolioOption[];
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  stocksValue: number;
  optionsValue: number;
  stocksGainLoss: number;
  optionsGainLoss: number;
  // Coin-based metrics
  totalCoinsInvested: number;    // Total coins invested across all positions
  totalCoinValue: number;        // Current total value in coins
  totalCoinPnL: number;          // Total P&L in coins
  totalCoinPnLPercent: number;   // Total P&L percentage in coins
  stocksCoinValue: number;       // Current stocks value in coins
  optionsCoinValue: number;      // Current options value in coins
  stocksCoinPnL: number;         // Stocks P&L in coins
  optionsCoinPnL: number;        // Options P&L in coins
}

export interface PortfolioStock {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  gainLoss: number;
  gainLossPercent: number;
  // Coin-based tracking
  coinInvested: number;      // Coins invested in this stock
  currentCoinValue: number;  // Current value in coins
  coinPnL: number;          // P&L in coins
  coinPnLPercent: number;   // P&L percentage in coins
  entryDate: Date;          // When the position was opened
}

export interface PortfolioOption {
  id: string;
  symbol: string;
  underlying: string;
  strike: number;
  expiry: string;
  optionType: 'CE' | 'PE';
  quantity: number; // In lots
  averagePrice: number; // Average premium paid
  currentPrice: number; // Current market price
  lotSize: number;
  totalValue: number; // Current value = currentPrice * quantity * lotSize
  investedValue: number; // Invested amount = averagePrice * quantity * lotSize
  gainLoss: number;
  gainLossPercent: number;
  entryDate: string;
  status: 'OPEN' | 'CLOSED';
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  // Coin-based tracking
  coinInvested: number;      // Coins invested in this option
  currentCoinValue: number;  // Current value in coins
  coinPnL: number;          // P&L in coins
  coinPnLPercent: number;   // P&L percentage in coins
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  stocks: string[];
  createdAt: string;
}