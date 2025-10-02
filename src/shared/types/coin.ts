// Coin System Types

export interface CoinTransaction {
  id: string;
  userId: string;
  type: 'DEBIT' | 'CREDIT' | 'PURCHASE';
  amount: number;
  balance: number; // Balance after transaction
  reason: string;
  relatedTradeId?: string;
  timestamp: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface CoinPurchase {
  id: string;
  userId: string;
  amount: number; // Number of coins purchased
  cost: number; // Real money cost in INR
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING';
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: Date;
}

export interface CoinBalance {
  userId: string;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  lastUpdated: Date;
}

// Coin Service Types

export interface CoinDeductionRequest {
  userId: string;
  amount: number;
  reason: string;
  relatedTradeId?: string;
}

export interface CoinAdditionRequest {
  userId: string;
  amount: number;
  reason: string;
  relatedTradeId?: string;
}

export interface CoinPurchaseRequest {
  userId: string;
  amount: number;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING';
  paymentDetails: PaymentDetails;
}

export interface PaymentDetails {
  paymentId: string;
  amount: number; // Real money amount
  currency: string;
  gateway: string;
  transactionId?: string;
}

export interface CoinTransactionFilters {
  type?: 'DEBIT' | 'CREDIT' | 'PURCHASE';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// Coin Error Types

export enum CoinErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  BALANCE_MISMATCH = 'BALANCE_MISMATCH'
}

export interface CoinError extends Error {
  type: CoinErrorType;
  code: string;
  details?: Record<string, any>;
}

// Validation Schemas

export interface CoinValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface CoinAmountValidation {
  amount: number;
  minAmount: number;
  maxAmount: number;
  isValid: boolean;
  message?: string;
}

export interface CoinBalanceValidation {
  currentBalance: number;
  requiredAmount: number;
  hasSufficientBalance: boolean;
  shortfall?: number;
}

// Service Response Types

export interface CoinServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: CoinError;
  message?: string;
}

export interface CoinTransactionResponse extends CoinServiceResponse<CoinTransaction> {
  newBalance: number;
}

export interface CoinPurchaseResponse extends CoinServiceResponse<CoinPurchase> {
  newBalance: number;
  paymentUrl?: string; // For redirect-based payments
}

export interface CoinHistoryResponse extends CoinServiceResponse<CoinTransaction[]> {
  totalCount: number;
  hasMore: boolean;
}

// Constants

export const COIN_CONSTANTS = {
  MIN_PURCHASE_AMOUNT: 100,
  MAX_PURCHASE_AMOUNT: 100000,
  MIN_TRANSACTION_AMOUNT: 1,
  MAX_TRANSACTION_AMOUNT: 50000,
  DEFAULT_STARTING_BALANCE: 0,
  TRANSACTION_REASONS: {
    TRADE_BUY: 'Trade Purchase',
    TRADE_SELL: 'Trade Sale',
    PURCHASE: 'Coin Purchase',
    REFUND: 'Trade Refund',
    BONUS: 'Bonus Coins',
    ADJUSTMENT: 'Balance Adjustment'
  }
} as const;

export type CoinTransactionReason = typeof COIN_CONSTANTS.TRANSACTION_REASONS[keyof typeof COIN_CONSTANTS.TRANSACTION_REASONS];