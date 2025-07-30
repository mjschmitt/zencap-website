/**
 * @fileoverview Security audit logging utilities
 * @module utils/audit
 */

import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { AUDIT_CONFIG, GDPR_CONFIG } from '../config/security.js';
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
 * Initialize audit tables
 */
export async function initializeAuditTables() {
  try {
    // Create main audit log table
    await sql`
      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(64) NOT NULL UNIQUE,
        event_type VARCHAR(50) NOT NULL,
        user_id INTEGER,
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_id VARCHAR(128),
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        action VARCHAR(50),
        result VARCHAR(20),
        severity VARCHAR(20) DEFAULT 'info',
        metadata JSONB,
        error_details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        retention_until TIMESTAMP WITH TIME ZONE,
        INDEX idx_event_type (event_type),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_severity (severity)
      );
    `;

    // Create GDPR-compliant user activity log
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        resource_accessed TEXT,
        ip_address_hash VARCHAR(64),
        country_code VARCHAR(2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        anonymized BOOLEAN DEFAULT FALSE,
        deletion_requested BOOLEAN DEFAULT FALSE,
        INDEX idx_user_activity (user_id, created_at)
      );
    `;

    // Create file access log table
    await sql`
      CREATE TABLE IF NOT EXISTS file_access_logs (
        id SERIAL PRIMARY KEY,
        file_id VARCHAR(255) NOT NULL,
        user_id INTEGER,
        access_type VARCHAR(20) NOT NULL,
        ip_address VARCHAR(45),
        success BOOLEAN DEFAULT TRUE,
        error_code VARCHAR(50),
        file_size BIGINT,
        processing_time INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_file_access (file_id, created_at),
        INDEX idx_user_file_access (user_id, file_id)
      );
    `;

    // Create security incident table
    await sql`
      CREATE TABLE IF NOT EXISTS security_incidents (
        id SERIAL PRIMARY KEY,
        incident_id VARCHAR(64) NOT NULL UNIQUE,
        incident_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        user_id INTEGER,
        ip_address VARCHAR(45),
        description TEXT,
        actions_taken TEXT,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by INTEGER,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_incident_severity (severity, created_at),
        INDEX idx_incident_resolved (resolved)
      );
    `;

    logger.info('Audit tables initialized successfully');
  } catch (error) {
    logger.error('Error initializing audit tables:', error);
    throw error;
  }
}

/**
 * Create audit log entry
 * @param {Object} logData - Log data
 * @returns {Promise<Object>} Created log entry
 */
export async function createAuditLog(logData) {
  try {
    const {
      event,
      userId = null,
      ipAddress = null,
      userAgent = null,
      sessionId = null,
      resourceType = null,
      resourceId = null,
      action = null,
      result = 'success',
      severity = 'info',
      metadata = {},
      errorDetails = null
    } = logData;

    // Generate unique event ID
    const eventId = generateEventId();

    // Get event configuration
    const eventConfig = AUDIT_CONFIG.events[event] || { severity: 'info', retention: 90 };
    const retentionDays = eventConfig.retention;
    const retentionUntil = new Date();
    retentionUntil.setDate(retentionUntil.getDate() + retentionDays);

    // Apply GDPR compliance
    const gdprCompliantData = applyGDPRCompliance({
      ipAddress,
      userAgent,
      metadata
    });

    // Insert audit log
    const insertResult = await sql`
      INSERT INTO security_audit_logs (
        event_id,
        event_type,
        user_id,
        ip_address,
        user_agent,
        session_id,
        resource_type,
        resource_id,
        action,
        result,
        severity,
        metadata,
        error_details,
        retention_until
      ) VALUES (
        ${eventId},
        ${event},
        ${userId},
        ${gdprCompliantData.ipAddress},
        ${gdprCompliantData.userAgent},
        ${sessionId},
        ${resourceType},
        ${resourceId},
        ${action},
        ${result},
        ${eventConfig.severity || severity},
        ${JSON.stringify(gdprCompliantData.metadata)},
        ${errorDetails ? JSON.stringify(errorDetails) : null},
        ${retentionUntil}
      )
      RETURNING *;
    `;

    // Log critical events to external systems
    if (eventConfig.severity === 'critical') {
      await notifySecurityTeam(insertResult.rows[0]);
    }

    return insertResult.rows[0];
  } catch (error) {
    logger.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the application
  }
}

/**
 * Log file access
 * @param {Object} accessData - Access data
 */
export async function logFileAccess(accessData) {
  try {
    const {
      fileId,
      userId,
      accessType,
      ipAddress,
      success = true,
      errorCode = null,
      fileSize = null,
      processingTime = null
    } = accessData;

    await sql`
      INSERT INTO file_access_logs (
        file_id,
        user_id,
        access_type,
        ip_address,
        success,
        error_code,
        file_size,
        processing_time
      ) VALUES (
        ${fileId},
        ${userId},
        ${accessType},
        ${ipAddress},
        ${success},
        ${errorCode},
        ${fileSize},
        ${processingTime}
      );
    `;
  } catch (error) {
    logger.error('Error logging file access:', error);
  }
}

/**
 * Create security incident
 * @param {Object} incidentData - Incident data
 * @returns {Promise<Object>} Created incident
 */
export async function createSecurityIncident(incidentData) {
  try {
    const {
      type,
      severity,
      userId = null,
      ipAddress = null,
      description,
      actionsTaken = null,
      metadata = {}
    } = incidentData;

    const incidentId = generateEventId();

    const result = await sql`
      INSERT INTO security_incidents (
        incident_id,
        incident_type,
        severity,
        user_id,
        ip_address,
        description,
        actions_taken,
        metadata
      ) VALUES (
        ${incidentId},
        ${type},
        ${severity},
        ${userId},
        ${ipAddress},
        ${description},
        ${actionsTaken},
        ${JSON.stringify(metadata)}
      )
      RETURNING *;
    `;

    // Notify security team for high/critical incidents
    if (['high', 'critical'].includes(severity)) {
      await notifySecurityTeam(result.rows[0]);
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating security incident:', error);
    throw error;
  }
}

/**
 * Get audit logs for user (GDPR compliance)
 * @param {number} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} User audit logs
 */
export async function getUserAuditLogs(userId, options = {}) {
  try {
    const { startDate, endDate, eventTypes = [] } = options;

    let query = `
      SELECT 
        event_id,
        event_type,
        resource_type,
        resource_id,
        action,
        result,
        created_at
      FROM security_audit_logs
      WHERE user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (eventTypes.length > 0) {
      query += ` AND event_type = ANY($${paramIndex})`;
      params.push(eventTypes);
    }

    query += ' ORDER BY created_at DESC';

    const result = await sql.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Error fetching user audit logs:', error);
    throw error;
  }
}

