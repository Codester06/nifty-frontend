import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Heart, Lock, Activity } from 'lucide-react';
import { Stock } from '../types/types';
import { useAuth } from '../hooks/useAuth';
import TradingModal from './TradingModal';

interface StockCardProps {
  stock: Stock;
  index?: number;
  fullWidth?: boolean;
}

const StockCard = ({ stock, index = 0, fullWidth = false }: StockCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isInWishlist, addToWishlist, removeFromWishlist } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [tradingModal, setTradingModal] = useState<{ isOpen: boolean; type: 'buy' | 'sell' }>({
    isOpen: false,
    type: 'buy'
  });

  const isPositive = stock.change > 0;
  const inWishlist = isInWishlist(stock.symbol);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (inWishlist) {
      removeFromWishlist(stock.symbol);
    } else {
      addToWishlist({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
      });
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setTradingModal({ isOpen: true, type: 'buy' });
    }
  };

  const handleSellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setTradingModal({ isOpen: true, type: 'sell' });
    }
  };

  const handleCardClick = () => {
    navigate(`/stock/${stock.symbol}`);
  };

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        className={`glass-card rounded-xl p-4 cursor-pointer group hover:shadow-neon-blue/20 transition-all duration-300 relative overflow-hidden ${fullWidth ? 'w-full' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ 
          scale: 1.01,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            {/* Company Info */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-neon-green animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-neon-blue transition-colors duration-300">
                    {stock.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stock.fullName}</p>
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                  ₹{stock.price.toLocaleString()}
                </div>
                <div className="flex items-center space-x-1">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-neon-green" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-neon-red" />
                  )}
                  <span className={`text-sm font-semibold font-mono ${
                    isPositive ? 'text-neon-green' : 'text-neon-red'
                  }`}>
                    {isPositive ? '+' : ''}₹{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Volume */}
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600 dark:text-gray-400">Volume</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">{stock.volume}</p>
              </div>

              {/* Wishlist Button */}
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <motion.button
                    onClick={handleWishlistClick}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      inWishlist
                        ? 'text-neon-pink shadow-neon-red/30'
                        : 'text-gray-400 hover:text-neon-pink hover:shadow-neon-red/20'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => navigate('/login')}
                    className="p-2 rounded-full text-gray-500 hover:text-neon-blue hover:shadow-neon-blue/20 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Login to add to wishlist"
                  >
                    <Lock className="h-5 w-5" />
                  </motion.button>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleBuyClick}
                    className="px-4 py-2 bg-gradient-to-r from-neon-green to-green-400 text-white rounded-lg font-bold text-sm hover:shadow-neon-green/30 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    BUY
                  </motion.button>
                  <motion.button
                    onClick={handleSellClick}
                    className="px-4 py-2 bg-gradient-to-r from-neon-red to-red-400 text-white rounded-lg font-bold text-sm hover:shadow-neon-red/30 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    SELL
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <TradingModal
        isOpen={tradingModal.isOpen}
        onClose={() => setTradingModal({ ...tradingModal, isOpen: false })}
        stock={stock}
        type={tradingModal.type}
      />
    </>
  );
};

export default StockCard;