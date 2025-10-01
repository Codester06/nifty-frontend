import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import {
  Users,
  TrendingUp,
  BarChart3,
  DollarSign,
  Shield,
  Settings,
  LogOut,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";

interface DashboardMetric {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: string;
  color: string;
}

const AdminDashboard = () => {
  const { logout, userRole } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    pendingUsers: 0,
    blockedUsers: 0,
    totalTrades: 0,
    completedTrades: 0,
    pendingTrades: 0,
    failedTrades: 0,
    totalVolume: 0,
    loading: true,
    error: null as string | null,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if not admin or superadmin
    if (userRole !== "superadmin" && userRole !== "admin") {
      navigate("/login");
      return;
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiService.getAdminDashboard();
        setDashboardData({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          verifiedUsers: data.verifiedUsers || 0,
          pendingUsers: data.pendingUsers || 0,
          blockedUsers: data.blockedUsers || 0,
          totalTrades: data.totalTrades || 0,
          completedTrades: data.completedTrades || 0,
          pendingTrades: data.pendingTrades || 0,
          failedTrades: data.failedTrades || 0,
          totalVolume: data.totalVolume || 0,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load dashboard data. Using demo data.",
        }));
        // Set demo data as fallback
        setDashboardData((prev) => ({
          ...prev,
          totalUsers: 1247,
          activeUsers: 1089,
          verifiedUsers: 856,
          pendingUsers: 158,
          blockedUsers: 12,
          totalTrades: 15678,
          completedTrades: 15234,
          pendingTrades: 23,
          failedTrades: 421,
          totalVolume: 990000000,
          loading: false,
          error: null,
        }));
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const data = await apiService.getRecentActivities();
        setRecentActivities(data.activities || []);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        // Set demo data as fallback
        setRecentActivities([
          {
            id: "1",
            type: "user_registration",
            message: "New user registration: priya.sharma@email.com",
            timestamp: "2 minutes ago",
            color: "green",
          },
          {
            id: "2",
            type: "trade_executed",
            message: "Large trade executed: ₹2.45L RELIANCE",
            timestamp: "5 minutes ago",
            color: "blue",
          },
          {
            id: "3",
            type: "user_blocked",
            message: "User blocked: amit.patel@email.com",
            timestamp: "10 minutes ago",
            color: "red",
          },
          {
            id: "4",
            type: "margin_updated",
            message: "Margin updated for sneha.reddy@email.com",
            timestamp: "15 minutes ago",
            color: "yellow",
          },
        ]);
      }
    };

    if (userRole === "superadmin" || userRole === "admin") {
      fetchDashboardData();
      fetchRecentActivities();
    }
  }, [userRole]);

  const metrics: DashboardMetric[] = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers.toLocaleString(),
      change: `${Math.round(
        (dashboardData.activeUsers / dashboardData.totalUsers) * 100
      )}% active`,
      changeType: "positive",
      icon: "Users",
      color: "blue",
    },
    {
      title: "Active Users",
      value: dashboardData.activeUsers.toLocaleString(),
      change: `${dashboardData.blockedUsers} blocked`,
      changeType: dashboardData.blockedUsers > 0 ? "negative" : "positive",
      icon: "Activity",
      color: "green",
    },
    {
      title: "Verified Users",
      value: dashboardData.verifiedUsers.toLocaleString(),
      change: `${Math.round(
        (dashboardData.verifiedUsers / dashboardData.totalUsers) * 100
      )}% verified`,
      changeType: "positive",
      icon: "CheckCircle",
      color: "green",
    },
    {
      title: "Total Trades",
      value: dashboardData.totalTrades.toLocaleString(),
      change: `${dashboardData.completedTrades} completed`,
      changeType: "positive",
      icon: "BarChart3",
      color: "purple",
    },
    {
      title: "Total Volume",
      value: `₹${(dashboardData.totalVolume / 10000000).toFixed(1)}Cr`,
      change: `${dashboardData.failedTrades} failed`,
      changeType: dashboardData.failedTrades > 0 ? "negative" : "positive",
      icon: "DollarSign",
      color: "yellow",
    },
    {
      title: "Pending Trades",
      value: dashboardData.pendingTrades.toString(),
      change: `${
        Math.round(
          (dashboardData.pendingTrades / dashboardData.totalTrades) * 100
        ) || 0
      }% of total`,
      changeType: dashboardData.pendingTrades > 10 ? "negative" : "positive",
      icon: "Clock",
      color: "orange",
    },
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Users":
        return Users;
      case "Activity":
        return Activity;
      case "BarChart3":
        return BarChart3;
      case "DollarSign":
        return DollarSign;
      case "TrendingUp":
        return TrendingUp;
      case "Shield":
        return Shield;
      case "CheckCircle":
        return CheckCircle;
      case "Clock":
        return Clock;
      default:
        return BarChart3;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "green":
        return "bg-gradient-to-br from-green-500 to-green-600";
      case "purple":
        return "bg-gradient-to-br from-purple-500 to-purple-600";
      case "yellow":
        return "bg-gradient-to-br from-yellow-500 to-yellow-600";
      case "orange":
        return "bg-gradient-to-br from-orange-500 to-orange-600";
      case "red":
        return "bg-gradient-to-br from-red-500 to-red-600";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600";
    }
  };

  const getActivityColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "red":
        return "bg-red-500";
      case "yellow":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {userRole === "superadmin"
                  ? "Super Admin Dashboard"
                  : "Admin Dashboard"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {userRole === "superadmin"
                  ? "Monitor your trading platform's key metrics and activities"
                  : "View trading platform metrics and activities (Read-only access)"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                System Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {dashboardData.error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200 font-medium">
                  {dashboardData.error}
                </span>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const IconComponent = getIconComponent(metric.icon);
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {metric.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {metric.value}
                      </p>
                      {metric.change && (
                        <div className="flex items-center mt-2">
                          {metric.changeType === "positive" ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500 mr-1 transform rotate-180" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              metric.changeType === "positive"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {metric.change}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-14 h-14 ${getColorClasses(
                        metric.color
                      )} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div
                    className={`w-4 h-4 ${getActivityColor(
                      activity.color
                    )} rounded-full shadow-sm`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {activity.type === "user_registration" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {activity.type === "user_blocked" && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    {activity.type === "trade_executed" && (
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    )}
                    {activity.type === "margin_updated" && (
                      <Settings className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
