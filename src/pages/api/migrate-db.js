// src/pages/api/migrate-db.js - Database migration endpoint
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting database migration...');

    // Add updated_at column to newsletter_subscribers table if it doesn't exist
    try {
      await sql`
        ALTER TABLE newsletter_subscribers 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `;
      console.log('Added updated_at column to newsletter_subscribers table');
    } catch (error) {
      console.log('Column already exists or error:', error.message);
    }

    // Update existing records to have updated_at = created_at
    try {
      await sql`
        UPDATE newsletter_subscribers 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
      `;
      console.log('Updated existing newsletter subscribers with updated_at values');
    } catch (error) {
      console.log('No existing records to update or error:', error.message);
    }

    console.log('Database migration completed successfully');

    res.status(200).json({ 
      message: 'Database migration completed successfully',
      success: true
    });

  } catch (error) {
    console.error('Database migration error:', error);
    
    res.status(500).json({ 
      message: 'Database migration failed',
      success: false,
      error: error.message
    });
  }
} 