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
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface PortfolioStock {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  gainLoss: number;
  gainLossPercent: number;
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