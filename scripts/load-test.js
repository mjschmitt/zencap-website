// Load Testing Script for Zenith Capital Advisors
// Tests concurrent users and measures response times

const https = require('https');
const http = require('http');

const TARGET_URL = 'https://zencap-website.vercel.app';
const CONCURRENT_USERS = 100;
const REQUESTS_PER_USER = 5;
const TEST_DURATION = 30000; // 30 seconds

// Test endpoints
const endpoints = [
  '/',
  '/models',
  '/models/multifamily-acquisition-model',
  '/insights',
  '/contact',
  '/api/models',
  '/api/insights'
];

// Metrics storage
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  statusCodes: {},
  errors: [],
  startTime: null,
  endTime: null
};

// Make a single request and track metrics
function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      
      metrics.totalRequests++;
      metrics.responseTimes.push(responseTime);
      
      if (!metrics.statusCodes[res.statusCode]) {
        metrics.statusCodes[res.statusCode] = 0;
      }
      metrics.statusCodes[res.statusCode]++;
      
      if (res.statusCode >= 200 && res.statusCode < 400) {
        metrics.successfulRequests++;
      } else {
        metrics.failedRequests++;
      }
      
      // Consume response data
      res.on('data', () => {});
      res.on('end', () => {
        resolve({ success: true, responseTime, statusCode: res.statusCode });
      });
    }).on('error', (err) => {
      metrics.totalRequests++;
      metrics.failedRequests++;
      metrics.errors.push(err.message);
      resolve({ success: false, error: err.message });
    });
  });
}

// Simulate a single user making multiple requests
async function simulateUser(userId) {
  const userMetrics = {
    userId,
    requests: [],
    totalTime: 0
  };
  
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    // Pick a random endpoint
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const url = TARGET_URL + endpoint;
    
    const result = await makeRequest(url);
    userMetrics.requests.push(result);
    
    if (result.responseTime) {
      userMetrics.totalTime += result.responseTime;
    }
    
    // Small delay between requests (100-500ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
  }
  
  return userMetrics;
}

// Calculate statistics
function calculateStats() {
  const sortedTimes = metrics.responseTimes.sort((a, b) => a - b);
  const sum = sortedTimes.reduce((a, b) => a + b, 0);
  
  return {
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    successRate: ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) + '%',
    averageResponseTime: Math.round(sum / sortedTimes.length) || 0,
    minResponseTime: sortedTimes[0] || 0,
    maxResponseTime: sortedTimes[sortedTimes.length - 1] || 0,
    p50ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0,
    p95ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0,
    p99ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0,
    requestsPerSecond: (metrics.totalRequests / ((metrics.endTime - metrics.startTime) / 1000)).toFixed(2),
    statusCodes: metrics.statusCodes,
    errorCount: metrics.errors.length,
    testDuration: ((metrics.endTime - metrics.startTime) / 1000).toFixed(2) + 's'
  };
}

