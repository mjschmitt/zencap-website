#!/usr/bin/env node

/**
 * ZenCap Performance Dashboard
 * Real-time performance monitoring dashboard for www.zencap.co
 * Integrates all performance monitoring systems
 */

const PerformanceMonitor = require('./performance-monitor');
const ExcelViewerPerformanceMonitor = require('./excel-performance-monitor');
const HourlyPerformanceReport = require('./hourly-performance-report');
const fs = require('fs');
const path = require('path');

class PerformanceDashboard {
  constructor() {
    this.startTime = Date.now();
    this.dashboard = {
      metadata: {
        dashboardVersion: '1.0.0',
        startTime: new Date().toISOString(),
        monitoringDuration: 0,
        reportCount: 0
      },
      currentStatus: {},
      performanceTrends: {},
      criticalAlerts: [],
      recommendations: [],
      monitoringHistory: []
    };
    
    this.monitoringActive = false;
    this.intervalId = null;
  }

  async runFullPerformanceAnalysis() {
    console.log('🚀 Running Full Performance Analysis Suite...\n');
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        reports: {}
      };

      // 1. General Performance Monitor
      console.log('1️⃣ Running General Performance Monitor...');
      const generalMonitor = new PerformanceMonitor();
      results.reports.general = await generalMonitor.run();
      console.log('✅ General performance analysis completed\n');

      // 2. Excel Viewer Performance Monitor
      console.log('2️⃣ Running Excel Viewer Performance Analysis...');
      const excelMonitor = new ExcelViewerPerformanceMonitor();
      results.reports.excel = await excelMonitor.run();
      console.log('✅ Excel performance analysis completed\n');

      // 3. Hourly Performance Report
      console.log('3️⃣ Running Hourly Performance Report...');
      const hourlyMonitor = new HourlyPerformanceReport();
      results.reports.hourly = await hourlyMonitor.run();
      console.log('✅ Hourly performance report completed\n');

