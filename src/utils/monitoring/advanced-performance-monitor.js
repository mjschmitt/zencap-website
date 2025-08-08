/**
 * @fileoverview Advanced Performance Monitor - Real-time monitoring for financial platform
 * @module utils/monitoring/advanced-performance-monitor
 * 
 * CRITICAL PERFORMANCE MONITORING SYSTEM
 * - Core Web Vitals tracking with thresholds
 * - Bundle size monitoring with alerts
 * - Excel viewer memory leak detection
 * - Real-time performance alerts
 * - Database query performance tracking
 * - Network latency monitoring
 */

class AdvancedPerformanceMonitor {
  constructor() {
    this.isInitialized = false;
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = this.getPerformanceThresholds();
    this.alertHandlers = [];
    this.memoryBaseline = null;
    this.performanceEntries = [];
    this.lastReportTime = Date.now();
    
    // Initialize immediately if in browser
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Performance thresholds based on financial platform requirements
   */
  getPerformanceThresholds() {
    return {
      // Core Web Vitals (optimized for financial platform)
      LCP: { good: 2000, needs_improvement: 2500, poor: 4000 }, // Large Contentful Paint
      FID: { good: 100, needs_improvement: 200, poor: 300 },   // First Input Delay
      CLS: { good: 0.1, needs_improvement: 0.2, poor: 0.25 },  // Cumulative Layout Shift
      INP: { good: 200, needs_improvement: 500, poor: 1000 },  // Interaction to Next Paint
      
      // Custom financial platform metrics
      API_RESPONSE: { good: 500, needs_improvement: 1000, poor: 2000 }, // API response time
      EXCEL_LOAD: { good: 3000, needs_improvement: 5000, poor: 8000 },  // Excel viewer load time
      BUNDLE_SIZE: { good: 200, needs_improvement: 350, poor: 500 },     // Bundle size in KB
      MEMORY_USAGE: { good: 100, needs_improvement: 200, poor: 300 },    // Memory in MB
      
      // Business critical thresholds
      TRANSACTION_TIME: { good: 2000, needs_improvement: 5000, poor: 10000 }, // Payment processing
      MODEL_DOWNLOAD: { good: 1000, needs_improvement: 3000, poor: 5000 },    // Model download time
    };
  }

  /**
   * Initialize comprehensive monitoring
   */
  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Set memory baseline
      this.memoryBaseline = this.getMemoryUsage();
      
      // Initialize Core Web Vitals monitoring
      await this.initializeWebVitals();
      
      // Initialize custom performance observers
      this.initializePerformanceObservers();
      
      // Initialize network monitoring
      this.initializeNetworkMonitoring();
      
      // Initialize Excel viewer monitoring
      this.initializeExcelMonitoring();
      
      // Initialize bundle size monitoring
      this.initializeBundleMonitoring();
      
      // Initialize memory leak detection
      this.initializeMemoryMonitoring();
      
      // Initialize error tracking
      this.initializeErrorTracking();
      
      // Set up periodic reporting
      this.startPeriodicReporting();
      
      this.isInitialized = true;
      console.log('🚀 Advanced Performance Monitor initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize performance monitor:', error);
    }
  }

  /**
   * Initialize Web Vitals monitoring with enhanced reporting
   */
  async initializeWebVitals() {
    try {
      const webVitalsModule = await import('web-vitals');
      
      // Modern Web Vitals API (v4+)
      const vitalsHandlers = {
        onLCP: this.createVitalHandler('LCP'),
        onINP: this.createVitalHandler('INP'), // Replaces FID in newer versions
        onCLS: this.createVitalHandler('CLS'),
        onFCP: this.createVitalHandler('FCP'),
        onTTFB: this.createVitalHandler('TTFB')
      };

      // Register handlers for available vitals
      Object.entries(vitalsHandlers).forEach(([method, handler]) => {
        if (webVitalsModule[method] && typeof webVitalsModule[method] === 'function') {
          webVitalsModule[method](handler);
        }
      });

      // Fallback for legacy API
      if (webVitalsModule.getFID) {
        webVitalsModule.getFID(this.createVitalHandler('FID'));
      }

      console.log('✅ Web Vitals monitoring initialized');
      
    } catch (error) {
      console.warn('⚠️ Web Vitals not available, using fallback monitoring:', error);
      this.initializeFallbackVitals();
    }
  }

  /**
   * Create vital handler with threshold checking and alerts
   */
  createVitalHandler(vitalName) {
    return (metric) => {
      const value = metric.value;
      const threshold = this.thresholds[vitalName];
      
      // Store metric
      this.metrics.set(`vital_${vitalName}`, {
        value,
        timestamp: Date.now(),
        id: metric.id,
        name: vitalName,
        rating: this.getRating(value, threshold)
      });

      // Check thresholds and trigger alerts
      this.checkThresholdAndAlert(vitalName, value, threshold);
      
      // Send to analytics
      this.sendMetricToAnalytics({
        type: 'web_vital',
        name: vitalName,
        value,
        rating: this.getRating(value, threshold),
        timestamp: new Date().toISOString()
      });
    };
  }

  /**
   * Initialize performance observers for detailed monitoring
   */
  initializePerformanceObservers() {
    if (!window.PerformanceObserver) return;

    // Navigation timing observer
    this.createPerformanceObserver('navigation', (entries) => {
      entries.forEach(entry => {
        const metrics = {
          dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
          tcp_connect: entry.connectEnd - entry.connectStart,
          ssl_time: entry.connectEnd - entry.secureConnectionStart || 0,
          response_time: entry.responseEnd - entry.responseStart,
          dom_load: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          load_complete: entry.loadEventEnd - entry.loadEventStart
        };

        Object.entries(metrics).forEach(([key, value]) => {
          if (value > 0) {
            this.metrics.set(`navigation_${key}`, {
              value,
              timestamp: Date.now(),
              name: key
            });
          }
        });
      });
    });

    // Resource timing observer
    this.createPerformanceObserver('resource', (entries) => {
      entries.forEach(entry => {
        // Track slow resources
        if (entry.duration > 1000) {
          this.sendAlert({
            type: 'slow_resource',
            severity: 'warning',
            message: `Slow resource detected: ${entry.name}`,
            value: entry.duration,
            resource: entry.name,
            resource_type: entry.initiatorType
          });
        }

        // Track Excel-related resources
        if (entry.name.includes('excel') || entry.name.includes('.xlsx')) {
          this.metrics.set('excel_resource_timing', {
            value: entry.duration,
            timestamp: Date.now(),
            name: entry.name,
            size: entry.transferSize || 0
          });
        }
      });
    });

    // Long task observer (for detecting performance bottlenecks)
    this.createPerformanceObserver('longtask', (entries) => {
      entries.forEach(entry => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          this.sendAlert({
            type: 'long_task',
            severity: entry.duration > 100 ? 'warning' : 'info',
            message: `Long task detected: ${entry.duration.toFixed(1)}ms`,
            value: entry.duration,
            start_time: entry.startTime
          });
        }
      });
    });

    // Measure observer for custom metrics
    this.createPerformanceObserver('measure', (entries) => {
      entries.forEach(entry => {
        this.metrics.set(`custom_${entry.name}`, {
          value: entry.duration,
          timestamp: Date.now(),
          name: entry.name
        });
      });
    });
  }

  /**
   * Create and configure performance observer
   */
  createPerformanceObserver(type, callback) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`⚠️ Could not create ${type} observer:`, error);
    }
  }

  /**
   * Initialize network monitoring
   */
  initializeNetworkMonitoring() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0]?.toString() || 'unknown';
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Track API performance
        if (url.includes('/api/')) {
          const endpoint = url.split('/api/')[1]?.split('?')[0] || 'unknown';
          this.trackAPIPerformance(endpoint, duration, response.ok);
        }
        
        // Track model downloads
        if (url.includes('models/') || url.includes('.xlsx')) {
          this.trackModelDownload(url, duration, response.ok);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.sendAlert({
          type: 'network_error',
          severity: 'error',
          message: `Network request failed: ${url}`,
          duration,
          error: error.message
        });
        
        throw error;
      }
    };
  }

  /**
   * Track API performance with business context
   */
  trackAPIPerformance(endpoint, duration, success) {
    const threshold = this.thresholds.API_RESPONSE;
    const rating = this.getRating(duration, threshold);
    
    this.metrics.set(`api_${endpoint}`, {
      value: duration,
      timestamp: Date.now(),
      success,
      rating,
      endpoint
    });

    // Alert on critical API slowness
    if (duration > threshold.poor) {
      this.sendAlert({
        type: 'api_performance',
        severity: 'critical',
        message: `Critical API slowness: ${endpoint} took ${duration.toFixed(1)}ms`,
        endpoint,
        duration,
        threshold: threshold.poor
      });
    }

    // Track transaction-critical endpoints
    if (['stripe', 'orders', 'models'].some(critical => endpoint.includes(critical))) {
      this.trackCriticalTransaction(endpoint, duration, success);
    }
  }

  /**
   * Track critical business transactions
   */
  trackCriticalTransaction(type, duration, success) {
    const threshold = this.thresholds.TRANSACTION_TIME;
    
    this.metrics.set(`transaction_${type}`, {
      value: duration,
      timestamp: Date.now(),
      success,
      rating: this.getRating(duration, threshold)
    });

    if (!success || duration > threshold.needs_improvement) {
      this.sendAlert({
        type: 'critical_transaction',
        severity: success ? 'warning' : 'critical',
        message: `Transaction issue: ${type} - ${duration.toFixed(1)}ms (${success ? 'succeeded' : 'failed'})`,
        transaction_type: type,
        duration,
        success
      });
    }
  }

  /**
   * Initialize Excel viewer specific monitoring
   */
  initializeExcelMonitoring() {
    // Monitor Excel viewer component lifecycle
    window.addEventListener('excel-viewer-start', (event) => {
      performance.mark('excel-viewer-start');
    });

    window.addEventListener('excel-viewer-loaded', (event) => {
      performance.mark('excel-viewer-loaded');
      performance.measure('excel-load-time', 'excel-viewer-start', 'excel-viewer-loaded');
      
      const entries = performance.getEntriesByName('excel-load-time');
      if (entries.length > 0) {
        const loadTime = entries[entries.length - 1].duration;
        const threshold = this.thresholds.EXCEL_LOAD;
        
        this.metrics.set('excel_load_time', {
          value: loadTime,
          timestamp: Date.now(),
          rating: this.getRating(loadTime, threshold)
        });

        if (loadTime > threshold.poor) {
          this.sendAlert({
            type: 'excel_performance',
            severity: 'warning',
            message: `Excel viewer slow load: ${loadTime.toFixed(1)}ms`,
            load_time: loadTime,
            threshold: threshold.poor
          });
        }
      }
    });

    // Monitor Excel processing errors
    window.addEventListener('excel-error', (event) => {
      this.sendAlert({
        type: 'excel_error',
        severity: 'error',
        message: `Excel processing error: ${event.detail?.message || 'Unknown error'}`,
        error_details: event.detail
      });
    });
  }

  /**
   * Initialize memory monitoring and leak detection
   */
  initializeMemoryMonitoring() {
    if (!window.performance?.memory) return;

    // Monitor memory every 30 seconds
    setInterval(() => {
      const currentMemory = this.getMemoryUsage();
      const memoryDelta = currentMemory.used - this.memoryBaseline.used;
      
      this.metrics.set('memory_usage', {
        value: currentMemory.used,
        delta: memoryDelta,
        timestamp: Date.now(),
        heap_total: currentMemory.total,
        heap_limit: currentMemory.limit
      });

      // Alert on high memory usage
      const thresholdMB = this.thresholds.MEMORY_USAGE;
      if (currentMemory.used > thresholdMB.poor) {
        this.sendAlert({
          type: 'memory_usage',
          severity: 'critical',
          message: `High memory usage: ${currentMemory.used.toFixed(1)}MB`,
          memory_used: currentMemory.used,
          memory_limit: currentMemory.limit
        });
      }

      // Check for potential memory leaks (consistent growth)
      if (memoryDelta > 50 && Date.now() - this.lastReportTime > 300000) { // 5 minutes
        this.sendAlert({
          type: 'memory_leak',
          severity: 'warning',
          message: `Potential memory leak detected: +${memoryDelta.toFixed(1)}MB since baseline`,
          memory_growth: memoryDelta,
          duration_minutes: (Date.now() - this.lastReportTime) / 60000
        });
      }
    }, 30000);
  }

  /**
   * Initialize bundle size monitoring
   */
  initializeBundleMonitoring() {
    // Monitor script loading
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      if (script.src.includes('_next/static/chunks/')) {
        // Estimate bundle size from script loading time
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.name === script.src) {
              const estimatedSize = (entry.transferSize || entry.encodedBodySize || 0) / 1024;
              totalSize += estimatedSize;
              
              if (estimatedSize > 100) { // Large chunk warning
                this.sendAlert({
                  type: 'large_bundle',
                  severity: 'warning',
                  message: `Large bundle chunk detected: ${estimatedSize.toFixed(1)}KB`,
                  chunk_size: estimatedSize,
                  chunk_url: entry.name
                });
              }
            }
          });
        });
        
        observer.observe({ type: 'resource', buffered: true });
      }
    });

    // Check total bundle size threshold
    setTimeout(() => {
      if (totalSize > this.thresholds.BUNDLE_SIZE.poor) {
        this.sendAlert({
          type: 'bundle_size',
          severity: 'critical',
          message: `Large total bundle size: ${totalSize.toFixed(1)}KB`,
          total_size: totalSize,
          threshold: this.thresholds.BUNDLE_SIZE.poor
        });
      }
    }, 5000);
  }

  /**
   * Enhanced error tracking with context
   */
  initializeErrorTracking() {
    // Enhanced global error handler
    window.addEventListener('error', (event) => {
      this.sendAlert({
        type: 'javascript_error',
        severity: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        memory_usage: this.getMemoryUsage().used
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.sendAlert({
        type: 'promise_rejection',
        severity: 'error',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start periodic performance reporting
   */
  startPeriodicReporting() {
    // Report every 60 seconds
    setInterval(() => {
      this.generatePerformanceReport();
    }, 60000);

    // Generate summary report every 5 minutes
    setInterval(() => {
      this.generateSummaryReport();
    }, 300000);
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport() {
    const currentTime = Date.now();
    const reportData = {
      timestamp: new Date().toISOString(),
      session_duration: currentTime - this.lastReportTime,
      metrics: this.getMetricsSummary(),
      alerts: this.getRecentAlerts(),
      system_health: this.calculateSystemHealth(),
      recommendations: this.generateRecommendations()
    };

    // Send to monitoring API
    this.sendToMonitoringAPI(reportData);
    
    this.lastReportTime = currentTime;
  }

  /**
   * Calculate system health score
   */
  calculateSystemHealth() {
    let score = 100;
    const checks = [];

    // Check Core Web Vitals
    ['LCP', 'INP', 'CLS'].forEach(vital => {
      const metric = this.metrics.get(`vital_${vital}`);
      if (metric) {
        const rating = metric.rating;
        if (rating === 'poor') {
          score -= 20;
          checks.push({ check: `${vital}_performance`, status: 'failing', impact: 20 });
        } else if (rating === 'needs-improvement') {
          score -= 10;
          checks.push({ check: `${vital}_performance`, status: 'warning', impact: 10 });
        } else {
          checks.push({ check: `${vital}_performance`, status: 'passing', impact: 0 });
        }
      }
    });

    // Check API performance
    const apiMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith('api_'));
    
    const slowAPIs = apiMetrics.filter(([, metric]) => metric.rating === 'poor').length;
    if (slowAPIs > 0) {
      score -= Math.min(30, slowAPIs * 10);
      checks.push({ check: 'api_performance', status: 'failing', impact: Math.min(30, slowAPIs * 10) });
    }

    // Check memory usage
    const memoryMetric = this.metrics.get('memory_usage');
    if (memoryMetric && memoryMetric.value > this.thresholds.MEMORY_USAGE.poor) {
      score -= 15;
      checks.push({ check: 'memory_usage', status: 'failing', impact: 15 });
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      status: score >= 90 ? 'healthy' : score >= 70 ? 'warning' : 'critical',
      checks
    };
  }

  /**
   * Utility methods
   */
  getRating(value, threshold) {
    if (!threshold) return 'unknown';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needs_improvement) return 'needs-improvement';
    return 'poor';
  }

  getMemoryUsage() {
    if (!window.performance?.memory) return { used: 0, total: 0, limit: 0 };
    
    return {
      used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }

  /**
   * Send alert to monitoring system
   */
  sendAlert(alert) {
    // Add context
    alert.timestamp = new Date().toISOString();
    alert.session_id = this.getSessionId();
    alert.page_url = window.location.href;
    alert.user_agent = navigator.userAgent;

    // Store alert
    if (!this.recentAlerts) this.recentAlerts = [];
    this.recentAlerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.recentAlerts.length > 100) {
      this.recentAlerts = this.recentAlerts.slice(-100);
    }

    // Send to external monitoring if in production
    if (process.env.NODE_ENV === 'production') {
      this.sendAlertToExternal(alert);
    } else {
      console.warn('🚨 Performance Alert:', alert);
    }

    // Trigger alert handlers
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        console.error('Alert handler error:', error);
      }
    });
  }

  /**
   * Send metric to analytics
   */
  sendMetricToAnalytics(metric) {
    // Store locally
    this.performanceEntries.push(metric);
    
    // Keep only last 1000 entries
    if (this.performanceEntries.length > 1000) {
      this.performanceEntries = this.performanceEntries.slice(-1000);
    }

    // Send to analytics service
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating
      });
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metric:', metric);
    }
  }

  /**
   * Add alert handler
   */
  addAlertHandler(handler) {
    this.alertHandlers.push(handler);
  }

  /**
   * Get current metrics summary
   */
  getMetricsSummary() {
    const summary = {};
    this.metrics.forEach((value, key) => {
      summary[key] = value;
    });
    return summary;
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(minutes = 60) {
    if (!this.recentAlerts) return [];
    
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.recentAlerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoff
    );
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Analyze metrics and generate recommendations
    this.metrics.forEach((metric, key) => {
      if (metric.rating === 'poor') {
        if (key.startsWith('vital_LCP')) {
          recommendations.push({
            type: 'optimization',
            priority: 'high',
            message: 'Large Contentful Paint is poor',
            action: 'Optimize images, reduce server response time, implement preloading'
          });
        }
        if (key.startsWith('api_')) {
          recommendations.push({
            type: 'optimization',
            priority: 'high',
            message: `API endpoint ${key} is performing poorly`,
            action: 'Review database queries, add caching, optimize server logic'
          });
        }
      }
    });

    return recommendations;
  }

  /**
   * Get session identifier
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    return this.sessionId;
  }

  /**
   * Send to external monitoring API
   */
  async sendAlertToExternal(alert) {
    try {
      await fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send alert to external monitoring:', error);
    }
  }

  /**
   * Send to monitoring API
   */
  async sendToMonitoringAPI(data) {
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send metrics to monitoring API:', error);
    }
  }

  /**
   * Fallback vitals monitoring for older browsers
   */
  initializeFallbackVitals() {
    // Basic LCP approximation
    window.addEventListener('load', () => {
      setTimeout(() => {
        const entries = performance.getEntriesByType('paint');
        const lcp = entries.find(entry => entry.name === 'largest-contentful-paint');
        if (lcp) {
          this.createVitalHandler('LCP')({ value: lcp.startTime, id: 'fallback' });
        }
      }, 0);
    });

    // Basic CLS approximation using scroll events
    let clsScore = 0;
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const unexpectedMovement = Math.abs(currentScrollY - lastScrollY);
      
      if (unexpectedMovement > 5) { // Threshold for unexpected layout shift
        clsScore += 0.01; // Small increment for approximation
        this.createVitalHandler('CLS')({ value: clsScore, id: 'fallback' });
      }
      
      lastScrollY = currentScrollY;
    });
  }

  /**
   * Track model download performance
   */
  trackModelDownload(url, duration, success) {
    const threshold = this.thresholds.MODEL_DOWNLOAD;
    
    this.metrics.set('model_download', {
      value: duration,
      timestamp: Date.now(),
      success,
      url,
      rating: this.getRating(duration, threshold)
    });

    if (duration > threshold.poor) {
      this.sendAlert({
        type: 'model_download',
        severity: 'warning',
        message: `Slow model download: ${duration.toFixed(1)}ms`,
        url,
        duration
      });
    }
  }

  /**
   * Check threshold and send alert if necessary
   */
  checkThresholdAndAlert(metricName, value, threshold) {
    if (!threshold) return;
    
    const rating = this.getRating(value, threshold);
    
    if (rating === 'poor') {
      this.sendAlert({
        type: 'threshold_exceeded',
        severity: 'warning',
        message: `${metricName} performance is poor: ${value}`,
        metric_name: metricName,
        value,
        threshold: threshold.poor,
        rating
      });
    }
  }
}

// Create singleton instance
const performanceMonitor = new AdvancedPerformanceMonitor();

// Export for use in components and pages
export default performanceMonitor;

// Export class for testing
export { AdvancedPerformanceMonitor };