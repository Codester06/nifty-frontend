import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StockDetail from './components/StockDetail';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import TermsAndConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SuperAdminLogin from './pages/SuperAdminLogin';
import NotFound from './pages/NotFound';
import AdminMarginSettings from './pages/AdminMarginSettings';
import AdminSecurityLogs from './pages/AdminSecurityLogs';
import AdminTradingManagement from './pages/AdminTradingManagement';
import NiftyBulkAdminDashboard from './pages/MainAdmin';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  if (userRole === 'admin' || userRole === 'superadmin') {
    return <Navigate to="/admin/dashboard" />;
  }
  return <Navigate to="/user/dashboard" />;
};

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }
  return (
    <div className="min-h-screen transition-colors duration-200">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/tnC" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/admin/:adminId" element={<SuperAdminLogin />} />
        {/* Auto-redirect based on role */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        {/* User routes */}
        <Route path="/user/dashboard" element={
          // <ProtectedRoute>
            <Dashboard />
          // {/* </ProtectedRoute> */}
        } />
        <Route path="/user/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUserManagement />
          </AdminRoute>
        } />
        <Route path="/admin/margin-settings" element={
          <AdminRoute>
            <AdminMarginSettings />
          </AdminRoute>
        } />
        <Route path="/admin/security-logs" element={
          <AdminRoute>
            <AdminSecurityLogs />
          </AdminRoute>
        } />
        <Route path="/admin/trading" element={
          <AdminRoute>
            <AdminTradingManagement />
          </AdminRoute>
        } />
        {/* 404 route */}
        <Route path="/404" element={<NotFound />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/404" />} />

        <Route path="/adminMain" element={<NiftyBulkAdminDashboard />} />







      </Routes>





      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;