/**
 * @fileoverview Job queue setup using Bull for asynchronous processing
 * @module utils/queue
 */

import Bull from 'bull';
import winston from 'winston';
import { processExcelFile } from './excel-processor.js';
import { setCache, CacheKeys, TTL, publish } from './redis.js';
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

// Redis connection options
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
};

/**
 * @typedef {Object} ExcelJobData
 * @property {string} fileId - Unique file identifier
 * @property {string} filePath - Path to uploaded file
 * @property {number} userId - User who uploaded the file
 * @property {Object} options - Processing options
 */

/**
 * Excel processing queue
 */
export const excelQueue = new Bull('excel-processing', redisConfig);

/**
 * Email notification queue
 */
export const emailQueue = new Bull('email-notifications', redisConfig);

/**
 * Configure queue event handlers
 * @param {Bull.Queue} queue - Bull queue instance
 * @param {string} queueName - Queue name for logging
 */
function configureQueueEvents(queue, queueName) {
  queue.on('completed', (job, result) => {
    logger.info(`${queueName} job completed:`, { 
      jobId: job.id, 
      data: job.data 
    });
  });

  queue.on('failed', (job, err) => {
    logger.error(`${queueName} job failed:`, { 
      jobId: job.id, 
      data: job.data, 
      error: err.message 
    });
  });

  queue.on('stalled', (job) => {
    logger.warn(`${queueName} job stalled:`, { 
      jobId: job.id, 
      data: job.data 
    });
  });

  queue.on('error', (error) => {
    logger.error(`${queueName} queue error:`, error);
  });

  queue.on('waiting', (jobId) => {
    logger.info(`${queueName} job waiting:`, { jobId });
  });

  queue.on('active', (job) => {
    logger.info(`${queueName} job active:`, { 
      jobId: job.id, 
      data: job.data 
    });
  });
}

// Configure event handlers for all queues
configureQueueEvents(excelQueue, 'Excel');
configureQueueEvents(emailQueue, 'Email');

/**
 * Excel processing job handler
 */
excelQueue.process(3, async (job) => {
  const { fileId, filePath, userId, options } = job.data;
  const startTime = Date.now();

  try {
    // Update job progress
    await job.progress(10);
    
    // Update database status
    await sql`
      UPDATE excel_jobs 
      SET status = 'processing', started_at = NOW() 
      WHERE id = ${job.id.toString()}
    `;

    // Process the Excel file
    const result = await processExcelFile(filePath, {
      ...options,
      onProgress: async (progress) => {
        await job.progress(10 + (progress * 0.8)); // 10-90% for processing
        
        // Publish progress via WebSocket
        await publish(`excel:progress:${fileId}`, {
          jobId: job.id,
          progress: 10 + (progress * 0.8),
          status: 'processing'
        });
      }
    });

    // Cache the processed data
    await setCache(
      `${CacheKeys.EXCEL_DATA}${fileId}`,
      result,
      TTL.EXCEL_DATA
    );

    // Update job progress
    await job.progress(95);

    // Update database
    await sql`
      UPDATE excel_jobs 
      SET status = 'completed', 
          completed_at = NOW(),
          processing_time = ${Date.now() - startTime},
          result_summary = ${JSON.stringify(result.summary)}
      WHERE id = ${job.id.toString()}
    `;

    await sql`
      UPDATE excel_files 
      SET processed = true, 
          processed_at = NOW(),
          sheet_count = ${result.sheetCount},
          row_count = ${result.totalRows}
      WHERE id = ${fileId}
    `;

    // Publish completion via WebSocket
    await publish(`excel:progress:${fileId}`, {
      jobId: job.id,
      progress: 100,
      status: 'completed',
      result: result.summary
    });

    await job.progress(100);

    // Queue email notification
    await emailQueue.add('processing-complete', {
      userId,
      fileId,
      fileName: result.fileName,
      processingTime: Date.now() - startTime
    });

    return {
      fileId,
      success: true,
      summary: result.summary,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    logger.error('Excel processing error:', error);

    // Update database
    await sql`
      UPDATE excel_jobs 
      SET status = 'failed', 
          error_message = ${error.message},
          completed_at = NOW()
      WHERE id = ${job.id.toString()}
    `;

    // Publish error via WebSocket
    await publish(`excel:progress:${fileId}`, {
      jobId: job.id,
      progress: job.progress(),
      status: 'failed',
      error: error.message
    });

    // Queue error notification
    await emailQueue.add('processing-failed', {
      userId,
      fileId,
      error: error.message
    });

    throw error;
  }
});

/**
 * Email notification job handler
 */
emailQueue.process(10, async (job) => {
  const { type, data } = job;

  try {
    switch (type) {
      case 'processing-complete':
        // Send completion email
        logger.info('Sending completion email:', data);
        // TODO: Integrate with SendGrid
        break;

      case 'processing-failed':
        // Send failure email
        logger.info('Sending failure email:', data);
        // TODO: Integrate with SendGrid
        break;

      default:
        logger.warn('Unknown email job type:', type);
    }
  } catch (error) {
    logger.error('Email job error:', error);
    throw error;
  }
});

/**
 * Add Excel processing job to queue
 * @param {ExcelJobData} jobData - Job data
 * @param {Object} [options] - Bull job options
 * @returns {Promise<Bull.Job>} Created job
 */
export async function queueExcelProcessing(jobData, options = {}) {
  const job = await excelQueue.add(jobData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: false,
    removeOnFail: false,
    ...options
  });

  // Store job ID in database
  await sql`
    INSERT INTO excel_jobs (id, file_id, user_id, status, created_at) 
    VALUES (${job.id.toString()}, ${jobData.fileId}, ${jobData.userId}, 'queued', NOW())
  `;

  return job;
}

/**
 * Get job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Bull.Job|null>} Job instance or null
 */
export async function getJob(jobId) {
  return await excelQueue.getJob(jobId);
}

/**
 * Get job status and progress
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job status information
 */
export async function getJobStatus(jobId) {
  const job = await getJob(jobId);
  
  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress();

  return {
    id: job.id,
    status: state,
    progress,
    data: job.data,
    createdAt: new Date(job.timestamp),
    processedAt: job.processedOn ? new Date(job.processedOn) : null,
    completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
    failedReason: job.failedReason,
    attempts: job.attemptsMade
  };
}

/**
 * Cancel job
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>} True if cancelled
 */
export async function cancelJob(jobId) {
  const job = await getJob(jobId);
  
  if (!job) {
    return false;
  }

  await job.remove();
  
  // Update database
  await sql`
    UPDATE excel_jobs 
    SET status = 'cancelled', completed_at = NOW() 
    WHERE id = ${jobId}
  `;

  return true;
}

/**
 * Get queue statistics
 * @returns {Promise<Object>} Queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
    excelQueue.getWaitingCount(),
    excelQueue.getActiveCount(),
    excelQueue.getCompletedCount(),
    excelQueue.getFailedCount(),
    excelQueue.getDelayedCount(),
    excelQueue.getPausedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused,
    total: waiting + active + completed + failed + delayed + paused
  };
}

/**
 * Clean old jobs
 * @param {number} [grace=86400000] - Grace period in milliseconds (default: 24 hours)
 * @returns {Promise<number[]>} Removed job IDs
 */
export async function cleanOldJobs(grace = 86400000) {
  const removedJobs = [];
  
  // Clean completed jobs
  const completed = await excelQueue.clean(grace, 'completed');
  removedJobs.push(...completed);
  
  // Clean failed jobs
  const failed = await excelQueue.clean(grace, 'failed');
  removedJobs.push(...failed);

  // Update database
  if (removedJobs.length > 0) {
    await sql`
      DELETE FROM excel_jobs 
      WHERE id = ANY(${removedJobs.map(id => id.toString())}::text[]) AND status IN ('completed', 'failed')
    `;
  }

  return removedJobs;
}

/**
 * Pause queue processing
 * @returns {Promise<void>}
 */
export async function pauseQueue() {
  await excelQueue.pause();
}

/**
 * Resume queue processing
 * @returns {Promise<void>}
 */
export async function resumeQueue() {
  await excelQueue.resume();
}

/**
 * Close queue connections
 * @returns {Promise<void>}
 */
export async function closeQueues() {
  await excelQueue.close();
  await emailQueue.close();
}