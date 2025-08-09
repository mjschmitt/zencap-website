import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const result = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM models
      GROUP BY status
    `;
    
    const counts = { active: 0, inactive: 0, archived: 0 };
    result.rows.forEach(row => {
      counts[row.status] = parseInt(row.count);
    });
    
    return res.status(200).json({ success: true, counts });
  } catch (error) {
    console.error('Model counts API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch model counts' 
    });
  }
}