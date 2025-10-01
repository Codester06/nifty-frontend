import React from 'react';
import { CheckCircle, Shield, Info, Star } from 'lucide-react';

interface NoHiddenFeesIndicatorProps {
  variant?: 'badge' | 'banner' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  customMessage?: string;
}

const NoHiddenFeesIndicator: React.FC<NoHiddenFeesIndicatorProps> = ({
  variant = 'badge',
  size = 'md',
  showDetails = false,
  customMessage
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3',
          text: 'text-xs'
        };
      case 'lg':
        return {
          container: 'px-4 py-3 text-base',
          icon: 'h-6 w-6',
          text: 'text-base'
        };
      default:
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'h-4 w-4',
          text: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center space-x-1">
        <CheckCircle className={`${sizeClasses.icon} text-green-500`} />
        <span className={`${sizeClasses.text} font-medium text-green-600 dark:text-green-400`}>
          {customMessage || 'No Hidden Fees'}
        </span>
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`
        inline-flex items-center space-x-1.5 rounded-full border font-medium
        ${sizeClasses.container}
        bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 
        border-green-200 dark:border-green-700
        transition-all duration-200 hover:shadow-sm
      `}>
        <CheckCircle className={`${sizeClasses.icon} text-green-600 dark:text-green-400`} />
        <span className={sizeClasses.text}>
          {customMessage || 'No Hidden Fees'}
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              {customMessage || 'Transparent Pricing - No Hidden Fees'}
            </h3>
            {showDetails && (
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                All costs are clearly displayed upfront. What you see is what you pay - no surprises, no hidden charges.
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-1">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Guaranteed
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            {customMessage || 'No Hidden Fees Policy'}
          </h4>
          {showDetails && (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We believe in complete transparency. All fees and charges are clearly disclosed before you proceed.
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Upfront Pricing
                  </span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Clear Breakdown
                  </span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <Star className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Trusted Platform
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoHiddenFeesIndicator;