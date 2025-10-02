import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, CreditCard, Smartphone, Building2, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { coinService } from '@/shared/services/coinService';
import { COIN_CONSTANTS, type CoinPurchaseRequest, type PaymentDetails } from '@/shared/types/coin';

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: (amount: number) => void;
}

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  discount?: number;
}

const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'starter',
    coins: 1000,
    price: 100,
    bonus: 0
  },
  {
    id: 'basic',
    coins: 5000,
    price: 450,
    bonus: 500,
    discount: 10
  },
  {
    id: 'premium',
    coins: 10000,
    price: 800,
    bonus: 2000,
    popular: true,
    discount: 20
  },
  {
    id: 'pro',
    coins: 25000,
    price: 1800,
    bonus: 7000,
    discount: 28
  },
  {
    id: 'ultimate',
    coins: 50000,
    price: 3200,
    bonus: 18000,
    discount: 36
  }
];

type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING';

const CoinPurchaseModal: React.FC<CoinPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchaseComplete
}) => {
  const { user, coinBalance, refreshCoinBalance } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Payment form state
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankAccount: '',
    ifscCode: ''
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSelectedPackage(null);
      setSelectedPaymentMethod(null);
      setShowPaymentForm(false);
      setError(null);
      setSuccess(null);
      setPaymentDetails({
        upiId: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        bankAccount: '',
        ifscCode: ''
      });
    }
  }, [isOpen]);

  const handlePackageSelect = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setError(null);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowPaymentForm(true);
    setError(null);
  };

  const handleBackToPackages = () => {
    setShowPaymentForm(false);
    setSelectedPaymentMethod(null);
    setError(null);
  };

  const validatePaymentDetails = (): boolean => {
    if (!selectedPaymentMethod) return false;

    switch (selectedPaymentMethod) {
      case 'UPI':
        if (!paymentDetails.upiId.trim()) {
          setError('Please enter a valid UPI ID');
          return false;
        }
        if (!paymentDetails.upiId.includes('@')) {
          setError('Please enter a valid UPI ID (e.g., user@paytm)');
          return false;
        }
        break;
      case 'CARD':
        if (!paymentDetails.cardNumber.trim() || paymentDetails.cardNumber.length < 16) {
          setError('Please enter a valid card number');
          return false;
        }
        if (!paymentDetails.expiryDate.trim()) {
          setError('Please enter card expiry date');
          return false;
        }
        if (!paymentDetails.cvv.trim() || paymentDetails.cvv.length < 3) {
          setError('Please enter a valid CVV');
          return false;
        }
        if (!paymentDetails.cardholderName.trim()) {
          setError('Please enter cardholder name');
          return false;
        }
        break;
      case 'NET_BANKING':
        if (!paymentDetails.bankAccount.trim()) {
          setError('Please enter bank account number');
          return false;
        }
        if (!paymentDetails.ifscCode.trim()) {
          setError('Please enter IFSC code');
          return false;
        }
        break;
    }

    return true;
  };

  const handlePurchase = async () => {
    if (!user || !selectedPackage || !selectedPaymentMethod) return;

    if (!validatePaymentDetails()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentDetailsObj: PaymentDetails = {
        paymentId,
        amount: selectedPackage.price,
        currency: 'INR',
        gateway: 'demo_gateway',
        transactionId: `txn_${Date.now()}`
      };

      const purchaseRequest: CoinPurchaseRequest = {
        userId: user.id,
        amount: selectedPackage.coins + (selectedPackage.bonus || 0),
        paymentMethod: selectedPaymentMethod,
        paymentDetails: paymentDetailsObj
      };

      const result = await coinService.purchaseCoins(purchaseRequest);

      if (result.success && result.data) {
        setSuccess(`Successfully purchased ${purchaseRequest.amount} coins!`);
        
        // Refresh coin balance
        await refreshCoinBalance();
        
        // Call completion callback
        if (onPurchaseComplete) {
          onPurchaseComplete(purchaseRequest.amount);
        }

        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error?.message || 'Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateTotalCoins = (pkg: CoinPackage) => {
    return pkg.coins + (pkg.bonus || 0);
  };

  const renderPackageSelection = () => (
    <div className="space-y-6">
      {/* Current Balance */}
      <motion.div 
        className="glass-card rounded-2xl p-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Coins className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {coinBalance.toLocaleString()} coins
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Package Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose a Coin Package
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COIN_PACKAGES.map((pkg, index) => (
            <motion.button
              key={pkg.id}
              onClick={() => handlePackageSelect(pkg)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                selectedPackage?.id === pkg.id
                  ? 'border-neon-blue bg-neon-blue/10 shadow-neon-blue/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-neon-blue/50 bg-white dark:bg-gray-800'
              } ${pkg.popular ? 'ring-2 ring-neon-green/50' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-neon-green text-black text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pkg.coins.toLocaleString()}
                  </span>
                  {pkg.discount && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {pkg.discount}% OFF
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">coins</p>
                
                {pkg.bonus && pkg.bonus > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded">
                      +{pkg.bonus.toLocaleString()} bonus
                    </span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-neon-blue">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {calculateTotalCoins(pkg).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      {selectedPackage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Selected Package:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedPackage.coins.toLocaleString()} coins
              </span>
            </div>
            {selectedPackage.bonus && selectedPackage.bonus > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Bonus:</span>
                <span className="font-semibold text-neon-green">
                  +{selectedPackage.bonus.toLocaleString()} coins
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-900 dark:text-white">Total:</span>
              <span className="text-neon-blue">
                {calculateTotalCoins(selectedPackage).toLocaleString()} coins
              </span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Payment Method
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'UPI', label: 'UPI', icon: Smartphone },
              { id: 'CARD', label: 'Card', icon: CreditCard },
              { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 }
            ].map((method) => {
              const IconComponent = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method.id as PaymentMethod)}
                  className="p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-neon-blue/50 bg-white dark:bg-gray-800 transition-all duration-300 flex flex-col items-center space-y-2"
                >
                  <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBackToPackages}
        className="text-neon-blue hover:text-neon-blue/80 text-sm font-medium"
      >
        ← Back to packages
      </button>

      {/* Selected Package Summary */}
      {selectedPackage && (
        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Coins:</span>
              <span className="text-gray-900 dark:text-white">{selectedPackage.coins.toLocaleString()}</span>
            </div>
            {selectedPackage.bonus && selectedPackage.bonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bonus:</span>
                <span className="text-neon-green">+{selectedPackage.bonus.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-900 dark:text-white">Total:</span>
              <span className="text-neon-blue">{formatPrice(selectedPackage.price)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedPaymentMethod} Payment Details
        </h3>

        {selectedPaymentMethod === 'UPI' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={paymentDetails.upiId}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
              placeholder="user@paytm"
              className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
            />
          </div>
        )}

        {selectedPaymentMethod === 'CARD' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={paymentDetails.cardholderName}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>
          </div>
        )}

        {selectedPaymentMethod === 'NET_BANKING' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Account Number
              </label>
              <input
                type="text"
                value={paymentDetails.bankAccount}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="1234567890"
                className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={paymentDetails.ifscCode}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, ifscCode: e.target.value }))}
                placeholder="SBIN0001234"
                className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
              />
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <motion.button
          onClick={handlePurchase}
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-neon-green to-green-400 hover:shadow-neon-green/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          whileTap={{ scale: isProcessing ? 1 : 0.98 }}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Payment...</span>
            </div>
          ) : (
            `Pay ${selectedPackage ? formatPrice(selectedPackage.price) : ''}`
          )}
        </motion.button>
      </div>
    </div>
  );

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
          className="glass-card rounded-3xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
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
                <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-500">
                  <Coins className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Purchase Coins
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

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 p-4 glass-card rounded-2xl border border-red-500/30 bg-red-500/10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-red-500 font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  className="mb-4 p-4 glass-card rounded-2xl border border-green-500/30 bg-green-500/10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-500 font-medium">{success}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {!showPaymentForm ? renderPackageSelection() : renderPaymentForm()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoinPurchaseModal;