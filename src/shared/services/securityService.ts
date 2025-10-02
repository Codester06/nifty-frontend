import { auditService } from './auditService';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Security service for anti-manipulation measures and security controls
 */

export interface SecurityConfig {
  maxTradesPerMinute: number;
  maxCoinTransferPerHour: number;
  suspiciousActivityThreshold: number;
  ipWhitelist?: string[];
  blockedIPs: string[];
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
}

export interface SecurityCheck {
  isAllowed: boolean;
  reason?: string;
  riskScore: number;
  recommendedAction: 'allow' | 'warn' | 'block' | 'require_verification';
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Security service for protecting the trading system
 */
export class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  private blockedUsers = new Set<string>();
  private suspiciousUsers = new Map<string, { score: number; lastUpdate: Date }>();
  private activeSessions = new Map<string, Set<string>>(); // userId -> Set of sessionIds

  private constructor() {
    this.config = {
      maxTradesPerMinute: 10,
      maxCoinTransferPerHour: 50000,
      suspiciousActivityThreshold: 70,
      blockedIPs: [],
      sessionTimeoutMinutes: 30,
      maxConcurrentSessions: 3,
    };
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Check if trading action is allowed
   */
  checkTradingAction(
    userId: string,
    action: string,
    details: Record<string, any>,
    ipAddress?: string
  ): SecurityCheck {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check if user is blocked
    if (this.blockedUsers.has(userId)) {
      return {
        isAllowed: false,
        reason: 'User account is temporarily blocked',
        riskScore: 100,
        recommendedAction: 'block',
      };
    }

    // Check IP address
    if (ipAddress && this.config.blockedIPs.includes(ipAddress)) {
      auditService.logSecurityEvent(
        userId,
        'blocked_ip_access_attempt',
        { ipAddress, action },
        'high',
        ipAddress
      );
      
      return {
        isAllowed: false,
        reason: 'Access from blocked IP address',
        riskScore: 100,
        recommendedAction: 'block',
      };
    }

    // Check rate limits
    const rateLimitCheck = this.checkRateLimit(userId, 'trading', {
      windowMs: 60000, // 1 minute
      maxRequests: this.config.maxTradesPerMinute,
    });

    if (!rateLimitCheck.isAllowed) {
      riskScore += 30;
      reasons.push('Trading rate limit exceeded');
    }

    // Check for suspicious patterns
    const suspiciousActivity = auditService.detectSuspiciousActivity(userId, 60);
    if (suspiciousActivity.isSuspicious) {
      riskScore += suspiciousActivity.riskScore * 0.5;
      reasons.push(...suspiciousActivity.reasons);
    }

    // Check coin balance manipulation
    if (action === 'trade' && details.coinAmount) {
      const balanceCheck = this.checkBalanceManipulation(userId, details.coinAmount);
      if (!balanceCheck.isAllowed) {
        riskScore += 40;
        reasons.push(balanceCheck.reason || 'Suspicious balance activity');
      }
    }

    // Determine recommendation based on risk score
    let recommendedAction: SecurityCheck['recommendedAction'] = 'allow';
    if (riskScore >= 80) {
      recommendedAction = 'block';
    } else if (riskScore >= 60) {
      recommendedAction = 'require_verification';
    } else if (riskScore >= 30) {
      recommendedAction = 'warn';
    }

    // Log security check
    auditService.logSecurityEvent(
      userId,
      'security_check',
      {
        action,
        riskScore,
        reasons,
        recommendedAction,
        details,
      },
      riskScore >= 50 ? 'high' : 'medium',
      ipAddress
    );

    return {
      isAllowed: riskScore < 80,
      reason: reasons.length > 0 ? reasons.join('; ') : undefined,
      riskScore,
      recommendedAction,
    };
  }

  /**
   * Check coin transfer/purchase security
   */
  checkCoinTransfer(
    userId: string,
    amount: number,
    type: 'purchase' | 'debit' | 'credit',
    ipAddress?: string
  ): SecurityCheck {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check if user is blocked
    if (this.blockedUsers.has(userId)) {
      return {
        isAllowed: false,
        reason: 'User account is temporarily blocked',
        riskScore: 100,
        recommendedAction: 'block',
      };
    }

    // Check for large amounts
    if (amount > 10000) {
      riskScore += 20;
      reasons.push('Large coin transfer amount');
    }

    // Check hourly limits for purchases
    if (type === 'purchase') {
      const hourlyLimit = this.checkHourlyCoinLimit(userId, amount);
      if (!hourlyLimit.isAllowed) {
        riskScore += 50;
        reasons.push('Hourly coin purchase limit exceeded');
      }
    }

    // Check for rapid consecutive transfers
    const recentTransfers = this.getRecentCoinTransfers(userId, 10); // Last 10 minutes
    if (recentTransfers.length >= 5) {
      riskScore += 30;
      reasons.push('Multiple rapid coin transfers');
    }

    // Check for suspicious patterns
    const suspiciousActivity = auditService.detectSuspiciousActivity(userId, 30);
    if (suspiciousActivity.isSuspicious) {
      riskScore += suspiciousActivity.riskScore * 0.3;
      reasons.push('Suspicious user activity detected');
    }

    let recommendedAction: SecurityCheck['recommendedAction'] = 'allow';
    if (riskScore >= 70) {
      recommendedAction = 'block';
    } else if (riskS