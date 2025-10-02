import { describe, it, expect } from 'vitest';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD,
  generateMockCandlestickData,
  CandlestickData 
} from '../../shared/utils/technicalIndicators';

describe('Technical Indicators', () => {
  const mockData: CandlestickData[] = [
    { timestamp: new Date('2024-01-01'), open: 100, high: 105, low: 95, close: 102, volume: 1000 },
    { timestamp: new Date('2024-01-02'), open: 102, high: 108, low: 100, close: 106, volume: 1200 },
    { timestamp: new Date('2024-01-03'), open: 106, high: 110, low: 104, close: 108, volume: 1100 },
    { timestamp: new Date('2024-01-04'), open: 108, high: 112, low: 106, close: 110, volume: 1300 },
    { timestamp: new Date('2024-01-05'), open: 110, high: 115, low: 108, close: 112, volume: 1400 },
  ];

  describe('calculateSMA', () => {
    it('should calculate Simple Moving Average correctly', () => {
      const result = calculateSMA(mockData, 3);
      
      expect(result).toHaveLength(3);
      expect(result[0].value).toBeCloseTo(105.33, 2); // (102+106+108)/3
      expect(result[1].value).toBeCloseTo(108, 2); // (106+108+110)/3
      expect(result[2].value).toBeCloseTo(110, 2); // (108+110+112)/3
    });

    it('should return empty array for insufficient data', () => {
      const result = calculateSMA(mockData.slice(0, 2), 5);
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate Exponential Moving Average correctly', () => {
      const result = calculateEMA(mockData, 3);
      
      expect(result).toHaveLength(3);
      expect(result[0].value).toBeCloseTo(105.33, 2); // First value is SMA
      expect(result[1].value).toBeGreaterThan(105.33); // EMA should be different from SMA
      expect(result[2].value).toBeGreaterThan(result[1].value); // Should follow trend
    });
  });

  describe('calculateRSI', () => {
    it('should calculate RSI with sufficient data', () => {
      // Create more data points for RSI calculation
      const extendedData = generateMockCandlestickData(100, 20, '1d');
      const result = calculateRSI(extendedData, 14);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(point => {
        expect(point.rsi).toBeGreaterThanOrEqual(0);
        expect(point.rsi).toBeLessThanOrEqual(100);
      });
    });

    it('should return empty array for insufficient data', () => {
      const result = calculateRSI(mockData, 14);
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateMACD', () => {
    it('should calculate MACD with sufficient data', () => {
      // Create more data points for MACD calculation
      const extendedData = generateMockCandlestickData(100, 50, '1d');
      const result = calculateMACD(extendedData);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(point => {
        expect(typeof point.macd).toBe('number');
        expect(typeof point.signal).toBe('number');
        expect(typeof point.histogram).toBe('number');
        expect(point.histogram).toBeCloseTo(point.macd - point.signal, 5);
      });
    });
  });

  describe('generateMockCandlestickData', () => {
    it('should generate correct number of data points', () => {
      const result = generateMockCandlestickData(100, 10, '1d');
      
      expect(result).toHaveLength(10);
      result.forEach(candle => {
        expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
        expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
        expect(candle.volume).toBeGreaterThan(0);
      });
    });

    it('should generate data with different timeframes', () => {
      const result1m = generateMockCandlestickData(100, 5, '1m');
      const result1d = generateMockCandlestickData(100, 5, '1d');
      
      expect(result1m).toHaveLength(5);
      expect(result1d).toHaveLength(5);
      
      // Check that timestamps are different
      const timeDiff1m = result1m[1].timestamp.getTime() - result1m[0].timestamp.getTime();
      const timeDiff1d = result1d[1].timestamp.getTime() - result1d[0].timestamp.getTime();
      
      expect(timeDiff1d).toBeGreaterThan(timeDiff1m);
    });
  });
});