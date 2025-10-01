import React from 'react';
import { Loader2, TrendingUp, Database, Wifi, Clock } from 'lucide-react';

interface ProfessionalLoadingStateProps {
  type?: 'stock' | 'chart' | 'data' | 'general';
  message?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'card' | 'inline' | 'overlay' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
}

const ProfessionalLoadingState: React.FC<ProfessionalLoadingStateProps> = ({
  type = 'general',
  message,
  progress,
  showProgress = false,
  variant = 'card',
  size = 'md'
}) => {
  const getLoadingMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'stock':
        return 'Loading real-time stock data...';
      case 'chart':
        return 'Generating professional charts...';
      case 'data':
        return 'Fetching market data...';
      default:
        return 'Loading...';
    }
  };

  const getLoadingIcon = () => {
    switch (type) {
      case 'stock':
        return TrendingUp;
      case 'chart':
        return TrendingUp;
      case 'data':
        return Database;
      default:
        return Loader2;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'h-4 w-4',
          text: 'text-sm',
          spinner: 'h-4 w-4'
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'h-8 w-8',
          text: 'text-lg',
          spinner: 'h-8 w-8'
        };
      default:
        return {
          container: 'p-6',
          icon: 'h-6 w-6',
          text: 'text-base',
          spinner: 'h-6 w-6'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const LoadingIcon = getLoadingIcon();

  if (variant === 'skeleton') {
    return (
      <div className="animate-pulse">
        {type === 'stock' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {type === 'chart' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        )}
        
        {type === 'data' && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
        <Loader2 className={`${sizeClasses.spinner} animate-spin`} />
        <span className={sizeClasses.text}>{getLoadingMessage()}</span>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <LoadingIcon className={`${sizeClasses.icon} text-blue-600 dark:text-blue-400`} />
              <Loader2 className={`${sizeClasses.spinner} animate-spin absolute inset-0 text-blue-600 dark:text-blue-400 opacity-50`} />
            </div>
          </div>
          
          <p className={`${sizeClasses.text} font-medium text-gray-900 dark:text-white mb-2`}>
            {getLoadingMessage()}
          </p>
          
          {showProgress && progress !== undefined && (
            <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Wifi className="h-3 w-3" />
              <span>Secure Connection</span>
            </div>
            <div className="flex items-center space-x-1">
              <Database className="h-3 w-3" />
              <span>Real-time Data</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${sizeClasses.container}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className={`p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700`}>
              <LoadingIcon className={`${sizeClasses.icon} text-blue-600 dark:text-blue-400`} />
            </div>
            <Loader2 className={`${sizeClasses.spinner} animate-spin absolute top-3 left-3 text-blue-600 dark:text-blue-400 opacity-50`} />
          </div>
        </div>
        
        <h3 className={`${sizeClasses.text} font-semibold text-gray-900 dark:text-white mb-2`}>
          {getLoadingMessage()}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Please wait while we fetch the latest data from our secure sources
        </p>
        
        {showProgress && progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Secure Connection</span>
          </div>
          <div className="flex items-center space-x-1">
            <Database className="h-3 w-3" />
            <span>Real-time Data</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLoadingState;