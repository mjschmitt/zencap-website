/**
 * @fileoverview Excel file upload API with chunked upload support
 * @module api/excel/upload
 */

import { v4 as uuidv4 } from 'uuid';
import busboy from 'busboy';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import winston from 'winston';
import { withMiddleware } from '../../../middleware/auth.js';
import { withRateLimit } from '../../../middleware/rate-limit.js';
import { processChunk, processExcelFile } from '../../../utils/excel-processor.js';
import { queueExcelProcessing } from '../../../utils/queue.js';
import { setCache, getCache, deleteCache, CacheKeys, TTL } from '../../../utils/redis.js';
import { sql } from '@vercel/postgres';

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

// Upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 200 * 1024 * 1024, // 200MB
  maxChunkSize: 10 * 1024 * 1024, // 10MB per chunk
  allowedMimeTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
  ],
  uploadDir: process.env.UPLOAD_DIR || '/tmp/excel-uploads'
};

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_CONFIG.uploadDir);
  } catch {
    await fs.mkdir(UPLOAD_CONFIG.uploadDir, { recursive: true });
  }
}

/**
 * Handle file upload
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await ensureUploadDir();

  // Check if this is a chunked upload
  const isChunked = req.headers['x-chunk-index'] !== undefined;

  if (isChunked) {
    return handleChunkedUpload(req, res);
  } else {
    return handleRegularUpload(req, res);
  }
}

/**
 * Handle chunked upload
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handleChunkedUpload(req, res) {
  try {
    const chunkIndex = parseInt(req.headers['x-chunk-index']);
    const totalChunks = parseInt(req.headers['x-total-chunks']);
    const fileId = req.headers['x-file-id'];
    const fileName = req.headers['x-file-name'];
    const fileSize = parseInt(req.headers['x-file-size']);

    // Validate chunk headers
    if (isNaN(chunkIndex) || isNaN(totalChunks) || !fileId || !fileName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid chunk headers'
      });
    }

    // Validate file size
    if (fileSize > UPLOAD_CONFIG.maxFileSize) {
      return res.status(413).json({
        success: false,
        error: `File size exceeds maximum allowed size of ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`
      });
    }

    // Get or create upload session
    const sessionKey = `${CacheKeys.FILE_CHUNKS}session:${fileId}`;
    let session = await getCache(sessionKey);
    
    if (!session) {
      session = {
        fileId,
        fileName,
        fileSize,
        totalChunks,
        userId: req.user.id,
        startedAt: Date.now(),
        chunks: []
      };
      await setCache(sessionKey, session, TTL.FILE_CHUNKS);
    }

    // Read chunk data
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    const chunkBuffer = await new Promise((resolve, reject) => {
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    // Validate chunk size
    if (chunkBuffer.length > UPLOAD_CONFIG.maxChunkSize) {
      return res.status(413).json({
        success: false,
        error: 'Chunk size exceeds maximum allowed size'
      });
    }

    // Process chunk
    const result = await processChunk(fileId, chunkBuffer, chunkIndex, totalChunks);

    if (result.complete) {
      // All chunks received, save complete file
      const filePath = path.join(UPLOAD_CONFIG.uploadDir, `${fileId}_${fileName}`);
      await fs.writeFile(filePath, result.fileBuffer);

      // Clean up session
      await deleteCache(sessionKey);

      // Create database record
      const dbResult = await sql`
        INSERT INTO excel_files 
        (id, user_id, filename, file_path, file_size, mime_type, created_at) 
        VALUES (${fileId}, ${req.user.id}, ${fileName}, ${filePath}, ${fileSize}, ${'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}, NOW()) 
        RETURNING *
      `;

      // Queue for processing
      const job = await queueExcelProcessing({
        fileId,
        filePath,
        userId: req.user.id,
        options: {
          validateFormulas: true,
          preserveFormatting: true
        }
      });

      logger.info('Chunked upload completed:', {
        fileId,
        fileName,
        fileSize,
        userId: req.user.id,
        jobId: job.id
      });

      return res.status(200).json({
        success: true,
        data: {
          fileId,
          jobId: job.id.toString(),
          message: 'File uploaded successfully and queued for processing'
        }
      });
    } else {
      // Update session
      session.chunks.push(chunkIndex);
      await setCache(sessionKey, session, TTL.FILE_CHUNKS);

      return res.status(200).json({
        success: true,
        data: {
          fileId,
          chunksReceived: result.chunksReceived,
          totalChunks: result.totalChunks,
          progress: (result.chunksReceived / result.totalChunks) * 100
        }
      });
    }

  } catch (error) {
    logger.error('Chunked upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Chunked upload failed'
    });
  }
}

/**
 * Handle regular (non-chunked) upload
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handleRegularUpload(req, res) {
  const fileId = uuidv4();
  let filePath = null;
  let uploadedFile = null;

  try {
    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: UPLOAD_CONFIG.maxFileSize,
        files: 1
      }
    });

    const uploadPromise = new Promise((resolve, reject) => {
      let fileProcessed = false;

      bb.on('file', async (fieldname, file, info) => {
        const { filename, encoding, mimeType } = info;

        // Validate mime type
        if (!UPLOAD_CONFIG.allowedMimeTypes.includes(mimeType)) {
          file.resume();
          return reject(new Error('Invalid file type. Only Excel files are allowed.'));
        }

        // Generate secure filename
        const ext = path.extname(filename);
        const secureFilename = `${fileId}_${Date.now()}${ext}`;
        filePath = path.join(UPLOAD_CONFIG.uploadDir, secureFilename);

        // Create write stream
        const chunks = [];
        let fileSize = 0;

        file.on('data', (chunk) => {
          chunks.push(chunk);
          fileSize += chunk.length;

          // Check size limit
          if (fileSize > UPLOAD_CONFIG.maxFileSize) {
            file.destroy();
            reject(new Error(`File size exceeds maximum allowed size of ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`));
          }
        });

        file.on('end', async () => {
          if (fileSize === 0) {
            return reject(new Error('Empty file uploaded'));
          }

          try {
            const buffer = Buffer.concat(chunks);
            await fs.writeFile(filePath, buffer);

            uploadedFile = {
              fieldname,
              filename,
              secureFilename,
              mimeType,
              encoding,
              size: fileSize,
              path: filePath
            };

            fileProcessed = true;
            resolve(uploadedFile);
          } catch (error) {
            reject(error);
          }
        });

        file.on('error', reject);
      });

      bb.on('error', reject);

      bb.on('finish', () => {
        if (!fileProcessed) {
          reject(new Error('No file uploaded'));
        }
      });
    });

    // Pipe request to busboy
    req.pipe(bb);

    // Wait for upload to complete
    uploadedFile = await uploadPromise;

    // Create database record
    const dbResult = await sql`
      INSERT INTO excel_files 
      (id, user_id, filename, file_path, file_size, mime_type, created_at) 
      VALUES (${fileId}, ${req.user.id}, ${uploadedFile.filename}, ${uploadedFile.path}, ${uploadedFile.size}, ${uploadedFile.mimeType}, NOW()) 
      RETURNING *
    `;

    // Queue for processing
    const job = await queueExcelProcessing({
      fileId,
      filePath: uploadedFile.path,
      userId: req.user.id,
      options: {
        validateFormulas: true,
        preserveFormatting: true,
        scanForVirus: true
      }
    });

    logger.info('File uploaded successfully:', {
      fileId,
      filename: uploadedFile.filename,
      size: uploadedFile.size,
      userId: req.user.id,
      jobId: job.id
    });

    return res.status(200).json({
      success: true,
      data: {
        fileId,
        jobId: job.id.toString(),
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        message: 'File uploaded successfully and queued for processing'
      }
    });

  } catch (error) {
    logger.error('Upload error:', error);

    // Clean up file if it was created
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        logger.error('Failed to clean up file:', unlinkError);
      }
    }

    // Handle specific errors
    if (error.message.includes('File size exceeds')) {
      return res.status(413).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
}

// Export with middleware
export default withMiddleware(
  withRateLimit(handler, 'upload'),
  { auth: true, cors: true }
);

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '200mb'
  }
};