// Performance Monitoring & Database Health API
// Provides real-time metrics for high-value transaction platform

import { sql } from '@vercel/postgres';
import optimizedDb from '@/utils/optimizedDatabase';

export default async function handler(req, res) {
  const { method } = req;

  // Performance monitoring dashboard
  if (method === 'GET') {
    try {
      const startTime = performance.now();
      
      // Run parallel health checks and metrics collection
      const [
        dbHealth,
        performanceStats,
        criticalMetrics,
        slowQueries,
        errorRates,
        connectionStats
      ] = await Promise.all([
        // Database health check
        optimizedDb.healthCheck(),
        
        // Get performance statistics from optimized DB
        Promise.resolve(optimizedDb.getPerformanceStats()),
        
        // Critical business metrics
        sql`
          SELECT 
            COUNT(*) as total_orders,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
            AVG(CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (updated_at - created_at)) END) as avg_processing_time,
            SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
          FROM orders
          WHERE created_at >= NOW() - INTERVAL '1 hour'
        `,
        
        // Recent slow queries
        sql`
          SELECT metric_name, component, duration, metadata, timestamp
          FROM performance_metrics
          WHERE exceeds_threshold = true 
            AND timestamp >= NOW() - INTERVAL '1 hour'
          ORDER BY timestamp DESC
          LIMIT 10
        `,
        
        // Error rates by category
        sql`
          SELECT 
            category,
            severity,
            COUNT(*) as error_count,
            MAX(timestamp) as latest_error
          FROM error_logs
          WHERE timestamp >= NOW() - INTERVAL '1 hour'
          GROUP BY category, severity
          ORDER BY error_count DESC
        `,
        
        // Connection and resource usage
        sql`
          SELECT 
            COUNT(DISTINCT session_id) as active_sessions,
            COUNT(*) as total_requests,
            COUNT(CASE WHEN event_type = 'FILE_UPLOAD' THEN 1 END) as file_uploads,
            COUNT(CASE WHEN event_type = 'PAYMENT_PROCESSED' THEN 1 END) as payments
          FROM user_analytics
          WHERE timestamp >= NOW() - INTERVAL '1 hour'
        `
      ]);

      const processingTime = Math.round(performance.now() - startTime);

      // Calculate performance scores
      const performanceScore = calculatePerformanceScore({
        dbHealth,
        performanceStats,
        criticalMetrics: criticalMetrics.rows[0],
        slowQueries: slowQueries.rows,
        errorRates: errorRates.rows
      });

      // Generate alerts if necessary
      const alerts = generateAlerts({
        dbHealth,
        criticalMetrics: criticalMetrics.rows[0],
        slowQueries: slowQueries.rows,
        errorRates: errorRates.rows,
        performanceScore
      });

      const monitoringData = {
        timestamp: new Date().toISOString(),
        processingTime,
        overallStatus: determineOverallStatus(performanceScore, alerts),
        performanceScore,
        
        database: {
          health: dbHealth,
          stats: performanceStats,
          criticalMetrics: criticalMetrics.rows[0]
        },
        
        performance: {
          slowQueries: slowQueries.rows,
          queryStats: performanceStats.queryStats,
          cachePerformance: performanceStats.cacheStats
        },
        
        errors: {
          recentErrors: errorRates.rows,
          errorRate: calculateErrorRate(errorRates.rows, connectionStats.rows[0])
        },
        
        business: {
          orderMetrics: criticalMetrics.rows[0],
          activeUsers: connectionStats.rows[0],
          revenueStatus: analyzeRevenueStatus(criticalMetrics.rows[0])
        },
        
        alerts,
        
        recommendations: generateRecommendations({
          performanceScore,
          dbHealth,
          slowQueries: slowQueries.rows,
          errorRates: errorRates.rows
        })
      };

      // Set cache headers for monitoring dashboard
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return res.status(200).json({
        success: true,
        data: monitoringData
      });

    } catch (error) {
      console.error('Performance monitoring error:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to collect performance metrics',
        timestamp: new Date().toISOString(),
        overallStatus: 'critical'
      });
    }
  }

  // Performance optimization controls
  if (method === 'POST') {
    const { action, params = {} } = req.body;

    try {
      let result = {};

      switch (action) {
        case 'clear_cache':
          optimizedDb.clearCache(params.pattern);
          result = { message: 'Cache cleared successfully', pattern: params.pattern };
          break;

        case 'refresh_materialized_views':
          await Promise.all([
            sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_dashboard`,
            sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_model_performance`
          ]);
          result = { message: 'Materialized views refreshed successfully' };
          break;

        case 'analyze_tables':
          const tables = params.tables || ['models', 'orders', 'customers', 'insights'];
          for (const table of tables) {
            await sql.query(`ANALYZE ${table}`);
          }
          result = { message: `Analyzed ${tables.length} tables`, tables };
          break;

        case 'vacuum_tables':
          const vacuumTables = params.tables || ['orders', 'leads', 'user_analytics'];
          for (const table of vacuumTables) {
            await sql.query(`VACUUM ANALYZE ${table}`);
          }
          result = { message: `Vacuumed ${vacuumTables.length} tables`, tables: vacuumTables };
          break;

        case 'run_diagnostics':
          result = await runSystemDiagnostics();
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action specified'
          });
      }

      return res.status(200).json({
        success: true,
        action,
        result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Performance action '${action}' failed:`, error);
      
      return res.status(500).json({
        success: false,
        error: `Failed to execute ${action}`,
        details: error.message
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Calculate overall performance score (0-100)
 */
function calculatePerformanceScore({ dbHealth, performanceStats, criticalMetrics, slowQueries, errorRates }) {
  let score = 100;
  
  // Database health (30 points)
  if (dbHealth.status !== 'healthy') {
    score -= 30;
  } else if (dbHealth.responseTime > 100) {
    score -= 15;
  } else if (dbHealth.responseTime > 50) {
    score -= 10;
  }
  
  // Query performance (25 points)
  const avgQueryTime = performanceStats.queryStats 
    ? Object.values(performanceStats.queryStats).reduce((sum, stat) => sum + stat.avgTime, 0) / Object.keys(performanceStats.queryStats).length
    : 0;
    
  if (avgQueryTime > 500) {
    score -= 25;
  } else if (avgQueryTime > 200) {
    score -= 15;
  } else if (avgQueryTime > 100) {
    score -= 10;
  }
  
  // Error rates (20 points)
  const totalErrors = errorRates.reduce((sum, error) => sum + parseInt(error.error_count), 0);
  if (totalErrors > 50) {
    score -= 20;
  } else if (totalErrors > 20) {
    score -= 15;
  } else if (totalErrors > 10) {
    score -= 10;
  }
  
  // Business metrics (15 points)
  const failedOrderRate = criticalMetrics.failed_orders / Math.max(1, criticalMetrics.total_orders);
  if (failedOrderRate > 0.1) {
    score -= 15;
  } else if (failedOrderRate > 0.05) {
    score -= 10;
  } else if (failedOrderRate > 0.02) {
    score -= 5;
  }
  
  // Slow queries (10 points)
  if (slowQueries.length > 10) {
    score -= 10;
  } else if (slowQueries.length > 5) {
    score -= 5;
  }
  
  return Math.max(0, Math.round(score));
}

/**
 * Generate performance alerts
 */
function generateAlerts({ dbHealth, criticalMetrics, slowQueries, errorRates, performanceScore }) {
  const alerts = [];
  
  // Critical database health
  if (dbHealth.status !== 'healthy') {
    alerts.push({
      level: 'critical',
      category: 'database',
      message: 'Database connection unhealthy',
      details: dbHealth.error,
      action: 'Check database connection and server status'
    });
  }
  
  // High error rates
  const totalErrors = errorRates.reduce((sum, error) => sum + parseInt(error.error_count), 0);
  if (totalErrors > 20) {
    alerts.push({
      level: 'warning',
      category: 'errors',
      message: `High error rate detected: ${totalErrors} errors in the last hour`,
      action: 'Review error logs and investigate root causes'
    });
  }
  
  // Failed payment processing
  const failedOrderRate = criticalMetrics.failed_orders / Math.max(1, criticalMetrics.total_orders);
  if (failedOrderRate > 0.05) {
    alerts.push({
      level: 'critical',
      category: 'payments',
      message: `High payment failure rate: ${Math.round(failedOrderRate * 100)}%`,
      action: 'Check Stripe integration and payment processing pipeline'
    });
  }
  
  // Slow query performance
  if (slowQueries.length > 5) {
    alerts.push({
      level: 'warning',
      category: 'performance',
      message: `${slowQueries.length} slow queries detected`,
      action: 'Review and optimize slow queries, consider adding indexes'
    });
  }
  
  // Overall performance degradation
  if (performanceScore < 70) {
    alerts.push({
      level: performanceScore < 50 ? 'critical' : 'warning',
      category: 'performance',
      message: `Overall performance score low: ${performanceScore}/100`,
      action: 'Review all performance metrics and take corrective actions'
    });
  }
  
  return alerts;
}

/**
 * Determine overall system status
 */
function determineOverallStatus(performanceScore, alerts) {
  const criticalAlerts = alerts.filter(a => a.level === 'critical');
  const warningAlerts = alerts.filter(a => a.level === 'warning');
  
  if (criticalAlerts.length > 0) {
    return 'critical';
  } else if (warningAlerts.length > 2 || performanceScore < 70) {
    return 'warning';
  } else if (performanceScore >= 90) {
    return 'excellent';
  } else {
    return 'healthy';
  }
}

/**
 * Calculate error rate percentage
 */
function calculateErrorRate(errorRates, connectionStats) {
  const totalErrors = errorRates.reduce((sum, error) => sum + parseInt(error.error_count), 0);
  const totalRequests = connectionStats.total_requests || 1;
  
  return Math.round((totalErrors / totalRequests) * 100 * 100) / 100; // Round to 2 decimals
}

/**
 * Analyze revenue processing status
 */
function analyzeRevenueStatus(metrics) {
  const completionRate = metrics.completed_orders / Math.max(1, metrics.total_orders);
  const avgProcessingTime = parseFloat(metrics.avg_processing_time) || 0;
  
  return {
    completionRate: Math.round(completionRate * 100),
    avgProcessingTime: Math.round(avgProcessingTime),
    totalRevenue: parseFloat(metrics.total_revenue) || 0,
    status: completionRate > 0.95 && avgProcessingTime < 30 ? 'excellent' : 
            completionRate > 0.9 && avgProcessingTime < 60 ? 'good' : 'needs_attention'
  };
}

/**
 * Generate performance recommendations
 */
function generateRecommendations({ performanceScore, dbHealth, slowQueries, errorRates }) {
  const recommendations = [];
  
  if (performanceScore < 80) {
    recommendations.push({
      priority: 'high',
      category: 'optimization',
      title: 'Improve overall performance',
      description: 'System performance is below optimal levels',
      actions: [
        'Run database VACUUM and ANALYZE',
        'Clear application caches',
        'Review and optimize slow queries',
        'Check server resource utilization'
      ]
    });
  }
  
  if (slowQueries.length > 3) {
    recommendations.push({
      priority: 'medium',
      category: 'database',
      title: 'Optimize slow queries',
      description: `${slowQueries.length} slow queries detected in the last hour`,
      actions: [
        'Review query execution plans',
        'Add missing database indexes',
        'Consider query restructuring',
        'Implement query result caching'
      ]
    });
  }
  
  if (dbHealth.responseTime > 50) {
    recommendations.push({
      priority: 'medium',
      category: 'database',
      title: 'Improve database response time',
      description: `Database response time is ${dbHealth.responseTime}ms`,
      actions: [
        'Check database server resources',
        'Optimize connection pooling',
        'Review concurrent query load',
        'Consider read replica for analytics'
      ]
    });
  }
  
  const totalErrors = errorRates.reduce((sum, error) => sum + parseInt(error.error_count), 0);
  if (totalErrors > 10) {
    recommendations.push({
      priority: 'high',
      category: 'reliability',
      title: 'Reduce error rates',
      description: `${totalErrors} errors detected in the last hour`,
      actions: [
        'Review error logs for patterns',
        'Implement better error handling',
        'Add monitoring alerts',
        'Fix recurring issues'
      ]
    });
  }
  
  return recommendations;
}

/**
 * Run comprehensive system diagnostics
 */
async function runSystemDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Test database connectivity
  try {
    const start = performance.now();
    await sql`SELECT 1`;
    diagnostics.tests.push({
      name: 'Database Connectivity',
      status: 'pass',
      duration: Math.round(performance.now() - start),
      message: 'Database connection successful'
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Database Connectivity',
      status: 'fail',
      error: error.message,
      message: 'Database connection failed'
    });
  }
  
  // Test critical table access
  const criticalTables = ['models', 'orders', 'customers', 'insights'];
  for (const table of criticalTables) {
    try {
      const start = performance.now();
      await sql.query(`SELECT COUNT(*) FROM ${table} LIMIT 1`);
      diagnostics.tests.push({
        name: `Table Access - ${table}`,
        status: 'pass',
        duration: Math.round(performance.now() - start),
        message: `${table} table accessible`
      });
    } catch (error) {
      diagnostics.tests.push({
        name: `Table Access - ${table}`,
        status: 'fail',
        error: error.message,
        message: `${table} table access failed`
      });
    }
  }
  
  // Test materialized views
  const views = ['mv_revenue_dashboard', 'mv_model_performance'];
  for (const view of views) {
    try {
      const start = performance.now();
      await sql.query(`SELECT COUNT(*) FROM ${view} LIMIT 1`);
      diagnostics.tests.push({
        name: `Materialized View - ${view}`,
        status: 'pass',
        duration: Math.round(performance.now() - start),
        message: `${view} view accessible`
      });
    } catch (error) {
      diagnostics.tests.push({
        name: `Materialized View - ${view}`,
        status: 'fail',
        error: error.message,
        message: `${view} view access failed`
      });
    }
  }
  
  const passedTests = diagnostics.tests.filter(t => t.status === 'pass').length;
  const totalTests = diagnostics.tests.length;
  
  diagnostics.summary = {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    successRate: Math.round((passedTests / totalTests) * 100),
    overallStatus: passedTests === totalTests ? 'healthy' : 
                   passedTests / totalTests > 0.8 ? 'warning' : 'critical'
  };
  
  return diagnostics;
}