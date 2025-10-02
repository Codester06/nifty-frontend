import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/shared/hooks/useAuth';
import Dashboard from '@/pages/dashboard/Dashboard';
import StockDetail from '@/pages/StockDetail';
import { optionsDataService } from '@/shared/services/optionsDataService';

// Mock the auth hook
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  walletBalance: 100000,
};

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  updateUser: vi.fn(),
  addTransaction: vi.fn(),
  portfolio: [],
  transactions: [],
  refreshWalletBalance: vi.fn(),
  shouldRedirectToAdminDashboard: () => false,
  isInWishlist: () => false,
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
};

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the options data service
vi.mock('@/shared/services/optionsDataService', () => ({
  optionsDataService: {
    getOptionChain: vi.fn(),
    startRealTimeUpdates: vi.fn(),
    isDemoMode: () => true,
    setDemoMode: vi.fn(),
    onConnectionStatusChange: vi.fn(),
    getConnectionStatus: () => 'connected',
  },
}));

// Mock the stock data
vi.mock('@/data/mock/mockStocks', () => ({
  mockStocks: [
    {
      symbol: 'NIFTY',
      name: 'NIFTY 50',
      fullName: 'NIFTY 50 Index',
      price: 19500,
      change: 150,
      changePercent: 0.77,
      volume: '1.2M',
      description: 'NIFTY 50 is a benchmark index',
    },
  ],
  startLivePriceUpdates: vi.fn(() => () => {}),
  generateChartData: vi.fn(() => ({
    labels: ['10:00', '11:00', '12:00'],
    data: [19400, 19450, 19500],
  })),
}));

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="price-chart">
      Mock Chart - {data.datasets[0].label}
    </div>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Option Chain Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock option chain data
    const mockOptionChainData = {
      underlying: 'NIFTY',
      spotPrice: 19500,
      expiry: '2024-01-25',
      lastUpdated: new Date().toISOString(),
      options: {
        19400: {
          call: {
            symbol: 'NIFTY25JAN19400CE',
            underlying: 'NIFTY',
            strike: 19400,
            expiry: '2024-01-25',
            optionType: 'CE' as const,
            bid: 120,
            ask: 125,
            ltp: 122.5,
            volume: 1500,
            oi: 5000,
            iv: 18.5,
            lotSize: 50,
            greeks: {
              delta: 0.65,
              gamma: 0.002,
              theta: -2.5,
              vega: 15.2,
            },
          },
          put: {
            symbol: 'NIFTY25JAN19400PE',
            underlying: 'NIFTY',
            strike: 19400,
            expiry: '2024-01-25',
            optionType: 'PE' as const,
            bid: 25,
            ask: 28,
            ltp: 26.5,
            volume: 800,
            oi: 3000,
            iv: 19.2,
            lotSize: 50,
            greeks: {
              delta: -0.35,
              gamma: 0.002,
              theta: -2.1,
              vega: 14.8,
            },
          },
        },
        19500: {
          call: {
            symbol: 'NIFTY25JAN19500CE',
            underlying: 'NIFTY',
            strike: 19500,
            expiry: '2024-01-25',
            optionType: 'CE' as const,
            bid: 75,
            ask: 78,
            ltp: 76.5,
            volume: 2500,
            oi: 8000,
            iv: 17.8,
            lotSize: 50,
            greeks: {
              delta: 0.52,
              gamma: 0.003,
              theta: -3.2,
              vega: 18.5,
            },
          },
          put: {
            symbol: 'NIFTY25JAN19500PE',
            underlying: 'NIFTY',
            strike: 19500,
            expiry: '2024-01-25',
            optionType: 'PE' as const,
            bid: 72,
            ask: 75,
            ltp: 73.5,
            volume: 2200,
            oi: 7500,
            iv: 18.1,
            lotSize: 50,
            greeks: {
              delta: -0.48,
              gamma: 0.003,
              theta: -3.0,
              vega: 18.2,
            },
          },
        },
      },
    };

    (optionsDataService.getOptionChain as any).mockResolvedValue(mockOptionChainData);
    (optionsDataService.startRealTimeUpdates as any).mockImplementation((underlying, callback) => {
      // Simulate real-time updates
      const interval = setInterval(() => {
        callback(mockOptionChainData);
      }, 1000);
      
      return () => clearInterval(interval);
    });
    (optionsDataService.onConnectionStatusChange as any).mockImplementation((callback) => {
      callback('connected');
      return () => {};
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Dashboard Option Chain Integration', () => {
    it('should display option chain on dashboard for authenticated users', async () => {
      renderWithRouter(<Dashboard />);

      // Wait for option chain to load
      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Verify option chain is visible
      expect(screen.getByText('Real-time options data and trading')).toBeInTheDocument();
      expect(screen.getByText('Spot Price:')).toBeInTheDocument();
      expect(screen.getByText('₹19,500')).toBeInTheDocument();
    });

    it('should show login prompt for unauthenticated users', async () => {
      // Mock unauthenticated state
      const unauthenticatedContext = {
        ...mockAuthContext,
        user: null,
        isAuthenticated: false,
      };

      vi.mocked(require('@/shared/hooks/useAuth').useAuth).mockReturnValue(unauthenticatedContext);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Options Trading')).toBeInTheDocument();
      });

      expect(screen.getByText('Please log in to view option chains and trade options with demo coins')).toBeInTheDocument();
      expect(screen.getByText('Login to Trade Options')).toBeInTheDocument();
    });

    it('should allow underlying asset selection', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Find and click the underlying selector
      const underlyingSelect = screen.getByLabelText('Underlying:');
      expect(underlyingSelect).toBeInTheDocument();

      // Change to BANKNIFTY
      fireEvent.change(underlyingSelect, { target: { value: 'BANKNIFTY' } });

      // Verify the service was called with new underlying
      await waitFor(() => {
        expect(optionsDataService.getOptionChain).toHaveBeenCalledWith('BANKNIFTY');
      });
    });

    it('should toggle between demo and live mode', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Find the mode toggle button
      const modeToggle = screen.getByText('Demo');
      expect(modeToggle).toBeInTheDocument();

      // Click to toggle mode
      fireEvent.click(modeToggle);

      // Verify setDemoMode was called
      expect(optionsDataService.setDemoMode).toHaveBeenCalled();
    });
  });

  describe('Stock Detail Option Chain Integration', () => {
    beforeEach(() => {
      // Mock useParams to return NIFTY symbol
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ symbol: 'NIFTY' }),
          useNavigate: () => vi.fn(),
        };
      });
    });

    it('should display option chain specific to the stock', async () => {
      renderWithRouter(<StockDetail />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Verify option chain shows data for NIFTY
      expect(optionsDataService.getOptionChain).toHaveBeenCalledWith('NIFTY');
      expect(screen.getByText('₹19,500')).toBeInTheDocument();
    });

    it('should handle option selection and open trading modal', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StockDetail />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Wait for option chain table to load
      await waitFor(() => {
        expect(screen.getByText('19400')).toBeInTheDocument();
      });

      // Click on a call option
      const callOption = screen.getByText('122.5'); // LTP of call option
      await user.click(callOption);

      // Verify trading modal opens
      await waitFor(() => {
        expect(screen.getByText('Buy NIFTY 19400 CE')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Data Flow', () => {
    it('should update option chain data in real-time', async () => {
      vi.useFakeTimers();
      
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Verify initial data
      expect(screen.getByText('₹19,500')).toBeInTheDocument();

      // Simulate real-time update with new data
      const updatedData = {
        underlying: 'NIFTY',
        spotPrice: 19520,
        expiry: '2024-01-25',
        lastUpdated: new Date().toISOString(),
        options: {
          19500: {
            call: {
              symbol: 'NIFTY25JAN19500CE',
              underlying: 'NIFTY',
              strike: 19500,
              expiry: '2024-01-25',
              optionType: 'CE' as const,
              bid: 78,
              ask: 81,
              ltp: 79.5,
              volume: 2600,
              oi: 8100,
              iv: 17.9,
              lotSize: 50,
              greeks: {
                delta: 0.54,
                gamma: 0.003,
                theta: -3.1,
                vega: 18.3,
              },
            },
            put: {
              symbol: 'NIFTY25JAN19500PE',
              underlying: 'NIFTY',
              strike: 19500,
              expiry: '2024-01-25',
              optionType: 'PE' as const,
              bid: 69,
              ask: 72,
              ltp: 70.5,
              volume: 2300,
              oi: 7600,
              iv: 18.0,
              lotSize: 50,
              greeks: {
                delta: -0.46,
                gamma: 0.003,
                theta: -2.9,
                vega: 18.0,
              },
            },
          },
        },
      };

      // Mock the callback to be called with updated data
      const mockCallback = vi.fn();
      (optionsDataService.startRealTimeUpdates as any).mockImplementation((underlying, callback) => {
        mockCallback.mockImplementation(callback);
        setTimeout(() => callback(updatedData), 1000);
        return () => {};
      });

      // Advance timers to trigger update
      vi.advanceTimersByTime(1000);

      // Verify updated data appears
      await waitFor(() => {
        expect(screen.getByText('₹19,520')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should show connection status indicators', async () => {
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Verify connection status is shown
      expect(screen.getByText('Live')).toBeInTheDocument();

      // Simulate connection error
      (optionsDataService.onConnectionStatusChange as any).mockImplementation((callback) => {
        callback('error');
        return () => {};
      });

      // Re-render to trigger status change
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });
  });

  describe('Options Trading Flow', () => {
    it('should complete full options trading workflow', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StockDetail />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Wait for option chain data
      await waitFor(() => {
        expect(screen.getByText('19500')).toBeInTheDocument();
      });

      // Click on an option to open trading modal
      const callLTP = screen.getByText('76.5');
      await user.click(callLTP);

      // Verify trading modal opens with option details
      await waitFor(() => {
        expect(screen.getByText('Buy NIFTY 19500 CE')).toBeInTheDocument();
      });

      // Verify option details are displayed
      expect(screen.getByText('Strike: 19500')).toBeInTheDocument();
      expect(screen.getByText('Premium: ₹76.5')).toBeInTheDocument();
      expect(screen.getByText('Lot Size: 50')).toBeInTheDocument();

      // Enter quantity
      const quantityInput = screen.getByLabelText('Quantity (Lots)');
      await user.clear(quantityInput);
      await user.type(quantityInput, '2');

      // Verify total cost calculation
      expect(screen.getByText('₹7,650')).toBeInTheDocument(); // 76.5 * 50 * 2

      // Verify wallet balance check
      expect(screen.getByText('₹1,00,000')).toBeInTheDocument();

      // Click buy button
      const buyButton = screen.getByText('Buy 2 Lots');
      await user.click(buyButton);

      // Verify transaction is processed
      await waitFor(() => {
        expect(mockAuthContext.updateUser).toHaveBeenCalledWith({
          walletBalance: 92350, // 100000 - 7650
        });
      });

      expect(mockAuthContext.addTransaction).toHaveBeenCalledWith({
        type: 'buy',
        quantity: 2,
        amount: 7650,
        instrumentType: 'option',
        stockSymbol: 'NIFTY25JAN19500CE',
        stockName: 'NIFTY 19500 CE',
        price: 76.5,
        optionDetails: {
          strike: 19500,
          expiry: '2024-01-25',
          optionType: 'CE',
          premium: 76.5,
          lotSize: 50,
        },
      });
    });

    it('should prevent trading with insufficient balance', async () => {
      const user = userEvent.setup();
      
      // Mock user with low balance
      const lowBalanceContext = {
        ...mockAuthContext,
        user: { ...mockUser, walletBalance: 1000 },
      };

      vi.mocked(require('@/shared/hooks/useAuth').useAuth).mockReturnValue(lowBalanceContext);

      renderWithRouter(<StockDetail />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Click on an option
      const callLTP = screen.getByText('76.5');
      await user.click(callLTP);

      await waitFor(() => {
        expect(screen.getByText('Buy NIFTY 19500 CE')).toBeInTheDocument();
      });

      // Try to buy with default quantity (1 lot)
      const buyButton = screen.getByText('Buy 1 Lot');
      expect(buyButton).toBeDisabled();

      // Verify insufficient balance message
      expect(screen.getByText('Insufficient wallet balance')).toBeInTheDocument();
    });

    it('should validate lot size correctly', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StockDetail />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Click on an option
      const callLTP = screen.getByText('76.5');
      await user.click(callLTP);

      await waitFor(() => {
        expect(screen.getByText('Buy NIFTY 19500 CE')).toBeInTheDocument();
      });

      // Try to enter fractional quantity
      const quantityInput = screen.getByLabelText('Quantity (Lots)');
      await user.clear(quantityInput);
      await user.type(quantityInput, '1.5');

      // Verify validation error
      const buyButton = screen.getByText('Buy 1.5 Lots');
      expect(buyButton).toBeDisabled();
      expect(screen.getByText('Invalid lot size - quantity must be a whole number')).toBeInTheDocument();
    });
  });

  describe('Authentication Integration', () => {
    it('should redirect to login when unauthenticated user tries to trade', async () => {
      const mockNavigate = vi.fn();
      
      // Mock unauthenticated state
      const unauthenticatedContext = {
        ...mockAuthContext,
        user: null,
        isAuthenticated: false,
      };

      vi.mocked(require('@/shared/hooks/useAuth').useAuth).mockReturnValue(unauthenticatedContext);
      vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);

      const user = userEvent.setup();
      renderWithRouter(<StockDetail />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('NIFTY 50')).toBeInTheDocument();
      });

      // Click buy button
      const buyButton = screen.getByText('BUY');
      await user.click(buyButton);

      // Verify redirect to login
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should maintain authentication state across components', async () => {
      renderWithRouter(<Dashboard />);

      // Verify authenticated state in dashboard
      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Option chain should be visible (not showing login prompt)
      expect(screen.queryByText('Login to Trade Options')).not.toBeInTheDocument();
      expect(screen.getByText('Real-time options data and trading')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle option chain loading errors gracefully', async () => {
      // Mock API error
      (optionsDataService.getOptionChain as any).mockRejectedValue(new Error('API Error'));

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Error loading option chain')).toBeInTheDocument();
      });

      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should handle real-time connection failures', async () => {
      // Mock connection status change to error
      (optionsDataService.onConnectionStatusChange as any).mockImplementation((callback) => {
        callback('error');
        return () => {};
      });

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Option Chain')).toBeInTheDocument();
      });

      // Verify error status is shown
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should recover from errors with retry mechanism', async () => {
      const user = userEvent.setup();
      
      // Mock initial error
      (optionsDataService.getOptionChain as any).mockRejectedValueOnce(new Error('Network Error'));

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Error loading option chain')).toBeInTheDocument();
      });

      // Mock successful retry
      const mockOptionChainData = {
        underlying: 'NIFTY',
        spotPrice: 19500,
        expiry: '2024-01-25',
        lastUpdated: new Date().toISOString(),
        options: {},
      };
      (optionsDataService.getOptionChain as any).mockResolvedValue(mockOptionChainData);

      // Click retry button
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      // Verify successful recovery
      await waitFor(() => {
        expect(screen.getByText('₹19,500')).toBeInTheDocument();
      });
    });
  });
});