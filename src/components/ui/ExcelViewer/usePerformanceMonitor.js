import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (componentName = 'ExcelViewer') => {
  const metricsRef = useRef({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    memoryUsage: 0,
    loadTime: 0
  });

  const startTimeRef = useRef(null);

  // Start performance measurement
  const startMeasure = useCallback((measureName) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${componentName}-${measureName}-start`);
    }
    startTimeRef.current = performance.now();
  }, [componentName]);

  // End performance measurement
  const endMeasure = useCallback((measureName) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${componentName}-${measureName}-end`);
      try {
        performance.measure(
          `${componentName}-${measureName}`,
          `${componentName}-${measureName}-start`,
          `${componentName}-${measureName}-end`
        );
      } catch (e) {
        // Ignore if marks don't exist
      }
    }

    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      startTimeRef.current = null;
      return duration;
    }
    return 0;
  }, [componentName]);

  // Track render performance
  useEffect(() => {
    metricsRef.current.renderCount++;
    
    const renderTime = performance.now();
    if (metricsRef.current.lastRenderTime) {
      const timeSinceLastRender = renderTime - metricsRef.current.lastRenderTime;
      metricsRef.current.avgRenderTime = 
        (metricsRef.current.avgRenderTime * (metricsRef.current.renderCount - 1) + timeSinceLastRender) / 
        metricsRef.current.renderCount;
    }
    metricsRef.current.lastRenderTime = renderTime;
  });

  // Monitor memory usage
  useEffect(() => {
    const checkMemory = () => {
      if (typeof performance !== 'undefined' && performance.memory) {
        metricsRef.current.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // Convert to MB
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return {
      ...metricsRef.current,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Log performance warning
  const logPerformanceWarning = useCallback((operation, duration, threshold = 100) => {
    if (duration > threshold) {
      if (process.env.NODE_ENV === 'development') {
        // Only log in development to avoid console pollution in production
        const warning = `Performance: ${componentName} - ${operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`;
        if (duration > threshold * 2) {
          console.warn(warning);
        }
      }
    }
  }, [componentName]);

  // Clean up performance marks on unmount
  useEffect(() => {
    return () => {
      if (typeof performance !== 'undefined' && performance.clearMarks) {
        // Clear all marks for this component
        const entries = performance.getEntriesByType('mark');
        entries.forEach(entry => {
          if (entry.name.startsWith(componentName)) {
            performance.clearMarks(entry.name);
          }
        });
      }
    };
  }, [componentName]);

  return {
    startMeasure,
    endMeasure,
    getMetrics,
    logPerformanceWarning
  };
};