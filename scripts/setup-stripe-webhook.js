#!/usr/bin/env node
/**
 * Stripe Webhook Setup Script
 * Automatically configures webhooks for any port
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔧 STRIPE WEBHOOK CONFIGURATION\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Detect current port from running processes or use default
function detectPort() {
  // Check common ports in order
  const ports = [3000, 3001, 3002, 3003, 3004, 3005];
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXTAUTH_URL=http:\/\/localhost:(\d+)/);
    if (match) {
      return match[1];
    }
  }
  
  // Default to 3001 if nothing found
  return '3001';
}

const currentPort = detectPort();

console.log(`📍 Detected current port: ${currentPort}\n`);

console.log('Choose webhook configuration:\n');
console.log('1. Local Development (Stripe CLI)');
console.log('2. Staging (Vercel Preview)');
console.log('3. Production (Live Domain)\n');

rl.question('Select option (1-3): ', (answer) => {
  switch(answer) {
    case '1':
      setupLocal();
      break;
    case '2':
      setupStaging();
      break;
    case '3':
      setupProduction();
      break;
    default:
      console.log('Invalid option');
      rl.close();
  }
});

function setupLocal() {
  console.log('\n📝 LOCAL WEBHOOK SETUP\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('1. First, install Stripe CLI if not installed:');
  console.log('   Download: https://github.com/stripe/stripe-cli/releases\n');
  
  console.log('2. Run these commands in a NEW terminal:\n');
  console.log(`   stripe login`);
  console.log(`   stripe listen --forward-to localhost:${currentPort}/api/stripe/webhook\n`);
  
  console.log('3. Copy the webhook signing secret shown (starts with whsec_)\n');
  
  rl.question('Paste your webhook secret here: ', (secret) => {
    if (secret && secret.startsWith('whsec_')) {
      updateEnvFile('STRIPE_WEBHOOK_SECRET', secret);
      console.log('\n✅ Webhook secret saved to .env.local');
      console.log('\n🎉 Local webhook setup complete!');
      console.log('\nKeep the stripe listen command running while testing.');
    } else {
      console.log('\n❌ Invalid webhook secret');
    }
    rl.close();
  });
}

function setupStaging() {
  console.log('\n📝 STAGING WEBHOOK SETUP\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  rl.question('Enter your Vercel preview URL (e.g., your-app-abc123.vercel.app): ', (url) => {
    if (!url) {
      console.log('URL required');
      rl.close();
      return;
    }
    
    const webhookUrl = `https://${url}/api/stripe/webhook`;
    
    console.log('\n📌 Webhook endpoint will be:', webhookUrl);
    console.log('\nNow go to Stripe Dashboard:');
    console.log('1. Visit: https://dashboard.stripe.com/test/webhooks');
    console.log('2. Click "Add endpoint"');
    console.log(`3. Enter URL: ${webhookUrl}`);
    console.log('4. Select events:');
    console.log('   - checkout.session.completed');
    console.log('   - payment_intent.succeeded');
    console.log('5. Click "Add endpoint"');
    console.log('6. Copy the signing secret\n');
    
    rl.question('Paste the webhook signing secret: ', (secret) => {
      if (secret && secret.startsWith('whsec_')) {
        // Save for staging
        updateEnvFile('STRIPE_WEBHOOK_SECRET_STAGING', secret);
        console.log('\n✅ Staging webhook configured!');
        console.log('\nAdd this to your Vercel environment variables:');
        console.log(`STRIPE_WEBHOOK_SECRET=${secret}`);
      } else {
        console.log('\n❌ Invalid webhook secret');
      }
      rl.close();
    });
  });
}

function setupProduction() {
  console.log('\n📝 PRODUCTION WEBHOOK SETUP\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  rl.question('Enter your production domain (e.g., zencap.com): ', (domain) => {
    if (!domain) {
      console.log('Domain required');
      rl.close();
      return;
    }
    
    const webhookUrl = `https://${domain}/api/stripe/webhook`;
    
    console.log('\n📌 Webhook endpoint will be:', webhookUrl);
    console.log('\n⚠️  IMPORTANT: Use LIVE mode in Stripe Dashboard\n');
    console.log('1. Visit: https://dashboard.stripe.com/webhooks (LIVE mode)');
    console.log('2. Click "Add endpoint"');
    console.log(`3. Enter URL: ${webhookUrl}`);
    console.log('4. Select events:');
    console.log('   - checkout.session.completed');
    console.log('   - payment_intent.succeeded');
    console.log('   - payment_intent.failed');
    console.log('   - customer.subscription.created (if using subscriptions)');
    console.log('   - customer.subscription.deleted (if using subscriptions)');
    console.log('5. Click "Add endpoint"');
    console.log('6. Copy the signing secret\n');
    
    rl.question('Paste the webhook signing secret: ', (secret) => {
      if (secret && secret.startsWith('whsec_')) {
        console.log('\n✅ Production webhook configured!');
        console.log('\n⚠️  Add these to your production environment:');
        console.log(`STRIPE_WEBHOOK_SECRET=${secret}`);
        console.log('\nNEVER commit production secrets to git!');
      } else {
        console.log('\n❌ Invalid webhook secret');
      }
      rl.close();
    });
  });
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Check if key exists
  const regex = new RegExp(`^${key}=.*$`, 'gm');
  if (regex.test(envContent)) {
    // Update existing
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    // Add new
    envContent += `\n${key}=${value}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
}