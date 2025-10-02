import { StructuredError, ErrorHandler } from '../utils/errorHandler';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export interface RetryState {
  attempt: number;
  nextRetryIn: number;
  isRetrying: boolean;
  lastError?: StructuredError;
}

export interface RetryOptions extends Partial<RetryConfig> {
  onRetry?: (attempt: number, error: StructuredError) => void;
  onSuccess?: () => void;
  onFailure?: (error: StructuredError) => void;
}

/**
 * Service for handling retry logic with exponential backoff
 */
export class RetryService {
  private static defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  };

  /**
   * Execute function with retry logic
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultConfig, ...options };
    let lastError: StructuredError;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fn();
        if (options.onSuccess) {
          options.onSuccess();
        }
        return result;
      } catch (error) {
        lastError = ErrorHandler.handleError(error);
        
        // Don't retry if error is not retryable or we've reached max retries
        if (!ErrorHandler.isRetryable(lastError) || attempt === config.maxRetries) {
          if (options.onFailure) {
            options.onFailure(lastError);
          }
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, config);
        
        if (options.onRetry) {
          options.onRetry(attempt + 1, lastError);
        }

        // Wait before retrying
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Create a retry manager for managing retry state
   */
  static createRetryManager<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): RetryManager<T> {
    return new RetryManager(fn, { ...this.defaultConfig, ...options });
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
    
    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Promise-based delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Retry manager class for managing retry state and operations
 */
export class RetryManager<T> {
  private config: RetryConfig & RetryOptions;
  private state: RetryState = {
    attempt: 0,
    nextRetryIn: 0,
    isRetrying: false,
  };
  private retryTimeout?: NodeJS.Timeout;
  private listeners: ((state: RetryState) => void)[] = [];

  constructor(
    private fn: () => Promise<T>,
    config: RetryConfig & RetryOptions
  ) {
    this.config = config;
  }

  /**
   * Execute the function with retry logic
   */
  async execute(): Promise<T> {
    this.updateState({ isRetrying: true, attempt: 0 });

    try {
      const result = await RetryService.executeWithRetry(this.fn, {
        ...this.config,
        onRetry: (attempt, error) => {
          const delay = RetryService['calculateDelay'](attempt - 1, this.config);
          this.updateState({
            attempt,
            nextRetryIn: delay,
            lastError: error,
          });
          
          // Start countdown
          this.startCountdown(delay);
          
          if (this.config.onRetry) {
            this.config.onRetry(attempt, error);
          }
        },
        onSuccess: () => {
          this.updateState({
            isRetrying: false,
            attempt: 0,
            nextRetryIn: 0,
            lastError: undefined,
          });
          
          if (this.config.onSuccess) {
            this.config.onSuccess();
          }
        },
        onFailure: (error) => {
          this.updateState({
            isRetrying: false,
            nextRetryIn: 0,
            lastError: error,
          });
          
          if (this.config.onFailure) {
            this.config.onFailure(error);
          }
        },
      });

      return result;
    } catch (error) {
      this.updateState({ isRetrying: false });
      throw error;
    }
  }

  /**
   * Cancel ongoing retry
   */
  cancel(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }
    
    this.updateState({
      isRetrying: false,
      attempt: 0,
      nextRetryIn: 0,
    });
  }

  /**
   * Get current retry state
   */
  getState(): RetryState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: RetryState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Check if currently retrying
   */
  isRetrying(): boolean {
    return this.state.isRetrying;
  }

  /**
   * Check if can retry
   */
  canRetry(): boolean {
    return this.state.attempt < this.config.maxRetries && 
           this.state.lastError && 
           ErrorHandler.isRetryable(this.state.lastError);
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<RetryState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Start countdown timer
   */
  private startCountdown(delay: number): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    const startTime = Date.now();
    const updateInterval = 100; // Update every 100ms

    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, delay - elapsed);
      
      this.updateState({ nextRetryIn: Math.ceil(remaining / 1000) });
      
      if (remaining > 0) {
        this.retryTimeout = setTimeout(updateCountdown, updateInterval);
      }
    };

    updateCountdown();
  }
}

/**
 * React hook for using retry functionality
 */
export const useRetry = <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
) => {
  const [retryManager] = React.useState(() => 
    RetryService.createRetryManager(fn, options)
  );
  
  const [state, setState] = React.useState<RetryState>(retryManager.getState());

  React.useEffect(() => {
    const unsubscribe = retryManager.subscribe(setState);
    return unsubscribe;
  }, [retryManager]);

  const execute = React.useCallback(() => {
    return retryManager.execute();
  }, [retryManager]);

  const cancel = React.useCallback(() => {
    retryManager.cancel();
  }, [retryManager]);

  const retry = React.useCallback(() => {
    if (retryManager.canRetry()) {
      return retryManager.execute();
    }
    return Promise.reject(state.lastError);
  }, [retryManager, state.lastError]);

  return {
    execute,
    cancel,
    retry,
    state,
    isRetrying: state.isRetrying,
    canRetry: retryManager.canRetry(),
  };
};

// Re-export React for the hook
import React from 'react';