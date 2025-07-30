/**
 * API endpoint for retrieving monitoring metrics
 * Provides performance, error, and analytics data
 */

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, timeRange = '24h', category, limit = 50 } = req.query;

    // Validate time range
    const validTimeRanges = ['1h', '6h', '24h', '7d', '30d'];
    if (!validTimeRanges.includes(timeRange)) {
      return res.status(400).json({ error: 'Invalid time range' });
    }

    let data;

    switch (type) {
      case 'performance':
        data = await getPerformanceMetrics(timeRange, category);
        break;
      
      case 'errors':
        data = await getErrorMetrics(timeRange, category, limit);
        break;
      
      case 'analytics':
        data = await getAnalyticsMetrics(timeRange, category);
        break;
      
      case 'system':
        data = await getSystemMetrics(timeRange);
        break;
      
      case 'excel':
        data = await getExcelMetrics(timeRange);
        break;
      
      case 'summary':
        data = await getMonitoringSummary(timeRange);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid metric type' });
    }

    res.status(200).json({
      success: true,
      type,
      timeRange,
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error) {
    console.error('Error fetching monitoring metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monitoring metrics'
    });
  }
}

// Get performance metrics
async function getPerformanceMetrics(timeRange, category) {
  try {
    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'performance_metrics'
      );
    `;
    
    if (!tableExists.rows[0].exists) {
      return {
        metrics: [],
        summary: {
          total_operations: 0,
          avg_performance_score: 0,
          critical_violations: 0
        },
        message: 'Performance metrics table not initialized'
      };
    }

    const query = category ?
      sql`
        SELECT 
          metric_name,
          component,
          COUNT(*) as count,
          AVG(duration) as avg_duration,
          MIN(duration) as min_duration,
          MAX(duration) as max_duration,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) as p50,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration) as p99,
          SUM(CASE WHEN exceeds_threshold THEN 1 ELSE 0 END) as threshold_violations,
          AVG(memory_delta) as avg_memory_delta
        FROM performance_metrics
        WHERE 
          timestamp > NOW() - INTERVAL ${timeRange}
          AND component = ${category}
        GROUP BY metric_name, component
        ORDER BY count DESC
      ` :
      sql`
        SELECT 
          metric_name,
          component,
          COUNT(*) as count,
          AVG(duration) as avg_duration,
          MIN(duration) as min_duration,
          MAX(duration) as max_duration,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) as p50,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration) as p99,
          SUM(CASE WHEN exceeds_threshold THEN 1 ELSE 0 END) as threshold_violations,
          AVG(memory_delta) as avg_memory_delta
        FROM performance_metrics
        WHERE timestamp > NOW() - INTERVAL ${timeRange}
        GROUP BY metric_name, component
        ORDER BY count DESC
      `;

    const result = await query;
    
    // Calculate performance score
    const metrics = result.rows.map(row => ({
      ...row,
      performance_score: calculatePerformanceScore(row)
    }));

    return {
      metrics,
      summary: {
        total_operations: metrics.reduce((sum, m) => sum + parseInt(m.count), 0),
        avg_performance_score: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.performance_score, 0) / metrics.length : 0,
        critical_violations: metrics.filter(m => m.threshold_violations > m.count * 0.1).length
      }
    };
  } catch (error) {
    console.error('Error in getPerformanceMetrics:', error);
    return {
      metrics: [],
      summary: {
        total_operations: 0,
        avg_performance_score: 0,
        critical_violations: 0
      },
      error: error.message
    };
  }
}

// Get error metrics
async function getErrorMetrics(timeRange, category, limit) {
  try {
    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'error_logs'
      );
    `;
    
    if (!tableExists.rows[0].exists) {
      return {
        top_errors: [],
        summary: [],
        error_rate: { total: 0, critical: 0, rate_per_hour: 0 },
        message: 'Error logs table not initialized'
      };
    }

    const errors = await sql`
      SELECT 
        category,
        severity,
        message,
        COUNT(*) as count,
        MIN(timestamp) as first_occurrence,
        MAX(timestamp) as last_occurrence,
        ARRAY_AGG(DISTINCT url ORDER BY url) as affected_urls
      FROM error_logs
      WHERE 
        timestamp > NOW() - INTERVAL ${timeRange}
        ${category ? sql`AND category = ${category}` : sql``}
      GROUP BY category, severity, message
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    const summary = await sql`
      SELECT 
        category,
        severity,
        COUNT(*) as total_errors,
        COUNT(DISTINCT message) as unique_errors
      FROM error_logs
      WHERE timestamp > NOW() - INTERVAL ${timeRange}
      GROUP BY category, severity
    `;

    return {
      top_errors: errors.rows,
      summary: summary.rows,
      error_rate: calculateErrorRate(summary.rows)
    };
  } catch (error) {
    console.error('Error in getErrorMetrics:', error);
    return {
      top_errors: [],
      summary: [],
      error_rate: { total: 0, critical: 0, rate_per_hour: 0 },
      error: error.message
    };
  }
}

// Get analytics metrics
async function getAnalyticsMetrics(timeRange, category) {
  try {
    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_analytics'
      );
    `;
    
    if (!tableExists.rows[0].exists) {
      return {
        event_summary: [],
        user_flows: [],
        engagement_metrics: {
          total_events: 0,
          unique_sessions: 0,
          unique_users: 0,
          events_per_session: 0,
          events_per_user: 0,
          engagement_score: 0
        },
        message: 'User analytics table not initialized'
      };
    }

    const events = await sql`
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(CASE 
          WHEN event_data->>'duration' IS NOT NULL 
          THEN (event_data->>'duration')::numeric 
          ELSE NULL 
        END) as avg_duration
      FROM user_analytics
      WHERE 
        timestamp > NOW() - INTERVAL ${timeRange}
        ${category ? sql`AND event_type LIKE ${category + '%'}` : sql``}
      GROUP BY event_type
      ORDER BY count DESC
    `;

    const userFlow = await sql`
      WITH event_sequences AS (
        SELECT 
          session_id,
          event_type,
          LAG(event_type) OVER (PARTITION BY session_id ORDER BY timestamp) as prev_event
        FROM user_analytics
        WHERE timestamp > NOW() - INTERVAL ${timeRange}
      )
      SELECT 
        prev_event || ' -> ' || event_type as flow,
        COUNT(*) as count
      FROM event_sequences
      WHERE prev_event IS NOT NULL
      GROUP BY flow
      ORDER BY count DESC
      LIMIT 20
    `;

    return {
      event_summary: events.rows,
      user_flows: userFlow.rows,
      engagement_metrics: calculateEngagementMetrics(events.rows)
    };
  } catch (error) {
    console.error('Error in getAnalyticsMetrics:', error);
    return {
      event_summary: [],
      user_flows: [],
      engagement_metrics: {
        total_events: 0,
        unique_sessions: 0,
        unique_users: 0,
        events_per_session: 0,
        events_per_user: 0,
        engagement_score: 0
      },
      error: error.message
    };
  }
}

