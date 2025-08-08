#!/usr/bin/env node

/**
 * Excel Viewer Performance Monitor
 * Specialized monitoring for ExcelJS and Luckysheet components
 * Critical for $2,985-$4,985 financial model viewing experience
 */

const fs = require('fs');
const path = require('path');

class ExcelViewerPerformanceMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      excelComponents: {},
      bundleAnalysis: {},
      loadingPerformance: {},
      memoryImpact: {},
      recommendations: []
    };
  }

  analyzeExcelBundles() {
    console.log('📊 Analyzing Excel-specific bundle performance...');
    
    const bundleDir = path.join(process.cwd(), '.next', 'static', 'chunks');
    const excelRelatedBundles = [];
    
    try {
      if (fs.existsSync(bundleDir)) {
        const files = fs.readdirSync(bundleDir, { recursive: true });
        
        for (const file of files) {
          if (typeof file === 'string' && file.endsWith('.js')) {
            const lowerFile = file.toLowerCase();
            
            if (lowerFile.includes('excel') || 
                lowerFile.includes('luckysheet') || 
                lowerFile.includes('xlsx') ||
                lowerFile.includes('spreadsheet')) {
              
              const filePath = path.join(bundleDir, file);
              const stats = fs.statSync(filePath);
              
              excelRelatedBundles.push({
                name: file,
                size: stats.size,
                sizeKB: Math.round(stats.size / 1024 * 100) / 100,
                sizeMB: Math.round(stats.size / 1024 / 1024 * 100) / 100,
                type: this.categorizeExcelBundle(file),
                loadingStrategy: this.getLoadingStrategy(file)
              });
            }
          }
        }
        
        this.results.bundleAnalysis = {
          totalExcelBundles: excelRelatedBundles.length,
          totalExcelSize: excelRelatedBundles.reduce((sum, bundle) => sum + bundle.size, 0),
          totalExcelSizeMB: Math.round(excelRelatedBundles.reduce((sum, bundle) => sum + bundle.size, 0) / 1024 / 1024 * 100) / 100,
          bundles: excelRelatedBundles.sort((a, b) => b.size - a.size),
          byType: this.groupByType(excelRelatedBundles)
        };

        // Performance analysis
        this.analyzeExcelPerformanceImpact();

      } else {
        this.results.recommendations.push('Bundle directory not found. Run npm run build first.');
      }
    } catch (error) {
      console.error('Excel bundle analysis failed:', error.message);
    }
  }

  categorizeExcelBundle(filename) {
    const lower = filename.toLowerCase();
    
    if (lower.includes('exceljs')) return 'ExcelJS Core Engine';
    if (lower.includes('luckysheet')) return 'Luckysheet Interactive';
    if (lower.includes('xlsx-js-style')) return 'XLSX Styling';
    if (lower.includes('xlsx') && !lower.includes('style')) return 'XLSX Core';
    if (lower.includes('node-xlsx')) return 'Node XLSX';
    if (lower.includes('spreadsheet')) return 'Spreadsheet Utilities';
    
    return 'Excel Related';
  }

  getLoadingStrategy(filename) {
    // Determine loading strategy based on webpack chunk naming
    if (filename.includes('excel-engine')) return 'Async (On-Demand)';
    if (filename.includes('excel-utils')) return 'Async (Deferred)';
    if (filename.includes('charts-viz')) return 'Async (Lazy)';
    if (filename.includes('main')) return 'Sync (Critical)';
    
    return 'Default';
  }

  groupByType(bundles) {
    const groups = {};
    
    for (const bundle of bundles) {
      const type = bundle.type;
      if (!groups[type]) {
        groups[type] = {
          count: 0,
          totalSize: 0,
          totalSizeMB: 0,
          bundles: []
        };
      }
      
      groups[type].count++;
      groups[type].totalSize += bundle.size;
      groups[type].totalSizeMB = Math.round(groups[type].totalSize / 1024 / 1024 * 100) / 100;
      groups[type].bundles.push(bundle);
    }
    
    return groups;
  }

  analyzeExcelPerformanceImpact() {
    console.log('⚡ Analyzing Excel viewer performance impact...');
    
    const bundles = this.results.bundleAnalysis.bundles;
    const totalSizeMB = this.results.bundleAnalysis.totalExcelSizeMB;
    
    // Performance impact calculation
    this.results.loadingPerformance = {
      estimatedLoadTime: this.estimateLoadTime(totalSizeMB),
      networkImpact: this.calculateNetworkImpact(totalSizeMB),
      parsingTime: this.estimateParsingTime(bundles),
      renderingDelay: this.estimateRenderingDelay(bundles)
    };

    // Memory impact estimation
    this.results.memoryImpact = {
      estimatedHeapUsage: totalSizeMB * 2.5, // Rough estimate: 2.5x bundle size in memory
      garbageCollectionRisk: totalSizeMB > 5 ? 'HIGH' : totalSizeMB > 2 ? 'MEDIUM' : 'LOW',
      memoryLeakRisk: this.assessMemoryLeakRisk(bundles)
    };

    // Generate specific recommendations
    this.generateExcelRecommendations(bundles, totalSizeMB);
  }

  estimateLoadTime(sizeMB) {
    // Estimate load time based on typical connection speeds
    const speeds = {
      '3G': sizeMB / 0.375, // 3Mbps effective = ~375KB/s
      '4G': sizeMB / 1.25,  // 10Mbps effective = ~1.25MB/s
      'WiFi': sizeMB / 5,   // 40Mbps effective = ~5MB/s
      'Fast': sizeMB / 10   // 80Mbps effective = ~10MB/s
    };

    return {
      '3G': Math.round(speeds['3G'] * 1000), // ms
      '4G': Math.round(speeds['4G'] * 1000), // ms
      'WiFi': Math.round(speeds['WiFi'] * 1000), // ms
      'Fast': Math.round(speeds['Fast'] * 1000)  // ms
    };
  }

  calculateNetworkImpact(sizeMB) {
    if (sizeMB > 10) return 'CRITICAL - Over 10MB will severely impact mobile users';
    if (sizeMB > 5) return 'HIGH - May cause delays on slower connections';
    if (sizeMB > 2) return 'MEDIUM - Noticeable on 3G/4G connections';
    return 'LOW - Acceptable load times on most connections';
  }

  estimateParsingTime(bundles) {
    // Estimate JavaScript parsing time (rough calculation)
    const totalKB = bundles.reduce((sum, bundle) => sum + bundle.sizeKB, 0);
    
    // Rough estimate: 1KB = 0.1ms parsing time on modern devices
    const fastDevice = totalKB * 0.05; // High-end device
    const avgDevice = totalKB * 0.1;   // Average device
    const slowDevice = totalKB * 0.3;  // Low-end device
    
    return {
      fastDevice: Math.round(fastDevice),
      averageDevice: Math.round(avgDevice),
      slowDevice: Math.round(slowDevice)
    };
  }

  estimateRenderingDelay(bundles) {
    const excelJSBundle = bundles.find(b => b.type === 'ExcelJS Core Engine');
    const luckysheeetBundle = bundles.find(b => b.type === 'Luckysheet Interactive');
    
    let delay = 0;
    
    if (excelJSBundle) {
      // ExcelJS is heavy - significant parsing overhead
      delay += Math.max(500, excelJSBundle.sizeKB * 0.5);
    }
    
    if (luckysheeetBundle) {
      // Luckysheet has DOM manipulation overhead
      delay += Math.max(300, luckysheeetBundle.sizeKB * 0.3);
    }
    
    return Math.round(delay);
  }

  assessMemoryLeakRisk(bundles) {
    let risk = 'LOW';
    
    const excelBundle = bundles.find(b => b.type.includes('ExcelJS'));
    const luckysheeetBundle = bundles.find(b => b.type.includes('Luckysheet'));
    
    if (excelBundle && excelBundle.sizeMB > 3) {
      risk = 'MEDIUM'; // Large Excel processing libraries can leak
    }
    
    if (luckysheeetBundle && luckysheeetBundle.sizeMB > 2) {
      risk = 'HIGH'; // Interactive spreadsheet components often leak DOM references
    }
    
    return risk;
  }

  generateExcelRecommendations(bundles, totalSizeMB) {
    console.log('💡 Generating Excel-specific recommendations...');
    
    // Size-based recommendations
    if (totalSizeMB > 8) {
      this.results.recommendations.push('CRITICAL: Excel bundles exceed 8MB. Implement aggressive lazy loading and consider server-side processing for large files.');
    } else if (totalSizeMB > 5) {
      this.results.recommendations.push('HIGH: Excel bundles exceed 5MB. Implement progressive loading and chunk large Excel files.');
    }

    // Component-specific recommendations
    const excelJS = bundles.find(b => b.type === 'ExcelJS Core Engine');
    const luckysheet = bundles.find(b => b.type === 'Luckysheet Interactive');
    
    if (excelJS && excelJS.sizeMB > 2) {
      this.results.recommendations.push('ExcelJS bundle is large. Consider using Web Workers for file processing and implement streaming for large files.');
    }
    
    if (luckysheet && luckysheet.sizeMB > 1.5) {
      this.results.recommendations.push('Luckysheet bundle is heavy. Load only when user explicitly requests interactive mode.');
    }

    // Memory recommendations
    if (this.results.memoryImpact.memoryLeakRisk === 'HIGH') {
      this.results.recommendations.push('HIGH memory leak risk detected. Implement proper component cleanup and use React.memo for Excel viewers.');
    }

    // Loading strategy recommendations
    const syncBundles = bundles.filter(b => b.loadingStrategy === 'Sync (Critical)');
    if (syncBundles.length > 0) {
      this.results.recommendations.push('Some Excel bundles are loaded synchronously. Move to async loading for better initial page performance.');
    }

    // Network optimization
    if (this.results.loadingPerformance.networkImpact.includes('CRITICAL') || 
        this.results.loadingPerformance.networkImpact.includes('HIGH')) {
      this.results.recommendations.push('Implement CDN caching and gzip compression for Excel bundles. Consider WebAssembly for core processing.');
    }

    // User experience recommendations
    const estimatedLoad3G = this.results.loadingPerformance.estimatedLoadTime['3G'];
    if (estimatedLoad3G > 5000) {
      this.results.recommendations.push(`Excel viewer load time on 3G (${estimatedLoad3G}ms) is poor. Add loading indicators and skeleton screens.`);
    }
  }

  checkExcelViewerImplementation() {
    console.log('🔍 Checking Excel viewer implementation...');
    
    const viewerPath = path.join(process.cwd(), 'src', 'components', 'ui', 'ExcelJSViewer.js');
    const refactoredPath = path.join(process.cwd(), 'src', 'components', 'ui', 'ExcelViewer');
    
    this.results.excelComponents = {
      mainViewer: fs.existsSync(viewerPath),
      refactoredViewer: fs.existsSync(refactoredPath),
      implementationStatus: 'Unknown'
    };
    
    if (this.results.excelComponents.refactoredViewer) {
      this.results.excelComponents.implementationStatus = 'Refactored (Good for performance)';
      
      // Check for performance optimizations in refactored version
      try {
        const refactoredFiles = fs.readdirSync(refactoredPath);
        this.results.excelComponents.refactoredFiles = refactoredFiles;
        
        if (refactoredFiles.some(f => f.includes('Lazy') || f.includes('Dynamic'))) {
          this.results.recommendations.push('Good: Lazy loading components detected in Excel viewer.');
        } else {
          this.results.recommendations.push('Consider adding lazy loading to Excel viewer components for better performance.');
        }
        
      } catch (error) {
        console.log('Could not analyze refactored Excel viewer structure.');
      }
      
    } else if (this.results.excelComponents.mainViewer) {
      this.results.excelComponents.implementationStatus = 'Monolithic (Performance risk)';
      this.results.recommendations.push('Excel viewer is monolithic. Consider refactoring into smaller, lazy-loaded components.');
    } else {
      this.results.excelComponents.implementationStatus = 'Not found';
      this.results.recommendations.push('Excel viewer components not found. Verify component structure.');
    }
  }

  generateReport() {
    console.log('📊 Generating Excel performance report...');
    
    return {
      summary: {
        timestamp: this.results.timestamp,
        totalExcelBundleSize: `${this.results.bundleAnalysis.totalExcelSizeMB} MB`,
        bundleCount: this.results.bundleAnalysis.totalExcelBundles,
        performanceRating: this.calculateExcelPerformanceRating(),
        criticalIssues: this.results.recommendations.filter(r => r.includes('CRITICAL')).length,
        recommendations: this.results.recommendations.length
      },
      bundleAnalysis: this.results.bundleAnalysis,
      loadingPerformance: this.results.loadingPerformance,
      memoryImpact: this.results.memoryImpact,
      excelComponents: this.results.excelComponents,
      recommendations: this.results.recommendations
    };
  }

  calculateExcelPerformanceRating() {
    let rating = 100;
    const sizeMB = this.results.bundleAnalysis.totalExcelSizeMB;
    
    // Size penalties
    if (sizeMB > 10) rating -= 40;
    else if (sizeMB > 5) rating -= 25;
    else if (sizeMB > 2) rating -= 10;
    
    // Memory leak risk penalties
    const memRisk = this.results.memoryImpact.memoryLeakRisk;
    if (memRisk === 'HIGH') rating -= 20;
    else if (memRisk === 'MEDIUM') rating -= 10;
    
    // Loading time penalties
    const load3G = this.results.loadingPerformance.estimatedLoadTime['3G'];
    if (load3G > 8000) rating -= 15;
    else if (load3G > 5000) rating -= 10;
    
    return Math.max(0, Math.min(100, Math.round(rating)));
  }

  displayReport(report) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 EXCEL VIEWER PERFORMANCE ANALYSIS');
    console.log('='.repeat(70));
    
    console.log(`🕐 Analysis Time: ${report.summary.timestamp}`);
    console.log(`📊 Excel Performance Rating: ${report.summary.performanceRating}/100`);
    console.log(`📦 Total Excel Bundle Size: ${report.summary.totalExcelBundleSize}`);
    console.log(`🔢 Excel Bundle Count: ${report.summary.bundleCount}`);
    console.log(`❌ Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`💡 Recommendations: ${report.summary.recommendations}`);
    
    console.log('\n📦 BUNDLE BREAKDOWN:');
    if (report.bundleAnalysis.byType) {
      Object.entries(report.bundleAnalysis.byType).forEach(([type, data]) => {
        console.log(`   ${type}: ${data.totalSizeMB} MB (${data.count} bundles)`);
      });
    }
    
    console.log('\n⚡ LOADING PERFORMANCE:');
    console.log(`   3G Load Time: ${report.loadingPerformance.estimatedLoadTime['3G']}ms`);
    console.log(`   4G Load Time: ${report.loadingPerformance.estimatedLoadTime['4G']}ms`);
    console.log(`   WiFi Load Time: ${report.loadingPerformance.estimatedLoadTime['WiFi']}ms`);
    console.log(`   Network Impact: ${report.loadingPerformance.networkImpact}`);
    
    console.log('\n🧠 MEMORY IMPACT:');
    console.log(`   Estimated Heap Usage: ${report.memoryImpact.estimatedHeapUsage} MB`);
    console.log(`   Memory Leak Risk: ${report.memoryImpact.memoryLeakRisk}`);
    console.log(`   GC Risk: ${report.memoryImpact.garbageCollectionRisk}`);
    
    console.log('\n🔍 COMPONENT STATUS:');
    console.log(`   Implementation: ${report.excelComponents.implementationStatus}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 KEY RECOMMENDATIONS:');
      report.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
  }

  async run() {
    console.log('🚀 Starting Excel Viewer Performance Analysis...\n');
    
    try {
      this.analyzeExcelBundles();
      this.checkExcelViewerImplementation();
      
      const report = this.generateReport();
      
      // Save report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(process.cwd(), 'performance-reports', `excel-performance-${timestamp}.json`);
      
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      
      this.displayReport(report);
      
      console.log(`\n📄 Detailed Excel performance report saved to: ${reportPath}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Excel performance analysis failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new ExcelViewerPerformanceMonitor();
  
  monitor.run().then((report) => {
    console.log('\n✅ Excel performance analysis completed!');
    
    const exitCode = report.summary.criticalIssues > 0 ? 1 : 0;
    process.exit(exitCode);
    
  }).catch((error) => {
    console.error('\n❌ Excel performance analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = ExcelViewerPerformanceMonitor;