/**
 * Audit logging service for tracking all trading activities
 * Provides comprehensive logging for security and compliance
 */

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'trading' | 'coin_management' | 'admin' | 'security';
  success: boolean;
  errorMessage?: string;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  category?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Audit service for logging and querying audit events
 */
export class AuditService {
  private static instance: AuditService;
  private auditLog: AuditLogEntry[] = [];
  private maxLogSize = 10000; // Keep last 10k entries in memory

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an audit event
   */
  logEvent(event: Omit<AuditLogEntry, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const auditEntry: AuditLogEntry = {
      ...event,
      id,
      timestamp: new Date(),
    };

    // Add to in-memory log
    this.auditLog.unshift(auditEntry);

    // Maintain log size limit
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(0, this.maxLogSize);
    }

    // In production, this would also write to persistent storage
    this.persistAuditEntry(auditEntry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${event.category.toUpperCase()}: ${event.action}`, auditEntry);
    }

    return id;
  }

  /**
   * Log trading activity
   */
  logTradingActivity(
    userId: string,
    action: string,
    details: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): string {
    return this.logEvent({
      userId,
      action,
      resource: 'trade',
      resourceId: details.tradeId || details.orderId,
      details,
      severity: success ? 'medium' : 'high',
      category: 'trading',
      success,
      errorMessage,
    });
  }

  /**
   * Log coin management activity
   */
  logCoinActivity(
    userId: string,
    action: string,
    details: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): string {
    return this.logEvent({
      userId,
      action,
      resource: 'coin_balance',
      resourceId: details.transactionId,
      details,
      severity: 'medium',
      category: 'coin_management',
      success,
      errorMessage,
    });
  }

  /**
   * Log authentication activity
   */
  logAuthActivity(
    userId: string,
    action: string,
    details: Record<string, any>,
    success: boolean = true,
    errorMessage?: string,
    ipAddress?: string,
    userAgent?: string
  ): string {
    return this.logEvent({
      userId,
      action,
      resource: 'user_session',
      details,
      ipAddress,
      userAgent,
      severity: success ? 'low' : 'high',
      category: 'authentication',
      success,
      errorMessage,
    });
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    userId: string,
    action: string,
    details: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
    ipAddress?: string,
    userAgent?: string
  ): string {
    return this.logEvent({
      userId,
      action,
      resource: 'security',
      details,
      ipAddress,
      userAgent,
      severity,
      category: 'security',
      success: false, // Security events are typically failures or suspicious activities
    });
  }

  /**
   * Log admin activity
   */
  logAdminActivity(
    userId: string,
    action: string,
    details: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): string {
    return this.logEvent({
      userId,
      action,
      resource: 'admin_action',
      details,
      severity: 'high',
      category: 'admin',
      success,
      errorMessage,
    });
  }

  /**
   * Query audit logs
   */
  queryLogs(query: AuditQuery): AuditLogEntry[] {
    let filteredLogs = [...this.auditLog];

    // Apply filters
    if (query.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
    }

    if (query.action) {
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(query.action!.toLowerCase())
      );
    }

    if (query.category) {
      filteredLogs = filteredLogs.filter(log => log.category === query.category);
    }

    if (query.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === query.severity);
    }

    if (query.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === query.success);
    }

    if (query.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return filteredLogs.slice(offset, offset + limit);
  }

  /**
   * Get audit statistics
   */
  getAuditStats(timeRange?: { start: Date; end: Date }): {
    totalEvents: number;
    eventsByCategory: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    successRate: number;
    recentFailures: AuditLogEntry[];
  } {
    let logs = this.auditLog;

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      );
    }

    const eventsByCategory: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    let successCount = 0;

    logs.forEach(log => {
      eventsByCategory[log.category] = (eventsByCategory[log.category] || 0) + 1;
      eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1;
      if (log.success) successCount++;
    });

    const recentFailures = logs
      .filter(log => !log.success)
      .slice(0, 10); // Last 10 failures

    return {
      totalEvents: logs.length,
      eventsByCategory,
      eventsBySeverity,
      successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
      recentFailures,
    };
  }

  /**
   * Detect suspicious activity patterns
   */
  detectSuspiciousActivity(userId: string, timeWindowMinutes: number = 60): {
    isSuspicious: boolean;
    reasons: string[];
    riskScore: number;
  } {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const userLogs = this.auditLog.filter(log => 
      log.userId === userId && log.timestamp >= cutoffTime
    );

    const reasons: string[] = [];
    let riskScore = 0;

    // Check for excessive failed login attempts
    const failedLogins = userLogs.filter(log => 
      log.category === 'authentication' && log.action === 'login' && !log.success
    ).length;
    
    if (failedLogins >= 5) {
      reasons.push(`${failedLogins} failed login attempts in ${timeWindowMinutes} minutes`);
      riskScore += 30;
    }

    // Check for rapid trading activity
    const tradingActions = userLogs.filter(log => log.category === 'trading').length;
    if (tradingActions >= 20) {
      reasons.push(`${tradingActions} trading actions in ${timeWindowMinutes} minutes`);
      riskScore += 20;
    }

    // Check for large coin transactions
    const largeCoinTransactions = userLogs.filter(log => 
      log.category === 'coin_management' && 
      log.details.amount && 
      log.details.amount > 10000
    ).length;
    
    if (largeCoinTransactions >= 3) {
      reasons.push(`${largeCoinTransactions} large coin transactions in ${timeWindowMinutes} minutes`);
      riskScore += 25;
    }

    // Check for multiple IP addresses
    const uniqueIPs = new Set(userLogs.map(log => log.ipAddress).filter(Boolean));
    if (uniqueIPs.size >= 3) {
      reasons.push(`Activity from ${uniqueIPs.size} different IP addresses`);
      riskScore += 40;
    }

    // Check for security events
    const securityEvents = userLogs.filter(log => log.category === 'security').length;
    if (securityEvents > 0) {
      reasons.push(`${securityEvents} security events triggered`);
      riskScore += 50;
    }

    return {
      isSuspicious: riskScore >= 50,
      reasons,
      riskScore: Math.min(riskScore, 100),
    };
  }

  /**
   * Clear old audit logs (for maintenance)
   */
  clearOldLogs(olderThanDays: number): number {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const initialCount = this.auditLog.length;
    
    this.auditLog = this.auditLog.filter(log => log.timestamp >= cutoffDate);
    
    return initialCount - this.auditLog.length;
  }

  /**
   * Export audit logs for compliance
   */
  exportLogs(query: AuditQuery, format: 'json' | 'csv' = 'json'): string {
    const logs = this.queryLogs(query);
    
    if (format === 'csv') {
      const headers = ['ID', 'User ID', 'Action', 'Resource', 'Category', 'Severity', 'Success', 'Timestamp', 'Details'];
      const csvRows = logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.resource,
        log.category,
        log.severity,
        log.success.toString(),
        log.timestamp.toISOString(),
        JSON.stringify(log.details),
      ]);
      
      return [headers, ...csvRows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Generate unique ID for audit entries
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persist audit entry to storage (placeholder)
   */
  private persistAuditEntry(entry: AuditLogEntry): void {
    // In production, this would write to database, file system, or external logging service
    // For now, we'll just store in localStorage for demo purposes
    try {
      const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      existingLogs.unshift(entry);
      
      // Keep only last 1000 entries in localStorage
      const trimmedLogs = existingLogs.slice(0, 1000);
      localStorage.setItem('auditLogs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.warn('Failed to persist audit entry:', error);
    }
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();

// Utility functions for common audit scenarios

/**
 * Audit decorator for functions
 */
export function auditAction(
  action: string,
  category: AuditLogEntry['category'],
  severity: AuditLogEntry['severity'] = 'medium'
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const userId = this.userId || args[0]?.userId || 'unknown';
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        
        auditService.logEvent({
          userId,
          action,
          resource: target.constructor.name,
          details: {
            method: propertyName,
            args: args.length,
            duration: Date.now() - startTime,
          },
          severity,
          category,
          success: true,
        });
        
        return result;
      } catch (error) {
        auditService.logEvent({
          userId,
          action,
          resource: target.constructor.name,
          details: {
            method: propertyName,
            args: args.length,
            duration: Date.now() - startTime,
          },
          severity: 'high',
          category,
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        
        throw error;
      }
    };
  };
}

/**
 * Middleware for automatic request auditing
 */
export const auditMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    auditService.logEvent({
      userId: req.user?.id || 'anonymous',
      action: `${req.method} ${req.path}`,
      resource: 'api_request',
      details: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userAgent: req.headers['user-agent'],
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: success ? 'low' : 'medium',
      category: 'security',
      success,
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};