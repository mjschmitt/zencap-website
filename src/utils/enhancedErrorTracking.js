/**
 * @fileoverview Enhanced error tracking utility with Sentry integration
 * @module utils/enhancedErrorTracking
 */

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { PRODUCTION_CONFIG } from '../config/production';

// Server-side Winston logger
let winston;
let logger;

if (typeof window === 'undefined') {
  try {
    winston = require('winston');
    require('winston-daily-rotate-file');
    
    // Configure Winston for server-side logging
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'zenith-capital-api' },
      transports: [
        // Error log rotation
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true
        }),
        // Combined log rotation
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          zippedArchive: true
        }),
        // Warning log rotation
        new winston.transports.DailyRotateFile({
          filename: 'logs/warnings-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'warn',
          maxSize: '10m',
          maxFiles: '7d',
          zippedArchive: true
        })
      ]
    });

    // Add console transport in development
    if (process.env.NODE_ENV === 'development') {
      logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  } catch (error) {
    console.warn('Winston logger initialization failed:', error);
  }
}

/**
 * Enhanced Error tracking class with Sentry integration
 */
export class EnhancedErrorTracker {
  constructor(config = {}) {
    this.config = {
      ...PRODUCTION_CONFIG.errorTracking,
      ...config
    };
    
    this.isInitialized = false;
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.flushInterval = null;
    this.sentryEnabled = false;
  }

  /**
   * Initialize enhanced error tracking
   */
  async initialize() {
    if (this.isInitialized || !this.config.enabled) return;
    
    try {
      // Initialize Sentry
      await this.initializeSentry();
      
      this.isInitialized = true;
      
      // Set up global error handlers
      this.setupGlobalHandlers();
      
      // Start error queue flush interval
      this.startFlushInterval();
      
      // Log successful initialization
      this.captureMessage('Error tracking system initialized', 'info', {
        provider: this.config.provider,
        environment: this.config.environment
      });
      
    } catch (error) {
      console.error('Failed to initialize enhanced error tracking:', error);
      // Continue with basic error tracking even if Sentry fails
      this.isInitialized = true;
    }
  }

