import type { OptionsError, OptionChainData, OptionsApiResponse } from '../types';

// Error categories for better organization
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  NETWORK = 'network',
  MARKET = 'market',
  SYSTEM = 'system',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Structured error interface
export interface StructuredError {
  code: OptionsError | string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  context?: Record<string, any>;
}

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  canRecover: (error: StructuredError) => boolean;
  recover: (error: StructuredError, context?: any) => Promise<any> | any;
  fallback?: () => any;
}

/**
 * Comprehensive error handler for options trading system
 * Provides structured error handling, user-friendly messages, and recovery strategies
 */
export class ErrorHandler {
  private static errorMap: Record<string, Omit<StructuredError, 'context'>> = {
    // Authentication errors
    AUTHENTICATION_ERROR: {
      code: 'AUTHENTICATION_ERROR',
      message: 'User authentication failed',
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Please log in to access options trading',
      recoverable: true,
      retryable: false,
    },
    UNAUTHORIZED: {
      code: 'UNAUTHORIZED',
      message: 'User not authorized for this action',
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      userMessage: 'You are not authorized to perform this action',
      recoverable: true,
      retryable: false,
    },

    // Validation errors
    INSUFFICIENT_COINS: {
      code: 'INSUFFICIENT_COINS',
      message: 'Insufficient coin balance for trade',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Insufficient coin balance for this trade. Please add more coins to your wallet.',
      recoverable: true,
      retryable: false,
    },
    INVALID_LOT_SIZE: {
      code: 'INVALID_LOT_SIZE',
      message: 'Invalid lot size for option',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Quantity must be in multiples of the option lot size',
      recoverable: true,
      retryable: false,
    },
    INVALID_STRIKE: {
      code: 'INVALID_STRIKE',
      message: 'Invalid strike price',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Please select a valid strike price',
      recoverable: true,
      retryable: false,
    },
    OPTION_EXPIRED: {
      code: 'OPTION_EXPIRED',
      message: 'Option contract has expired',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.HIGH,
      userMessage: 'This option has expired and cannot be traded',
      recoverable: false,
      retryable: false,
    },

    // Market errors
    MARKET_CLOSED: {
      code: 'MARKET_CLOSED',
      message: 'Market is currently closed',
      category: ErrorCategory.MARKET,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Market is currently closed. Trading will resume during market hours.',
      recoverable: true,
      retryable: true,
    },
    MARKET_DATA_UNAVAILABLE: {
      code: 'MARKET_DATA_UNAVAILABLE',
      message: 'Market data is temporarily unavailable',
      category: ErrorCategory.MARKET,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Market data is temporarily unavailable. Please try again in a moment.',
      recoverable: true,
      retryable: true,
    },

    // Network errors
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Network connection failed. Please check your internet connection and try again.',
      recoverable: true,
      retryable: true,
    },
    TIMEOUT_ERROR: {
      code: 'TIMEOUT_ERROR',
      message: 'Request timed out',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Request timed out. Please try again.',
      recoverable: true,
      retryable: true,
    },
    API_ERROR: {
      code: 'API_ERROR',
      message: 'API request failed',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Service temporarily unavailable. Please try again later.',
      recoverable: true,
      retryable: true,
    },

