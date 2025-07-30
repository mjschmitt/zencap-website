/**
 * Monitoring hook for Excel viewer
 * Integrates performance tracking, error handling, and analytics
 */

import { useEffect, useRef, useCallback } from 'react';
import { PerformanceMonitor } from '@/utils/monitoring/performance-monitor';
import { errorTracker, ErrorCategory, ErrorSeverity } from '@/utils/monitoring/error-tracker';
import { userAnalytics, EventType } from '@/utils/monitoring/user-analytics';

export const useMonitoring = (componentName = 'ExcelViewer') => {
  const performanceMonitor = useRef(null);
  const sessionData = useRef({
    startTime: Date.now(),
    operations: 0,
    errors: 0
  });

  // Initialize performance monitor
  useEffect(() => {
    performanceMonitor.current = new PerformanceMonitor(componentName);
    
    // Track component mount
    userAnalytics.trackEvent(EventType.EXCEL_OPEN, {
      component: componentName,
      timestamp: Date.now()
    });

    return () => {
      // Track component unmount
      userAnalytics.trackEvent(EventType.EXCEL_CLOSE, {
        component: componentName,
        sessionDuration: Date.now() - sessionData.current.startTime,
        totalOperations: sessionData.current.operations,
        totalErrors: sessionData.current.errors
      });

      // Cleanup performance monitor
      performanceMonitor.current?.cleanup();
    };
  }, [componentName]);

  // Track file operation
  const trackFileOperation = useCallback(async (operation, fileData, fn) => {
    sessionData.current.operations++;
    
    const metricName = `file${operation}`;
    performanceMonitor.current?.startMetric(metricName, {
      fileName: fileData.name,
      fileSize: fileData.size,
      fileType: fileData.type
    });

    try {
      const result = await fn();
      
      await performanceMonitor.current?.endMetric(metricName, {
        success: true,
        fileName: fileData.name,
        fileSize: fileData.size
      });

      // Track analytics
      await userAnalytics.trackFileOperation(operation, {
        ...fileData,
        success: true,
        duration: performance.now()
      });

      return result;
    } catch (error) {
      sessionData.current.errors++;
      
      await performanceMonitor.current?.endMetric(metricName, {
        success: false,
        error: error.message,
        fileName: fileData.name,
        fileSize: fileData.size
      });

      // Track error
      await errorTracker.trackError({
        category: ErrorCategory.FILE_UPLOAD,
        severity: ErrorSeverity.MEDIUM,
        message: `File ${operation} failed: ${error.message}`,
        metadata: {
          operation,
          fileName: fileData.name,
          fileSize: fileData.size,
          fileType: fileData.type
        }
      });

      // Track analytics
      await userAnalytics.trackFileOperation(operation, {
        ...fileData,
        success: false,
        error: error.message
      });

      throw error;
    }
  }, []);

  // Track Excel operation
  const trackExcelOperation = useCallback(async (operation, fn, metadata = {}) => {
    sessionData.current.operations++;
    
    const metricName = `excel${operation}`;
    performanceMonitor.current?.startMetric(metricName, metadata);

    try {
      const result = await fn();
      
      await performanceMonitor.current?.endMetric(metricName, {
        success: true,
        ...metadata
      });

      // Track analytics
      await userAnalytics.trackExcelEvent(`excel_${operation}`, {
        ...metadata,
        success: true,
        duration: performance.now()
      });

      return result;
    } catch (error) {
      sessionData.current.errors++;
      
      await performanceMonitor.current?.endMetric(metricName, {
        success: false,
        error: error.message,
        ...metadata
      });

      // Track error
      await errorTracker.trackError({
        category: ErrorCategory.EXCEL_PARSING,
        severity: ErrorSeverity.MEDIUM,
        message: `Excel ${operation} failed: ${error.message}`,
        metadata: {
          operation,
          ...metadata
        }
      });

      // Track analytics
      await userAnalytics.trackExcelEvent(`excel_${operation}`, {
        ...metadata,
        success: false,
        error: error.message
      });

      throw error;
    }
  }, []);

  // Track user interaction
  const trackUserInteraction = useCallback((eventType, eventData = {}) => {
    sessionData.current.operations++;
    
    userAnalytics.trackEvent(eventType, {
      component: componentName,
      ...eventData
    });
  }, [componentName]);

  // Track rendering performance
  const trackRenderPerformance = useCallback((renderData) => {
    const { renderTime, cellCount, sheetIndex } = renderData;
    
    // Check if render time exceeds threshold
    if (renderTime > 1000) {
      performanceMonitor.current?.sendPerformanceAlert({
        name: 'slowRender',
        component: componentName,
        duration: renderTime,
        threshold: 1000,
        metadata: { cellCount, sheetIndex }
      });
    }

    // Track analytics
    userAnalytics.trackExcelEvent('excel_render', {
      renderTime,
      cellCount,
      sheetIndex,
      performanceScore: renderTime < 500 ? 'excellent' : 
                       renderTime < 1000 ? 'good' : 
                       renderTime < 3000 ? 'fair' : 'poor'
    });
  }, [componentName]);

  // Track error
  const trackError = useCallback((error, context = {}) => {
    sessionData.current.errors++;
    
    return errorTracker.trackError({
      category: ErrorCategory.EXCEL_RENDER,
      severity: error.severity || ErrorSeverity.MEDIUM,
      message: error.message || 'Unknown error',
      stack: error.stack,
      metadata: {
        component: componentName,
        ...context
      }
    });
  }, [componentName]);

  // Get monitoring summary
  const getMonitoringSummary = useCallback(() => {
    const sessionDuration = Date.now() - sessionData.current.startTime;
    
    return {
      sessionDuration,
      totalOperations: sessionData.current.operations,
      totalErrors: sessionData.current.errors,
      errorRate: sessionData.current.operations > 0 
        ? (sessionData.current.errors / sessionData.current.operations) * 100 
        : 0,
      operationsPerMinute: sessionData.current.operations / (sessionDuration / 60000)
    };
  }, []);

  return {
    trackFileOperation,
    trackExcelOperation,
    trackUserInteraction,
    trackRenderPerformance,
    trackError,
    getMonitoringSummary,
    // Expose event types for convenience
    EventType: {
      SHEET_SWITCH: EventType.SHEET_SWITCH,
      CELL_SELECT: EventType.CELL_SELECT,
      FORMULA_VIEW: EventType.FORMULA_VIEW,
      SEARCH_PERFORM: EventType.SEARCH_PERFORM,
      EXPORT_DATA: EventType.EXPORT_DATA,
      PRINT_PREVIEW: EventType.PRINT_PREVIEW,
      FULLSCREEN_TOGGLE: EventType.FULLSCREEN_TOGGLE,
      ZOOM_CHANGE: EventType.ZOOM_CHANGE
    }
  };
};