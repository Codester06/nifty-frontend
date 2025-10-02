import { MarketUpdate, OptionChainData } from '../types';

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Cache configuration
interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
}

/**
 * Data caching service for market data
 * Provides efficient caching with TTL and size limits
 */
export class DataCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private accessOrder = new Map<string, number>(); // For LRU eviction

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5000, // 5 seconds default TTL
      maxSize: 1000,
      cleanupInterval: 30000, // 30 seconds
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, Date.now());
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order for LRU
    this.accessOrder.set(key, Date.now());
    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    this.accessOrder.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Set stock price in cache
   */
  setStockPrice(symbol: string, update: MarketUpdate, ttl?: number): void {
    this.set(`stock_price_${symbol}`, update, ttl);
  }

  /**
   * Get stock price from cache
   */
  getStockPrice(symbol: string): MarketUpdate | null {
    return this.get<MarketUpdate>(`stock_price_${symbol}`);
  }

  /**
   * Set option chain in cache
   */
  setOptionChain(underlying: string, data: OptionChainData, ttl?: number): void {
    this.set(`option_chain_${underlying}`, data, ttl);
  }

  /**
   * Get option chain from cache
   */
  getOptionChain(underlying: string): OptionChainData | null {
    return this.get<OptionChainData>(`option_chain_${underlying}`);
  }

  /**
   * Set multiple stock prices at once
   */
  setStockPrices(updates: MarketUpdate[], ttl?: number): void {
    updates.forEach(update => {
      this.setStockPrice(update.symbol, update, ttl);
    });
  }

  /**
   * Get multiple stock prices at once
   */
  getStockPrices(symbols: string[]): Map<string, MarketUpdate> {
    const results = new Map<string, MarketUpdate>();
    
    symbols.forEach(symbol => {
      const price = this.getStockPrice(symbol);
      if (price) {
        results.set(symbol, price);
      }
    });

    return results;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: RegExp): number {
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Invalidate all stock prices
   */
  invalidateStockPrices(): number {
    return this.invalidateByPattern(/^stock_price_/);
  }

  /**
   * Invalidate all option chains
   */
  invalidateOptionChains(): number {
    return this.invalidateByPattern(/^option_chain_/);
  }

  /**
   * Preload data into cache
   */
  preload<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  /**
   * Destroy the cache service
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  /**
   * Start cleanup timer to remove expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // Rough estimate for string size
      size += JSON.stringify(entry.data).length * 2; // Rough estimate for data size
      size += 24; // Rough estimate for entry metadata
    }

    return size;
  }
}

// Export singleton instance
export const dataCacheService = new DataCacheService({
  defaultTTL: 5000, // 5 seconds for market data
  maxSize: 1000,
  cleanupInterval: 30000
});

export default dataCacheService;