export default function handler(req, res) {
  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
  const keyPrefix = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'not set';
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const publishableKeyPrefix = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 7) : 'not set';
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'not set';
  
  res.status(200).json({
    hasStripeKey,
    keyPrefix,
    hasPublishableKey,
    publishableKeyPrefix,
    hasWebhookSecret,
    baseUrl,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
}