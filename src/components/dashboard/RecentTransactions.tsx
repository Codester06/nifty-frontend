import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Transaction } from '@/shared/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const navigate = useNavigate();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last {recentTransactions.length} activities
        </div>
      </div>
      
      {recentTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recent transactions</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your trading activity and fund movements will appear here
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg"
          >
            Start Learning
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recentTransactions.map((transaction) => {
            const isRecent = false; // This needs to be implemented
            return (
              <div key={transaction.id} className={`group bg-gray-50/80 dark:bg-slate-700/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-gray-200/50 dark:border-slate-600/50 hover:shadow-lg ${isRecent ? 'ring-2 ring-blue-500/20' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      transaction.type === 'buy' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      transaction.type === 'sell' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {transaction.type === 'buy' ? (
                        <TrendingUp className="h-6 w-6 text-white" />
                      ) : transaction.type === 'sell' ? (
                        <TrendingDown className="h-6 w-6 text-white" />
                      ) : (
                        <Wallet className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {transaction.type === 'buy' ? 'Stock Purchase' :
                           transaction.type === 'sell' ? 'Stock Sale' :
                           transaction.type === 'add_funds' ? 'Funds Added' : 'Withdrawal'}
                        </h4>
                        {isRecent && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.stockSymbol && (
                          <span className="font-medium">{transaction.stockSymbol} • </span>
                        )}
                        {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'buy' || transaction.type === 'withdraw' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {transaction.type === 'buy' || transaction.type === 'withdraw' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                    </p>
                    {transaction.quantity && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.quantity} shares • ₹{(transaction.amount / transaction.quantity).toFixed(2)}/share
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {transactions.length >= 5 && (
            <div className="text-center pt-4">
              <button 
                onClick={() => navigate('/user/transactions')}
                className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
              >
                View All Transactions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
