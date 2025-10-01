import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Globe, Edit, Save, X, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface UserRule {
  _id: string;
  user: { _id: string; email: string; username?: string };
  marginPercentage: number;
}
interface GlobalRule {
  _id: string;
  asset: string;
  marginPercentage: number;
}

const AdminMarginSettings: React.FC = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [userRules, setUserRules] = useState<UserRule[]>([]);
  const [globalRules, setGlobalRules] = useState<GlobalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGlobalAsset, setNewGlobalAsset] = useState('');
  const [newGlobalMargin, setNewGlobalMargin] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserMargin, setEditingUserMargin] = useState('');
  const [editingGlobalId, setEditingGlobalId] = useState<string | null>(null);
  const [editingGlobalMargin, setEditingGlobalMargin] = useState('');

  // Redirect if not admin or superadmin
  useEffect(() => {
    if (userRole !== 'superadmin' && userRole !== 'admin') {
      navigate('/login');
    }
  }, [userRole, navigate]);

  const fetchMargins = async () => {
    setLoading(true);
    try {
      const { userRules, globalRules } = await api.getAllMargins();
      setUserRules(userRules);
      setGlobalRules(globalRules);
    } catch (err: unknown) {
      console.error('Error fetching margin settings:', err);
      setError('Failed to fetch margin settings. Using demo data.');
      // Set demo data as fallback
      setUserRules([
        {
          _id: '1',
          user: { _id: '1', username: 'john_doe', email: 'john@example.com' },
          marginPercentage: 25
        },
        {
          _id: '2',
          user: { _id: '2', username: 'jane_smith', email: 'jane@example.com' },
          marginPercentage: 30
        }
      ]);
      setGlobalRules([
        {
          _id: '1',
          asset: 'RELIANCE',
          marginPercentage: 20
        },
        {
          _id: '2',
          asset: 'TCS',
          marginPercentage: 15
        },
        {
          _id: '3',
          asset: 'INFY',
          marginPercentage: 18
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMargins();
  }, []);

  // User-specific margin handlers
  const handleEditUserMargin = (rule: UserRule) => {
    setEditingUserId(rule._id);
    setEditingUserMargin(rule.marginPercentage.toString());
  };
  const handleSaveUserMargin = async (rule: UserRule) => {
    try {
      await api.upsertUserMargin(rule.user._id, Number(editingUserMargin));
      setEditingUserId(null);
      setEditingUserMargin('');
      fetchMargins();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };
  const handleDeleteUserMargin = async (rule: UserRule) => {
    try {
      await api.deleteUserMargin(rule.user._id);
      fetchMargins();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  // Global margin handlers
  const handleEditGlobalMargin = (rule: GlobalRule) => {
    setEditingGlobalId(rule._id);
    setEditingGlobalMargin(rule.marginPercentage.toString());
  };
  const handleSaveGlobalMargin = async (rule: GlobalRule) => {
    try {
      await api.upsertGlobalMargin(rule.asset, Number(editingGlobalMargin));
      setEditingGlobalId(null);
      setEditingGlobalMargin('');
      fetchMargins();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };
  const handleDeleteGlobalMargin = async (rule: GlobalRule) => {
    try {
      await api.deleteGlobalMargin(rule.asset);
      fetchMargins();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };
  const handleAddGlobalRule = async () => {
    if (!newGlobalAsset || !newGlobalMargin) return;
    try {
      await api.upsertGlobalMargin(newGlobalAsset, Number(newGlobalMargin));
      setNewGlobalAsset('');
      setNewGlobalMargin('');
      fetchMargins();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Margin Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {userRole === 'superadmin'
                  ? 'Configure margin requirements for users and assets'
                  : 'View margin requirements for users and assets (Read-only access)'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Admin Panel</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User-Specific Margins */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User-Specific Margins</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Custom margin settings for individual users</p>
                </div>
              </div>

              <div className="space-y-4">
                {userRules.map((rule) => (
                  <div key={rule._id} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{rule.user.username || rule.user.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{rule.user.email}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {editingUserId === rule._id ? (
                          <>
                            <input
                              type="number"
                              value={editingUserMargin}
                              onChange={e => setEditingUserMargin(e.target.value)}
                              className="w-20 px-3 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">%</span>
                            <button
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              onClick={() => handleSaveUserMargin(rule)}
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                              onClick={() => setEditingUserId(null)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{rule.marginPercentage}%</span>
                            {userRole === 'superadmin' ? (
                              <>
                                <button
                                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                  onClick={() => handleEditUserMargin(rule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  onClick={() => handleDeleteUserMargin(rule)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500 ml-2">(Read-only)</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {userRules.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No user-specific margin rules configured
                  </div>
                )}
              </div>
            </div>

            {/* Global Margin Rules */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Global Margin Rules</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Default margin settings for all assets</p>
                </div>
              </div>

              {/* Add New Rule Form */}
              {userRole === 'superadmin' && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Asset Symbol (e.g. RELIANCE)"
                      value={newGlobalAsset}
                      onChange={e => setNewGlobalAsset(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Margin %"
                      value={newGlobalMargin}
                      onChange={e => setNewGlobalMargin(e.target.value)}
                      className="w-32 px-4 py-3 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium"
                      onClick={handleAddGlobalRule}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Rule</span>
                    </button>
                  </div>
                </div>
              )}
            <div className="divide-y">
              {globalRules.map((rule) => (
                <div key={rule._id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 text-xs font-semibold">
                      {rule.asset}
                    </span>
                    {editingGlobalId === rule._id ? (
                      <>
                        <input
                          type="number"
                          value={editingGlobalMargin}
                          onChange={e => setEditingGlobalMargin(e.target.value)}
                          className="w-20 px-2 py-1 border rounded ml-2"
                        />
                        <span className="ml-1">%</span>
                        <button className="text-blue-600 font-bold ml-2" onClick={() => handleSaveGlobalMargin(rule)}>
                          Save
                        </button>
                        <button className="text-gray-400 ml-2" onClick={() => setEditingGlobalId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold ml-2">{rule.marginPercentage}%</span>
                        {userRole === 'superadmin' ? (
                          <>
                            <button className="ml-2 text-blue-600" onClick={() => handleEditGlobalMargin(rule)}>
                              ✎
                            </button>
                            <button className="ml-2 text-red-500" onClick={() => handleDeleteGlobalMargin(rule)}>
                              🗑
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 ml-2">(Read-only)</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AdminMarginSettings; 