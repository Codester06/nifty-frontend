import React from 'react';
import { Shield, Lock, CheckCircle, AlertTriangle, Smartphone, CreditCard, Mail, Phone } from 'lucide-react';
import { VerificationStatus } from '../../types/trust';

interface SecurityStatusBarProps {
  verificationStatus: VerificationStatus;
  variant?: 'full' | 'compact' | 'minimal';
  showRecommendations?: boolean;
  onActionClick?: (action: string) => void;
}

const SecurityStatusBar: React.FC<SecurityStatusBarProps> = ({
  verificationStatus,
  variant = 'full',
  showRecommendations = true,
  onActionClick
}) => {
  const getSecurityScore = (): number => {
    const weights = {
      emailVerified: 15,
      phoneVerified: 15,
      kycCompleted: 30,
      bankAccountLinked: 20,
      twoFactorEnabled: 20
    };
    
    let score = 0;
    if (verificationStatus.emailVerified) score += weights.emailVerified;
    if (verificationStatus.phoneVerified) score += weights.phoneVerified;
    if (verificationStatus.kycCompleted) score += weights.kycCompleted;
    if (verificationStatus.bankAccountLinked) score += weights.bankAccountLinked;
    if (verificationStatus.twoFactorEnabled) score += weights.twoFactorEnabled;
    
    return score;
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 80) {
      return {
        level: 'High Security',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
        description: 'Your account is highly secure'
      };
    } else if (score >= 60) {
      return {
        level: 'Medium Security',
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
        description: 'Good security, consider additional steps'
      };
    } else {
      return {
        level: 'Basic Security',
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
        description: 'Please complete security setup'
      };
    }
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${securityLevel.bgColor}`}>
        <Shield className={`h-4 w-4 ${securityLevel.color}`} />
        <span className={`text-sm font-medium ${securityLevel.color}`}>
          {securityScore}% Secure
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`rounded-lg border p-3 ${securityLevel.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className={`h-5 w-5 ${securityLevel.color}`} />
            <div>
              <span className={`text-sm font-semibold ${securityLevel.color}`}>
                {securityLevel.level}
              </span>
              <p className={`text-xs ${securityLevel.color} opacity-75`}>
                {securityScore}% Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-xl ${securityLevel.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className={`h-6 w-6 ${securityLevel.color}`} />
            <div>
              <h3 className={`text-lg font-bold ${securityLevel.color}`}>
                {securityLevel.level}
              </h3>
              <p className={`text-sm ${securityLevel.color} opacity-75`}>
                {securityLevel.description}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${securityLevel.color}`}>
              {securityScore}%
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                securityScore >= 80 ? 'bg-green-500' :
                securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${securityScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Security Features
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-full ${
              verificationStatus.emailVerified 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {verificationStatus.emailVerified ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Mail className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Email Verified
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {verificationStatus.emailVerified ? 'Verified' : 'Not verified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-full ${
              verificationStatus.twoFactorEnabled 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {verificationStatus.twoFactorEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Smartphone className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                2FA Enabled
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {verificationStatus.twoFactorEnabled ? 'Active' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatusBar;