/**
 * @fileoverview Performance Alert API Endpoint - ENHANCED VERSION
 * @module api/monitoring/alert
 * 
 * CRITICAL ALERT PROCESSING SYSTEM
 * - Real-time alert ingestion from client-side monitoring
 * - Alert severity classification and routing
 * - Database storage with proper indexing
 * - External monitoring service integration
 * - Alert aggregation and deduplication
 */

import { sql } from '@vercel/postgres';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Alert severity levels
const SEVERITY_LEVELS = {
  low: 0,
  medium: 1,
  warning: 2,
  high: 3,
  critical: 4
};

// Alert throttling configuration (prevent spam)
const THROTTLE_CONFIG = {
  performance: { window: 300000, maxAlerts: 5 }, // 5 minutes, 5 alerts
  error: { window: 60000, maxAlerts: 10 }, // 1 minute, 10 alerts
  memory: { window: 300000, maxAlerts: 3 }, // 5 minutes, 3 alerts
  security: { window: 0, maxAlerts: Infinity }, // No throttling for security
  system: { window: 600000, maxAlerts: 5 } // 10 minutes, 5 alerts
};

// In-memory alert throttling cache
const alertCache = new Map();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, severity, message, metric, error, pattern, metadata = {} } = req.body;

    // Validate required fields
    if (!type || !severity || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, severity, message' 
      });
    }

    // Validate severity level
    if (!SEVERITY_LEVELS.hasOwnProperty(severity)) {
      return res.status(400).json({ 
        error: 'Invalid severity level' 
      });
    }

    // Check throttling
    if (!shouldSendAlert(type, severity)) {
      return res.status(429).json({ 
        success: false,
        message: 'Alert throttled due to rate limiting' 
      });
    }

    // Process the alert
    const alert = {
      id: generateAlertId(),
      type,
      severity,
      severityLevel: SEVERITY_LEVELS[severity],
      message,
      metric: metric || null,
      error: error || null,
      pattern: pattern || null,
      metadata,
      timestamp: new Date().toISOString(),
      source: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    // Log alert to database
    await logAlert(alert);

    // Route alert based on severity and type
    await routeAlert(alert);

    // Update alert cache for throttling
    updateAlertCache(type);

    res.status(200).json({
      success: true,
      alertId: alert.id,
      message: 'Alert processed successfully'
    });

  } catch (error) {
    console.error('Error processing alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process alert'
    });
  }
}

// Check if alert should be sent based on throttling rules
function shouldSendAlert(type, severity) {
  // Critical alerts always go through
  if (severity === 'critical') return true;

  const throttleConfig = THROTTLE_CONFIG[type] || { window: 300000, maxAlerts: 5 };
  const cacheKey = `${type}_alerts`;
  const now = Date.now();

  if (!alertCache.has(cacheKey)) {
    alertCache.set(cacheKey, []);
  }

  const alerts = alertCache.get(cacheKey);
  
  // Remove old alerts outside the window
  const recentAlerts = alerts.filter(timestamp => now - timestamp < throttleConfig.window);
  alertCache.set(cacheKey, recentAlerts);

  // Check if we've exceeded the limit
  return recentAlerts.length < throttleConfig.maxAlerts;
}

// Update alert cache for throttling
function updateAlertCache(type) {
  const cacheKey = `${type}_alerts`;
  const alerts = alertCache.get(cacheKey) || [];
  alerts.push(Date.now());
  alertCache.set(cacheKey, alerts);
}

// Log alert to database
async function logAlert(alert) {
  try {
    await sql`
      INSERT INTO monitoring_alerts (
        alert_id,
        alert_type,
        severity,
        severity_level,
        message,
        metric_data,
        error_data,
        pattern_data,
        metadata,
        source,
        timestamp
      ) VALUES (
        ${alert.id},
        ${alert.type},
        ${alert.severity},
        ${alert.severityLevel},
        ${alert.message},
        ${JSON.stringify(alert.metric)},
        ${JSON.stringify(alert.error)},
        ${JSON.stringify(alert.pattern)},
        ${JSON.stringify(alert.metadata)},
        ${alert.source},
        ${alert.timestamp}
      )
    `;
  } catch (error) {
    console.error('Failed to log alert to database:', error);
    // Don't throw - we still want to route the alert even if logging fails
  }
}

// Route alert to appropriate channels
async function routeAlert(alert) {
  const promises = [];

  // Route based on severity
  if (alert.severityLevel >= SEVERITY_LEVELS.high) {
    // Send email for high/critical alerts
    promises.push(sendEmailAlert(alert));
    
    // Send to external monitoring service
    promises.push(sendToExternalMonitoring(alert));
    
    // Create incident if critical
    if (alert.severity === 'critical') {
      promises.push(createIncident(alert));
    }
  }

  // Route based on type
  switch (alert.type) {
    case 'security':
      // Always send security alerts regardless of severity
      promises.push(sendSecurityAlert(alert));
      break;
      
    case 'error_pattern':
      // Aggregate error patterns for analysis
      promises.push(aggregateErrorPattern(alert));
      break;
      
    case 'performance':
      // Update performance dashboard
      promises.push(updatePerformanceDashboard(alert));
      break;
  }

  // Send to webhook if configured
  if (process.env.ALERT_WEBHOOK_URL) {
    promises.push(sendToWebhook(alert));
  }

  await Promise.allSettled(promises);
}

// Send email alert
async function sendEmailAlert(alert) {
  if (!process.env.ALERT_EMAIL_RECIPIENTS) return;

  const recipients = process.env.ALERT_EMAIL_RECIPIENTS.split(',');
  const subject = `[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`;
  
  const htmlContent = `
    <h2>Monitoring Alert</h2>
    <p><strong>Type:</strong> ${alert.type}</p>
    <p><strong>Severity:</strong> ${alert.severity}</p>
    <p><strong>Message:</strong> ${alert.message}</p>
    <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
    ${alert.metric ? `<p><strong>Metric Data:</strong><pre>${JSON.stringify(alert.metric, null, 2)}</pre></p>` : ''}
    ${alert.error ? `<p><strong>Error Data:</strong><pre>${JSON.stringify(alert.error, null, 2)}</pre></p>` : ''}
    <hr>
    <p><small>Alert ID: ${alert.id}</small></p>
  `;

  try {
    for (const recipient of recipients) {
      await sgMail.send({
        to: recipient,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'alerts@zencap.co',
          name: 'ZenCap Monitoring'
        },
        subject,
        html: htmlContent
      });
    }
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
}

// Send to external monitoring service
async function sendToExternalMonitoring(alert) {
  // This would integrate with services like PagerDuty, Opsgenie, etc.
  if (!process.env.EXTERNAL_MONITORING_API_KEY) return;

  try {
    await fetch(process.env.EXTERNAL_MONITORING_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXTERNAL_MONITORING_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: alert.message,
        severity: alert.severity,
        source: 'zencap-monitoring',
        metadata: alert
      })
    });
  } catch (error) {
    console.error('Failed to send to external monitoring:', error);
  }
}

// Create incident for critical alerts
async function createIncident(alert) {
  try {
    await sql`
      INSERT INTO incidents (
        incident_id,
        alert_id,
        title,
        description,
        severity,
        status,
        created_at
      ) VALUES (
        ${generateIncidentId()},
        ${alert.id},
        ${alert.message},
        ${JSON.stringify(alert)},
        ${alert.severity},
        'open',
        ${alert.timestamp}
      )
    `;
  } catch (error) {
    console.error('Failed to create incident:', error);
  }
}

// Send security alert
async function sendSecurityAlert(alert) {
  // Log to security audit
  try {
    await sql`
      INSERT INTO security_incidents (
        incident_id,
        alert_id,
        incident_type,
        severity,
        description,
        metadata,
        timestamp
      ) VALUES (
        ${generateIncidentId()},
        ${alert.id},
        ${alert.metadata.incidentType || 'unknown'},
        ${alert.severity},
        ${alert.message},
        ${JSON.stringify(alert)},
        ${alert.timestamp}
      )
    `;
  } catch (error) {
    console.error('Failed to log security incident:', error);
  }
}

// Aggregate error patterns
async function aggregateErrorPattern(alert) {
  try {
    await sql`
      INSERT INTO error_patterns (
        pattern_id,
        pattern_type,
        pattern_data,
        occurrence_count,
        first_seen,
        last_seen
      ) VALUES (
        ${generatePatternId()},
        ${alert.pattern.type},
        ${JSON.stringify(alert.pattern)},
        ${alert.pattern.group.count},
        ${alert.pattern.group.firstOccurrence},
        ${alert.pattern.group.lastOccurrence}
      )
      ON CONFLICT (pattern_type, (pattern_data->>'message'))
      DO UPDATE SET
        occurrence_count = error_patterns.occurrence_count + ${alert.pattern.group.count},
        last_seen = ${alert.pattern.group.lastOccurrence}
    `;
  } catch (error) {
    console.error('Failed to aggregate error pattern:', error);
  }
}

// Update performance dashboard
async function updatePerformanceDashboard(alert) {
  // This would update a real-time dashboard
  try {
    await sql`
      INSERT INTO performance_alerts (
        alert_id,
        metric_name,
        threshold_value,
        actual_value,
        timestamp
      ) VALUES (
        ${alert.id},
        ${alert.metric.name},
        ${alert.metric.threshold},
        ${alert.metric.duration},
        ${alert.timestamp}
      )
    `;
  } catch (error) {
    console.error('Failed to update performance dashboard:', error);
  }
}

// Send to webhook
async function sendToWebhook(alert) {
  if (!process.env.ALERT_WEBHOOK_URL) return;

  try {
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Alert-Type': alert.type,
        'X-Alert-Severity': alert.severity
      },
      body: JSON.stringify(alert)
    });
  } catch (error) {
    console.error('Failed to send to webhook:', error);
  }
}

// Generate unique alert ID
function generateAlertId() {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique incident ID
function generateIncidentId() {
  return `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique pattern ID
function generatePatternId() {
  return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}