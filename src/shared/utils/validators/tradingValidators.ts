import { ErrorHandler } from '../errorHandler';

export interface TradingValidationRules {
  minQuantity: number;
  maxQuantity: number;
  lotSize: number;
  tickSize: number;
  minPrice: number;
  maxPrice: number;
  marketHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface OrderValidationInput {
  symbol: string;
  instrumentType: 'stock' | 'option';
  action: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MARKET' | 'LIMIT';
  price?: number;
  userBalance: number;
  estimatedCost: number;
  optionDetails?: {
    strike: number;
    expiry: string;
    optionType: 'CE' | 'PE';
    lotSize: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Trading input validation utilities
 */
export class TradingValidators {
  private static defaultRules: TradingValidationRules = {
    minQuantity: 1,
    maxQuantity: 10000,
    lotSize: 1,
    tickSize: 0.05,
    minPrice: 0.05,
    maxPrice: 100000,
    marketHours: {
      start: '09:15',
      end: '15:30',
      timezone: 'Asia/Kolkata',
    },
  };

  /**
   * Validate trading order input
   */
  static validateOrder(input: OrderValidationInput, rules?: Partial<TradingValidationRules>): ValidationResult {
    const validationRules = { ...this.defaultRules, ...rules };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate symbol
    if (!this.validateSymbol(input.symbol)) {
      errors.push('Invalid symbol format');
    }

    // Validate quantity
    const quantityValidation = this.validateQuantity(input.quantity, input.optionDetails?.lotSize || validationRules.lotSize, validationRules);
    errors.push(...quantityValidation.errors);
    warnings.push(...quantityValidation.warnings);

    // Validate price for limit orders
    if (input.orderType === 'LIMIT') {
      const priceValidation = this.validatePrice(input.price, validationRules);
      errors.push(...priceValidation.errors);
      warnings.push(...priceValidation.warnings);
    }

    // Validate balance
    const balanceValidation = this.validateBalance(input.userBalance, input.estimatedCost);
    errors.push(...balanceValidation.errors);
    warnings.push(...balanceValidation.warnings);

    // Validate option-specific fields
    if (input.instrumentType === 'option' && input.optionDetails) {
      const optionValidation = this.validateOptionDetails(input.optionDetails);
      errors.push(...optionValidation.errors);
      warnings.push(...optionValidation.warnings);
    }

    // Validate market hours
    const marketHoursValidation = this.validateMarketHours(validationRules.marketHours);
    errors.push(...marketHoursValidation.errors);
    warnings.push(...marketHoursValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors: errors.filter(Boolean),
      warnings: warnings.filter(Boolean),
    };
  }

  /**
   * Validate symbol format
   */
  static validateSymbol(symbol: string): boolean {
    if (!symbol || typeof symbol !== 'string') {
      return false;
    }

    // Symbol should be 1-20 characters, alphanumeric with optional hyphens
    const symbolRegex = /^[A-Z0-9-]{1,20}$/;
    return symbolRegex.test(symbol.toUpperCase());
  }

  /**
   * Validate quantity
   */
  static validateQuantity(quantity: number, lotSize: number, rules: TradingValidationRules): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.push('Quantity must be a positive integer');
      return { isValid: false, errors, warnings };
    }

    if (quantity < rules.minQuantity) {
      errors.push(`Minimum quantity is ${rules.minQuantity}`);
    }

    if (quantity > rules.maxQuantity) {
      errors.push(`Maximum quantity is ${rules.maxQuantity}`);
    }

    if (quantity % lotSize !== 0) {
      errors.push(`Quantity must be in multiples of ${lotSize}`);
    }

    // Warning for large quantities
    if (quantity > rules.maxQuantity * 0.8) {
      warnings.push('Large quantity order - please review carefully');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate price
   */
  static validatePrice(price: number | undefined, rules: TradingValidationRules): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (price === undefined || price === null) {
      errors.push('Price is required for limit orders');
      return { isValid: false, errors, warnings };
    }

    if (typeof price !== 'number' || price <= 0) {
      errors.push('Price must be a positive number');
      return { isValid: false, errors, warnings };
    }

    if (price < rules.minPrice) {
      errors.push(`Minimum price is ₹${rules.minPrice}`);
    }

    if (price > rules.maxPrice) {
      errors.push(`Maximum price is ₹${rules.maxPrice}`);
    }

    // Check tick size
    const remainder = (price * 100) % (rules.tickSize * 100);
    if (Math.abs(remainder) > 0.001) {
      errors.push(`Price must be in multiples of ₹${rules.tickSize}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate user balance
   */
  static validateBalance(userBalance: number, estimatedCost: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof userBalance !== 'number' || userBalance < 0) {
      errors.push('Invalid user balance');
      return { isValid: false, errors, warnings };
    }

    if (typeof estimatedCost !== 'number' || estimatedCost <= 0) {
      errors.push('Invalid estimated cost');
      return { isValid: false, errors, warnings };
    }

    if (userBalance < estimatedCost) {
      errors.push('Insufficient balance for this trade');
    }

    // Warning if balance will be very low after trade
    const remainingBalance = userBalance - estimatedCost;
    if (remainingBalance < estimatedCost * 0.1) {
      warnings.push('This trade will use most of your available balance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate option details
   */
  static validateOptionDetails(optionDetails: {
    strike: number;
    expiry: string;
    optionType: 'CE' | 'PE';
    lotSize: number;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate strike price
    if (typeof optionDetails.strike !== 'number' || optionDetails.strike <= 0) {
      errors.push('Invalid strike price');
    }

    // Validate expiry date
    const expiryDate = new Date(optionDetails.expiry);
    const now = new Date();
    
    if (isNaN(expiryDate.getTime())) {
      errors.push('Invalid expiry date format');
    } else if (expiryDate <= now) {
      errors.push('Option has expired');
    } else if (expiryDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      warnings.push('Option expires within 24 hours');
    }

    // Validate option type
    if (!['CE', 'PE'].includes(optionDetails.optionType)) {
      errors.push('Invalid option type');
    }

    // Validate lot size
    if (!Number.isInteger(optionDetails.lotSize) || optionDetails.lotSize <= 0) {
      errors.push('Invalid lot size');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate market hours
   */
  static validateMarketHours(marketHours: { start: string; end: string; timezone: string }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-IN', {
        timeZone: marketHours.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      if (isWeekend) {
        errors.push('Market is closed on weekends');
        return { isValid: false, errors, warnings };
      }

      if (currentTime < marketHours.start || currentTime > marketHours.end) {
        errors.push(`Market is closed. Trading hours: ${marketHours.start} - ${marketHours.end} IST`);
      }

      // Warning if close to market close
      const [closeHour, closeMinute] = marketHours.end.split(':').map(Number);
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      const minutesToClose = (closeHour * 60 + closeMinute) - (currentHour * 60 + currentMinute);
      
      if (minutesToClose > 0 && minutesToClose <= 30) {
        warnings.push(`Market closes in ${minutesToClose} minutes`);
      }

    } catch (error) {
      errors.push('Unable to validate market hours');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate coin purchase input
   */
  static validateCoinPurchase(amount: number, paymentMethod: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Number.isInteger(amount) || amount <= 0) {
      errors.push('Amount must be a positive integer');
    }

    if (amount < 100) {
      errors.push('Minimum purchase amount is 100 coins');
    }

    if (amount > 100000) {
      errors.push('Maximum purchase amount is 100,000 coins');
    }

    const validPaymentMethods = ['UPI', 'CARD', 'NET_BANKING'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      errors.push('Invalid payment method');
    }

    // Warning for large purchases
    if (amount > 10000) {
      warnings.push('Large purchase amount - please verify before proceeding');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Sanitize and validate user input
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    return input
      .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
      .replace(/[^\w\s.-]/g, '') // Keep only alphanumeric, spaces, dots, and hyphens
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate mobile number (Indian format)
   */
  static validateMobile(mobile: string): boolean {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      warnings.push('Password should contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      warnings.push('Password should contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      warnings.push('Password should contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      warnings.push('Password should contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Real-time validation hook for forms
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => ValidationResult>
) => {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  const [warnings, setWarnings] = React.useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  const [touched, setTouched] = React.useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = React.useCallback((field: keyof T, value: any) => {
    const validation = validationRules[field]?.(value);
    if (validation) {
      setErrors(prev => ({ ...prev, [field]: validation.errors }));
      setWarnings(prev => ({ ...prev, [field]: validation.warnings }));
    }
  }, [validationRules]);

  const setValue = React.useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const setTouched = React.useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateAll = React.useCallback(() => {
    const allErrors: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
    const allWarnings: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
    let isValid = true;

    Object.keys(values).forEach(key => {
      const field = key as keyof T;
      const validation = validationRules[field]?.(values[field]);
      if (validation) {
        allErrors[field] = validation.errors;
        allWarnings[field] = validation.warnings;
        if (validation.errors.length > 0) {
          isValid = false;
        }
      }
    });

    setErrors(allErrors);
    setWarnings(allWarnings);
    return isValid;
  }, [values, validationRules]);

  const reset = React.useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string[]>);
    setWarnings({} as Record<keyof T, string[]>);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  return {
    values,
    errors,
    warnings,
    touched,
    setValue,
    setTouched,
    validateAll,
    reset,
    isValid: Object.values(errors).every(fieldErrors => fieldErrors.length === 0),
  };
};

// Re-export React for the hook
import React from 'react';