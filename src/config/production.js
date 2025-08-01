/**
 * @fileoverview Production configuration for Excel viewer
 * @module config/production
 */

/**
 * Production configuration settings
 */
export const PRODUCTION_CONFIG = {
  // File upload limits
  upload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB limit
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2, // Exponential backoff
    timeout: 300000 // 5 minutes
  },

  // Memory monitoring
  memory: {
    enabled: true,
    warningThreshold: 512 * 1024 * 1024, // 512MB
    criticalThreshold: 1024 * 1024 * 1024, // 1GB
    checkInterval: 5000, // Check every 5 seconds
    gcThreshold: 256 * 1024 * 1024 // Suggest GC at 256MB
  },

  // Error tracking
  errorTracking: {
    enabled: true,
    provider: 'sentry', // Options: 'sentry', 'bugsnag', 'custom'
    sampleRate: 1.0, // 100% in production
    environment: process.env.NODE_ENV || 'production',
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed'
    ],
    beforeSend: (event) => {
      // Sanitize sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.extra?.fileData) {
        delete event.extra.fileData;
      }
      return event;
    }
  },

  // Performance monitoring
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% of transactions
    tracingOrigins: ['localhost', /^\//],
    metrics: {
      fileLoadTime: { threshold: 3000 }, // 3 seconds
      sheetRenderTime: { threshold: 1000 }, // 1 second
      memoryUsage: { threshold: 512 * 1024 * 1024 }, // 512MB
      workerResponseTime: { threshold: 500 } // 500ms
    }
  },

  // Retry configuration
  retry: {
    upload: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      retryableErrors: [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'NetworkError',
        'TimeoutError'
      ]
    },
    processing: {
      maxAttempts: 2,
      initialDelay: 500,
      maxDelay: 5000,
      backoffFactor: 1.5
    }
  },

  // Worker configuration
  worker: {
    timeout: 30000, // 30 seconds
    memoryLimit: 1024 * 1024 * 1024, // 1GB
    heartbeatInterval: 5000, // 5 seconds
    maxConcurrentTasks: 3,
    recycleAfterTasks: 100 // Restart worker after 100 tasks
  },

  // Caching configuration
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 100 * 1024 * 1024, // 100MB
    strategy: 'lru' // Least Recently Used
  },

  // Logging configuration
  logging: {
    level: 'error', // Only log errors in production
    console: false, // Disable console logging
    remote: true, // Enable remote logging
    endpoint: process.env.LOG_ENDPOINT || '/api/logs',
    batchSize: 50,
    flushInterval: 10000 // 10 seconds
  },

  // Feature flags
  features: {
    memoryMonitoring: true,
    errorRecovery: true,
    progressiveLoading: true,
    workerPooling: true,
    compressionUpload: true,
    clientSideValidation: true
  },

  // Security settings
  security: {
    enforceHTTPS: true,
    validateFileTypes: true,
    scanForMacros: true,
    sandboxExecution: true,
    maxFormulaDepth: 10,
    disableDangerousFunctions: true
  },

  // API endpoints
  api: {
    upload: '/api/upload-excel',
    process: '/api/process-excel',
    download: '/api/download-excel',
    analytics: '/api/analytics',
    errorTracking: '/api/errors'
  },

  // Monitoring endpoints
  monitoring: {
    health: '/api/health',
    metrics: '/api/metrics',
    status: '/api/status'
  }
};

/**
 * Get configuration value with fallback
 * @param {string} path - Dot-notated path to config value
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Configuration value
 */
export function getConfig(path, defaultValue) {
  const keys = path.split('.');
  let value = PRODUCTION_CONFIG;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Initialize production configuration
 * @param {Object} overrides - Configuration overrides
 */
export function initializeProductionConfig(overrides = {}) {
  // Deep merge overrides
  Object.keys(overrides).forEach(key => {
    if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
      PRODUCTION_CONFIG[key] = {
        ...PRODUCTION_CONFIG[key],
        ...overrides[key]
      };
    } else {
      PRODUCTION_CONFIG[key] = overrides[key];
    }
  });

  // Validate configuration
  validateConfig();
}

/**
 * Validate production configuration
 * @throws {Error} If configuration is invalid
 */
function validateConfig() {
  // Validate file size limit
  if (PRODUCTION_CONFIG.upload.maxFileSize > 200 * 1024 * 1024) {
    throw new Error('File size limit cannot exceed 200MB');
  }

  // Validate retry configuration
  if (PRODUCTION_CONFIG.retry.upload.maxAttempts < 1) {
    throw new Error('Upload retry attempts must be at least 1');
  }

  // Validate memory thresholds
  if (PRODUCTION_CONFIG.memory.warningThreshold >= PRODUCTION_CONFIG.memory.criticalThreshold) {
    throw new Error('Memory warning threshold must be less than critical threshold');
  }
}

export default PRODUCTION_CONFIG;