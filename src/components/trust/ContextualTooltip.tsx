import React, { useState } from 'react';
import { HelpCircle, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ContextualTooltipProps {
  content: string;
  title?: string;
  type?: 'info' | 'help' | 'warning' | 'success';
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  children: React.ReactNode;
  showIcon?: boolean;
}

const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  content,
  title,
  type = 'info',
  position = 'top',
  trigger = 'hover',
  children,
  showIcon = true
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'help':
        return HelpCircle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'help':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-900 dark:text-blue-100',
          icon: 'text-blue-600 dark:text-blue-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-900 dark:text-yellow-100',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-900 dark:text-green-100',
          icon: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-900 dark:text-white',
          icon: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const Icon = getIcon();
  const typeClasses = getTypeClasses();

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click trigger */}
          {trigger === 'click' && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsVisible(false)}
            />
          )}
          
          {/* Tooltip */}
          <div
            className={`
              absolute z-20 w-64 p-3 rounded-lg border shadow-lg
              ${getPositionClasses()} ${typeClasses.bg} ${typeClasses.border}
            `}
          >
            <div className="flex items-start space-x-2">
              {showIcon && (
                <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${typeClasses.icon}`} />
              )}
              <div className="flex-1">
                {title && (
                  <h4 className={`font-semibold mb-1 ${typeClasses.text}`}>
                    {title}
                  </h4>
                )}
                <p className={`text-sm ${typeClasses.text}`}>
                  {content}
                </p>
              </div>
              {trigger === 'click' && (
                <button
                  onClick={() => setIsVisible(false)}
                  className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${typeClasses.icon}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContextualTooltip;