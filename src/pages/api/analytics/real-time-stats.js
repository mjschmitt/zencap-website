// Real-time Analytics API - Live dashboard data
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch real-time metrics in parallel
    const [
      activeUsers,
      recentPageViews,
      newSessions,
      recentEvents,
      currentConversions,
      liveRevenue,
      topPages,
      recentPurchases
    ] = await Promise.all([
      getActiveUsers(),
      getRecentPageViews(),
      getNewSessions(),
      getRecentEvents(),
      getCurrentConversions(),
      getLiveRevenue(),
      getTopPages(),
      getRecentPurchases()
    ]);

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      activeUsers,
      recentPageViews,
      newSessions,
      recentEvents,
      currentConversions,
      liveRevenue,
      topPages,
      recentPurchases
    });

  } catch (error) {
    console.error('Real-time Stats API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time analytics data'
    });
  }
}

// Get currently active users (last 5 minutes)
async function getActiveUsers() {
  try {
    const result = await sql`
      SELECT COUNT(DISTINCT session_id) as count
      FROM user_behavior 
      WHERE created_at >= NOW() - INTERVAL '5 minutes'
    `;
    
    return parseInt(result.rows[0]?.count || 0);
  } catch (error) {
    console.error('Error getting active users:', error);
    return 0;
  }
}

// Get page views in last 5 minutes
async function getRecentPageViews() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM user_behavior 
      WHERE created_at >= NOW() - INTERVAL '5 minutes'
        AND event_type IN ('page_view', 'click')
    `;
    
    return parseInt(result.rows[0]?.count || 0);
  } catch (error) {
    console.error('Error getting recent page views:', error);
    return 0;
  }
}

// Get new sessions in last hour
async function getNewSessions() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM session_tracking 
      WHERE start_time >= NOW() - INTERVAL '1 hour'
    `;
    
    return parseInt(result.rows[0]?.count || 0);
  } catch (error) {
    console.error('Error getting new sessions:', error);
    return 0;
  }
}

// Get recent events for activity feed
async function getRecentEvents() {
  try {
    const result = await sql`
      SELECT 
        event_type,
        event_data,
        created_at,
        page_url,
        user_segment,
        EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_ago
      FROM analytics_events 
      WHERE created_at >= NOW() - INTERVAL '2 hours'
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    return result.rows.map(row => ({
      type: formatEventType(row.event_type),
      details: extractEventDetails(row.event_type, row.event_data, row.page_url),
      timeAgo: formatTimeAgo(parseFloat(row.seconds_ago)),
      userSegment: row.user_segment,
      rawType: row.event_type
    }));
  } catch (error) {
    console.error('Error getting recent events:', error);
    return [];
  }
}

// Get current conversions (today)
async function getCurrentConversions() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_conversions,
        SUM(conversion_value) as total_value,
        COUNT(CASE WHEN conversion_type = 'purchase' THEN 1 END) as purchases,
        COUNT(CASE WHEN conversion_type = 'lead' THEN 1 END) as leads
      FROM conversions_attributed 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    
    const data = result.rows[0] || {};
    return {
      total: parseInt(data.total_conversions || 0),
      value: parseFloat(data.total_value || 0),
      purchases: parseInt(data.purchases || 0),
      leads: parseInt(data.leads || 0)
    };
  } catch (error) {
    console.error('Error getting current conversions:', error);
    return { total: 0, value: 0, purchases: 0, leads: 0 };
  }
}

// Get live revenue (today)
async function getLiveRevenue() {
  try {
    const result = await sql`
      SELECT 
        SUM(amount) as today_revenue,
        COUNT(*) as today_transactions,
        AVG(amount) as avg_order_value
      FROM revenue_events 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    
    // Get hourly revenue for today
    const hourlyResult = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM revenue_events 
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `;
    
    const data = result.rows[0] || {};
    return {
      todayRevenue: parseFloat(data.today_revenue || 0),
      todayTransactions: parseInt(data.today_transactions || 0),
      avgOrderValue: parseFloat(data.avg_order_value || 0),
      hourlyBreakdown: hourlyResult.rows.map(row => ({
        hour: parseInt(row.hour),
        revenue: parseFloat(row.revenue),
        transactions: parseInt(row.transactions)
      }))
    };
  } catch (error) {
    console.error('Error getting live revenue:', error);
    return { todayRevenue: 0, todayTransactions: 0, avgOrderValue: 0, hourlyBreakdown: [] };
  }
}

// Get top pages by current activity
async function getTopPages() {
  try {
    const result = await sql`
      SELECT 
        page_url,
        COUNT(*) as activity_count,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(scroll_depth) as avg_scroll_depth
      FROM user_behavior 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND page_url IS NOT NULL
      GROUP BY page_url
      ORDER BY activity_count DESC
      LIMIT 10
    `;
    
    return result.rows.map(row => ({
      url: row.page_url,
      title: extractPageTitle(row.page_url),
      activity: parseInt(row.activity_count),
      visitors: parseInt(row.unique_visitors),
      avgScrollDepth: parseFloat(row.avg_scroll_depth) || 0
    }));
  } catch (error) {
    console.error('Error getting top pages:', error);
    return [];
  }
}

// Get recent purchases for social proof
async function getRecentPurchases() {
  try {
    const result = await sql`
      SELECT 
        model_title,
        amount,
        customer_email,
        created_at,
        EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_ago
      FROM revenue_events 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    return result.rows.map(row => ({
      modelTitle: row.model_title,
      amount: parseFloat(row.amount),
      customerEmail: anonymizeEmail(row.customer_email),
      timeAgo: formatTimeAgo(parseFloat(row.seconds_ago))
    }));
  } catch (error) {
    console.error('Error getting recent purchases:', error);
    return [];
  }
}

