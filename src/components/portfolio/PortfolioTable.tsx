
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Portfolio as PortfolioItem } from '@/shared/types';

interface PortfolioTableProps {
  portfolio: PortfolioItem[];
}

const PortfolioTable = ({ portfolio }: PortfolioTableProps) => {
  const totalPnL = portfolio.reduce((sum, item) => sum + (item.currentPrice - item.avgPrice) * item.quantity, 0);

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Holdings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="p-4">Symbol</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Avg. Price</th>
              <th className="p-4">Current Price</th>
              <th className="p-4">P&L</th>
              <th className="p-4">P&L %</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map(item => {
              const pnl = (item.currentPrice - item.avgPrice) * item.quantity;
              const pnlPercent = ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100;
              const isProfit = pnl >= 0;

              return (
                <tr key={item.symbol} className="border-b border-gray-200 dark:border-slate-700">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{item.symbol}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">₹{item.avgPrice.toLocaleString()}</td>
                  <td className="p-4">₹{item.currentPrice.toLocaleString()}</td>
                  <td className={`p-4 font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center">
                      {isProfit ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      ₹{Math.abs(pnl).toLocaleString()}
                    </div>
                  </td>
                  <td className={`p-4 font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {pnlPercent.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 dark:border-slate-700">
              <td colSpan={4} className="p-4 font-bold text-right">Total P&L</td>
              <td colSpan={2} className={`p-4 font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{totalPnL.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
