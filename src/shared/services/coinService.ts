import type {
  CoinTransaction,
  CoinPurchase,
  CoinBalance,
  CoinDeductionRequest,
  CoinAdditionRequest,
  CoinPurchaseRequest,
  CoinTransactionFilters,
  CoinError,
  CoinErrorType,
  CoinValidationResult,
  CoinAmountValidation,
  CoinBalanceValidation,
  CoinServiceResponse,
  CoinTransactionResponse,
  CoinPurchaseResponse,
  CoinHistoryResponse,
  COIN_CONSTANTS
} from '../types/coin';
import { paymentGatewayService } from './paymentGatewayService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

class CoinService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('nifty-bulk-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<CoinServiceResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        const error: CoinError = {
          name: 'CoinError',
          message: data.error || `HTTP error! status: ${response.status}`,
          type: data.type || 'TRANSACTION_FAILED' as any, // Fallback to avoid runtime error
          code: data.code || response.status.toString(),
          details: data.details
        };
        
        return {
          success: false,
          error,
          message: error.message
        };
      }

      return {
        success: true,
        data,
        message: data.message
      };
    } catch (error) {
      const coinError: CoinError = {
        name: 'CoinError',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'TRANSACTION_FAILED' as any, // Fallback to avoid runtime error
        code: 'PARSE_ERROR'
      };

      return {
        success: false,
        error: coinError,
        message: coinError.message
      };
    }
  }

  // Balance Management Methods

  async getCoinBalance(userId: string): Promise<CoinServiceResponse<number>> {
    const response = await fetch(`${API_BASE_URL}/coins/balance/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<number>(response);
  }

  async getCoinBalanceDetails(userId: string): Promise<CoinServiceResponse<CoinBalance>> {
    const response = await fetch(`${API_BASE_URL}/coins/balance/${userId}/details`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<CoinBalance>(response);
  }

  async deductCoins(request: CoinDeductionRequest): Promise<CoinTransactionResponse> {
    const response = await fetch(`${API_BASE_URL}/coins/deduct`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });
    
    const result = await this.handleResponse<CoinTransaction>(response);
    return {
      ...result,
      newBalance: result.data?.balance || 0
    };
  }

  async addCoins(request: CoinAdditionRequest): Promise<CoinTransactionResponse> {
    const response = await fetch(`${API_BASE_URL}/coins/add`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });
    
    const result = await this.handleResponse<CoinTransaction>(response);
    return {
      ...result,
      newBalance: result.data?.balance || 0
    };
  }

  // Validation Methods

  async validateSufficientBalance(userId: string, requiredAmount: number): Promise<CoinServiceResponse<CoinBalanceValidation>> {
    const balanceResult = await this.getCoinBalance(userId);
    
    if (!balanceResult.success || balanceResult.data === undefined) {
      return {
        success: false,
        error: balanceResult.error,
        message: 'Failed to retrieve balance for validation'
      };
    }

    const currentBalance = balanceResult.data;
    const hasSufficientBalance = currentBalance >= requiredAmount;
    const shortfall = hasSufficientBalance ? undefined : requiredAmount - currentBalance;

    const validation: CoinBalanceValidation = {
      currentBalance,
      requiredAmount,
      hasSufficientBalance,
      shortfall
    };

    return {
      success: true,
      data: validation
    };
  }

  validateCoinAmount(amount: number): CoinAmountValidation {
    const minAmount = COIN_CONSTANTS.MIN_TRANSACTION_AMOUNT;
    const maxAmount = COIN_CONSTANTS.MAX_TRANSACTION_AMOUNT;
    
    const isValid = amount >= minAmount && amount <= maxAmount && Number.isInteger(amount);
    
    let message: string | undefined;
    if (amount < minAmount) {
      message = `Amount must be at least ${minAmount} coins`;
    } else if (amount > maxAmount) {
      message = `Amount cannot exceed ${maxAmount} coins`;
    } else if (!Number.isInteger(amount)) {
      message = 'Amount must be a whole number';
    }

    return {
      amount,
      minAmount,
      maxAmount,
      isValid,
      message
    };
  }

  validatePurchaseAmount(amount: number): CoinAmountValidation {
    const minAmount = COIN_CONSTANTS.MIN_PURCHASE_AMOUNT;
    const maxAmount = COIN_CONSTANTS.MAX_PURCHASE_AMOUNT;
    
    const isValid = amount >= minAmount && amount <= maxAmount && Number.isInteger(amount);
    
    let message: string | undefined;
    if (amount < minAmount) {
      message = `Purchase amount must be at least ${minAmount} coins`;
    } else if (amount > maxAmount) {
      message = `Purchase amount cannot exceed ${maxAmount} coins`;
    } else if (!Number.isInteger(amount)) {
      message = 'Purchase amount must be a whole number';
    }

    return {
      amount,
      minAmount,
      maxAmount,
      isValid,
      message
    };
  }

  // Transaction History Methods

  async getCoinTransactionHistory(
    userId: string, 
    filters?: CoinTransactionFilters
  ): Promise<CoinHistoryResponse> {
    const url = new URL(`${API_BASE_URL}/coins/transactions/${userId}`);
    
    if (filters) {
      if (filters.type) url.searchParams.append('type', filters.type);
      if (filters.status) url.searchParams.append('status', filters.status);
      if (filters.dateFrom) url.searchParams.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) url.searchParams.append('dateTo', filters.dateTo.toISOString());
      if (filters.limit) url.searchParams.append('limit', filters.limit.toString());
      if (filters.offset) url.searchParams.append('offset', filters.offset.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    const result = await this.handleResponse<{
      transactions: CoinTransaction[];
      totalCount: number;
      hasMore: boolean;
    }>(response);

    return {
      ...result,
      data: result.data?.transactions || [],
      totalCount: result.data?.totalCount || 0,
      hasMore: result.data?.hasMore || false
    };
  }

  async getCoinTransaction(transactionId: string): Promise<CoinServiceResponse<CoinTransaction>> {
    const response = await fetch(`${API_BASE_URL}/coins/transaction/${transactionId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<CoinTransaction>(response);
  }

  // Purchase Methods

  async purchaseCoins(request: CoinPurchaseRequest): Promise<CoinPurchaseResponse> {
    const response = await fetch(`${API_BASE_URL}/coins/purchase`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });
    
    const result = await this.handleResponse<{
      purchase: CoinPurchase;
      newBalance: number;
      paymentUrl?: string;
    }>(response);

    return {
      ...result,
      data: result.data?.purchase,
      newBalance: result.data?.newBalance || 0,
      paymentUrl: result.data?.paymentUrl
    };
  }

  async getCoinPurchaseHistory(
    userId: string, 
    limit?: number, 
    offset?: number
  ): Promise<CoinServiceResponse<CoinPurchase[]>> {
    const url = new URL(`${API_BASE_URL}/coins/purchases/${userId}`);
    if (limit) url.searchParams.append('limit', limit.toString());
    if (offset) url.searchParams.append('offset', offset.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<CoinPurchase[]>(response);
  }

  async verifyPurchasePayment(purchaseId: string, paymentId: string): Promise<CoinServiceResponse<CoinPurchase>> {
    const response = await fetch(`${API_BASE_URL}/coins/purchase/${purchaseId}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ paymentId }),
    });
    return this.handleResponse<CoinPurchase>(response);
  }

  // Utility Methods

  async refreshBalance(userId: string): Promise<CoinServiceResponse<number>> {
    const response = await fetch(`${API_BASE_URL}/coins/balance/${userId}/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<number>(response);
  }

  async getBalanceHistory(userId: string, days: number = 30): Promise<CoinServiceResponse<Array<{date: Date, balance: number}>>> {
    const response = await fetch(`${API_BASE_URL}/coins/balance/${userId}/history?days=${days}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Array<{date: Date, balance: number}>>(response);
  }

  // Error Handling Utilities

  createCoinError(type: CoinErrorType, message: string, code?: string, details?: Record<string, any>): CoinError {
    return {
      name: 'CoinError',
      message,
      type,
      code: code || type,
      details
    };
  }

  isCoinError(error: any): error is CoinError {
    return error && typeof error === 'object' && error.name === 'CoinError' && 'type' in error;
  }

  // Local Storage Utilities (for caching balance)

  private getCachedBalance(userId: string): number | null {
    try {
      const cached = localStorage.getItem(`coin_balance_${userId}`);
      if (cached) {
        const { balance, timestamp } = JSON.parse(cached);
        // Cache valid for 30 seconds
        if (Date.now() - timestamp < 30000) {
          return balance;
        }
      }
    } catch (error) {
      console.warn('Failed to read cached balance:', error);
    }
    return null;
  }

  private setCachedBalance(userId: string, balance: number): void {
    try {
      localStorage.setItem(`coin_balance_${userId}`, JSON.stringify({
        balance,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache balance:', error);
    }
  }

  async getCoinBalanceWithCache(userId: string): Promise<CoinServiceResponse<number>> {
    // Try cache first
    const cached = this.getCachedBalance(userId);
    if (cached !== null) {
      return {
        success: true,
        data: cached
      };
    }

    // Fetch from API
    const result = await this.getCoinBalance(userId);
    if (result.success && result.data !== undefined) {
      this.setCachedBalance(userId, result.data);
    }

    return result;
  }
}

export const coinService = new CoinService();
export default coinService;