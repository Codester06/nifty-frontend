import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Portfolio, WishlistItem } from '../types/types';
import { mockStocks } from '../data/mockStocks';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | 'superadmin' | null;
  loading: boolean;
  login: (mobile: string, otp: string) => Promise<boolean>;
  loginEmail: (email: string, password: string) => Promise<boolean>;
  superAdminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshWalletBalance: () => Promise<void>;
  transactions: Transaction[];
  portfolio: Portfolio[];
  wishlist: WishlistItem[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (symbol: string) => void;
  isInWishlist: (symbol: string) => boolean;
  updatePortfolio: (symbol: string, quantity: number, price: number, type: 'buy' | 'sell') => void;
  shouldRedirectToAdminDashboard: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'superadmin' | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh wallet balance from backend
  const refreshWalletBalance = async () => {
    const token = localStorage.getItem('nifty-bulk-token');
    if (!token || !user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, walletBalance: data.balance };
        setUser(updatedUser);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh wallet balance:', error);
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

  // Set up periodic wallet balance refresh for authenticated users
  useEffect(() => {
    if (!user || userRole === 'superadmin') return;

    // Initial refresh after login
    refreshWalletBalance();

    // Set up interval to refresh every 30 seconds
    const interval = setInterval(refreshWalletBalance, 30000);

    return () => clearInterval(interval);
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
              mobile,
              email: payload.email,
              role: payload.role || 'user',
              walletBalance: payload.walletBalance ?? 0,
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
        };
        }
        localStorage.setItem('nifty-bulk-token', token);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(userData));
        setUser(userData);
        setUserRole(payload.role || 'user');
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
            };
          }
        } catch {
          userData = {
          id: payload.id,
          name: payload.username || 'User',
          email,
          role: payload.role || 'user',
            walletBalance: payload.walletBalance ?? 0,
        };
        }
        localStorage.setItem('nifty-bulk-token', token);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(userData));
        setUser(userData);
        setUserRole(payload.role || 'user');
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
        };

        localStorage.setItem('nifty-bulk-token', token);
        localStorage.setItem('nifty-bulk-user', JSON.stringify(userData));
        
        setUser(userData);
        setUserRole('superadmin');
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
    localStorage.removeItem('nifty-bulk-token');
    localStorage.removeItem('nifty-bulk-user');
    
    // Navigate to homepage and refresh the page
    window.location.href = '/';
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole,
        loading,
        login,
        loginEmail,
        superAdminLogin,
        logout,
        updateUser,
        refreshWalletBalance,
        transactions,
        portfolio,
        wishlist,
        addTransaction,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        updatePortfolio,
        shouldRedirectToAdminDashboard,
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