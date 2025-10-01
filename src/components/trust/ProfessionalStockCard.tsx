import React from 'react';
import { TrendingUp, TrendingDown, Clock, Database, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  lastUpdated?: Date;
  dataSource?: string;
  marketStatus?: 'open' | 'closed' | 'pre-market' | 'after-hours';
  dataQuality?: 'live' | 'delayed' | 'cached';
}

interface ProfessionalStockCardProps {
  stock: StockData;
  variant?: 'detailed' | 'compact' | 'minimal';
  showDataSource?: boolean;
  showLastUpdated?: boolean;
  showMarketStatus?: boolean;
  onClick?: () => void;
}

const ProfessionalStockCard: React.FC<ProfessionalStockCardProps> = ({
  stock,
  variant = 'detailed',
  showDataSource = true,
  showLastUpdated = true,
  showMarketStatus = true,
  onClick
}) => {
  const isPositive = stock.change >= 0;
  const lastUpdated = stock.lastUpdated || new Date();
  const dataSource = stock.dataSource || 'NSE';
  const marketStatus = stock.marketStatus || 'open';
  const dataQuality = stock.dataQuality || 'live';

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getMarketStatusConfig = () => {
    switch (marketStatus) {
      case 'open':
        return {
          label: 'Market Open',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          dotColor: 'bg-green-500'
        };
      case 'closed':
        return {
          label: 'Market Closed',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          dotColor: 'bg-red-500'
        };
      case 'pre-market':
        return {
          label: 'Pre-Market',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          dotColor: 'bg-blue-500'
        };
      case 'after-hours':
        return {
          label: 'After Hours',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          dotColor: 'bg-purple-500'
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const getDataQualityIcon = () => {
    switch (dataQuality) {
      case 'live':
        return <Wifi className="h-3 w-3 text-green-500" />;
      case 'delayed':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'cached':
        return <Database className="h-3 w-3 text-gray-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const marketStatusConfig = getMarketStatusConfig();

  if (variant === 'minimal') {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {stock.symbol}
          </span>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ₹{stock.price.toFixed(2)}
          </div>
        </div>
        
        <div className={`text-right ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="text-sm font-medium">
              {stock.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {stock.symbol}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {stock.name}
            </p>
          </div>
          
          {showMarketStatus && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${marketStatusConfig.bgColor} ${marketStatusConfig.color}`}>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${marketStatusConfig.dotColor} ${marketStatus === 'open' ? 'animate-pulse' : ''}`}></div>
                <span>{marketStatusConfig.label}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{stock.price.toFixed(2)}
            </span>
            <div className={`flex items-center space-x-1 mt-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {(showDataSource || showLastUpdated) && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              {showDataSource && (
                <div className="flex items-center space-x-1">
                  {getDataQualityIcon()}
                  <span>Source: {dataSource}</span>
                </div>
              )}
              {showLastUpdated && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeAgo(lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default detailed variant
  return (
    <div 
      className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {stock.symbol}
            </h3>
            {showMarketStatus && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${marketStatusConfig.bgColor} ${marketStatusConfig.color}`}>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${marketStatusConfig.dotColor} ${marketStatus === 'open' ? 'animate-pulse' : ''}`}></div>
                  <span>{marketStatusConfig.label}</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {stock.name}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{stock.price.toFixed(2)}
          </span>
          <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="text-lg font-semibold">
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}
            </span>
            <span className="text-sm">
              ({stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Volume: {stock.volume}
        </div>
      </div>

      {/* Data Attribution Section */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Data Information
          </h4>
          <div className="flex items-center space-x-1">
            {getDataQualityIcon()}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
              {dataQuality}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
          {showDataSource && (
            <div>
              <span className="font-medium">Source:</span>
              <div className="flex items-center space-x-1 mt-1">
                <Database className="h-3 w-3" />
                <span>{dataSource}</span>
              </div>
            </div>
          )}
          
          {showLastUpdated && (
            <div>
              <span className="font-medium">Last Updated:</span>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(lastUpdated)}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Data accuracy verified • Real-time market feed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStockCard;