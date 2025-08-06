#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting staging deployment...');

try {
  // Check if we have required environment variables
  if (!process.env.VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN environment variable is required');
  }

  // Pre-deployment checks
  console.log('📋 Running pre-deployment checks...');
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.warn('⚠️  Warning: .env.local not found. Using environment defaults.');
  }

  // Run tests
  console.log('🧪 Running tests...');
  try {
    execSync('npm test', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Tests failed, but continuing deployment for staging...');
  }

  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Deploy to Vercel staging
  console.log('📦 Deploying to staging...');
  const deployOutput = execSync('vercel --token=' + process.env.VERCEL_TOKEN, { 
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit']
  });
  
  const stagingUrl = deployOutput.trim();
  console.log(`✅ Staging deployment successful!`);
  console.log(`📍 Staging URL: ${stagingUrl}`);
  
  // Health check
  console.log('🔍 Running health check...');
  setTimeout(() => {
    const healthCheck = require('https');
    const url = `${stagingUrl}/api/health`;
    
    healthCheck.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Health check passed!');
      } else {
        console.log(`⚠️  Health check returned status: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.log(`⚠️  Health check failed: ${err.message}`);
    });
  }, 10000); // Wait 10 seconds for deployment to be ready

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}