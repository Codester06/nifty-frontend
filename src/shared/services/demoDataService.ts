import { MarketUpdate, OptionChainData, OptionContract, OptionGreeks } from '../types';
import { UNDERLYING_ASSETS, OPTION_TYPES, GREEKS_CONFIG } from '../types/options';

// Demo stock configuration
interface DemoStockConfig {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  trendStrength: number; // 0-1
  volume: {
    min: number;
    max: number;
  };
}

// Demo market configuration
interface DemoMarketConfig {
  updateInterval: number;
  priceMovementRange: number; // Maximum price movement per update (as percentage)
  volumeVariation: number; // Volume variation factor
  trendPersistence: number; // How long trends persist (0-1)
  marketHours: {
    open: string;
    close: string;
    timezone: string;
  };
}

/**
 * Demo data simulation service
 * Provides realistic market data simulation for learning purposes
 */
export class DemoDataService {
  private config: DemoMarketConfig;
  private stockConfigs: Map<string, DemoStockConfig> = new Map();
  private currentPrices: Map<string, number> = new Map();
  private priceHistory: Map<string, number[]> = new Map();
  private trendTimers: Map<string, number> = new Map();
  private simulationTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(config: Partial<DemoMarketConfig> = {}) {
    this.config = {
      updateInterval: 2000,
      priceMovementRange: 0.02, // 2% max movement
      volumeVariation: 0.3,
      trendPersistence: 0.7,
      marketHours: {
        open: '09:15',
        close: '15:30',
        timezone: 'Asia/Kolkata'
      },
      ...config
    };

    this.initializeStockConfigs();
  }

