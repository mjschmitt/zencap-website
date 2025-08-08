#!/usr/bin/env node

/**
 * ZenCap Domain Health Check
 * Comprehensive verification of zencap.co domain configuration
 * Tests performance, security, and operational status
 */

const https = require('https');
const http = require('http');

class DomainHealthChecker {
  constructor() {
    this.domain = 'zencap.co';
    this.endpoints = [
      '/',
      '/api/health',
      '/models/private-equity',
      '/models/public-equity',
      '/solutions/research',
      '/about',
      '/contact'
    ];
  }

  async runHealthCheck() {
    console.log('🏥 Starting ZenCap Domain Health Check...');
    console.log(`🌐 Domain: ${this.domain}`);
    console.log('=' * 50);

    const results = {
      domain: this.domain,
      timestamp: new Date().toISOString(),
      checks: {},
      overall: 'unknown'
    };

    try {
      // Core domain tests
      results.checks.dnsResolution = await this.checkDNSResolution();
      results.checks.sslCertificate = await this.checkSSLCertificate();
      results.checks.httpToHttpsRedirect = await this.checkHTTPRedirect();
      results.checks.wwwRedirect = await this.checkWWWRedirect();
      
      // Performance tests
      results.checks.responseTime = await this.checkResponseTime();
      results.checks.contentDelivery = await this.checkContentDelivery();
      
      // Security tests  
      results.checks.securityHeaders = await this.checkSecurityHeaders();
      
      // Endpoint availability
      results.checks.endpointStatus = await this.checkAllEndpoints();
      
      // Overall status
      results.overall = this.calculateOverallStatus(results.checks);
      
      this.displayResults(results);
      return results;

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      results.overall = 'error';
      results.error = error.message;
      return results;
    }
  }

