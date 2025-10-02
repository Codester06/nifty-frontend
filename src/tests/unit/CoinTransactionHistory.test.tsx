import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoinTransactionHistory from '@/components/ui/CoinTransactionHistory';
import { useAuth } from '@/shared/hooks/useAuth';
import { coinService } from '@/shared/services';
import { CoinTransaction } from '@/shared/types/coin';

// Mock the useAuth hook
vi.mock('@/shared/hooks/useAuth');

// Mock the coinService
vi.mock('@/shared/services', () => ({
  coinService: {
    getCoinTransactionHistory: vi.fn()
  }
}));

const mockUseAuth = vi.mocked(useAuth);
const mockCoinService = vi.mocked(coinService);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CoinTransactionHistory', () => {
  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    walletBalance: 5000,
    coinBalance: 2500,
    totalCoinsEarned: 0,
    totalCoinsPurchased: 0
  };

  const mockTransactions: CoinTransaction[] = [
    {
      id: 'tx-1',
      userId: 'test-user-id',
      type: 'CREDIT',
      amount: 1000,
      balance: 2500,
      reason: 'Trade Sale',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      status: 'COMPLETED'
    },
    {
      id: 'tx-2',
      userId: 'test-user-id',
      type: 'DEBIT',
      amount: 500,
      balance: 1500,
      reason: 'Trade Purchase',
      relatedTradeId: 'trade-123',
      timestamp: new Date('2024-01-14T14:20:00Z'),
      status: 'COMPLETED'
    },
    {
      id: 'tx-3',
      userId: 'test-user-id',
      type: 'PURCHASE',
      amount: 2000,
      balance: 2000,
      reason: 'Coin Purchase',
      timestamp: new Date('2024-01-13T09:15:00Z'),
      status: 'COMPLETED'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      coinBalance: 2500,
      coinLoading: false,
      isAuthenticated: true,
      userRole: 'user',
      loading: false,
      login: vi.fn(),
      loginEmail: vi.fn(),
      superAdminLogin: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      refreshWalletBalance: vi.fn(),
      refreshCoinBalance: vi.fn(),
      updateCoinBalance: vi.fn(),
      deductCoins: vi.fn(),
      addCoins: vi.fn(),
      validateSufficientCoins: vi.fn(),
      transactions: [],
      portfolio: [],
      wishlist: [],
      addTransaction: vi.fn(),
      addToWishlist: vi.fn(),
      removeFromWishlist: vi.fn(),
      isInWishlist: vi.fn(),
      updatePortfolio: vi.fn(),
      shouldRedirectToAdminDashboard: vi.fn()
    });
  });

  describe('Authentication States', () => {
    it('should show login message when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        coinBalance: 0,
        coinLoading: false,
        isAuthenticated: false,
        userRole: null,
        loading: false,
        login: vi.fn(),
        loginEmail: vi.fn(),
        superAdminLogin: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
        refreshWalletBalance: vi.fn(),
        refreshCoinBalance: vi.fn(),
        updateCoinBalance: vi.fn(),
        deductCoins: vi.fn(),
        addCoins: vi.fn(),
        validateSufficientCoins: vi.fn(),
        transactions: [],
        portfolio: [],
        wishlist: [],
        addTransaction: vi.fn(),
        addToWishlist: vi.fn(),
        removeFromWishlist: vi.fn(),
        isInWishlist: vi.fn(),
        updatePortfolio: vi.fn(),
        shouldRedirectToAdminDashboard: vi.fn()
      });

      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      expect(screen.getByText('Please log in to view transaction history')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton while fetching transactions', async () => {
      mockCoinService.getCoinTransactionHistory.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockTransactions,
          totalCount: 3,
          hasMore: false
        }), 100))
      );

      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      // Should show loading skeletons
      expect(screen.getAllByRole('generic', { hidden: true })[0]).toHaveClass('animate-pulse');
    });
  });

  describe('Transaction Display', () => {
    beforeEach(() => {
      mockCoinService.getCoinTransactionHistory.mockResolvedValue({
        success: true,
        data: mockTransactions,
        totalCount: 3,
        hasMore: false
      });
    });

    it('should display transaction history correctly', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Transaction History')).toBeInTheDocument();
        expect(screen.getByText('Trade Sale')).toBeInTheDocument();
        expect(screen.getByText('Trade Purchase')).toBeInTheDocument();
        expect(screen.getByText('Coin Purchase')).toBeInTheDocument();
      });
    });

    it('should display transaction amounts with correct colors', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        // Credit transaction should be green with +
        const creditAmount = screen.getByText('+1,000');
        expect(creditAmount).toHaveClass('text-green-600');

        // Debit transaction should be red with -
        const debitAmount = screen.getByText('-500');
        expect(debitAmount).toHaveClass('text-red-600');

        // Purchase transaction should be green with +
        const purchaseAmount = screen.getByText('+2,000');
        expect(purchaseAmount).toHaveClass('text-green-600');
      });
    });

    it('should display transaction status badges', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        const statusBadges = screen.getAllByText('COMPLETED');
        expect(statusBadges).toHaveLength(3);
        statusBadges.forEach(badge => {
          expect(badge).toHaveClass('text-green-600');
        });
      });
    });

    it('should format dates correctly', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/15 Jan 2024/)).toBeInTheDocument();
        expect(screen.getByText(/14 Jan 2024/)).toBeInTheDocument();
        expect(screen.getByText(/13 Jan 2024/)).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no transactions found', async () => {
      mockCoinService.getCoinTransactionHistory.mockResolvedValue({
        success: true,
        data: [],
        totalCount: 0,
        hasMore: false
      });

      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No transactions found')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should show error message when API call fails', async () => {
      mockCoinService.getCoinTransactionHistory.mockResolvedValue({
        success: false,
        error: {
          name: 'CoinError',
          message: 'Failed to fetch transactions',
          type: 'TRANSACTION_FAILED' as any,
          code: 'API_ERROR'
        }
      });

      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button is clicked', async () => {
      mockCoinService.getCoinTransactionHistory
        .mockResolvedValueOnce({
          success: false,
          error: {
            name: 'CoinError',
            message: 'Failed to fetch transactions',
            type: 'TRANSACTION_FAILED' as any,
            code: 'API_ERROR'
          }
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockTransactions,
          totalCount: 3,
          hasMore: false
        });

      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Trade Sale')).toBeInTheDocument();
      });

      expect(mockCoinService.getCoinTransactionHistory).toHaveBeenCalledTimes(2);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      mockCoinService.getCoinTransactionHistory.mockResolvedValue({
        success: true,
        data: mockTransactions,
        totalCount: 3,
        hasMore: false
      });
    });

    it('should show filter panel when filters button is clicked', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });

      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);

      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('should apply type filter correctly', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      const typeSelect = screen.getByDisplayValue('All Types');
      fireEvent.change(typeSelect, { target: { value: 'CREDIT' } });

      await waitFor(() => {
        expect(mockCoinService.getCoinTransactionHistory).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            type: 'CREDIT',
            limit: 10,
            offset: 0
          })
        );
      });
    });

    it('should apply status filter correctly', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      const statusSelect = screen.getByDisplayValue('All Status');
      fireEvent.change(statusSelect, { target: { value: 'PENDING' } });

      await waitFor(() => {
        expect(mockCoinService.getCoinTransactionHistory).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            status: 'PENDING',
            limit: 10,
            offset: 0
          })
        );
      });
    });

    it('should clear filters when clear button is clicked', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        const filtersButton = screen.getByText('Filters');
        fireEvent.click(filtersButton);
      });

      // Apply a filter first
      const typeSelect = screen.getByDisplayValue('All Types');
      fireEvent.change(typeSelect, { target: { value: 'CREDIT' } });

      // Clear filters
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockCoinService.getCoinTransactionHistory).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            limit: 10,
            offset: 0
          })
        );
      });
    });
  });

  describe('Transaction Details Modal', () => {
    beforeEach(() => {
      mockCoinService.getCoinTransactionHistory.mockResolvedValue({
        success: true,
        data: mockTransactions,
        totalCount: 3,
        hasMore: false
      });
    });

    it('should open transaction details modal when view details button is clicked', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Trade Sale')).toBeInTheDocument();
      });

      const viewDetailsButtons = screen.getAllByTitle('View details');
      fireEvent.click(viewDetailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Transaction Details')).toBeInTheDocument();
        expect(screen.getByText('tx-1')).toBeInTheDocument();
      });
    });

    it('should close transaction details modal when close button is clicked', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory />
        </TestWrapper>
      );

      await waitFor(() => {
        const viewDetailsButtons = screen.getAllByTitle('View details');
        fireEvent.click(viewDetailsButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Transaction Details')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
      id: `tx-${i + 1}`,
      userId: 'test-user-id',
      type: 'CREDIT' as const,
      amount: 100 * (i + 1),
      balance: 1000 + (100 * i),
      reason: `Transaction ${i + 1}`,
      timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`),
      status: 'COMPLETED' as const
    }));

    it('should show pagination when there are multiple pages', async () => {
      mockCoinService.getCoinTransactionHistory.mockResolvedValue({
        success: true,
        data: manyTransactions.slice(0, 10),
        totalCount: 25,
        hasMore: true
      });

      render(
        <TestWrapper>
          <CoinTransactionHistory pageSize={10} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Showing 1 to 10 of 25 transactions')).toBeInTheDocument();
        expect(screen.getByText('1 of 3')).toBeInTheDocument();
      });
    });

    it('should navigate to next page when next button is clicked', async () => {
      mockCoinService.getCoinTransactionHistory
        .mockResolvedValueOnce({
          success: true,
          data: manyTransactions.slice(0, 10),
          totalCount: 25,
          hasMore: true
        })
        .mockResolvedValueOnce({
          success: true,
          data: manyTransactions.slice(10, 20),
          totalCount: 25,
          hasMore: true
        });

      render(
        <TestWrapper>
          <CoinTransactionHistory pageSize={10} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('1 of 3')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockCoinService.getCoinTransactionHistory).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            offset: 10
          })
        );
      });
    });
  });

  describe('Component Props', () => {
    beforeEach(() => {
      mockCoinService.getCoinTransactionHistory.mockResolvedValue({
        success: true,
        data: mockTransactions,
        totalCount: 3,
        hasMore: false
      });
    });

    it('should apply custom className', async () => {
      const { container } = render(
        <TestWrapper>
          <CoinTransactionHistory className="custom-class" />
        </TestWrapper>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should hide filters when showFilters is false', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory showFilters={false} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Filters')).not.toBeInTheDocument();
      });
    });

    it('should use custom page size', async () => {
      render(
        <TestWrapper>
          <CoinTransactionHistory pageSize={5} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockCoinService.getCoinTransactionHistory).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            limit: 5
          })
        );
      });
    });
  });
});