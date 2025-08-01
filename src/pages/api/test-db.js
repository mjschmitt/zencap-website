// src/pages/api/test-db.js - Temporary endpoint to check database contents
import { getAllLeads, getNewsletterSubscribersCount } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get leads count and latest leads
    const leads = await getAllLeads();
    const newsletterCount = await getNewsletterSubscribersCount();
    
    res.status(200).json({ 
      success: true,
      data: {
        leads: {
          total: leads.length,
          latest: leads.slice(0, 5) // Show latest 5 leads
        },
        newsletter: {
          subscribers: newsletterCount
        }
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch database data',
      error: error.message,
      success: false 
    });
  }
} 