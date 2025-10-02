import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { tradingService, type OrderRequest, type TradeExecutionRequest } from '@/features/trading/services/tradingService';
import { coinService } from '@/shared/services/coinService';
import { apiService } from '@/shared/services/api';
import type { Stock, OptionContract, Portfolio } from '@/shared/types';
import type { CoinTransaction } from '@/shared/types/coin';

// Mock dependencies
vi.mock('@/shared/services/coinService');
vi.mock('@/shared/services/api');
vi.mock('@/shared/utils/orderValidation', () => ({
  validateOrder: vi.fn(),
  isMarketOpen: vi.fn(() => true),
  getNextMarketOpen: vi.fn(() => new Date())
}));

describe('Trading Service', () => {
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    walletBalance: 50000,
    coinBalance: 10000
  };

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

  const mockCoinTransaction: CoinTransaction = {
    id: 'txn123',
    userId: 'user123',
    type: 'DEBIT',
    amount: 2501,
    balance: 7499,
    reason: 'Stock Purchase: RELIANCE',
    timestamp: new Date(),
    status: 'COMPLETED'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Order Validation', () => {
    it('should validate order successfully', async () => {
      const mockValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      };

      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue(mockValidationResult);

      const request = {
        type: 'buy' as const,
        instrumentType: 'stock' as const,
        quantity: 1,
        price: 2500.50,
        orderType: 'market' as const,
        coinBalance: 10000,
        stock: mockStock
      };

      const result = await tradingService.validateOrder(request);
      
      expect(result.isValid).toBe(true);
      expect(result.coinCost).toBe(2501);
      expect(result.canAfford).toBe(true);
    });

    it('should handle validation errors', async () => {
      const mockValidationResult = {
        isValid: false,
        errors: [{ field: 'quantity', message: 'Invalid quantity', code: 'INVALID_QUANTITY' }],
        warnings: [],
        coinCost: 0,
        totalAmount: 0,
        canAfford: false
      };

      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue(mockValidationResult);

      const request = {
        type: 'buy' as const,
        instrumentType: 'stock' as const,
        quantity: 0,
        price: 2500.50,
        orderType: 'market' as const,
        coinBalance: 10000,
        stock: mockStock
      };

      const result = await tradingService.validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_QUANTITY');
    });
  });

  describe('Order Execution', () => {
    it('should execute buy order successfully', async () => {
      // Mock coin service response
      (coinService.deductCoins as Mock).mockResolvedValue({
        success: true,
        data: mockCoinTransaction,
        newBalance: 7499
      });

      // Mock API service response
      (apiService.placeOptionsOrder as Mock).mockResolvedValue({
        success: true,
        orderId: 'order123'
      });

      const orderRequest: OrderRequest = {
        userId: mockUser.id,
        symbol: 'RELIANCE',
        instrumentType: 'stock',
        action: 'BUY',
        quantity: 1,
        orderType: 'MARKET',
        price: 2500.50,
        coinAmount: 2501
      };

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      };

      const executionRequest: TradeExecutionRequest = {
        orderRequest,
        validationResult,
        stock: mockStock
      };

      const result = await tradingService.executeOrder(executionRequest);

      expect(result.status).toBe('SUCCESS');
      expect(result.executedQuantity).toBe(1);
      expect(result.executedPrice).toBe(2500.50);
      expect(result.coinAmount).toBe(2501);
      expect(result.coinTransaction).toEqual(mockCoinTransaction);
      expect(coinService.deductCoins).toHaveBeenCalledWith({
        userId: mockUser.id,
        amount: 2501,
        reason: 'Stock Purchase: RELIANCE',
        relatedTradeId: expect.any(String)
      });
    });

    it('should execute sell order successfully', async () => {
      // Mock coin service response for sell order
      (coinService.addCoins as Mock).mockResolvedValue({
        success: true,
        data: { ...mockCoinTransaction, type: 'CREDIT' },
        newBalance: 12501
      });

      const orderRequest: OrderRequest = {
        userId: mockUser.id,
        symbol: 'RELIANCE',
        instrumentType: 'stock',
        action: 'SELL',
        quantity: 1,
        orderType: 'MARKET',
        price: 2500.50,
        coinAmount: 2501
      };

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      };

      const executionRequest: TradeExecutionRequest = {
        orderRequest,
        validationResult,
        stock: mockStock
      };

      const result = await tradingService.executeOrder(executionRequest);

      expect(result.status).toBe('SUCCESS');
      expect(result.executedQuantity).toBe(1);
      expect(coinService.addCoins).toHaveBeenCalledWith({
        userId: mockUser.id,
        amount: 2501,
        reason: 'Stock Sale: RELIANCE',
        relatedTradeId: expect.any(String)
      });
    });

    it('should handle coin deduction failure', async () => {
      // Mock coin service failure
      (coinService.deductCoins as Mock).mockResolvedValue({
        success: false,
        error: { message: 'Insufficient balance' }
      });

      const orderRequest: OrderRequest = {
        userId: mockUser.id,
        symbol: 'RELIANCE',
        instrumentType: 'stock',
        action: 'BUY',
        quantity: 1,
        orderType: 'MARKET',
        price: 2500.50,
        coinAmount: 2501
      };

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      };

      const executionRequest: TradeExecutionRequest = {
        orderRequest,
        validationResult,
        stock: mockStock
      };

      const result = await tradingService.executeOrder(executionRequest);

      expect(result.status).toBe('FAILED');
      expect(result.message).toContain('Insufficient balance');
    });

    it('should handle invalid validation result', async () => {
      const orderRequest: OrderRequest = {
        userId: mockUser.id,
        symbol: 'RELIANCE',
        instrumentType: 'stock',
        action: 'BUY',
        quantity: 1,
        orderType: 'MARKET',
        price: 2500.50,
        coinAmount: 2501
      };

      const validationResult = {
        isValid: false,
        errors: [{ field: 'balance', message: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' }],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: false
      };

      const executionRequest: TradeExecutionRequest = {
        orderRequest,
        validationResult,
        stock: mockStock
      };

      const result = await tradingService.executeOrder(executionRequest);

      expect(result.status).toBe('FAILED');
      expect(result.message).toContain('Insufficient balance');
    });
  });

  describe('Option Trading', () => {
    it('should execute option buy order successfully', async () => {
      (coinService.deductCoins as Mock).mockResolvedValue({
        success: true,
        data: mockCoinTransaction,
        newBalance: 2499
      });

      const orderRequest: OrderRequest = {
        userId: mockUser.id,
        symbol: 'NIFTY25DEC19400CE',
        instrumentType: 'option',
        action: 'BUY',
        quantity: 1,
        orderType: 'MARKET',
        price: 151.00,
        coinAmount: 7550, // 1 * 151.00 * 50
        optionDetails: {
          strike: 19400,
          expiry: '2025-12-25',
          optionType: 'CE',
          lotSize: 50
        }
      };

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 7550,
        totalAmount: 7550,
        canAfford: true
      };

      const executionRequest: TradeExecutionRequest = {
        orderRequest,
        validationResult,
        optionContract: mockOptionContract
      };

      const result = await tradingService.executeOrder(executionRequest);

      expect(result.status).toBe('SUCCESS');
      expect(result.executedQuantity).toBe(1);
      expect(result.coinAmount).toBe(7550);
      expect(coinService.deductCoins).toHaveBeenCalledWith({
        userId: mockUser.id,
        amount: 7550,
        reason: 'Option Purchase: NIFTY25DEC19400CE',
        relatedTradeId: expect.any(String)
      });
    });
  });

  describe('Portfolio Management', () => {
    const mockPortfolio: Portfolio[] = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        quantity: 10,
        avgPrice: 2400.00,
        currentPrice: 2500.50,
        instrumentType: 'stock'
      },
      {
        symbol: 'NIFTY25DEC19400CE',
        name: 'NIFTY 19400 CE',
        quantity: 2,
        avgPrice: 140.00,
        currentPrice: 151.00,
        instrumentType: 'option',
        optionDetails: {
          strike: 19400,
          expiry: '2025-12-25',
          optionType: 'CE',
          lotSize: 50
        }
      }
    ];

    it('should calculate portfolio summary correctly', async () => {
      const summary = await tradingService.getPortfolioSummary(mockUser.id, mockPortfolio);

      // Stock: 10 * 2500.50 = 25005, invested: 10 * 2400 = 24000
      // Option: 2 * 151.00 * 50 = 15100, invested: 2 * 140.00 * 50 = 14000
      const expectedTotalValue = 25005 + 15100; // 40105
      const expectedTotalInvested = 24000 + 14000; // 38000
      const expectedPnL = expectedTotalValue - expectedTotalInvested; // 2105

      expect(summary.totalValue).toBe(expectedTotalValue);
      expect(summary.totalInvested).toBe(expectedTotalInvested);
      expect(summary.totalPnL).toBe(expectedPnL);
      expect(summary.totalCoinsInvested).toBe(expectedTotalInvested);
      expect(summary.activeTrades).toBe(2);
    });

    it('should calculate position P&L correctly', () => {
      const position = mockPortfolio[0]; // RELIANCE stock
      const pnl = tradingService.calculatePositionPnL(position);

      const expectedPnL = (2500.50 - 2400.00) * 10; // 1005
      const expectedPnLPercent = (expectedPnL / (2400.00 * 10)) * 100; // 4.1875%

      expect(pnl.pnl).toBe(expectedPnL);
      expect(pnl.pnlPercent).toBeCloseTo(expectedPnLPercent, 2);
      expect(pnl.coinPnL).toBe(expectedPnL);
    });
  });

  describe('Position Closing', () => {
    it('should close position successfully', async () => {
      (coinService.addCoins as Mock).mockResolvedValue({
        success: true,
        data: mockCoinTransaction,
        newBalance: 35005
      });

      const position: Portfolio = {
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        quantity: 10,
        avgPrice: 2400.00,
        currentPrice: 2500.50,
        instrumentType: 'stock'
      };

      const result = await tradingService.closePosition(mockUser.id, position);

      expect(result.status).toBe('SUCCESS');
      expect(result.executedQuantity).toBe(10);
      expect(result.executedPrice).toBe(2500.50);
      expect(coinService.addCoins).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    it('should estimate fees correctly', () => {
      const fees = tradingService.estimateFees(10000);
      expect(fees).toBe(10); // 0.1% of 10000
    });

    it('should convert coins to rupees correctly', () => {
      const rupees = tradingService.coinsToRupees(1000);
      expect(rupees).toBe(1000); // 1:1 ratio
    });

    it('should convert rupees to coins correctly', () => {
      const coins = tradingService.rupeesToCoins(999.99);
      expect(coins).toBe(1000); // Rounded up
    });

    it('should get correct coin to rupee rate', () => {
      const rate = tradingService.getCoinToRupeeRate();
      expect(rate).toBe(1);
    });
  });

  describe('Market Status', () => {
    it('should get market status correctly', async () => {
      const status = await tradingService.getMarketStatus();
      
      expect(status).toHaveProperty('isOpen');
      expect(status).toHaveProperty('currentTime');
      expect(status.currentTime).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockImplementation(() => {
        throw new Error('Validation service unavailable');
      });

      const request = {
        type: 'buy' as const,
        instrumentType: 'stock' as const,
        quantity: 1,
        price: 2500.50,
        orderType: 'market' as const,
        coinBalance: 10000,
        stock: mockStock
      };

      const result = await tradingService.validateOrder(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('should handle execution errors gracefully', async () => {
      (coinService.deductCoins as Mock).mockRejectedValue(new Error('Service unavailable'));

      const orderRequest: OrderRequest = {
        userId: mockUser.id,
        symbol: 'RELIANCE',
        instrumentType: 'stock',
        action: 'BUY',
        quantity: 1,
        orderType: 'MARKET',
        price: 2500.50,
        coinAmount: 2501
      };

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      };

      const executionRequest: TradeExecutionRequest = {
        orderRequest,
        validationResult,
        stock: mockStock
      };

      const result = await tradingService.executeOrder(executionRequest);

      expect(result.status).toBe('FAILED');
      expect(result.message).toContain('Service unavailable');
    });
  });
});