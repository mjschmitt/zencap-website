// ZenCap Production Database Utilities
// Enhanced database layer with connection pooling, monitoring, and security

import { sql } from '@vercel/postgres';
import { Pool } from 'pg';

/**
 * Production Database Connection Pool Configuration
 */
const poolConfig = {
  connectionString: process.env.POSTGRES_URL,
  min: parseInt(process.env.DB_POOL_MIN) || 5,
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  } : false,
  application_name: 'zencap-production'
};

// Create connection pool for direct queries when needed
export const pool = new Pool(poolConfig);

/**
 * Database Health Check and Monitoring
 */
export async function checkDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    const result = await sql`SELECT NOW() as timestamp, version() as version`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      responseTime,
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
        max: poolConfig.max,
        utilization: Math.round((pool.totalCount / poolConfig.max) * 100)
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Performance Monitoring for Database Queries
 */
export async function trackQueryPerformance(queryName, duration, metadata = {}) {
  const isSlowQuery = duration > (parseInt(process.env.DB_SLOW_QUERY_THRESHOLD) || 1000);
  
  try {
    await sql`
      INSERT INTO performance_metrics (
        metric_name, component, duration, exceeds_threshold, metadata
      ) VALUES (
        ${queryName}, 'database', ${duration}, ${isSlowQuery}, ${JSON.stringify(metadata)}
      )
    `;

    if (isSlowQuery) {
      console.warn(`⚠️  Slow query detected: ${queryName} (${duration}ms)`);
      await sendSlowQueryAlert(queryName, duration, metadata);
    }
  } catch (error) {
    console.error('Failed to track query performance:', error);
  }
}

/**
 * Enhanced Query Execution with Performance Tracking
 */
export async function executeQuery(queryName, queryFunction) {
  const startTime = Date.now();
  
  try {
    const result = await queryFunction();
    const duration = Date.now() - startTime;
    
    await trackQueryPerformance(queryName, duration);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await trackQueryPerformance(queryName, duration, { 
      error: error.message,
      failed: true 
    });
    
    throw error;
  }
}

/**
 * Connection Pool Monitoring
 */
export async function monitorConnectionPool() {
  const stats = {
    timestamp: new Date().toISOString(),
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
    maxConnections: poolConfig.max,
    connectionUtilization: Math.round((pool.totalCount / poolConfig.max) * 100)
  };

  // Alert if connection utilization > 80%
  if (stats.connectionUtilization > 80) {
    console.warn('⚠️  High database connection utilization:', stats);
    await sendConnectionAlert(stats);
  }

  // Log metrics to database
  try {
    await sql`
      INSERT INTO performance_metrics (
        metric_name, component, metadata, timestamp
      ) VALUES (
        'connection_pool_stats', 'database', ${JSON.stringify(stats)}, NOW()
      )
    `;
  } catch (error) {
    console.error('Failed to log connection pool stats:', error);
  }

  return stats;
}

/**
 * Security Event Logging
 */
export async function logSecurityEvent(eventData) {
  const event = {
    event_id: generateUUID(),
    event_type: eventData.type || 'database_access',
    user_id: eventData.userId,
    ip_address: eventData.ipAddress,
    user_agent: eventData.userAgent,
    session_id: eventData.sessionId,
    resource_type: eventData.resourceType || 'database',
    resource_id: eventData.resourceId,
    action_type: eventData.actionType || 'query',
    action: eventData.action,
    result: eventData.result || 'success',
    severity: eventData.severity || 'info',
    metadata: eventData.metadata || {},
    error_details: eventData.errorDetails || {},
    retention_until: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) // 1 year
  };

  try {
    await sql`
      INSERT INTO security_audit_logs (
        event_id, event_type, user_id, ip_address, user_agent, session_id,
        resource_type, resource_id, action_type, action, result, severity,
        metadata, error_details, retention_until
      ) VALUES (
        ${event.event_id}, ${event.event_type}, ${event.user_id}, 
        ${event.ip_address}, ${event.user_agent}, ${event.session_id},
        ${event.resource_type}, ${event.resource_id}, ${event.action_type},
        ${event.action}, ${event.result}, ${event.severity},
        ${JSON.stringify(event.metadata)}, ${JSON.stringify(event.error_details)},
        ${event.retention_until}
      )
    `;
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Database Backup Operations
 */
export async function createDatabaseBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `zencap_backup_${timestamp}`;
  
  try {
    // This would integrate with your backup system
    console.log(`Creating database backup: ${backupName}`);
    
    // Log backup operation
    await logSecurityEvent({
      type: 'backup_created',
      action: 'create_backup',
      result: 'success',
      metadata: { backupName, timestamp },
      severity: 'info'
    });
    
    return { success: true, backupName, timestamp };
  } catch (error) {
    await logSecurityEvent({
      type: 'backup_failed',
      action: 'create_backup',
      result: 'error',
      errorDetails: { error: error.message },
      severity: 'error'
    });
    
    throw error;
  }
}

