import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoinBalanceDisplay from '@/components/ui/CoinBalanceDisplay';
import { useAuth } from '@/shared/hooks/useAuth';

// Mock the useAuth hook
vi.mock('@/shared/hooks/useAuth');

const mockUseAuth = vi.mocked(useAuth);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CoinBalanceDisplay', () => {
  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    walletBalance: 5000,
    coinBalance: 2500,
    totalCoinsEarned: 0,
    totalCoinsPurchased: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication States', () => {
    it('should not render when user is not authenticated', () => {
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

      const { container } = render(
        <TestWrapper>
          <CoinBalanceDisplay />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when user is authenticated', () => {
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

      render(
        <TestWrapper>
          <CoinBalanceDisplay />
        </TestWrapper>
      );

      expect(screen.getByText('2,500')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton when coinLoading is true', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        coinBalance: 2500,
        coinLoading: true,
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

      render(
        <TestWrapper>
          <CoinBalanceDisplay />
        </TestWrapper>
      );

      expect(screen.getByRole('generic', { hidden: true })).toHaveClass('animate-pulse');
    });
  });

  describe('Variant Rendering', () => {
    beforeEach(() => {
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

    it('should render navbar variant correctly', () => {
      render(
        <TestWrapper>
          <CoinBalanceDisplay variant="navbar" />
        </TestWrapper>
      );

      expect(screen.getByText('2,500')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument(); // Purchase button
    });

    it('should render dashboard variant correctly', () => {
      render(
        <TestWrapper>
          <CoinBalanceDisplay variant="dashboard" />
        </TestWrapper>
      );

      expect(screen.getByText('Coin Balance')).toBeInTheDocument();
      expect(screen.getByText('2,500')).toBeInTheDocument();
      expect(screen.getByText('coins')).toBeInTheDocument();
      expect(screen.getByText('Buy Coins')).toBeInTheDocument();
    });

    it('should render compact variant correctly', () => {
      render(
        <TestWrapper>
          <CoinBalanceDisplay variant="compact" />
        </TestWrapper>
      );

      expect(screen.getByText('2,500')).toBeInTheDocument();
      expect(screen.queryByText('+')).not.toBeInTheDocument(); // No purchase button in compact
    });
  });

  describe('Balance Display', () => {
    it('should format large numbers with commas', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        coinBalance: 123456,
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

      render(
        <TestWrapper>
          <CoinBalanceDisplay />
        </TestWrapper>
      );

      expect(screen.getByText('1,23,456')).toBeInTheDocument();
    });

    it('should show low balance warning when balance is less than 1000', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        coinBalance: 500,
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

      render(
        <TestWrapper>
          <CoinBalanceDisplay variant="dashboard" />
        </TestWrapper>
      );

      expect(screen.getByText('Low balance - consider purchasing more coins')).toBeInTheDocument();
      expect(screen.getByText('500')).toHaveClass('text-red-400');
    });

    it('should not show low balance warning when balance is 1000 or more', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        coinBalance: 1500,
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

      render(
        <TestWrapper>
          <CoinBalanceDisplay variant="dashboard" />
        </TestWrapper>
      );

      expect(screen.queryByText('Low balance - consider purchasing more coins')).not.toBeInTheDocument();
      expect(screen.getByText('1,500')).toHaveClass('text-green-400');
    });
  });

  describe('Purchase Button', () => {
    const mockOnPurchaseClick = vi.fn();

    beforeEach(() => {
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

    it('should show purchase button when showPurchaseButton is true', () => {
      render(
        <TestWrapper>
          <CoinBalanceDisplay showPurchaseButton={true} onPurchaseClick={mockOnPurchaseClick} />
        </TestWrapper>
      );

      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should hide purchase button when showPurchaseButton is false', () => {
      render(
        <TestWrapper>
          <CoinBalanceDisplay showPurchaseButton={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('+')).not.toBeInTheDocument();
    });

    it('should call onPurchaseClick when purchase button is clicked', () => {
      render(
        <TestWrapper>
          <CoinBalanceDisplay showPurchaseButton={true} onPurchaseClick={mockOnPurchaseClick} />
        </TestWrapper>
      );

      const purchaseButton = screen.getByText('+');
      fireEvent.click(purchaseButton);

      expect(mockOnPurchaseClick).toHaveBeenCalledTimes(1);
    });

    it('should show "Buy Coins" button in dashboard variant', () => {
      render(
        <TestWrapper>
          <CoinBalanceDisplay variant="dashboard" onPurchaseClick={mockOnPurchaseClick} />
        </TestWrapper>
      );

      const buyButton = screen.getByText('Buy Coins');
      fireEvent.click(buyButton);

      expect(mockOnPurchaseClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Styling', () => {
    beforeEach(() => {
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

    it('should apply custom className', () => {
      const { container } = render(
        <TestWrapper>
          <CoinBalanceDisplay className="custom-class" />
        </TestWrapper>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Real-time Updates', () => {
    it('should update display when coinBalance changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <CoinBalanceDisplay />
        </TestWrapper>
      );

      // Initial render with 2500 coins
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

      expect(screen.getByText('2,500')).toBeInTheDocument();

      // Update with 3000 coins
      mockUseAuth.mockReturnValue({
        user: mockUser,
        coinBalance: 3000,
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

      rerender(
        <TestWrapper>
          <CoinBalanceDisplay />
        </TestWrapper>
      );

      expect(screen.getByText('3,000')).toBeInTheDocument();
    });
  });
});