// src/pages/api/account/orders.js
import { getSession } from 'next-auth/react';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get orders for the user
    const result = await sql`
      SELECT o.*, m.title as model_title, m.slug as model_slug
      FROM orders o
      LEFT JOIN models m ON o.model_id = m.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE c.email = ${session.user.email}
      ORDER BY o.created_at DESC;
    `;

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Orders lookup failed'
    });
  }
}