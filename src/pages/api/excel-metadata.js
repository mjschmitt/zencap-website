/**
 * @fileoverview API endpoint for managing Excel file metadata
 * @module api/excel-metadata
 */

import { sql } from '@vercel/postgres';
import { withRateLimit } from '../../middleware/rate-limit.js';
import { createAuditLog } from '../../utils/audit.js';
import { SECURITY_HEADERS } from '../../config/security.js';
import crypto from 'crypto';
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

/**
 * Initialize Excel metadata table
 */
export async function initializeExcelMetadataTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS excel_file_metadata (
        id SERIAL PRIMARY KEY,
        file_id VARCHAR(32) NOT NULL UNIQUE,
        original_name VARCHAR(255) NOT NULL,
        sanitized_name VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        file_hash VARCHAR(64) NOT NULL,
        mime_type VARCHAR(100),
        uploaded_by INTEGER REFERENCES users(id),
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        encryption_key_id VARCHAR(16) NOT NULL,
        encryption_iv VARCHAR(32) NOT NULL,
        encryption_auth_tag VARCHAR(32) NOT NULL,
        validation_checks JSONB,
        sheet_count INTEGER,
        row_count INTEGER,
        column_count INTEGER,
        has_macros BOOLEAN DEFAULT FALSE,
        has_external_links BOOLEAN DEFAULT FALSE,
        security_warnings JSONB,
        access_count INTEGER DEFAULT 0,
        last_accessed TIMESTAMP WITH TIME ZONE,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        INDEX idx_file_id (file_id),
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_uploaded_at (uploaded_at),
        INDEX idx_is_deleted (is_deleted)
      );
    `;

    // Create file access permissions table
    await sql`
      CREATE TABLE IF NOT EXISTS excel_file_permissions (
        id SERIAL PRIMARY KEY,
        file_id VARCHAR(32) NOT NULL REFERENCES excel_file_metadata(file_id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        permission_type VARCHAR(20) NOT NULL,
        granted_by INTEGER REFERENCES users(id),
        granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_revoked BOOLEAN DEFAULT FALSE,
        revoked_at TIMESTAMP WITH TIME ZONE,
        revoked_by INTEGER REFERENCES users(id),
        UNIQUE(file_id, user_id, permission_type),
        INDEX idx_file_permissions (file_id, user_id),
        INDEX idx_expires_at (expires_at)
      );
    `;

    logger.info('Excel metadata tables initialized successfully');
  } catch (error) {
    logger.error('Error initializing Excel metadata tables:', error);
    throw error;
  }
}

/**
 * Store file metadata
 */
async function storeMetadata(req, res) {
  const requestId = crypto.randomBytes(16).toString('hex');

  try {
    const {
      fileId,
      originalName,
      sanitizedName,
      fileSize,
      fileHash,
      mimeType,
      encryptionKeyId,
      encryptionIv,
      encryptionAuthTag,
      validationChecks,
      sheetCount,
      rowCount,
      columnCount,
      hasMacros,
      hasExternalLinks,
      securityWarnings
    } = req.body;

    // Validate required fields
    if (!fileId || !originalName || !fileSize || !fileHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store metadata in database
    const result = await sql`
      INSERT INTO excel_file_metadata (
        file_id,
        original_name,
        sanitized_name,
        file_size,
        file_hash,
        mime_type,
        uploaded_by,
        encryption_key_id,
        encryption_iv,
        encryption_auth_tag,
        validation_checks,
        sheet_count,
        row_count,
        column_count,
        has_macros,
        has_external_links,
        security_warnings
      ) VALUES (
        ${fileId},
        ${originalName},
        ${sanitizedName},
        ${fileSize},
        ${fileHash},
        ${mimeType},
        ${req.user?.id},
        ${encryptionKeyId},
        ${encryptionIv},
        ${encryptionAuthTag},
        ${JSON.stringify(validationChecks)},
        ${sheetCount},
        ${rowCount},
        ${columnCount},
        ${hasMacros},
        ${hasExternalLinks},
        ${JSON.stringify(securityWarnings)}
      )
      RETURNING *;
    `;

    await createAuditLog({
      event: 'FILE_METADATA_STORED',
      userId: req.user?.id,
      resourceType: 'excel',
      resourceId: fileId,
      metadata: { requestId }
    });

    return res.status(201).json({
      success: true,
      metadata: result.rows[0]
    });

  } catch (error) {
    logger.error('Error storing metadata:', error);
    return res.status(500).json({ error: 'Failed to store metadata' });
  }
}

/**
 * Get file metadata
 */
async function getMetadata(req, res) {
  try {
    const { fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID required' });
    }

    // Check permissions
    const hasAccess = await checkFileAccess(req.user?.id, fileId);
    if (!hasAccess) {
      await createAuditLog({
        event: 'PERMISSION_DENIED',
        userId: req.user?.id,
        resourceType: 'excel',
        resourceId: fileId,
        severity: 'warning'
      });
      
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await sql`
      SELECT 
        file_id,
        original_name,
        file_size,
        mime_type,
        uploaded_at,
        sheet_count,
        row_count,
        column_count,
        has_macros,
        has_external_links,
        security_warnings,
        access_count
      FROM excel_file_metadata
      WHERE file_id = ${fileId}
        AND is_deleted = FALSE;
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update access count
    await sql`
      UPDATE excel_file_metadata
      SET 
        access_count = access_count + 1,
        last_accessed = CURRENT_TIMESTAMP
      WHERE file_id = ${fileId};
    `;

    return res.status(200).json({
      success: true,
      metadata: result.rows[0]
    });

  } catch (error) {
    logger.error('Error getting metadata:', error);
    return res.status(500).json({ error: 'Failed to get metadata' });
  }
}

/**
 * Delete file metadata (soft delete)
 */
async function deleteMetadata(req, res) {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID required' });
    }

    // Check ownership
    const ownership = await sql`
      SELECT uploaded_by 
      FROM excel_file_metadata 
      WHERE file_id = ${fileId} AND is_deleted = FALSE;
    `;

    if (ownership.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (ownership.rows[0].uploaded_by !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    // Soft delete
    await sql`
      UPDATE excel_file_metadata
      SET 
        is_deleted = TRUE,
        deleted_at = CURRENT_TIMESTAMP
      WHERE file_id = ${fileId};
    `;

    await createAuditLog({
      event: 'FILE_DELETE',
      userId: req.user?.id,
      resourceType: 'excel',
      resourceId: fileId,
      severity: 'warning'
    });

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting metadata:', error);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
}

/**
 * Check file access permissions
 */
async function checkFileAccess(userId, fileId) {
  if (!userId) return false;

  // Check if user owns the file
  const ownership = await sql`
    SELECT 1 
    FROM excel_file_metadata 
    WHERE file_id = ${fileId} 
      AND uploaded_by = ${userId}
      AND is_deleted = FALSE;
  `;

  if (ownership.rows.length > 0) return true;

  // Check if user has permissions
  const permissions = await sql`
    SELECT 1 
    FROM excel_file_permissions 
    WHERE file_id = ${fileId} 
      AND user_id = ${userId}
      AND is_revoked = FALSE
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
  `;

  return permissions.rows.length > 0;
}

/**
 * Main handler
 */
const handler = async (req, res) => {
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Require authentication
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  switch (req.method) {
    case 'POST':
      return storeMetadata(req, res);
    case 'GET':
      return getMetadata(req, res);
    case 'DELETE':
      return deleteMetadata(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with rate limiting
export default withRateLimit(handler, 'api');