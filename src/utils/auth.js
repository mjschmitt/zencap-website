/**
 * @fileoverview Authentication utilities for JWT handling and user management
 * @module utils/auth
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} role - User role (admin, user)
 * @property {Date} created_at - Creation timestamp
 */

/**
 * @typedef {Object} TokenPayload
 * @property {number} userId - User ID
 * @property {string} email - User email
 * @property {string} role - User role
 */

/**
 * Generate access and refresh tokens
 * @param {User} user - User object
 * @returns {{accessToken: string, refreshToken: string}} Token pair
 */
export function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: ACCESS_TOKEN_EXPIRY 
  });
  
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRY 
  });

  return { accessToken, refreshToken };
}

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {TokenPayload|null} Decoded token payload or null if invalid
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {TokenPayload|null} Decoded token payload or null if invalid
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User name
 * @param {string} [userData.role='user'] - User role
 * @returns {Promise<User>} Created user
 */
export async function createUser({ email, password, name, role = 'user' }) {
  const hashedPassword = await hashPassword(password);
  
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role) 
    VALUES (${email}, ${hashedPassword}, ${name}, ${role}) 
    RETURNING id, email, name, role, created_at
  `;
  
  return result.rows[0];
}

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<User|null>} User object or null
 */
export async function findUserByEmail(email) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  
  return result.rows[0] || null;
}

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<User|null>} User object or null
 */
export async function findUserById(id) {
  const result = await sql`
    SELECT id, email, name, role, created_at FROM users WHERE id = ${id}
  `;
  
  return result.rows[0] || null;
}

/**
 * Store refresh token in database
 * @param {number} userId - User ID
 * @param {string} token - Refresh token
 * @returns {Promise<void>}
 */
export async function storeRefreshToken(userId, token) {
  await sql`
    INSERT INTO refresh_tokens (user_id, token, expires_at) 
    VALUES (${userId}, ${token}, NOW() + INTERVAL '7 days')
    ON CONFLICT (user_id) 
    DO UPDATE SET token = ${token}, expires_at = NOW() + INTERVAL '7 days'
  `;
}

/**
 * Validate refresh token from database
 * @param {number} userId - User ID
 * @param {string} token - Refresh token
 * @returns {Promise<boolean>} True if token is valid
 */
export async function validateRefreshToken(userId, token) {
  const result = await sql`
    SELECT token FROM refresh_tokens 
    WHERE user_id = ${userId} AND token = ${token} AND expires_at > NOW()
  `;
  
  return result.rows.length > 0;
}

/**
 * Revoke refresh token
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
export async function revokeRefreshToken(userId) {
  await sql`
    DELETE FROM refresh_tokens WHERE user_id = ${userId}
  `;
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Check if user has required role
 * @param {string} userRole - User's role
 * @param {string[]} requiredRoles - Required roles
 * @returns {boolean} True if user has required role
 */
export function hasRole(userRole, requiredRoles) {
  return requiredRoles.includes(userRole);
}