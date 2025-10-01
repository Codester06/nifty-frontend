import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { startLivePriceUpdates } from '../data/mockStocks';
import { Stock } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Dashboard = () => {
  const { user, transactions, portfolio, shouldRedirectToAdminDashboard } = useAuth();
  const [liveStocks, setLiveStocks] = useState<Stock[]>([]);
  const navigate = useNavigate();

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (shouldRedirectToAdminDashboard()) {
      navigate('/admin/dashboard');
    }
  }, [shouldRedirectToAdminDashboard, navigate]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem('nifty-bulk-token');
        const response = await fetch(`${API_BASE_URL}/users/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch wallet');
        await response.json();
        // setWalletBalance(data.balance); // Removed as per edit hint
      } catch (err) {
        console.error(err); // Removed setWalletError as it's no longer defined
      }
    };
    fetchWallet();
  }, []);

  useEffect(() => {
    const unsubscribe = startLivePriceUpdates(setLiveStocks);
    return unsubscribe;
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  // Update portfolio with live prices and calculate totals
  const updatedPortfolio = portfolio.map(item => {
    const liveStock = liveStocks.find(stock => stock.symbol === item.symbol);
    return liveStock ? { ...item, currentPrice: liveStock.price } : item;
  });

  const totalInvestment = updatedPortfolio.reduce((sum, stock) => sum + (stock.quantity * stock.avgPrice), 0);
  const currentValue = updatedPortfolio.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
  const totalPnL = currentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, {user?.username || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 dark:text-green-300 text-sm font-medium">Live Market</span>
            </div>
          </div>
        </div>

        {/* Portfolio Overview Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Portfolio Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Wallet Balance</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ₹{user?.walletBalance?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Investment</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ₹{totalInvestment.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${pnlPercent >= 0 ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' : 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'} rounded-xl p-6 border ${pnlPercent >= 0 ? 'border-green-200 dark:border-green-700/50' : 'border-red-200 dark:border-red-700/50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${pnlPercent >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>Total P&L</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${pnlPercent >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                      ₹{totalPnL.toLocaleString()}
                    </p>
                    <span className={`text-sm font-medium ${pnlPercent >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${pnlPercent >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-xl flex items-center justify-center shadow-lg`}>
                  {pnlPercent >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-white" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Holdings Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Portfolio Holdings</h3>
            {updatedPortfolio.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No stocks in portfolio</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Start investing to see your portfolio here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {updatedPortfolio.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stock.quantity} shares @ ₹{stock.avgPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₹{(stock.quantity * stock.currentPrice).toLocaleString()}
                      </p>
                      <p className={`text-sm font-medium ${stock.currentPrice >= stock.avgPrice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {stock.currentPrice > stock.avgPrice ? '+' : ''}
                        {(((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No recent transactions</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Your trading activity will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'buy' ? 'bg-green-100 dark:bg-green-900/30' :
                        transaction.type === 'sell' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {transaction.type === 'buy' ? (
                          <TrendingUp className={`h-5 w-5 ${transaction.type === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                        ) : transaction.type === 'sell' ? (
                          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.type === 'buy' ? 'Bought' :
                           transaction.type === 'sell' ? 'Sold' :
                           transaction.type === 'add_funds' ? 'Added Funds' : 'Withdrawal'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.stockName || new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₹{transaction.amount.toLocaleString()}
                      </p>
                      {transaction.quantity && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.quantity} shares
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;