    // System errors
    UNKNOWN_ERROR: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
      recoverable: true,
      retryable: true,
    },
    SYSTEM_ERROR: {
      code: 'SYSTEM_ERROR',
      message: 'System error occurred',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.CRITICAL,
      userMessage: 'A system error occurred. Please contact support if the problem persists.',
      recoverable: false,
      retryable: false,
    },
  };

  private static recoveryStrategies: ErrorRecoveryStrategy[] = [
    // Authentication recovery
    {
      canRecover: (error) => error.category === ErrorCategory.AUTHENTICATION,
      recover: () => {
        // Redirect to login or show login modal
        const loginUrl = '/auth/login';
        if (typeof window !== 'undefined') {
          window.location.href = loginUrl;
        }
        return null;
      },
    },

    // Network error recovery with cached data
    {
      canRecover: (error) => error.category === ErrorCategory.NETWORK && error.code === 'NETWORK_ERROR',
      recover: (error, context) => {
        // Try to return cached data if available
        if (context?.cachedData) {
          console.warn('Using cached data due to network error:', error.message);
          return context.cachedData;
        }
        return null;
      },
      fallback: () => ({
        underlying: 'NIFTY',
        spotPrice: 0,
        expiry: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        options: {},
      } as OptionChainData),
    },

    // Market closed recovery with demo data
    {
      canRecover: (error) => error.code === 'MARKET_CLOSED',
      recover: (error, context) => {
        // Switch to demo mode when market is closed
        if (context?.enableDemoMode) {
          console.info('Switching to demo mode due to market closure');
          return context.enableDemoMode();
        }
        return null;
      },
    },
  ];

  /**
   * Handle any error and convert it to a structured error
   */
  static handleError(error: any, context?: Record<string, any>): StructuredError {
    let structuredError: StructuredError;

    if (error instanceof Error) {
      // Handle standard JavaScript errors
      structuredError = this.mapJavaScriptError(error, context);
    } else if (typeof error === 'string') {
      // Handle string errors
      structuredError = this.mapStringError(error, context);
    } else if (error?.code && this.errorMap[error.code]) {
      // Handle known error codes
      structuredError = {
        ...this.errorMap[error.code],
        context,
      };
    } else {
      // Handle unknown errors
      structuredError = {
        ...this.errorMap.UNKNOWN_ERROR,
        context,
      };
    }

    // Log error for debugging
    this.logError(structuredError);

    return structuredError;
  }

  /**
   * Handle option chain specific errors
   */
  static handleOptionChainError(error: any, context?: { cachedData?: OptionChainData }): OptionChainData | null {
    const structuredError = this.handleError(error, context);

    // Try recovery strategies
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(structuredError)) {
        try {
          const result = strategy.recover(structuredError, context);
          if (result) {
            return result;
          }
        } catch (recoveryError) {
          console.error('Error recovery failed:', recoveryError);
        }
      }
    }

    // If no recovery worked, return fallback data
    if (structuredError.category === ErrorCategory.NETWORK) {
      const networkStrategy = this.recoveryStrategies.find(s => 
        s.canRecover(structuredError) && s.fallback
      );
      if (networkStrategy?.fallback) {
        return networkStrategy.fallback();
      }
    }

    return null;
  }

  /**
   * Handle trading specific errors
   */
  static handleTradingError(error: any, context?: Record<string, any>): string {
    const structuredError = this.handleError(error, context);
    return structuredError.userMessage;
  }

  /**
   * Handle API response errors
   */
  static handleApiResponse<T>(response: OptionsApiResponse<T>): T {
    if (!response.success && response.error) {
      throw this.handleError(response.error.code, { apiMessage: response.error.message });
    }
    
    if (!response.data) {
      throw this.handleError('API_ERROR', { message: 'No data received from API' });
    }

    return response.data;
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: StructuredError): boolean {
    return error.retryable;
  }

  /**
   * Check if an error is recoverable
   */
  static isRecoverable(error: StructuredError): boolean {
    return error.recoverable;
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: any): string {
    const structuredError = this.handleError(error);
    return structuredError.userMessage;
  }

  /**
   * Map JavaScript Error to structured error
   */
  private static mapJavaScriptError(error: Error, context?: Record<string, any>): StructuredError {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return { ...this.errorMap.NETWORK_ERROR, context };
    }

    if (message.includes('timeout')) {
      return { ...this.errorMap.TIMEOUT_ERROR, context };
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return { ...this.errorMap.AUTHENTICATION_ERROR, context };
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return { ...this.errorMap.UNAUTHORIZED, context };
    }

    // Default to unknown error
    return {
      ...this.errorMap.UNKNOWN_ERROR,
      message: error.message,
      context,
    };
  }

  /**
   * Map string error to structured error
   */
  private static mapStringError(error: string, context?: Record<string, any>): StructuredError {
    const errorCode = error.toUpperCase().replace(/\s+/g, '_');
    
    if (this.errorMap[errorCode]) {
      return { ...this.errorMap[errorCode], context };
    }

    return {
      ...this.errorMap.UNKNOWN_ERROR,
      message: error,
      context,
    };
  }

  /**
   * Log error for debugging and monitoring
   */
  private static logError(error: StructuredError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.category.toUpperCase()}] ${error.code}: ${error.message}`;
    
    if (error.context) {
      console[logLevel](logMessage, error.context);
    } else {
      console[logLevel](logMessage);
    }

    // In production, you might want to send errors to a monitoring service
    if (process.env.NODE_ENV === 'production' && error.severity === ErrorSeverity.CRITICAL) {
      // Send to error monitoring service (e.g., Sentry, LogRocket, etc.)
      // this.sendToMonitoring(error);
    }
  }

  /**
   * Get appropriate console log level based on error severity
   */
  private static getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
      default:
        return 'info';
    }
  }
}

// Utility functions for common error scenarios

/**
 * Validate options order and throw appropriate errors
 */
export function validateOptionsOrder(order: {
  userId: string;
  quantity: number;
  lotSize: number;
  totalCost: number;
  userBalance: number;
  expiry: string;
}): void {
  if (!order.userId) {
    throw ErrorHandler.handleError('AUTHENTICATION_ERROR');
  }

  if (order.quantity % order.lotSize !== 0) {
    throw ErrorHandler.handleError('INVALID_LOT_SIZE', { 
      quantity: order.quantity, 
      lotSize: order.lotSize 
    });
  }

  if (order.totalCost > order.userBalance) {
    throw ErrorHandler.handleError('INSUFFICIENT_COINS', {
      required: order.totalCost,
      available: order.userBalance,
    });
  }

  const expiryDate = new Date(order.expiry);
  if (expiryDate < new Date()) {
    throw ErrorHandler.handleError('OPTION_EXPIRED', { expiry: order.expiry });
  }
}

/**
 * Check if market is open and throw error if closed
 */
export function validateMarketHours(): void {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    hour12: false 
  });
  
  const marketOpen = '09:15:00';
  const marketClose = '15:30:00';
  
  if (currentTime < marketOpen || currentTime > marketClose) {
    throw ErrorHandler.handleError('MARKET_CLOSED', { currentTime });
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const structuredError = ErrorHandler.handleError(error);
      
      if (!ErrorHandler.isRetryable(structuredError) || attempt === maxRetries) {
        throw structuredError;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw ErrorHandler.handleError(lastError);
}