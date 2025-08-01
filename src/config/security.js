/**
 * @fileoverview Security configuration for Excel viewer and file uploads
 * @module config/security
 */

/**
 * Generate CSP header from directives
 * @param {Object} directives - CSP directives
 * @returns {string} CSP header value
 */
function generateCSP(directives) {
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

// Content Security Policy directives
export const CSP_DIRECTIVES = {
  // Base policy
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'img-src': ["'self'", "data:", "https:", "blob:"],
  'connect-src': ["'self'", "https://www.google-analytics.com"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
  
  // Excel viewer specific
  'worker-src': ["'self'", "blob:"],
  'child-src': ["'self'", "blob:"]
};

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy-Report-Only': generateCSP(CSP_DIRECTIVES),
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // CORS
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
  
  // Cache control for sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// File upload security configuration
export const FILE_SECURITY = {
  // Maximum file sizes
  maxFileSize: 200 * 1024 * 1024, // 200MB
  maxChunkSize: 10 * 1024 * 1024, // 10MB
  
  // Allowed MIME types
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12' // .xlsb
  ],
  
  // Allowed file extensions
  allowedExtensions: ['.xlsx', '.xls', '.xlsm', '.xlsb'],
  
  // Magic numbers for file type validation
  magicNumbers: {
    xlsx: [0x50, 0x4B, 0x03, 0x04], // ZIP format (XLSX)
    xls: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE format
    xlsb: [0x50, 0x4B, 0x03, 0x04] // ZIP format (XLSB)
  },
  
  // Dangerous patterns to detect in Excel files
  dangerousPatterns: [
    // Macro indicators
    /vbaProject\.bin/i,
    /\.xlsm$/i,
    /macroEnabled/i,
    
    // External references
    /external\s*\(/i,
    /WEBSERVICE\s*\(/i,
    /FILTERXML\s*\(/i,
    
    // Shell commands
    /cmd\.exe/i,
    /powershell/i,
    /bash/i,
    /sh\s+-c/i,
    
    // Network calls
    /http[s]?:\/\//i,
    /ftp:\/\//i,
    /file:\/\//i,
    
    // SQL injection patterns
    /union\s+select/i,
    /drop\s+table/i,
    /exec\s*\(/i,
    
    // Script injection
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i
  ],
  
  // Formula validation rules
  formulaRules: {
    // Blocked functions
    blockedFunctions: [
      'CALL', 'REGISTER', 'EXEC', 'SYSTEM',
      'SHELL', 'RUN', 'OPEN', 'SAVE',
      'WEBSERVICE', 'FILTERXML', 'ENCODEURL'
    ],
    
    // Maximum formula length
    maxFormulaLength: 1000,
    
    // Maximum nested functions
    maxNestedFunctions: 10
  },
  
  // Virus scanning configuration
  virusScan: {
    enabled: true,
    provider: 'clamav', // or 'virustotal', 'windows-defender'
    timeout: 30000, // 30 seconds
    quarantinePath: '/var/quarantine/excel'
  }
};

// Input sanitization rules
export const SANITIZATION_RULES = {
  // Cell content sanitization
  cell: {
    maxLength: 32767, // Excel cell limit
    stripHtml: true,
    stripScripts: true,
    encodeSpecialChars: true,
    
    // Patterns to remove
    removePatterns: [
      /<[^>]*>/g, // HTML tags
      /javascript:/gi, // JavaScript protocol
      /vbscript:/gi, // VBScript protocol
      /on\w+\s*=/gi // Event handlers
    ]
  },
  
  // Formula sanitization
  formula: {
    maxLength: 8192,
    validateStructure: true,
    blockExternalReferences: true,
    sanitizeStrings: true
  },
  
  // Filename sanitization
  filename: {
    maxLength: 255,
    allowedChars: /^[a-zA-Z0-9._-]+$/,
    stripPath: true,
    normalizeUnicode: true
  }
};

// Rate limiting configuration
export const RATE_LIMITS = {
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour per user
    message: 'Upload limit exceeded. Please try again later.'
  },
  download: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 downloads per hour per user
    message: 'Download limit exceeded. Please try again later.'
  },
  process: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 processing requests per hour
    message: 'Processing limit exceeded. Please try again later.'
  }
};

// Audit logging configuration
export const AUDIT_CONFIG = {
  // Events to log
  events: {
    FILE_UPLOAD: { severity: 'info', retention: 90 },
    FILE_DOWNLOAD: { severity: 'info', retention: 90 },
    FILE_DELETE: { severity: 'warning', retention: 180 },
    FILE_SHARE: { severity: 'info', retention: 90 },
    MALWARE_DETECTED: { severity: 'critical', retention: 365 },
    UNAUTHORIZED_ACCESS: { severity: 'warning', retention: 180 },
    FORMULA_BLOCKED: { severity: 'warning', retention: 90 },
    RATE_LIMIT_EXCEEDED: { severity: 'warning', retention: 30 },
    LOGIN_SUCCESS: { severity: 'info', retention: 30 },
    LOGIN_FAILED: { severity: 'warning', retention: 90 },
    PERMISSION_DENIED: { severity: 'warning', retention: 90 },
    DATA_EXPORT: { severity: 'info', retention: 180 },
    DATA_DELETE: { severity: 'warning', retention: 365 },
    ADMIN_ACTION: { severity: 'info', retention: 365 }
  },
  
  // Storage configuration
  storage: {
    type: 'database', // or 'file', 'siem'
    tableName: 'security_audit_logs',
    compression: true,
    encryption: true
  },
  
  // GDPR compliance
  gdpr: {
    anonymizeUserData: true,
    excludePII: true,
    retentionDays: 365,
    allowUserExport: true,
    allowUserDeletion: true
  }
};

// Role-based access control
export const RBAC = {
  roles: {
    admin: {
      permissions: [
        'file:upload', 'file:download', 'file:delete', 'file:share',
        'user:create', 'user:read', 'user:update', 'user:delete',
        'model:create', 'model:read', 'model:update', 'model:delete',
        'audit:read', 'settings:manage'
      ]
    },
    user: {
      permissions: [
        'file:upload', 'file:download', 'file:delete:own',
        'model:read', 'model:download:purchased',
        'profile:read:own', 'profile:update:own'
      ]
    },
    viewer: {
      permissions: [
        'file:download:shared', 'model:read',
        'profile:read:own'
      ]
    }
  },
  
  // Resource-based permissions
  resources: {
    file: {
      actions: ['upload', 'download', 'delete', 'share', 'process'],
      ownership: true,
      sharing: true
    },
    model: {
      actions: ['create', 'read', 'update', 'delete', 'download'],
      ownership: false,
      pricing: true
    },
    user: {
      actions: ['create', 'read', 'update', 'delete'],
      ownership: true,
      adminOnly: ['create', 'delete']
    }
  }
};

// Session security configuration
export const SESSION_CONFIG = {
  // JWT configuration
  jwt: {
    algorithm: 'RS256',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    issuer: 'zencap-api',
    audience: 'zencap-client'
  },
  
  // Session management
  session: {
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    }
  },
  
  // Multi-factor authentication
  mfa: {
    required: ['admin'],
    methods: ['totp', 'sms', 'email'],
    backupCodes: 10,
    timeout: 300 // 5 minutes
  }
};

// GDPR compliance configuration
export const GDPR_CONFIG = {
  // Data retention policies
  retention: {
    userAccounts: 365 * 3, // 3 years
    uploadedFiles: 90, // 90 days
    auditLogs: 365, // 1 year
    analyticsData: 180, // 6 months
    backups: 30 // 30 days
  },
  
  // User rights
  rights: {
    access: true,
    rectification: true,
    erasure: true,
    portability: true,
    restriction: true,
    objection: true
  },
  
  // Consent management
  consent: {
    required: ['marketing', 'analytics', 'cookies'],
    granular: true,
    withdrawable: true,
    ageVerification: 16
  },
  
  // Data processing
  processing: {
    minimization: true,
    pseudonymization: true,
    encryption: true,
    accessLogging: true
  }
};

// Export all configurations
export default {
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  FILE_SECURITY,
  SANITIZATION_RULES,
  RATE_LIMITS,
  AUDIT_CONFIG,
  RBAC,
  SESSION_CONFIG,
  GDPR_CONFIG
};