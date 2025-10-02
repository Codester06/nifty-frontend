import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderPreview from '@/components/forms/OrderPreview';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('OrderPreview', () => {
  const mockStockOrderDetails = {
    type: 'buy' as const,
    instrumentType: 'stock' as const,
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    quantity: 10,
    price: 2500.50,
    totalAmount: 25005,
    coinCost: 25005,
    orderType: 'market' as const
  };

  const mockOptionOrderDetails = {
    type: 'buy' as const,
    instrumentType: 'option' as const,
    symbol: 'NIFTY25DEC19400CE',
    name: 'NIFTY 19400 CE',
    quantity: 2,
    price: 151.00,
    totalAmount: 15100,
    coinCost: 15100,
    orderType: 'market' as const,
    optionDetails: {
      strike: 19400,
      expiry: '2025-12-25',
      optionType: 'CE' as const,
      lotSize: 50
    }
  };

  const mockValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    coinCost: 25005,
    totalAmount: 25005,
    canAfford: true
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    orderDetails: mockStockOrderDetails,
    coinBalance: 50000,
    isProcessing: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render order preview for stock order', () => {
      render(<OrderPreview {...defaultProps} />);
      
      expect(screen.getByText('Order Preview')).toBeInTheDocument();
      expect(screen.getByText('Review your buy order details')).toBeInTheDocument();
      expect(screen.getByText('Reliance Industries')).toBeInTheDocument();
      expect(screen.getByText('RELIANCE')).toBeInTheDocument();
      expect(screen.getByText('10 share(s)')).toBeInTheDocument();
      expect(screen.getByText('₹2,500.50')).toBeInTheDocument();
      expect(screen.getByText('25005 coins')).toBeInTheDocument();
    });

    it('should render order preview for option order', () => {
      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={mockOptionOrderDetails}
        />
      );
      
      expect(screen.getByText('NIFTY 19400 CE')).toBeInTheDocument();
      expect(screen.getByText('NIFTY25DEC19400CE')).toBeInTheDocument();
      expect(screen.getByText('2 lot(s)')).toBeInTheDocument();
      expect(screen.getByText('₹19,400')).toBeInTheDocument();
      expect(screen.getByText('Call')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // Lot size
    });

    it('should not render when isOpen is false', () => {
      render(<OrderPreview {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Order Preview')).not.toBeInTheDocument();
    });

    it('should render sell order correctly', () => {
      const sellOrderDetails = { ...mockStockOrderDetails, type: 'sell' as const };
      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={sellOrderDetails}
        />
      );
      
      expect(screen.getByText('Review your sell order details')).toBeInTheDocument();
      expect(screen.getByText('Amount to Receive:')).toBeInTheDocument();
      expect(screen.getByText('Confirm Sale')).toBeInTheDocument();
    });
  });

  describe('Financial Summary', () => {
    it('should display correct financial information', () => {
      render(<OrderPreview {...defaultProps} />);
      
      expect(screen.getByText('Financial Summary')).toBeInTheDocument();
      expect(screen.getByText('₹25,005')).toBeInTheDocument(); // Total amount
      expect(screen.getByText('₹25,005')).toBeInTheDocument(); // Amount cost
      expect(screen.getByText('₹50,000')).toBeInTheDocument(); // Current balance
      expect(screen.getByText('₹24,995')).toBeInTheDocument(); // Balance after trade
    });

    it('should calculate balance after sell order correctly', () => {
      const sellOrderDetails = { ...mockStockOrderDetails, type: 'sell' as const };
      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={sellOrderDetails}
        />
      );
      
      expect(screen.getByText('₹75,005')).toBeInTheDocument(); // 50000 + 25005
    });
  });

  describe('Validation Errors', () => {
    it('should display validation errors', () => {
      const validationWithErrors = {
        isValid: false,
        errors: [
          { field: 'balance', message: 'Insufficient coin balance', code: 'INSUFFICIENT_BALANCE' },
          { field: 'quantity', message: 'Invalid quantity', code: 'INVALID_QUANTITY' }
        ],
        warnings: [],
        coinCost: 25005,
        totalAmount: 25005,
        canAfford: false
      };

      render(
        <OrderPreview 
          {...defaultProps} 
          validationResult={validationWithErrors}
        />
      );
      
      expect(screen.getByText('Order Validation Errors')).toBeInTheDocument();
      expect(screen.getByText('Insufficient wallet balance')).toBeInTheDocument();
      expect(screen.getByText('Invalid quantity')).toBeInTheDocument();
    });

    it('should display validation warnings', () => {
      const validationWithWarnings = {
        isValid: true,
        errors: [],
        warnings: [
          { field: 'price', message: 'Price is above market rate', code: 'HIGH_PRICE_WARNING' }
        ],
        coinCost: 25005,
        totalAmount: 25005,
        canAfford: true
      };

      render(
        <OrderPreview 
          {...defaultProps} 
          validationResult={validationWithWarnings}
        />
      );
      
      expect(screen.getByText('Order Warnings')).toBeInTheDocument();
      expect(screen.getByText('Price is above market rate')).toBeInTheDocument();
    });

    it('should disable confirm button when there are validation errors', () => {
      const validationWithErrors = {
        isValid: false,
        errors: [{ field: 'balance', message: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' }],
        warnings: [],
        coinCost: 25005,
        totalAmount: 25005,
        canAfford: false
      };

      render(
        <OrderPreview 
          {...defaultProps} 
          validationResult={validationWithErrors}
        />
      );
      
      const confirmButton = screen.getByText(/Confirm Purchase/);
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when cancel button is clicked', () => {
      const onClose = vi.fn();
      render(<OrderPreview {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn();
      render(<OrderPreview {...defaultProps} onConfirm={onConfirm} />);
      
      const confirmButton = screen.getByText(/Confirm Purchase/);
      fireEvent.click(confirmButton);
      
      expect(onConfirm).toHaveBeenCalled();
    });

    it('should close modal when clicking outside', () => {
      const onClose = vi.fn();
      render(<OrderPreview {...defaultProps} onClose={onClose} />);
      
      // Click on the backdrop
      const backdrop = screen.getByText('Order Preview').closest('[role="dialog"]')?.parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Processing State', () => {
    it('should show processing state when isProcessing is true', () => {
      render(<OrderPreview {...defaultProps} isProcessing={true} />);
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      
      const confirmButton = screen.getByText('Processing...');
      expect(confirmButton).toBeDisabled();
    });

    it('should disable confirm button during processing', () => {
      render(<OrderPreview {...defaultProps} isProcessing={true} />);
      
      const confirmButton = screen.getByText('Processing...');
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Insufficient Balance', () => {
    it('should show insufficient balance warning for buy orders', () => {
      const insufficientBalanceProps = {
        ...defaultProps,
        coinBalance: 1000, // Less than required 25005
        validationResult: {
          ...mockValidationResult,
          canAfford: false
        }
      };

      render(<OrderPreview {...insufficientBalanceProps} />);
      
      expect(screen.getByText('Order Validation Errors')).toBeInTheDocument();
    });

    it('should not show insufficient balance warning for sell orders', () => {
      const sellOrderDetails = { ...mockStockOrderDetails, type: 'sell' as const };
      const sellProps = {
        ...defaultProps,
        orderDetails: sellOrderDetails,
        coinBalance: 1000
      };

      render(<OrderPreview {...sellProps} />);
      
      // Should not show insufficient balance error for sell orders
      expect(screen.queryByText('Insufficient Balance')).not.toBeInTheDocument();
    });
  });

  describe('Market Hours Information', () => {
    it('should display market hours information', () => {
      render(<OrderPreview {...defaultProps} />);
      
      expect(screen.getByText('Market Hours')).toBeInTheDocument();
      expect(screen.getByText('Trading is available from 09:15 AM to 03:30 PM IST')).toBeInTheDocument();
    });
  });

  describe('Order Types', () => {
    it('should display limit order information', () => {
      const limitOrderDetails = {
        ...mockStockOrderDetails,
        orderType: 'limit' as const,
        limitPrice: 2450.00
      };

      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={limitOrderDetails}
        />
      );
      
      expect(screen.getByText('Limit @ ₹2,450.00')).toBeInTheDocument();
    });

    it('should display market order information', () => {
      render(<OrderPreview {...defaultProps} />);
      
      expect(screen.getByText('Market')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format option expiry date correctly', () => {
      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={mockOptionOrderDetails}
        />
      );
      
      // Should format the date as DD-MMM-YYYY
      expect(screen.getByText(/25.*Dec.*2025/)).toBeInTheDocument();
    });

    it('should handle invalid expiry dates gracefully', () => {
      const invalidExpiryOrder = {
        ...mockOptionOrderDetails,
        optionDetails: {
          ...mockOptionOrderDetails.optionDetails!,
          expiry: 'invalid-date'
        }
      };

      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={invalidExpiryOrder}
        />
      );
      
      // Should display the original string if date parsing fails
      expect(screen.getByText('invalid-date')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<OrderPreview {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText(/Confirm Purchase/);
      
      expect(cancelButton).toHaveAttribute('type', 'button');
      expect(confirmButton).toHaveAttribute('type', 'button');
    });

    it('should support keyboard navigation', () => {
      render(<OrderPreview {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText(/Confirm Purchase/);
      
      cancelButton.focus();
      expect(document.activeElement).toBe(cancelButton);
      
      confirmButton.focus();
      expect(document.activeElement).toBe(confirmButton);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero coin balance', () => {
      render(<OrderPreview {...defaultProps} coinBalance={0} />);
      
      expect(screen.getByText('₹0')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const largeOrderDetails = {
        ...mockStockOrderDetails,
        totalAmount: 1000000,
        coinCost: 1000000
      };

      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={largeOrderDetails}
          coinBalance={2000000}
        />
      );
      
      expect(screen.getByText('₹1,000,000')).toBeInTheDocument();
      expect(screen.getByText('₹1,000,000')).toBeInTheDocument();
    });

    it('should handle missing option details gracefully', () => {
      const orderWithoutOptionDetails = {
        ...mockOptionOrderDetails,
        optionDetails: undefined
      };

      render(
        <OrderPreview 
          {...defaultProps} 
          orderDetails={orderWithoutOptionDetails}
        />
      );
      
      // Should not crash and should render basic information
      expect(screen.getByText('NIFTY 19400 CE')).toBeInTheDocument();
    });
  });
});