import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Heart, Lock, Calendar, Building, Users, DollarSign, Activity, Volume2, Target, AlertCircle, Maximize2 } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';
import { Stock } from '../types/types';
import { useAuth } from '../hooks/useAuth';
import { getCompanyData, CompanyData } from '../services/companyDataService';
import StockChart from './StockChart';

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stock, setStock] = useState<Stock | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const foundStock = mockStocks.find(s => s.symbol === symbol);
    if (foundStock) {
      setStock(foundStock);
      // Get real company data
      const realCompanyData = getCompanyData(foundStock.symbol, foundStock.name);
      setCompanyData(realCompanyData);
      // Check if stock is in wishlist (simulate with localStorage)
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(wishlist.includes(symbol));
    } else {
      navigate('/');
    }
  }, [symbol, navigate]);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updatedWishlist;

    if (isWishlisted) {
      updatedWishlist = wishlist.filter((item: string) => item !== symbol);
    } else {
      updatedWishlist = [...wishlist, symbol];
    }

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setIsWishlisted(!isWishlisted);
  };

  if (!stock || !companyData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading stock details...</p>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const bgColor = isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Mobile-Responsive Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleWishlistToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                {!isAuthenticated ? (
                  <Lock className="h-5 w-5 text-gray-400" />
                ) : (
                  <Heart
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isWishlisted
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  />
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{stock.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                    NSE
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-center space-x-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-semibold ${changeColor}`}>
                  {isPositive ? '+' : ''}₹{stock.change.toFixed(2)}
                </span>
                <span className={`px-2 py-1 rounded-lg text-sm font-medium ${bgColor} ${changeColor}`}>
                  {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-lg">{stock.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{stock.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                      NSE
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Price Display */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-end space-x-2 mt-1">
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${changeColor}`}>
                    {isPositive ? '+' : ''}₹{stock.change.toFixed(2)}
                  </span>
                  <span className={`px-3 py-1 rounded-xl text-sm font-medium ${bgColor} ${changeColor}`}>
                    {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl"
              >
                {!isAuthenticated ? (
                  <>
                    <Lock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Login to Wishlist</span>
                  </>
                ) : (
                  <>
                    <Heart
                      className={`h-5 w-5 transition-colors duration-200 ${
                        isWishlisted
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Enhanced Stock Chart Section */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Chart Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Price Chart</h3>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Real-time price movement</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/stock/${symbol}/chart`)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm lg:text-base"
              >
                <Maximize2 className="h-4 w-4" />
                <span>View Graph</span>
              </button>
            </div>

            {/* Chart Content */}
            <div className="p-4 lg:p-6">
              <div className="lg:hidden mb-4">
                <StockChart
                  symbol={stock.symbol}
                  name={stock.name}
                  currentPrice={stock.price}
                  change={stock.change}
                  changePercent={stock.changePercent}
                  variant="compact"
                />
              </div>
              <div className="hidden lg:block">
                <StockChart
                  symbol={stock.symbol}
                  name={stock.name}
                  currentPrice={stock.price}
                  change={stock.change}
                  changePercent={stock.changePercent}
                  variant="detailed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Column - Key Metrics */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-4 lg:space-y-6">
              {/* Key Stats Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-2 mb-4 lg:mb-6">
                  <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Key Metrics</h3>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Volume</span>
                    </div>
                    <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                      {(Math.random() * 10 + 1).toFixed(1)}M
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Building className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
                    </div>
                    <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                      {companyData.marketCap}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">P/E Ratio</span>
                    </div>
                    <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">
                      {(Math.random() * 30 + 10).toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Target className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">52W Range</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">High: ₹{(stock.price * 1.2).toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Low: ₹{(stock.price * 0.8).toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading Signals Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-2 mb-4 lg:mb-6">
                  <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Trading Signals</h3>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="p-2 lg:p-3 bg-green-50 dark:bg-green-900/20 rounded-xl lg:rounded-2xl border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm font-medium text-green-700 dark:text-green-300">RSI</span>
                      <span className="text-xs lg:text-sm text-green-600 dark:text-green-400">Bullish</span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">65.2 - Momentum Strong</div>
                  </div>
                  
                  <div className="p-2 lg:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl lg:rounded-2xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm font-medium text-blue-700 dark:text-blue-300">MACD</span>
                      <span className="text-xs lg:text-sm text-blue-600 dark:text-blue-400">Neutral</span>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Crossover Expected</div>
                  </div>
                  
                  <div className="p-2 lg:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl lg:rounded-2xl border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm font-medium text-purple-700 dark:text-purple-300">Moving Avg</span>
                      <span className="text-xs lg:text-sm text-purple-600 dark:text-purple-400">Above 50MA</span>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Trend: Upward</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Company Details & Analysis */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Company Information */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 mb-4 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <Building className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Company Overview</h2>
                </div>
                
                <div className="space-y-4 lg:space-y-6">
                  {/* Company Details Grid */}
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="p-3 lg:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Industry</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-xs lg:text-sm">
                        {companyData.industry}
                      </p>
                    </div>
                    <div className="p-3 lg:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Founded</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-xs lg:text-sm">
                        {companyData.founded}
                      </p>
                    </div>
                    <div className="p-3 lg:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employees</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-xs lg:text-sm">
                        {companyData.employees}
                      </p>
                    </div>
                    <div className="p-3 lg:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl lg:rounded-2xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Headquarters</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-xs lg:text-sm">{companyData.headquarters}</p>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl lg:rounded-2xl border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <Users className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm lg:text-base">About {companyData.name}</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm leading-relaxed">
                      {companyData.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Highlights & Performance */}
              <div className="space-y-6 lg:space-y-8">
                {/* Financial Highlights */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-4 lg:mb-6">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                      <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Financial Highlights</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="p-3 lg:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl lg:rounded-2xl border border-green-200 dark:border-green-700">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Revenue (TTM)</p>
                      <p className="text-sm lg:text-lg font-bold text-green-700 dark:text-green-300">
                        {companyData.revenue}
                      </p>
                    </div>
                    <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl lg:rounded-2xl border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Net Profit (TTM)</p>
                      <p className="text-sm lg:text-lg font-bold text-blue-700 dark:text-blue-300">
                        {companyData.netProfit}
                      </p>
                    </div>
                    <div className="p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl lg:rounded-2xl border border-purple-200 dark:border-purple-700">
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">ROE</p>
                      <p className="text-sm lg:text-lg font-bold text-purple-700 dark:text-purple-300">
                        {companyData.roe}
                      </p>
                    </div>
                    <div className="p-3 lg:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl lg:rounded-2xl border border-orange-200 dark:border-orange-700">
                      <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Debt to Equity</p>
                      <p className="text-sm lg:text-lg font-bold text-orange-700 dark:text-orange-300">
                        {companyData.debtToEquity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Performance */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-4 lg:mb-6">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center">
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Performance Timeline</h2>
                  </div>
                  
                  <div className="space-y-3 lg:space-y-4">
                    {[
                      { period: '1 Week', change: companyData.performance.oneWeek, icon: '📅' },
                      { period: '1 Month', change: companyData.performance.oneMonth, icon: '📊' },
                      { period: '3 Months', change: companyData.performance.threeMonths, icon: '📈' },
                      { period: '1 Year', change: companyData.performance.oneYear, icon: '🎯' }
                    ].map((item, index) => {
                      const isPositive = item.change >= 0;
                      return (
                        <div key={index} className={`flex justify-between items-center p-3 lg:p-4 rounded-xl lg:rounded-2xl border ${
                          isPositive 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                        }`}>
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <span className="text-base lg:text-lg">{item.icon}</span>
                            <span className="font-medium text-gray-900 dark:text-white text-sm lg:text-base">{item.period}</span>
                          </div>
                          <div className="flex items-center space-x-1 lg:space-x-2">
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className={`font-bold text-sm lg:text-base ${
                              isPositive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {isPositive ? '+' : ''}{item.change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Action Button */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-20">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{stock.symbol}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">₹{stock.price.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleWishlistToggle}
                  className="p-2 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {!isAuthenticated ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Heart
                      className={`h-4 w-4 transition-colors duration-200 ${
                        isWishlisted
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  )}
                </button>
                <button 
                  onClick={() => navigate(`/stock/${symbol}/chart`)}
                  className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium text-sm hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                >
                  <Maximize2 className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  Explore More
                </button>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
};

export default StockDetail;
