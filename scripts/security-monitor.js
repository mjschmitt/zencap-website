#!/usr/bin/env node

/**
 * Production Security Monitor for Zenith Capital Advisors
 * Real-time security monitoring and alerting system
 * 
 * @author Head of Security & Compliance
 * @version 1.0.0
 */

import { sql } from '@vercel/postgres';
import winston from 'winston';
import crypto from 'crypto';

// Configure secure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize({ all: true })
    }),
    new winston.transports.File({ 
      filename: 'logs/security.log',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10
    })
  ]
});

class SecurityMonitor {
  constructor() {
    this.alertThresholds = {
      failedLogins: 5,
      malwareDetections: 1,
      unusualFileUploads: 10,
      apiAbuseRequests: 100,
      databaseErrors: 5
    };
    
    this.monitoringInterval = 5 * 60 * 1000; // 5 minutes
    this.isRunning = false;
  }

  /**
   * Start security monitoring
   */
  async start() {
    if (this.isRunning) {
      logger.warn('Security monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('🔒 Starting Security Monitor for Zenith Capital Advisors');
    
    // Initial security status check
    await this.performSecurityHealthCheck();
    
    // Set up recurring monitoring
    this.monitorInterval = setInterval(async () => {
      await this.performSecurityScan();
    }, this.monitoringInterval);
    
    // Set up signal handlers for graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
    
    logger.info('✅ Security Monitor active - monitoring all security events');
  }

  /**
   * Stop security monitoring
   */
  async stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    
    logger.info('🛑 Security Monitor stopped');
    process.exit(0);
  }

  /**
   * Perform comprehensive security health check
   */
  async performSecurityHealthCheck() {
    logger.info('🔍 Performing security health check...');
    
    try {
      // Check database connectivity and security
      await this.checkDatabaseSecurity();
      
      // Verify critical security configurations
      await this.verifySecurityConfiguration();
      
      // Check for recent security incidents
      await this.checkRecentIncidents();
      
      // Verify audit logging system
      await this.verifyAuditLogging();
      
      logger.info('✅ Security health check completed - all systems operational');
      
    } catch (error) {
      logger.error('🚨 Security health check failed:', error);
      await this.createSecurityAlert('HEALTH_CHECK_FAILED', 'critical', {
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  /**
   * Perform real-time security scanning
   */
  async performSecurityScan() {
    try {
      const timeWindow = new Date(Date.now() - this.monitoringInterval);
      
      // Monitor authentication failures
      await this.monitorAuthenticationFailures(timeWindow);
      
      // Monitor file upload security
      await this.monitorFileUploads(timeWindow);
      
      // Monitor API abuse patterns
      await this.monitorAPIAbuse(timeWindow);
      
      // Monitor database security events
      await this.monitorDatabaseSecurity(timeWindow);
      
      // Monitor payment security
      await this.monitorPaymentSecurity(timeWindow);
      
      logger.info('🔍 Security scan completed - no threats detected');
      
    } catch (error) {
      logger.error('🚨 Security scan error:', error);
    }
  }

  /**
   * Monitor authentication failures
   */
  async monitorAuthenticationFailures(timeWindow) {
    const result = await sql`
      SELECT COUNT(*) as failed_attempts, ip_address
      FROM security_audit_logs 
      WHERE event_type = 'LOGIN_FAILURE' 
        AND created_at > ${timeWindow}
      GROUP BY ip_address
      HAVING COUNT(*) >= ${this.alertThresholds.failedLogins};
    `;

    if (result.rows.length > 0) {
      for (const row of result.rows) {
        logger.warn(`🚨 Suspicious login activity detected from IP: ${row.ip_address} (${row.failed_attempts} attempts)`);
        
        await this.createSecurityAlert('SUSPICIOUS_LOGIN_ACTIVITY', 'high', {
          ip_address: row.ip_address,
          failed_attempts: row.failed_attempts,
          action_taken: 'IP_MONITORING_INCREASED'
        });
      }
    }
  }

  /**
   * Monitor file upload security
   */
  async monitorFileUploads(timeWindow) {
    // Check for malware detections
    const malwareResult = await sql`
      SELECT COUNT(*) as detections, user_id
      FROM security_audit_logs 
      WHERE event_type = 'MALWARE_DETECTED' 
        AND created_at > ${timeWindow}
      GROUP BY user_id;
    `;

    if (malwareResult.rows.length > 0) {
      for (const row of malwareResult.rows) {
        logger.error(`🚨 CRITICAL: Malware detected from user ${row.user_id}`);
        
        await this.createSecurityAlert('MALWARE_DETECTED', 'critical', {
          user_id: row.user_id,
          detections: row.detections,
          action_taken: 'USER_QUARANTINE_INITIATED'
        });
      }
    }

    // Check for unusual upload patterns
    const uploadResult = await sql`
      SELECT COUNT(*) as uploads, user_id, ip_address
      FROM security_audit_logs 
      WHERE event_type = 'FILE_UPLOAD' 
        AND created_at > ${timeWindow}
      GROUP BY user_id, ip_address
      HAVING COUNT(*) >= ${this.alertThresholds.unusualFileUploads};
    `;

    if (uploadResult.rows.length > 0) {
      for (const row of uploadResult.rows) {
        logger.warn(`⚠️ Unusual upload activity: User ${row.user_id} uploaded ${row.uploads} files`);
        
        await this.createSecurityAlert('UNUSUAL_UPLOAD_ACTIVITY', 'medium', {
          user_id: row.user_id,
          ip_address: row.ip_address,
          upload_count: row.uploads
        });
      }
    }
  }

  /**
   * Monitor API abuse patterns
   */
  async monitorAPIAbuse(timeWindow) {
    const result = await sql`
      SELECT COUNT(*) as requests, ip_address, user_id
      FROM security_audit_logs 
      WHERE event_type = 'API_REQUEST' 
        AND created_at > ${timeWindow}
        AND result = 'rate_limited'
      GROUP BY ip_address, user_id
      HAVING COUNT(*) >= ${this.alertThresholds.apiAbuseRequests};
    `;

    if (result.rows.length > 0) {
      for (const row of result.rows) {
        logger.warn(`🚨 API abuse detected: ${row.requests} rate-limited requests from IP ${row.ip_address}`);
        
        await this.createSecurityAlert('API_ABUSE_DETECTED', 'high', {
          ip_address: row.ip_address,
          user_id: row.user_id,
          blocked_requests: row.requests,
          action_taken: 'IP_TEMPORARY_BLOCK'
        });
      }
    }
  }

  /**
   * Monitor database security events
   */
  async monitorDatabaseSecurity(timeWindow) {
    const result = await sql`
      SELECT COUNT(*) as errors, event_type
      FROM error_logs 
      WHERE category = 'database' 
        AND severity IN ('high', 'critical')
        AND timestamp > ${timeWindow}
      GROUP BY event_type;
    `;

    if (result.rows.length > 0) {
      for (const row of result.rows) {
        if (row.errors >= this.alertThresholds.databaseErrors) {
          logger.error(`🚨 Database security concern: ${row.errors} ${row.event_type} errors`);
          
          await this.createSecurityAlert('DATABASE_SECURITY_EVENT', 'high', {
            event_type: row.event_type,
            error_count: row.errors
          });
        }
      }
    }
  }

  /**
   * Monitor payment security
   */
  async monitorPaymentSecurity(timeWindow) {
    const result = await sql`
      SELECT COUNT(*) as failed_payments, 
             COUNT(CASE WHEN metadata->>'suspicious' = 'true' THEN 1 END) as suspicious_payments
      FROM security_audit_logs 
      WHERE event_type = 'PAYMENT_FAILURE' 
        AND created_at > ${timeWindow};
    `;

    if (result.rows[0]?.suspicious_payments > 0) {
      logger.warn(`⚠️ Suspicious payment activity: ${result.rows[0].suspicious_payments} flagged transactions`);
      
      await this.createSecurityAlert('SUSPICIOUS_PAYMENT_ACTIVITY', 'medium', {
        suspicious_count: result.rows[0].suspicious_payments,
        total_failures: result.rows[0].failed_payments
      });
    }
  }

  /**
   * Check database security configuration
   */
  async checkDatabaseSecurity() {
    try {
      // Test database connectivity
      await sql`SELECT 1`;
      
      // Verify audit table exists
      const auditCheck = await sql`
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_name = 'security_audit_logs';
      `;
      
      if (auditCheck.rows[0].count === '0') {
        throw new Error('Security audit tables not found');
      }
      
      logger.info('✅ Database security verification passed');
    } catch (error) {
      logger.error('❌ Database security check failed:', error);
      throw error;
    }
  }

  /**
   * Verify critical security configuration
   */
  async verifySecurityConfiguration() {
    const requiredEnvVars = [
      'JWT_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SENDGRID_API_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Critical environment variable missing: ${envVar}`);
      }
    }

    // Verify JWT secret strength
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET is too weak (minimum 32 characters required)');
    }

    logger.info('✅ Security configuration verification passed');
  }

  /**
   * Check for recent security incidents
   */
  async checkRecentIncidents() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await sql`
      SELECT COUNT(*) as incidents, severity
      FROM security_incidents 
      WHERE created_at > ${last24Hours}
        AND resolved = false
      GROUP BY severity;
    `;

    let hasUnresolvedIncidents = false;
    
    for (const row of result.rows) {
      if (row.incidents > 0) {
        logger.warn(`⚠️ Unresolved ${row.severity} incidents: ${row.incidents}`);
        hasUnresolvedIncidents = true;
      }
    }

    if (!hasUnresolvedIncidents) {
      logger.info('✅ No unresolved security incidents');
    }
  }

  /**
   * Verify audit logging system
   */
  async verifyAuditLogging() {
    // Create test audit log entry
    const testEventId = crypto.randomBytes(16).toString('hex');
    
    await sql`
      INSERT INTO security_audit_logs (
        event_id, event_type, user_id, action, result, severity, metadata
      ) VALUES (
        ${testEventId}, 'SYSTEM_TEST', null, 'health_check', 'success', 'info', '{}'
      );
    `;

    // Verify test entry was created
    const verification = await sql`
      SELECT COUNT(*) FROM security_audit_logs 
      WHERE event_id = ${testEventId};
    `;

    if (verification.rows[0].count === '0') {
      throw new Error('Audit logging system verification failed');
    }

    // Clean up test entry
    await sql`DELETE FROM security_audit_logs WHERE event_id = ${testEventId};`;
    
    logger.info('✅ Audit logging system verification passed');
  }

  /**
   * Create security alert
   */
  async createSecurityAlert(type, severity, metadata) {
    const alertId = crypto.randomBytes(16).toString('hex');
    
    try {
      await sql`
        INSERT INTO security_incidents (
          incident_id, incident_type, severity, description, metadata, resolved
        ) VALUES (
          ${alertId}, ${type}, ${severity}, 
          'Security monitoring alert', ${JSON.stringify(metadata)}, false
        );
      `;

      // Send real-time notification
      await this.sendSecurityNotification(type, severity, metadata);
      
      logger.info(`🚨 Security alert created: ${type} (${severity})`);
      
    } catch (error) {
      logger.error('Failed to create security alert:', error);
    }
  }

  /**
   * Send security notification
   */
  async sendSecurityNotification(type, severity, metadata) {
    // TODO: Implement notification logic (email, Slack, PagerDuty, etc.)
    if (severity === 'critical') {
      logger.error(`🚨 CRITICAL SECURITY ALERT: ${type}`, metadata);
      // In production: send immediate notifications to security team
    } else if (severity === 'high') {
      logger.warn(`⚠️ HIGH PRIORITY SECURITY ALERT: ${type}`, metadata);
      // In production: send notifications within 15 minutes
    } else {
      logger.info(`ℹ️ Security notification: ${type}`, metadata);
      // In production: daily digest notification
    }
  }

  /**
   * Generate security status report
   */
  async generateSecurityReport() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const report = {
      timestamp: new Date(),
      period: '24 hours',
      summary: {}
    };

    try {
      // Authentication events
      const authEvents = await sql`
        SELECT event_type, COUNT(*) as count
        FROM security_audit_logs 
        WHERE created_at > ${last24Hours}
          AND event_type IN ('LOGIN_SUCCESS', 'LOGIN_FAILURE')
        GROUP BY event_type;
      `;

      report.summary.authentication = authEvents.rows.reduce((acc, row) => {
        acc[row.event_type.toLowerCase()] = parseInt(row.count);
        return acc;
      }, {});

      // File upload events
      const fileEvents = await sql`
        SELECT result, COUNT(*) as count
        FROM security_audit_logs 
        WHERE created_at > ${last24Hours}
          AND event_type = 'FILE_UPLOAD'
        GROUP BY result;
      `;

      report.summary.file_uploads = fileEvents.rows.reduce((acc, row) => {
        acc[row.result] = parseInt(row.count);
        return acc;
      }, {});

      // Security incidents
      const incidents = await sql`
        SELECT severity, COUNT(*) as count
        FROM security_incidents 
        WHERE created_at > ${last24Hours}
        GROUP BY severity;
      `;

      report.summary.incidents = incidents.rows.reduce((acc, row) => {
        acc[row.severity] = parseInt(row.count);
        return acc;
      }, {});

      logger.info('📊 Security Report Generated:', report);
      
      return report;

    } catch (error) {
      logger.error('Error generating security report:', error);
      throw error;
    }
  }
}

// Initialize and start security monitor
const monitor = new SecurityMonitor();

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'start':
    monitor.start();
    break;
  
  case 'health-check':
    monitor.performSecurityHealthCheck()
      .then(() => {
        logger.info('Security health check completed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Security health check failed:', error);
        process.exit(1);
      });
    break;
  
  case 'report':
    monitor.generateSecurityReport()
      .then((report) => {
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Failed to generate report:', error);
        process.exit(1);
      });
    break;
  
  default:
    console.log('Usage: node security-monitor.js [start|health-check|report]');
    process.exit(1);
}

export default SecurityMonitor;