// Central security configuration for Zenith Capital Advisors platform
// Head of Security & Compliance - Critical security settings

export const FILE_SECURITY = {
  // Maximum file size: 100MB for Excel models
  maxFileSize: 100 * 1024 * 1024,
  
  // Allowed file extensions for uploads
  allowedExtensions: ['.xlsx', '.xlsm', '.xls'],
  
  // Allowed MIME types
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel'
  ],
  
  // File scanning settings
  virusScanning: {
    enabled: true,
    quarantineOnDetection: true,
    scanTimeout: 30000, // 30 seconds
    maxScanSize: 50 * 1024 * 1024 // 50MB max for virus scanning
  },
  
  // Content analysis settings
  contentAnalysis: {
    scanFormulas: true,
    blockExternalReferences: true,
    blockActiveContent: true,
    maxFormulaComplexity: 100,
    suspiciousFunctions: [
      'WEBSERVICE',
      'HYPERLINK',
      'EXEC',
      'SHELL',
      'CALL'
    ]
  }
};

export const AUTHENTICATION = {
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'zenith-capital-jwt-secret-2025',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    issuer: 'zenith-capital-advisors',
    audience: 'zencap-platform'
  },
  
  // Password requirements
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    preventReuse: 5 // Last 5 passwords
  },
  
  // Session management
  session: {
    timeout: 60 * 60 * 1000, // 1 hour
    extendOnActivity: true,
    maxConcurrentSessions: 3,
    secureOnly: true,
    sameSite: 'strict'
  },
  
  // Rate limiting
  rateLimit: {
    upload: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 uploads per window
      message: 'Too many upload attempts, please try again later'
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
      message: 'Too many API requests, please slow down'
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 login attempts per window
      message: 'Too many login attempts, please try again later'
    }
  }
};

export const ENCRYPTION = {
  // File encryption settings
  files: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  },
  
  // Database encryption
  database: {
    sensitiveFields: [
      'email',
      'phone',
      'address',
      'financial_data',
      'model_content'
    ]
  }
};

export const SECURITY_HEADERS = {
  // HTTP Security Headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim()
};

export const AUDIT_SETTINGS = {
  // Audit logging configuration
  events: {
    highRisk: [
      'FILE_UPLOAD',
      'FILE_DOWNLOAD',
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'PASSWORD_CHANGE',
      'ADMIN_ACCESS',
      'DATA_EXPORT',
      'MALWARE_DETECTED'
    ],
    mediumRisk: [
      'FILE_ACCESS',
      'SEARCH_QUERY',
      'MODEL_VIEW',
      'NEWSLETTER_SUBSCRIBE'
    ],
    lowRisk: [
      'PAGE_VIEW',
      'CONTACT_FORM'
    ]
  },
  
  retention: {
    highRisk: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    mediumRisk: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    lowRisk: 90 * 24 * 60 * 60 * 1000 // 90 days
  },
  
  alerting: {
    enabled: true,
    channels: ['email', 'slack'],
    thresholds: {
      malwareDetection: 1,
      suspiciousLogins: 3,
      massDeletion: 10
    }
  }
};

export const GDPR_COMPLIANCE = {
  // Data protection settings
  dataMinimization: {
    enabled: true,
    autoDeleteAfter: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    excludeFields: ['audit_logs', 'security_events']
  },
  
  consentManagement: {
    required: true,
    granular: true,
    withdrawalEnabled: true,
    trackingCookies: false // No tracking without consent
  },
  
  dataPortability: {
    enabled: true,
    formats: ['json', 'csv'],
    maxRequestsPerMonth: 2
  },
  
  rightToErasure: {
    enabled: true,
    verificationRequired: true,
    retentionOverrides: ['legal_hold', 'active_subscription']
  }
};

export const MONITORING = {
  // Security monitoring
  alerts: {
    failedLogins: 5,
    uploadErrors: 10,
    suspiciousActivity: 3,
    memoryUsage: 85, // percentage
    diskUsage: 90 // percentage
  },
  
  healthChecks: {
    interval: 5 * 60 * 1000, // 5 minutes
    timeout: 10 * 1000, // 10 seconds
    endpoints: [
      '/api/health',
      '/api/database-check',
      '/api/storage-check'
    ]
  }
};

// Security utility functions
export const SecurityUtils = {
  // Generate cryptographically secure random strings
  generateSecureToken: (length = 32) => {
    return require('crypto').randomBytes(length).toString('hex');
  },
  
  // Hash passwords with bcrypt
  hashPassword: async (password) => {
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(password, 12);
  },
  
  // Verify password hash
  verifyPassword: async (password, hash) => {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  },
  
  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/javascript:/gi, '') // Remove JavaScript URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },
  
  // Validate file extension
  isValidFileExtension: (filename, allowedExtensions) => {
    const ext = require('path').extname(filename).toLowerCase();
    return allowedExtensions.includes(ext);
  }
};