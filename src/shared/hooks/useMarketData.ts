import { useEffect, useState, useCallback, useRef } from 'react';
import { MarketUpdate, OptionChainData } from '../types';
import { marketDataService } from '../services/marketDataService';

// Hook for subscribing to stock price updates
export function useStockPrices(symbols: string[]) {
  const [prices, setPrices] = useState<Map<string, MarketUpdate>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Subscribe to price updates
    subscriptionRef.current = marketDataService.subscribeToStockPrices(
      symbols,
      (updates: MarketUpdate[]) => {
        setPrices(prevPrices => {
          const newPrices = new Map(prevPrices);
          updates.forEach(update => {
            newPrices.set(update.symbol, update);
          });
          return newPrices;
        });
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount or symbol change
    return () => {
      if (subscriptionRef.current) {
        marketDataService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [symbols.join(',')]); // Re-run when symbols change

  // Get price for specific symbol
  const getPrice = useCallback((symbol: string): MarketUpdate | null => {
    return prices.get(symbol) || null;
  }, [prices]);

  return {
    prices,
    getPrice,
    isLoading,
    error
  };
}

// Hook for subscribing to option chain updates
export function useOptionChain(underlying: string) {
  const [optionChain, setOptionChain] = useState<OptionChainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!underlying) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Subscribe to option chain updates
    subscriptionRef.current = marketDataService.subscribeToOptionChain(
      underlying,
      (symbol: string, data: OptionChainData) => {
        if (symbol === underlying) {
          setOptionChain(data);
          setIsLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount or underlying change
    return () => {
      if (subscriptionRef.current) {
        marketDataService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [underlying]);

  return {
    optionChain,
    isLoading,
    error
  };
}

// Hook for market data connection status
export function useMarketDataConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to connection status changes
    unsubscribeRef.current = marketDataService.onConnectionStatusChange(
      (status: string) => {
        setConnectionStatus(status);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const reconnect = useCallback(() => {
    marketDataService.reconnect();
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error',
    reconnect
  };
}

// Hook for single stock price
export function useStockPrice(symbol: string) {
  const { prices, getPrice, isLoading, error } = useStockPrices([symbol]);
  
  return {
    price: getPrice(symbol),
    isLoading,
    error
  };
}

// Hook for market data mode switching
export function useMarketDataMode() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [isSwitching, setIsSwitching] = useState(false);

  const switchMode = useCallback(async (newMode: 'demo' | 'live') => {
    if (mode === newMode || isSwitching) {
      return;
    }

    setIsSwitching(true);
    try {
      await marketDataService.switchMode(newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Failed to switch market data mode:', error);
    } finally {
      setIsSwitching(false);
    }
  }, [mode, isSwitching]);

  return {
    mode,
    switchMode,
    isSwitching,
    isDemo: mode === 'demo',
    isLive: mode === 'live'
  };
}

export default {
  useStockPrices,
  useOptionChain,
  useMarketDataConnection,
  useStockPrice,
  useMarketDataMode
};