/**
 * PAYMENT SECURITY TESTING SCRIPT
 * Tests for common payment security vulnerabilities
 */

const fetch = require('node-fetch');
const crypto = require('crypto');

const SECURITY_CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3004',
  testEmail: process.env.QA_TEST_EMAIL || 'security-test@zenithcap.com',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@zenithcap.com'
};

/**
 * Test price manipulation prevention
 */
async function testPriceManipulation() {
  console.log('\n💰 TESTING PRICE MANIPULATION PREVENTION\n');
  
  const tests = [
    {
      name: 'Modified price in request body',
      payload: {
        modelId: 'test-model',
        modelTitle: 'Security Test Model',
        modelPrice: 1, // Attempting to set $0.01 instead of real price
        modelSlug: 'security-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: 'Security Tester'
      },
      expectedBehavior: 'Server should validate price against database'
    },
    {
      name: 'Negative price attempt',
      payload: {
        modelId: 'test-model',
        modelTitle: 'Security Test Model', 
        modelPrice: -100,
        modelSlug: 'security-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: 'Security Tester'
      },
      expectedBehavior: 'Server should reject negative prices'
    },
    {
      name: 'Zero price attempt',
      payload: {
        modelId: 'test-model',
        modelTitle: 'Security Test Model',
        modelPrice: 0,
        modelSlug: 'security-test', 
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: 'Security Tester'
      },
      expectedBehavior: 'Server should reject zero prices'
    },
    {
      name: 'Extremely large price',
      payload: {
        modelId: 'test-model',
        modelTitle: 'Security Test Model',
        modelPrice: 999999999,
        modelSlug: 'security-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: 'Security Tester'  
      },
      expectedBehavior: 'Server should have reasonable price limits'
    }
  ];
  
  for (const test of tests) {
    console.log(`🔍 ${test.name}...`);
    
    try {
      const response = await fetch(`${SECURITY_CONFIG.baseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.payload)
      });
      
      const data = await response.json();
      
      if (response.status === 400 || response.status === 422) {
        console.log('✅ Server correctly rejected manipulated price');
      } else if (response.status === 200) {
        // Check if the returned session has the correct price
        console.log('⚠️ Session created - need to verify Stripe session has correct price');
        console.log(`Session URL: ${data.url}`);
      } else {
        console.log(`❓ Unexpected response: ${response.status}`);
      }
      
      console.log(`Expected: ${test.expectedBehavior}`);
      
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
    }
    
    console.log('');
  }
}

/**
 * Test input sanitization and injection attacks
 */
async function testInputSanitization() {
  console.log('\n🛡️ TESTING INPUT SANITIZATION\n');
  
  const maliciousInputs = [
    {
      name: 'SQL Injection in customer name',
      payload: {
        modelId: 'test-model',
        modelTitle: 'Security Test',
        modelPrice: 2985,
        modelSlug: 'security-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: "'; DROP TABLE orders;--"
      }
    },
    {
      name: 'XSS in model title',
      payload: {
        modelId: 'test-model',
        modelTitle: '<script>alert("XSS")</script>',
        modelPrice: 2985,
        modelSlug: 'security-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: 'Security Tester'
      }
    },
    {
      name: 'HTML injection in email',
      payload: {
        modelId: 'test-model',
        modelTitle: 'Security Test',
        modelPrice: 2985,
        modelSlug: 'security-test',
        customerEmail: '<img src=x onerror=alert(1)>@test.com',
        customerName: 'Security Tester'
      }
    },
    {
      name: 'Long string buffer overflow attempt',
      payload: {
        modelId: 'test-model',
        modelTitle: 'A'.repeat(10000),
        modelPrice: 2985,
        modelSlug: 'security-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: 'B'.repeat(5000)
      }
    },
    {
      name: 'Unicode and special characters',
      payload: {
        modelId: 'test-model',
        modelTitle: '测试模型 🚀 Ñiño',
        modelPrice: 2985,
        modelSlug: 'security-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: 'Tëst Üser 💰'
      }
    }
  ];
  
  for (const test of maliciousInputs) {
    console.log(`🔍 ${test.name}...`);
    
    try {
      const response = await fetch(`${SECURITY_CONFIG.baseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.payload)
      });
      
      if (response.status === 200) {
        console.log('✅ Input accepted (check if properly sanitized)');
      } else if (response.status === 400) {
        console.log('✅ Malicious input rejected');
      } else {
        console.log(`❓ Unexpected response: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('');
  }
}

/**
 * Test rate limiting and DoS protection
 */
async function testRateLimiting() {
  console.log('\n🚦 TESTING RATE LIMITING\n');
  
  const requests = 20;
  const timeWindow = 5000; // 5 seconds
  
  console.log(`Sending ${requests} requests in ${timeWindow}ms...`);
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < requests; i++) {
    const promise = fetch(`${SECURITY_CONFIG.baseUrl}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        modelId: `rate-test-${i}`,
        modelTitle: `Rate Test ${i}`,
        modelPrice: 2985,
        modelSlug: 'rate-test',
        customerEmail: SECURITY_CONFIG.testEmail,
        customerName: `Rate Tester ${i}`
      })
    });
    
    promises.push(promise);
    
    // Small delay to simulate realistic timing
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  try {
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const successCount = responses.filter(r => r.status === 200).length;
    const rateLimitedCount = responses.filter(r => r.status === 429).length;
    const errorCount = responses.filter(r => r.status >= 400 && r.status !== 429).length;
    
    console.log(`Results after ${totalTime}ms:`);
    console.log(`✅ Successful requests: ${successCount}`);
    console.log(`🚦 Rate limited (429): ${rateLimitedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (rateLimitedCount > 0) {
      console.log('✅ Rate limiting is working');
    } else if (successCount === requests) {
      console.log('⚠️ No rate limiting detected - may be vulnerable to DoS');
    } else {
      console.log('❓ Mixed results - check server logs');
    }
    
  } catch (error) {
    console.log(`❌ Rate limiting test failed: ${error.message}`);
  }
}

/**
 * Test session security and token validation
 */
async function testSessionSecurity() {
  console.log('\n🔐 TESTING SESSION SECURITY\n');
  
  // Test 1: Invalid session ID format
  console.log('1️⃣ Testing invalid session ID access...');
  try {
    const response = await fetch(`${SECURITY_CONFIG.baseUrl}/purchase/success?session_id=invalid_session_123`);
    
    if (response.status === 404 || response.status === 403) {
      console.log('✅ Invalid session ID properly rejected');
    } else {
      console.log(`❓ Unexpected response for invalid session: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Session security test failed: ${error.message}`);
  }
  
  // Test 2: Session ID enumeration
  console.log('\n2️⃣ Testing session ID enumeration...');
  const sessionIds = [
    'cs_test_123',
    'cs_live_456', 
    'cs_test_000',
    'session_789'
  ];
  
  for (const sessionId of sessionIds) {
    try {
      const response = await fetch(`${SECURITY_CONFIG.baseUrl}/api/orders/${sessionId}`);
      
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        console.log(`✅ Session ${sessionId} properly protected`);
      } else {
        console.log(`⚠️ Session ${sessionId} may be vulnerable (status: ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Error testing session ${sessionId}: ${error.message}`);
    }
  }
}

/**
 * Test HTTP security headers
 */
async function testSecurityHeaders() {
  console.log('\n🛡️ TESTING HTTP SECURITY HEADERS\n');
  
  const endpoints = [
    '/checkout',
    '/api/stripe/create-checkout-session',
    '/api/stripe/webhook',
    '/purchase/success'
  ];
  
  const requiredHeaders = [
    'content-security-policy',
    'x-frame-options', 
    'x-content-type-options',
    'referrer-policy',
    'strict-transport-security'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`🔍 Checking headers for ${endpoint}...`);
    
    try {
      const response = await fetch(`${SECURITY_CONFIG.baseUrl}${endpoint}`, {
        method: endpoint.includes('/api/') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.includes('/api/stripe/create-checkout-session') ? 
          JSON.stringify({
            modelId: 'header-test',
            modelTitle: 'Header Test',
            modelPrice: 2985,
            modelSlug: 'header-test',
            customerEmail: SECURITY_CONFIG.testEmail,
            customerName: 'Header Tester'
          }) : undefined
      });
      
      const headers = response.headers;
      const presentHeaders = [];
      const missingHeaders = [];
      
      for (const header of requiredHeaders) {
        if (headers.has(header)) {
          presentHeaders.push(header);
        } else {
          missingHeaders.push(header);
        }
      }
      
      console.log(`✅ Present: ${presentHeaders.join(', ')}`);
      if (missingHeaders.length > 0) {
        console.log(`⚠️ Missing: ${missingHeaders.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${endpoint}: ${error.message}`);
    }
    
    console.log('');
  }
}

/**
 * Test webhook signature bypass attempts
 */
async function testWebhookSecurity() {
  console.log('\n🪝 TESTING WEBHOOK SECURITY\n');
  
  const webhookUrl = `${SECURITY_CONFIG.baseUrl}/api/stripe/webhook`;
  
  const maliciousPayloads = [
    {
      name: 'No signature header',
      payload: { type: 'checkout.session.completed' },
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Invalid signature format',
      payload: { type: 'checkout.session.completed' },
      headers: { 
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid-signature-format'
      }
    },
    {
      name: 'Malformed event data',
      payload: { malformed: 'data', type: 'invalid.event' },
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=1234567890,v1=fakesignature'
      }
    }
  ];
  
  for (const test of maliciousPayloads) {
    console.log(`🔍 ${test.name}...`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: test.headers,
        body: JSON.stringify(test.payload)
      });
      
      if (response.status === 400 || response.status === 401) {
        console.log('✅ Malicious webhook properly rejected');
      } else {
        console.log(`⚠️ Webhook accepted malicious payload (status: ${response.status})`);
      }
      
    } catch (error) {
      console.log(`❌ Webhook security test failed: ${error.message}`);
    }
    
    console.log('');
  }
}

/**
 * Test CORS and cross-origin security
 */
async function testCORSSecurity() {
  console.log('\n🌐 TESTING CORS SECURITY\n');
  
  const maliciousOrigins = [
    'https://evil.com',
    'http://localhost:6666',
    'https://fake-zencap.com',
    'null'
  ];
  
  for (const origin of maliciousOrigins) {
    console.log(`🔍 Testing CORS with origin: ${origin}...`);
    
    try {
      const response = await fetch(`${SECURITY_CONFIG.baseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin
        },
        body: JSON.stringify({
          modelId: 'cors-test',
          modelTitle: 'CORS Test',
          modelPrice: 2985,
          modelSlug: 'cors-test',
          customerEmail: SECURITY_CONFIG.testEmail,
          customerName: 'CORS Tester'
        })
      });
      
      const corsHeader = response.headers.get('access-control-allow-origin');
      
      if (corsHeader === origin) {
        console.log('⚠️ CORS allows malicious origin');
      } else if (!corsHeader || corsHeader === 'null') {
        console.log('✅ CORS properly blocks malicious origin');
      } else {
        console.log(`❓ CORS header: ${corsHeader}`);
      }
      
    } catch (error) {
      console.log(`❌ CORS test failed: ${error.message}`);  
    }
    
    console.log('');
  }
}

