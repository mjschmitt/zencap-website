/**
 * @fileoverview Security database migration API
 * @module api/migrate-security
 */

import { sql } from '@vercel/postgres';
import { withMiddleware, authorize } from '../../middleware/auth.js';
import { initializeAuditTables } from '../../utils/audit.js';

/**
 * Run security database migrations
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('Starting security database migration...');

    // Create users table with security fields
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        tier VARCHAR(50) DEFAULT 'free',
        mfa_enabled BOOLEAN DEFAULT FALSE,
        mfa_secret VARCHAR(255),
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        last_login TIMESTAMP WITH TIME ZONE,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      );
    `;

    // Create refresh tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(512) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        revoked_at TIMESTAMP WITH TIME ZONE,
        INDEX idx_refresh_tokens_user (user_id),
        INDEX idx_refresh_tokens_token (token)
      );
    `;

    // Create secure Excel files table
    await sql`
      CREATE TABLE IF NOT EXISTS secure_excel_files (
        id VARCHAR(64) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        original_filename VARCHAR(255) NOT NULL,
        secure_filename VARCHAR(255) NOT NULL,
        encrypted_filename VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        file_hash VARCHAR(64) NOT NULL,
        mime_type VARCHAR(100),
        encryption_iv VARCHAR(32) NOT NULL,
        encryption_auth_tag VARCHAR(32) NOT NULL,
        validation_status VARCHAR(50) DEFAULT 'pending',
        validation_details JSONB,
        processing_status VARCHAR(50) DEFAULT 'pending',
        processing_details JSONB,
        access_count INTEGER DEFAULT 0,
        last_accessed_at TIMESTAMP WITH TIME ZONE,
        upload_ip VARCHAR(45),
        shared_with JSONB,
        expires_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_excel_files_user (user_id),
        INDEX idx_excel_files_hash (file_hash),
        INDEX idx_excel_files_created (created_at)
      );
    `;

    // Create file permissions table
    await sql`
      CREATE TABLE IF NOT EXISTS file_permissions (
        id SERIAL PRIMARY KEY,
        file_id VARCHAR(64) NOT NULL REFERENCES secure_excel_files(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission_type VARCHAR(50) NOT NULL,
        granted_by INTEGER REFERENCES users(id),
        granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        revoked_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(file_id, user_id, permission_type),
        INDEX idx_file_permissions (file_id, user_id)
      );
    `;

    // Create API keys table
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key_hash VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255),
        permissions JSONB,
        rate_limit INTEGER DEFAULT 1000,
        last_used_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        revoked_at TIMESTAMP WITH TIME ZONE,
        INDEX idx_api_keys_user (user_id),
        INDEX idx_api_keys_hash (key_hash)
      );
    `;

    // Create session table for enhanced security
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sessions_user (user_id),
        INDEX idx_sessions_expires (expires_at)
      );
    `;

    // Create MFA backup codes table
    await sql`
      CREATE TABLE IF NOT EXISTS mfa_backup_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash VARCHAR(64) NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_mfa_codes_user (user_id)
      );
    `;

    // Create security policies table
    await sql`
      CREATE TABLE IF NOT EXISTS security_policies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        policy_type VARCHAR(50) NOT NULL,
        rules JSONB NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create GDPR consent table
    await sql`
      CREATE TABLE IF NOT EXISTS gdpr_consent (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        consent_type VARCHAR(50) NOT NULL,
        granted BOOLEAN DEFAULT FALSE,
        granted_at TIMESTAMP WITH TIME ZONE,
        withdrawn_at TIMESTAMP WITH TIME ZONE,
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, consent_type),
        INDEX idx_gdpr_consent_user (user_id)
      );
    `;

    // Create data export requests table
    await sql`
      CREATE TABLE IF NOT EXISTS data_export_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        request_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        file_url TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_export_requests_user (user_id),
        INDEX idx_export_requests_status (status)
      );
    `;

    // Initialize audit tables
    await initializeAuditTables();

    // Insert default security policies
    await sql`
      INSERT INTO security_policies (name, policy_type, rules)
      VALUES 
        ('password_policy', 'authentication', ${JSON.stringify({
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          preventReuse: 5,
          maxAge: 90
        })}),
        ('session_policy', 'session', ${JSON.stringify({
          maxDuration: 86400,
          idleTimeout: 900,
          maxConcurrent: 3,
          requireMfaForAdmin: true
        })}),
        ('file_policy', 'file_upload', ${JSON.stringify({
          maxSize: 209715200,
          allowedTypes: ['xlsx', 'xls', 'xlsm', 'xlsb'],
          scanForVirus: true,
          encryptAtRest: true,
          autoExpire: 90
        })}),
        ('rate_limit_policy', 'api', ${JSON.stringify({
          defaultLimit: 100,
          windowMs: 60000,
          tiers: {
            anonymous: 50,
            free: 100,
            pro: 500,
            enterprise: 2000
          }
        })})
      ON CONFLICT (name) DO NOTHING;
    `;

    console.log('Security database migration completed successfully');

    return res.status(200).json({
      success: true,
      message: 'Security database migration completed successfully',
      tables: [
        'users',
        'refresh_tokens',
        'secure_excel_files',
        'file_permissions',
        'api_keys',
        'user_sessions',
        'mfa_backup_codes',
        'security_policies',
        'gdpr_consent',
        'data_export_requests',
        'security_audit_logs',
        'user_activity_logs',
        'file_access_logs',
        'security_incidents'
      ]
    });

  } catch (error) {
    console.error('Security migration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Security migration failed',
      details: error.message
    });
  }
}

// Only allow admin users to run migrations
export default withMiddleware(handler, {
  auth: true,
  roles: ['admin'],
  cors: false
});