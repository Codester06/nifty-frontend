import {
  OptionContract,
  OptionChainData,
  OptionGreeks,
  UNDERLYING_ASSETS,
  GREEKS_CONFIG,
  OPTION_CHAIN_CONFIG,
  OPTION_TYPES,
} from '../types';
import { marketDataService } from './marketDataService';

/**
 * OptionsDataService handles demo data generation and real-time updates for options trading
 * Provides mock option chain generation with realistic pricing and Greeks calculations
 */
class OptionsDataService {
  private isDemo: boolean = true;
  private wsConnection: WebSocket | null = null;
  private updateCallbacks: Map<string, (data: OptionChainData) => void> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private statusCallbacks: Set<(status: string) => void> = new Set();
  private pollingFallback: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Check if demo mode is enabled from localStorage
    const demoMode = localStorage.getItem(OPTION_CHAIN_CONFIG.DEMO_MODE_KEY);
    this.isDemo = demoMode !== 'false';
  }

  /**
   * Get option chain data for a given underlying asset
   */
  async getOptionChain(underlying: string): Promise<OptionChainData> {
    if (this.isDemo) {
      return this.generateMockOptionChain(underlying);
    } else {
      // In real mode, this would call the actual API
      throw new Error('Real-time API not implemented yet');
    }
  }

  /**
   * Start real-time updates for option chain data
   */
  startRealTimeUpdates(
    underlying: string,
    callback: (data: OptionChainData) => void
  ): () => void {
    const key = `updates_${underlying}`;
    this.updateCallbacks.set(key, callback);

    // Use the centralized market data service for real-time updates
    const subscriptionId = marketDataService.subscribeToOptionChain(
      underlying,
      (symbol: string, data: OptionChainData) => {
        if (symbol === underlying) {
          callback(data);
        }
      }
    );

    // Return cleanup function
    return () => {
      marketDataService.unsubscribe(subscriptionId);
      this.updateCallbacks.delete(key);
    };
  }

  /**
   * Calculate Greeks for an option using Black-Scholes approximation
   */
  calculateGreeks(
    option: OptionContract,
    spotPrice: number,
    timeToExpiry: number = 0.25, // Default 3 months
    volatility: number = GREEKS_CONFIG.VOLATILITY_DEFAULT,
    riskFreeRate: number = GREEKS_CONFIG.RISK_FREE_RATE
  ): OptionGreeks {
    const S = spotPrice;
    const K = option.strike;
    const T = timeToExpiry;
    const r = riskFreeRate;
    const sigma = volatility;

    // Calculate d1 and d2 for Black-Scholes
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Standard normal distribution functions
    const N = (x: number) => 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    const n = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

    const isCall = option.optionType === OPTION_TYPES.CALL;

    // Calculate Greeks
    const delta = isCall ? N(d1) : N(d1) - 1;
    const gamma = n(d1) / (S * sigma * Math.sqrt(T));
    const theta = isCall
      ? (-S * n(d1) * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * N(d2)) / 365
      : (-S * n(d1) * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * N(-d2)) / 365;
    const vega = S * n(d1) * Math.sqrt(T) / 100;
    const rho = isCall
      ? K * T * Math.exp(-r * T) * N(d2) / 100
      : -K * T * Math.exp(-r * T) * N(-d2) / 100;

    return {
      delta: Number(delta.toFixed(4)),
      gamma: Number(gamma.toFixed(4)),
      theta: Number(theta.toFixed(4)),
      vega: Number(vega.toFixed(4)),
      rho: Number(rho.toFixed(4)),
    };
  }

  /**
   * Generate mock option chain data with realistic pricing
   */
  generateMockOptionChain(underlying: string): OptionChainData {
    const asset = UNDERLYING_ASSETS[underlying as keyof typeof UNDERLYING_ASSETS];
    if (!asset) {
      throw new Error(`Unsupported underlying asset: ${underlying}`);
    }

    // Generate realistic spot price based on underlying
    const spotPrice = this.generateSpotPrice(underlying);
    
    // Generate expiry date (next monthly expiry)
    const expiry = this.getNextExpiry();
    
    // Generate strike prices around spot price
    const strikes = this.generateStrikes(spotPrice);
    
    const options: OptionChainData['options'] = {};

    strikes.forEach(strike => {
      const timeToExpiry = this.calculateTimeToExpiry(expiry);
      
      // Generate call option
      const callOption = this.generateOptionContract(
        underlying,
        strike,
        expiry,
        OPTION_TYPES.CALL,
        spotPrice,
        timeToExpiry,
        asset.lotSize
      );

      // Generate put option
      const putOption = this.generateOptionContract(
        underlying,
        strike,
        expiry,
        OPTION_TYPES.PUT,
        spotPrice,
        timeToExpiry,
        asset.lotSize
      );

      options[strike] = {
        call: callOption,
        put: putOption,
      };
    });

    return {
      underlying,
      spotPrice,
      expiry,
      lastUpdated: new Date().toISOString(),
      options,
    };
  }

  /**
   * Generate realistic spot price for underlying asset
   */
  private generateSpotPrice(underlying: string): number {
    const basePrices: Record<string, number> = {
      NIFTY: 19500,
      BANKNIFTY: 44000,
      RELIANCE: 2500,
      TCS: 3600,
      INFY: 1500,
    };

    const basePrice = basePrices[underlying] || 1000;
    
    // Add some random variation (±2%)
    const variation = (Math.random() - 0.5) * 0.04;
    return Math.round(basePrice * (1 + variation));
  }

  /**
   * Generate strike prices around spot price
   */
  private generateStrikes(spotPrice: number): number[] {
    const strikes: number[] = [];
    const strikeInterval = this.getStrikeInterval(spotPrice);
    const strikesCount = OPTION_CHAIN_CONFIG.DEFAULT_STRIKES_COUNT;
    
    // Find ATM strike (closest to spot price)
    const atmStrike = Math.round(spotPrice / strikeInterval) * strikeInterval;
    
    // Generate strikes above and below ATM
    for (let i = -Math.floor(strikesCount / 2); i <= Math.floor(strikesCount / 2); i++) {
      strikes.push(atmStrike + (i * strikeInterval));
    }
    
    return strikes.sort((a, b) => a - b);
  }

  /**
   * Get appropriate strike interval based on spot price
   */
  private getStrikeInterval(spotPrice: number): number {
    if (spotPrice < 500) return 10;
    if (spotPrice < 1000) return 25;
    if (spotPrice < 2000) return 50;
    if (spotPrice < 5000) return 100;
    if (spotPrice < 10000) return 250;
    return 500;
  }

  /**
   * Generate next monthly expiry date
   */
  private getNextExpiry(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get last Thursday of current month
    let expiry = new Date(year, month + 1, 0); // Last day of current month
    while (expiry.getDay() !== 4) { // Thursday is day 4
      expiry.setDate(expiry.getDate() - 1);
    }
    
    // If expiry has passed, get next month's expiry
    if (expiry < now) {
      expiry = new Date(year, month + 2, 0);
      while (expiry.getDay() !== 4) {
        expiry.setDate(expiry.getDate() - 1);
      }
    }
    
    return expiry.toISOString().split('T')[0];
  }

  /**
   * Calculate time to expiry in years
   */
  private calculateTimeToExpiry(expiry: string): number {
    const expiryDate = new Date(expiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(diffDays / 365, 0.001); // Minimum 1 day
  }

  /**
   * Generate individual option contract with realistic pricing
   */
  private generateOptionContract(
    underlying: string,
    strike: number,
    expiry: string,
    optionType: 'CE' | 'PE',
    spotPrice: number,
    timeToExpiry: number,
    lotSize: number
  ): OptionContract {
    // Generate option symbol
    const symbol = this.generateOptionSymbol(underlying, strike, expiry, optionType);
    
    // Calculate intrinsic value
    const intrinsicValue = optionType === OPTION_TYPES.CALL
      ? Math.max(spotPrice - strike, 0)
      : Math.max(strike - spotPrice, 0);
    
    // Calculate time value (simplified)
    const volatility = GREEKS_CONFIG.VOLATILITY_DEFAULT + (Math.random() - 0.5) * 0.1;
    const timeValue = Math.sqrt(timeToExpiry) * volatility * spotPrice * 0.4;
    
    // Calculate LTP (Last Traded Price)
    const ltp = Math.max(intrinsicValue + timeValue, 0.05);
    
    // Generate bid/ask spread (typically 0.05 to 0.20)
    const spread = Math.max(ltp * 0.01, 0.05);
    const bid = Math.max(ltp - spread / 2, 0.05);
    const ask = ltp + spread / 2;
    
    // Generate volume and open interest
    const volume = this.generateVolume(strike, spotPrice);
    const oi = this.generateOpenInterest(strike, spotPrice);
    
    // Calculate implied volatility
    const iv = volatility * 100; // Convert to percentage
    
    const option: OptionContract = {
      symbol,
      underlying,
      strike,
      expiry,
      optionType,
      bid: Number(bid.toFixed(2)),
      ask: Number(ask.toFixed(2)),
      ltp: Number(ltp.toFixed(2)),
      volume,
      oi,
      iv: Number(iv.toFixed(2)),
      lotSize,
    };

    // Calculate Greeks
    option.greeks = this.calculateGreeks(option, spotPrice, timeToExpiry, volatility);
    
    return option;
  }

  /**
   * Generate option symbol in standard format
   */
  private generateOptionSymbol(
    underlying: string,
    strike: number,
    expiry: string,
    optionType: 'CE' | 'PE'
  ): string {
    const expiryDate = new Date(expiry);
    const year = expiryDate.getFullYear().toString().slice(-2);
    const month = expiryDate.toLocaleString('en', { month: 'short' }).toUpperCase();
    const day = expiryDate.getDate().toString().padStart(2, '0');
    
    return `${underlying}${day}${month}${year}${strike}${optionType}`;
  }

  /**
   * Generate realistic volume based on moneyness
   */
  private generateVolume(strike: number, spotPrice: number): number {
    const moneyness = Math.abs(strike - spotPrice) / spotPrice;
    
    // Higher volume for ATM options, lower for deep ITM/OTM
    let baseVolume = 1000;
    if (moneyness < 0.02) baseVolume = 5000; // ATM
    else if (moneyness < 0.05) baseVolume = 3000; // Near ATM
    else if (moneyness < 0.1) baseVolume = 1500; // Moderate OTM/ITM
    else baseVolume = 500; // Deep OTM/ITM
    
    // Add randomness
    return Math.floor(baseVolume * (0.5 + Math.random()));
  }

  /**
   * Generate realistic open interest
   */
  private generateOpenInterest(strike: number, spotPrice: number): number {
    const moneyness = Math.abs(strike - spotPrice) / spotPrice;
    
    // Higher OI for ATM and round number strikes
    let baseOI = 2000;
    if (moneyness < 0.02) baseOI = 10000; // ATM
    else if (moneyness < 0.05) baseOI = 6000; // Near ATM
    else if (moneyness < 0.1) baseOI = 3000; // Moderate OTM/ITM
    else baseOI = 1000; // Deep OTM/ITM
    
    // Bonus for round number strikes
    if (strike % 100 === 0) baseOI *= 1.5;
    else if (strike % 50 === 0) baseOI *= 1.2;
    
    // Add randomness
    return Math.floor(baseOI * (0.7 + Math.random() * 0.6));
  }

  /**
   * Setup WebSocket connection for real-time updates
   */
  private setupWebSocketUpdates(
    underlying: string,
    callback: (data: OptionChainData) => void
  ): () => void {
    const key = `ws_${underlying}`;
    this.updateCallbacks.set(key, callback);
    this.subscriptions.add(underlying);

    // Initialize WebSocket connection if not exists
    if (!this.wsConnection) {
      this.initializeWebSocket();
    } else if (this.wsConnection.readyState === WebSocket.OPEN) {
      // Subscribe to updates for this underlying
      this.subscribeToSymbol(underlying);
    }

    // Setup polling fallback
    this.setupPollingFallback(underlying, callback);

    // Return cleanup function
    return () => {
      this.subscriptions.delete(underlying);
      this.updateCallbacks.delete(key);
      this.clearPollingFallback(underlying);
      
      // Unsubscribe from WebSocket if connected
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.unsubscribeFromSymbol(underlying);
      }
      
      // Close WebSocket if no more subscriptions
      if (this.subscriptions.size === 0) {
        this.closeWebSocket();
      }
    };
  }

  /**
   * Initialize WebSocket connection with error handling and reconnection logic
   */
  private initializeWebSocket(): void {
    if (this.connectionStatus === 'connecting') {
      return; // Already attempting to connect
    }

    this.setConnectionStatus('connecting');
    
    try {
      // In a real implementation, this would be the actual WebSocket URL
      // For demo purposes, we'll simulate WebSocket behavior
      const wsUrl = process.env.VITE_WS_URL || 'wss://api.example.com/options/ws';
      
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket connected');
        this.setConnectionStatus('connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Subscribe to all active symbols
        this.subscriptions.forEach(symbol => {
          this.subscribeToSymbol(symbol);
        });
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.setConnectionStatus('error');
      };
      
      this.wsConnection.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.setConnectionStatus('disconnected');
        this.wsConnection = null;
        
        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && this.subscriptions.size > 0) {
          this.scheduleReconnect();
        }
      };
      
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.setConnectionStatus('error');
      this.scheduleReconnect();
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    if (data.type === 'option_chain_update' && data.underlying) {
      const key = `ws_${data.underlying}`;
      const callback = this.updateCallbacks.get(key);
      
      if (callback && data.optionChain) {
        // Clear polling fallback since WebSocket is working
        this.clearPollingFallback(data.underlying);
        callback(data.optionChain);
      }
    } else if (data.type === 'error') {
      console.error('WebSocket error message:', data.message);
    }
  }

  /**
   * Subscribe to option chain updates for a specific symbol
   */
  private subscribeToSymbol(underlying: string): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'subscribe',
        symbol: underlying,
        dataType: 'option_chain'
      };
      
      this.wsConnection.send(JSON.stringify(message));
      console.log(`Subscribed to ${underlying} option chain updates`);
    }
  }

  /**
   * Unsubscribe from option chain updates for a specific symbol
   */
  private unsubscribeFromSymbol(underlying: string): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'unsubscribe',
        symbol: underlying,
        dataType: 'option_chain'
      };
      
      this.wsConnection.send(JSON.stringify(message));
      console.log(`Unsubscribed from ${underlying} option chain updates`);
    }
  }

  /**
   * Setup polling fallback in case WebSocket fails
   */
  private setupPollingFallback(underlying: string, callback: (data: OptionChainData) => void): void {
    const fallbackKey = `fallback_${underlying}`;
    
    // Clear existing fallback
    this.clearPollingFallback(underlying);
    
    // Setup new fallback with longer interval than demo mode
    const interval = setInterval(async () => {
      // Only use fallback if WebSocket is not connected or has errors
      if (this.connectionStatus !== 'connected') {
        try {
          const data = await this.generateMockOptionChain(underlying);
          callback(data);
        } catch (error) {
          console.error('Error in polling fallback:', error);
        }
      }
    }, OPTION_CHAIN_CONFIG.UPDATE_INTERVAL * 2); // Slower fallback updates
    
    this.pollingFallback.set(fallbackKey, interval);
  }

  /**
   * Clear polling fallback for a symbol
   */
  private clearPollingFallback(underlying: string): void {
    const fallbackKey = `fallback_${underlying}`;
    const interval = this.pollingFallback.get(fallbackKey);
    
    if (interval) {
      clearInterval(interval);
      this.pollingFallback.delete(fallbackKey);
    }
  }

  /**
   * Schedule WebSocket reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setConnectionStatus('error');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.subscriptions.size > 0) {
        this.initializeWebSocket();
      }
    }, delay);
  }

  /**
   * Set connection status and notify callbacks
   */
  private setConnectionStatus(status: 'disconnected' | 'connecting' | 'connected' | 'error'): void {
    this.connectionStatus = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatusChange(callback: (status: string) => void): () => void {
    this.statusCallbacks.add(callback);
    
    // Immediately call with current status
    callback(this.connectionStatus);
    
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  /**
   * Close WebSocket connection
   */
  private closeWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close(1000, 'No more subscriptions');
      this.wsConnection = null;
    }
  }

  /**
   * Error function approximation for normal distribution
   */
  private erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Toggle between demo and real-time mode
   */
  async setDemoMode(isDemo: boolean): Promise<void> {
    this.isDemo = isDemo;
    localStorage.setItem(OPTION_CHAIN_CONFIG.DEMO_MODE_KEY, isDemo.toString());
    
    // Update the market data service mode
    const mode = isDemo ? 'demo' : 'live';
    await marketDataService.switchMode(mode);
  }

  /**
   * Get current mode
   */
  isDemoMode(): boolean {
    return this.isDemo;
  }

  /**
   * Cleanup all active connections and intervals
   */
  cleanup(): void {
    // Clear all update intervals
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();
    
    // Clear all polling fallbacks
    this.pollingFallback.forEach(interval => clearInterval(interval));
    this.pollingFallback.clear();
    
    // Clear callbacks and subscriptions
    this.updateCallbacks.clear();
    this.subscriptions.clear();
    this.statusCallbacks.clear();

    // Close WebSocket connection if exists
    this.closeWebSocket();
    
    // Reset connection state
    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
export const optionsDataService = new OptionsDataService();
export default optionsDataService;