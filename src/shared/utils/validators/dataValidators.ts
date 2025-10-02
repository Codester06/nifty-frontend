/**
 * Data validation utilities for API responses and data models
 */

export interface DataValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  sanitizedData?: T;
}

/**
 * Validate and sanitize market data
 */
export class DataValidators {
  /**
   * Validate stock price data
   */
  static validateStockPrice(data: any): DataValidationResult<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    timestamp: Date;
  }> {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
      return { isValid: false, errors };
    }

    // Validate symbol
    if (!data.symbol || typeof data.symbol !== 'string') {
      errors.push('Invalid or missing symbol');
    }

    // Validate price
    if (typeof data.price !== 'number' || data.price < 0) {
      errors.push('Invalid price value');
    }

    // Validate change
    if (typeof data.change !== 'number') {
      errors.push('Invalid change value');
    }

    // Validate change percent
    if (typeof data.changePercent !== 'number') {
      errors.push('Invalid change percent value');
    }

    // Validate volume
    if (typeof data.volume !== 'number' || data.volume < 0) {
      errors.push('Invalid volume value');
    }

    // Validate timestamp
    let timestamp: Date;
    if (data.timestamp) {
      timestamp = new Date(data.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('Invalid timestamp format');
      }
    } else {
      timestamp = new Date();
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedData = {
      symbol: data.symbol.toUpperCase().trim(),
      price: Number(data.price.toFixed(2)),
      change: Number(data.change.toFixed(2)),
      changePercent: Number(data.changePercent.toFixed(2)),
      volume: Math.floor(data.volume),
      timestamp: timestamp!,
    };

    return {
      isValid: true,
      data: sanitizedData,
      sanitizedData,
      errors: [],
    };
  }

  /**
   * Validate option chain data
   */
  static validateOptionChain(data: any): DataValidationResult<{
    underlying: string;
    spotPrice: number;
    expiry: string;
    options: Record<string, any>;
    lastUpdated: string;
  }> {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid option chain data format');
      return { isValid: false, errors };
    }

    // Validate underlying
    if (!data.underlying || typeof data.underlying !== 'string') {
      errors.push('Invalid or missing underlying symbol');
    }

    // Validate spot price
    if (typeof data.spotPrice !== 'number' || data.spotPrice <= 0) {
      errors.push('Invalid spot price');
    }

    // Validate expiry
    if (!data.expiry || typeof data.expiry !== 'string') {
      errors.push('Invalid or missing expiry date');
    } else {
      const expiryDate = new Date(data.expiry);
      if (isNaN(expiryDate.getTime())) {
        errors.push('Invalid expiry date format');
      }
    }

    // Validate options object
    if (!data.options || typeof data.options !== 'object') {
      errors.push('Invalid or missing options data');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedData = {
      underlying: data.underlying.toUpperCase().trim(),
      spotPrice: Number(data.spotPrice.toFixed(2)),
      expiry: data.expiry,
      options: data.options,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };

    return {
      isValid: true,
      data: sanitizedData,
      sanitizedData,
      errors: [],
    };
  }

  /**
   * Validate option contract data
   */
  static validateOptionContract(data: any): DataValidationResult<{
    strike: number;
    optionType: 'CE' | 'PE';
    bid: number;
    ask: number;
    lastPrice: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  }> {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid option contract data');
      return { isValid: false, errors };
    }

    // Validate strike
    if (typeof data.strike !== 'number' || data.strike <= 0) {
      errors.push('Invalid strike price');
    }

    // Validate option type
    if (!['CE', 'PE'].includes(data.optionType)) {
      errors.push('Invalid option type');
    }

    // Validate prices
    const priceFields = ['bid', 'ask', 'lastPrice'];
    priceFields.forEach(field => {
      if (typeof data[field] !== 'number' || data[field] < 0) {
        errors.push(`Invalid ${field} value`);
      }
    });

    // Validate volume and open interest
    if (typeof data.volume !== 'number' || data.volume < 0) {
      errors.push('Invalid volume value');
    }

    if (typeof data.openInterest !== 'number' || data.openInterest < 0) {
      errors.push('Invalid open interest value');
    }

    // Validate Greeks (optional but should be numbers if present)
    const greeks = ['impliedVolatility', 'delta', 'gamma', 'theta', 'vega'];
    greeks.forEach(greek => {
      if (data[greek] !== undefined && typeof data[greek] !== 'number') {
        errors.push(`Invalid ${greek} value`);
      }
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedData = {
      strike: Number(data.strike.toFixed(2)),
      optionType: data.optionType as 'CE' | 'PE',
      bid: Number(data.bid.toFixed(2)),
      ask: Number(data.ask.toFixed(2)),
      lastPrice: Number(data.lastPrice.toFixed(2)),
      volume: Math.floor(data.volume),
      openInterest: Math.floor(data.openInterest),
      impliedVolatility: data.impliedVolatility ? Number(data.impliedVolatility.toFixed(4)) : 0,
      delta: data.delta ? Number(data.delta.toFixed(4)) : 0,
      gamma: data.gamma ? Number(data.gamma.toFixed(4)) : 0,
      theta: data.theta ? Number(data.theta.toFixed(4)) : 0,
      vega: data.vega ? Number(data.vega.toFixed(4)) : 0,
    };

    return {
      isValid: true,
      data: sanitizedData,
      sanitizedData,
      errors: [],
    };
  }

  /**
   * Validate user data
   */
  static validateUserData(data: any): DataValidationResult<{
    id: string;
    mobile?: string;
    email?: string;
    username?: string;
    coinBalance: number;
    role: string;
  }> {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid user data format');
      return { isValid: false, errors };
    }

    // Validate ID
    if (!data.id || typeof data.id !== 'string') {
      errors.push('Invalid or missing user ID');
    }

    // Validate mobile (optional)
    if (data.mobile && (typeof data.mobile !== 'string' || !/^[6-9]\d{9}$/.test(data.mobile))) {
      errors.push('Invalid mobile number format');
    }

    // Validate email (optional)
    if (data.email && (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
      errors.push('Invalid email format');
    }

    // Validate coin balance
    if (typeof data.coinBalance !== 'number' || data.coinBalance < 0) {
      errors.push('Invalid coin balance');
    }

    // Validate role
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!data.role || !validRoles.includes(data.role)) {
      errors.push('Invalid user role');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedData = {
      id: data.id.trim(),
      mobile: data.mobile?.trim(),
      email: data.email?.toLowerCase().trim(),
      username: data.username?.trim(),
      coinBalance: Number(data.coinBalance.toFixed(2)),
      role: data.role,
    };

    return {
      isValid: true,
      data: sanitizedData,
      sanitizedData,
      errors: [],
    };
  }

  /**
   * Validate trade data
   */
  static validateTradeData(data: any): DataValidationResult<{
    id: string;
    userId: string;
    symbol: string;
    instrumentType: 'stock' | 'option';
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    coinAmount: number;
    status: string;
    timestamp: Date;
  }> {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid trade data format');
      return { isValid: false, errors };
    }

    // Validate IDs
    if (!data.id || typeof data.id !== 'string') {
      errors.push('Invalid trade ID');
    }

    if (!data.userId || typeof data.userId !== 'string') {
      errors.push('Invalid user ID');
    }

    // Validate symbol
    if (!data.symbol || typeof data.symbol !== 'string') {
      errors.push('Invalid symbol');
    }

    // Validate instrument type
    if (!['stock', 'option'].includes(data.instrumentType)) {
      errors.push('Invalid instrument type');
    }

    // Validate action
    if (!['BUY', 'SELL'].includes(data.action)) {
      errors.push('Invalid trade action');
    }

    // Validate quantity
    if (typeof data.quantity !== 'number' || data.quantity <= 0) {
      errors.push('Invalid quantity');
    }

    // Validate price
    if (typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Invalid price');
    }

    // Validate coin amount
    if (typeof data.coinAmount !== 'number' || data.coinAmount <= 0) {
      errors.push('Invalid coin amount');
    }

    // Validate status
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'];
    if (!validStatuses.includes(data.status)) {
      errors.push('Invalid trade status');
    }

    // Validate timestamp
    let timestamp: Date;
    if (data.timestamp) {
      timestamp = new Date(data.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('Invalid timestamp format');
      }
    } else {
      timestamp = new Date();
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedData = {
      id: data.id.trim(),
      userId: data.userId.trim(),
      symbol: data.symbol.toUpperCase().trim(),
      instrumentType: data.instrumentType as 'stock' | 'option',
      action: data.action as 'BUY' | 'SELL',
      quantity: Math.floor(data.quantity),
      price: Number(data.price.toFixed(2)),
      coinAmount: Number(data.coinAmount.toFixed(2)),
      status: data.status,
      timestamp: timestamp!,
    };

    return {
      isValid: true,
      data: sanitizedData,
      sanitizedData,
      errors: [],
    };
  }

  /**
   * Validate portfolio data
   */
  static validatePortfolioData(data: any): DataValidationResult<{
    id: string;
    userId: string;
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    coinInvested: number;
    pnl: number;
    pnlPercent: number;
  }> {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid portfolio data format');
      return { isValid: false, errors };
    }

    // Validate required fields
    const requiredFields = ['id', 'userId', 'symbol', 'quantity', 'avgPrice', 'currentPrice', 'coinInvested'];
    requiredFields.forEach(field => {
      if (data[field] === undefined || data[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate numeric fields
    const numericFields = ['quantity', 'avgPrice', 'currentPrice', 'coinInvested', 'pnl', 'pnlPercent'];
    numericFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] !== 'number') {
        errors.push(`Invalid ${field}: must be a number`);
      }
    });

    // Validate positive values
    if (data.quantity !== undefined && data.quantity <= 0) {
      errors.push('Quantity must be positive');
    }

    if (data.avgPrice !== undefined && data.avgPrice <= 0) {
      errors.push('Average price must be positive');
    }

    if (data.currentPrice !== undefined && data.currentPrice < 0) {
      errors.push('Current price cannot be negative');
    }

    if (data.coinInvested !== undefined && data.coinInvested <= 0) {
      errors.push('Coin invested must be positive');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Calculate P&L if not provided
    const currentValue = data.quantity * data.currentPrice;
    const pnl = data.pnl !== undefined ? data.pnl : currentValue - data.coinInvested;
    const pnlPercent = data.pnlPercent !== undefined ? data.pnlPercent : (pnl / data.coinInvested) * 100;

    const sanitizedData = {
      id: data.id.trim(),
      userId: data.userId.trim(),
      symbol: data.symbol.toUpperCase().trim(),
      quantity: Math.floor(data.quantity),
      avgPrice: Number(data.avgPrice.toFixed(2)),
      currentPrice: Number(data.currentPrice.toFixed(2)),
      coinInvested: Number(data.coinInvested.toFixed(2)),
      pnl: Number(pnl.toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
    };

    return {
      isValid: true,
      data: sanitizedData,
      sanitizedData,
      errors: [],
    };
  }

  /**
   * Generic array validation
   */
  static validateArray<T>(
    data: any,
    itemValidator: (item: any) => DataValidationResult<T>
  ): DataValidationResult<T[]> {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return { isValid: false, errors };
    }

    const validatedItems: T[] = [];
    const allErrors: string[] = [];

    data.forEach((item, index) => {
      const validation = itemValidator(item);
      if (validation.isValid && validation.data) {
        validatedItems.push(validation.data);
      } else {
        allErrors.push(`Item ${index}: ${validation.errors.join(', ')}`);
      }
    });

    if (allErrors.length > 0) {
      return { isValid: false, errors: allErrors };
    }

    return {
      isValid: true,
      data: validatedItems,
      sanitizedData: validatedItems,
      errors: [],
    };
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: any, maxLength: number = 255): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
      .trim()
      .substring(0, maxLength);
  }

  /**
   * Validate and sanitize numeric input
   */
  static sanitizeNumber(input: any, min?: number, max?: number): number | null {
    const num = Number(input);
    
    if (isNaN(num)) {
      return null;
    }

    if (min !== undefined && num < min) {
      return min;
    }

    if (max !== undefined && num > max) {
      return max;
    }

    return num;
  }
}