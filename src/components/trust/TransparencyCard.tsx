import React from 'react';
import { CheckCircle, Info, DollarSign, AlertCircle } from 'lucide-react';
import { TransparencyInfo } from '../../types/trust';

interface TransparencyCardProps {
  info: TransparencyInfo;
  variant?: 'detailed' | 'compact' | 'inline';
  showBreakdown?: boolean;
}

const TransparencyCard: React.FC<TransparencyCardProps> = ({ 
  info, 
  variant = 'detailed',
  showBreakdown = true 
}) => {
  const totalFees = info.fees.reduce((sum, fee) => {
    const amount = typeof fee.amount === 'number' ? fee.amount : 0;
    return sum + amount;
  }, 0);

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          No Hidden Fees
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {info.title}
          </h3>
          {info.noHiddenFees && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                No Hidden Fees
              </span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {info.description}
        </p>

        {showBreakdown && info.fees.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Fee Breakdown:
            </h4>
            {info.fees.map((fee, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{fee.name}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {typeof fee.amount === 'number' ? `₹${fee.amount.toLocaleString()}` : fee.amount}
                </span>
              </div>
            ))}
            {totalFees > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-900 dark:text-white">Total Fees</span>
                  <span className="text-gray-900 dark:text-white">₹{totalFees.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {info.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {info.description}
          </p>
        </div>
        
        {info.noHiddenFees && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              No Hidden Fees
            </span>
          </div>
        )}
      </div>

      {showBreakdown && info.fees.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Complete Fee Breakdown
            </h4>
          </div>
          
          <div className="space-y-3">
            {info.fees.map((fee, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {fee.name}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {typeof fee.amount === 'number' ? `₹${fee.amount.toLocaleString()}` : fee.amount}
                  </span>
                </div>
                {fee.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {fee.description}
                  </p>
                )}
              </div>
            ))}
            
            {totalFees > 0 && (
              <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    Total Fees
                  </span>
                  <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    ₹{totalFees.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust indicators */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            Transparent Pricing
          </span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            All Fees Disclosed
          </span>
        </div>
        {totalFees === 0 && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md">
            <CheckCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Zero Fees
            </span>
          </div>
        )}
      </div>

      {/* Warning for high fees */}
      {totalFees > 1000 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Fee Notice
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                This transaction includes fees totaling ₹{totalFees.toLocaleString()}. All fees are clearly disclosed above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransparencyCard;