import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Add the excel_url column to the models table
    await sql`
      ALTER TABLE models 
      ADD COLUMN IF NOT EXISTS excel_url TEXT;
    `;

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully added excel_url column to models table' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ 
      error: 'Failed to add excel_url column', 
      details: error.message 
    });
  }
} 