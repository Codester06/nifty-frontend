import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  X,
  Edit3,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import type { Portfolio as PortfolioPosition } from '@/shared/types/types';
import type { PortfolioStock, PortfolioOption } from '@/features/trading/types';

interface PositionCardProps {
  position: PortfolioPosition | PortfolioStock | PortfolioOption;
  variant?: 'compact' | 'detailed';
  onClose?: (positionId: string) => void;
  onEdit?: (positionId: string) => void;
  className?: string;
}

const PositionCard: React.FC<PositionCardProps> = ({
  position,
  variant = 'detailed',
  onClose,
  onEdit,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Determine position type and extract common properties
  const isOption = 'optionDetails' in position || 'optionType' in position;
  const isStock = !isOption;
  
  // Extract common properties with fallbacks
  const symbol = position.symbol;
  const quantity = position.quantity;
  const avgPrice = 'avgPrice' in position ? position.avgPrice : 
                   'averagePrice' in position ? position.averagePrice : 0;
  const currentPrice = position.currentPrice;
  const coinInvested = position.coinInvested || 0;
  const currentCoinValue = position.currentCoinValue || 0;
  const coinPnL = position.coinPnL || 0;
  const coinPnLPercent = position.coinPnLPercent || 0;
  
  // Calculate P&L
  const currentValue = quantity * currentPrice;
  const investedValue = quantity * avgPrice;
  const pnl = currentValue - investedValue;
  const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
  const isProfit = pnl >= 0;
  const isCoinProfit = coinPnL >= 0;

  // Option-specific properties
  let optionDetails = null;
  let daysToExpiry = 0;
  let isCall = true;
  let lotSize = 1;
  let status = 'OPEN';

  if (isOption) {
    if ('optionDetails' in position && position.optionDetails) {
      optionDetails = position.optionDetails;
      isCall = optionDetails.optionType === 'CE';
      lotSize = optionDetails.lotSize;
    } else if ('optionType' in position) {
      const optionPos = position as PortfolioOption;
      isCall = optionPos.optionType === 'CE';
      lotSize = optionPos.lotSize;
      status = optionPos.status;
      
      if (optionPos.expiry) {
        daysToExpiry = Math.ceil((new Date(optionPos.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      }
    }
  }

  const handleClose = async () => {
    if (!onClose) return;
    
    setIsClosing(true);
    try {
      const positionId = 'id' in position ? position.id : symbol;
      await onClose(positionId);
    } catch (error) {
      console.error('Failed to close position:', error);
    } finally {
      setIsClosing(false);
      setShowActions(false);
    }
  };

  const handleEdit = () => {
    if (!onEdit) return;
    const positionId = 'id' in position ? position.id : symbol;
    onEdit(positionId);
    setShowActions(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className={`font-bold text-xs ${
                isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isOption ? (isCall ? 'CE' : 'PE') : symbol.slice(0, 2)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {isOption && 'strike' in position ? `${symbol} ${position.strike}` : symbol}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {coinInvested.toLocaleString()} coins
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {currentCoinValue.toLocaleString()}
            </p>
            <div className={`flex items-center space-x-1 text-xs ${
              isCoinProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isCoinProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isCoinProfit ? '+' : ''}{coinPnLPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 ${
      status === 'CLOSED' ? 'opacity-60' : ''
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isOption 
              ? (isCall ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')
              : (isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')
          }`}>
            <span className={`font-bold text-sm ${
              isOption 
                ? (isCall ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                : (isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
            }`}>
              {isOption ? (isCall ? 'CE' : 'PE') : symbol.slice(0, 2)}
            </span>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {isOption && 'strike' in position 
                ? `${symbol} ${position.strike} ${isCall ? 'CE' : 'PE'}`
                : symbol
              }
            </h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {quantity} {isOption ? 'lots' : 'shares'} • Avg: ₹{avgPrice.toFixed(2)}
              </span>
              {isOption && daysToExpiry > 0 && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{daysToExpiry}d to expiry</span>
                </div>
              )}
              {status === 'CLOSED' && (
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  Closed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-10">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 rounded-t-xl"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Position</span>
                </button>
              )}
              {onClose && status === 'OPEN' && (
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 rounded-b-xl disabled:opacity-50"
                >
                  {isClosing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>Closing...</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Close Position</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Investment Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Invested</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ₹{investedValue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {coinInvested.toLocaleString()} coins
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ₹{currentValue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {currentCoinValue.toLocaleString()} coins
          </p>
        </div>
      </div>

      {/* P&L Display */}
      <div className="space-y-3">
        {/* Rupee P&L */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rupee P&L</span>
          <div className={`flex items-center space-x-2 ${
            isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="font-bold">
              {isProfit ? '+' : ''}₹{Math.abs(pnl).toFixed(2)}
            </span>
            <span className="text-sm">
              ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Coin P&L */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-900">₹</span>
            </div>
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Coin P&L</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            isCoinProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isCoinProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="font-bold">
              {isCoinProfit ? '+' : ''}{Math.abs(coinPnL).toLocaleString()} coins
            </span>
            <span className="text-sm">
              ({isCoinProfit ? '+' : ''}{coinPnLPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Option Greeks */}
      {isOption && 'greeks' in position && position.greeks && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Greeks</h5>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Delta</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {position.greeks.delta.toFixed(3)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Gamma</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {position.greeks.gamma.toFixed(3)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Theta</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {position.greeks.theta.toFixed(3)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Vega</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {position.greeks.vega.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Warning for Options */}
      {isOption && daysToExpiry <= 7 && daysToExpiry > 0 && status === 'OPEN' && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
              Expiring Soon
            </span>
          </div>
          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
            This option expires in {daysToExpiry} day{daysToExpiry !== 1 ? 's' : ''}. Consider closing or rolling the position.
          </p>
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default PositionCard;