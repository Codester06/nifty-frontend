import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { optionsDataService } from '@/shared/services/optionsDataService';
import { UNDERLYING_ASSETS } from '@/shared/types/options';
import OptionChainTable from './OptionChainTable';
// import VirtualizedOptionChainTable from './VirtualizedOptionChainTable';
import OptionChainFilters from './OptionChainFilters';
import type { OptionChainData, OptionContract, OptionChainProps, SortConfig } from '@/shared/types';
import type { OptionChainFilter } from '@/shared/types/options';

const OptionChain: React.FC<OptionChainProps> = ({
  underlying = 'NIFTY',
  variant = 'dashboard',
  onOptionSelect,
  className = '',
}) => {
  const { isAuthenticated } = useAuth();
  const [selectedUnderlying, setSelectedUnderlying] = useState(underlying);
  const [optionChainData, setOptionChainData] = useState<OptionChainData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'strike', direction: 'asc' });
  const [filters, setFilters] = useState<OptionChainFilter>({});
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch option chain data
  const fetchOptionChain = useCallback(async (underlyingSymbol: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await optionsDataService.getOptionChain(underlyingSymbol);
      setOptionChainData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load option chain');
      console.error('Error fetching option chain:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle underlying asset change
  const handleUnderlyingChange = useCallback((newUnderlying: string) => {
    setSelectedUnderlying(newUnderlying);
    fetchOptionChain(newUnderlying);
  }, [fetchOptionChain]);

  // Handle smooth data updates without flickering
  const handleDataUpdate = useCallback((data: OptionChainData) => {
    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Show updating indicator briefly
    setIsUpdating(true);
    
    // Update data immediately
    setOptionChainData(data);
    setLastUpdateTime(new Date());
    
    // Hide updating indicator after a short delay
    updateTimeoutRef.current = setTimeout(() => {
      setIsUpdating(false);
    }, 300);
  }, []);

  // Set up real-time updates and connection status monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    let cleanup: (() => void) | null = null;
    let statusCleanup: (() => void) | null = null;

    const setupRealTimeUpdates = () => {
      cleanup = optionsDataService.startRealTimeUpdates(
        selectedUnderlying,
        handleDataUpdate
      );
    };

    const setupConnectionStatusMonitoring = () => {
      statusCleanup = optionsDataService.onConnectionStatusChange((status: string) => {
        setConnectionStatus(status);
      });
    };

    // Initial data fetch
    fetchOptionChain(selectedUnderlying);
    
    // Set up real-time updates
    setupRealTimeUpdates();
    
    // Set up connection status monitoring
    setupConnectionStatusMonitoring();

    return () => {
      if (cleanup) cleanup();
      if (statusCleanup) statusCleanup();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [isAuthenticated, selectedUnderlying, fetchOptionChain, handleDataUpdate]);

  // Handle option selection
  const handleOptionClick = useCallback((option: OptionContract) => {
    if (onOptionSelect) {
      onOptionSelect(option);
    }
  }, [onOptionSelect]);

  // Handle sorting
  const handleSort = useCallback((field: string) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: OptionChainFilter) => {
    setFilters(newFilters);
  }, []);

  // Auto-enable virtualization for large datasets
  useEffect(() => {
    if (optionChainData) {
      const strikeCount = Object.keys(optionChainData.options).length;
      setUseVirtualization(strikeCount > 50);
    }
  }, [optionChainData]);

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8 ${className}`}>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Options Trading
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
            Please log in to view option chains and trade options with demo coins
          </p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
          >
            Login to Trade Options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-slate-700/50 ${className}`}>
      {/* Header with underlying selector */}
      <div className="p-8 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Option Chain
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time options data and trading
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Demo/Live Mode Toggle */}
            <div className="flex items-center gap-2">
              <label htmlFor="mode-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mode:
              </label>
              <button
                id="mode-toggle"
                onClick={() => {
                  const newDemoMode = !optionsDataService.isDemoMode();
                  optionsDataService.setDemoMode(newDemoMode);
                  // Refresh data with new mode
                  fetchOptionChain(selectedUnderlying);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 shadow-lg ${
                  optionsDataService.isDemoMode()
                    ? 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 text-yellow-800 dark:text-yellow-200'
                    : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-800 dark:text-green-200'
                }`}
              >
                {optionsDataService.isDemoMode() ? 'Demo' : 'Live'}
              </button>
            </div>

            {/* Underlying Asset Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="underlying-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Underlying:
              </label>
              <select
                id="underlying-select"
                value={selectedUnderlying}
                onChange={(e) => handleUnderlyingChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-lg"
              >
                {Object.entries(UNDERLYING_ASSETS).map(([key, asset]) => (
                  <option key={key} value={key}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Spot price and connection status info */}
        {optionChainData && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-medium">Spot Price:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{optionChainData.spotPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Expiry:</span>
              <span>{new Date(optionChainData.expiry).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Last Updated:</span>
              <span className={`transition-colors duration-300 ${isUpdating ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : new Date(optionChainData.lastUpdated).toLocaleTimeString()}
              </span>
              {isUpdating && (
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </div>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  connectionStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-400'
                }`}></div>
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' :
                  connectionStatus === 'connecting' ? 'text-yellow-600 dark:text-yellow-400' :
                  connectionStatus === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {connectionStatus === 'connected' ? 'Live' :
                   connectionStatus === 'connecting' ? 'Connecting' :
                   connectionStatus === 'error' ? 'Error' :
                   optionsDataService.isDemoMode() ? 'Demo' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-400 text-lg">Loading option chain...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading option chain
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => fetchOptionChain(selectedUnderlying)}
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {optionChainData && !isLoading && !error && (
          <div className="space-y-4">
            {/* Demo mode indicator */}
            {optionsDataService.isDemoMode() && (
              <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Demo Mode: Using simulated option chain data for learning purposes
                  </span>
                </div>
              </div>
            )}

            {/* Filters */}
            <OptionChainFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              spotPrice={optionChainData.spotPrice}
              className="mb-6"
            />

            {/* Option Chain Table */}
            <OptionChainTable
              options={optionChainData}
              onOptionClick={handleOptionClick}
              isLoading={false}
              sortConfig={sortConfig}
              onSort={handleSort}
              filters={filters}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionChain;