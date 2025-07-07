// src/components/PerformanceMonitor.js - Fixed web-vitals import
import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    const initializePerformanceMonitoring = async () => {
      try {
        // Web Vitals tracking
        await reportWebVitals();
        
        // Error tracking
        setupErrorTracking();
        
        // Resource timing
        trackResourceTiming();
        
        // User interaction tracking
        trackUserInteractions();
        
        // Custom business metrics
        trackBusinessMetrics();
        
      } catch (error) {
        console.error('Performance monitoring initialization failed:', error);
      }
    };
    
    // Report Web Vitals with enhanced metrics and proper error handling
    const reportWebVitals = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Try to import web-vitals with proper error handling
        const webVitals = await import('web-vitals');
        
        // Check if the functions exist before calling them
        if (webVitals.getCLS && typeof webVitals.getCLS === 'function') {
          webVitals.getCLS(sendMetricToAnalytics);
        }
        if (webVitals.getFID && typeof webVitals.getFID === 'function') {
          webVitals.getFID(sendMetricToAnalytics);
        }
        if (webVitals.getLCP && typeof webVitals.getLCP === 'function') {
          webVitals.getLCP(sendMetricToAnalytics);
        }
        if (webVitals.getFCP && typeof webVitals.getFCP === 'function') {
          webVitals.getFCP(sendMetricToAnalytics);
        }
        if (webVitals.getTTFB && typeof webVitals.getTTFB === 'function') {
          webVitals.getTTFB(sendMetricToAnalytics);
        }
        
        // Try the new web-vitals v4 API as fallback
        if (webVitals.onCLS && typeof webVitals.onCLS === 'function') {
          webVitals.onCLS(sendMetricToAnalytics);
        }
        if (webVitals.onFID && typeof webVitals.onFID === 'function') {
          webVitals.onFID(sendMetricToAnalytics);
        }
        if (webVitals.onLCP && typeof webVitals.onLCP === 'function') {
          webVitals.onLCP(sendMetricToAnalytics);
        }
        if (webVitals.onFCP && typeof webVitals.onFCP === 'function') {
          webVitals.onFCP(sendMetricToAnalytics);
        }
        if (webVitals.onTTFB && typeof webVitals.onTTFB === 'function') {
          webVitals.onTTFB(sendMetricToAnalytics);
        }
        
      } catch (error) {
        console.error('Web Vitals reporting failed:', error);
        // Fallback to basic performance tracking
        trackBasicPerformance();
      }
    };
    
    // Fallback performance tracking without web-vitals
    const trackBasicPerformance = () => {
      if (typeof window === 'undefined' || !window.performance) return;
      
      try {
        // Basic performance metrics
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          sendMetricToAnalytics({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            timestamp: new Date().toISOString()
          });
        }
        
        // First Paint
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
          sendMetricToAnalytics({
            name: entry.name.replace('-', '_'),
            value: entry.startTime,
            timestamp: new Date().toISOString()
          });
        });
        
      } catch (error) {
        console.error('Basic performance tracking failed:', error);
      }
    };
    
    // Enhanced error tracking
    const setupErrorTracking = () => {
      // Global error handler
      window.addEventListener('error', (event) => {
        sendErrorToAnalytics({
          type: 'javascript_error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      });
      
      // Promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        sendErrorToAnalytics({
          type: 'unhandled_promise_rejection',
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      });
    };
    
    // Track resource loading performance
    const trackResourceTiming = () => {
      if (!window.PerformanceObserver) return;
      
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              // Track slow resources
              if (entry.duration > 1000) { // Resources taking more than 1 second
                sendMetricToAnalytics({
                  name: 'slow_resource',
                  value: entry.duration,
                  resource_name: entry.name,
                  resource_type: entry.initiatorType,
                  timestamp: new Date().toISOString()
                });
              }
            }
          });
        });
        
        observer.observe({ type: 'resource', buffered: true });
      } catch (error) {
        console.error('Resource timing tracking failed:', error);
      }
    };
    
    // Track user interaction performance
    const trackUserInteractions = () => {
      const interactionStartTimes = new Map();
      
      // Track button clicks
      document.addEventListener('click', (event) => {
        const target = event.target.closest('button, a, [role="button"]');
        if (target) {
          const startTime = performance.now();
          const identifier = target.textContent?.trim() || target.className || 'unknown';
          
          interactionStartTimes.set(identifier, startTime);
          
          // Measure interaction response time
          if (window.requestIdleCallback) {
            requestIdleCallback(() => {
              const endTime = performance.now();
              const duration = endTime - startTime;
              
              if (duration > 100) { // Track interactions slower than 100ms
                sendMetricToAnalytics({
                  name: 'slow_interaction',
                  value: duration,
                  interaction_type: 'click',
                  element: identifier,
                  timestamp: new Date().toISOString()
                });
              }
            });
          }
        }
      });
    };
    
    // Track business-specific metrics
    const trackBusinessMetrics = () => {
      // Track form submissions
      document.addEventListener('submit', (event) => {
        const form = event.target;
        const formId = form.id || form.className || 'unknown_form';
        
        sendMetricToAnalytics({
          name: 'form_submission',
          form_id: formId,
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      });
      
      // Track CTA clicks
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.textContent?.includes('Schedule') || 
            target.textContent?.includes('Contact') ||
            target.textContent?.includes('Download') ||
            target.textContent?.includes('See Our Models')) {
          
          sendMetricToAnalytics({
            name: 'cta_click',
            cta_text: target.textContent?.trim(),
            timestamp: new Date().toISOString(),
            url: window.location.href
          });
        }
      });
      
      // Track page engagement time
      let startTime = performance.now();
      let isVisible = true;
      
      const trackEngagement = () => {
        if (isVisible) {
          const engagementTime = performance.now() - startTime;
          
          sendMetricToAnalytics({
            name: 'page_engagement',
            value: engagementTime,
            url: window.location.href,
            timestamp: new Date().toISOString()
          });
        }
      };
      
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          isVisible = false;
          trackEngagement();
        } else {
          isVisible = true;
          startTime = performance.now();
        }
      });
      
      window.addEventListener('beforeunload', trackEngagement);
    };
    
    // Enhanced analytics sender
    const sendMetricToAnalytics = (metric) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Performance Metric:', metric);
        return;
      }
      
      try {
        // In production, send to your analytics service
        // Examples:
        // - Google Analytics: gtag('event', metric.name, { value: metric.value || metric.delta });
        // - Custom API: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(metric) });
        
        // For now, just log in development
        console.log('Metric:', metric);
      } catch (error) {
        console.error('Failed to send metric:', error);
      }
    };
    
    // Enhanced error sender
    const sendErrorToAnalytics = (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Application Error:', error);
        return;
      }
      
      // Send critical errors immediately
      try {
        // In production, send to error tracking service
        // Example: Sentry, LogRocket, or custom error API
        console.error('Production Error:', error);
      } catch (sendError) {
        console.error('Failed to send error to analytics:', sendError);
      }
    };
    
    // Initialize monitoring with error handling
    initializePerformanceMonitoring().catch(error => {
      console.error('Failed to initialize performance monitoring:', error);
    });
    
    // Cleanup function
    return () => {
      // Clean up any event listeners or intervals if needed
    };
  }, []);
  
  return null; // This component doesn't render anything
}