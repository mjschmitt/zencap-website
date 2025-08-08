/**
 * @fileoverview Production Security Monitoring System
 * @module utils/security/SecurityMonitor
 */

import { sql } from '@vercel/postgres';
import winston from 'winston';
import Redis from 'ioredis';
import crypto from 'crypto';

// Configure secure logger with encryption
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      // Encrypt sensitive data in logs
      const sanitizedMeta = sanitizeLogData(meta);
      return JSON.stringify({ timestamp, level, message, ...sanitizedMeta });
    })
  ),
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test'
    }),
    new winston.transports.File({
      filename: 'logs/security-events.log',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      tailable: true
    }),
    new winston.transports.File({
      filename: 'logs/security-alerts.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
});

// Redis client for real-time monitoring
let redis = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  });
}

/**
 * Security event types for comprehensive monitoring
 */
export const SECURITY_EVENTS = {
  // Authentication events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGIN_BRUTE_FORCE: 'login_brute_force',
  MFA_BYPASS_ATTEMPT: 'mfa_bypass_attempt',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  SUSPICIOUS_LOGIN_LOCATION: 'suspicious_login_location',
  
  // Authorization events
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  PRIVILEGE_ESCALATION: 'privilege_escalation',
  ADMIN_ACCESS: 'admin_access',
  
  // File security events
  FILE_UPLOAD_MALICIOUS: 'file_upload_malicious',
  FILE_ACCESS_UNAUTHORIZED: 'file_access_unauthorized',
  FILE_DOWNLOAD_SUSPICIOUS: 'file_download_suspicious',
  EXCEL_MACRO_DETECTED: 'excel_macro_detected',
  
  // API security events
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  API_ABUSE_DETECTED: 'api_abuse_detected',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  CSRF_ATTACK: 'csrf_attack',
  
  // System security events
  SECURITY_POLICY_VIOLATION: 'security_policy_violation',
  VULNERABILITY_EXPLOIT: 'vulnerability_exploit',
  DDOS_ATTACK: 'ddos_attack',
  UNUSUAL_TRAFFIC_PATTERN: 'unusual_traffic_pattern',
  
  // Data protection events
  GDPR_VIOLATION: 'gdpr_violation',
  DATA_EXPORT_REQUEST: 'data_export_request',
  DATA_DELETION_REQUEST: 'data_deletion_request',
  ENCRYPTION_FAILURE: 'encryption_failure'
};

/**
 * Threat levels for incident classification
 */
export const THREAT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Security monitoring configuration
 */
const SECURITY_CONFIG = {
  // Rate limiting thresholds
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
  MAX_API_REQUESTS: 100,
  API_WINDOW: 60 * 1000, // 1 minute
  
  // Suspicious activity thresholds
  MAX_FILE_UPLOADS_PER_HOUR: 20,
  MAX_DOWNLOAD_ATTEMPTS: 50,
  UNUSUAL_TRAFFIC_THRESHOLD: 1000,
  
  // Geographic security
  SUSPICIOUS_COUNTRIES: ['CN', 'RU', 'KP', 'IR'],
  
  // File security
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  DANGEROUS_EXTENSIONS: ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar'],
  
  // Session security
  MAX_CONCURRENT_SESSIONS: 3,
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
};

/**
 * Main SecurityMonitor class for production security monitoring
 */
export class SecurityMonitor {
  constructor() {
    this.initializeDatabase();
    this.startRealTimeMonitoring();
  }

  /**
   * Initialize security monitoring database tables
   */
  async initializeDatabase() {
    try {
      // Create security events table
      await sql`
        CREATE TABLE IF NOT EXISTS security_events (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(100) NOT NULL,
          threat_level VARCHAR(20) NOT NULL,
          source_ip VARCHAR(45),
          user_id INTEGER,
          user_agent TEXT,
          request_path VARCHAR(500),
          event_data JSONB,
          geo_location JSONB,
          session_id VARCHAR(128),
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          resolved BOOLEAN DEFAULT FALSE,
          resolution_notes TEXT,
          resolved_at TIMESTAMP WITH TIME ZONE,
          
          INDEX idx_security_events_type (event_type),
          INDEX idx_security_events_threat (threat_level),
          INDEX idx_security_events_timestamp (timestamp),
          INDEX idx_security_events_ip (source_ip),
          INDEX idx_security_events_user (user_id)
        )
      `;

      // Create threat intelligence table
      await sql`
        CREATE TABLE IF NOT EXISTS threat_intelligence (
          id SERIAL PRIMARY KEY,
          ip_address VARCHAR(45) NOT NULL UNIQUE,
          threat_score INTEGER DEFAULT 0,
          threat_categories JSONB,
          first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          incident_count INTEGER DEFAULT 1,
          blocked BOOLEAN DEFAULT FALSE,
          notes TEXT,
          
          INDEX idx_threat_intel_ip (ip_address),
          INDEX idx_threat_intel_score (threat_score),
          INDEX idx_threat_intel_blocked (blocked)
        )
      `;

      // Create security metrics table
      await sql`
        CREATE TABLE IF NOT EXISTS security_metrics (
          id SERIAL PRIMARY KEY,
          metric_name VARCHAR(100) NOT NULL,
          metric_value JSONB NOT NULL,
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_security_metrics_name (metric_name),
          INDEX idx_security_metrics_time (recorded_at)
        )
      `;

      logger.info('Security monitoring database initialized');
    } catch (error) {
      logger.error('Failed to initialize security monitoring database:', error);
    }
  }

  /**
   * Log security event with comprehensive context
   */
  async logSecurityEvent(eventType, threatLevel, context = {}) {
    try {
      const eventData = {
        eventType,
        threatLevel,
        sourceIp: context.ip || 'unknown',
        userId: context.userId || null,
        userAgent: context.userAgent || null,
        requestPath: context.path || null,
        sessionId: context.sessionId || null,
        eventData: context.data || {},
        geoLocation: await this.getGeoLocation(context.ip),
        timestamp: new Date()
      };

      // Store in database
      await sql`
        INSERT INTO security_events (
          event_type, threat_level, source_ip, user_id, user_agent,
          request_path, event_data, geo_location, session_id
        ) VALUES (
          ${eventType}, ${threatLevel}, ${eventData.sourceIp}, ${eventData.userId},
          ${eventData.userAgent}, ${eventData.requestPath}, ${JSON.stringify(eventData.eventData)},
          ${JSON.stringify(eventData.geoLocation)}, ${eventData.sessionId}
        )
      `;

      // Log to Winston
      logger.warn('Security Event', eventData);

      // Store in Redis for real-time monitoring
      if (redis) {
        await redis.zadd(
          'security:events:recent',
          Date.now(),
          JSON.stringify(eventData)
        );
        await redis.expire('security:events:recent', 3600); // 1 hour
      }

      // Update threat intelligence
      if (context.ip) {
        await this.updateThreatIntelligence(context.ip, eventType, threatLevel);
      }

      // Trigger alerts for high/critical threats
      if (threatLevel === THREAT_LEVELS.HIGH || threatLevel === THREAT_LEVELS.CRITICAL) {
        await this.triggerSecurityAlert(eventType, eventData);
      }

      return true;
    } catch (error) {
      logger.error('Failed to log security event:', error);
      return false;
    }
  }

  /**
   * Monitor for brute force attacks
   */
  async checkBruteForce(ip, userId = null) {
    try {
      const windowStart = new Date(Date.now() - SECURITY_CONFIG.LOGIN_ATTEMPT_WINDOW);
      
      const result = await sql`
        SELECT COUNT(*) as attempt_count
        FROM security_events
        WHERE event_type = ${SECURITY_EVENTS.LOGIN_FAILURE}
        AND source_ip = ${ip}
        AND timestamp > ${windowStart}
        ${userId ? sql`AND user_id = ${userId}` : sql``}
      `;

      const attemptCount = parseInt(result.rows[0].attempt_count);
      
      if (attemptCount >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        await this.logSecurityEvent(
          SECURITY_EVENTS.LOGIN_BRUTE_FORCE,
          THREAT_LEVELS.HIGH,
          {
            ip,
            userId,
            data: { attemptCount, windowMinutes: 15 }
          }
        );
        
        return true; // Brute force detected
      }
      
      return false;
    } catch (error) {
      logger.error('Brute force check failed:', error);
      return false;
    }
  }

  /**
   * Monitor API rate limits
   */
  async checkRateLimit(ip, path, userId = null) {
    const key = `rate_limit:${ip}:${path}`;
    
    try {
      if (redis) {
        const current = await redis.incr(key);
        
        if (current === 1) {
          await redis.expire(key, 60); // 1 minute window
        }
        
        if (current > SECURITY_CONFIG.MAX_API_REQUESTS) {
          await this.logSecurityEvent(
            SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
            THREAT_LEVELS.MEDIUM,
            {
              ip,
              userId,
              path,
              data: { requestCount: current }
            }
          );
          
          return false; // Rate limit exceeded
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      return true; // Allow request on error
    }
  }

  /**
   * Monitor for SQL injection attempts
   */
  detectSQLInjection(input, context = {}) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|(--)|(\/\*)/gi,
      /'(\s)*(OR|AND)\s*'[^']*'(\s)*=/gi,
      /'(\s)*(OR|AND)\s*\d+(\s)*=/gi,
      /\b(or|and)\b\s+\d+\s*=\s*\d+/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent(
          SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
          THREAT_LEVELS.HIGH,
          {
            ...context,
            data: { suspiciousInput: sanitizeInput(input) }
          }
        );
        return true;
      }
    }
    
    return false;
  }

