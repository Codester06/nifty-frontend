import { Portfolio, PortfolioStock, PortfolioOption } from '../../features/trading/types';

export class PortfolioCalculations {
  // Coin to Rupee conversion rate (1:1 for now)
  private static readonly COIN_TO_RUPEE_RATE = 1;
  /**
   * Calculate total portfolio value including stocks and options
   */
  static calculateTotalPortfolioValue(portfolio: Portfolio): number {
    const stocksValue = this.calculateStocksValue(portfolio.stocks);
    const optionsValue = this.calculateOptionsValue(portfolio.options);
    return stocksValue + optionsValue;
  }

  /**
   * Calculate total stocks value
   */
  static calculateStocksValue(stocks: PortfolioStock[]): number {
    return stocks.reduce((total, stock) => {
      return total + (stock.currentPrice * stock.quantity);
    }, 0);
  }

  /**
   * Calculate total options value
   */
  static calculateOptionsValue(options: PortfolioOption[]): number {
    return options.reduce((total, option) => {
      if (option.status === 'CLOSED') return total;
      return total + (option.currentPrice * option.quantity * option.lotSize);
    }, 0);
  }

  /**
   * Calculate total coins invested in stocks
   */
  static calculateStocksCoinsInvested(stocks: PortfolioStock[]): number {
    return stocks.reduce((total, stock) => {
      return total + stock.coinInvested;
    }, 0);
  }

  /**
   * Calculate total coins invested in options
   */
  static calculateOptionsCoinsInvested(options: PortfolioOption[]): number {
    return options.reduce((total, option) => {
      if (option.status === 'CLOSED') return total;
      return total + option.coinInvested;
    }, 0);
  }

  /**
   * Calculate current coin value of stocks
   */
  static calculateStocksCoinValue(stocks: PortfolioStock[]): number {
    return stocks.reduce((total, stock) => {
      return total + stock.currentCoinValue;
    }, 0);
  }

  /**
   * Calculate current coin value of options
   */
  static calculateOptionsCoinValue(options: PortfolioOption[]): number {
    return options.reduce((total, option) => {
      if (option.status === 'CLOSED') return total;
      return total + option.currentCoinValue;
    }, 0);
  }

  /**
   * Calculate total coin P&L for stocks
   */
  static calculateStocksCoinPnL(stocks: PortfolioStock[]): number {
    return stocks.reduce((total, stock) => {
      return total + stock.coinPnL;
    }, 0);
  }

  /**
   * Calculate total coin P&L for options
   */
  static calculateOptionsCoinPnL(options: PortfolioOption[]): number {
    return options.reduce((total, option) => {
      if (option.status === 'CLOSED') return total;
      return total + option.coinPnL;
    }, 0);
  }

  /**
   * Calculate total P&L for stocks
   */
  static calculateStocksGainLoss(stocks: PortfolioStock[]): number {
    return stocks.reduce((total, stock) => {
      const currentValue = stock.currentPrice * stock.quantity;
      const investedValue = stock.averagePrice * stock.quantity;
      return total + (currentValue - investedValue);
    }, 0);
  }

  /**
   * Calculate total P&L for options
   */
  static calculateOptionsGainLoss(options: PortfolioOption[]): number {
    return options.reduce((total, option) => {
      if (option.status === 'CLOSED') return total;
      const currentValue = option.currentPrice * option.quantity * option.lotSize;
      const investedValue = option.averagePrice * option.quantity * option.lotSize;
      return total + (currentValue - investedValue);
    }, 0);
  }

  /**
   * Calculate individual option P&L
   */
  static calculateOptionPnL(option: PortfolioOption): { pnl: number; pnlPercent: number } {
    const currentValue = option.currentPrice * option.quantity * option.lotSize;
    const investedValue = option.averagePrice * option.quantity * option.lotSize;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    
    return { pnl, pnlPercent };
  }

  /**
   * Calculate individual stock coin P&L
   */
  static calculateStockCoinPnL(stock: PortfolioStock): { 
    coinPnL: number; 
    coinPnLPercent: number;
    currentCoinValue: number;
  } {
    const currentCoinValue = this.rupeesToCoins(stock.currentPrice * stock.quantity);
    const coinPnL = currentCoinValue - stock.coinInvested;
    const coinPnLPercent = stock.coinInvested > 0 ? (coinPnL / stock.coinInvested) * 100 : 0;
    
    return { coinPnL, coinPnLPercent, currentCoinValue };
  }

