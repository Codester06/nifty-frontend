import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";

// Layout components
import { Navbar, Footer } from "@/components/navigation";

// Public pages
import HomePage from "@/pages/public/HomePage";
import AboutPage from "@/pages/public/AboutPage";
import SupportPage from "@/pages/public/SupportPage";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";

// Dashboard pages
import Dashboard from "@/pages/dashboard/Dashboard";
import WishlistPage from "@/pages/dashboard/WishlistPage";
import TransactionsPage from "@/pages/dashboard/TransactionsPage";
import Profile from "@/pages/dashboard/Profile";

// Admin pages
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import AdminUserManagement from "@/features/admin/pages/AdminUserManagement";
import AdminMarginSettings from "@/features/admin/pages/AdminMarginSettings";
import AdminSecurityLogs from "@/features/admin/pages/AdminSecurityLogs";
import AdminTradingManagement from "@/features/admin/pages/AdminTradingManagement";
import NiftyBulkAdminDashboard from "@/features/admin/pages/MainAdmin";
import SuperAdminLogin from "@/pages/auth/SuperAdminLogin";

// Trading pages
import StockDetail from "@/features/trading/components/StockDetail";
import StockGraphPage from "@/features/trading/pages/StockGraphPage";

// Legal pages
import TermsAndConditions from "@/pages/legal/TermsConditions";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";

// Error pages
import NotFound from "@/pages/NotFound";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (userRole !== "admin" && userRole !== "superadmin") {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  if (userRole === "admin" || userRole === "superadmin") {
    return <Navigate to="/admin/dashboard" />;
  }
  return <Navigate to="/user/dashboard" />;
};

export function AppRoutes() {
  const { loading } = useAuth();
  const location = useLocation();

  // Hide navbar on full-screen chart pages
  const hideNavbar = location.pathname.includes("/chart");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/:adminId" element={<SuperAdminLogin />} />

        {/* Trading routes */}
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/stock/:symbol/chart" element={<StockGraphPage />} />

        {/* Auto-redirect based on role */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        {/* User routes */}
        <Route path="/user/dashboard" element={<Dashboard />} />
        <Route
          path="/user/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/margin-settings"
          element={
            <AdminRoute>
              <AdminMarginSettings />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/security-logs"
          element={
            <AdminRoute>
              <AdminSecurityLogs />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/trading"
          element={
            <AdminRoute>
              <AdminTradingManagement />
            </AdminRoute>
          }
        />
        <Route path="/adminMain" element={<NiftyBulkAdminDashboard />} />

        {/* Legal routes */}
        <Route path="/tnC" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Error routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
      {!hideNavbar && <Footer />}
    </div>
  );
}
