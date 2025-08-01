/**
 * @fileoverview Authentication API endpoints (login, refresh, logout)
 * @module api/auth/[...auth]
 */

import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  findUserByEmail,
  findUserById,
  comparePassword,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  createUser,
  extractToken
} from '../../../utils/auth.js';
import { withRateLimit } from '../../../middleware/rate-limit.js';
import { cors } from '../../../middleware/auth.js';
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
 * Handle authentication routes
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handler(req, res) {
  // Apply CORS
  if (!cors(req, res)) {
    return;
  }

  const { auth } = req.query;
  const endpoint = auth?.[0];

  // Route to appropriate handler
  switch (endpoint) {
    case 'login':
      return handleLogin(req, res);
    case 'refresh':
      return handleRefresh(req, res);
    case 'logout':
      return handleLogout(req, res);
    case 'register':
      return handleRegister(req, res);
    case 'verify':
      return handleVerify(req, res);
    default:
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
  }
}

/**
 * Handle login
 * POST /api/auth/login
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn('Login attempt for non-existent user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Invalid password attempt for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Log successful login
    logger.info('User logged in:', {
      userId: user.id,
      email: user.email,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    // Set secure cookie for refresh token
    res.setHeader('Set-Cookie', [
      `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    ]);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        expiresIn: 900, // 15 minutes
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Handle token refresh
 * POST /api/auth/refresh
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handleRefresh(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Validate token in database
    const isValid = await validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found or expired'
      });
    }

    // Get user
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update stored refresh token
    await storeRefreshToken(user.id, tokens.refreshToken);

    // Set new refresh token cookie
    res.setHeader('Set-Cookie', [
      `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    ]);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: 900,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
}

/**
 * Handle logout
 * POST /api/auth/logout
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get access token
    const token = extractToken(req.headers.authorization);
    if (token) {
      // In production, you might want to blacklist the access token
      // For now, we'll just revoke the refresh token
    }

    // Get refresh token
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        await revokeRefreshToken(decoded.userId);
      }
    }

    // Clear refresh token cookie
    res.setHeader('Set-Cookie', [
      'refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
}

/**
 * Handle user registration
 * POST /api/auth/register
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    const user = await createUser({
      email,
      password,
      name,
      role: 'user'
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Log registration
    logger.info('New user registered:', {
      userId: user.id,
      email: user.email
    });

    // Set refresh token cookie
    res.setHeader('Set-Cookie', [
      `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    ]);

    return res.status(201).json({
      success: true,
      data: {
        accessToken,
        expiresIn: 900,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
}

/**
 * Handle token verification
 * GET /api/auth/verify
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handleVerify(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required'
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('Verify token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
}

// Apply rate limiting
export default withRateLimit(handler, 'auth');