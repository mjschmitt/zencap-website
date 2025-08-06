#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 EMERGENCY ROLLBACK SCRIPT');
console.log('================================');

if (!process.env.VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN environment variable is required');
  process.exit(1);
}

async function rollback() {
  try {
    // List current deployments
    console.log('📋 Fetching current deployments...');
    const deployments = execSync('vercel ls --token=' + process.env.VERCEL_TOKEN, { 
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'inherit']
    });
    
    console.log('Recent deployments:');
    console.log(deployments);

    // Confirm rollback
    const answer = await new Promise((resolve) => {
      rl.question('\n❓ Do you want to rollback to the previous deployment? (yes/no): ', resolve);
    });

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Rollback cancelled');
      rl.close();
      return;
    }

    // Execute rollback
    console.log('🔄 Executing rollback...');
    const rollbackOutput = execSync('vercel rollback --token=' + process.env.VERCEL_TOKEN, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });

    console.log('✅ Rollback completed successfully!');
    
    // Wait and run health check
    setTimeout(() => {
      console.log('🔍 Running health check on rolled back deployment...');
      const https = require('https');
      
      // Get current production URL
      try {
        const currentUrl = execSync('vercel ls --token=' + process.env.VERCEL_TOKEN + ' | head -2 | tail -1', { 
          encoding: 'utf8'
        }).trim();
        
        https.get(`${currentUrl}/api/health`, (res) => {
          if (res.statusCode === 200) {
            console.log('✅ Rollback health check passed!');
            console.log(`🌐 Production is live at: ${currentUrl}`);
          } else {
            console.log(`⚠️  Health check returned status: ${res.statusCode}`);
            console.log('❗ Manual verification may be required');
          }
        }).on('error', (err) => {
          console.log(`❌ Health check failed: ${err.message}`);
          console.log('❗ Manual verification required');
        });
      } catch (error) {
        console.log('⚠️  Could not verify rollback automatically');
      }
    }, 10000);

  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    console.log('💡 Try manual rollback: vercel rollback --token=' + process.env.VERCEL_TOKEN);
    process.exit(1);
  } finally {
    rl.close();
  }
}

rollback();