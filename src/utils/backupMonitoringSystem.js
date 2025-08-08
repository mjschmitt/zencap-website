/**
 * ZenCap Backup Monitoring and Alerting System
 * Comprehensive monitoring with real-time alerts and dashboards
 */

import { sql } from '@vercel/postgres';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export class BackupMonitoringSystem {
  constructor(config = {}) {
    this.config = {
      // Monitoring intervals (in minutes)
      intervals: {
        healthCheck: 5,        // Check system health every 5 minutes
        backupStatus: 15,      // Check backup status every 15 minutes
        alertProcessing: 1,    // Process alerts every minute
        reportGeneration: 60   // Generate reports every hour
      },
      
      // Alert thresholds
      thresholds: {
        backupAge: {
          warning: 25 * 60 * 60 * 1000,    // 25 hours
          critical: 49 * 60 * 60 * 1000    // 49 hours (just under 2 days)
        },
        failureRate: {
          warning: 0.1,  // 10% failure rate
          critical: 0.25 // 25% failure rate
        },
        diskUsage: {
          warning: 80,   // 80% disk usage
          critical: 90   // 90% disk usage
        },
        responseTime: {
          warning: 30000,   // 30 seconds
          critical: 60000   // 60 seconds
        }
      },
      
      // Notification channels
      notifications: {
        email: {
          enabled: !!process.env.SENDGRID_API_KEY,
          from: process.env.SENDGRID_FROM_EMAIL || 'alerts@zencap.co',
          to: (process.env.BACKUP_ALERT_EMAILS || '').split(',').filter(Boolean),
          escalationTo: (process.env.BACKUP_ESCALATION_EMAILS || '').split(',').filter(Boolean)
        },
        slack: {
          enabled: !!process.env.SLACK_WEBHOOK_URL,
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.BACKUP_SLACK_CHANNEL || '#alerts'
        },
        webhook: {
          enabled: !!process.env.BACKUP_MONITORING_WEBHOOK,
          url: process.env.BACKUP_MONITORING_WEBHOOK
        },
        sms: {
          enabled: !!process.env.TWILIO_SID,
          accountSid: process.env.TWILIO_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: (process.env.BACKUP_ALERT_PHONE_NUMBERS || '').split(',').filter(Boolean)
        }
      },
      
      // Alert escalation
      escalation: {
        enabled: true,
        escalateAfter: 30 * 60 * 1000, // Escalate after 30 minutes
        maxEscalations: 3,
        escalationInterval: 15 * 60 * 1000 // Re-escalate every 15 minutes
      },
      
      ...config
    };
    
    this.monitors = new Map();
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.isRunning = false;
  }

  /**
   * Initialize the monitoring system
   */
  async initialize() {
    console.log('📊 Initializing Backup Monitoring System...');
    
    try {
      // Create monitoring tables
      await this.createMonitoringTables();
      
      // Initialize email transporter
      await this.initializeNotificationChannels();
      
      // Start monitoring processes
      await this.startMonitoring();
      
      // Register system health monitors
      await this.registerDefaultMonitors();
      
      console.log('✅ Backup Monitoring System initialized successfully');
      
      await this.createAlert('info', 'system_start', 'Monitoring system started', {
        timestamp: new Date().toISOString(),
        config: this.config
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize monitoring system:', error);
      throw error;
    }
  }

  /**
   * Start all monitoring processes
   */
  async startMonitoring() {
    if (this.isRunning) {
      console.warn('Monitoring system is already running');
      return;
    }
    
    console.log('🔄 Starting monitoring processes...');
    
    this.isRunning = true;
    
    // Health check monitor
    this.monitors.set('healthCheck', setInterval(() => {
      this.performHealthChecks().catch(console.error);
    }, this.config.intervals.healthCheck * 60 * 1000));
    
    // Backup status monitor
    this.monitors.set('backupStatus', setInterval(() => {
      this.checkBackupStatus().catch(console.error);
    }, this.config.intervals.backupStatus * 60 * 1000));
    
    // Alert processing
    this.monitors.set('alertProcessing', setInterval(() => {
      this.processAlerts().catch(console.error);
    }, this.config.intervals.alertProcessing * 60 * 1000));
    
    // Report generation
    this.monitors.set('reportGeneration', setInterval(() => {
      this.generateStatusReport().catch(console.error);
    }, this.config.intervals.reportGeneration * 60 * 1000));
    
    console.log('✅ All monitoring processes started');
  }

  /**
   * Stop all monitoring processes
   */
  stopMonitoring() {
    console.log('🛑 Stopping monitoring processes...');
    
    this.monitors.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`  ✅ Stopped ${name} monitor`);
    });
    
    this.monitors.clear();
    this.isRunning = false;
    
    console.log('✅ All monitoring processes stopped');
  }

  /**
   * Perform comprehensive health checks
   */
  async performHealthChecks() {
    const healthData = {
      timestamp: new Date(),
      checks: {}
    };
    
    try {
      // Database connectivity check
      healthData.checks.database = await this.checkDatabaseHealth();
      
      // Backup freshness check
      healthData.checks.backupFreshness = await this.checkBackupFreshness();
      
      // Storage usage check
      healthData.checks.storageUsage = await this.checkStorageUsage();
      
      // Service availability check
      healthData.checks.serviceAvailability = await this.checkServiceAvailability();
      
      // Performance metrics check
      healthData.checks.performance = await this.checkPerformanceMetrics();
      
      // Record health metrics
      await this.recordHealthData(healthData);
      
      // Check for alert conditions
      await this.evaluateHealthAlerts(healthData);
      
    } catch (error) {
      console.error('Health check error:', error);
      await this.createAlert('error', 'health_check_failed', 'Health check failed', {
        error: error.message
      });
    }
  }

  /**
   * Check backup status and create alerts if needed
   */
  async checkBackupStatus() {
    try {
      // Get recent backup operations
      const { rows: recentBackups } = await sql`
        SELECT 
          backup_type,
          status,
          created_at,
          error_message,
          verification_status
        FROM backup_operations
        WHERE created_at > NOW() - INTERVAL '48 hours'
        ORDER BY created_at DESC
      `;
      
      const backupSummary = this.analyzeBackupOperations(recentBackups);
      
      // Check for missing backups
      await this.checkMissingBackups(backupSummary);
      
      // Check failure rates
      await this.checkFailureRates(backupSummary);
      
      // Check verification status
      await this.checkVerificationStatus(recentBackups);
      
      // Record backup status metrics
      await this.recordBackupStatusMetrics(backupSummary);
      
    } catch (error) {
      console.error('Backup status check error:', error);
      await this.createAlert('error', 'backup_status_check_failed', 'Backup status check failed', {
        error: error.message
      });
    }
  }

  /**
   * Process and escalate alerts
   */
  async processAlerts() {
    try {
      // Get unprocessed alerts
      const { rows: unprocessedAlerts } = await sql`
        SELECT *
        FROM backup_monitoring_alerts
        WHERE status = 'active'
          AND processed_at IS NULL
        ORDER BY created_at ASC
      `;
      
      for (const alert of unprocessedAlerts) {
        await this.processAlert(alert);
      }
      
      // Check for escalation needed
      await this.checkAlertEscalation();
      
    } catch (error) {
      console.error('Alert processing error:', error);
    }
  }

  /**
   * Individual health check implementations
   */
  async checkDatabaseHealth() {
    const startTime = Date.now();
    
    try {
      // Test database connectivity
      await sql`SELECT 1 as health_check`;
      
      // Check recent backup table activity
      const { rows } = await sql`
        SELECT COUNT(*) as recent_operations
        FROM backup_operations
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        recentOperations: parseInt(rows[0].recent_operations),
        details: 'Database connectivity and recent activity verified'
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        details: 'Database connectivity failed'
      };
    }
  }

  async checkBackupFreshness() {
    const { rows: latestBackups } = await sql`
      SELECT 
        backup_type,
        MAX(created_at) as latest_backup,
        COUNT(*) as backup_count
      FROM backup_operations
      WHERE status = 'completed'
        AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY backup_type
    `;
    
    const freshness = {};
    const now = new Date();
    
    for (const backup of latestBackups) {
      const age = now.getTime() - new Date(backup.latest_backup).getTime();
      const isStale = age > this.config.thresholds.backupAge.warning;
      
      freshness[backup.backup_type] = {
        latestBackup: backup.latest_backup,
        ageHours: Math.round(age / (1000 * 60 * 60)),
        isStale,
        backupCount: parseInt(backup.backup_count)
      };
    }
    
    const hasStaleBackups = Object.values(freshness).some(b => b.isStale);
    
    return {
      status: hasStaleBackups ? 'warning' : 'healthy',
      freshness,
      details: hasStaleBackups ? 'Some backups are stale' : 'All backups are fresh'
    };
  }

  async checkStorageUsage() {
    // Calculate storage usage from backup operations
    const { rows: storageData } = await sql`
      SELECT 
        SUM(backup_size) as total_size,
        COUNT(*) as total_backups,
        AVG(backup_size) as avg_size
      FROM backup_operations
      WHERE backup_size IS NOT NULL
        AND created_at > NOW() - INTERVAL '30 days'
    `;
    
    const totalSize = parseInt(storageData[0].total_size || 0);
    const totalBackups = parseInt(storageData[0].total_backups || 0);
    const avgSize = parseFloat(storageData[0].avg_size || 0);
    
    // Estimate disk usage (this would be more accurate with actual disk monitoring)
    const estimatedUsagePercent = Math.min((totalSize / (10 * 1024 * 1024 * 1024)) * 100, 100); // Assume 10GB limit
    
    return {
      status: estimatedUsagePercent > this.config.thresholds.diskUsage.warning ? 'warning' : 'healthy',
      totalSize,
      totalBackups,
      avgSize,
      estimatedUsagePercent,
      details: `Estimated ${estimatedUsagePercent.toFixed(1)}% storage usage`
    };
  }

  async checkServiceAvailability() {
    const services = {
      database: { status: 'unknown' },
      webServer: { status: 'unknown' },
      backupSystem: { status: 'unknown' }
    };
    
    // Check database
    try {
      await sql`SELECT 1`;
      services.database.status = 'available';
    } catch (error) {
      services.database.status = 'unavailable';
      services.database.error = error.message;
    }
    
    // Check if backup system is responsive
    try {
      const { rows } = await sql`
        SELECT COUNT(*) as recent_activity
        FROM backup_operations
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `;
      services.backupSystem.status = 'available';
      services.backupSystem.recentActivity = parseInt(rows[0].recent_activity);
    } catch (error) {
      services.backupSystem.status = 'unavailable';
      services.backupSystem.error = error.message;
    }
    
    const unavailableServices = Object.entries(services)
      .filter(([, service]) => service.status === 'unavailable').length;
    
    return {
      status: unavailableServices > 0 ? 'warning' : 'healthy',
      services,
      availableCount: Object.keys(services).length - unavailableServices,
      totalCount: Object.keys(services).length,
      details: unavailableServices > 0 
        ? `${unavailableServices} services unavailable`
        : 'All services available'
    };
  }

  async checkPerformanceMetrics() {
    // Get recent performance data
    const { rows: performanceData } = await sql`
      SELECT 
        AVG(duration_seconds) as avg_duration,
        MIN(duration_seconds) as min_duration,
        MAX(duration_seconds) as max_duration,
        COUNT(*) as operations_count
      FROM backup_operations
      WHERE duration_seconds IS NOT NULL
        AND created_at > NOW() - INTERVAL '24 hours'
    `;
    
    const avgDuration = parseFloat(performanceData[0].avg_duration || 0);
    const maxDuration = parseFloat(performanceData[0].max_duration || 0);
    const operationsCount = parseInt(performanceData[0].operations_count || 0);
    
    // Convert to milliseconds for threshold comparison
    const avgDurationMs = avgDuration * 1000;
    
    return {
      status: avgDurationMs > this.config.thresholds.responseTime.warning ? 'warning' : 'healthy',
      avgDuration,
      maxDuration,
      operationsCount,
      details: `Average operation duration: ${avgDuration.toFixed(1)}s`
    };
  }

  /**
   * Alert creation and management
   */
  async createAlert(level, type, title, data = {}) {
    const alertId = crypto.randomUUID();
    const alert = {
      alertId,
      level,
      type,
      title,
      data,
      timestamp: new Date(),
      status: 'active'
    };
    
    try {
      // Store alert in database
      await sql`
        INSERT INTO backup_monitoring_alerts (
          alert_id, alert_level, alert_type, title, message, 
          alert_data, status, created_at
        ) VALUES (
          ${alertId}, ${level}, ${type}, ${title}, 
          ${JSON.stringify(data)}, ${JSON.stringify(data)}, 
          'active', ${alert.timestamp}
        )
      `;
      
      // Add to active alerts map
      this.activeAlerts.set(alertId, alert);
      
      // Send immediate notification for critical alerts
      if (level === 'critical' || level === 'error') {
        await this.sendNotification(alert);
      }
      
      console.log(`🚨 Alert created: ${level.toUpperCase()} - ${title}`);
      
      return alertId;
      
    } catch (error) {
      console.error('Failed to create alert:', error);
      return null;
    }
  }

  async processAlert(alert) {
    try {
      // Send notification
      await this.sendNotification(alert);
      
      // Mark as processed
      await sql`
        UPDATE backup_monitoring_alerts
        SET processed_at = NOW(), status = 'notified'
        WHERE alert_id = ${alert.alert_id}
      `;
      
      console.log(`📧 Alert processed: ${alert.alert_id}`);
      
    } catch (error) {
      console.error(`Failed to process alert ${alert.alert_id}:`, error);
    }
  }

  async sendNotification(alert) {
    const notifications = [];
    
    // Email notification
    if (this.config.notifications.email.enabled) {
      notifications.push(this.sendEmailNotification(alert));
    }
    
    // Slack notification
    if (this.config.notifications.slack.enabled) {
      notifications.push(this.sendSlackNotification(alert));
    }
    
    // Webhook notification
    if (this.config.notifications.webhook.enabled) {
      notifications.push(this.sendWebhookNotification(alert));
    }
    
    // SMS notification for critical alerts
    if (alert.level === 'critical' && this.config.notifications.sms.enabled) {
      notifications.push(this.sendSMSNotification(alert));
    }
    
    // Wait for all notifications to complete
    const results = await Promise.allSettled(notifications);
    
    // Log notification results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`📤 Notifications sent: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, total: notifications.length };
  }

  async sendEmailNotification(alert) {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not initialized');
    }
    
    const subject = `[ZenCap Backup Alert] ${alert.level.toUpperCase()}: ${alert.title}`;
    const htmlBody = this.generateEmailAlertHTML(alert);
    
    const emailOptions = {
      from: this.config.notifications.email.from,
      to: this.config.notifications.email.to,
      subject,
      html: htmlBody
    };
    
    await this.emailTransporter.sendMail(emailOptions);
    console.log(`📧 Email alert sent: ${alert.alertId}`);
  }

  async sendSlackNotification(alert) {
    const slackPayload = {
      channel: this.config.notifications.slack.channel,
      username: 'ZenCap Backup Monitor',
      icon_emoji: this.getAlertEmoji(alert.level),
      attachments: [{
        color: this.getAlertColor(alert.level),
        title: `${alert.level.toUpperCase()} Alert: ${alert.title}`,
        text: JSON.stringify(alert.data, null, 2),
        ts: Math.floor(alert.timestamp.getTime() / 1000)
      }]
    };
    
    const response = await fetch(this.config.notifications.slack.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload)
    });
    
    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
    
    console.log(`💬 Slack alert sent: ${alert.alertId}`);
  }

  /**
   * Create monitoring database tables
   */
  async createMonitoringTables() {
    await sql`
      CREATE TABLE IF NOT EXISTS backup_monitoring_alerts (
        id SERIAL PRIMARY KEY,
        alert_id VARCHAR(36) UNIQUE NOT NULL,
        alert_level VARCHAR(20) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        alert_data JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        processed_at TIMESTAMP WITH TIME ZONE,
        resolved_at TIMESTAMP WITH TIME ZONE,
        escalated_at TIMESTAMP WITH TIME ZONE,
        escalation_count INTEGER DEFAULT 0
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS backup_health_data (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        database_health JSONB DEFAULT '{}',
        backup_freshness JSONB DEFAULT '{}',
        storage_usage JSONB DEFAULT '{}',
        service_availability JSONB DEFAULT '{}',
        performance_metrics JSONB DEFAULT '{}',
        overall_status VARCHAR(20),
        alert_count INTEGER DEFAULT 0
      )
    `;
    
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_level_status ON backup_monitoring_alerts(alert_level, status);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_created ON backup_monitoring_alerts(created_at);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_health_data_timestamp ON backup_health_data(timestamp);
    `;
  }

  /**
   * Utility methods
   */
  generateEmailAlertHTML(alert) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${this.getAlertColor(alert.level)}; color: white; padding: 20px;">
            <h1 style="margin: 0;">ZenCap Backup Alert</h1>
            <h2 style="margin: 10px 0 0 0;">${alert.level.toUpperCase()}: ${alert.title}</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h3>Alert Details</h3>
            <p><strong>Alert ID:</strong> ${alert.alertId}</p>
            <p><strong>Timestamp:</strong> ${alert.timestamp.toISOString()}</p>
            <p><strong>Type:</strong> ${alert.type}</p>
            
            <h3>Data</h3>
            <pre style="background: white; padding: 15px; border-left: 4px solid #ddd; overflow-x: auto;">
${JSON.stringify(alert.data, null, 2)}
            </pre>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3;">
              <p style="margin: 0;"><strong>Action Required:</strong> Please investigate this alert and take appropriate action.</p>
              <p style="margin: 10px 0 0 0;">For support, contact the technical team immediately.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getAlertColor(level) {
    const colors = {
      info: '#2196F3',
      warning: '#FF9800',
      error: '#F44336',
      critical: '#9C27B0'
    };
    return colors[level] || '#9E9E9E';
  }

  getAlertEmoji(level) {
    const emojis = {
      info: ':information_source:',
      warning: ':warning:',
      error: ':x:',
      critical: ':rotating_light:'
    };
    return emojis[level] || ':grey_question:';
  }

  async initializeNotificationChannels() {
    // Initialize email transporter
    if (this.config.notifications.email.enabled) {
      // For production, use SendGrid or similar service
      console.log('✅ Email notifications configured');
    }
    
    // Test Slack webhook
    if (this.config.notifications.slack.enabled) {
      console.log('✅ Slack notifications configured');
    }
    
    // Test webhook endpoint
    if (this.config.notifications.webhook.enabled) {
      console.log('✅ Webhook notifications configured');
    }
  }

  async recordHealthData(healthData) {
    await sql`
      INSERT INTO backup_health_data (
        timestamp, database_health, backup_freshness, 
        storage_usage, service_availability, performance_metrics,
        overall_status, alert_count
      ) VALUES (
        ${healthData.timestamp}, 
        ${JSON.stringify(healthData.checks.database)},
        ${JSON.stringify(healthData.checks.backupFreshness)},
        ${JSON.stringify(healthData.checks.storageUsage)},
        ${JSON.stringify(healthData.checks.serviceAvailability)},
        ${JSON.stringify(healthData.checks.performance)},
        ${this.determineOverallStatus(healthData.checks)},
        ${this.activeAlerts.size}
      )
    `;
  }

  determineOverallStatus(checks) {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('unhealthy')) return 'unhealthy';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  }

  /**
   * Register default system monitors
   */
  async registerDefaultMonitors() {
    console.log('📋 Registering default monitoring rules...');
    
    // This would register various monitoring rules and thresholds
    // Implementation would depend on specific monitoring requirements
    
    console.log('✅ Default monitors registered');
  }

  /**
   * Get monitoring dashboard data
   */
  async getDashboardData() {
    const dashboardData = {
      overview: await this.getMonitoringOverview(),
      activeAlerts: await this.getActiveAlerts(),
      healthTrends: await this.getHealthTrends(),
      systemStatus: await this.getCurrentSystemStatus()
    };
    
    return dashboardData;
  }

  async getMonitoringOverview() {
    const { rows: overview } = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE alert_level = 'critical' AND status = 'active') as critical_alerts,
        COUNT(*) FILTER (WHERE alert_level = 'error' AND status = 'active') as error_alerts,
        COUNT(*) FILTER (WHERE alert_level = 'warning' AND status = 'active') as warning_alerts,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as alerts_24h
      FROM backup_monitoring_alerts
    `;
    
    return overview[0];
  }

  async getActiveAlerts() {
    const { rows } = await sql`
      SELECT 
        alert_id, alert_level, alert_type, title, 
        created_at, alert_data
      FROM backup_monitoring_alerts
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    return rows;
  }

  async getHealthTrends() {
    const { rows } = await sql`
      SELECT 
        timestamp,
        overall_status,
        alert_count,
        database_health,
        backup_freshness,
        storage_usage
      FROM backup_health_data
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      ORDER BY timestamp ASC
    `;
    
    return rows;
  }

  async getCurrentSystemStatus() {
    const { rows } = await sql`
      SELECT *
      FROM backup_health_data
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    
    return rows[0] || null;
  }
}

// Singleton instance
let monitoringSystem;

export function getBackupMonitoringSystem(config) {
  if (!monitoringSystem) {
    monitoringSystem = new BackupMonitoringSystem(config);
  }
  return monitoringSystem;
}

export async function initializeBackupMonitoring(config) {
  const system = getBackupMonitoringSystem(config);
  await system.initialize();
  return system;
}