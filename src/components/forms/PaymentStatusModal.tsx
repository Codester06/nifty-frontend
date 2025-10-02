import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X, Copy, ExternalLink } from 'lucide-react';

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'failed' | 'pending';
  title: string;
  message: string;
  transactionId?: string;
  amount?: number;
  coinAmount?: number;
  newBalance?: number;
  errorCode?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  title,
  message,
  transactionId,
  amount,
  coinAmount,
  newBalance,
  errorCode,
  onRetry,
  showRetryButton = false
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyTransactionId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'failed':
        return 'border-red-500/30 bg-red-500/10';
      case 'pending':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'failed':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-card rounded-3xl w-full max-w-md mx-4"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <div className={`absolute inset-0 ${getStatusColor()} rounded-t-3xl`}></div>
            <div className="relative flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
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

          {/* Content */}
          <div className="p-6 text-center">
            {/* Status Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {getStatusIcon()}
            </motion.div>

            {/* Message */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {message}
              </p>
            </motion.div>

            {/* Transaction Details */}
            {(amount || coinAmount || newBalance || transactionId) && (
              <motion.div
                className="glass-card rounded-2xl p-4 mb-6 text-left"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Transaction Details
                </h3>
                <div className="space-y-2 text-sm">
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {coinAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coins:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {coinAmount.toLocaleString()} coins
                      </span>
                    </div>
                  )}
                  {newBalance !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">New Balance:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {newBalance.toLocaleString()} coins
                      </span>
                    </div>
                  )}
                  {transactionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-gray-900 dark:text-white">
                          {transactionId.slice(0, 12)}...
                        </span>
                        <button
                          onClick={copyTransactionId}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Copy Transaction ID"
                        >
                          <Copy className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  {errorCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Error Code:</span>
                      <span className="font-mono text-xs text-red-600 dark:text-red-400">
                        {errorCode}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Copy Success Message */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  className="mb-4 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  Transaction ID copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {showRetryButton && onRetry && status === 'failed' && (
                <motion.button
                  onClick={onRetry}
                  className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-2xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
              )}
              
              <motion.button
                onClick={onClose}
                className={`w-full py-3 px-6 ${getButtonColor()} text-white font-medium rounded-2xl transition-colors`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {status === 'success' ? 'Continue' : 'Close'}
              </motion.button>

              {status === 'success' && (
                <motion.button
                  onClick={() => {
                    // In a real app, this might navigate to transaction history
                    onClose();
                  }}
                  className="w-full py-2 px-6 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>View Transaction History</span>
                  <ExternalLink className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentStatusModal;