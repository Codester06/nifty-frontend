import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminCoinService } from '@/shared/services/adminCoinService';
import { coinService } from '@/shared/services/coinService';

// Mock the coinService
vi.mock('@/shared/services/coinService', () => ({
  coinService: {
    addCoins: vi.fn(),
    deductCoins: vi.fn(),
    validateSufficientBalance: vi.fn(),
    getCoinBalanceDetails: vi.fn(),
    getCoinTransactionHistory: vi.fn()
  }
}));

describe('AdminCoinService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('manuallyAddCoins', () => {
    it('should successfully add coins with admin context', async () => {
      const mockResult = {
        success: true,
        data: {
          id: 'test-transaction',
          userId: 'user123',
          type: 'CREDIT' as const,
          amount: 1000,
          balance: 5000,
          reason: '[ADMIN] Promotional bonus',
          timestamp: new Date(),
          status: 'COMPLETED' as const
        },
        newBalance: 5000
      };

      vi.mocked(coinService.addCoins).mockResolvedValue(mockResult);

      const request = {
        userId: 'user123',
        amount: 1000,
        reason: 'Promotional bonus'
      };

      const result = await adminCoinService.manuallyAddCoins(request);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(5000);
      expect(coinService.addCoins).toHaveBeenCalledWith({
        ...request,
        reason: '[ADMIN] Promotional bonus'
      });
    });

    it('should reject invalid amounts', async () => {
      const request = {
        userId: 'user123',
        amount: -100, // Invalid negative amount
        reason: 'Test'
      };

      const result = await adminCoinService.manuallyAddCoins(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ADMIN_VALIDATION_FAILED');
      expect(coinService.addCoins).not.toHaveBeenCalled();
    });

    it('should reject amounts exceeding maximum limit', async () => {
      const request = {
        userId: 'user123',
        amount: 150000, // Exceeds 100,000 limit
        reason: 'Test'
      };

      const result = await adminCoinService.manuallyAddCoins(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ADMIN_VALIDATION_FAILED');
    });
  });

  describe('manuallyDeductCoins', () => {
    it('should successfully deduct coins when user has sufficient balance', async () => {
      const mockBalanceCheck = {
        success: true,
        data: {
          currentBalance: 5000,
          requiredAmount: 1000,
          hasSufficientBalance: true
        }
      };

      const mockResult = {
        success: true,
        data: {
          id: 'test-transaction',
          userId: 'user123',
          type: 'DEBIT' as const,
          amount: 1000,
          balance: 4000,
          reason: '[ADMIN] Manual adjustment',
          timestamp: new Date(),
          status: 'COMPLETED' as const
        },
        newBalance: 4000
      };

      vi.mocked(coinService.validateSufficientBalance).mockResolvedValue(mockBalanceCheck);
      vi.mocked(coinService.deductCoins).mockResolvedValue(mockResult);

      const request = {
        userId: 'user123',
        amount: 1000,
        reason: 'Manual adjustment'
      };

      const result = await adminCoinService.manuallyDeductCoins(request);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(4000);
      expect(coinService.validateSufficientBalance).toHaveBeenCalledWith('user123', 1000);
      expect(coinService.deductCoins).toHaveBeenCalledWith({
        ...request,
        reason: '[ADMIN] Manual adjustment'
      });
    });

    it('should reject deduction when user has insufficient balance', async () => {
      const mockBalanceCheck = {
        success: true,
        data: {
          currentBalance: 500,
          requiredAmount: 1000,
          hasSufficientBalance: false
        }
      };

      vi.mocked(coinService.validateSufficientBalance).mockResolvedValue(mockBalanceCheck);

      const request = {
        userId: 'user123',
        amount: 1000,
        reason: 'Manual adjustment'
      };

      const result = await adminCoinService.manuallyDeductCoins(request);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('INSUFFICIENT_BALANCE');
      expect(result.newBalance).toBe(500);
      expect(coinService.deductCoins).not.toHaveBeenCalled();
    });
  });

  describe('simulatePaymentSuccess', () => {
    it('should simulate successful payment processing', async () => {
      const mockResult = {
        success: true,
        data: {
          id: 'test-transaction',
          userId: 'user123',
          type: 'CREDIT' as const,
          amount: 1000,
          balance: 5000,
          reason: '[ADMIN] Manual coin addition by admin',
          timestamp: new Date(),
          status: 'COMPLETED' as const
        },
        newBalance: 5000
      };

      vi.mocked(coinService.addCoins).mockResolvedValue(mockResult);

      const result = await adminCoinService.simulatePaymentSuccess('user123', 1000, 'Test payment');

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(5000);
      expect(result.transactionId).toMatch(/^admin_\d+_[a-z0-9]+$/);
      expect(result.message).toContain('Payment processed successfully');
    });
  });

  describe('simulatePaymentFailure', () => {
    it('should simulate payment failure', async () => {
      const result = await adminCoinService.simulatePaymentFailure('Network error');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment failed: Network error');
      expect(result.errorCode).toBe('PAYMENT_FAILED');
      expect(result.transactionId).toMatch(/^failed_\d+_[a-z0-9]+$/);
    });
  });

  describe('admin action logging', () => {
    it('should log admin actions to localStorage', async () => {
      const mockResult = {
        success: true,
        data: {
          id: 'test-transaction',
          userId: 'user123',
          type: 'CREDIT' as const,
          amount: 1000,
          balance: 5000,
          reason: '[ADMIN] Test action',
          timestamp: new Date(),
          status: 'COMPLETED' as const
        },
        newBalance: 5000
      };

      vi.mocked(coinService.addCoins).mockResolvedValue(mockResult);

      await adminCoinService.manuallyAddCoins({
        userId: 'user123',
        amount: 1000,
        reason: 'Test action'
      });

      const logs = adminCoinService.getAdminActionLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('ADD_COINS');
      expect(logs[0].userId).toBe('user123');
      expect(logs[0].amount).toBe(1000);
      expect(logs[0].reason).toBe('Test action');
    });

    it('should retrieve admin action logs', () => {
      // Manually add a log to localStorage
      const testLog = {
        timestamp: new Date().toISOString(),
        action: 'ADD_COINS',
        userId: 'user123',
        amount: 1000,
        reason: 'Test',
        adminId: 'admin123'
      };

      localStorage.setItem('admin_coin_logs', JSON.stringify([testLog]));

      const logs = adminCoinService.getAdminActionLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual(testLog);
    });
  });

  describe('getAdminCoinStats', () => {
    it('should return admin coin statistics', async () => {
      const result = await adminCoinService.getAdminCoinStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalCoinsInSystem');
      expect(result.data).toHaveProperty('totalUsersWithCoins');
      expect(result.data).toHaveProperty('averageUserBalance');
      expect(result.data).toHaveProperty('totalAdminTransactions');
      expect(result.data).toHaveProperty('recentAdminActions');
    });
  });
});