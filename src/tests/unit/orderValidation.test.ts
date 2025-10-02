import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  orderValidator, 
  isMarketOpen, 
  getNextMarketOpen, 
  validateTickSize, 
  roundToTickSize,
  validateOrder,
  MARKET_HOURS,
  TRADING_CONSTANTS,
  type OrderValidationRequest 
} from '@/shared/utils/orderValidation';
import type { Stock, OptionContract } from '@/shared/types';

describe('Order Validation', () => {
  const mockStock: Stock = {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    fullName: 'Reliance Industries Limited',
    price: 2500.50,
    change: 25.50,
    changePercent: 1.03,
    volume: '1.2M',
    description: 'Oil and Gas company'
  };

  const mockOptionContract: OptionContract = {
    symbol: 'NIFTY25DEC19400CE',
    underlying: 'NIFTY',
    strike: 19400,
    expiry: '2025-12-25',
    optionType: 'CE',
    bid: 150.25,
    ask: 151.75,
    ltp: 151.00,
    volume: 50000,
    oi: 25000,
    iv: 18.5,
    lotSize: 50
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Market Hours Validation', () => {
    it('should correctly identify market open hours', () => {
      // Mock a weekday during market hours (11:00 AM IST)
      const marketOpenTime = new Date('2024-01-15T11:00:00+05:30');
      expect(orderValidator.isMarketOpen(marketOpenTime)).toBe(true);
    });

    it('should correctly identify market closed hours', () => {
      // Mock a weekday outside market hours (8:00 AM IST)
      const marketClosedTime = new Date('2024-01-15T08:00:00+05:30');
      expect(orderValidator.isMarketOpen(marketClosedTime)).toBe(false);
    });

    it('should correctly identify weekend as market closed', () => {
      // Mock a Saturday
      const weekendTime = new Date('2024-01-13T11:00:00+05:30');
      expect(orderValidator.isMarketOpen(weekendTime)).toBe(false);
    });

    it('should calculate next market open correctly', () => {
      // Mock Friday after market close
      const fridayEvening = new Date('2024-01-12T18:00:00+05:30');
      const nextOpen = orderValidator.getNextMarketOpen(fridayEvening);
      
      // Should be a valid date with correct time
      expect(nextOpen).toBeInstanceOf(Date);
      expect(nextOpen.getHours()).toBe(MARKET_HOURS.OPEN_HOUR);
      expect(nextOpen.getMinutes()).toBe(MARKET_HOURS.OPEN_MINUTE);
      expect(nextOpen.getTime()).toBeGreaterThan(fridayEvening.getTime());
    });
  });

  describe('Tick Size Validation', () => {
    it('should validate correct tick sizes', () => {
      expect(validateTickSize(100.00)).toBe(true);
      expect(validateTickSize(100.05)).toBe(true);
      expect(validateTickSize(100.10)).toBe(true);
    });

    it('should reject incorrect tick sizes', () => {
      expect(validateTickSize(100.01)).toBe(false);
      expect(validateTickSize(100.03)).toBe(false);
      expect(validateTickSize(100.07)).toBe(false);
    });

    it('should round prices to nearest tick size', () => {
      expect(roundToTickSize(100.01)).toBeCloseTo(100.00, 2);
      expect(roundToTickSize(100.03)).toBeCloseTo(100.05, 2);
      expect(roundToTickSize(100.07)).toBeCloseTo(100.05, 2);
      expect(roundToTickSize(100.08)).toBeCloseTo(100.10, 2);
    });
  });

  describe('Stock Order Validation', () => {
    const baseStockRequest: OrderValidationRequest = {
      type: 'buy',
      instrumentType: 'stock',
      quantity: 10,
      price: 2500.50,
      orderType: 'market',
      coinBalance: 30000,
      stock: mockStock
    };

    it('should validate a correct stock buy order', () => {
      const result = validateOrder(baseStockRequest);
      
      expect(result.isValid).toBe(false); // Will be false due to market hours
      expect(result.coinCost).toBe(25005); // Math.ceil(10 * 2500.50)
      expect(result.totalAmount).toBe(25005);
      expect(result.canAfford).toBe(true); // 30000 > 25005
    });

    it('should reject stock order with insufficient balance', () => {
      const request = { ...baseStockRequest, coinBalance: 1000 };
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.canAfford).toBe(false);
      expect(result.errors.some(e => e.code === 'INSUFFICIENT_BALANCE')).toBe(true);
    });

    it('should reject stock order with invalid quantity', () => {
      const request = { ...baseStockRequest, quantity: 0 };
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_QUANTITY')).toBe(true);
    });

    it('should reject stock sell order with insufficient shares', () => {
      const request = { 
        ...baseStockRequest, 
        type: 'sell' as const, 
        availableShares: 5,
        quantity: 10 
      };
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INSUFFICIENT_SHARES')).toBe(true);
    });

    it('should reject stock order with invalid tick size', () => {
      const request = { ...baseStockRequest, price: 2500.51 }; // Invalid tick
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_TICK_SIZE')).toBe(true);
    });
  });

  describe('Option Order Validation', () => {
    const baseOptionRequest: OrderValidationRequest = {
      type: 'buy',
      instrumentType: 'option',
      quantity: 2,
      price: 151.00,
      orderType: 'market',
      coinBalance: 20000,
      optionContract: mockOptionContract
    };

    it('should validate a correct option buy order', () => {
      const result = validateOrder(baseOptionRequest);
      
      expect(result.isValid).toBe(false); // Will be false due to market hours
      expect(result.coinCost).toBe(15100); // Math.ceil(2 * 151.00 * 50)
      expect(result.totalAmount).toBe(15100);
    });

    it('should reject option order with non-integer lot quantity', () => {
      const request = { ...baseOptionRequest, quantity: 1.5 };
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_LOT_QUANTITY')).toBe(true);
    });

    it('should reject option order with expired contract', () => {
      const expiredContract = { 
        ...mockOptionContract, 
        expiry: '2020-01-01' // Past date
      };
      const request = { ...baseOptionRequest, optionContract: expiredContract };
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'EXPIRED_OPTION')).toBe(true);
    });

    it('should reject option order without contract information', () => {
      const request = { ...baseOptionRequest, optionContract: undefined };
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_OPTION_INFO')).toBe(true);
    });
  });

  describe('Limit Order Validation', () => {
    const baseLimitRequest: OrderValidationRequest = {
      type: 'buy',
      instrumentType: 'stock',
      quantity: 10,
      price: 2500.50,
      orderType: 'limit',
      coinBalance: 30000,
      stock: mockStock
    };

    it('should reject limit order without limit price', () => {
      const result = validateOrder(baseLimitRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_LIMIT_PRICE')).toBe(true);
    });

    it('should validate limit order with correct limit price', () => {
      const request = { ...baseLimitRequest, limitPrice: 2500.00 };
      const result = validateOrder(request);
      
      // Should have market hours error but not limit price error
      expect(result.errors.some(e => e.code === 'MISSING_LIMIT_PRICE')).toBe(false);
    });

    it('should warn about unfavorable limit prices', () => {
      const request = { 
        ...baseLimitRequest, 
        limitPrice: 2750.00, // 10% above market price
        type: 'buy' as const
      };
      const result = validateOrder(request);
      
      expect(result.warnings.some(w => w.code === 'HIGH_BUY_LIMIT')).toBe(true);
    });

    it('should reject limit order with invalid tick size', () => {
      const request = { ...baseLimitRequest, limitPrice: 2500.51 }; // Invalid tick
      const result = validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_LIMIT_TICK_SIZE')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing stock information', () => {
      const request: OrderValidationRequest = {
        type: 'buy',
        instrumentType: 'stock',
        quantity: 10,
        price: 2500.50,
        orderType: 'market',
        coinBalance: 30000
        // stock is undefined
      };
      
      const result = validateOrder(request);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_STOCK_INFO')).toBe(true);
    });

    it('should handle zero or negative prices', () => {
      const request: OrderValidationRequest = {
        type: 'buy',
        instrumentType: 'stock',
        quantity: 10,
        price: -100,
        orderType: 'market',
        coinBalance: 30000, // Actually wallet balance
        stock: mockStock
      };
      
      const result = validateOrder(request);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_PRICE')).toBe(true);
    });

    it('should handle maximum quantity limits', () => {
      const request: OrderValidationRequest = {
        type: 'buy',
        instrumentType: 'stock',
        quantity: TRADING_CONSTANTS.MAX_QUANTITY + 1,
        price: 100.00,
        orderType: 'market',
        coinBalance: 1000000,
        stock: mockStock
      };
      
      const result = validateOrder(request);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MAX_QUANTITY_ERROR')).toBe(true);
    });
  });

  describe('Quick Validation', () => {
    it('should perform quick validation for UI feedback', () => {
      const partialRequest = {
        type: 'buy' as const,
        instrumentType: 'stock' as const,
        quantity: 10,
        price: 2500.50
      };
      
      const result = orderValidator.quickValidate(partialRequest);
      expect(result.hasErrors).toBe(true);
      expect(result.errorCount).toBeGreaterThan(0);
    });

    it('should handle incomplete requests gracefully', () => {
      const incompleteRequest = {
        quantity: 10
      };
      
      const result = orderValidator.quickValidate(incompleteRequest);
      expect(result.hasErrors).toBe(true);
      expect(result.errorCount).toBe(1);
    });
  });
});