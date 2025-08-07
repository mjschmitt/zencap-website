import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log environment for debugging
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('Stripe key prefix:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'not set');

  // Check if Stripe key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ 
      error: 'Payment system is not configured. Please contact support.',
      details: process.env.NODE_ENV === 'development' ? 'Missing STRIPE_SECRET_KEY' : undefined
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });

  try {
    const { 
      modelId, 
      modelTitle, 
      modelPrice, 
      modelSlug,
      customerEmail,
      customerName 
    } = req.body;

    // Validate required fields
    if (!modelId || !modelTitle || !modelPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Checkout Sessions from body params
    const sessionConfig = {
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: modelTitle,
              description: `Professional Financial Model - ${modelTitle}`,
              images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/images/models/model-thumbnail.jpg`],
            },
            unit_amount: modelPrice * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: false,
      },
      // Customer information collection
      customer_creation: 'always',
      billing_address_collection: 'required',
      metadata: {
        modelId: modelId.toString(),
        modelSlug: modelSlug || '',
        customerName: customerName || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://zencap-website-okzp780u1-mjschmitts-projects.vercel.app'}/purchase/success?session_id={CHECKOUT_SESSION_ID}&modelTitle=${encodeURIComponent(modelTitle)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://zencap-website-okzp780u1-mjschmitts-projects.vercel.app'}/models/${modelSlug || ''}?checkout=cancelled`,
    };

    // Add customer email if provided, otherwise let Stripe collect it
    if (customerEmail && customerEmail.trim()) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    
    // Provide more specific error messages
    if (error.type === 'StripeAuthenticationError') {
      return res.status(500).json({ 
        error: 'Payment configuration error. Please contact support.',
        details: process.env.NODE_ENV === 'development' ? 'Invalid Stripe API key' : undefined
      });
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: 'Invalid request. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      error: 'Error creating checkout session. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}