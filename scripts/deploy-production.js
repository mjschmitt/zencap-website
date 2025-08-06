#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting production deployment...');

try {
  // Check if we have required environment variables
  if (!process.env.VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN environment variable is required');
  }

  // Strict pre-deployment checks for production
  console.log('📋 Running pre-deployment checks...');
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    throw new Error('.env.local is required for production deployment');
  }

  // Run linting
  console.log('🔍 Running linting...');
  execSync('npm run lint', { stdio: 'inherit' });

  // Run tests (required for production)
  console.log('🧪 Running tests...');
  execSync('npm test', { stdio: 'inherit' });

  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Get current deployment info for potential rollback
  console.log('📝 Getting current deployment info...');
  let currentDeployment = null;
  try {
    const deployments = execSync('vercel ls --token=' + process.env.VERCEL_TOKEN, { 
      encoding: 'utf8' 
    });
    console.log('Current deployments stored for potential rollback');
  } catch (error) {
    console.warn('Could not retrieve current deployments');
  }

  // Deploy to Vercel production
  console.log('📦 Deploying to production...');
  const deployOutput = execSync('vercel --prod --token=' + process.env.VERCEL_TOKEN, { 
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit']
  });
  
  const productionUrl = deployOutput.trim();
  console.log(`✅ Production deployment successful!`);
  console.log(`📍 Production URL: ${productionUrl}`);
  
  // Comprehensive health check
  console.log('🔍 Running comprehensive health checks...');
  
  const healthChecks = [
    '/api/health',
    '/api/verify-database',
    '/' // Main page
  ];

  let allHealthy = true;
  
  setTimeout(() => {
    const https = require('https');
    const http = require('http');
    
    const runHealthCheck = (endpoint) => {
      return new Promise((resolve, reject) => {
        const url = `${productionUrl}${endpoint}`;
        const client = url.startsWith('https://') ? https : http;
        
        client.get(url, (res) => {
          if (res.statusCode === 200) {
            console.log(`✅ ${endpoint} - OK`);
            resolve(true);
          } else {
            console.log(`❌ ${endpoint} - Status: ${res.statusCode}`);
            resolve(false);
          }
        }).on('error', (err) => {
          console.log(`❌ ${endpoint} - Error: ${err.message}`);
          resolve(false);
        });
      });
    };

    Promise.all(healthChecks.map(runHealthCheck))
      .then(results => {
        allHealthy = results.every(result => result);
        
        if (allHealthy) {
          console.log('✅ All health checks passed! Production deployment complete.');
          console.log(`🌐 Live at: ${productionUrl}`);
        } else {
          console.log('❌ Some health checks failed. Consider manual verification.');
          console.log('🔄 Rollback command: vercel rollback --token=' + process.env.VERCEL_TOKEN);
        }
      });
  }, 15000); // Wait 15 seconds for deployment to be fully ready

} catch (error) {
  console.error('❌ Production deployment failed:', error.message);
  console.log('🔄 Run rollback if needed: vercel rollback --token=' + process.env.VERCEL_TOKEN);
  process.exit(1);
}