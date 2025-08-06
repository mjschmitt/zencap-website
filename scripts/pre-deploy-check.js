#!/usr/bin/env node

/**
 * Pre-deployment readiness check
 * Validates environment and dependencies before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreDeploymentChecker {
  constructor() {
    this.checks = [];
    this.failures = [];
    this.warnings = [];
  }

  addCheck(name, checkFunction, isWarning = false) {
    this.checks.push({
      name,
      checkFunction,
      isWarning
    });
  }

  async runCheck(check) {
    try {
      const result = await check.checkFunction();
      if (result === true || result?.success === true) {
        console.log(`✅ ${check.name}`);
        return true;
      } else {
        const message = typeof result === 'string' ? result : result?.message || 'Check failed';
        if (check.isWarning) {
          console.log(`⚠️  ${check.name}: ${message}`);
          this.warnings.push(`${check.name}: ${message}`);
          return true;
        } else {
          console.log(`❌ ${check.name}: ${message}`);
          this.failures.push(`${check.name}: ${message}`);
          return false;
        }
      }
    } catch (error) {
      const message = error.message || 'Unknown error';
      if (check.isWarning) {
        console.log(`⚠️  ${check.name}: ${message}`);
        this.warnings.push(`${check.name}: ${message}`);
        return true;
      } else {
        console.log(`❌ ${check.name}: ${message}`);
        this.failures.push(`${check.name}: ${message}`);
        return false;
      }
    }
  }

  async run() {
    console.log('🚀 Running pre-deployment checks...\n');
    
    let allPassed = true;
    
    for (const check of this.checks) {
      const result = await this.runCheck(check);
      if (!result && !check.isWarning) {
        allPassed = false;
      }
    }

    console.log('\n' + '='.repeat(50));
    
    if (allPassed) {
      console.log('✅ All checks passed! Ready for deployment.');
      if (this.warnings.length > 0) {
        console.log(`⚠️  ${this.warnings.length} warnings to review:`);
        this.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
    } else {
      console.log('❌ Some checks failed. Fix issues before deployment:');
      this.failures.forEach(failure => console.log(`   - ${failure}`));
    }
    
    console.log('='.repeat(50));
    
    return allPassed;
  }
}

// Initialize checker and add checks
const checker = new PreDeploymentChecker();

// Environment file check
checker.addCheck('Environment file exists', () => {
  return fs.existsSync('.env.local') || fs.existsSync('.env');
});

// Required environment variables
checker.addCheck('Required environment variables', () => {
  const required = ['POSTGRES_URL', 'SENDGRID_API_KEY'];
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    return `Missing required variables: ${missing.join(', ')}`;
  }
  return true;
});

// Build test
checker.addCheck('Build test', () => {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return 'Build failed';
  }
});

// Lint check
checker.addCheck('Linting', () => {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return 'Linting errors found';
  }
}, true); // Warning only

// Test check
checker.addCheck('Tests', () => {
  try {
    execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return 'Tests failed';
  }
}, true); // Warning only for now

// Package.json validation
checker.addCheck('Package.json validation', () => {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!pkg.name || !pkg.version) {
      return 'Package.json missing name or version';
    }
    return true;
  } catch (error) {
    return 'Invalid package.json';
  }
});

// Node modules check
checker.addCheck('Dependencies installed', () => {
  return fs.existsSync('node_modules') && fs.existsSync('package-lock.json');
});

// Vercel config check
checker.addCheck('Vercel configuration', () => {
  return fs.existsSync('vercel.json');
});

// Git status check
checker.addCheck('Git status', () => {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim().length > 0) {
      return 'Uncommitted changes detected';
    }
    return true;
  } catch (error) {
    return 'Git repository check failed';
  }
}, true); // Warning only

// Database connectivity (if possible)
checker.addCheck('Database connectivity', async () => {
  if (!process.env.POSTGRES_URL) {
    return 'No database URL configured';
  }
  
  try {
    const { getDbConnection } = require('../src/utils/database');
    const db = await getDbConnection();
    await db.query('SELECT 1');
    await db.end();
    return true;
  } catch (error) {
    return `Database connection failed: ${error.message}`;
  }
}, true); // Warning only

// Security check
checker.addCheck('Security configuration', () => {
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection'
  ];
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    const hasSecurityHeaders = vercelConfig.headers?.some(headerGroup =>
      headerGroup.headers?.some(header =>
        securityHeaders.includes(header.key)
      )
    );
    
    if (!hasSecurityHeaders) {
      return 'Security headers not configured in vercel.json';
    }
    return true;
  } catch (error) {
    return 'Could not verify security configuration';
  }
}, true); // Warning only

// File size check for large files
checker.addCheck('Large file check', () => {
  try {
    const result = execSync('find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*"', { encoding: 'utf8' });
    if (result.trim().length > 0) {
      return `Large files found: ${result.trim().split('\n').join(', ')}`;
    }
    return true;
  } catch (error) {
    return true; // Skip if find command not available
  }
}, true); // Warning only

// Run the checks
if (require.main === module) {
  checker.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Pre-deployment check failed:', error.message);
    process.exit(1);
  });
}

module.exports = PreDeploymentChecker;