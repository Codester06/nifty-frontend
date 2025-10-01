import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, User, MapPin, Clock, Zap } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'trade' | 'signup' | 'deposit' | 'withdrawal' | 'achievement';
  user: string;
  action: string;
  amount?: number;
  stock?: string;
  location?: string;
  timestamp: Date;
  anonymous?: boolean;
}

interface LiveActivityFeedProps {
  variant?: 'full' | 'compact' | 'ticker';
  maxItems?: number;
  showLocation?: boolean;
  showAmount?: boolean;
  updateInterval?: number;
}

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  variant = 'full',
  maxItems = 10,
  showLocation = true,
  showAmount = true,
  updateInterval = 3000
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Generate realistic activity data
  const generateActivity = (): ActivityItem => {
    const types: ActivityItem['type'][] = ['trade', 'signup', 'deposit', 'withdrawal', 'achievement'];
    const users = ['Priya S.', 'Rajesh K.', 'Sneha P.', 'Amit S.', 'Kavya R.', 'Vikram J.', 'Anita M.', 'Rohit T.'];
    const stocks = ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICI', 'SBI', 'ITC', 'WIPRO', 'ONGC', 'BAJAJ'];
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Ahmedabad'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    let action = '';
    let amount: number | undefined;
    let stock: string | undefined;
    
    switch (type) {
      case 'trade':
        stock = stocks[Math.floor(Math.random() * stocks.length)];
        amount = Math.floor(Math.random() * 500000) + 10000;
        action = Math.random() > 0.5 ? `bought ${stock}` : `sold ${stock}`;
        break;
      case 'signup':
        action = 'joined NiftyBulk';
        break;
      case 'deposit':
        amount = Math.floor(Math.random() * 100000) + 5000;
        action = 'added funds to wallet';
        break;
      case 'withdrawal':
        amount = Math.floor(Math.random() * 50000) + 2000;
        action = 'withdrew funds';
        break;
      case 'achievement':
        const achievements = ['completed first trade', 'reached 100 trades', 'verified KYC', 'enabled 2FA'];
        action = achievements[Math.floor(Math.random() * achievements.length)];
        break;
    }
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      user,
      action,
      amount,
      stock,
      location,
      timestamp: new Date(),
      anonymous: Math.random() > 0.7
    };
  };

  useEffect(() => {
    // Initialize with some activities
    const initialActivities = Array.from({ length: maxItems }, generateActivity);
    setActivities(initialActivities);

    // Set up interval to add new activities
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [maxItems, updateInterval]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'trade':
        return TrendingUp;
      case 'signup':
        return User;
      case 'deposit':
        return TrendingUp;
      case 'withdrawal':
        return TrendingDown;
      case 'achievement':
        return Zap;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'trade':
        return 'text-blue-600 dark:text-blue-400';
      case 'signup':
        return 'text-green-600 dark:text-green-400';
      case 'deposit':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'withdrawal':
        return 'text-orange-600 dark:text-orange-400';
      case 'achievement':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (variant === 'ticker') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 py-2 overflow-hidden">
        <div className="flex items-center space-x-8 animate-scroll">
          {activities.slice(0, 5).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center space-x-2 whitespace-nowrap">
                <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {activity.user} {activity.action}
                  {activity.amount && showAmount && ` for ${formatAmount(activity.amount)}`}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Live Activity
          </h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activities.slice(0, 5).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                    {activity.amount && showAmount && (
                      <span className={`ml-1 font-semibold ${getActivityColor(activity.type)}`}>
                        {formatAmount(activity.amount)}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default full variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Activity Feed
          </h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Real-time
          </span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div
              key={activity.id}
              className={`flex items-start space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                index === 0 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 animate-pulse-once' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activity.type === 'trade' ? 'bg-blue-100 dark:bg-blue-900/30' :
                activity.type === 'signup' ? 'bg-green-100 dark:bg-green-900/30' :
                activity.type === 'deposit' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                activity.type === 'withdrawal' ? 'bg-orange-100 dark:bg-orange-900/30' :
                'bg-purple-100 dark:bg-purple-900/30'
              }`}>
                <Icon className={`h-5 w-5 ${getActivityColor(activity.type)}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activity.anonymous ? 'Anonymous User' : activity.user}
                  </span>
                  {activity.location && showLocation && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {activity.action}
                  {activity.stock && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                      {activity.stock}
                    </span>
                  )}
                </p>
                
                <div className="flex items-center justify-between">
                  {activity.amount && showAmount && (
                    <span className={`text-lg font-bold ${getActivityColor(activity.type)}`}>
                      {formatAmount(activity.amount)}
                    </span>
                  )}
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Activity updates every {updateInterval / 1000} seconds • All data is anonymized for privacy
        </p>
      </div>
    </div>
  );
};

export default LiveActivityFeed;