/**
 * @fileoverview Excel data retrieval API with pagination
 * @module api/excel/data/[fileId]
 */

import { getPaginatedData, exportData } from '../../../../utils/excel-processor.js';
import { getCache, CacheKeys } from '../../../../utils/redis.js';
import { sql } from '@vercel/postgres';
import { withMiddleware } from '../../../../middleware/auth.js';
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
 * Handle data retrieval requests
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handler(req, res) {
  const { fileId } = req.query;

  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: 'File ID is required'
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Check file ownership
    const fileResult = await sql`
      SELECT * FROM excel_files WHERE id = ${fileId}
    `;

    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const file = fileResult.rows[0];

    // Check access permissions
    if (file.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if file is processed
    if (!file.processed) {
      return res.status(400).json({
        success: false,
        error: 'File is still being processed'
      });
    }

    // Handle different query types
    const { type, sheet, page, pageSize, format } = req.query;

    switch (type) {
      case 'summary':
        return handleGetSummary(req, res, fileId);
      case 'sheet':
        return handleGetSheetData(req, res, fileId, sheet, page, pageSize);
      case 'export':
        return handleExportData(req, res, fileId, format);
      default:
        return handleGetFileData(req, res, fileId);
    }

  } catch (error) {
    logger.error('Data retrieval error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve data'
    });
  }
}

/**
 * Get file summary
 * GET /api/excel/data/[fileId]?type=summary
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @param {string} fileId - File ID
 */
async function handleGetSummary(req, res, fileId) {
  try {
    const cacheKey = `${CacheKeys.EXCEL_DATA}${fileId}`;
    const cachedData = await getCache(cacheKey);

    if (!cachedData) {
      return res.status(404).json({
        success: false,
        error: 'Processed data not found in cache'
      });
    }

    const summary = {
      fileId: cachedData.fileId,
      fileName: cachedData.fileName,
      fileSize: cachedData.fileSize,
      sheetCount: cachedData.sheetCount,
      totalRows: cachedData.totalRows,
      totalColumns: cachedData.totalColumns,
      sheets: cachedData.sheets.map(sheet => ({
        id: sheet.id,
        name: sheet.name,
        rowCount: sheet.metadata.rowCount,
        columnCount: sheet.metadata.columnCount,
        hasFormulas: sheet.metadata.hasFormulas,
        hasImages: sheet.metadata.hasImages,
        hasMergedCells: sheet.metadata.hasMergedCells
      })),
      metadata: cachedData.metadata,
      warnings: cachedData.warnings
    };

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('ETag', `"${fileId}-summary"`);

    return res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Get summary error:', error);
    throw error;
  }
}

/**
 * Get paginated sheet data
 * GET /api/excel/data/[fileId]?type=sheet&sheet=Sheet1&page=1&pageSize=100
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @param {string} fileId - File ID
 * @param {string} sheet - Sheet name or ID
 * @param {string} page - Page number
 * @param {string} pageSize - Page size
 */
async function handleGetSheetData(req, res, fileId, sheet, page, pageSize) {
  try {
    if (!sheet) {
      return res.status(400).json({
        success: false,
        error: 'Sheet parameter is required'
      });
    }

    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 100;

    // Validate pagination parameters
    if (pageNum < 1 || size < 1 || size > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters'
      });
    }

    const paginatedData = await getPaginatedData(fileId, sheet, pageNum, size);

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('ETag', `"${fileId}-${sheet}-${pageNum}-${size}"`);

    return res.status(200).json({
      success: true,
      data: paginatedData
    });

  } catch (error) {
    if (error.message === 'File data not found') {
      return res.status(404).json({
        success: false,
        error: 'Processed data not found in cache'
      });
    }

    if (error.message === 'Sheet not found') {
      return res.status(404).json({
        success: false,
        error: 'Sheet not found'
      });
    }

    logger.error('Get sheet data error:', error);
    throw error;
  }
}

/**
 * Export data in different formats
 * GET /api/excel/data/[fileId]?type=export&format=json
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @param {string} fileId - File ID
 * @param {string} format - Export format (json, csv, html)
 */
async function handleExportData(req, res, fileId, format = 'json') {
  try {
    const allowedFormats = ['json', 'csv', 'html'];
    
    if (!allowedFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: `Invalid format. Allowed formats: ${allowedFormats.join(', ')}`
      });
    }

    const exportedData = await exportData(fileId, format);

    // Set appropriate headers based on format
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      html: 'text/html'
    };

    const fileExtensions = {
      json: 'json',
      csv: 'csv',
      html: 'html'
    };

    res.setHeader('Content-Type', contentTypes[format]);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileId}.${fileExtensions[format]}"`
    );
    res.setHeader('Cache-Control', 'public, max-age=3600');

    return res.status(200).send(exportedData);

  } catch (error) {
    if (error.message === 'File data not found') {
      return res.status(404).json({
        success: false,
        error: 'Processed data not found in cache'
      });
    }

    logger.error('Export data error:', error);
    throw error;
  }
}

/**
 * Get complete file data (default)
 * GET /api/excel/data/[fileId]
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @param {string} fileId - File ID
 */
async function handleGetFileData(req, res, fileId) {
  try {
    const cacheKey = `${CacheKeys.EXCEL_DATA}${fileId}`;
    const cachedData = await getCache(cacheKey);

    if (!cachedData) {
      return res.status(404).json({
        success: false,
        error: 'Processed data not found in cache'
      });
    }

    // For large files, return summary with sheet links
    if (cachedData.totalRows > 10000) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            fileId: cachedData.fileId,
            fileName: cachedData.fileName,
            fileSize: cachedData.fileSize,
            sheetCount: cachedData.sheetCount,
            totalRows: cachedData.totalRows,
            totalColumns: cachedData.totalColumns
          },
          sheets: cachedData.sheets.map(sheet => ({
            id: sheet.id,
            name: sheet.name,
            metadata: sheet.metadata,
            dataUrl: `/api/excel/data/${fileId}?type=sheet&sheet=${encodeURIComponent(sheet.name)}`
          })),
          message: 'File is too large. Use sheet-specific endpoints to retrieve data.'
        }
      });
    }

    // For smaller files, return all data
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('ETag', `"${fileId}-full"`);

    return res.status(200).json({
      success: true,
      data: cachedData
    });

  } catch (error) {
    logger.error('Get file data error:', error);
    throw error;
  }
}

// Export with middleware
export default withMiddleware(handler, {
  auth: true,
  cors: true
});