/**
 * Main security test runner
 */
async function runSecurityTests() {
  console.log('🔒 PAYMENT SECURITY TESTING SUITE');
  console.log('==================================');
  console.log(`Testing URL: ${SECURITY_CONFIG.baseUrl}`);
  console.log('');
  
  const startTime = Date.now();
  
  try {
    await testPriceManipulation();
    await testInputSanitization();
    await testRateLimiting();
    await testSessionSecurity();
    await testSecurityHeaders();
    await testWebhookSecurity();
    await testCORSSecurity();
    
  } catch (error) {
    console.log(`\n❌ Security testing suite encountered an error: ${error.message}`);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  console.log('\n🔒 SECURITY TESTING RESULTS');
  console.log('============================');
  console.log(`Total Time: ${totalTime}ms`);
  console.log('');
  console.log('🚨 CRITICAL SECURITY CHECKLIST:');
  console.log('[ ] Price manipulation prevented');
  console.log('[ ] Input sanitization working');
  console.log('[ ] Rate limiting active');
  console.log('[ ] Session security enforced');
  console.log('[ ] Security headers present');
  console.log('[ ] Webhook signatures validated');
  console.log('[ ] CORS properly configured');
  console.log('');
  console.log('⚠️ IMPORTANT: Review all test results above');
  console.log('Any ⚠️ or ❌ items require immediate attention');
  console.log('');
  console.log('🔧 ADDITIONAL SECURITY MEASURES TO VERIFY:');
  console.log('1. SSL/TLS certificates valid and properly configured');
  console.log('2. Database connections encrypted');
  console.log('3. API keys and secrets properly secured');
  console.log('4. Logging and monitoring active for security events');
  console.log('5. Regular security updates applied');
  console.log('6. PCI compliance requirements met');
}

// Export for use in other test files
module.exports = {
  runSecurityTests,
  testPriceManipulation,
  testInputSanitization,
  testWebhookSecurity
};

// Run tests if called directly
if (require.main === module) {
  runSecurityTests().catch(console.error);
}