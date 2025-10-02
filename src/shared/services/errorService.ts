import { ErrorHandler, StructuredError, validateOptionsOrder, validateMarketHours } from '../utils/errorHandler';
import type { OptionsOrder, OptionChainData } from '../types';

/**
 * Service for handling errors across the options trading system
 * Provides centralized error handling, logging, and recovery mechanisms
 */
export class ErrorService {
  private static instance: ErrorService;
  private errorLog: StructuredError[] = [];
  private maxLogSize = 100;

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Handle and log an error
   */
  handleError(error: any, context?: Record<string, any>): StructuredError {
    const structuredError = ErrorHandler.handleError(error, context);
    this.logError(structuredError);
    return structuredError;
  }

  /**
   * Handle option chain loading errors with fallback strategies
   */
  async handleOptionChainError(
    error: any,
    underlying: string,
    fallbackData?: OptionChainData
  ): Promise<OptionChainData | null> {
    const structuredError = this.handleError(error, { underlying });
    
    // Try to get cached data first
    const cachedData = this.getCachedOptionChain(underlying);
    if (cachedData) {
      console.warn(`Using cached option chain data for ${underlying} due to error:`, structuredError.message);
      return cachedData;
    }

    // Use provided fallback data
    if (fallbackData) {
      console.warn(`Using fallback option chain data for ${underlying} due to error:`, structuredError.message);
      return fallbackData;
    }

    // Generate empty option chain as last resort
    if (structuredError.category === 'network' || structuredError.category === 'system') {
      return this.generateEmptyOptionChain(underlying);
    }

    return null;
  }

  /**
   * Handle trading errors with validation
   */
  handleTradingError(error: any, order?: Partial<OptionsOrder>): StructuredError {
    const structuredError = this.handleError(error, { order });

    // Add specific trading context
    if (order) {
      try {
        // Validate the order to provide more specific error messages
        if (order.userId && order.quantity && order.totalCost) {
          validateOptionsOrder({
            userId: order.userId,
            quantity: order.quantity,
            lotSize: 50, // Default lot size, should be passed from order
            totalCost: order.totalCost,
            userBalance: 0, // Should be fetched from user context
            expiry: order.expiry || new Date().toISOString(),
          });
        }
      } catch (validationError) {
        // Return the more specific validation error
        return this.handleError(validationError, { order });
      }
    }

    return structuredError;
  }

  /**
   * Handle API errors with response parsing
   */
  handleApiError(response: Response, context?: Record<string, any>): StructuredError {
    let errorCode = 'API_ERROR';
    let message = `API request failed with status ${response.status}`;

    // Map HTTP status codes to specific error types
    switch (response.status) {
      case 401:
        errorCode = 'AUTHENTICATION_ERROR';
        message = 'Authentication required';
        break;
      case 403:
        errorCode = 'UNAUTHORIZED';
        message = 'Access forbidden';
        break;
      case 404:
        errorCode = 'API_ERROR';
        message = 'Resource not found';
        break;
      case 429:
        errorCode = 'API_ERROR';
        message = 'Too many requests';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorCode = 'SYSTEM_ERROR';
        message = 'Server error';
        break;
      default:
        if (response.status >= 400 && response.status < 500) {
          errorCode = 'API_ERROR';
          message = 'Client error';
        } else if (response.status >= 500) {
          errorCode = 'SYSTEM_ERROR';
          message = 'Server error';
        }
    }

    return this.handleError(errorCode, {
      ...context,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });
  }

  /**
   * Validate market conditions and throw appropriate errors
   */
  validateMarketConditions(): void {
    try {
      validateMarketHours();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: StructuredError[];
  } {
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errorLog.forEach(error => {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byCategory,
      bySeverity,
      recent: this.errorLog.slice(-10), // Last 10 errors
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Check if a specific error type has occurred recently
   */
  hasRecentError(errorCode: string, withinMinutes: number = 5): boolean {
    const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);
    return this.errorLog.some(error => 
      error.code === errorCode && 
      error.context?.timestamp && 
      new Date(error.context.timestamp) > cutoff
    );
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: any): string {
    const structuredError = this.handleError(error);
    return structuredError.userMessage;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: any): boolean {
    const structuredError = this.handleError(error);
    return ErrorHandler.isRetryable(structuredError);
  }

  /**
   * Private method to log errors
   */
  private logError(error: StructuredError): void {
    // Add timestamp to context
    const errorWithTimestamp = {
      ...error,
      context: {
        ...error.context,
        timestamp: new Date().toISOString(),
      },
    };

    this.errorLog.push(errorWithTimestamp);

    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorWithTimestamp);
    }
  }

  /**
   * Get cached option chain data (placeholder implementation)
   */
  private getCachedOptionChain(underlying: string): OptionChainData | null {
    // In a real implementation, this would check localStorage, IndexedDB, or memory cache
    const cacheKey = `option_chain_${underlying}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const data = JSON.parse(cached);
        // Check if cache is not too old (e.g., 5 minutes)
        const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
        if (cacheAge < 5 * 60 * 1000) {
          return data;
        }
      } catch (e) {
        // Invalid cache data
        localStorage.removeItem(cacheKey);
      }
    }

    return null;
  }

  /**
   * Generate empty option chain as fallback
   */
  private generateEmptyOptionChain(underlying: string): OptionChainData {
    return {
      underlying,
      spotPrice: 0,
      expiry: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      options: {},
    };
  }

  /**
   * Cache option chain data
   */
  cacheOptionChain(data: OptionChainData): void {
    const cacheKey = `option_chain_${data.underlying}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache option chain data:', e);
    }
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();

// Utility functions for common error scenarios

/**
 * Wrapper for API calls with error handling
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    throw errorService.handleError(error, context);
  }
}

/**
 * Wrapper for option chain API calls with fallback
 */
export async function withOptionChainErrorHandling<T extends OptionChainData>(
  apiCall: () => Promise<T>,
  underlying: string,
  fallbackData?: T
): Promise<T | null> {
  try {
    const result = await apiCall();
    // Cache successful result
    errorService.cacheOptionChain(result);
    return result;
  } catch (error) {
    return errorService.handleOptionChainError(error, underlying, fallbackData) as Promise<T | null>;
  }
}

/**
 * Wrapper for trading operations with validation
 */
export async function withTradingErrorHandling<T>(
  tradingCall: () => Promise<T>,
  order?: Partial<OptionsOrder>
): Promise<T> {
  try {
    // Validate market conditions first
    errorService.validateMarketConditions();
    return await tradingCall();
  } catch (error) {
    throw errorService.handleTradingError(error, order);
  }
}