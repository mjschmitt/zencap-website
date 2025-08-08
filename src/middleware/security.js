/**
 * @fileoverview Security Middleware for Production Monitoring
 * @module middleware/security
 */

import { securityMonitor, SECURITY_EVENTS, THREAT_LEVELS } from '../utils/security/SecurityMonitor.js';
import rateLimit from 'express-rate-limit';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

/**
 * Security middleware configuration
 */
const SECURITY_CONFIG = {
  // Rate limiting configurations by endpoint type
  RATE_LIMITS: {
    // Authentication endpoints - strict limits
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // API endpoints - moderate limits
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
      message: 'Too many requests, please slow down.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // File upload endpoints - restrictive limits
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 uploads per hour
      message: 'Upload limit exceeded, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Public endpoints - generous limits
    public: {
      windowMs: 60 * 1000, // 1 minute
      max: 200, // 200 requests per minute
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }
  },
  
  // Blocked IPs and threat detection
  THREAT_DETECTION: {
    AUTO_BLOCK_THRESHOLD: 50,
    SUSPICIOUS_USER_AGENTS: [
      'sqlmap',
      'nikto',
      'nmap',
      'masscan',
      'nessus',
      'openvas',
      'burp',
      'gobuster',
      'dirb'
    ],
    BLOCKED_PATHS: [
      '/admin/phpMyAdmin',
      '/wp-admin',
      '/.env',
      '/config.php',
      '/administrator',
      '/.git'
    ]
  }
};

/**
 * Create rate limiter for different endpoint types
 */
export function createRateLimiter(type = 'api') {
  const config = SECURITY_CONFIG.RATE_LIMITS[type] || SECURITY_CONFIG.RATE_LIMITS.api;
  
  return rateLimit({
    ...config,
    
    // Custom key generator to include user context
    keyGenerator: (req) => {
      const ip = getClientIP(req);
      const userId = req.user?.id || 'anonymous';
      return `${type}:${ip}:${userId}`;
    },
    
    // Enhanced rate limit handler with security logging
    handler: async (req, res) => {
      const ip = getClientIP(req);
      const userAgent = req.headers['user-agent'] || 'unknown';
      const path = req.url;
      
      await securityMonitor.logSecurityEvent(
        SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
        THREAT_LEVELS.MEDIUM,
        {
          ip,
          userAgent,
          path,
          userId: req.user?.id,
          sessionId: req.session?.id,
          data: {
            limitType: type,
            limit: config.max,
            windowMs: config.windowMs
          }
        }
      );
      
      res.status(429).json({
        success: false,
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    },
    
    // Skip rate limiting for whitelisted IPs
    skip: async (req) => {
      const ip = getClientIP(req);
      
      // Check if IP is whitelisted (admin IPs, CDN IPs, etc.)
      const whitelistedIPs = process.env.WHITELISTED_IPS?.split(',') || [];
      if (whitelistedIPs.includes(ip)) {
        return true;
      }
      
      // Check if IP is blocked
      try {
        const result = await sql`
          SELECT blocked, threat_score 
          FROM threat_intelligence 
          WHERE ip_address = ${ip} AND blocked = true
        `;
        
        if (result.rows.length > 0) {
          // IP is blocked, don't skip - this will trigger the handler
          return false;
        }
      } catch (error) {
        console.error('Error checking IP blocklist:', error);
      }
      
      return false;
    }
  });
}

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  // Remove powered-by header
  res.removeHeader('X-Powered-By');
  
  // Set comprehensive security headers
  const headers = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    
    // HSTS for HTTPS sites
    ...(req.secure && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }),
    
    // Enhanced CSP
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "media-src 'self' data: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ')
  };
  
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  next();
}

/**
 * Threat detection middleware
 */
