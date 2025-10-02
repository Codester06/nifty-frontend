import { StructuredError } from '../utils/errorHandler';

export interface ErrorNotification {
  id: string;
  error: StructuredError;
  timestamp: Date;
  dismissed: boolean;
  autoHide: boolean;
  duration?: number;
}

export interface ErrorNotificationOptions {
  autoHide?: boolean;
  duration?: number;
  persistent?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Centralized error notification service
 * Manages error notifications across the application
 */
export class ErrorNotificationService {
  private static instance: ErrorNotificationService;
  private notifications: ErrorNotification[] = [];
  private listeners: ((notifications: ErrorNotification[]) => void)[] = [];
  private maxNotifications = 5;

  private constructor() {}

  static getInstance(): ErrorNotificationService {
    if (!ErrorNotificationService.instance) {
      ErrorNotificationService.instance = new ErrorNotificationService();
    }
    return ErrorNotificationService.instance;
  }

  /**
   * Show error notification
   */
  showError(error: StructuredError, options: ErrorNotificationOptions = {}): string {
    const id = this.generateId();
    const notification: ErrorNotification = {
      id,
      error,
      timestamp: new Date(),
      dismissed: false,
      autoHide: options.autoHide ?? this.shouldAutoHide(error),
      duration: options.duration ?? this.getDefaultDuration(error),
    };

    // Add to notifications list
    this.notifications.unshift(notification);

    // Maintain max notifications limit
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Auto-hide if configured
    if (notification.autoHide && notification.duration) {
      setTimeout(() => {
        this.dismissNotification(id);
      }, notification.duration);
    }

    // Notify listeners
    this.notifyListeners();

    return id;
  }

  /**
   * Dismiss notification
   */
  dismissNotification(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.notifyListeners();
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get active notifications
   */
  getNotifications(): ErrorNotification[] {
    return this.notifications.filter(n => !n.dismissed);
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: ErrorNotification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Check if error should auto-hide
   */
  private shouldAutoHide(error: StructuredError): boolean {
    // Don't auto-hide critical errors or authentication errors
    if (error.severity === 'critical' || error.category === 'authentication') {
      return false;
    }
    
    // Auto-hide network errors and low severity errors
    return error.category === 'network' || error.severity === 'low';
  }

  /**
   * Get default duration based on error severity
   */
  private getDefaultDuration(error: StructuredError): number {
    switch (error.severity) {
      case 'critical':
        return 0; // Never auto-hide
      case 'high':
        return 10000; // 10 seconds
      case 'medium':
        return 7000; // 7 seconds
      case 'low':
      default:
        return 5000; // 5 seconds
    }
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const activeNotifications = this.getNotifications();
    this.listeners.forEach(listener => listener(activeNotifications));
  }
}

// Export singleton instance
export const errorNotificationService = ErrorNotificationService.getInstance();