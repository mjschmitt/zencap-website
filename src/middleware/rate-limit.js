/**
 * @fileoverview Rate limiting middleware to prevent API abuse
 * @module middleware/rate-limit
 */

import { incr, expire, CacheKeys } from '../utils/redis.js';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * @typedef {Object} RateLimitOptions
 * @property {number} [windowMs=60000] - Time window in milliseconds
 * @property {number} [max=100] - Maximum requests per window
 * @property {string} [message] - Error message
 * @property {boolean} [skipSuccessfulRequests=false] - Don't count successful requests
 * @property {boolean} [skipFailedRequests=false] - Don't count failed requests
 * @property {Function} [keyGenerator] - Custom key generator function
 * @property {Function} [skip] - Function to conditionally skip rate limiting
 * @property {Object} [headers] - Headers configuration
 */

/**
 * Default rate limit configurations
 */
export const RateLimits = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later'
  },
  
  // Excel upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Upload limit exceeded, please try again later'
  },
  
  // API endpoints (general)
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please slow down'
  },
  
  // Public endpoints
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute
    message: 'Too many requests, please try again later'
  },
  
  // Admin endpoints
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 500, // 500 requests per minute
    message: 'Rate limit exceeded'
  }
};

/**
 * Get client identifier from request
 * @param {import('next').NextApiRequest} req - Request object
 * @returns {string} Client identifier
 */
function getClientId(req) {
  // Priority: authenticated user > API key > IP address
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  if (req.headers['x-api-key']) {
    return `api:${req.headers['x-api-key']}`;
  }
  
  // Get IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware factory
 * @param {RateLimitOptions} options - Rate limit options
 * @returns {Function} Middleware function
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60000,
    max = 100,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = getClientId,
    skip = null,
    headers = {
      limit: true,
      remaining: true,
      reset: true
    }
  } = options;

  return async (req, res) => {
    try {
      // Check if should skip
      if (skip && await skip(req, res)) {
        return true;
      }

      // Generate rate limit key
      const clientId = keyGenerator(req);
      const endpoint = req.url.split('?')[0]; // Remove query params
      const key = `${CacheKeys.RATE_LIMIT}${endpoint}:${clientId}`;
      
      // Get current window start time
      const now = Date.now();
      const windowStart = Math.floor(now / windowMs) * windowMs;
      const windowKey = `${key}:${windowStart}`;
      
      // Increment counter
      const current = await incr(windowKey);
      
      // Set expiration on first request
      if (current === 1) {
        await expire(windowKey, Math.ceil(windowMs / 1000));
      }
      
      // Calculate rate limit headers
      const limit = max;
      const remaining = Math.max(0, limit - current);
      const reset = new Date(windowStart + windowMs);
      
      // Set headers if enabled
      if (headers.limit) {
        res.setHeader('X-RateLimit-Limit', limit);
      }
      if (headers.remaining) {
        res.setHeader('X-RateLimit-Remaining', remaining);
      }
      if (headers.reset) {
        res.setHeader('X-RateLimit-Reset', reset.toISOString());
      }
      
      // Check if limit exceeded
      if (current > max) {
        logger.warn('Rate limit exceeded:', {
          clientId,
          endpoint,
          current,
          max
        });
        
        res.status(429).json({
          success: false,
          error: message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: reset
        });
        
        return false;
      }
      
      // Track response for conditional counting
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalEnd = res.end;
        res.end = function(...args) {
          const shouldDecrement = 
            (skipSuccessfulRequests && res.statusCode < 400) ||
            (skipFailedRequests && res.statusCode >= 400);
          
          if (shouldDecrement) {
            // Decrement counter (fire and forget)
            incr(windowKey, -1).catch(err => 
              logger.error('Failed to decrement rate limit:', err)
            );
          }
          
          originalEnd.apply(res, args);
        };
      }
      
      return true;

    } catch (error) {
      logger.error('Rate limit error:', error);
      // Fail open - allow request if rate limiting fails
      return true;
    }
  };
}

/**
 * Apply rate limit middleware to API handler
 * @param {Function} handler - API handler
 * @param {string|RateLimitOptions} configOrKey - Rate limit config or preset key
 * @returns {Function} Wrapped handler
 */
export function withRateLimit(handler, configOrKey = 'api') {
  const config = typeof configOrKey === 'string' 
    ? RateLimits[configOrKey] 
    : configOrKey;

  const limiter = rateLimit(config);

  return async (req, res) => {
    const allowed = await limiter(req, res);
    if (!allowed) {
      return;
    }
    
    return handler(req, res);
  };
}

/**
 * Sliding window rate limiter for more accurate limiting
 * @param {Object} options - Rate limit options
 * @returns {Function} Middleware function
 */
export function slidingWindowRateLimit(options = {}) {
  const {
    windowMs = 60000,
    max = 100,
    message = 'Too many requests, please try again later',
    keyGenerator = getClientId
  } = options;

  return async (req, res) => {
    try {
      const clientId = keyGenerator(req);
      const endpoint = req.url.split('?')[0];
      const key = `${CacheKeys.RATE_LIMIT}sliding:${endpoint}:${clientId}`;
      
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Use Redis sorted set for sliding window
      const redis = (await import('../utils/redis')).default;
      
      // Remove old entries
      await redis.zremrangebyscore(key, '-inf', windowStart);
      
      // Count requests in window
      const count = await redis.zcard(key);
      
      if (count >= max) {
        const oldestTimestamp = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestTimestamp[1] ? parseInt(oldestTimestamp[1]) + windowMs : now + windowMs;
        
        res.status(429).json({
          success: false,
          error: message,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: new Date(resetTime)
        });
        
        return false;
      }
      
      // Add current request
      await redis.zadd(key, now, `${now}:${Math.random()}`);
      await redis.expire(key, Math.ceil(windowMs / 1000));
      
      // Set headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count - 1));
      
      return true;

    } catch (error) {
      logger.error('Sliding window rate limit error:', error);
      return true;
    }
  };
}

/**
 * IP-based rate limiting for DDoS protection
 * @param {Object} options - Rate limit options
 * @returns {Function} Middleware function
 */
export function ipRateLimit(options = {}) {
  const {
    windowMs = 60000,
    max = 1000,
    message = 'Too many requests from this IP'
  } = options;

  return rateLimit({
    ...options,
    windowMs,
    max,
    message,
    keyGenerator: (req) => {
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
      return `ip-only:${ip}`;
    }
  });
}

/**
 * Dynamic rate limiting based on user tier
 * @param {Object} tierLimits - Limits per user tier
 * @returns {Function} Middleware function
 */
export function tieredRateLimit(tierLimits = {}) {
  const defaultLimits = {
    anonymous: { windowMs: 60000, max: 50 },
    free: { windowMs: 60000, max: 100 },
    pro: { windowMs: 60000, max: 500 },
    enterprise: { windowMs: 60000, max: 2000 }
  };

  const limits = { ...defaultLimits, ...tierLimits };

  return async (req, res) => {
    // Determine user tier
    const tier = req.user?.tier || 'anonymous';
    const limit = limits[tier] || limits.anonymous;

    const limiter = rateLimit({
      ...limit,
      keyGenerator: (req) => {
        if (req.user?.id) {
          return `tier:${tier}:user:${req.user.id}`;
        }
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
        return `tier:anonymous:ip:${ip}`;
      }
    });

    return limiter(req, res);
  };
}