export async function threatDetection(req, res, next) {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const path = req.url;
  const method = req.method;
  
  try {
    // Check for blocked IPs
    const threatResult = await sql`
      SELECT blocked, threat_score, threat_categories
      FROM threat_intelligence
      WHERE ip_address = ${ip} AND blocked = true
    `;
    
    if (threatResult.rows.length > 0) {
      await securityMonitor.logSecurityEvent(
        SECURITY_EVENTS.UNAUTHORIZED_ACCESS,
        THREAT_LEVELS.HIGH,
        {
          ip,
          userAgent,
          path,
          data: {
            reason: 'blocked_ip',
            threatScore: threatResult.rows[0].threat_score,
            threatCategories: threatResult.rows[0].threat_categories
          }
        }
      );
      
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'IP_BLOCKED'
      });
    }
    
    // Detect suspicious user agents
    const suspiciousUA = SECURITY_CONFIG.THREAT_DETECTION.SUSPICIOUS_USER_AGENTS.some(
      ua => userAgent.toLowerCase().includes(ua)
    );
    
    if (suspiciousUA) {
      await securityMonitor.logSecurityEvent(
        SECURITY_EVENTS.API_ABUSE_DETECTED,
        THREAT_LEVELS.HIGH,
        {
          ip,
          userAgent,
          path,
          data: { reason: 'suspicious_user_agent' }
        }
      );
      
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'SUSPICIOUS_CLIENT'
      });
    }
    
    // Detect blocked paths
    const blockedPath = SECURITY_CONFIG.THREAT_DETECTION.BLOCKED_PATHS.some(
      blockedPath => path.toLowerCase().includes(blockedPath)
    );
    
    if (blockedPath) {
      await securityMonitor.logSecurityEvent(
        SECURITY_EVENTS.VULNERABILITY_EXPLOIT,
        THREAT_LEVELS.HIGH,
        {
          ip,
          userAgent,
          path,
          data: { reason: 'blocked_path_access' }
        }
      );
      
      return res.status(404).json({
        success: false,
        error: 'Not found'
      });
    }
    
    // Check for SQL injection in query parameters
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string' && securityMonitor.detectSQLInjection(value, { ip, path, userAgent })) {
          return res.status(400).json({
            success: false,
            error: 'Invalid input detected',
            code: 'SECURITY_VIOLATION'
          });
        }
      }
    }
    
    // Check for XSS in request body
    if (req.body && typeof req.body === 'object') {
      const bodyString = JSON.stringify(req.body);
      if (securityMonitor.detectXSS(bodyString, { ip, path, userAgent })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid content detected',
          code: 'SECURITY_VIOLATION'
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Threat detection error:', error);
    // Don't block on error, but log it
    await securityMonitor.logSecurityEvent(
      SECURITY_EVENTS.SECURITY_POLICY_VIOLATION,
      THREAT_LEVELS.LOW,
      {
        ip,
        userAgent,
        path,
        data: { error: 'threat_detection_error', message: error.message }
      }
    );
    
    next();
  }
}

/**
 * Request logging middleware for security audit trail
 */
export async function securityLogger(req, res, next) {
  const startTime = Date.now();
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const path = req.url;
  const method = req.method;
  
  // Log high-value endpoints
  const sensitiveEndpoints = [
    '/api/auth',
    '/api/admin',
    '/api/upload',
    '/api/download',
    '/api/models',
    '/api/insights'
  ];
  
  const isSensitive = sensitiveEndpoints.some(endpoint => path.startsWith(endpoint));
  
  if (isSensitive) {
    // Log access to sensitive endpoints
    await securityMonitor.logSecurityEvent(
      SECURITY_EVENTS.UNAUTHORIZED_ACCESS,
      THREAT_LEVELS.LOW,
      {
        ip,
        userAgent,
        path,
        userId: req.user?.id,
        sessionId: req.session?.id,
        data: {
          method,
          accessType: 'sensitive_endpoint',
          timestamp: new Date()
        }
      }
    );
  }
  
  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log failed requests or suspicious response patterns
    if (statusCode >= 400 || duration > 10000) { // 10 second threshold
      securityMonitor.logSecurityEvent(
        statusCode >= 500 ? SECURITY_EVENTS.SECURITY_POLICY_VIOLATION : SECURITY_EVENTS.API_ABUSE_DETECTED,
        statusCode >= 500 ? THREAT_LEVELS.MEDIUM : THREAT_LEVELS.LOW,
        {
          ip,
          userAgent,
          path,
          userId: req.user?.id,
          data: {
            method,
            statusCode,
            duration,
            responseSize: chunk?.length || 0
          }
        }
      ).catch(console.error);
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

/**
 * File upload security middleware
 */
export async function fileUploadSecurity(req, res, next) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }
  
  const ip = getClientIP(req);
  
  // Check file upload rate limits
  const uploadKey = `upload_limit:${ip}`;
  
  try {
    // Monitor file upload patterns
    if (req.file || req.files) {
      const files = req.files ? Object.values(req.files).flat() : [req.file];
      
      for (const file of files) {
        if (file) {
          // Scan file for security threats
          const threats = await securityMonitor.scanFileUpload(file, {
            ip,
            userAgent: req.headers['user-agent'],
            path: req.url,
            userId: req.user?.id
          });
          
          // Block uploads with detected threats
          if (threats.length > 0) {
            return res.status(400).json({
              success: false,
              error: 'File upload blocked due to security concerns',
              code: 'FILE_SECURITY_VIOLATION',
              details: threats
            });
          }
        }
      }
    }
    
    next();
    
  } catch (error) {
    console.error('File upload security error:', error);
    return res.status(500).json({
      success: false,
      error: 'Security validation failed'
    });
  }
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._token;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    securityMonitor.logSecurityEvent(
      SECURITY_EVENTS.CSRF_ATTACK,
      THREAT_LEVELS.HIGH,
      {
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        path: req.url,
        userId: req.user?.id,
        data: { hasToken: !!token, hasSessionToken: !!sessionToken }
      }
    ).catch(console.error);
    
    return res.status(403).json({
      success: false,
      error: 'CSRF token validation failed',
      code: 'CSRF_VIOLATION'
    });
  }
  
  next();
}

