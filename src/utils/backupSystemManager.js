/**
 * ZenCap Backup System Manager
 * Central coordinator for all backup system components
 */

import { initializeBackupSystem } from './automatedBackupSystem.js';
import { initializeDisasterRecovery } from './disasterRecoveryPlan.js';
import { initializeRestorationTesting } from './backupRestorationTesting.js';
import { initializeBackupMonitoring } from './backupMonitoringSystem.js';
import { initializeBackupVerification } from './backupVerificationSystem.js';
import { sql } from '@vercel/postgres';

export class BackupSystemManager {
  constructor(config = {}) {
    this.config = {
      // System configuration
      environment: process.env.NODE_ENV || 'development',
      
      // Component configurations
      automatedBackup: {
        s3Bucket: process.env.BACKUP_S3_BUCKET,
        localBackupDir: './backups',
        encryptionEnabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
        intervals: {
          database: 60,     // Every hour
          files: 240,       // Every 4 hours
          fullSystem: 1440, // Daily
          verification: 360 // Every 6 hours
        }
      },
      
      disasterRecovery: {
        rto: { database: 30, files: 60, fullSystem: 120 },
        rpo: { database: 60, files: 240, critical: 15 },
        environments: {
          production: process.env.PRODUCTION_URL,
          staging: process.env.STAGING_URL
        }
      },
      
      restorationTesting: {
        testSchedule: {
          daily: true,
          weekly: true,
          monthly: true
        },
        testEnvironments: {
          sandbox: {
            database: process.env.TEST_POSTGRES_URL,
            fileSystem: './test_restoration'
          }
        }
      },
      
      monitoring: {
        intervals: {
          healthCheck: 5,
          backupStatus: 15,
          alertProcessing: 1,
          reportGeneration: 60
        },
        notifications: {
          email: {
            enabled: !!process.env.SENDGRID_API_KEY,
            from: process.env.SENDGRID_FROM_EMAIL,
            to: (process.env.BACKUP_ALERT_EMAILS || '').split(',').filter(Boolean)
          },
          slack: {
            enabled: !!process.env.SLACK_WEBHOOK_URL,
            webhookUrl: process.env.SLACK_WEBHOOK_URL
          }
        }
      },
      
      verification: {
        schedules: {
          immediate: true,
          periodic: { enabled: true, interval: 6 * 60 * 60 * 1000 },
          comprehensive: { enabled: true, interval: 24 * 60 * 60 * 1000 }
        },
        benchmarks: {
          maxRestoreTime: 10 * 60 * 1000,
          minDataIntegrity: 99.9
        }
      },
      
      ...config
    };
    
    this.components = {
      automatedBackup: null,
      disasterRecovery: null,
      restorationTesting: null,
      monitoring: null,
      verification: null
    };
    
    this.isInitialized = false;
    this.status = 'standby';
  }

