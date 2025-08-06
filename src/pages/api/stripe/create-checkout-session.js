import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const session = await stripe.checkout.sessions.create({
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
        enabled: false, // You can enable automatic tax calculation if needed
      },
      customer_email: customerEmail,
      metadata: {
        modelId: modelId.toString(),
        modelSlug: modelSlug || '',
        customerName: customerName || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&modelTitle=${encodeURIComponent(modelTitle)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel?modelTitle=${encodeURIComponent(modelTitle)}&modelSlug=${modelSlug}`,
    });

    res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    res.status(500).json({ 
      error: 'Error creating checkout session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}