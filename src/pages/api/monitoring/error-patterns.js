/**
 * @fileoverview Error patterns API endpoint
 * @module api/monitoring/error-patterns
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
 * Error patterns handler
 */
async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      timeRange = '24h',
      limit = '20',
      minOccurrences = '2'
    } = req.query;
    
    // Calculate time window
    const timeWindow = getTimeWindow(timeRange);
    const limitNum = Math.min(parseInt(limit), 100); // Cap at 100
    const minOccurrencesNum = parseInt(minOccurrences);
    
    // Fetch error patterns
    const patternsResult = await sql`
      SELECT 
        pattern_id,
        pattern_type,
        pattern_data,
        occurrence_count,
        first_seen,
        last_seen
      FROM error_patterns
      WHERE last_seen >= ${timeWindow.toISOString()}
      AND occurrence_count >= ${minOccurrencesNum}
      ORDER BY occurrence_count DESC, last_seen DESC
      LIMIT ${limitNum}
    `;

    // Process patterns
    const patterns = patternsResult.rows.map(row => ({
      id: row.pattern_id,
      type: row.pattern_type,
      message: row.pattern_data?.message || 'Unknown error pattern',
      count: row.occurrence_count,
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      data: row.pattern_data
    }));

    // Get pattern trends
    const trendsResult = await sql`
      SELECT 
        pattern_type,
        DATE_TRUNC('hour', last_seen) as hour,
        SUM(occurrence_count) as hourly_count
      FROM error_patterns
      WHERE last_seen >= ${timeWindow.toISOString()}
      GROUP BY pattern_type, DATE_TRUNC('hour', last_seen)
      ORDER BY hour DESC, hourly_count DESC
      LIMIT 100
    `;

    const trends = trendsResult.rows.map(row => ({
      type: row.pattern_type,
      hour: row.hour,
      count: parseInt(row.hourly_count)
    }));

    return res.status(200).json({
      success: true,
      patterns,
      trends,
      timeRange,
      totalPatterns: patterns.length
    });

  } catch (error) {
    console.error('Error patterns endpoint error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch error patterns',
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

// Apply rate limiting
export default withRateLimit(handler, 'monitoring', {
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});