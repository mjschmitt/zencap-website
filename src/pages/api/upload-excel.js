import formidable from 'formidable';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import crypto from 'crypto';
import { withRateLimit } from '../../middleware/rate-limit.js';
import { 
  validateExcelFile, 
  sanitizeFilename, 
  encryptFile, 
  hashFileContent,
  excelSecurityMiddleware 
} from '../../middleware/excel-security.js';
import { createAuditLog, logFileAccess } from '../../utils/audit.js';
import { scanFile, quarantineFile } from '../../utils/virus-scanner.js';
import { FILE_SECURITY, SECURITY_HEADERS } from '../../config/security.js';
import { PRODUCTION_CONFIG } from '../../config/production.js';
import winston from 'winston';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

// Use secure temporary directory instead of public directory
const uploadDir = path.join(process.cwd(), '.temp', 'uploads', 'excel');
const secureStorageDir = path.join(process.cwd(), '.secure', 'excel');

// Ensure directories exist
(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(secureStorageDir, { recursive: true });
  } catch (error) {
    logger.error('Failed to create upload directories:', error);
  }
})();

// Apply rate limiting and security middleware
const handler = async (req, res) => {
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Generate unique request ID for tracking
  const requestId = crypto.randomBytes(16).toString('hex');
  const startTime = Date.now();

  try {
    // Create audit log for upload attempt
    await createAuditLog({
      event: 'FILE_UPLOAD',
      userId: req.user?.id,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata: { requestId }
    });

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: Math.min(FILE_SECURITY.maxFileSize, PRODUCTION_CONFIG.upload.maxFileSize), // Enforce 100MB limit in production
      maxFields: 10,
      maxFieldsSize: 2 * 1024 * 1024, // 2MB for form fields
      hashAlgorithm: 'sha256',
      filter: function ({ name, originalFilename, mimetype }) {
        // Strict validation using security config
        const ext = path.extname(originalFilename || '').toLowerCase();
        const isValidExt = FILE_SECURITY.allowedExtensions.includes(ext);
        const isValidMime = FILE_SECURITY.allowedMimeTypes.includes(mimetype);
        
        if (!isValidExt || !isValidMime) {
          logger.warn('File rejected by filter:', {
            filename: originalFilename,
            mimetype,
            extension: ext,
            requestId
          });
        }
        
        return isValidExt && isValidMime;
      }
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.file || !files.file[0]) {
      await createAuditLog({
        event: 'FILE_UPLOAD',
        userId: req.user?.id,
        result: 'failure',
        metadata: { 
          requestId,
          error: 'No file uploaded' 
        }
      });
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = files.file[0];
    const originalFilename = uploadedFile.originalFilename;
    const fileExtension = path.extname(originalFilename).toLowerCase();
    
    // Read file buffer for security validation
    const fileBuffer = await fs.readFile(uploadedFile.filepath);
    
    // Comprehensive security validation
    const validationResult = await validateExcelFile(
      {
        filename: originalFilename,
        mimeType: uploadedFile.mimetype,
        size: uploadedFile.size
      },
      fileBuffer,
      {
        scanVirus: true,
        scanContent: true,
        failOnScanError: true
      }
    );

    if (!validationResult.valid) {
      // Clean up uploaded file
      await fs.unlink(uploadedFile.filepath);
      
      // Log security incident
      await createAuditLog({
        event: 'FILE_UPLOAD',
        userId: req.user?.id,
        result: 'failure',
        severity: 'warning',
        metadata: {
          requestId,
          filename: originalFilename,
          issues: validationResult.issues,
          hash: validationResult.hash
        }
      });

      // If malware detected, quarantine the file
      const hasMalware = validationResult.issues.some(i => i.type === 'virus');
      if (hasMalware) {
        await quarantineFile(fileBuffer, originalFilename, validationResult);
        
        await createAuditLog({
          event: 'MALWARE_DETECTED',
          userId: req.user?.id,
          severity: 'critical',
          metadata: {
            requestId,
            filename: originalFilename,
            threats: validationResult.issues.filter(i => i.type === 'virus')
          }
        });
      }

      return res.status(400).json({ 
        error: 'File validation failed',
        issues: validationResult.issues.map(i => ({
          type: i.type,
          message: i.message,
          severity: i.severity
        }))
      });
    }

    // Generate secure filename and encrypt file
    const fileId = crypto.randomBytes(16).toString('hex');
    const sanitizedName = sanitizeFilename(originalFilename);
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    // Encrypt file before storage
    const { encrypted, iv, authTag } = encryptFile(fileBuffer, encryptionKey);
    
    // Store encrypted file in secure location
    const encryptedFilename = `${fileId}.enc`;
    const encryptedPath = path.join(secureStorageDir, encryptedFilename);
    await fs.writeFile(encryptedPath, encrypted);
    
    // Store file metadata securely (in production, use database)
    const fileMetadata = {
      fileId,
      originalName: originalFilename,
      sanitizedName,
      size: uploadedFile.size,
      hash: validationResult.hash,
      mimeType: uploadedFile.mimetype,
      uploadedBy: req.user?.id || 'anonymous',
      uploadedAt: new Date().toISOString(),
      encryption: {
        algorithm: 'aes-256-gcm',
        keyId: crypto.createHash('sha256').update(encryptionKey).digest('hex').substring(0, 8),
        iv,
        authTag
      },
      validationChecks: validationResult.checks,
      processingTime: Date.now() - startTime
    };
    
    // Clean up temporary file
    await fs.unlink(uploadedFile.filepath);

    // Validate Excel structure and content
    try {
      const workbook = XLSX.read(fileBuffer, {
        type: 'buffer',
        cellFormula: false, // Disable formula evaluation for security
        cellHTML: false,
        cellText: false,
        password: undefined // Don't process password-protected files
      });
      
      // Get basic file info
      const sheetNames = workbook.SheetNames;
      const firstSheet = workbook.Sheets[sheetNames[0]];
      const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1:A1');
      
      // Check for suspicious content
      let hasSuspiciousContent = false;
      for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        for (const cellAddress in sheet) {
          if (cellAddress[0] === '!') continue;
          const cell = sheet[cellAddress];
          
          // Check for suspicious formulas
          if (cell.f) {
            const formulaValidation = validateFormula(cell.f);
            if (!formulaValidation.valid) {
              hasSuspiciousContent = true;
              logger.warn('Suspicious formula detected:', {
                sheet: sheetName,
                cell: cellAddress,
                formula: cell.f,
                issues: formulaValidation.issues
              });
            }
          }
        }
      }
      
      if (hasSuspiciousContent) {
        await createAuditLog({
          event: 'FORMULA_BLOCKED',
          userId: req.user?.id,
          severity: 'warning',
          metadata: {
            fileId,
            requestId
          }
        });
      }
      
      // Log successful file upload
      await logFileAccess({
        fileId,
        userId: req.user?.id,
        accessType: 'upload',
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        success: true,
        fileSize: uploadedFile.size,
        processingTime: Date.now() - startTime
      });
      
      await createAuditLog({
        event: 'FILE_UPLOAD',
        userId: req.user?.id,
        result: 'success',
        resourceType: 'excel',
        resourceId: fileId,
        metadata: {
          requestId,
          filename: originalFilename,
          fileId,
          size: uploadedFile.size,
          processingTime: Date.now() - startTime
        }
      });
      
      // Return secure file info (no direct file paths)
      const fileInfo = {
        fileId,
        originalName: originalFilename,
        size: uploadedFile.size,
        sheets: sheetNames,
        rows: range.e.r + 1,
        columns: range.e.c + 1,
        uploadedAt: new Date().toISOString(),
        securityChecks: validationResult.checks,
        warnings: hasSuspiciousContent ? ['File contains potentially dangerous formulas'] : []
      };

      return res.status(200).json({
        success: true,
        message: 'Excel file uploaded and secured successfully',
        file: fileInfo
      });

    } catch (excelError) {
      // Clean up encrypted file on error
      try {
        await fs.unlink(encryptedPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      logger.error('Excel processing error:', {
        error: excelError.message,
        fileId,
        requestId
      });
      
      await createAuditLog({
        event: 'FILE_UPLOAD',
        userId: req.user?.id,
        result: 'failure',
        severity: 'error',
        metadata: {
          requestId,
          fileId,
          error: 'Excel processing failed',
          errorDetails: excelError.message
        }
      });
      
      return res.status(400).json({ 
        error: 'Invalid Excel file format or corrupted file',
        details: 'The file could not be processed as a valid Excel document'
      });
    }

  } catch (error) {
    logger.error('Upload error:', {
      error: error.message,
      stack: error.stack,
      requestId
    });
    
    await createAuditLog({
      event: 'FILE_UPLOAD',
      userId: req.user?.id,
      result: 'failure',
      severity: 'error',
      metadata: {
        requestId,
        error: error.message,
        processingTime: Date.now() - startTime
      }
    });
    
    // Don't expose internal errors to client
    return res.status(500).json({ 
      error: 'File upload failed. Please try again.',
      requestId // For support purposes
    });
  }
};

// Import validateFormula from excel-security
import { validateFormula } from '../../middleware/excel-security.js';

// Export handler with rate limiting and security middleware
export default withRateLimit(
  excelSecurityMiddleware()(async (req, res) => handler(req, res)),
  'upload'
); 