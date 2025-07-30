/**
 * @fileoverview Secure Excel file upload API with comprehensive security measures
 * @module api/excel/secure-upload
 */

import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import { withMiddleware, authorize } from '../../../middleware/auth.js';
import { withRateLimit } from '../../../middleware/rate-limit.js';
import { 
  excelSecurityMiddleware, 
  validateExcelFile,
  sanitizeFilename,
  generateSecureFileId,
  encryptFile
} from '../../../middleware/excel-security.js';
import { createAuditLog, logFileAccess, createSecurityIncident } from '../../../utils/audit.js';
import { scanFile, quarantineFile } from '../../../utils/virus-scanner.js';
import { sql } from '@vercel/postgres';
import { FILE_SECURITY, SECURITY_HEADERS } from '../../../config/security.js';

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

// Secure upload directory (not in public folder)
const SECURE_UPLOAD_DIR = process.env.SECURE_UPLOAD_DIR || '/var/secure/excel-uploads';
const ENCRYPTION_KEY = process.env.FILE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '200mb'
  }
};

/**
 * Handle secure Excel file upload
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const startTime = Date.now();
  const uploadId = generateSecureFileId();
  let uploadedFile = null;
  let tempFilePath = null;

  try {
    // Log upload attempt
    await createAuditLog({
      event: 'FILE_UPLOAD',
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionId,
      resourceType: 'excel_file',
      action: 'upload_start',
      metadata: {
        uploadId
      }
    });

    // Ensure secure upload directory exists
    await fs.mkdir(SECURE_UPLOAD_DIR, { recursive: true });

    // Configure formidable with security settings
    const form = formidable({
      uploadDir: SECURE_UPLOAD_DIR,
      keepExtensions: false,
      maxFileSize: FILE_SECURITY.maxFileSize,
      maxFields: 1,
      maxFieldsSize: 2 * 1024 * 1024, // 2MB for form fields
      filter: function ({ name, originalFilename, mimetype }) {
        // Pre-filter files
        const ext = path.extname(originalFilename || '').toLowerCase();
        return FILE_SECURITY.allowedExtensions.includes(ext);
      }
    });

    // Parse form data
    const [fields, files] = await form.parse(req);
    
    if (!files.file || !files.file[0]) {
      throw new Error('No file uploaded');
    }

    uploadedFile = files.file[0];
    tempFilePath = uploadedFile.filepath;

    // Read file buffer for validation
    const fileBuffer = await fs.readFile(tempFilePath);

    // Comprehensive security validation
    logger.info('Starting security validation', { uploadId });
    
    const validationResult = await validateExcelFile(
      {
        filename: uploadedFile.originalFilename,
        mimeType: uploadedFile.mimetype
      },
      fileBuffer,
      {
        scanContent: true,
        scanVirus: true,
        failOnScanError: true
      }
    );

    if (!validationResult.valid) {
      // Security violation detected
      await createSecurityIncident({
        type: 'MALICIOUS_FILE_UPLOAD',
        severity: validationResult.issues.some(i => i.severity === 'critical') ? 'critical' : 'high',
        userId: req.user.id,
        ipAddress: req.ip,
        description: `Malicious Excel file upload attempt: ${validationResult.issues.map(i => i.message).join(', ')}`,
        metadata: {
          uploadId,
          filename: uploadedFile.originalFilename,
          issues: validationResult.issues,
          fileHash: validationResult.hash
        }
      });

      // Quarantine the file if it contains malware
      if (validationResult.issues.some(i => i.type === 'virus')) {
        await quarantineFile(
          fileBuffer,
          uploadedFile.originalFilename,
          {
            threats: validationResult.issues.filter(i => i.type === 'virus').map(i => i.details),
            scanner: 'integrated',
            scanTime: new Date()
          }
        );
      }

      // Clean up and reject
      await fs.unlink(tempFilePath);
      
      return res.status(400).json({
        success: false,
        error: 'File validation failed',
        code: 'INVALID_FILE',
        issues: validationResult.issues.map(i => ({
          type: i.type,
          message: i.message,
          severity: i.severity
        }))
      });
    }

    // Generate secure filename and paths
    const sanitizedFilename = sanitizeFilename(uploadedFile.originalFilename);
    const fileExtension = path.extname(sanitizedFilename);
    const secureFilename = `${uploadId}${fileExtension}`;
    const encryptedFilename = `${uploadId}.enc`;
    const finalPath = path.join(SECURE_UPLOAD_DIR, secureFilename);
    const encryptedPath = path.join(SECURE_UPLOAD_DIR, encryptedFilename);

    // Encrypt file at rest
    logger.info('Encrypting file', { uploadId });
    
    const encryptionResult = encryptFile(fileBuffer, ENCRYPTION_KEY);
    await fs.writeFile(encryptedPath, encryptionResult.encrypted);

    // Store file metadata in database
    const fileRecord = await sql`
      INSERT INTO secure_excel_files (
        id,
        user_id,
        original_filename,
        secure_filename,
        encrypted_filename,
        file_size,
        file_hash,
        mime_type,
        encryption_iv,
        encryption_auth_tag,
        validation_status,
        validation_details,
        upload_ip,
        created_at
      ) VALUES (
        ${uploadId},
        ${req.user.id},
        ${uploadedFile.originalFilename},
        ${secureFilename},
        ${encryptedFilename},
        ${fileBuffer.length},
        ${validationResult.hash},
        ${uploadedFile.mimetype},
        ${encryptionResult.iv},
        ${encryptionResult.authTag},
        'validated',
        ${JSON.stringify(validationResult)},
        ${req.ip},
        NOW()
      )
      RETURNING *;
    `;

    // Clean up original temp file
    await fs.unlink(tempFilePath);

    // Log successful upload
    const processingTime = Date.now() - startTime;
    
    await logFileAccess({
      fileId: uploadId,
      userId: req.user.id,
      accessType: 'upload',
      ipAddress: req.ip,
      success: true,
      fileSize: fileBuffer.length,
      processingTime
    });

    await createAuditLog({
      event: 'FILE_UPLOAD',
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionId,
      resourceType: 'excel_file',
      resourceId: uploadId,
      action: 'upload_complete',
      result: 'success',
      metadata: {
        uploadId,
        filename: uploadedFile.originalFilename,
        fileSize: fileBuffer.length,
        processingTime,
        validationPassed: true,
        encrypted: true
      }
    });

    logger.info('File uploaded successfully', {
      uploadId,
      userId: req.user.id,
      processingTime
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        fileId: uploadId,
        filename: uploadedFile.originalFilename,
        size: fileBuffer.length,
        uploadedAt: new Date().toISOString(),
        validationStatus: 'passed',
        processingUrl: `/api/excel/process/${uploadId}`
      }
    });

  } catch (error) {
    logger.error('Upload error:', error);

    // Log failed upload
    await logFileAccess({
      fileId: uploadId,
      userId: req.user?.id,
      accessType: 'upload',
      ipAddress: req.ip,
      success: false,
      errorCode: error.code || 'UPLOAD_ERROR',
      processingTime: Date.now() - startTime
    });

    await createAuditLog({
      event: 'FILE_UPLOAD',
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionId,
      resourceType: 'excel_file',
      action: 'upload_failed',
      result: 'failure',
      severity: 'warning',
      errorDetails: {
        message: error.message,
        code: error.code
      },
      metadata: {
        uploadId
      }
    });

    // Clean up temp file if it exists
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        logger.error('Failed to clean up temp file:', cleanupError);
      }
    }

    // Return appropriate error response
    if (error.message.includes('File size exceeds')) {
      return res.status(413).json({
        success: false,
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
        maxSize: FILE_SECURITY.maxFileSize
      });
    }

    if (error.message.includes('No file uploaded')) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        code: 'NO_FILE'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      code: 'UPLOAD_ERROR'
    });
  }
}

// Apply middleware layers
export default withMiddleware(
  excelSecurityMiddleware()(
    withRateLimit(handler, 'upload')
  ),
  { 
    auth: true, 
    roles: ['admin', 'user'],
    cors: true 
  }
);