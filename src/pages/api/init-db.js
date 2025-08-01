// src/pages/api/init-db.js - Database initialization endpoint
import { initializeDatabase } from '../../utils/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initializeDatabase();
    
    res.status(200).json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    });
  }
} 