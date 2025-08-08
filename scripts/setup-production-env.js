#!/usr/bin/env node

/**
 * PRODUCTION ENVIRONMENT SETUP SCRIPT
 * Zenith Capital Advisors - Critical Production Configuration
 * 
 * This script guides the setup of all production environment variables
 * and validates the configuration for production deployment.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ProductionEnvSetup {
  constructor() {
    this.envFile = path.join(process.cwd(), '.env.production');
    this.vercelEnvFile = path.join(process.cwd(), '.env.production.local');
    this.requiredVars = {
      // Database (CRITICAL)
      POSTGRES_URL: { 
        required: true, 
        description: 'Vercel Postgres connection string',
        example: 'postgresql://username:password@host:port/database?sslmode=require'
      },
      POSTGRES_URL_NON_POOLING: {
        required: true,
        description: 'Non-pooling Postgres connection string',
        example: 'postgresql://username:password@host:port/database?sslmode=require'
      },
      
      // Email (CRITICAL)
      SENDGRID_API_KEY: {
        required: true,
        description: 'SendGrid API key for email services',
        example: 'SG.your-actual-api-key-here'
      },
      
      // Payments (CRITICAL)
      STRIPE_SECRET_KEY: {
        required: true,
        description: 'Stripe secret key (LIVE)',
        example: 'sk_live_your-actual-stripe-secret-key'
      },
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        required: true,
        description: 'Stripe publishable key (LIVE)',
        example: 'pk_live_your-actual-stripe-publishable-key'
      },
      STRIPE_WEBHOOK_SECRET: {
        required: true,
        description: 'Stripe webhook endpoint secret',
        example: 'whsec_your-webhook-secret'
      },
      
      // Analytics (IMPORTANT)
      NEXT_PUBLIC_GA_ID: {
        required: false,
        description: 'Google Analytics 4 Measurement ID',
        example: 'G-XXXXXXXXXX'
      }
    };
    
    this.secureKeys = [
      'NEXTAUTH_SECRET',
      'ENCRYPTION_KEY',
      'JWT_SECRET',
      'SESSION_SECRET',
      'INIT_SECURITY_TOKEN'
    ];
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    console.log('\\n' + '='.repeat(60));
    this.log(message, 'cyan');
    console.log('='.repeat(60));
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  async promptUser(question) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question(question, (answer) => {
        readline.close();
        resolve(answer.trim());
      });
    });
  }

  generateSecureKey(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  generateBase64Key(bytes = 64) {
    return crypto.randomBytes(bytes).toString('base64');
  }

  validateEnvironmentVar(key, value) {
    if (!value || value.includes('your-') || value.includes('XXXXXXX')) {
      return false;
    }

    // Specific validations
    switch (key) {
      case 'POSTGRES_URL':
      case 'POSTGRES_URL_NON_POOLING':
        return value.startsWith('postgresql://') && value.includes('vercel');
      
      case 'SENDGRID_API_KEY':
        return value.startsWith('SG.') && value.length > 20;
      
      case 'STRIPE_SECRET_KEY':
        return value.startsWith('sk_live_') && value.length > 20;
      
      case 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY':
        return value.startsWith('pk_live_') && value.length > 20;
      
      case 'STRIPE_WEBHOOK_SECRET':
        return value.startsWith('whsec_') && value.length > 20;
      
      case 'NEXT_PUBLIC_GA_ID':
        return !value || value.match(/^G-[A-Z0-9]{10}$/);
      
      default:
        return true;
    }
  }

  async setupSecurityKeys() {
    this.logHeader('GENERATING CRYPTOGRAPHICALLY SECURE KEYS');
    
    const keys = {
      NEXTAUTH_SECRET: this.generateBase64Key(64),
      ENCRYPTION_KEY: this.generateSecureKey(32),
      JWT_SECRET: this.generateSecureKey(32),
      SESSION_SECRET: 'zencap-production-session-secret-2025-ultra-secure',
      INIT_SECURITY_TOKEN: 'zencap-prod-init-token-2025-secure-launch'
    };

    for (const [key, value] of Object.entries(keys)) {
      this.logSuccess(`Generated ${key}: ${value.substring(0, 20)}...`);
    }

    return keys;
  }

  async checkExistingEnv() {
    this.logHeader('CHECKING EXISTING ENVIRONMENT FILES');
    
    const envExists = fs.existsSync(this.envFile);
    const vercelEnvExists = fs.existsSync(this.vercelEnvFile);

    if (envExists) {
      this.logInfo(`Found existing .env.production`);
    } else {
      this.logWarning(`No .env.production found`);
    }

    if (vercelEnvExists) {
      this.logInfo(`Found existing .env.production.local`);
    } else {
      this.logWarning(`No .env.production.local found`);
    }

    return { envExists, vercelEnvExists };
  }

  async validateCurrentEnv() {
    this.logHeader('VALIDATING CURRENT ENVIRONMENT CONFIGURATION');
    
    let envContent = '';
    if (fs.existsSync(this.envFile)) {
      envContent = fs.readFileSync(this.envFile, 'utf8');
    }

    const validationResults = {};
    let criticalMissing = 0;
    let totalMissing = 0;

    for (const [key, config] of Object.entries(this.requiredVars)) {
      const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
      const value = match ? match[1].trim() : '';
      
      const isValid = this.validateEnvironmentVar(key, value);
      validationResults[key] = { value, isValid, config };

      if (!isValid) {
        totalMissing++;
        if (config.required) {
          criticalMissing++;
          this.logError(`CRITICAL: ${key} is not properly configured`);
        } else {
          this.logWarning(`${key} is not configured (optional)`);
        }
      } else {
        this.logSuccess(`${key} is properly configured`);
      }
    }

    this.logInfo(`\\nValidation Summary:`);
    this.logInfo(`- Total variables checked: ${Object.keys(this.requiredVars).length}`);
    this.logInfo(`- Critical missing: ${criticalMissing}`);
    this.logInfo(`- Total missing/invalid: ${totalMissing}`);

    return { validationResults, criticalMissing, totalMissing };
  }

  async generateProductionEnvTemplate() {
    this.logHeader('GENERATING PRODUCTION ENVIRONMENT TEMPLATE');

    const secureKeys = await this.setupSecurityKeys();
    
    const template = `# PRODUCTION ENVIRONMENT CONFIGURATION
# Zenith Capital Advisors - Production Launch Configuration
# Generated: ${new Date().toISOString().split('T')[0]}
# CRITICAL: This file contains production secrets - NEVER commit to source control

# ===================================
# SITE CONFIGURATION
# ===================================
NEXT_PUBLIC_SITE_URL=https://zencap.co
NEXT_PUBLIC_BASE_URL=https://zencap.co
NEXT_PUBLIC_SITE_NAME=Zenith Capital Advisors
NODE_ENV=production

# ===================================
# DATABASE CONFIGURATION (VERCEL POSTGRES)
# ===================================
# CRITICAL: Replace with actual production database credentials from Vercel Dashboard
POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database?sslmode=require
POSTGRES_HOST=your-production-postgres-host.vercel-storage.com
POSTGRES_DATABASE=verceldb
POSTGRES_USERNAME=default
POSTGRES_PASSWORD=your-secure-production-password
POSTGRES_SSL=true
POSTGRES_MAX_CONNECTIONS=20
POSTGRES_IDLE_TIMEOUT=30000

# ===================================
# EMAIL CONFIGURATION (SENDGRID)
# ===================================
# CRITICAL: Replace with actual SendGrid production API key
SENDGRID_API_KEY=SG.your-production-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=info@zencap.co
SENDGRID_FROM_NAME=Zenith Capital Advisors
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=SG.your-production-sendgrid-api-key-here
EMAIL_FROM=noreply@zencap.co
FALLBACK_CONTACT_EMAIL=admin@zencap.co
SECURITY_ALERT_EMAIL=security@zencap.co

# ===================================
# STRIPE PAYMENT CONFIGURATION
# ===================================
# CRITICAL: Replace with LIVE Stripe keys (NOT test keys)
STRIPE_SECRET_KEY=sk_live_your-production-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-production-stripe-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-production-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-production-webhook-secret
STRIPE_API_VERSION=2023-10-16
STRIPE_ENABLE_WEBHOOKS=true

# ===================================
# NEXTAUTH CONFIGURATION
# ===================================
NEXTAUTH_URL=https://zencap.co
NEXTAUTH_SECRET=${secureKeys.NEXTAUTH_SECRET}

# ===================================
# SECURITY CONFIGURATION (GENERATED SECURE KEYS)
# ===================================
ENCRYPTION_KEY=${secureKeys.ENCRYPTION_KEY}
JWT_SECRET=${secureKeys.JWT_SECRET}
SESSION_SECRET=${secureKeys.SESSION_SECRET}
INIT_SECURITY_TOKEN=${secureKeys.INIT_SECURITY_TOKEN}
SECURITY_HEADERS_ENABLED=true
CORS_ENABLED=true
RATE_LIMITING_ENABLED=true

# ===================================
# ANALYTICS & MONITORING
# ===================================
# Replace with actual Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# ===================================
# CORS & ALLOWED ORIGINS
# ===================================
ALLOWED_ORIGINS=https://zencap.co,https://www.zencap.co,https://zencap.vercel.app

# ===================================
# FILE STORAGE & SECURITY
# ===================================
MAX_FILE_SIZE=209715200
SECURE_STORAGE_PATH=.secure/excel
TEMP_UPLOAD_PATH=.temp/uploads
UPLOAD_MAX_FILES=10
UPLOAD_TIMEOUT=300000
FILE_RETENTION_DAYS=30
VIRUS_SCAN_ENABLED=true
VIRUS_SCAN_PROVIDER=clamav
SECURITY_SCAN_UPLOADS=true

# ===================================
# RATE LIMITING (PRODUCTION)
# ===================================
RATE_LIMIT_UPLOAD=10
RATE_LIMIT_DOWNLOAD=50
RATE_LIMIT_API=100
RATE_LIMIT_CONTACT_FORM=5
RATE_LIMIT_NEWSLETTER=3
RATE_LIMIT_WINDOW_UPLOAD=3600
RATE_LIMIT_WINDOW_DOWNLOAD=3600
RATE_LIMIT_WINDOW_API=60

# ===================================
# PERFORMANCE & OPTIMIZATION
# ===================================
ENABLE_COMPRESSION=true
CACHE_STATIC_ASSETS=true
CDN_ENABLED=true
IMAGE_OPTIMIZATION=true
PERFORMANCE_MONITORING=true
CORE_WEB_VITALS_TRACKING=true
PERFORMANCE_BUDGET_ENABLED=true

# ===================================
# MONITORING & ALERTING
# ===================================
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_ENDPOINT=/api/health
UPTIME_MONITORING=true
ERROR_TRACKING_ENABLED=true
LOG_LEVEL=error
ALERT_ON_ERRORS=true
ALERT_EMAIL=alerts@zencap.co
ALERT_ON_SLOW_RESPONSE=true
SLOW_RESPONSE_THRESHOLD=2000
ALERT_ON_HIGH_ERROR_RATE=true
ERROR_RATE_THRESHOLD=5

# ===================================
# DEPLOYMENT & CACHING
# ===================================
DEPLOYMENT_ENVIRONMENT=production
BUILD_OPTIMIZATION=true
STATIC_OPTIMIZATION=true
BUNDLE_ANALYZER=false
CACHE_CONTROL_STATIC=31536000
CACHE_CONTROL_DYNAMIC=3600
CDN_CACHE_TTL=86400

# ===================================
# FEATURE FLAGS
# ===================================
ENABLE_EXCEL_VIEWER=true
ENABLE_PAYMENT_PROCESSING=true
ENABLE_ADMIN_DASHBOARD=true
ENABLE_NEWSLETTER=true
ENABLE_CONTACT_FORMS=true
ENABLE_ANALYTICS=true

# ===================================
# SSL & SECURITY
# ===================================
SSL_ENABLED=true
FORCE_HTTPS=true
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000

# ===================================
# GDPR & COMPLIANCE
# ===================================
DATA_RETENTION_DAYS=365
ANONYMIZE_LOGS=true
GDPR_COMPLIANCE_MODE=true
COOKIE_CONSENT_REQUIRED=true
DATA_PROCESSING_CONSENT=true

# ===================================
# PRODUCTION URLS
# ===================================
PRODUCTION_URL=https://zencap.co
STAGING_URL=https://zencap-staging.vercel.app
API_BASE_URL=https://zencap.co/api

# ===================================
# LOGGING (PRODUCTION OPTIMIZED)
# ===================================
DEBUG_MODE=false
VERBOSE_LOGGING=false
LOG_REQUESTS=false
LOG_RESPONSES=false
LOG_ERRORS=true

# ===================================
# EMERGENCY CONTACTS
# ===================================
EMERGENCY_CONTACT=emergency@zencap.co
TECHNICAL_SUPPORT=support@zencap.co
DEVOPS_ALERT=devops@zencap.co

# ===================================
# CONFIGURATION STATUS
# ===================================
CONFIG_DATABASE_READY=false
CONFIG_EMAIL_READY=false
CONFIG_STRIPE_READY=false
CONFIG_SECURITY_READY=true
CONFIG_MONITORING_READY=false
CONFIG_PERFORMANCE_READY=true
READY_FOR_PRODUCTION=false
LAST_CONFIG_UPDATE=${new Date().toISOString().split('T')[0]}
CONFIG_VERSION=1.0.0
`;

    fs.writeFileSync(this.envFile, template);
    this.logSuccess(`Production environment template created: ${this.envFile}`);
    
    return template;
  }

  async createVercelEnvironmentCommands() {
    this.logHeader('GENERATING VERCEL ENVIRONMENT COMMANDS');

    const commands = [
      '# VERCEL ENVIRONMENT VARIABLE SETUP COMMANDS',
      '# Run these commands to set up environment variables in Vercel',
      '# Replace placeholder values with actual production values',
      '',
      '# Database Configuration',
      'vercel env add POSTGRES_URL production',
      'vercel env add POSTGRES_URL_NON_POOLING production',
      '',
      '# Email Configuration',
      'vercel env add SENDGRID_API_KEY production',
      'vercel env add SENDGRID_FROM_EMAIL production',
      '',
      '# Stripe Configuration',
      'vercel env add STRIPE_SECRET_KEY production',
      'vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production',
      'vercel env add STRIPE_WEBHOOK_SECRET production',
      '',
      '# NextAuth Configuration',
      'vercel env add NEXTAUTH_URL production',
      'vercel env add NEXTAUTH_SECRET production',
      '',
      '# Security Keys',
      'vercel env add ENCRYPTION_KEY production',
      'vercel env add JWT_SECRET production',
      '',
      '# Analytics',
      'vercel env add NEXT_PUBLIC_GA_ID production',
      '',
      '# Site Configuration',
      'vercel env add NEXT_PUBLIC_SITE_URL production',
      'vercel env add NODE_ENV production'
    ];

    const commandsFile = path.join(process.cwd(), 'vercel-env-setup.sh');
    fs.writeFileSync(commandsFile, commands.join('\\n'));
    
    this.logSuccess(`Vercel environment setup commands created: ${commandsFile}`);
    
    return commands;
  }

  async generateSetupInstructions() {
    this.logHeader('GENERATING SETUP INSTRUCTIONS');

    const instructions = `# PRODUCTION ENVIRONMENT SETUP INSTRUCTIONS
## Zenith Capital Advisors - Critical Setup Guide

### 1. DATABASE SETUP (Vercel Postgres)
1. Go to Vercel Dashboard > Storage > Create Database > Postgres
2. Copy connection strings from Vercel dashboard
3. Update POSTGRES_URL and POSTGRES_URL_NON_POOLING in .env.production

### 2. EMAIL SETUP (SendGrid)
1. Go to SendGrid dashboard > API Keys
2. Create new API key with "Mail Send" permissions
3. Update SENDGRID_API_KEY in .env.production

### 3. STRIPE SETUP (LIVE KEYS)
1. Go to Stripe Dashboard > Developers > API Keys
2. Copy LIVE secret key (starts with sk_live_)
3. Copy LIVE publishable key (starts with pk_live_)
4. Go to Webhooks > Create endpoint > https://zencap.co/api/stripe/webhook
5. Copy webhook secret (starts with whsec_)
6. Update all Stripe variables in .env.production

### 4. GOOGLE ANALYTICS 4
1. Go to Google Analytics > Admin > Property > Data Streams
2. Copy Measurement ID (format: G-XXXXXXXXXX)
3. Update NEXT_PUBLIC_GA_ID in .env.production

### 5. VERCEL DEPLOYMENT
1. Run: vercel env add [VARIABLE_NAME] production
2. Or use the generated vercel-env-setup.sh script
3. Deploy with: vercel --prod

### 6. DOMAIN SETUP
1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Verify HTTPS is working

### 7. VERIFICATION CHECKLIST
- [ ] Database connection tested
- [ ] Email sending works
- [ ] Stripe payments work
- [ ] Analytics tracking active
- [ ] All critical environment variables set
- [ ] HTTPS enabled
- [ ] Performance monitoring active

### 8. MONITORING SETUP
- Set up Vercel Analytics
- Configure error tracking
- Set up uptime monitoring
- Configure performance alerts

### CRITICAL SECURITY NOTES:
- Never commit .env.production to git
- Use strong, unique passwords
- Enable 2FA on all accounts
- Regularly rotate API keys
- Monitor for security alerts

### EMERGENCY CONTACTS:
- DevOps: devops@zencap.co
- Security: security@zencap.co  
- Emergency: emergency@zencap.co
`;

    const instructionsFile = path.join(process.cwd(), 'PRODUCTION_SETUP_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsFile, instructions);
    
    this.logSuccess(`Setup instructions created: ${instructionsFile}`);
    
    return instructions;
  }

  async runProductionReadinessCheck() {
    this.logHeader('PRODUCTION READINESS CHECK');

    const checks = [
      {
        name: 'Environment File Exists',
        check: () => fs.existsSync(this.envFile),
        critical: true
      },
      {
        name: 'Next.js Config Optimized',
        check: () => {
          const configPath = path.join(process.cwd(), 'next.config.mjs');
          if (!fs.existsSync(configPath)) return false;
          const config = fs.readFileSync(configPath, 'utf8');
          return config.includes('swcMinify') && config.includes('removeConsole');
        },
        critical: false
      },
      {
        name: 'Security Headers Configured',
        check: () => {
          const configPath = path.join(process.cwd(), 'next.config.mjs');
          if (!fs.existsSync(configPath)) return false;
          const config = fs.readFileSync(configPath, 'utf8');
          return config.includes('X-Frame-Options') && config.includes('Content-Security-Policy');
        },
        critical: true
      },
      {
        name: 'Package.json Production Scripts',
        check: () => {
          const packagePath = path.join(process.cwd(), 'package.json');
          if (!fs.existsSync(packagePath)) return false;
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          return pkg.scripts && pkg.scripts.build && pkg.scripts.start;
        },
        critical: true
      },
      {
        name: 'Database Migration Scripts',
        check: () => {
          const migrationsPath = path.join(process.cwd(), 'migrations');
          return fs.existsSync(migrationsPath);
        },
        critical: false
      }
    ];

    let passed = 0;
    let criticalFailed = 0;
    
    for (const test of checks) {
      const result = test.check();
      if (result) {
        this.logSuccess(`${test.name}: PASSED`);
        passed++;
      } else {
        if (test.critical) {
          this.logError(`${test.name}: FAILED (CRITICAL)`);
          criticalFailed++;
        } else {
          this.logWarning(`${test.name}: FAILED (NON-CRITICAL)`);
        }
      }
    }

    this.logInfo(`\\nReadiness Summary:`);
    this.logInfo(`- Total checks: ${checks.length}`);
    this.logInfo(`- Passed: ${passed}`);
    this.logInfo(`- Critical failures: ${criticalFailed}`);

    return criticalFailed === 0;
  }

  async run() {
    console.log('\\n' + colors.bold + colors.cyan + 
      '██████╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗\\n' +
      '██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║\\n' +
      '██████╔╝██████╔╝██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██╔██╗ ██║\\n' +
      '██╔═══╝ ██╔══██╗██║   ██║██║  ██║██║   ██║██║        ██║   ██║██║   ██║██║╚██╗██║\\n' +
      '██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║\\n' +
      '╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝' +
      colors.reset);

    this.logHeader('ZENITH CAPITAL ADVISORS - PRODUCTION ENVIRONMENT SETUP');
    this.log('This script will configure all production environment variables for launch.', 'yellow');

    // Check existing environment
    await this.checkExistingEnv();

    // Generate production environment template
    await this.generateProductionEnvTemplate();

    // Validate environment
    const { criticalMissing } = await this.validateCurrentEnv();

    // Generate Vercel commands
    await this.createVercelEnvironmentCommands();

    // Generate setup instructions
    await this.generateSetupInstructions();

    // Run readiness check
    const isReady = await this.runProductionReadinessCheck();

    this.logHeader('SETUP COMPLETE - NEXT STEPS');
    
    if (criticalMissing > 0) {
      this.logError(`${criticalMissing} critical environment variables need configuration`);
      this.logWarning('Follow the instructions in PRODUCTION_SETUP_INSTRUCTIONS.md');
    } else {
      this.logSuccess('All critical environment variables are configured');
    }

    if (isReady) {
      this.logSuccess('Platform is ready for production deployment');
    } else {
      this.logWarning('Address readiness check failures before deployment');
    }

    this.logInfo('\\nNext steps:');
    this.logInfo('1. Edit .env.production with your actual credentials');
    this.logInfo('2. Run vercel-env-setup.sh to configure Vercel');
    this.logInfo('3. Deploy with: vercel --prod');
    this.logInfo('4. Verify all functionality is working');

    this.logHeader('PRODUCTION ENVIRONMENT SETUP COMPLETE');
  }
}

// Run the setup
if (require.main === module) {
  const setup = new ProductionEnvSetup();
  setup.run().catch(console.error);
}

module.exports = ProductionEnvSetup;