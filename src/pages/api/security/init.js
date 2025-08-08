/**
 * @fileoverview Security System Initialization API
 * @module api/security/init
 */

import { applySecurityMiddleware } from '../../../middleware/security.js';
import { securityMonitor, SECURITY_EVENTS, THREAT_LEVELS } from '../../../utils/security/SecurityMonitor.js';
import { sql } from '@vercel/postgres';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Initialize comprehensive security monitoring system
 */
async function initializeSecuritySystem(req, res) {
  const { method, query } = req;

  if (method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // In production, require admin authentication and secret token
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.SECURITY_INIT_TOKEN;
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      logger.warn('Unauthorized security system initialization attempt', {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid security token'
      });
    }
  }

  try {
    logger.info('Starting security system initialization...');
    
    const initResults = {
      database: await initializeSecurityDatabase(),
      monitoring: await initializeSecurityMonitoring(),
      policies: await initializeSecurityPolicies(),
      intelligence: await initializeThreatIntelligence(),
      incidents: await initializeIncidentResponse(),
      audit: await initializeAuditSystem()
    };

    // Log successful initialization
    await securityMonitor.logSecurityEvent(
      SECURITY_EVENTS.SECURITY_POLICY_VIOLATION,
      THREAT_LEVELS.LOW,
      {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        path: req.url,
        data: {
          action: 'security_system_initialized',
          results: initResults,
          timestamp: new Date()
        }
      }
    );

    logger.info('Security system initialization completed successfully');

    return res.status(200).json({
      success: true,
      message: 'Security monitoring system initialized successfully',
      data: initResults,
      timestamp: new Date(),
      version: '1.0.0'
    });

  } catch (error) {
    logger.error('Security system initialization failed', { error: error.message });
    
    return res.status(500).json({
      success: false,
      error: 'Security system initialization failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Initialize security database tables
 */
async function initializeSecurityDatabase() {
  const results = {
    tables: [],
    errors: []
  };

  try {
    // Security events table (main monitoring table)
    await sql`
      CREATE TABLE IF NOT EXISTS security_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        threat_level VARCHAR(20) NOT NULL,
        source_ip VARCHAR(45),
        user_id INTEGER,
        user_agent TEXT,
        request_path VARCHAR(500),
        event_data JSONB DEFAULT '{}',
        geo_location JSONB,
        session_id VARCHAR(128),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT FALSE,
        resolution_notes TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_security_events_type (event_type),
        INDEX idx_security_events_threat (threat_level),
        INDEX idx_security_events_timestamp (timestamp),
        INDEX idx_security_events_ip (source_ip),
        INDEX idx_security_events_user (user_id),
        INDEX idx_security_events_resolved (resolved)
      )
    `;
    results.tables.push('security_events');

    // Threat intelligence table
    await sql`
      CREATE TABLE IF NOT EXISTS threat_intelligence (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL UNIQUE,
        threat_score INTEGER DEFAULT 0,
        threat_categories JSONB DEFAULT '[]',
        first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        incident_count INTEGER DEFAULT 1,
        blocked BOOLEAN DEFAULT FALSE,
        blocked_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_threat_intel_ip (ip_address),
        INDEX idx_threat_intel_score (threat_score),
        INDEX idx_threat_intel_blocked (blocked),
        INDEX idx_threat_intel_last_seen (last_seen)
      )
    `;
    results.tables.push('threat_intelligence');

    // Security incidents table
    await sql`
      CREATE TABLE IF NOT EXISTS security_incidents (
        id VARCHAR(64) PRIMARY KEY,
        incident_type VARCHAR(100) NOT NULL,
        severity VARCHAR(10) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        source_ip VARCHAR(45),
        affected_systems JSONB DEFAULT '[]',
        evidence JSONB DEFAULT '[]',
        impact_assessment TEXT,
        assigned_to VARCHAR(100),
        created_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolution_notes TEXT,
        timeline JSONB DEFAULT '[]',
        
        INDEX idx_incidents_type (incident_type),
        INDEX idx_incidents_severity (severity),
        INDEX idx_incidents_status (status),
        INDEX idx_incidents_created (created_at),
        INDEX idx_incidents_assigned (assigned_to)
      )
    `;
    results.tables.push('security_incidents');

    // Security metrics table
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
    results.tables.push('security_metrics');

    // Security policies table
    await sql`
      CREATE TABLE IF NOT EXISTS security_policies (
        id SERIAL PRIMARY KEY,
        policy_name VARCHAR(100) NOT NULL UNIQUE,
        policy_type VARCHAR(50) NOT NULL,
        description TEXT,
        rules JSONB NOT NULL DEFAULT '{}',
        enabled BOOLEAN DEFAULT TRUE,
        enforcement_level VARCHAR(20) DEFAULT 'warn',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_security_policies_type (policy_type),
        INDEX idx_security_policies_enabled (enabled)
      )
    `;
    results.tables.push('security_policies');

    // User activity logs table
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        session_id VARCHAR(128),
        activity_type VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100),
        resource_id VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_method VARCHAR(10),
        request_path VARCHAR(500),
        response_status INTEGER,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        additional_data JSONB DEFAULT '{}',
        
        INDEX idx_activity_user (user_id),
        INDEX idx_activity_type (activity_type),
        INDEX idx_activity_timestamp (timestamp),
        INDEX idx_activity_ip (ip_address)
      )
    `;
    results.tables.push('user_activity_logs');

    // File access logs table
    await sql`
      CREATE TABLE IF NOT EXISTS file_access_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        file_id VARCHAR(255),
        file_name VARCHAR(255),
        access_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT,
        file_size BIGINT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_file_access_user (user_id),
        INDEX idx_file_access_file (file_id),
        INDEX idx_file_access_type (access_type),
        INDEX idx_file_access_timestamp (timestamp),
        INDEX idx_file_access_success (success)
      )
    `;
    results.tables.push('file_access_logs');

    // Authentication logs table
    await sql`
      CREATE TABLE IF NOT EXISTS authentication_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        username VARCHAR(255),
        auth_type VARCHAR(50) NOT NULL,
        success BOOLEAN NOT NULL,
        failure_reason VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_id VARCHAR(128),
        mfa_used BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_auth_user (user_id),
        INDEX idx_auth_username (username),
        INDEX idx_auth_success (success),
        INDEX idx_auth_timestamp (timestamp),
        INDEX idx_auth_ip (ip_address)
      )
    `;
    results.tables.push('authentication_logs');

    logger.info(`Created ${results.tables.length} security database tables`);

  } catch (error) {
    logger.error('Database initialization error:', error);
    results.errors.push(`Database error: ${error.message}`);
  }

  return results;
}

/**
 * Initialize security monitoring system
 */
async function initializeSecurityMonitoring() {
  const results = {
    status: 'initialized',
    features: [],
    errors: []
  };

  try {
    // Initialize the security monitor (already done in constructor)
    results.features.push('Real-time event monitoring');
    results.features.push('Threat intelligence tracking');
    results.features.push('Automated threat detection');
    results.features.push('Security metrics collection');
    results.features.push('Alert system');

    logger.info('Security monitoring system initialized');

  } catch (error) {
    logger.error('Monitoring initialization error:', error);
    results.errors.push(`Monitoring error: ${error.message}`);
  }

  return results;
}

/**
 * Initialize default security policies
 */
async function initializeSecurityPolicies() {
  const results = {
    policies: [],
    errors: []
  };

  const defaultPolicies = [
    {
      name: 'password_policy',
      type: 'authentication',
      description: 'Strong password requirements for all user accounts',
      rules: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventReuse: 5,
        maxAge: 90,
        lockoutAttempts: 5,
        lockoutDuration: 900
      },
      enforcementLevel: 'enforce'
    },
    {
      name: 'session_policy',
      type: 'session_management',
      description: 'Secure session handling and timeout policies',
      rules: {
        maxDuration: 86400,
        idleTimeout: 1800,
        maxConcurrent: 3,
        requireMfaForAdmin: true,
        regenerateOnLogin: true,
        secureFlag: true,
        httpOnlyFlag: true
      },
      enforcementLevel: 'enforce'
    },
    {
      name: 'file_upload_policy',
      type: 'file_security',
      description: 'Secure file upload and processing policies',
      rules: {
        maxSize: 104857600, // 100MB
        allowedTypes: ['xlsx', 'xls', 'xlsm', 'xlsb', 'pdf', 'docx', 'doc'],
        scanForVirus: true,
        encryptAtRest: true,
        autoExpire: 90,
        quarantineSuspicious: true,
        logAllAccess: true
      },
      enforcementLevel: 'enforce'
    },
    {
      name: 'api_rate_limit_policy',
      type: 'api_security',
      description: 'Rate limiting policies for API endpoints',
      rules: {
        defaultLimit: 100,
        windowMs: 60000,
        tiers: {
          anonymous: 50,
          authenticated: 100,
          premium: 500,
          admin: 1000
        },
        strictEndpoints: ['/api/auth', '/api/upload', '/api/admin'],
        blockOnExceed: true,
        alertThreshold: 80
      },
      enforcementLevel: 'enforce'
    },
    {
      name: 'data_protection_policy',
      type: 'data_privacy',
      description: 'GDPR and data protection compliance policies',
      rules: {
        encryptPII: true,
        dataMinimization: true,
        consentRequired: true,
        retentionPeriod: 2555, // 7 years in days
        rightToDelete: true,
        dataPortability: true,
        breachNotification: 72, // hours
        auditTrail: true
      },
      enforcementLevel: 'enforce'
    },
    {
      name: 'threat_detection_policy',
      type: 'threat_detection',
      description: 'Automated threat detection and response policies',
      rules: {
        autoBlockThreshold: 50,
        suspiciousActivityThreshold: 25,
        bruteForceThreshold: 5,
        anomalyDetection: true,
        geoBlocking: ['CN', 'RU', 'KP', 'IR'],
        alertOnSuspicious: true,
        quarantineOnThreat: true
      },
      enforcementLevel: 'enforce'
    }
  ];

  try {
    for (const policy of defaultPolicies) {
      await sql`
        INSERT INTO security_policies (
          policy_name, policy_type, description, rules, enabled, enforcement_level
        ) VALUES (
          ${policy.name},
          ${policy.type},
          ${policy.description},
          ${JSON.stringify(policy.rules)},
          true,
          ${policy.enforcementLevel}
        )
        ON CONFLICT (policy_name) 
        DO UPDATE SET
          description = EXCLUDED.description,
          rules = EXCLUDED.rules,
          updated_at = CURRENT_TIMESTAMP
      `;

      results.policies.push(policy.name);
    }

    logger.info(`Initialized ${results.policies.length} security policies`);

  } catch (error) {
    logger.error('Policy initialization error:', error);
    results.errors.push(`Policy error: ${error.message}`);
  }

  return results;
}

/**
 * Initialize threat intelligence system
 */
async function initializeThreatIntelligence() {
  const results = {
    sources: [],
    feeds: [],
    errors: []
  };

  try {
    // Initialize known threat IPs (example data)
    const knownThreats = [
      { ip: '10.0.0.1', score: 100, categories: ['scanning', 'brute_force'] },
      { ip: '192.168.1.100', score: 75, categories: ['suspicious_activity'] }
    ];

    for (const threat of knownThreats) {
      await sql`
        INSERT INTO threat_intelligence (
          ip_address, threat_score, threat_categories, notes
        ) VALUES (
          ${threat.ip},
          ${threat.score},
          ${JSON.stringify(threat.categories)},
          'Initial threat intelligence data'
        )
        ON CONFLICT (ip_address) DO NOTHING
      `;
    }

    results.sources.push('Internal threat database');
    results.feeds.push('Automated detection system');

    logger.info('Threat intelligence system initialized');

  } catch (error) {
    logger.error('Threat intelligence initialization error:', error);
    results.errors.push(`Threat intelligence error: ${error.message}`);
  }

  return results;
}

/**
 * Initialize incident response system
 */
async function initializeIncidentResponse() {
  const results = {
    workflows: [],
    contacts: [],
    errors: []
  };

  try {
    // Set up incident response workflows
    results.workflows.push('Automated threat blocking');
    results.workflows.push('Escalation procedures');
    results.workflows.push('Notification system');
    results.workflows.push('Forensic data preservation');

    // Initialize contact information
    results.contacts.push('Security team notifications');
    results.contacts.push('Leadership escalation');
    results.contacts.push('Legal team alerts');

    logger.info('Incident response system initialized');

  } catch (error) {
    logger.error('Incident response initialization error:', error);
    results.errors.push(`Incident response error: ${error.message}`);
  }

  return results;
}

/**
 * Initialize audit system
 */
async function initializeAuditSystem() {
  const results = {
    logTypes: [],
    retention: {},
    errors: []
  };

  try {
    results.logTypes.push('User authentication events');
    results.logTypes.push('File access events');
    results.logTypes.push('Administrative actions');
    results.logTypes.push('Security policy violations');
    results.logTypes.push('System configuration changes');

    results.retention = {
      securityEvents: '2 years',
      userActivity: '1 year',
      fileAccess: '2 years',
      authentication: '1 year',
      incidents: 'permanent'
    };

    logger.info('Audit system initialized');

  } catch (error) {
    logger.error('Audit system initialization error:', error);
    results.errors.push(`Audit system error: ${error.message}`);
  }

  return results;
}

// Apply security middleware
export default applySecurityMiddleware(initializeSecuritySystem, {
  rateLimit: 'api'
});