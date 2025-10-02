import { TradingValidators, DataValidators } from '../utils/validators';
import { ErrorHandler } from '../utils/errorHandler';

/**
 * Validation middleware for API requests
 * This would typically be used on the server side
 */

export interface ValidationMiddleware {
  validateTradingOrder: (req: any, res: any, next: any) => void;
  validateUserData: (req: any, res: any, next: any) => void;
  validateCoinPurchase: (req: any, res: any, next: any) => void;
  sanitizeInput: (req: any, res: any, next: any) => void;
}

/**
 * Express-style middleware for validating trading orders
 */
export const validateTradingOrder = (req: any, res: any, next: any) => {
  try {
    const { body } = req;
    
    // Validate required fields
    const requiredFields = ['symbol', 'instrumentType', 'action', 'quantity', 'orderType'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      const error = ErrorHandler.handleError('VALIDATION_ERROR', {
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
      return res.status(400).json({ success: false, error });
    }

    // Validate order using TradingValidators
    const validation = TradingValidators.validateOrder({
      symbol: body.symbol,
      instrumentType: body.instrumentType,
      action: body.action,
      quantity: body.quantity,
      orderType: body.orderType,
      price: body.price,
      userBalance: body.userBalance || 0,
      estimatedCost: body.estimatedCost || 0,
      optionDetails: body.optionDetails,
    });

    if (!validation.isValid) {
      const error = ErrorHandler.handleError('VALIDATION_ERROR', {
        message: 'Order validation failed',
        details: validation.errors,
      });
      return res.status(400).json({ success: false, error });
    }

    // Add warnings to response if any
    if (validation.warnings.length > 0) {
      req.validationWarnings = validation.warnings;
    }

    next();
  } catch (error) {
    const structuredError = ErrorHandler.handleError(error);
    res.status(500).json({ success: false, error: structuredError });
  }
};

/**
 * Middleware for validating user data
 */
export const validateUserData = (req: any, res: any, next: any) => {
  try {
    const { body } = req;
    
    // Validate user data
    const validation = DataValidators.validateUserData(body);
    
    if (!validation.isValid) {
      const error = ErrorHandler.handleError('VALIDATION_ERROR', {
        message: 'User data validation failed',
        details: validation.errors,
      });
      return res.status(400).json({ success: false, error });
    }

    // Replace request body with sanitized data
    req.body = validation.sanitizedData;
    next();
  } catch (error) {
    const structuredError = ErrorHandler.handleError(error);
    res.status(500).json({ success: false, error: structuredError });
  }
};

/**
 * Middleware for validating coin purchase requests
 */
export const validateCoinPurchase = (req: any, res: any, next: any) => {
  try {
    const { body } = req;
    
    // Validate coin purchase
    const validation = TradingValidators.validateCoinPurchase(
      body.amount,
      body.paymentMethod
    );
    
    if (!validation.isValid) {
      const error = ErrorHandler.handleError('VALIDATION_ERROR', {
        message: 'Coin purchase validation failed',
        details: validation.errors,
      });
      return res.status(400).json({ success: false, error });
    }

    // Add warnings to response if any
    if (validation.warnings.length > 0) {
      req.validationWarnings = validation.warnings;
    }

    next();
  } catch (error) {
    const structuredError = ErrorHandler.handleError(error);
    res.status(500).json({ success: false, error: structuredError });
  }
};

/**
 * General input sanitization middleware
 */
export const sanitizeInput = (req: any, res: any, next: any) => {
  try {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = DataValidators.sanitizeString(req.query[key]);
        }
      });
    }

    // Sanitize request body string fields
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = DataValidators.sanitizeString(req.body[key]);
        }
      });
    }

    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = DataValidators.sanitizeString(req.params[key]);
        }
      });
    }

    next();
  } catch (error) {
    const structuredError = ErrorHandler.handleError(error);
    res.status(500).json({ success: false, error: structuredError });
  }
};

/**
 * Rate limiting validation
 */
