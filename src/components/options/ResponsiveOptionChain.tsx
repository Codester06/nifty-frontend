import React, { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import OptionChain from './OptionChain';
import type { OptionChainProps } from '@/shared/types';

// Mobile-optimized option chain card component
const MobileOptionCard: React.FC<{
  strike: number;
  callOption: any;
  putOption: any;
  spotPrice: number;
  onOptionClick: (option: any) => void;
}> = ({ strike, callOption, putOption, spotPrice, onOptionClick }) => {
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
      case 'ITM': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'ATM': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'OTM': return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
      default: return '';
    }
  };

  const activeOption = activeTab === 'call' ? callOption : putOption;
  const activeMoneyness = activeTab === 'call' ? callMoneyness : putMoneyness;

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-slate-700/50">
      {/* Strike Price Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{strike}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoneynessColor(activeMoneyness)}`}>
            {activeMoneyness}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Spot: ₹{spotPrice.toLocaleString()}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 mb-4">
        <button
          onClick={() => setActiveTab('call')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'call'
              ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Call (CE)
        </button>
        <button
          onClick={() => setActiveTab('put')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'put'
              ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Put (PE)
        </button>
      </div>

      {/* Option Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">LTP</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ₹{activeOption.ltp.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">Bid</div>
            <div className="text-lg font-semibold text-red-700 dark:text-red-300">
              ₹{activeOption.bid.toFixed(2)}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">Ask</div>
            <div className="text-lg font-semibold text-green-700 dark:text-green-300">
              ₹{activeOption.ask.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">Volume</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {activeOption.volume.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">OI</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {activeOption.oi.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">IV</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {activeOption.iv.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Greeks */}
        {activeOption.greeks && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Delta:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {activeOption.greeks.delta.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Gamma:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {activeOption.greeks.gamma.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Theta:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {activeOption.greeks.theta.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Vega:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {activeOption.greeks.vega.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Trade Button */}
        <button
          onClick={() => onOptionClick(activeOption)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
        >
          Trade {activeTab === 'call' ? 'Call' : 'Put'}
        </button>
      </div>
    </div>
  );
};

// Tablet-optimized compact table
const TabletOptionTable: React.FC<{
  options: any;
  onOptionClick: (option: any) => void;
  sortConfig: any;
  onSort: (field: string) => void;
}> = ({ options, onOptionClick, sortConfig, onSort }) => {
  const strikes = Object.keys(options.options).map(Number).sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
      <table className="min-w-full divide-y divide-gray-200/50 dark:divide-slate-700/50">
        <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Strike
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Call LTP
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Call Vol
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Put LTP
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Put Vol
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm divide-y divide-gray-200/50 dark:divide-slate-700/50">
          {strikes.map((strike) => {
            const { call, put } = options.options[strike];
            return (
              <tr key={strike} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/80 transition-colors">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {strike}
                </td>
                <td 
                  className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  onClick={() => onOptionClick(call)}
                >
                  ₹{call.ltp.toFixed(2)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {call.volume.toLocaleString()}
                </td>
                <td 
                  className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  onClick={() => onOptionClick(put)}
                >
                  ₹{put.ltp.toFixed(2)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {put.volume.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ResponsiveOptionChain: React.FC<OptionChainProps> = (props) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'tablet' | 'desktop'>('auto');

  // Auto-detect optimal view mode
  const effectiveViewMode = useMemo(() => {
    if (viewMode !== 'auto') return viewMode;
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }, [viewMode, isMobile, isTablet]);

  // For mobile and tablet, we need to handle the option chain data differently
  if (effectiveViewMode === 'mobile') {
    return (
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-slate-700/50 ${props.className || ''}`}>
        {/* Mobile-specific header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Options</h3>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="auto">Auto</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>
          
          {/* Mobile controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Underlying
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                <option value="NIFTY">NIFTY 50</option>
                <option value="BANKNIFTY">BANK NIFTY</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile option cards - would need actual data */}
        <div className="p-6 space-y-4">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Mobile view requires option chain data integration
          </div>
        </div>
      </div>
    );
  }

  if (effectiveViewMode === 'tablet') {
    return (
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-slate-700/50 ${props.className || ''}`}>
        {/* Tablet-specific header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Option Chain</h3>
            <div className="flex items-center gap-3">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="auto">Auto</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tablet content - would need actual data */}
        <div className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Tablet view requires option chain data integration
          </div>
        </div>
      </div>
    );
  }

  // Desktop view - use the full OptionChain component
  return (
    <div className="relative">
      {/* View mode selector for desktop */}
      <div className="absolute top-4 right-4 z-10">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as any)}
          className="px-3 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded-lg bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm"
        >
          <option value="auto">Auto</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
          <option value="desktop">Desktop</option>
        </select>
      </div>
      
      <OptionChain {...props} />
    </div>
  );
};

export default ResponsiveOptionChain;