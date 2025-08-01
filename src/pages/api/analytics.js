import { sql } from '@vercel/postgres';
import { getAllLeads, getNewsletterSubscribersCount } from '../../utils/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get leads data
    const leadsResult = await sql`
      SELECT 
        id, name, email, company, interest, message, 
        ip_address, user_agent, created_at, updated_at, 
        status, source
      FROM leads 
      ORDER BY created_at DESC
    `;

    // Get newsletter subscribers count
    const newsletterResult = await sql`
      SELECT COUNT(*) as count FROM newsletter_subscribers
    `;

    // Get leads by date (last 30 days)
    const leadsByDateResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM leads 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get leads by source
    const leadsBySourceResult = await sql`
      SELECT 
        source,
        COUNT(*) as count
      FROM leads 
      GROUP BY source
      ORDER BY count DESC
    `;

    // Get leads by interest
    const leadsByInterestResult = await sql`
      SELECT 
        interest,
        COUNT(*) as count
      FROM leads 
      GROUP BY interest
      ORDER BY count DESC
    `;

    // Get recent activity (last 7 days)
    const recentActivityResult = await sql`
      SELECT 
        'lead' as type,
        name,
        email,
        created_at,
        source
      FROM leads 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT 
        'newsletter' as type,
        email as name,
        email,
        created_at,
        'newsletter' as source
      FROM newsletter_subscribers 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Get models count
    const modelsResult = await sql`SELECT COUNT(*) as count FROM models WHERE status = 'active'`;
    // Get insights count
    const insightsResult = await sql`SELECT COUNT(*) as count FROM insights WHERE status = 'published'`;

    const analytics = {
      leads: {
        total: leadsResult.rows.length,
        latest: leadsResult.rows.slice(0, 50), // Latest 50 leads
        byDate: leadsByDateResult.rows,
        bySource: leadsBySourceResult.rows,
        byInterest: leadsByInterestResult.rows,
        recentActivity: recentActivityResult.rows
      },
      newsletter: {
        subscribers: parseInt(newsletterResult.rows[0].count),
        recentActivity: recentActivityResult.rows.filter(activity => activity.type === 'newsletter')
      },
      models: {
        total: parseInt(modelsResult.rows[0].count)
      },
      insights: {
        total: parseInt(insightsResult.rows[0].count)
      },
      summary: {
        totalLeads: leadsResult.rows.length,
        totalSubscribers: parseInt(newsletterResult.rows[0].count),
        conversionRate: leadsResult.rows.length > 0 
          ? Math.round((parseInt(newsletterResult.rows[0].count) / leadsResult.rows.length) * 100) 
          : 0,
        lastUpdated: new Date().toISOString()
      }
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
} 