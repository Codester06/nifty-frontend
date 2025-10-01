import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Zap,
  Newspaper,
  Heart,
  Lock,
  CheckCircle,
  Star,
  Users,
  Award,
  Globe,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  Verified,
} from "lucide-react";
import { mockStocks, startLivePriceUpdates } from "@/data/mock/mockStocks";
import { Stock } from "@/shared/types/types";
import {
  TradingViewWidget,
  TechnicalAnalysisWidget,
} from "@/components/charts";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  mockSocialProofData,
  mockTrustMetrics,
  mockSecurityBadges,
  mockSupportOptions,
  getLiveSocialProofData,
} from "@/data/mock/trustData";

const HomePage = () => {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [showAllStocks, setShowAllStocks] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [socialProofData, setSocialProofData] = useState(mockSocialProofData);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const unsubscribe = startLivePriceUpdates(setStocks);
    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(savedWishlist);

    // Update social proof data every 30 seconds
    const socialProofInterval = setInterval(() => {
      setSocialProofData(getLiveSocialProofData());
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(socialProofInterval);
    };
  }, []);

  const handleWishlistToggle = (symbol: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to stock detail

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const updatedWishlist = wishlist.includes(symbol)
      ? wishlist.filter((item) => item !== symbol)
      : [...wishlist, symbol];

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-emerald-600/20"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            {/* Hero Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-10 leading-tight">
              <span className="block mb-2">Master the</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Stock Market
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <div className="max-w-5xl mx-auto mb-12">
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-6 leading-relaxed font-light">
                Transform your financial future with comprehensive stock market
                education
              </p>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
                Learn from experts • Practice with real data • Build lasting
                wealth
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Security</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Award className="h-4 w-4 text-blue-400" />
                  <span>RBI Compliant</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>Trusted Users</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>4.7★ Rating</span>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button
                onClick={() =>
                  isAuthenticated ? navigate("/dashboard") : navigate("/signup")
                }
                className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-2xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isAuthenticated ? "Go to Dashboard" : "Start Learning Free"}
                  <BarChart3 className="ml-2 h-5 w-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-10 py-5 border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Data Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold mb-8 shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
              LIVE MARKET DATA • REAL-TIME UPDATES
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Practice with
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Real Market Data
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Master stock analysis using live data from NSE's top companies.
              Learn technical analysis, fundamental research, and portfolio
              management with real market movements.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden backdrop-blur-xl">
            {/* Modern Header */}
            <div className="px-8 py-6 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Live Market Dashboard
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Real-time NSE data for learning
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Live Updates
                  </span>
                </div>
              </div>
            </div>

            {/* Modern Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
              {(showAllStocks ? stocks : stocks.slice(0, 12)).map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                    className="group bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-3xl p-6 border border-gray-200/50 dark:border-slate-600/50 hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-105 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <span className="text-white font-black text-lg">
                            {stock.symbol.substring(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-lg text-gray-900 dark:text-white truncate">
                            {stock.symbol}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-medium">
                            {stock.name.length > 18
                              ? stock.name.substring(0, 18) + "..."
                              : stock.name}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleWishlistToggle(stock.symbol, e)}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        {!isAuthenticated ? (
                          <Lock className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Heart
                            className={`h-5 w-5 transition-colors duration-200 ${
                              wishlist.includes(stock.symbol)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                          ₹{stock.price.toFixed(2)}
                        </span>
                        <div
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${
                            isPositive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-bold text-sm">
                            {isPositive ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-2xl border-2 ${
                          isPositive
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
                            : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Change Today
                          </span>
                          <span
                            className={`font-bold text-lg ${
                              isPositive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}₹{stock.change.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Mini Chart Placeholder */}
                      <div className="h-12 bg-gray-50 dark:bg-slate-600/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center space-x-1">
                          <div
                            className={`w-1 h-6 rounded-full ${
                              isPositive ? "bg-green-400" : "bg-red-400"
                            }`}
                          ></div>
                          <div
                            className={`w-1 h-4 rounded-full ${
                              isPositive ? "bg-green-300" : "bg-red-300"
                            }`}
                          ></div>
                          <div
                            className={`w-1 h-8 rounded-full ${
                              isPositive ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <div
                            className={`w-1 h-3 rounded-full ${
                              isPositive ? "bg-green-300" : "bg-red-300"
                            }`}
                          ></div>
                          <div
                            className={`w-1 h-7 rounded-full ${
                              isPositive ? "bg-green-400" : "bg-red-400"
                            }`}
                          ></div>
                          <div
                            className={`w-1 h-5 rounded-full ${
                              isPositive ? "bg-green-300" : "bg-red-300"
                            }`}
                          ></div>
                          <div
                            className={`w-1 h-9 rounded-full ${
                              isPositive ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-600">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Vol: {(Math.random() * 10 + 1).toFixed(1)}M
                          </span>
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            NSE Live
                          </span>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modern Show More/Less Button */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 border-t border-gray-200/50 dark:border-slate-700/50">
              <div className="text-center">
                <button
                  onClick={() => setShowAllStocks(!showAllStocks)}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                >
                  {showAllStocks ? (
                    <>
                      <BarChart3 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Show Less Stocks
                      <svg
                        className="ml-3 h-5 w-5 rotate-180 group-hover:translate-y-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Explore All {stocks.length} Stocks
                      <svg
                        className="ml-3 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modules Section */}
      <section className="py-16 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium mb-6">
              <BarChart3 className="h-4 w-4 mr-2" />
              Learning Modules
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Master Stock Market Fundamentals
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive courses designed by experts to help you understand
              markets, analyze stocks, and make informed decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Beginner Course */}
            <div className="group bg-white dark:bg-slate-800/80 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Stock Market Fundamentals
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                Master the basics: market mechanics, stock valuation, financial
                statements, and investment psychology
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>15 Interactive Lessons</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real Market Examples</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Practice Quizzes</span>
                </div>
              </div>
              <button
                onClick={() =>
                  isAuthenticated ? navigate("/dashboard") : navigate("/signup")
                }
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
              >
                {isAuthenticated ? "Access Course" : "Start Learning"}
              </button>
            </div>

            {/* Intermediate Course */}
            <div className="group bg-white dark:bg-slate-800/80 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Technical Analysis Mastery
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                Advanced charting techniques, pattern recognition, momentum
                indicators, and timing strategies
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>20 Advanced Lessons</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Live Chart Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Trading Strategies</span>
                </div>
              </div>
              <button
                onClick={() =>
                  isAuthenticated ? navigate("/dashboard") : navigate("/signup")
                }
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg"
              >
                {isAuthenticated ? "Access Course" : "Start Learning"}
              </button>
            </div>

            {/* Advanced Course */}
            <div className="group bg-white dark:bg-slate-800/80 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Wealth Building Strategies
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                Portfolio optimization, asset allocation, risk management, and
                long-term wealth creation strategies
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>25 Expert Lessons</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>Risk Management</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>Virtual Portfolio</span>
                </div>
              </div>
              <button
                onClick={() =>
                  isAuthenticated ? navigate("/dashboard") : navigate("/signup")
                }
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
              >
                {isAuthenticated ? "Access Course" : "Start Learning"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-16 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
              Personalized Learning Paths
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Learning Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tailored learning paths based on your experience level and
              investment goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Beginner Path */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8 border border-green-200 dark:border-green-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  BEGINNER
                </span>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">🌱</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Foundation Builder
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Perfect for complete beginners. Start with market basics and
                build a solid foundation.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Market Fundamentals
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Investment Basics
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Risk Management
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Virtual Trading
                  </span>
                </div>
              </div>
            </div>

            {/* Intermediate Path */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  INTERMEDIATE
                </span>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Strategy Developer
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                For those with basic knowledge. Develop advanced analysis skills
                and trading strategies.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Technical Analysis
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Chart Patterns
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Trading Psychology
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Strategy Backtesting
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Path */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-200 dark:border-purple-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                  ADVANCED
                </span>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Wealth Master
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                For experienced investors. Master advanced strategies and
                portfolio management.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Portfolio Optimization
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Options & Derivatives
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Algorithmic Trading
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    1-on-1 Mentoring
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Success Stories */}
          <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-indigo-200 dark:border-indigo-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Success Stories
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real results from our learning community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  ₹2.5L+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average portfolio growth
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  85%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Students see positive returns
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  6 months
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average time to profitability
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Analysis Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium mb-6">
              <BarChart3 className="h-4 w-4 mr-2" />
              Technical Analysis
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nifty 50 Technical Analysis
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Advanced technical indicators and analysis for informed trading
              decisions
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Nifty 50 Analysis
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Live Analysis
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <TechnicalAnalysisWidget />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
