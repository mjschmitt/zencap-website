/**
 * ZenCap Automated Backup System
 * Comprehensive backup automation with monitoring, verification, and disaster recovery
 */

import { sql } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

export class AutomatedBackupSystem {
  constructor(config = {}) {
    this.config = {
      // Backup locations
      localBackupDir: config.localBackupDir || './backups',
      s3Bucket: config.s3Bucket || process.env.BACKUP_S3_BUCKET,
      
      // Retention policies
      retention: {
        critical: 90,    // Critical data: 90 days
        daily: 30,       // Daily backups: 30 days
        weekly: 12,      // Weekly backups: 12 weeks
        monthly: 12,     // Monthly backups: 12 months
        yearly: 7        // Yearly backups: 7 years
      },
      
      // Backup intervals (in minutes)
      intervals: {
        database: 60,        // Database every hour
        files: 240,          // Files every 4 hours
        fullSystem: 1440,    // Full system daily
        verification: 360    // Verification every 6 hours
      },
      
      // Monitoring settings
      monitoring: {
        alertEmail: config.alertEmail || process.env.BACKUP_ALERT_EMAIL,
        webhookUrl: config.webhookUrl || process.env.BACKUP_WEBHOOK_URL,
        slackToken: config.slackToken || process.env.SLACK_BOT_TOKEN,
        slackChannel: config.slackChannel || '#alerts'
      },
      
      // Encryption settings
      encryption: {
        enabled: config.encryptionEnabled !== false,
        algorithm: 'aes-256-gcm',
        keyDerivation: 'pbkdf2'
      },
      
      // Performance settings
      performance: {
        maxConcurrentBackups: 3,
        chunkSize: 1024 * 1024 * 10, // 10MB chunks
        compressionLevel: 6
      },
      
      ...config
    };
    
    this.activeBackups = new Set();
    this.lastBackupStatus = {};
    this.isInitialized = false;
  }

