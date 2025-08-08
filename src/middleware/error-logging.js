/**
 * @fileoverview Enhanced error logging middleware
 * @module middleware/error-logging
 */

import { captureError, captureMessage } from '../utils/enhancedErrorTracking';

// Request context for error tracking
let requestContext = {};

/**
 * Error logging middleware for API routes
 * @param {Function} handler - The API route handler
 * @returns {Function} Wrapped handler with error logging
 */
export function withErrorLogging(handler, options = {}) {
  const {
    component = 'unknown',
    feature = 'unknown',
    critical = false
  } = options;

  return async (req, res) => {
    // Set up request context
    requestContext = {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Add breadcrumb for request start
    captureMessage(`API request started: ${req.method} ${req.url}`, 'info', {
      component,
      feature,
      requestContext,
      type: 'request_start'
    });

    try {
      // Call the original handler
      const result = await handler(req, res);
      
      // Log successful completion
      if (res.statusCode >= 200 && res.statusCode < 300) {
        captureMessage(`API request completed successfully: ${req.method} ${req.url}`, 'info', {
          component,
          feature,
          requestContext,
          statusCode: res.statusCode,
          type: 'request_success'
        });
      }

      return result;

    } catch (error) {
      // Determine error severity
      const errorSeverity = determineErrorSeverity(error, req, res);
      
      // Enhanced error context
      const errorContext = {
        component,
        feature,
        critical: critical || errorSeverity === 'critical',
        warning: errorSeverity === 'warning',
        requestContext,
        statusCode: res.statusCode,
        errorType: error.constructor.name,
        fingerprint: `${component}:${error.message}`,
        userFlow: getUserFlow(req),
        tags: {
          api_endpoint: req.url,
          method: req.method,
          component,
          feature
        }
      };

      // Capture the error
      captureError(error, errorContext);

      // Set appropriate HTTP status if not already set
      if (!res.headersSent) {
        const statusCode = getErrorStatusCode(error);
        res.status(statusCode);
        
        // Return error response
        res.json({
          success: false,
          error: process.env.NODE_ENV === 'development' ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : {
            message: getPublicErrorMessage(error, statusCode),
            code: error.code || 'INTERNAL_ERROR'
          },
          requestId: requestContext.requestId
        });
      }

      // Re-throw for upstream error handling if needed
      throw error;
    }
  };
}

/**
 * Express-style error handling middleware
 * @param {Error} error - The error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object  
 * @param {Function} next - Next middleware function
 */
export function errorLoggingMiddleware(error, req, res, next) {
  // Set up request context if not already done
  if (!requestContext.requestId) {
    requestContext = {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  // Determine error severity
  const errorSeverity = determineErrorSeverity(error, req, res);
  
  // Enhanced error context
  const errorContext = {
    component: 'express_middleware',
    feature: 'error_handling',
    critical: errorSeverity === 'critical',
    warning: errorSeverity === 'warning',
    requestContext,
    statusCode: res.statusCode,
    errorType: error.constructor.name,
    fingerprint: `middleware:${error.message}`,
    userFlow: getUserFlow(req)
  };

  // Capture the error
  captureError(error, errorContext);

  // Call next middleware
  next(error);
}

/**
 * Global unhandled error handler
 * @param {Error} error - The unhandled error
 * @param {string} origin - Error origin ('uncaughtException' or 'unhandledRejection')
 */
export function handleGlobalError(error, origin) {
  const errorContext = {
    component: 'global_handler',
    feature: 'unhandled_errors',
    critical: true,
    errorOrigin: origin,
    processInfo: {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    },
    fingerprint: `global:${origin}:${error.message}`
  };

  captureError(error, errorContext);

  // In production, you might want to gracefully shutdown
  if (process.env.NODE_ENV === 'production' && origin === 'uncaughtException') {
    console.error('Critical error detected, initiating graceful shutdown...');
    
    // Give time for error reporting, then exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

/**
 * Determine error severity based on error type and context
 * @param {Error} error - The error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {string} Severity level
 */
function determineErrorSeverity(error, req, res) {
  // Critical errors
  if (error.name === 'SystemError' || 
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('database') ||
      error.message?.includes('payment') ||
      error.message?.includes('authentication')) {
    return 'critical';
  }

  // High severity errors
  if (res?.statusCode >= 500 ||
      error.name === 'TypeError' ||
      error.name === 'ReferenceError') {
    return 'high';
  }

  // Warning level errors
  if (res?.statusCode >= 400 && res?.statusCode < 500 ||
      error.name === 'ValidationError' ||
      error.message?.includes('rate limit')) {
    return 'warning';
  }

  // Default to medium
  return 'medium';
}

/**
 * Get appropriate HTTP status code for error
 * @param {Error} error - The error object
 * @returns {number} HTTP status code
 */
function getErrorStatusCode(error) {
  if (error.statusCode) return error.statusCode;
  if (error.status) return error.status;
  
  switch (error.name) {
    case 'ValidationError':
      return 400;
    case 'UnauthorizedError':
    case 'AuthenticationError':
      return 401;
    case 'ForbiddenError':
      return 403;
    case 'NotFoundError':
      return 404;
    case 'ConflictError':
      return 409;
    case 'RateLimitError':
      return 429;
    default:
      return 500;
  }
}

/**
 * Get public-facing error message
 * @param {Error} error - The error object
 * @param {number} statusCode - HTTP status code
 * @returns {string} Public error message
 */
function getPublicErrorMessage(error, statusCode) {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict detected. The resource may have been modified.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    default:
      return 'An internal server error occurred. Our team has been notified.';
  }
}

/**
 * Determine user flow based on request URL
 * @param {Object} req - Request object
 * @returns {string} User flow identifier
 */
function getUserFlow(req) {
  const url = req.url || '';
  
  if (url.includes('/checkout') || url.includes('/stripe')) {
    return 'payment_flow';
  }
  
  if (url.includes('/upload-excel') || url.includes('/excel')) {
    return 'excel_processing';
  }
  
  if (url.includes('/auth') || url.includes('/signin')) {
    return 'authentication';
  }
  
  if (url.includes('/models') || url.includes('/insights')) {
    return 'content_access';
  }
  
  if (url.includes('/contact') || url.includes('/newsletter')) {
    return 'lead_generation';
  }
  
  return 'general';
}

/**
 * Database error handler with reconnection logic
 * @param {Error} error - Database error
 * @param {string} query - SQL query that failed
 * @param {Object} params - Query parameters
 */
export function handleDatabaseError(error, query = '', params = {}) {
  const isDatabaseConnectionError = 
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND' ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout');

  const errorContext = {
    component: 'database',
    feature: 'query_execution',
    critical: isDatabaseConnectionError,
    warning: !isDatabaseConnectionError,
    databaseError: {
      code: error.code,
      sqlState: error.sqlState,
      query: query.substring(0, 200), // Truncate long queries
      paramCount: Object.keys(params).length
    },
    fingerprint: `database:${error.code}:${error.sqlState}`
  };

  captureError(error, errorContext);

  // Return appropriate error for the application
  if (isDatabaseConnectionError) {
    return new Error('Database connection failed. Please try again later.');
  } else {
    return new Error('Database operation failed. Please check your input and try again.');
  }
}

/**
 * Rate limiting error handler
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} options - Rate limit options
 */
export function handleRateLimitError(req, res, options = {}) {
  const errorContext = {
    component: 'rate_limiting',
    feature: 'api_protection',
    warning: true,
    rateLimitInfo: {
      limit: options.max,
      windowMs: options.windowMs,
      endpoint: req.url,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    },
    fingerprint: `rate_limit:${req.url}`
  };

  captureMessage('Rate limit exceeded', 'warning', errorContext);

  if (!res.headersSent) {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs / 1000)
      }
    });
  }
}

/**
 * Initialize global error handlers
 */
export function initializeGlobalErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    handleGlobalError(error, 'uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    handleGlobalError(error, 'unhandledRejection');
  });

  // Handle process warnings
  process.on('warning', (warning) => {
    captureMessage(`Process warning: ${warning.message}`, 'warning', {
      component: 'process',
      feature: 'warnings',
      warningDetails: {
        name: warning.name,
        message: warning.message,
        stack: warning.stack
      }
    });
  });

  console.log('Global error handlers initialized');
}

export default {
  withErrorLogging,
  errorLoggingMiddleware,
  handleGlobalError,
  handleDatabaseError,
  handleRateLimitError,
  initializeGlobalErrorHandlers
};