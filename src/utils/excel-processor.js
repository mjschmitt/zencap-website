/**
 * @fileoverview Excel file processing logic with advanced features
 * @module utils/excel-processor
 */

import ExcelJS from 'exceljs';
import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import winston from 'winston';
// Optional virus scanning - will be imported conditionally
// import ClamAV from 'clamav.js';
import { setCache, getCache, CacheKeys, TTL, deleteCache } from './redis.js';

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

// Initialize ClamAV if available
let clamav = null;
// Disabled ClamAV for now - uncomment to enable virus scanning
// try {
//   const ClamAV = require('clamav.js');
//   clamav = new ClamAV({
//     removeInfected: false,
//     quarantineInfected: false,
//     scanLog: null,
//     debugMode: false,
//     fileList: null,
//     scanRecursively: true,
//     clamscan: {
//       path: '/usr/bin/clamscan',
//       db: null,
//       scanArchives: true,
//       active: true
//     },
//     clamdscan: {
//       socket: '/var/run/clamav/clamd.ctl',
//       host: false,
//       port: false,
//       timeout: 60000,
//       localFallback: true,
//       path: '/usr/bin/clamdscan',
//       configFile: null,
//       multiscan: true,
//       reloadDb: false,
//       active: true,
//       bypassTest: false
//     },
//     preference: 'clamdscan'
//   });
// } catch (error) {
//   logger.warn('ClamAV not available, virus scanning disabled');
// }

/**
 * @typedef {Object} ProcessingOptions
 * @property {boolean} [validateFormulas=true] - Validate Excel formulas
 * @property {boolean} [extractImages=false] - Extract embedded images
 * @property {boolean} [preserveFormatting=true] - Preserve cell formatting
 * @property {number} [maxRows=1000000] - Maximum rows to process
 * @property {number} [maxSheets=50] - Maximum sheets to process
 * @property {Function} [onProgress] - Progress callback
 * @property {boolean} [scanForVirus=true] - Scan file for viruses
 */

/**
 * @typedef {Object} ProcessingResult
 * @property {string} fileId - Unique file identifier
 * @property {string} fileName - Original file name
 * @property {number} fileSize - File size in bytes
 * @property {number} sheetCount - Number of sheets
 * @property {number} totalRows - Total rows across all sheets
 * @property {number} totalColumns - Total columns across all sheets
 * @property {Object[]} sheets - Sheet data and metadata
 * @property {Object} summary - Processing summary
 * @property {string[]} warnings - Processing warnings
 * @property {Object} metadata - File metadata
 */

/**
 * Scan file for viruses
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if clean, false if infected
 */
async function scanFile(filePath) {
  if (!clamav) {
    logger.warn('Virus scanning skipped - ClamAV not available');
    return true;
  }

  try {
    const result = await clamav.isInfected(filePath);
    if (result) {
      logger.error(`Virus detected in file: ${filePath}`);
      return false;
    }
    return true;
  } catch (error) {
    logger.error('Virus scan error:', error);
    // In production, you might want to fail safe and reject the file
    return true;
  }
}

/**
 * Validate Excel file
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} Validation result
 */
async function validateFile(filePath) {
  const stats = await fs.stat(filePath);
  const fileSize = stats.size;
  const maxSize = 200 * 1024 * 1024; // 200MB

  if (fileSize > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of 200MB`);
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  const allowedExtensions = ['.xlsx', '.xlsm', '.xls', '.xlsb'];
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`);
  }

  // Check file signature (magic numbers)
  const buffer = Buffer.alloc(8);
  const fd = await fs.open(filePath, 'r');
  await fd.read(buffer, 0, 8, 0);
  await fd.close();

  const signature = buffer.toString('hex').toUpperCase();
  const validSignatures = [
    '504B0304', // XLSX/XLSM (ZIP format)
    'D0CF11E0A1B11AE1', // XLS (OLE format)
    '504B0506', // XLSB
    '504B0708' // XLSX encrypted
  ];

  const isValidSignature = validSignatures.some(sig => signature.startsWith(sig));
  if (!isValidSignature) {
    throw new Error('Invalid file format detected');
  }

  return { fileSize, extension: ext, valid: true };
}

/**
 * Process Excel file with ExcelJS for advanced features
 * @param {string} filePath - Path to Excel file
 * @param {ProcessingOptions} options - Processing options
 * @returns {Promise<ProcessingResult>} Processing result
 */
