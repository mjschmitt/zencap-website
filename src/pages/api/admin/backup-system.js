/**
 * Backup System Management API
 * Central API endpoint for managing the complete backup system
 */

import { getBackupSystemManager, initializeCompleteBackupSystem } from '../../../utils/backupSystemManager.js';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetRequest(req, res);
      case 'POST':
        return await handlePostRequest(req, res);
      case 'PUT':
        return await handlePutRequest(req, res);
      case 'DELETE':
        return await handleDeleteRequest(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Backup system API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function handleGetRequest(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'status':
      return await getSystemStatus(req, res);
    
    case 'metrics':
      return await getSystemMetrics(req, res);
    
    case 'health':
      return await getSystemHealth(req, res);
    
    case 'operations':
      return await getBackupOperations(req, res);
    
    case 'alerts':
      return await getSystemAlerts(req, res);
    
    case 'tests':
      return await getTestResults(req, res);
    
    case 'verifications':
      return await getVerificationResults(req, res);
    
    case 'dashboard':
      return await getSystemDashboard(req, res);
    
    default:
      return await getSystemOverview(req, res);
  }
}

async function handlePostRequest(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'initialize':
      return await initializeSystem(req, res);
    
    case 'backup':
      return await createManualBackup(req, res);
    
    case 'test':
      return await runRestorationTest(req, res);
    
    case 'verify':
      return await verifyBackup(req, res);
    
    case 'disaster_recovery':
      return await executeDisasterRecovery(req, res);
    
    case 'health_check':
      return await performHealthCheck(req, res);
    
    case 'send_test_alert':
      return await sendTestAlert(req, res);
    
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
  }
}

async function handlePutRequest(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'update_config':
      return await updateSystemConfig(req, res);
    
    case 'resolve_alert':
      return await resolveAlert(req, res);
    
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
  }
}

async function handleDeleteRequest(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'shutdown':
      return await shutdownSystem(req, res);
    
    case 'cleanup':
      return await cleanupOldData(req, res);
    
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
  }
}

// GET endpoint implementations
async function getSystemStatus(req, res) {
  const manager = getBackupSystemManager();
  
  if (!manager) {
    return res.status(200).json({
      success: true,
      status: {
        isInitialized: false,
        status: 'not_initialized',
        message: 'Backup system has not been initialized'
      }
    });
  }
  
  const status = manager.getSystemStatus();
  
  return res.status(200).json({
    success: true,
    status,
    timestamp: new Date().toISOString()
  });
}

async function getSystemMetrics(req, res) {
  const manager = getBackupSystemManager();
  
  if (!manager || !manager.isInitialized) {
    return res.status(400).json({
      success: false,
      error: 'Backup system not initialized'
    });
  }
  
  const metrics = await manager.getSystemMetrics();
  
  return res.status(200).json({
    success: true,
    metrics,
    timestamp: new Date().toISOString()
  });
}

async function getSystemHealth(req, res) {
  const healthData = {
    timestamp: new Date().toISOString(),
    overall: 'unknown',
    components: {}
  };
  
  try {
    // Test database connectivity
    await sql`SELECT 1`;
    healthData.components.database = { status: 'healthy', responseTime: '<100ms' };
    
    // Check backup system status
    const manager = getBackupSystemManager();
    if (manager && manager.isInitialized) {
      healthData.components.backupSystem = { status: 'healthy', initialized: true };
    } else {
      healthData.components.backupSystem = { status: 'inactive', initialized: false };
    }
    
    // Check recent backup operations
    const { rows: recentBackups } = await sql`
      SELECT COUNT(*) as count
      FROM backup_operations
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND status = 'completed'
    `;
    
    const recentBackupCount = parseInt(recentBackups[0].count);
    healthData.components.recentBackups = {
      status: recentBackupCount > 0 ? 'healthy' : 'warning',
      count: recentBackupCount
    };
    
    // Determine overall health
    const componentStatuses = Object.values(healthData.components).map(c => c.status);
    if (componentStatuses.includes('unhealthy')) {
      healthData.overall = 'unhealthy';
    } else if (componentStatuses.includes('warning')) {
      healthData.overall = 'warning';
    } else {
      healthData.overall = 'healthy';
    }
    
    return res.status(200).json({
      success: true,
      health: healthData
    });
    
  } catch (error) {
    healthData.overall = 'unhealthy';
    healthData.error = error.message;
    
    return res.status(200).json({
      success: true,
      health: healthData
    });
  }
}

