import React, { useMemo, useState } from 'react';
import {
  Eye,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MobileOptionChainLoading, MobileErrorState } from '@/components/ui/MobileLoadingStates';
import type { OptionChainData, OptionContract, SortConfig } from '@/shared/types';
import type { OptionChainFilter, OptionMoneyness } from '@/shared/types/options';

interface MobileOptionChainProps {
  options: OptionChainData;
  onOptionClick: (option: OptionContract) => void;
  isLoading: boolean;
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  filters?: OptionChainFilter;
}

interface OptionCardProps {
  strike: number;
  callOption: OptionContract;
  putOption: OptionContract;
  spotPrice: number;
  onOptionClick: (option: OptionContract) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  strike,
  callOption,
  putOption,
  spotPrice,
  onOptionClick,
  isExpanded,
  onToggleExpand
}) => {
  // Helper function to determine option moneyness
  const getOptionMoneyness = (strike: number, spotPrice: number): OptionMoneyness => {
    const threshold = spotPrice * 0.005; // 0.5% threshold for ATM
    
    if (Math.abs(strike - spotPrice) <= threshold) {
      return 'ATM';
    }
    
    return strike < spotPrice ? 'ITM' : 'OTM';
  };

  const moneyness = getOptionMoneyness(strike, spotPrice);
  
  const getMoneynessColor = (moneyness: OptionMoneyness) => {
    switch (moneyness) {
      case 'ITM':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'ATM':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'OTM':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className={`rounded-xl border-2 shadow-sm ${getMoneynessColor(moneyness)}`}>
      {/* Header - Always visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{strike}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                {moneyness}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Call LTP */}
            <div className="text-center">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                ₹{callOption.ltp?.toFixed(2) || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">CE</div>
            </div>

            {/* Put LTP */}
            <div className="text-center">
              <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                ₹{putOption.ltp?.toFixed(2) || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">PE</div>
            </div>
            
            {/* Expand/Collapse Icon */}
            <div className="text-gray-400">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
          <div className="p-4 space-y-4">
            {/* Call Option Details */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                  Call Option (CE)
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOptionClick(callOption);
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                >
                  Trade
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">LTP:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    ₹{callOption.ltp?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {callOption.volume?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Bid/Ask:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {callOption.bid?.toFixed(2) || 'N/A'}/{callOption.ask?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">OI:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {callOption.oi?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">IV:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {callOption.iv?.toFixed(2) || 'N/A'}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Delta:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {callOption.greeks?.delta?.toFixed(3) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Put Option Details */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Put Option (PE)
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOptionClick(putOption);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                >
                  Trade
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">LTP:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    ₹{putOption.ltp?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {putOption.volume?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Bid/Ask:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {putOption.bid?.toFixed(2) || 'N/A'}/{putOption.ask?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">OI:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {putOption.oi?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">IV:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {putOption.iv?.toFixed(2) || 'N/A'}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Delta:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {putOption.greeks?.delta?.toFixed(3) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileOptionChain: React.FC<MobileOptionChainProps> = ({
  options,
  onOptionClick,
  isLoading,
  sortConfig,
  onSort,
  filters = {},
}) => {
  const [expandedStrikes, setExpandedStrikes] = useState<Set<number>>(new Set());
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Helper function to determine option moneyness
  const getOptionMoneyness = (strike: number, spotPrice: number, optionType: 'CE' | 'PE'): OptionMoneyness => {
    const threshold = spotPrice * 0.005; // 0.5% threshold for ATM
    
    if (Math.abs(strike - spotPrice) <= threshold) {
      return 'ATM';
    }
    
    if (optionType === 'CE') {
      return strike < spotPrice ? 'ITM' : 'OTM';
    } else {
      return strike > spotPrice ? 'ITM' : 'OTM';
    }
  };

  // Helper function to check if an option passes the filters
  const passesFilters = (strike: number, option: OptionContract): boolean => {
    // Strike range filter
    if (filters.strikeRange) {
      if (strike < filters.strikeRange.min || strike > filters.strikeRange.max) {
        return false;
      }
    }

    // Option type filter
    if (filters.optionType && !filters.optionType.includes(option.optionType)) {
      return false;
    }

    // Moneyness filter
    if (filters.moneyness) {
      const moneyness = getOptionMoneyness(strike, options.spotPrice, option.optionType);
      if (!filters.moneyness.includes(moneyness)) {
        return false;
      }
    }

    // Volume filter
    if (filters.minVolume && option.volume < filters.minVolume) {
      return false;
    }

    // Open interest filter
    if (filters.minOI && option.oi < filters.minOI) {
      return false;
    }

    return true;
  };

  // Filter and sort the strikes based on current configuration
  const filteredAndSortedStrikes = useMemo(() => {
    let strikes = Object.keys(options.options).map(Number).sort((a, b) => a - b);
    
    // Apply filters
    strikes = strikes.filter(strike => {
      const { call, put } = options.options[strike];
      
      // For each strike, check if either call or put passes the filters
      // If option type filter is applied, only check the relevant option
      if (filters.optionType) {
        if (filters.optionType.includes('CE') && filters.optionType.includes('PE')) {
          // Both types selected, check if either passes
          return passesFilters(strike, call) || passesFilters(strike, put);
        } else if (filters.optionType.includes('CE')) {
          // Only calls selected
          return passesFilters(strike, call);
        } else if (filters.optionType.includes('PE')) {
          // Only puts selected
          return passesFilters(strike, put);
        }
      } else {
        // No option type filter, check if either passes
        return passesFilters(strike, call) || passesFilters(strike, put);
      }
      
      return false;
    });

    // Apply sorting
    if (!sortConfig.field) return strikes;

    return strikes.sort((a, b) => {
      const aOption = options.options[a];
      const bOption = options.options[b];
      
      let aValue: number;
      let bValue: number;

      // Determine which values to compare based on sort field
      switch (sortConfig.field) {
        case 'strike':
          aValue = a;
          bValue = b;
          break;
        case 'call_ltp':
          aValue = aOption.call.ltp;
          bValue = bOption.call.ltp;
          break;
        case 'call_volume':
          aValue = aOption.call.volume;
          bValue = bOption.call.volume;
          break;
        case 'call_oi':
          aValue = aOption.call.oi;
          bValue = bOption.call.oi;
          break;
        case 'call_iv':
          aValue = aOption.call.iv;
          bValue = bOption.call.iv;
          break;
        case 'put_ltp':
          aValue = aOption.put.ltp;
          bValue = bOption.put.ltp;
          break;
        case 'put_volume':
          aValue = aOption.put.volume;
          bValue = bOption.put.volume;
          break;
        case 'put_oi':
          aValue = aOption.put.oi;
          bValue = bOption.put.oi;
          break;
        case 'put_iv':
          aValue = aOption.put.iv;
          bValue = bOption.put.iv;
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [options.options, options.spotPrice, sortConfig, filters]);

  const toggleExpanded = (strike: number) => {
    const newExpanded = new Set(expandedStrikes);
    if (newExpanded.has(strike)) {
      newExpanded.delete(strike);
    } else {
      newExpanded.add(strike);
    }
    setExpandedStrikes(newExpanded);
  };

  const sortOptions = [
    { field: 'strike', label: 'Strike Price' },
    { field: 'call_ltp', label: 'Call LTP' },
    { field: 'call_volume', label: 'Call Volume' },
    { field: 'call_oi', label: 'Call OI' },
    { field: 'call_iv', label: 'Call IV' },
    { field: 'put_ltp', label: 'Put LTP' },
    { field: 'put_volume', label: 'Put Volume' },
    { field: 'put_oi', label: 'Put OI' },
    { field: 'put_iv', label: 'Put IV' },
  ];

  if (isLoading) {
    return <MobileOptionChainLoading />;
  }

  if (!options || Object.keys(options.options).length === 0) {
    return (
      <MobileErrorState
        title="No Option Data"
        message="No option data is currently available for this symbol."
        type="data"
        className="min-h-[200px]"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header with Sort */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Option Chain
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Spot: ₹{options.spotPrice.toFixed(2)}
          </p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Sort</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showSortOptions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="p-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.field}
                    onClick={() => {
                      onSort(option.field);
                      setShowSortOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sortConfig.field === option.field 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {sortConfig.field === option.field && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Option Cards */}
      {filteredAndSortedStrikes.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedStrikes.map((strike) => {
            const strikeData = options.options[strike];
            if (!strikeData || !strikeData.call || !strikeData.put) {
              return null; // Skip invalid strikes
            }
            const { call, put } = strikeData;

            return (
              <OptionCard
                key={strike}
                strike={strike}
                callOption={call}
                putOption={put}
                spotPrice={options.spotPrice}
                onOptionClick={onOptionClick}
                isExpanded={expandedStrikes.has(strike)}
                onToggleExpand={() => toggleExpanded(strike)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No options match your filters
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try adjusting your filter criteria
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Option Moneyness
        </h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">ITM (In The Money)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">ATM (At The Money)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">OTM (Out of The Money)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOptionChain;