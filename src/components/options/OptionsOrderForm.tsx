import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Calendar, DollarSign, Info } from 'lucide-react';
import { OptionContract } from '@/shared/types';

interface OptionsOrderFormProps {
  optionContract: OptionContract;
  type: 'buy' | 'sell';
  onQuantityChange: (quantity: number) => void;
  onOrderTypeChange: (orderType: 'market' | 'limit') => void;
  quantity: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
  onLimitPriceChange?: (price: number) => void;
  walletBalance: number;
  className?: string;
}

const OptionsOrderForm = ({
  optionContract,
  type,
  onQuantityChange,
  onOrderTypeChange,
  quantity,
  orderType,
  limitPrice,
  onLimitPriceChange,
  walletBalance,
  className = ''
}: OptionsOrderFormProps) => {
  const [localQuantity, setLocalQuantity] = useState(quantity.toString());
  const [localLimitPrice, setLocalLimitPrice] = useState(limitPrice?.toString() || '');

  useEffect(() => {
    setLocalQuantity(quantity.toString());
  }, [quantity]);

  useEffect(() => {
    setLocalLimitPrice(limitPrice?.toString() || '');
  }, [limitPrice]);

  const handleQuantityChange = (value: string) => {
    setLocalQuantity(value);
    const numValue = parseInt(value) || 0;
    onQuantityChange(numValue);
  };

  const handleLimitPriceChange = (value: string) => {
    setLocalLimitPrice(value);
    const numValue = parseFloat(value) || 0;
    onLimitPriceChange?.(numValue);
  };

  const totalShares = quantity * optionContract.lotSize;
  const premiumPerShare = orderType === 'limit' && limitPrice ? limitPrice : optionContract.ltp;
  const totalPremium = quantity * premiumPerShare * optionContract.lotSize;
  const canAfford = walletBalance >= totalPremium;

  const isCallOption = optionContract.optionType === 'CE';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Option Details Header */}
      <motion.div 
        className="glass-card rounded-2xl p-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-xl ${
                isCallOption ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
              }`}>
                {isCallOption ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {optionContract.underlying} {optionContract.optionType}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isCallOption ? 'Call Option' : 'Put Option'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                ₹{optionContract.ltp.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Premium
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Strike:
              </span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                ₹{optionContract.strike}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Expiry:
              </span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {new Date(optionContract.expiry).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Lot Size:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {optionContract.lotSize}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">IV:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {(optionContract.iv * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Order Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Order Type
        </label>
        <div className="flex space-x-3">
          <button
            onClick={() => onOrderTypeChange('market')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              orderType === 'market'
                ? 'bg-neon-blue text-white shadow-neon-blue/30'
                : 'glass-card text-gray-700 dark:text-gray-300 hover:shadow-neon-blue/20'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => onOrderTypeChange('limit')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              orderType === 'limit'
                ? 'bg-neon-blue text-white shadow-neon-blue/30'
                : 'glass-card text-gray-700 dark:text-gray-300 hover:shadow-neon-blue/20'
            }`}
          >
            Limit
          </button>
        </div>
      </motion.div>

      {/* Limit Price Input (if limit order) */}
      {orderType === 'limit' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Limit Price (₹)
          </label>
          <input
            type="number"
            value={localLimitPrice}
            onChange={(e) => handleLimitPriceChange(e.target.value)}
            step="0.05"
            min="0.05"
            className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-300"
            placeholder="Enter limit price"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Current market price: ₹{optionContract.ltp}
          </p>
        </motion.div>
      )}

      {/* Quantity Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Quantity (Lots)
        </label>
        <input
          type="number"
          value={localQuantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          min="1"
          className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-300"
          placeholder="Enter lots"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-mono">
          Total shares: {totalShares.toLocaleString()} ({quantity} lot{quantity !== 1 ? 's' : ''} × {optionContract.lotSize})
        </p>
      </motion.div>

      {/* Greeks Information */}
      {optionContract.greeks && (
        <motion.div
          className="glass-card rounded-2xl p-4 relative overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-blue/5"></div>
          <div className="relative">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-4 w-4 text-neon-purple" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Greeks</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Delta:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {optionContract.greeks.delta.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Gamma:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {optionContract.greeks.gamma.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Theta:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {optionContract.greeks.theta.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vega:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {optionContract.greeks.vega.toFixed(3)}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Delta:</strong> Price sensitivity to underlying movement</p>
              <p><strong>Gamma:</strong> Rate of change of delta</p>
              <p><strong>Theta:</strong> Time decay per day</p>
              <p><strong>Vega:</strong> Sensitivity to volatility changes</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Premium Calculation */}
      <motion.div
        className="glass-card rounded-2xl p-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-green/10 to-neon-blue/10"></div>
        <div className="relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-neon-green" />
              <span className="text-sm text-neon-green font-semibold">Total Premium</span>
            </div>
            <span className="text-2xl font-bold font-mono text-neon-green">
              ₹{totalPremium.toLocaleString()}
            </span>
          </div>
          
          {quantity > 0 && (
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Premium per share:</span>
                <span className="font-mono">₹{premiumPerShare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total shares:</span>
                <span className="font-mono">{totalShares.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Calculation:</span>
                <span className="font-mono">₹{premiumPerShare.toFixed(2)} × {totalShares.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-semibold text-gray-900 dark:text-white">
                <span>Wallet Balance:</span>
                <span className={`font-mono ${canAfford ? 'text-neon-green' : 'text-neon-red'}`}>
                  ₹{walletBalance.toLocaleString()}
                </span>
              </div>
              {!canAfford && quantity > 0 && (
                <div className="text-neon-red text-center font-semibold">
                  Insufficient wallet balance
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OptionsOrderForm;