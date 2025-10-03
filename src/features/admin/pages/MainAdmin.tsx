import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { adminService } from "../services/adminService";

interface UserData {
  _id: string;
  mobile: string;
  email: string;
  password: string;
  pan: string;
  username: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isPanVerified: boolean;
  role: string;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  otp?: string;
  otpExpires?: string;
}

// Memoized Stats Cards Component
const StatsCards: React.FC<{ users: UserData[] }> = React.memo(({ users }) => {
  const stats = React.useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      totalWalletBalance: users.reduce((sum, u) => sum + u.walletBalance, 0),
    }),
    [users]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <User className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-xl lg:text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">Inactive Users</p>
            <p className="text-xl lg:text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <XCircle className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-600">
              Total Wallet Balance
            </p>
            <p className="text-xl lg:text-2xl font-bold text-purple-600">
              ₹{stats.totalWalletBalance || 0}
            </p>
          </div>
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-sm lg:text-base">₹</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const NiftyBulkAdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "failed"
  >("checking");
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  // Admin credentials
  const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123",
  };

  // Add debug logging
  const logDebug = (message: string) => {
    console.log(`🔍 DEBUG: ${message}`);
  };

  // Check backend connection with detailed logging
  const checkBackendConnection =
    React.useCallback(async (): Promise<boolean> => {
      try {
        logDebug("Checking backend connection...");
        setConnectionStatus("checking");

        const isConnected = await adminService.checkBackendConnection();

        if (isConnected) {
          setConnectionStatus("connected");
          return true;
        } else {
          setConnectionStatus("failed");
          return false;
        }
      } catch (error) {
        const err = error as Error;
        logDebug(`Connection failed: ${err.message}`);
        setConnectionStatus("failed");
        setError(
          `Cannot connect to backend: ${err.message}\n\nMake sure:\n1. Backend is running\n2. No firewall blocking the connection\n3. Check browser console for errors`
        );
        return false;
      }
    }, []);

  // Fetch users with detailed logging
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError("");
    logDebug("Starting to fetch users...");

    try {
      // First check backend connection
      const backendAvailable = await checkBackendConnection();
      if (!backendAvailable) {
        throw new Error("Backend server is not available");
      }

      const data = await adminService.getUsers();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      // Filter out invalid users (those without _id or other required fields)
      const validUsers = data.filter(user => user && user._id && user.username);

      setUsers(validUsers);
      setFilteredUsers(validUsers);
      setSuccessMessage(`Successfully loaded ${data.length} users`);
      setTimeout(() => setSuccessMessage(""), 3000);
      logDebug(`Success: ${data.length} users loaded`);
    } catch (error) {
      const err = error as Error;
      logDebug(`Error fetching users: ${err.message}`);
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [checkBackendConnection]);

  // Toggle user status with logging
  const toggleUserStatus = React.useCallback(
    async (userId: string) => {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      logDebug(`Toggling status for user ID: ${userId}`);

      try {
        const response = await adminService.toggleUserStatus(userId);
        if (response.success) {
          const updatedUser = response.data;
          logDebug(
            `User updated: ${updatedUser.username} -> ${updatedUser.isActive}`
          );

          // Update both users and filteredUsers states
          const updatedUsers = users.map((user) =>
            user._id === userId ? updatedUser : user
          );
          setUsers(updatedUsers);

          // Apply current filters to get the new filtered list
          const filtered = updatedUsers.filter((user) => {
            const matchesSearch =
              debouncedSearchTerm === "" ||
              user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              user.mobile.includes(debouncedSearchTerm) ||
              user.pan.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            const matchesStatus =
              filterStatus === "all" ||
              (filterStatus === "active" && user.isActive) ||
              (filterStatus === "inactive" && !user.isActive);

            return matchesSearch && matchesStatus;
          });

          setFilteredUsers(filtered);
          setSuccessMessage(
            `User "${updatedUser.username}" ${updatedUser.isActive ? "activated" : "deactivated"} successfully`
          );
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setError(response.error?.message || 'Failed to toggle user status');
        }
      } catch (error) {
        const err = error as Error;
        logDebug(`Error toggling user: ${err.message}`);
        setError(`Failed to update user status: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [users, debouncedSearchTerm, filterStatus]
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter users based on search term and status
  const filterUsers = React.useCallback(
    (user: UserData): boolean => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        user.username
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.mobile.includes(debouncedSearchTerm) ||
        user.pan.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    },
    [debouncedSearchTerm, filterStatus]
  );

  // Update wallet balance
  const updateWalletBalance = React.useCallback(
    async (userId: string, newBalance: number) => {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      logDebug(`Updating wallet balance for user ID: ${userId} to ₹${newBalance}`);

      try {
        const response = await adminService.updateWalletBalance(userId, newBalance);
        if (response.success) {
          const updatedUser = response.data;
          logDebug(
            `Wallet updated: ${updatedUser.username} -> ₹${updatedUser.walletBalance}`
          );

          // Update both users and filteredUsers states
          const updatedUsers = users.map((user) =>
            user._id === userId ? updatedUser : user
          );
          setUsers(updatedUsers);

          // Also update filteredUsers immediately
          const updatedFilteredUsers = filteredUsers.map((user) =>
            user._id === userId ? updatedUser : user
          );
          setFilteredUsers(updatedFilteredUsers);

          setSuccessMessage(
            `Wallet balance for "${updatedUser.username}" updated to ₹${updatedUser.walletBalance} successfully`
          );
          setTimeout(() => setSuccessMessage(""), 3000);

          // Reset editing state
          setEditingWallet(null);
          setWalletAmount("");
        } else {
          setError(response.error?.message || 'Failed to update wallet balance');
        }

      } catch (error) {
        const err = error as Error;
        logDebug(`Error updating wallet: ${err.message}`);
        setError(`Failed to update wallet balance: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [users, filteredUsers]
  );

  // Start editing wallet
  const startEditingWallet = (userId: string, currentBalance: number) => {
    setEditingWallet(userId);
    setWalletAmount(currentBalance.toString());
  };

  // Cancel editing wallet
  const cancelEditingWallet = () => {
    setEditingWallet(null);
    setWalletAmount("");
  };

  // Save wallet changes
  const saveWalletChanges = async (userId: string) => {
    const newBalance = parseFloat(walletAmount);
    if (isNaN(newBalance) || newBalance < 0) {
      setError("Please enter a valid positive number for wallet balance");
      return;
    }
    await updateWalletBalance(userId, newBalance);
  };

  // Bulk operations
  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user._id)));
    }
  };

  const bulkActivateUsers = async () => {
    if (selectedUsers.size === 0) return;
    
    setLoading(true);
    const { successCount, errorCount } = await adminService.bulkActivateUsers(Array.from(selectedUsers));
    
    const updatedUsers = users.map(u => selectedUsers.has(u._id) ? {...u, isActive: true} : u);
    setUsers(updatedUsers);

    // Apply filters to updated users
    const filtered = updatedUsers.filter((user) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.mobile.includes(debouncedSearchTerm) ||
        user.pan.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
    setFilteredUsers(filtered);

    setSelectedUsers(new Set());
    setSuccessMessage(`Bulk operation completed: ${successCount} users activated${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
    setTimeout(() => setSuccessMessage(""), 3000);
    setLoading(false);
  };

  const bulkDeactivateUsers = async () => {
    if (selectedUsers.size === 0) return;
    
    setLoading(true);
    const { successCount, errorCount } = await adminService.bulkDeactivateUsers(Array.from(selectedUsers));
    
    const updatedUsers = users.map(u => selectedUsers.has(u._id) ? {...u, isActive: false} : u);
    setUsers(updatedUsers);

    // Apply filters to updated users
    const filtered = updatedUsers.filter((user) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.mobile.includes(debouncedSearchTerm) ||
        user.pan.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
    setFilteredUsers(filtered);

    setSelectedUsers(new Set());
    setSuccessMessage(`Bulk operation completed: ${successCount} users deactivated${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
    setTimeout(() => setSuccessMessage(""), 3000);
    setLoading(false);
  };

  // Apply filters
  useEffect(() => {
    const filtered = users.filter(filterUsers);
    setFilteredUsers(filtered);
  }, [debouncedSearchTerm, filterStatus, users, filterUsers]);

  // Check connection on mount
  useEffect(() => {
    logDebug("Component mounted, checking backend connection...");
    checkBackendConnection();
  }, [checkBackendConnection]);

  // Handle login
  const handleLogin = React.useCallback(async () => {
    if (
      loginForm.username === ADMIN_CREDENTIALS.username &&
      loginForm.password === ADMIN_CREDENTIALS.password
    ) {
      setIsLoggedIn(true);
      setError("");
      logDebug("Admin login successful");
      await fetchUsers();
    } else {
      setError("Invalid admin credentials");
      logDebug("Login failed: Invalid credentials");
    }
  }, [loginForm.username, loginForm.password, fetchUsers]);

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ username: "", password: "" });
    setUsers([]);
    setFilteredUsers([]);
    setError("");
    setSuccessMessage("");
    logDebug("Admin logged out");
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Login Form Component
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              NiftyBulk Admin
            </h1>
            <p className="text-gray-600">User Management Dashboard</p>

            {/* Connection Status Indicator */}
            <div className="mt-4">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ 
                  connectionStatus === "connected"
                    ? "bg-green-100 text-green-800"
                    : connectionStatus === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {connectionStatus === "connected" && (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {connectionStatus === "failed" && (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {connectionStatus === "checking" && (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                )}

                {connectionStatus === "connected"
                  ? "Backend Connected"
                  : connectionStatus === "failed"
                  ? "Backend Disconnected"
                  : "Checking Connection..."}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="whitespace-pre-line text-sm">{error}</div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={connectionStatus === "failed"}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connectionStatus === "checking"
                ? "Checking Connection..."
                : "Login to Admin Panel"}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo Credentials:</p>
            <p>Username: admin | Password: admin123</p>
            {connectionStatus === "failed" && (
              <div className="mt-2 text-xs text-red-600">
                <p>⚠️ Please start the backend server:</p>
                <p className="font-mono">npm run start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Component
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 lg:py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mr-2 lg:mr-3">
                <Shield className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                  NiftyBulk Admin
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                  User Management Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ 
                  connectionStatus === "connected"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {connectionStatus === "connected" ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Disconnected</span>
                  </>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-2 lg:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-8">
        {/* Stats Cards */}
        <StatsCards users={users} />

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="flex-1 sm:flex-none px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <button
                onClick={fetchUsers}
                disabled={loading || connectionStatus !== "connected"}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm lg:text-base rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="whitespace-pre-line text-sm">{error}</div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mr-2" />
                <span className="text-xs lg:text-sm font-medium text-blue-900">
                  {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={bulkActivateUsers}
                  disabled={loading}
                  className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white text-xs lg:text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                  Activate Selected
                </button>
                <button
                  onClick={bulkDeactivateUsers}
                  disabled={loading}
                  className="flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-xs lg:text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                  Deactivate Selected
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="flex items-center justify-center px-3 py-1.5 bg-gray-600 text-white text-xs lg:text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table/Cards */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">
                User Management ({filteredUsers.length} users)
              </h2>
              {filteredUsers.length > 0 && (
                <button
                  onClick={selectAllUsers}
                  className="text-xs lg:text-sm text-blue-600 hover:text-blue-800 font-medium self-start sm:self-auto"
                >
                  {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : connectionStatus !== "connected" ? (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Backend server is not connected
              </p>
              <p className="text-sm text-gray-400">
                Please ensure the server is running
              </p>
              <button
                onClick={checkBackendConnection}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No users found matching your criteria
              </p>
              {users.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Try refreshing to load users from the database
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user._id)}
                            onChange={() => toggleSelectUser(user._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-500">ID: {user._id.slice(-8)}</p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ 
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm text-gray-900 truncate">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Mobile</p>
                          <p className="text-sm text-gray-900">{user.mobile}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">PAN</p>
                          <p className="text-sm text-gray-900">{user.pan}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Role</p>
                          <p className="text-sm text-gray-900">{user.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Wallet:</span>
                          {editingWallet === user._id ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-500">₹</span>
                              <input
                                type="number"
                                value={walletAmount}
                                onChange={(e) => setWalletAmount(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveWalletChanges(user._id);
                                  } else if (e.key === 'Escape') {
                                    cancelEditingWallet();
                                  }
                                }}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                min="0"
                                step="0.01"
                                autoFocus
                              />
                              <button
                                onClick={() => saveWalletChanges(user._id)}
                                disabled={loading}
                                className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={cancelEditingWallet}
                                disabled={loading}
                                className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-gray-900">₹{user.walletBalance}</span>
                              <button
                                onClick={() => startEditingWallet(user._id, user.walletBalance)}
                                disabled={loading || editingWallet !== null}
                                className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ 
                            user.isEmailVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Email {user.isEmailVerified ? "✓" : "✗"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ 
                            user.isMobileVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Mobile {user.isMobileVerified ? "✓" : "✗"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ 
                            user.isPanVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          PAN {user.isPanVerified ? "✓" : "✗"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Updated: {formatDate(user.updatedAt)}</p>
                        </div>
                        <button
                          onClick={() => toggleUserStatus(user._id)}
                          disabled={loading}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ 
                            user.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                          onChange={selectAllUsers}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wallet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user._id)}
                            onChange={() => toggleSelectUser(user._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.username}</p>
                            <p className="text-sm text-gray-500">PAN: {user.pan}</p>
                            <p className="text-xs text-gray-400">ID: {user._id?.slice(-8) || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.mobile}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ 
                                user.isEmailVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              Email {user.isEmailVerified ? "✓" : "✗"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ 
                                user.isMobileVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              Mobile {user.isMobileVerified ? "✓" : "✗"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ 
                                user.isPanVerified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              PAN {user.isPanVerified ? "✓" : "✗"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {editingWallet === user._id ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-1">₹</span>
                                  <input
                                    type="number"
                                    value={walletAmount}
                                    onChange={(e) => setWalletAmount(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveWalletChanges(user._id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingWallet();
                                      }
                                    }}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    min="0"
                                    step="0.01"
                                    autoFocus
                                  />
                                </div>
                                <button
                                  onClick={() => saveWalletChanges(user._id)}
                                  disabled={loading}
                                  className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                                  title="Save changes"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditingWallet}
                                  disabled={loading}
                                  className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                  title="Cancel editing"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">₹{user.walletBalance}</p>
                                  <p className="text-xs text-gray-500">{user.role}</p>
                                </div>
                                <button
                                  onClick={() => startEditingWallet(user._id, user.walletBalance)}
                                  disabled={loading || editingWallet !== null}
                                  className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                  title="Edit wallet balance"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ 
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => toggleUserStatus(user._id)}
                            disabled={loading}
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ 
                              user.isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  );
};

export default NiftyBulkAdminDashboard;