import { useState, useEffect, useCallback, useRef } from 'react';
import { Portfolio, PortfolioStock, PortfolioOption } from '@/features/trading/types';
import { PortfolioSummary, tradingService } from '@/features/trading/services/tradingService';
import { PortfolioCalculations } from '@/shared/utils/portfolioCalculations';
import { apiService } from '@/shared/services/api';

interface UsePortfolioRealTimeOptions {
  userId: string;
  updateInterval?: number; // in milliseconds
  enableRealTime?: boolean;
}

interface UsePortfolioRealTimeReturn {
  portfolio: Portfolio | null;
  summary: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshPortfolio: () => Promise<void>;
  updatePrices: (priceUpdates: Record<string, number>) => void;
}

export const usePortfolioRealTime = ({
  userId,
  updateInterval = 5000, // 5 seconds default
  enableRealTime = true
}: UsePortfolioRealTimeOptions): UsePortfolioRealTimeReturn => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const priceUpdateQueueRef = useRef<Record<string, number>>({});

  // Fetch initial portfolio data
  const fetchPortfolioData = useCallback(async (): Promise<Portfolio | null> => {
    try {
      setError(null);

      // Fetch both stocks and options portfolio data
      const [stocksResponse, optionsResponse] = await Promise.all([
        apiService.getPortfolio(userId),
        apiService.getOptionsPortfolio(userId)
      ]);

      // Convert options positions to portfolio options with coin tracking
      const optionsPositions: PortfolioOption[] = optionsResponse.positions?.map(
        (position: any) => PortfolioCalculations.convertOptionsPositionToPortfolioOption(position)
      ) || [];

      // Create stocks with coin tracking
      const stocksPositions: PortfolioStock[] = stocksResponse.stocks?.map((stock: any) => 
        PortfolioCalculations.createPortfolioStock(
          stock.symbol,
          stock.quantity,
          stock.averagePrice,
          stock.currentPrice,
          new Date(stock.entryDate || Date.now())
        )
      ) || [];

      const portfolioData: Portfolio = {
        id: userId,
        userId,
        stocks: stocksPositions,
        options: optionsPositions,
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        stocksValue: 0,
        optionsValue: 0,
        stocksGainLoss: 0,
        optionsGainLoss: 0,
        // Initialize coin-based metrics
        totalCoinsInvested: 0,
        totalCoinValue: 0,
        totalCoinPnL: 0,
        totalCoinPnLPercent: 0,
        stocksCoinValue: 0,
        optionsCoinValue: 0,
        stocksCoinPnL: 0,
        optionsCoinPnL: 0
      };

      // Calculate all portfolio metrics including coin-based ones
      const updatedPortfolio = PortfolioCalculations.updatePortfolioCalculations(portfolioData);
      return updatedPortfolio;
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data');
      return null;
    }
  }, [userId]);

  // Update portfolio summary
  const updatePortfolioSummary = useCallback(async (portfolioData: Portfolio) => {
    try {
      const summaryData = await tradingService.getPortfolioSummary(userId, portfolioData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error calculating portfolio summary:', err);
    }
  }, [userId]);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const portfolioData = await fetchPortfolioData();
      if (portfolioData) {
        setPortfolio(portfolioData);
        await updatePortfolioSummary(portfolioData);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, [fetchPortfolioData, updatePortfolioSummary]);

  // Update prices for real-time updates
  const updatePrices = useCallback((priceUpdates: Record<string, number>) => {
    // Queue price updates to avoid too frequent recalculations
    priceUpdateQueueRef.current = { ...priceUpdateQueueRef.current, ...priceUpdates };
  }, []);

  // Process queued price updates
  const processQueuedPriceUpdates = useCallback(() => {
    if (!portfolio || Object.keys(priceUpdateQueueRef.current).length === 0) {
      return;
    }

    const priceUpdates = priceUpdateQueueRef.current;
    priceUpdateQueueRef.current = {};

    setPortfolio(currentPortfolio => {
      if (!currentPortfolio) return currentPortfolio;

      let hasUpdates = false;
      
      // Update stock prices
      const updatedStocks = currentPortfolio.stocks.map(stock => {
        if (priceUpdates[stock.symbol] && priceUpdates[stock.symbol] !== stock.currentPrice) {
          hasUpdates = true;
          return { ...stock, currentPrice: priceUpdates[stock.symbol] };
        }
        return stock;
      });

      // Update option prices
      const updatedOptions = currentPortfolio.options.map(option => {
        const optionSymbol = `${option.underlying}${option.strike}${option.optionType}`;
        if (priceUpdates[optionSymbol] && priceUpdates[optionSymbol] !== option.currentPrice) {
          hasUpdates = true;
          return { ...option, currentPrice: priceUpdates[optionSymbol] };
        }
        return option;
      });

      if (!hasUpdates) return currentPortfolio;

      // Recalculate portfolio metrics with updated prices
      const updatedPortfolio = PortfolioCalculations.updatePortfolioCalculations({
        ...currentPortfolio,
        stocks: updatedStocks,
        options: updatedOptions
      });

      // Update summary asynchronously
      updatePortfolioSummary(updatedPortfolio);
      setLastUpdated(new Date());

      return updatedPortfolio;
    });
  }, [portfolio, updatePortfolioSummary]);

  // Set up real-time updates
  useEffect(() => {
    if (!enableRealTime) return;

    // Process queued price updates periodically
    intervalRef.current = setInterval(() => {
      processQueuedPriceUpdates();
    }, 1000); // Process updates every second

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableRealTime, processQueuedPriceUpdates]);

  // Set up periodic portfolio refresh
  useEffect(() => {
    if (!enableRealTime) return;

    const refreshInterval = setInterval(() => {
      refreshPortfolio();
    }, updateInterval);

    return () => clearInterval(refreshInterval);
  }, [enableRealTime, updateInterval, refreshPortfolio]);

  // Initial load
  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    portfolio,
    summary,
    loading,
    error,
    lastUpdated,
    refreshPortfolio,
    updatePrices
  };
};