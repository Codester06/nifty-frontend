import React from 'react';
import { Users, TrendingUp, Activity, Shield, CheckCircle, DollarSign } from 'lucide-react';
import { SocialProofData } from '../../types/trust';

interface SocialProofWidgetProps {
  data: SocialProofData;
  variant?: 'horizontal' | 'grid' | 'compact';
}

const SocialProofWidget: React.FC<SocialProofWidgetProps> = ({ 
  data, 
  variant = 'horizontal' 
}) => {
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

  const formatVolume = (volume: number): string => {
    if (volume >= 10000000) {
      return `₹${(volume / 10000000).toFixed(1)}Cr`;
    }
    return `₹${formatNumber(volume)}`;
  };

  const stats = [
    {
      icon: Users,
      label: 'Total Users',
      value: formatNumber(data.totalUsers),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Activity,
      label: 'Active Users',
      value: formatNumber(data.activeUsers),
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Successful Trades',
      value: formatNumber(data.successfulTrades),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Shield,
      label: 'Uptime',
      value: `${data.platformUptime}%`,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: CheckCircle,
      label: 'Verified Accounts',
      value: formatNumber(data.verifiedAccounts),
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      icon: DollarSign,
      label: 'Total Volume',
      value: formatVolume(data.totalVolume),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600 dark:text-gray-400">
            {formatNumber(data.activeUsers)} users online
          </span>
        </div>
        <div className="text-gray-400">•</div>
        <div className="text-gray-600 dark:text-gray-400">
          {data.platformUptime}% uptime
        </div>
        <div className="text-gray-400">•</div>
        <div className="text-gray-600 dark:text-gray-400">
          {formatVolume(data.totalVolume)} traded
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default horizontal variant
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-1">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Trusted by {formatNumber(data.totalUsers)}+ users
          </span>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 dark:text-gray-300">
              {formatNumber(data.activeUsers)} online
            </span>
          </div>
          
          <div className="text-gray-700 dark:text-gray-300">
            {data.platformUptime}% uptime
          </div>
          
          <div className="text-gray-700 dark:text-gray-300">
            {formatVolume(data.totalVolume)} traded
          </div>
          
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {formatNumber(data.verifiedAccounts)} verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofWidget;