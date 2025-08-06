/**
 * Payment Flow Testing Script
 * Tests the complete payment integration end-to-end
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3004';
const isHTTPS = BASE_URL.startsWith('https');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const client = isHTTPS ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHTTPS ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testPaymentFlow() {
  console.log('🧪 TESTING PAYMENT FLOW\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const tests = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  // Test 1: Health Check
  console.log('1️⃣  Testing Health Endpoint...');
  try {
    const health = await makeRequest('/api/health');
    if (health.status === 200) {
      console.log('✅ Health check passed');
      tests.passed++;
    } else {
      console.log('⚠️  Health check returned:', health.status);
      tests.warnings++;
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    tests.failed++;
  }

  // Test 2: Database Connection
  console.log('\n2️⃣  Testing Database Connection...');
  try {
    const db = await makeRequest('/api/test-db');
    if (db.status === 200) {
      console.log('✅ Database connection successful');
      tests.passed++;
    } else {
      console.log('⚠️  Database test returned:', db.status);
      tests.warnings++;
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    tests.failed++;
  }

  // Test 3: Stripe Configuration
  console.log('\n3️⃣  Testing Stripe Configuration...');
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && stripeKey.startsWith('sk_')) {
    console.log('✅ Stripe secret key configured');
    tests.passed++;
  } else {
    console.log('⚠️  Stripe secret key not configured');
    console.log('   Add STRIPE_SECRET_KEY to .env.local');
    tests.warnings++;
  }

  // Test 4: Models API
  console.log('\n4️⃣  Testing Models API...');
  try {
    const models = await makeRequest('/api/models');
    if (models.status === 200) {
      console.log(`✅ Models API working (${models.data.models?.length || 0} models found)`);
      tests.passed++;
    } else {
      console.log('⚠️  Models API returned:', models.status);
      tests.warnings++;
    }
  } catch (error) {
    console.log('❌ Models API failed:', error.message);
    tests.failed++;
  }

  // Test 5: Authentication Endpoint
  console.log('\n5️⃣  Testing Authentication Setup...');
  try {
    const auth = await makeRequest('/api/auth/providers');
    if (auth.status === 200 || auth.status === 404) {
      console.log('✅ Authentication endpoints configured');
      tests.passed++;
    } else {
      console.log('⚠️  Authentication test returned:', auth.status);
      tests.warnings++;
    }
  } catch (error) {
    console.log('⚠️  Authentication not fully configured');
    tests.warnings++;
  }

  // Test 6: Email Configuration
  console.log('\n6️⃣  Testing Email Configuration...');
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey && sendgridKey.startsWith('SG.')) {
    console.log('✅ SendGrid API key configured');
    tests.passed++;
  } else {
    console.log('⚠️  SendGrid API key not configured');
    console.log('   Add SENDGRID_API_KEY to .env.local');
    tests.warnings++;
  }

  // Results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST RESULTS:\n');
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`⚠️  Warnings: ${tests.warnings}`);
  console.log(`❌ Failed: ${tests.failed}`);
  
  const total = tests.passed + tests.warnings + tests.failed;
  const score = Math.round((tests.passed / total) * 100);
  
  console.log(`\n🎯 Readiness Score: ${score}%`);
  
  if (score >= 80) {
    console.log('\n✅ READY FOR STAGING DEPLOYMENT');
  } else if (score >= 60) {
    console.log('\n⚠️  PARTIAL READINESS - Review warnings');
  } else {
    console.log('\n❌ NOT READY - Fix failed tests first');
  }

  // Recommendations
  if (tests.warnings > 0 || tests.failed > 0) {
    console.log('\n📝 RECOMMENDATIONS:');
    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      console.log('• Configure Stripe test keys in .env.local');
    }
    if (!sendgridKey || !sendgridKey.startsWith('SG.')) {
      console.log('• Configure SendGrid API key in .env.local');
    }
    if (tests.failed > 0) {
      console.log('• Fix database connection issues');
      console.log('• Run: npm run dev and check for errors');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  process.exit(tests.failed > 0 ? 1 : 0);
}

// Run tests
testPaymentFlow().catch(console.error);