  /**
   * Initialize Sentry error tracking
   */
  async initializeSentry() {
    try {
      // Sentry is already initialized via config files
      this.sentryEnabled = true;
      
      // Set initial context
      Sentry.setContext('application', {
        name: 'Zenith Capital Advisors',
        version: process.env.npm_package_version || 'unknown',
        environment: this.config.environment,
        deployment: process.env.VERCEL_ENV || 'unknown'
      });
      
      // Set initial tags
      Sentry.setTags({
        component: typeof window !== 'undefined' ? 'frontend' : 'backend',
        deployment: process.env.VERCEL_ENV || 'unknown',
        release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
      });
      
      console.log('Sentry error tracking initialized successfully');
      
    } catch (error) {
      console.error('Sentry initialization error:', error);
      this.sentryEnabled = false;
    }
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled errors (client-side only)
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          type: 'unhandled_error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          critical: true
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error ? 
          event.reason : new Error(String(event.reason));
          
        this.captureError(error, {
          type: 'unhandled_rejection',
          promise: true,
          critical: true
        });
      });

      // Handle resource loading errors
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          this.captureError(new Error(`Resource loading failed: ${event.target.src || event.target.href}`), {
            type: 'resource_error',
            element: event.target.tagName,
            src: event.target.src || event.target.href,
            warning: true
          });
        }
      }, true);
    }
  }

  /**
   * Capture an error with enhanced tracking
   * @param {Error|string} error - Error to capture
   * @param {Object} context - Additional context
   */
  captureError(error, context = {}) {
    if (!this.config.enabled) return;
    
    // Convert string errors to Error objects
    if (typeof error === 'string') {
      error = new Error(error);
    }
    
    // Check if error should be ignored
    if (this.shouldIgnoreError(error)) {
      return;
    }
    
    // Apply sampling rate (but always capture critical errors)
    if (!context.critical && Math.random() > this.config.sampleRate) {
      return;
    }
    
    try {
      // Enhanced error context
      const enhancedContext = {
        ...context,
        environment: this.config.environment,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        url: typeof window !== 'undefined' ? window.location.href : null,
        timestamp: new Date().toISOString(),
        errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: this.getSessionId(),
        buildId: process.env.BUILD_ID || 'unknown'
      };
      
      // Send to Sentry if available
      if (this.sentryEnabled && Sentry.captureException) {
        Sentry.withScope((scope) => {
          // Set context
          scope.setContext('error_details', {
            errorId: enhancedContext.errorId,
            component: context.component || 'unknown',
            feature: context.feature || 'unknown',
            userFlow: context.userFlow || 'unknown'
          });
          
          // Set tags
          scope.setTag('error_boundary', context.errorBoundary || false);
          scope.setTag('component', context.component || 'unknown');
          scope.setTag('retry_count', context.retryCount || 0);
          scope.setTag('critical', context.critical || false);
          
          // Set user context if available
          if (context.userId) {
            scope.setUser({ 
              id: context.userId,
              email: context.userEmail,
              segment: context.userSegment
            });
          }
          
          // Set level based on context
          const level = context.critical ? 'fatal' : 
                       context.warning ? 'warning' : 'error';
          scope.setLevel(level);
          
          // Add fingerprint for grouping similar errors
          if (context.fingerprint) {
            scope.setFingerprint([context.fingerprint]);
          }
          
          // Capture the exception
          Sentry.captureException(error);
        });
      }
      
      // Server-side Winston logging
      if (typeof window === 'undefined' && logger) {
        const logLevel = context.critical ? 'error' :
                        context.warning ? 'warn' : 'error';
                        
        logger.log(logLevel, 'Application Error', {
          errorId: enhancedContext.errorId,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          context: enhancedContext,
          tags: {
            component: context.component,
            feature: context.feature,
            critical: context.critical
          }
        });
      }
      
      // Fallback to custom endpoint queue
      const errorEvent = {
        timestamp: Date.now(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        context: enhancedContext,
        level: context.critical ? 'fatal' : 
               context.warning ? 'warning' : 'error'
      };
      
      // Apply beforeSend hook if configured
      const processedEvent = this.config.beforeSend ? 
        this.config.beforeSend(errorEvent) : errorEvent;
      
      if (processedEvent) {
        this.addToQueue(processedEvent);
      }
      
      // Send immediate notification for critical errors
      if (context.critical) {
        this.sendCriticalErrorNotification(error, enhancedContext);
      }
      
    } catch (trackingError) {
      console.error('Enhanced error tracking failed:', trackingError);
      // Fallback to console logging
      console.error('Original error:', error);
      console.error('Context:', context);
    }
  }

  /**
   * Capture a message with enhanced tracking
   * @param {string} message - Message to capture
   * @param {string} level - Severity level
   * @param {Object} context - Additional context
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.config.enabled) return;
    
    try {
      // Enhanced message context
      const enhancedContext = {
        ...context,
        environment: this.config.environment,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      };
      
      // Send to Sentry if available
      if (this.sentryEnabled && Sentry.captureMessage) {
        Sentry.withScope((scope) => {
          scope.setContext('message_details', enhancedContext);
          scope.setLevel(level);
          
          if (context.userId) {
            scope.setUser({ 
              id: context.userId,
              email: context.userEmail 
            });
          }
          
          scope.setTag('component', context.component || 'unknown');
          scope.setTag('feature', context.feature || 'unknown');
          
          Sentry.captureMessage(message, level);
        });
      }
      
      // Server-side Winston logging
      if (typeof window === 'undefined' && logger) {
        logger.log(level, message, {
          context: enhancedContext,
          tags: {
            component: context.component,
            feature: context.feature
          }
        });
      }
      
      // Fallback to custom endpoint
      const messageEvent = {
        timestamp: Date.now(),
        message,
        level,
        context: enhancedContext
      };
      
      this.addToQueue(messageEvent);
      
    } catch (error) {
      console.error('Message tracking failed:', error);
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  /**
   * Capture performance metrics
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {Object} context - Additional context
   */
  capturePerformanceMetric(metric, value, context = {}) {
    try {
      if (this.sentryEnabled && Sentry.addBreadcrumb) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `${metric}: ${value}ms`,
          level: 'info',
          data: {
            metric,
            value,
            ...context
          }
        });
      }
      
      // Log performance metrics
      this.captureMessage(`Performance metric: ${metric}`, 'info', {
        metric,
        value,
        ...context,
        type: 'performance'
      });
    } catch (error) {
      console.warn('Performance metric tracking failed:', error);
    }
  }

  /**
   * Set user context for error tracking
   * @param {Object} user - User information
   */
  setUser(user) {
    try {
      if (this.sentryEnabled && Sentry.setUser) {
        Sentry.setUser({
          id: user.id,
          email: user.email,
          segment: user.segment || 'unknown'
        });
      }
      
      this.userContext = user;
    } catch (error) {
      console.warn('Failed to set user context:', error);
    }
  }

  /**
   * Add breadcrumb for debugging
   * @param {Object} breadcrumb - Breadcrumb data
   */
  addBreadcrumb(breadcrumb) {
    try {
      if (this.sentryEnabled && Sentry.addBreadcrumb) {
        Sentry.addBreadcrumb({
          timestamp: Date.now() / 1000,
          ...breadcrumb
        });
      }
    } catch (error) {
      console.warn('Failed to add breadcrumb:', error);
    }
  }

  /**
   * Send critical error notification
   * @param {Error} error - Critical error
   * @param {Object} context - Error context
   */
  async sendCriticalErrorNotification(error, context) {
    try {
      // In a real implementation, this would send notifications via:
      // - Slack webhook
      // - Email alerts
      // - SMS notifications
      // - PagerDuty integration
      
      console.error('🚨 CRITICAL ERROR DETECTED 🚨', {
        errorId: context.errorId,
        message: error.message,
        component: context.component,
        url: context.url,
        timestamp: context.timestamp
      });
      
      // Attempt to send notification to monitoring endpoint
      if (typeof fetch !== 'undefined') {
        fetch('/api/monitoring/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'critical_error',
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack
            },
            context
          })
        }).catch(() => {
          // Notification failed - this is expected during development
        });
      }
    } catch (notificationError) {
      console.error('Failed to send critical error notification:', notificationError);
    }
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('errorTracking_sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('errorTracking_sessionId', sessionId);
      }
      return sessionId;
    }
    return 'server_session';
  }

  /**
   * Check if error should be ignored
   * @param {Error} error - Error to check
   * @returns {boolean} Whether to ignore the error
   */
  shouldIgnoreError(error) {
    return this.config.ignoreErrors.some(pattern => {
      if (typeof pattern === 'string') {
        return error.message?.includes(pattern);
      }
      if (pattern instanceof RegExp) {
        return pattern.test(error.message || '');
      }
      return false;
    });
  }

  /**
   * Add event to queue
   * @param {Object} event - Event to queue
   */
  addToQueue(event) {
    this.errorQueue.push(event);
    
    // Trim queue if needed
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Flush immediately if queue is getting full or for critical errors
    if (this.errorQueue.length >= this.maxQueueSize * 0.8 || event.level === 'fatal') {
      this.flush();
    }
  }

  /**
   * Start flush interval
   */
  startFlushInterval() {
    this.flushInterval = setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flush();
      }
    }, 15000); // Flush every 15 seconds
  }

  /**
   * Flush error queue
   */
  async flush() {
    if (this.errorQueue.length === 0) return;
    
    const events = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      await this.sendEvents(events);
    } catch (error) {
      console.error('Failed to send error events:', error);
      // Put critical events back in queue for retry
      const criticalEvents = events.filter(e => e.level === 'fatal').slice(0, 5);
      this.errorQueue.unshift(...criticalEvents);
    }
  }

  /**
   * Send events to tracking service
   * @param {Array} events - Events to send
   */
  async sendEvents(events) {
    try {
      // Send to custom endpoint as fallback
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
      
      if (!response.ok) {
        throw new Error(`Error tracking request failed: ${response.status}`);
      }
      
    } catch (error) {
      // In development/testing, this is expected to fail
      if (process.env.NODE_ENV === 'development') {
        console.log(`Would send ${events.length} events to error tracking service`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Destroy error tracking
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush remaining events
    this.flush();
    
    this.isInitialized = false;
    this.sentryEnabled = false;
  }
}

/**
 * Singleton instance
 */
let enhancedTrackerInstance = null;

/**
 * Get or create enhanced error tracker instance
 * @param {Object} config - Configuration
 * @returns {EnhancedErrorTracker} Enhanced error tracker instance
 */
export function getEnhancedErrorTracker(config = {}) {
  if (!enhancedTrackerInstance) {
    enhancedTrackerInstance = new EnhancedErrorTracker(config);
    enhancedTrackerInstance.initialize();
  }
  return enhancedTrackerInstance;
}

/**
 * Enhanced capture error helper
 * @param {Error|string} error - Error to capture
 * @param {Object} context - Additional context
 */
export function captureError(error, context = {}) {
  const tracker = getEnhancedErrorTracker();
  tracker.captureError(error, context);
}

/**
 * Enhanced capture message helper
 * @param {string} message - Message to capture
 * @param {string} level - Severity level
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = 'info', context = {}) {
  const tracker = getEnhancedErrorTracker();
  tracker.captureMessage(message, level, context);
}

/**
 * Capture performance metric helper
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {Object} context - Additional context
 */
export function capturePerformanceMetric(metric, value, context = {}) {
  const tracker = getEnhancedErrorTracker();
  tracker.capturePerformanceMetric(metric, value, context);
}

/**
 * Set user context helper
 * @param {Object} user - User information
 */
export function setUser(user) {
  const tracker = getEnhancedErrorTracker();
  tracker.setUser(user);
}

/**
 * Add breadcrumb helper
 * @param {Object} breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb) {
  const tracker = getEnhancedErrorTracker();
  tracker.addBreadcrumb(breadcrumb);
}

export default {
  EnhancedErrorTracker,
  getEnhancedErrorTracker,
  captureError,
  captureMessage,
  capturePerformanceMetric,
  setUser,
  addBreadcrumb
};