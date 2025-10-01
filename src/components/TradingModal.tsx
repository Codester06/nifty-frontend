import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';
import { Stock } from '../types/types';
import { useAuth } from '../hooks/useAuth';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock;
  type: 'buy' | 'sell';
}

const TradingModal = ({ isOpen, onClose, stock, type }: TradingModalProps) => {
  const [quantity, setQuantity] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { user, updateUser, addTransaction, portfolio } = useAuth();

  const quantityNum = parseInt(quantity) || 0;
  const totalAmount = quantityNum * stock.price;
  const canAfford = user ? user.walletBalance >= totalAmount : false;
  
  const portfolioStock = portfolio.find(p => p.symbol === stock.symbol);
  const availableShares = portfolioStock?.quantity || 0;
  const canSell = type === 'sell' && quantityNum <= availableShares;

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 2000);
  };

  const handleTrade = async () => {
    if (!user || quantityNum <= 0) return;
    
    if (type === 'buy' && !canAfford) {
      showToastMessage('Insufficient wallet balance!');
      return;
    }
    
    if (type === 'sell' && !canSell) {
      showToastMessage('Insufficient shares to sell!');
      return;
    }

    setIsProcessing(true);

    setTimeout(async () => {
      if (type === 'buy') {
        updateUser({ walletBalance: user.walletBalance - totalAmount });
        addTransaction({
          type: 'buy',
          stockSymbol: stock.symbol,
          stockName: stock.name,
          quantity: quantityNum,
          price: stock.price,
          amount: totalAmount,
        });
        // Backend trade creation
        try {
          const token = localStorage.getItem('nifty-bulk-token');
          await fetch('/api/trades', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user.id,
              asset: stock.symbol,
              action: 'BUY',
              quantity: quantityNum,
              price: stock.price,
              margin: undefined, // You can fetch margin if needed
              status: 'Completed',
            }),
          });
        } catch {
          /* ignore for now */
        }
        showToastMessage(`Successfully bought ${quantityNum} shares of ${stock.name}!`);
      } else {
        updateUser({ walletBalance: user.walletBalance + totalAmount });
        addTransaction({
          type: 'sell',
          stockSymbol: stock.symbol,
          stockName: stock.name,
          quantity: quantityNum,
          price: stock.price,
          amount: totalAmount,
        });
        // Backend trade creation
        try {
          const token = localStorage.getItem('nifty-bulk-token');
          await fetch('/api/trades', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user.id,
              asset: stock.symbol,
              action: 'SELL',
              quantity: quantityNum,
              price: stock.price,
              margin: undefined, // You can fetch margin if needed
              status: 'Completed',
            }),
          });
        } catch {
          /* ignore for now */
        }
        showToastMessage(`Successfully sold ${quantityNum} shares of ${stock.name}!`);
      }
      
      setIsProcessing(false);
      setQuantity('1');
    }, 1000);
  };

  const isPositive = stock.change > 0;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="glass-card rounded-3xl w-full max-w-md mx-4 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${
                      type === 'buy' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
                    }`}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {type === 'buy' ? 'Buy' : 'Sell'} {stock.name}
                    </h2>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 glass-button rounded-xl hover:shadow-neon-red/20 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                {/* Stock Info */}
                <motion.div 
                  className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                        ₹{stock.price.toLocaleString()}
                      </span>
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full glass-card ${
                        isPositive ? 'text-neon-green' : 'text-neon-red'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-semibold font-mono">
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stock.fullName}</p>
                  </div>
                </motion.div>

                {/* Quantity Input */}
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    max={type === 'sell' ? availableShares : undefined}
                    className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-300"
                    placeholder="Enter quantity"
                  />
                  {type === 'sell' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-mono">
                      Available: {availableShares} shares
                    </p>
                  )}
                </motion.div>

                {/* Total Amount */}
                <motion.div 
                  className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-green/10"></div>
                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-neon-blue" />
                      <span className="text-sm text-neon-blue font-semibold">Total Amount</span>
                    </div>
                    <span className="text-2xl font-bold font-mono text-neon-blue">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>

                {/* Wallet Balance */}
                <motion.div 
                  className="flex justify-between items-center mb-6 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-gray-600 dark:text-gray-400">Wallet Balance:</span>
                  <span className="font-mono font-semibold text-neon-green">
                    ₹{user?.walletBalance.toLocaleString()}
                  </span>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  onClick={handleTrade}
                  disabled={
                    isProcessing || 
                    quantityNum <= 0 || 
                    (type === 'buy' && !canAfford) ||
                    (type === 'sell' && !canSell)
                  }
                  className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 ${
                    type === 'buy'
                      ? 'bg-gradient-to-r from-neon-green to-green-400 hover:shadow-neon-green/30'
                      : 'bg-gradient-to-r from-neon-red to-red-400 hover:shadow-neon-red/30'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `${type === 'buy' ? 'Buy' : 'Sell'} ${quantityNum} Share${quantityNum !== 1 ? 's' : ''}`
                  )}
                </motion.button>

                {/* Error Messages */}
                <AnimatePresence>
                  {type === 'buy' && quantityNum > 0 && !canAfford && (
                    <motion.p 
                      className="text-neon-red text-sm mt-3 text-center font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      Insufficient wallet balance
                    </motion.p>
                  )}
                  {type === 'sell' && quantityNum > 0 && !canSell && (
                    <motion.p 
                      className="text-neon-red text-sm mt-3 text-center font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      Insufficient shares to sell
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="fixed top-4 right-4 glass-card rounded-2xl px-6 py-4 shadow-neon-green/30 z-50"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-neon-green font-semibold">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TradingModal;