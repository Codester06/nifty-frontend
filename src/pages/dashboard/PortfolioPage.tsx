import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Target, 
  Clock,
  Filter,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePortfolioRealTime } from '@/shared/hooks/usePortfolioRealTime';
import { Portfolio, PortfolioOption } from '@/features/trading/types';
import { PortfolioCalculations } from '@/shared/utils/portfolioCalculations';
import { apiService } from '@/shared/services/api';
import { realTimePriceService } from '@/shared/services/realTimePriceService';

const PortfolioPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'stocks' | 'options'>('all');
  const [showClosedPositions, setShowClosedPositions] = useState(false);

  // Use real-time portfolio hook
  const {
    portfolio,
    summary,
    loading,
    error,
    lastUpdated,
    refreshPortfolio,
    updatePrices
  } = usePortfolioRealTime({
    userId: user?.id || '',
    updateInterval: 10000, // Refresh every 10 seconds
    enableRealTime: true
  });

  // Set up real-time price subscriptions
  useEffect(() => {
    if (!portfolio || !user) return;

    // Get all symbols from portfolio
    const stockSymbols = portfolio.stocks.map(stock => stock.symbol);
    const optionSymbols = portfolio.options.map(option => 
      `${option.underlying}${option.strike}${option.optionType}`
    );
    const allSymbols = [...stockSymbols, ...optionSymbols];

    if (allSymbols.length === 0) return;

    // Subscribe to real-time price updates
    const subscriptionId = realTimePriceService.subscribe(allSymbols, (priceUpdates) => {
      const priceMap: Record<string, number> = {};
      priceUpdates.forEach(update => {
        priceMap[update.symbol] = update.price;
      });
      updatePrices(priceMap);
    });

    return () => {
      realTimePriceService.unsubscribe(subscriptionId);
    };
  }, [portfolio, user, updatePrices]);

  const getFilteredOptions = () => {
    if (!portfolio) return [];
    return showClosedPositions 
      ? portfolio.options 
      : portfolio.options.filter(option => option.status === 'OPEN');
  };

  const getDisplayData = () => {
    if (!portfolio) return { stocks: [], options: [] };
    
    const filteredOptions = getFilteredOptions();
    
    switch (activeTab) {
      case 'stocks':
        return { stocks: portfolio.stocks, options: [] };
      case 'options':
        return { stocks: [], options: filteredOptions };
      default:
        return { stocks: portfolio.stocks, options: filteredOptions };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={refreshPortfolio}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  const { stocks, options } = getDisplayData();
  const hasPositions = portfolio.stocks.length > 0 || portfolio.options.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Portfolio
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                  Track your investments and performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshPortfolio}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Overview</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="h-4 w-4" />
                <span>Real-time data</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  {user?.coinBalance?.toLocaleString() || 0} Coins
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Value</p>
                  <p className="text-3xl font-bold mt-2">
                    ₹{portfolio.totalValue.toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {portfolio.totalCoinValue?.toLocaleString() || 0} coins value
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Coins Invested</p>
                  <p className="text-3xl font-bold mt-2">
                    {portfolio.totalCoinsInvested?.toLocaleString() || 0}
                  </p>
                  <p className="text-emerald-200 text-xs mt-1">
                    {(portfolio.stocks?.length || 0) + (portfolio.options?.filter(o => o.status === 'OPEN').length || 0)} positions
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Target className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Available Balance</p>
                  <p className="text-3xl font-bold mt-2">
                    {user?.coinBalance?.toLocaleString() || 0}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">Coins ready to invest</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-900">₹</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${(portfolio.totalCoinPnL || 0) >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${(portfolio.totalCoinPnL || 0) >= 0 ? 'text-green-100' : 'text-red-100'} text-sm font-medium`}>Coin P&L</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <p className="text-3xl font-bold">
                      {Math.abs(portfolio.totalCoinPnL || 0).toLocaleString()}
                    </p>
                  </div>
                  <p className={`${(portfolio.totalCoinPnL || 0) >= 0 ? 'text-green-200' : 'text-red-200'} text-xs mt-1`}>
                    {(portfolio.totalCoinPnL || 0) >= 0 ? '+' : '-'}{Math.abs(portfolio.totalCoinPnLPercent || 0).toFixed(2)}% return
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {(portfolio.totalCoinPnL || 0) >= 0 ? (
                    <TrendingUp className="h-7 w-7 text-white" />
                  ) : (
                    <TrendingDown className="h-7 w-7 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Performance Metrics */}
          <div className="bg-gray-50/80 dark:bg-slate-700/50 rounded-2xl p-6 border border-gray-200/50 dark:border-slate-600/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((portfolio.totalCoinsInvested || 0) / Math.max(user?.coinBalance || 1, 1) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Allocation</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolio.stocks?.length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stock Positions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolio.options?.filter(o => o.status === 'OPEN').length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Options</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolio.options?.filter(o => o.status === 'CLOSED').length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Closed Options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
                {(['all', 'stocks', 'options'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {activeTab !== 'stocks' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowClosedPositions(!showClosedPositions)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    showClosedPositions
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {showClosedPositions ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>Show Closed</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Holdings Display */}
        {!hasPositions ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-16">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No positions yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start building your portfolio by investing in stocks and trading options
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Explore Markets
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stock Holdings */}
            {(activeTab === 'all' || activeTab === 'stocks') && stocks.length > 0 && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Stock Holdings</h3>
                <div className="space-y-4">
                  {stocks.map((stock) => {
                    const profitLoss = (stock.currentPrice - stock.averagePrice) * stock.quantity;
                    const profitLossPercent = ((stock.currentPrice - stock.averagePrice) / stock.averagePrice) * 100;
                    const isProfit = profitLoss >= 0;
                    const coinPnL = stock.coinPnL || 0;
                    const coinPnLPercent = stock.coinPnLPercent || 0;
                    const isCoinProfit = coinPnL >= 0;
                    
                    return (
                      <div key={stock.symbol} className="bg-gray-50/80 dark:bg-slate-700/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-gray-200/50 dark:border-slate-600/50 hover:shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                              <span className={`font-bold text-sm ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stock.symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {stock.quantity} shares • Avg: ₹{stock.averagePrice.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Invested: {stock.coinInvested?.toLocaleString() || 0} coins
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{(stock.quantity * stock.currentPrice).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {stock.currentCoinValue?.toLocaleString() || 0} coins
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
                        
                        {/* Coin P&L Display */}
                        <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Coin P&L:</span>
                            <div className={`flex items-center space-x-1 ${isCoinProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isCoinProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              <span className="font-medium text-sm">
                                {isCoinProfit ? '+' : ''}{Math.abs(coinPnL).toLocaleString()} coins
                              </span>
                              <span className="text-xs">
                                ({isCoinProfit ? '+' : ''}{coinPnLPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Options Holdings */}
            {(activeTab === 'all' || activeTab === 'options') && options.length > 0 && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Options Positions</h3>
                <div className="space-y-4">
                  {options.map((option) => {
                    const isProfit = option.gainLoss >= 0;
                    const isCall = option.optionType === 'CE';
                    const daysToExpiry = Math.ceil((new Date(option.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const coinPnL = option.coinPnL || 0;
                    const coinPnLPercent = option.coinPnLPercent || 0;
                    const isCoinProfit = coinPnL >= 0;
                    
                    return (
                      <div key={option.id} className={`bg-gray-50/80 dark:bg-slate-700/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-gray-200/50 dark:border-slate-600/50 hover:shadow-lg ${option.status === 'CLOSED' ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              isCall 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              <span className={`font-bold text-xs ${
                                isCall 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {isCall ? 'CE' : 'PE'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {option.underlying} {option.strike} {option.optionType}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>{option.quantity} lots • Avg: ₹{option.averagePrice.toFixed(2)}</span>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{daysToExpiry}d to expiry</span>
                                </div>
                                {option.status === 'CLOSED' && (
                                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                    Closed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Invested: {option.coinInvested?.toLocaleString() || 0} coins
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{option.totalValue.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {option.currentCoinValue?.toLocaleString() || 0} coins
                            </p>
                            <div className={`flex items-center justify-end space-x-1 ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="font-medium">
                                {isProfit ? '+' : ''}₹{Math.abs(option.gainLoss).toFixed(2)}
                              </span>
                              <span className="text-sm">
                                ({isProfit ? '+' : ''}{option.gainLossPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Coin P&L and Greeks Display */}
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                          {/* Coin P&L */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Coin P&L:</span>
                            <div className={`flex items-center space-x-1 ${isCoinProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isCoinProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              <span className="font-medium text-sm">
                                {isCoinProfit ? '+' : ''}{Math.abs(coinPnL).toLocaleString()} coins
                              </span>
                              <span className="text-xs">
                                ({isCoinProfit ? '+' : ''}{coinPnLPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>

                          {/* Greeks Display */}
                          {option.greeks && (
                            <div className="grid grid-cols-4 gap-4">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Delta</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {option.greeks.delta.toFixed(3)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Gamma</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {option.greeks.gamma.toFixed(3)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Theta</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {option.greeks.theta.toFixed(3)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Vega</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {option.greeks.vega.toFixed(3)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;