import type {
  Trade,
  OrderRequest,
  TradeExecutionRequest,
  PortfolioSummary,
  Position,
  Portfolio
} from '../types';

interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface ExecutionResult {
  status: 'SUCCESS' | 'FAILED';
  message?: string;
}

interface TradeResult {
  success: boolean;
  message?: string;
}

class TradingService {
  public getToken(): string | null {
    return localStorage.getItem('nifty-bulk-token');
  }

  async buyStock(trade: Trade): Promise<TradeResult> {
    const token = this.getToken();
    if (!token) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch('/api/trading/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset: trade.symbol,
          quantity: trade.quantity,
          price: trade.price,
          amount: trade.total,
          instrumentType: 'stock'
        })
      });

      const data = await response.json();
      return {
        success: data.success,
        message: data.success ? 'Stock bought successfully' : data.error?.message
      };
    } catch (error) {
      console.error('Error buying stock:', error);
      return { success: false, message: 'Failed to buy stock' };
    }
  }

  async sellStock(trade: Trade): Promise<TradeResult> {
    const token = this.getToken();
    if (!token) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch('/api/trading/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset: trade.symbol,
          quantity: trade.quantity,
          price: trade.price,
          amount: trade.total,
          instrumentType: 'stock'
        })
      });

      const data = await response.json();
      return {
        success: data.success,
        message: data.success ? 'Stock sold successfully' : data.error?.message
      };
    } catch (error) {
      console.error('Error selling stock:', error);
      return { success: false, message: 'Failed to sell stock' };
    }
  }

  async createTrade(tradeData: Trade): Promise<TradeResult> {
    // Use buy or sell based on type
    if (tradeData.type === 'buy') {
      return this.buyStock(tradeData);
    } else {
      return this.sellStock(tradeData);
    }
  }

  async getPortfolioSummary(userId: string, portfolioData: Portfolio): Promise<PortfolioSummary> {
    // Calculate from portfolio data
    const positions: Position[] = [];

    if (portfolioData.stocks) {
      portfolioData.stocks.forEach(stock => {
        positions.push({
          symbol: stock.symbol,
          quantity: stock.quantity,
          averagePrice: stock.averagePrice,
          currentPrice: stock.currentCoinValue / stock.quantity, // Approximate
          pnl: stock.coinPnL,
          pnlPercentage: stock.coinPnLPercent
        });
      });
    }

    return {
      totalValue: portfolioData.totalCoinValue || 0,
      totalPnL: portfolioData.totalCoinPnL || 0,
      totalPnLPercentage: portfolioData.totalCoinPnLPercent || 0,
      positions
    };
  }

  async validateOrder(request: OrderRequest): Promise<ValidationResult> {
    const token = this.getToken();
    if (!token) return { valid: false, message: 'Not authenticated' };

    try {
      const response = await fetch('/api/trading/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: request.type.toUpperCase(),
          asset: request.symbol,
          quantity: request.quantity,
          price: request.price,
          amount: request.quantity * request.price,
          instrumentType: 'stock'
        })
      });

      const data = await response.json();
      return {
        valid: data.success,
        message: data.success ? 'Order is valid' : data.error?.message
      };
    } catch (error) {
      console.error('Error validating order:', error);
      return { valid: false, message: 'Failed to validate order' };
    }
  }

  async executeOrder(executionRequest: TradeExecutionRequest): Promise<ExecutionResult> {
    const token = this.getToken();
    if (!token) return { status: 'FAILED', message: 'Not authenticated' };

    try {
      const endpoint = executionRequest.type === 'buy' ? '/api/trading/buy' : '/api/trading/sell';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset: executionRequest.symbol,
          quantity: executionRequest.quantity,
          price: executionRequest.price,
          amount: executionRequest.quantity * executionRequest.price,
          instrumentType: 'stock'
        })
      });

      const data = await response.json();
      return {
        status: data.success ? 'SUCCESS' : 'FAILED',
        message: data.success ? 'Order executed successfully' : data.error?.message
      };
    } catch (error) {
      console.error('Error executing order:', error);
      return { status: 'FAILED', message: 'Failed to execute order' };
    }
  }

  calculatePositionPnL(position: Position): number {
    return position.currentPrice * position.quantity - position.averagePrice * position.quantity;
  }

  async closePosition(userId: string, position: Position): Promise<TradeResult> {
    // For stocks, sell the entire position
    const token = this.getToken();
    if (!token) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch('/api/trading/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset: position.symbol,
          quantity: position.quantity,
          price: position.currentPrice,
          amount: position.quantity * position.currentPrice,
          instrumentType: 'stock'
        })
      });

      const data = await response.json();
      return {
        success: data.success,
        message: data.success ? 'Position closed successfully' : data.error?.message
      };
    } catch (error) {
      console.error('Error closing position:', error);
      return { success: false, message: 'Failed to close position' };
    }
  }

  estimateFees(amount: number): number {
    return amount * 0.001; // 0.1%
  }

  coinsToRupees(coins: number): number {
    return coins; // 1:1 ratio
  }

  rupeesToCoins(rupees: number): number {
    return Math.ceil(rupees); // Round up
  }

  getCoinToRupeeRate(): number {
    return 1;
  }

  async getMarketStatus(): Promise<{ open: boolean }> {
    try {
      const response = await fetch('/api/options/market/status');
      const data = await response.json();
      return { open: data.success ? data.data.isOpen : true };
    } catch (error) {
      console.error('Error checking market status:', error);
      return { open: true }; // Default to open if API fails
    }
  }
}

export const tradingService = new TradingService();
export const getToken = () => tradingService.getToken();
export default tradingService;
