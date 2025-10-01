import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  variant?: 'compact' | 'detailed';
}

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

const StockChart = ({ 
  symbol, 
  name, 
  currentPrice, 
  change, 
  changePercent,
  variant = 'compact' 
}: StockChartProps) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M'>('1D');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Generate mock chart data
  const generateChartData = useMemo(() => {
    const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 90;
    const data: ChartDataPoint[] = [];
    const basePrice = currentPrice - change;
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const volatility = Math.random() * 0.02 - 0.01; // ±1% random volatility
      const trend = change * progress; // Linear trend towards current change
      const price = basePrice + trend + (basePrice * volatility);
      
      data.push({
        time: timeframe === '1D' 
          ? `${i}:00` 
          : timeframe === '1W' 
            ? `Day ${i + 1}`
            : `${i + 1}`,
        price: Math.max(0, price),
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    return data;
  }, [currentPrice, change, timeframe]);

  useEffect(() => {
    setChartData(generateChartData);
  }, [generateChartData]);

  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  const isPositive = change >= 0;

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
        
        {/* Mini Chart */}
        <div className="h-16 relative">
          <svg className="w-full h-full" viewBox="0 0 300 60">
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Chart Line */}
            <path
              d={chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 300;
                const y = 60 - ((point.price - minPrice) / priceRange) * 60;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              fill="none"
            />
            
            {/* Fill Area */}
            <path
              d={[
                ...chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 300;
                  const y = 60 - ((point.price - minPrice) / priceRange) * 60;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }),
                `L 300 60 L 0 60 Z`
              ].join(' ')}
              fill={`url(#gradient-${symbol})`}
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{symbol}</h3>
          <p className="text-gray-600 dark:text-gray-400">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{currentPrice.toFixed(2)}</p>
          <div className={`flex items-center space-x-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="font-medium">
              {isPositive ? '+' : ''}₹{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2 mb-4">
        {(['1D', '1W', '1M', '3M'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Detailed Chart */}
      <div className="h-64 relative mb-4">
        <svg className="w-full h-full" viewBox="0 0 600 250">
          <defs>
            <linearGradient id={`detailed-gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
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
            d={chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * 600;
              const y = 250 - ((point.price - minPrice) / priceRange) * 250;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth="3"
            fill="none"
          />
          
          {/* Fill Area */}
          <path
            d={[
              ...chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 600;
                const y = 250 - ((point.price - minPrice) / priceRange) * 250;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }),
              `L 600 250 L 0 250 Z`
            ].join(' ')}
            fill={`url(#detailed-gradient-${symbol})`}
          />
          
          {/* Data Points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 600;
            const y = 250 - ((point.price - minPrice) / priceRange) * 250;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={isPositive ? '#10b981' : '#ef4444'}
                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <title>{`${point.time}: ₹${point.price.toFixed(2)}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
          <p className="font-semibold text-gray-900 dark:text-white">₹{maxPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Low</p>
          <p className="font-semibold text-gray-900 dark:text-white">₹{minPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Volume</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {(chartData[chartData.length - 1]?.volume || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockChart;