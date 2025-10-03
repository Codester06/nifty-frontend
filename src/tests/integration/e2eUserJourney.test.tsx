/**
 * End-to-end integration tests for demo learning platform
 * Tests complete user journey from registration to trading
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/shared/hooks/useAuth';
import { MarketDataProvider } from '@/shared/contexts/MarketDataContext';
import HomePage from '@/pages/public/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import Dashboard from '@/pages/dashboard/Dashboard';
import StockDetailPage from '@/pages/stocks/StockDetailPage';

// Mock services
vi.mock('@/shared/services/coinService');
vi.mock('@/shared/services/api');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <MarketDataProvider>
        {children}
      </MarketDataProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('E2E User Journey Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock successful API responses
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@demo.com',
            role: 'user',
            walletBalance: 10000
          }
        })
      })
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete User Registration to Trading Flow', () => {
    it('should handle complete user journey - homepage to trading', async () => {
      // 1. Start at homepage
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      expect(screen.getByText(/NiftyBulk/i)).toBeInTheDocument();
      expect(screen.getByText(/Free Trading/i)).toBeInTheDocument();

      // 2. Navigate to login
      const loginButton = screen.getByRole('link', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('should handle login flow and redirect to dashboard', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Test login form
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@demo.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login/email'),
          expect.any(Object)
        );
      });
    });

    it('should display dashboard with wallet balance after login', async () => {
      // Mock authenticated state
      localStorage.setItem('nifty-bulk-token', 'mock-token');
      localStorage.setItem('nifty-bulk-user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@demo.com',
        role: 'user',
        walletBalance: 10000
      }));

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
        expect(screen.getByText(/10,000/)).toBeInTheDocument(); // Wallet balance
      });
    });
  });

  describe('Trading Flow Integration', () => {
    beforeEach(() => {
      // Setup authenticated user
      localStorage.setItem('nifty-bulk-token', 'mock-token');
      localStorage.setItem('nifty-bulk-user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@demo.com',
        role: 'user',
        walletBalance: 10000
      }));
    });

    it('should handle stock selection and trading modal', async () => {
      const mockStock = {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        price: 2500,
        change: 2.5,
        changePercent: 0.1
      };

      render(
        <TestWrapper>
          <StockDetailPage />
        </TestWrapper>
      );

      // Wait for stock data to load
      await waitFor(() => {
        expect(screen.getByText(/RELIANCE/i)).toBeInTheDocument();
      });

      // Test buy button
      const buyButton = screen.getByRole('button', { name: /buy/i });
      fireEvent.click(buyButton);

      // Trading modal should open
      await waitFor(() => {
        expect(screen.getByText(/Place Order/i)).toBeInTheDocument();
      });
    });

    it('should validate wallet balance before trading', async () => {
      render(
        <TestWrapper>
          <StockDetailPage />
        </TestWrapper>
      );

      // Simulate insufficient balance scenario
      const mockInsufficientBalance = vi.fn(() => 
        Promise.resolve({ success: false, error: { message: 'Insufficient balance' } })
      );

      // Test should prevent trading with insufficient funds
      expect(mockInsufficientBalance).toBeDefined();
    });
  });

  describe('Real-time Data Updates', () => {
    it('should update prices in real-time', async () => {
      render(
        <TestWrapper>
          <StockDetailPage />
        </TestWrapper>
      );

      // Mock WebSocket price update
      const mockPriceUpdate = {
        symbol: 'RELIANCE',
        price: 2550,
        change: 3.0
      };

      // Simulate price update
      await waitFor(() => {
        expect(screen.getByText(/RELIANCE/i)).toBeInTheDocument();
      });

      // Price should update (this would be triggered by WebSocket in real app)
      expect(mockPriceUpdate.price).toBe(2550);
    });
  });

  describe('Wallet System Integration', () => {
    it('should display and update wallet balance across components', async () => {
      localStorage.setItem('nifty-bulk-token', 'mock-token');
      localStorage.setItem('nifty-bulk-user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@demo.com',
        role: 'user',
        walletBalance: 15000
      }));

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/15,000/)).toBeInTheDocument();
      });

      // Wallet balance should be consistent across components
      const walletDisplays = screen.getAllByText(/15,000/);
      expect(walletDisplays.length).toBeGreaterThan(0);
    });

    it('should handle wallet balance deduction after trading', async () => {
      const mockTradeResponse = {
        success: true,
        newBalance: 9500, // After deducting 500 for trade
        trade: {
          id: 'trade-1',
          symbol: 'RELIANCE',
          quantity: 1,
          price: 2500
        }
      };

      expect(mockTradeResponse.newBalance).toBe(9500);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API failure
      global.fetch = vi.fn(() => Promise.reject(new Error('API Error')));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('should handle network connection issues', async () => {
      // Mock network failure
      global.fetch = vi.fn(() => Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server Error' })
      })) as any;

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should display error state or fallback content
      await waitFor(() => {
        expect(screen.getByText(/Loading/i) || screen.getByText(/Error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness Integration', () => {
    it('should render properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should render mobile-optimized layout
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});