import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SimpleStockChartProps {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  variant?: 'compact' | 'detailed';
}

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

const SimpleStockChart = ({ 
  symbol, 
  name, 
  currentPrice, 
  change, 
  changePercent,
  variant = 'compact'
}: SimpleStockChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1D');
  const navigate = useNavigate();
  
  // Generate simple mock data based on timeframe
  const chartData = useMemo(() => {
    const pointsMap = { '1D': 24, '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };
    const points = pointsMap[selectedTimeframe];
    const data = [];
    const basePrice = currentPrice - change;
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const volatility = (Math.random() - 0.5) * 0.02;
      const trend = change * progress;
      const price = Math.max(0, basePrice + trend + (basePrice * volatility));
      data.push(price);
    }
    
    return data;
  }, [currentPrice, change, selectedTimeframe]);

  const isPositive = change >= 0;
  const maxPrice = Math.max(...chartData);
  const minPrice = Math.min(...chartData);
  const priceRange = maxPrice - minPrice || 1;

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{symbol}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white">₹{currentPrice.toFixed(2)}</p>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}₹{change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        {/* Simple Chart */}
        <div className="h-16 relative">
          <svg className="w-full h-full" viewBox="0 0 300 60">
            <path
              d={chartData.map((price, index) => {
                const x = (index / (chartData.length - 1)) * 300;
                const y = 60 - ((price - minPrice) / priceRange) * 60;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        {/* Mobile Layout */}
        <div className="block md:hidden mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{symbol}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{name}</p>
            </div>
            <button
              onClick={() => navigate(`/stock/${symbol}/chart`)}
              className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-xs"
            >
              <Maximize2 className="h-3 w-3" />
              <span>View</span>
            </button>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{currentPrice.toFixed(2)}</p>
            <div className={`flex items-center justify-center space-x-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">
                {isPositive ? '+' : ''}₹{change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{symbol}</h3>
            <p className="text-gray-600 dark:text-gray-400">{name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{currentPrice.toFixed(2)}</p>
              <div className={`flex items-center space-x-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  {isPositive ? '+' : ''}₹{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            
            {/* View Graph Button */}
            <button
              onClick={() => navigate(`/stock/${symbol}/chart`)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              <Maximize2 className="h-4 w-4" />
              <span>View Graph</span>
            </button>
          </div>
        </div>

        {/* Timeline Buttons - Responsive */}
        <div className="flex justify-center space-x-1 bg-gray-100 dark:bg-slate-700/80 rounded-lg p-1 overflow-x-auto">
          {(['1D', '1W', '1M', '3M', '1Y'] as TimeFrame[]).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedTimeframe === timeframe
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-600/70'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 md:px-6 pb-4">
        <div className="h-48 md:h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 600 250">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 62.5}
                x2="600"
                y2={i * 62.5}
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-gray-400"
              />
            ))}
            
            {/* Chart Line */}
            <path
              d={chartData.map((price, index) => {
                const x = (index / (chartData.length - 1)) * 600;
                const y = 250 - ((price - minPrice) / priceRange) * 250;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="3"
              fill="none"
            />
            
            {/* Fill Area */}
            <path
              d={[
                ...chartData.map((price, index) => {
                  const x = (index / (chartData.length - 1)) * 600;
                  const y = 250 - ((price - minPrice) / priceRange) * 250;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }),
                `L 600 250 L 0 250 Z`
              ].join(' ')}
              fill={isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
            />
          </svg>
        </div>
      </div>

      {/* Chart Stats */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 md:p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">High</p>
            <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">₹{maxPrice.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 md:p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Low</p>
            <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">₹{minPrice.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 md:p-3 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Volume</p>
            <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">2.4M</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleStockChart;