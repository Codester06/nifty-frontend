import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Portfolio, WishlistItem, Stock } from '@/shared/types';
import { coinService } from '@/shared/services';
import { mockStocks, startLivePriceUpdates } from '@/data/mock/mockStocks';
import { tradingService } from '@/features/trading/services/tradingService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | 'superadmin' | null;
  loading: boolean;
  coinBalance: number;
  coinLoading: boolean;
  login: (mobile: string, otp: string) => Promise<boolean>;
  loginEmail: (email: string, password: string) => Promise<boolean>;
  superAdminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  logoutAllDevices: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshWalletBalance: () => Promise<void>;
  refreshCoinBalance: () => Promise<void>;
  updateCoinBalance: (newBalance: number) => void;
  deductCoins: (amount: number, reason: string, relatedTradeId?: string) => Promise<boolean>;
  addCoins: (amount: number, reason: string, relatedTradeId?: string) => Promise<boolean>;
  validateSufficientCoins: (amount: number) => Promise<boolean>;
  transactions: Transaction[];
  portfolio: Portfolio[];
  wishlist: WishlistItem[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (symbol: string) => void;
  isInWishlist: (symbol: string) => boolean;
  updatePortfolio: (symbol: string, quantity: number, price: number, type: 'buy' | 'sell') => void;
  buyStock: (symbol: string, quantity: number, price: number) => Promise<void>;
  sellStock: (symbol: string, quantity: number, price: number) => Promise<void>;
  shouldRedirectToAdminDashboard: () => boolean;
  totalInvestment: number;
  currentValue: number;
  totalPnL: number;
  pnlPercent: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'superadmin' | null>(null);
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [coinLoading, setCoinLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveStocks, setLiveStocks] = useState<Stock[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [pnlPercent, setPnlPercent] = useState(0);

  // Session ID for concurrent login detection
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = startLivePriceUpdates(setLiveStocks);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const updatedPortfolio = portfolio.map(item => {
      const liveStock = liveStocks.find(stock => stock.symbol === item.symbol);
      return liveStock ? { ...item, currentPrice: liveStock.price } : item;
    });

    const newTotalInvestment = updatedPortfolio.reduce((sum, stock) => sum + (stock.quantity * stock.avgPrice), 0);
    const newCurrentValue = updatedPortfolio.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
    const newTotalPnL = newCurrentValue - newTotalInvestment;
    const newPnlPercent = newTotalInvestment > 0 ? (newTotalPnL / newTotalInvestment) * 100 : 0;

    setTotalInvestment(newTotalInvestment);
    setCurrentValue(newCurrentValue);
    setTotalPnL(newTotalPnL);
    setPnlPercent(newPnlPercent);
  }, [portfolio, liveStocks]);

  // Helper to decode JWT and get expiry
  const decodeTokenExpiry = (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.exp) {
        return payload.exp * 1000; // convert to ms
      }
      return null;
    } catch {
      return null;
    }
  };

  // Generate a unique session ID
  const generateSessionId = (): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  // Save session ID to localStorage and state
  const initializeSession = () => {
    let existingSessionId = localStorage.getItem('nifty-bulk-session-id');
    if (!existingSessionId) {
      existingSessionId = generateSessionId();
      localStorage.setItem('nifty-bulk-session-id', existingSessionId);
    }
    setSessionId(existingSessionId);
  };

  // Check for concurrent sessions by comparing session IDs
  const checkConcurrentSession = () => {
    const storedSessionId = localStorage.getItem('nifty-bulk-session-id');
    if (sessionId && storedSessionId && sessionId !== storedSessionId) {
      // Another session detected, logout current session
      alert('You have been logged out because your account was logged in from another device.');
      logout();
    }
  };

  // Refresh token if close to expiry (within 5 minutes)
  const refreshTokenIfNeeded = async () => {
    const token = localStorage.getItem('nifty-bulk-token');
    if (!token) return;

    const expiry = decodeTokenExpiry(token);
    if (!expiry) return;

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiry - now < fiveMinutes) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const newToken = data.token;
          localStorage.setItem('nifty-bulk-token', newToken);
        } else {
          // Token refresh failed, logout user
          logout();
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        logout();
      }
    }
  };

  // Call refreshTokenIfNeeded periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshTokenIfNeeded();
      checkConcurrentSession();
    }, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, [user, sessionId]);

  // Initialize session on load
  useEffect(() => {
    initializeSession();
  }, []);

  // Function to refresh wallet balance from backend
  const refreshWalletBalance = async () => {
    const token = localStorage.getItem('nifty-bulk-token');
    if (!token || !user) {
      console.log('refreshWalletBalance: No token or user');
      return;
    }

    try {
      console.log('refreshWalletBalance: Fetching wallet balance with token', token);
      const response = await fetch(`${API_BASE_URL}/coins/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('refreshWalletBalance: Received data', data);
        const updatedUser = { ...user, walletBalance: data.data.balance };
        setUser(updatedUser);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(updatedUser));
      } else {
        console.error('refreshWalletBalance: Response not ok', response.status);
      }
    } catch (error) {
      console.error('Failed to refresh wallet balance:', error);
    }
  };

  // Function to refresh coin balance from backend
  const refreshCoinBalance = async () => {
    if (!user) return;

    setCoinLoading(true);
    try {
      // Temporarily disable API call to prevent HTML response error
      console.log('Coin balance refresh disabled - API not available');
      setCoinBalance(user.coinBalance || 0);
    } catch (error) {
      console.error('Failed to refresh coin balance:', error);
    } finally {
      setCoinLoading(false);
    }
  };

  // Function to update coin balance locally (for immediate UI updates)
  const updateCoinBalance = (newBalance: number) => {
    setCoinBalance(newBalance);
    if (user) {
      const updatedUser = { ...user, coinBalance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('nifty-bulk-user', JSON.stringify(updatedUser));
    }
  };

  // Function to deduct coins
  const deductCoins = async (amount: number, reason: string, relatedTradeId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await coinService.deductCoins({
        userId: user.id,
        amount,
        reason,
        relatedTradeId
      });

      if (result.success) {
        updateCoinBalance(result.newBalance);
        return true;
      } else {
        console.error('Failed to deduct coins:', result.error?.message);
        return false;
      }
    } catch (error) {
      console.error('Failed to deduct coins:', error);
      return false;
    }
  };

  // Function to add coins
  const addCoins = async (amount: number, reason: string, relatedTradeId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await coinService.addCoins({
        userId: user.id,
        amount,
        reason,
        relatedTradeId
      });

      if (result.success) {
        updateCoinBalance(result.newBalance);
        return true;
      } else {
        console.error('Failed to add coins:', result.error?.message);
        return false;
      }
    } catch (error) {
      console.error('Failed to add coins:', error);
      return false;
    }
  };

  // Function to validate sufficient coin balance
  const validateSufficientCoins = async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await coinService.validateSufficientBalance(user.id, amount);
      return result.success && result.data?.hasSufficientBalance === true;
    } catch (error) {
      console.error('Failed to validate coin balance:', error);
      return false;
    }
  };

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('nifty-bulk-token');
    const savedUser = localStorage.getItem('nifty-bulk-user');
    const savedTransactions = localStorage.getItem('nifty-bulk-transactions');
    const savedPortfolio = localStorage.getItem('nifty-bulk-portfolio');
    const savedWishlist = localStorage.getItem('nifty-bulk-wishlist');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserRole(userData.role || 'user');
        // Initialize coin balance from saved user data
        setCoinBalance(userData.coinBalance || 0);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('nifty-bulk-token');
        localStorage.removeItem('nifty-bulk-user');
      }
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
    setLoading(false);
  }, []);

  // Set up periodic wallet and coin balance refresh for authenticated users
  useEffect(() => {
    if (!user || userRole === 'superadmin') return;

    // Initial refresh after login
    refreshWalletBalance();
    refreshCoinBalance();

    // Set up interval to refresh every 5 seconds
    const walletInterval = setInterval(refreshWalletBalance, 5000);
    const coinInterval = setInterval(refreshCoinBalance, 5000);

    return () => {
      clearInterval(walletInterval);
      clearInterval(coinInterval);
    };
  }, [user, userRole]);

  const login = async (mobile: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/mobile/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);
        const token = data.token || data.data?.token;

        if (!token) {
          console.error('No token received from server');
          return false;
        }

        // Decode JWT to get user info
        let payload;
        try {
          payload = JSON.parse(atob(token.split('.')[1]));
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
          return false;
        }
        // Fetch real user profile from backend
        let userData: User;
        try {
          const profileRes = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            userData = await profileRes.json();
          } else {
            // fallback to JWT payload if /me fails
            userData = {
              id: payload.id,
              name: payload.username || 'User',
              mobile,
              email: payload.email,
              role: payload.role || 'user',
              walletBalance: payload.walletBalance ?? 0,
              coinBalance: payload.coinBalance ?? 0,
              totalCoinsEarned: payload.totalCoinsEarned ?? 0,
              totalCoinsPurchased: payload.totalCoinsPurchased ?? 0,
            };
          }
        } catch {
          userData = {
          id: payload.id,
          name: payload.username || 'User',
          mobile,
          email: payload.email,
          role: payload.role || 'user',
            walletBalance: payload.walletBalance ?? 0,
            coinBalance: payload.coinBalance ?? 0,
            totalCoinsEarned: payload.totalCoinsEarned ?? 0,
            totalCoinsPurchased: payload.totalCoinsPurchased ?? 0,
        };
        }
        localStorage.setItem('nifty-bulk-token', token);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(userData));
        setUser(userData);
        setUserRole(payload.role || 'user');
        setCoinBalance(userData.coinBalance || 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Fetch real user profile from backend
        let userData: User;
        try {
          const profileRes = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            userData = await profileRes.json();
          } else {
            // fallback to JWT payload if /me fails
            userData = {
              id: payload.id,
              name: payload.username || 'User',
              email,
              role: payload.role || 'user',
              walletBalance: payload.walletBalance ?? 0,
              coinBalance: payload.coinBalance ?? 0,
              totalCoinsEarned: payload.totalCoinsEarned ?? 0,
              totalCoinsPurchased: payload.totalCoinsPurchased ?? 0,
            };
          }
        } catch {
          userData = {
          id: payload.id,
          name: payload.username || 'User',
          email,
          role: payload.role || 'user',
            walletBalance: payload.walletBalance ?? 0,
            coinBalance: payload.coinBalance ?? 0,
            totalCoinsEarned: payload.totalCoinsEarned ?? 0,
            totalCoinsPurchased: payload.totalCoinsPurchased ?? 0,
        };
        }
        localStorage.setItem('nifty-bulk-token', token);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(userData));
        setUser(userData);
        setUserRole(payload.role || 'user');
        setCoinBalance(userData.coinBalance || 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Email login error:', error);
      return false;
    }
  };

  const superAdminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/superadmin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        
        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData: User = {
          id: 'superadmin',
          name: 'Super Admin',
          email,
          role: 'superadmin',
          walletBalance: payload.walletBalance ?? 0,
          coinBalance: payload.coinBalance ?? 0,
          totalCoinsEarned: payload.totalCoinsEarned ?? 0,
          totalCoinsPurchased: payload.totalCoinsPurchased ?? 0,
        };

        localStorage.setItem('nifty-bulk-token', token);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(userData));
        
        setUser(userData);
        setUserRole('superadmin');
        setCoinBalance(userData.coinBalance || 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Super admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setCoinBalance(0);
    setSessionId(null);
    localStorage.removeItem('nifty-bulk-token');
    localStorage.removeItem('nifty-bulk-user');
    localStorage.removeItem('nifty-bulk-session-id');

    // Navigate to homepage and refresh the page
    window.location.href = '/';
  };

  // Logout from all devices by invalidating session on backend
  const logoutAllDevices = async () => {
    const token = localStorage.getItem('nifty-bulk-token');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/auth/logout-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout all devices error:', error);
    }

    // Clear local session and logout
    logout();
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('nifty-bulk-user', JSON.stringify(updatedUser));
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('nifty-bulk-transactions', JSON.stringify(updatedTransactions));

    // Update portfolio if it's a buy/sell transaction
    if (transaction.type === 'buy' || transaction.type === 'sell') {
      updatePortfolio(
        transaction.stockSymbol!,
        transaction.quantity!,
        transaction.price!,
        transaction.type
      );
    }
  };

  const updatePortfolio = (symbol: string, quantity: number, price: number, type: 'buy' | 'sell') => {
    const existingStock = portfolio.find(p => p.symbol === symbol);
    let updatedPortfolio = [...portfolio];

    if (type === 'buy') {
        if (existingStock) {
          // Update existing position
          const totalQuantity = existingStock.quantity + quantity;
          const totalValue = (existingStock.quantity * existingStock.avgPrice) + (quantity * price);
          const newAvgPrice = totalValue / totalQuantity;
          
          updatedPortfolio = updatedPortfolio.map(p =>
            p.symbol === symbol
              ? { ...p, quantity: totalQuantity, avgPrice: newAvgPrice, currentPrice: price }
              : p
          );
        } else {
          // Add new position
          const stockData = mockStocks.find(s => s.symbol === symbol);
          updatedPortfolio.push({
            symbol,
            name: stockData?.name || symbol,
            quantity,
            avgPrice: price,
            currentPrice: price,
            instrumentType: 'stock',
            coinInvested: 0,
            currentCoinValue: 0,
            coinPnL: 0,
            coinPnLPercent: 0,
            entryDate: new Date(),
          });
        }
    } else if (type === 'sell' && existingStock) {
      if (existingStock.quantity === quantity) {
        // Remove position completely
        updatedPortfolio = updatedPortfolio.filter(p => p.symbol !== symbol);
      } else {
        // Reduce quantity
        updatedPortfolio = updatedPortfolio.map(p =>
          p.symbol === symbol
            ? { ...p, quantity: p.quantity - quantity, currentPrice: price }
            : p
        );
      }
    }

    setPortfolio(updatedPortfolio);
    localStorage.setItem('nifty-bulk-portfolio', JSON.stringify(updatedPortfolio));
  };

  const addToWishlist = (item: WishlistItem) => {
    const updatedWishlist = [...wishlist, item];
    setWishlist(updatedWishlist);
    localStorage.setItem('nifty-bulk-wishlist', JSON.stringify(updatedWishlist));
  };

  const removeFromWishlist = (symbol: string) => {
    const updatedWishlist = wishlist.filter(item => item.symbol !== symbol);
    setWishlist(updatedWishlist);
    localStorage.setItem('nifty-bulk-wishlist', JSON.stringify(updatedWishlist));
  };

  const isInWishlist = (symbol: string) => {
    return wishlist.some(item => item.symbol === symbol);
  };

  const shouldRedirectToAdminDashboard = () => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  const buyStock = async (symbol: string, quantity: number, price: number): Promise<void> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const totalCost = quantity * price;
      if (user.walletBalance < totalCost) {
        throw new Error("Insufficient wallet balance");
      }

      await tradingService.buyStock({
        id: '',
        userId: user.id,
        symbol,
        quantity,
        price,
        type: 'buy',
        total: totalCost,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });

      const newBalance = user.walletBalance - totalCost;
      updateUser({ walletBalance: newBalance });

      addTransaction({
        type: "buy",
        stockSymbol: symbol,
        quantity,
        price,
        amount: totalCost,
        instrumentType: "stock",
      });

      updatePortfolio(symbol, quantity, price, "buy");
    } catch (error) {
      console.error("Failed to buy stock:", error);
      throw error;
    }
  };

  const sellStock = async (symbol: string, quantity: number, price: number): Promise<void> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const existing = portfolio.find((p) => p.symbol === symbol);
      if (!existing || existing.quantity < quantity) {
        throw new Error("Insufficient stock quantity");
      }

      await tradingService.sellStock({
        id: '',
        userId: user.id,
        symbol,
        quantity,
        price,
        type: 'sell',
        total: quantity * price,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });

      const totalProceeds = quantity * price;
      const newBalance = user.walletBalance + totalProceeds;
      updateUser({ walletBalance: newBalance });

      addTransaction({
        type: "sell",
        stockSymbol: symbol,
        quantity,
        price,
        amount: totalProceeds,
        instrumentType: "stock",
      });

      updatePortfolio(symbol, quantity, price, "sell");
    } catch (error) {
      console.error("Failed to sell stock:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole,
        loading,
        coinBalance,
        coinLoading,
        login,
        loginEmail,
        superAdminLogin,
        logout,
        logoutAllDevices,
        updateUser,
        refreshWalletBalance,
        refreshCoinBalance,
        updateCoinBalance,
        deductCoins,
        addCoins,
        validateSufficientCoins,
        transactions,
        portfolio,
        wishlist,
        addTransaction,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        updatePortfolio,
        buyStock,
        sellStock,
        shouldRedirectToAdminDashboard,
        totalInvestment,
        currentValue,
        totalPnL,
        pnlPercent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};