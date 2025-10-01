import React from 'react';
import { Calculator, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Fee {
  name: string;
  amount: number;
  description?: string;
  type?: 'fixed' | 'percentage' | 'variable';
  isWaived?: boolean;
}

interface FeeBreakdownProps {
  baseAmount: number;
  fees: Fee[];
  currency?: string;
  title?: string;
  showCalculation?: boolean;
  variant?: 'detailed' | 'summary' | 'modal';
}

const FeeBreakdown: React.FC<FeeBreakdownProps> = ({
  baseAmount,
  fees,
  currency = '₹',
  title = 'Transaction Breakdown',
  showCalculation = true,
  variant = 'detailed'
}) => {
  const totalFees = fees.reduce((sum, fee) => fee.isWaived ? sum : sum + fee.amount, 0);
  const totalAmount = baseAmount + totalFees;
  const waivedFees = fees.filter(fee => fee.isWaived);
  const applicableFees = fees.filter(fee => !fee.isWaived);

  const getFeeTypeIcon = (type?: string) => {
    switch (type) {
      case 'percentage':
        return '%';
      case 'fixed':
        return '₹';
      case 'variable':
        return '~';
      default:
        return '₹';
    }
  };

  const getFeeTypeColor = (type?: string) => {
    switch (type) {
      case 'percentage':
        return 'text-blue-600 dark:text-blue-400';
      case 'fixed':
        return 'text-green-600 dark:text-green-400';
      case 'variable':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (variant === 'summary') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Amount</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {currency}{baseAmount.toLocaleString()}
          </span>
        </div>
        
        {totalFees > 0 && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Fees</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {currency}{totalFees.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {currency}{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {totalFees === 0 && (
          <div className="mt-2 flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              No additional fees
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Base Amount</span>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {currency}{baseAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {applicableFees.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Applicable Fees:</h4>
            {applicableFees.map((fee, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-mono ${getFeeTypeColor(fee.type)}`}>
                      {getFeeTypeIcon(fee.type)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {fee.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currency}{fee.amount.toLocaleString()}
                  </span>
                </div>
                {fee.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                    {fee.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {waivedFees.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Waived Fees:</h4>
            {waivedFees.map((fee, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200 line-through">
                      {fee.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 line-through">
                    {currency}{fee.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Final Amount</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currency}{totalAmount.toLocaleString()}
            </span>
          </div>
          
          {showCalculation && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {currency}{baseAmount.toLocaleString()} + {currency}{totalFees.toLocaleString()} fees = {currency}{totalAmount.toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            All fees are transparently disclosed. No hidden charges.
          </span>
        </div>
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="space-y-4">
        {/* Base Amount */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Base Amount</span>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Principal transaction amount
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {currency}{baseAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Fees Section */}
        {fees.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Breakdown</h4>
            
            {applicableFees.map((fee, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      fee.type === 'fixed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      fee.type === 'percentage' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {getFeeTypeIcon(fee.type)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {fee.name}
                      </span>
                      {fee.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {fee.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {currency}{fee.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}

            {/* Waived Fees */}
            {waivedFees.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-green-700 dark:text-green-300">Waived Fees (You Save!):</h5>
                {waivedFees.map((fee, index) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200 line-through">
                          {fee.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400 line-through">
                        {currency}{fee.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Total Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">Total Amount</span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {currency}{totalAmount.toLocaleString()}
            </span>
          </div>
          
          {showCalculation && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Base: {currency}{baseAmount.toLocaleString()} + Fees: {currency}{totalFees.toLocaleString()} = Total: {currency}{totalAmount.toLocaleString()}
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-700">
            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              No Hidden Fees
            </span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-700">
            <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Transparent Pricing
            </span>
          </div>
          {totalFees === 0 && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-700">
              <CheckCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                Zero Fees
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeBreakdown;