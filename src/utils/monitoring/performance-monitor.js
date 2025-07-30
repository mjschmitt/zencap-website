/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics for Excel viewer and file operations
 */

import { sql } from '@vercel/postgres';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  fileUpload: 5000,
  fileDownload: 2000,
  excelRender: 3000,
  sheetSwitch: 500,
  search: 1000,
  cellSelection: 100,
  formulaCalculation: 2000,
  memoryWarning: 100 * 1024 * 1024, // 100MB
  memoryCritical: 200 * 1024 * 1024 // 200MB
};

// Performance monitoring class
export class PerformanceMonitor {
  constructor(componentName) {
    this.componentName = componentName;
    this.metrics = new Map();
    this.observers = new Map();
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Initialize Performance Observer for navigation timing
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  initializeObservers() {
    // Navigation timing observer
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordNavigationTiming(entry);
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
    } catch (error) {
      console.error('Failed to initialize navigation observer:', error);
    }

    // Resource timing observer
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('excel') || entry.name.includes('.xlsx')) {
            this.recordResourceTiming(entry);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      console.error('Failed to initialize resource observer:', error);
    }

    // Long task observer
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordLongTask(entry);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        console.error('Failed to initialize long task observer:', error);
      }
    }
  }

  // Start tracking a performance metric
  startMetric(metricName, metadata = {}) {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    this.metrics.set(metricName, {
      startTime,
      startMemory,
      metadata,
      marks: []
    });

    performance.mark(`${metricName}-start`);
    return metricName;
  }

  // Add intermediate mark to a metric
  markMetric(metricName, markName) {
    const metric = this.metrics.get(metricName);
    if (!metric) return;

    const markTime = performance.now();
    metric.marks.push({
      name: markName,
      time: markTime - metric.startTime,
      memory: this.getMemoryUsage() - metric.startMemory
    });

    performance.mark(`${metricName}-${markName}`);
  }

  // End tracking a performance metric
  async endMetric(metricName, additionalData = {}) {
    const metric = this.metrics.get(metricName);
    if (!metric) return null;

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    const duration = endTime - metric.startTime;
    const memoryDelta = endMemory - metric.startMemory;

    performance.mark(`${metricName}-end`);
    performance.measure(
      metricName,
      `${metricName}-start`,
      `${metricName}-end`
    );

    const result = {
      name: metricName,
      component: this.componentName,
      duration,
      memoryDelta,
      startMemory: metric.startMemory,
      endMemory,
      marks: metric.marks,
      metadata: { ...metric.metadata, ...additionalData },
      timestamp: new Date().toISOString(),
      threshold: THRESHOLDS[metricName] || null,
      exceedsThreshold: THRESHOLDS[metricName] ? duration > THRESHOLDS[metricName] : false
    };

    // Log to database in production
    if (this.isProduction) {
      await this.logMetric(result);
    }

    // Check for threshold violations
    this.checkThresholds(result);

    // Clean up
    this.metrics.delete(metricName);

    return result;
  }

  // Log metric to database
  async logMetric(metric) {
    try {
      await sql`
        INSERT INTO performance_metrics (
          component,
          metric_name,
          duration,
          memory_delta,
          metadata,
          exceeds_threshold,
          timestamp
        ) VALUES (
          ${metric.component},
          ${metric.name},
          ${metric.duration},
          ${metric.memoryDelta},
          ${JSON.stringify(metric.metadata)},
          ${metric.exceedsThreshold},
          ${metric.timestamp}
        )
      `;
    } catch (error) {
      console.error('Failed to log performance metric:', error);
      // Send to external monitoring service as fallback
      this.sendToExternalMonitoring(metric, error);
    }
  }

  // Check for threshold violations
  checkThresholds(metric) {
    if (metric.exceedsThreshold) {
      console.warn(
        `Performance threshold exceeded for ${metric.name}:`,
        `${metric.duration.toFixed(2)}ms (threshold: ${metric.threshold}ms)`
      );
      
      // Send alert for critical metrics
      if (this.isProduction) {
        this.sendPerformanceAlert(metric);
      }
    }

    // Check memory thresholds
    if (metric.endMemory > THRESHOLDS.memoryCritical) {
      this.sendMemoryAlert('critical', metric);
    } else if (metric.endMemory > THRESHOLDS.memoryWarning) {
      this.sendMemoryAlert('warning', metric);
    }
  }

  // Get current memory usage
  getMemoryUsage() {
    if (typeof window !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  // Record navigation timing
  recordNavigationTiming(entry) {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
      domComplete: entry.domComplete - entry.fetchStart,
      loadComplete: entry.loadEventEnd - entry.fetchStart
    };

    if (this.isProduction) {
      this.logNavigationMetrics(metrics);
    }
  }

  // Record resource timing
  recordResourceTiming(entry) {
    const metric = {
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      cached: entry.transferSize === 0,
      protocol: entry.nextHopProtocol
    };

    if (this.isProduction) {
      this.logResourceMetric(metric);
    }
  }

  // Record long tasks
  recordLongTask(entry) {
    const task = {
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution?.[0]?.name || 'unknown'
    };

    console.warn('Long task detected:', task);
    
    if (this.isProduction) {
      this.logLongTask(task);
    }
  }

  // Send performance alert
  async sendPerformanceAlert(metric) {
    try {
      await fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance',
          severity: 'warning',
          metric,
          message: `Performance threshold exceeded for ${metric.name}`
        })
      });
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  // Send memory alert
  async sendMemoryAlert(severity, metric) {
    try {
      await fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'memory',
          severity,
          metric,
          message: `Memory ${severity} threshold exceeded: ${(metric.endMemory / 1024 / 1024).toFixed(2)}MB`
        })
      });
    } catch (error) {
      console.error('Failed to send memory alert:', error);
    }
  }

  // Send to external monitoring service (e.g., Sentry, DataDog)
  sendToExternalMonitoring(metric, error) {
    // This would integrate with your external monitoring service
    // For now, we'll just log to console
    console.error('Metric logging failed, sending to external service:', {
      metric,
      error: error.message
    });
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }

  // Get performance summary
  async getPerformanceSummary(timeRange = '24h') {
    try {
      const result = await sql`
        SELECT 
          metric_name,
          component,
          COUNT(*) as count,
          AVG(duration) as avg_duration,
          MIN(duration) as min_duration,
          MAX(duration) as max_duration,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) as p50,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration) as p99,
          SUM(CASE WHEN exceeds_threshold THEN 1 ELSE 0 END) as threshold_violations
        FROM performance_metrics
        WHERE timestamp > NOW() - INTERVAL ${timeRange}
        GROUP BY metric_name, component
        ORDER BY count DESC
      `;

      return result.rows;
    } catch (error) {
      console.error('Failed to get performance summary:', error);
      return [];
    }
  }
}

// Create singleton instance for Excel viewer
export const excelPerformanceMonitor = new PerformanceMonitor('ExcelViewer');

// Utility functions for common metrics
export const trackFileOperation = async (operation, fileSize, fn) => {
  const monitor = new PerformanceMonitor('FileSystem');
  const metricName = `file${operation}`;
  
  monitor.startMetric(metricName, { fileSize });
  
  try {
    const result = await fn();
    await monitor.endMetric(metricName, { success: true, fileSize });
    return result;
  } catch (error) {
    await monitor.endMetric(metricName, { 
      success: false, 
      error: error.message,
      fileSize 
    });
    throw error;
  }
};

// React hook for component performance monitoring
export const usePerformanceTracking = (componentName) => {
  const monitorRef = useRef(null);

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor(componentName);
    
    return () => {
      monitorRef.current?.cleanup();
    };
  }, [componentName]);

  const trackOperation = useCallback(async (operationName, fn, metadata = {}) => {
    if (!monitorRef.current) return fn();
    
    const metricName = monitorRef.current.startMetric(operationName, metadata);
    
    try {
      const result = await fn();
      await monitorRef.current.endMetric(metricName, { success: true });
      return result;
    } catch (error) {
      await monitorRef.current.endMetric(metricName, { 
        success: false, 
        error: error.message 
      });
      throw error;
    }
  }, []);

  return {
    trackOperation,
    monitor: monitorRef.current
  };
};