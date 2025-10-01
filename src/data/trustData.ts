import {
  SecurityBadge,
  SocialProofData,
  TrustMetrics,
  VerificationStatus,
  PlatformStats,
  SupportOption,
} from "../types/trust";

export const mockSecurityBadges: SecurityBadge[] = [
  {
    type: "ssl",
    label: "SSL Secured",
    icon: "lock",
    verified: true,
    tooltip: "Your connection is encrypted with 256-bit SSL",
  },
  {
    type: "encryption",
    label: "Data Encrypted",
    icon: "shield",
    verified: true,
    tooltip: "All data is encrypted using bank-level security",
  },
  {
    type: "compliance",
    label: "RBI Compliant",
    icon: "award",
    verified: true,
    tooltip: "Compliant with Reserve Bank of India regulations",
  },
  {
    type: "verification",
    label: "Verified Platform",
    icon: "check-circle",
    verified: true,
    tooltip: "Platform verified by regulatory authorities",
  },
];

export const mockSocialProofData: SocialProofData = {
  totalUsers: 125000,
  activeUsers: 8500,
  successfulTrades: 2500000,
  platformUptime: 99.9,
  verifiedAccounts: 98000,
  totalVolume: 50000000000, // 500 Cr
};

export const mockTrustMetrics: TrustMetrics = {
  securityScore: 95,
  userSatisfactionRating: 4.7,
  platformReliability: 99.9,
  dataAccuracy: 99.5,
  supportResponseTime: 2,
};

export const mockVerificationStatus: VerificationStatus = {
  emailVerified: true,
  phoneVerified: true,
  kycCompleted: false,
  bankAccountLinked: true,
  twoFactorEnabled: false,
};

export const mockPlatformStats: PlatformStats = {
  totalUsers: 125000,
  activeToday: 8500,
  tradesExecuted: 2500000,
  uptime: 99.9,
  averageResponseTime: 2,
  userRating: 4.7,
};

export const mockSupportOptions: SupportOption[] = [
  {
    type: "chat",
    label: "Live Chat",
    availability: "online",
    responseTime: "< 2 min",
    icon: "message-circle",
  },
  {
    type: "phone",
    label: "Phone Support",
    availability: "online",
    responseTime: "< 5 min",
    icon: "phone",
  },
  {
    type: "email",
    label: "Email Support",
    availability: "online",
    responseTime: "< 2 hours",
    icon: "mail",
  },
  {
    type: "faq",
    label: "Help Center",
    availability: "online",
    responseTime: "Instant",
    icon: "help-circle",
  },
];

// Function to get real-time updated social proof data
export const getLiveSocialProofData = (): SocialProofData => {
  const baseData = mockSocialProofData;
  const now = new Date();
  const variance = Math.sin(now.getTime() / 10000) * 100; // Small variance for realism

  return {
    ...baseData,
    activeUsers: Math.max(1000, Math.floor(baseData.activeUsers + variance)),
    successfulTrades:
      baseData.successfulTrades + Math.floor(Math.random() * 10),
    totalVolume: baseData.totalVolume + Math.floor(Math.random() * 1000000),
  };
};

// Function to simulate user verification status based on user data
export const getUserVerificationStatus = (user: {
  email?: string;
  mobile?: string;
  kycStatus?: string;
  bankAccountLinked?: boolean;
  twoFactorEnabled?: boolean;
} | null): VerificationStatus => {
  if (!user) {
    return {
      emailVerified: false,
      phoneVerified: false,
      kycCompleted: false,
      bankAccountLinked: false,
      twoFactorEnabled: false,
    };
  }

  return {
    emailVerified: !!user.email,
    phoneVerified: !!user.mobile,
    kycCompleted: user.kycStatus === "completed",
    bankAccountLinked: user.bankAccountLinked || false,
    twoFactorEnabled: user.twoFactorEnabled || false,
  };
};

// Sample transparency data for different transaction types
export const mockTransparencyData = {
  trading: {
    title: "Stock Trading Fees",
    description:
      "Complete breakdown of all charges for stock trading transactions",
    fees: [
      {
        name: "Brokerage",
        amount: 0,
        description: "Zero brokerage on all equity trades",
      },
      {
        name: "STT (Securities Transaction Tax)",
        amount: 25,
        description: "Government tax on securities transactions",
      },
      {
        name: "Exchange Charges",
        amount: 5,
        description: "NSE/BSE transaction charges",
      },
      {
        name: "GST",
        amount: 5.4,
        description: "18% GST on brokerage and transaction charges",
      },
    ],
    noHiddenFees: true,
  },

  wallet: {
    title: "Wallet Top-up Fees",
    description: "All charges for adding funds to your wallet",
    fees: [
      {
        name: "Processing Fee",
        amount: 0,
        description: "No processing fee for wallet top-ups",
      },
      {
        name: "Payment Gateway",
        amount: 0,
        description: "Payment gateway charges waived",
      },
    ],
    noHiddenFees: true,
  },

  withdrawal: {
    title: "Withdrawal Fees",
    description: "Charges for withdrawing funds from your account",
    fees: [
      {
        name: "Processing Fee",
        amount: 0,
        description: "Free withdrawals up to 5 times per month",
      },
      {
        name: "Bank Transfer",
        amount: 0,
        description: "No charges for IMPS/NEFT (National Electronic Funds Transfer) transfers",
      },
    ],
    noHiddenFees: true,
  },
};

// Sample fee breakdown data
export const mockFeeBreakdowns = {
  stockPurchase: {
    baseAmount: 10000,
    fees: [
      {
        name: "Brokerage",
        amount: 0,
        description: "Zero brokerage on equity trades",
        type: "fixed" as const,
        isWaived: true,
      },
      {
        name: "STT",
        amount: 10,
        description: "Securities Transaction Tax (0.1%)",
        type: "percentage" as const,
      },
      {
        name: "Exchange Charges",
        amount: 2,
        description: "NSE transaction charges",
        type: "fixed" as const,
      },
      {
        name: "GST",
        amount: 2.16,
        description: "18% GST on applicable charges",
        type: "percentage" as const,
      },
    ],
  },

  walletTopup: {
    baseAmount: 5000,
    fees: [
      {
        name: "Processing Fee",
        amount: 0,
        description: "No processing charges",
        type: "fixed" as const,
      },
      {
        name: "Payment Gateway",
        amount: 0,
        description: "Gateway charges waived",
        type: "fixed" as const,
        isWaived: true,
      },
    ],
  },
};
