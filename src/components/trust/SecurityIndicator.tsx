import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Wifi } from 'lucide-react';

interface SecurityIndicatorProps {
  type: 'ssl' | 'encryption' | 'connection' | 'session' | 'monitoring';
  status: 'active' | 'inactive' | 'warning' | 'error';
  label?: string;
  description?: string;
  variant?: 'badge' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  type,
  status,
  label,
  description,
  variant = 'badge',
  size = 'md'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'ssl':
        return Lock;
      case 'encryption':
        return Shield;
      case 'connection':
        return Wifi;
      case 'session':
        return CheckCircle;
      case 'monitoring':
        return Eye;
      default:
        return Shield;
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          dotColor: 'bg-green-500',
          statusText: 'Active'
        };
      case 'warning':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          dotColor: 'bg-yellow-500',
          statusText: 'Warning'
        };
      case 'error':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          dotColor: 'bg-red-500',
          statusText: 'Error'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          dotColor: 'bg-gray-400',
          statusText: 'Inactive'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3',
          dot: 'w-1.5 h-1.5',
          text: 'text-xs'
        };
      case 'lg':
        return {
          container: 'px-4 py-3 text-base',
          icon: 'h-6 w-6',
          dot: 'w-3 h-3',
          text: 'text-base'
        };
      default:
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'h-4 w-4',
          dot: 'w-2 h-2',
          text: 'text-sm'
        };
    }
  };

  const getDefaultLabel = () => {
    switch (type) {
      case 'ssl':
        return 'SSL Certificate';
      case 'encryption':
        return 'Data Encryption';
      case 'connection':
        return 'Secure Connection';
      case 'session':
        return 'Session Security';
      case 'monitoring':
        return 'Security Monitoring';
      default:
        return 'Security';
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'ssl':
        return status === 'active' ? 'Your connection is encrypted with SSL' : 'SSL certificate issue detected';
      case 'encryption':
        return status === 'active' ? 'All data is encrypted end-to-end' : 'Encryption not fully active';
      case 'connection':
        return status === 'active' ? 'Secure HTTPS connection established' : 'Connection security compromised';
      case 'session':
        return status === 'active' ? 'Your session is secure and authenticated' : 'Session security needs attention';
      case 'monitoring':
        return status === 'active' ? 'Real-time security monitoring active' : 'Security monitoring offline';
      default:
        return 'Security status';
    }
  };

  const Icon = getIcon();
  const statusConfig = getStatusConfig();
  const sizeClasses = getSizeClasses();
  const displayLabel = label || getDefaultLabel();
  const displayDescription = description || getDefaultDescription();

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center space-x-1.5">
        <div className={`${sizeClasses.dot} ${statusConfig.dotColor} rounded-full ${status === 'active' ? 'animate-pulse' : ''}`}></div>
        <Icon className={`${sizeClasses.icon} ${statusConfig.color}`} />
        <span className={`${sizeClasses.text} font-medium ${statusConfig.color}`}>
          {displayLabel}
        </span>
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`
        inline-flex items-center space-x-2 rounded-lg border font-medium
        ${sizeClasses.container} ${statusConfig.bgColor} ${statusConfig.borderColor}
        transition-all duration-200 hover:shadow-sm
      `}>
        <div className="flex items-center space-x-1.5">
          <div className={`${sizeClasses.dot} ${statusConfig.dotColor} rounded-full ${status === 'active' ? 'animate-pulse' : ''}`}></div>
          <Icon className={`${sizeClasses.icon} ${statusConfig.color}`} />
        </div>
        <span className={`${sizeClasses.text} ${statusConfig.color}`}>
          {displayLabel}
        </span>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`
      rounded-lg border p-4 transition-all duration-200 hover:shadow-md
      ${statusConfig.bgColor} ${statusConfig.borderColor}
    `}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${
          status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
          status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
          status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
          'bg-gray-100 dark:bg-gray-800'
        }`}>
          <Icon className={`h-5 w-5 ${statusConfig.color}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className={`text-sm font-semibold ${statusConfig.color}`}>
              {displayLabel}
            </h4>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 ${statusConfig.dotColor} rounded-full ${status === 'active' ? 'animate-pulse' : ''}`}></div>
              <span className={`text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.statusText}
              </span>
            </div>
          </div>
          
          <p className={`text-xs ${statusConfig.color} opacity-75`}>
            {displayDescription}
          </p>
          
          {status === 'error' && (
            <div className="mt-2">
              <button className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors">
                View Details →
              </button>
            </div>
          )}
          
          {status === 'warning' && (
            <div className="mt-2">
              <button className="text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors">
                Review Settings →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityIndicator;