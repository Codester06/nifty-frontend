import React from 'react';
import { StructuredError } from '../../shared/utils/errorHandler';

/**
 * Loading error fallback for when data fails to load
 */
export const LoadingErrorFallback: React.FC<{
  error: StructuredError;
  onRetry: () => void;
  title?: string;
}> = ({ error, onRetry, title = "Failed to load data" }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 mb-4 text-gray-400">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-4 max-w-sm">{error.userMessage}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Try Again
    </button>
  </div>
);

/**
 * Network error fallback with offline indicator
 */
export const NetworkErrorFallback: React.FC<{
  error: StructuredError;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-yellow-800">Connection Issue</h3>
        <p className="text-sm text-yellow-700 mt-1">{error.userMessage}</p>
        <div className="mt-3">
          <button
            onClick={onRetry}
            className="text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 rounded-md font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Authentication error fallback with login prompt
 */
export const AuthErrorFallback: React.FC<{
  error: StructuredError;
  onLogin?: () => void;
}> = ({ error, onLogin }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
    <div className="w-12 h-12 mx-auto mb-4 text-blue-500">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-blue-900 mb-2">Login Required</h3>
    <p className="text-sm text-blue-700 mb-4">{error.userMessage}</p>
    <button
      onClick={onLogin || (() => window.location.href = '/auth/login')}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Login to Continue
    </button>
  </div>
);

/**
 * Market closed fallback with demo mode option
 */
export const MarketClosedFallback: React.FC<{
  error: StructuredError;
  onEnableDemoMode?: () => void;
}> = ({ error, onEnableDemoMode }) => (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-orange-800">Market Closed</h3>
        <p className="text-sm text-orange-700 mt-1">{error.userMessage}</p>
        <div className="mt-3 text-xs text-orange-600">
          <p>Market Hours: 9:15 AM - 3:30 PM (IST)</p>
        </div>
        {onEnableDemoMode && (
          <div className="mt-4">
            <button
              onClick={onEnableDemoMode}
              className="text-sm bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-2 rounded-md font-medium"
            >
              Switch to Demo Mode
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * Option chain specific error fallback
 */
export const OptionChainErrorFallback: React.FC<{
  error: StructuredError;
  onRetry: () => void;
  underlying?: string;
}> = ({ error, onRetry, underlying }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Option Chain Unavailable
      </h3>
      <p className="text-sm text-gray-500 mb-1">
        {underlying ? `Unable to load options for ${underlying}` : 'Unable to load option chain'}
      </p>
      <p className="text-sm text-gray-500 mb-6">{error.userMessage}</p>
      
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reload Option Chain
        </button>
        
        <div className="text-xs text-gray-400">
          If the problem persists, try refreshing the page or selecting a different underlying asset.
        </div>
      </div>
    </div>
  </div>
);

/**
 * Trading error fallback for order placement failures
 */
export const TradingErrorFallback: React.FC<{
  error: StructuredError;
  onRetry?: () => void;
  onClose?: () => void;
}> = ({ error, onRetry, onClose }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">Order Failed</h3>
        <p className="text-sm text-red-700 mt-1">{error.userMessage}</p>
        <div className="mt-3 flex space-x-3">
          {onRetry && error.retryable && (
            <button
              onClick={onRetry}
              className="text-sm bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-md font-medium"
            >
              Try Again
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Generic empty state fallback
 */
export const EmptyStateFallback: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionLabel, onAction, icon }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
      {icon || (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

/**
 * Retry mechanism component with exponential backoff visualization
 */
export const RetryMechanism: React.FC<{
  onRetry: () => void;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  nextRetryIn?: number;
}> = ({ onRetry, isRetrying, retryCount, maxRetries, nextRetryIn }) => (
  <div className="flex items-center space-x-3">
    <button
      onClick={onRetry}
      disabled={isRetrying || retryCount >= maxRetries}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRetrying ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Retrying...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry ({retryCount}/{maxRetries})
        </>
      )}
    </button>
    
    {nextRetryIn && nextRetryIn > 0 && (
      <span className="text-xs text-gray-500">
        Auto-retry in {nextRetryIn}s
      </span>
    )}
  </div>
);