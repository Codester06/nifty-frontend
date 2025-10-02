import React from 'react';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  Wifi, 
  WifiOff,
  TrendingUp,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react';

interface MobileSkeletonLoaderProps {
  type?: 'card' | 'list' | 'table' | 'chart' | 'option-chain';
  count?: number;
  className?: string;
}

interface MobileSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

interface MobileErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: 'network' | 'data' | 'generic';
  className?: string;
}

interface TouchFriendlyButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

// Mobile-optimized skeleton loader
export const MobileSkeletonLoader: React.FC<MobileSkeletonLoaderProps> = ({
  type = 'card',
  count = 3,
  className = ''
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Return desktop skeleton for non-mobile
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderSkeletonByType = () => {
    switch (type) {
      case 'card':
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
            <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        );

      case 'option-chain':
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        );
    }
  };

  return <div className={className}>{renderSkeletonByType()}</div>;
};

// Mobile-optimized spinner
export const MobileSpinner: React.FC<MobileSpinnerProps> = ({
  size = 'md',
  message,
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  const sizeClasses = {
    sm: isMobile ? 'h-4 w-4' : 'h-4 w-4',
    md: isMobile ? 'h-6 w-6' : 'h-6 w-6',
    lg: isMobile ? 'h-8 w-8' : 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: isMobile ? 'text-xs' : 'text-sm',
    md: isMobile ? 'text-sm' : 'text-base',
    lg: isMobile ? 'text-base' : 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-8' : 'py-12'} ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`} />
      {message && (
        <p className={`mt-3 text-gray-600 dark:text-gray-400 text-center ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Mobile-optimized error state
export const MobileErrorState: React.FC<MobileErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  type = 'generic',
  className = ''
}) => {
  const isMobile = useIsMobile();

  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className={`text-red-500 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />;
      case 'data':
        return <BarChart3 className={`text-orange-500 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />;
      default:
        return <AlertCircle className={`text-red-500 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Error';
      case 'data':
        return 'Data Unavailable';
      default:
        return 'Something went wrong';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'network':
        return isMobile 
          ? 'Check your internet connection and try again.'
          : 'Please check your internet connection and try again.';
      case 'data':
        return isMobile
          ? 'Unable to load data. Please try again.'
          : 'Unable to load the requested data. Please try again.';
      default:
        return isMobile
          ? 'An error occurred. Please try again.'
          : 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${
      isMobile ? 'py-8 px-4' : 'py-12 px-6'
    } ${className}`}>
      <div className="mb-4">
        {getErrorIcon()}
      </div>
      
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${
        isMobile ? 'text-base' : 'text-lg'
      }`}>
        {title || getDefaultTitle()}
      </h3>
      
      <p className={`text-gray-600 dark:text-gray-400 mb-6 max-w-sm ${
        isMobile ? 'text-sm' : 'text-base'
      }`}>
        {message || getDefaultMessage()}
      </p>

      {onRetry && (
        <TouchFriendlyButton
          onClick={onRetry}
          variant="primary"
          size={isMobile ? 'md' : 'lg'}
        >
          <RefreshCw className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          {retryLabel}
        </TouchFriendlyButton>
      )}
    </div>
  );
};

// Touch-friendly button component
export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const isMobile = useIsMobile();

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isMobile ? 'active:scale-95' : 'hover:scale-105'}
  `;

  const variantClasses = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
      ${isMobile ? 'active:bg-blue-800' : ''}
    `,
    secondary: `
      bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white 
      hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500
      ${isMobile ? 'active:bg-gray-400 dark:active:bg-gray-500' : ''}
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700 focus:ring-red-500
      ${isMobile ? 'active:bg-red-800' : ''}
    `
  };

  const sizeClasses = {
    sm: isMobile ? 'px-3 py-2 text-sm min-h-[40px]' : 'px-3 py-2 text-sm',
    md: isMobile ? 'px-4 py-3 text-base min-h-[44px]' : 'px-4 py-2 text-base',
    lg: isMobile ? 'px-6 py-4 text-lg min-h-[48px]' : 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Loading states for specific components
export const MobileChartLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col items-center justify-center ${
      isMobile ? 'py-12' : 'py-16'
    } ${className}`}>
      <div className="relative">
        <TrendingUp className={`animate-pulse text-blue-600 dark:text-blue-400 ${
          isMobile ? 'h-12 w-12' : 'h-16 w-16'
        }`} />
        <div className="absolute -top-1 -right-1">
          <Loader2 className={`animate-spin text-blue-600 dark:text-blue-400 ${
            isMobile ? 'h-4 w-4' : 'h-6 w-6'
          }`} />
        </div>
      </div>
      <p className={`mt-4 text-gray-600 dark:text-gray-400 text-center ${
        isMobile ? 'text-sm' : 'text-base'
      }`}>
        Loading chart data...
      </p>
    </div>
  );
};

export const MobileOptionChainLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col items-center justify-center ${
      isMobile ? 'py-12' : 'py-16'
    } ${className}`}>
      <div className="relative">
        <Activity className={`animate-pulse text-orange-600 dark:text-orange-400 ${
          isMobile ? 'h-12 w-12' : 'h-16 w-16'
        }`} />
        <div className="absolute -top-1 -right-1">
          <Loader2 className={`animate-spin text-orange-600 dark:text-orange-400 ${
            isMobile ? 'h-4 w-4' : 'h-6 w-6'
          }`} />
        </div>
      </div>
      <p className={`mt-4 text-gray-600 dark:text-gray-400 text-center ${
        isMobile ? 'text-sm' : 'text-base'
      }`}>
        Loading option chain...
      </p>
    </div>
  );
};

export const MobilePortfolioLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col items-center justify-center ${
      isMobile ? 'py-12' : 'py-16'
    } ${className}`}>
      <div className="relative">
        <BarChart3 className={`animate-pulse text-green-600 dark:text-green-400 ${
          isMobile ? 'h-12 w-12' : 'h-16 w-16'
        }`} />
        <div className="absolute -top-1 -right-1">
          <Loader2 className={`animate-spin text-green-600 dark:text-green-400 ${
            isMobile ? 'h-4 w-4' : 'h-6 w-6'
          }`} />
        </div>
      </div>
      <p className={`mt-4 text-gray-600 dark:text-gray-400 text-center ${
        isMobile ? 'text-sm' : 'text-base'
      }`}>
        Loading portfolio...
      </p>
    </div>
  );
};

// Network status indicator
export const NetworkStatusIndicator: React.FC<{ 
  isOnline: boolean; 
  className?: string;
}> = ({ isOnline, className = '' }) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className={`fixed top-20 left-4 right-4 z-40 ${className}`}>
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-down">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">No internet connection</span>
        </div>
      )}
    </div>
  );
};

export default {
  MobileSkeletonLoader,
  MobileSpinner,
  MobileErrorState,
  TouchFriendlyButton,
  MobileChartLoading,
  MobileOptionChainLoading,
  MobilePortfolioLoading,
  NetworkStatusIndicator
};