import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { coinService } from '@/shared/services/coinService';
import { adminCoinService } from '@/shared/services/adminCoinService';
import { 
  Coins, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  History
} from 'lucide-react';
import type { CoinTransaction, CoinBalance } from '@/shared/types/coin';
import { PaymentStatusModal } from '@/components/forms';

interface UserCoinData {
  userId: string;
  username: string;
  email: string;
  mobile: string;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  lastUpdated: Date;
}

interface CoinManagementAction {
  type: 'ADD' | 'DEDUCT';
  userId: string;
  amount: number;
  reason: string;
}

const AdminCoinManagement = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState<UserCoinData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserCoinData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCoinData | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'low' | 'high'>('all');
  
  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionForm, setActionForm] = useState<CoinManagementAction>({
    type: 'ADD',
    userId: '',
    amount: 0,
    reason: ''
  });

  // Payment status modal state
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: 'success' | 'failed' | 'pending';
    title: string;
    message: string;
    transactionId?: string;
    coinAmount?: number;
    newBalance?: number;
    errorCode?: string;
  }>({
    status: 'success',
    title: '',
    message: ''
  });

  // Predefined reasons for coin transactions
  const PREDEFINED_REASONS = {
    ADD: [
      'Manual coin purchase',
      'Promotional bonus',
      'Referral bonus',
      'Customer support adjustment',
      'System error correction',
      'Welcome bonus',
      'Contest reward'
    ],
    DEDUCT: [
      'Manual adjustment',
      'System error correction',
      'Penalty deduction',
      'Refund processing',
      'Account correction'
    ]
  };

  useEffect(() => {
    // Redirect if not admin or superadmin
    if (userRole !== 'superadmin' && userRole !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchUsersData();
  }, [userRole, navigate]);

  useEffect(() => {
    // Filter users based on search and balance filter
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm);
      
      let matchesBalance = true;
      if (balanceFilter === 'low') {
        matchesBalance = user.balance < 1000;
      } else if (balanceFilter === 'high') {
        matchesBalance = user.balance >= 10000;
      }
      
      return matchesSearch && matchesBalance;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, balanceFilter]);

  const fetchUsersData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await adminCoinService.getAllUsersCoinInfo();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users data:', error);
      setError('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    try {
      const result = await coinService.getCoinTransactionHistory(userId, { limit: 20 });
      if (result.success && result.data) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleUserSelect = (user: UserCoinData) => {
    setSelectedUser(user);
    fetchUserTransactions(user.userId);
  };

  const handleOpenActionModal = (type: 'ADD' | 'DEDUCT', user: UserCoinData) => {
    setActionForm({
      type,
      userId: user.userId,
      amount: 0,
      reason: ''
    });
    setShowActionModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setActionForm({
      type: 'ADD',
      userId: '',
      amount: 0,
      reason: ''
    });
  };

  const validateAction = (): boolean => {
    if (actionForm.amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    
    if (actionForm.amount > 100000) {
      setError('Amount cannot exceed 100,000 coins');
      return false;
    }
    
    if (!actionForm.reason.trim()) {
      setError('Please provide a reason for this transaction');
      return false;
    }
    
    if (actionForm.type === 'DEDUCT') {
      const user = users.find(u => u.userId === actionForm.userId);
      if (user && user.balance < actionForm.amount) {
        setError(`Insufficient balance. User has only ${user.balance} coins`);
        return false;
      }
    }
    
    return true;
  };

  const handleExecuteAction = async () => {
    if (!validateAction()) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (actionForm.type === 'ADD') {
        result = await adminCoinService.manuallyAddCoins({
          userId: actionForm.userId,
          amount: actionForm.amount,
          reason: actionForm.reason
        });
      } else {
        result = await adminCoinService.manuallyDeductCoins({
          userId: actionForm.userId,
          amount: actionForm.amount,
          reason: actionForm.reason
        });
      }
      
      if (result.success) {
        // Update user balance in local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.userId === actionForm.userId 
              ? { ...user, balance: result.newBalance }
              : user
          )
        );
        
        // Refresh selected user's transactions
        if (selectedUser?.userId === actionForm.userId) {
          fetchUserTransactions(actionForm.userId);
        }

        // Show payment success modal
        const user = users.find(u => u.userId === actionForm.userId);
        setPaymentStatus({
          status: 'success',
          title: `Coins ${actionForm.type === 'ADD' ? 'Added' : 'Deducted'} Successfully`,
          message: `Successfully ${actionForm.type === 'ADD' ? 'added' : 'deducted'} ${actionForm.amount} coins ${actionForm.type === 'ADD' ? 'to' : 'from'} ${user?.username || 'user'}'s account.`,
          transactionId: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          coinAmount: actionForm.amount,
          newBalance: result.newBalance
        });
        
        // Close action modal and show payment status
        handleCloseActionModal();
        setShowPaymentStatus(true);
      } else {
        // Show payment failure modal
        setPaymentStatus({
          status: 'failed',
          title: 'Transaction Failed',
          message: result.error?.message || 'Failed to process coin transaction. Please try again.',
          errorCode: result.error?.code || 'UNKNOWN_ERROR',
          coinAmount: actionForm.amount
        });
        
        handleCloseActionModal();
        setShowPaymentStatus(true);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      setError('Transaction failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 1000) return 'text-red-500';
    if (balance < 5000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DEBIT':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'PURCHASE':
        return <Coins className="h-4 w-4 text-blue-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">Loading users data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Coin Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {userRole === 'superadmin'
                  ? 'Manage user coin balances and transactions'
                  : 'View user coin balances and transactions (Read-only access)'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchUsersData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
              {/* Search and Filters */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or mobile..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={balanceFilter}
                      onChange={(e) => setBalanceFilter(e.target.value as 'all' | 'low' | 'high')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Balances</option>
                      <option value="low">Low Balance (&lt; 1,000)</option>
                      <option value="high">High Balance (≥ 10,000)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Purchased
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.userId}
                        className={`hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${
                          selectedUser?.userId === user.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${getBalanceColor(user.balance)}`}>
                            {formatCurrency(user.balance)} coins
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(user.totalPurchased)} coins
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {userRole === 'superadmin' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenActionModal('ADD', user);
                                }}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title="Add Coins"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenActionModal('DEDUCT', user);
                                }}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Deduct Coins"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Details and Transactions */}
          <div className="space-y-6">
            {selectedUser ? (
              <>
                {/* User Details Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    User Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedUser.username}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedUser.email}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Mobile:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedUser.mobile}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Current Balance:</span>
                      <div className={`text-xl font-bold ${getBalanceColor(selectedUser.balance)}`}>
                        {formatCurrency(selectedUser.balance)} coins
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Purchased:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedUser.totalPurchased)} coins
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Spent:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedUser.totalSpent)} coins
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Transactions
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.reason}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(transaction.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-bold ${
                                transaction.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {transaction.type === 'CREDIT' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                            {getStatusIcon(transaction.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No transactions found
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Select a user to view details and transactions
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {actionForm.type === 'ADD' ? 'Add Coins' : 'Deduct Coins'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {actionForm.type === 'ADD' 
                  ? 'Add coins to user account manually' 
                  : 'Deduct coins from user account'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (coins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={actionForm.amount || ''}
                  onChange={(e) => setActionForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <select
                  value={actionForm.reason}
                  onChange={(e) => setActionForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason</option>
                  {PREDEFINED_REASONS[actionForm.type].map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Reason Input */}
              {actionForm.reason && !PREDEFINED_REASONS[actionForm.type].includes(actionForm.reason) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Reason
                  </label>
                  <input
                    type="text"
                    value={actionForm.reason}
                    onChange={(e) => setActionForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter custom reason"
                  />
                </div>
              )}

              {/* Add custom reason option */}
              {actionForm.reason === '' && (
                <button
                  onClick={() => setActionForm(prev => ({ ...prev, reason: 'Custom reason' }))}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  + Add custom reason
                </button>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={handleCloseActionModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={actionLoading || !actionForm.amount || !actionForm.reason}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionForm.type === 'ADD'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {actionLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  `${actionForm.type === 'ADD' ? 'Add' : 'Deduct'} ${actionForm.amount || 0} Coins`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      <PaymentStatusModal
        isOpen={showPaymentStatus}
        onClose={() => setShowPaymentStatus(false)}
        status={paymentStatus.status}
        title={paymentStatus.title}
        message={paymentStatus.message}
        transactionId={paymentStatus.transactionId}
        coinAmount={paymentStatus.coinAmount}
        newBalance={paymentStatus.newBalance}
        errorCode={paymentStatus.errorCode}
        showRetryButton={paymentStatus.status === 'failed'}
        onRetry={() => {
          setShowPaymentStatus(false);
          setShowActionModal(true);
        }}
      />
    </div>
  );
};

export default AdminCoinManagement;