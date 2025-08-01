/**
 * @fileoverview Health check endpoint for monitoring
 * @module api/health
 */

import { getDbConnection } from '../../utils/database';
import * as fs from 'fs/promises';
import path from 'path';

/**
 * Health check endpoint
 */
export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  };

  try {
    // Check database connection
    try {
      const db = await getDbConnection();
      await db.query('SELECT 1');
      await db.end();
      health.services.database = { status: 'healthy' };
    } catch (dbError) {
      health.services.database = { 
        status: 'unhealthy', 
        error: dbError.message 
      };
      health.status = 'degraded';
    }

    // Check file system access
    try {
      const tempDir = path.join(process.cwd(), '.temp');
      await fs.access(tempDir);
      health.services.filesystem = { status: 'healthy' };
    } catch (fsError) {
      health.services.filesystem = { 
        status: 'unhealthy', 
        error: 'Cannot access temp directory' 
      };
      health.status = 'degraded';
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 1024 * 1024 * 1024; // 1GB
    
    if (memoryUsage.heapUsed > memoryThreshold) {
      health.services.memory = {
        status: 'warning',
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
      };
      if (health.status === 'healthy') {
        health.status = 'warning';
      }
    } else {
      health.services.memory = {
        status: 'healthy',
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
      };
    }

    // Check environment
    health.services.environment = {
      status: 'healthy',
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development'
    };

    // Return appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503;

    return res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}