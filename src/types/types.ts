export interface Stock {
  symbol: string;
  name: string;
  fullName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  mobile?: string;
  email?: string;
  role?: 'user' | 'admin' | 'superadmin';
  walletBalance: number;
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
}

export interface Portfolio {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface WishlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}