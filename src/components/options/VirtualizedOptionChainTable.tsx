import React, { useMemo, useCallback, memo } from 'react';
import * as ReactWindow from 'react-window';
const { FixedSizeList } = ReactWindow;
import OptionRow from './OptionRow';
import type { OptionChainData, OptionContract, SortConfig } from '@/shared/types';
import type { OptionChainFilter } from '@/shared/types/options';

interface VirtualizedOptionChainTableProps {
  options: OptionChainData;
  onOptionClick: (option: OptionContract) => void;
  isLoading: boolean;
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  filters?: OptionChainFilter;
  height?: number;
}

interface RowData {
  strikes: number[];
  options: OptionChainData['options'];
  spotPrice: number;
  onOptionClick: (option: OptionContract) => void;
}

// Individual row component for virtualization
const VirtualizedRow = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: RowData;
}) => {
  const { strikes, options, spotPrice, onOptionClick } = data;
  const strike = strikes[index];
  const { call, put } = options[strike];

  return (
    <div style={style}>
      <table className="w-full">
        <tbody>
          <OptionRow
            key={strike}
            strike={strike}
            callOption={call}
            putOption={put}
            spotPrice={spotPrice}
            onOptionClick={onOptionClick}
            isAnimating={false}
          />
        </tbody>
      </table>
    </div>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

const VirtualizedOptionChainTable: React.FC<VirtualizedOptionChainTableProps> = ({
  options,
  onOptionClick,
  isLoading,
  sortConfig,
  onSort,
  filters = {},
  height = 600,
}) => {
  // Helper function to determine option moneyness
  const getOptionMoneyness = useCallback((strike: number, spotPrice: number, optionType: 'CE' | 'PE') => {
    const threshold = spotPrice * 0.005; // 0.5% threshold for ATM
    
    if (Math.abs(strike - spotPrice) <= threshold) {
      return 'ATM';
    }
    
    if (optionType === 'CE') {
      return strike < spotPrice ? 'ITM' : 'OTM';
    } else {
      return strike > spotPrice ? 'ITM' : 'OTM';
    }
  }, []);

  // Helper function to check if an option passes the filters
  const passesFilters = useCallback((strike: number, option: OptionContract): boolean => {
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
  }, [filters, options.spotPrice, getOptionMoneyness]);

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
        case 'call_bid':
          aValue = aOption.call.bid;
          bValue = bOption.call.bid;
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
        case 'put_bid':
          aValue = aOption.put.bid;
          bValue = bOption.put.bid;
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
  }, [options.options, options.spotPrice, sortConfig, filters, passesFilters]);

  // Handle column header click for sorting
  const handleSort = useCallback((field: string) => {
    onSort(field);
  }, [onSort]);

  // Handle keyboard navigation for sorting
  const handleKeyDown = useCallback((event: React.KeyboardEvent, field: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSort(field);
    }
  }, [handleSort]);

  // Render sort icon with enhanced visual indicators
  const renderSortIcon = useCallback((field: string) => {
    if (sortConfig.field !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-orange-600 dark:text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-orange-600 dark:text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }, [sortConfig]);

  // Prepare data for virtualized list
  const rowData: RowData = useMemo(() => ({
    strikes: filteredAndSortedStrikes,
    options: options.options,
    spotPrice: options.spotPrice,
    onOptionClick,
  }), [filteredAndSortedStrikes, options.options, options.spotPrice, onOptionClick]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading option chain...</span>
      </div>
    );
  }

  if (!options || Object.keys(options.options).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No option data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
      {/* Fixed Header */}
      <div className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50">
        <table className="min-w-full">
          <thead>
            <tr>
              {/* Call Options Headers */}
              <th
                onClick={() => handleSort('call_oi')}
                onKeyDown={(e) => handleKeyDown(e, 'call_oi')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Call Open Interest"
                role="button"
                aria-label="Sort by Call Open Interest"
              >
                <div className="flex items-center">
                  OI
                  {renderSortIcon('call_oi')}
                </div>
              </th>
              <th
                onClick={() => handleSort('call_volume')}
                onKeyDown={(e) => handleKeyDown(e, 'call_volume')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Call Volume"
                role="button"
                aria-label="Sort by Call Volume"
              >
                <div className="flex items-center">
                  Volume
                  {renderSortIcon('call_volume')}
                </div>
              </th>
              <th
                onClick={() => handleSort('call_iv')}
                onKeyDown={(e) => handleKeyDown(e, 'call_iv')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Call Implied Volatility"
                role="button"
                aria-label="Sort by Call Implied Volatility"
              >
                <div className="flex items-center">
                  IV
                  {renderSortIcon('call_iv')}
                </div>
              </th>
              <th
                onClick={() => handleSort('call_ltp')}
                onKeyDown={(e) => handleKeyDown(e, 'call_ltp')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Call Last Traded Price"
                role="button"
                aria-label="Sort by Call Last Traded Price"
              >
                <div className="flex items-center">
                  LTP
                  {renderSortIcon('call_ltp')}
                </div>
              </th>
              <th
                onClick={() => handleSort('call_bid')}
                onKeyDown={(e) => handleKeyDown(e, 'call_bid')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Call Bid Price"
                role="button"
                aria-label="Sort by Call Bid Price"
              >
                <div className="flex items-center">
                  Bid/Ask
                  {renderSortIcon('call_bid')}
                </div>
              </th>
              
              {/* Strike Price Header */}
              <th
                onClick={() => handleSort('strike')}
                onKeyDown={(e) => handleKeyDown(e, 'strike')}
                tabIndex={0}
                className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 bg-gray-100 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Strike Price"
                role="button"
                aria-label="Sort by Strike Price"
              >
                <div className="flex items-center justify-center">
                  Strike
                  {renderSortIcon('strike')}
                </div>
              </th>
              
              {/* Put Options Headers */}
              <th
                onClick={() => handleSort('put_bid')}
                onKeyDown={(e) => handleKeyDown(e, 'put_bid')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Put Bid Price"
                role="button"
                aria-label="Sort by Put Bid Price"
              >
                <div className="flex items-center">
                  Bid/Ask
                  {renderSortIcon('put_bid')}
                </div>
              </th>
              <th
                onClick={() => handleSort('put_ltp')}
                onKeyDown={(e) => handleKeyDown(e, 'put_ltp')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Put Last Traded Price"
                role="button"
                aria-label="Sort by Put Last Traded Price"
              >
                <div className="flex items-center">
                  LTP
                  {renderSortIcon('put_ltp')}
                </div>
              </th>
              <th
                onClick={() => handleSort('put_iv')}
                onKeyDown={(e) => handleKeyDown(e, 'put_iv')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Put Implied Volatility"
                role="button"
                aria-label="Sort by Put Implied Volatility"
              >
                <div className="flex items-center">
                  IV
                  {renderSortIcon('put_iv')}
                </div>
              </th>
              <th
                onClick={() => handleSort('put_volume')}
                onKeyDown={(e) => handleKeyDown(e, 'put_volume')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Put Volume"
                role="button"
                aria-label="Sort by Put Volume"
              >
                <div className="flex items-center">
                  Volume
                  {renderSortIcon('put_volume')}
                </div>
              </th>
              <th
                onClick={() => handleSort('put_oi')}
                onKeyDown={(e) => handleKeyDown(e, 'put_oi')}
                tabIndex={0}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset group"
                title="Sort by Put Open Interest"
                role="button"
                aria-label="Sort by Put Open Interest"
              >
                <div className="flex items-center">
                  OI
                  {renderSortIcon('put_oi')}
                </div>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtualized Body */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {filteredAndSortedStrikes.length > 0 ? (
          <FixedSizeList
            height={height}
            itemCount={filteredAndSortedStrikes.length}
            itemSize={80} // Height of each row
            itemData={rowData}
            overscanCount={5} // Render 5 extra items for smooth scrolling
          >
            {VirtualizedRow}
          </FixedSizeList>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V3a1 1 0 00-1-1H10a1 1 0 00-1 1v3.306" />
              </svg>
              <div>
                <p className="text-lg font-medium">No options match your filters</p>
                <p className="text-sm">Try adjusting your filter criteria to see more results</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend and Sort Info */}
      <div className="mt-6 p-4 bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Moneyness Legend */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm"></div>
              <span className="font-medium">ITM (In The Money)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm"></div>
              <span className="font-medium">ATM (At The Money)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"></div>
              <span className="font-medium">OTM (Out of The Money)</span>
            </div>
          </div>
          
          {/* Sort Information */}
          {sortConfig.field && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>
                Sorted by <span className="font-medium text-gray-900 dark:text-white">
                  {sortConfig.field.replace('_', ' ').toUpperCase()}
                </span> ({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
              </span>
              <button
                onClick={() => onSort('')}
                className="ml-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-xs font-medium"
              >
                Clear Sort
              </button>
            </div>
          )}
        </div>
        
        {/* Performance Info */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredAndSortedStrikes.length} strikes • Virtualized for optimal performance
        </div>
      </div>
    </div>
  );
};

export default VirtualizedOptionChainTable;