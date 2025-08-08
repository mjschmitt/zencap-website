/**
 * @fileoverview Bundle Size Monitor - Real-time JavaScript Bundle Analysis
 * @module utils/monitoring/bundle-size-monitor
 * 
 * CRITICAL BUNDLE SIZE MONITORING SYSTEM
 * - Real-time bundle size tracking with alerts
 * - Code splitting effectiveness monitoring
 * - Chunk loading performance analysis
 * - Memory impact assessment
 * - Dynamic import optimization tracking
 */

class BundleSizeMonitor {
  constructor() {
    this.bundles = new Map();
    this.totalSize = 0;
    this.thresholds = {
      // Bundle size thresholds in KB for financial platform optimization
      main_bundle: 250,        // Main application bundle
      vendor_bundle: 300,      // Third-party libraries
      chunk_bundle: 150,       // Individual chunks
      total_initial: 400,      // Total initial load
      async_chunk: 200,        // Async loaded chunks
      excel_bundle: 500        // Excel processing bundle (expected to be larger)
    };
    this.callbacks = [];
    this.isInitialized = false;
    this.performanceEntries = [];
  }

  /**
   * Initialize bundle size monitoring
   */
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Monitor script loading with Performance Observer
      this.setupPerformanceObserver();
      
      // Track initial bundle sizes
      this.trackInitialBundles();
      
      // Monitor dynamic imports
      this.monitorDynamicImports();
      
      // Set up periodic analysis
      this.startPeriodicAnalysis();
      
