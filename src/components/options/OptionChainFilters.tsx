import React from 'react';
import type { OptionChainFilter, OptionMoneyness } from '@/shared/types/options';

export interface OptionChainFiltersProps {
  filters: OptionChainFilter;
  onFiltersChange: (filters: OptionChainFilter) => void;
  spotPrice: number;
  className?: string;
}

const OptionChainFilters: React.FC<OptionChainFiltersProps> = ({
  filters,
  onFiltersChange,
  spotPrice,
  className = '',
}) => {
  // Handle strike price search input
  const handleStrikePriceChange = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || value === '') {
      // Clear strike range filter
      const newFilters = { ...filters };
      delete newFilters.strikeRange;
      onFiltersChange(newFilters);
    } else {
      // Set strike range around the entered value (±50 points)
      onFiltersChange({
        ...filters,
        strikeRange: {
          min: numValue - 50,
          max: numValue + 50,
        },
      });
    }
  };

  // Handle option type filter change
  const handleOptionTypeChange = (optionType: 'CE' | 'PE', checked: boolean) => {
    const currentTypes = filters.optionType || ['CE', 'PE'];
    let newTypes: ('CE' | 'PE')[];

    if (checked) {
      newTypes = currentTypes.includes(optionType) ? currentTypes : [...currentTypes, optionType];
    } else {
      newTypes = currentTypes.filter(type => type !== optionType);
    }

    // Ensure at least one type is selected
    if (newTypes.length === 0) {
      newTypes = optionType === 'CE' ? ['PE'] : ['CE'];
    }

    onFiltersChange({
      ...filters,
      optionType: newTypes,
    });
  };

  // Handle moneyness filter change
  const handleMoneynessChange = (moneyness: OptionMoneyness, checked: boolean) => {
    const currentMoneyness = filters.moneyness || ['ITM', 'ATM', 'OTM'];
    let newMoneyness: OptionMoneyness[];

    if (checked) {
      newMoneyness = currentMoneyness.includes(moneyness) ? currentMoneyness : [...currentMoneyness, moneyness];
    } else {
      newMoneyness = currentMoneyness.filter(m => m !== moneyness);
    }

    // Ensure at least one moneyness is selected
    if (newMoneyness.length === 0) {
      newMoneyness = ['ITM', 'ATM', 'OTM'].filter(m => m !== moneyness) as OptionMoneyness[];
    }

    onFiltersChange({
      ...filters,
      moneyness: newMoneyness,
    });
  };

  // Handle volume filter change
  const handleVolumeFilterChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || value === '') {
      const newFilters = { ...filters };
      delete newFilters.minVolume;
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({
        ...filters,
        minVolume: numValue,
      });
    }
  };

  // Handle open interest filter change
  const handleOIFilterChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || value === '') {
      const newFilters = { ...filters };
      delete newFilters.minOI;
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({
        ...filters,
        minOI: numValue,
      });
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Header */}
        <div className="flex items-center justify-between lg:justify-start">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </h4>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Strike Price Search */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Strike Price
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder={`Around ${spotPrice}`}
                onChange={(e) => handleStrikePriceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Option Type Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Option Type
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!filters.optionType || filters.optionType.includes('CE')}
                  onChange={(e) => handleOptionTypeChange('CE', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Calls</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!filters.optionType || filters.optionType.includes('PE')}
                  onChange={(e) => handleOptionTypeChange('PE', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Puts</span>
              </label>
            </div>
          </div>

          {/* Moneyness Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Moneyness
            </label>
            <div className="flex gap-3">
              {(['ITM', 'ATM', 'OTM'] as OptionMoneyness[]).map((moneyness) => (
                <label key={moneyness} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!filters.moneyness || filters.moneyness.includes(moneyness)}
                    onChange={(e) => handleMoneynessChange(moneyness, e.target.checked)}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{moneyness}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Volume Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Min Volume
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              onChange={(e) => handleVolumeFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
            />
          </div>

          {/* Open Interest Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Min OI
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              onChange={(e) => handleOIFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            {filters.strikeRange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-sm rounded-full">
                Strike: {filters.strikeRange.min}-{filters.strikeRange.max}
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.strikeRange;
                    onFiltersChange(newFilters);
                  }}
                  className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                >
                  ×
                </button>
              </span>
            )}
            {filters.optionType && filters.optionType.length < 2 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                {filters.optionType[0] === 'CE' ? 'Calls Only' : 'Puts Only'}
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.optionType;
                    onFiltersChange(newFilters);
                  }}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            {filters.moneyness && filters.moneyness.length < 3 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full">
                {filters.moneyness.join(', ')}
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.moneyness;
                    onFiltersChange(newFilters);
                  }}
                  className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                >
                  ×
                </button>
              </span>
            )}
            {filters.minVolume && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm rounded-full">
                Volume ≥ {filters.minVolume}
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.minVolume;
                    onFiltersChange(newFilters);
                  }}
                  className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            )}
            {filters.minOI && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm rounded-full">
                OI ≥ {filters.minOI}
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.minOI;
                    onFiltersChange(newFilters);
                  }}
                  className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionChainFilters;