import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Coins, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface OrderDetails {
  type: 'buy' | 'sell';
  instrumentType: 'stock' | 'option';
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  totalAmount: number;
  coinCost: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
  optionDetails?: {
    strike: number;
    expiry: string;
    optionType: 'CE' | 'PE';
    lotSize: number;
  };
}

interface OrderPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderDetails: OrderDetails;
  coinBalance: number;
  isProcessing?: boolean;
  validationResult?: any;
}

const OrderPreview = ({
  isOpen,
  onClose,
  onConfirm,
  orderDetails,
  coinBalance,
  isProcessing = false,
  validationResult
}: OrderPreviewProps) => {
  const {
    type,
    instrumentType,
    symbol,
    name,
    quantity,
    price,
    totalAmount,
    coinCost,
    orderType,
    limitPrice,
    optionDetails
  } = orderDetails;

  const hasSufficientBalance = validationResult?.canAfford ?? (coinBalance >= coinCost);
  const balanceAfterTrade = type === 'buy' 
    ? coinBalance - coinCost 
    : coinBalance + coinCost;
  
  const hasValidationErrors = validationResult?.errors && validationResult.errors.length > 0;
  const hasValidationWarnings = validationResult?.warnings && validationResult.warnings.length > 0;

  const formatExpiry = (expiry: string) => {
    try {
      return new Date(expiry).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return expiry;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card rounded-3xl w-full max-w-lg mx-4 overflow-hidden"
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
                    {type === 'buy' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Order Preview
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review your {type} order details
                    </p>
                  </div>
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
              {/* Order Summary */}
              <motion.div 
                className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {name}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {symbol}
                    </span>
                  </div>
                  
                  {instrumentType === 'option' && optionDetails && (
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Strike:</span>
                        <span className="ml-2 font-mono text-gray-900 dark:text-white">
                          ₹{optionDetails.strike}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Expiry:</span>
                        <span className="ml-2 font-mono text-gray-900 dark:text-white">
                          {formatExpiry(optionDetails.expiry)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className={`ml-2 font-semibold ${
                          optionDetails.optionType === 'CE' ? 'text-neon-green' : 'text-neon-red'
                        }`}>
                          {optionDetails.optionType === 'CE' ? 'Call' : 'Put'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Lot Size:</span>
                        <span className="ml-2 font-mono text-gray-900 dark:text-white">
                          {optionDetails.lotSize}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-white">
                        {quantity} {instrumentType === 'option' ? 'lot(s)' : 'share(s)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-white">
                        ₹{price.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Order Type:</span>
                      <span className="ml-2 font-semibold text-neon-blue capitalize">
                        {orderType}
                        {orderType === 'limit' && limitPrice && ` @ ₹${limitPrice.toFixed(2)}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Action:</span>
                      <span className={`ml-2 font-semibold capitalize ${
                        type === 'buy' ? 'text-neon-green' : 'text-neon-red'
                      }`}>
                        {type}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Financial Summary */}
              <motion.div 
                className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-neon-blue/5"></div>
                <div className="relative">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Financial Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      </div>
                      <span className="font-mono text-gray-900 dark:text-white">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-neon-green" />
                        <span className="text-neon-green font-semibold">
                          {type === 'buy' ? 'Amount Required:' : 'Amount to Receive:'}
                        </span>
                      </div>
                      <span className="font-mono text-neon-green font-bold">
                        ₹{coinCost.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          ₹{coinBalance.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Balance After Trade:</span>
                        <span className={`font-mono font-bold ${
                          balanceAfterTrade >= 0 ? 'text-neon-green' : 'text-neon-red'
                        }`}>
                          ₹{balanceAfterTrade.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Validation Errors */}
              <AnimatePresence>
                {hasValidationErrors && (
                  <motion.div 
                    className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden border border-neon-red/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-red/10 to-red-500/10"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-neon-red flex-shrink-0" />
                        <p className="text-neon-red font-semibold">Order Validation Errors</p>
                      </div>
                      <div className="space-y-1 ml-8">
                        {validationResult.errors.map((error: any, index: number) => (
                          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            {error.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Validation Warnings */}
              <AnimatePresence>
                {hasValidationWarnings && (
                  <motion.div 
                    className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden border border-yellow-500/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.35 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        <p className="text-yellow-500 font-semibold">Order Warnings</p>
                      </div>
                      <div className="space-y-1 ml-8">
                        {validationResult.warnings.map((warning: any, index: number) => (
                          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            {warning.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Market Hours Warning */}
              <motion.div 
                className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden border border-neon-blue/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-blue-500/10"></div>
                <div className="relative flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-neon-blue flex-shrink-0" />
                  <div>
                    <p className="text-neon-blue font-semibold">Market Hours</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Trading is available from 09:15 AM to 03:30 PM IST
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 glass-button rounded-xl text-gray-600 dark:text-gray-400 font-semibold hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={onConfirm}
                  disabled={isProcessing || hasValidationErrors || (type === 'buy' && !hasSufficientBalance)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 ${
                    type === 'buy'
                      ? 'bg-gradient-to-r from-neon-green to-green-400 hover:shadow-neon-green/30'
                      : 'bg-gradient-to-r from-neon-red to-red-400 hover:shadow-neon-red/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirm {type === 'buy' ? 'Purchase' : 'Sale'}</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderPreview;