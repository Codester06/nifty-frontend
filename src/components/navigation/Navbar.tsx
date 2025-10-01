import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Wallet,
  Menu,
  X,
  BarChart3,
  Heart,
  Home,
  Info,
  HelpCircle,
  LogIn,
  UserPlus,
  Search,
  TrendingUp,
  Star,
  Zap,
  ArrowUp,
  ArrowDown,
  Activity,
} from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";
import { WalletModal } from "@/components/forms";
import Logo from "@/assets/images/logo.png";

const Navbar = () => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrendsOpen, setIsTrendsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { symbol: string; name: string; price: number; change: number }[]
  >([]);
  const { user, isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const trendsRef = useRef<HTMLDivElement>(null);

  // Close overlays when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (
        trendsRef.current &&
        !trendsRef.current.contains(event.target as Node)
      ) {
        setIsTrendsOpen(false);
      }
    };

    if (isSearchOpen || isTrendsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, isTrendsOpen]);

  const isActive = (path: string) => location.pathname === path;

  // Mock stock data for search
  const mockStocks = [
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      price: 2456.75,
      change: 2.3,
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      price: 3234.5,
      change: -1.2,
    },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1567.8, change: 0.8 },
    { symbol: "INFY", name: "Infosys Ltd", price: 1456.25, change: 1.5 },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd", price: 987.6, change: -0.5 },
    {
      symbol: "BHARTIARTL",
      name: "Bharti Airtel Ltd",
      price: 876.45,
      change: 2.1,
    },
    { symbol: "ITC", name: "ITC Ltd", price: 345.2, change: 0.3 },
    { symbol: "SBIN", name: "State Bank of India", price: 567.8, change: 1.8 },
  ];

  // Mock market trends data
  const marketTrends = {
    indices: [
      { name: "NIFTY 50", value: 19674.25, change: 1.2, volume: "₹45,234 Cr" },
      { name: "SENSEX", value: 65953.48, change: 0.8, volume: "₹38,567 Cr" },
      {
        name: "NIFTY BANK",
        value: 44521.3,
        change: -0.5,
        volume: "₹12,890 Cr",
      },
      { name: "NIFTY IT", value: 29876.15, change: 2.1, volume: "₹8,456 Cr" },
    ],
    topGainers: [
      { symbol: "BHARTIARTL", change: 4.2, price: 876.45 },
      { symbol: "RELIANCE", change: 3.8, price: 2456.75 },
      { symbol: "SBIN", change: 2.9, price: 567.8 },
      { symbol: "ITC", change: 2.1, price: 345.2 },
    ],
    topLosers: [
      { symbol: "TCS", change: -2.8, price: 3234.5 },
      { symbol: "ICICIBANK", change: -1.9, price: 987.6 },
      { symbol: "HDFCBANK", change: -1.2, price: 1567.8 },
      { symbol: "INFY", change: -0.8, price: 1456.25 },
    ],
    sectors: [
      { name: "Banking", change: 1.5, trend: "up" },
      { name: "IT", change: 2.3, trend: "up" },
      { name: "Pharma", change: -0.8, trend: "down" },
      { name: "Auto", change: 0.9, trend: "up" },
      { name: "FMCG", change: -0.3, trend: "down" },
    ],
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = mockStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5)); // Show top 5 results
    } else {
      setSearchResults([]);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (symbol: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    // Navigate to stock detail page (you can implement this)
    console.log(`Navigate to stock: ${symbol}`);
  };

  // Handle trends click
  const handleTrendsClick = () => {
    setIsTrendsOpen(!isTrendsOpen);
  };

  const authenticatedNavItems = [
    {
      name: "Dashboard",
      path:
        userRole === "admin" || userRole === "superadmin"
          ? "/admin/dashboard"
          : "/user/dashboard",
      icon: BarChart3,
    },
    { name: "Stocks", path: "/", icon: Home },
    { name: "Wishlist", path: "/user/wishlist", icon: Heart },
  ];

  const unauthenticatedNavItems = [
    { name: "Stocks", path: "/", icon: Home },
    { name: "About", path: "/about", icon: Info },
    { name: "Support", path: "/support", icon: HelpCircle },
  ];

  // Sidebar nav for super admin
  const superAdminNavItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: BarChart3 },
    { name: "User Management", path: "/admin/users", icon: UserPlus },
    { name: "Trading Management", path: "/admin/trading", icon: BarChart3 },
    { name: "Margin Settings", path: "/admin/margin-settings", icon: Wallet },
    { name: "Security Logs", path: "/admin/security-logs", icon: BarChart3 },
  ];

  const navItems = isAuthenticated
    ? userRole === "superadmin" || userRole === "admin"
      ? superAdminNavItems
      : authenticatedNavItems
    : unauthenticatedNavItems;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-white/95 via-white/98 to-white/95 dark:from-gray-900/95 dark:via-gray-900/98 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={Logo}
                    alt="NiftyBulk"
                    className="relative w-[180px] h-[60px] object-contain transition-all duration-300 dark:brightness-0 dark:invert group-hover:scale-105"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isActive(item.path)
                        ? "scale-110"
                        : "group-hover:scale-110"
                    }`}
                  />
                  <span className="relative">
                    {item.name}
                    {isActive(item.path) && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    )}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden lg:flex items-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50 rounded-xl hover:shadow-lg transition-all duration-300 group"
              >
                <Search className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Search
                </span>
              </button>

              {/* Market Trends for authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={handleTrendsClick}
                  className="hidden xl:flex items-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-700/50 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group"
                >
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Trends
                  </span>
                </button>
              )}

              {/* Wallet for authenticated users */}
              {isAuthenticated && userRole !== "superadmin" && (
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group"
                >
                  <Wallet className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-mono font-semibold text-green-700 dark:text-green-300">
                    ₹{(user?.walletBalance ?? 0).toLocaleString()}
                  </span>
                </button>
              )}

              {/* Profile Dropdown for authenticated users */}
              {isAuthenticated && <ProfileDropdown />}

              {/* Auth Buttons for Unauthenticated Users - Desktop */}
              {!isAuthenticated && (
                <div className="hidden md:flex items-center space-x-3">
                  {/* Features highlight for unauthenticated users */}
                  <div className="hidden lg:flex items-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-700/50 rounded-xl">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      Free Trading
                    </span>
                  </div>

                  <Link
                    to="/signup"
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md"
                  >
                    Sign Up
                  </Link>

                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                  >
                    Login
                  </Link>
                </div>
              )}

              {/* Theme Toggle - Always visible */}
              <ThemeToggle />

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50 rounded-xl hover:shadow-lg transition-all duration-300 group"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div
            ref={searchRef}
            className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search stocks, companies, or symbols..."
                  className="w-full pl-10 pr-10 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-h-64 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSearchResultClick(stock.symbol)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ₹{stock.price.toFixed(2)}
                          </div>
                          <div
                            className={`text-sm ${
                              stock.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change}%
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular searches */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Popular:
                </span>
                {["RELIANCE", "TCS", "HDFCBANK", "INFY"].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1 text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:shadow-md transition-all duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Market Trends Dropdown */}
        {isTrendsOpen && (
          <div className="absolute top-full right-4 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] overflow-hidden">
            <div ref={trendsRef} className="overflow-y-auto max-h-[70vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-amber-500">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                  <h3 className="text-sm font-semibold text-white">
                    Market Trends
                  </h3>
                </div>
                <button
                  onClick={() => setIsTrendsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Market Indices */}
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Market Indices
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {marketTrends.indices.map((index) => (
                      <div
                        key={index.name}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {index.name}
                          </span>
                          <div
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                              index.change >= 0
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {index.change >= 0 ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            <span>
                              {index.change >= 0 ? "+" : ""}
                              {index.change}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {index.value.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Vol: {index.volume}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Gainers */}
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <ArrowUp className="h-4 w-4 text-green-600 mr-2" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Top Gainers
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {marketTrends.topGainers.slice(0, 3).map((stock, index) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{stock.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +{stock.change}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Losers */}
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <ArrowDown className="h-4 w-4 text-red-600 mr-2" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Top Losers
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {marketTrends.topLosers.slice(0, 3).map((stock, index) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{stock.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                            {stock.change}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sector Performance */}
                <div>
                  <div className="flex items-center mb-3">
                    <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Sector Performance
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {marketTrends.sectors.map((sector) => (
                      <div
                        key={sector.name}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          sector.trend === "up"
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-red-50 dark:bg-red-900/20"
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {sector.name}
                        </span>
                        <div
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            sector.trend === "up"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {sector.trend === "up" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          <span>
                            {sector.change >= 0 ? "+" : ""}
                            {sector.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl">
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20 border border-blue-200/50 dark:border-blue-700/50"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 hover:shadow-md"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/25"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Mobile Quick Actions for authenticated users */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
                  {/* Mobile Search */}
                  <button
                    onClick={() => {
                      setIsSearchOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 w-full"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search Stocks</span>
                  </button>

                  {/* Mobile Market Trends */}
                  <button
                    onClick={() => {
                      handleTrendsClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-700 dark:text-orange-300 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 w-full border border-orange-200/50 dark:border-orange-700/50"
                  >
                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span>Market Trends</span>
                  </button>
                </div>
              )}

              {/* Mobile Wallet for authenticated users */}
              {isAuthenticated && userRole !== "superadmin" && (
                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <button
                    onClick={() => {
                      setIsWalletOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 w-full border border-green-200/50 dark:border-green-700/50"
                  >
                    <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span>
                      Wallet: ₹{(user?.walletBalance ?? 0).toLocaleString()}
                    </span>
                  </button>
                </div>
              )}

              {/* Mobile Quick Features for unauthenticated users */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
                  <button
                    onClick={() => {
                      setIsSearchOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 w-full"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search Stocks</span>
                  </button>

                  <div className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span>Free Trading • Zero Fees</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />
    </>
  );
};

export default Navbar;
