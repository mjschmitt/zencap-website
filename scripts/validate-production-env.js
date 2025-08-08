#!/usr/bin/env node

/**
 * PRODUCTION ENVIRONMENT VALIDATION SCRIPT
 * Zenith Capital Advisors - Critical Environment Validation
 * 
 * This script validates all production environment variables
 * and ensures they are properly configured for production deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionEnvValidator {
  constructor() {
    this.envFile = path.join(process.cwd(), '.env.production');
    this.results = {
      critical: [],
      important: [],
      optional: [],
      security: [],
      performance: []
    };
    
    // Load environment variables
    this.loadEnv();
    
    // Define validation rules
    this.validationRules = {
      // CRITICAL - Must be configured for production
      critical: {
        'POSTGRES_URL': {
          validator: (val) => val && val.startsWith('postgresql://') && !val.includes('localhost'),
          message: 'Must be a valid production PostgreSQL connection string'
        },
        'POSTGRES_URL_NON_POOLING': {
          validator: (val) => val && val.startsWith('postgresql://') && !val.includes('localhost'),
          message: 'Must be a valid non-pooling PostgreSQL connection string'
        },
        'SENDGRID_API_KEY': {
          validator: (val) => val && val.startsWith('SG.') && val.length > 50,
          message: 'Must be a valid SendGrid API key (starts with SG.)'
        },
        'STRIPE_SECRET_KEY': {
          validator: (val) => val && val.startsWith('sk_live_') && val.length > 20,
          message: 'Must be a LIVE Stripe secret key (starts with sk_live_)'
        },
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
          validator: (val) => val && val.startsWith('pk_live_') && val.length > 20,
          message: 'Must be a LIVE Stripe publishable key (starts with pk_live_)'
        },
        'STRIPE_WEBHOOK_SECRET': {
          validator: (val) => val && val.startsWith('whsec_') && val.length > 20,
          message: 'Must be a valid Stripe webhook secret (starts with whsec_)'
        },
        'NEXTAUTH_SECRET': {
          validator: (val) => val && val.length >= 32,
          message: 'Must be at least 32 characters long'
        }
      },
      
      // IMPORTANT - Should be configured for full functionality
      important: {
        'NEXT_PUBLIC_GA_ID': {
          validator: (val) => !val || val.match(/^G-[A-Z0-9]{10}$/),
          message: 'Must be a valid Google Analytics 4 measurement ID (G-XXXXXXXXXX)'
        },
        'SENDGRID_FROM_EMAIL': {
          validator: (val) => val && val.includes('@') && val.includes('zencap.co'),
          message: 'Must be a valid email address using zencap.co domain'
        },
        'NEXT_PUBLIC_SITE_URL': {
          validator: (val) => val && val.startsWith('https://') && val.includes('zencap.co'),
          message: 'Must be the production HTTPS URL'
        }
      },
      
      // SECURITY - Critical security configurations
      security: {
        'ENCRYPTION_KEY': {
          validator: (val) => val && val.length === 64 && /^[a-fA-F0-9]+$/.test(val),
          message: 'Must be a 64-character hexadecimal string'
        },
        'JWT_SECRET': {
          validator: (val) => val && val.length >= 32,
          message: 'Must be at least 32 characters long'
        },
        'SESSION_SECRET': {
          validator: (val) => val && val.length >= 20 && !val.includes('change'),
          message: 'Must be a strong session secret (not default value)'
        },
        'NODE_ENV': {
          validator: (val) => val === 'production',
          message: 'Must be set to "production"'
        }
      },
      
      // PERFORMANCE - Performance optimization settings
      performance: {
        'ENABLE_COMPRESSION': {
          validator: (val) => val === 'true',
          message: 'Should be enabled for production performance'
        },
        'CACHE_STATIC_ASSETS': {
          validator: (val) => val === 'true',
          message: 'Should be enabled for production performance'
        },
        'IMAGE_OPTIMIZATION': {
          validator: (val) => val === 'true',
          message: 'Should be enabled for production performance'
        }
      }
    };
  }

  loadEnv() {
    this.env = {};
    
    if (fs.existsSync(this.envFile)) {
      const envContent = fs.readFileSync(this.envFile, 'utf8');
      const lines = envContent.split('\\n');
      
      for (const line of lines) {
        const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (match) {
          this.env[match[1]] = match[2].trim();
        }
      }
    }
  }

  log(message, type = 'info') {
    const colors = {
      info: '\\x1b[36m',    // cyan
      success: '\\x1b[32m', // green
      warning: '\\x1b[33m', // yellow
      error: '\\x1b[31m',   // red
      reset: '\\x1b[0m'
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  logHeader(message) {
    console.log('\\n' + '='.repeat(80));
    console.log(`\\x1b[1m\\x1b[35m${message}\\x1b[0m`);
    console.log('='.repeat(80));
  }

  validateCategory(categoryName, rules) {
    this.logHeader(`VALIDATING ${categoryName.toUpperCase()} CONFIGURATION`);
    
    const results = [];
    
    for (const [key, rule] of Object.entries(rules)) {
      const value = this.env[key];
      const isValid = rule.validator(value);
      
      if (isValid) {
        this.log(`${key}: VALID`, 'success');
        results.push({ key, status: 'valid', value: value ? `${value.substring(0, 10)}...` : 'empty' });
      } else {
        this.log(`${key}: INVALID - ${rule.message}`, 'error');
        results.push({ key, status: 'invalid', message: rule.message, value: value || 'missing' });
      }
    }
    
    return results;
  }

  validateDatabaseConnection() {
    this.logHeader('TESTING DATABASE CONNECTION');
    
    const dbUrl = this.env['POSTGRES_URL'];
    if (!dbUrl) {
      this.log('Cannot test database connection - POSTGRES_URL not configured', 'error');
      return false;
    }
    
    try {
      // Simple validation - ensure URL has required components
      const url = new URL(dbUrl);
      const hasHost = !!url.hostname;
      const hasPort = !!url.port;
      const hasDatabase = !!url.pathname && url.pathname !== '/';
      const hasAuth = !!url.username && !!url.password;
      const hasSSL = url.searchParams.get('sslmode') === 'require';
      
      if (hasHost && hasPort && hasDatabase && hasAuth && hasSSL) {
        this.log('Database URL format validation: PASSED', 'success');
        return true;
      } else {
        this.log('Database URL missing required components', 'error');
        this.log(`Host: ${hasHost}, Port: ${hasPort}, Database: ${hasDatabase}, Auth: ${hasAuth}, SSL: ${hasSSL}`, 'info');
        return false;
      }
    } catch (error) {
      this.log(`Database URL format error: ${error.message}`, 'error');
      return false;
    }
  }

  validateStripeConfiguration() {
    this.logHeader('VALIDATING STRIPE CONFIGURATION');
    
    const secretKey = this.env['STRIPE_SECRET_KEY'];
    const publishableKey = this.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'];
    const webhookSecret = this.env['STRIPE_WEBHOOK_SECRET'];
    
    const results = [];
    
    // Check if using live keys
    if (secretKey && secretKey.startsWith('sk_live_')) {
      this.log('Stripe secret key: LIVE key detected', 'success');
      results.push({ component: 'secret_key', status: 'live' });
    } else if (secretKey && secretKey.startsWith('sk_test_')) {
      this.log('Stripe secret key: TEST key detected - NOT suitable for production', 'error');
      results.push({ component: 'secret_key', status: 'test' });
    } else {
      this.log('Stripe secret key: MISSING or INVALID', 'error');
      results.push({ component: 'secret_key', status: 'missing' });
    }
    
    if (publishableKey && publishableKey.startsWith('pk_live_')) {
      this.log('Stripe publishable key: LIVE key detected', 'success');
      results.push({ component: 'publishable_key', status: 'live' });
    } else if (publishableKey && publishableKey.startsWith('pk_test_')) {
      this.log('Stripe publishable key: TEST key detected - NOT suitable for production', 'error');
      results.push({ component: 'publishable_key', status: 'test' });
    } else {
      this.log('Stripe publishable key: MISSING or INVALID', 'error');
      results.push({ component: 'publishable_key', status: 'missing' });
    }
    
    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
      this.log('Stripe webhook secret: CONFIGURED', 'success');
      results.push({ component: 'webhook_secret', status: 'configured' });
    } else {
      this.log('Stripe webhook secret: MISSING or INVALID', 'error');
      results.push({ component: 'webhook_secret', status: 'missing' });
    }
    
    return results;
  }

  validateSecurityConfiguration() {
    this.logHeader('SECURITY CONFIGURATION ANALYSIS');
    
    const securityChecks = [
      {
        name: 'Environment File Security',
        check: () => {
          // Check if .env.production is in .gitignore
          const gitignorePath = path.join(process.cwd(), '.gitignore');
          if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            return gitignoreContent.includes('.env') || gitignoreContent.includes('.env.production');
          }
          return false;
        },
        message: '.env files should be in .gitignore'
      },
      {
        name: 'HTTPS Configuration',
        check: () => {
          const siteUrl = this.env['NEXT_PUBLIC_SITE_URL'];
          return siteUrl && siteUrl.startsWith('https://');
        },
        message: 'Site URL should use HTTPS'
      },
      {
        name: 'Secure Headers',
        check: () => {
          const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
          if (fs.existsSync(nextConfigPath)) {
            const config = fs.readFileSync(nextConfigPath, 'utf8');
            return config.includes('X-Frame-Options') && 
                   config.includes('Content-Security-Policy') &&
                   config.includes('X-XSS-Protection');
          }
          return false;
        },
        message: 'Security headers should be configured in next.config.mjs'
      },
      {
        name: 'Production Build Optimization',
        check: () => {
          const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
          if (fs.existsSync(nextConfigPath)) {
            const config = fs.readFileSync(nextConfigPath, 'utf8');
            return config.includes('removeConsole') && config.includes('swcMinify');
          }
          return false;
        },
        message: 'Production optimizations should be enabled'
      }
    ];
    
    const results = [];
    for (const check of securityChecks) {
      const passed = check.check();
      if (passed) {
        this.log(`${check.name}: PASSED`, 'success');
        results.push({ check: check.name, status: 'passed' });
      } else {
        this.log(`${check.name}: FAILED - ${check.message}`, 'warning');
        results.push({ check: check.name, status: 'failed', message: check.message });
      }
    }
    
    return results;
  }

  generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      overall_status: 'unknown',
      summary: {
        critical_issues: 0,
        important_issues: 0,
        security_issues: 0,
        performance_issues: 0,
        total_issues: 0
      },
      categories: {},
      recommendations: []
    };

    // Validate all categories
    for (const [categoryName, rules] of Object.entries(this.validationRules)) {
      const categoryResults = this.validateCategory(categoryName, rules);
      report.categories[categoryName] = categoryResults;
      
      const invalidCount = categoryResults.filter(r => r.status === 'invalid').length;
      report.summary[`${categoryName}_issues`] = invalidCount;
      report.summary.total_issues += invalidCount;
    }

    // Special validations
    const dbConnectionValid = this.validateDatabaseConnection();
    const stripeResults = this.validateStripeConfiguration();
    const securityResults = this.validateSecurityConfiguration();
    
    report.database_connection = dbConnectionValid;
    report.stripe_configuration = stripeResults;
    report.security_checks = securityResults;

    // Determine overall status
    if (report.summary.critical_issues === 0 && report.summary.security_issues === 0) {
      if (report.summary.total_issues === 0) {
        report.overall_status = 'ready';
      } else {
        report.overall_status = 'ready_with_warnings';
      }
    } else {
      report.overall_status = 'not_ready';
    }

    // Generate recommendations
    if (report.summary.critical_issues > 0) {
      report.recommendations.push('CRITICAL: Fix all critical configuration issues before deployment');
    }
    
    if (report.summary.security_issues > 0) {
      report.recommendations.push('SECURITY: Address security configuration issues immediately');
    }
    
    if (!dbConnectionValid) {
      report.recommendations.push('DATABASE: Fix database connection configuration');
    }
    
    const liveStripeKeys = stripeResults.filter(r => r.status === 'live').length;
    if (liveStripeKeys < 2) {
      report.recommendations.push('STRIPE: Configure LIVE Stripe keys for production payments');
    }
    
    if (report.summary.performance_issues > 0) {
      report.recommendations.push('PERFORMANCE: Enable production performance optimizations');
    }

    return report;
  }

  async run() {
    console.log('\\n\\x1b[1m\\x1b[36m' +
      '██╗   ██╗ █████╗ ██╗     ██╗██████╗  █████╗ ████████╗██╗ ██████╗ ███╗   ██╗\\n' +
      '██║   ██║██╔══██╗██║     ██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║\\n' +
      '██║   ██║███████║██║     ██║██║  ██║███████║   ██║   ██║██║   ██║██╔██╗ ██║\\n' +
      '╚██╗ ██╔╝██╔══██║██║     ██║██║  ██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║\\n' +
      ' ╚████╔╝ ██║  ██║███████╗██║██████╔╝██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║\\n' +
      '  ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝' +
      '\\x1b[0m\\n');

    this.logHeader('PRODUCTION ENVIRONMENT VALIDATION');
    
    if (!fs.existsSync(this.envFile)) {
      this.log(`Environment file not found: ${this.envFile}`, 'error');
      this.log('Run setup-production-env.js first to generate the template', 'info');
      return false;
    }

    this.log(`Validating environment file: ${this.envFile}`, 'info');
    this.log(`Found ${Object.keys(this.env).length} environment variables`, 'info');

    // Generate comprehensive validation report
    const report = this.generateValidationReport();

    // Display final summary
    this.logHeader('VALIDATION SUMMARY');
    
    this.log(`Overall Status: ${report.overall_status.toUpperCase()}`, 
      report.overall_status === 'ready' ? 'success' : 
      report.overall_status === 'ready_with_warnings' ? 'warning' : 'error');
    
    this.log(`Total Issues Found: ${report.summary.total_issues}`, 'info');
    this.log(`Critical Issues: ${report.summary.critical_issues}`, 
      report.summary.critical_issues === 0 ? 'success' : 'error');
    this.log(`Security Issues: ${report.summary.security_issues}`, 
      report.summary.security_issues === 0 ? 'success' : 'error');

    // Display recommendations
    if (report.recommendations.length > 0) {
      this.logHeader('RECOMMENDATIONS');
      for (const recommendation of report.recommendations) {
        this.log(recommendation, 'warning');
      }
    }

    // Save detailed report
    const reportFile = path.join(process.cwd(), 'production-validation-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    this.log(`Detailed report saved: ${reportFile}`, 'info');

    this.logHeader('PRODUCTION VALIDATION COMPLETE');
    
    return report.overall_status !== 'not_ready';
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ProductionEnvValidator();
  validator.run().catch(console.error);
}

module.exports = ProductionEnvValidator;