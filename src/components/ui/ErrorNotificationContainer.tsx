import React, { useEffect, useState } from 'react';
import { ErrorNotification, errorNotificationService } from '../../shared/services/errorNotificationService';
import { StructuredError } from '../../shared/utils/errorHandler';

interface ErrorNotificationItemProps {
  notification: ErrorNotification;
  onDismiss: (id: string) => void;
  onRetry?: () => void;
}

const ErrorNotificationItem: React.FC<ErrorNotificationItemProps> = ({
  notification,
  onDismiss,
  onRetry,
}) => {
  const { error } = notification;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'high':
        return 'bg-red-50 border-red-400 text-red-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      case 'low':
        return 'bg-blue-50 border-blue-400 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-700';
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-3 rounded-r-md shadow-sm ${getSeverityStyles(error.severity)}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon(error.severity)}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {error.userMessage}
          </p>
          {error.context?.details && (
            <p className="text-xs mt-1 opacity-75">
              {error.context.details}
            </p>
          )}
          <div className="mt-2 flex space-x-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="text-xs font-medium underline hover:no-underline"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-xs font-medium underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onDismiss(notification.id)}
            className="inline-flex text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Container component for displaying error notifications
 */
export const ErrorNotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = errorNotificationService.subscribe(setNotifications);
    
    // Get initial notifications
    setNotifications(errorNotificationService.getNotifications());

    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    errorNotificationService.dismissNotification(id);
  };

  const handleRetry = (notification: ErrorNotification) => {
    // Dismiss the notification first
    handleDismiss(notification.id);
    
    // If there's a retry callback in context, call it
    if (notification.error.context?.onRetry) {
      notification.error.context.onRetry();
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <ErrorNotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
            onRetry={() => handleRetry(notification)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Hook for showing error notifications
 */
export const useErrorNotification = () => {
  const showError = (error: StructuredError | Error | string, options?: {
    autoHide?: boolean;
    duration?: number;
    onRetry?: () => void;
  }) => {
    let structuredError: StructuredError;
    
    if (typeof error === 'string') {
      structuredError = {
        code: 'GENERIC_ERROR',
        message: error,
        category: 'system' as any,
        severity: 'medium' as any,
        userMessage: error,
        recoverable: true,
        retryable: false,
      };
    } else if (error instanceof Error) {
      structuredError = {
        code: 'JAVASCRIPT_ERROR',
        message: error.message,
        category: 'system' as any,
        severity: 'medium' as any,
        userMessage: error.message,
        recoverable: true,
        retryable: false,
      };
    } else {
      structuredError = error;
    }

    // Add retry callback to context if provided
    if (options?.onRetry) {
      structuredError.context = {
        ...structuredError.context,
        onRetry: options.onRetry,
      };
    }

    return errorNotificationService.showError(structuredError, options);
  };

  const dismissError = (id: string) => {
    errorNotificationService.dismissNotification(id);
  };

  const clearAllErrors = () => {
    errorNotificationService.clearAll();
  };

  return {
    showError,
    dismissError,
    clearAllErrors,
  };
};