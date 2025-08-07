import Stripe from 'stripe';

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

    // Initialize Stripe inside the handler with explicit API version
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: modelTitle,
              description: `Professional Financial Model - ${modelTitle}`,
            },
            unit_amount: Math.round(modelPrice * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://zencap-website.vercel.app/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://zencap-website.vercel.app/models`,
      billing_address_collection: 'required',
      customer_creation: 'always',
      allow_promotion_codes: true,
      metadata: {
        modelId: modelId.toString(),
        modelSlug: modelSlug || '',
        modelTitle: modelTitle,
        customerName: customerName || '',
      },
    });

    res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Stripe error:', error);
    
    res.status(500).json({ 
      error: 'Failed to create checkout session. Please try again.',
      details: error.message
    });
  }
}