export async function processExcelFile(filePath, options = {}) {
  const {
    validateFormulas = true,
    extractImages = false,
    preserveFormatting = true,
    maxRows = 1000000,
    maxSheets = 50,
    onProgress = () => {},
    scanForVirus = true
  } = options;

  const startTime = Date.now();
  const fileId = crypto.randomBytes(16).toString('hex');
  const warnings = [];
  
  try {
    // Validate file
    await onProgress(0.05);
    const validation = await validateFile(filePath);
    
    // Scan for viruses
    if (scanForVirus) {
      await onProgress(0.1);
      const isClean = await scanFile(filePath);
      if (!isClean) {
        throw new Error('File failed virus scan');
      }
    }

    // Load workbook
    await onProgress(0.15);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const fileName = path.basename(filePath);
    const sheets = [];
    let totalRows = 0;
    let totalColumns = 0;
    let currentSheet = 0;

    // Check sheet count
    if (workbook.worksheets.length > maxSheets) {
      warnings.push(`File contains ${workbook.worksheets.length} sheets, processing first ${maxSheets} only`);
    }

    // Process each worksheet
    for (const worksheet of workbook.worksheets.slice(0, maxSheets)) {
      currentSheet++;
      const progressBase = 0.2 + (currentSheet / workbook.worksheets.length) * 0.7;
      await onProgress(progressBase);

      const sheetData = {
        id: worksheet.id,
        name: worksheet.name,
        state: worksheet.state,
        rows: [],
        mergedCells: [],
        images: [],
        charts: [],
        formulas: [],
        formatting: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          hasFormulas: false,
          hasImages: false,
          hasMergedCells: false
        }
      };

      // Get dimensions
      const dimensions = worksheet.dimensions;
      if (dimensions) {
        sheetData.metadata.rowCount = dimensions.bottom - dimensions.top + 1;
        sheetData.metadata.columnCount = dimensions.right - dimensions.left + 1;
        totalRows += sheetData.metadata.rowCount;
        totalColumns = Math.max(totalColumns, sheetData.metadata.columnCount);
      }

      // Check row limit
      if (totalRows > maxRows) {
        warnings.push(`Row limit exceeded. Processing stopped at ${maxRows} rows`);
        break;
      }

      // Process rows
      let rowIndex = 0;
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowIndex >= maxRows) return;
        
        const rowData = {
          number: rowNumber,
          cells: []
        };

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const cellData = {
            address: cell.address,
            value: cell.value,
            type: cell.type,
            formula: cell.formula,
            result: cell.result
          };

          // Preserve formatting if requested
          if (preserveFormatting && cell.style) {
            cellData.style = {
              font: cell.style.font,
              fill: cell.style.fill,
              border: cell.style.border,
              alignment: cell.style.alignment,
              numFmt: cell.style.numFmt
            };
          }

          // Track formulas
          if (cell.formula) {
            sheetData.metadata.hasFormulas = true;
            if (validateFormulas) {
              sheetData.formulas.push({
                address: cell.address,
                formula: cell.formula,
                result: cell.result,
                isValid: cell.result !== null && cell.result !== '#REF!'
              });
            }
          }

          rowData.cells.push(cellData);
        });

        sheetData.rows.push(rowData);
        rowIndex++;
      });

      // Process merged cells
      if (worksheet.hasMerges) {
        sheetData.metadata.hasMergedCells = true;
        worksheet.model.merges.forEach(merge => {
          sheetData.mergedCells.push(merge);
        });
      }

      // Extract images if requested
      if (extractImages && worksheet.getImages) {
        const images = worksheet.getImages();
        if (images.length > 0) {
          sheetData.metadata.hasImages = true;
          for (const image of images) {
            const imageData = workbook.getImage(image.imageId);
            sheetData.images.push({
              id: image.imageId,
              range: image.range,
              data: imageData.buffer.toString('base64'),
              extension: imageData.extension,
              name: imageData.name
            });
          }
        }
      }

      sheets.push(sheetData);
    }

    // Create processing summary
    const summary = {
      processedSheets: sheets.length,
      totalSheets: workbook.worksheets.length,
      totalRows,
      totalColumns,
      hasFormulas: sheets.some(s => s.metadata.hasFormulas),
      hasImages: sheets.some(s => s.metadata.hasImages),
      hasMergedCells: sheets.some(s => s.metadata.hasMergedCells),
      processingTime: Date.now() - startTime,
      warnings
    };

    // Extract workbook metadata
    const metadata = {
      creator: workbook.creator || 'Unknown',
      lastModifiedBy: workbook.lastModifiedBy || 'Unknown',
      created: workbook.created,
      modified: workbook.modified,
      properties: workbook.properties || {},
      calcProperties: workbook.calcProperties || {},
      views: workbook.views || []
    };

    await onProgress(0.95);

    const result = {
      fileId,
      fileName,
      fileSize: validation.fileSize,
      sheetCount: workbook.worksheets.length,
      totalRows,
      totalColumns,
      sheets,
      summary,
      warnings,
      metadata
    };

    // Cache the result
    await setCache(
      `${CacheKeys.EXCEL_DATA}${fileId}`,
      result,
      TTL.EXCEL_DATA
    );

    await onProgress(1);

    return result;

  } catch (error) {
    logger.error('Excel processing error:', error);
    throw error;
  }
}

