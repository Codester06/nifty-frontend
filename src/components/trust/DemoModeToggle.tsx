import React from 'react';
import { Play, Shield } from 'lucide-react';

interface DemoModeToggleProps {
  isDemo: boolean;
  onToggle: (enabled: boolean) => void;
}

const DemoModeToggle: React.FC<DemoModeToggleProps> = ({
  isDemo,
  onToggle
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Practice Mode
        </h3>
        <button
          onClick={() => onToggle(!isDemo)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isDemo ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDemo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {isDemo 
          ? 'Practice trading with virtual money to learn without risk.'
          : 'Live trading mode - all trades use real money.'
        }
      </p>

      {isDemo && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Risk-free learning environment
          </span>
        </div>
      )}
    </div>
  );
};

export default DemoModeToggle;