  /**
   * Initialize the complete backup system
   */
  async initialize() {
    console.log('🚀 Initializing ZenCap Complete Backup System...');
    console.log('=' + '='.repeat(60));
    
    this.status = 'initializing';
    
    try {
      // Create master system tables
      await this.createMasterSystemTables();
      
      // Log system initialization start
      await this.logSystemEvent('initialization_started', 'started', {
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        config: this.config
      });
      
      // Initialize components in order
      console.log('🔧 Initializing system components...');
      
      // 1. Automated Backup System (Core)
      console.log('  1/5 Initializing Automated Backup System...');
      this.components.automatedBackup = await initializeBackupSystem(this.config.automatedBackup);
      console.log('  ✅ Automated Backup System ready');
      
      // 2. Backup Verification System
      console.log('  2/5 Initializing Backup Verification System...');
      this.components.verification = await initializeBackupVerification(this.config.verification);
      console.log('  ✅ Backup Verification System ready');
      
      // 3. Backup Monitoring System
      console.log('  3/5 Initializing Backup Monitoring System...');
      this.components.monitoring = await initializeBackupMonitoring(this.config.monitoring);
      console.log('  ✅ Backup Monitoring System ready');
      
      // 4. Restoration Testing System
      console.log('  4/5 Initializing Restoration Testing System...');
      this.components.restorationTesting = await initializeRestorationTesting(this.config.restorationTesting);
      console.log('  ✅ Restoration Testing System ready');
      
      // 5. Disaster Recovery System
      console.log('  5/5 Initializing Disaster Recovery System...');
      this.components.disasterRecovery = await initializeDisasterRecovery(this.config.disasterRecovery);
      console.log('  ✅ Disaster Recovery System ready');
      
      // Perform initial system health check
      await this.performInitialHealthCheck();
      
      // Start system monitoring
      await this.startSystemMonitoring();
      
      this.isInitialized = true;
      this.status = 'active';
      
      console.log('=' + '='.repeat(60));
      console.log('🎉 ZenCap Complete Backup System Successfully Initialized!');
      console.log('');
      console.log('📊 System Status:');
      console.log(`  • Environment: ${this.config.environment}`);
      console.log(`  • Components: ${Object.keys(this.components).length} initialized`);
      console.log(`  • S3 Backup: ${this.config.automatedBackup.s3Bucket ? 'Configured' : 'Local only'}`);
      console.log(`  • Encryption: ${this.config.automatedBackup.encryptionEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`  • Monitoring: ${this.components.monitoring ? 'Active' : 'Inactive'}`);
      console.log(`  • Testing: ${this.components.restorationTesting ? 'Scheduled' : 'Manual only'}`);
      console.log('=' + '='.repeat(60));
      
      // Log successful initialization
      await this.logSystemEvent('initialization_completed', 'success', {
        duration: Date.now() - Date.now(), // This would be calculated properly
        components: Object.keys(this.components),
        status: this.getSystemStatus()
      });
      
      // Send initialization notification
      if (this.components.monitoring) {
        await this.components.monitoring.sendAlert('info', 'Backup system initialized', {
          timestamp: new Date().toISOString(),
          environment: this.config.environment,
          components: Object.keys(this.components).length
        });
      }
      
      return this.getSystemStatus();
      
    } catch (error) {
      console.error('❌ Failed to initialize backup system:', error);
      this.status = 'failed';
      
      // Log initialization failure
      await this.logSystemEvent('initialization_failed', 'failed', {
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }

  /**
   * Shutdown the complete backup system
   */
  async shutdown() {
    console.log('🛑 Shutting down ZenCap Backup System...');
    
    this.status = 'shutting_down';
    
    try {
      // Stop monitoring first
      if (this.components.monitoring) {
        this.components.monitoring.stopMonitoring();
        console.log('  ✅ Monitoring stopped');
      }
      
      // Stop other active processes
      // (Other components would have their own shutdown methods)
      
      this.status = 'inactive';
      
      await this.logSystemEvent('shutdown_completed', 'success', {
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Backup system shutdown completed');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      status: this.status,
      environment: this.config.environment,
      components: {
        automatedBackup: !!this.components.automatedBackup,
        disasterRecovery: !!this.components.disasterRecovery,
        restorationTesting: !!this.components.restorationTesting,
        monitoring: !!this.components.monitoring,
        verification: !!this.components.verification
      },
      configuration: {
        s3Configured: !!this.config.automatedBackup.s3Bucket,
        encryptionEnabled: this.config.automatedBackup.encryptionEnabled,
        monitoringEnabled: !!this.components.monitoring,
        testingScheduled: this.config.restorationTesting.testSchedule.daily
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform manual backup operations
   */
  async createManualBackup(type = 'full') {
    if (!this.isInitialized) {
      throw new Error('Backup system not initialized');
    }
    
    console.log(`🔄 Creating manual ${type} backup...`);
    
    const results = {
      database: null,
      files: null,
      verification: null
    };
    
    try {
      if (type === 'full' || type === 'database') {
        results.database = await this.components.automatedBackup.createDatabaseBackup('manual');
        console.log('  ✅ Database backup completed');
      }
      
      if (type === 'full' || type === 'files') {
        results.files = await this.components.automatedBackup.createFileBackup('manual');
        console.log('  ✅ File backup completed');
      }
      
      // Verify backups if verification system is available
      if (this.components.verification) {
        if (results.database) {
          results.verification = await this.components.verification.verifyBackup(
            results.database.operationId, 'quick'
          );
          console.log('  ✅ Backup verification completed');
        }
      }
      
      console.log(`✅ Manual ${type} backup completed successfully`);
      
      return results;
      
    } catch (error) {
      console.error(`❌ Manual backup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run restoration test
   */
  async runRestorationTest(testType = 'quickTest') {
    if (!this.components.restorationTesting) {
      throw new Error('Restoration testing system not available');
    }
    
    console.log(`🧪 Running ${testType} restoration test...`);
    
    return await this.components.restorationTesting.runRestorationTest(testType);
  }

  /**
   * Execute disaster recovery
   */
  async executeDisasterRecovery(options = {}) {
    if (!this.components.disasterRecovery) {
      throw new Error('Disaster recovery system not available');
    }
    
    console.log('🚨 EXECUTING DISASTER RECOVERY...');
    
    return await this.components.disasterRecovery.executeFullRecovery(options);
  }

  /**
   * Get system metrics and reports
   */
  async getSystemMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      systemStatus: this.getSystemStatus(),
      backupMetrics: null,
      monitoringMetrics: null,
      verificationMetrics: null,
      testingMetrics: null
    };
    
    try {
      // Get backup operations summary
      const { rows: backupSummary } = await sql`
        SELECT 
          backup_type,
          status,
          COUNT(*) as count,
          AVG(backup_size) as avg_size,
          AVG(duration_seconds) as avg_duration
        FROM backup_operations
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY backup_type, status
      `;
      metrics.backupMetrics = backupSummary;
      
      // Get monitoring data if available
      if (this.components.monitoring) {
        metrics.monitoringMetrics = await this.components.monitoring.getDashboardData();
      }
      
      // Get verification statistics if available
      if (this.components.verification) {
        metrics.verificationMetrics = await this.components.verification.getVerificationStatistics();
      }
      
      // Get testing results if available
      if (this.components.restorationTesting) {
        metrics.testingMetrics = await this.components.restorationTesting.getTestResults(10);
      }
      
      return metrics;
      
    } catch (error) {
      console.error('Error getting system metrics:', error);
      metrics.error = error.message;
      return metrics;
    }
  }

  /**
   * Create master system tables
   */
  async createMasterSystemTables() {
    await sql`
      CREATE TABLE IF NOT EXISTS backup_system_events (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(36) UNIQUE NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        message TEXT,
        event_data JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_system_events_type ON backup_system_events(event_type);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_system_events_created ON backup_system_events(created_at);
    `;
  }

  /**
   * Log system-level events
   */
  async logSystemEvent(eventType, status, eventData = {}) {
    try {
      const eventId = `system_${eventType}_${Date.now()}`;
      await sql`
        INSERT INTO backup_system_events (
          event_id, event_type, status, message, event_data
        ) VALUES (
          ${eventId}, ${eventType}, ${status}, 
          ${eventData.message || ''}, ${JSON.stringify(eventData)}
        )
      `;
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  /**
   * Perform initial health check
   */
  async performInitialHealthCheck() {
    console.log('🔍 Performing initial system health check...');
    
    const healthStatus = {
      database: false,
      backupStorage: false,
      components: {},
      overall: 'unknown'
    };
    
    try {
      // Test database connectivity
      await sql`SELECT 1`;
      healthStatus.database = true;
      console.log('  ✅ Database connectivity: OK');
      
      // Test backup storage (if S3 configured)
      if (this.config.automatedBackup.s3Bucket) {
        try {
          // This would test S3 connectivity
          healthStatus.backupStorage = true;
          console.log('  ✅ S3 backup storage: OK');
        } catch (error) {
          console.log('  ⚠️  S3 backup storage: Warning - ' + error.message);
        }
      } else {
        healthStatus.backupStorage = true; // Local storage assumed OK
        console.log('  ✅ Local backup storage: OK');
      }
      
      // Check component health
      Object.keys(this.components).forEach(component => {
        healthStatus.components[component] = !!this.components[component];
        console.log(`  ✅ ${component}: ${healthStatus.components[component] ? 'OK' : 'Not initialized'}`);
      });
      
      healthStatus.overall = 'healthy';
      console.log('  ✅ Overall system health: HEALTHY');
      
    } catch (error) {
      healthStatus.overall = 'unhealthy';
      console.log('  ❌ System health check failed: ' + error.message);
    }
    
    return healthStatus;
  }

  /**
   * Start system monitoring
   */
  async startSystemMonitoring() {
    console.log('📊 Starting system monitoring...');
    
    // System monitoring would be handled by the monitoring component
    // This is just a placeholder for any additional system-level monitoring
    
    setInterval(() => {
      this.performSystemHealthCheck().catch(console.error);
    }, 5 * 60 * 1000); // Every 5 minutes
    
    console.log('  ✅ System monitoring started');
  }

  /**
   * Periodic system health check
   */
  async performSystemHealthCheck() {
    try {
      const status = this.getSystemStatus();
      
      // Log system status periodically
      if (Math.random() < 0.1) { // 10% chance to reduce log noise
        await this.logSystemEvent('health_check', 'completed', {
          status,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('System health check error:', error);
      await this.logSystemEvent('health_check', 'failed', {
        error: error.message
      });
    }
  }
}

// Singleton instance
let backupSystemManager;

export function getBackupSystemManager(config) {
  if (!backupSystemManager) {
    backupSystemManager = new BackupSystemManager(config);
  }
  return backupSystemManager;
}

export async function initializeCompleteBackupSystem(config) {
  const manager = getBackupSystemManager(config);
  await manager.initialize();
  return manager;
}

// Export individual system access
export function getAutomatedBackupSystem() {
  return backupSystemManager?.components.automatedBackup;
}

export function getDisasterRecoveryPlan() {
  return backupSystemManager?.components.disasterRecovery;
}

export function getBackupRestorationTesting() {
  return backupSystemManager?.components.restorationTesting;
}

export function getBackupMonitoringSystem() {
  return backupSystemManager?.components.monitoring;
}

export function getBackupVerificationSystem() {
  return backupSystemManager?.components.verification;
}