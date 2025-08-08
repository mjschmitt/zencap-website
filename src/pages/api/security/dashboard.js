/**
 * @fileoverview Security Dashboard API - Real-time security monitoring
 * @module api/security/dashboard
 */

import { securityMonitor, SECURITY_EVENTS, THREAT_LEVELS } from '../../../utils/security/SecurityMonitor.js';
import { applySecurityMiddleware } from '../../../middleware/security.js';
import { sql } from '@vercel/postgres';

/**
 * Security Dashboard Handler
 * Provides real-time security metrics and threat intelligence
 */
async function securityDashboardHandler(req, res) {
  const { method, query } = req;
  
  // Only allow GET requests for dashboard data
  if (method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  try {
    const timeRange = query.range || '24h';
    const metric = query.metric || 'overview';
    
    switch (metric) {
      case 'overview':
        return await getSecurityOverview(req, res, timeRange);
        
      case 'threats':
        return await getThreatIntelligence(req, res, timeRange);
        
      case 'events':
        return await getSecurityEvents(req, res, timeRange);
        
      case 'metrics':
        return await getSecurityMetrics(req, res, timeRange);
        
      case 'alerts':
        return await getActiveAlerts(req, res);
        
      case 'blocked':
        return await getBlockedEntities(req, res);
        
      case 'realtime':
        return await getRealtimeStats(req, res);
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid metric requested'
        });
    }
    
  } catch (error) {
    console.error('Security dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve security data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get comprehensive security overview
 */
async function getSecurityOverview(req, res, timeRange) {
  const timeMap = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30
  };
  
  const hours = timeMap[timeRange] || 24;
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  // Get event counts by severity
  const eventCounts = await sql`
    SELECT 
      threat_level,
      COUNT(*) as count,
      COUNT(CASE WHEN timestamp > NOW() - INTERVAL '1 hour' THEN 1 END) as recent_count
    FROM security_events
    WHERE timestamp > ${startTime}
    GROUP BY threat_level
  `;
  
  // Get top threat events
  const topEvents = await sql`
    SELECT 
      event_type,
      COUNT(*) as count,
      MAX(timestamp) as last_occurrence
    FROM security_events
    WHERE timestamp > ${startTime}
    GROUP BY event_type
    ORDER BY count DESC
    LIMIT 10
  `;
  
  // Get geographical threat distribution
  const geoThreats = await sql`
    SELECT 
      geo_location->>'country' as country,
      COUNT(*) as threat_count,
      AVG(CASE WHEN threat_level = 'low' THEN 1 
               WHEN threat_level = 'medium' THEN 2
               WHEN threat_level = 'high' THEN 3
               WHEN threat_level = 'critical' THEN 4 END) as avg_severity
    FROM security_events
    WHERE timestamp > ${startTime}
    AND geo_location->>'country' IS NOT NULL
    GROUP BY geo_location->>'country'
    ORDER BY threat_count DESC
    LIMIT 15
  `;
  
  // Get system health metrics
  const systemHealth = await getSystemHealthMetrics();
  
  // Calculate threat score trends
  const threatTrends = await sql`
    SELECT 
      DATE_TRUNC('hour', timestamp) as hour,
      COUNT(*) as total_events,
      COUNT(CASE WHEN threat_level IN ('high', 'critical') THEN 1 END) as serious_threats
    FROM security_events
    WHERE timestamp > ${startTime}
    GROUP BY DATE_TRUNC('hour', timestamp)
    ORDER BY hour
  `;
  
  const dashboardData = {
    overview: {
      timeRange,
      totalEvents: eventCounts.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      recentEvents: eventCounts.rows.reduce((sum, row) => sum + parseInt(row.recent_count), 0),
      eventsByThreatLevel: eventCounts.rows.reduce((acc, row) => {
        acc[row.threat_level] = {
          count: parseInt(row.count),
          recent: parseInt(row.recent_count)
        };
        return acc;
      }, {}),
      generatedAt: new Date()
    },
    
    topEvents: topEvents.rows.map(event => ({
      eventType: event.event_type,
      count: parseInt(event.count),
      lastOccurrence: event.last_occurrence,
      severity: getEventSeverity(event.event_type)
    })),
    
    geographicalThreats: geoThreats.rows.map(geo => ({
      country: geo.country,
      threatCount: parseInt(geo.threat_count),
      averageSeverity: parseFloat(geo.avg_severity).toFixed(2),
      riskLevel: calculateRiskLevel(parseInt(geo.threat_count), parseFloat(geo.avg_severity))
    })),
    
    threatTrends: threatTrends.rows.map(trend => ({
      hour: trend.hour,
      totalEvents: parseInt(trend.total_events),
      seriousThreats: parseInt(trend.serious_threats),
      threatRatio: (parseInt(trend.serious_threats) / parseInt(trend.total_events) * 100).toFixed(2)
    })),
    
    systemHealth
  };
  
  return res.status(200).json({
    success: true,
    data: dashboardData,
    timestamp: new Date()
  });
}

/**
 * Get threat intelligence data
 */
async function getThreatIntelligence(req, res, timeRange) {
  // Get top threatening IPs
  const topThreats = await sql`
    SELECT 
      ip_address,
      threat_score,
      incident_count,
      threat_categories,
      blocked,
      first_seen,
      last_seen,
      notes
    FROM threat_intelligence
    ORDER BY threat_score DESC
    LIMIT 25
  `;
  
  // Get recently blocked IPs
  const recentlyBlocked = await sql`
    SELECT 
      ip_address,
      threat_score,
      incident_count,
      threat_categories,
      last_seen
    FROM threat_intelligence
    WHERE blocked = true
    ORDER BY last_seen DESC
    LIMIT 15
  `;
  
  // Get threat category distribution
  const categoryStats = await sql`
    SELECT 
      jsonb_array_elements_text(threat_categories) as category,
      COUNT(*) as ip_count,
      AVG(threat_score) as avg_score,
      SUM(incident_count) as total_incidents
    FROM threat_intelligence
    WHERE threat_categories IS NOT NULL
    GROUP BY category
    ORDER BY ip_count DESC
  `;
  
  // Get geographic threat intelligence
  const geoIntel = await sql`
    SELECT 
      se.geo_location->>'country' as country,
      COUNT(DISTINCT ti.ip_address) as unique_threat_ips,
      AVG(ti.threat_score) as avg_threat_score,
      COUNT(CASE WHEN ti.blocked = true THEN 1 END) as blocked_ips,
      MAX(ti.last_seen) as latest_activity
    FROM threat_intelligence ti
    JOIN security_events se ON se.source_ip = ti.ip_address
    WHERE se.geo_location->>'country' IS NOT NULL
    GROUP BY se.geo_location->>'country'
    ORDER BY unique_threat_ips DESC
    LIMIT 20
  `;
  
  return res.status(200).json({
    success: true,
    data: {
      topThreats: topThreats.rows.map(threat => ({
        ...threat,
        threatCategories: threat.threat_categories || [],
        riskLevel: calculateIPRiskLevel(threat.threat_score, threat.incident_count),
        daysActive: calculateDaysActive(threat.first_seen, threat.last_seen)
      })),
      
      recentlyBlocked: recentlyBlocked.rows,
      
      categoryStatistics: categoryStats.rows.map(stat => ({
        category: stat.category,
        ipCount: parseInt(stat.ip_count),
        averageScore: parseFloat(stat.avg_score).toFixed(2),
        totalIncidents: parseInt(stat.total_incidents)
      })),
      
      geographicIntelligence: geoIntel.rows.map(geo => ({
        country: geo.country,
        uniqueThreatIPs: parseInt(geo.unique_threat_ips),
        averageThreatScore: parseFloat(geo.avg_threat_score).toFixed(2),
        blockedIPs: parseInt(geo.blocked_ips),
        latestActivity: geo.latest_activity
      }))
    },
    timestamp: new Date()
  });
}

/**
 * Get security events with filtering and pagination
 */
async function getSecurityEvents(req, res, timeRange) {
  const { query } = req;
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const eventType = query.eventType;
  const threatLevel = query.threatLevel;
  const offset = (page - 1) * limit;
  
  const timeMap = { '1h': 1, '24h': 24, '7d': 24 * 7, '30d': 24 * 30 };
  const hours = timeMap[timeRange] || 24;
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  // Build dynamic query
  let whereClause = sql`WHERE timestamp > ${startTime}`;
  
  if (eventType) {
    whereClause = sql`${whereClause} AND event_type = ${eventType}`;
  }
  
  if (threatLevel) {
    whereClause = sql`${whereClause} AND threat_level = ${threatLevel}`;
  }
  
  // Get events with pagination
  const events = await sql`
    SELECT 
      id, event_type, threat_level, source_ip, user_id, user_agent,
      request_path, event_data, geo_location, session_id, timestamp,
      resolved, resolution_notes, resolved_at
    FROM security_events
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  // Get total count for pagination
  const totalCount = await sql`
    SELECT COUNT(*) as total
    FROM security_events
    ${whereClause}
  `;
  
  // Get event type distribution
  const eventTypes = await sql`
    SELECT 
      event_type,
      COUNT(*) as count,
      MAX(timestamp) as latest
    FROM security_events
    ${whereClause}
    GROUP BY event_type
    ORDER BY count DESC
  `;
  
  return res.status(200).json({
    success: true,
    data: {
      events: events.rows.map(event => ({
        ...event,
        eventData: event.event_data || {},
        geoLocation: event.geo_location || {},
        isResolved: event.resolved,
        timeAgo: getTimeAgo(event.timestamp)
      })),
      
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(parseInt(totalCount.rows[0].total) / limit),
        totalEvents: parseInt(totalCount.rows[0].total),
        hasNextPage: page < Math.ceil(parseInt(totalCount.rows[0].total) / limit),
        hasPreviousPage: page > 1
      },
      
      eventTypeDistribution: eventTypes.rows.map(type => ({
        eventType: type.event_type,
        count: parseInt(type.count),
        latest: type.latest,
        percentage: ((parseInt(type.count) / parseInt(totalCount.rows[0].total)) * 100).toFixed(2)
      })),
      
      filters: {
        timeRange,
        eventType,
        threatLevel
      }
    },
    timestamp: new Date()
  });
}

/**
 * Get security metrics and analytics
 */
async function getSecurityMetrics(req, res, timeRange) {
  const timeMap = { '1h': 1, '24h': 24, '7d': 24 * 7, '30d': 24 * 30 };
  const hours = timeMap[timeRange] || 24;
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  // Response time metrics for security endpoints
  const responseMetrics = await sql`
    SELECT 
      AVG(CASE WHEN event_data->>'duration' IS NOT NULL 
               THEN (event_data->>'duration')::numeric END) as avg_response_time,
      MAX(CASE WHEN event_data->>'duration' IS NOT NULL 
               THEN (event_data->>'duration')::numeric END) as max_response_time,
      COUNT(CASE WHEN event_data->>'statusCode' IS NOT NULL 
                      AND (event_data->>'statusCode')::numeric >= 500 THEN 1 END) as error_count
    FROM security_events
    WHERE timestamp > ${startTime}
    AND event_data->>'duration' IS NOT NULL
  `;
  
  // Failed authentication attempts
  const authMetrics = await sql`
    SELECT 
      COUNT(*) as total_attempts,
      COUNT(DISTINCT source_ip) as unique_ips,
      COUNT(CASE WHEN event_type = 'login_failure' THEN 1 END) as failed_logins,
      COUNT(CASE WHEN event_type = 'login_brute_force' THEN 1 END) as brute_force_attempts
    FROM security_events
    WHERE timestamp > ${startTime}
    AND event_type IN ('login_success', 'login_failure', 'login_brute_force')
  `;
  
  // File security metrics
  const fileMetrics = await sql`
    SELECT 
      COUNT(CASE WHEN event_type = 'file_upload_malicious' THEN 1 END) as malicious_uploads,
      COUNT(CASE WHEN event_type = 'file_access_unauthorized' THEN 1 END) as unauthorized_access,
      COUNT(CASE WHEN event_type = 'excel_macro_detected' THEN 1 END) as macro_detections
    FROM security_events
    WHERE timestamp > ${startTime}
    AND event_type IN ('file_upload_malicious', 'file_access_unauthorized', 'excel_macro_detected')
  `;
  
  // API security metrics
  const apiMetrics = await sql`
    SELECT 
      COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as rate_limit_violations,
      COUNT(CASE WHEN event_type = 'sql_injection_attempt' THEN 1 END) as sql_injection_attempts,
      COUNT(CASE WHEN event_type = 'xss_attempt' THEN 1 END) as xss_attempts,
      COUNT(CASE WHEN event_type = 'api_abuse_detected' THEN 1 END) as api_abuse_cases
    FROM security_events
    WHERE timestamp > ${startTime}
    AND event_type IN ('rate_limit_exceeded', 'sql_injection_attempt', 'xss_attempt', 'api_abuse_detected')
  `;
  
  // Hourly trend analysis
  const hourlyTrends = await sql`
    SELECT 
      DATE_TRUNC('hour', timestamp) as hour,
      COUNT(*) as total_events,
      COUNT(CASE WHEN threat_level = 'critical' THEN 1 END) as critical_events,
      COUNT(CASE WHEN threat_level = 'high' THEN 1 END) as high_events,
      COUNT(DISTINCT source_ip) as unique_ips
    FROM security_events
    WHERE timestamp > ${startTime}
    GROUP BY DATE_TRUNC('hour', timestamp)
    ORDER BY hour
  `;
  
  return res.status(200).json({
    success: true,
    data: {
      performance: {
        averageResponseTime: parseFloat(responseMetrics.rows[0].avg_response_time || 0).toFixed(2),
        maxResponseTime: parseFloat(responseMetrics.rows[0].max_response_time || 0).toFixed(2),
        errorRate: parseInt(responseMetrics.rows[0].error_count || 0)
      },
      
      authentication: {
        totalAttempts: parseInt(authMetrics.rows[0].total_attempts || 0),
        uniqueIPs: parseInt(authMetrics.rows[0].unique_ips || 0),
        failedLogins: parseInt(authMetrics.rows[0].failed_logins || 0),
        bruteForceAttempts: parseInt(authMetrics.rows[0].brute_force_attempts || 0),
        successRate: calculateSuccessRate(
          parseInt(authMetrics.rows[0].total_attempts || 0),
          parseInt(authMetrics.rows[0].failed_logins || 0)
        )
      },
      
      filesSecurity: {
        maliciousUploads: parseInt(fileMetrics.rows[0].malicious_uploads || 0),
        unauthorizedAccess: parseInt(fileMetrics.rows[0].unauthorized_access || 0),
        macroDetections: parseInt(fileMetrics.rows[0].macro_detections || 0)
      },
      
      apiSecurity: {
        rateLimitViolations: parseInt(apiMetrics.rows[0].rate_limit_violations || 0),
        sqlInjectionAttempts: parseInt(apiMetrics.rows[0].sql_injection_attempts || 0),
        xssAttempts: parseInt(apiMetrics.rows[0].xss_attempts || 0),
        apiAbuseCases: parseInt(apiMetrics.rows[0].api_abuse_cases || 0)
      },
      
      trends: hourlyTrends.rows.map(trend => ({
        hour: trend.hour,
        totalEvents: parseInt(trend.total_events),
        criticalEvents: parseInt(trend.critical_events),
        highEvents: parseInt(trend.high_events),
        uniqueIPs: parseInt(trend.unique_ips),
        threatDensity: (parseInt(trend.critical_events + trend.high_events) / parseInt(trend.total_events) * 100).toFixed(2)
      }))
    },
    timeRange,
    timestamp: new Date()
  });
}

/**
 * Get active security alerts
 */
async function getActiveAlerts(req, res) {
  // Get unresolved high/critical events from last 24 hours
  const activeAlerts = await sql`
    SELECT 
      id, event_type, threat_level, source_ip, timestamp,
      event_data, geo_location, user_id
    FROM security_events
    WHERE threat_level IN ('high', 'critical')
    AND resolved = false
    AND timestamp > NOW() - INTERVAL '24 hours'
    ORDER BY timestamp DESC
    LIMIT 50
  `;
  
  // Get alert summary by type
  const alertSummary = await sql`
    SELECT 
      event_type,
      threat_level,
      COUNT(*) as count,
      MAX(timestamp) as latest_occurrence,
      COUNT(DISTINCT source_ip) as unique_sources
    FROM security_events
    WHERE threat_level IN ('high', 'critical')
    AND resolved = false
    AND timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY event_type, threat_level
    ORDER BY count DESC
  `;
  
  return res.status(200).json({
    success: true,
    data: {
      activeAlerts: activeAlerts.rows.map(alert => ({
        ...alert,
        timeAgo: getTimeAgo(alert.timestamp),
        eventData: alert.event_data || {},
        geoLocation: alert.geo_location || {},
        priority: calculateAlertPriority(alert.threat_level, alert.event_type)
      })),
      
      summary: alertSummary.rows.map(summary => ({
        eventType: summary.event_type,
        threatLevel: summary.threat_level,
        count: parseInt(summary.count),
        latestOccurrence: summary.latest_occurrence,
        uniqueSources: parseInt(summary.unique_sources)
      })),
      
      totalActiveAlerts: activeAlerts.rows.length
    },
    timestamp: new Date()
  });
}

/**
 * Get blocked entities (IPs, users, etc.)
 */
async function getBlockedEntities(req, res) {
  // Get blocked IPs
  const blockedIPs = await sql`
    SELECT 
      ip_address,
      threat_score,
      incident_count,
      threat_categories,
      first_seen,
      last_seen,
      notes
    FROM threat_intelligence
    WHERE blocked = true
    ORDER BY threat_score DESC, last_seen DESC
    LIMIT 100
  `;
  
  // Get blocked users (if any)
  const blockedUsers = await sql`
    SELECT 
      user_id,
      COUNT(*) as violation_count,
      MAX(timestamp) as last_violation,
      array_agg(DISTINCT event_type) as violation_types
    FROM security_events
    WHERE user_id IS NOT NULL
    AND threat_level IN ('high', 'critical')
    AND timestamp > NOW() - INTERVAL '30 days'
    GROUP BY user_id
    HAVING COUNT(*) >= 5
    ORDER BY violation_count DESC
    LIMIT 20
  `;
  
  // Get recent block actions
  const recentBlocks = await sql`
    SELECT 
      ip_address,
      threat_score,
      incident_count,
      last_seen
    FROM threat_intelligence
    WHERE blocked = true
    AND last_seen > NOW() - INTERVAL '7 days'
    ORDER BY last_seen DESC
    LIMIT 25
  `;
  
  return res.status(200).json({
    success: true,
    data: {
      blockedIPs: blockedIPs.rows.map(ip => ({
        ...ip,
        threatCategories: ip.threat_categories || [],
        daysSinceFirstSeen: calculateDaysActive(ip.first_seen, null),
        daysSinceLastSeen: calculateDaysActive(ip.last_seen, null)
      })),
      
      suspiciousUsers: blockedUsers.rows.map(user => ({
        userId: user.user_id,
        violationCount: parseInt(user.violation_count),
        lastViolation: user.last_violation,
        violationTypes: user.violation_types || []
      })),
      
      recentBlocks: recentBlocks.rows.map(block => ({
        ...block,
        blockedAgo: getTimeAgo(block.last_seen)
      })),
      
      statistics: {
        totalBlockedIPs: blockedIPs.rows.length,
        recentBlocks: recentBlocks.rows.length,
        suspiciousUsers: blockedUsers.rows.length
      }
    },
    timestamp: new Date()
  });
}

/**
 * Get real-time statistics
 */
async function getRealtimeStats(req, res) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  // Last 5 minutes activity
  const recentActivity = await sql`
    SELECT 
      COUNT(*) as total_events,
      COUNT(CASE WHEN threat_level IN ('high', 'critical') THEN 1 END) as serious_threats,
      COUNT(DISTINCT source_ip) as unique_ips,
      COUNT(CASE WHEN event_type = 'rate_limit_exceeded' THEN 1 END) as rate_limits
    FROM security_events
    WHERE timestamp > ${fiveMinutesAgo}
  `;
  
  // Last 15 minutes for comparison
  const comparisonActivity = await sql`
    SELECT COUNT(*) as events_15min
    FROM security_events
    WHERE timestamp > ${fifteenMinutesAgo}
    AND timestamp <= ${fiveMinutesAgo}
  `;
  
  // Currently active threats
  const activeThreats = await sql`
    SELECT COUNT(*) as active_threats
    FROM threat_intelligence
    WHERE last_seen > NOW() - INTERVAL '5 minutes'
  `;
  
  // System status indicators
  const systemStatus = {
    databaseConnected: true, // Since we're able to query
    redisConnected: global.redis ? await testRedisConnection() : false,
    monitoringActive: true,
    lastHealthCheck: new Date()
  };
  
  const current = recentActivity.rows[0];
  const previous = comparisonActivity.rows[0];
  
  return res.status(200).json({
    success: true,
    data: {
      realtime: {
        totalEvents: parseInt(current.total_events || 0),
        seriousThreats: parseInt(current.serious_threats || 0),
        uniqueIPs: parseInt(current.unique_ips || 0),
        rateLimits: parseInt(current.rate_limits || 0),
        activeThreats: parseInt(activeThreats.rows[0].active_threats || 0)
      },
      
      trends: {
        eventsTrend: calculateTrend(
          parseInt(current.total_events || 0),
          parseInt(previous.events_15min || 0)
        ),
        threatTrend: calculateTrend(
          parseInt(current.serious_threats || 0),
          parseInt(previous.events_15min || 0) * 0.1 // Estimate
        )
      },
      
      systemStatus,
      
      lastUpdated: new Date(),
      refreshInterval: 30000 // 30 seconds
    }
  });
}

/**
 * Helper function to get system health metrics
 */
async function getSystemHealthMetrics() {
  try {
    // Database connection test
    const dbTest = await sql`SELECT 1 as test`;
    const dbHealthy = dbTest.rows.length > 0;
    
    // Recent error rate
    const errorRate = await sql`
      SELECT 
        COUNT(CASE WHEN event_data->>'statusCode' IS NOT NULL 
                        AND (event_data->>'statusCode')::numeric >= 500 THEN 1 END) as errors,
        COUNT(*) as total
      FROM security_events
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      AND event_data->>'statusCode' IS NOT NULL
    `;
    
    const errors = parseInt(errorRate.rows[0]?.errors || 0);
    const total = parseInt(errorRate.rows[0]?.total || 1);
    const errorPercentage = (errors / total * 100).toFixed(2);
    
    return {
      database: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date()
      },
      errorRate: {
        percentage: errorPercentage,
        errors: errors,
        total: total
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  } catch (error) {
    return {
      database: { status: 'error', error: error.message },
      errorRate: { percentage: 'unknown' },
      uptime: process.uptime()
    };
  }
}

// Helper functions
function getEventSeverity(eventType) {
  const severityMap = {
    [SECURITY_EVENTS.LOGIN_BRUTE_FORCE]: 'high',
    [SECURITY_EVENTS.SQL_INJECTION_ATTEMPT]: 'critical',
    [SECURITY_EVENTS.XSS_ATTEMPT]: 'high',
    [SECURITY_EVENTS.DDOS_ATTACK]: 'critical',
    [SECURITY_EVENTS.FILE_UPLOAD_MALICIOUS]: 'high',
    [SECURITY_EVENTS.VULNERABILITY_EXPLOIT]: 'critical'
  };
  return severityMap[eventType] || 'medium';
}

function calculateRiskLevel(count, severity) {
  const riskScore = count * severity;
  if (riskScore >= 50) return 'critical';
  if (riskScore >= 20) return 'high';
  if (riskScore >= 5) return 'medium';
  return 'low';
}

function calculateIPRiskLevel(threatScore, incidentCount) {
  const combinedScore = threatScore + (incidentCount * 2);
  if (combinedScore >= 75) return 'critical';
  if (combinedScore >= 50) return 'high';
  if (combinedScore >= 25) return 'medium';
  return 'low';
}

function calculateDaysActive(firstSeen, lastSeen) {
  const start = new Date(firstSeen);
  const end = lastSeen ? new Date(lastSeen) : new Date();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function calculateSuccessRate(total, failed) {
  if (total === 0) return '0.00';
  return ((total - failed) / total * 100).toFixed(2);
}

function calculateAlertPriority(threatLevel, eventType) {
  const priorities = {
    critical: { base: 100, multiplier: 1 },
    high: { base: 75, multiplier: 0.8 },
    medium: { base: 50, multiplier: 0.6 },
    low: { base: 25, multiplier: 0.4 }
  };
  
  const criticalEvents = [
    SECURITY_EVENTS.DDOS_ATTACK,
    SECURITY_EVENTS.SQL_INJECTION_ATTEMPT,
    SECURITY_EVENTS.VULNERABILITY_EXPLOIT
  ];
  
  const priority = priorities[threatLevel] || priorities.medium;
  const eventBonus = criticalEvents.includes(eventType) ? 25 : 0;
  
  return Math.min(priority.base * priority.multiplier + eventBonus, 100);
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

function calculateTrend(current, previous) {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous * 100).toFixed(1);
  return `${change >= 0 ? '+' : ''}${change}%`;
}

async function testRedisConnection() {
  try {
    if (global.redis) {
      await global.redis.ping();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Apply security middleware with admin authentication required
export default applySecurityMiddleware(securityDashboardHandler, {
  rateLimit: 'api',
  sessionSecurity: true
});