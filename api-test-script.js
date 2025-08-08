#!/usr/bin/env node

/**
 * ZenCap API Testing Script
 * 
 * Quick health check and validation script for all major API endpoints
 * Usage: node api-test-script.js [environment]
 * 
 * Environments:
 * - dev (default): http://localhost:3001
 * - prod: https://zencap-website.vercel.app
 */

const https = require('https');
const http = require('http');

class APITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/g, ''); // Remove trailing slash
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting ZenCap API Test Suite');
    console.log(`📍 Testing against: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    const testSuites = [
      { name: '🏥 System Health', tests: this.healthTests.bind(this) },
      { name: '🏢 Core Business', tests: this.businessTests.bind(this) },
      { name: '📊 Analytics', tests: this.analyticsTests.bind(this) },
      { name: '🔒 Security', tests: this.securityTests.bind(this) },
      { name: '⚡ Performance', tests: this.performanceTests.bind(this) }
    ];

    for (const suite of testSuites) {
      console.log(`\n${suite.name} Tests:`);
      console.log('-'.repeat(40));
      await suite.tests();
    }

    this.printSummary();
  }

  async healthTests() {
    await this.test('Health Check', 'GET', '/api/health', null, (response, body) => {
      return response.statusCode === 200 && 
             body.health && 
             body.health.overallStatus;
    });

    await this.test('Hello World', 'GET', '/api/hello', null, (response, body) => {
      return response.statusCode === 200;
    });
  }

  async businessTests() {
    await this.test('Get Insights', 'GET', '/api/insights', null, (response, body) => {
      return response.statusCode === 200 && Array.isArray(body);
    });

    await this.test('Get Models', 'GET', '/api/models', null, (response, body) => {
      return response.statusCode === 200 && 
             body.models && 
             Array.isArray(body.models);
    });

    await this.test('Get Models by Category', 'GET', '/api/models?category=private-equity', null, (response, body) => {
      return response.statusCode === 200 && body.models;
    });

    // Test contact form validation
    await this.test('Contact Form Validation', 'POST', '/api/contact', {
      name: '',
      email: 'invalid-email',
      message: ''
    }, (response, body) => {
      return response.statusCode === 400; // Should fail validation
    });
  }

  async analyticsTests() {
    await this.test('Social Proof Stats', 'GET', '/api/analytics/social-proof', null, (response, body) => {
      return response.statusCode === 200 && body.stats;
    });

    await this.test('Social Stats', 'GET', '/api/analytics/social-stats', null, (response, body) => {
      return response.statusCode === 200;
    });

    // Test analytics event tracking
    await this.test('Track Analytics Event', 'POST', '/api/analytics/events', {
      eventType: 'api_test',
      metadata: { source: 'test_script', timestamp: new Date().toISOString() }
    }, (response, body) => {
      return response.statusCode === 200 || response.statusCode === 201;
    });
  }

  async securityTests() {
    // Test method not allowed
    await this.test('Method Not Allowed', 'PUT', '/api/health', null, (response, body) => {
      return response.statusCode === 405;
    });

    // Test authentication requirement
    await this.test('Authentication Required', 'GET', '/api/analytics', null, (response, body) => {
      return response.statusCode === 401; // Should require auth
    });

    // Test rate limiting headers
    await this.test('Rate Limit Headers', 'GET', '/api/insights', null, (response, body) => {
      return response.headers['x-ratelimit-limit'] !== undefined ||
             response.headers['cache-control'] !== undefined;
    });
  }

  async performanceTests() {
    const startTime = Date.now();
    
    await this.test('Response Time Test', 'GET', '/api/insights', null, (response, body) => {
      const responseTime = Date.now() - startTime;
      console.log(`      ⏱️  Response time: ${responseTime}ms`);
      return response.statusCode === 200 && responseTime < 3000; // Under 3 seconds
    });

    // Test concurrent requests
    const concurrentTests = [];
    for (let i = 0; i < 5; i++) {
      concurrentTests.push(this.makeRequest('GET', '/api/models'));
    }

    const concurrentStart = Date.now();
    const results = await Promise.all(concurrentTests);
    const concurrentTime = Date.now() - concurrentStart;
    
    const allSuccessful = results.every(r => r.response.statusCode === 200);
    this.recordTest('Concurrent Requests', allSuccessful, 
      `5 concurrent requests completed in ${concurrentTime}ms`);
    console.log(`      🔄 Concurrent test: ${allSuccessful ? '✅' : '❌'} (${concurrentTime}ms)`);
  }

  async test(name, method, path, data, validator) {
    try {
      const result = await this.makeRequest(method, path, data);
      const isValid = validator(result.response, result.body);
      
      this.recordTest(name, isValid);
      
      const status = isValid ? '✅' : '❌';
      const statusCode = result.response.statusCode;
      console.log(`  ${status} ${name} (${statusCode})`);
      
      if (!isValid) {
        console.log(`      📋 Response: ${JSON.stringify(result.body).substring(0, 100)}...`);
      }

    } catch (error) {
      this.recordTest(name, false, error.message);
      console.log(`  ❌ ${name} (ERROR: ${error.message})`);
    }
  }

  makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'ZenCap-API-Tester/2.0'
        },
        timeout: 10000 // 10 second timeout
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = client.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch (e) {
            parsedBody = body;
          }
          
          resolve({
            response: res,
            body: parsedBody
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  recordTest(name, passed, details = '') {
    this.results.total++;
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
    
    this.results.tests.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    const status = passRate >= 90 ? '🟢' : passRate >= 70 ? '🟡' : '🔴';
    
    console.log(`${status} Overall Health: ${passRate}% (${this.results.passed}/${this.results.total} passed)`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📝 Total Tests: ${this.results.total}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.details}`);
        });
    }

    console.log('\n📋 Test Report Generated:');
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   Environment: ${this.baseUrl}`);
    console.log(`   Status: ${passRate >= 90 ? 'HEALTHY' : passRate >= 70 ? 'WARNING' : 'CRITICAL'}`);

    // Exit with error code if tests failed
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }
}

// Advanced testing utilities
class LoadTester {
  static async stressTest(baseUrl, endpoint, concurrent = 10, duration = 30) {
    console.log(`\n🔥 Starting stress test: ${concurrent} concurrent users for ${duration}s`);
    
    const tester = new APITester(baseUrl);
    const results = {
      requests: 0,
      errors: 0,
      responseTimes: []
    };

    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);

    const workers = Array.from({ length: concurrent }, () => {
      return this.worker(tester, endpoint, endTime, results);
    });

    await Promise.all(workers);

    const totalTime = Date.now() - startTime;
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const errorRate = (results.errors / results.requests) * 100;
    const requestsPerSecond = (results.requests / totalTime) * 1000;

    console.log(`📈 Stress Test Results:`);
    console.log(`   Total Requests: ${results.requests}`);
    console.log(`   Errors: ${results.errors} (${errorRate.toFixed(2)}%)`);
    console.log(`   Requests/sec: ${requestsPerSecond.toFixed(2)}`);
    console.log(`   Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  }

  static async worker(tester, endpoint, endTime, results) {
    while (Date.now() < endTime) {
      try {
        const start = Date.now();
        const result = await tester.makeRequest('GET', endpoint);
        const responseTime = Date.now() - start;
        
        results.requests++;
        results.responseTimes.push(responseTime);
        
        if (result.response.statusCode >= 400) {
          results.errors++;
        }
        
        // Brief pause to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        results.requests++;
        results.errors++;
      }
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'dev';
  
  const environments = {
    dev: 'http://localhost:3001',
    prod: 'https://zencap-website.vercel.app'
  };
  
  const baseUrl = environments[environment];
  if (!baseUrl) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments: dev, prod');
    process.exit(1);
  }
  
  const tester = new APITester(baseUrl);
  
  try {
    await tester.runAllTests();
    
    // Run stress test if --stress flag is provided
    if (args.includes('--stress')) {
      await LoadTester.stressTest(baseUrl, '/api/insights', 5, 10);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { APITester, LoadTester };