/**
 * @fileoverview Production initialization utilities
 * @module utils/initProduction
 */

import { initializeProductionConfig } from '../config/production';
import { getErrorTracker } from './errorTracking';
import { getMemoryMonitor } from './memoryMonitor';

/**
 * Initialize production features
 * @param {Object} options - Initialization options
 */
export async function initializeProduction(options = {}) {
  try {
    console.log('Initializing production features...');
    
    // Initialize production config with any overrides
    initializeProductionConfig(options.config || {});
    
    // Initialize error tracking
    if (options.errorTracking !== false) {
      const errorTracker = getErrorTracker(options.errorTrackingConfig);
      await errorTracker.initialize();
      console.log('Error tracking initialized');
    }
    
    // Initialize memory monitoring
    if (options.memoryMonitoring !== false) {
      const memoryMonitor = getMemoryMonitor(options.memoryConfig);
      memoryMonitor.start();
      
      // Set up memory warning handlers
      memoryMonitor.on('warning', (memoryInfo) => {
        console.warn('Memory warning triggered:', memoryInfo);
      });
      
      memoryMonitor.on('critical', (memoryInfo) => {
        console.error('Critical memory usage:', memoryInfo);
        // Could trigger automatic cleanup or page reload
      });
      
      console.log('Memory monitoring initialized');
    }
    
    // Set up performance monitoring
    if (options.performanceMonitoring !== false) {
      setupPerformanceMonitoring();
    }
    
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      setupGlobalHandlers();
    }
    
    console.log('Production features initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize production features:', error);
  }
}

/**
 * Set up performance monitoring
 */
function setupPerformanceMonitoring() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }
  
  try {
    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
        }
      }
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    
    // Monitor layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.value > 0.1) { // Significant layout shifts
          console.warn('Layout shift detected:', {
            value: entry.value,
            sources: entry.sources
          });
        }
      }
    });
    
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    
    console.log('Performance monitoring initialized');
    
  } catch (error) {
    console.error('Failed to set up performance monitoring:', error);
  }
}

/**
 * Set up global error and warning handlers
 */
function setupGlobalHandlers() {
  // Intercept console errors in production
  const originalError = console.error;
  console.error = function(...args) {
    originalError.apply(console, args);
    
    // Track console errors
    if (args[0] instanceof Error) {
      getErrorTracker().captureError(args[0], {
        source: 'console.error'
      });
    }
  };
  
  // Monitor unhandled promise rejections
  let unhandledRejections = 0;
  window.addEventListener('unhandledrejection', (event) => {
    unhandledRejections++;
    
    if (unhandledRejections > 10) {
      console.error('Too many unhandled promise rejections. Please refresh the page.');
    }
  });
  
  // Monitor memory pressure events (if available)
  if ('memory' in navigator && 'addEventListener' in navigator.memory) {
    navigator.memory.addEventListener('pressure', (event) => {
      console.warn('Memory pressure event:', event);
      
      // Could trigger cleanup or reduced functionality
      window.dispatchEvent(new CustomEvent('memory-pressure', {
        detail: event
      }));
    });
  }
}

/**
 * Clean up production features (for hot reloading, etc.)
 */
export function cleanupProduction() {
  try {
    // Stop memory monitoring
    const memoryMonitor = getMemoryMonitor();
    memoryMonitor.stop();
    
    // Destroy error tracking
    const errorTracker = getErrorTracker();
    errorTracker.destroy();
    
    console.log('Production features cleaned up');
    
  } catch (error) {
    console.error('Failed to cleanup production features:', error);
  }
}

/**
 * Check if running in production mode
 * @returns {boolean} True if in production
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Production-only wrapper
 * @param {Function} fn - Function to run only in production
 * @returns {*} Function result or null
 */
export function productionOnly(fn) {
  if (isProduction()) {
    return fn();
  }
  return null;
}

export default {
  initializeProduction,
  cleanupProduction,
  isProduction,
  productionOnly
};