  /**
   * Monitor for XSS attempts
   */
  detectXSS(input, context = {}) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent(
          SECURITY_EVENTS.XSS_ATTEMPT,
          THREAT_LEVELS.HIGH,
          {
            ...context,
            data: { suspiciousInput: sanitizeInput(input) }
          }
        );
        return true;
      }
    }
    
    return false;
  }

  /**
   * Monitor file uploads for security threats
   */
  async scanFileUpload(file, context = {}) {
    const threats = [];

    // Check file size
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      threats.push('oversized_file');
    }

    // Check file extension
    const extension = file.name.toLowerCase().match(/\.[^.]*$/)?.[0] || '';
    if (SECURITY_CONFIG.DANGEROUS_EXTENSIONS.includes(extension)) {
      threats.push('dangerous_extension');
    }

    // Check for embedded macros in Excel files
    if (['.xlsx', '.xlsm', '.xlsb'].includes(extension) && file.name.includes('macro')) {
      threats.push('excel_macro');
      
      await this.logSecurityEvent(
        SECURITY_EVENTS.EXCEL_MACRO_DETECTED,
        THREAT_LEVELS.MEDIUM,
        {
          ...context,
          data: { fileName: file.name, fileSize: file.size }
        }
      );
    }

    // Log any threats detected
    if (threats.length > 0) {
      await this.logSecurityEvent(
        SECURITY_EVENTS.FILE_UPLOAD_MALICIOUS,
        threats.length > 1 ? THREAT_LEVELS.HIGH : THREAT_LEVELS.MEDIUM,
        {
          ...context,
          data: { fileName: file.name, threats, fileSize: file.size }
        }
      );
    }

    return threats;
  }

  /**
   * Update threat intelligence for IP addresses
   */
  async updateThreatIntelligence(ip, eventType, threatLevel) {
    try {
      const scoreIncrement = {
        [THREAT_LEVELS.LOW]: 1,
        [THREAT_LEVELS.MEDIUM]: 5,
        [THREAT_LEVELS.HIGH]: 10,
        [THREAT_LEVELS.CRITICAL]: 25
      }[threatLevel] || 1;

      await sql`
        INSERT INTO threat_intelligence (ip_address, threat_score, threat_categories, incident_count)
        VALUES (${ip}, ${scoreIncrement}, ${JSON.stringify([eventType])}, 1)
        ON CONFLICT (ip_address) 
        DO UPDATE SET
          threat_score = threat_intelligence.threat_score + ${scoreIncrement},
          threat_categories = threat_intelligence.threat_categories || ${JSON.stringify([eventType])},
          incident_count = threat_intelligence.incident_count + 1,
          last_seen = CURRENT_TIMESTAMP
      `;

      // Auto-block high-threat IPs
      const result = await sql`
        SELECT threat_score FROM threat_intelligence WHERE ip_address = ${ip}
      `;
      
      if (result.rows[0]?.threat_score > 50) {
        await sql`
          UPDATE threat_intelligence 
          SET blocked = TRUE 
          WHERE ip_address = ${ip}
        `;
        
        logger.warn(`IP ${ip} auto-blocked due to high threat score`);
      }
    } catch (error) {
      logger.error('Failed to update threat intelligence:', error);
    }
  }

  /**
   * Get geolocation data for IP address
   */
  async getGeoLocation(ip) {
    if (!ip || ip === 'unknown') return null;
    
    try {
      // In production, integrate with IP geolocation service
      // For now, return placeholder data
      return {
        country: 'US',
        region: 'Unknown',
        city: 'Unknown',
        isSuspicious: SECURITY_CONFIG.SUSPICIOUS_COUNTRIES.includes('US')
      };
    } catch (error) {
      logger.error('Geolocation lookup failed:', error);
      return null;
    }
  }

  /**
   * Trigger security alerts for high-priority threats
   */
  async triggerSecurityAlert(eventType, eventData) {
    try {
      // Log critical alert
      logger.error('SECURITY ALERT', {
        eventType,
        threatLevel: eventData.threatLevel,
        sourceIp: eventData.sourceIp,
        userId: eventData.userId,
        timestamp: eventData.timestamp
      });

      // In production, integrate with:
      // - PagerDuty/OpsGenie for on-call alerts
      // - Slack/Teams for team notifications
      // - Email alerts for security team
      // - SMS for critical incidents

      // Store alert in Redis for dashboard
      if (redis) {
        await redis.lpush(
          'security:alerts:active',
          JSON.stringify({
            id: crypto.randomUUID(),
            eventType,
            ...eventData,
            alertTriggered: new Date()
          })
        );
        await redis.ltrim('security:alerts:active', 0, 99); // Keep last 100 alerts
      }

    } catch (error) {
      logger.error('Failed to trigger security alert:', error);
    }
  }

  /**
   * Start real-time security monitoring
   */
  startRealTimeMonitoring() {
    // Monitor threat intelligence updates
    setInterval(async () => {
      try {
        await this.updateSecurityMetrics();
      } catch (error) {
        logger.error('Security metrics update failed:', error);
      }
    }, 60000); // Every minute

    logger.info('Real-time security monitoring started');
  }

  /**
   * Update security metrics for dashboard
   */
  async updateSecurityMetrics() {
    try {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get recent event counts
      const hourlyEvents = await sql`
        SELECT event_type, threat_level, COUNT(*) as count
        FROM security_events
        WHERE timestamp > ${hourAgo}
        GROUP BY event_type, threat_level
      `;

      const dailyEvents = await sql`
        SELECT COUNT(*) as total_events,
               COUNT(CASE WHEN threat_level = 'high' THEN 1 END) as high_threats,
               COUNT(CASE WHEN threat_level = 'critical' THEN 1 END) as critical_threats
        FROM security_events
        WHERE timestamp > ${dayAgo}
      `;

      // Get threat intelligence summary
      const threatIntel = await sql`
        SELECT 
          COUNT(*) as total_ips,
          COUNT(CASE WHEN blocked = true THEN 1 END) as blocked_ips,
          AVG(threat_score) as avg_threat_score,
          MAX(threat_score) as max_threat_score
        FROM threat_intelligence
      `;

      const metrics = {
        hourlyEvents: hourlyEvents.rows,
        dailyStats: dailyEvents.rows[0],
        threatIntelligence: threatIntel.rows[0],
        lastUpdated: now
      };

      // Store metrics
      await sql`
        INSERT INTO security_metrics (metric_name, metric_value)
        VALUES ('real_time_summary', ${JSON.stringify(metrics)})
      `;

      // Store in Redis for dashboard
      if (redis) {
        await redis.setex('security:metrics:current', 300, JSON.stringify(metrics));
      }

    } catch (error) {
      logger.error('Failed to update security metrics:', error);
    }
  }

  /**
   * Get security dashboard data
   */
  async getDashboardData(timeRange = '24h') {
    try {
      const timeMap = {
        '1h': 1,
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      };

      const hours = timeMap[timeRange] || 24;
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Get events by type and threat level
      const eventsByType = await sql`
        SELECT event_type, threat_level, COUNT(*) as count
        FROM security_events
        WHERE timestamp > ${startTime}
        GROUP BY event_type, threat_level
        ORDER BY count DESC
      `;

      // Get top threat IPs
      const topThreats = await sql`
        SELECT ip_address, threat_score, incident_count, threat_categories, blocked
        FROM threat_intelligence
        ORDER BY threat_score DESC
        LIMIT 10
      `;

      // Get recent alerts
      const recentAlerts = await sql`
        SELECT event_type, threat_level, source_ip, timestamp, event_data
        FROM security_events
        WHERE threat_level IN ('high', 'critical')
        AND timestamp > ${startTime}
        ORDER BY timestamp DESC
        LIMIT 20
      `;

      return {
        eventsByType: eventsByType.rows,
        topThreats: topThreats.rows,
        recentAlerts: recentAlerts.rows,
        timeRange,
        generatedAt: new Date()
      };

    } catch (error) {
      logger.error('Failed to get dashboard data:', error);
      return null;
    }
  }
}

/**
 * Sanitize sensitive data for logging
 */
function sanitizeLogData(data) {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitize user input for safe logging
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .slice(0, 100) // Truncate long inputs
    .replace(/[<>'"&]/g, char => `&#${char.charCodeAt(0)};`); // HTML encode
}

// Create singleton instance
export const securityMonitor = new SecurityMonitor();

// Export individual functions for middleware use
export { SECURITY_CONFIG };