/**
 * Process Excel file chunks for large files
 * @param {string} fileId - File identifier
 * @param {Buffer} chunk - File chunk
 * @param {number} chunkIndex - Chunk index
 * @param {number} totalChunks - Total number of chunks
 * @returns {Promise<Object>} Chunk processing result
 */
export async function processChunk(fileId, chunk, chunkIndex, totalChunks) {
  const chunkKey = `${CacheKeys.FILE_CHUNKS}${fileId}:${chunkIndex}`;
  
  try {
    // Store chunk in cache
    await setCache(chunkKey, {
      data: chunk.toString('base64'),
      index: chunkIndex,
      size: chunk.length
    }, TTL.FILE_CHUNKS);

    // Check if all chunks are received
    if (chunkIndex === totalChunks - 1) {
      // Reassemble file
      const chunks = [];
      for (let i = 0; i < totalChunks; i++) {
        const storedChunk = await getCache(`${CacheKeys.FILE_CHUNKS}${fileId}:${i}`);
        if (!storedChunk) {
          throw new Error(`Missing chunk ${i}`);
        }
        chunks.push(Buffer.from(storedChunk.data, 'base64'));
      }

      const completeFile = Buffer.concat(chunks);
      
      // Clean up chunks
      for (let i = 0; i < totalChunks; i++) {
        await deleteCache(`${CacheKeys.FILE_CHUNKS}${fileId}:${i}`);
      }

      return {
        complete: true,
        fileBuffer: completeFile,
        totalSize: completeFile.length
      };
    }

    return {
      complete: false,
      chunkStored: true,
      chunksReceived: chunkIndex + 1,
      totalChunks
    };

  } catch (error) {
    logger.error('Chunk processing error:', error);
    throw error;
  }
}

/**
 * Get paginated sheet data
 * @param {string} fileId - File identifier
 * @param {string} sheetId - Sheet identifier
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=100] - Page size
 * @returns {Promise<Object>} Paginated data
 */
export async function getPaginatedData(fileId, sheetId, page = 1, pageSize = 100) {
  const cacheKey = `${CacheKeys.EXCEL_DATA}${fileId}`;
  const cachedData = await getCache(cacheKey);
  
  if (!cachedData) {
    throw new Error('File data not found');
  }

  const sheet = cachedData.sheets.find(s => s.id === sheetId || s.name === sheetId);
  if (!sheet) {
    throw new Error('Sheet not found');
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = sheet.rows.slice(startIndex, endIndex);

  return {
    fileId,
    sheetId: sheet.id,
    sheetName: sheet.name,
    page,
    pageSize,
    totalRows: sheet.rows.length,
    totalPages: Math.ceil(sheet.rows.length / pageSize),
    rows: paginatedRows,
    metadata: sheet.metadata
  };
}

/**
 * Export processed data to different formats
 * @param {string} fileId - File identifier
 * @param {string} format - Export format (json, csv, html)
 * @returns {Promise<Buffer>} Exported data
 */
export async function exportData(fileId, format = 'json') {
  const cacheKey = `${CacheKeys.EXCEL_DATA}${fileId}`;
  const cachedData = await getCache(cacheKey);
  
  if (!cachedData) {
    throw new Error('File data not found');
  }

  switch (format.toLowerCase()) {
    case 'json':
      return Buffer.from(JSON.stringify(cachedData, null, 2));
    
    case 'csv':
      // Export first sheet as CSV
      const sheet = cachedData.sheets[0];
      if (!sheet) throw new Error('No sheets found');
      
      const csvRows = sheet.rows.map(row => {
        return row.cells.map(cell => {
          const value = cell.value || '';
          // Escape quotes and wrap in quotes if contains comma
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',');
      });
      
      return Buffer.from(csvRows.join('\n'));
    
    case 'html':
      // Generate HTML table
      let html = '<table border="1">\n';
      const firstSheet = cachedData.sheets[0];
      
      firstSheet.rows.forEach((row, index) => {
        html += '  <tr>\n';
        row.cells.forEach(cell => {
          const tag = index === 0 ? 'th' : 'td';
          html += `    <${tag}>${cell.value || ''}</${tag}>\n`;
        });
        html += '  </tr>\n';
      });
      
      html += '</table>';
      return Buffer.from(html);
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}