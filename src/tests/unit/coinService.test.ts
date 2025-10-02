/**
 * Unit tests for CoinService
 * Tests coin balance calculations, validations, and transaction logic
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { coinService } from '@/shared/services/coinService';
import { CoinErrorType, COIN_CONSTANTS } from '@/shared/types/coin';

// Mock fetch globally
global.fetch = vi.fn();

describe('CoinService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('validateCoinAmount', () => {
    it('should validate valid coin amounts', () => {
      const result = coinService.validateCoinAmount(100);
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(100);
      expect(result.message).toBeUndefined();
    });

    it('should reject amounts below minimum', () => {
      const result = coinService.validateCoinAmount(0);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least');
    });

    it('should reject amounts above maximum', () => {
      const result = coinService.validateCoinAmount(100000);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('cannot exceed');
    });

    it('should reject non-integer amounts', () => {
      const result = coinService.validateCoinAmount(10.5);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('whole number');
    });
  });

  describe('validatePurchaseAmount', () => {
    it('should validate valid purchase amounts', () => {
      const result = coinService.validatePurchaseAmount(1000);
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(1000);
      expect(result.message).toBeUndefined();
    });

    it('should reject purchase amounts below minimum', () => {
      const result = coinService.validatePurchaseAmount(50);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least');
    });

    it('should reject purchase amounts above maximum', () => {
      const result = coinService.validatePurchaseAmount(200000);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('cannot exceed');
    });
  });

  describe('getCoinBalance', () => {
    it('should return coin balance successfully', async () => {
      const mockResponse = { balance: 5000 };
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await coinService.getCoinBalance('user123');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(5000);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/coins/balance/user123'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'User not found' }),
      });

      const result = await coinService.getCoinBalance('user123');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('User not found');
    });
  });

  describe('deductCoins', () => {
    it('should deduct coins successfully', async () => {
      const mockTransaction = {
        id: 'tx123',
        userId: 'user123',
        type: 'DEBIT',
        amount: 100,
        balance: 4900,
        reason: 'Trade Purchase',
        timestamp: new Date(),
        status: 'COMPLETED'
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransaction),
      });

      const result = await coinService.deductCoins({
        userId: 'user123',
        amount: 100,
        reason: 'Trade Purchase'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.amount).toBe(100);
      expect(result.newBalance).toBe(4900);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/coins/deduct'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user123',
            amount: 100,
            reason: 'Trade Purchase'
          }),
        })
      );
    });

    it('should handle insufficient balance error', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Insufficient balance',
          type: CoinErrorType.INSUFFICIENT_BALANCE,
          code: 'INSUFFICIENT_BALANCE'
        }),
      });

      const result = await coinService.deductCoins({
        userId: 'user123',
        amount: 10000,
        reason: 'Trade Purchase'
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(CoinErrorType.INSUFFICIENT_BALANCE);
    });
  });

  describe('addCoins', () => {
    it('should add coins successfully', async () => {
      const mockTransaction = {
        id: 'tx124',
        userId: 'user123',
        type: 'CREDIT',
        amount: 500,
        balance: 5500,
        reason: 'Trade Sale',
        timestamp: new Date(),
        status: 'COMPLETED'
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransaction),
      });

      const result = await coinService.addCoins({
        userId: 'user123',
        amount: 500,
        reason: 'Trade Sale'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.amount).toBe(500);
      expect(result.newBalance).toBe(5500);
    });
  });

  describe('validateSufficientBalance', () => {
    it('should validate sufficient balance', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(5000),
      });

      const result = await coinService.validateSufficientBalance('user123', 1000);
      
      expect(result.success).toBe(true);
      expect(result.data?.hasSufficientBalance).toBe(true);
      expect(result.data?.currentBalance).toBe(5000);
      expect(result.data?.requiredAmount).toBe(1000);
      expect(result.data?.shortfall).toBeUndefined();
    });

    it('should detect insufficient balance', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(500),
      });

      const result = await coinService.validateSufficientBalance('user123', 1000);
      
      expect(result.success).toBe(true);
      expect(result.data?.hasSufficientBalance).toBe(false);
      expect(result.data?.currentBalance).toBe(500);
      expect(result.data?.requiredAmount).toBe(1000);
      expect(result.data?.shortfall).toBe(500);
    });
  });

  describe('getCoinTransactionHistory', () => {
    it('should fetch transaction history with filters', async () => {
      const mockTransactions = [
        {
          id: 'tx1',
          userId: 'user123',
          type: 'DEBIT',
          amount: 100,
          balance: 4900,
          reason: 'Trade Purchase',
          timestamp: new Date(),
          status: 'COMPLETED'
        },
        {
          id: 'tx2',
          userId: 'user123',
          type: 'CREDIT',
          amount: 200,
          balance: 5100,
          reason: 'Trade Sale',
          timestamp: new Date(),
          status: 'COMPLETED'
        }
      ];

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          transactions: mockTransactions,
          totalCount: 2,
          hasMore: false
        }),
      });

      const result = await coinService.getCoinTransactionHistory('user123', {
        type: 'DEBIT',
        limit: 10
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('purchaseCoins', () => {
    it('should purchase coins successfully', async () => {
      const mockPurchase = {
        id: 'purchase123',
        userId: 'user123',
        amount: 1000,
        cost: 100,
        paymentMethod: 'UPI',
        paymentId: 'pay123',
        status: 'COMPLETED',
        timestamp: new Date()
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          purchase: mockPurchase,
          newBalance: 6000,
          paymentUrl: 'https://payment.gateway.com/pay123'
        }),
      });

      const result = await coinService.purchaseCoins({
        userId: 'user123',
        amount: 1000,
        paymentMethod: 'UPI',
        paymentDetails: {
          paymentId: 'pay123',
          amount: 100,
          currency: 'INR',
          gateway: 'razorpay'
        }
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.amount).toBe(1000);
      expect(result.newBalance).toBe(6000);
      expect(result.paymentUrl).toBe('https://payment.gateway.com/pay123');
    });
  });

  describe('caching functionality', () => {
    it('should cache balance in localStorage', async () => {
      const mockBalance = 5000;
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBalance),
      });

      await coinService.getCoinBalanceWithCache('user123');
      
      const cached = localStorage.getItem('coin_balance_user123');
      expect(cached).toBeTruthy();
      
      const parsedCache = JSON.parse(cached!);
      expect(parsedCache.balance).toBe(5000);
      expect(parsedCache.timestamp).toBeDefined();
    });

    it('should return cached balance if valid', async () => {
      // Set up cache
      localStorage.setItem('coin_balance_user123', JSON.stringify({
        balance: 5000,
        timestamp: Date.now() - 10000 // 10 seconds ago
      }));

      const result = await coinService.getCoinBalanceWithCache('user123');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(5000);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch fresh data if cache is expired', async () => {
      // Set up expired cache
      localStorage.setItem('coin_balance_user123', JSON.stringify({
        balance: 5000,
        timestamp: Date.now() - 60000 // 60 seconds ago (expired)
      }));

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(6000),
      });

      const result = await coinService.getCoinBalanceWithCache('user123');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(6000);
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('error handling utilities', () => {
    it('should create coin errors correctly', () => {
      const error = coinService.createCoinError(
        CoinErrorType.INSUFFICIENT_BALANCE,
        'Not enough coins',
        'BALANCE_001',
        { required: 1000, available: 500 }
      );

      expect(error.name).toBe('CoinError');
      expect(error.type).toBe(CoinErrorType.INSUFFICIENT_BALANCE);
      expect(error.message).toBe('Not enough coins');
      expect(error.code).toBe('BALANCE_001');
      expect(error.details).toEqual({ required: 1000, available: 500 });
    });

    it('should identify coin errors correctly', () => {
      const coinError = coinService.createCoinError(
        CoinErrorType.INVALID_AMOUNT,
        'Invalid amount'
      );
      const regularError = new Error('Regular error');

      expect(coinService.isCoinError(coinError)).toBe(true);
      expect(coinService.isCoinError(regularError)).toBe(false);
      expect(coinService.isCoinError(null)).toBe(false);
      expect(coinService.isCoinError(undefined)).toBe(false);
    });
  });
});