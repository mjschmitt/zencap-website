// SECURITY: This debug endpoint has been disabled for production security
// Original functionality exposed sensitive Stripe secrets
export default async function handler(req, res) {
  // Only allow in development environment with explicit flag
  if (process.env.NODE_ENV === 'production' || !process.env.ENABLE_DEBUG_ENDPOINTS) {
    return res.status(404).json({ 
      error: 'Endpoint not found',
      code: 'NOT_FOUND' 
    });
  }

  // Require admin authentication for debug access
  const authHeader = req.headers.authorization;
  const debugToken = process.env.DEBUG_ACCESS_TOKEN;
  
  if (!authHeader || !debugToken || authHeader !== `Bearer ${debugToken}`) {
    return res.status(401).json({
      error: 'Unauthorized access to debug endpoint',
      code: 'UNAUTHORIZED'
    });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    return res.status(200).json({
      hasKey: false,
      message: 'STRIPE_SECRET_KEY is not configured'
    });
  }
  
  // Only return basic validation info - no sensitive details
  const checks = {
    hasKey: true,
    keyLength: key.length,
    isTestKey: key.startsWith('sk_test_'),
    isValidFormat: /^sk_(test|live)_[a-zA-Z0-9]+$/.test(key),
    hasWhitespace: /\s/.test(key),
    trimmedMatches: key === key.trim()
  };
  
  res.status(200).json({
    message: 'Debug endpoint - secure version',
    checks,
    timestamp: new Date().toISOString()
  });
}