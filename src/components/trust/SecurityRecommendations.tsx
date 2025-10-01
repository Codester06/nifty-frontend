import React from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, Shield, Mail, Phone, CreditCard, Smartphone, Key } from 'lucide-react';
import { VerificationStatus } from '../../types/trust';

interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: React.ComponentType<any>;
  action: string;
  completed: boolean;
  estimatedTime?: string;
}

interface SecurityRecommendationsProps {
  verificationStatus: VerificationStatus;
  variant?: 'full' | 'compact' | 'list';
  maxRecommendations?: number;
  onActionClick?: (action: string) => void;
}

const SecurityRecommendations: React.FC<SecurityRecommendationsProps> = ({
  verificationStatus,
  variant = 'full',
  maxRecommendations = 5,
  onActionClick
}) => {
  const generateRecommendations = (): SecurityRecommendation[] => {
    const recommendations: SecurityRecommendation[] = [];

    if (!verificationStatus.emailVerified) {
      recommendations.push({
        id: 'verify-email',
        title: 'Verify Your Email Address',
        description: 'Secure your account and enable password recovery by verifying your email address.',
        priority: 'high',
        icon: Mail,
        action: 'verify-email',
        completed: false,
        estimatedTime: '2 minutes'
      });
    }

    if (!verificationStatus.phoneVerified) {
      recommendations.push({
        id: 'verify-phone',
        title: 'Verify Your Phone Number',
        description: 'Add an extra layer of security and enable SMS notifications by verifying your phone.',
        priority: 'high',
        icon: Phone,
        action: 'verify-phone',
        completed: false,
        estimatedTime: '3 minutes'
      });
    }

    if (!verificationStatus.kycCompleted) {
      recommendations.push({
        id: 'complete-kyc',
        title: 'Complete KYC Verification',
        description: 'Complete your identity verification to unlock full trading features and higher limits.',
        priority: 'critical',
        icon: Shield,
        action: 'complete-kyc',
        completed: false,
        estimatedTime: '10 minutes'
      });
    }

    if (!verificationStatus.twoFactorEnabled) {
      recommendations.push({
        id: 'enable-2fa',
        title: 'Enable Two-Factor Authentication',
        description: 'Protect your account with an additional security layer using authenticator apps.',
        priority: 'high',
        icon: Smartphone,
        action: 'enable-2fa',
        completed: false,
        estimatedTime: '5 minutes'
      });
    }

    if (!verificationStatus.bankAccountLinked) {
      recommendations.push({
        id: 'link-bank',
        title: 'Link Your Bank Account',
        description: 'Connect your bank account for seamless deposits and withdrawals.',
        priority: 'medium',
        icon: CreditCard,
        action: 'link-bank',
        completed: false,
        estimatedTime: '5 minutes'
      });
    }

    // Additional security recommendations
    recommendations.push({
      id: 'update-password',
      title: 'Update Your Password',
      description: 'Use a strong, unique password to keep your account secure.',
      priority: 'medium',
      icon: Key,
      action: 'update-password',
      completed: false,
      estimatedTime: '2 minutes'
    });

    // Sort by priority and return limited results
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return recommendations
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, maxRecommendations);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          color: 'text-red-700 dark:text-red-300',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          badgeColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        };
      case 'high':
        return {
          color: 'text-orange-700 dark:text-orange-300',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-700',
          badgeColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
        };
      case 'medium':
        return {
          color: 'text-yellow-700 dark:text-yellow-300',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          badgeColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        };
      default:
        return {
          color: 'text-blue-700 dark:text-blue-300',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        };
    }
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            All security recommendations completed!
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Security Recommendations
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {recommendations.length} pending
          </span>
        </div>
        
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec) => {
            const config = getPriorityConfig(rec.priority);
            return (
              <button
                key={rec.id}
                onClick={() => onActionClick?.(rec.action)}
                className={`w-full text-left p-3 rounded-lg border transition-colors hover:shadow-sm ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex items-center space-x-3">
                  <rec.icon className={`h-4 w-4 ${config.color}`} />
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${config.color}`}>
                      {rec.title}
                    </span>
                    {rec.estimatedTime && (
                      <p className={`text-xs ${config.color} opacity-75 mt-1`}>
                        {rec.estimatedTime}
                      </p>
                    )}
                  </div>
                  <ArrowRight className={`h-4 w-4 ${config.color}`} />
                </div>
              </button>
            );
          })}
          
          {recommendations.length > 3 && (
            <button
              onClick={() => onActionClick?.('view-all-recommendations')}
              className="w-full text-center py-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
            >
              View {recommendations.length - 3} more recommendations
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {recommendations.map((rec) => {
          const config = getPriorityConfig(rec.priority);
          return (
            <div
              key={rec.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <rec.icon className={`h-5 w-5 ${config.color}`} />
              <div className="flex-1">
                <span className={`text-sm font-medium ${config.color}`}>
                  {rec.title}
                </span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.badgeColor}`}>
                {rec.priority}
              </span>
              <button
                onClick={() => onActionClick?.(rec.action)}
                className={`text-sm font-medium ${config.color} hover:opacity-75 transition-opacity`}
              >
                Fix →
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // Default full variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Security Recommendations
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Complete these security steps to protect your account and unlock all features.
      </p>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const config = getPriorityConfig(rec.priority);
          return (
            <div
              key={rec.id}
              className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  rec.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                  rec.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <rec.icon className={`h-5 w-5 ${config.color}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`text-base font-semibold ${config.color}`}>
                      {rec.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.badgeColor}`}>
                      {rec.priority}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${config.color} opacity-75 mb-3`}>
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {rec.estimatedTime && (
                      <span className={`text-xs ${config.color} opacity-60`}>
                        Estimated time: {rec.estimatedTime}
                      </span>
                    )}
                    
                    <button
                      onClick={() => onActionClick?.(rec.action)}
                      className={`
                        inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-200 hover:shadow-sm
                        ${rec.priority === 'critical' 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : rec.priority === 'high'
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }
                      `}
                    >
                      <span>Complete Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Why complete these steps?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Each security step adds protection to your account and may unlock additional features like higher trading limits and faster withdrawals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityRecommendations;