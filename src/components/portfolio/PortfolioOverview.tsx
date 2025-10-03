import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioOverviewProps {
  totalInvestment: number;
  currentValue: number;
  totalPnL: number;
  pnlPercent: number;
}

const PortfolioOverview = ({ totalInvestment, currentValue, totalPnL, pnlPercent }: PortfolioOverviewProps) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Portfolio Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Total Investment</p>
          <p className="text-3xl font-bold mt-2">₹{totalInvestment.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-purple-100 text-sm font-medium">Current Value</p>
          <p className="text-3xl font-bold mt-2">₹{currentValue.toLocaleString()}</p>
        </div>

        <div className={`bg-gradient-to-br ${totalPnL >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl p-6 text-white shadow-lg`}>
          <p className={`${totalPnL >= 0 ? 'text-green-100' : 'text-red-100'} text-sm font-medium`}>Total P&L</p>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-3xl font-bold">₹{Math.abs(totalPnL).toLocaleString()}</p>
            <div className={`flex items-center text-sm ${totalPnL >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {totalPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{pnlPercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
