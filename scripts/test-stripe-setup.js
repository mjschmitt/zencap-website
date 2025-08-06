/**
 * Quick Stripe Setup Test
 * Run this after adding your keys to verify configuration
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 CHECKING STRIPE CONFIGURATION\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const checks = {
  secretKey: false,
  publishableKey: false,
  webhookSecret: false
};

// Check Secret Key
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.log('✅ Secret Key configured');
  console.log(`   ${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...`);
  checks.secretKey = true;
} else {
  console.log('❌ Secret Key missing or invalid');
  console.log('   Add STRIPE_SECRET_KEY to .env.local');
}

// Check Publishable Key
if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
  console.log('✅ Publishable Key configured');
  console.log(`   ${process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 20)}...`);
  checks.publishableKey = true;
} else {
  console.log('❌ Publishable Key missing or invalid');
  console.log('   Add STRIPE_PUBLISHABLE_KEY to .env.local');
}

// Check Public Publishable Key
if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
  console.log('✅ Public Publishable Key configured');
  checks.publishableKey = true;
} else {
  console.log('⚠️  Public Publishable Key missing');
  console.log('   Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local');
}

// Check Webhook Secret
if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
  console.log('✅ Webhook Secret configured');
  checks.webhookSecret = true;
} else {
  console.log('⚠️  Webhook Secret not configured (optional for testing)');
  console.log('   Will need for production');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Test Stripe Connection
if (checks.secretKey) {
  console.log('\n🧪 TESTING STRIPE CONNECTION...\n');
  
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    stripe.products.list({ limit: 1 })
      .then(() => {
        console.log('✅ Successfully connected to Stripe!');
        console.log('\n🎉 YOU ARE READY TO ACCEPT PAYMENTS!\n');
        
        console.log('Next steps:');
        console.log('1. Restart your dev server: npm run dev');
        console.log('2. Visit http://localhost:3004/models');
        console.log('3. Click "Buy Now" on any model');
        console.log('4. Use test card: 4242 4242 4242 4242\n');
      })
      .catch((error) => {
        console.log('❌ Failed to connect to Stripe');
        console.log('   Error:', error.message);
        console.log('\nMake sure your secret key is correct');
      });
  } catch (error) {
    console.log('❌ Stripe module not found');
    console.log('   Run: npm install stripe');
  }
} else {
  console.log('\n❌ Cannot test connection - Secret Key missing');
  console.log('\n📝 Add your Stripe keys to .env.local:');
  console.log('   STRIPE_SECRET_KEY=sk_test_...');
  console.log('   STRIPE_PUBLISHABLE_KEY=pk_test_...');
  console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');