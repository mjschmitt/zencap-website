/**
 * @fileoverview Security middleware for Excel file operations
 * @module middleware/excel-security
 */

import crypto from 'crypto';
import path from 'path';
import winston from 'winston';
import { FILE_SECURITY, SANITIZATION_RULES } from '../config/security.js';
import { createAuditLog } from '../utils/audit.js';
import { scanFile } from '../utils/virus-scanner.js';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Validate file extension
 * @param {string} filename - File name
 * @returns {boolean} True if valid
 */
export function validateFileExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return FILE_SECURITY.allowedExtensions.includes(ext);
}

/**
 * Validate MIME type
 * @param {string} mimeType - MIME type
 * @returns {boolean} True if valid
 */
export function validateMimeType(mimeType) {
  return FILE_SECURITY.allowedMimeTypes.includes(mimeType);
}

/**
 * Validate file magic numbers
 * @param {Buffer} buffer - File buffer (first 8 bytes)
 * @param {string} extension - File extension
 * @returns {boolean} True if valid
 */
export function validateMagicNumbers(buffer, extension) {
  const ext = extension.toLowerCase().replace('.', '');
  const expectedMagic = FILE_SECURITY.magicNumbers[ext];
  
  if (!expectedMagic) return false;
  
  for (let i = 0; i < expectedMagic.length; i++) {
    if (buffer[i] !== expectedMagic[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Scan file content for dangerous patterns
 * @param {Buffer} buffer - File buffer
 * @returns {Object} Scan results
 */
export function scanForDangerousPatterns(buffer) {
  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024 * 1024)); // First 1MB
  const findings = [];
  
  for (const pattern of FILE_SECURITY.dangerousPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      findings.push({
        pattern: pattern.toString(),
        matches: matches.slice(0, 5), // First 5 matches
        severity: determineSeverity(pattern)
      });
    }
  }
  
  return {
    safe: findings.length === 0,
    findings,
    riskLevel: calculateRiskLevel(findings)
  };
}

/**
 * Determine pattern severity
 * @param {RegExp} pattern - Pattern
 * @returns {string} Severity level
 */
function determineSeverity(pattern) {
  const criticalPatterns = [/cmd\.exe/i, /powershell/i, /exec\s*\(/i];
  const highPatterns = [/vbaProject\.bin/i, /WEBSERVICE/i, /drop\s+table/i];
  
  if (criticalPatterns.some(p => p.toString() === pattern.toString())) {
    return 'critical';
  }
  if (highPatterns.some(p => p.toString() === pattern.toString())) {
    return 'high';
  }
  return 'medium';
}

/**
 * Calculate overall risk level
 * @param {Array} findings - Security findings
 * @returns {string} Risk level
 */
function calculateRiskLevel(findings) {
  if (findings.some(f => f.severity === 'critical')) return 'critical';
  if (findings.some(f => f.severity === 'high')) return 'high';
  if (findings.length > 5) return 'high';
  if (findings.length > 0) return 'medium';
  return 'low';
}

/**
 * Validate Excel formulas
 * @param {string} formula - Formula string
 * @returns {Object} Validation result
 */
export function validateFormula(formula) {
  const rules = FILE_SECURITY.formulaRules;
  const issues = [];
  
  // Check formula length
  if (formula.length > rules.maxFormulaLength) {
    issues.push({
      type: 'length',
      message: `Formula exceeds maximum length of ${rules.maxFormulaLength}`
    });
  }
  
  // Check for blocked functions
  for (const func of rules.blockedFunctions) {
    const pattern = new RegExp(`\\b${func}\\s*\\(`, 'i');
    if (pattern.test(formula)) {
      issues.push({
        type: 'blocked_function',
        message: `Blocked function detected: ${func}`,
        severity: 'high'
      });
    }
  }
  
  // Check nesting depth
  const nestingDepth = countNestingDepth(formula);
  if (nestingDepth > rules.maxNestedFunctions) {
    issues.push({
      type: 'nesting',
      message: `Formula nesting exceeds maximum depth of ${rules.maxNestedFunctions}`
    });
  }
  
  // Check for external references
  if (/\[.*\]/.test(formula) || /http[s]?:\/\//.test(formula)) {
    issues.push({
      type: 'external_reference',
      message: 'External references detected in formula',
      severity: 'high'
    });
  }
  
  return {
    valid: issues.length === 0,
    issues,
    sanitized: sanitizeFormula(formula)
  };
}

/**
 * Count formula nesting depth
 * @param {string} formula - Formula string
 * @returns {number} Nesting depth
 */
function countNestingDepth(formula) {
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (const char of formula) {
    if (char === '(') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === ')') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }
  
  return maxDepth;
}

/**
 * Sanitize formula
 * @param {string} formula - Formula string
 * @returns {string} Sanitized formula
 */
function sanitizeFormula(formula) {
  let sanitized = formula;
  
  // Remove blocked functions
  for (const func of FILE_SECURITY.formulaRules.blockedFunctions) {
    const pattern = new RegExp(`\\b${func}\\s*\\([^)]*\\)`, 'gi');
    sanitized = sanitized.replace(pattern, '#BLOCKED!');
  }
  
  // Remove external references
  sanitized = sanitized.replace(/\[.*?\]/g, '#REF!');
  sanitized = sanitized.replace(/http[s]?:\/\/[^\s)]+/g, '#URL!');
  
  return sanitized;
}

/**
 * Sanitize cell content
 * @param {string} content - Cell content
 * @returns {string} Sanitized content
 */
