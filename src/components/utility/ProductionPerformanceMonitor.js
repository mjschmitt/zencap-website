/**
 * Production Performance Monitor for Zenith Capital Advisors
 * Head of Frontend Engineering - Real-time performance tracking
 */
import { useEffect, useCallback, useRef, useState } from 'react';
import { PRODUCTION_CONFIG } from '../../config/production';

const ProductionPerformanceMonitor = ({ children, enabledInProduction = true }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const metricsRef = useRef({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    bundleSize: null,
    memoryUsage: null
  });
  
  const reportInterval = useRef(null);
  const observer = useRef(null);

  // Web Vitals monitoring
  const measureWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Measure First Contentful Paint (FCP)
    const measureFCP = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metricsRef.current.fcp = fcpEntry.startTime;
        if (fcpEntry.startTime > 1500) {
          console.warn(`[Performance] FCP is slow: ${fcpEntry.startTime.toFixed(0)}ms (target: <1500ms)`);
        }
      }
    };

    // Measure Largest Contentful Paint (LCP)
    const measureLCP = () => {
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            metricsRef.current.lcp = lastEntry.startTime;
            if (lastEntry.startTime > 2500) {
              console.warn(`[Performance] LCP is slow: ${lastEntry.startTime.toFixed(0)}ms (target: <2500ms)`);
            }
          }
        });
        
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('[Performance] LCP measurement not supported');
        }
      }
    };

    // Measure First Input Delay (FID)
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        const fidObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (entry.entryType === 'first-input') {
              metricsRef.current.fid = entry.processingStart - entry.startTime;
              if (entry.processingStart - entry.startTime > 100) {
                console.warn(`[Performance] FID is slow: ${(entry.processingStart - entry.startTime).toFixed(0)}ms (target: <100ms)`);
              }
            }
          });
        });
        
        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('[Performance] FID measurement not supported');
        }
      }
    };

    // Measure Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              metricsRef.current.cls = clsValue;
              if (clsValue > 0.1) {
                console.warn(`[Performance] CLS is high: ${clsValue.toFixed(3)} (target: <0.1)`);
              }
            }
          });
        });
        
        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('[Performance] CLS measurement not supported');
        }
      }
    };

    // Measure Time to First Byte (TTFB)
    const measureTTFB = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      if (navigationEntry) {
        metricsRef.current.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        if (navigationEntry.responseStart - navigationEntry.requestStart > 600) {
          console.warn(`[Performance] TTFB is slow: ${(navigationEntry.responseStart - navigationEntry.requestStart).toFixed(0)}ms (target: <600ms)`);
        }
      }
    };

    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    measureTTFB();
  }, []);

  // Memory usage monitoring
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance && performance.memory) {
      const memory = performance.memory;
      const memoryData = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
      
      metricsRef.current.memoryUsage = memoryData;
      
      // Warn if memory usage is high
      if (memoryData.percentage > 85) {
        console.warn(`[Performance] High memory usage: ${memoryData.percentage.toFixed(1)}% (${(memoryData.used / 1024 / 1024).toFixed(1)}MB)`);
      }
    }
  }, []);

  // Bundle size analysis
  const analyzeBundleSize = useCallback(() => {
    if ('navigation' in performance) {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        const bundleSize = {
          transferSize: nav.transferSize || 0,
          encodedBodySize: nav.encodedBodySize || 0,
          decodedBodySize: nav.decodedBodySize || 0
        };
        
        metricsRef.current.bundleSize = bundleSize;
        
        // Warn if bundle is too large
        if (bundleSize.transferSize > 500000) { // 500KB
          console.warn(`[Performance] Large initial bundle: ${(bundleSize.transferSize / 1024).toFixed(0)}KB (target: <500KB)`);
        }
      }
    }
  }, []);

  // Report metrics to analytics/monitoring service
  const reportMetrics = useCallback(() => {
    if (!enabledInProduction && process.env.NODE_ENV === 'production') return;
    
    const metrics = { ...metricsRef.current };
    
    // Only report if we have meaningful data
    if (metrics.fcp || metrics.lcp || metrics.fid || metrics.cls) {
      setPerformanceData(metrics);
      
      // In production, you would send this to your analytics service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to analytics
        try {
          fetch('/api/analytics/performance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...metrics,
              url: window.location.href,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            })
          }).catch(error => {
            console.warn('[Performance] Failed to report metrics:', error);
          });
        } catch (error) {
          console.warn('[Performance] Analytics reporting failed:', error);
        }
      } else {
        // Development mode: log to console
        console.group('[Performance] Web Vitals Report');
        console.log('FCP:', metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'Not measured');
        console.log('LCP:', metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'Not measured');
        console.log('FID:', metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'Not measured');
        console.log('CLS:', metrics.cls ? metrics.cls.toFixed(3) : 'Not measured');
        console.log('TTFB:', metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'Not measured');
        if (metrics.memoryUsage) {
          console.log('Memory:', `${(metrics.memoryUsage.used / 1024 / 1024).toFixed(1)}MB (${metrics.memoryUsage.percentage.toFixed(1)}%)`);
        }
        if (metrics.bundleSize) {
          console.log('Bundle Size:', `${(metrics.bundleSize.transferSize / 1024).toFixed(0)}KB`);
        }
        console.groupEnd();
      }
    }
  }, [enabledInProduction]);

  // Performance monitoring setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsMonitoring(true);
    
    // Start monitoring
    measureWebVitals();
    analyzeBundleSize();
    measureMemoryUsage();
    
    // Set up periodic reporting
    reportInterval.current = setInterval(() => {
      measureMemoryUsage();
      reportMetrics();
    }, 30000); // Report every 30 seconds
    
    // Report on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportMetrics();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Report on page unload
    const handleUnload = () => {
      reportMetrics();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    
    // Cleanup
    return () => {
      setIsMonitoring(false);
      if (reportInterval.current) {
        clearInterval(reportInterval.current);
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [measureWebVitals, analyzeBundleSize, measureMemoryUsage, reportMetrics]);

  // Development performance indicator
  if (process.env.NODE_ENV === 'development' && isMonitoring && performanceData) {
    return (
      <>
        {children}
        <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs p-3 rounded-lg font-mono max-w-xs">
          <div className="font-bold mb-1">Performance Monitor</div>
          {performanceData.fcp && (
            <div className={performanceData.fcp > 1500 ? 'text-red-400' : 'text-green-400'}>
              FCP: {performanceData.fcp.toFixed(0)}ms
            </div>
          )}
          {performanceData.lcp && (
            <div className={performanceData.lcp > 2500 ? 'text-red-400' : 'text-green-400'}>
              LCP: {performanceData.lcp.toFixed(0)}ms
            </div>
          )}
          {performanceData.cls && (
            <div className={performanceData.cls > 0.1 ? 'text-red-400' : 'text-green-400'}>
              CLS: {performanceData.cls.toFixed(3)}
            </div>
          )}
          {performanceData.memoryUsage && (
            <div className={performanceData.memoryUsage.percentage > 85 ? 'text-red-400' : 'text-green-400'}>
              Memory: {(performanceData.memoryUsage.used / 1024 / 1024).toFixed(1)}MB
            </div>
          )}
        </div>
      </>
    );
  }

  return children;
};

export default ProductionPerformanceMonitor;

// Hook for accessing performance data
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    const measureCurrentMetrics = () => {
      if (typeof window === 'undefined') return;
      
      const currentMetrics = {
        memory: 'memory' in performance ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
        } : null,
        navigation: performance.getEntriesByType('navigation')[0] || null,
        timing: performance.timing || null
      };
      
      setMetrics(currentMetrics);
    };
    
    measureCurrentMetrics();
    
    const interval = setInterval(measureCurrentMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
};

// Performance threshold checker
export const checkPerformanceThresholds = (metrics) => {
  const issues = [];
  
  if (metrics.fcp && metrics.fcp > 1500) {
    issues.push({ metric: 'FCP', value: metrics.fcp, threshold: 1500, severity: 'warning' });
  }
  
  if (metrics.lcp && metrics.lcp > 2500) {
    issues.push({ metric: 'LCP', value: metrics.lcp, threshold: 2500, severity: 'error' });
  }
  
  if (metrics.fid && metrics.fid > 100) {
    issues.push({ metric: 'FID', value: metrics.fid, threshold: 100, severity: 'warning' });
  }
  
  if (metrics.cls && metrics.cls > 0.1) {
    issues.push({ metric: 'CLS', value: metrics.cls, threshold: 0.1, severity: 'error' });
  }
  
  if (metrics.memoryUsage && metrics.memoryUsage.percentage > 85) {
    issues.push({ 
      metric: 'Memory', 
      value: metrics.memoryUsage.percentage, 
      threshold: 85, 
      severity: 'warning'
    });
  }
  
  return issues;
};