// Utility functions
function formatEventType(eventType) {
  const typeMap = {
    'model_view': 'Model Viewed',
    'model_interaction': 'Model Interaction',
    'purchase_completed': 'Purchase Completed',
    'lead_generated': 'Lead Generated',
    'funnel_step': 'Funnel Progress',
    'checkout_step': 'Checkout Step',
    'cart_abandoned': 'Cart Abandoned',
    'email_signup': 'Email Signup',
    'high_value_click': 'High-Value Click',
    'scroll_milestone': 'Scroll Milestone',
    'form_focus': 'Form Interaction',
    'page_view': 'Page View'
  };
  
  return typeMap[eventType] || eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function extractEventDetails(eventType, eventData, pageUrl) {
  try {
    const data = typeof eventData === 'string' ? JSON.parse(eventData) : eventData;
    
    switch (eventType) {
      case 'model_view':
        return `${data.modelTitle || 'Financial Model'} - $${data.modelPrice || 'N/A'}`;
      case 'purchase_completed':
        return `${data.modelTitle || 'Model'} purchased for $${data.amount || 'N/A'}`;
      case 'lead_generated':
        return `New lead: ${data.interest || 'General Interest'}`;
      case 'model_interaction':
        return `${data.interactionType || 'Interaction'}: ${data.modelTitle || 'Model'}`;
      case 'checkout_step':
        return `Checkout: ${data.step || 'Unknown Step'}`;
      case 'email_signup':
        return `Newsletter signup via ${data.signup_source || 'website'}`;
      case 'high_value_click':
        return `Clicked ${data.element?.selector || 'important element'}`;
      case 'scroll_milestone':
        return `Scrolled ${data.milestone || '0'}% on ${extractPageTitle(pageUrl)}`;
      default:
        return data.modelTitle || data.details || extractPageTitle(pageUrl) || 'Website activity';
    }
  } catch (error) {
    return 'Website activity';
  }
}

function extractPageTitle(url) {
  if (!url) return 'Unknown Page';
  
  const titleMap = {
    '/': 'Home',
    '/about': 'About',
    '/contact': 'Contact',
    '/models': 'Models',
    '/models/private-equity': 'Private Equity Models',
    '/models/public-equity': 'Public Equity Models',
    '/insights': 'Insights',
    '/solutions': 'Solutions',
    '/admin': 'Admin Dashboard'
  };
  
  // Extract path from URL
  const path = url.replace(/^https?:\/\/[^\/]+/, '').split('?')[0];
  
  if (titleMap[path]) {
    return titleMap[path];
  }
  
  // Handle dynamic routes
  if (path.startsWith('/models/')) {
    return 'Model Details';
  }
  if (path.startsWith('/insights/')) {
    return 'Insight Article';
  }
  
  return path.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page';
}

function anonymizeEmail(email) {
  if (!email) return 'Anonymous';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return 'Anonymous';
  
  const anonymizedLocal = localPart.length > 2 
    ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
    : localPart[0] + '*';
    
  return `${anonymizedLocal}@${domain}`;
}

function formatTimeAgo(seconds) {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }
}