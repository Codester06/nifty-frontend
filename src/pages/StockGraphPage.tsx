import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { mockStocks } from "../data/mockStocks";

const StockGraphPage = () => {
  console.log("🚀 StockGraphPage component loaded");
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  // Find the stock data
  const stock = mockStocks.find((s) => s.symbol === symbol);

  // Loading state to prevent premature redirects
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);

  // Chart state
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for display stock with real-time updates
  const [displayStock, setDisplayStock] = useState(() => {
    if (stock) {
      return stock;
    }
    return {
      symbol: symbol || "DEMO",
      name: "Demo Stock",
      price: 150.25,
      change: 2.45,
      changePercent: 1.66,
      volume: "1.2M",
      marketCap: "45.2B",
    };
  });

  // Update displayStock when stock is found
  useEffect(() => {
    if (stock) {
      setDisplayStock(stock);
    }
  }, [stock]);

  // Dynamic zoom functions for trading-style zoom
  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      return Math.min(prev * 1.5, 10); // Higher zoom levels for more detail
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      return Math.max(prev / 1.5, 0.5); // Allow zooming out more
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Dynamic time resolution based on zoom level
  const getTimeResolution = (zoomLevel: number) => {
    if (zoomLevel >= 5) return "seconds"; // Very zoomed in - show seconds
    if (zoomLevel >= 2) return "sub-minutes"; // Zoomed in - show sub-minutes
    if (zoomLevel >= 1) return "minutes"; // Normal - show minutes
    return "hours"; // Zoomed out - show hours
  };

  // Get dynamic data points based on zoom
  const getDynamicDataPoints = (zoomLevel: number, basePoints: number) => {
    const multiplier = Math.max(1, zoomLevel);
    return Math.min(Math.floor(basePoints * multiplier), 200); // Cap at 200 for performance
  };

  // Generate dynamic time labels based on zoom level
  const getDynamicTimeLabel = (
    timeIndex: number,
    timeframe: string,
    selectedTimeframe: string
  ) => {
    const resolution = getTimeResolution(zoomLevel);

    if (resolution === "seconds") {
      // Show seconds when very zoomed in
      const seconds = timeIndex * 30; // 30-second intervals
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else if (resolution === "sub-minutes") {
      // Show sub-minute intervals when zoomed in
      const totalSeconds = timeIndex * 15; // 15-second intervals
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      if (seconds === 0) {
        return `${minutes}m`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
    } else if (resolution === "minutes") {
      // Normal minute display
      if (timeframe.includes("min")) {
        return `${timeIndex}m`;
      } else if (timeframe.includes("H")) {
        return `${Math.floor(timeIndex / 60)}:${(timeIndex % 60)
          .toString()
          .padStart(2, "0")}`;
      } else {
        return `${timeIndex}h`;
      }
    } else {
      // Hours for zoomed out view
      return `${Math.floor(timeIndex / 60)}h`;
    }

    // Use selectedTimeframe parameter to avoid unused variable warning
    console.log("Using timeframe:", selectedTimeframe);
  };

  // Load stock data
  useEffect(() => {
    console.log("=== STOCK LOADING DEBUG ===");
    console.log("URL symbol:", symbol);
    console.log(
      "Available stocks:",
      mockStocks.map((s) => s.symbol)
    );
    console.log("Found stock:", stock);
    console.log("Display stock:", displayStock);
    console.log("========================");

    if (!symbol) {
      console.log("No symbol provided, redirecting");
      navigate("/");
      return;
    }

    // Give some time for the component to mount and stock to be found
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Only redirect if we've waited, the stock still doesn't exist, and we haven't already tried
      if (symbol && !stock && !hasAttemptedRedirect) {
        console.log("❌ Stock not found for symbol:", symbol);
        console.log("Redirecting to stock details page");
        setHasAttemptedRedirect(true);
        navigate(`/stock/${symbol}`);
      }
    }, 500); // Shorter delay, just enough to prevent race conditions

    return () => clearTimeout(timer);
  }, [symbol, stock, navigate, hasAttemptedRedirect]);

  // Reset zoom when timeframe or chart type changes
  useEffect(() => {
    handleResetZoom();
  }, [selectedTimeframe, chartType]);

  // Keyboard shortcuts for zoom (desktop) and touch gestures (mobile)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    // Touch gesture handling for mobile
    let touchStartDistance = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchStartDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistance > 0) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        if (touchStartDistance > 0) {
          const scale = currentDistance / touchStartDistance;
          if (scale > 1.1) {
            handleZoomIn();
            touchStartDistance = currentDistance;
          } else if (scale < 0.9) {
            handleZoomOut();
            touchStartDistance = currentDistance;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Real-time data updates
  useEffect(() => {
    if (!stock) return;

    const interval = setInterval(() => {
      // Simulate real-time price updates with smaller, more realistic changes
      setDisplayStock((prev) => {
        const priceChange = (Math.random() - 0.5) * 0.5; // Random change between -0.25 and 0.25
        const newPrice = Math.max(0, prev.price + priceChange);
        const newChange = newPrice - prev.price;
        const newChangePercent = (newChange / prev.price) * 100;

        return {
          ...prev,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
        };
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [stock, stock.symbol]);

  // Generate chart data with dynamic zoom support
  const generateChartData = (timeframe: string, currentPrice: number) => {
    console.log(
      `Generating chart data for ${timeframe} with zoom level ${zoomLevel}`
    );

    interface ChartDataPoint {
      time: string;
      price: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }

    const baseDataPoints: { [key: string]: number } = {
      "1min": 60,
      "2min": 120,
      "5min": 288,
      "15min": 96,
      "30min": 48,
      "1H": 24,
      "4H": 24,
      "1D": 30,
      "1W": 52,
      "1M": 12,
    };

    // Dynamic points based on zoom level
    const basePoints = baseDataPoints[timeframe] || 24;
    const points = getDynamicDataPoints(zoomLevel, basePoints);

    const data: ChartDataPoint[] = [];
    let price = currentPrice;

    for (let i = 0; i < points; i++) {
      const timeLabel = getDynamicTimeLabel(i, timeframe, selectedTimeframe);

      // Generate realistic OHLC data
      const open = price;
      const volatility = currentPrice * 0.008; // Reduced from 2% to 0.8% volatility
      const change = (Math.random() - 0.5) * volatility;
      const close = Math.max(0, open + change);

      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;

      const volume = Math.floor(Math.random() * 1000000) + 100000;

      data.push({
        time: timeLabel,
        price: close,
        open,
        high,
        low,
        close,
        volume,
      });

      price = close;
    }

    console.log(
      `Generated ${data.length} data points for zoom level ${zoomLevel}`
    );
    return data;
  };

  // State for chart data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Generate initial chart data
  useEffect(() => {
    console.log(
      `Generating chart data for ${displayStock.symbol} - ${selectedTimeframe} at zoom ${zoomLevel}`
    );
    const newData = generateChartData(selectedTimeframe, displayStock.price);
    setChartData(newData);
    console.log("Chart data generated:", newData.length, "points");
  }, [
    displayStock.symbol,
    selectedTimeframe,
    displayStock.price,
    zoomLevel,
    generateChartData,
  ]);

  // Real-time chart updates
  useEffect(() => {
    if (!stock || chartData.length === 0) return;

    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newData = [...prevData];
        const lastPoint = newData[newData.length - 1];

        if (lastPoint) {
          // Update the last point with smaller, more realistic price changes
          const priceChange =
            (Math.random() - 0.5) * (displayStock.price * 0.003); // Reduced from 0.01 to 0.003
          const newPrice = Math.max(0, lastPoint.close + priceChange);

          newData[newData.length - 1] = {
            ...lastPoint,
            price: newPrice,
            close: newPrice,
            high: Math.max(lastPoint.high, newPrice),
            low: Math.min(lastPoint.low, newPrice),
          };
        }

        return newData;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [
    stock?.symbol,
    selectedTimeframe,
    chartData.length,
    stock,
    displayStock.price,
  ]);

  if (isLoading || !stock) {
    console.log("⚠️ No stock loaded, will use demo data for display");

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg mb-2">Loading chart data...</p>
          <div className="text-sm opacity-75 bg-black/50 p-3 rounded mb-4">
            <p>Symbol: {symbol || "undefined"}</p>
            <p>MockStocks loaded: {mockStocks.length} stocks</p>
            <p>
              Available:{" "}
              {mockStocks
                .slice(0, 3)
                .map((s) => s.symbol)
                .join(", ")}
              ...
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back Home
            </button>
            {symbol && (
              <button
                onClick={() => (window.location.href = `/stock/${symbol}`)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                View Stock Details
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  interface ChartDataPoint {
    time: string;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

  const LineChart = ({ data }: { data: ChartDataPoint[] }) => {
    if (!data || !data.length) {
      return (
        <div className="flex items-center justify-center h-full text-white bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">No Chart Data</p>
            <p className="text-sm opacity-75">
              Unable to load chart data for {displayStock.symbol}
            </p>
          </div>
        </div>
      );
    }

    const maxPrice = Math.max(...data.map((d) => d.price));
    const minPrice = Math.min(...data.map((d) => d.price));
    const priceRange = maxPrice - minPrice || 1;

    console.log("Chart price range:", minPrice, "to", maxPrice);

    return (
      <div className="relative w-full h-full overflow-hidden bg-transparent md:bg-slate-800/50 border-0 md:border md:border-white/10 md:rounded-lg">
        <div className="absolute top-2 left-2 text-white text-xs bg-black/70 px-2 py-1 rounded hidden md:block">
          Zoom: {zoomLevel.toFixed(1)}x | Points: {data.length}
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 400"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`grid-${i}`}
              x1="60"
              y1={80 + (i * 240) / 4}
              x2="740"
              y2={80 + (i * 240) / 4}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Vertical grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`vgrid-${i}`}
              x1={60 + (i * 680) / 4}
              y1="80"
              x2={60 + (i * 680) / 4}
              y2="320"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const price = minPrice + (priceRange * (4 - i)) / 4;
            return (
              <text
                key={`y-label-${i}`}
                x="50"
                y={85 + (i * 240) / 4}
                fill="white"
                fontSize="12"
                textAnchor="end"
                className="font-mono"
              >
                ${price.toFixed(2)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const dataIndex = Math.floor((data.length - 1) * (i / 4));
            const timeLabel = getDynamicTimeLabel(
              dataIndex,
              selectedTimeframe,
              selectedTimeframe
            );
            return (
              <text
                key={`x-label-${i}`}
                x={60 + (i * 680) / 4}
                y="340"
                fill="white"
                fontSize="12"
                textAnchor="middle"
                className="font-mono"
              >
                {timeLabel}
              </text>
            );
          })}

          {/* Price line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data
              .map((point, index) => {
                const x = 60 + (index * 680) / (data.length - 1);
                const y = 320 - ((point.price - minPrice) / priceRange) * 240;
                return `${x},${y}`;
              })
              .join(" ")}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = 60 + (index * 680) / (data.length - 1);
            const y = 320 - ((point.price - minPrice) / priceRange) * 240;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const CandlestickChart = ({ data }: { data: ChartDataPoint[] }) => {
    if (!data.length)
      return (
        <div className="flex items-center justify-center h-full text-white/50">
          No data available
        </div>
      );

    const maxPrice = Math.max(
      ...data.map((d) => Math.max(d.high, d.open, d.close))
    );
    const minPrice = Math.min(
      ...data.map((d) => Math.min(d.low, d.open, d.close))
    );
    const priceRange = maxPrice - minPrice || 1;

    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-800/20 md:bg-slate-800/50 border-0 md:border md:border-white/10 md:rounded-lg">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 400"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`grid-${i}`}
              x1="60"
              y1={80 + (i * 240) / 4}
              x2="740"
              y2={80 + (i * 240) / 4}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const price = minPrice + (priceRange * (4 - i)) / 4;
            return (
              <text
                key={`y-label-${i}`}
                x="50"
                y={85 + (i * 240) / 4}
                fill="white"
                fontSize="12"
                textAnchor="end"
                className="font-mono"
              >
                ${price.toFixed(2)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const dataIndex = Math.floor((data.length - 1) * (i / 4));
            const timeLabel = getDynamicTimeLabel(
              dataIndex,
              selectedTimeframe,
              selectedTimeframe
            );
            return (
              <text
                key={`x-label-${i}`}
                x={60 + (i * 680) / 4}
                y="340"
                fill="white"
                fontSize="12"
                textAnchor="middle"
                className="font-mono"
              >
                {timeLabel}
              </text>
            );
          })}

          {/* Candlesticks */}
          {data.map((point, index) => {
            const x = 60 + (index * 680) / (data.length - 1);
            const highY = 320 - ((point.high - minPrice) / priceRange) * 240;
            const lowY = 320 - ((point.low - minPrice) / priceRange) * 240;
            const openY = 320 - ((point.open - minPrice) / priceRange) * 240;
            const closeY = 320 - ((point.close - minPrice) / priceRange) * 240;

            const isGreen = point.close > point.open;
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));

            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isGreen ? "#10b981" : "#ef4444"}
                  strokeWidth="1"
                />
                <rect
                  x={x - 3}
                  y={bodyTop}
                  width="6"
                  height={bodyHeight}
                  fill={isGreen ? "#10b981" : "#ef4444"}
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading chart...</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case "candlestick":
        return <CandlestickChart data={chartData} />;
      default:
        return <LineChart data={chartData} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden">
      <div className="flex-1 relative">
        {/* Chart container - Desktop only, mobile shows message */}
        <div className="absolute inset-0 bg-slate-900">
          {/* Mobile: Stock Information Display */}
          <div className="w-full h-full md:hidden bg-slate-900">
            <div className="p-4 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => (window.location.href = `/stock/${symbol}`)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-white">
                  {displayStock.symbol}
                </h1>
                <div></div>
              </div>

              {/* Stock Info Card */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                <div className="text-center space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {displayStock.name}
                    </h2>
                    <p className="text-3xl font-bold text-white">
                      ${displayStock.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    {displayStock.change >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <span
                      className={`text-lg font-semibold ${
                        displayStock.change >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {displayStock.change >= 0 ? "+" : ""}
                      {displayStock.change.toFixed(2)} (
                      {displayStock.changePercent.toFixed(2)}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-white/60 text-sm">Volume</p>
                      <p className="text-white font-semibold">
                        {displayStock.volume}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-sm">Market Cap</p>
                      <p className="text-white font-semibold">
                        {"marketCap" in displayStock
                          ? displayStock.marketCap
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Chart Link */}
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
                <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Advanced Chart View
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  For detailed technical analysis and interactive charts, please
                  use the desktop version.
                </p>
                <div className="text-xs text-white/50">
                  Open this page on a desktop or tablet for the full trading
                  experience
                </div>
              </div>

              {/* Live Indicator */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white font-medium">
                    LIVE DATA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Full Chart Interface */}
          <div className="hidden md:block w-full h-full">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => (window.location.href = `/stock/${symbol}`)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      {displayStock.symbol}
                    </h1>
                    <p className="text-sm text-white/60">{displayStock.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      ${displayStock.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end space-x-1">
                      {displayStock.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          displayStock.change >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {displayStock.change >= 0 ? "+" : ""}
                        {displayStock.change.toFixed(2)} (
                        {displayStock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="absolute top-20 left-0 right-0 bottom-16 p-4">
              <div className="w-full h-full relative">{renderChart()}</div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-white/10 p-4">
              <div className="flex items-center justify-between">
                {/* Timeframe Selector */}
                <div className="flex items-center space-x-2">
                  {[
                    "1min",
                    "2min",
                    "5min",
                    "15min",
                    "30min",
                    "1H",
                    "4H",
                    "1D",
                    "1W",
                    "1M",
                  ].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        selectedTimeframe === timeframe
                          ? "bg-blue-600 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setChartType("line")}
                    className={`p-2 rounded transition-colors ${
                      chartType === "line"
                        ? "bg-blue-600 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setChartType("candlestick")}
                    className={`p-2 rounded transition-colors ${
                      chartType === "candlestick"
                        ? "bg-blue-600 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-white/60 font-mono min-w-[60px] text-center">
                    {zoomLevel.toFixed(1)}x
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
                    <Target className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockGraphPage;
