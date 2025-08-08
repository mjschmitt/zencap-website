#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT SCRIPT
 * Zenith Capital Advisors - Production Deployment Automation
 * 
 * This script automates the deployment process to Vercel with proper
 * environment variable configuration and health checks.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VercelDeploymentManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.envFile = path.join(this.projectRoot, '.env.production');
    this.packageJson = path.join(this.projectRoot, 'package.json');
    
    this.requiredEnvVars = [
      'POSTGRES_URL',
      'POSTGRES_URL_NON_POOLING',
      'SENDGRID_API_KEY',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXTAUTH_SECRET'
    ];

    this.optionalEnvVars = [
      'NEXT_PUBLIC_GA_ID',
      'SENDGRID_FROM_EMAIL',
      'NEXT_PUBLIC_SITE_URL'
    ];
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

    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  logHeader(message) {
    console.log('\\n' + '='.repeat(80));
    console.log(`\\x1b[1m\\x1b[35m${message}\\x1b[0m`);
    console.log('='.repeat(80));
  }

  execCommand(command, description) {
    this.log(`Executing: ${description}`, 'info');
    try {
      const result = execSync(command, { 
        stdio: 'pipe', 
        encoding: 'utf8',
        cwd: this.projectRoot
      });
      this.log(`✓ ${description} completed`, 'success');
      return result.trim();
    } catch (error) {
      this.log(`✗ ${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  checkVercelCLI() {
    this.logHeader('CHECKING VERCEL CLI');
    
    try {
      const version = this.execCommand('vercel --version', 'Check Vercel CLI version');
      this.log(`Vercel CLI version: ${version}`, 'success');
      return true;
    } catch (error) {
      this.log('Vercel CLI not found. Installing...', 'warning');
      try {
        this.execCommand('npm install -g vercel', 'Install Vercel CLI globally');
        return true;
      } catch (installError) {
        this.log('Failed to install Vercel CLI. Please install manually: npm install -g vercel', 'error');
        return false;
      }
    }
  }

  loadEnvironmentVariables() {
    this.logHeader('LOADING ENVIRONMENT VARIABLES');
    
    const env = {};
    
    if (!fs.existsSync(this.envFile)) {
      this.log('No .env.production file found', 'error');
      return null;
    }

    const envContent = fs.readFileSync(this.envFile, 'utf8');
    const lines = envContent.split('\\n');

    for (const line of lines) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const key = match[1];
        const value = match[2].trim();
        
        // Remove quotes if present
        env[key] = value.replace(/^["']|["']$/g, '');
      }
    }

    this.log(`Loaded ${Object.keys(env).length} environment variables`, 'success');
    return env;
  }

  validateEnvironmentVariables(env) {
    this.logHeader('VALIDATING ENVIRONMENT VARIABLES');
    
    const missing = [];
    const invalid = [];
    
    for (const varName of this.requiredEnvVars) {
      if (!env[varName]) {
        missing.push(varName);
      } else {
        // Validate specific variables
        if (varName === 'POSTGRES_URL' || varName === 'POSTGRES_URL_NON_POOLING') {
          if (!env[varName].startsWith('postgresql://')) {
            invalid.push({ var: varName, reason: 'Must start with postgresql://' });
          }
        }
        
        if (varName === 'SENDGRID_API_KEY') {
          if (!env[varName].startsWith('SG.')) {
            invalid.push({ var: varName, reason: 'Must start with SG.' });
          }
        }
        
        if (varName === 'STRIPE_SECRET_KEY') {
          if (!env[varName].startsWith('sk_live_')) {
            invalid.push({ var: varName, reason: 'Must be a LIVE key (sk_live_)' });
          }
        }
        
        if (varName === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') {
          if (!env[varName].startsWith('pk_live_')) {
            invalid.push({ var: varName, reason: 'Must be a LIVE key (pk_live_)' });
          }
        }
      }
    }

    if (missing.length > 0) {
      this.log(`Missing required variables: ${missing.join(', ')}`, 'error');
    }

    if (invalid.length > 0) {
      this.log('Invalid variables:', 'error');
      for (const inv of invalid) {
        this.log(`  ${inv.var}: ${inv.reason}`, 'error');
      }
    }

    const isValid = missing.length === 0 && invalid.length === 0;
    
    if (isValid) {
      this.log('All required environment variables are valid', 'success');
    }

    return {
      isValid,
      missing,
      invalid
    };
  }

  async setVercelEnvironmentVariables(env) {
    this.logHeader('SETTING VERCEL ENVIRONMENT VARIABLES');
    
    const envVarsToSet = [
      ...this.requiredEnvVars,
      ...this.optionalEnvVars.filter(key => env[key])
    ];

    const results = [];
    
    for (const varName of envVarsToSet) {
      if (!env[varName]) continue;
      
      try {
        // Check if variable already exists
        let existingVars;
        try {
          const envListOutput = this.execCommand('vercel env ls', 'List existing environment variables');
          existingVars = envListOutput.includes(varName);
        } catch (e) {
          existingVars = false;
        }

        if (existingVars) {
          this.log(`Environment variable ${varName} already exists, removing first...`, 'warning');
          try {
            this.execCommand(`echo "y" | vercel env rm ${varName} production`, `Remove existing ${varName}`);
          } catch (e) {
            // Continue even if removal fails
          }
        }

        // Set the environment variable
        const command = `echo "${env[varName]}" | vercel env add ${varName} production`;
        this.execCommand(command, `Set ${varName}`);
        
        results.push({ var: varName, status: 'success' });
        this.log(`✓ Set ${varName}`, 'success');
        
      } catch (error) {
        results.push({ var: varName, status: 'failed', error: error.message });
        this.log(`✗ Failed to set ${varName}: ${error.message}`, 'error');
      }
    }

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    this.log(`Environment variables set: ${successful} successful, ${failed} failed`, 
      failed === 0 ? 'success' : 'warning');
    
    return results;
  }

  runPreDeploymentChecks() {
    this.logHeader('RUNNING PRE-DEPLOYMENT CHECKS');
    
    const checks = [
      {
        name: 'Package.json exists',
        check: () => fs.existsSync(this.packageJson)
      },
      {
        name: 'Build script exists',
        check: () => {
          const pkg = JSON.parse(fs.readFileSync(this.packageJson, 'utf8'));
          return pkg.scripts && pkg.scripts.build;
        }
      },
      {
        name: 'Next.js config exists',
        check: () => fs.existsSync(path.join(this.projectRoot, 'next.config.mjs'))
      },
      {
        name: 'No critical errors in code',
        check: () => {
          try {
            this.execCommand('npm run lint --silent', 'Run ESLint check');
            return true;
          } catch (e) {
            return false;
          }
        }
      }
    ];

    let passed = 0;
    for (const check of checks) {
      try {
        const result = check.check();
        if (result) {
          this.log(`✓ ${check.name}`, 'success');
          passed++;
        } else {
          this.log(`✗ ${check.name}`, 'error');
        }
      } catch (error) {
        this.log(`✗ ${check.name}: ${error.message}`, 'error');
      }
    }

    const allPassed = passed === checks.length;
    this.log(`Pre-deployment checks: ${passed}/${checks.length} passed`, 
      allPassed ? 'success' : 'warning');
    
    return allPassed;
  }

  deployToProduction() {
    this.logHeader('DEPLOYING TO PRODUCTION');
    
    try {
      // Build the application
      this.execCommand('npm run build', 'Build application for production');
      
      // Deploy to Vercel
      const deployResult = this.execCommand('vercel --prod --yes', 'Deploy to Vercel production');
      
      // Extract deployment URL from result
      const urlMatch = deployResult.match(/https:\\/\\/[^\\s]+/);
      const deploymentUrl = urlMatch ? urlMatch[0] : 'https://zencap.co';
      
      this.log(`Deployment successful: ${deploymentUrl}`, 'success');
      
      return {
        success: true,
        url: deploymentUrl
      };
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runPostDeploymentVerification(deploymentUrl) {
    this.logHeader('RUNNING POST-DEPLOYMENT VERIFICATION');
    
    // Wait a moment for deployment to be fully ready
    this.log('Waiting for deployment to be ready...', 'info');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const checks = [
      {
        name: 'Homepage loads',
        url: deploymentUrl,
        timeout: 10000
      },
      {
        name: 'API health check',
        url: `${deploymentUrl}/api/health`,
        timeout: 5000
      },
      {
        name: 'Database connection',
        url: `${deploymentUrl}/api/verify-database`,
        timeout: 8000
      }
    ];

    const results = [];
    
    for (const check of checks) {
      try {
        const response = await this.makeHttpRequest(check.url, { timeout: check.timeout });
        
        if (response.statusCode >= 200 && response.statusCode < 400) {
          this.log(`✓ ${check.name}: OK (${response.responseTime}ms)`, 'success');
          results.push({ check: check.name, status: 'passed', responseTime: response.responseTime });
        } else {
          this.log(`✗ ${check.name}: HTTP ${response.statusCode}`, 'error');
          results.push({ check: check.name, status: 'failed', statusCode: response.statusCode });
        }
      } catch (error) {
        this.log(`✗ ${check.name}: ${error.message}`, 'error');
        results.push({ check: check.name, status: 'error', error: error.message });
      }
    }

    const passed = results.filter(r => r.status === 'passed').length;
    const total = results.length;
    
    this.log(`Post-deployment verification: ${passed}/${total} checks passed`, 
      passed === total ? 'success' : 'warning');
    
    return results;
  }

  makeHttpRequest(url, options = {}) {
    const https = require('https');
    const http = require('http');
    
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const startTime = Date.now();
      
      const req = client.request({
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: options.timeout || 5000,
        headers: {
          'User-Agent': 'ZenCap-Deployment-Verifier/1.0'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          responseTime
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

  async run() {
    console.log('\\n\\x1b[1m\\x1b[36m' +
      '██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗\\n' +
      '██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝\\n' +
      '██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ \\n' +
      '██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  \\n' +
      '██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   \\n' +
      '╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ' +
      '\\x1b[0m\\n');

    this.logHeader('ZENITH CAPITAL ADVISORS - VERCEL DEPLOYMENT');
    
    try {
      // Step 1: Check Vercel CLI
      const hasVercel = this.checkVercelCLI();
      if (!hasVercel) {
        throw new Error('Vercel CLI is required for deployment');
      }

      // Step 2: Load environment variables
      const env = this.loadEnvironmentVariables();
      if (!env) {
        throw new Error('Could not load environment variables');
      }

      // Step 3: Validate environment variables
      const validation = this.validateEnvironmentVariables(env);
      if (!validation.isValid) {
        throw new Error('Environment validation failed');
      }

      // Step 4: Set Vercel environment variables
      await this.setVercelEnvironmentVariables(env);

      // Step 5: Run pre-deployment checks
      const preChecksPassed = this.runPreDeploymentChecks();
      if (!preChecksPassed) {
        this.log('Pre-deployment checks failed, but continuing...', 'warning');
      }

      // Step 6: Deploy to production
      const deployment = this.deployToProduction();
      if (!deployment.success) {
        throw new Error(`Deployment failed: ${deployment.error}`);
      }

      // Step 7: Run post-deployment verification
      await this.runPostDeploymentVerification(deployment.url);

      this.logHeader('DEPLOYMENT COMPLETE');
      this.log(`🚀 Production deployment successful!`, 'success');
      this.log(`🌐 Live URL: ${deployment.url}`, 'success');
      this.log(`📊 Monitor at: https://vercel.com/dashboard`, 'info');
      
      return true;

    } catch (error) {
      this.logHeader('DEPLOYMENT FAILED');
      this.log(`❌ ${error.message}`, 'error');
      
      this.log('\\nTroubleshooting:', 'info');
      this.log('1. Ensure all environment variables are properly set', 'info');
      this.log('2. Check Vercel dashboard for detailed error logs', 'info');
      this.log('3. Verify database and external service connections', 'info');
      
      return false;
    }
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new VercelDeploymentManager();
  deployer.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Deployment error:', error);
    process.exit(1);
  });
}

module.exports = VercelDeploymentManager;