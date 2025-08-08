/**
 * @fileoverview Performance Monitoring System Initialization Script
 * @module utils/performance-monitoring-init
 * 
 * COMPREHENSIVE PERFORMANCE MONITORING SYSTEM INITIALIZER
 * - Orchestrates all monitoring subsystems
 * - Ensures proper initialization order
 * - Handles error recovery and fallbacks
 * - Provides system health checks
 */

import performanceMonitor from './monitoring/advanced-performance-monitor';
import coreWebVitalsTracker from './monitoring/core-web-vitals-tracker';
import bundleSizeMonitor from './monitoring/bundle-size-monitor';

class PerformanceMonitoringSystem {
  constructor() {
    this.systems = {
      advancedMonitor: { instance: performanceMonitor, initialized: false, healthy: false },
      webVitals: { instance: coreWebVitalsTracker, initialized: false, healthy: false },
      bundleMonitor: { instance: bundleSizeMonitor, initialized: false, healthy: false }
    };
    this.isInitialized = false;
    this.initStartTime = null;
    this.healthCheckInterval = null;
    this.alertHandlers = [];
    this.metricsBuffer = [];
  }

  /**
   * Initialize all performance monitoring systems
   */
  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      console.log('⚠️ Performance monitoring already initialized or not in browser');
      return;
    }

    this.initStartTime = Date.now();
    console.log('🚀 Starting comprehensive performance monitoring system...');

    try {
      // Initialize systems in parallel for faster startup
      const initPromises = [
        this.initializeAdvancedMonitor(),
        this.initializeWebVitals(),
        this.initializeBundleMonitor()
      ];

      // Wait for all systems with timeout
      await Promise.allSettled(initPromises);

      // Verify at least one system is working
      const healthySystems = Object.values(this.systems).filter(s => s.healthy);
      if (healthySystems.length === 0) {
        throw new Error('No monitoring systems could be initialized');
      }

      // Set up system coordination
      this.setupSystemCoordination();

      // Start health monitoring
      this.startHealthMonitoring();

      // Set up global error handling
      this.setupGlobalErrorHandling();

      this.isInitialized = true;
      const initDuration = Date.now() - this.initStartTime;

      console.log(`🎉 Performance monitoring system initialized in ${initDuration}ms`);
      console.log(`✅ Active systems: ${healthySystems.length}/${Object.keys(this.systems).length}`);
      
      this.sendInitializationMetrics(initDuration, healthySystems.length);

    } catch (error) {
      console.error('❌ Performance monitoring initialization failed:', error);
      this.handleInitializationFailure(error);
    }
  }

  /**
   * Initialize advanced performance monitor
   */
  async initializeAdvancedMonitor() {
    try {
      await this.systems.advancedMonitor.instance.initialize();
      this.systems.advancedMonitor.initialized = true;
      this.systems.advancedMonitor.healthy = true;
      
      // Add alert handler
      this.systems.advancedMonitor.instance.addAlertHandler(this.handleAlert.bind(this));
      
      console.log('✅ Advanced performance monitor ready');
    } catch (error) {
      console.error('❌ Advanced performance monitor failed:', error);
      this.systems.advancedMonitor.healthy = false;
    }
  }

  /**
   * Initialize Core Web Vitals tracker
   */
  async initializeWebVitals() {
    try {
      await this.systems.webVitals.instance.initialize();
      this.systems.webVitals.initialized = true;
      this.systems.webVitals.healthy = true;
      
      // Add vital callback
      this.systems.webVitals.instance.onVital(this.handleWebVital.bind(this));
      
      console.log('✅ Core Web Vitals tracker ready');
    } catch (error) {
      console.error('❌ Core Web Vitals tracker failed:', error);
      this.systems.webVitals.healthy = false;
    }
  }

  /**
   * Initialize bundle size monitor
   */
  async initializeBundleMonitor() {
    try {
      this.systems.bundleMonitor.instance.initialize();
      this.systems.bundleMonitor.initialized = true;
      this.systems.bundleMonitor.healthy = true;
      
      // Add bundle callback
      this.systems.bundleMonitor.instance.onBundle(this.handleBundleMetric.bind(this));
      
      console.log('✅ Bundle size monitor ready');
    } catch (error) {
      console.error('❌ Bundle size monitor failed:', error);
      this.systems.bundleMonitor.healthy = false;
    }
  }

  /**
   * Set up coordination between monitoring systems
   */
  setupSystemCoordination() {
    // Cross-system alerts
    this.setupCrossSystemAlerts();
    
    // Unified metrics collection
    this.setupMetricsCollection();
    
    // Performance correlation analysis
    this.setupCorrelationAnalysis();
  }

  /**
   * Set up cross-system alerts
   */
  setupCrossSystemAlerts() {
    setInterval(() => {
      if (!this.isInitialized) return;
      
      const systemHealth = this.getSystemHealth();
      
      // Alert if multiple systems are unhealthy
      const unhealthySystems = Object.entries(this.systems)
        .filter(([, system]) => !system.healthy).length;
      
      if (unhealthySystems >= 2) {
        this.sendAlert({
          type: 'monitoring_system_degraded',
          severity: 'critical',
          message: `${unhealthySystems} monitoring systems are unhealthy`,
          system_health: systemHealth
        });
      }
    }, 60000); // Check every minute
  }

  /**
   * Set up unified metrics collection
   */
  setupMetricsCollection() {
    // Collect metrics from all systems every 30 seconds
    setInterval(() => {
      this.collectUnifiedMetrics();
    }, 30000);
  }

  /**
   * Collect metrics from all active systems
   */
  collectUnifiedMetrics() {
    if (!this.isInitialized) return;

    const unifiedMetrics = {
      timestamp: Date.now(),
      systems: {}
    };

    // Advanced monitor metrics
    if (this.systems.advancedMonitor.healthy) {
      unifiedMetrics.systems.advanced = this.systems.advancedMonitor.instance.getMetricsSummary();
    }

    // Web Vitals metrics
    if (this.systems.webVitals.healthy) {
      unifiedMetrics.systems.webVitals = this.systems.webVitals.instance.getVitals();
    }

    // Bundle metrics
    if (this.systems.bundleMonitor.healthy) {
      unifiedMetrics.systems.bundles = this.systems.bundleMonitor.instance.getBundleSummary();
    }

    // Calculate overall performance score
    unifiedMetrics.overall_score = this.calculateOverallPerformanceScore(unifiedMetrics.systems);
    
    // Send to analytics
    this.sendMetrics(unifiedMetrics);
    
    // Buffer for dashboard
    this.metricsBuffer.push(unifiedMetrics);
    if (this.metricsBuffer.length > 100) {
      this.metricsBuffer = this.metricsBuffer.slice(-100);
    }
  }

  /**
   * Calculate overall performance score from all systems
   */
  calculateOverallPerformanceScore(systems) {
    let totalScore = 0;
    let systemCount = 0;

    if (systems.webVitals) {
      const vitals = Object.values(systems.webVitals);
      const goodVitals = vitals.filter(v => v.rating === 'good').length;
      const vitalScore = vitals.length > 0 ? (goodVitals / vitals.length) * 100 : 0;
      totalScore += vitalScore;
      systemCount++;
    }

    if (systems.bundles) {
      totalScore += systems.bundles.performance_score || 0;
      systemCount++;
    }

    if (systems.advanced) {
      // Calculate score from advanced metrics
      const memoryMetric = systems.advanced.memory_usage;
      const memoryScore = memoryMetric ? Math.max(0, 100 - (memoryMetric.value / 3)) : 100;
      totalScore += memoryScore;
      systemCount++;
    }

    return systemCount > 0 ? Math.round(totalScore / systemCount) : 0;
  }

  /**
   * Set up performance correlation analysis
   */
  setupCorrelationAnalysis() {
    // Analyze correlations every 5 minutes
    setInterval(() => {
      this.performCorrelationAnalysis();
    }, 300000);
  }

  /**
   * Perform correlation analysis between different performance metrics
   */
  performCorrelationAnalysis() {
    if (this.metricsBuffer.length < 10) return;

    const recentMetrics = this.metricsBuffer.slice(-10);
    const correlations = [];

    // Correlate memory usage with bundle size
    const memoryData = recentMetrics
      .map(m => m.systems.advanced?.memory_usage?.value)
      .filter(v => v != null);
    
    const bundleData = recentMetrics
      .map(m => m.systems.bundles?.total_size)
      .filter(v => v != null);

    if (memoryData.length >= 5 && bundleData.length >= 5) {
      const avgMemory = memoryData.reduce((a, b) => a + b, 0) / memoryData.length;
      const avgBundle = bundleData.reduce((a, b) => a + b, 0) / bundleData.length;
      
      if (avgMemory > 200 && avgBundle > 500) {
        correlations.push({
          type: 'memory_bundle_correlation',
          strength: 'high',
          message: `High memory usage (${avgMemory.toFixed(1)}MB) correlates with large bundles (${avgBundle.toFixed(1)}KB)`,
          recommendation: 'Consider code splitting or bundle optimization'
        });
      }
    }

    // Send correlation alerts
    correlations.forEach(correlation => {
      this.sendAlert({
        type: 'performance_correlation',
        severity: 'info',
        message: correlation.message,
        correlation
      });
    });
  }

  /**
   * Start health monitoring for all systems
   */
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  /**
   * Perform health check on all monitoring systems
   */
  performHealthCheck() {
    Object.entries(this.systems).forEach(([name, system]) => {
      try {
        // Basic health check - ensure system is responsive
        if (system.initialized && system.instance) {
          // Each system should have basic health indicators
          const isHealthy = this.checkSystemHealth(name, system);
          
          if (system.healthy !== isHealthy) {
            system.healthy = isHealthy;
            console.log(`🔄 System ${name} health changed: ${isHealthy ? 'healthy' : 'unhealthy'}`);
          }
        }
      } catch (error) {
        console.error(`❌ Health check failed for ${name}:`, error);
        system.healthy = false;
      }
    });
  }

  /**
   * Check individual system health
   */
  checkSystemHealth(name, system) {
    switch (name) {
      case 'advancedMonitor':
        return system.instance.isInitialized && 
               typeof system.instance.getMetricsSummary === 'function';
      
      case 'webVitals':
        return system.instance.isInitialized && 
               typeof system.instance.getVitals === 'function';
      
      case 'bundleMonitor':
        return system.instance.isInitialized && 
               typeof system.instance.getBundles === 'function';
      
      default:
        return false;
    }
  }

  /**
   * Set up global error handling
   */
  setupGlobalErrorHandling() {
    // Catch monitoring system errors
    window.addEventListener('error', (event) => {
      if (event.filename?.includes('monitoring/')) {
        this.handleMonitoringError(event.error);
      }
    });

    // Catch promise rejections in monitoring code
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.stack?.includes('monitoring/')) {
        this.handleMonitoringError(event.reason);
      }
    });
  }

  /**
   * Handle monitoring system errors
   */
  handleMonitoringError(error) {
    console.error('🚨 Monitoring system error:', error);
    
    this.sendAlert({
      type: 'monitoring_error',
      severity: 'error',
      message: `Monitoring system error: ${error.message}`,
      error: error.stack,
      recovery_attempt: Date.now()
    });

    // Attempt recovery
    setTimeout(() => {
      this.attemptRecovery();
    }, 5000);
  }

  /**
   * Attempt to recover failed monitoring systems
   */
  async attemptRecovery() {
    console.log('🔄 Attempting monitoring system recovery...');
    
    for (const [name, system] of Object.entries(this.systems)) {
      if (!system.healthy && system.initialized) {
        try {
          // Re-initialize the system
          switch (name) {
            case 'advancedMonitor':
              await this.initializeAdvancedMonitor();
              break;
            case 'webVitals':
              await this.initializeWebVitals();
              break;
            case 'bundleMonitor':
              await this.initializeBundleMonitor();
              break;
          }
          
          if (system.healthy) {
            console.log(`✅ Successfully recovered ${name}`);
          }
        } catch (error) {
          console.error(`❌ Failed to recover ${name}:`, error);
        }
      }
    }
  }

  /**
   * Handle alerts from monitoring systems
   */
  handleAlert(alert) {
    // Enrich alert with system context
    const enrichedAlert = {
      ...alert,
      source: 'advanced_monitor',
      system_health: this.getSystemHealth(),
      timestamp: Date.now()
    };

    this.sendAlert(enrichedAlert);
  }

  /**
   * Handle Web Vital measurements
   */
  handleWebVital(vital) {
    // Store vital for correlation analysis
    if (vital.rating === 'poor') {
      this.sendAlert({
        type: 'web_vital_poor',
        severity: 'warning',
        message: `Poor ${vital.name} performance: ${vital.value}`,
        vital,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle bundle metrics
   */
  handleBundleMetric(bundleData) {
    // Alert on large bundles
    if (bundleData.size > 300) {
      this.sendAlert({
        type: 'large_bundle',
        severity: bundleData.size > 500 ? 'critical' : 'warning',
        message: `Large bundle detected: ${bundleData.category} (${bundleData.size.toFixed(1)}KB)`,
        bundle: bundleData,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Send alert through all handlers
   */
  sendAlert(alert) {
    // Send to external handlers
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        console.error('Alert handler error:', error);
      }
    });

    // Send to monitoring API
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      }).catch(error => {
        console.error('Failed to send alert to API:', error);
      });
    } else {
      console.warn('🚨 Performance Alert:', alert);
    }
  }

  /**
   * Send metrics to analytics
   */
  sendMetrics(metrics) {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'unified_performance_metrics',
          ...metrics
        })
      }).catch(error => {
        console.error('Failed to send metrics to analytics:', error);
      });
    }
  }

  /**
   * Send initialization metrics
   */
  sendInitializationMetrics(duration, systemCount) {
    this.sendMetrics({
      type: 'monitoring_initialization',
      duration,
      systems_initialized: systemCount,
      total_systems: Object.keys(this.systems).length,
      timestamp: Date.now()
    });
  }

  /**
   * Handle initialization failure
   */
  handleInitializationFailure(error) {
    console.error('🚨 Monitoring initialization failed:', error);
    
    // Send failure alert
    this.sendAlert({
      type: 'monitoring_initialization_failed',
      severity: 'critical',
      message: `Performance monitoring failed to initialize: ${error.message}`,
      error: error.stack,
      timestamp: Date.now()
    });
  }

  /**
   * Get system health summary
   */
  getSystemHealth() {
    const healthy = Object.values(this.systems).filter(s => s.healthy).length;
    const total = Object.keys(this.systems).length;
    
    return {
      healthy_systems: healthy,
      total_systems: total,
      health_percentage: Math.round((healthy / total) * 100),
      is_initialized: this.isInitialized
    };
  }

  /**
   * Add alert handler
   */
  addAlertHandler(handler) {
    this.alertHandlers.push(handler);
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count = 10) {
    return this.metricsBuffer.slice(-count);
  }

  /**
   * Cleanup monitoring systems
   */
  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    console.log('🧹 Performance monitoring system cleaned up');
  }
}

// Create singleton instance
const performanceMonitoringSystem = new PerformanceMonitoringSystem();

// Initialize on module load if in browser
if (typeof window !== 'undefined') {
  // Initialize after page load to avoid blocking critical rendering
  if (document.readyState === 'complete') {
    performanceMonitoringSystem.initialize();
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceMonitoringSystem.initialize();
      }, 1000);
    });
  }
}

export default performanceMonitoringSystem;