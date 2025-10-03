/**
 * Integration tests for coin system with authentication
 * Tests the complete flow of coin management within the auth context
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/shared/hooks/useAuth';
import { coinService } from '@/shared/services/coinService';

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

// Mock the coin service
vi.mock('@/shared/services/coinService', () => ({
  coinService: {
    getCoinBalanceWithCache: vi.fn(),
    deductCoins: vi.fn(),
    addCoins: vi.fn(),
    validateSufficientBalance: vi.fn(),
  }
}));

// Use real useAuth hook

// Mock fetch
vi.stubGlobal('fetch', vi.fn());

import { useAuth as mockedUseAuth } from '@/shared/hooks/useAuth';

// Test component that uses the auth context
const TestComponent = () => {
  const {
    user,
    coinBalance,
    coinLoading,
    refreshCoinBalance,
    deductCoins,
    addCoins,
    validateSufficientCoins,
  } = mockedUseAuth();

  const handleDeductCoins = async () => {
    const success = await deductCoins(100, 'Test deduction');
    if (success) {
      console.log('Coins deducted successfully');
    }
  };

  const handleAddCoins = async () => {
    const success = await addCoins(50, 'Test addition');
    if (success) {
      console.log('Coins added successfully');
    }
  };

  const handleValidateCoins = async () => {
    const isValid = await validateSufficientCoins(200);
    console.log('Validation result:', isValid);
  };

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <div data-testid="user-name">{user.name}</div>
      <div data-testid="coin-balance">{coinBalance}</div>
      <div data-testid="coin-loading">{coinLoading ? 'Loading' : 'Ready'}</div>
      <button onClick={refreshCoinBalance} data-testid="refresh-balance">
        Refresh Balance
      </button>
      <button onClick={handleDeductCoins} data-testid="deduct-coins">
        Deduct Coins
      </button>
      <button onClick={handleAddCoins} data-testid="add-coins">
        Add Coins
      </button>
      <button onClick={handleValidateCoins} data-testid="validate-coins">
        Validate Coins
      </button>
    </div>
  );
};

const TestApp = () => (
  <AuthProvider>
    <TestComponent />
  </AuthProvider>
);

describe('Coin-Auth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display coin balance for authenticated user', async () => {
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

    localStorage.setItem('nifty-bulk-token', 'mock-token');
    localStorage.setItem('nifty-bulk-user', JSON.stringify(mockUser));

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });

    expect(screen.getByTestId('coin-balance')).toHaveTextContent('5000');
    expect(screen.getByTestId('coin-loading')).toHaveTextContent('Ready');
  });

  it('should refresh coin balance when button is clicked', async () => {
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

    const mockRefreshCoinBalance = vi.fn();

    (mockedUseAuth as Mock).mockReturnValue({
      user: mockUser,
      coinBalance: 5000,
      coinLoading: false,
      refreshCoinBalance: mockRefreshCoinBalance,
      deductCoins: vi.fn(),
      addCoins: vi.fn(),
      validateSufficientCoins: vi.fn(),
    });

    (coinService.getCoinBalanceWithCache as Mock).mockResolvedValue({
      success: true,
      data: 6000
    });

    render(<TestApp />);

    expect(screen.getByTestId('coin-balance')).toHaveTextContent('5000');

    fireEvent.click(screen.getByTestId('refresh-balance'));

    expect(mockRefreshCoinBalance).toHaveBeenCalled();
  });

  it('should handle coin deduction flow', async () => {
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

    localStorage.setItem('nifty-bulk-token', 'mock-token');
    localStorage.setItem('nifty-bulk-user', JSON.stringify(mockUser));

    (coinService.deductCoins as Mock).mockResolvedValue({
      success: true,
      newBalance: 4900,
      data: {
        id: 'tx123',
        amount: 100,
        balance: 4900
      }
    });

    const consoleSpy = vi.spyOn(console, 'log');

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toBeInTheDocument();
    });

    expect(screen.getByTestId('coin-balance')).toHaveTextContent('5000');

    fireEvent.click(screen.getByTestId('deduct-coins'));

    await waitFor(() => {
      expect(coinService.deductCoins).toHaveBeenCalledWith({
        userId: 'user123',
        amount: 100,
        reason: 'Test deduction'
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Coins deducted successfully');
  });

  it('should handle coin addition flow', async () => {
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

    const mockAddCoins = vi.fn().mockResolvedValue(true);

    (mockedUseAuth as Mock).mockReturnValue({
      user: mockUser,
      coinBalance: 5000,
      coinLoading: false,
      refreshCoinBalance: vi.fn(),
      deductCoins: vi.fn(),
      addCoins: mockAddCoins,
      validateSufficientCoins: vi.fn(),
    });

    (coinService.addCoins as Mock).mockResolvedValue({
      success: true,
      newBalance: 5050,
      data: {
        id: 'tx124',
        amount: 50,
        balance: 5050
      }
    });

    const consoleSpy = vi.spyOn(console, 'log');

    render(<TestApp />);

    expect(screen.getByTestId('coin-balance')).toHaveTextContent('5000');

    fireEvent.click(screen.getByTestId('add-coins'));

    await waitFor(() => {
      expect(mockAddCoins).toHaveBeenCalledWith(50, 'Test addition');
    });

    expect(coinService.addCoins).toHaveBeenCalledWith({
      userId: 'user123',
      amount: 50,
      reason: 'Test addition'
    });

    expect(consoleSpy).toHaveBeenCalledWith('Coins added successfully');
  });

  it('should handle coin validation flow', async () => {
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

    const mockValidateSufficientCoins = vi.fn().mockResolvedValue(true);

    (useAuth as Mock).mockReturnValue({
      user: mockUser,
      coinBalance: 5000,
      coinLoading: false,
      refreshCoinBalance: vi.fn(),
      deductCoins: vi.fn(),
      addCoins: vi.fn(),
      validateSufficientCoins: mockValidateSufficientCoins,
    });

    (coinService.validateSufficientBalance as Mock).mockResolvedValue({
      success: true,
      data: { hasSufficientBalance: true }
    });

    render(<TestApp />);

    fireEvent.click(screen.getByTestId('validate-coins'));

    await waitFor(() => {
      expect(mockValidateSufficientCoins).toHaveBeenCalledWith(200);
    });

    expect(coinService.validateSufficientBalance).toHaveBeenCalledWith('user123', 200);
  });

  it('should handle service errors gracefully', async () => {
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

    const mockDeductCoins = vi.fn().mockResolvedValue(false);

    (useAuth as Mock).mockReturnValue({
      user: mockUser,
      coinBalance: 5000,
      coinLoading: false,
      refreshCoinBalance: vi.fn(),
      deductCoins: mockDeductCoins,
      addCoins: vi.fn(),
      validateSufficientCoins: vi.fn(),
    });

    (coinService.deductCoins as Mock).mockResolvedValue({
      success: false,
      error: { message: 'Insufficient balance' }
    });

    render(<TestApp />);

    expect(screen.getByTestId('coin-balance')).toHaveTextContent('5000');

    fireEvent.click(screen.getByTestId('deduct-coins'));

    // Wait a bit to ensure the operation completes
    await waitFor(() => {
      expect(mockDeductCoins).toHaveBeenCalledWith(100, 'Test deduction');
    });
  });

  it('should show loading state during coin operations', async () => {
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

    const mockRefreshCoinBalance = vi.fn().mockImplementation(async () => {
      // Simulate loading
    });

    (useAuth as Mock).mockReturnValue({
      user: mockUser,
      coinBalance: 5000,
      coinLoading: false,
      refreshCoinBalance: mockRefreshCoinBalance,
      deductCoins: vi.fn(),
      addCoins: vi.fn(),
      validateSufficientCoins: vi.fn(),
    });

    // Mock a delayed response
    (coinService.getCoinBalanceWithCache as Mock).mockImplementation(
      () => new Promise(resolve =>
        setTimeout(() => resolve({ success: true, data: 6000 }), 100)
      )
    );

    render(<TestApp />);

    expect(screen.getByTestId('coin-loading')).toHaveTextContent('Ready');

    fireEvent.click(screen.getByTestId('refresh-balance'));

    await waitFor(() => {
      expect(mockRefreshCoinBalance).toHaveBeenCalled();
    });
  });

  it('should not show coin data for unauthenticated users', () => {
    (mockedUseAuth as Mock).mockReturnValue({
      user: null,
      coinBalance: 0,
      coinLoading: false,
      refreshCoinBalance: vi.fn(),
      deductCoins: vi.fn(),
      addCoins: vi.fn(),
      validateSufficientCoins: vi.fn(),
    });

    render(<TestApp />);
    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });
});