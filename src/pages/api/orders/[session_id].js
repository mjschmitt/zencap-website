// API to fetch order details by Stripe session ID (guest-friendly)
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // First try to get order from database
    const result = await sql`
      SELECT * FROM orders 
      WHERE stripe_session_id = ${session_id}
      LIMIT 1
    `;

    let order = result.rows[0];

    // If no order found, try to retrieve from Stripe and create record
    if (!order) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(session_id);
        
        if (stripeSession.payment_status === 'paid') {
          // Create order record from Stripe session
          const insertResult = await sql`
            INSERT INTO orders (
              stripe_session_id, 
              customer_email, 
              customer_name,
              model_id,
              model_title, 
              model_slug,
              amount, 
              currency,
              status,
              payment_status,
              download_expires_at,
              metadata
            ) VALUES (
              ${stripeSession.id},
              ${stripeSession.customer_details?.email || stripeSession.customer_email || ''},
              ${stripeSession.customer_details?.name || stripeSession.metadata?.customerName || ''},
              ${stripeSession.metadata?.modelId || null},
              ${stripeSession.metadata?.modelTitle || stripeSession.display_items?.[0]?.custom?.name || 'Unknown Model'},
              ${stripeSession.metadata?.modelSlug || ''},
              ${(stripeSession.amount_total || 0) / 100},
              ${stripeSession.currency || 'usd'},
              'completed',
              'paid',
              ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}, -- 30 days from now
              ${JSON.stringify(stripeSession.metadata || {})}
            )
            RETURNING *
          `;
          
          order = insertResult.rows[0];
        } else {
          return res.status(404).json({ error: 'Order not found or payment incomplete' });
        }
      } catch (stripeError) {
        console.error('Stripe session retrieval error:', stripeError);
        return res.status(404).json({ error: 'Order not found' });
      }
    }

    // Set download expiry if not set (legacy orders)
    if (!order.download_expires_at) {
      await sql`
        UPDATE orders 
        SET download_expires_at = ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
        WHERE id = ${order.id}
      `;
      order.download_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Order retrieval error:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}