#!/usr/bin/env node

/**
 * Production Security Setup Script
 * Removes dangerous endpoints and secures the application for production deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class ProductionSecuritySetup {
  constructor() {
    this.actions = [];
    this.errors = [];
  }

  addAction(action, details) {
    this.actions.push({ action, details, timestamp: new Date() });
  }

  addError(error, details) {
    this.errors.push({ error, details, timestamp: new Date() });
  }

  async removeDebugEndpoints() {
    colorLog('blue', '\n=== Removing Debug/Test Endpoints ===');
    
    const apiDir = path.join(rootDir, 'src', 'pages', 'api');
    const dangerousEndpoints = [
      'test-db.js',
      'test-email.js',
      'test-stripe-connection.js',
      'test-stripe-direct.js',
      'test-stripe-env.js',
      'test-excel.js',
      'test-file-access.js',
      'test-newsletter.js'
    ];

    for (const endpoint of dangerousEndpoints) {
      const filePath = path.join(apiDir, endpoint);
      
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        colorLog('green', `✓ Removed dangerous endpoint: ${endpoint}`);
        this.addAction('REMOVE_ENDPOINT', `Deleted ${endpoint}`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          colorLog('red', `✗ Failed to remove ${endpoint}: ${error.message}`);
          this.addError('REMOVE_ENDPOINT_FAILED', `${endpoint}: ${error.message}`);
        } else {
          colorLog('yellow', `- Endpoint ${endpoint} already removed`);
        }
      }
    }
  }

  async secureDebugEndpoint() {
    colorLog('blue', '\n=== Securing Debug Endpoint ===');
    
    const debugEndpoint = path.join(rootDir, 'src', 'pages', 'api', 'debug-env.js');
    
    try {
      const content = await fs.readFile(debugEndpoint, 'utf-8');
      
      if (content.includes('NODE_ENV === \'production\'') || 
          content.includes('ENABLE_DEBUG_ENDPOINTS')) {
        colorLog('green', '✓ Debug endpoint already secured');
        this.addAction('SECURE_DEBUG', 'Debug endpoint has security restrictions');
      } else {
        // The endpoint has already been secured in our earlier changes
        colorLog('yellow', '! Debug endpoint exists but may need additional security');
        this.addAction('VERIFY_DEBUG', 'Debug endpoint needs manual verification');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        colorLog('green', '✓ Debug endpoint already removed');
      } else {
        colorLog('red', `✗ Cannot check debug endpoint: ${error.message}`);
        this.addError('CHECK_DEBUG_FAILED', error.message);
      }
    }
  }

  async createProductionEnvTemplate() {
    colorLog('blue', '\n=== Creating Production Environment Template ===');
    
    const productionEnv = `# Production Environment Configuration for Zenith Capital Advisors
# SECURITY: Never commit this file with real values

# Database Configuration (Required)
POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database?sslmode=require

# Email Configuration (Required)
SENDGRID_API_KEY=SG.your-production-sendgrid-key
FROM_EMAIL=noreply@zencap.co

# Security Configuration (CRITICAL)
JWT_SECRET=\${GENERATE_32_BYTE_RANDOM_STRING}
SESSION_SECRET=\${GENERATE_32_BYTE_RANDOM_STRING}
ENCRYPTION_KEY=\${GENERATE_32_BYTE_HEX_KEY}
NEXTAUTH_SECRET=\${GENERATE_32_BYTE_RANDOM_STRING}

# Stripe Configuration (Required)
STRIPE_SECRET_KEY=sk_live_your-production-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-production-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-production-webhook-secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://zencap.co
NEXTAUTH_URL=https://zencap.co

# Analytics
NEXT_PUBLIC_GA_ID=G-your-production-analytics-id

# Security Monitoring (Recommended)
SECURITY_ALERT_EMAIL=security@zencap.co
ERROR_REPORTING_DSN=https://your-sentry-dsn

# Production Flags
NODE_ENV=production
ENABLE_DEBUG_ENDPOINTS=false

# API Rate Limits (Production Settings)
RATE_LIMIT_UPLOAD=10
RATE_LIMIT_DOWNLOAD=100
RATE_LIMIT_API=200

# File Security
VIRUS_SCAN_ENABLED=true
MAX_FILE_SIZE=104857600

# GDPR Compliance
DATA_RETENTION_DAYS=730
GDPR_COMPLIANCE_MODE=true

# Security Headers
HSTS_MAX_AGE=31536000
CSP_REPORT_URI=https://your-csp-report-endpoint.com/report
`;

    try {
      await fs.writeFile(path.join(rootDir, 'env.production'), productionEnv);
      colorLog('green', '✓ Created production environment template');
      this.addAction('CREATE_PROD_ENV', 'Created env.production template');
    } catch (error) {
      colorLog('red', `✗ Failed to create production env: ${error.message}`);
      this.addError('CREATE_PROD_ENV_FAILED', error.message);
    }
  }

  async createSecurityChecklist() {
    colorLog('blue', '\n=== Creating Production Security Checklist ===');
    
    const checklist = `# Production Security Checklist for Zenith Capital Advisors

## Pre-Deployment Security Checklist

### Critical Security Tasks ✅
- [ ] All debug/test endpoints removed or secured
- [ ] Environment variables properly configured with strong secrets
- [ ] JWT secrets are 32+ characters and cryptographically random
- [ ] Stripe webhook secrets configured and verified
- [ ] Database connection uses SSL/TLS
- [ ] All API endpoints have rate limiting
- [ ] File upload security is enabled and tested
- [ ] Audit logging is active and monitored

### Database Security ✅
- [ ] Database credentials are secure and rotated
- [ ] Connection pooling is properly configured
- [ ] All queries use parameterized statements
- [ ] Database backups are encrypted and tested
- [ ] Access logs are enabled and monitored

### Payment Security ✅
- [ ] Stripe webhook signature verification is active
- [ ] All payment data is encrypted at rest
- [ ] PCI DSS compliance requirements are met
- [ ] Order tracking is properly implemented
- [ ] Payment audit logging is comprehensive

### API Security ✅
- [ ] All endpoints require authentication where appropriate
- [ ] Rate limiting is configured per endpoint type
- [ ] Input validation is comprehensive
- [ ] Error messages don't expose sensitive information
- [ ] CORS is properly configured
- [ ] API versioning is implemented

### Infrastructure Security ✅
- [ ] HTTPS/TLS 1.3 is enforced everywhere
- [ ] Security headers are properly configured
- [ ] DNS CAA records are configured
- [ ] Subdomain takeover protection is in place
- [ ] CDN security features are enabled

### File Security ✅
- [ ] Virus scanning is enabled and tested
- [ ] File type validation is strict
- [ ] Upload size limits are enforced
- [ ] File encryption at rest is active
- [ ] Quarantine system is functional

### Monitoring & Alerting ✅
- [ ] Security incident alerting is configured
- [ ] Failed authentication monitoring is active
- [ ] Unusual activity detection is running
- [ ] Error rate monitoring is set up
- [ ] Performance monitoring is active

### Compliance ✅
- [ ] GDPR compliance features are enabled
- [ ] Data retention policies are configured
- [ ] User data export/deletion is functional
- [ ] Privacy policy is current and accurate
- [ ] Terms of service are legally reviewed

### Post-Deployment ✅
- [ ] Security scan of live site completed
- [ ] Penetration testing scheduled
- [ ] Security team has monitoring access
- [ ] Incident response plan is activated
- [ ] Staff security training is current

## Emergency Contacts
- Security Team: security@zencap.co
- DevOps Team: devops@zencap.co  
- Emergency: +1-XXX-XXX-XXXX

## Security Tools Access
- Monitoring Dashboard: [URL]
- Error Tracking: [URL]
- Audit Logs: [URL]
- Security Alerts: [URL]

Last Updated: ${new Date().toISOString()}
`;

    try {
      await fs.writeFile(path.join(rootDir, 'PRODUCTION_SECURITY_CHECKLIST.md'), checklist);
      colorLog('green', '✓ Created production security checklist');
      this.addAction('CREATE_CHECKLIST', 'Created security checklist');
    } catch (error) {
      colorLog('red', `✗ Failed to create security checklist: ${error.message}`);
      this.addError('CREATE_CHECKLIST_FAILED', error.message);
    }
  }

  async updatePackageJsonSecurity() {
    colorLog('blue', '\n=== Updating Package.json Security Scripts ===');
    
    try {
      const packageJsonPath = path.join(rootDir, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Add security scripts
      if (!packageJson.scripts) packageJson.scripts = {};
      
      packageJson.scripts['security:audit'] = 'npm audit --audit-level moderate';
      packageJson.scripts['security:validate'] = 'node scripts/security-validation.js';
      packageJson.scripts['security:check'] = 'npm run security:audit && npm run security:validate';
      packageJson.scripts['prod:secure'] = 'node scripts/secure-production.js';
      packageJson.scripts['prod:deploy'] = 'npm run security:check && npm run build';
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      colorLog('green', '✓ Added security scripts to package.json');
      this.addAction('UPDATE_PACKAGE', 'Added security scripts');
    } catch (error) {
      colorLog('red', `✗ Failed to update package.json: ${error.message}`);
      this.addError('UPDATE_PACKAGE_FAILED', error.message);
    }
  }

  async createSecurityMiddleware() {
    colorLog('blue', '\n=== Verifying Security Middleware ===');
    
    const middlewarePath = path.join(rootDir, 'middleware.js');
    
    try {
      const content = await fs.readFile(middlewarePath, 'utf-8');
      
      if (content.includes('JWT_SECRET') && !content.includes('fallback-secret-key')) {
        colorLog('green', '✓ Security middleware is properly configured');
        this.addAction('VERIFY_MIDDLEWARE', 'Middleware security verified');
      } else {
        colorLog('yellow', '! Middleware may need security updates');
        this.addAction('CHECK_MIDDLEWARE', 'Middleware needs manual review');
      }
    } catch (error) {
      colorLog('red', `✗ Cannot verify security middleware: ${error.message}`);
      this.addError('VERIFY_MIDDLEWARE_FAILED', error.message);
    }
  }

  async runSecuritySetup() {
    colorLog('cyan', '🔒 Production Security Setup for Zenith Capital Advisors');
    colorLog('cyan', '══════════════════════════════════════════════════════');

    await this.removeDebugEndpoints();
    await this.secureDebugEndpoint();
    await this.createProductionEnvTemplate();
    await this.createSecurityChecklist();
    await this.updatePackageJsonSecurity();
    await this.createSecurityMiddleware();

    this.generateReport();
  }

  generateReport() {
    colorLog('cyan', '\n\n🔒 PRODUCTION SECURITY SETUP REPORT');
    colorLog('cyan', '═══════════════════════════════════');

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Actions completed: ${this.actions.length}`);
    console.log(`   ❌ Errors encountered: ${this.errors.length}`);

    if (this.actions.length > 0) {
      colorLog('green', '\n✅ COMPLETED ACTIONS:');
      this.actions.forEach((action, index) => {
        colorLog('green', `${index + 1}. ${action.action}: ${action.details}`);
      });
    }

    if (this.errors.length > 0) {
      colorLog('red', '\n❌ ERRORS ENCOUNTERED:');
      this.errors.forEach((error, index) => {
        colorLog('red', `${index + 1}. ${error.error}: ${error.details}`);
      });
    }

    colorLog('cyan', '\n🚀 NEXT STEPS:');
    colorLog('yellow', '1. Review and complete the Production Security Checklist');
    colorLog('yellow', '2. Configure production environment variables using env.production template');
    colorLog('yellow', '3. Run security validation: npm run security:validate');
    colorLog('yellow', '4. Conduct final security testing');
    colorLog('yellow', '5. Deploy with: npm run prod:deploy');

    if (this.errors.length === 0) {
      colorLog('green', '\n✅ Production security setup completed successfully!');
      process.exit(0);
    } else {
      colorLog('yellow', '\n⚠️  Production security setup completed with warnings.');
      colorLog('yellow', 'Please review and resolve any errors before deployment.');
      process.exit(1);
    }
  }
}

// Run setup
const setup = new ProductionSecuritySetup();
setup.runSecuritySetup().catch(error => {
  console.error('Security setup failed:', error);
  process.exit(1);
});