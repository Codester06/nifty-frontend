import { WebSocketService, createWebSocketService, WSEventHandlers } from './webSocketService';
import { MarketUpdate, OptionChainData, Stock } from '../types';
import { optionsDataService } from './optionsDataService';
import { realTimePriceService } from './realTimePriceService';
import { dataCacheService } from './dataCacheService';
import { demoDataService } from './demoDataService';

// Market data service configuration
export interface MarketDataConfig {
  mode: 'demo' | 'live';
  updateInterval: number;
  enableWebSocket: boolean;
  wsUrl?: string;
  fallbackToPolling: boolean;
}

// Subscription callback types
export type PriceUpdateCallback = (updates: MarketUpdate[]) => void;
export type OptionChainCallback = (underlying: string, data: OptionChainData) => void;
export type ConnectionStatusCallback = (status: string) => void;

// Subscription management
interface Subscription {
  id: string;
  type: 'stock' | 'option_chain';
  symbols: string[];
  callback: PriceUpdateCallback | OptionChainCallback;
}

/**
 * Centralized market data service that manages real-time updates
 * Supports both WebSocket and polling modes with automatic fallback
 */
export class MarketDataService {
  private config: MarketDataConfig;
  private wsService: WebSocketService | null = null;
  private subscriptions = new Map<string, Subscription>();
  private pollingIntervals = new Map<string, NodeJS.Timeout>();
  private connectionStatusCallbacks = new Set<ConnectionStatusCallback>();
  private isInitialized = false;
  private currentMode: 'demo' | 'live' = 'demo';
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  constructor(config: Partial<MarketDataConfig> = {}) {
    this.config = {
      mode: 'demo',
      updateInterval: 2000,
      enableWebSocket: true,
      fallbackToPolling: true,
      ...config
    };
    
    this.currentMode = this.config.mode;
  }

  /**
   * Initialize the market data service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.config.enableWebSocket && this.currentMode === 'live') {
        await this.initializeWebSocket();
      } else {
        this.initializePolling();
      }
      
      this.isInitialized = true;
      console.log(`Market data service initialized in ${this.currentMode} mode`);
    } catch (error) {
      console.error('Failed to initialize market data service:', error);
      
      if (this.config.fallbackToPolling) {
        console.log('Falling back to polling mode');
        this.initializePolling();
        this.isInitialized = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * Switch between demo and live modes
   */
  async switchMode(mode: 'demo' | 'live'): Promise<void> {
    if (this.currentMode === mode) {
      return;
    }

    console.log(`Switching from ${this.currentMode} to ${mode} mode`);
    
    // Store current subscriptions
    const currentSubscriptions = Array.from(this.subscriptions.values());
    
    // Cleanup current connections
    this.cleanup();
    
    // Update mode
    this.currentMode = mode;
    this.config.mode = mode;
    
    // Start/stop demo data service based on mode
    if (mode === 'demo') {
      demoDataService.start();
    } else {
      demoDataService.stop();
    }
    
    // Reinitialize with new mode
    this.isInitialized = false;
    await this.initialize();
    
    // Restore subscriptions
    for (const subscription of currentSubscriptions) {
      if (subscription.type === 'stock') {
        this.subscribeToStockPrices(
          subscription.symbols,
          subscription.callback as PriceUpdateCallback
        );
      } else if (subscription.type === 'option_chain') {
        this.subscribeToOptionChain(
          subscription.symbols[0], // Option chain subscriptions have single symbol
          subscription.callback as OptionChainCallback
        );
      }
    }
  }

