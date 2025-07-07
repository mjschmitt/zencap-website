// src/components/PerformanceMonitor.js - Enhanced version
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
    
    // Report Web Vitals with enhanced metrics
    // Note: Using web-vitals v4+ API (onCLS, onINP, etc.) instead of legacy API (getCLS, getFID, etc.)
    // INP (Interaction to Next Paint) has replaced FID (First Input Delay) as a Core Web Vital
    const reportWebVitals = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals');
        
        onCLS(sendMetricToAnalytics);
        onINP(sendMetricToAnalytics);
        onLCP(sendMetricToAnalytics);
        onFCP(sendMetricToAnalytics);
        onTTFB(sendMetricToAnalytics);
      } catch (error) {
        console.error('Web Vitals reporting failed:', error);
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
      
      // In production, send to your analytics service
      // Examples:
      // - Google Analytics: gtag('event', metric.name, { value: metric.value || metric.delta });
      // - Custom API: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(metric) });
      // - Third-party service: analytics.track(metric.name, metric);
      
      try {
        // Batch metrics to reduce network calls
        const existingMetrics = JSON.parse(localStorage.getItem('pending_metrics') || '[]');
        existingMetrics.push(metric);
        localStorage.setItem('pending_metrics', JSON.stringify(existingMetrics));
        
        // Send batch when we have 10 metrics or after 30 seconds
        if (existingMetrics.length >= 10) {
          sendBatchToAnalytics(existingMetrics);
        }
      } catch (error) {
        console.error('Failed to store metric:', error);
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
    
    // Batch analytics sender
    const sendBatchToAnalytics = (metrics) => {
      if (process.env.NODE_ENV !== 'production') return;
      
      // In production, send batch to analytics service
      // fetch('/api/analytics/batch', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ metrics, timestamp: new Date().toISOString() })
      // }).then(() => {
      //   localStorage.removeItem('pending_metrics');
      // }).catch(error => {
      //   console.error('Failed to send batch metrics:', error);
      // });
      
      localStorage.removeItem('pending_metrics');
    };
    
    // Initialize monitoring
    initializePerformanceMonitoring();
    
    // Send any pending metrics on load
    const pendingMetrics = JSON.parse(localStorage.getItem('pending_metrics') || '[]');
    if (pendingMetrics.length > 0) {
      sendBatchToAnalytics(pendingMetrics);
    }
    
    // Set up periodic batch sending
    const batchInterval = setInterval(() => {
      const metrics = JSON.parse(localStorage.getItem('pending_metrics') || '[]');
      if (metrics.length > 0) {
        sendBatchToAnalytics(metrics);
      }
    }, 30000); // Send every 30 seconds
    
    return () => {
      clearInterval(batchInterval);
    };
  }, []);
  
  return null; // This component doesn't render anything
}