  /**
   * Calculate individual option coin P&L
   */
  static calculateOptionCoinPnL(option: PortfolioOption): { 
    coinPnL: number; 
    coinPnLPercent: number;
    currentCoinValue: number;
  } {
    const currentRupeeValue = option.currentPrice * option.quantity * option.lotSize;
    const currentCoinValue = this.rupeesToCoins(currentRupeeValue);
    const coinPnL = currentCoinValue - option.coinInvested;
    const coinPnLPercent = option.coinInvested > 0 ? (coinPnL / option.coinInvested) * 100 : 0;
    
    return { coinPnL, coinPnLPercent, currentCoinValue };
  }

  /**
   * Update portfolio with latest calculations
   */
  static updatePortfolioCalculations(portfolio: Portfolio): Portfolio {
    const stocksValue = this.calculateStocksValue(portfolio.stocks);
    const optionsValue = this.calculateOptionsValue(portfolio.options);
    const stocksGainLoss = this.calculateStocksGainLoss(portfolio.stocks);
    const optionsGainLoss = this.calculateOptionsGainLoss(portfolio.options);
    const totalValue = stocksValue + optionsValue;
    const totalGainLoss = stocksGainLoss + optionsGainLoss;
    const totalInvested = this.calculateTotalInvested(portfolio);
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Update individual stock coin calculations
    const updatedStocks = portfolio.stocks.map(stock => {
      const { coinPnL, coinPnLPercent, currentCoinValue } = this.calculateStockCoinPnL(stock);
      return {
        ...stock,
        coinPnL,
        coinPnLPercent,
        currentCoinValue
      };
    });

    // Update individual option P&L and coin calculations
    const updatedOptions = portfolio.options.map(option => {
      const { pnl, pnlPercent } = this.calculateOptionPnL(option);
      const { coinPnL, coinPnLPercent, currentCoinValue } = this.calculateOptionCoinPnL(option);
      return {
        ...option,
        gainLoss: pnl,
        gainLossPercent: pnlPercent,
        totalValue: option.currentPrice * option.quantity * option.lotSize,
        investedValue: option.averagePrice * option.quantity * option.lotSize,
        coinPnL,
        coinPnLPercent,
        currentCoinValue
      };
    });

    // Calculate coin-based metrics
    const totalCoinsInvested = this.calculateStocksCoinsInvested(updatedStocks) + 
                              this.calculateOptionsCoinsInvested(updatedOptions);
    const stocksCoinValue = this.calculateStocksCoinValue(updatedStocks);
    const optionsCoinValue = this.calculateOptionsCoinValue(updatedOptions);
    const totalCoinValue = stocksCoinValue + optionsCoinValue;
    const stocksCoinPnL = this.calculateStocksCoinPnL(updatedStocks);
    const optionsCoinPnL = this.calculateOptionsCoinPnL(updatedOptions);
    const totalCoinPnL = stocksCoinPnL + optionsCoinPnL;
    const totalCoinPnLPercent = totalCoinsInvested > 0 ? (totalCoinPnL / totalCoinsInvested) * 100 : 0;

    return {
      ...portfolio,
      stocks: updatedStocks,
      options: updatedOptions,
      totalValue,
      totalGainLoss,
      totalGainLossPercent,
      stocksValue,
      optionsValue,
      stocksGainLoss,
      optionsGainLoss,
      // Coin-based metrics
      totalCoinsInvested,
      totalCoinValue,
      totalCoinPnL,
      totalCoinPnLPercent,
      stocksCoinValue,
      optionsCoinValue,
      stocksCoinPnL,
      optionsCoinPnL
    };
  }

  /**
   * Calculate total invested amount
   */
  private static calculateTotalInvested(portfolio: Portfolio): number {
    const stocksInvested = portfolio.stocks.reduce((total, stock) => {
      return total + (stock.averagePrice * stock.quantity);
    }, 0);

    const optionsInvested = portfolio.options.reduce((total, option) => {
      if (option.status === 'CLOSED') return total;
      return total + (option.averagePrice * option.quantity * option.lotSize);
    }, 0);

    return stocksInvested + optionsInvested;
  }

