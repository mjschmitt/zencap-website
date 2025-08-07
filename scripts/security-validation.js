#!/usr/bin/env node

/**
 * Security Validation Script for Zenith Capital Advisors
 * Validates critical security configurations before deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Console colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class SecurityValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  addIssue(severity, category, message, file = null) {
    const issue = { severity, category, message, file, timestamp: new Date() };
    if (severity === 'critical' || severity === 'high') {
      this.issues.push(issue);
    } else {
      this.warnings.push(issue);
    }
  }

  addPass(category, message) {
    this.passed.push({ category, message, timestamp: new Date() });
  }

  async validateEnvironmentSecurity() {
    colorLog('blue', '\n=== Environment Security Validation ===');
    
    try {
      const envExample = await fs.readFile(path.join(rootDir, 'env.example'), 'utf-8');
      
      // Check for required security environment variables
      const requiredSecurityVars = [
        'JWT_SECRET',
        'ENCRYPTION_KEY',
        'INIT_SECURITY_TOKEN',
        'SESSION_SECRET'
      ];

      for (const varName of requiredSecurityVars) {
        if (!envExample.includes(varName)) {
          this.addIssue('high', 'environment', `Missing required security variable: ${varName}`, 'env.example');
        } else {
          this.addPass('environment', `Security variable ${varName} documented`);
        }
      }

      // Check for weak example values
      if (envExample.includes('your-jwt-secret-key')) {
        this.addIssue('medium', 'environment', 'JWT_SECRET uses weak example value', 'env.example');
      }

      if (envExample.includes('your-32-byte-hex-key-here')) {
        this.addIssue('medium', 'environment', 'ENCRYPTION_KEY uses placeholder value', 'env.example');
      }

    } catch (error) {
      this.addIssue('high', 'environment', `Cannot read env.example: ${error.message}`);
    }
  }

  async validateAPIEndpointSecurity() {
    colorLog('blue', '\n=== API Endpoint Security Validation ===');
    
    const apiDir = path.join(rootDir, 'src', 'pages', 'api');
    const dangerousEndpoints = [
      'debug-env.js',
      'test-db.js',
      'test-email.js',
      'test-stripe-connection.js',
      'test-stripe-direct.js',
      'test-stripe-env.js'
    ];

    try {
      const files = await fs.readdir(apiDir);
      
      for (const endpoint of dangerousEndpoints) {
        if (files.includes(endpoint)) {
          const filePath = path.join(apiDir, endpoint);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Check if endpoint has security restrictions
          if (content.includes('NODE_ENV === \'production\'') || 
              content.includes('ENABLE_DEBUG_ENDPOINTS') ||
              content.includes('DEBUG_ACCESS_TOKEN')) {
            this.addPass('api-security', `Debug endpoint ${endpoint} has security restrictions`);
          } else {
            this.addIssue('critical', 'api-security', `Dangerous endpoint ${endpoint} lacks security restrictions`, endpoint);
          }
        }
      }

      // Check for rate limiting
      for (const file of files) {
        if (file.includes('contact') || file.includes('newsletter') || file.includes('upload')) {
          const filePath = path.join(apiDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          if (content.includes('withRateLimit') || content.includes('rateLimit')) {
            this.addPass('rate-limiting', `${file} has rate limiting`);
          } else {
            this.addIssue('high', 'rate-limiting', `Critical endpoint ${file} missing rate limiting`, file);
          }
        }
      }

    } catch (error) {
      this.addIssue('high', 'api-security', `Cannot validate API endpoints: ${error.message}`);
    }
  }

  async validateDatabaseSecurity() {
    colorLog('blue', '\n=== Database Security Validation ===');
    
    try {
      const dbUtilsPath = path.join(rootDir, 'src', 'utils', 'database.js');
      const dbContent = await fs.readFile(dbUtilsPath, 'utf-8');
      
      // Check for unsafe query function
      if (dbContent.includes('throw new Error') && dbContent.includes('Unsafe query function')) {
        this.addPass('database', 'Unsafe query function has been disabled');
      } else if (dbContent.includes('return await sql`${queryString}`;')) {
        this.addIssue('critical', 'database', 'Unsafe query function still active - SQL injection risk', 'database.js');
      }
      
      // Check for proper parameterization
      if (dbContent.includes('sql`') && !dbContent.includes('${queryString}')) {
        this.addPass('database', 'Database queries use parameterized statements');
      }

    } catch (error) {
      this.addIssue('high', 'database', `Cannot validate database security: ${error.message}`);
    }
  }

  async validatePaymentSecurity() {
    colorLog('blue', '\n=== Payment Security Validation ===');
    
    try {
      const webhookPath = path.join(rootDir, 'src', 'pages', 'api', 'stripe', 'webhook.js');
      const webhookContent = await fs.readFile(webhookPath, 'utf-8');
      
      // Check for proper order recording
      if (webhookContent.includes('INSERT INTO orders') && 
          webhookContent.includes('createAuditLog')) {
        this.addPass('payments', 'Webhook properly records orders with audit logging');
      } else if (webhookContent.includes('TODO: Add database record')) {
        this.addIssue('critical', 'payments', 'Webhook not recording purchases - payment fraud risk', 'webhook.js');
      }

      // Check for webhook signature verification
      if (webhookContent.includes('stripe.webhooks.constructEvent')) {
        this.addPass('payments', 'Webhook signature verification implemented');
      } else {
        this.addIssue('critical', 'payments', 'Webhook missing signature verification', 'webhook.js');
      }

    } catch (error) {
      this.addIssue('high', 'payments', `Cannot validate payment security: ${error.message}`);
    }
  }

  async validateSecurityHeaders() {
    colorLog('blue', '\n=== Security Headers Validation ===');
    
    try {
      const nextConfigPath = path.join(rootDir, 'next.config.mjs');
      const configContent = await fs.readFile(nextConfigPath, 'utf-8');
      
      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy'
      ];

      for (const header of requiredHeaders) {
        if (configContent.includes(header)) {
          this.addPass('headers', `${header} security header configured`);
        } else {
          this.addIssue('high', 'headers', `Missing security header: ${header}`, 'next.config.mjs');
        }
      }

      // Check for unsafe CSP directives
      if (configContent.includes("'unsafe-eval'") || configContent.includes("'unsafe-inline'")) {
        this.addIssue('medium', 'headers', 'CSP contains unsafe directives - consider removing', 'next.config.mjs');
      }

    } catch (error) {
      this.addIssue('high', 'headers', `Cannot validate security headers: ${error.message}`);
    }
  }

  async validateFileUploadSecurity() {
    colorLog('blue', '\n=== File Upload Security Validation ===');
    
    try {
      const uploadPath = path.join(rootDir, 'src', 'pages', 'api', 'upload-excel.js');
      const uploadContent = await fs.readFile(uploadPath, 'utf-8');
      
      const securityFeatures = [
        { check: 'validateExcelFile', name: 'File validation' },
        { check: 'scanFile', name: 'Virus scanning' },
        { check: 'encryptFile', name: 'File encryption' },
        { check: 'createAuditLog', name: 'Audit logging' },
        { check: 'quarantineFile', name: 'Malware quarantine' }
      ];

      for (const feature of securityFeatures) {
        if (uploadContent.includes(feature.check)) {
          this.addPass('file-security', `${feature.name} implemented`);
        } else {
          this.addIssue('medium', 'file-security', `Missing ${feature.name}`, 'upload-excel.js');
        }
      }

    } catch (error) {
      this.addIssue('medium', 'file-security', `Cannot validate file upload security: ${error.message}`);
    }
  }

  async validateAuditLogging() {
    colorLog('blue', '\n=== Audit Logging Validation ===');
    
    try {
      const auditPath = path.join(rootDir, 'src', 'utils', 'audit.js');
      const auditContent = await fs.readFile(auditPath, 'utf-8');
      
      const requiredFunctions = [
        'createAuditLog',
        'logFileAccess',
        'createSecurityIncident',
        'deleteUserAuditLogs'
      ];

      for (const func of requiredFunctions) {
        if (auditContent.includes(`export async function ${func}`)) {
          this.addPass('audit', `${func} function implemented`);
        } else {
          this.addIssue('medium', 'audit', `Missing audit function: ${func}`, 'audit.js');
        }
      }

      // Check for GDPR compliance
      if (auditContent.includes('applyGDPRCompliance') && auditContent.includes('anonymized')) {
        this.addPass('audit', 'GDPR compliance features implemented');
      } else {
        this.addIssue('medium', 'audit', 'Missing GDPR compliance in audit logging', 'audit.js');
      }

    } catch (error) {
      this.addIssue('medium', 'audit', `Cannot validate audit logging: ${error.message}`);
    }
  }

  async runAllValidations() {
    colorLog('cyan', '🔒 Starting Security Validation for Zenith Capital Advisors');
    colorLog('cyan', '═══════════════════════════════════════════════════════');

    await this.validateEnvironmentSecurity();
    await this.validateAPIEndpointSecurity();
    await this.validateDatabaseSecurity();
    await this.validatePaymentSecurity();
    await this.validateSecurityHeaders();
    await this.validateFileUploadSecurity();
    await this.validateAuditLogging();

    this.generateReport();
  }

  generateReport() {
    colorLog('cyan', '\n\n🔒 SECURITY VALIDATION REPORT');
    colorLog('cyan', '═════════════════════════════');

    // Summary
    const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
    const highCount = this.issues.filter(i => i.severity === 'high').length;
    const mediumCount = this.issues.filter(i => i.severity === 'medium').length;

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Passed checks: ${this.passed.length}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
    if (criticalCount > 0) colorLog('red', `   🚨 Critical issues: ${criticalCount}`);
    if (highCount > 0) colorLog('red', `   🔴 High issues: ${highCount}`);
    if (mediumCount > 0) colorLog('yellow', `   🟡 Medium issues: ${mediumCount}`);

    // Critical Issues
    const criticalIssues = this.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      colorLog('red', '\n🚨 CRITICAL ISSUES (MUST FIX BEFORE DEPLOYMENT):');
      criticalIssues.forEach((issue, index) => {
        colorLog('red', `${index + 1}. [${issue.category.toUpperCase()}] ${issue.message}`);
        if (issue.file) colorLog('red', `   📁 File: ${issue.file}`);
      });
    }

    // High Priority Issues
    const highIssues = this.issues.filter(i => i.severity === 'high');
    if (highIssues.length > 0) {
      colorLog('red', '\n🔴 HIGH PRIORITY ISSUES:');
      highIssues.forEach((issue, index) => {
        colorLog('red', `${index + 1}. [${issue.category.toUpperCase()}] ${issue.message}`);
        if (issue.file) console.log(`   📁 File: ${issue.file}`);
      });
    }

    // Medium Issues
    const mediumIssues = this.issues.filter(i => i.severity === 'medium');
    if (mediumIssues.length > 0) {
      colorLog('yellow', '\n🟡 MEDIUM PRIORITY ISSUES:');
      mediumIssues.forEach((issue, index) => {
        colorLog('yellow', `${index + 1}. [${issue.category.toUpperCase()}] ${issue.message}`);
        if (issue.file) console.log(`   📁 File: ${issue.file}`);
      });
    }

    // Successful Checks
    if (this.passed.length > 0) {
      colorLog('green', '\n✅ SECURITY CHECKS PASSED:');
      const categorizedPassed = {};
      this.passed.forEach(pass => {
        if (!categorizedPassed[pass.category]) {
          categorizedPassed[pass.category] = [];
        }
        categorizedPassed[pass.category].push(pass.message);
      });

      Object.entries(categorizedPassed).forEach(([category, messages]) => {
        colorLog('green', `\n  ${category.toUpperCase()}:`);
        messages.forEach(message => {
          colorLog('green', `    ✓ ${message}`);
        });
      });
    }

    // Deployment Decision
    colorLog('cyan', '\n\n🚀 DEPLOYMENT DECISION:');
    if (criticalCount > 0 || highCount > 0) {
      colorLog('red', '❌ DEPLOYMENT NOT RECOMMENDED');
      colorLog('red', `   Reason: ${criticalCount} critical and ${highCount} high priority security issues found`);
      colorLog('yellow', '   Action: Fix critical and high priority issues before deployment');
    } else if (mediumCount > 0) {
      colorLog('yellow', '⚠️  CONDITIONAL DEPLOYMENT');
      colorLog('yellow', `   Reason: ${mediumCount} medium priority issues found`);
      colorLog('yellow', '   Action: Consider fixing medium issues or accept risk');
    } else {
      colorLog('green', '✅ DEPLOYMENT APPROVED');
      colorLog('green', '   All security checks passed successfully');
    }

    // Exit code based on findings
    process.exit(criticalCount > 0 || highCount > 0 ? 1 : 0);
  }
}

// Run validation
const validator = new SecurityValidator();
validator.runAllValidations().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});