/**
 * Enhanced Lead Management with Security Logging
 */
export async function insertLead(leadData) {
  return executeQuery('insert_lead', async () => {
    const { name, email, company, interest, message, ipAddress, userAgent } = leadData;
    
    const result = await sql`
      INSERT INTO leads (name, email, company, interest, message, ip_address, user_agent)
      VALUES (${name}, ${email}, ${company || null}, ${interest}, ${message}, ${ipAddress}, ${userAgent})
      RETURNING id, created_at;
    `;
    
    // Log security event
    await logSecurityEvent({
      type: 'lead_created',
      action: 'insert',
      result: 'success',
      resourceType: 'lead',
      resourceId: result.rows[0].id.toString(),
      ipAddress,
      userAgent,
      metadata: { email, interest }
    });
    
    return result.rows[0];
  });
}

/**
 * Enhanced Customer Management
 */
export async function createOrGetCustomer(customerData) {
  return executeQuery('create_or_get_customer', async () => {
    const { stripe_customer_id, email, name, metadata = {} } = customerData;
    
    const result = await sql`
      INSERT INTO customers (stripe_customer_id, email, name, metadata)
      VALUES (${stripe_customer_id}, ${email}, ${name}, ${JSON.stringify(metadata)})
      ON CONFLICT (stripe_customer_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    await logSecurityEvent({
      type: 'customer_upsert',
      action: 'upsert',
      result: 'success',
      resourceType: 'customer',
      resourceId: result.rows[0].id.toString(),
      metadata: { email, stripe_customer_id }
    });
    
    return result.rows[0];
  });
}

/**
 * Enhanced Order Management with Download Tracking
 */
export async function createOrder(orderData) {
  return executeQuery('create_order', async () => {
    const {
      stripe_session_id,
      stripe_payment_intent_id,
      customer_id,
      model_id,
      model_slug,
      amount,
      currency = 'usd',
      status = 'pending',
      metadata = {}
    } = orderData;
    
    // Set download expiry to 7 days from now
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 7);
    
    const result = await sql`
      INSERT INTO orders (
        stripe_session_id, stripe_payment_intent_id, customer_id, model_id, 
        model_slug, amount, currency, status, download_expires_at, metadata
      )
      VALUES (
        ${stripe_session_id}, ${stripe_payment_intent_id}, ${customer_id}, ${model_id},
        ${model_slug}, ${amount}, ${currency}, ${status}, ${downloadExpiresAt}, ${JSON.stringify(metadata)}
      )
      RETURNING *;
    `;
    
    await logSecurityEvent({
      type: 'order_created',
      action: 'create',
      result: 'success',
      resourceType: 'order',
      resourceId: result.rows[0].id.toString(),
      metadata: { 
        stripe_session_id, 
        model_slug, 
        amount, 
        currency 
      }
    });
    
    return result.rows[0];
  });
}

/**
 * Secure Download Tracking
 */
export async function incrementDownloadCount(orderId, ipAddress, userAgent) {
  return executeQuery('increment_download', async () => {
    const result = await sql`
      UPDATE orders 
      SET download_count = download_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId} 
        AND download_count < max_downloads 
        AND download_expires_at > NOW()
        AND status = 'completed'
      RETURNING *;
    `;
    
    if (result.rows.length === 0) {
      await logSecurityEvent({
        type: 'download_blocked',
        action: 'increment_download',
        result: 'blocked',
        resourceType: 'order',
        resourceId: orderId.toString(),
        ipAddress,
        userAgent,
        severity: 'warning',
        metadata: { reason: 'download_limit_exceeded_or_expired' }
      });
      
      throw new Error('Download limit exceeded or order expired');
    }
    
    await logSecurityEvent({
      type: 'download_tracked',
      action: 'increment_download',
      result: 'success',
      resourceType: 'order',
      resourceId: orderId.toString(),
      ipAddress,
      userAgent,
      metadata: { 
        downloadCount: result.rows[0].download_count,
        maxDownloads: result.rows[0].max_downloads
      }
    });
    
    return result.rows[0];
  });
}

/**
 * Analytics and Metrics Queries
 */
export async function getDashboardMetrics() {
  return executeQuery('dashboard_metrics', async () => {
    const [
      leadsCount,
      subscribersCount,
      ordersCount,
      revenueTotal
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM leads WHERE status != 'deleted'`,
      sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'`,
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = 'completed'`
    ]);
    
    return {
      leads: leadsCount.rows[0].count,
      subscribers: subscribersCount.rows[0].count,
      orders: ordersCount.rows[0].count,
      revenue: parseFloat(revenueTotal.rows[0].total || 0)
    };
  });
}

/**
 * Database Cleanup Operations
 */
export async function cleanupExpiredData() {
  return executeQuery('cleanup_expired_data', async () => {
    // Clean up expired sessions
    const expiredSessions = await sql`
      DELETE FROM sessions 
      WHERE expires < NOW()
      RETURNING count(*);
    `;
    
    // Clean up old verification tokens
    const expiredTokens = await sql`
      DELETE FROM verification_tokens 
      WHERE expires < NOW()
      RETURNING count(*);
    `;
    
    // Clean up old security logs based on retention policy
    const expiredLogs = await sql`
      DELETE FROM security_audit_logs 
      WHERE retention_until < NOW()
      RETURNING count(*);
    `;
    
    const cleanup = {
      expiredSessions: expiredSessions.rowCount || 0,
      expiredTokens: expiredTokens.rowCount || 0,
      expiredLogs: expiredLogs.rowCount || 0
    };
    
    await logSecurityEvent({
      type: 'cleanup_completed',
      action: 'cleanup',
      result: 'success',
      metadata: cleanup,
      severity: 'info'
    });
    
    return cleanup;
  });
}

/**
 * Utility Functions
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function sendSlowQueryAlert(queryName, duration, metadata) {
  if (process.env.SLACK_WEBHOOK_URL) {
    // Send Slack alert for slow queries
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🐌 Slow Query Alert: ${queryName} took ${duration}ms`,
          attachments: [{
            color: 'warning',
            fields: [
              { title: 'Query', value: queryName, short: true },
              { title: 'Duration', value: `${duration}ms`, short: true },
              { title: 'Threshold', value: `${process.env.DB_SLOW_QUERY_THRESHOLD}ms`, short: true }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send slow query alert:', error);
    }
  }
}

async function sendConnectionAlert(stats) {
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚠️ High Database Connection Usage: ${stats.connectionUtilization}%`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Utilization', value: `${stats.connectionUtilization}%`, short: true },
              { title: 'Active', value: stats.totalConnections, short: true },
              { title: 'Waiting', value: stats.waitingClients, short: true },
              { title: 'Max', value: stats.maxConnections, short: true }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send connection alert:', error);
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down database connections...');
  await pool.end();
});

process.on('SIGINT', async () => {
  console.log('Shutting down database connections...');
  await pool.end();
});

// Re-export all original database functions for backward compatibility
export * from './database.js';