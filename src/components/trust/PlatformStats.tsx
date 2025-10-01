import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Clock, Shield, Star, Award, Zap } from 'lucide-react';
import { PlatformStats as PlatformStatsType } from '../../types/trust';

interface PlatformStatsProps {
  stats: PlatformStatsType;
  variant?: 'dashboard' | 'hero' | 'sidebar' | 'compact';
  showLiveIndicators?: boolean;
  animated?: boolean;
}

const PlatformStats: React.FC<PlatformStatsProps> = ({
  stats,
  variant = 'dashboard',
  showLiveIndicators = true,
  animated = true
}) => {
  const [animatedStats, setAnimatedStats] = useState(stats);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setAnimatedStats(prev => ({
          ...prev,
          activeToday: prev.activeToday + Math.floor(Math.random() * 3) - 1,
          tradesExecuted: prev.tradesExecuted + Math.floor(Math.random() * 5)
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [animated]);

  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)}Cr`;
    }
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatItems = () => [
    {
      label: 'Total Users',
      value: formatNumber(animatedStats.totalUsers),
      icon: Users,
      color: 'blue',
      description: 'Registered traders',
      trend: '+12% this month'
    },
    {
      label: 'Active Today',
      value: formatNumber(animatedStats.activeToday),
      icon: Activity,
      color: 'green',
      description: 'Currently trading',
      trend: 'Live',
      isLive: true
    },
    {
      label: 'Trades Executed',
      value: formatNumber(animatedStats.tradesExecuted),
      icon: TrendingUp,
      color: 'purple',
      description: 'Total successful trades',
      trend: '+5.2% today'
    },
    {
      label: 'Platform Uptime',
      value: `${animatedStats.uptime}%`,
      icon: Shield,
      color: 'emerald',
      description: 'Last 30 days',
      trend: '99.9% SLA'
    },
    {
      label: 'Avg Response',
      value: `${animatedStats.averageResponseTime}min`,
      icon: Clock,
      color: 'orange',
      description: 'Support response time',
      trend: 'Under 2 min'
    },
    {
      label: 'User Rating',
      value: `${animatedStats.userRating}/5`,
      icon: Star,
      color: 'yellow',
      description: 'Customer satisfaction',
      trend: '4.8★ average'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-700',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-600 dark:text-green-400'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-700',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'text-purple-600 dark:text-purple-400'
      },
      emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-700',
        text: 'text-emerald-600 dark:text-emerald-400',
        icon: 'text-emerald-600 dark:text-emerald-400'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-700',
        text: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-600 dark:text-orange-400'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-700',
        text: 'text-yellow-600 dark:text-yellow-400',
        icon: 'text-yellow-600 dark:text-yellow-400'
      }
    };
    
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (variant === 'compact') {
    const topStats = getStatItems().slice(0, 3);
    return (
      <div className="flex items-center space-x-6 text-sm">
        {topStats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-2">
            <stat.icon className={`h-4 w-4 ${getColorClasses(stat.color).icon}`} />
            <span className="font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {stat.label}
            </span>
            {stat.isLive && showLiveIndicators && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Trusted by Thousands
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join our growing community of successful traders
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {getStatItems().map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getColorClasses(stat.color).bg}`}>
                <stat.icon className={`h-6 w-6 ${getColorClasses(stat.color).icon}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </div>
              <div className={`text-xs font-medium ${getColorClasses(stat.color).text}`}>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Platform Statistics
        </h3>
        {getStatItems().map((stat, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={`p-2 rounded-lg ${getColorClasses(stat.color).bg}`}>
              <stat.icon className={`h-4 w-4 ${getColorClasses(stat.color).icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
                {stat.isLive && showLiveIndicators && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default dashboard variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Platform Statistics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time platform performance and user metrics
          </p>
        </div>
        
        {showLiveIndicators && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Live Data
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getStatItems().map((stat, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${getColorClasses(stat.color).bg} ${getColorClasses(stat.color).border}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                <stat.icon className={`h-5 w-5 ${getColorClasses(stat.color).icon}`} />
              </div>
              {stat.isLive && showLiveIndicators && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    LIVE
                  </span>
                </div>
              )}
            </div>
            
            <div className="mb-2">
              <div className={`text-2xl font-bold ${getColorClasses(stat.color).text} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {stat.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stat.description}
              </div>
            </div>
            
            <div className={`text-xs font-medium ${getColorClasses(stat.color).text} bg-white dark:bg-gray-800 px-2 py-1 rounded-md`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Trust indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Industry Leading
            </span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Secure & Reliable
            </span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Lightning Fast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformStats;