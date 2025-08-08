/**
 * @fileoverview Vulnerability Scanning API - Production Security Assessment
 * @module api/security/vulnerabilities
 */

import { applySecurityMiddleware } from '../../../middleware/security.js';
import { securityMonitor, SECURITY_EVENTS, THREAT_LEVELS } from '../../../utils/security/SecurityMonitor.js';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

/**
 * Vulnerability scanning configuration
 */
const VULNERABILITY_CONFIG = {
  // Security headers to check
  REQUIRED_HEADERS: [
    'X-Frame-Options',
    'X-Content-Type-Options', 
    'X-XSS-Protection',
    'Referrer-Policy',
    'Content-Security-Policy',
    'Strict-Transport-Security'
  ],
  
  // File paths to scan for sensitive data
  SENSITIVE_PATHS: [
    '.env',
    '.env.local',
    '.env.production',
    'config.json',
    'secrets.json'
  ],
  
  // Database security checks
  DB_SECURITY_CHECKS: [
    'password_policy_enabled',
    'ssl_connection_enforced',
    'audit_logging_enabled',
    'backup_encryption_enabled'
  ],
  
  // API endpoint security requirements
  API_SECURITY_REQUIREMENTS: {
    authentication: ['POST', 'PUT', 'DELETE'],
    rateLimit: ['ALL'],
    inputValidation: ['POST', 'PUT', 'PATCH'],
    outputSanitization: ['ALL']
  }
};

/**
 * Main vulnerability scanner handler
 */
