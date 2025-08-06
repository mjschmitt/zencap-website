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

    // Check environment and deployment info
    health.services.environment = {
      status: 'healthy',
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development',
      vercelUrl: process.env.VERCEL_URL || 'local',
      vercelRegion: process.env.VERCEL_REGION || 'local',
      deploymentId: process.env.VERCEL_GIT_COMMIT_SHA ? 
        process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7) : 'local'
    };

    // Check critical services
    const criticalEnvVars = [
      'POSTGRES_URL',
      'SENDGRID_API_KEY',
      'NEXT_PUBLIC_GA_ID'
    ];
    
    const missingEnvVars = criticalEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      health.services.environment.status = 'warning';
      health.services.environment.missingVars = missingEnvVars;
      if (health.status === 'healthy') {
        health.status = 'warning';
      }
    }

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