// Get system metrics
async function getSystemMetrics(timeRange) {
  try {
    // Check if security_audit_logs table exists
    const auditTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'security_audit_logs'
      );
    `;
    
    let fileOperations = { rows: [] };
    if (auditTableExists.rows[0].exists) {
      fileOperations = await sql`
        SELECT 
          action_type,
          COUNT(*) as count,
          AVG(CASE WHEN metadata->>'fileSize' IS NOT NULL 
            THEN (metadata->>'fileSize')::numeric 
            ELSE 0 END) as avg_file_size,
          SUM(CASE WHEN action_type LIKE '%_failed' THEN 1 ELSE 0 END) as failures
        FROM security_audit_logs
        WHERE 
          timestamp > NOW() - INTERVAL ${timeRange}
          AND action_type IN ('file_upload', 'file_download', 'file_upload_failed', 'file_download_failed')
        GROUP BY action_type
      `;
    }

    // Check if performance_metrics table exists
    const perfTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'performance_metrics'
      );
    `;
    
    let dbPerformance = { rows: [{ total_queries: 0, avg_query_time: 0, max_query_time: 0, slow_queries: 0 }] };
    if (perfTableExists.rows[0].exists) {
      dbPerformance = await sql`
        SELECT 
          COUNT(*) as total_queries,
          AVG(duration) as avg_query_time,
          MAX(duration) as max_query_time,
          SUM(CASE WHEN duration > 1000 THEN 1 ELSE 0 END) as slow_queries
        FROM (
          SELECT 
            EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) * 1000 as duration
          FROM performance_metrics
          WHERE timestamp > NOW() - INTERVAL ${timeRange}
          GROUP BY DATE_TRUNC('minute', timestamp)
        ) as query_times
      `;
    }

    return {
      file_operations: fileOperations.rows,
      database_performance: dbPerformance.rows[0] || { total_queries: 0, avg_query_time: 0, max_query_time: 0, slow_queries: 0 },
      system_health: calculateSystemHealth(fileOperations.rows, dbPerformance.rows[0] || { total_queries: 0, avg_query_time: 0, max_query_time: 0, slow_queries: 0 }),
      tables_initialized: {
        security_audit_logs: auditTableExists.rows[0].exists,
        performance_metrics: perfTableExists.rows[0].exists
      }
    };
  } catch (error) {
    console.error('Error in getSystemMetrics:', error);
    return {
      file_operations: [],
      database_performance: { total_queries: 0, avg_query_time: 0, max_query_time: 0, slow_queries: 0 },
      system_health: { health_score: 0, file_failure_rate: 0, db_slow_query_rate: 0 },
      error: error.message
    };
  }
}

