// Comprehensive Health Check and Performance Status API
// Monitors all critical systems for high-value transaction platform

import { sql } from '@vercel/postgres';
import optimizedDb from '@/utils/optimizedDatabase';

export default async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = performance.now();
  const checks = {};
  let overallStatus = 'healthy';
  const warnings = [];
  const errors = [];

  try {
    // 1. Database Connectivity Check
    try {
      checks.database = await optimizedDb.healthCheck();
      if (checks.database.status !== 'healthy') {
        overallStatus = 'degraded';
        errors.push('Database connection unhealthy');
      }
    } catch (error) {
      checks.database = { status: 'critical', error: error.message };
      overallStatus = 'critical';
      errors.push('Database connectivity failed');
    }

    // 2. Critical Table Access Check
    const criticalTables = ['models', 'orders', 'customers', 'insights', 'leads'];
    checks.tables = {};
    
    for (const table of criticalTables) {
      try {
        const tableStart = performance.now();
        await sql.query(`SELECT 1 FROM ${table} LIMIT 1`);
        checks.tables[table] = {
          status: 'accessible',
          responseTime: Math.round(performance.now() - tableStart)
        };
      } catch (error) {
        checks.tables[table] = { status: 'error', error: error.message };
        overallStatus = 'critical';
        errors.push(`Table ${table} not accessible`);
      }
    }

    // 3. Performance Indexes Check
    try {
      const indexCheck = await sql`
        SELECT 
          schemaname, 
          tablename, 
          indexname,
          idx_scan,
          idx_tup_read
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
          AND indexname LIKE 'idx_%'
        ORDER BY idx_scan DESC
        LIMIT 10
      `;
      
      checks.indexes = {
        total: indexCheck.rows.length,
        topUsed: indexCheck.rows.slice(0, 5),
        status: indexCheck.rows.length > 20 ? 'excellent' : 
                indexCheck.rows.length > 10 ? 'good' : 'needs_attention'
      };
      
      if (indexCheck.rows.length < 15) {
        warnings.push('Low number of performance indexes detected');
      }
    } catch (error) {
      checks.indexes = { status: 'error', error: error.message };
      warnings.push('Unable to check index performance');
    }

    // 4. Materialized Views Check
    try {
      const viewsCheck = await Promise.all([
        sql`SELECT COUNT(*) as count FROM mv_revenue_dashboard LIMIT 1`,
        sql`SELECT COUNT(*) as count FROM mv_model_performance LIMIT 1`
      ]);
      
      checks.materializedViews = {
        revenue_dashboard: { 
          status: 'accessible', 
          rows: viewsCheck[0].rows[0].count 
        },
        model_performance: { 
          status: 'accessible', 
          rows: viewsCheck[1].rows[0].count 
        }
      };
    } catch (error) {
      checks.materializedViews = { status: 'error', error: error.message };
      warnings.push('Materialized views not accessible - analytics may be slow');
    }

    // 5. Recent Performance Metrics
    try {
      const perfMetrics = await sql`
        SELECT 
          metric_name,
          AVG(duration) as avg_duration,
          COUNT(*) as occurrences,
          MAX(timestamp) as latest
        FROM performance_metrics
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
        GROUP BY metric_name
        ORDER BY avg_duration DESC
        LIMIT 10
      `;
      
      checks.performance = {
        recentMetrics: perfMetrics.rows,
        slowOperations: perfMetrics.rows.filter(m => parseFloat(m.avg_duration) > 100),
        status: perfMetrics.rows.some(m => parseFloat(m.avg_duration) > 500) ? 'warning' : 'good'
      };
      
      if (checks.performance.slowOperations.length > 0) {
        warnings.push(`${checks.performance.slowOperations.length} slow operations detected`);
      }
    } catch (error) {
      checks.performance = { status: 'error', error: error.message };
    }

    // 6. Error Rates Check
    try {
      const errorRates = await sql`
        SELECT 
          category,
          severity,
          COUNT(*) as error_count
        FROM error_logs
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
        GROUP BY category, severity
        ORDER BY error_count DESC
      `;
      
      const totalErrors = errorRates.rows.reduce((sum, row) => sum + parseInt(row.error_count), 0);
      checks.errors = {
        totalLastHour: totalErrors,
        byCategory: errorRates.rows,
        status: totalErrors > 50 ? 'critical' : totalErrors > 10 ? 'warning' : 'good'
      };
      
      if (totalErrors > 20) {
        warnings.push(`High error rate: ${totalErrors} errors in the last hour`);
      }
    } catch (error) {
      checks.errors = { status: 'error', error: error.message };
    }

    // 7. Business Metrics Health
    try {
      const businessMetrics = await sql`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
          SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue,
          AVG(CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (updated_at - created_at)) END) as avg_processing_time
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '1 hour'
      `;
      
      const metrics = businessMetrics.rows[0];
      const failureRate = parseFloat(metrics.failed_orders) / Math.max(1, parseFloat(metrics.total_orders));
      const avgProcessing = parseFloat(metrics.avg_processing_time) || 0;
      
      checks.business = {
        orders: {
          total: parseInt(metrics.total_orders),
          completed: parseInt(metrics.completed_orders),
          failed: parseInt(metrics.failed_orders),
          failureRate: Math.round(failureRate * 100) + '%'
        },
        revenue: parseFloat(metrics.revenue) || 0,
        avgProcessingTime: Math.round(avgProcessing) + 's',
        status: failureRate > 0.1 ? 'critical' : failureRate > 0.05 ? 'warning' : 'excellent'
      };
      
      if (failureRate > 0.05) {
        warnings.push(`High payment failure rate: ${Math.round(failureRate * 100)}%`);
      }
      
      if (avgProcessing > 30) {
        warnings.push(`Slow order processing: ${Math.round(avgProcessing)}s average`);
      }
    } catch (error) {
      checks.business = { status: 'error', error: error.message };
      warnings.push('Unable to check business metrics');
    }

    // 8. Cache Performance
    const cacheStats = optimizedDb.getPerformanceStats();
    checks.cache = {
      hitRate: cacheStats.cacheStats.hitRate + '%',
      size: cacheStats.cacheStats.size,
      status: cacheStats.cacheStats.hitRate > 70 ? 'excellent' : 
              cacheStats.cacheStats.hitRate > 50 ? 'good' : 'poor'
    };
    
    if (cacheStats.cacheStats.hitRate < 50) {
      warnings.push('Low cache hit rate - consider cache optimization');
    }

    // Determine overall status
    if (errors.length > 0) {
      overallStatus = 'critical';
    } else if (warnings.length > 3) {
      overallStatus = 'degraded';
    } else if (warnings.length > 0) {
      overallStatus = 'healthy_with_warnings';
    } else {
      overallStatus = 'excellent';
    }

    const processingTime = Math.round(performance.now() - startTime);

    // Generate health score (0-100)
    let healthScore = 100;
    healthScore -= errors.length * 20;
    healthScore -= warnings.length * 5;
    healthScore = Math.max(0, healthScore);

    const healthReport = {
      timestamp: new Date().toISOString(),
      processingTime,
      overallStatus,
      healthScore,
      
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      },
      
      checks,
      
      issues: {
        errors,
        warnings,
        total: errors.length + warnings.length
      },
      
      recommendations: generateHealthRecommendations(checks, warnings, errors),
      
      monitoring: {
        dashboardUrl: '/api/performance-monitor',
        metricsUrl: '/api/analytics',
        logsUrl: '/api/errors'
      }
    };

    // Set status code based on health
    let statusCode = 200;
    if (overallStatus === 'critical') {
      statusCode = 503; // Service Unavailable
    } else if (overallStatus === 'degraded') {
      statusCode = 206; // Partial Content
    }

    // Set cache headers - no cache for health checks
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(statusCode).json({
      success: statusCode === 200,
      health: healthReport
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return res.status(500).json({
      success: false,
      overallStatus: 'critical',
      error: 'Health check system failure',
      timestamp: new Date().toISOString(),
      processingTime: Math.round(performance.now() - startTime)
    });
  }
}