  /**
   * Initialize demo stock configurations
   */
  private initializeStockConfigs(): void {
    const stocks: DemoStockConfig[] = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Limited',
        basePrice: 2500,
        volatility: 0.25,
        trend: 'bullish',
        trendStrength: 0.6,
        volume: { min: 500000, max: 2000000 }
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        basePrice: 3200,
        volatility: 0.20,
        trend: 'sideways',
        trendStrength: 0.3,
        volume: { min: 300000, max: 1500000 }
      },
      {
        symbol: 'INFY',
        name: 'Infosys Limited',
        basePrice: 1400,
        volatility: 0.22,
        trend: 'bullish',
        trendStrength: 0.5,
        volume: { min: 400000, max: 1800000 }
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Limited',
        basePrice: 1600,
        volatility: 0.18,
        trend: 'sideways',
        trendStrength: 0.4,
        volume: { min: 600000, max: 2500000 }
      },
      {
        symbol: 'ICICIBANK',
        name: 'ICICI Bank Limited',
        basePrice: 900,
        volatility: 0.20,
        trend: 'bearish',
        trendStrength: 0.3,
        volume: { min: 400000, max: 1600000 }
      }
    ];

    stocks.forEach(stock => {
      this.stockConfigs.set(stock.symbol, stock);
      this.currentPrices.set(stock.symbol, stock.basePrice);
      this.priceHistory.set(stock.symbol, [stock.basePrice]);
      this.trendTimers.set(stock.symbol, 0);
    });
  }

  /**
   * Start the demo data simulation
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.simulationTimer = setInterval(() => {
      this.updateAllPrices();
    }, this.config.updateInterval);

    console.log('Demo data simulation started');
  }

  /**
   * Stop the demo data simulation
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    console.log('Demo data simulation stopped');
  }

  /**
   * Get current price for a symbol
   */
  getCurrentPrice(symbol: string): number | null {
    return this.currentPrices.get(symbol) || null;
  }

  /**
   * Get price history for a symbol
   */
  getPriceHistory(symbol: string, length: number = 100): number[] {
    const history = this.priceHistory.get(symbol) || [];
    return history.slice(-length);
  }

  /**
   * Generate market update for a symbol
   */
  generateMarketUpdate(symbol: string): MarketUpdate | null {
    const config = this.stockConfigs.get(symbol);
    const currentPrice = this.currentPrices.get(symbol);
    
    if (!config || !currentPrice) {
      return null;
    }

    const basePrice = config.basePrice;
    const change = currentPrice - basePrice;
    const changePercent = (change / basePrice) * 100;
    
    // Generate volume
    const volumeRange = config.volume.max - config.volume.min;
    const volume = Math.floor(
      config.volume.min + Math.random() * volumeRange * (1 + this.config.volumeVariation * (Math.random() - 0.5))
    );

    // Generate bid/ask spread
    const spread = Math.max(currentPrice * 0.001, 0.05); // 0.1% or minimum 0.05
    const bid = Math.round((currentPrice - spread / 2) * 100) / 100;
    const ask = Math.round((currentPrice + spread / 2) * 100) / 100;

    return {
      symbol,
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume,
      timestamp: new Date(),
      bid,
      ask
    };
  }

  /**
   * Generate option chain data for an underlying
   */
  generateOptionChain(underlying: string): OptionChainData | null {
    const spotPrice = this.getCurrentPrice(underlying);
    if (!spotPrice) {
      return null;
    }

    const asset = UNDERLYING_ASSETS[underlying as keyof typeof UNDERLYING_ASSETS];
    if (!asset) {
      return null;
    }

    const expiry = this.getNextExpiry();
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
        put: putOption
      };
    });

    return {
      underlying,
      spotPrice,
      expiry,
      lastUpdated: new Date().toISOString(),
      options
    };
  }

  /**
   * Set trend for a symbol
   */
  setTrend(symbol: string, trend: 'bullish' | 'bearish' | 'sideways', strength: number = 0.5): void {
    const config = this.stockConfigs.get(symbol);
    if (config) {
      config.trend = trend;
      config.trendStrength = Math.max(0, Math.min(1, strength));
      this.trendTimers.set(symbol, 0); // Reset trend timer
    }
  }

  /**
   * Get all available symbols
   */
  getAvailableSymbols(): string[] {
    return Array.from(this.stockConfigs.keys());
  }

  /**
   * Check if market is open
   */
  isMarketOpen(): boolean {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: this.config.marketHours.timezone }));
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;
    
    const [openHour, openMinute] = this.config.marketHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = this.config.marketHours.close.split(':').map(Number);
    
    const marketOpen = openHour * 60 + openMinute;
    const marketClose = closeHour * 60 + closeMinute;
    
    return currentTimeInMinutes >= marketOpen && currentTimeInMinutes <= marketClose;
  }

  /**
   * Update all stock prices
   */
  private updateAllPrices(): void {
    // Only update during market hours in realistic mode
    if (!this.isMarketOpen()) {
      return;
    }

    this.stockConfigs.forEach((config, symbol) => {
      this.updateStockPrice(symbol, config);
    });
  }

  /**
   * Update price for a single stock
   */
  private updateStockPrice(symbol: string, config: DemoStockConfig): void {
    const currentPrice = this.currentPrices.get(symbol) || config.basePrice;
    const history = this.priceHistory.get(symbol) || [];
    let trendTimer = this.trendTimers.get(symbol) || 0;

    // Calculate trend influence
    let trendInfluence = 0;
    switch (config.trend) {
      case 'bullish':
        trendInfluence = config.trendStrength * 0.001; // Positive bias
        break;
      case 'bearish':
        trendInfluence = -config.trendStrength * 0.001; // Negative bias
        break;
      case 'sideways':
        trendInfluence = 0; // No bias
        break;
    }

    // Add some mean reversion
    const distanceFromBase = (currentPrice - config.basePrice) / config.basePrice;
    const meanReversionForce = -distanceFromBase * 0.1;

    // Generate random movement
    const randomMovement = (Math.random() - 0.5) * this.config.priceMovementRange;
    
    // Combine all forces
    const totalMovement = trendInfluence + meanReversionForce + randomMovement;
    
    // Apply volatility
    const volatilityAdjustedMovement = totalMovement * config.volatility;
    
    // Calculate new price
    const newPrice = Math.max(
      currentPrice * (1 + volatilityAdjustedMovement),
      config.basePrice * 0.5 // Don't go below 50% of base price
    );

    // Update price and history
    this.currentPrices.set(symbol, newPrice);
    history.push(newPrice);
    
    // Keep history limited
    if (history.length > 1000) {
      history.shift();
    }
    
    this.priceHistory.set(symbol, history);

    // Update trend timer and potentially change trend
    trendTimer++;
    if (trendTimer > 100 && Math.random() < (1 - this.config.trendPersistence)) {
      // Change trend randomly
      const trends: Array<'bullish' | 'bearish' | 'sideways'> = ['bullish', 'bearish', 'sideways'];
      const newTrend = trends[Math.floor(Math.random() * trends.length)];
      config.trend = newTrend;
      config.trendStrength = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
      trendTimer = 0;
    }
    
    this.trendTimers.set(symbol, trendTimer);
  }

  /**
   * Generate strikes around spot price
   */
  private generateStrikes(spotPrice: number): number[] {
    const strikes: number[] = [];
    const strikeInterval = this.getStrikeInterval(spotPrice);
    const strikesCount = 20; // 10 above and 10 below ATM
    
    // Find ATM strike
    const atmStrike = Math.round(spotPrice / strikeInterval) * strikeInterval;
    
    // Generate strikes
    for (let i = -Math.floor(strikesCount / 2); i <= Math.floor(strikesCount / 2); i++) {
      strikes.push(atmStrike + (i * strikeInterval));
    }
    
    return strikes.sort((a, b) => a - b);
  }

  /**
   * Get strike interval based on spot price
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
   * Generate next expiry date
   */
  private getNextExpiry(): string {
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
  }

  /**
   * Calculate time to expiry in years
   */
  private calculateTimeToExpiry(expiry: string): number {
    const expiryDate = new Date(expiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(diffDays / 365, 0.001);
  }

  /**
   * Generate option contract
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
    const symbol = this.generateOptionSymbol(underlying, strike, expiry, optionType);
    
    // Calculate intrinsic value
    const intrinsicValue = optionType === OPTION_TYPES.CALL
      ? Math.max(spotPrice - strike, 0)
      : Math.max(strike - spotPrice, 0);
    
    // Calculate time value with realistic volatility
    const config = this.stockConfigs.get(underlying);
    const volatility = config?.volatility || GREEKS_CONFIG.VOLATILITY_DEFAULT;
    const timeValue = Math.sqrt(timeToExpiry) * volatility * spotPrice * 0.4;
    
    // Calculate LTP
    const ltp = Math.max(intrinsicValue + timeValue, 0.05);
    
    // Generate bid/ask spread
    const spread = Math.max(ltp * 0.02, 0.05);
    const bid = Math.max(ltp - spread / 2, 0.05);
    const ask = ltp + spread / 2;
    
    // Generate volume and OI
    const volume = this.generateOptionVolume(strike, spotPrice);
    const oi = this.generateOptionOI(strike, spotPrice);
    
    // Calculate IV
    const iv = (volatility + (Math.random() - 0.5) * 0.1) * 100;

    const option: OptionContract = {
      symbol,
      underlying,
      strike,
      expiry,
      optionType,
      bid: Math.round(bid * 100) / 100,
      ask: Math.round(ask * 100) / 100,
      ltp: Math.round(ltp * 100) / 100,
      volume,
      oi,
      iv: Math.round(iv * 100) / 100,
      lotSize
    };

    // Calculate Greeks
    option.greeks = this.calculateGreeks(option, spotPrice, timeToExpiry, volatility);
    
    return option;
  }

  /**
   * Generate option symbol
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
   * Generate realistic option volume
   */
  private generateOptionVolume(strike: number, spotPrice: number): number {
    const moneyness = Math.abs(strike - spotPrice) / spotPrice;
    
    let baseVolume = 1000;
    if (moneyness < 0.02) baseVolume = 5000; // ATM
    else if (moneyness < 0.05) baseVolume = 3000; // Near ATM
    else if (moneyness < 0.1) baseVolume = 1500; // Moderate OTM/ITM
    else baseVolume = 500; // Deep OTM/ITM
    
    return Math.floor(baseVolume * (0.5 + Math.random()));
  }

  /**
   * Generate realistic option OI
   */
  private generateOptionOI(strike: number, spotPrice: number): number {
    const moneyness = Math.abs(strike - spotPrice) / spotPrice;
    
    let baseOI = 2000;
    if (moneyness < 0.02) baseOI = 10000; // ATM
    else if (moneyness < 0.05) baseOI = 6000; // Near ATM
    else if (moneyness < 0.1) baseOI = 3000; // Moderate OTM/ITM
    else baseOI = 1000; // Deep OTM/ITM
    
    // Bonus for round strikes
    if (strike % 100 === 0) baseOI *= 1.5;
    else if (strike % 50 === 0) baseOI *= 1.2;
    
    return Math.floor(baseOI * (0.7 + Math.random() * 0.6));
  }

  /**
   * Calculate option Greeks
   */
  private calculateGreeks(
    option: OptionContract,
    spotPrice: number,
    timeToExpiry: number,
    volatility: number
  ): OptionGreeks {
    const S = spotPrice;
    const K = option.strike;
    const T = timeToExpiry;
    const r = GREEKS_CONFIG.RISK_FREE_RATE;
    const sigma = volatility;

    // Black-Scholes calculations
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const N = (x: number) => 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    const n = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

    const isCall = option.optionType === OPTION_TYPES.CALL;

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
      delta: Math.round(delta * 10000) / 10000,
      gamma: Math.round(gamma * 10000) / 10000,
      theta: Math.round(theta * 100) / 100,
      vega: Math.round(vega * 100) / 100,
      rho: Math.round(rho * 100) / 100
    };
  }

  /**
   * Error function approximation
   */
  private erf(x: number): number {
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
   * Destroy the service
   */
  destroy(): void {
    this.stop();
    this.stockConfigs.clear();
    this.currentPrices.clear();
    this.priceHistory.clear();
    this.trendTimers.clear();
  }
}

// Export singleton instance
export const demoDataService = new DemoDataService();
export default demoDataService;