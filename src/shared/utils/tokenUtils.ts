/**
 * Simple JWT token utilities for demo platform
 * Basic security features for learning environment
 */

export const tokenUtils = {
  // Check if token exists and is not expired (basic check)
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('nifty-bulk-token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp ? payload.exp > currentTime : true;
    } catch {
      return false;
    }
  },

  // Get user role from token
  getUserRole: (): 'user' | 'admin' | 'superadmin' | null => {
    const token = localStorage.getItem('nifty-bulk-token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'user';
    } catch {
      return null;
    }
  },

  // Clear expired tokens
  clearExpiredToken: (): void => {
    if (!tokenUtils.isTokenValid()) {
      localStorage.removeItem('nifty-bulk-token');
      localStorage.removeItem('nifty-bulk-user');
    }
  },

  // Basic rate limiting (simple in-memory storage)
  rateLimitMap: new Map<string, { count: number; resetTime: number }>(),

  // Simple rate limiting check
  checkRateLimit: (key: string, maxRequests = 10, windowMs = 60000): boolean => {
    const now = Date.now();
    const record = tokenUtils.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      tokenUtils.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
};