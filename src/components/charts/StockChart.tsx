import { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Settings, Eye, EyeOff } from 'lucide-react';
import { 
  CandlestickData, 
  TechnicalIndicatorData, 
  MACDData, 
  RSIData,
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD,
  generateMockCandlestickData 
} from '../../shared/utils/technicalIndicators';

interface StockChartProps {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  variant?: 'compact' | 'detailed';
  enableTrading?: boolean;
  onOrderPlace?: (orderDetails: any) => void;
}

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '1d';
type TechnicalIndicator = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'Volume';

interface IndicatorConfig {
  type: TechnicalIndicator;
  enabled: boolean;
  period?: number;
  color: string;
}

const StockChart = ({ 
  symbol, 
  name, 
  currentPrice, 
  change, 
  changePercent,
  variant = 'compact',
  enableTrading = false,
  onOrderPlace
}: StockChartProps) => {
  // Add error boundary
  try {
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('candlestick');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: any } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const chartRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [indicators, setIndicators] = useState<IndicatorConfig[]>([
    { type: 'SMA', enabled: false, period: 20, color: '#3b82f6' },
    { type: 'EMA', enabled: false, period: 12, color: '#10b981' },
    { type: 'RSI', enabled: false, period: 14, color: '#f59e0b' },
    { type: 'MACD', enabled: false, color: '#8b5cf6' },
    { type: 'Volume', enabled: true, color: '#6b7280' }
  ]);

  // Generate mock chart data
  const generateChartData = useMemo(() => {
    const points = getPointsForTimeframe(timeframe);
    const basePrice = currentPrice - change;
    
    // Generate candlestick data
    const candleData = generateMockCandlestickData(basePrice, points, timeframe);
    
    // Convert to line chart data for backward compatibility
    const lineData: ChartDataPoint[] = candleData.map((candle, index) => ({
      time: formatTimeLabel(candle.timestamp, timeframe, index),
      price: candle.close,
      volume: candle.volume
    }));
    
    return { lineData, candleData };
  }, [currentPrice, change, timeframe]);

  const getPointsForTimeframe = (tf: Timeframe): number => {
    switch (tf) {
      case '1m': return 60;
      case '5m': return 78; // 6.5 hours of trading
      case '15m': return 26;
      case '1h': return 7;
      case '1d': return 30;
      default: return 30;
    }
  };

  const formatTimeLabel = (timestamp: Date, tf: Timeframe, index: number): string => {
    switch (tf) {
      case '1m':
      case '5m':
      case '15m':
      case '1h':
        return timestamp.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '1d':
        return timestamp.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short' 
        });
      default:
        return `${index + 1}`;
    }
  };

  const getTimeAxisLabels = (data: CandlestickData[], tf: Timeframe): string[] => {
    const labels: string[] = [];
    const step = Math.max(1, Math.floor(data.length / 8)); // Show max 8 labels
    
    for (let i = 0; i < data.length; i += step) {
      labels.push(formatTimeLabel(data[i].timestamp, tf, i));
    }
    
    return labels;
  };

  useEffect(() => {
    const { lineData, candleData } = generateChartData;
    setChartData(lineData);
    setCandlestickData(candleData);
  }, [generateChartData]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate technical indicators
  const technicalData = useMemo(() => {
    if (candlestickData.length === 0) return {};
    
    const result: any = {};
    
    indicators.forEach(indicator => {
      if (!indicator.enabled) return;
      
      switch (indicator.type) {
        case 'SMA':
          result.sma = calculateSMA(candlestickData, indicator.period || 20);
          break;
        case 'EMA':
          result.ema = calculateEMA(candlestickData, indicator.period || 12);
          break;
        case 'RSI':
          result.rsi = calculateRSI(candlestickData, indicator.period || 14);
          break;
        case 'MACD':
          result.macd = calculateMACD(candlestickData);
          break;
      }
    });
    
    return result;
  }, [candlestickData, indicators]);

  const toggleIndicator = (type: TechnicalIndicator) => {
    setIndicators(prev => prev.map(ind => 
      ind.type === type ? { ...ind, enabled: !ind.enabled } : ind
    ));
  };

  const updateIndicatorPeriod = (type: TechnicalIndicator, period: number) => {
    setIndicators(prev => prev.map(ind => 
      ind.type === type ? { ...ind, period } : ind
    ));
  };

  // Auto-scaling Y-axis with price range optimization
  const getOptimizedPriceRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100, range: 100 };
    
    const prices = chartType === 'candlestick' 
      ? candlestickData.flatMap(d => [d.high, d.low])
      : chartData.map(d => d.price);
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    
    // Add 5% padding for better visualization
    const padding = range * 0.05;
    
    return {
      min: Math.max(0, min - padding),
      max: max + padding,
      range: range + (padding * 2)
    };
  }, [chartData, candlestickData, chartType]);

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 320;
    
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Update hover tooltip
      const dataIndex = Math.floor((x / 800) * chartData.length);
      if (dataIndex >= 0 && dataIndex < chartData.length) {
        const data = chartType === 'candlestick' && candlestickData[dataIndex] 
          ? candlestickData[dataIndex] 
          : chartData[dataIndex];
        setHoveredPoint({ x, y, data });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev * zoomFactor)));
  };

  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - start dragging
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      // Two finger touch - start pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
      // Single touch - pan
      const deltaX = e.touches[0].clientX - dragStart.x;
      const deltaY = e.touches[0].clientY - dragStart.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX * 0.5, // Reduce sensitivity on mobile
        y: prev.y + deltaY * 0.5
      }));
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && touchStartDistance > 0) {
      // Two finger touch - pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / touchStartDistance;
      setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * scale)));
      setTouchStartDistance(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setTouchStartDistance(0);
    
    // Handle tap for tooltip on mobile
    if (e.changedTouches.length === 1 && !isDragging) {
      const rect = chartRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.changedTouches[0].clientX - rect.left) / rect.width) * 800;
        const y = ((e.changedTouches[0].clientY - rect.top) / rect.height) * 320;
        const dataIndex = Math.floor((x / 800) * chartData.length);
        if (dataIndex >= 0 && dataIndex < chartData.length) {
          const data = chartType === 'candlestick' && candlestickData[dataIndex] 
            ? candlestickData[dataIndex] 
            : chartData[dataIndex];
          setHoveredPoint({ x, y, data });
          
          // Auto-hide tooltip on mobile after 3 seconds
          setTimeout(() => setHoveredPoint(null), 3000);
        }
      }
    }
  };

  const { min: minPrice, max: maxPrice, range: priceRange } = getOptimizedPriceRange;

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

      {/* Responsive Chart Controls */}
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'} mb-4`}>
        {/* Timeframe Selector */}
        <div className={`flex ${isMobile ? 'justify-center' : ''} space-x-1 ${isMobile ? 'overflow-x-auto' : ''}`}>
          {(['1m', '5m', '15m', '1h', '1d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded-lg text-xs ${isMobile ? 'min-w-[40px]' : 'text-sm'} font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Chart Type and Controls */}
        <div className={`flex items-center ${isMobile ? 'justify-center' : ''} space-x-2`}>
          <button
            onClick={() => setChartType(chartType === 'line' ? 'candlestick' : 'line')}
            className={`p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${isMobile ? 'touch-manipulation' : ''}`}
            title={`Switch to ${chartType === 'line' ? 'candlestick' : 'line'} chart`}
          >
            <BarChart3 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          </button>
          
          <button
            onClick={resetZoomAndPan}
            className={`px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${isMobile ? 'touch-manipulation' : ''}`}
            title="Reset Zoom"
          >
            Reset
          </button>
          
          {!isMobile && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Zoom: {(zoomLevel * 100).toFixed(0)}%
            </div>
          )}
          
          <button
            onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
            className={`p-2 rounded-lg transition-colors ${isMobile ? 'touch-manipulation' : ''} ${
              showIndicatorPanel
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
            title="Technical Indicators"
          >
            <Settings className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          </button>
        </div>
      </div>

      {/* Mobile-Responsive Technical Indicators Panel */}
      {showIndicatorPanel && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <h4 className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900 dark:text-white mb-3`}>
            Technical Indicators
          </h4>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'} gap-3`}>
            {indicators.map((indicator) => (
              <div key={indicator.type} className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between'}`}>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleIndicator(indicator.type)}
                    className={`p-1 rounded touch-manipulation ${
                      indicator.enabled ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {indicator.enabled ? 
                      <Eye className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} /> : 
                      <EyeOff className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                    }
                  </button>
                  <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-700 dark:text-gray-300`}>
                    {indicator.type}
                  </span>
                </div>
                {indicator.period && (
                  <input
                    type="number"
                    value={indicator.period}
                    onChange={(e) => updateIndicatorPeriod(indicator.type, parseInt(e.target.value))}
                    className={`${isMobile ? 'w-16 px-2 py-1 text-sm' : 'w-12 px-1 py-0.5 text-xs'} border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white touch-manipulation`}
                    min="1"
                    max="200"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicator Legend */}
      {indicators.some(i => i.enabled) && (
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          {indicators.filter(i => i.enabled).map((indicator) => (
            <div key={indicator.type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-0.5" 
                style={{ backgroundColor: indicator.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {indicator.type}
                {indicator.period && ` (${indicator.period})`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Chart */}
      <div className="relative mb-4">
        {/* Mobile-Responsive Main Price Chart */}
        <div ref={containerRef} className={`${isMobile ? 'h-64' : 'h-80'} relative overflow-hidden touch-pan-y`}>
          <svg 
            ref={chartRef}
            className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
            viewBox="0 0 800 360"
            onMouseDown={!isMobile ? handleMouseDown : undefined}
            onMouseMove={!isMobile ? handleMouseMove : undefined}
            onMouseUp={!isMobile ? handleMouseUp : undefined}
            onMouseLeave={!isMobile ? () => {
              setHoveredPoint(null);
              setIsDragging(false);
            } : undefined}
            onWheel={!isMobile ? handleWheel : undefined}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              touchAction: 'none' // Prevent default touch behaviors
            }}
          >
            <defs>
              <linearGradient id={`detailed-gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <g key={i}>
                <line
                  x1="0"
                  y1={i * 64}
                  x2="800"
                  y2={i * 64}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  className="text-gray-400"
                />
                <text
                  x="10"
                  y={i * 64 - 5}
                  className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                  ₹{(maxPrice - (i * priceRange / 5)).toFixed(2)}
                </text>
              </g>
            ))}
            
            {/* Vertical Grid Lines with Time Labels */}
            {getTimeAxisLabels(candlestickData, timeframe).map((label, i) => {
              const x = (i / (getTimeAxisLabels(candlestickData, timeframe).length - 1)) * 800;
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="320"
                    stroke="currentColor"
                    strokeOpacity="0.05"
                    className="text-gray-400"
                  />
                  <text
                    x={x}
                    y="340"
                    textAnchor="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Render Chart Based on Type */}
            {chartType === 'candlestick' ? (
              /* Candlestick Chart */
              candlestickData.map((candle, index) => {
                const x = (index / (candlestickData.length - 1)) * 800;
                const candleWidth = Math.max(2, 800 / candlestickData.length * 0.8);
                
                const openY = 320 - ((candle.open - minPrice) / priceRange) * 320;
                const closeY = 320 - ((candle.close - minPrice) / priceRange) * 320;
                const highY = 320 - ((candle.high - minPrice) / priceRange) * 320;
                const lowY = 320 - ((candle.low - minPrice) / priceRange) * 320;
                
                const isGreen = candle.close >= candle.open;
                const bodyHeight = Math.abs(closeY - openY);
                const bodyY = Math.min(openY, closeY);
                
                return (
                  <g key={index}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={isGreen ? '#10b981' : '#ef4444'}
                      strokeWidth="1"
                    />
                    {/* Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyY}
                      width={candleWidth}
                      height={Math.max(1, bodyHeight)}
                      fill={isGreen ? '#10b981' : '#ef4444'}
                      fillOpacity={isGreen ? 0.8 : 1}
                      stroke={isGreen ? '#10b981' : '#ef4444'}
                      strokeWidth="1"
                    />
                  </g>
                );
              })
            ) : (
              /* Line Chart */
              <>
                <path
                  d={chartData.map((point, index) => {
                    const x = (index / (chartData.length - 1)) * 800;
                    const y = 320 - ((point.price - minPrice) / priceRange) * 320;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke={isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                  fill="none"
                />
                
                <path
                  d={[
                    ...chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 800;
                      const y = 320 - ((point.price - minPrice) / priceRange) * 320;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }),
                    `L 800 320 L 0 320 Z`
                  ].join(' ')}
                  fill={`url(#detailed-gradient-${symbol})`}
                />
              </>
            )}

            {/* Technical Indicators */}
            {technicalData.sma && (
              <path
                d={technicalData.sma.map((point: TechnicalIndicatorData, index: number) => {
                  const dataIndex = candlestickData.findIndex(d => d.timestamp.getTime() === point.timestamp.getTime());
                  if (dataIndex === -1) return '';
                  const x = (dataIndex / (candlestickData.length - 1)) * 800;
                  const y = 320 - ((point.value - minPrice) / priceRange) * 320;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="#3b82f6"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="5,5"
              />
            )}

            {technicalData.ema && (
              <path
                d={technicalData.ema.map((point: TechnicalIndicatorData, index: number) => {
                  const dataIndex = candlestickData.findIndex(d => d.timestamp.getTime() === point.timestamp.getTime());
                  if (dataIndex === -1) return '';
                  const x = (dataIndex / (candlestickData.length - 1)) * 800;
                  const y = 320 - ((point.value - minPrice) / priceRange) * 320;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="#10b981"
                strokeWidth="1.5"
                fill="none"
              />
            )}

            {/* Enhanced Hover Tooltip */}
            {hoveredPoint && (
              <g>
                {/* Crosshair */}
                <line
                  x1={hoveredPoint.x}
                  y1="0"
                  x2={hoveredPoint.x}
                  y2="320"
                  stroke="#6b7280"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1="0"
                  y1={hoveredPoint.y}
                  x2="800"
                  y2={hoveredPoint.y}
                  stroke="#6b7280"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                
                {/* Tooltip Box */}
                <rect
                  x={hoveredPoint.x > 400 ? hoveredPoint.x - 140 : hoveredPoint.x + 10}
                  y={hoveredPoint.y > 160 ? hoveredPoint.y - 80 : hoveredPoint.y + 10}
                  width="130"
                  height={chartType === 'candlestick' ? "80" : "50"}
                  fill="rgba(0,0,0,0.9)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  rx="6"
                />
                
                {/* Tooltip Content */}
                {chartType === 'candlestick' && hoveredPoint.data.open !== undefined ? (
                  <>
                    <text
                      x={hoveredPoint.x > 400 ? hoveredPoint.x - 135 : hoveredPoint.x + 15}
                      y={hoveredPoint.y > 160 ? hoveredPoint.y - 65 : hoveredPoint.y + 25}
                      className="text-xs fill-white font-medium"
                    >
                      {formatTimeLabel(hoveredPoint.data.timestamp, timeframe, 0)}
                    </text>
                    <text
                      x={hoveredPoint.x > 400 ? hoveredPoint.x - 135 : hoveredPoint.x + 15}
                      y={hoveredPoint.y > 160 ? hoveredPoint.y - 50 : hoveredPoint.y + 40}
                      className="text-xs fill-green-400"
                    >
                      O: ₹{hoveredPoint.data.open.toFixed(2)}
                    </text>
                    <text
                      x={hoveredPoint.x > 400 ? hoveredPoint.x - 135 : hoveredPoint.x + 15}
                      y={hoveredPoint.y > 160 ? hoveredPoint.y - 35 : hoveredPoint.y + 55}
                      className="text-xs fill-red-400"
                    >
                      H: ₹{hoveredPoint.data.high.toFixed(2)} L: ₹{hoveredPoint.data.low.toFixed(2)}
                    </text>
                    <text
                      x={hoveredPoint.x > 400 ? hoveredPoint.x - 135 : hoveredPoint.x + 15}
                      y={hoveredPoint.y > 160 ? hoveredPoint.y - 20 : hoveredPoint.y + 70}
                      className="text-xs fill-white"
                    >
                      C: ₹{hoveredPoint.data.close.toFixed(2)}
                    </text>
                  </>
                ) : (
                  <>
                    <text
                      x={hoveredPoint.x > 400 ? hoveredPoint.x - 135 : hoveredPoint.x + 15}
                      y={hoveredPoint.y > 160 ? hoveredPoint.y - 30 : hoveredPoint.y + 25}
                      className="text-xs fill-white font-medium"
                    >
                      {hoveredPoint.data.time}
                    </text>
                    <text
                      x={hoveredPoint.x > 400 ? hoveredPoint.x - 135 : hoveredPoint.x + 15}
                      y={hoveredPoint.y > 160 ? hoveredPoint.y - 15 : hoveredPoint.y + 40}
                      className="text-xs fill-white"
                    >
                      Price: ₹{hoveredPoint.data.price.toFixed(2)}
                    </text>
                  </>
                )}
                
                {/* Volume info */}
                <text
                  x={hoveredPoint.x > 400 ? hoveredPoint.x - 135 : hoveredPoint.x + 15}
                  y={hoveredPoint.y > 160 ? hoveredPoint.y - 5 : hoveredPoint.y + (chartType === 'candlestick' ? 85 : 55)}
                  className="text-xs fill-gray-300"
                >
                  Vol: {(hoveredPoint.data.volume || 0).toLocaleString()}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Mobile-Responsive Volume Chart */}
        {indicators.find(i => i.type === 'Volume' && i.enabled) && (
          <div className={`${isMobile ? 'h-12' : 'h-16'} mt-2`}>
            <svg className="w-full h-full" viewBox={`0 0 800 ${isMobile ? '48' : '64'}`}>
              <text x="10" y="15" className="text-xs fill-gray-500 dark:fill-gray-400">Volume</text>
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 800;
                const maxVolume = Math.max(...chartData.map(d => d.volume));
                const height = (point.volume / maxVolume) * 50;
                const barWidth = Math.max(1, 800 / chartData.length * 0.8);
                
                return (
                  <rect
                    key={index}
                    x={x - barWidth / 2}
                    y={64 - height}
                    width={barWidth}
                    height={height}
                    fill="#6b7280"
                    fillOpacity="0.6"
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* Mobile-Responsive RSI Chart */}
        {technicalData.rsi && indicators.find(i => i.type === 'RSI' && i.enabled) && (
          <div className={`${isMobile ? 'h-12' : 'h-16'} mt-2`}>
            <svg className="w-full h-full" viewBox={`0 0 800 ${isMobile ? '48' : '64'}`}>
              <text x="10" y="15" className="text-xs fill-gray-500 dark:fill-gray-400">RSI</text>
              
              {/* RSI Levels */}
              <line x1="0" y1="16" x2="800" y2="16" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="0" y1="32" x2="800" y2="32" stroke="#6b7280" strokeWidth="0.5" />
              <line x1="0" y1="48" x2="800" y2="48" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2,2" />
              
              <text x="750" y="20" className="text-xs fill-red-500">70</text>
              <text x="750" y="36" className="text-xs fill-gray-500">50</text>
              <text x="750" y="52" className="text-xs fill-green-500">30</text>
              
              <path
                d={technicalData.rsi.map((point: RSIData, index: number) => {
                  const dataIndex = candlestickData.findIndex(d => d.timestamp.getTime() === point.timestamp.getTime());
                  if (dataIndex === -1) return '';
                  const x = (dataIndex / (candlestickData.length - 1)) * 800;
                  const y = 64 - (point.rsi / 100) * 48;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="#f59e0b"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        )}

        {/* Mobile-Responsive MACD Chart */}
        {technicalData.macd && indicators.find(i => i.type === 'MACD' && i.enabled) && (
          <div className={`${isMobile ? 'h-12' : 'h-16'} mt-2`}>
            <svg className="w-full h-full" viewBox={`0 0 800 ${isMobile ? '48' : '64'}`}>
              <text x="10" y="15" className="text-xs fill-gray-500 dark:fill-gray-400">MACD</text>
              
              <line x1="0" y1="32" x2="800" y2="32" stroke="#6b7280" strokeWidth="0.5" />
              
              {/* MACD Line */}
              <path
                d={technicalData.macd.map((point: MACDData, index: number) => {
                  const dataIndex = candlestickData.findIndex(d => d.timestamp.getTime() === point.timestamp.getTime());
                  if (dataIndex === -1) return '';
                  const x = (dataIndex / (candlestickData.length - 1)) * 800;
                  const y = 32 - (point.macd * 1000); // Scale for visibility
                  return `${index === 0 ? 'M' : 'L'} ${x} ${Math.max(0, Math.min(64, y))}`;
                }).join(' ')}
                stroke="#8b5cf6"
                strokeWidth="1"
                fill="none"
              />
              
              {/* Signal Line */}
              <path
                d={technicalData.macd.map((point: MACDData, index: number) => {
                  const dataIndex = candlestickData.findIndex(d => d.timestamp.getTime() === point.timestamp.getTime());
                  if (dataIndex === -1) return '';
                  const x = (dataIndex / (candlestickData.length - 1)) * 800;
                  const y = 32 - (point.signal * 1000); // Scale for visibility
                  return `${index === 0 ? 'M' : 'L'} ${x} ${Math.max(0, Math.min(64, y))}`;
                }).join(' ')}
                stroke="#f59e0b"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Mobile-Responsive Chart Stats */}
      <div className={`grid grid-cols-3 ${isMobile ? 'gap-2' : 'gap-4'} text-center`}>
        <div className={`bg-gray-50 dark:bg-slate-700 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>High</p>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white`}>
            ₹{maxPrice.toFixed(2)}
          </p>
        </div>
        <div className={`bg-gray-50 dark:bg-slate-700 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>Low</p>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white`}>
            ₹{minPrice.toFixed(2)}
          </p>
        </div>
        <div className={`bg-gray-50 dark:bg-slate-700 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>Volume</p>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white`}>
            {(chartData[chartData.length - 1]?.volume || 0).toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Mobile Zoom Info */}
      {isMobile && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pinch to zoom • Drag to pan • Tap for details
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Zoom: {(zoomLevel * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Error in StockChart:', error);
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Chart Error</p>
          <p className="text-sm text-gray-500 mt-2">Unable to load chart for {symbol}</p>
        </div>
      </div>
    );
  }
};

export default StockChart;