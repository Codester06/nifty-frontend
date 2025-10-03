import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { Portfolio } from '@/shared/types';
import { useAuth } from '@/shared/hooks/useAuth';

interface PortfolioHoldingsProps {
  portfolio: Portfolio[];
}

const PortfolioHoldings = ({ portfolio }: PortfolioHoldingsProps) => {
  const navigate = useNavigate();
  const { buyStock, sellStock } = useAuth();

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Holdings</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {portfolio.length} stocks
          </div>
          <button
            onClick={() => navigate('/user/portfolio')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            View Full Portfolio
          </button>
        </div>
      </div>
      
      {portfolio.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your portfolio is empty</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start building your investment portfolio by buying stocks and options. Your positions and performance will be tracked here in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Browse Stocks
            </button>
            <button
              onClick={() => navigate('/options')}
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg"
            >
              Trade Options
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolio.map((stock) => {
            const profitLoss = (stock.currentPrice - stock.avgPrice) * stock.quantity;
            const profitLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
            const isProfit = profitLoss >= 0;
            
            return (
              <div key={stock.symbol} className="group bg-gray-50/80 dark:bg-slate-700/50 rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-gray-200/50 dark:border-slate-600/50 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isProfit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <span className={`font-bold text-sm ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {stock.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stock.quantity} shares • Avg: ₹{stock.avgPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{(stock.quantity * stock.currentPrice).toLocaleString()}
                    </p>
                    <div className={`flex items-center justify-end space-x-1 ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="font-medium">
                        {isProfit ? '+' : ''}₹{Math.abs(profitLoss).toFixed(2)}
                      </span>
                      <span className="text-sm">
                        ({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Mini progress bar showing current price vs avg price */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>₹{Math.min(stock.avgPrice, stock.currentPrice).toFixed(2)}</span>
                    <span>₹{Math.max(stock.avgPrice, stock.currentPrice).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${isProfit ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${Math.min(100, Math.max(10, Math.abs(profitLossPercent)))}%`
                      }}
                    />
                  </div>
                </div>

                {/* Buy/Sell buttons for demo trading */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await buyStock(stock.symbol, 1, stock.currentPrice);
                      } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to buy stock');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Buy
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await sellStock(stock.symbol, 1, stock.currentPrice);
                      } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to sell stock');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    disabled={stock.quantity <= 0}
                  >
                    <Minus className="h-4 w-4" />
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioHoldings;
