import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import type { OptionContract } from '@/shared/types';

interface OptionRowProps {
  strike: number;
  callOption: OptionContract;
  putOption: OptionContract;
  spotPrice: number;
  onOptionClick: (option: OptionContract) => void;
  isAnimating?: boolean;
}

const OptionRow: React.FC<OptionRowProps> = memo(({
  strike,
  callOption,
  putOption,
  spotPrice,
  onOptionClick,
  isAnimating = false,
}) => {
  const [hoveredOption, setHoveredOption] = useState<'call' | 'put' | null>(null);
  const [priceChanges, setPriceChanges] = useState<{
    callLtp: 'up' | 'down' | null;
    putLtp: 'up' | 'down' | null;
  }>({ callLtp: null, putLtp: null });
  
  const prevCallLtpRef = useRef<number>(callOption.ltp);
  const prevPutLtpRef = useRef<number>(putOption.ltp);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track price changes for animation
  useEffect(() => {
    const callLtpChange = callOption.ltp > prevCallLtpRef.current ? 'up' : 
                         callOption.ltp < prevCallLtpRef.current ? 'down' : null;
    const putLtpChange = putOption.ltp > prevPutLtpRef.current ? 'up' : 
                        putOption.ltp < prevPutLtpRef.current ? 'down' : null;

    if (callLtpChange || putLtpChange) {
      setPriceChanges({ callLtp: callLtpChange, putLtp: putLtpChange });
      
      // Clear animation after a short delay
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      animationTimeoutRef.current = setTimeout(() => {
        setPriceChanges({ callLtp: null, putLtp: null });
      }, 1000);
    }

    prevCallLtpRef.current = callOption.ltp;
    prevPutLtpRef.current = putOption.ltp;

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [callOption.ltp, putOption.ltp]);

  // Memoize moneyness calculation for performance
  const { callMoneyness, putMoneyness } = useMemo(() => {
    const getMoneyness = (strike: number, optionType: 'CE' | 'PE'): 'ITM' | 'ATM' | 'OTM' => {
      const diff = Math.abs(strike - spotPrice);
      
      // ATM if within 1% of spot price
      if (diff / spotPrice < 0.01) {
        return 'ATM';
      }
      
      if (optionType === 'CE') {
        return strike < spotPrice ? 'ITM' : 'OTM';
      } else {
        return strike > spotPrice ? 'ITM' : 'OTM';
      }
    };

    return {
      callMoneyness: getMoneyness(strike, 'CE'),
      putMoneyness: getMoneyness(strike, 'PE'),
    };
  }, [strike, spotPrice]);

  // Memoize CSS classes for performance
  const getMoneynessClasses = useCallback((moneyness: 'ITM' | 'ATM' | 'OTM', isHovered: boolean): string => {
    const baseClasses = isHovered ? 'bg-blue-100 dark:bg-blue-900/30' : '';
    
    switch (moneyness) {
      case 'ITM':
        return `${baseClasses} bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 ${isHovered ? 'bg-green-100 dark:bg-green-900/40' : ''}`;
      case 'ATM':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 font-semibold ${isHovered ? 'bg-yellow-100 dark:bg-yellow-900/40' : ''}`;
      case 'OTM':
        return `${baseClasses} bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${isHovered ? 'bg-gray-100 dark:bg-gray-700' : ''}`;
      default:
        return baseClasses;
    }
  }, []);

  // Get animation classes for price updates
  const getAnimationClasses = (isAnimating: boolean): string => {
    return isAnimating ? 'animate-pulse bg-blue-200 dark:bg-blue-800' : '';
  };

  // Get price change animation classes
  const getPriceChangeClasses = (change: 'up' | 'down' | null): string => {
    if (!change) return '';
    return change === 'up' 
      ? 'animate-pulse bg-green-200 dark:bg-green-800 transition-all duration-500' 
      : 'animate-pulse bg-red-200 dark:bg-red-800 transition-all duration-500';
  };

  // Memoize event handlers for performance
  const handleCallClick = useCallback(() => {
    onOptionClick(callOption);
  }, [onOptionClick, callOption]);

  const handlePutClick = useCallback(() => {
    onOptionClick(putOption);
  }, [onOptionClick, putOption]);

  const handleCallMouseEnter = useCallback(() => {
    setHoveredOption('call');
  }, []);

  const handlePutMouseEnter = useCallback(() => {
    setHoveredOption('put');
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredOption(null);
  }, []);

  return (
    <tr className="hover:bg-gray-50/80 dark:hover:bg-slate-800/80 transition-all duration-300">
      {/* Call Options Data */}
      <td
        onClick={handleCallClick}
        onMouseEnter={handleCallMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(callMoneyness, hoveredOption === 'call')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="flex flex-col">
          <span className="font-medium">{callOption.oi.toLocaleString()}</span>
          {hoveredOption === 'call' && callOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Δ: {callOption.greeks.delta.toFixed(3)}
            </span>
          )}
        </div>
      </td>
      
      <td
        onClick={handleCallClick}
        onMouseEnter={handleCallMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(callMoneyness, hoveredOption === 'call')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="flex flex-col">
          <span className="font-medium">{callOption.volume.toLocaleString()}</span>
          {hoveredOption === 'call' && callOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Γ: {callOption.greeks.gamma.toFixed(4)}
            </span>
          )}
        </div>
      </td>
      
      <td
        onClick={handleCallClick}
        onMouseEnter={handleCallMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(callMoneyness, hoveredOption === 'call')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="flex flex-col">
          <span>{callOption.iv.toFixed(2)}%</span>
          {hoveredOption === 'call' && callOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Θ: {callOption.greeks.theta.toFixed(2)}
            </span>
          )}
        </div>
      </td>
      
      <td
        onClick={handleCallClick}
        onMouseEnter={handleCallMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm font-medium cursor-pointer transition-all duration-200 ${getMoneynessClasses(callMoneyness, hoveredOption === 'call')} ${getAnimationClasses(isAnimating)} ${getPriceChangeClasses(priceChanges.callLtp)}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-lg">₹{callOption.ltp.toFixed(2)}</span>
            {priceChanges.callLtp && (
              <span className={`text-xs ${priceChanges.callLtp === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChanges.callLtp === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          {hoveredOption === 'call' && callOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ν: {callOption.greeks.vega.toFixed(2)}
            </span>
          )}
        </div>
      </td>
      
      <td
        onClick={handleCallClick}
        onMouseEnter={handleCallMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(callMoneyness, hoveredOption === 'call')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-red-600 dark:text-red-400">₹{callOption.bid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">₹{callOption.ask.toFixed(2)}</span>
          </div>
        </div>
      </td>
      
      {/* Strike Price */}
      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-center bg-gray-100/80 dark:bg-slate-700/80 backdrop-blur-sm text-gray-900 dark:text-white border-l-2 border-r-2 border-gray-300/50 dark:border-slate-600/50">
        <div className="flex flex-col items-center">
          <span className="text-lg">{strike}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {callMoneyness === 'ATM' || putMoneyness === 'ATM' ? 'ATM' : ''}
          </span>
        </div>
      </td>
      
      {/* Put Options Data */}
      <td
        onClick={handlePutClick}
        onMouseEnter={handlePutMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(putMoneyness, hoveredOption === 'put')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-red-600 dark:text-red-400">₹{putOption.bid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">₹{putOption.ask.toFixed(2)}</span>
          </div>
        </div>
      </td>
      
      <td
        onClick={handlePutClick}
        onMouseEnter={handlePutMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm font-medium cursor-pointer transition-all duration-200 ${getMoneynessClasses(putMoneyness, hoveredOption === 'put')} ${getAnimationClasses(isAnimating)} ${getPriceChangeClasses(priceChanges.putLtp)}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-lg">₹{putOption.ltp.toFixed(2)}</span>
            {priceChanges.putLtp && (
              <span className={`text-xs ${priceChanges.putLtp === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChanges.putLtp === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          {hoveredOption === 'put' && putOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ν: {putOption.greeks.vega.toFixed(2)}
            </span>
          )}
        </div>
      </td>
      
      <td
        onClick={handlePutClick}
        onMouseEnter={handlePutMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(putMoneyness, hoveredOption === 'put')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="flex flex-col">
          <span>{putOption.iv.toFixed(2)}%</span>
          {hoveredOption === 'put' && putOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Θ: {putOption.greeks.theta.toFixed(2)}
            </span>
          )}
        </div>
      </td>
      
      <td
        onClick={handlePutClick}
        onMouseEnter={handlePutMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(putMoneyness, hoveredOption === 'put')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="flex flex-col">
          <span className="font-medium">{putOption.volume.toLocaleString()}</span>
          {hoveredOption === 'put' && putOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Γ: {putOption.greeks.gamma.toFixed(4)}
            </span>
          )}
        </div>
      </td>
      
      <td
        onClick={handlePutClick}
        onMouseEnter={handlePutMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`px-3 py-4 whitespace-nowrap text-sm cursor-pointer transition-all duration-200 ${getMoneynessClasses(putMoneyness, hoveredOption === 'put')} ${getAnimationClasses(isAnimating)}`}
      >
        <div className="flex flex-col">
          <span className="font-medium">{putOption.oi.toLocaleString()}</span>
          {hoveredOption === 'put' && putOption.greeks && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Δ: {putOption.greeks.delta.toFixed(3)}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.strike === nextProps.strike &&
    prevProps.spotPrice === nextProps.spotPrice &&
    prevProps.isAnimating === nextProps.isAnimating &&
    prevProps.callOption.ltp === nextProps.callOption.ltp &&
    prevProps.callOption.bid === nextProps.callOption.bid &&
    prevProps.callOption.ask === nextProps.callOption.ask &&
    prevProps.callOption.volume === nextProps.callOption.volume &&
    prevProps.callOption.oi === nextProps.callOption.oi &&
    prevProps.callOption.iv === nextProps.callOption.iv &&
    prevProps.putOption.ltp === nextProps.putOption.ltp &&
    prevProps.putOption.bid === nextProps.putOption.bid &&
    prevProps.putOption.ask === nextProps.putOption.ask &&
    prevProps.putOption.volume === nextProps.putOption.volume &&
    prevProps.putOption.oi === nextProps.putOption.oi &&
    prevProps.putOption.iv === nextProps.putOption.iv
  );
});

OptionRow.displayName = 'OptionRow';

export default OptionRow;