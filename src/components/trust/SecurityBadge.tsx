import React from 'react';
import { Shield, Lock, CheckCircle, Award } from 'lucide-react';
import { SecurityBadge as SecurityBadgeType } from '../../types/trust';

interface SecurityBadgeProps {
  badge: SecurityBadgeType;
  size?: 'sm' | 'md' | 'lg';
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ badge, size = 'md' }) => {
  const getIcon = () => {
    switch (badge.type) {
      case 'ssl':
        return <Lock className={`${getSizeClasses().icon} text-green-500`} />;
      case 'encryption':
        return <Shield className={`${getSizeClasses().icon} text-blue-500`} />;
      case 'compliance':
        return <Award className={`${getSizeClasses().icon} text-purple-500`} />;
      case 'verification':
        return <CheckCircle className={`${getSizeClasses().icon} text-green-500`} />;
      default:
        return <Shield className={`${getSizeClasses().icon} text-gray-500`} />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3',
          text: 'text-xs'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-sm',
          icon: 'h-5 w-5',
          text: 'text-sm'
        };
      default:
        return {
          container: 'px-3 py-1.5 text-xs',
          icon: 'h-4 w-4',
          text: 'text-xs'
        };
    }
  };

  const getBadgeColor = () => {
    if (!badge.verified) {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
    
    switch (badge.type) {
      case 'ssl':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'encryption':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'compliance':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'verification':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div
      className={`
        inline-flex items-center space-x-1.5 rounded-full border font-medium
        ${getSizeClasses().container} ${getBadgeColor()}
        transition-all duration-200 hover:shadow-sm
      `}
      title={badge.tooltip}
    >
      {getIcon()}
      <span className={getSizeClasses().text}>{badge.label}</span>
      {badge.verified && (
        <CheckCircle className="h-3 w-3 text-current opacity-75" />
      )}
    </div>
  );
};

export default SecurityBadge;