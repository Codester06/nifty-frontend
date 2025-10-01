import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { adminId } = useParams<{ adminId: string }>();
  const { superAdminLogin, userRole } = useAuth();
  const navigate = useNavigate();

  // Secret admin ID that must match
  const SECRET_ADMIN_ID = '56789';

  useEffect(() => {
    // Check if the admin ID matches the secret
    if (adminId !== SECRET_ADMIN_ID) {
      navigate('/404'); // Redirect to 404 if wrong ID
      return;
    }

    // If already logged in as super admin, redirect to dashboard
    if (userRole === 'superadmin') {
      navigate('/admin/dashboard');
    }
  }, [adminId, userRole, navigate]);

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setIsLoading(true);
    
    const success = await superAdminLogin(email, password);
    setIsLoading(false);
    
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid super admin credentials. Please try again.');
    }
  };

  // Don't render if wrong admin ID
  if (adminId !== SECRET_ADMIN_ID) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        {/* Security Warning */}
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200 text-sm font-medium">
              Restricted Access Area
            </span>
          </div>
          <p className="text-red-700 dark:text-red-300 text-xs mt-1">
            Unauthorized access is strictly prohibited and monitored.
          </p>
        </div>

        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Super Admin Access
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Secure administrative portal
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSuperAdminLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Super Admin Email</span>
                </div>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                placeholder="Enter super admin email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Super Admin Password</span>
                </div>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                placeholder="Enter super admin password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Super Admin Panel'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              All access attempts are logged and monitored for security purposes.
              <br />
              This system is for authorized personnel only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-red-200 text-xs">
            NiftyBulk Super Admin Portal • Secure Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
