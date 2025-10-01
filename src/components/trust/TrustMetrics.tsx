import React from 'react';
import { Shield, Star, Activity, Database, Headphones } from 'lucide-react';
import { TrustMetrics as TrustMetricsType } from '../../types/trust';

interface TrustMetricsProps {
  metrics: TrustMetricsType;
  variant?: 'detailed' | 'compact' | 'badges';
}

const TrustMetrics: React.FC<TrustMetricsProps> = ({ 
  metrics, 
  variant = 'detailed' 
}) => {
  const metricItems = [
    {
      key: 'securityScore',
      label: 'Security Score',
      value: metrics.securityScore,
      icon: Shield,
      color: 'blue',
      unit: '%'
    },
    {
      key: 'userSatisfactionRating',
      label: 'User Rating',
      value: metrics.userSatisfactionRating,
      icon: Star,
      color: 'yellow',
      unit: '/5'
    },
    {
      key: 'platformReliability',
      label: 'Platform Reliability',
      value: metrics.platformReliability,
      icon: Activity,
      color: 'green',
      unit: '%'
    },
    {
      key: 'dataAccuracy',
      label: 'Data Accuracy',
      value: metrics.dataAccuracy,
      icon: Database,
      color: 'purple',
      unit: '%'
    },
    {
      key: 'supportResponseTime',
      label: 'Support Response',
      value: metrics.supportResponseTime,
      icon: Headphones,
      color: 'indigo',
      unit: 'min'
    }
  ];

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border') => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-700'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-700'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-700'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-700'
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-700'
      }
    };
    
    return colors[color as keyof typeof colors]?.[variant] || colors.blue[variant];
  };

  const getScoreColor = (value: number, isRating: boolean = false): string => {
    if (isRating) {
      if (value >= 4.5) return 'text-green-600 dark:text-green-400';
      if (value >= 4.0) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
    
    if (value >= 90) return 'text-green-600 dark:text-green-400';
    if (value >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (variant === 'badges') {
    return (
      <div className="flex flex-wrap gap-2">
        {metricItems.map((metric) => (
          <div
            key={metric.key}
            className={`
              inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
              ${getColorClasses(metric.color, 'bg')} ${getColorClasses(metric.color, 'border')}
            `}
          >
            <metric.icon className={`h-3 w-3 ${getColorClasses(metric.color, 'text')}`} />
            <span className={getColorClasses(metric.color, 'text')}>
              {metric.value}{metric.unit}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className={getScoreColor(metrics.securityScore)}>
            {metrics.securityScore}% secure
          </span>
        </div>
        <div className="text-gray-400">•</div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className={getScoreColor(metrics.userSatisfactionRating, true)}>
            {metrics.userSatisfactionRating}/5 rating
          </span>
        </div>
        <div className="text-gray-400">•</div>
        <div className="flex items-center space-x-1">
          <Activity className="h-4 w-4 text-green-500" />
          <span className={getScoreColor(metrics.platformReliability)}>
            {metrics.platformReliability}% uptime
          </span>
        </div>
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Platform Trust Metrics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricItems.map((metric) => (
          <div
            key={metric.key}
            className={`
              p-4 rounded-lg border transition-all duration-200 hover:shadow-md
              ${getColorClasses(metric.color, 'bg')} ${getColorClasses(metric.color, 'border')}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`h-5 w-5 ${getColorClasses(metric.color, 'text')}`} />
              <span className={`text-2xl font-bold ${getScoreColor(
                metric.value, 
                metric.key === 'userSatisfactionRating'
              )}`}>
                {metric.value}{metric.unit}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </p>
            
            {/* Progress bar for percentage metrics */}
            {metric.unit === '%' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metric.value >= 90 ? 'bg-green-500' :
                      metric.value >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Star rating for user satisfaction */}
            {metric.key === 'userSatisfactionRating' && (
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= metric.value 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustMetrics;