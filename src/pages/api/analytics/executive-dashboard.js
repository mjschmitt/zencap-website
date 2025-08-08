// Executive Dashboard API - Comprehensive Analytics Data
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { range = '30d' } = req.query;
    const dateRange = getDateRange(range);
    
    // Fetch all dashboard data in parallel
    const [
      revenue,
      leads,
      conversion,
      engagement,
      models,
      traffic,
      funnel,
      behavior,
      realTime
    ] = await Promise.all([
      getRevenueData(dateRange),
      getLeadsData(dateRange), 
      getConversionData(dateRange),
      getEngagementData(dateRange),
      getModelPerformance(dateRange),
      getTrafficSources(dateRange),
      getFunnelData(dateRange),
      getBehaviorData(dateRange),
      getRealTimeData()
    ]);

    res.status(200).json({
      success: true,
      dateRange: range,
      generatedAt: new Date().toISOString(),
      data: {
        revenue,
        leads,
        conversion,
        engagement,
        models,
        traffic,
        funnel,
        behavior,
        realTime
      }
    });

  } catch (error) {
    console.error('Executive Dashboard API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate executive dashboard data'
    });
  }
}

// Revenue Analytics
async function getRevenueData(dateRange) {
  const { startDate, endDate, previousStartDate } = dateRange;

  // Current period revenue
  const currentRevenue = await sql`
    SELECT 
      SUM(amount) as total_revenue,
      COUNT(*) as transaction_count,
      AVG(amount) as avg_order_value,
      COUNT(DISTINCT customer_email) as unique_customers
    FROM revenue_events 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
  `;

  // Previous period for comparison
  const previousRevenue = await sql`
    SELECT 
      SUM(amount) as total_revenue,
      COUNT(*) as transaction_count,
      AVG(amount) as avg_order_value
    FROM revenue_events 
    WHERE created_at >= ${previousStartDate} AND created_at < ${startDate}
  `;

  // Daily revenue trend
  const revenueTrend = await sql`
    SELECT 
      DATE(created_at) as date,
      SUM(amount) as revenue,
      COUNT(*) as transactions,
      AVG(amount) as avg_order_value
    FROM revenue_events 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  // Revenue by model category
  const revenueByCategory = await sql`
    SELECT 
      model_category as category,
      SUM(amount) as revenue,
      COUNT(*) as sales,
      AVG(amount) as avg_price
    FROM revenue_events 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      AND model_category IS NOT NULL
    GROUP BY model_category
    ORDER BY revenue DESC
  `;

  // Customer segmentation by revenue
  const customerSegments = await sql`
    SELECT 
      CASE 
        WHEN customer_revenue >= 10000 THEN 'Enterprise ($10K+)'
        WHEN customer_revenue >= 5000 THEN 'Professional ($5K-10K)'  
        WHEN customer_revenue >= 2000 THEN 'Standard ($2K-5K)'
        ELSE 'Entry (<$2K)'
      END as segment,
      COUNT(*) as customers,
      SUM(customer_revenue) as total_revenue
    FROM (
      SELECT 
        customer_email,
        SUM(amount) as customer_revenue
      FROM revenue_events 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY customer_email
    ) customer_totals
    GROUP BY segment
    ORDER BY total_revenue DESC
  `;

  const current = currentRevenue.rows[0];
  const previous = previousRevenue.rows[0];

  return {
    total: parseFloat(current.total_revenue || 0),
    growth: calculateGrowth(current.total_revenue, previous.total_revenue),
    transactions: parseInt(current.transaction_count || 0),
    avgOrderValue: parseFloat(current.avg_order_value || 0),
    aovGrowth: calculateGrowth(current.avg_order_value, previous.avg_order_value),
    uniqueCustomers: parseInt(current.unique_customers || 0),
    revenueTrend: revenueTrend.rows.map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue),
      transactions: parseInt(row.transactions),
      avgOrderValue: parseFloat(row.avg_order_value)
    })),
    revenueByCategory: revenueByCategory.rows.map(row => ({
      category: row.category,
      revenue: parseFloat(row.revenue),
      sales: parseInt(row.sales),
      avgPrice: parseFloat(row.avg_price)
    })),
    customerSegments: customerSegments.rows.map(row => ({
      name: row.segment,
      value: parseInt(row.customers),
      revenue: parseFloat(row.total_revenue)
    }))
  };
}

// Leads Analytics
async function getLeadsData(dateRange) {
  const { startDate, endDate, previousStartDate } = dateRange;

  // Current leads
  const currentLeads = await sql`
    SELECT COUNT(*) as total_leads
    FROM leads 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
  `;

  // Previous period leads
  const previousLeads = await sql`
    SELECT COUNT(*) as total_leads
    FROM leads 
    WHERE created_at >= ${previousStartDate} AND created_at < ${startDate}
  `;

  // Lead sources performance
  const leadSources = await sql`
    SELECT 
      source,
      COUNT(*) as leads,
      COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
      ROUND(
        COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / COUNT(*), 
        2
      ) as conversion_rate
    FROM leads 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      AND source IS NOT NULL
    GROUP BY source
    ORDER BY leads DESC
  `;

  // Daily lead generation
  const dailyLeads = await sql`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as leads
    FROM leads 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const current = currentLeads.rows[0];
  const previous = previousLeads.rows[0];

  return {
    total: parseInt(current.total_leads || 0),
    growth: calculateGrowth(current.total_leads, previous.total_leads),
    dailyLeads: dailyLeads.rows.map(row => ({
      date: row.date,
      leads: parseInt(row.leads)
    })),
    leadSources: leadSources.rows.map(row => ({
      name: row.source,
      leads: parseInt(row.leads),
      converted: parseInt(row.converted),
      conversionRate: parseFloat(row.conversion_rate)
    }))
  };
}

