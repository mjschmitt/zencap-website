#!/usr/bin/env node

/**
 * COMPREHENSIVE PAYMENT TESTING ORCHESTRATOR
 * Runs all payment flow tests in sequence with detailed reporting
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

// Import test modules
const { runWebhookTests } = require('./test-webhook-reliability');
const { runSecurityTests } = require('./test-payment-security');

const TEST_CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3004',
  testEmail: process.env.QA_TEST_EMAIL || 'qa-test@zenithcap.com',
  outputDir: path.join(__dirname, '../test-results'),
  timestamp: new Date().toISOString().replace(/[:.]/g, '-')
};

/**
 * Ensure test results directory exists
 */
function ensureOutputDirectory() {
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
  }
}

/**
 * Write test results to file
 */
function writeTestResults(testName, results, duration) {
  const fileName = `${testName}-${TEST_CONFIG.timestamp}.json`;
  const filePath = path.join(TEST_CONFIG.outputDir, fileName);
  
  const testReport = {
    testName,
    timestamp: new Date().toISOString(),
    duration,
    results,
    environment: {
      baseUrl: TEST_CONFIG.baseUrl,
      nodeVersion: process.version,
      platform: process.platform
    }
  };
  
  fs.writeFileSync(filePath, JSON.stringify(testReport, null, 2));
  console.log(`📄 Test results saved to: ${filePath}`);
}

/**
 * Run Playwright E2E tests
 */
function runE2ETests() {
  return new Promise((resolve, reject) => {
    console.log('\n🎭 RUNNING PLAYWRIGHT E2E TESTS\n');
    
    const testFile = path.join(__dirname, '../tests/payment-flow-comprehensive.test.js');
    
    if (!fs.existsSync(testFile)) {
      console.log('⚠️ E2E test file not found, skipping...');
      resolve({ skipped: true, reason: 'Test file not found' });
      return;
    }
    
    const startTime = Date.now();
    const playwright = spawn('npx', ['playwright', 'test', testFile, '--reporter=json'], {
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    playwright.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });
    
    playwright.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });
    
    playwright.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      try {
        const results = {
          exitCode: code,
          duration,
          stdout,
          stderr,
          success: code === 0
        };
        
        writeTestResults('e2e-tests', results, duration);
        
        if (code === 0) {
          console.log('✅ E2E tests completed successfully');
        } else {
          console.log(`❌ E2E tests failed with exit code ${code}`);
        }
        
        resolve(results);
      } catch (error) {
        reject(error);
      }
    });
    
    playwright.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Run webhook reliability tests
 */
