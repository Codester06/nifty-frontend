import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { tokenUtils } from '@/shared/utils/tokenUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'superadmin';
  requireAuth?: boolean;
}

/**
 * Simple route protection component for demo platform
 * Provides basic role-based access control
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true
}) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  // Clear expired tokens
  React.useEffect(() => {
    tokenUtils.clearExpiredToken();
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if authentication required but not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    // Super admin can access everything
    if (userRole === 'superadmin') {
      return <>{children}</>;
    }
    
    // Admin can access admin routes but not superadmin routes
    if (userRole === 'admin' && requiredRole === 'admin') {
      return <>{children}</>;
    }
    
    // Regular users can only access user routes
    if (userRole === 'user' && requiredRole === 'user') {
      return <>{children}</>;
    }
    
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === 'admin' || userRole === 'superadmin' 
      ? '/admin/dashboard' 
      : '/user/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;