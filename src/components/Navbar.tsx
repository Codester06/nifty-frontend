import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wallet, Bell, Menu, X, BarChart3, Heart, Home, Info, HelpCircle, LogIn, UserPlus, ScrollText, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import WalletModal from './WalletModal';
import Logo from '../assets/logo.png';

const Navbar = () => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  

  const authenticatedNavItems = [
    { name: 'Dashboard', path: userRole === 'admin' || userRole === 'superadmin' ? '/admin/dashboard' : '/user/dashboard', icon: BarChart3 },
    { name: 'Stocks', path: '/', icon: Home },
    { name: 'Wishlist', path: '/user/wishlist', icon: Heart },
  ];

  const unauthenticatedNavItems = [
    { name: 'Stocks', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Support', path: '/support', icon: HelpCircle },
  ];

  // Sidebar nav for super admin
  const superAdminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'User Management', path: '/admin/users', icon: UserPlus },
    { name: 'Trading Management', path: '/admin/trading', icon: BarChart3 }, // Placeholder
    { name: 'Margin Settings', path: '/admin/margin-settings', icon: Wallet },
    { name: 'Security Logs', path: '/admin/security-logs', icon: Bell },
  ];

  const navItems = isAuthenticated
    ? (userRole === 'superadmin' || userRole === 'admin' ? superAdminNavItems : authenticatedNavItems)
    : unauthenticatedNavItems;

  return (
    <>
      <nav className="sticky top-0 z-40 navbar-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div>
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src={Logo}
                  alt="NiftyBulk"
                  className="w-24 h-52 object-contain transition-all duration-200 filter dark:invert(1) dark:brightness-150"
                />
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Wallet for authenticated users */}
              {isAuthenticated && userRole !== 'superadmin' && (
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 professional-card rounded-lg hover:shadow-professional-md transition-all duration-200"
                >
                  <Wallet className="h-4 w-4 text-trading-success" />
                  <span className="text-sm font-mono font-semibold text-trading-success">
                    ₹{user?.walletBalance.toLocaleString()}
                  </span>
                </button>
              )}

              {/* Profile Dropdown for authenticated users */}
              {isAuthenticated && <ProfileDropdown />}

              {/* Auth Buttons for Unauthenticated Users - Desktop */}
              {!isAuthenticated && (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:text-white hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
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
                className="md:hidden p-2 professional-button rounded-lg transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Mobile Wallet for authenticated users */}
              {isAuthenticated && userRole !== 'superadmin' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsWalletOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full"
                  >
                    <Wallet className="h-4 w-4 text-trading-success" />
                    <span>Wallet: ₹{user?.walletBalance.toLocaleString()}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </>
  );
};

export default Navbar;