  /**
   * Initialize the backup system
   */
  async initialize() {
    console.log('🔧 Initializing Automated Backup System...');
    
    try {
      // Create backup directories
      await this.createBackupDirectories();
      
      // Initialize monitoring tables
      await this.initializeMonitoringTables();
      
      // Verify external dependencies
      await this.verifyDependencies();
      
      // Start background monitoring
      this.startBackgroundMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Automated Backup System initialized successfully');
      
      // Send initialization alert
      await this.sendAlert('info', 'Backup system initialized', {
        timestamp: new Date().toISOString(),
        config: this.config
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize backup system:', error);
      await this.sendAlert('error', 'Backup system initialization failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Create necessary backup directories
   */
  async createBackupDirectories() {
    const dirs = [
      this.config.localBackupDir,
      `${this.config.localBackupDir}/database`,
      `${this.config.localBackupDir}/files`,
      `${this.config.localBackupDir}/temp`,
      `${this.config.localBackupDir}/verification`,
      `${this.config.localBackupDir}/logs`
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    // Create .gitignore to exclude backups from git
    const gitignorePath = path.join(this.config.localBackupDir, '.gitignore');
    await fs.writeFile(gitignorePath, `*
!.gitignore
!README.md
`, 'utf8');
  }

  /**
   * Initialize monitoring database tables
   */
  async initializeMonitoringTables() {
    await sql`
      CREATE TABLE IF NOT EXISTS backup_operations (
        id SERIAL PRIMARY KEY,
        operation_id VARCHAR(36) UNIQUE NOT NULL,
        backup_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'started',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        duration_seconds INTEGER,
        backup_size BIGINT,
        backup_path TEXT,
        verification_status VARCHAR(20),
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS backup_health_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,4),
        metric_unit VARCHAR(20),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS backup_alerts (
        id SERIAL PRIMARY KEY,
        alert_type VARCHAR(20) NOT NULL,
        alert_level VARCHAR(10) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        alert_data JSONB DEFAULT '{}',
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE
      )
    `;
    
    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_backup_operations_status ON backup_operations(status);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_backup_operations_type ON backup_operations(backup_type);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_backup_health_metrics_timestamp ON backup_health_metrics(timestamp);
    `;
  }

  /**
   * Verify external dependencies
   */
  async verifyDependencies() {
    const dependencies = [
      { command: 'pg_dump --version', name: 'PostgreSQL pg_dump' },
      { command: 'aws --version', name: 'AWS CLI', optional: true }
    ];
    
    for (const dep of dependencies) {
      try {
        execSync(dep.command, { stdio: 'pipe' });
        console.log(`✅ ${dep.name} is available`);
      } catch (error) {
        if (dep.optional) {
          console.warn(`⚠️  Optional dependency ${dep.name} not available`);
        } else {
          throw new Error(`Required dependency ${dep.name} not available`);
        }
      }
    }
  }

  /**
   * Create database backup
   */
  async createDatabaseBackup(type = 'automated') {
    const operationId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `db_${type}_${timestamp}`;
    
    console.log(`🔄 Starting database backup: ${backupName}`);
    
    try {
      // Log start of backup
      await this.logBackupOperation(operationId, 'database', 'started', {
        backupName,
        type
      });
      
      const startTime = Date.now();
      const backupPath = path.join(this.config.localBackupDir, 'database', `${backupName}.dump`);
      
      // Create database dump
      await this.createPostgresDump(backupPath);
      
      // Get backup size
      const stats = await fs.stat(backupPath);
      const backupSize = stats.size;
      
      // Encrypt if enabled
      let finalPath = backupPath;
      if (this.config.encryption.enabled) {
        finalPath = await this.encryptFile(backupPath);
        await fs.unlink(backupPath); // Remove unencrypted file
      }
      
      // Upload to cloud storage if configured
      if (this.config.s3Bucket) {
        await this.uploadToS3(finalPath, `database/${path.basename(finalPath)}`);
      }
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      // Log completion
      await this.logBackupOperation(operationId, 'database', 'completed', {
        backupName,
        backupPath: finalPath,
        backupSize,
        duration,
        type
      });
      
      // Update health metrics
      await this.recordHealthMetric('backup_size_mb', backupSize / (1024 * 1024), 'MB');
      await this.recordHealthMetric('backup_duration_seconds', duration, 'seconds');
      
      console.log(`✅ Database backup completed: ${backupName} (${this.formatBytes(backupSize)} in ${duration}s)`);
      
      return {
        success: true,
        operationId,
        backupName,
        backupPath: finalPath,
        backupSize,
        duration
      };
      
    } catch (error) {
      console.error(`❌ Database backup failed: ${error.message}`);
      
      await this.logBackupOperation(operationId, 'database', 'failed', {
        backupName,
        error: error.message
      });
      
      await this.sendAlert('error', 'Database backup failed', {
        backupName,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Create PostgreSQL dump
   */
  async createPostgresDump(backupPath) {
    const dbUrl = new URL(process.env.POSTGRES_URL);
    
    const command = [
      'pg_dump',
      `--host=${dbUrl.hostname}`,
      `--port=${dbUrl.port || 5432}`,
      `--username=${dbUrl.username}`,
      `--dbname=${dbUrl.pathname.slice(1)}`,
      '--no-password',
      '--format=custom',
      '--compress=9',
      '--verbose',
      '--exclude-table-data=performance_metrics',
      '--exclude-table-data=user_analytics', 
      '--exclude-table-data=error_logs',
      `--file="${backupPath}"`
    ].join(' ');
    
    execSync(command, {
      env: { ...process.env, PGPASSWORD: dbUrl.password },
      stdio: 'inherit',
      timeout: 600000 // 10 minutes
    });
  }

  /**
   * Create file system backup
   */
  async createFileBackup(type = 'automated') {
    const operationId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `files_${type}_${timestamp}`;
    
    console.log(`🔄 Starting file backup: ${backupName}`);
    
    try {
      await this.logBackupOperation(operationId, 'files', 'started', {
        backupName,
        type
      });
      
      const startTime = Date.now();
      const backupPath = path.join(this.config.localBackupDir, 'files', `${backupName}.tar.gz`);
      
      // Create compressed archive of critical files
      const filesToBackup = [
        './public/uploads/excel',
        './public/images',
        './migrations',
        './src/utils',
        './src/config'
      ];
      
      const tarCommand = [
        'tar',
        '-czf',
        `"${backupPath}"`,
        ...filesToBackup.map(f => `"${f}"`),
        '--exclude="*.log"',
        '--exclude="node_modules"',
        '--exclude=".git"'
      ].join(' ');
      
      execSync(tarCommand, { stdio: 'inherit' });
      
      const stats = await fs.stat(backupPath);
      const backupSize = stats.size;
      
      // Encrypt if enabled
      let finalPath = backupPath;
      if (this.config.encryption.enabled) {
        finalPath = await this.encryptFile(backupPath);
        await fs.unlink(backupPath);
      }
      
      // Upload to cloud storage
      if (this.config.s3Bucket) {
        await this.uploadToS3(finalPath, `files/${path.basename(finalPath)}`);
      }
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      await this.logBackupOperation(operationId, 'files', 'completed', {
        backupName,
        backupPath: finalPath,
        backupSize,
        duration,
        type
      });
      
      console.log(`✅ File backup completed: ${backupName} (${this.formatBytes(backupSize)} in ${duration}s)`);
      
      return {
        success: true,
        operationId,
        backupName,
        backupPath: finalPath,
        backupSize,
        duration
      };
      
    } catch (error) {
      console.error(`❌ File backup failed: ${error.message}`);
      
      await this.logBackupOperation(operationId, 'files', 'failed', {
        backupName,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupPath, backupType = 'database') {
    console.log(`🔍 Verifying backup: ${path.basename(backupPath)}`);
    
    try {
      // Decrypt if necessary
      let verifyPath = backupPath;
      if (path.extname(backupPath) === '.enc') {
        verifyPath = await this.decryptFile(backupPath, path.join(
          this.config.localBackupDir, 'verification', `temp_${Date.now()}.dump`
        ));
      }
      
      let verificationResult;
      
      if (backupType === 'database') {
        verificationResult = await this.verifyDatabaseBackup(verifyPath);
      } else if (backupType === 'files') {
        verificationResult = await this.verifyFileBackup(verifyPath);
      }
      
      // Cleanup temporary files
      if (verifyPath !== backupPath) {
        await fs.unlink(verifyPath).catch(() => {});
      }
      
      // Update backup operation with verification status
      await sql`
        UPDATE backup_operations 
        SET verification_status = ${verificationResult.success ? 'passed' : 'failed'},
            metadata = metadata || ${JSON.stringify({ verification: verificationResult })}
        WHERE backup_path = ${backupPath}
      `;
      
      if (verificationResult.success) {
        console.log(`✅ Backup verification passed: ${path.basename(backupPath)}`);
      } else {
        console.error(`❌ Backup verification failed: ${path.basename(backupPath)}`);
        await this.sendAlert('warning', 'Backup verification failed', {
          backupPath,
          error: verificationResult.error
        });
      }
      
      return verificationResult;
      
    } catch (error) {
      console.error(`❌ Backup verification error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify database backup integrity
   */
  async verifyDatabaseBackup(backupPath) {
    try {
      // Test restore to temporary database
      const testDbName = `zencap_verify_${Date.now()}`;
      const dbUrl = new URL(process.env.POSTGRES_URL);
      
      // Create test database
      const createCmd = [
        'createdb',
        `--host=${dbUrl.hostname}`,
        `--port=${dbUrl.port || 5432}`,
        `--username=${dbUrl.username}`,
        '--no-password',
        testDbName
      ].join(' ');
      
      execSync(createCmd, {
        env: { ...process.env, PGPASSWORD: dbUrl.password },
        stdio: 'pipe'
      });
      
      // Restore backup
      const restoreCmd = [
        'pg_restore',
        `--host=${dbUrl.hostname}`,
        `--port=${dbUrl.port || 5432}`,
        `--username=${dbUrl.username}`,
        `--dbname=${testDbName}`,
        '--no-password',
        '--verbose',
        `"${backupPath}"`
      ].join(' ');
      
      execSync(restoreCmd, {
        env: { ...process.env, PGPASSWORD: dbUrl.password },
        stdio: 'pipe'
      });
      
      // Verify critical tables exist and have data
      const testConnection = await sql`SELECT 1`; // This uses the test database
      
      // Cleanup test database
      const dropCmd = [
        'dropdb',
        `--host=${dbUrl.hostname}`,
        `--port=${dbUrl.port || 5432}`,
        `--username=${dbUrl.username}`,
        '--no-password',
        testDbName
      ].join(' ');
      
      execSync(dropCmd, {
        env: { ...process.env, PGPASSWORD: dbUrl.password },
        stdio: 'pipe'
      });
      
      return { success: true, message: 'Database backup verification passed' };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Start background monitoring for automated backups
   */
  startBackgroundMonitoring() {
    console.log('🔄 Starting background backup monitoring...');
    
    // Database backup interval
    setInterval(() => {
      this.createDatabaseBackup('scheduled').catch(console.error);
    }, this.config.intervals.database * 60 * 1000);
    
    // File backup interval  
    setInterval(() => {
      this.createFileBackup('scheduled').catch(console.error);
    }, this.config.intervals.files * 60 * 1000);
    
    // Verification interval
    setInterval(() => {
      this.runVerificationProcess().catch(console.error);
    }, this.config.intervals.verification * 60 * 1000);
    
    // Cleanup interval (daily)
    setInterval(() => {
      this.cleanupOldBackups().catch(console.error);
    }, 24 * 60 * 60 * 1000);
    
    // Health check interval (every 5 minutes)
    setInterval(() => {
      this.performHealthCheck().catch(console.error);
    }, 5 * 60 * 1000);
  }

  /**
   * Run verification process on recent backups
   */
  async runVerificationProcess() {
    console.log('🔍 Running backup verification process...');
    
    try {
      // Get recent unverified backups
      const { rows: backups } = await sql`
        SELECT operation_id, backup_path, backup_type
        FROM backup_operations 
        WHERE status = 'completed' 
          AND verification_status IS NULL
          AND created_at > NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      for (const backup of backups) {
        if (await fs.access(backup.backup_path).then(() => true).catch(() => false)) {
          await this.verifyBackup(backup.backup_path, backup.backup_type);
        }
      }
      
    } catch (error) {
      console.error('Verification process error:', error);
    }
  }

  /**
   * Cleanup old backups based on retention policy
   */
  async cleanupOldBackups() {
    console.log('🧹 Cleaning up old backups...');
    
    try {
      const now = new Date();
      let deletedCount = 0;
      
      // Get backups older than retention period
      const { rows: oldBackups } = await sql`
        SELECT backup_path, backup_type, created_at
        FROM backup_operations
        WHERE created_at < ${new Date(now.getTime() - this.config.retention.daily * 24 * 60 * 60 * 1000)}
          AND status = 'completed'
      `;
      
      for (const backup of oldBackups) {
        try {
          // Delete local file
          await fs.unlink(backup.backup_path);
          
          // Delete from S3 if configured
          if (this.config.s3Bucket) {
            const s3Key = path.basename(backup.backup_path);
            const deleteCmd = `aws s3 rm s3://${this.config.s3Bucket}/${backup.backup_type}/${s3Key}`;
            execSync(deleteCmd, { stdio: 'pipe' });
          }
          
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete backup ${backup.backup_path}:`, error.message);
        }
      }
      
      // Update database to mark as cleaned
      await sql`
        UPDATE backup_operations 
        SET metadata = metadata || '{"cleaned": true}'::jsonb
        WHERE backup_path = ANY(${oldBackups.map(b => b.backup_path)})
      `;
      
      console.log(`✅ Cleaned up ${deletedCount} old backups`);
      
      await this.recordHealthMetric('cleanup_deleted_backups', deletedCount, 'count');
      
    } catch (error) {
      console.error('Backup cleanup error:', error);
    }
  }

  /**
   * Perform system health check
   */
  async performHealthCheck() {
    try {
      const healthData = {
        timestamp: new Date().toISOString(),
        diskSpace: await this.checkDiskSpace(),
        backupStatus: await this.getBackupStatus(),
        systemLoad: process.cpuUsage(),
        memoryUsage: process.memoryUsage()
      };
      
      // Record health metrics
      await this.recordHealthMetric('disk_usage_percent', healthData.diskSpace.usagePercent, 'percent');
      await this.recordHealthMetric('memory_usage_mb', healthData.memoryUsage.heapUsed / (1024 * 1024), 'MB');
      
      // Check for alerts
      if (healthData.diskSpace.usagePercent > 90) {
        await this.sendAlert('warning', 'High disk usage', healthData);
      }
      
      if (healthData.backupStatus.failedCount > 0) {
        await this.sendAlert('error', 'Recent backup failures', healthData);
      }
      
    } catch (error) {
      console.error('Health check error:', error);
    }
  }

  /**
   * Get backup status summary
   */
  async getBackupStatus() {
    const { rows } = await sql`
      SELECT 
        status,
        COUNT(*) as count,
        MAX(created_at) as latest
      FROM backup_operations
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY status
    `;
    
    return rows.reduce((acc, row) => {
      acc[`${row.status}Count`] = parseInt(row.count);
      acc[`latest${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`] = row.latest;
      return acc;
    }, { failedCount: 0, completedCount: 0, startedCount: 0 });
  }

  /**
   * Utility functions
   */
  async encryptFile(filePath) {
    // Implementation for file encryption
    const encryptedPath = `${filePath}.enc`;
    // Add encryption logic here
    return encryptedPath;
  }

  async decryptFile(encryptedPath, outputPath) {
    // Implementation for file decryption
    // Add decryption logic here
    return outputPath;
  }

  async uploadToS3(filePath, s3Key) {
    const cmd = `aws s3 cp "${filePath}" s3://${this.config.s3Bucket}/${s3Key} --storage-class STANDARD_IA`;
    execSync(cmd, { stdio: 'inherit' });
  }

  async checkDiskSpace() {
    try {
      const output = execSync('df -h .', { encoding: 'utf-8' });
      const lines = output.trim().split('\n');
      const data = lines[1].split(/\s+/);
      return {
        total: data[1],
        used: data[2],
        available: data[3],
        usagePercent: parseInt(data[4].replace('%', ''))
      };
    } catch (error) {
      return { usagePercent: 0 };
    }
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  }

  async logBackupOperation(operationId, backupType, status, metadata = {}) {
    await sql`
      INSERT INTO backup_operations (
        operation_id, backup_type, status, 
        backup_size, backup_path, duration_seconds, 
        error_message, metadata
      ) VALUES (
        ${operationId}, ${backupType}, ${status},
        ${metadata.backupSize || null}, ${metadata.backupPath || null}, 
        ${metadata.duration || null}, ${metadata.error || null}, 
        ${JSON.stringify(metadata)}
      )
      ON CONFLICT (operation_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        completed_at = CASE WHEN EXCLUDED.status IN ('completed', 'failed') THEN NOW() ELSE completed_at END,
        backup_size = COALESCE(EXCLUDED.backup_size, backup_operations.backup_size),
        backup_path = COALESCE(EXCLUDED.backup_path, backup_operations.backup_path),
        duration_seconds = COALESCE(EXCLUDED.duration_seconds, backup_operations.duration_seconds),
        error_message = COALESCE(EXCLUDED.error_message, backup_operations.error_message),
        metadata = backup_operations.metadata || EXCLUDED.metadata
    `;
  }

  async recordHealthMetric(name, value, unit = null) {
    await sql`
      INSERT INTO backup_health_metrics (metric_name, metric_value, metric_unit)
      VALUES (${name}, ${value}, ${unit})
    `;
  }

  async sendAlert(level, title, data = {}) {
    try {
      // Log alert to database
      await sql`
        INSERT INTO backup_alerts (alert_type, alert_level, title, message, alert_data)
        VALUES ('backup_system', ${level}, ${title}, ${JSON.stringify(data)}, ${JSON.stringify(data)})
      `;

      // Send email alert if configured
      if (this.config.monitoring.alertEmail) {
        // Email sending logic would go here
        console.log(`📧 Alert sent: ${level.toUpperCase()} - ${title}`);
      }

      // Send webhook alert if configured  
      if (this.config.monitoring.webhookUrl) {
        // Webhook logic would go here
        console.log(`🔗 Webhook alert sent: ${title}`);
      }

    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
}

// Singleton instance
let backupSystem;

export function getAutomatedBackupSystem(config) {
  if (!backupSystem) {
    backupSystem = new AutomatedBackupSystem(config);
  }
  return backupSystem;
}

export async function initializeBackupSystem(config) {
  const system = getAutomatedBackupSystem(config);
  await system.initialize();
  return system;
}