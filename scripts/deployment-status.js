#!/usr/bin/env node

/**
 * Deployment Status Dashboard
 * Quick overview of deployment readiness and current status
 */

const { execSync } = require('child_process');
const fs = require('fs');

class DeploymentStatusDashboard {
  constructor() {
    this.status = {
      environment: this.checkEnvironment(),
      build: this.checkBuild(),
      git: this.checkGit(),
      deployment: this.checkDeployment()
    };
  }

  checkEnvironment() {
    const envFile = fs.existsSync('.env.local') || fs.existsSync('.env');
    const requiredVars = ['POSTGRES_URL', 'SENDGRID_API_KEY', 'STRIPE_SECRET_KEY'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    return {
      configFile: envFile,
      missingVars: missingVars,
      hasRequired: missingVars.length === 0,
      vercelToken: !!process.env.VERCEL_TOKEN
    };
  }

  checkBuild() {
    try {
      // Check if .next exists (recent build)
      const buildExists = fs.existsSync('.next');
      const buildTime = buildExists ? 
        fs.statSync('.next').mtime.toISOString() : null;
      
      return {
        exists: buildExists,
        timestamp: buildTime,
        age: buildExists ? 
          Math.floor((Date.now() - fs.statSync('.next').mtime) / (1000 * 60)) : null
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  checkGit() {
    try {
      const branch = execSync('git branch --show-current', { 
        encoding: 'utf8' 
      }).trim();
      
      const status = execSync('git status --porcelain', { 
        encoding: 'utf8' 
      }).trim();
      
      const lastCommit = execSync('git log -1 --format="%h %s (%cr)"', { 
        encoding: 'utf8' 
      }).trim();
      
      return {
        branch,
        hasChanges: status.length > 0,
        uncommittedFiles: status.split('\n').filter(line => line.trim()).length,
        lastCommit,
        isClean: status.length === 0
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  checkDeployment() {
    try {
      // Check if Vercel CLI is available
      execSync('vercel --version', { stdio: 'pipe' });
      
      // Try to get deployment info
      let currentDeployment = null;
      try {
        const deployments = execSync('vercel ls --token=' + (process.env.VERCEL_TOKEN || ''), { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        currentDeployment = deployments.split('\n')[1]; // Get first deployment
      } catch (deployError) {
        // Deployment info not available
      }
      
      return {
        vercelCliAvailable: true,
        hasToken: !!process.env.VERCEL_TOKEN,
        currentDeployment: currentDeployment ? currentDeployment.trim() : null
      };
    } catch (error) {
      return {
        vercelCliAvailable: false,
        error: error.message
      };
    }
  }

  getReadinessScore() {
    let score = 0;
    let maxScore = 0;

    // Environment (30 points)
    maxScore += 30;
    if (this.status.environment.configFile) score += 10;
    if (this.status.environment.hasRequired) score += 15;
    if (this.status.environment.vercelToken) score += 5;

    // Build (25 points)
    maxScore += 25;
    if (this.status.build.exists) {
      score += 15;
      if (this.status.build.age < 60) score += 10; // Fresh build
    }

    // Git (25 points)
    maxScore += 25;
    if (this.status.git.branch === 'master' || this.status.git.branch === 'main') score += 10;
    if (this.status.git.isClean) score += 15;

    // Deployment tools (20 points)
    maxScore += 20;
    if (this.status.deployment.vercelCliAvailable) score += 10;
    if (this.status.deployment.hasToken) score += 10;

    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100)
    };
  }

  display() {
    console.log('🚀 DEPLOYMENT STATUS DASHBOARD');
    console.log('=' .repeat(50));
    console.log();

    const readiness = this.getReadinessScore();
    const readinessEmoji = readiness.percentage >= 80 ? '✅' : 
                          readiness.percentage >= 60 ? '⚠️' : '❌';
    
    console.log(`${readinessEmoji} DEPLOYMENT READINESS: ${readiness.percentage}% (${readiness.score}/${readiness.maxScore})`);
    console.log();

    // Environment Status
    console.log('📋 ENVIRONMENT');
    console.log(`   Config File: ${this.status.environment.configFile ? '✅' : '❌'} ${this.status.environment.configFile ? '.env.local exists' : 'No .env.local found'}`);
    console.log(`   Required Vars: ${this.status.environment.hasRequired ? '✅' : '❌'} ${this.status.environment.missingVars.length === 0 ? 'All present' : `Missing: ${this.status.environment.missingVars.join(', ')}`}`);
    console.log(`   Vercel Token: ${this.status.environment.vercelToken ? '✅' : '❌'} ${this.status.environment.vercelToken ? 'Available' : 'Not set'}`);
    console.log();

    // Build Status
    console.log('🔨 BUILD STATUS');
    console.log(`   Build Exists: ${this.status.build.exists ? '✅' : '❌'} ${this.status.build.exists ? 'Ready' : 'Run npm run build'}`);
    if (this.status.build.exists && this.status.build.age !== null) {
      const freshness = this.status.build.age < 60 ? '✅ Fresh' : 
                       this.status.build.age < 240 ? '⚠️  Aging' : '❌ Old';
      console.log(`   Build Age: ${freshness} (${this.status.build.age} minutes old)`);
    }
    console.log();

    // Git Status
    console.log('📝 GIT STATUS');
    if (this.status.git.error) {
      console.log(`   Git Error: ❌ ${this.status.git.error}`);
    } else {
      console.log(`   Branch: ${this.status.git.branch === 'master' || this.status.git.branch === 'main' ? '✅' : '⚠️'} ${this.status.git.branch}`);
      console.log(`   Working Tree: ${this.status.git.isClean ? '✅ Clean' : `❌ ${this.status.git.uncommittedFiles} uncommitted files`}`);
      console.log(`   Last Commit: ${this.status.git.lastCommit}`);
    }
    console.log();

    // Deployment Tools
    console.log('🛠️  DEPLOYMENT TOOLS');
    console.log(`   Vercel CLI: ${this.status.deployment.vercelCliAvailable ? '✅ Available' : '❌ Not installed'}`);
    console.log(`   Auth Token: ${this.status.deployment.hasToken ? '✅ Set' : '❌ Missing'}`);
    if (this.status.deployment.currentDeployment) {
      console.log(`   Current Deploy: ${this.status.deployment.currentDeployment}`);
    }
    console.log();

    // Quick Actions
    console.log('⚡ QUICK ACTIONS');
    if (readiness.percentage < 80) {
      console.log('   🔧 Setup needed:');
      if (!this.status.environment.configFile) {
        console.log('      → Copy env.example to .env.local');
      }
      if (!this.status.environment.hasRequired) {
        console.log('      → Set required environment variables');
      }
      if (!this.status.build.exists) {
        console.log('      → Run: npm run build');
      }
      if (!this.status.git.isClean) {
        console.log('      → Commit your changes');
      }
      if (!this.status.deployment.vercelCliAvailable) {
        console.log('      → Install: npm install -g vercel');
      }
      if (!this.status.deployment.hasToken) {
        console.log('      → Set: export VERCEL_TOKEN=your_token');
      }
    } else {
      console.log('   🚀 Ready to deploy:');
      console.log('      → npm run deploy:staging');
      console.log('      → npm run deploy:production');
      console.log('      → npm run monitor');
    }

    console.log();
    console.log('=' .repeat(50));
    
    return readiness.percentage >= 80;
  }
}

// CLI usage
if (require.main === module) {
  const dashboard = new DeploymentStatusDashboard();
  const ready = dashboard.display();
  process.exit(ready ? 0 : 1);
}

module.exports = DeploymentStatusDashboard;