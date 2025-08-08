// This file configures the initialization of Sentry on the browser
import { init } from "@sentry/nextjs";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Capture 100% of the transactions, reduce in production!
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Enable performance monitoring
  enableTracing: true,
  
  // Configure release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  
  // Additional configuration
  beforeSend: (event, hint) => {
    // Filter out known noise
    const error = hint.originalException;
    
    if (error && error.message) {
      // Ignore ResizeObserver errors (common in modern browsers)
      if (error.message.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
      
      // Ignore non-Error promise rejections
      if (error.message.includes('Non-Error promise rejection captured')) {
        return null;
      }
      
      // Ignore network request failures (handled by app logic)
      if (error.message.includes('Network request failed')) {
        return null;
      }
      
      // Ignore script loading errors from browser extensions
      if (error.message.includes('Script error')) {
        return null;
      }
    }
    
    // Sanitize sensitive information
    if (event.request) {
      if (event.request.cookies) {
        delete event.request.cookies;
      }
      if (event.request.headers && event.request.headers.authorization) {
        event.request.headers.authorization = '[Redacted]';
      }
    }
    
    // Remove file data from extra context
    if (event.extra && event.extra.fileData) {
      delete event.extra.fileData;
    }
    
    return event;
  },
  
  // Configure which transactions are sent to Sentry
  tracesSampler: (samplingContext) => {
    // Skip health check endpoints
    if (samplingContext.request?.url?.includes('/api/health')) {
      return 0;
    }
    
    // Skip monitoring endpoints
    if (samplingContext.request?.url?.includes('/api/monitoring')) {
      return 0;
    }
    
    // Sample critical user flows at higher rate
    if (samplingContext.request?.url?.includes('/checkout') ||
        samplingContext.request?.url?.includes('/models/')) {
      return 0.5;
    }
    
    // Default sampling rate
    return process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
  },
  
  // Set user context
  initialScope: {
    tags: {
      component: 'zenith-capital-frontend',
      version: process.env.npm_package_version || 'unknown'
    }
  },
  
  // Configure integrations
  integrations: [
    // Add browser-specific integrations here if needed
  ],
  
  // Performance monitoring settings
  _experiments: {
    // Enable automatic instrumentation of user interactions
    captureHttpRequests: true,
  }
});