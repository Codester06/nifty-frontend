import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TradingModal } from '@/components/forms';
import { useAuth } from '@/shared/hooks/useAuth';
import { tradingService } from '@/features/trading/services';
import type { Stock, OptionContract } from '@/shared/types';

// Mock dependencies
vi.mock('@/shared/hooks/useAuth');
vi.mock('@/features/trading/services');
vi.mock('@/shared/utils/orderValidation', () => ({
  validateOrder: vi.fn(),
  isMarketOpen: vi.fn(() => true)
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('TradingModal', () => {
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

  const mockAuthContext = {
    user: mockUser,
    isAuthenticated: true,
    userRole: 'user' as const,
    loading: false,
    coinBalance: 10000,
    coinLoading: false,
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
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    stock: mockStock,
    type: 'buy' as const,
    instrumentType: 'stock' as const,
    orderType: 'market' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue(mockAuthContext);
  });

  describe('Rendering', () => {
    it('should render trading modal for stock buy order', () => {
      render(<TradingModal {...defaultProps} />);
      
      expect(screen.getByText('Buy Reliance Industries')).toBeInTheDocument();
      expect(screen.getByText('Reliance Industries Limited')).toBeInTheDocument();
      expect(screen.getByText('₹2,500.50')).toBeInTheDocument();
      expect(screen.getByText('Wallet Balance:')).toBeInTheDocument();
      expect(screen.getByText('₹50,000')).toBeInTheDocument();
    });

    it('should render trading modal for stock sell order', () => {
      render(<TradingModal {...defaultProps} type="sell" />);
      
      expect(screen.getByText('Sell Reliance Industries')).toBeInTheDocument();
    });

    it('should render trading modal for option buy order', () => {
      render(
        <TradingModal 
          {...defaultProps} 
          instrumentType="option" 
          optionContract={mockOptionContract}
          stock={undefined}
        />
      );
      
      expect(screen.getByText('Buy NIFTY 19400 CE')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<TradingModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Buy Reliance Industries')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update quantity when input changes', async () => {
      render(<TradingModal {...defaultProps} />);
      
      const quantityInput = screen.getByPlaceholderText('Enter quantity');
      fireEvent.change(quantityInput, { target: { value: '5' } });
      
      expect(quantityInput).toHaveValue(5);
    });

    it('should close modal when close button is clicked', () => {
      const onClose = vi.fn();
      render(<TradingModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should show order preview when preview button is clicked', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      });

      render(<TradingModal {...defaultProps} />);
      
      const previewButton = screen.getByText(/Preview Buy/);
      fireEvent.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Order Preview')).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('should show validation errors', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: false,
        errors: [{ field: 'balance', message: 'Insufficient coin balance', code: 'INSUFFICIENT_BALANCE' }],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: false
      });

      render(<TradingModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Insufficient coin balance')).toBeInTheDocument();
      });
    });

    it('should show validation warnings', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [{ field: 'price', message: 'Price is above market rate', code: 'HIGH_PRICE_WARNING' }],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      });

      render(<TradingModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Order Warnings')).toBeInTheDocument();
        expect(screen.getByText('Price is above market rate')).toBeInTheDocument();
      });
    });

    it('should disable preview button when validation fails', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: false,
        errors: [{ field: 'balance', message: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' }],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: false
      });

      render(<TradingModal {...defaultProps} />);
      
      await waitFor(() => {
        const previewButton = screen.getByText(/Preview Buy/);
        expect(previewButton).toBeDisabled();
      });
    });
  });

  describe('Market Status', () => {
    it('should show market closed warning when market is closed', async () => {
      const { isMarketOpen } = await import('@/shared/utils/orderValidation');
      (isMarketOpen as Mock).mockReturnValue(false);

      render(<TradingModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Market Closed')).toBeInTheDocument();
        expect(screen.getByText('Trading hours: 09:15 AM - 03:30 PM IST')).toBeInTheDocument();
      });
    });
  });

  describe('Coin Balance Display', () => {
    it('should show loading state for coin balance', () => {
      (useAuth as Mock).mockReturnValue({
        ...mockAuthContext,
        coinLoading: true
      });

      render(<TradingModal {...defaultProps} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should calculate and display coin cost correctly', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      });

      render(<TradingModal {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('₹2,501')).toBeInTheDocument();
      });
    });
  });

  describe('Trade Execution', () => {
    it('should execute trade successfully', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      });

      (tradingService.executeOrder as Mock).mockResolvedValue({
        status: 'SUCCESS',
        tradeId: 'trade123',
        executedQuantity: 1,
        executedPrice: 2500.50,
        coinAmount: 2501,
        fees: 2.5,
        message: 'Trade executed successfully',
        timestamp: new Date()
      });

      const onTradeComplete = vi.fn();
      render(<TradingModal {...defaultProps} onTradeComplete={onTradeComplete} />);
      
      // Click preview button
      const previewButton = screen.getByText(/Preview Buy/);
      fireEvent.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Order Preview')).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByText(/Confirm Purchase/);
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(tradingService.executeOrder).toHaveBeenCalled();
        expect(onTradeComplete).toHaveBeenCalled();
      });
    });

    it('should handle trade execution failure', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 2501,
        totalAmount: 2500.50,
        canAfford: true
      });

      (tradingService.executeOrder as Mock).mockResolvedValue({
        status: 'FAILED',
        tradeId: 'failed123',
        executedQuantity: 0,
        executedPrice: 0,
        coinAmount: 0,
        fees: 0,
        message: 'Trade execution failed',
        timestamp: new Date()
      });

      render(<TradingModal {...defaultProps} />);
      
      // Click preview button
      const previewButton = screen.getByText(/Preview Buy/);
      fireEvent.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Order Preview')).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByText(/Confirm Purchase/);
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Trade execution failed')).toBeInTheDocument();
      });
    });
  });

  describe('Option Trading', () => {
    it('should handle option contract correctly', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        coinCost: 7550, // 1 lot * 151.00 * 50
        totalAmount: 7550,
        canAfford: true
      });

      render(
        <TradingModal 
          {...defaultProps} 
          instrumentType="option" 
          optionContract={mockOptionContract}
          stock={undefined}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('₹7,550')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user gracefully', () => {
      (useAuth as Mock).mockReturnValue({
        ...mockAuthContext,
        user: null,
        isAuthenticated: false
      });

      render(<TradingModal {...defaultProps} />);
      
      const previewButton = screen.getByText(/Preview Buy/);
      fireEvent.click(previewButton);
      
      // Should not crash or show order preview
      expect(screen.queryByText('Order Preview')).not.toBeInTheDocument();
    });

    it('should handle validation service errors', async () => {
      const { validateOrder } = await import('@/shared/utils/orderValidation');
      (validateOrder as Mock).mockImplementation(() => {
        throw new Error('Validation service error');
      });

      render(<TradingModal {...defaultProps} />);
      
      // Should not crash and should handle the error gracefully
      await waitFor(() => {
        expect(screen.getByText(/Preview Buy/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<TradingModal {...defaultProps} />);
      
      const quantityInput = screen.getByPlaceholderText('Enter quantity');
      expect(quantityInput).toHaveAttribute('type', 'number');
      
      const previewButton = screen.getByText(/Preview Buy/);
      expect(previewButton).toHaveAttribute('type', 'button');
    });

    it('should support keyboard navigation', () => {
      render(<TradingModal {...defaultProps} />);
      
      const quantityInput = screen.getByPlaceholderText('Enter quantity');
      quantityInput.focus();
      expect(document.activeElement).toBe(quantityInput);
    });
  });
});