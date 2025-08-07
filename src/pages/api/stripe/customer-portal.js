// src/pages/api/stripe/customer-portal.js
import Stripe from 'stripe';
import { getSession } from 'next-auth/react';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize Stripe inside the handler with explicit API version
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  try {
    const session = await getSession({ req });
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find customer by email
    const result = await sql`
      SELECT stripe_customer_id FROM customers WHERE email = ${session.user.email};
    `;

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const stripeCustomerId = result.rows[0].stripe_customer_id;

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/account/purchases`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Portal access failed'
    });
  }
}