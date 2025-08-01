/**
 * @fileoverview Authentication middleware for protecting API routes
 * @module middleware/auth
 */

import { verifyAccessToken, extractToken, findUserById, hasRole } from '../utils/auth.js';
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
 * @typedef {Object} AuthRequest
 * @property {Object} user - Authenticated user object
 * @property {number} user.id - User ID
 * @property {string} user.email - User email
 * @property {string} user.role - User role
 */

/**
 * Authentication middleware
 * @param {import('next').NextApiRequest & AuthRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export async function authenticate(req, res) {
  try {
    // Extract token from Authorization header
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return false;
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
      return false;
    }

    // Get user from database
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return false;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    return true;

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
    return false;
  }
}

/**
 * Authorization middleware factory
 * @param {string[]} allowedRoles - Allowed user roles
 * @returns {Function} Middleware function
 */
export function authorize(allowedRoles = []) {
  return async (req, res) => {
    // First authenticate
    const isAuthenticated = await authenticate(req, res);
    if (!isAuthenticated) {
      return false;
    }

    // Check role authorization
    if (allowedRoles.length > 0 && !hasRole(req.user.role, allowedRoles)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
      return false;
    }

    return true;
  };
}

/**
 * Optional authentication middleware
 * @param {import('next').NextApiRequest & AuthRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @returns {Promise<boolean>} Always returns true, but sets req.user if authenticated
 */
export async function optionalAuth(req, res) {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await findUserById(decoded.userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        }
      }
    }

    return true;

  } catch (error) {
    logger.error('Optional auth error:', error);
    // Don't fail the request for optional auth
    return true;
  }
}

/**
 * API key authentication middleware
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export async function authenticateApiKey(req, res) {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required',
        code: 'API_KEY_REQUIRED'
      });
      return false;
    }

    // In production, validate against database
    const validApiKey = process.env.API_KEY;
    
    if (apiKey !== validApiKey) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
      return false;
    }

    return true;

  } catch (error) {
    logger.error('API key auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
    return false;
  }
}

/**
 * Middleware to check specific permissions
 * @param {string} permission - Required permission
 * @returns {Function} Middleware function
 */
export function requirePermission(permission) {
  return async (req, res) => {
    // First authenticate
    const isAuthenticated = await authenticate(req, res);
    if (!isAuthenticated) {
      return false;
    }

    // Check specific permission based on role
    const permissions = {
      admin: ['create', 'read', 'update', 'delete', 'manage_users', 'view_analytics'],
      user: ['create', 'read', 'update'],
      viewer: ['read']
    };

    const userPermissions = permissions[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: `Missing required permission: ${permission}`,
        code: 'PERMISSION_DENIED'
      });
      return false;
    }

    return true;
  };
}

/**
 * CORS middleware for API routes
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @returns {boolean} Always returns true
 */
export function cors(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }

  return true;
}

/**
 * Combined middleware wrapper
 * @param {Function} handler - API route handler
 * @param {Object} options - Middleware options
 * @param {boolean} [options.auth=true] - Require authentication
 * @param {string[]} [options.roles=[]] - Required roles
 * @param {string} [options.permission] - Required permission
 * @param {boolean} [options.cors=true] - Enable CORS
 * @returns {Function} Wrapped handler
 */
export function withMiddleware(handler, options = {}) {
  const {
    auth = true,
    roles = [],
    permission = null,
    cors: enableCors = true
  } = options;

  return async (req, res) => {
    try {
      // Apply CORS
      if (enableCors && !cors(req, res)) {
        return;
      }

      // Apply authentication
      if (auth) {
        const authMiddleware = roles.length > 0 ? authorize(roles) : authenticate;
        const isAuthorized = await authMiddleware(req, res);
        if (!isAuthorized) {
          return;
        }
      }

      // Check permission
      if (permission) {
        const hasPermission = await requirePermission(permission)(req, res);
        if (!hasPermission) {
          return;
        }
      }

      // Call handler
      return await handler(req, res);

    } catch (error) {
      logger.error('Middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  };
}