// Get Excel-specific metrics
async function getExcelMetrics(timeRange) {
  try {
    let excelEvents = { rows: [] };
    let excelErrors = { rows: [] };
    let performance = { rows: [] };

    // Check if user_analytics table exists
    const analyticsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_analytics'
      );
    `;
    
    if (analyticsTableExists.rows[0].exists) {
      excelEvents = await sql`
        SELECT 
          event_type,
          COUNT(*) as count,
          AVG(CASE WHEN event_data->>'fileSize' IS NOT NULL 
            THEN (event_data->>'fileSize')::numeric 
            ELSE 0 END) as avg_file_size,
          AVG(CASE WHEN event_data->>'duration' IS NOT NULL 
            THEN (event_data->>'duration')::numeric 
            ELSE 0 END) as avg_duration
        FROM user_analytics
        WHERE 
          timestamp > NOW() - INTERVAL ${timeRange}
          AND event_type LIKE 'excel_%'
        GROUP BY event_type
        ORDER BY count DESC
      `;
    }

    // Check if error_logs table exists
    const errorTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'error_logs'
      );
    `;
    
    if (errorTableExists.rows[0].exists) {
      excelErrors = await sql`
        SELECT 
          message,
          COUNT(*) as count,
          MAX(timestamp) as last_occurrence
        FROM error_logs
        WHERE 
          timestamp > NOW() - INTERVAL ${timeRange}
          AND category = 'excel_parsing'
        GROUP BY message
        ORDER BY count DESC
        LIMIT 10
      `;
    }

    // Check if performance_metrics table exists
    const perfTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'performance_metrics'
      );
    `;
    
    if (perfTableExists.rows[0].exists) {
      performance = await sql`
        SELECT 
          metric_name,
          AVG(duration) as avg_duration,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95_duration,
          COUNT(*) as count
        FROM performance_metrics
        WHERE 
          timestamp > NOW() - INTERVAL ${timeRange}
          AND component = 'ExcelViewer'
        GROUP BY metric_name
      `;
    }

    return {
      usage_stats: excelEvents.rows,
      error_summary: excelErrors.rows,
      performance_metrics: performance.rows,
      health_score: calculateExcelHealth(excelEvents.rows, excelErrors.rows, performance.rows),
      tables_initialized: {
        user_analytics: analyticsTableExists.rows[0].exists,
        error_logs: errorTableExists.rows[0].exists,
        performance_metrics: perfTableExists.rows[0].exists
      }
    };
  } catch (error) {
    console.error('Error in getExcelMetrics:', error);
    return {
      usage_stats: [],
      error_summary: [],
      performance_metrics: [],
      health_score: 0,
      error: error.message
    };
  }
}

// Get monitoring summary
async function getMonitoringSummary(timeRange) {
  try {
    const [performance, errors, analytics, system, excel] = await Promise.all([
      getPerformanceMetrics(timeRange),
      getErrorMetrics(timeRange, null, 5),
      getAnalyticsMetrics(timeRange),
      getSystemMetrics(timeRange),
      getExcelMetrics(timeRange)
    ]);

    return {
      overview: {
        performance_score: performance.summary?.avg_performance_score || 0,
        error_rate: errors.error_rate || { total: 0, critical: 0, rate_per_hour: 0 },
        user_engagement: analytics.engagement_metrics?.engagement_score || 0,
        system_health: system.system_health?.health_score || 0,
        excel_health: excel.health_score || 0
      },
      alerts: generateAlerts(performance, errors, system),
      recommendations: generateRecommendations(performance, errors, analytics, system, excel),
      table_status: {
        performance: !performance.error && !performance.message,
        errors: !errors.error && !errors.message,
        analytics: !analytics.error && !analytics.message,
        system: !system.error && !system.message,
        excel: !excel.error && !excel.message
      }
    };
  } catch (error) {
    console.error('Error in getMonitoringSummary:', error);
    return {
      overview: {
        performance_score: 0,
        error_rate: { total: 0, critical: 0, rate_per_hour: 0 },
        user_engagement: 0,
        system_health: 0,
        excel_health: 0
      },
      alerts: [],
      recommendations: [],
      error: error.message
    };
  }
}

// Helper functions
function calculatePerformanceScore(metric) {
  const { avg_duration, p95, threshold_violations, count } = metric;
  let score = 100;

  // Deduct points for slow average duration
  if (avg_duration > 1000) score -= 10;
  if (avg_duration > 3000) score -= 20;

  // Deduct points for high p95
  if (p95 > 5000) score -= 15;
  if (p95 > 10000) score -= 25;

  // Deduct points for threshold violations
  const violationRate = threshold_violations / count;
  score -= violationRate * 100;

  return Math.max(0, Math.min(100, score));
}

function calculateErrorRate(errorSummary) {
  const totalErrors = errorSummary.reduce((sum, e) => sum + parseInt(e.total_errors), 0);
  const criticalErrors = errorSummary
    .filter(e => e.severity === 'critical' || e.severity === 'high')
    .reduce((sum, e) => sum + parseInt(e.total_errors), 0);

  return {
    total: totalErrors,
    critical: criticalErrors,
    rate_per_hour: totalErrors / 24 // Assuming 24h timeRange
  };
}

function calculateEngagementMetrics(events) {
  if (!events || events.length === 0) {
    return {
      total_events: 0,
      unique_sessions: 0,
      unique_users: 0,
      events_per_session: 0,
      events_per_user: 0,
      engagement_score: 0
    };
  }

  const totalEvents = events.reduce((sum, e) => sum + parseInt(e.count || 0), 0);
  const uniqueSessions = Math.max(...events.map(e => parseInt(e.unique_sessions || 0)), 0);
  const uniqueUsers = Math.max(...events.map(e => parseInt(e.unique_users || 0)), 0);

  return {
    total_events: totalEvents,
    unique_sessions: uniqueSessions,
    unique_users: uniqueUsers,
    events_per_session: uniqueSessions > 0 ? totalEvents / uniqueSessions : 0,
    events_per_user: uniqueUsers > 0 ? totalEvents / uniqueUsers : 0,
    engagement_score: uniqueUsers > 0 ? Math.min(100, (totalEvents / uniqueUsers) * 10) : 0
  };
}

function calculateSystemHealth(fileOps, dbPerf) {
  if (!fileOps || fileOps.length === 0 || !dbPerf) {
    return {
      health_score: 50, // Default to 50% if no data
      file_failure_rate: 0,
      db_slow_query_rate: 0
    };
  }

  let score = 100;
  
  // Check file operation failures
  const totalFileOps = fileOps.reduce((sum, op) => sum + parseInt(op.count || 0), 0);
  const failedOps = fileOps.reduce((sum, op) => sum + parseInt(op.failures || 0), 0);
  const failureRate = totalFileOps > 0 ? failedOps / totalFileOps : 0;
  
  score -= failureRate * 50;
  
  // Check database performance
  const avgQueryTime = parseFloat(dbPerf.avg_query_time || 0);
  const slowQueries = parseInt(dbPerf.slow_queries || 0);
  const totalQueries = parseInt(dbPerf.total_queries || 1);
  
  if (avgQueryTime > 100) score -= 10;
  if (slowQueries > 10) score -= 20;
  
  return {
    health_score: Math.max(0, Math.min(100, score)),
    file_failure_rate: failureRate,
    db_slow_query_rate: totalQueries > 0 ? slowQueries / totalQueries : 0
  };
}

function calculateExcelHealth(usage, errors, performance) {
  let score = 100;
  
  // Check error rate
  const totalUsage = usage.reduce((sum, u) => sum + parseInt(u.count), 0);
  const totalErrors = errors.reduce((sum, e) => sum + parseInt(e.count), 0);
  const errorRate = totalErrors / totalUsage;
  
  score -= errorRate * 100;
  
  // Check performance
  const avgPerformance = performance.reduce((sum, p) => sum + parseFloat(p.avg_duration), 0) / performance.length;
  if (avgPerformance > 3000) score -= 20;
  if (avgPerformance > 5000) score -= 30;
  
  return Math.max(0, Math.min(100, score));
}

function generateAlerts(performance, errors, system) {
  const alerts = [];
  
  // Performance alerts
  if (performance.summary.critical_violations > 0) {
    alerts.push({
      type: 'performance',
      severity: 'warning',
      message: `${performance.summary.critical_violations} metrics exceeding performance thresholds`
    });
  }
  
  // Error alerts
  if (errors.error_rate.critical > 10) {
    alerts.push({
      type: 'error',
      severity: 'critical',
      message: `High critical error rate: ${errors.error_rate.critical} errors`
    });
  }
  
  // System alerts
  if (system.system_health.file_failure_rate > 0.1) {
    alerts.push({
      type: 'system',
      severity: 'warning',
      message: `High file operation failure rate: ${(system.system_health.file_failure_rate * 100).toFixed(1)}%`
    });
  }
  
  return alerts;
}

function generateRecommendations(performance, errors, analytics, system, excel) {
  const recommendations = [];
  
  // Performance recommendations
  const slowMetrics = performance.metrics.filter(m => m.performance_score < 70);
  if (slowMetrics.length > 0) {
    recommendations.push({
      category: 'performance',
      priority: 'high',
      message: `Optimize ${slowMetrics[0].metric_name} - average duration ${slowMetrics[0].avg_duration.toFixed(0)}ms`,
      action: 'Review code for performance bottlenecks'
    });
  }
  
  // Error recommendations
  if (errors.top_errors.length > 0 && errors.top_errors[0].count > 50) {
    recommendations.push({
      category: 'stability',
      priority: 'critical',
      message: `Fix recurring error: "${errors.top_errors[0].message}"`,
      action: 'Investigate and resolve root cause'
    });
  }
  
  // Excel recommendations
  if (excel.health_score < 80) {
    recommendations.push({
      category: 'excel',
      priority: 'medium',
      message: 'Excel viewer health below optimal levels',
      action: 'Review Excel parsing errors and optimize performance'
    });
  }
  
  return recommendations;
}