async function vulnerabilityScanHandler(req, res) {
  const { method, query } = req;
  
  if (method !== 'POST' && method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  try {
    const scanType = query.type || 'full';
    const scanId = crypto.randomUUID();
    
    // Log vulnerability scan initiation
    await securityMonitor.logSecurityEvent(
      SECURITY_EVENTS.SECURITY_POLICY_VIOLATION,
      THREAT_LEVELS.LOW,
      {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        path: req.url,
        data: {
          action: 'vulnerability_scan_initiated',
          scanType,
          scanId
        }
      }
    );
    
    let scanResults = {};
    
    switch (scanType) {
      case 'headers':
        scanResults = await scanSecurityHeaders(req);
        break;
        
      case 'database':
        scanResults = await scanDatabaseSecurity();
        break;
        
      case 'files':
        scanResults = await scanFileSystemSecurity();
        break;
        
      case 'dependencies':
        scanResults = await scanDependencyVulnerabilities();
        break;
        
      case 'endpoints':
        scanResults = await scanAPIEndpointSecurity();
        break;
        
      case 'full':
      default:
        scanResults = await performFullSecurityScan(req);
        break;
    }
    
    // Store scan results
    await storeScanResults(scanId, scanType, scanResults);
    
    // Generate security report
    const securityReport = generateSecurityReport(scanResults);
    
    return res.status(200).json({
      success: true,
      scanId,
      scanType,
      timestamp: new Date(),
      results: scanResults,
      report: securityReport,
      recommendations: generateSecurityRecommendations(scanResults)
    });
    
  } catch (error) {
    console.error('Vulnerability scan error:', error);
    return res.status(500).json({
      success: false,
      error: 'Vulnerability scan failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Scan security headers configuration
 */
async function scanSecurityHeaders(req) {
  const headerResults = {
    passed: [],
    failed: [],
    warnings: [],
    score: 0
  };
  
  // Test each required security header
  for (const headerName of VULNERABILITY_CONFIG.REQUIRED_HEADERS) {
    const headerValue = req.headers[headerName.toLowerCase()];
    
    if (!headerValue) {
      headerResults.failed.push({
        header: headerName,
        issue: 'Missing security header',
        severity: 'high',
        recommendation: `Add ${headerName} header to all responses`
      });
    } else {
      // Validate header values
      const validation = validateSecurityHeader(headerName, headerValue);
      
      if (validation.valid) {
        headerResults.passed.push({
          header: headerName,
          value: headerValue,
          status: 'configured correctly'
        });
        headerResults.score += 10;
      } else {
        headerResults.warnings.push({
          header: headerName,
          value: headerValue,
          issue: validation.issue,
          severity: 'medium',
          recommendation: validation.recommendation
        });
        headerResults.score += 5;
      }
    }
  }
  
  // Check for additional security headers
  const additionalHeaders = [
    'Permissions-Policy',
    'Cross-Origin-Embedder-Policy',
    'Cross-Origin-Opener-Policy'
  ];
  
  for (const header of additionalHeaders) {
    if (req.headers[header.toLowerCase()]) {
      headerResults.passed.push({
        header,
        value: req.headers[header.toLowerCase()],
        status: 'additional security header present',
        bonus: true
      });
      headerResults.score += 5;
    }
  }
  
  headerResults.maxScore = VULNERABILITY_CONFIG.REQUIRED_HEADERS.length * 10;
  headerResults.percentage = Math.round((headerResults.score / headerResults.maxScore) * 100);
  
  return headerResults;
}

/**
 * Scan database security configuration
 */
async function scanDatabaseSecurity() {
  const dbResults = {
    checks: [],
    vulnerabilities: [],
    score: 0,
    maxScore: 0
  };
  
  try {
    // Check for default or weak configurations
    const configChecks = [
      {
        name: 'SSL/TLS Enforcement',
        query: sql`SHOW ssl`,
        test: (result) => result.rows[0]?.ssl === 'on',
        severity: 'critical'
      },
      {
        name: 'Password Policy',
        description: 'Check if strong password policies are enforced',
        test: () => process.env.PASSWORD_MIN_LENGTH >= 12,
        severity: 'high'
      },
      {
        name: 'Audit Logging',
        description: 'Verify security event logging is enabled',
        test: async () => {
          const result = await sql`
            SELECT COUNT(*) as log_count 
            FROM security_events 
            WHERE timestamp > NOW() - INTERVAL '1 day'
          `;
          return parseInt(result.rows[0].log_count) > 0;
        },
        severity: 'medium'
      },
      {
        name: 'Default Credentials',
        description: 'Check for default or weak admin credentials',
        test: async () => {
          // In production, check for users with default passwords
          const result = await sql`
            SELECT COUNT(*) as default_users
            FROM users 
            WHERE email IN ('admin@example.com', 'test@test.com', 'admin@admin.com')
          `;
          return parseInt(result.rows[0].default_users) === 0;
        },
        severity: 'critical'
      },
      {
        name: 'Sensitive Data Encryption',
        description: 'Verify sensitive columns are encrypted',
        test: async () => {
          // Check if password hashes are using strong algorithms
          const result = await sql`
            SELECT password_hash 
            FROM users 
            LIMIT 1
          `;
          const hash = result.rows[0]?.password_hash || '';
          return hash.startsWith('$2a$') || hash.startsWith('$2b$'); // bcrypt
        },
        severity: 'high'
      }
    ];
    
    for (const check of configChecks) {
      dbResults.maxScore += getSeverityScore(check.severity);
      
      try {
        let passed = false;
        
        if (check.query) {
          const result = await check.query;
          passed = check.test(result);
        } else {
          passed = await check.test();
        }
        
        if (passed) {
          dbResults.checks.push({
            name: check.name,
            status: 'passed',
            description: check.description || 'Security check passed'
          });
          dbResults.score += getSeverityScore(check.severity);
        } else {
          dbResults.vulnerabilities.push({
            name: check.name,
            severity: check.severity,
            description: check.description || 'Security vulnerability detected',
            recommendation: getSecurityRecommendation(check.name)
          });
        }
      } catch (error) {
        dbResults.vulnerabilities.push({
          name: check.name,
          severity: 'low',
          description: `Unable to perform security check: ${error.message}`,
          recommendation: 'Investigate database configuration manually'
        });
      }
    }
    
    dbResults.percentage = Math.round((dbResults.score / dbResults.maxScore) * 100);
    
  } catch (error) {
    dbResults.vulnerabilities.push({
      name: 'Database Connection',
      severity: 'critical',
      description: `Cannot connect to database: ${error.message}`,
      recommendation: 'Check database connectivity and credentials'
    });
  }
  
  return dbResults;
}

/**
 * Scan file system for security vulnerabilities
 */
async function scanFileSystemSecurity() {
  const fileResults = {
    sensitiveFiles: [],
    permissions: [],
    vulnerabilities: [],
    score: 0
  };
  
  try {
    // Check for sensitive files in project root
    for (const filename of VULNERABILITY_CONFIG.SENSITIVE_PATHS) {
      try {
        const filePath = path.join(process.cwd(), filename);
        await fs.access(filePath);
        
        // File exists - check if it's properly secured
        const stats = await fs.stat(filePath);
        const isPubliclyReadable = (stats.mode & parseInt('044', 8)) !== 0;
        
        if (isPubliclyReadable) {
          fileResults.vulnerabilities.push({
            file: filename,
            severity: 'high',
            issue: 'Sensitive file has public read permissions',
            recommendation: `Restrict permissions on ${filename}`
          });
        } else {
          fileResults.sensitiveFiles.push({
            file: filename,
            status: 'secured',
            permissions: stats.mode.toString(8)
          });
          fileResults.score += 10;
        }
      } catch (error) {
        // File doesn't exist or can't be accessed - this is good
        fileResults.score += 10;
      }
    }
    
    // Check upload directory security
    const uploadsPath = path.join(process.cwd(), 'uploads');
    try {
      const stats = await fs.stat(uploadsPath);
      const isWorldWritable = (stats.mode & parseInt('002', 8)) !== 0;
      
      if (isWorldWritable) {
        fileResults.vulnerabilities.push({
          file: 'uploads/',
          severity: 'high',
          issue: 'Upload directory is world-writable',
          recommendation: 'Restrict upload directory permissions'
        });
      } else {
        fileResults.permissions.push({
          directory: 'uploads/',
          status: 'secured'
        });
        fileResults.score += 15;
      }
    } catch (error) {
      // Upload directory doesn't exist - might be good
      fileResults.score += 15;
    }
    
    // Check for backup files
    const backupPatterns = ['*.bak', '*.backup', '*.old', '*.tmp'];
    // In production, implement actual file scanning for backup files
    
    fileResults.maxScore = (VULNERABILITY_CONFIG.SENSITIVE_PATHS.length * 10) + 30;
    fileResults.percentage = Math.round((fileResults.score / fileResults.maxScore) * 100);
    
  } catch (error) {
    fileResults.vulnerabilities.push({
      file: 'filesystem',
      severity: 'medium',
      issue: `File system scan error: ${error.message}`,
      recommendation: 'Manually verify file system security'
    });
  }
  
  return fileResults;
}

/**
 * Scan for dependency vulnerabilities
 */
async function scanDependencyVulnerabilities() {
  const depResults = {
    packages: [],
    vulnerabilities: [],
    outdated: [],
    score: 100 // Start with perfect score, deduct for issues
  };
  
  try {
    // Read package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
    
    const allDependencies = {
      ...packageData.dependencies || {},
      ...packageData.devDependencies || {}
    };
    
    // Check for known vulnerable packages
    const vulnerablePackages = {
      'lodash': { version: '<4.17.21', severity: 'high' },
      'axios': { version: '<0.21.2', severity: 'medium' },
      'express': { version: '<4.17.3', severity: 'medium' },
      'jsonwebtoken': { version: '<8.5.1', severity: 'high' }
    };
    
    for (const [packageName, version] of Object.entries(allDependencies)) {
      depResults.packages.push({
        name: packageName,
        version,
        status: 'scanned'
      });
      
      if (vulnerablePackages[packageName]) {
        const vuln = vulnerablePackages[packageName];
        depResults.vulnerabilities.push({
          package: packageName,
          currentVersion: version,
          vulnerableVersion: vuln.version,
          severity: vuln.severity,
          recommendation: `Update ${packageName} to latest version`
        });
        
        depResults.score -= getSeverityScore(vuln.severity);
      }
    }
    
    // Check for packages with known security issues
    const securityPackages = [
      'helmet', 'express-rate-limit', 'cors', 'express-validator',
      'bcryptjs', 'jsonwebtoken', 'express-session'
    ];
    
    let securityPackagesFound = 0;
    for (const pkg of securityPackages) {
      if (allDependencies[pkg]) {
        securityPackagesFound++;
      }
    }
    
    if (securityPackagesFound < securityPackages.length / 2) {
      depResults.vulnerabilities.push({
        package: 'security-packages',
        severity: 'medium',
        issue: 'Missing essential security packages',
        recommendation: 'Install security packages: helmet, express-rate-limit, etc.'
      });
      depResults.score -= 20;
    }
    
    depResults.percentage = Math.max(depResults.score, 0);
    
  } catch (error) {
    depResults.vulnerabilities.push({
      package: 'dependency-scan',
      severity: 'low',
      issue: `Cannot scan dependencies: ${error.message}`,
      recommendation: 'Run npm audit for dependency security analysis'
    });
    depResults.percentage = 50; // Unknown state
  }
  
  return depResults;
}

/**
 * Scan API endpoint security
 */
async function scanAPIEndpointSecurity() {
  const endpointResults = {
    endpoints: [],
    vulnerabilities: [],
    score: 0,
    maxScore: 0
  };
  
  try {
    // Get all API endpoints by scanning the API directory
    const apiDir = path.join(process.cwd(), 'src/pages/api');
    const endpoints = await scanApiDirectory(apiDir);
    
    for (const endpoint of endpoints) {
      endpointResults.maxScore += 100; // Max score per endpoint
      let endpointScore = 0;
      
      // Check authentication requirements
      const authRequired = endpoint.methods.some(method => 
        VULNERABILITY_CONFIG.API_SECURITY_REQUIREMENTS.authentication.includes(method)
      );
      
      if (authRequired && !endpoint.hasAuth) {
        endpointResults.vulnerabilities.push({
          endpoint: endpoint.path,
          severity: 'high',
          issue: 'Missing authentication on sensitive endpoint',
          recommendation: `Add authentication middleware to ${endpoint.path}`
        });
      } else {
        endpointScore += 25;
      }
      
      // Check rate limiting
      if (!endpoint.hasRateLimit) {
        endpointResults.vulnerabilities.push({
          endpoint: endpoint.path,
          severity: 'medium',
          issue: 'Missing rate limiting',
          recommendation: `Add rate limiting to ${endpoint.path}`
        });
      } else {
        endpointScore += 25;
      }
      
      // Check input validation
      const needsValidation = endpoint.methods.some(method =>
        VULNERABILITY_CONFIG.API_SECURITY_REQUIREMENTS.inputValidation.includes(method)
      );
      
      if (needsValidation && !endpoint.hasValidation) {
        endpointResults.vulnerabilities.push({
          endpoint: endpoint.path,
          severity: 'high',
          issue: 'Missing input validation',
          recommendation: `Add input validation to ${endpoint.path}`
        });
      } else {
        endpointScore += 25;
      }
      
      // Check error handling
      if (!endpoint.hasErrorHandling) {
        endpointResults.vulnerabilities.push({
          endpoint: endpoint.path,
          severity: 'low',
          issue: 'Potentially verbose error messages',
          recommendation: `Review error handling in ${endpoint.path}`
        });
      } else {
        endpointScore += 25;
      }
      
      endpointResults.endpoints.push({
        path: endpoint.path,
        methods: endpoint.methods,
        security: {
          hasAuth: endpoint.hasAuth,
          hasRateLimit: endpoint.hasRateLimit,
          hasValidation: endpoint.hasValidation,
          hasErrorHandling: endpoint.hasErrorHandling
        },
        score: endpointScore
      });
      
      endpointResults.score += endpointScore;
    }
    
    endpointResults.percentage = endpointResults.maxScore > 0 
      ? Math.round((endpointResults.score / endpointResults.maxScore) * 100)
      : 100;
    
  } catch (error) {
    endpointResults.vulnerabilities.push({
      endpoint: 'api-scan',
      severity: 'medium',
      issue: `API endpoint scan failed: ${error.message}`,
      recommendation: 'Manually review API endpoint security'
    });
    endpointResults.percentage = 50;
  }
  
  return endpointResults;
}

/**
 * Perform comprehensive security scan
 */
async function performFullSecurityScan(req) {
  const [
    headerScan,
    dbScan,
    fileScan,
    depScan,
    endpointScan
  ] = await Promise.all([
    scanSecurityHeaders(req),
    scanDatabaseSecurity(),
    scanFileSystemSecurity(),
    scanDependencyVulnerabilities(),
    scanAPIEndpointSecurity()
  ]);
  
  return {
    headers: headerScan,
    database: dbScan,
    filesystem: fileScan,
    dependencies: depScan,
    endpoints: endpointScan,
    overall: calculateOverallSecurityScore({
      headers: headerScan,
      database: dbScan,
      filesystem: fileScan,
      dependencies: depScan,
      endpoints: endpointScan
    })
  };
}

/**
 * Store scan results in database
 */
async function storeScanResults(scanId, scanType, results) {
  try {
    await sql`
      INSERT INTO security_metrics (metric_name, metric_value)
      VALUES (
        'vulnerability_scan',
        ${JSON.stringify({
          scanId,
          scanType,
          timestamp: new Date(),
          results
        })}
      )
    `;
  } catch (error) {
    console.error('Failed to store scan results:', error);
  }
}

/**
 * Generate security report from scan results
 */
function generateSecurityReport(results) {
  const report = {
    summary: {},
    criticalIssues: [],
    recommendations: [],
    score: 0
  };
  
  if (results.overall) {
    report.summary = {
      overallScore: results.overall.score,
      grade: results.overall.grade,
      totalVulnerabilities: results.overall.totalVulnerabilities,
      criticalVulnerabilities: results.overall.criticalVulnerabilities
    };
    
    // Extract critical issues from all scans
    Object.values(results).forEach(scanResult => {
      if (scanResult.vulnerabilities) {
        const critical = scanResult.vulnerabilities.filter(v => v.severity === 'critical');
        report.criticalIssues.push(...critical);
      }
    });
    
    report.score = results.overall.score;
  }
  
  return report;
}

/**
 * Generate security recommendations
 */
function generateSecurityRecommendations(results) {
  const recommendations = [
    {
      priority: 'high',
      category: 'immediate',
      title: 'Enable Security Headers',
      description: 'Implement all required security headers to prevent common attacks'
    },
    {
      priority: 'high', 
      category: 'authentication',
      title: 'Strengthen Authentication',
      description: 'Implement MFA and secure session management'
    },
    {
      priority: 'medium',
      category: 'monitoring',
      title: 'Enhanced Monitoring',
      description: 'Set up real-time security event monitoring and alerting'
    },
    {
      priority: 'medium',
      category: 'dependencies',
      title: 'Update Dependencies',
      description: 'Keep all packages updated to latest secure versions'
    }
  ];
  
  return recommendations;
}

// Helper functions
function validateSecurityHeader(name, value) {
  const validations = {
    'X-Frame-Options': {
      valid: ['DENY', 'SAMEORIGIN'].includes(value.toUpperCase()),
      recommendation: 'Set to DENY or SAMEORIGIN'
    },
    'X-Content-Type-Options': {
      valid: value.toLowerCase() === 'nosniff',
      recommendation: 'Set to nosniff'
    },
    'Content-Security-Policy': {
      valid: value.includes("default-src") && value.includes("'self'"),
      recommendation: 'Implement comprehensive CSP policy'
    }
  };
  
  return validations[name] || { valid: true, recommendation: 'Header configured' };
}

function getSeverityScore(severity) {
  const scores = {
    critical: 25,
    high: 15,
    medium: 10,
    low: 5
  };
  return scores[severity] || 5;
}

function getSecurityRecommendation(checkName) {
  const recommendations = {
    'SSL/TLS Enforcement': 'Enable SSL/TLS encryption for all database connections',
    'Password Policy': 'Implement strong password requirements (12+ chars, mixed case, numbers, symbols)',
    'Audit Logging': 'Enable comprehensive security event logging',
    'Default Credentials': 'Remove or change all default user accounts and passwords',
    'Sensitive Data Encryption': 'Encrypt all sensitive data fields using strong algorithms'
  };
  
  return recommendations[checkName] || 'Review and strengthen this security control';
}

async function scanApiDirectory(dir, basePath = '') {
  const endpoints = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const apiPath = path.join(basePath, entry.name).replace(/\\/g, '/');
      
      if (entry.isDirectory()) {
        const subEndpoints = await scanApiDirectory(fullPath, apiPath);
        endpoints.push(...subEndpoints);
      } else if (entry.name.endsWith('.js')) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          
          // Analyze endpoint security features
          const endpoint = {
            path: apiPath.replace('.js', ''),
            methods: extractHttpMethods(content),
            hasAuth: content.includes('auth') || content.includes('middleware'),
            hasRateLimit: content.includes('rateLimit') || content.includes('rate-limit'),
            hasValidation: content.includes('validation') || content.includes('joi') || content.includes('yup'),
            hasErrorHandling: content.includes('try') && content.includes('catch')
          };
          
          endpoints.push(endpoint);
        } catch (error) {
          console.error(`Error scanning ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return endpoints;
}

function extractHttpMethods(content) {
  const methods = [];
  const methodChecks = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  
  for (const method of methodChecks) {
    if (content.includes(`method === '${method}'`) || 
        content.includes(`method == '${method}'`) ||
        content.includes(`req.method === '${method}'`)) {
      methods.push(method);
    }
  }
  
  return methods.length > 0 ? methods : ['GET']; // Default to GET if no methods found
}

function calculateOverallSecurityScore(results) {
  const weights = {
    headers: 0.2,
    database: 0.25,
    filesystem: 0.15,
    dependencies: 0.2,
    endpoints: 0.2
  };
  
  let totalScore = 0;
  let totalVulns = 0;
  let criticalVulns = 0;
  
  Object.entries(weights).forEach(([category, weight]) => {
    const result = results[category];
    if (result && result.percentage !== undefined) {
      totalScore += result.percentage * weight;
    }
    
    if (result && result.vulnerabilities) {
      totalVulns += result.vulnerabilities.length;
      criticalVulns += result.vulnerabilities.filter(v => v.severity === 'critical').length;
    }
  });
  
  const grade = getSecurityGrade(totalScore);
  
  return {
    score: Math.round(totalScore),
    grade,
    totalVulnerabilities: totalVulns,
    criticalVulnerabilities: criticalVulns
  };
}

function getSecurityGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Apply security middleware with admin authentication
export default applySecurityMiddleware(vulnerabilityScanHandler, {
  rateLimit: 'api',
  sessionSecurity: true
});