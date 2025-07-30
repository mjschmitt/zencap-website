/**
 * @fileoverview Database migration for Excel processing and authentication tables
 * @module api/migrate-excel-auth
 */

import { sql } from '@vercel/postgres';
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

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Starting database migration for Excel and Auth tables...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        tier VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        CONSTRAINT valid_role CHECK (role IN ('admin', 'user', 'viewer')),
        CONSTRAINT valid_tier CHECK (tier IN ('free', 'pro', 'enterprise'))
      );
    `;
    logger.info('Users table created/verified');

    // Create indexes for users table
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`;

    // Create refresh_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    logger.info('Refresh tokens table created/verified');

    // Create excel_files table
    await sql`
      CREATE TABLE IF NOT EXISTS excel_files (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(255) NOT NULL,
        processed BOOLEAN DEFAULT false,
        processed_at TIMESTAMP,
        sheet_count INTEGER,
        row_count INTEGER,
        has_macros BOOLEAN DEFAULT false,
        has_errors BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    logger.info('Excel files table created/verified');

    // Create indexes for excel_files table
    await sql`CREATE INDEX IF NOT EXISTS idx_excel_files_user_id ON excel_files(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_excel_files_processed ON excel_files(processed);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_excel_files_created_at ON excel_files(created_at DESC);`;

    // Create excel_jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS excel_jobs (
        id VARCHAR(255) PRIMARY KEY,
        file_id VARCHAR(255) NOT NULL REFERENCES excel_files(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'queued',
        progress INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        processing_time INTEGER,
        result_summary JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT valid_status CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
        CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
      );
    `;
    logger.info('Excel jobs table created/verified');

    // Create indexes for excel_jobs table
    await sql`CREATE INDEX IF NOT EXISTS idx_excel_jobs_file_id ON excel_jobs(file_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_excel_jobs_user_id ON excel_jobs(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_excel_jobs_status ON excel_jobs(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_excel_jobs_created_at ON excel_jobs(created_at DESC);`;

    // Create api_keys table for API authentication
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key_hash VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        last_used TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    logger.info('API keys table created/verified');

    // Create audit_logs table for security tracking
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    logger.info('Audit logs table created/verified');

    // Create index for audit logs
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);`;

    // Create rate_limits table for persistent rate limiting
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        requests INTEGER DEFAULT 1,
        window_start TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(identifier, endpoint, window_start)
      );
    `;
    logger.info('Rate limits table created/verified');

    // Create index for rate limits
    await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);`;

    // Create processing_stats table for analytics
    await sql`
      CREATE TABLE IF NOT EXISTS processing_stats (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        total_files INTEGER DEFAULT 0,
        total_rows_processed BIGINT DEFAULT 0,
        total_processing_time BIGINT DEFAULT 0,
        successful_jobs INTEGER DEFAULT 0,
        failed_jobs INTEGER DEFAULT 0,
        average_file_size BIGINT DEFAULT 0,
        unique_users INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(date)
      );
    `;
    logger.info('Processing stats table created/verified');

    // Create a trigger to update the updated_at timestamp
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Apply trigger to tables with updated_at
    await sql`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await sql`
      CREATE TRIGGER update_excel_files_updated_at BEFORE UPDATE ON excel_files
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    logger.info('Database triggers created/verified');

    // Create default admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zencap.com';
    const adminExists = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;
    
    if (adminExists.rows.length === 0) {
      // Note: In production, use proper password hashing
      logger.info('Creating default admin user...');
      await sql`
        INSERT INTO users (email, password_hash, name, role, tier, email_verified)
        VALUES (
          ${adminEmail},
          '$2a$10$XQq6yGuhoDBmUzCEqKyJLOhqKgbrp2GUmuCvyJ.xJZr3.IqxRO7oi', -- default: 'admin123'
          'Admin User',
          'admin',
          'enterprise',
          true
        )
      `;
      logger.info('Default admin user created');
    }

    const summary = {
      success: true,
      message: 'Database migration completed successfully',
      tables: [
        'users',
        'refresh_tokens',
        'excel_files',
        'excel_jobs',
        'api_keys',
        'audit_logs',
        'rate_limits',
        'processing_stats'
      ],
      adminUser: adminEmail
    };

    logger.info('Migration completed:', summary);

    return res.status(200).json(summary);

  } catch (error) {
    logger.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error.message
    });
  }
}