/**
 * Generate actionable health recommendations
 */
function generateHealthRecommendations(checks, warnings, errors) {
  const recommendations = [];
  
  if (errors.length > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'system',
      title: 'Resolve Critical System Errors',
      description: `${errors.length} critical errors detected`,
      actions: [
        'Check database connectivity',
        'Verify table accessibility',
        'Review system logs',
        'Contact system administrator'
      ]
    });
  }
  
  if (checks.performance?.slowOperations?.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'performance',
      title: 'Optimize Slow Operations',
      description: `${checks.performance.slowOperations.length} operations running slowly`,
      actions: [
        'Review slow query log',
        'Add missing database indexes',
        'Optimize query structure',
        'Consider result caching'
      ]
    });
  }
  
  if (checks.cache?.status === 'poor') {
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Improve Cache Performance',
      description: 'Cache hit rate is below optimal levels',
      actions: [
        'Review caching strategy',
        'Increase cache TTL for stable data',
        'Implement cache warming',
        'Monitor cache usage patterns'
      ]
    });
  }
  
  if (checks.business?.status !== 'excellent') {
    recommendations.push({
      priority: 'high',
      category: 'business',
      title: 'Address Payment Processing Issues',
      description: 'Payment failure rate or processing time needs attention',
      actions: [
        'Check Stripe integration',
        'Review payment error logs',
        'Optimize order processing flow',
        'Monitor transaction success rates'
      ]
    });
  }
  
  if (warnings.length > 3) {
    recommendations.push({
      priority: 'medium',
      category: 'maintenance',
      title: 'System Maintenance Required',
      description: 'Multiple system warnings detected',
      actions: [
        'Schedule maintenance window',
        'Update system components',
        'Clear temporary files',
        'Refresh materialized views'
      ]
    });
  }
  
  return recommendations;
}