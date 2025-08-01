/**
 * @fileoverview Error tracking utility for production
 * @module utils/errorTracking
 */

import React from 'react';
import { PRODUCTION_CONFIG } from '../config/production';

/**
 * Error tracking class
 */
export class ErrorTracker {
  constructor(config = {}) {
    this.config = {
      ...PRODUCTION_CONFIG.errorTracking,
      ...config
    };
    
    this.isInitialized = false;
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.flushInterval = null;
  }

  /**
   * Initialize error tracking
   */
  async initialize() {
    if (this.isInitialized || !this.config.enabled) return;
    
    try {
      // Initialize based on provider
      switch (this.config.provider) {
        case 'sentry':
          await this.initializeSentry();
          break;
        case 'bugsnag':
          await this.initializeBugsnag();
          break;
        case 'custom':
        default:
          await this.initializeCustom();
          break;
      }
      
      this.isInitialized = true;
      
      // Set up global error handlers
      this.setupGlobalHandlers();
      
      // Start error queue flush interval
      this.startFlushInterval();
      
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  /**
   * Initialize Sentry (placeholder - would load actual SDK in production)
   */
  async initializeSentry() {
    // In production, this would load and configure Sentry
    console.log('Sentry error tracking initialized (mock)');
  }

  /**
   * Initialize Bugsnag (placeholder - would load actual SDK in production)
   */
  async initializeBugsnag() {
    // In production, this would load and configure Bugsnag
    console.log('Bugsnag error tracking initialized (mock)');
  }

  /**
   * Initialize custom error tracking
   */
  async initializeCustom() {
    console.log('Custom error tracking initialized');
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error, {
          type: 'unhandled_error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, {
          type: 'unhandled_rejection',
          promise: event.promise
        });
      });
    }
  }

  /**
   * Capture an error
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
    
    // Apply sampling rate
    if (Math.random() > this.config.sampleRate) {
      return;
    }
    
    // Create error event
    const errorEvent = {
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: {
        ...context,
        environment: this.config.environment,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        url: typeof window !== 'undefined' ? window.location.href : null
      }
    };
    
    // Apply beforeSend hook if configured
    const processedEvent = this.config.beforeSend ? 
      this.config.beforeSend(errorEvent) : errorEvent;
    
    if (processedEvent) {
      this.addToQueue(processedEvent);
    }
  }

  /**
   * Capture a message
   * @param {string} message - Message to capture
   * @param {string} level - Severity level
   * @param {Object} context - Additional context
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.config.enabled) return;
    
    const messageEvent = {
      timestamp: Date.now(),
      message,
      level,
      context: {
        ...context,
        environment: this.config.environment
      }
    };
    
    this.addToQueue(messageEvent);
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
        return pattern.test(error.message);
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
    
    // Flush immediately if queue is getting full
    if (this.errorQueue.length >= this.maxQueueSize * 0.8) {
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
    }, 10000); // Flush every 10 seconds
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
      // Put events back in queue for retry
      this.errorQueue.unshift(...events.slice(0, 10)); // Keep only first 10
    }
  }

  /**
   * Send events to tracking service
   * @param {Array} events - Events to send
   */
  async sendEvents(events) {
    if (this.config.provider === 'custom') {
      // Send to custom endpoint
      const response = await fetch(PRODUCTION_CONFIG.api.errorTracking, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
      
      if (!response.ok) {
        throw new Error(`Error tracking request failed: ${response.status}`);
      }
    } else {
      // In production, would send to actual provider
      console.log(`Sending ${events.length} events to ${this.config.provider}`);
    }
  }

  /**
   * Set user context
   * @param {Object} user - User information
   */
  setUser(user) {
    this.userContext = user;
  }

  /**
   * Set additional context
   * @param {Object} context - Context to merge
   */
  setContext(context) {
    this.additionalContext = {
      ...this.additionalContext,
      ...context
    };
  }

  /**
   * Create breadcrumb
   * @param {Object} breadcrumb - Breadcrumb data
   */
  addBreadcrumb(breadcrumb) {
    // In production, would add to provider's breadcrumb trail
    console.log('Breadcrumb:', breadcrumb);
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
  }
}

/**
 * Singleton instance
 */
let trackerInstance = null;

/**
 * Get or create error tracker instance
 * @param {Object} config - Configuration
 * @returns {ErrorTracker} Error tracker instance
 */
export function getErrorTracker(config = {}) {
  if (!trackerInstance) {
    trackerInstance = new ErrorTracker(config);
    trackerInstance.initialize();
  }
  return trackerInstance;
}

/**
 * Capture error helper
 * @param {Error|string} error - Error to capture
 * @param {Object} context - Additional context
 */
export function captureError(error, context = {}) {
  const tracker = getErrorTracker();
  tracker.captureError(error, context);
}

/**
 * Capture message helper
 * @param {string} message - Message to capture
 * @param {string} level - Severity level
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = 'info', context = {}) {
  const tracker = getErrorTracker();
  tracker.captureMessage(message, level, context);
}

/**
 * React error boundary for error tracking
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    captureError(error, {
      type: 'react_error_boundary',
      componentStack: errorInfo.componentStack,
      props: this.props.errorContext
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>We've been notified of the issue and are working to fix it.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default {
  ErrorTracker,
  getErrorTracker,
  captureError,
  captureMessage,
  ErrorBoundary
};