export const validateRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: any, res: any, next: any) => {
    try {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up old entries
      for (const [key, value] of requests.entries()) {
        if (value.resetTime < windowStart) {
          requests.delete(key);
        }
      }

      // Get or create client record
      let clientRecord = requests.get(clientId);
      if (!clientRecord || clientRecord.resetTime < windowStart) {
        clientRecord = { count: 0, resetTime: now + windowMs };
        requests.set(clientId, clientRecord);
      }

      // Check rate limit
      if (clientRecord.count >= maxRequests) {
        const error = ErrorHandler.handleError('RATE_LIMIT_EXCEEDED', {
          message: 'Too many requests',
          retryAfter: Math.ceil((clientRecord.resetTime - now) / 1000),
        });
        
        res.set('Retry-After', Math.ceil((clientRecord.resetTime - now) / 1000).toString());
        return res.status(429).json({ success: false, error });
      }

      // Increment request count
      clientRecord.count++;
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - clientRecord.count).toString(),
        'X-RateLimit-Reset': Math.ceil(clientRecord.resetTime / 1000).toString(),
      });

      next();
    } catch (error) {
      const structuredError = ErrorHandler.handleError(error);
      res.status(500).json({ success: false, error: structuredError });
    }
  };
};

/**
 * Authentication validation middleware
 */
export const validateAuthentication = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = ErrorHandler.handleError('AUTHENTICATION_ERROR', {
        message: 'Missing or invalid authorization header',
      });
      return res.status(401).json({ success: false, error });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      const error = ErrorHandler.handleError('AUTHENTICATION_ERROR', {
        message: 'Missing authentication token',
      });
      return res.status(401).json({ success: false, error });
    }

    // Token validation would happen here
    // For now, we'll just check if it's not empty
    req.user = { id: 'user-id', token }; // This would be populated from JWT validation
    
    next();
  } catch (error) {
    const structuredError = ErrorHandler.handleError(error);
    res.status(401).json({ success: false, error: structuredError });
  }
};

/**
 * Role-based authorization middleware
 */
export const validateAuthorization = (requiredRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        const error = ErrorHandler.handleError('AUTHENTICATION_ERROR', {
          message: 'User not authenticated',
        });
        return res.status(401).json({ success: false, error });
      }

      const userRole = req.user.role || 'user';
      
      if (!requiredRoles.includes(userRole)) {
        const error = ErrorHandler.handleError('UNAUTHORIZED', {
          message: 'Insufficient permissions',
          requiredRoles,
          userRole,
        });
        return res.status(403).json({ success: false, error });
      }

      next();
    } catch (error) {
      const structuredError = ErrorHandler.handleError(error);
      res.status(403).json({ success: false, error: structuredError });
    }
  };
};

/**
 * Market hours validation middleware
 */
export const validateMarketHours = (req: any, res: any, next: any) => {
  try {
    TradingValidators.validateMarketHours({
      start: '09:15',
      end: '15:30',
      timezone: 'Asia/Kolkata',
    });
    
    next();
  } catch (error) {
    const structuredError = ErrorHandler.handleError(error);
    res.status(400).json({ success: false, error: structuredError });
  }
};

/**
 * Content-Type validation middleware
 */
export const validateContentType = (expectedTypes: string[]) => {
  return (req: any, res: any, next: any) => {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !expectedTypes.some(type => contentType.includes(type))) {
      const error = ErrorHandler.handleError('VALIDATION_ERROR', {
        message: 'Invalid content type',
        expected: expectedTypes,
        received: contentType,
      });
      return res.status(400).json({ success: false, error });
    }

    next();
  };
};

/**
 * Request size validation middleware
 */
export const validateRequestSize = (maxSizeBytes: number) => {
  return (req: any, res: any, next: any) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSizeBytes) {
      const error = ErrorHandler.handleError('VALIDATION_ERROR', {
        message: 'Request too large',
        maxSize: maxSizeBytes,
        actualSize: contentLength,
      });
      return res.status(413).json({ success: false, error });
    }

    next();
  };
};

// Export all middleware functions
export const validationMiddleware = {
  validateTradingOrder,
  validateUserData,
  validateCoinPurchase,
  sanitizeInput,
  validateRateLimit,
  validateAuthentication,
  validateAuthorization,
  validateMarketHours,
  validateContentType,
  validateRequestSize,
};