// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

// Stock symbol validation
export const isValidStockSymbol = (symbol: string): boolean => {
  return /^[A-Z]{1,10}$/.test(symbol);
};

// Amount validation
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && Number.isFinite(amount);
};