#!/usr/bin/env node

/**
 * Simple deployment monitoring script
 * Monitors health endpoints and sends alerts if needed
 */

const https = require('https');
const http = require('http');

const MONITORING_CONFIG = {
  production: process.env.PRODUCTION_URL || 'https://your-domain.com',
  staging: process.env.STAGING_URL || null,
  checkInterval: 5 * 60 * 1000, // 5 minutes
  timeout: 30000, // 30 seconds
  retries: 3
};

class DeploymentMonitor {
  constructor(config) {
    this.config = config;
    this.isMonitoring = false;
    this.healthHistory = {
      production: [],
      staging: []
    };
  }

  async checkHealth(url, environment) {
    return new Promise((resolve) => {
      const healthUrl = `${url}/api/health`;
      const client = healthUrl.startsWith('https://') ? https : http;
      
      const startTime = Date.now();
      
      const request = client.get(healthUrl, {
        timeout: this.config.timeout
      }, (res) => {
        const responseTime = Date.now() - startTime;
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const healthData = JSON.parse(body);
            resolve({
              success: true,
              statusCode: res.statusCode,
              responseTime,
              data: healthData,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Invalid JSON response',
              statusCode: res.statusCode,
              responseTime,
              timestamp: new Date().toISOString()
            });
          }
        });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({
          success: false,
          error: 'Timeout',
          responseTime: this.config.timeout,
          timestamp: new Date().toISOString()
        });
      });

      request.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async performHealthCheck(environment) {
    const url = this.config[environment];
    if (!url) {
      console.log(`⚠️  ${environment.toUpperCase()} URL not configured, skipping...`);
      return null;
    }

    console.log(`🔍 Checking ${environment.toUpperCase()} health: ${url}`);
    
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      const result = await this.checkHealth(url, environment);
      
      if (result.success && result.statusCode === 200) {
        this.healthHistory[environment].push(result);
        this.trimHealthHistory(environment);
        
        console.log(`✅ ${environment.toUpperCase()} healthy - Response: ${result.responseTime}ms`);
        if (result.data) {
          console.log(`   Status: ${result.data.status}, Uptime: ${Math.floor(result.data.uptime)}s`);
          if (result.data.services) {
            Object.entries(result.data.services).forEach(([service, status]) => {
              const emoji = status.status === 'healthy' ? '✅' : 
                           status.status === 'warning' ? '⚠️' : '❌';
              console.log(`   ${emoji} ${service}: ${status.status}`);
            });
          }
        }
        return result;
      }
      
      console.log(`❌ ${environment.toUpperCase()} unhealthy (attempt ${attempt}/${this.config.retries})`);
      console.log(`   Error: ${result.error || 'HTTP ' + result.statusCode}`);
      
      if (attempt < this.config.retries) {
        console.log(`   Retrying in 10 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    // All retries failed
    this.sendAlert(environment, url, 'Health check failed after all retries');
    return null;
  }

  trimHealthHistory(environment) {
    // Keep only last 100 entries
    if (this.healthHistory[environment].length > 100) {
      this.healthHistory[environment] = this.healthHistory[environment].slice(-100);
    }
  }

  sendAlert(environment, url, message) {
    const alertMessage = `🚨 ALERT: ${environment.toUpperCase()} deployment issue\n` +
                        `URL: ${url}\n` +
                        `Message: ${message}\n` +
                        `Time: ${new Date().toISOString()}`;
    
    console.log('\n' + '='.repeat(50));
    console.log(alertMessage);
    console.log('='.repeat(50) + '\n');

    // In production, you would send this to Slack, email, PagerDuty, etc.
    if (process.env.SLACK_WEBHOOK_URL) {
      // TODO: Implement Slack notification
    }
  }

  getHealthSummary() {
    return {
      production: {
        lastCheck: this.healthHistory.production[this.healthHistory.production.length - 1] || null,
        totalChecks: this.healthHistory.production.length,
        successRate: this.healthHistory.production.filter(h => h.success).length / 
                    Math.max(this.healthHistory.production.length, 1) * 100
      },
      staging: {
        lastCheck: this.healthHistory.staging[this.healthHistory.staging.length - 1] || null,
        totalChecks: this.healthHistory.staging.length,
        successRate: this.healthHistory.staging.filter(h => h.success).length / 
                    Math.max(this.healthHistory.staging.length, 1) * 100
      }
    };
  }

  start() {
    if (this.isMonitoring) {
      console.log('⚠️  Monitoring is already running');
      return;
    }

    console.log('🚀 Starting deployment monitoring...');
    console.log(`📊 Check interval: ${this.config.checkInterval / 1000}s`);
    console.log(`🔄 Retries per check: ${this.config.retries}`);
    console.log(`⏱️  Timeout: ${this.config.timeout / 1000}s`);
    
    this.isMonitoring = true;
    
    // Initial check
    this.runHealthChecks();
    
    // Schedule regular checks
    this.monitoringInterval = setInterval(() => {
      this.runHealthChecks();
    }, this.config.checkInterval);

    // Display summary every 30 minutes
    this.summaryInterval = setInterval(() => {
      this.displaySummary();
    }, 30 * 60 * 1000);
  }

  async runHealthChecks() {
    console.log(`\n⏰ Health check at ${new Date().toLocaleString()}`);
    console.log('-'.repeat(40));
    
    await Promise.all([
      this.performHealthCheck('production'),
      this.performHealthCheck('staging')
    ]);
  }

  displaySummary() {
    const summary = this.getHealthSummary();
    console.log('\n📈 HEALTH SUMMARY');
    console.log('='.repeat(40));
    
    Object.entries(summary).forEach(([env, stats]) => {
      if (stats.totalChecks > 0) {
        console.log(`${env.toUpperCase()}:`);
        console.log(`  Success Rate: ${stats.successRate.toFixed(1)}%`);
        console.log(`  Total Checks: ${stats.totalChecks}`);
        console.log(`  Last Check: ${stats.lastCheck ? stats.lastCheck.timestamp : 'Never'}`);
      }
    });
    console.log('='.repeat(40));
  }

  stop() {
    if (this.isMonitoring) {
      console.log('🛑 Stopping monitoring...');
      clearInterval(this.monitoringInterval);
      clearInterval(this.summaryInterval);
      this.isMonitoring = false;
      this.displaySummary();
    }
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new DeploymentMonitor(MONITORING_CONFIG);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });

  // Start monitoring
  monitor.start();
}

module.exports = DeploymentMonitor;