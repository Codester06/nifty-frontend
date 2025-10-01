import { useEffect, useState } from 'react';
import { Heart, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { startLivePriceUpdates, mockStocks } from '../data/mockStocks';
import { Stock } from '../types/types';

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [liveStocks, setLiveStocks] = useState<Stock[]>([]);
  const [wishlistSymbols, setWishlistSymbols] = useState<string[]>([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistSymbols(savedWishlist);

    // Start live price updates
    const unsubscribe = startLivePriceUpdates(setLiveStocks);
    return unsubscribe;
  }, [isAuthenticated, navigate]);

  // Get wishlist stocks with live prices
  const wishlistStocks = wishlistSymbols.map(symbol => {
    const baseStock = mockStocks.find(stock => stock.symbol === symbol);
    const liveStock = liveStocks.find(stock => stock.symbol === symbol);

    if (!baseStock) return null;

    return liveStock ? {
      ...baseStock,
      price: liveStock.price,
      change: liveStock.change,
      changePercent: liveStock.changePercent,
    } : baseStock;
  }).filter(Boolean) as Stock[];

  const handleRemoveFromWishlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedWishlist = wishlistSymbols.filter(item => item !== symbol);
    setWishlistSymbols(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const handleStockClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-gray-200 dark:border-slate-700 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Wishlist</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stocks you're tracking • Live prices
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">LIVE</span>
            </div>
          </div>
        </div>

        {wishlistStocks.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stocks in wishlist</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add stocks to your wishlist to track them easily
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Browse Stocks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => handleStockClick(stock.symbol)}
                className="bg-white dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer p-6 group border border-gray-100 dark:border-slate-700"
              >
                <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">{stock.symbol}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveFromWishlist(stock.symbol, e)}
                    className="p-2 rounded-full transition-all duration-300 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove from Wishlist"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{stock.price.toFixed(2)}
                    </span>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${
                      stock.changePercent >= 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {stock.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {stock.changePercent >= 0 ? '+' : ''}₹{stock.change.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${
                    stock.changePercent >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/stock/${stock.symbol}`);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg"
                  >
                    View Details
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;