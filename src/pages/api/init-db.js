// src/pages/api/init-db.js - Database initialization endpoint
import { initializeDatabase } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Temporarily disable authorization for local development
  // TODO: Re-enable this for production
  /*
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.DB_INIT_SECRET || 'your-secret-key'}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  */

  try {
    await initializeDatabase();
    
    res.status(200).json({ 
      message: 'Database initialized successfully',
      success: true,
      tables: ['leads', 'newsletter_subscribers', 'form_submissions']
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      message: 'Failed to initialize database',
      error: error.message,
      success: false 
    });
  }
} 