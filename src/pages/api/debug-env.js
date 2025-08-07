export default async function handler(req, res) {
  const key = process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    return res.status(200).json({
      hasKey: false,
      message: 'STRIPE_SECRET_KEY is not set'
    });
  }
  
  // Check for various issues
  const checks = {
    hasKey: true,
    keyLength: key.length,
    expectedLength: 107, // Your test key should be 107 characters
    startsWithCorrectPrefix: key.startsWith('sk_test_51RtAQOQ'),
    endsWithCorrectSuffix: key.endsWith('BfpHMlfO'),
    hasNewline: key.includes('\n'),
    hasCarriageReturn: key.includes('\r'),
    hasSpace: key.includes(' '),
    firstChar: key.charCodeAt(0),
    lastChar: key.charCodeAt(key.length - 1),
    last5Chars: key.slice(-5),
    keyPrefix: key.substring(0, 17),
    // Check for common encoding issues
    hasNonASCII: /[^\x00-\x7F]/.test(key),
    trimmedLength: key.trim().length,
    differentAfterTrim: key !== key.trim()
  };
  
  res.status(200).json(checks);
}