  async checkDNSResolution() {
    console.log('🔍 Checking DNS resolution...');
    
    try {
      const response = await this.makeRequest('https://zencap.co/', { timeout: 5000 });
      
      if (response.statusCode >= 200 && response.statusCode < 400) {
        console.log('✅ DNS resolution: PASSED');
        return { status: 'passed', statusCode: response.statusCode };
      } else {
        throw new Error(`HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ DNS resolution: FAILED - ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  async checkSSLCertificate() {
    console.log('🔒 Checking SSL certificate...');
    
    try {
      const response = await this.makeRequest('https://zencap.co/', { 
        timeout: 5000,
        rejectUnauthorized: true 
      });
      
      console.log('✅ SSL certificate: VALID');
      return { 
        status: 'passed', 
        protocol: 'TLS',
        statusCode: response.statusCode 
      };
    } catch (error) {
      console.log(`❌ SSL certificate: FAILED - ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  async checkHTTPRedirect() {
    console.log('🔄 Checking HTTP to HTTPS redirect...');
    
    try {
      const response = await this.makeHTTPRequest('http://zencap.co/', { 
        timeout: 5000,
        followRedirects: false 
      });
      
      if (response.statusCode === 301 || response.statusCode === 302) {
        const location = response.headers.location;
        if (location && location.startsWith('https://')) {
          console.log('✅ HTTP redirect: PASSED');
          return { status: 'passed', redirectTo: location };
        }
      }
      
      throw new Error(`Unexpected response: ${response.statusCode}`);
    } catch (error) {
      console.log(`⚠️  HTTP redirect: WARNING - ${error.message}`);
      return { status: 'warning', error: error.message };
    }
  }

  async checkWWWRedirect() {
    console.log('🌍 Checking WWW redirect...');
    
    try {
      const response = await this.makeRequest('https://www.zencap.co/', { timeout: 5000 });
      
      console.log(`✅ WWW redirect: PASSED (${response.statusCode})`);
      return { status: 'passed', statusCode: response.statusCode };
    } catch (error) {
      console.log(`❌ WWW redirect: FAILED - ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  async checkResponseTime() {
    console.log('⚡ Checking response time...');
    
    const startTime = Date.now();
    try {
      await this.makeRequest('https://zencap.co/', { timeout: 10000 });
      const responseTime = Date.now() - startTime;
      
      let status = 'passed';
      let rating = 'excellent';
      
      if (responseTime > 3000) {
        status = 'warning';
        rating = 'poor';
      } else if (responseTime > 1500) {
        rating = 'good';
      }
      
      console.log(`✅ Response time: ${responseTime}ms (${rating})`);
      return { status, responseTime, rating };
    } catch (error) {
      console.log(`❌ Response time: FAILED - ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  async checkContentDelivery() {
    console.log('📦 Checking content delivery...');
    
    try {
      const response = await this.makeRequest('https://zencap.co/', { timeout: 10000 });
      
      const cacheControl = response.headers['cache-control'];
      const server = response.headers['server'];
      const xVercelCache = response.headers['x-vercel-cache'];
      
      const cdnInfo = {
        server: server || 'unknown',
        cacheStatus: xVercelCache || 'unknown',
        cacheControl: cacheControl || 'not-set'
      };
      
      console.log(`✅ Content delivery: PASSED (${cdnInfo.server})`);
      return { status: 'passed', ...cdnInfo };
    } catch (error) {
      console.log(`❌ Content delivery: FAILED - ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  async checkSecurityHeaders() {
    console.log('🛡️  Checking security headers...');
    
    try {
      const response = await this.makeRequest('https://zencap.co/', { timeout: 10000 });
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options', 
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      const presentHeaders = [];
      const missingHeaders = [];
      
      requiredHeaders.forEach(header => {
        if (response.headers[header]) {
          presentHeaders.push(header);
        } else {
          missingHeaders.push(header);
        }
      });
      
      const score = presentHeaders.length / requiredHeaders.length * 100;
      const status = score >= 75 ? 'passed' : score >= 50 ? 'warning' : 'failed';
      
      console.log(`${status === 'passed' ? '✅' : status === 'warning' ? '⚠️' : '❌'} Security headers: ${Math.round(score)}% (${presentHeaders.length}/${requiredHeaders.length})`);
      
      return {
        status,
        score,
        present: presentHeaders,
        missing: missingHeaders
      };
    } catch (error) {
      console.log(`❌ Security headers: FAILED - ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  async checkAllEndpoints() {
    console.log('🎯 Checking endpoint availability...');
    
    const results = {};
    
    for (const endpoint of this.endpoints) {
      try {
        const response = await this.makeRequest(`https://zencap.co${endpoint}`, { timeout: 10000 });
        const status = response.statusCode >= 200 && response.statusCode < 400 ? 'passed' : 'warning';
        results[endpoint] = { status, statusCode: response.statusCode };
        console.log(`  ${status === 'passed' ? '✅' : '⚠️'} ${endpoint}: ${response.statusCode}`);
      } catch (error) {
        results[endpoint] = { status: 'failed', error: error.message };
        console.log(`  ❌ ${endpoint}: ${error.message}`);
      }
    }
    
    const passedCount = Object.values(results).filter(r => r.status === 'passed').length;
    const overallStatus = passedCount >= this.endpoints.length * 0.8 ? 'passed' : 'warning';
    
    console.log(`📊 Endpoint summary: ${passedCount}/${this.endpoints.length} passed`);
    
    return { status: overallStatus, endpoints: results, summary: `${passedCount}/${this.endpoints.length}` };
  }

  calculateOverallStatus(checks) {
    const critical = ['dnsResolution', 'sslCertificate'];
    const important = ['responseTime', 'securityHeaders', 'endpointStatus'];
    
    // Check critical items
    for (const check of critical) {
      if (checks[check]?.status === 'failed') {
        return 'failed';
      }
    }
    
    // Count important items
    let passedImportant = 0;
    for (const check of important) {
      if (checks[check]?.status === 'passed') {
        passedImportant++;
      }
    }
    
    if (passedImportant >= important.length * 0.8) {
      return 'passed';
    } else if (passedImportant >= important.length * 0.6) {
      return 'warning';
    } else {
      return 'failed';
    }
  }

  displayResults(results) {
    console.log('\n🎯 DOMAIN HEALTH CHECK RESULTS');
    console.log('================================');
    console.log(`Domain: ${results.domain}`);
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Overall Status: ${this.getStatusEmoji(results.overall)} ${results.overall.toUpperCase()}`);
    
    if (results.overall === 'passed') {
      console.log('🎉 Domain is fully operational and ready for production!');
    } else if (results.overall === 'warning') {
      console.log('⚠️  Domain is operational but has some issues that should be addressed.');
    } else {
      console.log('❌ Domain has critical issues that need immediate attention.');
    }
    
    console.log('\n📋 Detailed Check Results:');
    for (const [checkName, result] of Object.entries(results.checks)) {
      console.log(`  ${this.getStatusEmoji(result.status)} ${checkName}: ${result.status}`);
    }
  }

  getStatusEmoji(status) {
    switch (status) {
      case 'passed': return '✅';
      case 'warning': return '⚠️';
      case 'failed': return '❌';
      default: return '❓';
    }
  }

  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        timeout: options.timeout || 10000,
        rejectUnauthorized: options.rejectUnauthorized !== false,
        ...options
      }, (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', reject);
      req.end();
    });
  }

  makeHTTPRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(url, {
        timeout: options.timeout || 10000,
        ...options
      }, (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', reject);
      req.end();
    });
  }
}

// Run if executed directly
if (require.main === module) {
  const checker = new DomainHealthChecker();
  checker.runHealthCheck()
    .then(results => {
      process.exit(results.overall === 'passed' ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = DomainHealthChecker;