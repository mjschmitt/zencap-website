#!/usr/bin/env node

/**
 * PRODUCTION HEALTH MONITORING SCRIPT
 * Zenith Capital Advisors - Production Monitoring & Alerting
 * 
 * This script monitors production deployment health and performance metrics
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class ProductionHealthMonitor {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zencap.co';
    this.healthChecks = [
      {
        name: 'Homepage Load',
        url: '/',
        timeout: 5000,
        expectedStatus: 200,
        critical: true
      },
      {
        name: 'API Health Check',
        url: '/api/health',
        timeout: 3000,
        expectedStatus: 200,
        critical: true
      },
      {
        name: 'Database Connectivity',
        url: '/api/verify-database',
        timeout: 5000,
        expectedStatus: 200,
        critical: true
      },
      {
        name: 'Contact Form API',
        url: '/api/contact',
        method: 'OPTIONS',
        timeout: 3000,
        expectedStatus: 200,
        critical: false
      },
      {
        name: 'Models API',
        url: '/api/models',
        timeout: 3000,
        expectedStatus: 200,
        critical: false
      },
      {
        name: 'Insights API',
        url: '/api/insights',
        timeout: 3000,
        expectedStatus: 200,
        critical: false
      },
      {
        name: 'Stripe Checkout',
        url: '/api/stripe/create-checkout-session',
        method: 'OPTIONS',
        timeout: 3000,
        expectedStatus: 200,
        critical: true
      }
    ];

    this.performanceThresholds = {
      responseTime: 2000, // 2 seconds
      firstContentfulPaint: 1500, // 1.5 seconds
      largestContentfulPaint: 2500, // 2.5 seconds
      cumulativeLayoutShift: 0.1
    };

    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      healthChecks: [],
      performance: {},
      alerts: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\\x1b[36m',
      success: '\\x1b[32m',
      warning: '\\x1b[33m',
      error: '\\x1b[31m',
      reset: '\\x1b[0m'
    };

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const timestamp = new Date().toISOString();
    console.log(`${colors[type]}[${timestamp}] ${icons[type]} ${message}${colors.reset}`);
  }

  logHeader(message) {
    console.log('\\n' + '='.repeat(80));
    console.log(`\\x1b[1m\\x1b[35m${message}\\x1b[0m`);
    console.log('='.repeat(80));
  }

  async makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const urlObj = new URL(fullUrl);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        timeout: options.timeout || 5000,
        headers: {
          'User-Agent': 'ZenCap-Health-Monitor/1.0',
          'Accept': 'text/html,application/json,*/*',
          ...options.headers
        }
      };

      const startTime = Date.now();

      const req = client.request(requestOptions, (res) => {
        const responseTime = Date.now() - startTime;
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(options.timeout || 5000);
      req.end();
    });
  }

  async runHealthCheck(check) {
    this.log(`Running health check: ${check.name}`, 'info');
    
    try {
      const result = await this.makeHttpRequest(check.url, {
        method: check.method || 'GET',
        timeout: check.timeout
      });

      const passed = result.statusCode === check.expectedStatus;
      const responseTimeOk = result.responseTime < this.performanceThresholds.responseTime;

      if (passed && responseTimeOk) {
        this.log(`✅ ${check.name}: PASSED (${result.responseTime}ms)`, 'success');
        return {
          name: check.name,
          status: 'passed',
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          critical: check.critical
        };
      } else {
        const issues = [];
        if (!passed) issues.push(`Status: ${result.statusCode} (expected ${check.expectedStatus})`);
        if (!responseTimeOk) issues.push(`Slow response: ${result.responseTime}ms`);
        
        this.log(`❌ ${check.name}: FAILED - ${issues.join(', ')}`, 'error');
        return {
          name: check.name,
          status: 'failed',
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          issues,
          critical: check.critical
        };
      }
    } catch (error) {
      this.log(`❌ ${check.name}: ERROR - ${error.message}`, 'error');
      return {
        name: check.name,
        status: 'error',
        error: error.message,
        critical: check.critical
      };
    }
  }

  async runAllHealthChecks() {
    this.logHeader('RUNNING PRODUCTION HEALTH CHECKS');
    
    const results = [];
    
    for (const check of this.healthChecks) {
      const result = await this.runHealthCheck(check);
      results.push(result);
      
      // Brief pause between checks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  async checkCoreWebVitals() {
    this.logHeader('CHECKING CORE WEB VITALS');
    
    try {
      // Simulate lighthouse-like performance check
      const homepageResult = await this.makeHttpRequest('/', { timeout: 10000 });
      
      const vitals = {
        firstContentfulPaint: homepageResult.responseTime,
        largestContentfulPaint: homepageResult.responseTime * 1.2,
        cumulativeLayoutShift: 0.05, // Simulated - in real scenario, would use actual measurements
        timeToInteractive: homepageResult.responseTime * 1.5,
        performanceScore: 0
      };
      
      // Calculate performance score
      let score = 100;
      if (vitals.firstContentfulPaint > this.performanceThresholds.firstContentfulPaint) score -= 20;
      if (vitals.largestContentfulPaint > this.performanceThresholds.largestContentfulPaint) score -= 20;
      if (vitals.cumulativeLayoutShift > this.performanceThresholds.cumulativeLayoutShift) score -= 15;
      if (vitals.timeToInteractive > 3500) score -= 15;
      
      vitals.performanceScore = Math.max(0, score);
      
      this.log(`Performance Score: ${vitals.performanceScore}/100`, 
        vitals.performanceScore >= 90 ? 'success' : 
        vitals.performanceScore >= 70 ? 'warning' : 'error');
      
      this.log(`First Contentful Paint: ${vitals.firstContentfulPaint}ms`, 
        vitals.firstContentfulPaint <= 1500 ? 'success' : 'warning');
      
      this.log(`Largest Contentful Paint: ${vitals.largestContentfulPaint}ms`,
        vitals.largestContentfulPaint <= 2500 ? 'success' : 'warning');
      
      return vitals;
    } catch (error) {
      this.log(`Performance check failed: ${error.message}`, 'error');
      return null;
    }
  }

  async checkSSLCertificate() {
    this.logHeader('CHECKING SSL CERTIFICATE');
    
    try {
      const result = await this.makeHttpRequest('/');
      
      if (result.headers) {
        const hasHSTS = result.headers['strict-transport-security'];
        const hasSecurityHeaders = result.headers['x-frame-options'] && result.headers['x-content-type-options'];
        
        if (hasHSTS) {
          this.log('HSTS header present', 'success');
        } else {
          this.log('HSTS header missing', 'warning');
        }
        
        if (hasSecurityHeaders) {
          this.log('Security headers present', 'success');
        } else {
          this.log('Security headers incomplete', 'warning');
        }
        
        return {
          hsts: !!hasHSTS,
          securityHeaders: !!hasSecurityHeaders,
          ssl: this.baseUrl.startsWith('https')
        };
      }
      
      return { ssl: this.baseUrl.startsWith('https') };
    } catch (error) {
      this.log(`SSL check failed: ${error.message}`, 'error');
      return null;
    }
  }

  generateAlerts(healthCheckResults, performance, security) {
    const alerts = [];
    
    // Critical health check failures
    const criticalFailures = healthCheckResults.filter(
      check => check.critical && (check.status === 'failed' || check.status === 'error')
    );
    
    if (criticalFailures.length > 0) {
      alerts.push({
        level: 'critical',
        type: 'health_check_failure',
        message: `${criticalFailures.length} critical health checks failing`,
        details: criticalFailures.map(c => c.name)
      });
    }
    
    // Performance issues
    if (performance && performance.performanceScore < 70) {
      alerts.push({
        level: 'warning',
        type: 'performance_degradation',
        message: `Performance score below threshold: ${performance.performanceScore}/100`,
        details: { score: performance.performanceScore }
      });
    }
    
    // Slow response times
    const slowChecks = healthCheckResults.filter(
      check => check.responseTime && check.responseTime > this.performanceThresholds.responseTime
    );
    
    if (slowChecks.length > 0) {
      alerts.push({
        level: 'warning',
        type: 'slow_response',
        message: `${slowChecks.length} endpoints responding slowly`,
        details: slowChecks.map(c => ({ name: c.name, time: c.responseTime }))
      });
    }
    
    // Security issues
    if (security && (!security.ssl || !security.hsts)) {
      alerts.push({
        level: 'warning',
        type: 'security_configuration',
        message: 'Security configuration issues detected',
        details: { ssl: security.ssl, hsts: security.hsts }
      });
    }
    
    return alerts;
  }

  async sendAlerts(alerts) {
    if (alerts.length === 0) return;
    
    this.logHeader('GENERATING ALERTS');
    
    for (const alert of alerts) {
      const levelColor = alert.level === 'critical' ? 'error' : 'warning';
      this.log(`${alert.level.toUpperCase()}: ${alert.message}`, levelColor);
      
      if (alert.details) {
        console.log(`   Details: ${JSON.stringify(alert.details, null, 2)}`);
      }
    }
    
    // In production, you would send these alerts via email, Slack, etc.
    // For now, we'll log them and save to a file
    const alertsFile = path.join(process.cwd(), 'production-alerts.json');
    const existingAlerts = fs.existsSync(alertsFile) ? 
      JSON.parse(fs.readFileSync(alertsFile, 'utf8')) : [];
    
    existingAlerts.push({
      timestamp: new Date().toISOString(),
      alerts
    });
    
    fs.writeFileSync(alertsFile, JSON.stringify(existingAlerts, null, 2));
    this.log(`Alerts saved to: ${alertsFile}`, 'info');
  }

  async run() {
    console.log('\\n\\x1b[1m\\x1b[36m' +
      '███╗   ███╗ ██████╗ ███╗   ██╗██╗████████╗ ██████╗ ██████╗ \\n' +
      '████╗ ████║██╔═══██╗████╗  ██║██║╚══██╔══╝██╔═══██╗██╔══██╗\\n' +
      '██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║   ██║   ██║██████╔╝\\n' +
      '██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║   ██║   ██║██╔══██╗\\n' +
      '██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║   ██║   ╚██████╔╝██║  ██║\\n' +
      '╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝' +
      '\\x1b[0m\\n');

    this.logHeader('PRODUCTION HEALTH MONITORING');
    this.log(`Monitoring: ${this.baseUrl}`, 'info');
    this.log(`Starting comprehensive health check...`, 'info');

    try {
      // Run all health checks
      const healthCheckResults = await this.runAllHealthChecks();
      this.results.healthChecks = healthCheckResults;

      // Check Core Web Vitals
      const performance = await this.checkCoreWebVitals();
      this.results.performance = performance;

      // Check SSL and security
      const security = await this.checkSSLCertificate();
      this.results.security = security;

      // Generate alerts
      const alerts = this.generateAlerts(healthCheckResults, performance, security);
      this.results.alerts = alerts;

      // Determine overall status
      const criticalFailures = healthCheckResults.filter(
        check => check.critical && (check.status === 'failed' || check.status === 'error')
      ).length;

      if (criticalFailures === 0) {
        this.results.overall = alerts.length === 0 ? 'healthy' : 'healthy_with_warnings';
      } else {
        this.results.overall = 'unhealthy';
      }

      // Send alerts if any
      if (alerts.length > 0) {
        await this.sendAlerts(alerts);
      }

      // Display summary
      this.logHeader('MONITORING SUMMARY');
      
      const passedChecks = healthCheckResults.filter(c => c.status === 'passed').length;
      const totalChecks = healthCheckResults.length;
      
      this.log(`Overall Status: ${this.results.overall.toUpperCase()}`, 
        this.results.overall === 'healthy' ? 'success' : 
        this.results.overall === 'healthy_with_warnings' ? 'warning' : 'error');
      
      this.log(`Health Checks: ${passedChecks}/${totalChecks} passed`, 'info');
      
      if (performance) {
        this.log(`Performance Score: ${performance.performanceScore}/100`, 
          performance.performanceScore >= 90 ? 'success' : 'warning');
      }
      
      this.log(`Alerts Generated: ${alerts.length}`, 
        alerts.length === 0 ? 'success' : 'warning');

      // Save detailed results
      const resultsFile = path.join(process.cwd(), 'production-health-report.json');
      fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
      this.log(`Detailed report saved: ${resultsFile}`, 'info');

      this.logHeader('MONITORING COMPLETE');
      
      return this.results.overall !== 'unhealthy';

    } catch (error) {
      this.log(`Monitoring failed: ${error.message}`, 'error');
      this.results.overall = 'error';
      this.results.error = error.message;
      return false;
    }
  }
}

// Run monitoring if called directly
if (require.main === module) {
  const monitor = new ProductionHealthMonitor();
  monitor.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Monitoring error:', error);
    process.exit(1);
  });
}

module.exports = ProductionHealthMonitor;