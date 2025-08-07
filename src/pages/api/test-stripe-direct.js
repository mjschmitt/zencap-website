export default async function handler(req, res) {
  try {
    // Direct fetch to Stripe API without SDK
    const response = await fetch('https://api.stripe.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': '2023-10-16'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Stripe API error',
        status: response.status,
        data: data,
        keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'not set'
      });
    }

    return res.status(200).json({
      success: true,
      accountId: data.id,
      country: data.country,
      keyPrefix: process.env.STRIPE_SECRET_KEY.substring(0, 7)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Direct API call failed',
      message: error.message,
      keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'not set'
    });
  }
}