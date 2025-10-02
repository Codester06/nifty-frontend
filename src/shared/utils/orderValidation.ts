import { OptionContract, Stock } from '@/shared/types';

// Market hours configuration (IST)
export const MARKET_HOURS = {
  OPEN_HOUR: 9,
  OPEN_MINUTE: 15,
  CLOSE_HOUR: 15,
  CLOSE_MINUTE: 30,
  TIMEZONE: 'Asia/Kolkata'
} as const;

// Trading constants
export const TRADING_CONSTANTS = {
  MIN_TICK_SIZE: 0.05, // ₹0.05 minimum tick size
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10000,
  MIN_OPTION_LOTS: 1,
  MAX_OPTION_LOTS: 500
} as const;

export interface OrderValidationRequest {
  type: 'buy' | 'sell';
  instrumentType: 'stock' | 'option';
  quantity: number;
  price: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
  coinBalance: number; // Actually wallet balance
  stock?: Stock;
  optionContract?: OptionContract;
  availableShares?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  coinCost: number;
  totalAmount: number;
  canAfford: boolean;
}

class OrderValidator {
  /**
   * Check if market is currently open
   */
  isMarketOpen(currentTime: Date = new Date()): boolean {
    // Convert to IST
    const istTime = new Date(currentTime.toLocaleString("en-US", { timeZone: MARKET_HOURS.TIMEZONE }));
    const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Market closed on weekends
    if (day === 0 || day === 6) {
      return false;
    }
    
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    const openMinutes = MARKET_HOURS.OPEN_HOUR * 60 + MARKET_HOURS.OPEN_MINUTE;
    const closeMinutes = MARKET_HOURS.CLOSE_HOUR * 60 + MARKET_HOURS.CLOSE_MINUTE;
    
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  /**
   * Get next market open time
   */
  getNextMarketOpen(currentTime: Date = new Date()): Date {
    const istTime = new Date(currentTime.toLocaleString("en-US", { timeZone: MARKET_HOURS.TIMEZONE }));
    const nextOpen = new Date(istTime);
    
    // If it's weekend, move to Monday
    const day = istTime.getDay();
    if (day === 0) { // Sunday
      nextOpen.setDate(nextOpen.getDate() + 1);
    } else if (day === 6) { // Saturday
      nextOpen.setDate(nextOpen.getDate() + 2);
    } else if (!this.isMarketOpen(currentTime)) {
      // If market is closed on weekday, check if we need to move to next day
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;
      const closeMinutes = MARKET_HOURS.CLOSE_HOUR * 60 + MARKET_HOURS.CLOSE_MINUTE;
      
      if (currentMinutes > closeMinutes) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
    }
    
    nextOpen.setHours(MARKET_HOURS.OPEN_HOUR, MARKET_HOURS.OPEN_MINUTE, 0, 0);
    return nextOpen;
  }

  /**
   * Validate price tick size
   */
  validateTickSize(price: number): boolean {
    const remainder = price % TRADING_CONSTANTS.MIN_TICK_SIZE;
    return Math.abs(remainder) < 0.001 || Math.abs(remainder - TRADING_CONSTANTS.MIN_TICK_SIZE) < 0.001;
  }

  /**
   * Round price to nearest valid tick
   */
  roundToTickSize(price: number): number {
    return Math.round(price / TRADING_CONSTANTS.MIN_TICK_SIZE) * TRADING_CONSTANTS.MIN_TICK_SIZE;
  }

  /**
   * Validate stock order
   */
  private validateStockOrder(request: OrderValidationRequest): ValidationError[] {
    const errors: ValidationError[] = [];
    const { quantity, price, type, stock, availableShares = 0 } = request;

    // Validate quantity
    if (quantity < TRADING_CONSTANTS.MIN_QUANTITY) {
      errors.push({
        field: 'quantity',
        message: `Minimum quantity is ${TRADING_CONSTANTS.MIN_QUANTITY}`,
        code: 'MIN_QUANTITY_ERROR'
      });
    }

    if (quantity > TRADING_CONSTANTS.MAX_QUANTITY) {
      errors.push({
        field: 'quantity',
        message: `Maximum quantity is ${TRADING_CONSTANTS.MAX_QUANTITY}`,
        code: 'MAX_QUANTITY_ERROR'
      });
    }

    // Validate sell quantity against available shares
    if (type === 'sell' && quantity > availableShares) {
      errors.push({
        field: 'quantity',
        message: `Insufficient shares. Available: ${availableShares}`,
        code: 'INSUFFICIENT_SHARES'
      });
    }

    // Validate price tick size
    if (!this.validateTickSize(price)) {
      errors.push({
        field: 'price',
        message: `Price must be in multiples of ₹${TRADING_CONSTANTS.MIN_TICK_SIZE}`,
        code: 'INVALID_TICK_SIZE'
      });
    }

    // Validate stock exists
    if (!stock) {
      errors.push({
        field: 'stock',
        message: 'Stock information is required',
        code: 'MISSING_STOCK_INFO'
      });
    }

    return errors;
  }

  /**
   * Validate option order
   */
  private validateOptionOrder(request: OrderValidationRequest): ValidationError[] {
    const errors: ValidationError[] = [];
    const { quantity, price, optionContract } = request;

    // Validate lot quantity
    if (quantity < TRADING_CONSTANTS.MIN_OPTION_LOTS) {
      errors.push({
        field: 'quantity',
        message: `Minimum lot quantity is ${TRADING_CONSTANTS.MIN_OPTION_LOTS}`,
        code: 'MIN_LOT_ERROR'
      });
    }

    if (quantity > TRADING_CONSTANTS.MAX_OPTION_LOTS) {
      errors.push({
        field: 'quantity',
        message: `Maximum lot quantity is ${TRADING_CONSTANTS.MAX_OPTION_LOTS}`,
        code: 'MAX_LOT_ERROR'
      });
    }

    // Validate quantity is whole number (lots)
    if (!Number.isInteger(quantity)) {
      errors.push({
        field: 'quantity',
        message: 'Option quantity must be in whole lots',
        code: 'INVALID_LOT_QUANTITY'
      });
    }

    // Validate price tick size
    if (!this.validateTickSize(price)) {
      errors.push({
        field: 'price',
        message: `Price must be in multiples of ₹${TRADING_CONSTANTS.MIN_TICK_SIZE}`,
        code: 'INVALID_TICK_SIZE'
      });
    }

    // Validate option contract exists
    if (!optionContract) {
      errors.push({
        field: 'optionContract',
        message: 'Option contract information is required',
        code: 'MISSING_OPTION_INFO'
      });
    } else {
      // Check if option is expired
      const expiryDate = new Date(optionContract.expiry);
      const currentDate = new Date();
      
      if (expiryDate < currentDate) {
        errors.push({
          field: 'optionContract',
          message: 'Option contract has expired',
          code: 'EXPIRED_OPTION'
        });
      }

      // Validate lot size
      if (optionContract.lotSize <= 0) {
        errors.push({
          field: 'optionContract',
          message: 'Invalid lot size in option contract',
          code: 'INVALID_LOT_SIZE'
        });
      }
    }

    return errors;
  }

  /**
   * Validate limit order price
   */
  private validateLimitPrice(request: OrderValidationRequest): ValidationError[] {
    const errors: ValidationError[] = [];
    const { orderType, limitPrice, price, type } = request;

    if (orderType === 'limit') {
      if (!limitPrice || limitPrice <= 0) {
        errors.push({
          field: 'limitPrice',
          message: 'Limit price is required for limit orders',
          code: 'MISSING_LIMIT_PRICE'
        });
      } else {
        // Validate limit price tick size
        if (!this.validateTickSize(limitPrice)) {
          errors.push({
            field: 'limitPrice',
            message: `Limit price must be in multiples of ₹${TRADING_CONSTANTS.MIN_TICK_SIZE}`,
            code: 'INVALID_LIMIT_TICK_SIZE'
          });
        }

        // Warn if limit price is far from market price
        const priceDifference = Math.abs(limitPrice - price) / price;
        if (priceDifference > 0.1) { // 10% difference
          errors.push({
            field: 'limitPrice',
            message: `Limit price is ${(priceDifference * 100).toFixed(1)}% away from market price`,
            code: 'LIMIT_PRICE_WARNING'
          });
        }

        // Warn about unfavorable limit prices
        if (type === 'buy' && limitPrice > price * 1.05) {
          errors.push({
            field: 'limitPrice',
            message: 'Buy limit price is significantly above market price',
            code: 'HIGH_BUY_LIMIT'
          });
        } else if (type === 'sell' && limitPrice < price * 0.95) {
          errors.push({
            field: 'limitPrice',
            message: 'Sell limit price is significantly below market price',
            code: 'LOW_SELL_LIMIT'
          });
        }
      }
    }

    return errors;
  }

  /**
   * Calculate total cost and validate balance
   */
  private calculateCostAndValidateBalance(request: OrderValidationRequest): {
    totalAmount: number;
    coinCost: number;
    canAfford: boolean;
    errors: ValidationError[];
  } {
    const errors: ValidationError[] = [];
    const { instrumentType, quantity, price, coinBalance, optionContract, orderType, limitPrice } = request;

    // Use limit price if it's a limit order, otherwise use market price
    const effectivePrice = orderType === 'limit' && limitPrice ? limitPrice : price;

    // Calculate total amount
    let totalAmount: number;
    if (instrumentType === 'option' && optionContract) {
      totalAmount = quantity * effectivePrice * optionContract.lotSize;
    } else {
      totalAmount = quantity * effectivePrice;
    }

    // Calculate coin cost (1 coin = 1 rupee)
    const coinCost = Math.ceil(totalAmount);

    // Check if user can afford (only for buy orders)
    const canAfford = request.type === 'sell' || coinBalance >= coinCost;

    if (request.type === 'buy' && !canAfford) {
      errors.push({
        field: 'coinBalance',
        message: `Insufficient wallet balance. Required: ₹${coinCost.toLocaleString()}, Available: ₹${coinBalance.toLocaleString()}`,
        code: 'INSUFFICIENT_BALANCE'
      });
    }

    return { totalAmount, coinCost, canAfford, errors };
  }

  /**
   * Main validation method
   */
  validateOrder(request: OrderValidationRequest): OrderValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Market hours validation
    if (!this.isMarketOpen()) {
      const nextOpen = this.getNextMarketOpen();
      errors.push({
        field: 'marketHours',
        message: `Market is closed. Next opening: ${nextOpen.toLocaleString('en-IN', {
          timeZone: MARKET_HOURS.TIMEZONE,
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        code: 'MARKET_CLOSED'
      });
    }

    // Basic validation
    if (request.quantity <= 0) {
      errors.push({
        field: 'quantity',
        message: 'Quantity must be greater than 0',
        code: 'INVALID_QUANTITY'
      });
    }

    if (request.price <= 0) {
      errors.push({
        field: 'price',
        message: 'Price must be greater than 0',
        code: 'INVALID_PRICE'
      });
    }

    // Instrument-specific validation
    if (request.instrumentType === 'stock') {
      errors.push(...this.validateStockOrder(request));
    } else if (request.instrumentType === 'option') {
      errors.push(...this.validateOptionOrder(request));
    }

    // Limit order validation
    const limitErrors = this.validateLimitPrice(request);
    // Separate warnings from errors for limit price
    limitErrors.forEach(error => {
      if (error.code.includes('WARNING') || error.code.includes('HIGH_') || error.code.includes('LOW_')) {
        warnings.push(error);
      } else {
        errors.push(error);
      }
    });

    // Cost calculation and balance validation
    const { totalAmount, coinCost, canAfford, errors: balanceErrors } = this.calculateCostAndValidateBalance(request);
    errors.push(...balanceErrors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      coinCost,
      totalAmount,
      canAfford
    };
  }

  /**
   * Quick validation for UI feedback
   */
  quickValidate(request: Partial<OrderValidationRequest>): {
    hasErrors: boolean;
    errorCount: number;
    warningCount: number;
  } {
    if (!request.instrumentType || !request.type) {
      return { hasErrors: true, errorCount: 1, warningCount: 0 };
    }

    const fullRequest: OrderValidationRequest = {
      type: request.type,
      instrumentType: request.instrumentType,
      quantity: request.quantity || 0,
      price: request.price || 0,
      orderType: request.orderType || 'market',
      coinBalance: request.coinBalance || 0,
      ...request
    };

    const result = this.validateOrder(fullRequest);
    return {
      hasErrors: !result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    };
  }
}

// Export singleton instance
export const orderValidator = new OrderValidator();

// Export utility functions
export const isMarketOpen = () => orderValidator.isMarketOpen();
export const getNextMarketOpen = () => orderValidator.getNextMarketOpen();
export const validateTickSize = (price: number) => orderValidator.validateTickSize(price);
export const roundToTickSize = (price: number) => orderValidator.roundToTickSize(price);
export const validateOrder = (request: OrderValidationRequest) => orderValidator.validateOrder(request);
export const quickValidateOrder = (request: Partial<OrderValidationRequest>) => orderValidator.quickValidate(request);

export default orderValidator;