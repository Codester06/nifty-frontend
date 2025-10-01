import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart3, Shield, Zap, Newspaper, Heart, Lock } from 'lucide-react';
import { mockStocks, startLivePriceUpdates } from '../data/mockStocks';
import { Stock } from '../types/types';
import TradingViewWidget from '../components/TradingViewWidget';
import TechnicalAnalysisWidget from '../components/TechnicalAnalysisWidget';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [showAllStocks, setShowAllStocks] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const unsubscribe = startLivePriceUpdates(setStocks);
    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(savedWishlist);
    return unsubscribe;
  }, []);

  const handleWishlistToggle = (symbol: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to stock detail

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const updatedWishlist = wishlist.includes(symbol)
      ? wishlist.filter(item => item !== symbol)
      : [...wishlist, symbol];

    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };



  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-16 sm:py-20 lg:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Market Data • Real-time Trading
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Crack the Nifty 50{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trade Like a Pro
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
             "Real-time insights. Pure speed. Zero compromise."
              <span className="block mt-2 text-base sm:text-lg text-gray-500 dark:text-gray-400">
                Join 50,000+ traders who trust NiftyBulk for their investment journey
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0 mb-12">
              <button
                onClick={() => navigate('/login')}
                className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="relative z-10">Start Trading Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => navigate('/about')}
                className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">₹500Cr+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Daily Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>

          {/* Enhanced Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-600/30">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Real-time Data</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Get live market updates every 2 seconds with professional-grade data feeds from NSE & BSE
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  99.9% Accuracy
                </span>
              </div>
            </div>

            <div className="group relative bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-green-200 dark:hover:border-green-600/30">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Bank-grade Security</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Your investments are protected with 256-bit SSL encryption and multi-factor authentication
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                  SEBI Regulated
                </span>
              </div>
            </div>

            <div className="group relative bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:border-purple-200 dark:hover:border-purple-600/30">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Execute trades in milliseconds with our high-performance trading engine and smart order routing
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 font-medium">
                  &lt;50ms Latency
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nifty 50 Stocks Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Market Data
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nifty 50 Stocks
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real-time prices and performance of India's top 50 companies
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-700/30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Stock Prices</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Updated every 2 seconds</span>
                </div>
              </div>
            </div>

            {/* Stock List */}
            <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {(showAllStocks ? stocks : stocks.slice(0, 10)).map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    {/* Company Info */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Company Logo/Symbol */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {stock.symbol.substring(0, 2)}
                          </span>
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {stock.symbol}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {stock.name}
                        </p>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="flex items-center space-x-6 flex-shrink-0">
                      {/* Current Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{stock.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Change Amount */}
                      <div className="text-right min-w-[80px]">
                        <div className={`text-sm font-medium ${
                          stock.change >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)}
                        </div>
                      </div>

                      {/* Change Percentage */}
                      <div className="text-right min-w-[80px]">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                          stock.change >= 0
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>

                      {/* Wishlist Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => handleWishlistToggle(stock.symbol, e)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200"
                        >
                          {!isAuthenticated ? (
                            <Lock className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Heart
                              className={`h-5 w-5 transition-colors duration-200 ${
                                wishlist.includes(stock.symbol)
                                  ? 'text-red-500 fill-red-500'
                                  : 'text-gray-400 hover:text-red-400'
                              }`}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/30 border-t border-gray-100 dark:border-slate-700/50">
              <div className="text-center">
                <button
                  onClick={() => setShowAllStocks(!showAllStocks)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {showAllStocks ? (
                    <>
                      Show Less
                      <svg className="ml-2 h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Show All {stocks.length} Stocks
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced News Section */}
      <section className="py-16 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
              <Newspaper className="h-4 w-4 mr-2" />
              Live Market News
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Market News & Analysis
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Stay ahead with real-time financial news, expert analysis, and market insights from trusted sources
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Latest Updates</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Live Feed</span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <TradingViewWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Analysis Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium mb-6">
              <BarChart3 className="h-4 w-4 mr-2" />
              Technical Analysis
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nifty 50 Technical Analysis
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Advanced technical indicators and analysis for informed trading decisions
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Nifty 50 Analysis</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Live Analysis</span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <TechnicalAnalysisWidget />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;