// Conversion Analytics  
async function getConversionData(dateRange) {
  const { startDate, endDate } = dateRange;

  // Overall conversion rate
  const conversionRate = await sql`
    SELECT 
      COUNT(DISTINCT session_id) as total_sessions,
      COUNT(DISTINCT CASE WHEN conversion_value > 0 THEN session_id END) as converted_sessions
    FROM conversions_attributed 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
  `;

  // Conversion trend by day
  const conversionTrend = await sql`
    SELECT 
      DATE(created_at) as date,
      COUNT(DISTINCT session_id) as sessions,
      COUNT(DISTINCT CASE WHEN conversion_value > 0 THEN session_id END) as conversions,
      ROUND(
        COUNT(DISTINCT CASE WHEN conversion_value > 0 THEN session_id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT session_id), 0), 
        2
      ) as rate
    FROM conversions_attributed 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  // A/B test results
  const abTests = await sql`
    SELECT 
      test_name,
      variant,
      COUNT(*) as participants,
      COUNT(CASE WHEN conversion THEN 1 END) as conversions,
      ROUND(
        COUNT(CASE WHEN conversion THEN 1 END) * 100.0 / COUNT(*), 
        2
      ) as conversion_rate
    FROM ab_test_results 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY test_name, variant
    ORDER BY test_name, variant
  `;

  const conversionData = conversionRate.rows[0];
  const totalSessions = parseInt(conversionData.total_sessions || 0);
  const convertedSessions = parseInt(conversionData.converted_sessions || 0);
  const rate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;

  return {
    rate: rate,
    growth: 0, // Would need previous period calculation
    totalSessions,
    convertedSessions,
    conversionTrend: conversionTrend.rows.map(row => ({
      date: row.date,
      sessions: parseInt(row.sessions),
      conversions: parseInt(row.conversions),
      rate: parseFloat(row.rate)
    })),
    abTests: groupABTests(abTests.rows)
  };
}

// Engagement Analytics
async function getEngagementData(dateRange) {
  const { startDate, endDate } = dateRange;

  // Page engagement metrics
  const pageEngagement = await sql`
    SELECT 
      page_url,
      AVG(avg_session_duration) as avg_time,
      AVG(avg_scroll_depth) as avg_scroll_depth,
      AVG(bounce_rate) as bounce_rate,
      SUM(sessions_count) as sessions
    FROM page_engagement_metrics 
    WHERE date >= ${startDate} AND date <= ${endDate}
    GROUP BY page_url
    ORDER BY sessions DESC
    LIMIT 10
  `;

  // Device breakdown
  const deviceBreakdown = await sql`
    SELECT 
      device_category,
      COUNT(*) as sessions,
      AVG(duration) as avg_duration
    FROM session_tracking 
    WHERE start_time >= ${startDate} AND start_time <= ${endDate}
      AND device_category IS NOT NULL
    GROUP BY device_category
    ORDER BY sessions DESC
  `;

  // User paths analysis
  const userPaths = await sql`
    WITH path_analysis AS (
      SELECT 
        page_url,
        COUNT(*) as visits,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
      FROM user_behavior 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        AND event_type = 'page_view'
      GROUP BY page_url
    )
    SELECT 
      page_url as path,
      visits as users,
      ROUND(visits * 100.0 / SUM(visits) OVER (), 2) as percentage
    FROM path_analysis 
    WHERE rank <= 10
    ORDER BY visits DESC
  `;

  return {
    pageEngagement: pageEngagement.rows.map(row => ({
      path: row.page_url,
      sessions: parseInt(row.sessions),
      avgTime: formatDuration(row.avg_time),
      bounceRate: parseFloat(row.bounce_rate).toFixed(1),
      avgScrollDepth: parseFloat(row.avg_scroll_depth).toFixed(1)
    })),
    deviceBreakdown: deviceBreakdown.rows.map(row => ({
      name: row.device_category,
      sessions: parseInt(row.sessions),
      avgDuration: parseFloat(row.avg_duration)
    })),
    userPaths: userPaths.rows.map(row => ({
      path: row.path,
      users: parseInt(row.users),
      percentage: parseFloat(row.percentage)
    }))
  };
}

// Model Performance Analytics
async function getModelPerformance(dateRange) {
  const { startDate, endDate } = dateRange;

  // Top performing models
  const topModels = await sql`
    SELECT 
      ma.model_id,
      ma.model_title as title,
      ma.model_category as category,
      SUM(ma.view_count) as views,
      SUM(ma.download_count) as downloads,
      SUM(ma.purchase_count) as sales,
      SUM(ma.total_revenue) as revenue,
      CASE 
        WHEN SUM(ma.view_count) > 0 
        THEN ROUND(SUM(ma.purchase_count) * 100.0 / SUM(ma.view_count), 2)
        ELSE 0 
      END as conversion_rate
    FROM model_analytics ma
    WHERE ma.date >= ${startDate} AND ma.date <= ${endDate}
    GROUP BY ma.model_id, ma.model_title, ma.model_category
    ORDER BY revenue DESC
    LIMIT 20
  `;

  // Model performance metrics
  const modelPerformance = await sql`
    SELECT 
      model_title as title,
      SUM(view_count) as views,
      SUM(download_count) as downloads,
      SUM(purchase_count) as sales,
      SUM(total_revenue) as revenue,
      ROUND(AVG(conversion_rate), 2) as conversion_rate
    FROM model_analytics 
    WHERE date >= ${startDate} AND date <= ${endDate}
    GROUP BY model_title
    ORDER BY revenue DESC
  `;

  return {
    topModels: topModels.rows.map(row => ({
      id: row.model_id,
      title: row.title,
      category: row.category,
      views: parseInt(row.views),
      downloads: parseInt(row.downloads),
      sales: parseInt(row.sales),
      revenue: parseFloat(row.revenue),
      conversionRate: parseFloat(row.conversion_rate)
    })),
    modelPerformance: modelPerformance.rows.map(row => ({
      title: row.title,
      views: parseInt(row.views),
      downloads: parseInt(row.downloads),
      sales: parseInt(row.sales),
      revenue: parseFloat(row.revenue),
      conversionRate: parseFloat(row.conversion_rate)
    }))
  };
}

// Traffic Sources Analytics
async function getTrafficSources(dateRange) {
  const { startDate, endDate } = dateRange;

  const trafficSources = await sql`
    SELECT 
      source,
      COUNT(*) as sessions,
      COUNT(DISTINCT user_id) as users,
      AVG(CASE WHEN conversion_value > 0 THEN conversion_value ELSE 0 END) as avg_conversion_value
    FROM conversions_attributed 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      AND source IS NOT NULL
    GROUP BY source
    ORDER BY sessions DESC
  `;

  return trafficSources.rows.map(row => ({
    name: row.source,
    value: parseInt(row.sessions),
    users: parseInt(row.users),
    avgValue: parseFloat(row.avg_conversion_value)
  }));
}

// Funnel Analytics
async function getFunnelData(dateRange) {
  const { startDate, endDate } = dateRange;

  const funnelSteps = await sql`
    SELECT 
      step_name as name,
      step_number,
      SUM(completion_count) as count
    FROM conversion_funnel 
    WHERE date >= ${startDate} AND date <= ${endDate}
    GROUP BY step_name, step_number
    ORDER BY step_number
  `;

  // Calculate percentages
  const totalStart = funnelSteps.rows[0]?.count || 1;
  
  return funnelSteps.rows.map(step => ({
    name: step.name,
    count: parseInt(step.count),
    percentage: (parseInt(step.count) / totalStart) * 100
  }));
}

// User Behavior Analytics
async function getBehaviorData(dateRange) {
  const { startDate, endDate } = dateRange;

  // Most engaged pages
  const engagedPages = await sql`
    SELECT 
      page_url,
      COUNT(*) as interactions,
      AVG(scroll_depth) as avg_scroll,
      AVG(time_on_page) as avg_time
    FROM user_behavior 
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      AND page_url IS NOT NULL
    GROUP BY page_url
    ORDER BY interactions DESC
    LIMIT 10
  `;

  return {
    engagedPages: engagedPages.rows.map(row => ({
      url: row.page_url,
      interactions: parseInt(row.interactions),
      avgScroll: parseFloat(row.avg_scroll),
      avgTime: parseFloat(row.avg_time)
    }))
  };
}

// Real-time Analytics
async function getRealTimeData() {
  // Active users in last 5 minutes
  const activeUsers = await sql`
    SELECT COUNT(DISTINCT session_id) as active_users
    FROM user_behavior 
    WHERE created_at >= NOW() - INTERVAL '5 minutes'
  `;

  // Recent events
  const recentEvents = await sql`
    SELECT 
      event_type as type,
      event_data->>'modelTitle' as details,
      EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_ago
    FROM analytics_events 
    WHERE created_at >= NOW() - INTERVAL '1 hour'
    ORDER BY created_at DESC
    LIMIT 20
  `;

  // Page views in last 5 minutes
  const recentPageViews = await sql`
    SELECT COUNT(*) as page_views
    FROM user_behavior 
    WHERE created_at >= NOW() - INTERVAL '5 minutes'
      AND event_type = 'page_view'
  `;

  return {
    activeUsers: parseInt(activeUsers.rows[0]?.active_users || 0),
    recentPageViews: parseInt(recentPageViews.rows[0]?.page_views || 0),
    recentEvents: recentEvents.rows.map(row => ({
      type: row.type,
      details: row.details || 'N/A',
      timeAgo: formatTimeAgo(row.seconds_ago)
    }))
  };
}

// Utility Functions
function getDateRange(range) {
  const endDate = new Date();
  const startDate = new Date();
  const previousStartDate = new Date();

  switch (range) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      previousStartDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      previousStartDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      previousStartDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      previousStartDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
      previousStartDate.setDate(startDate.getDate() - 30);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    previousStartDate: previousStartDate.toISOString()
  };
}

function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatTimeAgo(seconds) {
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function groupABTests(abTestRows) {
  const tests = {};
  
  abTestRows.forEach(row => {
    if (!tests[row.test_name]) {
      tests[row.test_name] = {
        name: row.test_name,
        status: 'running', // Would need additional logic to determine status
        variants: {}
      };
    }
    
    tests[row.test_name].variants[row.variant] = {
      participants: parseInt(row.participants),
      conversions: parseInt(row.conversions),
      conversionRate: parseFloat(row.conversion_rate)
    };
  });

  return Object.values(tests).map(test => ({
    name: test.name,
    status: test.status,
    control: test.variants.control || { conversionRate: 0 },
    variant: test.variants.variant || { conversionRate: 0 }
  }));
}