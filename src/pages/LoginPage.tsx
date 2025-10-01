import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { login, loginEmail, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP sent to your mobile number');
        setShowOtp(true);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.log(error)
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setIsLoading(true);
    
    const success = await login(mobile, otp);
    setIsLoading(false);
    
    if (success) {
      if (userRole === 'admin' || userRole === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setIsLoading(true);
    
    const success = await loginEmail(email, password);
    setIsLoading(false);
    
    if (success) {
      if (userRole === 'admin' || userRole === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('User not found or not active');
    }
  };



  const renderLoginForm = () => {
    switch (loginMethod) {
      case 'mobile':
        return !showOtp ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm font-semibold mb-2">{error}</div>
            )}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mobile Number
              </label>
              <div className="mt-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-300 placeholder-gray-500"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || mobile.length !== 10}
                className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold tracking-wide"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMobileLogin} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm font-semibold mb-2">{error}</div>
            )}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter OTP
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-300 placeholder-gray-500"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                OTP sent to {mobile}
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold tracking-wide"
              >
                {isLoading ? 'Verifying...' : 'Login'}
              </button>
            </div>

            <div className="text-center">
              {/* Removed 'Change mobile' button */}
            </div>
          </form>
        );

      case 'email':
        return (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm font-semibold mb-2">{error}</div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-300 placeholder-gray-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 glass-card rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-300 placeholder-gray-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3 bg-blue-500 text-black dark:text-white rounded-2xl hover:shadow-neon-blue/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold tracking-wide"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        );



      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center shadow-neon-blue relative">
            <span className="text-white font-bold text-xl">NB</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl blur-sm opacity-30 animate-pulse"></div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to NiftyBulk
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Choose your login method
          </p>
        </div>

        <div className="glass-card py-8 px-6 rounded-3xl">
          {/* Login Method Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => {
                setLoginMethod('mobile');
                setShowOtp(false);
                // setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                loginMethod === 'mobile'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mobile OTP
            </button>
            <button
              onClick={() => {
                setLoginMethod('email');
                // setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Email/Password
            </button>

          </div>

          {success && (
            <div className="text-green-600 text-sm font-semibold mb-4">{success}</div>
          )}

          {renderLoginForm()}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-white">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-bold hover:text-black dark:hover:text-blue-500 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;