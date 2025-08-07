#!/usr/bin/env node

/**
 * ZenCap Database Health Check Script
 * Comprehensive database monitoring and alerting system
 */

import { sql } from '@vercel/postgres';
import { checkDatabaseHealth, monitorConnectionPool } from '../../src/utils/database-production.js';

const HEALTH_THRESHOLDS = {
  responseTime: 2000,        // 2 seconds max response time
  connectionUtilization: 80, // 80% max connection usage
  diskUsage: 85,            // 85% max disk usage
  slowQueries: 10,          // Alert if more than 10 slow queries in last hour
  errorRate: 5              // Alert if more than 5 errors per minute
};

const ALERT_CONFIG = {
  slack: {
    webhook: process.env.SLACK_WEBHOOK_URL,
    channel: '#database-alerts'
  },
  email: {
    enabled: process.env.EMAIL_ALERTS_ENABLED === 'true',
    recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || []
  }
};

/**
 * Comprehensive database health check
 */
async function performHealthCheck() {
  const healthReport = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
    alerts: [],
    metrics: {}
  };
  
  console.log('🏥 Starting database health check...');
  
  try {
    // Basic connectivity and response time check
    healthReport.checks.connectivity = await checkConnectivity();
    
    // Connection pool monitoring
    healthReport.checks.connectionPool = await checkConnectionPool();
    
    // Database performance metrics
    healthReport.checks.performance = await checkPerformance();
    
    // Data integrity checks
    healthReport.checks.dataIntegrity = await checkDataIntegrity();
    
    // Storage and capacity monitoring
    healthReport.checks.storage = await checkStorage();
    
    // Security and audit checks
    healthReport.checks.security = await checkSecurity();
    
    // Backup status verification
    healthReport.checks.backups = await checkBackupStatus();
    
    // Determine overall health status
    healthReport.status = determineOverallStatus(healthReport.checks);
    
    // Generate alerts for failed checks
    healthReport.alerts = generateAlerts(healthReport.checks);
    
    // Send alerts if necessary
    if (healthReport.alerts.length > 0) {
      await sendAlerts(healthReport);
    }
    
    // Log health check results
    await logHealthCheck(healthReport);
    
    console.log(`✅ Health check completed - Status: ${healthReport.status.toUpperCase()}`);
    
    return healthReport;
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    
    healthReport.status = 'critical';
    healthReport.checks.system = {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    await sendCriticalAlert(error);
    
    return healthReport;
  }
}

/**
 * Check basic database connectivity
 */
