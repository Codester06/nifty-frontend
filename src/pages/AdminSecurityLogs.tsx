import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Search, Download, Filter, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface SecurityLog {
  _id: string;
  timestamp: string;
  adminId: string;
  action: string;
  target?: string;
  details?: string;
  type?: string;
}

const AdminSecurityLogs: React.FC = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Redirect if not admin or superadmin
  useEffect(() => {
    if (userRole !== 'superadmin' && userRole !== 'admin') {
      navigate('/login');
    }
  }, [userRole, navigate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (actionFilter) params.action = actionFilter;
      if (search) params.search = search;
      const logs = await api.getSecurityLogs(params);
      setLogs(logs);
    } catch (err: unknown) {
      console.error('Error fetching security logs:', err);
      setError('Failed to fetch logs. Using demo data.');
      // Set demo data as fallback
      const demoLogs = [
        {
          _id: '1',
          timestamp: new Date().toISOString(),
          adminId: 'admin_001',
          action: 'User Blocked',
          target: 'user_123',
          details: 'User blocked for suspicious activity'
        },
        {
          _id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          adminId: 'admin_001',
          action: 'Margin Updated',
          target: 'RELIANCE',
          details: 'Margin percentage changed from 15% to 20%'
        },
        {
          _id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          adminId: 'admin_002',
          action: 'User Profile Edited',
          target: 'user_456',
          details: 'Email address updated'
        },
        {
          _id: '4',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          adminId: 'admin_001',
          action: 'Global Margin Created',
          target: 'INFY',
          details: 'New global margin rule created with 18% margin'
        }
      ];
      setLogs(demoLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [actionFilter, search]);

  // Stats
  const totalActions = logs.length;
  const securityEvents = logs.filter(l => l.action.toLowerCase().includes('block')).length;
  const userChanges = logs.filter(l => l.action.toLowerCase().includes('user')).length;
  const configChanges = logs.filter(l => l.action.toLowerCase().includes('margin') || l.action.toLowerCase().includes('config')).length;

  // Export logs as CSV
  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Admin ID', 'Action', 'Target', 'Details'].join(','),
      ...logs.map(l => [
        new Date(l.timestamp).toLocaleString(),
        l.adminId,
        l.action,
        l.target || '',
        l.details ? '"' + l.details.replace(/"/g, '""') + '"' : ''
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security & Audit Logs</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {userRole === 'superadmin'
                  ? 'Monitor all administrative actions and security events'
                  : 'View administrative actions and security events (Read-only access)'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm font-medium">Security Monitor</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by action, target, or details..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="User Blocked">User Blocked</option>
                  <option value="Margin Updated">Margin Updated</option>
                  <option value="User Margin Updated">User Margin Updated</option>
                  <option value="User Margin Created">User Margin Created</option>
                  <option value="User Margin Deleted">User Margin Deleted</option>
                  <option value="Global Margin Created">Global Margin Created</option>
                  <option value="Global Margin Updated">Global Margin Updated</option>
                  <option value="Global Margin Deleted">Global Margin Deleted</option>
                  <option value="User Profile Edited">User Profile Edited</option>
                </select>
              </div>
              {userRole === 'superadmin' && (
                <button
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-medium shadow-lg"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl dark:text-white font-bold">{totalActions}</div>
            <div className="text-xs dark:text-gray-500 text-gray-500">Total Actions</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-500">{securityEvents}</div>
            <div className="text-xs text-gray-500">Security Events</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600">{userChanges}</div>
            <div className="text-xs text-gray-500">User Changes</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-600">{configChanges}</div>
            <div className="text-xs text-gray-500">Config Changes</div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 dark:text-white py-2 text-left">Timestamp</th>
                <th className="px-4 dark:text-white py-2 text-left">Admin ID</th>
                <th className="px-4 dark:text-white py-2 text-left">Action</th>
                <th className="px-4 dark:text-white py-2 text-left">Target</th>
                <th className="px-4 dark:text-white py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center dark:text-white py-8">No logs found.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="border-b">
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{log.adminId}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {log.action === 'User Blocked' ? (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">{log.action}</span>
                      ) : log.action.toLowerCase().includes('margin') ? (
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">{log.action}</span>
                      ) : log.action === 'User Profile Edited' ? (
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">{log.action}</span>
                      ) : (
                        log.action
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{log.target}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityLogs;