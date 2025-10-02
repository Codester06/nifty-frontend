import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { coinService } from '@/shared/services';
import { CoinTransaction, CoinTransactionFilters } from '@/shared/types/coin';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ShoppingCart, 
  Filter, 
  Calendar,
  Clock,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CoinTransactionHistoryProps {
  className?: string;
  showFilters?: boolean;
  pageSize?: number;
}

interface TransactionDetailModalProps {
  transaction: CoinTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  if (!isOpen || !transaction) return null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <ArrowUpCircle className="h-6 w-6 text-green-500" />;
      case 'DEBIT':
        return <ArrowDownCircle className="h-6 w-6 text-red-500" />;
      case 'PURCHASE':
        return <ShoppingCart className="h-6 w-6 text-blue-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'FAILED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {getTransactionIcon(transaction.type)}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Transaction ID */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Transaction ID
            </label>
            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {transaction.id}
            </p>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Type
              </label>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {transaction.type}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Amount and Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Amount
              </label>
              <p className={`text-lg font-bold ${
                transaction.type === 'CREDIT' || transaction.type === 'PURCHASE' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {transaction.type === 'CREDIT' || transaction.type === 'PURCHASE' ? '+' : '-'}
                {transaction.amount.toLocaleString()} coins
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Balance After
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {transaction.balance.toLocaleString()} coins
              </p>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Reason
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {transaction.reason}
            </p>
          </div>

          {/* Related Trade ID */}
          {transaction.relatedTradeId && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Related Trade ID
              </label>
              <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                {transaction.relatedTradeId}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Date & Time
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(transaction.timestamp).toLocaleString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Kolkata'
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CoinTransactionHistory: React.FC<CoinTransactionHistoryProps> = ({
  className = '',
  showFilters = true,
  pageSize = 10
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CoinTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<CoinTransactionFilters>({
    limit: pageSize,
    offset: 0
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Load transactions
  const loadTransactions = async (newFilters?: CoinTransactionFilters) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || filters;
      const result = await coinService.getCoinTransactionHistory(user.id, filtersToUse);
      
      if (result.success && result.data) {
        setTransactions(result.data);
        setTotalCount(result.totalCount || 0);
        setHasMore(result.hasMore || false);
      } else {
        setError(result.error?.message || 'Failed to load transaction history');
      }
    } catch (err) {
      setError('Failed to load transaction history');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount and when filters change
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CoinTransactionFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      offset: 0 // Reset to first page when filters change
    };
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * pageSize;
    const updatedFilters = {
      ...filters,
      offset: newOffset
    };
    setFilters(updatedFilters);
    setCurrentPage(page);
  };

  // Handle transaction detail view
  const handleViewDetails = (transaction: CoinTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case 'DEBIT':
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      case 'PURCHASE':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'FAILED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">Please log in to view transaction history</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className={`border-b border-gray-200 dark:border-gray-700 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-gray-900 dark:text-white ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            Transaction History
          </h3>
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center space-x-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                isMobile ? 'px-2 py-1' : 'px-3 py-2'
              }`}
            >
              <Filter className="h-4 w-4" />
              {!isMobile && <span>Filters</span>}
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className={`mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4 ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
            }`}>
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange({ type: e.target.value as any || undefined })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="CREDIT">Credit</option>
                  <option value="DEBIT">Debit</option>
                  <option value="PURCHASE">Purchase</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    let dateFrom: Date | undefined;
                    let dateTo: Date | undefined;
                    
                    if (value) {
                      const now = new Date();
                      dateTo = now;
                      
                      switch (value) {
                        case '7':
                          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          break;
                        case '30':
                          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                          break;
                        case '90':
                          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                          break;
                      }
                    }
                    
                    handleFilterChange({ dateFrom, dateTo });
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Time</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setFilters({ limit: pageSize, offset: 0 });
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={isMobile ? 'p-4' : 'p-6'}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => loadTransactions()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Transaction List */}
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    isMobile ? 'p-3' : 'p-4'
                  }`}
                >
                  {isMobile ? (
                    // Mobile Layout - Stacked
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {transaction.reason}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${
                            transaction.type === 'CREDIT' || transaction.type === 'PURCHASE' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'CREDIT' || transaction.type === 'PURCHASE' ? '+' : '-'}
                            {(transaction.amount / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bal: {(transaction.balance / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Desktop Layout - Horizontal
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.reason}
                            </p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'CREDIT' || transaction.type === 'PURCHASE' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'CREDIT' || transaction.type === 'PURCHASE' ? '+' : '-'}
                            {transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Balance: {transaction.balance.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between border-t border-gray-200 dark:border-gray-700 ${
                isMobile ? 'mt-4 pt-4 flex-col space-y-3' : 'mt-6 pt-6'
              }`}>
                <p className={`text-gray-500 dark:text-gray-400 ${
                  isMobile ? 'text-xs text-center' : 'text-sm'
                }`}>
                  {isMobile 
                    ? `${currentPage} of ${totalPages} pages`
                    : `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} transactions`
                  }
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isMobile ? 'p-3' : 'p-2'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className={`font-medium text-gray-900 dark:text-white ${
                    isMobile ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-sm'
                  }`}>
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isMobile ? 'p-3' : 'p-2'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default CoinTransactionHistory;