export function sanitizeCellContent(content) {
  if (!content || typeof content !== 'string') return content;
  
  const rules = SANITIZATION_RULES.cell;
  let sanitized = content;
  
  // Truncate if too long
  if (sanitized.length > rules.maxLength) {
    sanitized = sanitized.substring(0, rules.maxLength);
  }
  
  // Apply removal patterns
  for (const pattern of rules.removePatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Encode special characters
  if (rules.encodeSpecialChars) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  return sanitized;
}

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  const rules = SANITIZATION_RULES.filename;
  let sanitized = filename;
  
  // Strip path
  if (rules.stripPath) {
    sanitized = path.basename(sanitized);
  }
  
  // Remove non-allowed characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Truncate if too long
  const ext = path.extname(sanitized);
  const name = path.basename(sanitized, ext);
  if (name.length > rules.maxLength - ext.length) {
    sanitized = name.substring(0, rules.maxLength - ext.length) + ext;
  }
  
  return sanitized;
}

/**
 * Generate secure file ID
 * @returns {string} Secure file ID
 */
export function generateSecureFileId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash file content for integrity verification
 * @param {Buffer} buffer - File buffer
 * @returns {string} SHA-256 hash
 */
export function hashFileContent(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Encrypt file at rest
 * @param {Buffer} buffer - File buffer
 * @param {string} key - Encryption key
 * @returns {Object} Encrypted data with IV
 */
export function encryptFile(buffer, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt file
 * @param {Buffer} encrypted - Encrypted buffer
 * @param {string} key - Encryption key
 * @param {string} iv - Initialization vector
 * @param {string} authTag - Authentication tag
 * @returns {Buffer} Decrypted buffer
 */
export function decryptFile(encrypted, key, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
}

/**
 * Comprehensive Excel security middleware
 * @param {Object} options - Security options
 * @returns {Function} Middleware function
 */
export function excelSecurityMiddleware(options = {}) {
  const {
    scanVirus = true,
    validateContent = true,
    encryptAtRest = true,
    auditLog = true
  } = options;
  
  return async (req, res, next) => {
    try {
      // Add security context to request
      req.security = {
        fileId: generateSecureFileId(),
        timestamp: Date.now(),
        checks: [],
        passed: true
      };
      
      // Log security check start
      if (auditLog) {
        await createAuditLog({
          event: 'EXCEL_SECURITY_CHECK_START',
          userId: req.user?.id,
          metadata: {
            fileId: req.security.fileId,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          }
        });
      }
      
      // Apply security headers
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Continue to next middleware
      next();
      
    } catch (error) {
      logger.error('Excel security middleware error:', error);
      
      if (auditLog) {
        await createAuditLog({
          event: 'EXCEL_SECURITY_ERROR',
          userId: req.user?.id,
          severity: 'error',
          metadata: {
            error: error.message,
            stack: error.stack
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Security check failed'
      });
    }
  };
}

/**
 * Validate uploaded Excel file
 * @param {Object} file - File object
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export async function validateExcelFile(file, buffer, options = {}) {
  const results = {
    valid: true,
    checks: [],
    issues: []
  };
  
  // Extension validation
  if (!validateFileExtension(file.filename)) {
    results.valid = false;
    results.issues.push({
      type: 'extension',
      message: 'Invalid file extension',
      severity: 'high'
    });
  }
  results.checks.push('extension');
  
  // MIME type validation
  if (!validateMimeType(file.mimeType)) {
    results.valid = false;
    results.issues.push({
      type: 'mime',
      message: 'Invalid MIME type',
      severity: 'high'
    });
  }
  results.checks.push('mime_type');
  
  // Magic number validation
  const ext = path.extname(file.filename).toLowerCase();
  if (!validateMagicNumbers(buffer.slice(0, 8), ext)) {
    results.valid = false;
    results.issues.push({
      type: 'magic',
      message: 'File content does not match extension',
      severity: 'critical'
    });
  }
  results.checks.push('magic_numbers');
  
  // Content scanning
  if (options.scanContent !== false) {
    const scanResults = scanForDangerousPatterns(buffer);
    if (!scanResults.safe) {
      results.valid = false;
      results.issues.push({
        type: 'content',
        message: 'Dangerous patterns detected',
        severity: scanResults.riskLevel,
        findings: scanResults.findings
      });
    }
    results.checks.push('content_scan');
  }
  
  // Virus scanning
  if (options.scanVirus !== false && FILE_SECURITY.virusScan.enabled) {
    try {
      const virusResults = await scanFile(buffer, file.filename);
      if (!virusResults.clean) {
        results.valid = false;
        results.issues.push({
          type: 'virus',
          message: 'Malware detected',
          severity: 'critical',
          details: virusResults.threats
        });
      }
      results.checks.push('virus_scan');
    } catch (error) {
      logger.error('Virus scan failed:', error);
      if (options.failOnScanError) {
        results.valid = false;
        results.issues.push({
          type: 'scan_error',
          message: 'Virus scan failed',
          severity: 'high'
        });
      }
    }
  }
  
  // Calculate file hash
  results.hash = hashFileContent(buffer);
  results.size = buffer.length;
  
  return results;
}

export default {
  validateFileExtension,
  validateMimeType,
  validateMagicNumbers,
  scanForDangerousPatterns,
  validateFormula,
  sanitizeCellContent,
  sanitizeFilename,
  generateSecureFileId,
  hashFileContent,
  encryptFile,
  decryptFile,
  excelSecurityMiddleware,
  validateExcelFile
};