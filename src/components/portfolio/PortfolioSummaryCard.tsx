import React from 'react';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  Award,
  Activity,
  DollarSign,
  Coins
} from 'lucide-react';
import type { PortfolioSummary } from '@/features/trading/services/tradingService';

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
  coinBalance: number;
  className?: string;
}

const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  summary,
  coinBalance,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const totalPortfolioValue = summary.totalCoinValue + coinBalance;
  const portfolioAllocation = totalPortfolioValue > 0 ? (summary.totalCoinsInvested / totalPortfolioValue) * 100 : 0;
  const isOverallProfit = summary.totalCoinPnL >= 0;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 ${
      isMobile ? 'p-4' : 'p-8'
    } ${className}`}>
      <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-8'}`}>
        <h2 className={`font-bold text-gray-900 dark:text-white ${
          isMobile ? 'text-lg' : 'text-2xl'
        }`}>Portfolio Summary</h2>
        <div className={`flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full ${
          isMobile ? 'px-2 py-1' : 'px-3 py-1'
        }`}>
          <Activity className={`text-blue-600 dark:text-blue-400 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span className={`font-medium text-blue-700 dark:text-blue-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            {summary.activeTrades} Active
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-2 mb-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'
      }`}>
        {/* Total Portfolio Value */}
        <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white ${
          isMobile ? 'p-3' : 'p-6'
        }`}>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <p className={`text-blue-100 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Total Portfolio
              </p>
              <p className={`font-bold mt-1 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {isMobile 
                  ? `${(totalPortfolioValue / 1000).toFixed(0)}K`
                  : totalPortfolioValue.toLocaleString()
                }
              </p>
              <p className={`text-blue-200 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>coins</p>
            </div>
            {!isMobile && (
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Invested Amount */}
        <div className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white ${
          isMobile ? 'p-3' : 'p-6'
        }`}>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <p className={`text-purple-100 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Invested
              </p>
              <p className={`font-bold mt-1 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {isMobile 
                  ? `${(summary.totalCoinsInvested / 1000).toFixed(0)}K`
                  : summary.totalCoinsInvested.toLocaleString()
                }
              </p>
              <p className={`text-purple-200 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {portfolioAllocation.toFixed(1)}% allocated
              </p>
            </div>
            {!isMobile && (
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Available Balance */}
        <div className={`bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white ${
          isMobile ? 'p-3' : 'p-6'
        }`}>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <p className={`text-emerald-100 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Available
              </p>
              <p className={`font-bold mt-1 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {isMobile 
                  ? `${(coinBalance / 1000).toFixed(0)}K`
                  : coinBalance.toLocaleString()
                }
              </p>
              <p className={`text-emerald-200 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {isMobile ? 'to invest' : 'coins to invest'}
              </p>
            </div>
            {!isMobile && (
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Coins className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Total P&L */}
        <div className={`bg-gradient-to-br ${
          isOverallProfit ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
        } rounded-2xl text-white ${isMobile ? 'p-3' : 'p-6'}`}>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <p className={`${isOverallProfit ? 'text-green-100' : 'text-red-100'} font-medium ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Total P&L
              </p>
              <p className={`font-bold mt-1 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {isMobile 
                  ? `${(Math.abs(summary.totalCoinPnL) / 1000).toFixed(0)}K`
                  : Math.abs(summary.totalCoinPnL).toLocaleString()
                }
              </p>
              <p className={`${isOverallProfit ? 'text-green-200' : 'text-red-200'} mt-1 ${
                isMobile ? 'text-xs' : 'text-xs'
              }`}>
                {isOverallProfit ? '+' : '-'}{Math.abs(summary.totalCoinPnLPercent).toFixed(2)}% return
              </p>
            </div>
            {!isMobile && (
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {isOverallProfit ? (
                  <TrendingUp className="h-6 w-6 text-white" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-white" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.winRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-blue-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalTrades}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.averageCoinReturn.toFixed(0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Return</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-purple-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalCoinFees.toFixed(0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Fees</p>
          </div>
        </div>
      </div>

      {/* Best and Worst Trades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-300">Best Trade</h4>
              <p className="text-sm text-green-600 dark:text-green-400">Highest single gain</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">
            +{summary.bestCoinTrade.toLocaleString()} coins
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">Worst Trade</h4>
              <p className="text-sm text-red-600 dark:text-red-400">Highest single loss</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-red-800 dark:text-red-300">
            {summary.worstCoinTrade.toLocaleString()} coins
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummaryCard;