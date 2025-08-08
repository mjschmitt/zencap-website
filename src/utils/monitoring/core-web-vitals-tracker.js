/**
 * @fileoverview Core Web Vitals Tracker - Optimized for Financial Platform
 * @module utils/monitoring/core-web-vitals-tracker
 * 
 * COMPREHENSIVE CORE WEB VITALS MONITORING
 * - LCP (Largest Contentful Paint) - Target: <2.5s
 * - INP (Interaction to Next Paint) - Target: <200ms  
 * - CLS (Cumulative Layout Shift) - Target: <0.1
 * - FCP (First Contentful Paint) - Target: <1.8s
 * - TTFB (Time to First Byte) - Target: <800ms
 */

class CoreWebVitalsTracker {
  constructor() {
    this.vitals = {};
    this.thresholds = {
      LCP: { good: 2500, needs_improvement: 4000 },
      INP: { good: 200, needs_improvement: 500 },
      FID: { good: 100, needs_improvement: 300 }, // Legacy, replaced by INP
      CLS: { good: 0.1, needs_improvement: 0.25 },
      FCP: { good: 1800, needs_improvement: 3000 },
      TTFB: { good: 800, needs_improvement: 1800 }
    };
    this.callbacks = [];
    this.isInitialized = false;
  }

  /**
   * Initialize Core Web Vitals tracking
   */
  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Import web-vitals library dynamically
      const webVitals = await import('web-vitals');
      
      // Track modern vitals (v4+ API)
      if (webVitals.onLCP) {
        webVitals.onLCP(this.handleVital.bind(this, 'LCP'));
      }
      if (webVitals.onINP) {
        webVitals.onINP(this.handleVital.bind(this, 'INP'));
      }
      if (webVitals.onCLS) {
        webVitals.onCLS(this.handleVital.bind(this, 'CLS'));
      }
      if (webVitals.onFCP) {
        webVitals.onFCP(this.handleVital.bind(this, 'FCP'));
      }
      if (webVitals.onTTFB) {
        webVitals.onTTFB(this.handleVital.bind(this, 'TTFB'));
      }

      // Legacy support for older versions
      if (webVitals.getFID && !webVitals.onINP) {
        webVitals.getFID(this.handleVital.bind(this, 'FID'));
      }
      if (webVitals.getCLS && !webVitals.onCLS) {
        webVitals.getCLS(this.handleVital.bind(this, 'CLS'));
      }
      if (webVitals.getLCP && !webVitals.onLCP) {
        webVitals.getLCP(this.handleVital.bind(this, 'LCP'));
      }

      console.log('✅ Core Web Vitals tracking initialized');
      this.isInitialized = true;

      // Set up additional performance tracking
      this.setupAdditionalTracking();

    } catch (error) {
      console.warn('⚠️ Web Vitals library not available, using fallback tracking');
      this.setupFallbackTracking();
    }
  }

  /**
   * Handle individual vital measurements
   */
  handleVital(name, metric) {
    const value = metric.value;
    const id = metric.id;
    const rating = this.getRating(name, value);

    // Store vital data
    this.vitals[name] = {
      value,
      id,
      rating,
      timestamp: Date.now(),
      delta: metric.delta,
      entries: metric.entries || []
    };

    // Fire callbacks
    this.callbacks.forEach(callback => {
      try {
        callback({ name, value, rating, id, metric });
      } catch (error) {
        console.error('Callback error for vital:', name, error);
      }
    });

    // Log performance issues
    if (rating === 'poor') {
      console.warn(`🐌 Poor ${name} performance:`, value, 'Target:', this.thresholds[name].good);
      this.sendPerformanceAlert(name, value, rating);
    }

    // Send to analytics
    this.sendToAnalytics(name, value, rating);
  }

  /**
   * Get performance rating based on thresholds
   */
  getRating(name, value) {
    const threshold = this.thresholds[name];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needs_improvement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Set up additional performance tracking beyond Core Web Vitals
   */
  setupAdditionalTracking() {
    // Track navigation timing
    this.trackNavigationTiming();
    
    // Track resource loading performance
    this.trackResourcePerformance();
    
    // Track user interactions
    this.trackInteractionPerformance();
    
    // Track memory usage
    this.trackMemoryPerformance();
  }

  /**
   * Track navigation timing metrics
   */
  trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return;

        const metrics = {
          dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp_connection: navigation.connectEnd - navigation.connectStart,
          ssl_negotiation: navigation.connectEnd - navigation.secureConnectionStart || 0,
          request_response: navigation.responseEnd - navigation.requestStart,
          dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          resource_loading: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
          total_load_time: navigation.loadEventEnd - navigation.fetchStart
        };

        Object.entries(metrics).forEach(([key, value]) => {
          if (value > 0) {
            this.handleCustomMetric(`navigation_${key}`, value);
          }
        });

        // Check for slow total load time
        if (metrics.total_load_time > 5000) {
          this.sendPerformanceAlert('page_load', metrics.total_load_time, 'poor');
        }

      }, 0);
    });
  }

  /**
   * Track resource loading performance
   */
  trackResourcePerformance() {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            // Track slow resources
            if (entry.duration > 2000) {
              this.sendPerformanceAlert('slow_resource', entry.duration, 'poor', {
                resource: entry.name,
                type: entry.initiatorType,
                size: entry.transferSize
              });
            }

            // Track Excel-specific resources
            if (entry.name.includes('excel') || entry.name.includes('.xlsx')) {
              this.handleCustomMetric('excel_resource_load', entry.duration, {
                resource: entry.name,
                size: entry.transferSize
              });
            }

            // Track critical resources
            if (entry.initiatorType === 'script' && entry.duration > 1000) {
              this.handleCustomMetric('script_load_time', entry.duration, {
                resource: entry.name
              });
            }
          }
        });
      });
      
      observer.observe({ type: 'resource', buffered: true });
    } catch (error) {
      console.error('Resource performance observer error:', error);
    }
  }

  /**
   * Track user interaction performance
   */
  trackInteractionPerformance() {
    let interactionCount = 0;
    const interactionTimes = [];

    // Track click interactions
    document.addEventListener('click', (event) => {
      const startTime = performance.now();
      interactionCount++;

      // Use requestIdleCallback to measure response time
      if (window.requestIdleCallback) {
        requestIdleCallback(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          interactionTimes.push(duration);

          // Track slow interactions
          if (duration > 100) {
            this.handleCustomMetric('slow_interaction', duration, {
              element: event.target.tagName,
              interaction_count: interactionCount
            });
          }

          // Calculate average interaction time every 10 interactions
          if (interactionTimes.length >= 10) {
            const avgTime = interactionTimes.reduce((sum, time) => sum + time, 0) / interactionTimes.length;
            this.handleCustomMetric('avg_interaction_time', avgTime);
            interactionTimes.length = 0; // Reset array
          }
        });
      }
    });

    // Track form interactions specifically
    document.addEventListener('submit', (event) => {
      const startTime = performance.now();
      
      setTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.handleCustomMetric('form_interaction_time', duration, {
          form_id: event.target.id || 'unknown',
          form_action: event.target.action || 'unknown'
        });
      }, 0);
    });
  }

  /**
   * Track memory performance
   */
  trackMemoryPerformance() {
    if (!window.performance.memory) return;

    const trackMemory = () => {
      const memory = window.performance.memory;
      const memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
      };

      // Track memory usage
      this.handleCustomMetric('memory_usage', memoryUsage.used, memoryUsage);

      // Alert on high memory usage
      const usagePercentage = (memoryUsage.used / memoryUsage.limit) * 100;
      if (usagePercentage > 80) {
        this.sendPerformanceAlert('high_memory_usage', usagePercentage, 'poor', memoryUsage);
      }
    };

    // Track memory every 30 seconds
    setInterval(trackMemory, 30000);
    
    // Initial measurement
    trackMemory();
  }

  /**
   * Handle custom metrics
   */
  handleCustomMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    // Fire callbacks for custom metrics
    this.callbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Custom metric callback error:', name, error);
      }
    });

    // Send to analytics
    this.sendToAnalytics(name, value, null, metadata);
  }

  /**
   * Send performance alert
   */
  sendPerformanceAlert(type, value, rating, metadata = {}) {
    const alert = {
      type: 'performance_alert',
      metric_type: type,
      value,
      rating,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        user_agent: navigator.userAgent,
        url: window.location.href,
        connection: this.getConnectionInfo()
      }
    };

    // Send to monitoring API
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance',
          severity: rating === 'poor' ? 'warning' : 'info',
          message: `Performance issue: ${type} = ${value}`,
          metric: alert
        })
      }).catch(error => {
        console.error('Failed to send performance alert:', error);
      });
    } else {
      console.warn('Performance Alert:', alert);
    }
  }

  /**
   * Send metrics to analytics
   */
  sendToAnalytics(name, value, rating, metadata = {}) {
    // Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'web_vital', {
        metric_name: name,
        metric_value: Math.round(value),
        metric_rating: rating,
        custom_parameter_1: JSON.stringify(metadata)
      });
    }

    // Custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance_metric',
          name,
          value,
          rating,
          metadata: {
            ...metadata,
            timestamp: Date.now(),
            page: window.location.pathname,
            referrer: document.referrer
          }
        })
      }).catch(error => {
        console.error('Failed to send metric to analytics:', error);
      });
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
      rtt: navigator.connection.rtt,
      save_data: navigator.connection.saveData
    };
  }

  /**
   * Set up fallback tracking for browsers without web-vitals support
   */
  setupFallbackTracking() {
    // Fallback LCP using largest paint entry
    window.addEventListener('load', () => {
      setTimeout(() => {
        const paintEntries = performance.getEntriesByType('paint');
        const lcpEntry = paintEntries.find(entry => entry.name === 'largest-contentful-paint');
        if (lcpEntry) {
          this.handleVital('LCP', { value: lcpEntry.startTime, id: 'fallback' });
        }
      }, 0);
    });

    // Fallback CLS using layout shift entries
    if (window.PerformanceObserver) {
      try {
        let cumulativeScore = 0;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              cumulativeScore += entry.value;
              this.handleVital('CLS', { value: cumulativeScore, id: 'fallback' });
            }
          });
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (error) {
        console.error('Fallback CLS tracking error:', error);
      }
    }

    // Basic page load timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.handleCustomMetric('page_load_time', loadTime);
      }
    });
  }

  /**
   * Add callback for vital measurements
   */
  onVital(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Get current vitals data
   */
  getVitals() {
    return { ...this.vitals };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const vitals = this.getVitals();
    const summary = {
      timestamp: Date.now(),
      vitals_count: Object.keys(vitals).length,
      poor_vitals: Object.values(vitals).filter(v => v.rating === 'poor').length,
      good_vitals: Object.values(vitals).filter(v => v.rating === 'good').length,
      overall_score: this.calculateOverallScore(vitals)
    };

    return { summary, vitals };
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore(vitals) {
    if (Object.keys(vitals).length === 0) return 0;

    let score = 100;
    Object.values(vitals).forEach(vital => {
      if (vital.rating === 'poor') score -= 20;
      else if (vital.rating === 'needs-improvement') score -= 10;
    });

    return Math.max(0, score);
  }
}

// Create singleton instance
const coreWebVitalsTracker = new CoreWebVitalsTracker();

export default coreWebVitalsTracker;
export { CoreWebVitalsTracker };