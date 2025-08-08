// src/pages/api/ab-analytics.js - A/B Testing Analytics API

import { sql } from '@vercel/postgres';

/**
 * A/B Testing Analytics API
 * Handles test exposure tracking, conversion tracking, and results retrieval
 */
export default async function handler(req, res) {
  // Allow CORS for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      return await handleTrackEvent(req, res);
    } else if (req.method === 'GET') {
      return await handleGetResults(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('A/B Analytics API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Handle event tracking (exposures and conversions)
 */
async function handleTrackEvent(req, res) {
  const {
    eventType,
    testId,
    variant,
    goal,
    value,
    sessionId,
    userSegment,
    page,
    testAssignments,
    ...additionalData
  } = req.body;

  // Validate required fields
  if (!eventType || !sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: eventType, sessionId'
    });
  }

  // Get client info
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    // Store in ab_test_events table
    await sql`
      INSERT INTO ab_test_events (
        event_type, test_id, variant, goal, value, session_id, user_segment,
        page, test_assignments, client_ip, user_agent, additional_data, created_at
      ) VALUES (
        ${eventType}, ${testId || null}, ${variant || null}, ${goal || null}, 
        ${value || null}, ${sessionId}, ${userSegment || null}, ${page || null},
        ${testAssignments ? JSON.stringify(testAssignments) : null},
        ${clientIp}, ${userAgent}, ${JSON.stringify(additionalData)}, NOW()
      )
    `;

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (dbError) {
    console.error('Database error in ab-analytics:', dbError);
    
    // If database fails, still return success to not break user experience
    res.status(200).json({
      success: true,
      message: 'Event received',
      warning: 'Storage may be delayed'
    });
  }
}

/**
 * Handle getting A/B test results and analytics
 */
async function handleGetResults(req, res) {
  const { testId, period = '30' } = req.query;

  try {
    // Get test performance data
    const results = {};

    if (testId) {
      // Get specific test results
      results[testId] = await getTestResults(testId, parseInt(period));
    } else {
      // Get all test results
      const activeTests = await getActiveTestIds();
      for (const id of activeTests) {
        results[id] = await getTestResults(id, parseInt(period));
      }
    }

    // Get overall A/B testing summary
    const summary = await getTestingSummary(parseInt(period));

    res.status(200).json({
      success: true,
      data: {
        results,
        summary,
        period: parseInt(period),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting A/B test results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve test results'
    });
  }
}

/**
 * Get results for a specific test
 */
async function getTestResults(testId, periodDays) {
  try {
    // Get exposures by variant
    const exposures = await sql`
      SELECT 
        variant,
        COUNT(*) as exposure_count,
        COUNT(DISTINCT session_id) as unique_users
      FROM ab_test_events 
      WHERE test_id = ${testId} 
        AND event_type = 'ab_test_exposure'
        AND created_at >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY variant
    `;

    // Get conversions by variant and goal
    const conversions = await sql`
      SELECT 
        e.variant,
        c.goal,
        COUNT(*) as conversion_count,
        SUM(COALESCE(c.value::numeric, 0)) as total_value,
        AVG(COALESCE(c.value::numeric, 0)) as avg_value
      FROM ab_test_events c
      LEFT JOIN ab_test_events e ON c.session_id = e.session_id 
        AND e.test_id = ${testId} 
        AND e.event_type = 'ab_test_exposure'
      WHERE c.event_type = 'ab_conversion'
        AND c.created_at >= NOW() - INTERVAL '${periodDays} days'
        AND e.variant IS NOT NULL
      GROUP BY e.variant, c.goal
    `;

    // Calculate conversion rates
    const variantStats = {};
    
    for (const exp of exposures.rows) {
      const variant = exp.variant;
      variantStats[variant] = {
        exposures: parseInt(exp.exposure_count),
        uniqueUsers: parseInt(exp.unique_users),
        conversions: {},
        totalConversions: 0,
        conversionRate: 0,
        revenue: 0
      };
    }

    for (const conv of conversions.rows) {
      const variant = conv.variant;
      if (variantStats[variant]) {
        variantStats[variant].conversions[conv.goal] = {
          count: parseInt(conv.conversion_count),
          totalValue: parseFloat(conv.total_value || 0),
          avgValue: parseFloat(conv.avg_value || 0)
        };
        variantStats[variant].totalConversions += parseInt(conv.conversion_count);
        variantStats[variant].revenue += parseFloat(conv.total_value || 0);
      }
    }

    // Calculate conversion rates
    for (const variant in variantStats) {
      const stats = variantStats[variant];
      if (stats.exposures > 0) {
        stats.conversionRate = (stats.totalConversions / stats.exposures) * 100;
      }
    }

    // Get timeline data (daily)
    const timeline = await sql`
      SELECT 
        DATE(created_at) as date,
        event_type,
        variant,
        COUNT(*) as count
      FROM ab_test_events 
      WHERE test_id = ${testId}
        AND created_at >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY DATE(created_at), event_type, variant
      ORDER BY date
    `;

    return {
      testId,
      period: periodDays,
      variants: variantStats,
      timeline: timeline.rows,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error getting results for test ${testId}:`, error);
    return {
      testId,
      error: error.message
    };
  }
}

/**
 * Get active test IDs from database
 */
async function getActiveTestIds() {
  try {
    const result = await sql`
      SELECT DISTINCT test_id 
      FROM ab_test_events 
      WHERE test_id IS NOT NULL
        AND created_at >= NOW() - INTERVAL '7 days'
    `;
    return result.rows.map(row => row.test_id);
  } catch (error) {
    console.error('Error getting active test IDs:', error);
    return [];
  }
}

/**
 * Get overall testing summary
 */
async function getTestingSummary(periodDays) {
  try {
    // Total tests running
    const totalTests = await sql`
      SELECT COUNT(DISTINCT test_id) as count
      FROM ab_test_events
      WHERE test_id IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${periodDays} days'
    `;

    // Total exposures and conversions
    const totals = await sql`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM ab_test_events
      WHERE created_at >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY event_type
    `;

    // Daily activity
    const dailyActivity = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM ab_test_events
      WHERE created_at >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    const summary = {
      totalActiveTests: parseInt(totalTests.rows[0]?.count || 0),
      totalExposures: 0,
      totalConversions: 0,
      dailyActivity: dailyActivity.rows
    };

    for (const total of totals.rows) {
      if (total.event_type === 'ab_test_exposure') {
        summary.totalExposures = parseInt(total.count);
      } else if (total.event_type === 'ab_conversion') {
        summary.totalConversions = parseInt(total.count);
      }
    }

    // Calculate overall conversion rate
    if (summary.totalExposures > 0) {
      summary.overallConversionRate = (summary.totalConversions / summary.totalExposures) * 100;
    } else {
      summary.overallConversionRate = 0;
    }

    return summary;
  } catch (error) {
    console.error('Error getting testing summary:', error);
    return {
      error: error.message
    };
  }
}