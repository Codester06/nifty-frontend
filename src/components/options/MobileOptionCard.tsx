import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import type { OptionContract } from '@/shared/types';

interface MobileOptionCardProps {
  strike: number;
  callOption: OptionContract;
  putOption: OptionContract;
  spotPrice: number;
  onOptionClick: (option: OptionContract) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const MobileOptionCard: React.FC<MobileOptionCardProps> = memo(({
  strike,
  callOption,
  putOption,
  spotPrice,
  onOptionClick,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [activeTab, setActiveTab] = useState<'call' | 'put'>('call');
  
  const getMoneyness = (strike: number, optionType: 'CE' | 'PE') => {
    const diff = Math.abs(strike - spotPrice);
    if (diff / spotPrice < 0.01) return 'ATM';
    if (optionType === 'CE') {
      return strike < spotPrice ? 'ITM' : 'OTM';
    } else {
      return strike > spotPrice ? 'ITM' : 'OTM';
    }
  };

  const callMoneyness = getMoneyness(strike, 'CE');
  const putMoneyness = getMoneyness(strike, 'PE');
  
  const getMoneynessColor = (moneyness: string) => {
    switch (moneyness) {
      case 'ITM': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'ATM': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'OTM': return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default: return '';
    }
  };

  const activeOption = activeTab === 'call' ? callOption : putOption;
  const activeMoneyness = activeTab === 'call' ? callMoneyness : putMoneyness;

  return (
    <motion.div 
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {strike}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getMoneynessColor(activeMoneyness)}`}>
              {activeMoneyness}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Spot</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              ₹{spotPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="p-4 pb-0">
        <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'call'
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Call (CE)</span>
              <div className={`w-2 h-2 rounded-full ${callMoneyness === 'ITM' ? 'bg-green-500' : callMoneyness === 'ATM' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('put')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'put'
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Put (PE)</span>
              <div className={`w-2 h-2 rounded-full ${putMoneyness === 'ITM' ? 'bg-green-500' : putMoneyness === 'ATM' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
            </div>
          </button>
        </div>
      </div>

      {/* Option Details */}
      <div className="p-4 space-y-4">
        {/* LTP - Main Price */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Traded Price</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{activeOption.ltp.toFixed(2)}
          </div>
        </div>

        {/* Bid/Ask */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Bid</div>
            <div className="text-lg font-semibold text-red-700 dark:text-red-300">
              ₹{activeOption.bid.toFixed(2)}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Ask</div>
            <div className="text-lg font-semibold text-green-700 dark:text-green-300">
              ₹{activeOption.ask.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Volume</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {activeOption.volume > 1000 ? `${(activeOption.volume / 1000).toFixed(1)}K` : activeOption.volume.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">OI</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {activeOption.oi > 1000 ? `${(activeOption.oi / 1000).toFixed(1)}K` : activeOption.oi.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IV</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {activeOption.iv.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Greeks - Expandable */}
        {activeOption.greeks && (
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Greeks</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Delta:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activeOption.greeks.delta.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Gamma:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activeOption.greeks.gamma.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Theta:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activeOption.greeks.theta.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                  <span className="text-gray-500 dark:text-gray-400">Vega:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activeOption.greeks.vega.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onOptionClick(activeOption)}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Trade {activeTab === 'call' ? 'Call' : 'Put'}
          </button>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200"
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MobileOptionCard.displayName = 'MobileOptionCard';

export default MobileOptionCard;