async function getBackupOperations(req, res) {
  const { limit = 50, offset = 0, status, type, days = 7 } = req.query;
  
  let whereClause = `WHERE created_at > NOW() - INTERVAL '${days} days'`;
  const params = [];
  
  if (status) {
    whereClause += ` AND status = $${params.length + 1}`;
    params.push(status);
  }
  
  if (type) {
    whereClause += ` AND backup_type = $${params.length + 1}`;
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
    SELECT COUNT(*) as count 
    FROM backup_operations 
    ${sql.unsafe(whereClause)}
  `;
  
  // Add summary statistics
  const { rows: summary } = await sql`
    SELECT 
      backup_type,
      status,
      COUNT(*) as count,
      AVG(backup_size) as avg_size,
      AVG(duration_seconds) as avg_duration
    FROM backup_operations
    ${sql.unsafe(whereClause)}
    GROUP BY backup_type, status
  `;
  
  return res.status(200).json({
    success: true,
    operations,
    summary: summary.reduce((acc, row) => {
      if (!acc[row.backup_type]) acc[row.backup_type] = {};
      acc[row.backup_type][row.status] = {
        count: parseInt(row.count),
        avgSize: parseFloat(row.avg_size || 0),
        avgDuration: parseFloat(row.avg_duration || 0)
      };
      return acc;
    }, {}),
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: parseInt(totalCount[0].count),
      hasMore: parseInt(offset) + parseInt(limit) < parseInt(totalCount[0].count)
    },
    filters: { status, type, days }
  });
}

async function getSystemDashboard(req, res) {
  const dashboardData = {
    timestamp: new Date().toISOString(),
    systemStatus: null,
    recentActivity: null,
    healthSummary: null,
    alerts: null,
    metrics: null
  };
  
  try {
    // Get system status
    const manager = getBackupSystemManager();
    dashboardData.systemStatus = manager ? manager.getSystemStatus() : { isInitialized: false };
    
    // Get recent backup activity
    const { rows: recentActivity } = await sql`
      SELECT 
        backup_type,
        status,
        started_at,
        duration_seconds,
        backup_size
      FROM backup_operations
      WHERE started_at > NOW() - INTERVAL '24 hours'
      ORDER BY started_at DESC
      LIMIT 10
    `;
    dashboardData.recentActivity = recentActivity;
    
    // Get health summary
    const { rows: healthSummary } = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as successful_backups,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_backups,
        COUNT(*) FILTER (WHERE verification_status = 'passed') as verified_backups,
        AVG(backup_size) as avg_backup_size,
        AVG(duration_seconds) as avg_duration
      FROM backup_operations
      WHERE started_at > NOW() - INTERVAL '7 days'
    `;
    dashboardData.healthSummary = healthSummary[0];
    
    // Get recent alerts (if monitoring system exists)
    try {
      const { rows: alerts } = await sql`
        SELECT 
          alert_level,
          title,
          created_at,
          status
        FROM backup_monitoring_alerts
        WHERE created_at > NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 5
      `;
      dashboardData.alerts = alerts;
    } catch (error) {
      // Monitoring tables might not exist yet
      dashboardData.alerts = [];
    }
    
    // Get performance metrics
    const { rows: metrics } = await sql`
      SELECT 
        DATE_TRUNC('hour', started_at) as hour,
        COUNT(*) as backup_count,
        AVG(duration_seconds) as avg_duration,
        SUM(backup_size) as total_size
      FROM backup_operations
      WHERE started_at > NOW() - INTERVAL '24 hours'
        AND status = 'completed'
      GROUP BY DATE_TRUNC('hour', started_at)
      ORDER BY hour
    `;
    dashboardData.metrics = metrics;
    
    return res.status(200).json({
      success: true,
      dashboard: dashboardData
    });
    
  } catch (error) {
    dashboardData.error = error.message;
    return res.status(200).json({
      success: true,
      dashboard: dashboardData
    });
  }
}

// POST endpoint implementations
async function initializeSystem(req, res) {
  try {
    console.log('🚀 Initializing backup system via API...');
    
    const config = req.body.config || {};
    const manager = await initializeCompleteBackupSystem(config);
    
    const status = manager.getSystemStatus();
    
    return res.status(200).json({
      success: true,
      message: 'Backup system initialized successfully',
      status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to initialize backup system:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to initialize backup system'
    });
  }
}

