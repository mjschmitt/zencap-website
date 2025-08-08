/**
 * Simple in-memory rate limiting middleware (no Redis dependency)
 * For production, consider using Redis or a distributed solution
 */

// In-memory store for rate limiting
const rateLimitStore = new Map();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Simple rate limiting middleware
 */
export function withRateLimit(handler, options = {}) {
  const {
    windowMs = 60000, // 1 minute default
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => {
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? forwarded.split(',')[0] : req.socket?.remoteAddress || 'unknown';
      return ip;
    }
  } = options;

  return async (req, res) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      
      // Get or create rate limit data for this key
      let limitData = rateLimitStore.get(key);
      
      if (!limitData || limitData.resetTime < now) {
        // Create new window
        limitData = {
          count: 0,
          resetTime: now + windowMs
        };
        rateLimitStore.set(key, limitData);
      }
      
      // Increment counter
      limitData.count++;
      
      // Check if limit exceeded
      if (limitData.count > max) {
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString());
        res.setHeader('Retry-After', Math.ceil((limitData.resetTime - now) / 1000));
        
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
        });
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - limitData.count);
      res.setHeader('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString());
      
      // Call the handler
      return handler(req, res);
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // On error, allow the request through
      return handler(req, res);
    }
  };
}

// Export preset configurations
export const RateLimits = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts'
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Upload limit exceeded'
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: 'API rate limit exceeded'
  },
  contact: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many contact form submissions'
  }
};