// Main load test function
async function runLoadTest() {
  console.log(`\n🚀 LOAD TESTING: ${TARGET_URL}`);
  console.log(`📊 Configuration:`);
  console.log(`   - Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   - Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`   - Total Expected Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log(`   - Endpoints: ${endpoints.length} different pages/APIs\n`);
  
  console.log('⏱️  Starting load test...\n');
  
  metrics.startTime = Date.now();
  
  // Create progress bar
  let completed = 0;
  const progressInterval = setInterval(() => {
    const progress = Math.round((completed / CONCURRENT_USERS) * 100);
    const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
    process.stdout.write(`\r   Progress: [${bar}] ${progress}% (${completed}/${CONCURRENT_USERS} users)`);
  }, 100);
  
  // Launch all users concurrently
  const userPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(
      simulateUser(i).then(result => {
        completed++;
        return result;
      })
    );
    
    // Stagger user starts slightly (10ms between each)
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Wait for all users to complete
  const userResults = await Promise.all(userPromises);
  metrics.endTime = Date.now();
  
  // Clear progress bar
  clearInterval(progressInterval);
  console.log('\n\n✅ Load test completed!\n');
  
  // Calculate and display results
  const stats = calculateStats();
  
  console.log('📈 LOAD TEST RESULTS:');
  console.log('═══════════════════════════════════════════\n');
  
  console.log('📊 Overall Metrics:');
  console.log(`   Total Requests: ${stats.totalRequests}`);
  console.log(`   Successful: ${stats.successfulRequests} (${stats.successRate})`);
  console.log(`   Failed: ${stats.failedRequests}`);
  console.log(`   Requests/Second: ${stats.requestsPerSecond}`);
  console.log(`   Test Duration: ${stats.testDuration}\n`);
  
  console.log('⏱️  Response Times:');
  console.log(`   Average: ${stats.averageResponseTime}ms`);
  console.log(`   Min: ${stats.minResponseTime}ms`);
  console.log(`   Max: ${stats.maxResponseTime}ms`);
  console.log(`   P50 (Median): ${stats.p50ResponseTime}ms`);
  console.log(`   P95: ${stats.p95ResponseTime}ms`);
  console.log(`   P99: ${stats.p99ResponseTime}ms\n`);
  
  console.log('📡 Status Codes:');
  Object.entries(stats.statusCodes).forEach(([code, count]) => {
    const percentage = ((count / stats.totalRequests) * 100).toFixed(1);
    console.log(`   ${code}: ${count} requests (${percentage}%)`);
  });
  
  if (metrics.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    const uniqueErrors = [...new Set(metrics.errors)];
    uniqueErrors.forEach(error => {
      const count = metrics.errors.filter(e => e === error).length;
      console.log(`   ${error}: ${count} occurrences`);
    });
  }
  
  // Performance Assessment
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  console.log('═══════════════════════════════════════════\n');
  
  if (stats.successRate === '100.00%' && stats.p95ResponseTime < 3000) {
    console.log('✅ EXCELLENT: Platform handled 100 concurrent users perfectly!');
    console.log('   - Zero failures');
    console.log('   - Fast response times');
    console.log('   - Ready for production traffic');
  } else if (parseFloat(stats.successRate) >= 99 && stats.p95ResponseTime < 5000) {
    console.log('✅ GOOD: Platform performed well under load');
    console.log('   - High success rate');
    console.log('   - Acceptable response times');
    console.log('   - Production ready with monitoring');
  } else if (parseFloat(stats.successRate) >= 95) {
    console.log('⚠️  ACCEPTABLE: Platform needs optimization');
    console.log('   - Some failed requests detected');
    console.log('   - Consider caching improvements');
    console.log('   - Monitor closely in production');
  } else {
    console.log('❌ NEEDS WORK: Platform struggling under load');
    console.log('   - High failure rate');
    console.log('   - Consider scaling improvements');
    console.log('   - Review error logs for issues');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (stats.maxResponseTime > 10000) {
    console.log('   - Some requests are very slow (>10s)');
    console.log('   - Consider implementing caching');
  }
  if (stats.p95ResponseTime > 5000) {
    console.log('   - P95 response time is high');
    console.log('   - Optimize database queries');
  }
  if (parseFloat(stats.successRate) < 100) {
    console.log('   - Some requests failed');
    console.log('   - Check rate limiting and error logs');
  }
  if (stats.requestsPerSecond < 10) {
    console.log('   - Low throughput detected');
    console.log('   - Consider connection pooling');
  }
  
  console.log('\n═══════════════════════════════════════════');
  console.log('🏁 Load test complete!');
  
  // Save results to file
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `load-test-results-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify({
    config: {
      url: TARGET_URL,
      concurrentUsers: CONCURRENT_USERS,
      requestsPerUser: REQUESTS_PER_USER,
      endpoints: endpoints
    },
    metrics: metrics,
    statistics: stats,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`\n📁 Detailed results saved to: ${filename}\n`);
}

// Run the load test
runLoadTest().catch(console.error);