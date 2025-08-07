// Test script to verify Stripe environment variables are clean
const https = require('https');

// Test the production environment
const productionUrl = 'https://zencap-website.vercel.app/api/test-stripe-connection';

console.log('Testing Stripe connection on production...\n');

https.get(productionUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.success) {
        console.log('✅ SUCCESS! Stripe SDK is working properly');
        console.log('Account ID:', result.accountId);
        console.log('Charges Enabled:', result.chargesEnabled);
        console.log('Key Prefix:', result.keyPrefix);
      } else {
        console.log('❌ FAILED:', result.error);
        if (result.errorMessage) {
          console.log('Error:', result.errorMessage);
        }
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});