import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Heart, Lock, Calendar, Building, Users, DollarSign } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';
import { Stock } from '../types/types';
import { useAuth } from '../hooks/useAuth';
import { getCompanyData, CompanyData } from '../services/companyDataService';

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stock.symbol.slice(0, 3)}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                </div>
              </div>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Price Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              {/* Current Price */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-semibold ${changeColor}`}>
                    {isPositive ? '+' : ''}₹{stock.change.toFixed(2)}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-sm font-medium ${bgColor} ${changeColor}`}>
                    {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Key Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(Math.random() * 10 + 1).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Symbol</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{stock.symbol}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {companyData.marketCap}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(Math.random() * 30 + 10).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">52W High/Low</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    ₹{(stock.price * 1.2).toFixed(0)} / ₹{(stock.price * 0.8).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Company Details & History */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Company Information */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h2>
                </div>
                <div className="space-y-6">
                  {/* Company Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {companyData.industry}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Founded</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {companyData.founded}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {companyData.employees}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Headquarters</p>
                      <p className="font-medium text-gray-900 dark:text-white">{companyData.headquarters}</p>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">About {companyData.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {companyData.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Highlights */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Highlights</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Revenue (TTM)</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {companyData.revenue}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit (TTM)</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {companyData.netProfit}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">ROE</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {companyData.roe}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Debt to Equity</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {companyData.debtToEquity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Performance */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Performance</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { period: '1 Week', change: companyData.performance.oneWeek },
                    { period: '1 Month', change: companyData.performance.oneMonth },
                    { period: '3 Months', change: companyData.performance.threeMonths },
                    { period: '1 Year', change: companyData.performance.oneYear }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700 last:border-b-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.period}</span>
                      <span className={`text-sm font-medium ${
                        item.change >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>


      </div>
    </div>
  );
};

export default StockDetail;