/**
 * Delete user audit logs (GDPR right to erasure)
 * @param {number} userId - User ID
 */
export async function deleteUserAuditLogs(userId) {
  try {
    // Anonymize instead of delete for security compliance
    await sql`
      UPDATE security_audit_logs
      SET 
        user_id = NULL,
        ip_address = NULL,
        user_agent = 'ANONYMIZED',
        metadata = jsonb_set(metadata, '{anonymized}', 'true'::jsonb)
      WHERE user_id = ${userId};
    `;

    // Mark user activity as anonymized
    await sql`
      UPDATE user_activity_logs
      SET 
        anonymized = TRUE,
        ip_address_hash = NULL
      WHERE user_id = ${userId};
    `;

    logger.info(`Anonymized audit logs for user ${userId}`);
  } catch (error) {
    logger.error('Error anonymizing user audit logs:', error);
    throw error;
  }
}

/**
 * Clean up old audit logs
 */
export async function cleanupAuditLogs() {
  try {
    // Delete logs past retention period
    const result = await sql`
      DELETE FROM security_audit_logs
      WHERE retention_until < NOW()
      RETURNING COUNT(*);
    `;

    logger.info(`Cleaned up ${result.rowCount} expired audit logs`);

    // Clean up old file access logs
    const fileAccessResult = await sql`
      DELETE FROM file_access_logs
      WHERE created_at < NOW() - INTERVAL '90 days'
      RETURNING COUNT(*);
    `;

    logger.info(`Cleaned up ${fileAccessResult.rowCount} old file access logs`);
  } catch (error) {
    logger.error('Error cleaning up audit logs:', error);
  }
}

/**
 * Generate unique event ID
 * @returns {string} Event ID
 */
function generateEventId() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}`;
}

/**
 * Apply GDPR compliance to log data
 * @param {Object} data - Log data
 * @returns {Object} GDPR-compliant data
 */
function applyGDPRCompliance(data) {
  const { ipAddress, userAgent, metadata } = data;
  const gdprConfig = GDPR_CONFIG.processing;

  const compliantData = {
    ipAddress: ipAddress,
    userAgent: userAgent,
    metadata: { ...metadata }
  };

  // Anonymize IP address if configured
  if (gdprConfig.pseudonymization && ipAddress) {
    // Keep only first two octets for IPv4
    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      compliantData.ipAddress = `${parts[0]}.${parts[1]}.0.0`;
    }
  }

  // Hash sensitive data
  if (compliantData.metadata.email) {
    compliantData.metadata.emailHash = crypto
      .createHash('sha256')
      .update(compliantData.metadata.email)
      .digest('hex');
    delete compliantData.metadata.email;
  }

  // Remove PII from user agent
  if (AUDIT_CONFIG.gdpr.excludePII) {
    compliantData.userAgent = userAgent?.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, 'x.x.x.x');
  }

  return compliantData;
}

/**
 * Notify security team of critical events
 * @param {Object} event - Event data
 */
async function notifySecurityTeam(event) {
  try {
    // TODO: Implement notification logic (email, Slack, PagerDuty, etc.)
    logger.warn('Security notification:', {
      eventId: event.event_id || event.incident_id,
      type: event.event_type || event.incident_type,
      severity: event.severity,
      timestamp: event.created_at
    });
  } catch (error) {
    logger.error('Error notifying security team:', error);
  }
}

/**
 * Generate audit report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Audit report
 */
export async function generateAuditReport(options = {}) {
  try {
    const { startDate, endDate, groupBy = 'event_type' } = options;

    const result = await sql`
      SELECT 
        ${groupBy} as category,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN result = 'failure' THEN 1 END) as failures,
        MAX(created_at) as last_occurrence
      FROM security_audit_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY ${groupBy}
      ORDER BY count DESC;
    `;

    const incidents = await sql`
      SELECT 
        severity,
        COUNT(*) as count,
        COUNT(CASE WHEN resolved = TRUE THEN 1 END) as resolved
      FROM security_incidents
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY severity;
    `;

    return {
      period: { startDate, endDate },
      events: result.rows,
      incidents: incidents.rows,
      generated_at: new Date()
    };
  } catch (error) {
    logger.error('Error generating audit report:', error);
    throw error;
  }
}

export default {
  initializeAuditTables,
  createAuditLog,
  logFileAccess,
  createSecurityIncident,
  getUserAuditLogs,
  deleteUserAuditLogs,
  cleanupAuditLogs,
  generateAuditReport
};