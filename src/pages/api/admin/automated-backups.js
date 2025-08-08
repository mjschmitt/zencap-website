/**
 * Automated Backup Management API
 * Provides endpoints for managing the automated backup system
 */

import { getAutomatedBackupSystem } from '../../../utils/automatedBackupSystem.js';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const backupSystem = getAutomatedBackupSystem({
    s3Bucket: process.env.BACKUP_S3_BUCKET,
    alertEmail: process.env.BACKUP_ALERT_EMAIL,
    webhookUrl: process.env.BACKUP_WEBHOOK_URL
  });

  switch (req.method) {
    case 'GET':
      return await handleGetRequest(req, res, backupSystem);
    case 'POST':
      return await handlePostRequest(req, res, backupSystem);
    case 'DELETE':
      return await handleDeleteRequest(req, res, backupSystem);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGetRequest(req, res, backupSystem) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'status':
        return await getSystemStatus(req, res);
        
      case 'operations':
        return await getBackupOperations(req, res);
        
      case 'health':
        return await getHealthMetrics(req, res);
        
      case 'alerts':
        return await getAlerts(req, res);
        
      default:
        return await getDashboardData(req, res);
    }
  } catch (error) {
    console.error('Backup API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function handlePostRequest(req, res, backupSystem) {
  const { action } = req.body;

  try {
    switch (action) {
      case 'create-database-backup':
        const dbBackup = await backupSystem.createDatabaseBackup('manual');
        return res.status(200).json({
          success: true,
          backup: dbBackup
        });

      case 'create-file-backup':
        const fileBackup = await backupSystem.createFileBackup('manual');
        return res.status(200).json({
          success: true,
          backup: fileBackup
        });

      case 'verify-backup':
        const { backupPath, backupType } = req.body;
        if (!backupPath) {
          return res.status(400).json({
            success: false,
            error: 'Backup path is required'
          });
        }
        
        const verification = await backupSystem.verifyBackup(backupPath, backupType);
        return res.status(200).json({
          success: true,
          verification
        });

      case 'initialize-system':
        await backupSystem.initialize();
        return res.status(200).json({
          success: true,
          message: 'Backup system initialized'
        });

      case 'cleanup-old-backups':
        await backupSystem.cleanupOldBackups();
        return res.status(200).json({
          success: true,
          message: 'Cleanup completed'
        });

      case 'test-alert':
        const { level, title, message } = req.body;
        await backupSystem.sendAlert(level || 'info', title || 'Test Alert', {
          message: message || 'This is a test alert',
          timestamp: new Date().toISOString()
        });
        return res.status(200).json({
          success: true,
          message: 'Test alert sent'
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (error) {
    console.error('Backup operation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function handleDeleteRequest(req, res, backupSystem) {
  const { backupId } = req.body;
  
  if (!backupId) {
    return res.status(400).json({
      success: false,
      error: 'Backup ID is required'
    });
  }

  try {
    // Mark backup as deleted (soft delete)
    await sql`
      UPDATE backup_operations 
      SET metadata = metadata || '{"deleted": true}'::jsonb
      WHERE operation_id = ${backupId}
    `;

    return res.status(200).json({
      success: true,
      message: 'Backup marked as deleted'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getSystemStatus(req, res) {
  const status = {
    initialized: true,
    timestamp: new Date().toISOString(),
    
    // Recent backup counts
    recentBackups: await getRecentBackupCounts(),
    
    // System health
    health: await getSystemHealth(),
    
    // Configuration status
    config: {
      s3Configured: !!process.env.BACKUP_S3_BUCKET,
      alertsConfigured: !!(process.env.BACKUP_ALERT_EMAIL || process.env.BACKUP_WEBHOOK_URL),
      encryptionEnabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true'
    }
  };

  return res.status(200).json({
    success: true,
    status
  });
}

async function getBackupOperations(req, res) {
  const { limit = 50, offset = 0, status, type } = req.query;
  
  let whereClause = '';
  let params = [];
  
  if (status) {
    whereClause += ' WHERE status = $' + (params.length + 1);
    params.push(status);
  }
  
  if (type) {
    whereClause += (whereClause ? ' AND' : ' WHERE') + ' backup_type = $' + (params.length + 1);
    params.push(type);
  }

  const { rows: operations } = await sql`
    SELECT 
      operation_id,
      backup_type,
      status,
      started_at,
      completed_at,
      duration_seconds,
      backup_size,
      backup_path,
      verification_status,
      error_message,
      metadata
    FROM backup_operations
    ${sql.unsafe(whereClause)}
    ORDER BY started_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const { rows: totalCount } = await sql`
    SELECT COUNT(*) as count FROM backup_operations ${sql.unsafe(whereClause)}
  `;

  return res.status(200).json({
    success: true,
    operations,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: parseInt(totalCount[0].count)
    }
  });
}

async function getHealthMetrics(req, res) {
  const { hours = 24 } = req.query;
  
  const { rows: metrics } = await sql`
    SELECT 
      metric_name,
      metric_value,
      metric_unit,
      timestamp
    FROM backup_health_metrics
    WHERE timestamp > NOW() - INTERVAL '${hours} hours'
    ORDER BY timestamp DESC
  `;

  // Group metrics by name
  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric_name]) {
      acc[metric.metric_name] = [];
    }
    acc[metric.metric_name].push({
      value: parseFloat(metric.metric_value),
      unit: metric.metric_unit,
      timestamp: metric.timestamp
    });
    return acc;
  }, {});

  return res.status(200).json({
    success: true,
    metrics: groupedMetrics,
    period: `${hours} hours`
  });
}

async function getAlerts(req, res) {
  const { limit = 50, resolved } = req.query;
  
  let whereClause = '';
  if (resolved !== undefined) {
    whereClause = `WHERE resolved = ${resolved === 'true'}`;
  }

  const { rows: alerts } = await sql`
    SELECT 
      id,
      alert_type,
      alert_level,
      title,
      message,
      alert_data,
      resolved,
      created_at,
      resolved_at
    FROM backup_alerts
    ${sql.unsafe(whereClause)}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return res.status(200).json({
    success: true,
    alerts
  });
}

async function getDashboardData(req, res) {
  const dashboardData = {
    overview: await getBackupOverview(),
    recentOperations: await getRecentOperations(),
    healthSummary: await getHealthSummary(),
    alertsSummary: await getAlertsSummary(),
    storageSummary: await getStorageSummary()
  };

  return res.status(200).json({
    success: true,
    dashboard: dashboardData
  });
}

async function getRecentBackupCounts() {
  const { rows } = await sql`
    SELECT 
      backup_type,
      status,
      COUNT(*) as count
    FROM backup_operations
    WHERE started_at > NOW() - INTERVAL '24 hours'
    GROUP BY backup_type, status
  `;

  return rows.reduce((acc, row) => {
    if (!acc[row.backup_type]) {
      acc[row.backup_type] = {};
    }
    acc[row.backup_type][row.status] = parseInt(row.count);
    return acc;
  }, {});
}

async function getSystemHealth() {
  const { rows: latestMetrics } = await sql`
    SELECT DISTINCT ON (metric_name) 
      metric_name,
      metric_value,
      metric_unit,
      timestamp
    FROM backup_health_metrics
    WHERE timestamp > NOW() - INTERVAL '1 hour'
    ORDER BY metric_name, timestamp DESC
  `;

  return latestMetrics.reduce((acc, metric) => {
    acc[metric.metric_name] = {
      value: parseFloat(metric.metric_value),
      unit: metric.metric_unit,
      timestamp: metric.timestamp
    };
    return acc;
  }, {});
}

async function getBackupOverview() {
  const { rows: overview } = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE started_at > NOW() - INTERVAL '24 hours') as backups_24h,
      COUNT(*) FILTER (WHERE started_at > NOW() - INTERVAL '7 days') as backups_7d,
      COUNT(*) FILTER (WHERE status = 'completed' AND started_at > NOW() - INTERVAL '24 hours') as successful_24h,
      COUNT(*) FILTER (WHERE status = 'failed' AND started_at > NOW() - INTERVAL '24 hours') as failed_24h,
      AVG(backup_size) FILTER (WHERE backup_size IS NOT NULL AND started_at > NOW() - INTERVAL '7 days') as avg_backup_size,
      AVG(duration_seconds) FILTER (WHERE duration_seconds IS NOT NULL AND started_at > NOW() - INTERVAL '7 days') as avg_duration
    FROM backup_operations
  `;

  return overview[0];
}

async function getRecentOperations() {
  const { rows } = await sql`
    SELECT 
      operation_id,
      backup_type,
      status,
      started_at,
      completed_at,
      backup_size,
      verification_status
    FROM backup_operations
    ORDER BY started_at DESC
    LIMIT 10
  `;

  return rows;
}

async function getHealthSummary() {
  const { rows: healthData } = await sql`
    SELECT 
      metric_name,
      AVG(metric_value) as avg_value,
      MIN(metric_value) as min_value,
      MAX(metric_value) as max_value,
      COUNT(*) as data_points
    FROM backup_health_metrics
    WHERE timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY metric_name
  `;

  return healthData;
}

async function getAlertsSummary() {
  const { rows: alertData } = await sql`
    SELECT 
      alert_level,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE resolved = false) as unresolved_count
    FROM backup_alerts
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY alert_level
  `;

  return alertData;
}

async function getStorageSummary() {
  const { rows: storageData } = await sql`
    SELECT 
      backup_type,
      COUNT(*) as backup_count,
      SUM(backup_size) as total_size,
      AVG(backup_size) as avg_size
    FROM backup_operations
    WHERE backup_size IS NOT NULL
      AND started_at > NOW() - INTERVAL '30 days'
    GROUP BY backup_type
  `;

  return storageData;
}