/**
 * DDoS protection middleware
 */
export async function ddosProtection(req, res, next) {
  const ip = getClientIP(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 1000; // 1000 requests per minute threshold
  
  try {
    // Use Redis for distributed rate limiting if available
    if (global.redis) {
      const key = `ddos:${ip}`;
      const requests = await global.redis.incr(key);
      
      if (requests === 1) {
        await global.redis.expire(key, 60);
      }
      
      if (requests > maxRequests) {
        await securityMonitor.logSecurityEvent(
          SECURITY_EVENTS.DDOS_ATTACK,
          THREAT_LEVELS.CRITICAL,
          {
            ip,
            userAgent: req.headers['user-agent'],
            path: req.url,
            data: {
              requestCount: requests,
              windowMs,
              threshold: maxRequests
            }
          }
        );
        
        return res.status(429).json({
          success: false,
          error: 'Too many requests - DDoS protection activated',
          code: 'DDOS_DETECTED'
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('DDoS protection error:', error);
    next();
  }
}

/**
 * Input sanitization middleware
 */
export function inputSanitization(req, res, next) {
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .replace(/[<>'"&]/g, char => `&#${char.charCodeAt(0)};`)
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize request body (but preserve certain fields that need raw content)
  if (req.body && typeof req.body === 'object') {
    const preserveRaw = ['content', 'description', 'html'];
    const sanitized = {};
    
    for (const [key, value] of Object.entries(req.body)) {
      if (preserveRaw.includes(key)) {
        sanitized[key] = value; // Keep raw for rich content
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    
    req.body = sanitized;
  }
  
  next();
}

/**
 * Get client IP address with proxy support
 */
export function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfIP = req.headers['cf-connecting-ip'];
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfIP) {
    return cfIP;
  }
  
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * Session security enhancement
 */
export function enhanceSessionSecurity(req, res, next) {
  if (req.session) {
    // Regenerate session ID on login
    if (req.url.includes('/auth/login') && req.method === 'POST') {
      req.session.regenerate(() => {
        next();
      });
      return;
    }
    
    // Check for session hijacking
    const currentFingerprint = generateSessionFingerprint(req);
    if (req.session.fingerprint && req.session.fingerprint !== currentFingerprint) {
      securityMonitor.logSecurityEvent(
        SECURITY_EVENTS.UNAUTHORIZED_ACCESS,
        THREAT_LEVELS.HIGH,
        {
          ip: getClientIP(req),
          userAgent: req.headers['user-agent'],
          path: req.url,
          userId: req.user?.id,
          sessionId: req.session.id,
          data: { reason: 'session_hijacking_detected' }
        }
      ).catch(console.error);
      
      req.session.destroy();
      return res.status(401).json({
        success: false,
        error: 'Session security violation detected',
        code: 'SESSION_HIJACKING'
      });
    }
    
    // Set session fingerprint
    if (!req.session.fingerprint) {
      req.session.fingerprint = currentFingerprint;
    }
    
    // Update last activity
    req.session.lastActivity = Date.now();
  }
  
  next();
}

/**
 * Generate session fingerprint for hijacking detection
 */
function generateSessionFingerprint(req) {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    getClientIP(req)
  ].join('|');
  
  return crypto
    .createHash('sha256')
    .update(components)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Apply all security middleware to API routes
 */
export function applySecurityMiddleware(handler, options = {}) {
  const middlewares = [
    securityHeaders,
    ddosProtection,
    threatDetection,
    inputSanitization,
    securityLogger
  ];
  
  if (options.csrf) {
    middlewares.push(csrfProtection);
  }
  
  if (options.fileUpload) {
    middlewares.push(fileUploadSecurity);
  }
  
  if (options.rateLimit) {
    middlewares.unshift(createRateLimiter(options.rateLimit));
  }
  
  if (options.sessionSecurity) {
    middlewares.push(enhanceSessionSecurity);
  }
  
  return async (req, res) => {
    let index = 0;
    
    const next = async (error) => {
      if (error) {
        console.error('Security middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal security error'
        });
      }
      
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        try {
          await middleware(req, res, next);
        } catch (err) {
          next(err);
        }
      } else {
        // All middleware passed, execute handler
        try {
          await handler(req, res);
        } catch (err) {
          console.error('Handler error:', err);
          res.status(500).json({
            success: false,
            error: 'Internal server error'
          });
        }
      }
    };
    
    await next();
  };
}

export default {
  createRateLimiter,
  securityHeaders,
  threatDetection,
  securityLogger,
  fileUploadSecurity,
  csrfProtection,
  ddosProtection,
  inputSanitization,
  enhanceSessionSecurity,
  applySecurityMiddleware,
  getClientIP
};