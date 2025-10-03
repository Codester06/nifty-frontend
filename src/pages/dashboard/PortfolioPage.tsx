import { useAuth } from '@/shared/hooks/useAuth';
import PortfolioTable from '@/components/portfolio/PortfolioTable';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';

const PortfolioPage = () => {
  const { portfolio, totalInvestment, currentValue, totalPnL, pnlPercent } = useAuth();







  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-8">
          <PortfolioOverview
            totalInvestment={totalInvestment}
            currentValue={currentValue}
            totalPnL={totalPnL}
            pnlPercent={pnlPercent}
          />
          <PortfolioTable portfolio={portfolio} />
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;