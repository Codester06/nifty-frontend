import { useState, useCallback, useRef, useEffect } from 'react';
import { ErrorHandler, StructuredError } from '../utils/errorHandler';

interface UseRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onError?: (error: StructuredError, retryCount: number) => void;
  onMaxRetriesReached?: (error: StructuredError) => void;
}

interface UseRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  retry: () => void;
  reset: () => void;
  isRetrying: boolean;
  retryCount: number;
  lastError: StructuredError | null;
  nextRetryIn: number;
  canRetry: boolean;
}

/**
 * Hook for managing retry logic with exponential backoff
 */
export function useRetry<T = any>(options: UseRetryOptions = {}): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    onError,
    onMaxRetriesReached,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<StructuredError | null>(null);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  const lastFunctionRef = useRef<(() => Promise<T>) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, [baseDelay, backoffFactor, maxDelay]);

  const startCountdown = useCallback((delay: number) => {
    const startTime = Date.now();
    const endTime = startTime + delay;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setNextRetryIn(remaining);
      
      if (remaining <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
  }, []);

  const executeWithRetry = useCallback(async (
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> => {
    try {
      const result = await fn();
      // Success - reset state
      setRetryCount(0);
      setLastError(null);
      setIsRetrying(false);
      setNextRetryIn(0);
      return result;
    } catch (error) {
      const structuredError = ErrorHandler.handleError(error);
      setLastError(structuredError);
      setRetryCount(attempt + 1);

      // Call error callback
      if (onError) {
        onError(structuredError, attempt + 1);
      }

      // Check if we should retry
      const shouldRetry = attempt < maxRetries && ErrorHandler.isRetryable(structuredError);

      if (!shouldRetry) {
        setIsRetrying(false);
        setNextRetryIn(0);
        
        if (attempt >= maxRetries && onMaxRetriesReached) {
          onMaxRetriesReached(structuredError);
        }
        
        throw structuredError;
      }

      // Calculate delay and retry
      const delay = calculateDelay(attempt);
      setIsRetrying(true);
      startCountdown(delay);

      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await executeWithRetry(fn, attempt + 1);
            resolve(result);
          } catch (retryError) {
            reject(retryError);
          }
        }, delay);
      });
    }
  }, [maxRetries, calculateDelay, startCountdown, onError, onMaxRetriesReached]);

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T> => {
    lastFunctionRef.current = fn;
    return executeWithRetry(fn);
  }, [executeWithRetry]);

  const retry = useCallback(() => {
    if (lastFunctionRef.current && retryCount < maxRetries) {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }

      setNextRetryIn(0);
      executeWithRetry(lastFunctionRef.current, retryCount);
    }
  }, [executeWithRetry, retryCount, maxRetries]);

  const reset = useCallback(() => {
    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // Reset state
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
    setNextRetryIn(0);
    lastFunctionRef.current = null;
  }, []);

  const canRetry = retryCount < maxRetries && lastError !== null && ErrorHandler.isRetryable(lastError);

  return {
    execute,
    retry,
    reset,
    isRetrying,
    retryCount,
    lastError,
    nextRetryIn,
    canRetry,
  };
}

/**
 * Hook for managing async operations with error handling and retry logic
 */
export function useAsyncOperation<T = any>(options: UseRetryOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StructuredError | null>(null);

  const retry = useRetry<T>({
    ...options,
    onError: (error, retryCount) => {
      setError(error);
      options.onError?.(error, retryCount);
    },
  });

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await retry.execute(fn);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      const structuredError = err as StructuredError;
      setError(structuredError);
      throw structuredError;
    } finally {
      setLoading(false);
    }
  }, [retry]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retry.reset();
  }, [retry]);

  return {
    data,
    loading,
    error,
    execute,
    retry: retry.retry,
    reset,
    isRetrying: retry.isRetrying,
    retryCount: retry.retryCount,
    nextRetryIn: retry.nextRetryIn,
    canRetry: retry.canRetry,
  };
}