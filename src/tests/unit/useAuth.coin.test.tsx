/**
 * Unit tests for useAuth hook coin integration
 * Tests coin balance tracking and management in authentication context
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/shared/hooks/useAuth';
import { coinService } from '@/shared/services/coinService';
import type { ReactNode } from 'react';

// Mock the coin service
vi.mock('@/shared/services/coinService', () => ({
  coinService: {
    getCoinBalanceWithCache: vi.fn(),
    deductCoins: vi.fn(),
    addCoins: vi.fn(),
    validateSufficientBalance: vi.fn(),
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = vi.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth - Coin Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('coin balance initialization', () => {
    it('should initialize coin balance from saved user data', () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.coinBalance).toBe(5000);
      expect(result.current.user?.coinBalance).toBe(5000);
    });

    it('should default to 0 coin balance if not in saved data', () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 0,
        totalCoinsEarned: 0,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.coinBalance).toBe(0);
    });
  });

  describe('refreshCoinBalance', () => {
    it('should refresh coin balance from service', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.getCoinBalanceWithCache as Mock).mockResolvedValue({
        success: true,
        data: 6000
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshCoinBalance();
      });

      expect(result.current.coinBalance).toBe(6000);
      expect(coinService.getCoinBalanceWithCache).toHaveBeenCalledWith('user123');
    });

    it('should handle refresh errors gracefully', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.getCoinBalanceWithCache as Mock).mockResolvedValue({
        success: false,
        error: { message: 'Network error' }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshCoinBalance();
      });

      // Balance should remain unchanged on error
      expect(result.current.coinBalance).toBe(5000);
    });
  });

  describe('updateCoinBalance', () => {
    it('should update coin balance locally', () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.updateCoinBalance(7500);
      });

      expect(result.current.coinBalance).toBe(7500);
      expect(result.current.user?.coinBalance).toBe(7500);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'nifty-bulk-user',
        expect.stringContaining('"coinBalance":7500')
      );
    });
  });

  describe('deductCoins', () => {
    it('should deduct coins successfully', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.deductCoins as Mock).mockResolvedValue({
        success: true,
        newBalance: 4500,
        data: {
          id: 'tx123',
          amount: 500,
          balance: 4500
        }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let deductResult: boolean;
      await act(async () => {
        deductResult = await result.current.deductCoins(500, 'Trade Purchase', 'trade123');
      });

      expect(deductResult!).toBe(true);
      expect(result.current.coinBalance).toBe(4500);
      expect(coinService.deductCoins).toHaveBeenCalledWith({
        userId: 'user123',
        amount: 500,
        reason: 'Trade Purchase',
        relatedTradeId: 'trade123'
      });
    });

    it('should handle deduction failures', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.deductCoins as Mock).mockResolvedValue({
        success: false,
        error: { message: 'Insufficient balance' }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let deductResult: boolean;
      await act(async () => {
        deductResult = await result.current.deductCoins(10000, 'Trade Purchase');
      });

      expect(deductResult!).toBe(false);
      expect(result.current.coinBalance).toBe(5000); // Should remain unchanged
    });
  });

  describe('addCoins', () => {
    it('should add coins successfully', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.addCoins as Mock).mockResolvedValue({
        success: true,
        newBalance: 5500,
        data: {
          id: 'tx124',
          amount: 500,
          balance: 5500
        }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let addResult: boolean;
      await act(async () => {
        addResult = await result.current.addCoins(500, 'Trade Sale', 'trade124');
      });

      expect(addResult!).toBe(true);
      expect(result.current.coinBalance).toBe(5500);
      expect(coinService.addCoins).toHaveBeenCalledWith({
        userId: 'user123',
        amount: 500,
        reason: 'Trade Sale',
        relatedTradeId: 'trade124'
      });
    });
  });

  describe('validateSufficientCoins', () => {
    it('should validate sufficient coins', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.validateSufficientBalance as Mock).mockResolvedValue({
        success: true,
        data: { hasSufficientBalance: true }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let validationResult: boolean;
      await act(async () => {
        validationResult = await result.current.validateSufficientCoins(1000);
      });

      expect(validationResult!).toBe(true);
      expect(coinService.validateSufficientBalance).toHaveBeenCalledWith('user123', 1000);
    });

    it('should detect insufficient coins', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.validateSufficientBalance as Mock).mockResolvedValue({
        success: true,
        data: { hasSufficientBalance: false }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let validationResult: boolean;
      await act(async () => {
        validationResult = await result.current.validateSufficientCoins(10000);
      });

      expect(validationResult!).toBe(false);
    });
  });

  describe('login integration', () => {
    it('should initialize coin balance on successful login', async () => {
      const mockUserData = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      // Mock successful login response
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6InVzZXIxMjMiLCJ1c2VybmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJ1c2VyIn0.test'
        })
      });

      // Mock profile fetch
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login('1234567890', '123456');
      });

      expect(loginResult!).toBe(true);
      expect(result.current.coinBalance).toBe(5000);
      expect(result.current.user?.coinBalance).toBe(5000);
    });
  });

  describe('logout integration', () => {
    it('should clear coin balance on logout', () => {
      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      // Mock window.location.href
      delete (window as any).location;
      (window as any).location = { href: '' };

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.coinBalance).toBe(5000);

      act(() => {
        result.current.logout();
      });

      expect(result.current.coinBalance).toBe(0);
      expect(result.current.user).toBeNull();
    });
  });

  describe('periodic refresh', () => {
    it('should set up periodic coin balance refresh for authenticated users', async () => {
      vi.useFakeTimers();

      const mockUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
        walletBalance: 10000,
        coinBalance: 5000,
        totalCoinsEarned: 5000,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      (coinService.getCoinBalanceWithCache as Mock).mockResolvedValue({
        success: true,
        data: 5000
      });

      renderHook(() => useAuth(), { wrapper });

      // Fast-forward 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(coinService.getCoinBalanceWithCache).toHaveBeenCalledWith('user123');
      });

      vi.useRealTimers();
    });

    it('should not set up refresh for superadmin users', () => {
      vi.useFakeTimers();

      const mockUser = {
        id: 'superadmin',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: 'superadmin' as const,
        walletBalance: 0,
        coinBalance: 0,
        totalCoinsEarned: 0,
        totalCoinsPurchased: 0
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'nifty-bulk-token') return 'mock-token';
        if (key === 'nifty-bulk-user') return JSON.stringify(mockUser);
        return null;
      });

      renderHook(() => useAuth(), { wrapper });

      // Fast-forward 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(coinService.getCoinBalanceWithCache).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});