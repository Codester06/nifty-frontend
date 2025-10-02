import { apiService } from '@/shared/services/api';
import { coinService } from '@/shared/services/coinService';
import { validateOrder, type OrderValidationRequest, type OrderValidationResult } from '@/shared/utils/orderValidation';
import type { Stock, OptionContract, Portfolio, Transaction } from '@/shared/types';
import type { CoinTransaction } from '@/shared/types/coin';

// Trading Service Types
export interface OrderRequest {
  userId: string;
  symbol: string;
  instrumentType: 'stock' | 'option';
  action: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MARKET' | 'LIMIT';
  price: number;
  limitPrice?: number;
  coinAmount: number;
  optionDetails?: {
    strike: number;
    expiry: string;
    optionType: 'CE' | 'PE';
    lotSize: number;
  };
}

export interface TradeResult {
  tradeId: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  executedQuantity: number;
  executedPrice: number;
  coinAmount: number;
  fees: number;
  message: string;
  timestamp: Date;
  coinTransaction?: CoinTransaction;
}

export interface TradeExecutionRequest {
  orderRequest: OrderRequest;
  validationResult: OrderValidationResult;
  stock?: Stock;
  optionContract?: OptionContract;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  totalCoinsInvested: number;
  winRate: number;
  totalTrades: number;
  activeTrades: number;
  // Enhanced coin-based metrics
  totalCoinValue: number;        // Current total value in coins
  totalCoinPnL: number;          // Total P&L in coins
  totalCoinPnLPercent: number;   // Total P&L percentage in coins
  averageCoinReturn: number;     // Average return per trade in coins
  bestCoinTrade: number;         // Best single trade P&L in coins
  worstCoinTrade: number;        // Worst single trade P&L in coins
  totalCoinFees: number;         // Total fees paid in coins
}

export interface TradeFilters {
  instrumentType?: 'stock' | 'option';
  action?: 'BUY' | 'SELL';
  status?: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

class TradingService {
  /**
   * Validate an order before execution
   */
  async validateOrder(request: OrderValidationRequest): Promise<OrderValidationResult> {
    try {
      // Use the comprehensive order validation utility
      const validationResult = validateOrder(request);
      
      // Additional server-side validation can be added here
      // For now, we'll use the client-side validation
      
      return validationResult;
    } catch (error) {
      console.error('Order validation error:', error);
      return {
        isValid: false,
        errors: [{
          field: 'general',
          message: 'Order validation failed. Please try again.',
          code: 'VALIDATION_ERROR'
        }],
        warnings: [],
        coinCost: 0,
        totalAmount: 0,
        canAfford: false
      };
    }
  }

