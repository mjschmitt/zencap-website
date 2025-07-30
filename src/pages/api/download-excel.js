/**
 * @fileoverview Secure Excel file download endpoint
 * @module api/download-excel
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { withRateLimit } from '../../middleware/rate-limit.js';
import { decryptFile } from '../../middleware/excel-security.js';
import { createAuditLog, logFileAccess } from '../../utils/audit.js';
import { SECURITY_HEADERS } from '../../config/security.js';
import winston from 'winston';

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

const secureStorageDir = path.join(process.cwd(), '.secure', 'excel');

/**
 * Secure download handler
 */
const handler = async (req, res) => {
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    // Override cache control for file downloads
    if (key === 'Cache-Control') {
      res.setHeader(key, 'private, no-cache, no-store, must-revalidate');
    } else {
      res.setHeader(key, value);
    }
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestId = crypto.randomBytes(16).toString('hex');
  const startTime = Date.now();

  try {
    const { fileId } = req.query;

    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Validate file ID format
    if (!/^[a-f0-9]{32}$/.test(fileId)) {
      await createAuditLog({
        event: 'UNAUTHORIZED_ACCESS',
        userId: req.user?.id,
        severity: 'warning',
        metadata: {
          requestId,
          fileId,
          reason: 'Invalid file ID format'
        }
      });
      
      return res.status(400).json({ error: 'Invalid file ID format' });
    }

    // Check user permissions (implement your authorization logic)
    const hasAccess = await checkUserAccess(req.user, fileId);
    if (!hasAccess) {
      await createAuditLog({
        event: 'PERMISSION_DENIED',
        userId: req.user?.id,
        severity: 'warning',
        resourceType: 'excel',
        resourceId: fileId,
        metadata: { requestId }
      });
      
      return res.status(403).json({ error: 'Access denied' });
    }

    // Load file metadata (in production, from database)
    const metadataPath = path.join(secureStorageDir, `${fileId}.meta.json`);
    let metadata;
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      logger.error('Metadata not found:', { fileId, error: error.message });
      
      await createAuditLog({
        event: 'FILE_DOWNLOAD',
        userId: req.user?.id,
        result: 'failure',
        resourceType: 'excel',
        resourceId: fileId,
        metadata: {
          requestId,
          error: 'File not found'
        }
      });
      
      return res.status(404).json({ error: 'File not found' });
    }

    // Read encrypted file
    const encryptedPath = path.join(secureStorageDir, `${fileId}.enc`);
    const encryptedBuffer = await fs.readFile(encryptedPath);

    // Decrypt file (in production, retrieve key from secure key management)
    const decryptionKey = metadata.encryption.key; // This should be from secure storage
    const decryptedBuffer = decryptFile(
      encryptedBuffer,
      decryptionKey,
      metadata.encryption.iv,
      metadata.encryption.authTag
    );

    // Log file access
    await logFileAccess({
      fileId,
      userId: req.user?.id,
      accessType: 'download',
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      success: true,
      fileSize: decryptedBuffer.length,
      processingTime: Date.now() - startTime
    });

    await createAuditLog({
      event: 'FILE_DOWNLOAD',
      userId: req.user?.id,
      result: 'success',
      resourceType: 'excel',
      resourceId: fileId,
      metadata: {
        requestId,
        filename: metadata.originalName,
        size: decryptedBuffer.length,
        processingTime: Date.now() - startTime
      }
    });

    // Set secure download headers
    res.setHeader('Content-Type', metadata.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(metadata.originalName)}"`);
    res.setHeader('Content-Length', decryptedBuffer.length);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-File-Id', fileId);

    // Send file
    res.send(decryptedBuffer);

  } catch (error) {
    logger.error('Download error:', {
      error: error.message,
      stack: error.stack,
      requestId
    });

    await createAuditLog({
      event: 'FILE_DOWNLOAD',
      userId: req.user?.id,
      result: 'failure',
      severity: 'error',
      metadata: {
        requestId,
        error: error.message
      }
    });

    return res.status(500).json({
      error: 'Download failed',
      requestId
    });
  }
};

/**
 * Check user access to file
 * @param {Object} user - User object
 * @param {string} fileId - File ID
 * @returns {Promise<boolean>} Access allowed
 */
async function checkUserAccess(user, fileId) {
  // Implement your authorization logic here
  // For now, require authenticated user
  if (!user) return false;
  
  // In production, check:
  // - User owns the file
  // - User has been granted access
  // - User has purchased the model (for premium content)
  // - User's subscription is active
  
  return true;
}

// Export with rate limiting
export default withRateLimit(handler, 'download');