/**
 * @fileoverview Excel processing job status API endpoint
 * @module api/excel/process/[jobId]
 */

import { getJobStatus, cancelJob } from '../../../../utils/queue.js';
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
 * Handle job status requests
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 */
async function handler(req, res) {
  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      error: 'Job ID is required'
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGetStatus(req, res, jobId);
    case 'DELETE':
      return handleCancelJob(req, res, jobId);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
}

/**
 * Get job status
 * GET /api/excel/process/[jobId]
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @param {string} jobId - Job ID
 */
async function handleGetStatus(req, res, jobId) {
  try {
    const status = await getJobStatus(jobId);

    if (status.status === 'not_found') {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user owns this job
    if (status.data?.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Format response based on job state
    const response = {
      success: true,
      data: {
        jobId: status.id,
        status: status.status,
        progress: status.progress || 0,
        fileId: status.data?.fileId,
        createdAt: status.createdAt,
        startedAt: status.processedAt,
        completedAt: status.completedAt,
        attempts: status.attempts
      }
    };

    // Add error information if failed
    if (status.status === 'failed') {
      response.data.error = status.failedReason;
    }

    // Add result summary if completed
    if (status.status === 'completed' && status.data?.result) {
      response.data.result = status.data.result;
    }

    // Set cache headers for active jobs
    if (['active', 'waiting', 'delayed'].includes(status.status)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      // Cache completed/failed jobs for 5 minutes
      res.setHeader('Cache-Control', 'public, max-age=300');
    }

    return res.status(200).json(response);

  } catch (error) {
    logger.error('Get job status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get job status'
    });
  }
}

/**
 * Cancel job
 * DELETE /api/excel/process/[jobId]
 * @param {import('next').NextApiRequest} req - Request object
 * @param {import('next').NextApiResponse} res - Response object
 * @param {string} jobId - Job ID
 */
async function handleCancelJob(req, res, jobId) {
  try {
    // Get job status first to check ownership
    const status = await getJobStatus(jobId);

    if (status.status === 'not_found') {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user owns this job
    if (status.data?.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if job can be cancelled
    if (['completed', 'failed'].includes(status.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel job in ${status.status} state`
      });
    }

    // Cancel the job
    const cancelled = await cancelJob(jobId);

    if (!cancelled) {
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel job'
      });
    }

    logger.info('Job cancelled:', {
      jobId,
      userId: req.user.id,
      fileId: status.data?.fileId
    });

    return res.status(200).json({
      success: true,
      message: 'Job cancelled successfully'
    });

  } catch (error) {
    logger.error('Cancel job error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel job'
    });
  }
}

// Export with middleware
export default withMiddleware(handler, {
  auth: true,
  cors: true
});