  /**
   * Execute a validated trade order
   */
  async executeOrder(request: TradeExecutionRequest): Promise<TradeResult> {
    const { orderRequest, validationResult, stock, optionContract } = request;
    
    try {
      // Double-check validation
      if (!validationResult.isValid) {
        throw new Error(`Order validation failed: ${validationResult.errors[0]?.message}`);
      }

      const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Handle coin transaction first
      let coinTransaction: CoinTransaction | undefined;
      
      if (orderRequest.action === 'BUY') {
        // Deduct coins for buy order
        const deductResult = await coinService.deductCoins({
          userId: orderRequest.userId,
          amount: validationResult.coinCost,
          reason: `${orderRequest.instrumentType === 'option' ? 'Option' : 'Stock'} Purchase: ${orderRequest.symbol}`,
          relatedTradeId: tradeId
        });

        if (!deductResult.success) {
          throw new Error(deductResult.error?.message || 'Failed to deduct coins');
        }

        coinTransaction = deductResult.data;
      } else {
        // Add coins for sell order
        const addResult = await coinService.addCoins({
          userId: orderRequest.userId,
          amount: validationResult.coinCost,
          reason: `${orderRequest.instrumentType === 'option' ? 'Option' : 'Stock'} Sale: ${orderRequest.symbol}`,
          relatedTradeId: tradeId
        });

        if (!addResult.success) {
          throw new Error(addResult.error?.message || 'Failed to add coins');
        }

        coinTransaction = addResult.data;
      }

      // Execute the trade via API
      const tradeData = {
        userId: orderRequest.userId,
        asset: orderRequest.symbol,
        action: orderRequest.action,
        quantity: orderRequest.quantity,
        price: orderRequest.price,
        coinCost: validationResult.coinCost,
        instrumentType: orderRequest.instrumentType,
        orderType: orderRequest.orderType,
        ...(orderRequest.limitPrice && { limitPrice: orderRequest.limitPrice }),
        ...(orderRequest.optionDetails && { optionDetails: orderRequest.optionDetails }),
        status: 'Completed',
        tradeId
      };

      // Call backend API to record the trade
      try {
        await apiService.placeOptionsOrder({
          userId: orderRequest.userId,
          symbol: orderRequest.symbol,
          optionType: orderRequest.optionDetails?.optionType || 'CE',
          strike: orderRequest.optionDetails?.strike || 0,
          expiry: orderRequest.optionDetails?.expiry || '',
          action: orderRequest.action,
          quantity: orderRequest.quantity,
          orderType: orderRequest.orderType,
          price: orderRequest.limitPrice,
          premium: orderRequest.price,
          totalCost: validationResult.totalAmount
        });
      } catch (apiError) {
        console.warn('Backend API call failed, continuing with local execution:', apiError);
        // Continue execution even if backend fails
      }

      // Calculate fees (0.1% of trade value)
      const fees = Math.round(validationResult.totalAmount * 0.001);

      const result: TradeResult = {
        tradeId,
        status: 'SUCCESS',
        executedQuantity: orderRequest.quantity,
        executedPrice: orderRequest.price,
        coinAmount: validationResult.coinCost,
        fees,
        message: `${orderRequest.action} order executed successfully`,
        timestamp: new Date(),
        coinTransaction
      };

      return result;

    } catch (error) {
      console.error('Trade execution error:', error);
      
      // If coin transaction was successful but trade failed, we should reverse it
      // This would be handled by a proper transaction system in production
      
      return {
        tradeId: `failed_${Date.now()}`,
        status: 'FAILED',
        executedQuantity: 0,
        executedPrice: 0,
        coinAmount: 0,
        fees: 0,
        message: error instanceof Error ? error.message : 'Trade execution failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get user's portfolio with coin-based calculations
   */
  async getPortfolio(userId: string): Promise<Portfolio[]> {
    try {
      // This would typically fetch from backend
      // For now, we'll return empty array as portfolio is managed in useAuth
      return [];
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      return [];
    }
  }

  /**
   * Get portfolio summary with coin metrics
   */
  async getPortfolioSummary(userId: string, portfolioData: Portfolio): Promise<PortfolioSummary> {
    try {
      // Get trade history to calculate win rate and additional metrics
      const trades = await this.getTradeHistory(userId, { limit: 1000 });
      const completedTrades = trades.filter(trade => trade.status === 'SUCCESS');
      const winningTrades = completedTrades.filter(trade => trade.coinAmount > 0);
      
      const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0;
      
      // Calculate additional coin metrics
      const tradeCoinAmounts = completedTrades.map(trade => trade.coinAmount);
      const averageCoinReturn = tradeCoinAmounts.length > 0 
        ? tradeCoinAmounts.reduce((sum, amount) => sum + amount, 0) / tradeCoinAmounts.length 
        : 0;
      
      const bestCoinTrade = tradeCoinAmounts.length > 0 ? Math.max(...tradeCoinAmounts) : 0;
      const worstCoinTrade = tradeCoinAmounts.length > 0 ? Math.min(...tradeCoinAmounts) : 0;
      
      // Calculate total fees (0.1% of each trade)
      const totalCoinFees = completedTrades.reduce((total, trade) => {
        return total + this.estimateFees(trade.coinAmount);
      }, 0);

      return {
        totalValue: portfolioData.totalValue,
        totalInvested: portfolioData.stocksValue + portfolioData.optionsValue - portfolioData.totalGainLoss,
        totalPnL: portfolioData.totalGainLoss,
        totalPnLPercent: portfolioData.totalGainLossPercent,
        totalCoinsInvested: portfolioData.totalCoinsInvested,
        winRate,
        totalTrades: completedTrades.length,
        activeTrades: portfolioData.stocks.length + portfolioData.options.filter(o => o.status === 'OPEN').length,
        // Enhanced coin-based metrics
        totalCoinValue: portfolioData.totalCoinValue,
        totalCoinPnL: portfolioData.totalCoinPnL,
        totalCoinPnLPercent: portfolioData.totalCoinPnLPercent,
        averageCoinReturn,
        bestCoinTrade,
        worstCoinTrade,
        totalCoinFees
      };
    } catch (error) {
      console.error('Failed to calculate portfolio summary:', error);
      return {
        totalValue: 0,
        totalInvested: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        totalCoinsInvested: 0,
        winRate: 0,
        totalTrades: 0,
        activeTrades: 0,
        totalCoinValue: 0,
        totalCoinPnL: 0,
        totalCoinPnLPercent: 0,
        averageCoinReturn: 0,
        bestCoinTrade: 0,
        worstCoinTrade: 0,
        totalCoinFees: 0
      };
    }
  }

  /**
   * Get trade history with coin information
   */
  async getTradeHistory(userId: string, filters?: TradeFilters): Promise<TradeResult[]> {
    try {
      // This would typically fetch from backend
      // For now, we'll return empty array as trades are managed locally
      return [];
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
      return [];
    }
  }

  /**
   * Close a position (sell all shares/lots)
   */
  async closePosition(userId: string, position: Portfolio): Promise<TradeResult> {
    try {
      const orderRequest: OrderRequest = {
        userId,
        symbol: position.symbol,
        instrumentType: position.instrumentType,
        action: 'SELL',
        quantity: position.quantity,
        orderType: 'MARKET',
        price: position.currentPrice,
        coinAmount: position.quantity * position.currentPrice,
        ...(position.optionDetails && { optionDetails: position.optionDetails })
      };

      // Validate the close order
      const validationRequest: OrderValidationRequest = {
        type: 'sell',
        instrumentType: position.instrumentType,
        quantity: position.quantity,
        price: position.currentPrice,
        orderType: 'market',
        coinBalance: 0, // Not needed for sell orders
        availableShares: position.quantity
      };

      const validationResult = await this.validateOrder(validationRequest);
      
      if (!validationResult.isValid) {
        throw new Error(`Position close validation failed: ${validationResult.errors[0]?.message}`);
      }

      // Execute the close order
      const result = await this.executeOrder({
        orderRequest,
        validationResult
      });

      return result;
    } catch (error) {
      console.error('Failed to close position:', error);
      return {
        tradeId: `failed_${Date.now()}`,
        status: 'FAILED',
        executedQuantity: 0,
        executedPrice: 0,
        coinAmount: 0,
        fees: 0,
        message: error instanceof Error ? error.message : 'Failed to close position',
        timestamp: new Date()
      };
    }
  }

  /**
   * Calculate P&L for a position
   */
  calculatePositionPnL(position: Portfolio): {
    pnl: number;
    pnlPercent: number;
    coinPnL: number;
    coinPnLPercent: number;
    currentCoinValue: number;
  } {
    const currentValue = position.quantity * position.currentPrice;
    const investedValue = position.quantity * position.avgPrice;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    
    // Calculate coin-based metrics
    const currentCoinValue = this.rupeesToCoins(currentValue);
    const coinPnL = currentCoinValue - position.coinInvested;
    const coinPnLPercent = position.coinInvested > 0 ? (coinPnL / position.coinInvested) * 100 : 0;

    return { pnl, pnlPercent, coinPnL, coinPnLPercent, currentCoinValue };
  }

  /**
   * Get market status for trading
   */
  async getMarketStatus(): Promise<{
    isOpen: boolean;
    nextOpenTime?: Date;
    nextCloseTime?: Date;
    currentTime: Date;
  }> {
    try {
      // This could call the backend for real market status
      // For now, we'll use the local validation
      const { isMarketOpen, getNextMarketOpen } = await import('@/shared/utils/orderValidation');
      
      const isOpen = isMarketOpen();
      const currentTime = new Date();
      
      return {
        isOpen,
        nextOpenTime: isOpen ? undefined : getNextMarketOpen(),
        currentTime
      };
    } catch (error) {
      console.error('Failed to get market status:', error);
      return {
        isOpen: false,
        currentTime: new Date()
      };
    }
  }

  /**
   * Estimate trading fees
   */
  estimateFees(totalAmount: number): number {
    // 0.1% trading fee
    return Math.round(totalAmount * 0.001);
  }

  /**
   * Get coin to rupee conversion rate
   */
  getCoinToRupeeRate(): number {
    // Currently 1:1 ratio
    return 1;
  }

  /**
   * Convert rupees to coins
   */
  rupeesToCoins(rupees: number): number {
    return Math.ceil(rupees * this.getCoinToRupeeRate());
  }

  /**
   * Convert coins to rupees
   */
  coinsToRupees(coins: number): number {
    return coins / this.getCoinToRupeeRate();
  }
}

// Export singleton instance
export const tradingService = new TradingService();
export default tradingService;