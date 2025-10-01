export interface SecurityBadge {
  type: 'ssl' | 'encryption' | 'compliance' | 'verification';
  label: string;
  icon: string;
  verified: boolean;
  tooltip: string;
}

export interface SocialProofData {
  totalUsers: number;
  activeUsers: number;
  successfulTrades: number;
  platformUptime: number;
  verifiedAccounts: number;
  totalVolume: number;
}

export interface TrustMetrics {
  securityScore: number;
  userSatisfactionRating: number;
  platformReliability: number;
  dataAccuracy: number;
  supportResponseTime: number;
}

export interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  kycCompleted: boolean;
  bankAccountLinked: boolean;
  twoFactorEnabled: boolean;
}

export interface PlatformStats {
  totalUsers: number;
  activeToday: number;
  tradesExecuted: number;
  uptime: number;
  averageResponseTime: number;
  userRating: number;
}

export interface SupportOption {
  type: 'chat' | 'phone' | 'email' | 'faq';
  label: string;
  availability: 'online' | 'offline' | 'busy';
  responseTime: string;
  icon: string;
}

export interface TransparencyInfo {
  title: string;
  description: string;
  fees: Array<{
    name: string;
    amount: number | string;
    description: string;
  }>;
  noHiddenFees: boolean;
}