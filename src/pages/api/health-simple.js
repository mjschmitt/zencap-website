// Simplified health check endpoint that handles missing tables gracefully
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const checks = {
    api: 'operational',
    timestamp: new Date().toISOString()
  };
  const warnings = [];
  const errors = [];
  let overallStatus = 'healthy';

  try {
    // 1. Basic database connectivity check
    try {
      await sql`SELECT 1 as health_check`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      errors.push('Database connection failed');
      overallStatus = 'degraded';
    }

    // 2. Check critical tables (gracefully handle missing ones)
    const criticalTables = ['models', 'orders', 'customers', 'insights', 'leads'];
    checks.tables = {};
    
    for (const table of criticalTables) {
      try {
        const tableStart = Date.now();
        await sql.query(`SELECT 1 FROM ${table} LIMIT 1`);
        checks.tables[table] = {
          status: 'accessible',
          responseTime: Date.now() - tableStart
        };
      } catch (error) {
        // Table might not exist, which is ok for health check
        if (error.message.includes('does not exist')) {
          checks.tables[table] = { status: 'not_created' };
          warnings.push(`Table ${table} not yet created`);
        } else {
          checks.tables[table] = { status: 'error' };
          warnings.push(`Table ${table} access error`);
        }
      }
    }

    // 3. Check materialized views (optional, don't fail if missing)
    try {
      await sql`SELECT 1 FROM mv_model_performance LIMIT 1`;
      checks.materializedViews = 'available';
    } catch (error) {
      checks.materializedViews = 'not_available';
      warnings.push('Materialized views not set up (run /api/optimize-database)');
    }

    // 4. Basic performance check
    checks.performance = {
      apiResponseTime: Date.now() - startTime,
      status: Date.now() - startTime < 1000 ? 'good' : 'slow'
    };

    // 5. Memory usage
    const memUsage = process.memoryUsage();
    checks.memory = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      status: memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'high'
    };

    // 6. Environment check
    checks.environment = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.round(process.uptime()) + ' seconds',
      env: process.env.NODE_ENV || 'development'
    };

    // Determine overall health score
    let healthScore = 100;
    healthScore -= errors.length * 20;
    healthScore -= warnings.length * 5;
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Determine status based on score
    if (healthScore < 50) {
      overallStatus = 'critical';
    } else if (healthScore < 70) {
      overallStatus = 'degraded';
    } else if (healthScore < 90) {
      overallStatus = 'healthy_with_warnings';
    } else {
      overallStatus = 'healthy';
    }

    // Build response
    const response = {
      status: overallStatus,
      healthScore,
      checks,
      issues: {
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        total: errors.length + warnings.length
      },
      processingTime: Date.now() - startTime + 'ms'
    };

    // Set appropriate status code
    const statusCode = overallStatus === 'critical' ? 503 : 
                      overallStatus === 'degraded' ? 206 : 200;

    // No cache for health checks
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime + 'ms'
    });
  }
}