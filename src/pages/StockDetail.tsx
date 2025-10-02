import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  TrendingUp,
  TrendingDown,
  Lock,
  Activity,
  BarChart3,
} from "lucide-react";
import { mockStocks, startLivePriceUpdates } from "../data/mock/mockStocks";
import { Stock, OptionContract } from "@/shared/types";
import { useAuth } from "@/shared/hooks/useAuth";
import TradingModal from "../components/forms/TradingModal";
import OptionChain from "../components/options/OptionChain";
import SimpleStockChart from "../components/charts/SimpleStockChart";

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isInWishlist, addToWishlist, removeFromWishlist } =
    useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStock, setCurrentStock] = useState<Stock | null>(null);

  const [tradingModal, setTradingModal] = useState<{
    isOpen: boolean;
    type: "buy" | "sell";
    instrumentType: "stock" | "option";
    optionContract?: OptionContract;
  }>({
    isOpen: false,
    type: "buy",
    instrumentType: "stock",
  });

  useEffect(() => {
    if (symbol) {
      const stock = mockStocks.find((s) => s.symbol === symbol);
      if (stock) {
        setCurrentStock(stock);
      } else {
        navigate("/");
      }
    }
  }, [symbol, navigate]);

  useEffect(() => {
    if (!currentStock || !symbol) return;

    const unsubscribe = startLivePriceUpdates((stocks) => {
      const updatedStock = stocks.find((s) => s.symbol === symbol);
      if (updatedStock) {
        setCurrentStock(updatedStock);
      }
    });

    return unsubscribe;
  }, [symbol, currentStock]);

  if (!currentStock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-gray-300 font-semibold">
            Loading stock details...
          </p>
        </motion.div>
      </div>
    );
  }

  const isPositive = currentStock.change > 0;
  const inWishlist = isInWishlist(currentStock.symbol);

  const handleWishlistClick = () => {
    if (!isAuthenticated) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (inWishlist) {
      removeFromWishlist(currentStock.symbol);
    } else {
      addToWishlist({
        symbol: currentStock.symbol,
        name: currentStock.name,
        price: currentStock.price,
        change: currentStock.change,
        changePercent: currentStock.changePercent,
      });
    }
  };

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setTradingModal({ isOpen: true, type: "buy", instrumentType: "stock" });
    }
  };

  const handleSellClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setTradingModal({ isOpen: true, type: "sell", instrumentType: "stock" });
    }
  };

  const handleOptionSelect = (option: OptionContract) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setTradingModal({
        isOpen: true,
        type: "buy",
        instrumentType: "option",
        optionContract: option,
      });
    }
  };

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <motion.button
              onClick={() => navigate("/")}
              className="p-2 md:p-3 glass-button rounded-xl hover:shadow-neon-blue/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {currentStock.name}
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {currentStock.fullName}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <motion.button
              onClick={handleWishlistClick}
              className={`p-3 rounded-xl transition-all duration-300 ${
                inWishlist
                  ? "text-neon-pink shadow-neon-red/30 glass-card"
                  : "text-gray-400 hover:text-neon-pink hover:shadow-neon-red/20 glass-button"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart
                className={`h-6 w-6 ${inWishlist ? "fill-current" : ""}`}
              />
            </motion.button>
          ) : (
            <motion.button
              onClick={() => navigate("/login")}
              className="p-3 glass-button rounded-xl hover:shadow-neon-blue/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Login to add to wishlist"
            >
              <Lock className="h-6 w-6 text-gray-400" />
            </motion.button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Section - Info */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-8 relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <span className="text-2xl md:text-4xl font-bold font-mono text-gray-900 dark:text-white">
                    ₹{currentStock.price.toLocaleString()}
                  </span>
                  <motion.div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full glass-card ${
                      isPositive
                        ? "text-neon-green shadow-neon-green/20"
                        : "text-neon-red shadow-neon-red/20"
                    }`}
                    animate={{
                      boxShadow: isPositive
                        ? [
                            "0 0 10px rgba(16, 185, 129, 0.2)",
                            "0 0 20px rgba(16, 185, 129, 0.4)",
                            "0 0 10px rgba(16, 185, 129, 0.2)",
                          ]
                        : [
                            "0 0 10px rgba(239, 68, 68, 0.2)",
                            "0 0 20px rgba(239, 68, 68, 0.4)",
                            "0 0 10px rgba(239, 68, 68, 0.2)",
                          ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span className="text-lg font-semibold font-mono">
                      {isPositive ? "+" : ""}₹{currentStock.change.toFixed(2)}
                    </span>
                    <span className="text-sm">
                      ({isPositive ? "+" : ""}
                      {currentStock.changePercent.toFixed(2)}%)
                    </span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
                  <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-4">
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Volume
                    </p>
                    <p className="text-sm md:text-xl font-bold font-mono text-gray-900 dark:text-white">
                      {currentStock.volume}
                    </p>
                  </div>
                  <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-4">
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Symbol
                    </p>
                    <p className="text-sm md:text-xl font-bold font-mono text-neon-blue">
                      {currentStock.symbol}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 md:space-x-4">
                  <motion.button
                    onClick={handleBuyClick}
                    className="flex-1 py-3 md:py-4 bg-gradient-to-r from-neon-green to-green-400 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg tracking-wide hover:shadow-neon-green/30 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    BUY
                  </motion.button>
                  <motion.button
                    onClick={handleSellClick}
                    className="flex-1 py-3 md:py-4 bg-gradient-to-r from-neon-red to-red-400 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg tracking-wide hover:shadow-neon-red/30 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    SELL
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-neon-blue" />
                <span>About</span>
              </h3>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentStock.description}
              </p>
            </motion.div>
          </div>

          {/* Right Section - Chart */}
          <motion.div
            className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-8 relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Price Chart
                  </h3>
                  <motion.div
                    className="flex items-center space-x-2 glass-card px-3 py-1 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(16, 185, 129, 0.2)",
                        "0 0 20px rgba(16, 185, 129, 0.4)",
                        "0 0 10px rgba(16, 185, 129, 0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="text-xs text-neon-green font-semibold font-mono">
                      LIVE
                    </span>
                    <Activity className="h-3 w-3 text-neon-green animate-pulse" />
                  </motion.div>
                </div>
              </div>

              <div className="w-full">
                <SimpleStockChart
                  symbol={currentStock.symbol}
                  name={currentStock.name}
                  currentPrice={currentStock.price}
                  change={currentStock.change}
                  changePercent={currentStock.changePercent}
                  variant="detailed"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Option Chain Section - Desktop */}
        <motion.div
          className="mt-8 hidden md:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <OptionChain
            underlying={currentStock.symbol}
            variant="stock-detail"
            onOptionSelect={handleOptionSelect}
            className="rounded-3xl"
          />
        </motion.div>

        {/* Mobile Option Chain CTA */}
        <motion.div
          className="mt-6 md:hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Options Trading
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View option chain for {currentStock.symbol}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(`/options?underlying=${currentStock.symbol}`)
                }
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg text-sm"
              >
                View Options
              </button>
            </div>
          </div>
        </motion.div>

        <TradingModal
          isOpen={tradingModal.isOpen}
          onClose={() => setTradingModal({ ...tradingModal, isOpen: false })}
          stock={currentStock}
          type={tradingModal.type}
          instrumentType={tradingModal.instrumentType}
          optionContract={tradingModal.optionContract}
        />
      </div>
    </motion.div>
  );
};

export default StockDetail;
