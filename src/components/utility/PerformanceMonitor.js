// src/components/utility/PerformanceMonitor.js - Client-side performance monitoring
import { useEffect, useRef } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const PerformanceMonitor = ({ debug = false }) => {
  const metricsRef = useRef({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Core Web Vitals monitoring
    const handleMetric = (metric) => {
      metricsRef.current[metric.name] = metric.value;
      
      if (debug) {
        console.log(`[Performance] ${metric.name}:`, metric.value);
      }

      // Send to analytics (optional)
      if (process.env.NODE_ENV === 'production' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    };

    // Measure Core Web Vitals
    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);

    // Custom performance metrics
    const measureCustomMetrics = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const navigationStart = timing.navigationStart;
        
        const metrics = {
          // Page load metrics
          domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
          loadComplete: timing.loadEventEnd - navigationStart,
          
          // Network metrics
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          tcpConnect: timing.connectEnd - timing.connectStart,
          
          // Render metrics
          firstPaint: timing.responseEnd - navigationStart,
          domProcessing: timing.domComplete - timing.domLoading,
        };

        if (debug) {
          console.log('[Performance] Custom Metrics:', metrics);
        }

        metricsRef.current = { ...metricsRef.current, ...metrics };
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measureCustomMetrics();
    } else {
      window.addEventListener('load', measureCustomMetrics);
    }

    // Memory usage monitoring (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        const memoryMetrics = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          memoryUsage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
        };

        if (debug) {
          console.log('[Performance] Memory Metrics:', memoryMetrics);
        }

        metricsRef.current = { ...metricsRef.current, ...memoryMetrics };
      }
    };

    // Monitor memory periodically
    const memoryInterval = setInterval(monitorMemory, 10000);

    // Cleanup
    return () => {
      clearInterval(memoryInterval);
      if (window.removeEventListener) {
        window.removeEventListener('load', measureCustomMetrics);
      }
    };
  }, [debug]);

  // Expose metrics for debugging
  useEffect(() => {
    if (debug && typeof window !== 'undefined') {
      window.performanceMetrics = metricsRef.current;
    }
  }, [debug]);

  return null; // This component doesn't render anything
};

// Performance thresholds based on Google's recommendations
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

// Helper function to categorize performance
export const categorizePerformance = (metric, value) => {
  const thresholds = PERFORMANCE_THRESHOLDS[metric];
  if (!thresholds) return 'unknown';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
};

export default PerformanceMonitor;