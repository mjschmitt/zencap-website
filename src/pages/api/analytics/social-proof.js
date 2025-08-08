// API endpoint for social proof notifications
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate realistic social proof notifications
    const notifications = await generateSocialProofNotifications();

    res.status(200).json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Social Proof API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social proof data'
    });
  }
}

async function generateSocialProofNotifications() {
  const notifications = [];

  try {
    // Get recent actual purchases if any
    const recentPurchases = await sql`
      SELECT 
        transaction_id,
        model_title,
        amount,
        created_at
      FROM revenue_events 
      WHERE created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    // Add real purchases to notifications
    for (const purchase of recentPurchases.rows) {
      notifications.push({
        id: purchase.transaction_id,
        type: 'purchase',
        modelTitle: purchase.model_title,
        amount: parseFloat(purchase.amount),
        location: getRandomLocation(),
        timestamp: purchase.created_at
      });
    }

  } catch (error) {
    console.error('Error fetching real purchases:', error);
  }

  // Add realistic simulated notifications to boost social proof
  const recentTimeframes = [
    new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
    new Date(Date.now() - 28 * 60 * 1000), // 28 minutes ago
    new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    new Date(Date.now() - 67 * 60 * 1000), // 1 hour ago
    new Date(Date.now() - 95 * 60 * 1000), // 1.5 hours ago
    new Date(Date.now() - 140 * 60 * 1000), // 2+ hours ago
  ];

  const models = [
    { title: 'Multifamily Acquisition Model', amount: 4985, category: 'private-equity' },
    { title: 'Mixed-Use Development Pro', amount: 4985, category: 'private-equity' },
    { title: 'REIT Analysis Toolkit', amount: 2985, category: 'public-equity' },
    { title: 'Healthcare REIT Model', amount: 2985, category: 'public-equity' },
    { title: 'Office Complex Valuation', amount: 4985, category: 'private-equity' },
    { title: 'Industrial Property Model', amount: 4985, category: 'private-equity' },
    { title: 'Retail Investment Analysis', amount: 2985, category: 'public-equity' }
  ];

  // Generate realistic purchase notifications
  const purchaseNotifications = recentTimeframes.slice(0, 4).map((timestamp, index) => {
    const model = models[Math.floor(Math.random() * models.length)];
    return {
      id: `simulated_purchase_${index}`,
      type: 'purchase',
      modelTitle: model.title,
      amount: model.amount,
      location: getRandomLocation(),
      timestamp: timestamp.toISOString()
    };
  });

  // Generate viewing notifications (higher frequency)
  const viewingNotifications = recentTimeframes.map((timestamp, index) => {
    const model = models[Math.floor(Math.random() * models.length)];
    return {
      id: `simulated_view_${index}`,
      type: 'viewing',
      modelTitle: model.title,
      location: getRandomLocation(),
      timestamp: timestamp.toISOString()
    };
  });

  notifications.push(...purchaseNotifications);
  notifications.push(...viewingNotifications);

  // Sort by timestamp (most recent first)
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getRandomLocation() {
  const locations = [
    'New York, NY',
    'Los Angeles, CA', 
    'Chicago, IL',
    'Houston, TX',
    'Philadelphia, PA',
    'Phoenix, AZ',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'Austin, TX',
    'Jacksonville, FL',
    'Fort Worth, TX',
    'Columbus, OH',
    'Charlotte, NC',
    'San Francisco, CA',
    'Indianapolis, IN',
    'Seattle, WA',
    'Denver, CO',
    'Boston, MA',
    'Nashville, TN',
    'Oklahoma City, OK',
    'Las Vegas, NV',
    'Portland, OR',
    'Memphis, TN',
    'Louisville, KY',
    'Baltimore, MD',
    'Milwaukee, WI',
    'Albuquerque, NM',
    'Tucson, AZ',
    'Atlanta, GA',
    'Miami, FL',
    'Tampa, FL',
    'Orlando, FL',
    'Minneapolis, MN',
    'Cleveland, OH',
    'Raleigh, NC',
    'Virginia Beach, VA',
    'Omaha, NE',
    'Miami Beach, FL',
    'Long Beach, CA'
  ];

  return locations[Math.floor(Math.random() * locations.length)];
}