/**
 * @fileoverview Error metrics API endpoint
 * @module api/monitoring/error-metrics
 */

import { sql } from '@vercel/postgres';
import { withRateLimit } from '../../../middleware/rate-limit';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

/**
 * Error metrics handler
 */
async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const timeRange = req.query.timeRange || '24h';
    
    // Calculate time window
    const timeWindow = getTimeWindow(timeRange);
    
    // Fetch error metrics
    const [
      errorRateResult,
      activeIncidentsResult,
      resolvedTodayResult,
      avgResolutionResult
    ] = await Promise.allSettled([
      getErrorRate(timeWindow),
      getActiveIncidents(),
      getResolvedToday(),
      getAverageResolutionTime()
    ]);

    // Compile metrics
    const metrics = {
      errorRate: errorRateResult.status === 'fulfilled' ? errorRateResult.value : 0,
      activeIncidents: activeIncidentsResult.status === 'fulfilled' ? activeIncidentsResult.value : 0,
      resolvedToday: resolvedTodayResult.status === 'fulfilled' ? resolvedTodayResult.value : 0,
      avgResolutionTime: avgResolutionResult.status === 'fulfilled' ? avgResolutionResult.value : 0,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      metrics,
      timeRange
    });

  } catch (error) {
    console.error('Error metrics endpoint error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch error metrics',
      message: error.message
    });
  }
}

/**
 * Get time window for queries
 * @param {string} timeRange - Time range (1h, 24h, 7d, 30d)
 * @returns {Date} Start date for queries
 */
function getTimeWindow(timeRange) {
  const now = new Date();
  
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

/**
 * Calculate error rate
 * @param {Date} startTime - Start time for calculation
 * @returns {Promise<number>} Error rate percentage
 */
async function getErrorRate(startTime) {
  try {
    // This would typically compare errors to total requests
    // For now, we'll use monitoring alerts as a proxy
    const result = await sql`
      SELECT COUNT(*) as error_count
      FROM monitoring_alerts
      WHERE timestamp >= ${startTime.toISOString()}
      AND severity_level >= 2
    `;
    
    const errorCount = parseInt(result.rows[0]?.error_count || 0);
    
    // For demo purposes, calculate a rate based on error count
    // In production, this would be errors/total_requests * 100
    const baselineRequests = 10000; // Estimate baseline requests
    const errorRate = Math.min((errorCount / baselineRequests) * 100, 100);
    
    return Math.round(errorRate * 100) / 100; // Round to 2 decimal places

  } catch (error) {
    console.error('Failed to calculate error rate:', error);
    return 0;
  }
}

/**
 * Get active incidents count
 * @returns {Promise<number>} Number of active incidents
 */
async function getActiveIncidents() {
  try {
    const result = await sql`
      SELECT COUNT(*) as active_count
      FROM incidents
      WHERE status = 'open'
      OR status = 'investigating'
    `;
    
    return parseInt(result.rows[0]?.active_count || 0);

  } catch (error) {
    console.error('Failed to get active incidents:', error);
    return 0;
  }
}

/**
 * Get resolved incidents today
 * @returns {Promise<number>} Number of resolved incidents today
 */
async function getResolvedToday() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const result = await sql`
      SELECT COUNT(*) as resolved_count
      FROM incidents
      WHERE status = 'resolved'
      AND updated_at >= ${todayStart.toISOString()}
    `;
    
    return parseInt(result.rows[0]?.resolved_count || 0);

  } catch (error) {
    console.error('Failed to get resolved incidents:', error);
    return 0;
  }
}

/**
 * Get average resolution time
 * @returns {Promise<number>} Average resolution time in minutes
 */
async function getAverageResolutionTime() {
  try {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await sql`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) as avg_resolution_minutes
      FROM incidents
      WHERE status = 'resolved'
      AND created_at >= ${last7Days.toISOString()}
      AND updated_at IS NOT NULL
    `;
    
    const avgMinutes = parseFloat(result.rows[0]?.avg_resolution_minutes || 0);
    return Math.round(avgMinutes);

  } catch (error) {
    console.error('Failed to get average resolution time:', error);
    return 0;
  }
}

// Apply rate limiting
export default withRateLimit(handler, 'monitoring', {
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});