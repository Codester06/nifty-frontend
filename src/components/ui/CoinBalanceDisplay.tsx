import React, { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { COIN_CONSTANTS } from '@/shared/types/coin';
import { CoinPurchaseModal } from '@/components/forms';

interface CoinBalanceDisplayProps {
  variant?: 'navbar' | 'dashboard' | 'compact';
  showPurchaseButton?: boolean;
  onPurchaseClick?: () => void;
  className?: string;
}

const CoinBalanceDisplay: React.FC<CoinBalanceDisplayProps> = ({
  variant = 'navbar',
  showPurchaseButton = true,
  onPurchaseClick,
  className = ''
}) => {
  const { coinBalance, coinLoading, user } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const isMobile = useIsMobile();

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Format coin balance with commas
  const formatCoinBalance = (balance: number): string => {
    return new Intl.NumberFormat('en-IN').format(balance);
  };

  // Check if balance is low (less than 1000 coins)
  const isLowBalance = coinBalance < 1000;

  const handlePurchaseClick = () => {
    if (onPurchaseClick) {
      onPurchaseClick();
    } else {
      setShowPurchaseModal(true);
    }
  };

  const handlePurchaseComplete = (amount: number) => {
    setShowPurchaseModal(false);
    // Balance will be automatically updated by the auth context
  };

  // Render loading state
  if (coinLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-16"></div>
        </div>
        {variant !== 'compact' && (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-12"></div>
          </div>
        )}
      </div>
    );
  }

  // Navbar variant - compact display for navigation
  if (variant === 'navbar') {
    return (
      <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'} ${className}`}>
        <div className="flex items-center space-x-1">
          <div className={`bg-yellow-500 rounded-full flex items-center justify-center ${
            isMobile ? 'w-3 h-3' : 'w-4 h-4'
          }`}>
            <span className={`font-bold text-black ${isMobile ? 'text-xs' : 'text-xs'}`}>₹</span>
          </div>
          <span className={`font-medium ${isLowBalance ? 'text-red-400' : 'text-gray-700 dark:text-gray-200'} ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            {isMobile ? formatCoinBalance(coinBalance).replace(',', 'K').replace('000', '') : formatCoinBalance(coinBalance)}
          </span>
        </div>
        {showPurchaseButton && (
          <button
            onClick={handlePurchaseClick}
            className={`bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${
              isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
            }`}
            title="Purchase more coins"
          >
            +
          </button>
        )}
      </div>
    );
  }

  // Dashboard variant - detailed display with more information
  if (variant === 'dashboard') {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg ${isMobile ? 'p-3' : 'p-4'} ${className}`}>
        <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <div className={`flex items-center ${isMobile ? 'justify-center' : ''} space-x-2 mb-1`}>
              <div className={`bg-yellow-500 rounded-full flex items-center justify-center ${
                isMobile ? 'w-5 h-5' : 'w-6 h-6'
              }`}>
                <span className={`font-bold text-black ${isMobile ? 'text-xs' : 'text-sm'}`}>₹</span>
              </div>
              <h3 className={`font-semibold text-gray-900 dark:text-white ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>Coin Balance</h3>
            </div>
            <div className={`flex items-baseline ${isMobile ? 'justify-center' : ''} space-x-2`}>
              <span className={`font-bold ${isLowBalance ? 'text-red-400' : 'text-green-400'} ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                {formatCoinBalance(coinBalance)}
              </span>
              <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>coins</span>
            </div>
            {isLowBalance && (
              <div className={`mt-2 flex items-center ${isMobile ? 'justify-center' : ''} space-x-1`}>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-400">
                  {isMobile ? 'Low balance' : 'Low balance - consider purchasing more coins'}
                </span>
              </div>
            )}
          </div>
          {showPurchaseButton && (
            <button
              onClick={handlePurchaseClick}
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium ${
                isMobile ? 'px-3 py-1.5 text-sm w-full' : 'px-4 py-2'
              }`}
            >
              Buy Coins
            </button>
          )}
        </div>
      </div>
    );
  }

  // Compact variant - minimal display
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-black">₹</span>
        </div>
        <span className={`text-sm ${isLowBalance ? 'text-red-400' : 'text-gray-300'}`}>
          {formatCoinBalance(coinBalance)}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Purchase Modal */}
      <CoinPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </>
  );
};

export default CoinBalanceDisplay;