  /**
   * Convert OptionsPosition to PortfolioOption
   */
  static convertOptionsPositionToPortfolioOption(position: any): PortfolioOption {
    const lotSize = position.lotSize || 50;
    const investedValue = position.avgPrice * position.quantity * lotSize;
    const coinInvested = this.rupeesToCoins(investedValue);
    
    const { pnl, pnlPercent } = this.calculateOptionPnL({
      ...position,
      quantity: position.quantity,
      averagePrice: position.avgPrice,
      currentPrice: position.currentPrice,
      lotSize
    } as PortfolioOption);

    const { coinPnL, coinPnLPercent, currentCoinValue } = this.calculateOptionCoinPnL({
      ...position,
      quantity: position.quantity,
      averagePrice: position.avgPrice,
      currentPrice: position.currentPrice,
      lotSize,
      coinInvested
    } as PortfolioOption);

    return {
      id: position.id,
      symbol: position.symbol,
      underlying: position.symbol.split(/\d/)[0], // Extract underlying from symbol
      strike: position.strike,
      expiry: position.expiry,
      optionType: position.optionType,
      quantity: position.quantity,
      averagePrice: position.avgPrice,
      currentPrice: position.currentPrice,
      lotSize,
      totalValue: position.currentPrice * position.quantity * lotSize,
      investedValue,
      gainLoss: pnl,
      gainLossPercent: pnlPercent,
      entryDate: position.entryDate,
      status: position.status,
      greeks: position.greeks,
      // Coin-based tracking
      coinInvested,
      currentCoinValue,
      coinPnL,
      coinPnLPercent
    };
  }

  /**
   * Convert rupees to coins
   */
  static rupeesToCoins(rupees: number): number {
    return Math.ceil(rupees * this.COIN_TO_RUPEE_RATE);
  }

  /**
   * Convert coins to rupees
   */
  static coinsToRupees(coins: number): number {
    return coins / this.COIN_TO_RUPEE_RATE;
  }

  /**
   * Create a new portfolio stock with coin tracking
   */
  static createPortfolioStock(
    symbol: string,
    quantity: number,
    averagePrice: number,
    currentPrice: number,
    entryDate: Date
  ): PortfolioStock {
    const investedValue = averagePrice * quantity;
    const coinInvested = this.rupeesToCoins(investedValue);
    const { coinPnL, coinPnLPercent, currentCoinValue } = this.calculateStockCoinPnL({
      symbol,
      quantity,
      averagePrice,
      currentPrice,
      coinInvested,
      entryDate
    } as PortfolioStock);

    const currentValue = currentPrice * quantity;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

    return {
      symbol,
      quantity,
      averagePrice,
      currentPrice,
      gainLoss,
      gainLossPercent,
      coinInvested,
      currentCoinValue,
      coinPnL,
      coinPnLPercent,
      entryDate
    };
  }

  /**
   * Create a new portfolio option with coin tracking
   */
  static createPortfolioOption(
    id: string,
    symbol: string,
    underlying: string,
    strike: number,
    expiry: string,
    optionType: 'CE' | 'PE',
    quantity: number,
    averagePrice: number,
    currentPrice: number,
    lotSize: number,
    entryDate: string,
    status: 'OPEN' | 'CLOSED' = 'OPEN',
    greeks?: any
  ): PortfolioOption {
    const investedValue = averagePrice * quantity * lotSize;
    const coinInvested = this.rupeesToCoins(investedValue);
    
    const { pnl, pnlPercent } = this.calculateOptionPnL({
      quantity,
      averagePrice,
      currentPrice,
      lotSize
    } as PortfolioOption);

    const { coinPnL, coinPnLPercent, currentCoinValue } = this.calculateOptionCoinPnL({
      quantity,
      averagePrice,
      currentPrice,
      lotSize,
      coinInvested
    } as PortfolioOption);

    return {
      id,
      symbol,
      underlying,
      strike,
      expiry,
      optionType,
      quantity,
      averagePrice,
      currentPrice,
      lotSize,
      totalValue: currentPrice * quantity * lotSize,
      investedValue,
      gainLoss: pnl,
      gainLossPercent: pnlPercent,
      entryDate,
      status,
      greeks,
      coinInvested,
      currentCoinValue,
      coinPnL,
      coinPnLPercent
    };
  }
}