import { apiService } from './api';
import { marketDataService } from './marketDataService';
import { MarketUpdate } from '../types';

// Re-export MarketUpdate as PriceUpdate for backward compatibility
export type PriceUpdate = MarketUpdate;

export interface PriceSubscription {
  symbols: string[];
  callback: (updates: PriceUpdate[]) => void;
  id: string;
}

class RealTimePriceService {
  private subscriptions: Map<string, PriceSubscription> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;
  private lastPrices: Map<string, number> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private pollingMode = false;

  constructor() {
    this.initializeConnection();
  }

  /**
   * Subscribe to real-time price updates for specific symbols
   */
  subscribe(symbols: string[], callback: (updates: PriceUpdate[]) => void): string {
    // Use the centralized market data service
    const subscriptionId = marketDataService.subscribeToStockPrices(symbols, callback);
    
    // Store subscription for backward compatibility
    this.subscriptions.set(subscriptionId, {
      symbols,
      callback,
      id: subscriptionId
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    // Remove subscription
    this.subscriptions.delete(subscriptionId);

    // Unsubscribe from market data service
    marketDataService.unsubscribe(subscriptionId);
  }

  /**
   * Get current price for a symbol
   */
  getCurrentPrice(symbol: string): number | null {
    const marketUpdate = marketDataService.getCurrentPrice(symbol);
    return marketUpdate?.price || this.lastPrices.get(symbol) || null;
  }

  /**
   * Force refresh prices for all subscribed symbols
   */
  async refreshPrices(): Promise<void> {
    const symbols = this.getAllSubscribedSymbols();
    if (symbols.length === 0) return;

    try {
      // Fetch current prices from API
      const pricePromises = symbols.map(async (symbol) => {
        try {
          // This would typically call a specific price endpoint
          // For now, we'll simulate with mock data
          const mockPrice = this.generateMockPrice(symbol);
          return { symbol, price: mockPrice };
        } catch (error) {
          console.warn(`Failed to fetch price for ${symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(pricePromises);
      const priceUpdates: PriceUpdate[] = [];

      results.forEach(result => {
        if (!result) return;

        const { symbol, price } = result;
        const previousPrice = this.lastPrices.get(symbol) || price;
        const change = price - previousPrice;
        const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

        this.lastPrices.set(symbol, price);

        priceUpdates.push({
          symbol,
          price,
          change,
          changePercent,
          timestamp: new Date()
        });
      });

      // Notify all subscribers
      this.notifySubscribers(priceUpdates);
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  }

  /**
   * Initialize WebSocket connection or fallback to polling
   */
  private initializeConnection(): void {
    if (this.isConnecting) return;

    // Try WebSocket first
    this.connectWebSocket();
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  private connectWebSocket(): void {
    if (this.isConnecting || this.websocket?.readyState === WebSocket.OPEN) return;

    this.isConnecting = true;

    try {
      // In a real implementation, this would connect to your WebSocket server
      // For now, we'll simulate WebSocket behavior
      this.simulateWebSocketConnection();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.fallbackToPolling();
    }
  }

  /**
   * Simulate WebSocket connection for demo purposes
   */
  private simulateWebSocketConnection(): void {
    // Simulate successful connection after a delay
    setTimeout(() => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log('Simulated WebSocket connected');
      
      // Start simulated price updates
      this.startSimulatedUpdates();
    }, 1000);
  }

  /**
   * Start simulated real-time price updates
   */
  private startSimulatedUpdates(): void {
    const updateInterval = setInterval(() => {
      const symbols = this.getAllSubscribedSymbols();
      if (symbols.length === 0) return;

      const priceUpdates: PriceUpdate[] = symbols.map(symbol => {
        const currentPrice = this.lastPrices.get(symbol) || this.generateMockPrice(symbol);
        const newPrice = this.generateMockPriceUpdate(currentPrice);
        const change = newPrice - currentPrice;
        const changePercent = currentPrice > 0 ? (change / currentPrice) * 100 : 0;

        this.lastPrices.set(symbol, newPrice);

        return {
          symbol,
          price: newPrice,
          change,
          changePercent,
          timestamp: new Date()
        };
      });

      this.notifySubscribers(priceUpdates);
    }, 2000); // Update every 2 seconds

    // Store interval for cleanup
    this.pollingInterval = updateInterval;
  }

  /**
   * Fallback to polling mode when WebSocket fails
   */
  private fallbackToPolling(): void {
    this.isConnecting = false;
    this.pollingMode = true;
    console.log('Falling back to polling mode');
    this.startPolling();
  }

  /**
   * Start polling for price updates
   */
  private startPolling(): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(() => {
      this.refreshPrices();
    }, 5000); // Poll every 5 seconds
  }

  /**
   * Send subscription message to WebSocket
   */
  private sendSubscriptionMessage(symbols: string[], action: 'subscribe' | 'unsubscribe'): void {
    if (this.websocket?.readyState !== WebSocket.OPEN) return;

    const message = {
      action,
      symbols,
      timestamp: Date.now()
    };

    this.websocket.send(JSON.stringify(message));
  }

  /**
   * Get all symbols that are currently subscribed
   */
  private getAllSubscribedSymbols(): string[] {
    const allSymbols = new Set<string>();
    
    this.subscriptions.forEach(subscription => {
      subscription.symbols.forEach(symbol => allSymbols.add(symbol));
    });

    return Array.from(allSymbols);
  }

  /**
   * Notify all subscribers of price updates
   */
  private notifySubscribers(priceUpdates: PriceUpdate[]): void {
    this.subscriptions.forEach(subscription => {
      // Filter updates to only include symbols this subscription cares about
      const relevantUpdates = priceUpdates.filter(update => 
        subscription.symbols.includes(update.symbol)
      );

      if (relevantUpdates.length > 0) {
        try {
          subscription.callback(relevantUpdates);
        } catch (error) {
          console.error('Error in price update callback:', error);
        }
      }
    });
  }

  /**
   * Generate mock price for demo purposes
   */
  private generateMockPrice(symbol: string): number {
    // Generate realistic prices based on symbol
    const basePrices: Record<string, number> = {
      'RELIANCE': 2500,
      'TCS': 3200,
      'INFY': 1400,
      'HDFCBANK': 1600,
      'ICICIBANK': 900,
      'NIFTY': 19500
    };

    const basePrice = basePrices[symbol] || 1000;
    // Add some random variation (±5%)
    const variation = (Math.random() - 0.5) * 0.1;
    return Math.round(basePrice * (1 + variation) * 100) / 100;
  }

  /**
   * Generate mock price update (small movement from current price)
   */
  private generateMockPriceUpdate(currentPrice: number): number {
    // Generate small price movements (±2%)
    const variation = (Math.random() - 0.5) * 0.04;
    const newPrice = currentPrice * (1 + variation);
    return Math.round(newPrice * 100) / 100;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Clear all subscriptions
    this.subscriptions.clear();

    // Close WebSocket connection
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

// Export singleton instance
export const realTimePriceService = new RealTimePriceService();
export default realTimePriceService;