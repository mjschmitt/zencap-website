// src/pages/api/orders/[sessionId].js
import { getSession } from 'next-auth/react';
import { getOrderBySessionId } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    const { sessionId } = req.query;

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get order details
    const order = await getOrderBySessionId(sessionId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the order belongs to the logged-in user
    if (order.email !== session.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Order lookup failed'
    });
  }
}