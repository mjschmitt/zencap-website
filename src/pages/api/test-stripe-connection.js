import Stripe from 'stripe';

export default async function handler(req, res) {
  try {
    // Check if key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'No Stripe key configured',
        keyExists: false 
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Try to retrieve account info to test connection
    const account = await stripe.accounts.retrieve();
    
    return res.status(200).json({ 
      success: true,
      accountId: account.id,
      accountCountry: account.country,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      defaultCurrency: account.default_currency,
      keyPrefix: process.env.STRIPE_SECRET_KEY.substring(0, 7),
      message: 'Stripe connection successful'
    });
  } catch (error) {
    console.error('Stripe connection test error:', error);
    
    return res.status(500).json({ 
      error: 'Stripe connection failed',
      errorType: error.type,
      errorMessage: error.message,
      rawError: error.raw?.message,
      keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'not set'
    });
  }
}