async function runWebhookReliabilityTests() {
  console.log('\n🪝 RUNNING WEBHOOK RELIABILITY TESTS\n');
  
  const startTime = Date.now();
  
  try {
    // Capture console output
    const originalLog = console.log;
    let testOutput = '';
    
    console.log = (...args) => {
      testOutput += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    await runWebhookTests();
    
    // Restore console.log
    console.log = originalLog;
    
    const duration = Date.now() - startTime;
    const results = {
      success: true,
      duration,
      output: testOutput
    };
    
    writeTestResults('webhook-tests', results, duration);
    console.log('✅ Webhook tests completed');
    
    return results;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const results = {
      success: false,
      duration,
      error: error.message
    };
    
    writeTestResults('webhook-tests', results, duration);
    console.log('❌ Webhook tests failed');
    
    return results;
  }
}

/**
 * Run security tests
 */
async function runPaymentSecurityTests() {
  console.log('\n🔒 RUNNING PAYMENT SECURITY TESTS\n');
  
  const startTime = Date.now();
  
  try {
    // Capture console output
    const originalLog = console.log;
    let testOutput = '';
    
    console.log = (...args) => {
      testOutput += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    await runSecurityTests();
    
    // Restore console.log
    console.log = originalLog;
    
    const duration = Date.now() - startTime;
    const results = {
      success: true,
      duration,
      output: testOutput
    };
    
    writeTestResults('security-tests', results, duration);
    console.log('✅ Security tests completed');
    
    return results;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const results = {
      success: false,
      duration,
      error: error.message
    };
    
    writeTestResults('security-tests', results, duration);
    console.log('❌ Security tests failed');
    
    return results;
  }
}

/**
 * Run basic API health checks
 */
async function runHealthChecks() {
  console.log('\n🏥 RUNNING API HEALTH CHECKS\n');
  
  const startTime = Date.now();
  const healthResults = {
    endpoints: [],
    overallHealth: true
  };
  
  const endpoints = [
    { url: '/', name: 'Home Page', method: 'GET' },
    { url: '/checkout', name: 'Checkout Page', method: 'GET' },
    { url: '/api/health', name: 'Health API', method: 'GET' },
    { url: '/api/models', name: 'Models API', method: 'GET' },
    { url: '/models/private-equity', name: 'Private Equity Models', method: 'GET' },
    { url: '/models/public-equity', name: 'Public Equity Models', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint.url}`, {
        method: endpoint.method,
        timeout: 10000
      });
      
      const status = response.status;
      const healthy = status >= 200 && status < 400;
      
      healthResults.endpoints.push({
        name: endpoint.name,
        url: endpoint.url,
        status,
        healthy,
        responseTime: Date.now() - startTime
      });
      
      if (healthy) {
        console.log(`✅ ${endpoint.name}: ${status}`);
      } else {
        console.log(`❌ ${endpoint.name}: ${status}`);
        healthResults.overallHealth = false;
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      healthResults.endpoints.push({
        name: endpoint.name,
        url: endpoint.url,
        error: error.message,
        healthy: false
      });
      healthResults.overallHealth = false;
    }
  }
  
  const duration = Date.now() - startTime;
  writeTestResults('health-checks', healthResults, duration);
  
  return healthResults;
}

/**
 * Check environment configuration
 */
function checkEnvironmentConfig() {
  console.log('\n⚙️ CHECKING ENVIRONMENT CONFIGURATION\n');
  
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENDGRID_API_KEY',
    'POSTGRES_URL'
  ];
  
  const optionalEnvVars = [
    'NEXT_PUBLIC_GA_ID',
    'NEXT_PUBLIC_CONTACT_FORM_ENDPOINT'
  ];
  
  const envStatus = {
    required: {},
    optional: {},
    allRequiredPresent: true
  };
  
  console.log('Required Environment Variables:');
  for (const envVar of requiredEnvVars) {
    const isPresent = !!process.env[envVar];
    const value = process.env[envVar];
    
    envStatus.required[envVar] = {
      present: isPresent,
      configured: isPresent && !value.includes('mock') && !value.includes('test') && value.length > 10
    };
    
    if (envStatus.required[envVar].configured) {
      console.log(`✅ ${envVar}: Configured`);
    } else if (isPresent) {
      console.log(`⚠️ ${envVar}: Present but may be test/mock value`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
      envStatus.allRequiredPresent = false;
    }
  }
  
  console.log('\nOptional Environment Variables:');
  for (const envVar of optionalEnvVars) {
    const isPresent = !!process.env[envVar];
    
    envStatus.optional[envVar] = { present: isPresent };
    
    if (isPresent) {
      console.log(`✅ ${envVar}: Present`);
    } else {
      console.log(`⚠️ ${envVar}: Not configured`);
    }
  }
  
  return envStatus;
}

/**
 * Generate comprehensive test report
 */
function generateTestReport(results) {
  const reportPath = path.join(TEST_CONFIG.outputDir, `payment-test-report-${TEST_CONFIG.timestamp}.md`);
  
  const report = `# Payment Flow Test Report

**Generated**: ${new Date().toLocaleString()}  
**Environment**: ${TEST_CONFIG.baseUrl}  
**Test Duration**: ${Math.round((Date.now() - results.startTime) / 1000)}s

## Executive Summary

- **Overall Status**: ${results.overallSuccess ? '✅ PASS' : '❌ FAIL'}
- **Tests Run**: ${results.totalTests}
- **Tests Passed**: ${results.testsPassed}
- **Tests Failed**: ${results.testsFailed}
- **Success Rate**: ${Math.round((results.testsPassed / results.totalTests) * 100)}%

## Test Results

### 1. Health Checks
- **Status**: ${results.healthChecks.overallHealth ? '✅ PASS' : '❌ FAIL'}
- **Endpoints Tested**: ${results.healthChecks.endpoints.length}

### 2. E2E Tests  
- **Status**: ${results.e2eTests.success ? '✅ PASS' : results.e2eTests.skipped ? '⏭️ SKIP' : '❌ FAIL'}
- **Duration**: ${results.e2eTests.duration || 0}ms

### 3. Webhook Tests
- **Status**: ${results.webhookTests.success ? '✅ PASS' : '❌ FAIL'}
- **Duration**: ${results.webhookTests.duration || 0}ms

### 4. Security Tests
- **Status**: ${results.securityTests.success ? '✅ PASS' : '❌ FAIL'}
- **Duration**: ${results.securityTests.duration || 0}ms

### 5. Environment Configuration
- **Required Variables**: ${results.envConfig.allRequiredPresent ? '✅ All Present' : '❌ Missing Required'}

## Launch Readiness Assessment

${results.overallSuccess ? 
  '✅ **READY FOR LAUNCH** - All critical tests passing' : 
  '❌ **NOT READY** - Critical issues must be resolved'}

### Critical Issues (P0)
${results.criticalIssues.length > 0 ? 
  results.criticalIssues.map(issue => `- ${issue}`).join('\n') : 
  '✅ No critical issues found'}

### Recommendations
${results.recommendations.length > 0 ?
  results.recommendations.map(rec => `- ${rec}`).join('\n') :
  '✅ No additional recommendations'}

## Next Steps

1. Review detailed test logs in test-results directory
2. Address any critical issues before launch
3. Perform manual testing checklist validation
4. Configure production environment variables
5. Set up monitoring and alerts

---
*Generated by ZenCap Payment Testing Suite*
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📊 Comprehensive test report generated: ${reportPath}`);
  
  return reportPath;
}

/**
 * Main test orchestrator
 */
async function runAllPaymentTests() {
  console.log('🚀 ZENITH CAPITAL ADVISORS - PAYMENT TESTING SUITE');
  console.log('==================================================');
  console.log(`Environment: ${TEST_CONFIG.baseUrl}`);
  console.log(`Timestamp: ${new Date().toLocaleString()}`);
  console.log('');
  
  ensureOutputDirectory();
  
  const startTime = Date.now();
  const results = {
    startTime,
    totalTests: 0,
    testsPassed: 0,
    testsFailed: 0,
    overallSuccess: false,
    criticalIssues: [],
    recommendations: []
  };
  
  try {
    // 1. Environment Configuration Check
    console.log('🔍 PHASE 1: Environment Configuration');
    results.envConfig = checkEnvironmentConfig();
    
    if (!results.envConfig.allRequiredPresent) {
      results.criticalIssues.push('Missing required environment variables');
    }
    
    // 2. Health Checks
    console.log('\n🔍 PHASE 2: API Health Checks');
    results.healthChecks = await runHealthChecks();
    results.totalTests += results.healthChecks.endpoints.length;
    results.testsPassed += results.healthChecks.endpoints.filter(e => e.healthy).length;
    results.testsFailed += results.healthChecks.endpoints.filter(e => !e.healthy).length;
    
    if (!results.healthChecks.overallHealth) {
      results.criticalIssues.push('API endpoints not responding correctly');
    }
    
    // 3. Security Tests
    console.log('\n🔍 PHASE 3: Security Testing');
    results.securityTests = await runPaymentSecurityTests();
    results.totalTests += 1;
    if (results.securityTests.success) {
      results.testsPassed += 1;
    } else {
      results.testsFailed += 1;
      results.criticalIssues.push('Security vulnerabilities detected');
    }
    
    // 4. Webhook Tests
    console.log('\n🔍 PHASE 4: Webhook Reliability');
    results.webhookTests = await runWebhookReliabilityTests();
    results.totalTests += 1;
    if (results.webhookTests.success) {
      results.testsPassed += 1;
    } else {
      results.testsFailed += 1;
      results.criticalIssues.push('Webhook processing unreliable');
    }
    
    // 5. E2E Tests (if Playwright available)
    console.log('\n🔍 PHASE 5: End-to-End Testing');
    results.e2eTests = await runE2ETests();
    if (!results.e2eTests.skipped) {
      results.totalTests += 1;
      if (results.e2eTests.success) {
        results.testsPassed += 1;
      } else {
        results.testsFailed += 1;
        results.criticalIssues.push('End-to-end payment flow issues');
      }
    }
    
  } catch (error) {
    console.log(`\n❌ Testing suite encountered a critical error: ${error.message}`);
    results.criticalIssues.push(`Testing suite error: ${error.message}`);
  }
  
  // Calculate overall success
  const successRate = results.totalTests > 0 ? results.testsPassed / results.totalTests : 0;
  results.overallSuccess = successRate >= 0.9 && results.criticalIssues.length === 0;
  
  // Generate recommendations
  if (successRate < 0.9) {
    results.recommendations.push('Achieve >90% test success rate before launch');
  }
  if (!results.envConfig.allRequiredPresent) {
    results.recommendations.push('Configure all required environment variables');
  }
  if (!results.healthChecks.overallHealth) {
    results.recommendations.push('Fix API endpoint issues');
  }
  
  // Final Results
  const totalTime = Date.now() - startTime;
  
  console.log('\n🎯 FINAL RESULTS');
  console.log('================');
  console.log(`Total Time: ${Math.round(totalTime / 1000)}s`);
  console.log(`Tests Run: ${results.totalTests}`);
  console.log(`Tests Passed: ${results.testsPassed}`);
  console.log(`Tests Failed: ${results.testsFailed}`);
  console.log(`Success Rate: ${Math.round(successRate * 100)}%`);
  console.log(`Critical Issues: ${results.criticalIssues.length}`);
  
  if (results.overallSuccess) {
    console.log('\n✅ PAYMENT SYSTEM READY FOR LAUNCH');
    console.log('All critical tests passing, system is production-ready');
  } else {
    console.log('\n❌ PAYMENT SYSTEM NOT READY');
    console.log('Critical issues must be resolved before launch:');
    results.criticalIssues.forEach(issue => console.log(`  • ${issue}`));
  }
  
  // Generate comprehensive report
  generateTestReport(results);
  
  console.log('\n📚 ADDITIONAL TESTING REQUIRED:');
  console.log('1. Complete manual testing checklist');
  console.log('2. Perform cross-browser compatibility testing');
  console.log('3. Test with actual Stripe test cards');
  console.log('4. Verify email delivery in production environment');
  console.log('5. Load test with multiple concurrent users');
  
  console.log('\n🎉 Payment testing suite completed!');
  
  // Exit with appropriate code
  process.exit(results.overallSuccess ? 0 : 1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests if called directly
if (require.main === module) {
  runAllPaymentTests().catch(console.error);
}

module.exports = {
  runAllPaymentTests,
  runHealthChecks,
  checkEnvironmentConfig
};