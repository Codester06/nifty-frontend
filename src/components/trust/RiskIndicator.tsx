import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Info } from 'lucide-react';

interface RiskIndicatorProps {
  level: 'low' | 'medium' | 'high' | 'very-high';
  type?: 'stock' | 'trade' | 'investment' | 'general';
  description?: string;
  factors?: string[];
  variant?: 'badge' | 'card' | 'inline';
  showDetails?: boolean;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  level,
  type = 'general',
  description,
  factors = [],
  variant = 'badge',
  showDetails = false
}) => {
  const getRiskConfig = () => {
    switch (level) {
      case 'low':
        return {
          label: 'Low Risk',
          color: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          icon: Shield,
          description: description || 'This is considered a low-risk option with minimal potential for loss.'
        };
      case 'medium':
        return {
          label: 'Medium Risk',
          color: 'text-yellow-700 dark:text-yellow-300',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          icon: Info,
          description: description || 'This carries moderate risk with potential for both gains and losses.'
        };
      case 'high':
        return {
          label: 'High Risk',
          color: 'text-orange-700 dark:text-orange-300',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-700',
          icon: AlertTriangle,
          description: description || 'This is a high-risk option with significant potential for loss.'
        };
      case 'very-high':
        return {
          label: 'Very High Risk',
          color: 'text-red-700 dark:text-red-300',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          icon: AlertTriangle,
          description: description || 'This carries very high risk and may result in substantial losses.'
        };
      default:
        return {
          label: 'Unknown Risk',
          color: 'text-gray-700 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: Info,
          description: description || 'Risk level not determined.'
        };
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'stock':
        return TrendingUp;
      case 'trade':
        return TrendingDown;
      case 'investment':
        return TrendingUp;
      default:
        return Info;
    }
  };

  const riskConfig = getRiskConfig();
  const RiskIcon = riskConfig.icon;
  const TypeIcon = getTypeIcon();

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${riskConfig.bgColor} ${riskConfig.color}`}>
        <RiskIcon className="h-3 w-3" />
        <span>{riskConfig.label}</span>
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border font-medium ${riskConfig.bgColor} ${riskConfig.borderColor}`}>
        <RiskIcon className={`h-4 w-4 ${riskConfig.color}`} />
        <span className={`text-sm ${riskConfig.color}`}>
          {riskConfig.label}
        </span>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`rounded-lg border p-4 ${riskConfig.bgColor} ${riskConfig.borderColor}`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${riskConfig.bgColor} border ${riskConfig.borderColor}`}>
          <RiskIcon className={`h-5 w-5 ${riskConfig.color}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-semibold ${riskConfig.color}`}>
              {riskConfig.label}
            </h3>
            <TypeIcon className={`h-4 w-4 ${riskConfig.color}`} />
          </div>
          
          <p className={`text-sm ${riskConfig.color} mb-3`}>
            {riskConfig.description}
          </p>

          {showDetails && factors.length > 0 && (
            <div>
              <h4 className={`text-sm font-medium ${riskConfig.color} mb-2`}>
                Risk Factors:
              </h4>
              <ul className="space-y-1">
                {factors.map((factor, index) => (
                  <li key={index} className={`text-xs ${riskConfig.color} flex items-start space-x-1`}>
                    <span className="w-1 h-1 bg-current rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Level Indicator */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={riskConfig.color}>Risk Level</span>
              <span className={riskConfig.color}>
                {level === 'low' ? '1/4' : 
                 level === 'medium' ? '2/4' : 
                 level === 'high' ? '3/4' : '4/4'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  level === 'low' ? 'bg-green-500' :
                  level === 'medium' ? 'bg-yellow-500' :
                  level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: level === 'low' ? '25%' : 
                         level === 'medium' ? '50%' : 
                         level === 'high' ? '75%' : '100%' 
                }}
              ></div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-2">
              <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {level === 'low' && "Suitable for conservative investors seeking stable returns."}
                {level === 'medium' && "Suitable for investors comfortable with moderate volatility."}
                {level === 'high' && "Only suitable for experienced investors who can handle volatility."}
                {level === 'very-high' && "Only for expert investors who understand the risks involved."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskIndicator;