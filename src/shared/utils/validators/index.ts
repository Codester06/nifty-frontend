// Re-export new comprehensive validators
export * from './tradingValidators';
export * from './dataValidators';

// Legacy validators (kept for backward compatibility)
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidStockSymbol = (symbol: string): boolean => {
  return /^[A-Z]{1,10}$/.test(symbol);
};

export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && Number.isFinite(amount);
};