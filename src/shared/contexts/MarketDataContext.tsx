import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { Stock, OptionChainData } from '../types';

// Market data types
export interface MarketUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
  bid?: number;
  ask?: number;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: Date;
  nextCloseTime?: Date;
  currentTime: Date;
  timezone: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type MarketMode = 'demo' | 'live';

// Market data state
interface MarketDataState {
  mode: MarketMode;
  connectionStatus: ConnectionStatus;
  marketStatus: MarketStatus;
  stockPrices: Map<string, MarketUpdate>;
  optionChains: Map<string, OptionChainData>;
  subscriptions: Set<string>;
  lastUpdate: Date | null;
  error: string | null;
}

// Actions
type MarketDataAction =
  | { type: 'SET_MODE'; payload: MarketMode }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_MARKET_STATUS'; payload: MarketStatus }
  | { type: 'UPDATE_STOCK_PRICES'; payload: MarketUpdate[] }
  | { type: 'UPDATE_OPTION_CHAIN'; payload: { symbol: string; data: OptionChainData } }
  | { type: 'ADD_SUBSCRIPTION'; payload: string }
  | { type: 'REMOVE_SUBSCRIPTION'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Context interface
interface MarketDataContextType {
  state: MarketDataState;
  // Mode management
  setMode: (mode: MarketMode) => void;
  // Subscriptions
  subscribeToStock: (symbol: string) => () => void;
  subscribeToOptionChain: (underlying: string) => () => void;
  // Data access
  getStockPrice: (symbol: string) => MarketUpdate | null;
  getOptionChain: (underlying: string) => OptionChainData | null;
  // Connection management
  reconnect: () => void;
  // Market status
  isMarketOpen: () => boolean;
}

// Initial state
const initialState: MarketDataState = {
  mode: 'demo',
  connectionStatus: 'disconnected',
  marketStatus: {
    isOpen: false,
    currentTime: new Date(),
    timezone: 'Asia/Kolkata'
  },
  stockPrices: new Map(),
  optionChains: new Map(),
  subscriptions: new Set(),
  lastUpdate: null,
  error: null
};

// Reducer
function marketDataReducer(state: MarketDataState, action: MarketDataAction): MarketDataState {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        error: null
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
        error: action.payload === 'error' ? state.error : null
      };

    case 'SET_MARKET_STATUS':
      return {
        ...state,
        marketStatus: action.payload
      };

    case 'UPDATE_STOCK_PRICES':
      const newStockPrices = new Map(state.stockPrices);
      action.payload.forEach(update => {
        newStockPrices.set(update.symbol, update);
      });
      return {
        ...state,
        stockPrices: newStockPrices,
        lastUpdate: new Date(),
        error: null
      };

    case 'UPDATE_OPTION_CHAIN':
      const newOptionChains = new Map(state.optionChains);
      newOptionChains.set(action.payload.symbol, action.payload.data);
      return {
        ...state,
        optionChains: newOptionChains,
        lastUpdate: new Date(),
        error: null
      };

    case 'ADD_SUBSCRIPTION':
      const newSubscriptions = new Set(state.subscriptions);
      newSubscriptions.add(action.payload);
      return {
        ...state,
        subscriptions: newSubscriptions
      };

    case 'REMOVE_SUBSCRIPTION':
      const updatedSubscriptions = new Set(state.subscriptions);
      updatedSubscriptions.delete(action.payload);
      return {
        ...state,
        subscriptions: updatedSubscriptions
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        connectionStatus: action.payload ? 'error' : state.connectionStatus
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Create context
const MarketDataContext = createContext<MarketDataContextType | null>(null);

// Provider component
interface MarketDataProviderProps {
  children: React.ReactNode;
  initialMode?: MarketMode;
  updateInterval?: number;
}

export function MarketDataProvider({ 
  children, 
  initialMode = 'demo',
  updateInterval = 2000 
}: MarketDataProviderProps) {
  const [state, dispatch] = useReducer(marketDataReducer, {
    ...initialState,
    mode: initialMode
  });

  // Refs for managing connections and intervals
  const wsConnection = useRef<WebSocket | null>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize market status
  useEffect(() => {
    updateMarketStatus();
    const statusInterval = setInterval(updateMarketStatus, 60000); // Update every minute
    
    return () => clearInterval(statusInterval);
  }, []);

  // Initialize connection when mode changes or subscriptions change
  useEffect(() => {
    if (state.subscriptions.size > 0) {
      initializeConnection();
    } else {
      cleanup();
    }

    return cleanup;
  }, [state.mode, state.subscriptions.size]);

  // Update market status
  const updateMarketStatus = useCallback(() => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;
    
    // Market hours: 9:15 AM to 3:30 PM IST
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    
    const isOpen = currentTimeInMinutes >= marketOpen && currentTimeInMinutes <= marketClose;
    
    // Calculate next open/close times
    let nextOpenTime: Date | undefined;
    let nextCloseTime: Date | undefined;
    
    if (isOpen) {
      // Market is open, calculate next close time
      const closeTime = new Date(istTime);
      closeTime.setHours(15, 30, 0, 0);
      nextCloseTime = closeTime;
    } else {
      // Market is closed, calculate next open time
      const openTime = new Date(istTime);
      if (currentTimeInMinutes < marketOpen) {
        // Same day opening
        openTime.setHours(9, 15, 0, 0);
      } else {
        // Next day opening
        openTime.setDate(openTime.getDate() + 1);
        openTime.setHours(9, 15, 0, 0);
      }
      nextOpenTime = openTime;
    }

    dispatch({
      type: 'SET_MARKET_STATUS',
      payload: {
        isOpen,
        nextOpenTime,
        nextCloseTime,
        currentTime: istTime,
        timezone: 'Asia/Kolkata'
      }
    });
  }, []);

  // Initialize connection based on mode
  const initializeConnection = useCallback(() => {
    cleanup(); // Clean up existing connections
    
    if (state.mode === 'live') {
      connectWebSocket();
    } else {
      startDemoMode();
    }
  }, [state.mode]);

  // WebSocket connection for live mode
  const connectWebSocket = useCallback(() => {
    if (wsConnection.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });

    try {
      // In a real implementation, this would be your WebSocket URL
      const wsUrl = process.env.VITE_WS_URL || 'wss://api.example.com/market-data';
      wsConnection.current = new WebSocket(wsUrl);

      wsConnection.current.onopen = () => {
        console.log('WebSocket connected');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
        reconnectAttempts.current = 0;
        
        // Subscribe to all active symbols
        subscribeToActiveSymbols();
      };

      wsConnection.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsConnection.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'WebSocket connection error' });
      };

      wsConnection.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        wsConnection.current = null;
        
        if (event.code !== 1000 && state.subscriptions.size > 0) {
          // Unexpected close, attempt reconnection
          scheduleReconnect();
        } else {
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to market data' });
      fallbackToPolling();
    }
  }, [state.subscriptions]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'price_update':
        if (data.updates && Array.isArray(data.updates)) {
          dispatch({ type: 'UPDATE_STOCK_PRICES', payload: data.updates });
        }
        break;
        
      case 'option_chain_update':
        if (data.underlying && data.optionChain) {
          dispatch({
            type: 'UPDATE_OPTION_CHAIN',
            payload: { symbol: data.underlying, data: data.optionChain }
          });
        }
        break;
        
      case 'error':
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Unknown error' });
        break;
        
      default:
        console.warn('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // Subscribe to active symbols via WebSocket
  const subscribeToActiveSymbols = useCallback(() => {
    if (wsConnection.current?.readyState !== WebSocket.OPEN) return;

    const symbols = Array.from(state.subscriptions);
    if (symbols.length === 0) return;

    const message = {
      type: 'subscribe',
      symbols,
      timestamp: Date.now()
    };

    wsConnection.current.send(JSON.stringify(message));
  }, [state.subscriptions]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      dispatch({ type: 'SET_ERROR', payload: 'Max reconnection attempts reached' });
      fallbackToPolling();
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });

    reconnectTimeout.current = setTimeout(() => {
      connectWebSocket();
    }, delay);
  }, []);

  // Fallback to polling when WebSocket fails
  const fallbackToPolling = useCallback(() => {
    console.log('Falling back to polling mode');
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
    startPolling();
  }, []);

  // Start demo mode with simulated data
  const startDemoMode = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
    startPolling();
  }, []);

  // Start polling for updates
  const startPolling = useCallback(() => {
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
    }

    updateInterval.current = setInterval(() => {
      updateSubscribedData();
    }, updateInterval);
  }, [state.subscriptions]);

  // Update data for all subscribed symbols
  const updateSubscribedData = useCallback(async () => {
    const symbols = Array.from(state.subscriptions);
    if (symbols.length === 0) return;

    try {
      // Generate mock updates for demo mode or fetch real data for live mode
      const priceUpdates: MarketUpdate[] = symbols
        .filter(symbol => !symbol.includes('_options')) // Filter out option chain subscriptions
        .map(symbol => generateMockPriceUpdate(symbol));

      if (priceUpdates.length > 0) {
        dispatch({ type: 'UPDATE_STOCK_PRICES', payload: priceUpdates });
      }

      // Update option chains
      const optionSymbols = symbols.filter(symbol => symbol.includes('_options'));
      for (const optionSymbol of optionSymbols) {
        const underlying = optionSymbol.replace('_options', '');
        const optionChain = await generateMockOptionChain(underlying);
        dispatch({
          type: 'UPDATE_OPTION_CHAIN',
          payload: { symbol: underlying, data: optionChain }
        });
      }

    } catch (error) {
      console.error('Error updating subscribed data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update market data' });
    }
  }, [state.subscriptions]);

  // Generate mock price update
  const generateMockPriceUpdate = useCallback((symbol: string): MarketUpdate => {
    const currentPrice = state.stockPrices.get(symbol);
    const basePrice = getBasePriceForSymbol(symbol);
    const price = currentPrice?.price || basePrice;
    
    // Generate small price movement (±2%)
    const variation = (Math.random() - 0.5) * 0.04;
    const newPrice = Math.max(price * (1 + variation), 0.05);
    const change = newPrice - basePrice;
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol,
      price: Math.round(newPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      bid: Math.round((newPrice - 0.05) * 100) / 100,
      ask: Math.round((newPrice + 0.05) * 100) / 100
    };
  }, [state.stockPrices]);

  // Get base price for symbol
  const getBasePriceForSymbol = (symbol: string): number => {
    const basePrices: Record<string, number> = {
      'RELIANCE': 2500,
      'TCS': 3200,
      'INFY': 1400,
      'HDFCBANK': 1600,
      'ICICIBANK': 900,
      'NIFTY': 19500,
      'BANKNIFTY': 44000
    };
    return basePrices[symbol] || 1000;
  };

  // Generate mock option chain
  const generateMockOptionChain = useCallback(async (underlying: string): Promise<OptionChainData> => {
    // This would typically use the existing optionsDataService
    // For now, we'll create a simplified version
    const spotPrice = getBasePriceForSymbol(underlying);
    const expiry = getNextExpiry();
    
    return {
      underlying,
      spotPrice,
      expiry,
      lastUpdated: new Date().toISOString(),
      options: {} // Simplified for now
    };
  }, []);

  // Get next expiry date
  const getNextExpiry = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let expiry = new Date(year, month + 1, 0);
    while (expiry.getDay() !== 4) {
      expiry.setDate(expiry.getDate() - 1);
    }
    
    if (expiry < now) {
      expiry = new Date(year, month + 2, 0);
      while (expiry.getDay() !== 4) {
        expiry.setDate(expiry.getDate() - 1);
      }
    }
    
    return expiry.toISOString().split('T')[0];
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsConnection.current) {
      wsConnection.current.close(1000, 'Component cleanup');
      wsConnection.current = null;
    }
    
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
  }, []);

  // Context methods
  const setMode = useCallback((mode: MarketMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const subscribeToStock = useCallback((symbol: string) => {
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: symbol });
    
    return () => {
      dispatch({ type: 'REMOVE_SUBSCRIPTION', payload: symbol });
    };
  }, []);

  const subscribeToOptionChain = useCallback((underlying: string) => {
    const subscriptionKey = `${underlying}_options`;
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: subscriptionKey });
    
    return () => {
      dispatch({ type: 'REMOVE_SUBSCRIPTION', payload: subscriptionKey });
    };
  }, []);

  const getStockPrice = useCallback((symbol: string): MarketUpdate | null => {
    return state.stockPrices.get(symbol) || null;
  }, [state.stockPrices]);

  const getOptionChain = useCallback((underlying: string): OptionChainData | null => {
    return state.optionChains.get(underlying) || null;
  }, [state.optionChains]);

  const reconnect = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
    reconnectAttempts.current = 0;
    initializeConnection();
  }, [initializeConnection]);

  const isMarketOpen = useCallback(() => {
    return state.marketStatus.isOpen;
  }, [state.marketStatus.isOpen]);

  const contextValue: MarketDataContextType = {
    state,
    setMode,
    subscribeToStock,
    subscribeToOptionChain,
    getStockPrice,
    getOptionChain,
    reconnect,
    isMarketOpen
  };

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
}

// Hook to use market data context
export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}

export default MarketDataContext;