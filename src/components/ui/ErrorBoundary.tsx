import React, { Component, ReactNode } from 'react';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { ErrorHandler, StructuredError } from '../../shared/utils/errorHandler';
import { MobileErrorState, TouchFriendlyButton } from './MobileLoadingStates';

interface ErrorBoundaryState {
  hasError: boolean;
  error: StructuredError | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: StructuredError, retry: () => void) => ReactNode;
  onError?: (error: StructuredError, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean; // If true, only catches errors from direct children
}

/**
 * Generic Error Boundary component for catching and handling React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const structuredError = ErrorHandler.handleError(error);
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error: structuredError,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const structuredError = ErrorHandler.handleError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(structuredError, errorInfo);
    }

    // Log error details
    console.error('Error Boundary caught an error:', {
      error: structuredError,
      errorInfo,
      errorId: this.state.errorId,
    });
  }

  handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  handleAutoRetry = () => {
    if (this.state.error && ErrorHandler.isRetryable(this.state.error)) {
      // Auto-retry after 5 seconds for retryable errors
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, 5000);
    }
  };

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // If error just occurred and it's retryable, set up auto-retry
    if (!prevState.hasError && this.state.hasError) {
      this.handleAutoRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Use default fallback UI
      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          onRetry={this.handleRetry}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default fallback UI component for error boundaries
 */
interface DefaultErrorFallbackProps {
  error: StructuredError;
  onRetry: () => void;
  errorId: string | null;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  errorId 
}) => {
  const isMobile = useIsMobile();

  // Use mobile-optimized error state for mobile devices
  if (isMobile) {
    return (
      <MobileErrorState
        title="Something went wrong"
        message={error.userMessage}
        onRetry={error.recoverable ? onRetry : undefined}
        retryLabel="Try Again"
        type="generic"
        className="min-h-[200px]"
      />
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${getSeverityColor(error.severity)}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon(error.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium mb-2">
            Something went wrong
          </h3>
          <p className="text-sm mb-4">
            {error.userMessage}
          </p>
          
          {error.recoverable && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              
              {error.retryable && (
                <span className="text-xs text-gray-500 self-center">
                  Auto-retry in 5 seconds...
                </span>
              )}
            </div>
          )}

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs cursor-pointer text-gray-500 hover:text-gray-700">
                Debug Information
              </summary>
              <div className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">
                <div><strong>Error ID:</strong> {errorId}</div>
                <div><strong>Code:</strong> {error.code}</div>
                <div><strong>Category:</strong> {error.category}</div>
                <div><strong>Severity:</strong> {error.severity}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.context && (
                  <div><strong>Context:</strong> {JSON.stringify(error.context, null, 2)}</div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Specialized Error Boundary for Options Trading components
 */
export const OptionsErrorBoundary: React.FC<{
  children: ReactNode;
  onError?: (error: StructuredError) => void;
}> = ({ children, onError }) => {
  const handleOptionsError = (error: StructuredError, retry: () => void) => {
    // Call custom error handler
    if (onError) {
      onError(error);
    }

    // Use mobile-optimized error state
    return (
      <MobileErrorState
        title="Options Trading Unavailable"
        message={error.userMessage}
        onRetry={error.recoverable ? retry : undefined}
        retryLabel="Reload Options Data"
        type="data"
        className="min-h-[300px]"
      />
    );
  };

  return (
    <ErrorBoundary fallback={handleOptionsError}>
      {children}
    </ErrorBoundary>
  );
};

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}