      // Aggregate results
      this.aggregateResults(results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Full performance analysis failed:', error.message);
      throw error;
    }
  }

  aggregateResults(results) {
    console.log('📊 Aggregating performance results...');
    
    const general = results.reports.general;
    const excel = results.reports.excel;
    const hourly = results.reports.hourly;

    // Current status aggregation
    this.dashboard.currentStatus = {
      overallHealth: hourly.summary?.overallHealth || 'UNKNOWN',
      performanceScore: this.calculateCompositeScore(general, excel, hourly),
      siteResponseTime: hourly.siteHealth?.responseTime || 'N/A',
      coreWebVitals: hourly.coreWebVitals || {},
      bundleSize: general.bundleAnalysis?.totalSizeKB || 'N/A',
      excelPerformance: excel.summary?.performanceRating || 'N/A',
      memoryUsage: hourly.memoryMetrics?.heapUsed || 'N/A',
      activeAlerts: (hourly.performanceAlerts || []).length,
      lastUpdated: new Date().toISOString()
    };

    // Aggregate critical alerts
    this.dashboard.criticalAlerts = [
      ...(general.errors || []).map(err => ({ source: 'General', level: 'CRITICAL', message: err })),
      ...(hourly.performanceAlerts || [])
        .filter(alert => alert.level === 'CRITICAL' || alert.level === 'HIGH')
        .map(alert => ({ source: 'Hourly', ...alert }))
    ];

    // Aggregate recommendations
    this.dashboard.recommendations = [
      ...(general.recommendations || []).map(rec => ({ source: 'General', recommendation: rec })),
      ...(excel.recommendations || []).map(rec => ({ source: 'Excel', recommendation: rec })),
      ...(hourly.recommendations || []).map(rec => ({ source: 'Hourly', recommendation: rec }))
    ];

    // Update metadata
    this.dashboard.metadata.reportCount++;
    this.dashboard.metadata.monitoringDuration = Date.now() - this.startTime;
    
    // Add to history
    this.dashboard.monitoringHistory.push({
      timestamp: new Date().toISOString(),
      performanceScore: this.dashboard.currentStatus.performanceScore,
      responseTime: this.dashboard.currentStatus.siteResponseTime,
      bundleSize: this.dashboard.currentStatus.bundleSize,
      alerts: this.dashboard.currentStatus.activeAlerts
    });

    // Keep only last 24 entries (24 hours if run hourly)
    if (this.dashboard.monitoringHistory.length > 24) {
      this.dashboard.monitoringHistory = this.dashboard.monitoringHistory.slice(-24);
    }
  }

  calculateCompositeScore(general, excel, hourly) {
    let totalScore = 0;
    let weightedTotal = 0;

    // General performance (40% weight)
    if (general && general.summary && general.summary.overallPerformance) {
      totalScore += general.summary.overallPerformance * 0.4;
      weightedTotal += 0.4;
    }

    // Excel performance (30% weight)
    if (excel && excel.summary && excel.summary.performanceRating) {
      totalScore += excel.summary.performanceRating * 0.3;
      weightedTotal += 0.3;
    }

    // Hourly performance (30% weight)
    if (hourly && hourly.summary && hourly.summary.performanceScore) {
      totalScore += hourly.summary.performanceScore * 0.3;
      weightedTotal += 0.3;
    }

    return weightedTotal > 0 ? Math.round(totalScore / weightedTotal) : 0;
  }

  displayDashboard() {
    const status = this.dashboard.currentStatus;
    const alerts = this.dashboard.criticalAlerts;
    const recommendations = this.dashboard.recommendations;

    console.log('\n' + '='.repeat(90));
    console.log('📊 ZENCAP PERFORMANCE DASHBOARD - LIVE STATUS');
    console.log('='.repeat(90));
    
    console.log(`🕐 Last Updated: ${status.lastUpdated}`);
    console.log(`⚡ Composite Performance Score: ${status.performanceScore}/100`);
    console.log(`🌐 Overall Health: ${status.overallHealth}`);
    console.log(`🚨 Active Alerts: ${status.activeAlerts}`);
    
    console.log(`\n📈 KEY PERFORMANCE INDICATORS:`);
    console.log(`   Site Response Time: ${status.siteResponseTime}ms`);
    console.log(`   LCP (Largest Contentful Paint): ${status.coreWebVitals.LCP || 'N/A'}ms`);
    console.log(`   Bundle Size: ${status.bundleSize}KB`);
    console.log(`   Excel Performance: ${status.excelPerformance}/100`);
    console.log(`   Memory Usage: ${status.memoryUsage}MB`);
    
    console.log(`\n⚡ CORE WEB VITALS SUMMARY:`);
    if (status.coreWebVitals.LCP) {
      console.log(`   LCP: ${status.coreWebVitals.LCP}ms ${this.getVitalsStatus(status.coreWebVitals.LCP, 2500)}`);
      console.log(`   FID: ${status.coreWebVitals.FID}ms ${this.getVitalsStatus(status.coreWebVitals.FID, 100)}`);
      console.log(`   CLS: ${status.coreWebVitals.CLS.toFixed(3)} ${this.getVitalsStatus(status.coreWebVitals.CLS, 0.1)}`);
      console.log(`   TTI: ${status.coreWebVitals.TTI}ms ${this.getVitalsStatus(status.coreWebVitals.TTI, 5000)}`);
    }

    if (alerts.length > 0) {
      console.log(`\n🚨 CRITICAL ALERTS (${alerts.length}):`);
      alerts.slice(0, 5).forEach((alert, i) => {
        console.log(`   ${i + 1}. [${alert.level}] ${alert.message} (${alert.source})`);
      });
      
      if (alerts.length > 5) {
        console.log(`   ... and ${alerts.length - 5} more alerts`);
      }
    }

    if (recommendations.length > 0) {
      console.log(`\n💡 TOP PERFORMANCE RECOMMENDATIONS (${recommendations.length}):`);
      recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec.recommendation} (${rec.source})`);
      });
      
      if (recommendations.length > 5) {
        console.log(`   ... and ${recommendations.length - 5} more recommendations`);
      }
    }

    // Performance trend (if we have history)
    if (this.dashboard.monitoringHistory.length > 1) {
      const history = this.dashboard.monitoringHistory;
      const latest = history[history.length - 1];
      const previous = history[history.length - 2];
      
      console.log(`\n📊 PERFORMANCE TREND:`);
      console.log(`   Score Change: ${this.getTrendIndicator(latest.performanceScore, previous.performanceScore)}`);
      console.log(`   Response Time Change: ${this.getTrendIndicator(previous.responseTime, latest.responseTime)}ms`);
      console.log(`   Alert Count Change: ${this.getTrendIndicator(previous.alerts, latest.alerts)}`);
    }

    console.log(`\n📋 MONITORING STATS:`);
    console.log(`   Reports Generated: ${this.dashboard.metadata.reportCount}`);
    console.log(`   Monitoring Duration: ${Math.round(this.dashboard.metadata.monitoringDuration / 1000 / 60)} minutes`);
    console.log(`   History Length: ${this.dashboard.monitoringHistory.length} entries`);
    
    console.log('\n' + '='.repeat(90));
  }

  getVitalsStatus(value, threshold) {
    if (typeof value !== 'number') return '';
    
    if (value <= threshold) {
      return '✅ GOOD';
    } else if (value <= threshold * 1.5) {
      return '⚠️ NEEDS IMPROVEMENT';
    } else {
      return '❌ POOR';
    }
  }

  getTrendIndicator(current, previous) {
    if (typeof current !== 'number' || typeof previous !== 'number') {
      return 'N/A';
    }
    
    const change = current - previous;
    
    if (change > 0) {
      return `📈 +${change}`;
    } else if (change < 0) {
      return `📉 ${change}`;
    } else {
      return '➡️ No change';
    }
  }

  async saveDashboard() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dashboardPath = path.join(process.cwd(), 'performance-reports', `dashboard-${timestamp}.json`);
    
    const reportDir = path.dirname(dashboardPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(dashboardPath, JSON.stringify(this.dashboard, null, 2));
    
    // Save current dashboard state
    const currentPath = path.join(reportDir, 'current-dashboard.json');
    fs.writeFileSync(currentPath, JSON.stringify(this.dashboard, null, 2));
    
    return dashboardPath;
  }

  generatePerformanceInsights() {
    console.log('🔍 Generating Performance Insights...');
    
    const insights = [];
    const status = this.dashboard.currentStatus;
    const history = this.dashboard.monitoringHistory;

    // Performance score analysis
    if (status.performanceScore < 50) {
      insights.push('🚨 CRITICAL: Performance score is critically low. Immediate optimization required.');
    } else if (status.performanceScore < 70) {
      insights.push('⚠️ WARNING: Performance score is below target. Consider optimization strategies.');
    } else if (status.performanceScore >= 90) {
      insights.push('✅ EXCELLENT: Performance score is excellent. Monitor to maintain standards.');
    }

    // Bundle size analysis
    if (typeof status.bundleSize === 'number' && status.bundleSize > 5000) {
      insights.push('📦 Bundle size is large. Consider implementing more aggressive code splitting.');
    }

    // Response time analysis
    if (typeof status.siteResponseTime === 'number') {
      if (status.siteResponseTime > 3000) {
        insights.push('🐌 Site response time is slow. Server optimization needed.');
      } else if (status.siteResponseTime < 200) {
        insights.push('⚡ Excellent response time. CDN and caching working well.');
      }
    }

    // Alert analysis
    if (status.activeAlerts > 5) {
      insights.push('🚨 High number of active alerts. System health review required.');
    } else if (status.activeAlerts === 0) {
      insights.push('✅ No active alerts. System is running smoothly.');
    }

    // Trend analysis
    if (history.length >= 3) {
      const recentScores = history.slice(-3).map(h => h.performanceScore);
      const isImproving = recentScores[2] > recentScores[0];
      const isDegrading = recentScores[2] < recentScores[0];
      
      if (isImproving) {
        insights.push('📈 Performance trend is positive. Recent optimizations are working.');
      } else if (isDegrading) {
        insights.push('📉 Performance trend is negative. Investigate recent changes.');
      }
    }

    // Excel performance analysis
    if (typeof status.excelPerformance === 'number') {
      if (status.excelPerformance < 70) {
        insights.push('📊 Excel viewer performance needs optimization for financial model viewing.');
      }
    }

    this.dashboard.performanceInsights = insights;
    return insights;
  }

  async run(options = {}) {
    console.log('🚀 Starting ZenCap Performance Dashboard...\n');
    
    try {
      // Run full analysis
      await this.runFullPerformanceAnalysis();
      
      // Generate insights
      this.generatePerformanceInsights();
      
      // Display dashboard
      this.displayDashboard();
      
      // Display insights
      if (this.dashboard.performanceInsights && this.dashboard.performanceInsights.length > 0) {
        console.log('\n🔍 PERFORMANCE INSIGHTS:');
        this.dashboard.performanceInsights.forEach((insight, i) => {
          console.log(`   ${i + 1}. ${insight}`);
        });
      }
      
      // Save dashboard
      const dashboardPath = await this.saveDashboard();
      console.log(`\n📄 Dashboard saved to: ${dashboardPath}`);
      
      return this.dashboard;
      
    } catch (error) {
      console.error('❌ Performance dashboard failed:', error.message);
      throw error;
    }
  }

  // Method to start continuous monitoring
  startContinuousMonitoring(intervalMinutes = 60) {
    console.log(`🔄 Starting continuous monitoring (every ${intervalMinutes} minutes)...`);
    
    this.monitoringActive = true;
    
    // Run initial analysis
    this.run();
    
    // Set up interval for continuous monitoring
    this.intervalId = setInterval(async () => {
      if (this.monitoringActive) {
        console.log('\n🔄 Running scheduled performance check...');
        try {
          await this.run();
        } catch (error) {
          console.error('❌ Scheduled performance check failed:', error.message);
        }
      }
    }, intervalMinutes * 60 * 1000);
    
    return this.intervalId;
  }

  stopContinuousMonitoring() {
    console.log('⏹️ Stopping continuous monitoring...');
    
    this.monitoringActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// CLI execution
if (require.main === module) {
  const dashboard = new PerformanceDashboard();
  
  // Check for continuous monitoring flag
  const continuous = process.argv.includes('--continuous') || process.argv.includes('-c');
  const interval = process.argv.find(arg => arg.startsWith('--interval='))?.split('=')[1] || 60;
  
  if (continuous) {
    console.log('🔄 Starting in continuous monitoring mode...');
    dashboard.startContinuousMonitoring(parseInt(interval));
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n⏹️ Shutting down dashboard...');
      dashboard.stopContinuousMonitoring();
      process.exit(0);
    });
    
  } else {
    // Single run
    dashboard.run().then((results) => {
      console.log('\n✅ Performance dashboard completed successfully!');
      
      const exitCode = results.currentStatus.overallHealth === 'CRITICAL' ? 2 :
                       results.currentStatus.performanceScore < 50 ? 1 : 0;
      process.exit(exitCode);
      
    }).catch((error) => {
      console.error('\n❌ Performance dashboard failed:', error.message);
      process.exit(1);
    });
  }
}

module.exports = PerformanceDashboard;