  /**
   * Subscribe to real-time stock price updates
   */
  subscribeToStockPrices(symbols: string[], callback: PriceUpdateCallback): string {
    const subscriptionId = `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: Subscription = {
      id: subscriptionId,
      type: 'stock',
      symbols,
      callback
    };
    
    this.subscriptions.set(subscriptionId, subscription);
    
    // Subscribe via WebSocket if available
    if (this.wsService?.isConnected()) {
      this.wsService.subscribe(symbols, 'stock_prices');
    } else {
      // Start polling for these symbols
      this.startPollingForSymbols(symbols, 'stock');
    }
    
    return subscriptionId;
  }

  /**
   * Subscribe to option chain updates
   */
  subscribeToOptionChain(underlying: string, callback: OptionChainCallback): string {
    const subscriptionId = `option_${underlying}_${Date.now()}`;
    
    const subscription: Subscription = {
      id: subscriptionId,
      type: 'option_chain',
      symbols: [underlying],
      callback
    };
    
    this.subscriptions.set(subscriptionId, subscription);
    
    // Subscribe via WebSocket if available
    if (this.wsService?.isConnected()) {
      this.wsService.subscribe([underlying], 'option_chain');
    } else {
      // Start polling for this option chain
      this.startPollingForSymbols([underlying], 'option_chain');
    }
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }
    
    // Remove subscription
    this.subscriptions.delete(subscriptionId);
    
    // Check if any other subscriptions need these symbols
    const stillNeededSymbols = this.getSymbolsStillNeeded(subscription.symbols, subscription.type);
    const symbolsToUnsubscribe = subscription.symbols.filter(
      symbol => !stillNeededSymbols.includes(symbol)
    );
    
    // Unsubscribe from WebSocket if connected
    if (this.wsService?.isConnected() && symbolsToUnsubscribe.length > 0) {
      const dataType = subscription.type === 'stock' ? 'stock_prices' : 'option_chain';
      this.wsService.unsubscribe(symbolsToUnsubscribe, dataType);
    }
    
    // Stop polling if no longer needed
    this.stopPollingForSymbols(symbolsToUnsubscribe, subscription.type);
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatusChange(callback: ConnectionStatusCallback): () => void {
    this.connectionStatusCallbacks.add(callback);
    
    // Immediately call with current status
    callback(this.connectionStatus);
    
    return () => {
      this.connectionStatusCallbacks.delete(callback);
    };
  }

  /**
   * Force reconnection
   */
  async reconnect(): Promise<void> {
    if (this.wsService) {
      this.wsService.disconnect();
      await this.initializeWebSocket();
    }
  }

  /**
   * Get current market data for a symbol
   */
  getCurrentPrice(symbol: string): MarketUpdate | null {
    return dataCacheService.getStockPrice(symbol);
  }

  /**
   * Get current option chain data
   */
  getCurrentOptionChain(underlying: string): OptionChainData | null {
    return dataCacheService.getOptionChain(underlying);
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    this.cleanup();
    this.subscriptions.clear();
    this.connectionStatusCallbacks.clear();
    this.isInitialized = false;
  }

  /**
   * Initialize WebSocket connection
   */
  private async initializeWebSocket(): Promise<void> {
    const handlers: WSEventHandlers = {
      onConnect: () => {
        this.setConnectionStatus('connected');
        console.log('WebSocket connected');
      },
      
      onDisconnect: (code, reason) => {
        this.setConnectionStatus('disconnected');
        console.log('WebSocket disconnected:', code, reason);
        
        // Fallback to polling if enabled
        if (this.config.fallbackToPolling && code !== 1000) {
          console.log('Falling back to polling mode');
          this.initializePolling();
        }
      },
      
      onError: (error) => {
        this.setConnectionStatus('error');
        console.error('WebSocket error:', error);
      },
      
      onPriceUpdate: (updates) => {
        this.handlePriceUpdates(updates);
      },
      
      onOptionChainUpdate: (underlying, data) => {
        this.handleOptionChainUpdate(underlying, data);
      },
      
      onConnectionStateChange: (state) => {
        this.setConnectionStatus(state);
      }
    };

    this.wsService = createWebSocketService(this.config.wsUrl, handlers);
    this.setConnectionStatus('connecting');
    
    await this.wsService.connect();
  }

  /**
   * Initialize polling mode
   */
  private initializePolling(): void {
    this.setConnectionStatus('connected');
    
    // Start demo data service if in demo mode
    if (this.currentMode === 'demo') {
      demoDataService.start();
    }
    
    console.log('Polling mode initialized');
  }

  /**
   * Start polling for specific symbols
   */
  private startPollingForSymbols(symbols: string[], type: 'stock' | 'option_chain'): void {
    symbols.forEach(symbol => {
      const intervalKey = `${type}_${symbol}`;
      
      // Don't start if already polling
      if (this.pollingIntervals.has(intervalKey)) {
        return;
      }
      
      const interval = setInterval(async () => {
        try {
          if (type === 'stock') {
            await this.pollStockPrice(symbol);
          } else {
            await this.pollOptionChain(symbol);
          }
        } catch (error) {
          console.error(`Error polling ${type} data for ${symbol}:`, error);
        }
      }, this.config.updateInterval);
      
      this.pollingIntervals.set(intervalKey, interval);
    });
  }

  /**
   * Stop polling for specific symbols
   */
  private stopPollingForSymbols(symbols: string[], type: 'stock' | 'option_chain'): void {
    symbols.forEach(symbol => {
      const intervalKey = `${type}_${symbol}`;
      const interval = this.pollingIntervals.get(intervalKey);
      
      if (interval) {
        clearInterval(interval);
        this.pollingIntervals.delete(intervalKey);
      }
    });
  }

  /**
   * Poll stock price data
   */
  private async pollStockPrice(symbol: string): Promise<void> {
    try {
      let priceUpdate: MarketUpdate;
      
      if (this.currentMode === 'demo') {
        // Generate mock price update
        priceUpdate = this.generateMockPriceUpdate(symbol);
      } else {
        // Fetch real price data (would integrate with actual API)
        priceUpdate = await this.fetchRealPriceData(symbol);
      }
      
      this.handlePriceUpdates([priceUpdate]);
    } catch (error) {
      console.error(`Failed to poll price for ${symbol}:`, error);
    }
  }

  /**
   * Poll option chain data
   */
  private async pollOptionChain(underlying: string): Promise<void> {
    try {
      let optionChain: OptionChainData;
      
      if (this.currentMode === 'demo') {
        // Use existing options data service for demo data
        optionChain = await optionsDataService.getOptionChain(underlying);
      } else {
        // Fetch real option chain data (would integrate with actual API)
        optionChain = await this.fetchRealOptionChainData(underlying);
      }
      
      this.handleOptionChainUpdate(underlying, optionChain);
    } catch (error) {
      console.error(`Failed to poll option chain for ${underlying}:`, error);
    }
  }

  /**
   * Handle price updates from WebSocket or polling
   */
  private handlePriceUpdates(updates: MarketUpdate[]): void {
    // Cache the updates
    dataCacheService.setStockPrices(updates, 10000); // Cache for 10 seconds
    
    // Notify all relevant stock subscriptions
    this.subscriptions.forEach(subscription => {
      if (subscription.type === 'stock') {
        const relevantUpdates = updates.filter(update =>
          subscription.symbols.includes(update.symbol)
        );
        
        if (relevantUpdates.length > 0) {
          try {
            (subscription.callback as PriceUpdateCallback)(relevantUpdates);
          } catch (error) {
            console.error('Error in price update callback:', error);
          }
        }
      }
    });
  }

  /**
   * Handle option chain updates from WebSocket or polling
   */
  private handleOptionChainUpdate(underlying: string, data: OptionChainData): void {
    // Cache the option chain data
    dataCacheService.setOptionChain(underlying, data, 15000); // Cache for 15 seconds
    
    // Notify all relevant option chain subscriptions
    this.subscriptions.forEach(subscription => {
      if (subscription.type === 'option_chain' && subscription.symbols.includes(underlying)) {
        try {
          (subscription.callback as OptionChainCallback)(underlying, data);
        } catch (error) {
          console.error('Error in option chain update callback:', error);
        }
      }
    });
  }

  /**
   * Generate mock price update for demo mode
   */
  private generateMockPriceUpdate(symbol: string): MarketUpdate {
    // Use demo data service for realistic simulation
    const demoUpdate = demoDataService.generateMarketUpdate(symbol);
    if (demoUpdate) {
      return demoUpdate;
    }

    // Fallback to simple mock data
    const basePrices: Record<string, number> = {
      'RELIANCE': 2500,
      'TCS': 3200,
      'INFY': 1400,
      'HDFCBANK': 1600,
      'ICICIBANK': 900,
      'NIFTY': 19500,
      'BANKNIFTY': 44000
    };

    const basePrice = basePrices[symbol] || 1000;
    const variation = (Math.random() - 0.5) * 0.04; // ±2%
    const price = Math.max(basePrice * (1 + variation), 0.05);
    const change = price - basePrice;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      bid: Math.round((price - 0.05) * 100) / 100,
      ask: Math.round((price + 0.05) * 100) / 100
    };
  }

  /**
   * Fetch real price data (placeholder for actual API integration)
   */
  private async fetchRealPriceData(symbol: string): Promise<MarketUpdate> {
    // This would integrate with actual market data API
    // For now, return mock data
    return this.generateMockPriceUpdate(symbol);
  }

  /**
   * Fetch real option chain data (placeholder for actual API integration)
   */
  private async fetchRealOptionChainData(underlying: string): Promise<OptionChainData> {
    // This would integrate with actual options data API
    // For now, use the demo data service in demo mode or existing service
    if (this.currentMode === 'demo') {
      const demoOptionChain = demoDataService.generateOptionChain(underlying);
      if (demoOptionChain) {
        return demoOptionChain;
      }
    }
    
    return optionsDataService.getOptionChain(underlying);
  }

  /**
   * Get symbols that are still needed by other subscriptions
   */
  private getSymbolsStillNeeded(symbols: string[], type: 'stock' | 'option_chain'): string[] {
    const stillNeeded: string[] = [];
    
    this.subscriptions.forEach(subscription => {
      if (subscription.type === type) {
        subscription.symbols.forEach(symbol => {
          if (symbols.includes(symbol) && !stillNeeded.includes(symbol)) {
            stillNeeded.push(symbol);
          }
        });
      }
    });
    
    return stillNeeded;
  }

  /**
   * Set connection status and notify callbacks
   */
  private setConnectionStatus(status: string): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status as any;
      this.connectionStatusCallbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('Error in connection status callback:', error);
        }
      });
    }
  }

  /**
   * Cleanup all resources
   */
  private cleanup(): void {
    // Disconnect WebSocket
    if (this.wsService) {
      this.wsService.destroy();
      this.wsService = null;
    }
    
    // Clear all polling intervals
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals.clear();
    
    // Stop demo data service
    demoDataService.stop();
    
    this.setConnectionStatus('disconnected');
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();
export default marketDataService;