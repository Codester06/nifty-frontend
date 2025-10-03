import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Zap, DollarSign, Target, Calendar, TrendingUp as CallIcon, TrendingDown as PutIcon, Coins, AlertTriangle } from 'lucide-react';
import { Stock, OptionContract } from '@/shared/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { validateOrder, isMarketOpen, type OrderValidationRequest } from '@/shared/utils/orderValidation';
import OptionsOrderForm from '../options/OptionsOrderForm';
import { tradingService } from '@/features/trading/services/tradingService';
import OrderPreview from './OrderPreview';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock;
  type: 'buy' | 'sell';
  instrumentType: 'stock' | 'option';
  optionContract?: OptionContract;
  orderType?: 'market' | 'limit';
  onTradeComplete?: (trade: any) => void;
}

const TradingModal = ({ 
  isOpen, 
  onClose, 
  stock, 
  type, 
  instrumentType = 'stock',
  optionContract,
  orderType = 'market',
  onTradeComplete
}: TradingModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [currentOrderType, setCurrentOrderType] = useState<'market' | 'limit'>(orderType);
  const [limitPrice, setLimitPrice] = useState<number | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { 
    user, 
    updateUser, 
    addTransaction, 
    portfolio, 
    refreshWalletBalance
  } = useAuth();

  const quantityNum = quantity;
  
  // Calculate total amount based on instrument type
  const effectivePrice = instrumentType === 'option' && optionContract
    ? (currentOrderType === 'limit' && limitPrice ? limitPrice : optionContract.ltp)
    : stock?.price || 0;
    
  const totalAmount = instrumentType === 'option' && optionContract
    ? quantityNum * effectivePrice * optionContract.lotSize
    : stock ? quantityNum * stock.price : 0;
    
  // Calculate wallet cost (direct rupee amount)
  const walletCost = totalAmount;
  const canAfford = user ? user.walletBalance >= walletCost : false;
  
  const portfolioStock = stock ? portfolio.find(p => p.symbol === stock.symbol) : null;
  const availableShares = portfolioStock?.quantity || 0;
  const canSell = type === 'sell' && quantityNum <= availableShares;

  // Validation for options
  const isValidLotSize = instrumentType === 'option' && optionContract
    ? quantityNum % 1 === 0 && quantityNum > 0 // Quantity should be in whole lots
    : true;

  const displayName = instrumentType === 'option' && optionContract
    ? `${optionContract.underlying} ${optionContract.strike} ${optionContract.optionType}`
    : stock?.name || '';

  const displayPrice = instrumentType === 'option' && optionContract
    ? optionContract.ltp
    : stock?.price || 0;

  // Real-time order validation
  useEffect(() => {
    if (!user || quantityNum <= 0) {
      setValidationResult(null);
      return;
    }

    const validationRequest: OrderValidationRequest = {
      type,
      instrumentType,
      quantity: quantityNum,
      price: effectivePrice,
      orderType: currentOrderType,
      limitPrice,
      coinBalance: user?.walletBalance || 0, // Using wallet balance as "coins"
      stock,
      optionContract,
      availableShares
    };

    const result = validateOrder(validationRequest);
    setValidationResult(result);
  }, [
    user, 
    type, 
    instrumentType, 
    quantityNum, 
    effectivePrice, 
    currentOrderType, 
    limitPrice, 
    user?.walletBalance, 
    stock, 
    optionContract, 
    availableShares
  ]);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 2000);
  };

  const handleOrderPreview = () => {
    if (!user || quantityNum <= 0) return;
    
    // Use validation result if available
    if (validationResult && !validationResult.isValid) {
      const firstError = validationResult.errors[0];
      showToastMessage(firstError?.message || 'Order validation failed');
      return;
    }
    
    // Fallback to basic validation
    if (type === 'buy' && !canAfford) {
      showToastMessage('Insufficient wallet balance!');
      return;
    }
    
    if (instrumentType === 'stock' && type === 'sell' && !canSell) {
      showToastMessage('Insufficient shares to sell!');
      return;
    }

    if (instrumentType === 'option' && !isValidLotSize) {
      showToastMessage('Invalid lot size!');
      return;
    }

    setShowOrderPreview(true);
  };

  const handleTrade = async () => {
    if (!user || quantityNum <= 0) return;

    setIsProcessing(true);

    try {
      const tradeData = {
        userId: user.id,
        asset: instrumentType === 'option' && optionContract ? optionContract.symbol : stock?.symbol,
        action: type.toUpperCase(),
        quantity: quantityNum,
        price: displayPrice,
        amount: totalAmount,
        instrumentType,
        ...(instrumentType === 'option' && optionContract ? {
          optionDetails: {
            strike: optionContract.strike,
            expiry: optionContract.expiry,
            optionType: optionContract.optionType,
            premium: optionContract.ltp,
            lotSize: optionContract.lotSize,
          }
        } : {}),
        status: 'Completed',
      };

      if (type === 'buy') {
        // Deduct from wallet balance for buy order
        updateUser({ walletBalance: user.walletBalance - totalAmount });
      } else {
        // Add to wallet balance for sell order
        updateUser({ walletBalance: user.walletBalance + totalAmount });
      }
        
      const transactionData = {
        type: type as const,
        quantity: quantityNum,
        amount: totalAmount,
        instrumentType,
        ...(instrumentType === 'option' && optionContract ? {
          stockSymbol: optionContract.symbol,
          stockName: displayName,
          price: optionContract.ltp,
          optionDetails: {
            strike: optionContract.strike,
            expiry: optionContract.expiry,
            optionType: optionContract.optionType,
            premium: optionContract.ltp,
            lotSize: optionContract.lotSize,
          }
        } : stock ? {
          stockSymbol: stock.symbol,
          stockName: stock.name,
          price: stock.price,
        } : {})
      };

      addTransaction(transactionData);

      // Backend trade creation
      try {
        await tradingService.createTrade(tradeData);
      } catch {
        /* ignore for now */
      }
        
      const successMessage = instrumentType === 'option' 
          ? `Successfully ${type} ${quantityNum} lot${quantityNum !== 1 ? 's' : ''} of ${displayName} for ₹${totalAmount.toLocaleString()}!`
          : `Successfully ${type} ${quantityNum} shares of ${stock?.name} for ₹${totalAmount.toLocaleString()}!`;
      showToastMessage(successMessage);

      // Call onTradeComplete callback if provided
      if (onTradeComplete) {
        onTradeComplete({
          type,
          instrumentType,
          symbol: instrumentType === 'option' && optionContract ? optionContract.symbol : stock?.symbol,
          quantity: quantityNum,
          price: effectivePrice,
          amount: totalAmount,
          totalAmount
        });
      }
      
      setIsProcessing(false);
      setQuantity(1);
      setShowOrderPreview(false);
      refreshWalletBalance();
    } catch (error) {
      console.error('Trade execution error:', error);
      showToastMessage('Trade execution failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const isPositive = stock ? stock.change > 0 : false;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl w-full max-w-md mx-4 overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/50"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${
                      type === 'buy' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {instrumentType === 'option' ? (
                        optionContract?.optionType === 'CE' ? <CallIcon className="h-5 w-5" /> : <PutIcon className="h-5 w-5" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {type === 'buy' ? 'Buy' : 'Sell'} {displayName}
                    </h2>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 glass-button rounded-xl hover:shadow-neon-red/20 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                {instrumentType === 'option' && optionContract ? (
                  /* Options Order Form */
                  <OptionsOrderForm
                    optionContract={optionContract}
                    type={type}
                    onQuantityChange={setQuantity}
                    onOrderTypeChange={setCurrentOrderType}
                    quantity={quantityNum}
                    orderType={currentOrderType}
                    limitPrice={limitPrice}
                    onLimitPriceChange={setLimitPrice}
                    walletBalance={user?.walletBalance || 0}
                    className="mb-6"
                  />
                ) : (
                  /* Stock Trading Form */
                  <>
                    {/* Stock Info */}
                    <motion.div 
                      className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                            ₹{displayPrice.toLocaleString()}
                          </span>
                          {stock && (
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
                          )}
                        </div>
                        {stock && <p className="text-sm text-gray-600 dark:text-gray-400">{stock.fullName}</p>}
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
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        min="1"
                        max={type === 'sell' ? availableShares : undefined}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all duration-300"
                        placeholder="Enter quantity"
                      />
                      {type === 'sell' && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-mono">
                          Available: {availableShares} shares
                        </p>
                      )}
                    </motion.div>

                    {/* Coin Cost */}
                    <motion.div 
                      className="glass-card rounded-2xl p-4 mb-6 relative overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 dark:from-blue-400/15 dark:to-green-400/15"></div>
                      <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-neon-blue" />
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Total Amount</span>
                          </div>
                          <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                            ₹{totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Coins className="h-5 w-5 text-neon-green" />
                            <span className="text-sm text-neon-green font-semibold">Wallet Cost</span>
                          </div>
                          <span className="text-2xl font-bold font-mono text-neon-green">
                            ₹{walletCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Wallet Balance */}
                    <motion.div 
                      className="flex justify-between items-center mb-6 text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="text-gray-700 dark:text-gray-300">Wallet Balance:</span>
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                        ₹{user?.walletBalance.toLocaleString()}
                      </span>
                    </motion.div>

                    {/* Market Status & Validation Warnings */}
                    <AnimatePresence>
                      {!isMarketOpen() && (
                        <motion.div 
                          className="glass-card rounded-2xl p-3 mb-4 relative overflow-hidden border border-yellow-500/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"></div>
                          <div className="relative flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <div>
                              <p className="text-yellow-500 font-semibold text-sm">Market Closed</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Trading hours: 09:15 AM - 03:30 PM IST
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {validationResult?.warnings && validationResult.warnings.length > 0 && (
                        <motion.div 
                          className="glass-card rounded-2xl p-3 mb-4 relative overflow-hidden border border-yellow-500/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                              <p className="text-yellow-500 font-semibold text-sm">Order Warnings</p>
                            </div>
                            {validationResult.warnings.map((warning: any, index: number) => (
                              <p key={index} className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                                {warning.message}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Action Button */}
                <motion.button
                  onClick={handleOrderPreview}
                  disabled={
                    isProcessing || 
                    quantityNum <= 0 || 
                    (validationResult && !validationResult.isValid)
                  }
                  className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 ${
                    type === 'buy'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-green-500/30'
                      : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-red-500/30'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {instrumentType === 'option' ? (
                    `Preview ${type === 'buy' ? 'Buy' : 'Sell'} ${quantityNum} Lot${quantityNum !== 1 ? 's' : ''}`
                  ) : (
                    `Preview ${type === 'buy' ? 'Buy' : 'Sell'} ${quantityNum} Share${quantityNum !== 1 ? 's' : ''}`
                  )}
                </motion.button>

                {/* Error Messages */}
                <AnimatePresence>
                  {validationResult?.errors && validationResult.errors.length > 0 && (
                    <motion.div 
                      className="mt-3 space-y-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {validationResult.errors.map((error: any, index: number) => (
                        <p key={index} className="text-neon-red text-sm text-center font-semibold">
                          {error.message}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Preview Modal */}
      <OrderPreview
        isOpen={showOrderPreview}
        onClose={() => setShowOrderPreview(false)}
        onConfirm={handleTrade}
        orderDetails={{
          type,
          instrumentType,
          symbol: instrumentType === 'option' && optionContract ? optionContract.symbol : stock?.symbol || '',
          name: displayName,
          quantity: quantityNum,
          price: effectivePrice,
          totalAmount: validationResult?.totalAmount || totalAmount,
          coinCost: validationResult?.coinCost || walletCost,
          orderType: currentOrderType,
          limitPrice,
          ...(instrumentType === 'option' && optionContract ? {
            optionDetails: {
              strike: optionContract.strike,
              expiry: optionContract.expiry,
              optionType: optionContract.optionType,
              lotSize: optionContract.lotSize
            }
          } : {})
        }}
        coinBalance={user?.walletBalance || 0}
        isProcessing={isProcessing}
        validationResult={validationResult}
      />

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
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-semibold">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TradingModal;