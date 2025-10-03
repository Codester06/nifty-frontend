import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Clock, BarChart3, Eye, Heart, Trash2, Star } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { startLivePriceUpdates, mockStocks } from '@/data/mock/mockStocks';
import { Stock } from '@/shared/types';


import OptionsCtaCard from '@/components/dashboard/OptionsCtaCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Dashboard = () => {
  const { user, transactions, portfolio, shouldRedirectToAdminDashboard } = useAuth();
  const [liveStocks, setLiveStocks] = useState<Stock[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (shouldRedirectToAdminDashboard()) {
      navigate('/admin/dashboard');
    }
  }, [shouldRedirectToAdminDashboard, navigate]);



  useEffect(() => {
    const unsubscribe = startLivePriceUpdates(setLiveStocks);
    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(savedWishlist);
    return unsubscribe;
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  // Wishlist functions
  const removeFromWishlist = (symbol: string) => {
    const updatedWishlist = wishlist.filter(item => item !== symbol);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const getWishlistStocks = () => {
    return mockStocks.filter(stock => wishlist.includes(stock.symbol));
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className={`max-w-7xl mx-auto space-y-6 ${
        isMobile ? 'px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-8 space-y-8'
      }`}>
        {/* Enhanced Header Section */}
        <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 ${
          isMobile ? 'p-4' : 'p-8'
        }`}>
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-col lg:flex-row lg:items-center lg:justify-between gap-6'}`}>
            <div className="flex items-center space-x-4">
              <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg ${
                isMobile ? 'w-12 h-12' : 'w-16 h-16'
              }`}>
                <BarChart3 className={`text-white ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              </div>
              <div>
                <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
                  isMobile ? 'text-2xl' : 'text-4xl'
                }`}>
                  Dashboard
                </h1>
                <p className={`text-gray-600 dark:text-gray-400 mt-1 ${
                  isMobile ? 'text-sm' : 'text-lg'
                }`}>
                  Welcome back, {user?.name || user?.username || user?.email}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-4'}`}>
              <div className={`flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700 ${
                isMobile ? 'px-3 py-1' : 'px-4 py-2'
              }`}>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-green-700 dark:text-green-300 font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Live Market</span>
              </div>
              {!isMobile && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Portfolio Overview Section */}
        <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 ${
          isMobile ? 'p-4' : 'p-8'
        }`}>
          <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-8'}`}>
            <h2 className={`font-bold text-gray-900 dark:text-white ${
              isMobile ? 'text-lg' : 'text-2xl'
            }`}>Portfolio Overview</h2>
            {!isMobile && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="h-4 w-4" />
                <span>Real-time data</span>
              </div>
            )}
          </div>
          
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2 mb-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'
          }`}>
            <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg transition-all duration-300 ${
              isMobile ? 'p-3 hover:shadow-lg' : 'p-6 hover:shadow-xl transform hover:-translate-y-1'
            }`}>
              <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`text-blue-100 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Wallet Balance
                  </p>
                  <p className={`font-bold mt-1 ${isMobile ? 'text-lg' : 'text-3xl mt-2'}`}>
                    {isMobile
                      ? user?.walletBalance && user.walletBalance > 0
                        ? user.walletBalance >= 1000
                          ? `₹${(user.walletBalance / 1000).toFixed(1)}K`
                          : `₹${user.walletBalance.toLocaleString()}`
                        : `₹0`
                      : `₹${(user?.walletBalance ?? 0).toLocaleString()}`
                    }
                  </p>
                  <p className={`text-blue-200 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {isMobile ? 'Available' : 'Available funds'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className={`bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg transition-all duration-300 ${
              isMobile ? 'p-3 hover:shadow-lg' : 'p-6 hover:shadow-xl transform hover:-translate-y-1'
            }`}>
              <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`text-emerald-100 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Total Investment
                  </p>
                  <p className={`font-bold mt-1 ${isMobile ? 'text-lg' : 'text-3xl mt-2'}`}>
                    {isMobile 
                      ? `₹${(totalInvestment / 1000).toFixed(0)}K`
                      : `₹${totalInvestment.toLocaleString()}`
                    }
                  </p>
                  <p className={`text-emerald-200 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {isMobile ? 'Deployed' : 'Capital deployed'}
                  </p>
                </div>
                {!isMobile && (
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Current Value</p>
                  <p className="text-3xl font-bold mt-2">
                    ₹{currentValue.toLocaleString()}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">Market value</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${pnlPercent >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${pnlPercent >= 0 ? 'text-green-100' : 'text-red-100'} text-sm font-medium`}>Total P&L</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <p className="text-3xl font-bold">
                      ₹{Math.abs(totalPnL).toLocaleString()}
                    </p>
                  </div>
                  <p className={`${pnlPercent >= 0 ? 'text-green-200' : 'text-red-200'} text-xs mt-1`}>
                    {pnlPercent >= 0 ? '+' : '-'}{Math.abs(pnlPercent).toFixed(2)}% return
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {pnlPercent >= 0 ? (
                    <TrendingUp className="h-7 w-7 text-white" />
                  ) : (
                    <TrendingDown className="h-7 w-7 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Performance Chart */}
          {updatedPortfolio.length > 0 && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Performance</h3>
              <div className="h-32 flex items-end space-x-2">
                {updatedPortfolio.slice(0, 8).map((stock) => {
                  const height = Math.max(10, (stock.quantity * stock.currentPrice / currentValue) * 100);
                  const isProfit = stock.currentPrice >= stock.avgPrice;
                  return (
                    <div key={stock.symbol} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isProfit ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${stock.symbol}: ₹${(stock.quantity * stock.currentPrice).toLocaleString()}`}
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                        {stock.symbol}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Options Trading CTA */}
        <OptionsCtaCard />



        {/* Wishlist Section */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Watchlist</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {wishlist.length} {wishlist.length === 1 ? 'stock' : 'stocks'} in your watchlist
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Browse Stocks
            </button>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No stocks in watchlist</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start building your watchlist by adding stocks you're interested in tracking
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
              >
                Explore Stocks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getWishlistStocks().map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <div
                    key={stock.symbol}
                    className="group bg-white dark:bg-slate-700/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-600 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {stock.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{stock.symbol}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                            {stock.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(stock.symbol);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{stock.price.toFixed(2)}
                        </span>
                        <div className={`flex items-center space-x-1 ${
                          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium text-sm">
                            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl ${
                        isPositive 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Today's Change</span>
                          <span className={`font-semibold ${
                            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {isPositive ? '+' : ''}₹{stock.change.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Watchlisted</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Click to view details
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Portfolio Holdings Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Holdings</h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {updatedPortfolio.length} stocks
                </div>
                <button
                  onClick={() => navigate('/user/portfolio')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  View Full Portfolio
                </button>
              </div>
            </div>
            
            {updatedPortfolio.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No stocks in portfolio</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start investing to build your portfolio and track performance
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  Explore Stocks
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {updatedPortfolio.map((stock) => {
                  const profitLoss = (stock.currentPrice - stock.avgPrice) * stock.quantity;
                  const profitLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
                  const isProfit = profitLoss >= 0;
                  
                  return (
                    <div key={stock.symbol} className="group bg-gray-50/80 dark:bg-slate-700/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-gray-200/50 dark:border-slate-600/50 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <span className={`font-bold text-sm ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {stock.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {stock.quantity} shares • Avg: ₹{stock.avgPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{(stock.quantity * stock.currentPrice).toLocaleString()}
                          </p>
                          <div className={`flex items-center justify-end space-x-1 ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span className="font-medium">
                              {isProfit ? '+' : ''}₹{Math.abs(profitLoss).toFixed(2)}
                            </span>
                            <span className="text-sm">
                              ({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mini progress bar showing current price vs avg price */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>₹{Math.min(stock.avgPrice, stock.currentPrice).toFixed(2)}</span>
                          <span>₹{Math.max(stock.avgPrice, stock.currentPrice).toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${isProfit ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ 
                              width: `${Math.min(100, Math.max(10, Math.abs(profitLossPercent)))}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced Recent Transactions Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last {recentTransactions.length} activities
              </div>
            </div>
            
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recent transactions</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your trading activity and fund movements will appear here
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg"
                >
                  Start Learning
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => {
                  const isRecent = index < 2;
                  return (
                    <div key={transaction.id} className={`group bg-gray-50/80 dark:bg-slate-700/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-gray-200/50 dark:border-slate-600/50 hover:shadow-lg ${isRecent ? 'ring-2 ring-blue-500/20' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                            transaction.type === 'buy' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            transaction.type === 'sell' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                            'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {transaction.type === 'buy' ? (
                              <TrendingUp className="h-6 w-6 text-white" />
                            ) : transaction.type === 'sell' ? (
                              <TrendingDown className="h-6 w-6 text-white" />
                            ) : (
                              <Wallet className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {transaction.type === 'buy' ? 'Stock Purchase' :
                                 transaction.type === 'sell' ? 'Stock Sale' :
                                 transaction.type === 'add_funds' ? 'Funds Added' : 'Withdrawal'}
                              </h4>
                              {isRecent && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {transaction.stockName && (
                                <span className="font-medium">{transaction.stockName} • </span>
                              )}
                              {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            transaction.type === 'buy' || transaction.type === 'withdraw' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {transaction.type === 'buy' || transaction.type === 'withdraw' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                          </p>
                          {transaction.quantity && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {transaction.quantity} shares • ₹{(transaction.amount / transaction.quantity).toFixed(2)}/share
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {recentTransactions.length >= 5 && (
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => navigate('/user/transactions')}
                      className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
                    >
                      View All Transactions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;