async function checkConnectivity() {
  const startTime = Date.now();
  
  try {
    const health = await checkDatabaseHealth();
    const responseTime = Date.now() - startTime;
    
    return {
      status: health.status === 'healthy' ? 'passed' : 'failed',
      responseTime,
      threshold: HEALTH_THRESHOLDS.responseTime,
      exceeds_threshold: responseTime > HEALTH_THRESHOLDS.responseTime,
      details: health,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check connection pool health
 */
async function checkConnectionPool() {
  try {
    const poolStats = await monitorConnectionPool();
    
    return {
      status: poolStats.connectionUtilization > HEALTH_THRESHOLDS.connectionUtilization ? 'warning' : 'passed',
      utilization: poolStats.connectionUtilization,
      threshold: HEALTH_THRESHOLDS.connectionUtilization,
      exceeds_threshold: poolStats.connectionUtilization > HEALTH_THRESHOLDS.connectionUtilization,
      details: poolStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check database performance metrics
 */
async function checkPerformance() {
  try {
    // Check for slow queries in the last hour
    const slowQueries = await sql`
      SELECT COUNT(*) as count 
      FROM performance_metrics 
      WHERE component = 'database' 
        AND exceeds_threshold = true 
        AND timestamp > NOW() - INTERVAL '1 hour'
    `;
    
    // Check error rate in the last minute
    const errorRate = await sql`
      SELECT COUNT(*) as count 
      FROM error_logs 
      WHERE timestamp > NOW() - INTERVAL '1 minute'
    `;
    
    // Get average response time
    const avgResponseTime = await sql`
      SELECT AVG(duration) as avg_duration 
      FROM performance_metrics 
      WHERE component = 'database' 
        AND timestamp > NOW() - INTERVAL '15 minutes'
    `;
    
    const slowQueryCount = parseInt(slowQueries.rows[0].count);
    const errorCount = parseInt(errorRate.rows[0].count);
    const avgDuration = parseFloat(avgResponseTime.rows[0].avg_duration || 0);
    
    return {
      status: (slowQueryCount > HEALTH_THRESHOLDS.slowQueries || errorCount > HEALTH_THRESHOLDS.errorRate) ? 'warning' : 'passed',
      slowQueries: slowQueryCount,
      errorRate: errorCount,
      avgResponseTime: avgDuration,
      thresholds: {
        slowQueries: HEALTH_THRESHOLDS.slowQueries,
        errorRate: HEALTH_THRESHOLDS.errorRate
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check data integrity
 */
async function checkDataIntegrity() {
  try {
    // Check for orphaned records
    const orphanedOrders = await sql`
      SELECT COUNT(*) as count 
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.id 
      WHERE c.id IS NULL
    `;
    
    const orphanedAccounts = await sql`
      SELECT COUNT(*) as count 
      FROM accounts a 
      LEFT JOIN users u ON a.user_id = u.id 
      WHERE u.id IS NULL
    `;
    
    // Check for invalid data
    const invalidEmails = await sql`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE email !~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
    `;
    
    const orphanedOrdersCount = parseInt(orphanedOrders.rows[0].count);
    const orphanedAccountsCount = parseInt(orphanedAccounts.rows[0].count);
    const invalidEmailsCount = parseInt(invalidEmails.rows[0].count);
    
    const totalIssues = orphanedOrdersCount + orphanedAccountsCount + invalidEmailsCount;
    
    return {
      status: totalIssues > 0 ? 'warning' : 'passed',
      orphanedOrders: orphanedOrdersCount,
      orphanedAccounts: orphanedAccountsCount,
      invalidEmails: invalidEmailsCount,
      totalIssues,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check storage and capacity
 */
async function checkStorage() {
  try {
    // Get database size information
    const dbSize = await sql`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        pg_database_size(current_database()) as database_size_bytes
    `;
    
    // Get largest tables
    const largestTables = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
      LIMIT 10
    `;
    
    // Get connection and lock statistics
    const stats = await sql`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity) as active_connections,
        (SELECT count(*) FROM pg_locks) as active_locks
    `;
    
    return {
      status: 'passed', // Would need actual disk usage to determine warning/failed
      databaseSize: dbSize.rows[0],
      largestTables: largestTables.rows,
      statistics: stats.rows[0],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check security and audit logs
 */
async function checkSecurity() {
  try {
    // Check for recent security events
    const securityEvents = await sql`
      SELECT 
        event_type,
        severity,
        COUNT(*) as count 
      FROM security_audit_logs 
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND severity IN ('warning', 'error', 'critical')
      GROUP BY event_type, severity
      ORDER BY count DESC
    `;
    
    // Check for failed login attempts
    const failedLogins = await sql`
      SELECT COUNT(*) as count 
      FROM security_audit_logs 
      WHERE event_type = 'authentication' 
        AND result = 'failure'
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    
    // Check for suspicious activities
    const suspiciousActivities = await sql`
      SELECT COUNT(*) as count 
      FROM security_audit_logs 
      WHERE severity = 'critical'
        AND created_at > NOW() - INTERVAL '24 hours'
    `;
    
    const failedLoginCount = parseInt(failedLogins.rows[0].count);
    const suspiciousCount = parseInt(suspiciousActivities.rows[0].count);
    
    return {
      status: (failedLoginCount > 20 || suspiciousCount > 0) ? 'warning' : 'passed',
      recentEvents: securityEvents.rows,
      failedLogins: failedLoginCount,
      suspiciousActivities: suspiciousCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check backup status
 */
async function checkBackupStatus() {
  try {
    // Check last backup from logs
    const lastBackup = await sql`
      SELECT 
        metadata->>'backupName' as backup_name,
        metadata->>'type' as backup_type,
        result,
        timestamp 
      FROM security_audit_logs 
      WHERE event_type = 'backup_operation'
        AND action = 'daily'
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const backup = lastBackup.rows[0];
    const timeSinceLastBackup = backup ? 
      (Date.now() - new Date(backup.timestamp).getTime()) : 
      Infinity;
    
    const hoursThreshold = 26; // 26 hours (allowing for 2 hour window)
    const isStale = timeSinceLastBackup > (hoursThreshold * 60 * 60 * 1000);
    
    return {
      status: (isStale || backup?.result !== 'success') ? 'warning' : 'passed',
      lastBackup: backup,
      timeSinceLastBackup: Math.floor(timeSinceLastBackup / (60 * 60 * 1000)), // hours
      threshold: hoursThreshold,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks) {
  const statuses = Object.values(checks).map(check => check.status);
  
  if (statuses.includes('failed')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'healthy';
}

/**
 * Generate alerts based on check results
 */
function generateAlerts(checks) {
  const alerts = [];
  
  for (const [checkName, result] of Object.entries(checks)) {
    if (result.status === 'failed') {
      alerts.push({
        level: 'critical',
        check: checkName,
        message: result.error || `${checkName} check failed`,
        details: result
      });
    } else if (result.status === 'warning') {
      alerts.push({
        level: 'warning',
        check: checkName,
        message: `${checkName} check returned warning`,
        details: result
      });
    }
  }
  
  return alerts;
}

/**
 * Send alerts via configured channels
 */
async function sendAlerts(healthReport) {
  console.log(`🚨 Sending ${healthReport.alerts.length} alerts...`);
  
  for (const alert of healthReport.alerts) {
    try {
      if (ALERT_CONFIG.slack.webhook) {
        await sendSlackAlert(alert, healthReport);
      }
      
      if (ALERT_CONFIG.email.enabled) {
        await sendEmailAlert(alert, healthReport);
      }
      
    } catch (error) {
      console.error(`Failed to send alert for ${alert.check}:`, error.message);
    }
  }
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(alert, healthReport) {
  const emoji = alert.level === 'critical' ? '🚨' : '⚠️';
  const color = alert.level === 'critical' ? 'danger' : 'warning';
  
  const payload = {
    channel: ALERT_CONFIG.slack.channel,
    username: 'ZenCap DB Monitor',
    icon_emoji: ':database:',
    text: `${emoji} Database ${alert.level.toUpperCase()}: ${alert.message}`,
    attachments: [{
      color,
      title: `Database Health Check - ${alert.check}`,
      fields: [
        {
          title: 'Status',
          value: healthReport.status.toUpperCase(),
          short: true
        },
        {
          title: 'Timestamp',
          value: healthReport.timestamp,
          short: true
        },
        {
          title: 'Details',
          value: JSON.stringify(alert.details, null, 2),
          short: false
        }
      ],
      footer: 'ZenCap Database Monitor',
      ts: Math.floor(Date.now() / 1000)
    }]
  };
  
  const response = await fetch(ALERT_CONFIG.slack.webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Slack API error: ${response.statusText}`);
  }
}

/**
 * Send email alert
 */
async function sendEmailAlert(alert, healthReport) {
  // Email implementation would go here
  // This would integrate with SendGrid or another email service
  console.log(`📧 Email alert would be sent to: ${ALERT_CONFIG.email.recipients.join(', ')}`);
}

/**
 * Send critical system alert
 */
async function sendCriticalAlert(error) {
  const payload = {
    text: `🚨 CRITICAL: ZenCap Database Health Check Failed`,
    attachments: [{
      color: 'danger',
      title: 'System Error',
      fields: [
        {
          title: 'Error',
          value: error.message,
          short: false
        },
        {
          title: 'Timestamp',
          value: new Date().toISOString(),
          short: true
        }
      ]
    }]
  };
  
  if (ALERT_CONFIG.slack.webhook) {
    try {
      await fetch(ALERT_CONFIG.slack.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError.message);
    }
  }
}

/**
 * Log health check results to database
 */
async function logHealthCheck(healthReport) {
  try {
    await sql`
      INSERT INTO performance_metrics (
        metric_name, component, metadata, timestamp
      ) VALUES (
        'health_check', 'database', ${JSON.stringify(healthReport)}, NOW()
      )
    `;
  } catch (error) {
    console.error('Failed to log health check results:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'check':
        const report = await performHealthCheck();
        console.log('\\n📊 Health Check Summary:');
        console.log(`Status: ${report.status.toUpperCase()}`);
        console.log(`Alerts: ${report.alerts.length}`);
        
        if (report.alerts.length > 0) {
          console.log('\\n🚨 Active Alerts:');
          report.alerts.forEach(alert => {
            console.log(`  ${alert.level.toUpperCase()}: ${alert.message}`);
          });
        }
        
        // Exit with error code if critical issues found
        if (report.status === 'critical') {
          process.exit(1);
        }
        break;
        
      case 'monitor':
        // Continuous monitoring mode
        console.log('🔄 Starting continuous monitoring...');
        setInterval(async () => {
          try {
            await performHealthCheck();
          } catch (error) {
            console.error('Health check error:', error.message);
          }
        }, 5 * 60 * 1000); // Every 5 minutes
        break;
        
      default:
        console.log('Usage: node health-check.js [check|monitor]');
        console.log('');
        console.log('Commands:');
        console.log('  check   - Run single health check');
        console.log('  monitor - Run continuous monitoring');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}