      console.log('✅ Bundle Size Monitor initialized');
      this.isInitialized = true;

    } catch (error) {
      console.error('❌ Failed to initialize Bundle Size Monitor:', error);
    }
  }

  /**
   * Set up Performance Observer for resource timing
   */
  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'resource' && this.isJavaScriptResource(entry)) {
            this.processScriptEntry(entry);
          }
        });
      });

      observer.observe({ type: 'resource', buffered: true });
      console.log('✅ Bundle size performance observer active');

    } catch (error) {
      console.error('Performance Observer setup error:', error);
    }
  }

  /**
   * Check if resource is a JavaScript bundle
   */
  isJavaScriptResource(entry) {
    const url = entry.name;
    return url.includes('.js') && (
      url.includes('_next/static/chunks/') ||
      url.includes('_next/static/js/') ||
      url.includes('/chunks/') ||
      url.includes('/js/')
    );
  }

  /**
   * Process individual script entries
   */
  processScriptEntry(entry) {
    const sizeKB = (entry.transferSize || entry.encodedBodySize || 0) / 1024;
    const bundleInfo = this.analyzeBundleType(entry.name);
    
    const bundleData = {
      url: entry.name,
      size: sizeKB,
      type: bundleInfo.type,
      category: bundleInfo.category,
      loadTime: entry.duration,
      timestamp: Date.now(),
      compressionRatio: entry.transferSize && entry.decodedBodySize ? 
        (entry.decodedBodySize / entry.transferSize).toFixed(2) : null
    };

    // Store bundle data
    this.bundles.set(entry.name, bundleData);
    this.totalSize += sizeKB;

    // Check thresholds and send alerts
    this.checkBundleThresholds(bundleData);

    // Fire callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(bundleData);
      } catch (error) {
        console.error('Bundle monitor callback error:', error);
      }
    });

    // Track performance entry
    this.performanceEntries.push(bundleData);

    // Log significant bundles
    if (sizeKB > 100) {
      console.log(`📦 Large bundle detected: ${bundleInfo.category} (${sizeKB.toFixed(1)}KB) - ${bundleInfo.type}`);
    }
  }

  /**
   * Analyze bundle type and category
   */
  analyzeBundleType(url) {
    // Next.js specific bundle analysis
    if (url.includes('_next/static/chunks/')) {
      if (url.includes('pages/')) {
        return { type: 'page_chunk', category: 'Page Bundle' };
      } else if (url.includes('webpack-')) {
        return { type: 'webpack_runtime', category: 'Runtime' };
      } else if (url.includes('framework-')) {
        return { type: 'framework', category: 'Framework' };
      } else if (url.includes('main-')) {
        return { type: 'main', category: 'Main Bundle' };
      } else {
        return { type: 'chunk', category: 'Code Split Chunk' };
      }
    }

    // Excel-related bundles
    if (url.includes('excel') || url.includes('xlsx')) {
      return { type: 'excel_bundle', category: 'Excel Processing' };
    }

    // Vendor bundles
    if (url.includes('vendor') || url.includes('node_modules')) {
      return { type: 'vendor_bundle', category: 'Third-party Libraries' };
    }

    // Animation bundles
    if (url.includes('framer-motion') || url.includes('animation')) {
      return { type: 'animation_bundle', category: 'Animations' };
    }

    // Rich text editor bundles
    if (url.includes('tiptap') || url.includes('editor')) {
      return { type: 'editor_bundle', category: 'Rich Text Editor' };
    }

    // Default categorization
    return { type: 'unknown', category: 'Other' };
  }

  /**
   * Check bundle size thresholds and send alerts
   */
  checkBundleThresholds(bundleData) {
    const { type, size } = bundleData;
    let threshold = this.thresholds.chunk_bundle; // default
    
    // Set specific thresholds based on bundle type
    switch (type) {
      case 'main':
        threshold = this.thresholds.main_bundle;
        break;
      case 'vendor_bundle':
        threshold = this.thresholds.vendor_bundle;
        break;
      case 'excel_bundle':
        threshold = this.thresholds.excel_bundle;
        break;
      case 'chunk':
        threshold = this.thresholds.chunk_bundle;
        break;
    }

    // Send alert if threshold exceeded
    if (size > threshold) {
      this.sendBundleAlert({
        type: 'bundle_size_exceeded',
        bundleType: type,
        actualSize: size,
        threshold,
        url: bundleData.url,
        severity: size > threshold * 1.5 ? 'critical' : 'warning'
      });
    }

    // Check total initial bundle size
    if (this.shouldCheckTotalSize()) {
      const initialTotal = this.calculateInitialBundleSize();
      if (initialTotal > this.thresholds.total_initial) {
        this.sendBundleAlert({
          type: 'total_bundle_size_exceeded',
          totalSize: initialTotal,
          threshold: this.thresholds.total_initial,
          severity: initialTotal > this.thresholds.total_initial * 1.3 ? 'critical' : 'warning'
        });
      }
    }
  }

  /**
   * Track initial bundle sizes on page load
   */
  trackInitialBundles() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const initialBundles = this.getInitialBundles();
        const totalInitial = this.calculateInitialBundleSize();
        
        console.log(`📊 Initial bundle analysis:`, {
          total_size: `${totalInitial.toFixed(1)}KB`,
          bundle_count: initialBundles.length,
          bundles: initialBundles.map(b => ({
            type: b.type,
            size: `${b.size.toFixed(1)}KB`
          }))
        });

        // Send initial bundle metrics
        this.sendBundleMetrics({
          type: 'initial_bundle_analysis',
          total_size: totalInitial,
          bundle_count: initialBundles.length,
          bundles: initialBundles
        });

      }, 1000); // Allow time for all initial resources to load
    });
  }

  /**
   * Get initial (synchronously loaded) bundles
   */
  getInitialBundles() {
    return Array.from(this.bundles.values()).filter(bundle => 
      bundle.type === 'main' || 
      bundle.type === 'framework' || 
      bundle.type === 'webpack_runtime' ||
      (bundle.type === 'vendor_bundle' && bundle.loadTime < 2000)
    );
  }

  /**
   * Calculate total initial bundle size
   */
  calculateInitialBundleSize() {
    return this.getInitialBundles().reduce((total, bundle) => total + bundle.size, 0);
  }

  /**
   * Monitor dynamic imports for code splitting effectiveness
   */
  monitorDynamicImports() {
    // Override dynamic import to track loading
    const originalImport = window.import || (() => {});
    let dynamicImportCount = 0;

    // Create a tracking wrapper (this is conceptual - actual implementation varies)
    const trackDynamicImport = (importPromise, moduleName) => {
      dynamicImportCount++;
      const startTime = performance.now();
      
      return importPromise.then(module => {
        const loadTime = performance.now() - startTime;
        
        this.sendBundleMetrics({
          type: 'dynamic_import',
          module_name: moduleName || 'unknown',
          load_time: loadTime,
          import_count: dynamicImportCount
        });

        console.log(`⚡ Dynamic import loaded: ${moduleName} (${loadTime.toFixed(1)}ms)`);
        return module;
      }).catch(error => {
        this.sendBundleAlert({
          type: 'dynamic_import_failed',
          module_name: moduleName || 'unknown',
          error: error.message,
          severity: 'error'
        });
        throw error;
      });
    };

    // Track Excel viewer lazy loading specifically
    window.addEventListener('excel-viewer-import-start', () => {
      const startTime = performance.now();
      
      window.addEventListener('excel-viewer-import-complete', () => {
        const loadTime = performance.now() - startTime;
        this.sendBundleMetrics({
          type: 'excel_dynamic_import',
          load_time: loadTime,
          category: 'critical_business_component'
        });
      }, { once: true });
    });
  }

  /**
   * Start periodic bundle analysis
   */
  startPeriodicAnalysis() {
    // Analyze bundle efficiency every 2 minutes
    setInterval(() => {
      this.analyzeBundleEfficiency();
    }, 120000);

    // Deep analysis every 5 minutes
    setInterval(() => {
      this.performDeepAnalysis();
    }, 300000);
  }

  /**
   * Analyze bundle loading efficiency
   */
  analyzeBundleEfficiency() {
    const bundles = Array.from(this.bundles.values());
    
    if (bundles.length === 0) return;

    const analysis = {
      total_bundles: bundles.length,
      total_size: bundles.reduce((sum, b) => sum + b.size, 0),
      avg_load_time: bundles.reduce((sum, b) => sum + b.loadTime, 0) / bundles.length,
      slow_bundles: bundles.filter(b => b.loadTime > 2000).length,
      large_bundles: bundles.filter(b => b.size > 200).length,
      compression_efficiency: this.calculateCompressionEfficiency(bundles)
    };

    // Check for efficiency issues
    if (analysis.slow_bundles > 2) {
      this.sendBundleAlert({
        type: 'bundle_loading_inefficient',
        slow_bundle_count: analysis.slow_bundles,
        avg_load_time: analysis.avg_load_time,
        severity: 'warning'
      });
    }

    console.log('📈 Bundle efficiency analysis:', analysis);
    this.sendBundleMetrics({ type: 'efficiency_analysis', ...analysis });
  }

  /**
   * Calculate compression efficiency
   */
  calculateCompressionEfficiency(bundles) {
    const bundlesWithCompression = bundles.filter(b => b.compressionRatio);
    if (bundlesWithCompression.length === 0) return null;

    const avgRatio = bundlesWithCompression.reduce((sum, b) => sum + parseFloat(b.compressionRatio), 0) / bundlesWithCompression.length;
    return avgRatio.toFixed(2);
  }

  /**
   * Perform deep bundle analysis
   */
  performDeepAnalysis() {
    const bundles = Array.from(this.bundles.values());
    const categories = {};
    
    // Group by category
    bundles.forEach(bundle => {
      if (!categories[bundle.category]) {
        categories[bundle.category] = [];
      }
      categories[bundle.category].push(bundle);
    });

    // Analyze each category
    const categoryAnalysis = Object.entries(categories).map(([category, bundlesInCategory]) => {
      const totalSize = bundlesInCategory.reduce((sum, b) => sum + b.size, 0);
      const avgLoadTime = bundlesInCategory.reduce((sum, b) => sum + b.loadTime, 0) / bundlesInCategory.length;
      
      return {
        category,
        bundle_count: bundlesInCategory.length,
        total_size: totalSize,
        avg_load_time: avgLoadTime,
        largest_bundle: Math.max(...bundlesInCategory.map(b => b.size))
      };
    });

    // Identify optimization opportunities
    const optimizationOpportunities = this.identifyOptimizationOpportunities(categoryAnalysis);

    console.log('🔍 Deep bundle analysis:', { categoryAnalysis, optimizationOpportunities });
    
    this.sendBundleMetrics({
      type: 'deep_analysis',
      category_analysis: categoryAnalysis,
      optimization_opportunities: optimizationOpportunities
    });
  }

  /**
   * Identify optimization opportunities
   */
  identifyOptimizationOpportunities(categoryAnalysis) {
    const opportunities = [];

    categoryAnalysis.forEach(category => {
      // Large category with multiple bundles - could benefit from better splitting
      if (category.total_size > 400 && category.bundle_count > 3) {
        opportunities.push({
          type: 'bundle_consolidation',
          category: category.category,
          message: `${category.category} has ${category.bundle_count} bundles totaling ${category.total_size.toFixed(1)}KB - consider consolidation`
        });
      }

      // Single large bundle - could benefit from splitting
      if (category.bundle_count === 1 && category.total_size > 300) {
        opportunities.push({
          type: 'bundle_splitting',
          category: category.category,
          message: `${category.category} has one large bundle (${category.total_size.toFixed(1)}KB) - consider code splitting`
        });
      }

      // Slow loading category
      if (category.avg_load_time > 3000) {
        opportunities.push({
          type: 'loading_optimization',
          category: category.category,
          message: `${category.category} has slow average load time (${category.avg_load_time.toFixed(1)}ms) - consider preloading or compression`
        });
      }
    });

    return opportunities;
  }

  /**
   * Send bundle size alert
   */
  sendBundleAlert(alertData) {
    const alert = {
      type: 'bundle_size_alert',
      timestamp: Date.now(),
      ...alertData,
      metadata: {
        total_bundles: this.bundles.size,
        total_size: this.totalSize,
        user_agent: navigator.userAgent,
        connection: this.getConnectionInfo()
      }
    };

    // Send to monitoring API
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bundle_size',
          severity: alert.severity || 'warning',
          message: this.generateAlertMessage(alert),
          metric: alert
        })
      }).catch(error => {
        console.error('Failed to send bundle alert:', error);
      });
    } else {
      console.warn('Bundle Size Alert:', alert);
    }
  }

  /**
   * Send bundle metrics
   */
  sendBundleMetrics(metricsData) {
    // Send to analytics API
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bundle_metrics',
          ...metricsData,
          timestamp: Date.now(),
          page: window.location.pathname
        })
      }).catch(error => {
        console.error('Failed to send bundle metrics:', error);
      });
    }
  }

  /**
   * Generate alert message
   */
  generateAlertMessage(alert) {
    switch (alert.type) {
      case 'bundle_size_exceeded':
        return `Bundle size exceeded: ${alert.bundleType} is ${alert.actualSize.toFixed(1)}KB (limit: ${alert.threshold}KB)`;
      case 'total_bundle_size_exceeded':
        return `Total initial bundle size exceeded: ${alert.totalSize.toFixed(1)}KB (limit: ${alert.threshold}KB)`;
      case 'dynamic_import_failed':
        return `Dynamic import failed: ${alert.module_name} - ${alert.error}`;
      case 'bundle_loading_inefficient':
        return `Bundle loading inefficient: ${alert.slow_bundle_count} slow bundles, avg load time: ${alert.avg_load_time.toFixed(1)}ms`;
      default:
        return `Bundle monitoring alert: ${alert.type}`;
    }
  }

  /**
   * Get connection information
   */
  getConnectionInfo() {
    if (!navigator.connection) return {};
    
    return {
      effective_type: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      save_data: navigator.connection.saveData
    };
  }

  /**
   * Should check total bundle size
   */
  shouldCheckTotalSize() {
    // Only check total size periodically to avoid spam
    return Date.now() % 30000 < 1000; // Check every 30 seconds approximately
  }

  /**
   * Add callback for bundle events
   */
  onBundle(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Get current bundle data
   */
  getBundles() {
    return Array.from(this.bundles.values());
  }

  /**
   * Get bundle summary
   */
  getBundleSummary() {
    const bundles = this.getBundles();
    
    return {
      total_bundles: bundles.length,
      total_size: bundles.reduce((sum, b) => sum + b.size, 0),
      largest_bundle: Math.max(...bundles.map(b => b.size), 0),
      categories: this.getBundlesByCategory(),
      performance_score: this.calculateBundlePerformanceScore()
    };
  }

  /**
   * Get bundles grouped by category
   */
  getBundlesByCategory() {
    const bundles = this.getBundles();
    const categories = {};
    
    bundles.forEach(bundle => {
      if (!categories[bundle.category]) {
        categories[bundle.category] = { count: 0, size: 0 };
      }
      categories[bundle.category].count++;
      categories[bundle.category].size += bundle.size;
    });
    
    return categories;
  }

  /**
   * Calculate bundle performance score
   */
  calculateBundlePerformanceScore() {
    const bundles = this.getBundles();
    if (bundles.length === 0) return 100;

    let score = 100;
    const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
    
    // Deduct points for large total size
    if (totalSize > 500) score -= 20;
    if (totalSize > 800) score -= 30;
    
    // Deduct points for individual large bundles
    const largeBundles = bundles.filter(b => b.size > 200).length;
    score -= largeBundles * 10;
    
    // Deduct points for slow loading bundles
    const slowBundles = bundles.filter(b => b.loadTime > 2000).length;
    score -= slowBundles * 5;
    
    return Math.max(0, score);
  }
}

// Create singleton instance
const bundleSizeMonitor = new BundleSizeMonitor();

export default bundleSizeMonitor;
export { BundleSizeMonitor };