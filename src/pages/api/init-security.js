/**
 * @fileoverview Initialize security tables and configurations
 * @module api/init-security
 */

import { initializeAuditTables } from '../../utils/audit.js';
import { initializeExcelMetadataTable } from './excel-metadata.js';
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

export default async function handler(req, res) {
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In production, protect this endpoint
  const authToken = req.headers.authorization;
  const expectedToken = process.env.INIT_SECURITY_TOKEN;
  
  if (process.env.NODE_ENV === 'production' && authToken !== `Bearer ${expectedToken}`) {
    logger.warn('Unauthorized security initialization attempt:', {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logger.info('Initializing security tables...');
    
    // Initialize audit tables
    await initializeAuditTables();
    logger.info('Audit tables initialized');
    
    // Initialize Excel metadata tables
    await initializeExcelMetadataTable();
    logger.info('Excel metadata tables initialized');
    
    // Return success with initialization details
    return res.status(200).json({
      success: true,
      message: 'Security tables initialized successfully',
      initialized: {
        auditTables: [
          'security_audit_logs',
          'user_activity_logs',
          'file_access_logs',
          'security_incidents'
        ],
        excelTables: [
          'excel_file_metadata',
          'excel_file_permissions'
        ]
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error initializing security tables:', error);
    
    return res.status(500).json({
      error: 'Failed to initialize security tables',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}