// This file configures the initialization of Sentry on the server
import { init } from "@sentry/nextjs";

init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Capture 10% of transactions for performance monitoring in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Enable performance monitoring
  enableTracing: true,
  
  // Configure release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  
  // Server-specific configuration
  beforeSend: (event, hint) => {
    const error = hint.originalException;
    
    // Filter out expected errors
    if (error && error.message) {
      // Ignore database connection timeout errors if they're handled
      if (error.message.includes('Connection timeout') && event.level !== 'fatal') {
        return null;
      }
      
      // Ignore rate limiting errors (these are expected)
      if (error.message.includes('Rate limit exceeded')) {
        return null;
      }
    }
    
    // Sanitize sensitive server data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-api-key'];
      }
      
      // Remove sensitive query parameters
      if (event.request.query_string) {
        const sanitizedQuery = event.request.query_string
          .replace(/([?&])(api_?key|token|secret|password)=[^&]*/gi, '$1$2=[REDACTED]');
        event.request.query_string = sanitizedQuery;
      }
    }
    
    // Remove database connection strings from extra data
    if (event.extra) {
      Object.keys(event.extra).forEach(key => {
        if (typeof event.extra[key] === 'string' && 
            event.extra[key].includes('postgresql://')) {
          event.extra[key] = '[DATABASE_CONNECTION_REDACTED]';
        }
      });
    }
    
    return event;
  },
  
  // Configure which transactions are sent to Sentry
  tracesSampler: (samplingContext) => {
    // Skip health check endpoints
    if (samplingContext.request?.url?.includes('/api/health')) {
      return 0;
    }
    
    // Skip internal monitoring endpoints
    if (samplingContext.request?.url?.includes('/api/monitoring/metrics')) {
      return 0;
    }
    
    // Sample payment-related endpoints at higher rate
    if (samplingContext.request?.url?.includes('/api/stripe') ||
        samplingContext.request?.url?.includes('/api/checkout')) {
      return 0.8;
    }
    
    // Sample Excel processing endpoints at higher rate
    if (samplingContext.request?.url?.includes('/api/upload-excel') ||
        samplingContext.request?.url?.includes('/api/excel')) {
      return 0.5;
    }
    
    // Default sampling rate
    return process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
  },
  
  // Set initial scope
  initialScope: {
    tags: {
      component: 'zenith-capital-backend',
      version: process.env.npm_package_version || 'unknown'
    }
  },
  
  // Configure server-specific integrations
  integrations: [
    // Add server-specific integrations here if needed
  ],
  
  // Server performance settings
  maxValueLength: 8192, // Increase max value length for detailed error context
  
  // Configure automatic instrumentation
  instrumenter: 'sentry',
  
  // Enable profiling in production
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1
});