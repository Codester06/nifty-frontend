import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedPriceCellProps {
  value: number;
  previousValue?: number;
  formatValue?: (value: number) => string;
  className?: string;
  showChangeIndicator?: boolean;
  animationDuration?: number;
}

const AnimatedPriceCell: React.FC<AnimatedPriceCellProps> = memo(({
  value,
  previousValue,
  formatValue = (val) => `₹${val.toFixed(2)}`,
  className = '',
  showChangeIndicator = true,
  animationDuration = 1000,
}) => {
  const [changeDirection, setChangeDirection] = useState<'up' | 'down' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      const direction = value > previousValue ? 'up' : value < previousValue ? 'down' : null;
      
      if (direction) {
        setChangeDirection(direction);
        setIsAnimating(true);

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Reset animation after duration
        timeoutRef.current = setTimeout(() => {
          setChangeDirection(null);
          setIsAnimating(false);
        }, animationDuration);
      }
    }

    prevValueRef.current = value;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, previousValue, animationDuration]);

  const getAnimationClasses = () => {
    if (!isAnimating || !changeDirection) return '';
    
    return changeDirection === 'up' 
      ? 'bg-green-200/50 dark:bg-green-800/30 text-green-900 dark:text-green-100' 
      : 'bg-red-200/50 dark:bg-red-800/30 text-red-900 dark:text-red-100';
  };

  const getChangeIndicatorColor = () => {
    if (!changeDirection) return 'transparent';
    return changeDirection === 'up' ? '#10B981' : '#EF4444';
  };

  return (
    <motion.div
      className={`relative inline-flex items-center gap-1 transition-all duration-300 rounded px-1 ${getAnimationClasses()} ${className}`}
      animate={isAnimating ? {
        scale: [1, 1.05, 1],
        transition: { duration: 0.3, ease: "easeInOut" }
      } : {}}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: changeDirection === 'up' ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: changeDirection === 'up' ? -10 : 10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="font-medium"
        >
          {formatValue(value)}
        </motion.span>
      </AnimatePresence>

      {showChangeIndicator && changeDirection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={getChangeIndicatorColor()}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              y: changeDirection === 'up' ? [-2, 0, -2] : [2, 0, 2],
              transition: { duration: 0.6, repeat: 2, ease: "easeInOut" }
            }}
          >
            {changeDirection === 'up' ? (
              <path d="M7 14l5-5 5 5" />
            ) : (
              <path d="M17 10l-5 5-5-5" />
            )}
          </motion.svg>
        </motion.div>
      )}

      {/* Pulse effect for significant changes */}
      {isAnimating && Math.abs(value - (previousValue || value)) > value * 0.05 && (
        <motion.div
          className="absolute inset-0 rounded border-2"
          style={{ borderColor: getChangeIndicatorColor() }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
});

AnimatedPriceCell.displayName = 'AnimatedPriceCell';

export default AnimatedPriceCell;