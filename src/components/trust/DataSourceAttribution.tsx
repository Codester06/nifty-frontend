import React from 'react';
import { Database, Clock, Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface DataSource {
  name: string;
  type: 'exchange' | 'api' | 'feed' | 'cache';
  status: 'connected' | 'disconnected' | 'delayed' | 'error';
  lastUpdated: Date;
  updateInterval?: number;
  accuracy?: number;
  description?: string;
}

interface DataSourceAttributionProps {
  sources: DataSource[];
  variant?: 'detailed' | 'compact' | 'inline' | 'footer';
  showAccuracy?: boolean;
  showStatus?: boolean;
  onRefresh?: () => void;
}

const DataSourceAttribution: React.FC<DataSourceAttributionProps> = ({
  sources,
  variant = 'detailed',
  showAccuracy = true,
  showStatus = true,
  onRefresh
}) => {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getSourceIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'exchange':
        return Database;
      case 'api':
        return Wifi;
      case 'feed':
        return RefreshCw;
      case 'cache':
        return Database;
      default:
        return Database;
    }
  };

  const getStatusConfig = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          dotColor: 'bg-green-500',
          label: 'Connected'
        };
      case 'delayed':
        return {
          icon: Clock,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          dotColor: 'bg-yellow-500',
          label: 'Delayed'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          dotColor: 'bg-red-500',
          label: 'Error'
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          dotColor: 'bg-gray-500',
          label: 'Disconnected'
        };
    }
  };

  if (variant === 'inline') {
    const primarySource = sources[0];
    if (!primarySource) return null;

    const statusConfig = getStatusConfig(primarySource.status);
    const SourceIcon = getSourceIcon(primarySource.type);

    return (
      <div className="inline-flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
        <SourceIcon className="h-3 w-3" />
        <span>{primarySource.name}</span>
        <span>•</span>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} ${primarySource.status === 'connected' ? 'animate-pulse' : ''}`}></div>
          <span>{getTimeAgo(primarySource.lastUpdated)}</span>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {sources.slice(0, 2).map((source, index) => {
              const SourceIcon = getSourceIcon(source.type);
              const statusConfig = getStatusConfig(source.status);
              
              return (
                <div key={index} className="flex items-center space-x-1">
                  <SourceIcon className="h-3 w-3" />
                  <span>{source.name}</span>
                  <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} ${source.status === 'connected' ? 'animate-pulse' : ''}`}></div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Updated {getTimeAgo(sources[0]?.lastUpdated || new Date())}</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Data Sources
          </h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {sources.map((source, index) => {
            const SourceIcon = getSourceIcon(source.type);
            const statusConfig = getStatusConfig(source.status);
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SourceIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {source.name}
                  </span>
                  {showStatus && (
                    <div className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.color}`}>
                      <div className="flex items-center space-x-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} ${source.status === 'connected' ? 'animate-pulse' : ''}`}></div>
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimeAgo(source.lastUpdated)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Data Sources & Attribution
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Refresh
            </span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sources.map((source, index) => {
          const SourceIcon = getSourceIcon(source.type);
          const statusConfig = getStatusConfig(source.status);
          
          return (
            <div
              key={index}
              className={`rounded-lg border p-4 ${statusConfig.bgColor} ${
                source.status === 'connected' ? 'border-green-200 dark:border-green-700' :
                source.status === 'delayed' ? 'border-yellow-200 dark:border-yellow-700' :
                source.status === 'error' ? 'border-red-200 dark:border-red-700' :
                'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    source.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' :
                    source.status === 'delayed' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    source.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <SourceIcon className={`h-5 w-5 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <h4 className={`text-base font-semibold ${statusConfig.color}`}>
                      {source.name}
                    </h4>
                    {source.description && (
                      <p className={`text-sm ${statusConfig.color} opacity-75 mt-1`}>
                        {source.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {showStatus && (
                  <div className={`px-3 py-1.5 rounded-lg border ${statusConfig.bgColor} ${
                    source.status === 'connected' ? 'border-green-300 dark:border-green-600' :
                    source.status === 'delayed' ? 'border-yellow-300 dark:border-yellow-600' :
                    source.status === 'error' ? 'border-red-300 dark:border-red-600' :
                    'border-gray-300 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} ${source.status === 'connected' ? 'animate-pulse' : ''}`}></div>
                      <span className={`text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${statusConfig.color} opacity-75`}>Type:</span>
                  <div className={`${statusConfig.color} capitalize mt-1`}>
                    {source.type}
                  </div>
                </div>
                
                <div>
                  <span className={`font-medium ${statusConfig.color} opacity-75`}>Last Updated:</span>
                  <div className={`${statusConfig.color} mt-1`}>
                    {getTimeAgo(source.lastUpdated)}
                  </div>
                </div>
                
                {source.updateInterval && (
                  <div>
                    <span className={`font-medium ${statusConfig.color} opacity-75`}>Update Interval:</span>
                    <div className={`${statusConfig.color} mt-1`}>
                      {source.updateInterval}s
                    </div>
                  </div>
                )}
                
                {showAccuracy && source.accuracy && (
                  <div>
                    <span className={`font-medium ${statusConfig.color} opacity-75`}>Accuracy:</span>
                    <div className={`${statusConfig.color} mt-1`}>
                      {source.accuracy}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-2">
          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Data Transparency Guarantee
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              All data sources are clearly attributed and timestamps are accurate. We ensure complete transparency in our data presentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceAttribution;