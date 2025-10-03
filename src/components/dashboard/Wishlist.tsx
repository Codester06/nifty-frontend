import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Stock } from '@/shared/types';

interface WishlistProps {
  wishlist: Stock[];
  removeFromWishlist: (symbol: string) => void;
}

const Wishlist = ({ wishlist, removeFromWishlist }: WishlistProps) => {
  const navigate = useNavigate();

  return (
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
          {wishlist.map((stock) => {
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
  );
};

export default Wishlist;