async function createManualBackup(req, res) {
  const { type = 'full' } = req.body;
  
  try {
    const manager = getBackupSystemManager();
    if (!manager || !manager.isInitialized) {
      return res.status(400).json({
        success: false,
        error: 'Backup system not initialized'
      });
    }
    
    console.log(`🔄 Creating manual ${type} backup via API...`);
    
    const results = await manager.createManualBackup(type);
    
    return res.status(200).json({
      success: true,
      message: `Manual ${type} backup completed successfully`,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Manual backup failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Manual backup failed'
    });
  }
}

async function runRestorationTest(req, res) {
  const { testType = 'quickTest' } = req.body;
  
  try {
    const manager = getBackupSystemManager();
    if (!manager || !manager.isInitialized) {
      return res.status(400).json({
        success: false,
        error: 'Backup system not initialized'
      });
    }
    
    console.log(`🧪 Running ${testType} restoration test via API...`);
    
    const results = await manager.runRestorationTest(testType);
    
    return res.status(200).json({
      success: true,
      message: `Restoration test (${testType}) completed`,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Restoration test failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Restoration test failed'
    });
  }
}

async function executeDisasterRecovery(req, res) {
  const { options = {} } = req.body;
  
  try {
    const manager = getBackupSystemManager();
    if (!manager || !manager.isInitialized) {
      return res.status(400).json({
        success: false,
        error: 'Backup system not initialized'
      });
    }
    
    console.log('🚨 EXECUTING DISASTER RECOVERY via API...');
    
    // This is a critical operation, add additional confirmation
    if (!options.confirmed) {
      return res.status(400).json({
        success: false,
        error: 'Disaster recovery requires explicit confirmation',
        message: 'Please add "confirmed: true" to the options to proceed'
      });
    }
    
    const results = await manager.executeDisasterRecovery(options);
    
    return res.status(200).json({
      success: true,
      message: 'Disaster recovery executed',
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Disaster recovery failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Disaster recovery failed'
    });
  }
}

async function performHealthCheck(req, res) {
  try {
    const manager = getBackupSystemManager();
    
    let healthResults = {
      systemInitialized: !!manager?.isInitialized,
      timestamp: new Date().toISOString(),
      checks: {}
    };
    
    // Basic database check
    try {
      await sql`SELECT 1`;
      healthResults.checks.database = { status: 'healthy' };
    } catch (error) {
      healthResults.checks.database = { status: 'unhealthy', error: error.message };
    }
    
    if (manager && manager.isInitialized) {
      // Additional health checks would be performed by the manager
      const systemStatus = manager.getSystemStatus();
      healthResults.systemStatus = systemStatus;
    }
    
    return res.status(200).json({
      success: true,
      health: healthResults
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Health check failed'
    });
  }
}

async function sendTestAlert(req, res) {
  const { level = 'info', title = 'Test Alert', message = 'This is a test alert' } = req.body;
  
  try {
    const manager = getBackupSystemManager();
    if (!manager || !manager.isInitialized) {
      return res.status(400).json({
        success: false,
        error: 'Backup system not initialized'
      });
    }
    
    if (manager.components.monitoring) {
      await manager.components.monitoring.createAlert(level, 'test_alert', title, {
        message,
        timestamp: new Date().toISOString(),
        source: 'api_test'
      });
      
      return res.status(200).json({
        success: true,
        message: 'Test alert sent successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Monitoring system not available'
      });
    }
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send test alert'
    });
  }
}

// Helper functions
async function getSystemOverview(req, res) {
  const overview = {
    timestamp: new Date().toISOString(),
    systemInfo: {
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime()
    },
    backupSystemStatus: null,
    quickStats: null
  };
  
  try {
    // Get system status
    const manager = getBackupSystemManager();
    overview.backupSystemStatus = manager ? manager.getSystemStatus() : { isInitialized: false };
    
    // Get quick statistics
    const { rows: quickStats } = await sql`
      SELECT 
        COUNT(*) as total_operations,
        COUNT(*) FILTER (WHERE status = 'completed') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as recent_24h,
        MAX(created_at) as last_backup
      FROM backup_operations
    `;
    overview.quickStats = quickStats[0];
    
    return res.status(200).json({
      success: true,
      overview
    });
    
  } catch (error) {
    overview.error = error.message;
    return res.status(200).json({
      success: true,
      overview
    });
  }
}