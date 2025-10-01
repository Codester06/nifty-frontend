import React from 'react';
import { CheckCircle, XCircle, Mail, Phone, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { VerificationStatus as VerificationStatusType } from '../../types/trust';

interface VerificationStatusProps {
  status: VerificationStatusType;
  variant?: 'detailed' | 'compact' | 'score';
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  status, 
  variant = 'detailed' 
}) => {
  const verificationItems = [
    {
      key: 'emailVerified',
      label: 'Email Verified',
      icon: Mail,
      verified: status.emailVerified,
      importance: 'high'
    },
    {
      key: 'phoneVerified',
      label: 'Phone Verified',
      icon: Phone,
      verified: status.phoneVerified,
      importance: 'high'
    },
    {
      key: 'kycCompleted',
      label: 'KYC Completed',
      icon: Shield,
      verified: status.kycCompleted,
      importance: 'critical'
    },
    {
      key: 'bankAccountLinked',
      label: 'Bank Account Linked',
      icon: CreditCard,
      verified: status.bankAccountLinked,
      importance: 'medium'
    },
    {
      key: 'twoFactorEnabled',
      label: '2FA Enabled',
      icon: Shield,
      verified: status.twoFactorEnabled,
      importance: 'high'
    }
  ];

  const getVerificationScore = (): number => {
    const weights = {
      critical: 30,
      high: 20,
      medium: 10
    };
    
    let totalScore = 0;
    let maxScore = 0;
    
    verificationItems.forEach(item => {
      const weight = weights[item.importance as keyof typeof weights];
      maxScore += weight;
      if (item.verified) {
        totalScore += weight;
      }
    });
    
    return Math.round((totalScore / maxScore) * 100);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
  };

  if (variant === 'score') {
    const score = getVerificationScore();
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getScoreBgColor(score)}`}>
        <Shield className={`h-4 w-4 ${getScoreColor(score)}`} />
        <span className={`text-sm font-medium ${getScoreColor(score)}`}>
          Security Score: {score}%
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    const verifiedCount = verificationItems.filter(item => item.verified).length;
    const totalCount = verificationItems.length;
    const score = getVerificationScore();
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${getScoreBgColor(score)}`}>
          <Shield className={`h-3 w-3 ${getScoreColor(score)}`} />
          <span className={getScoreColor(score)}>
            {verifiedCount}/{totalCount} verified
          </span>
        </div>
        {score < 80 && (
          <AlertCircle className="h-4 w-4 text-yellow-500" title="Complete verification for better security" />
        )}
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Account Security
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(getVerificationScore())}`}>
          <span className={getScoreColor(getVerificationScore())}>
            {getVerificationScore()}% Complete
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {verificationItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <item.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              {item.importance === 'critical' && (
                <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                  Required
                </span>
              )}
            </div>
            
            <div className="flex items-center">
              {item.verified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {getVerificationScore() < 100 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Complete your verification
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Higher verification levels provide better security and access to more features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;