#!/usr/bin/env node

/**
 * ZenCap Database Backup Script
 * Automated backup system with encryption and cloud storage
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { sql } from '@vercel/postgres';

const BACKUP_CONFIG = {
  localBackupDir: process.env.BACKUP_LOCAL_DIR || './backups',
  retention: {
    daily: 30,   // Keep 30 days of daily backups
    weekly: 12,  // Keep 12 weeks of weekly backups
    monthly: 12  // Keep 12 months of monthly backups
  },
  encryption: {
    enabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
    key: process.env.BACKUP_ENCRYPTION_KEY
  },
  storage: {
    s3Bucket: process.env.BACKUP_S3_BUCKET,
    region: process.env.AWS_REGION || 'us-east-1'
  }
};

/**
 * Create database backup
 */
async function createDatabaseBackup(type = 'daily') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `zencap_${type}_${timestamp}`;
  
  console.log(`🔄 Starting ${type} backup: ${backupName}`);
  
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_CONFIG.localBackupDir)) {
      fs.mkdirSync(BACKUP_CONFIG.localBackupDir, { recursive: true });
    }
    
    const backupPath = path.join(BACKUP_CONFIG.localBackupDir, `${backupName}.sql`);
    
    // Create database dump
    console.log('📊 Creating database dump...');
    await createDatabaseDump(backupPath);
    
    // Encrypt backup if enabled
    let finalBackupPath = backupPath;
    if (BACKUP_CONFIG.encryption.enabled) {
      console.log('🔒 Encrypting backup...');
      finalBackupPath = await encryptBackup(backupPath);
      fs.unlinkSync(backupPath); // Remove unencrypted file
    }
    
    // Upload to cloud storage
    if (BACKUP_CONFIG.storage.s3Bucket) {
      console.log('☁️  Uploading to S3...');
      await uploadToS3(finalBackupPath, type);
    }
    
    // Log backup creation
    await logBackupOperation({
      type,
      backupName,
      filePath: finalBackupPath,
      status: 'success',
      size: fs.statSync(finalBackupPath).size
    });
    
    console.log(`✅ Backup completed: ${backupName}`);
    
    return {
      success: true,
      backupName,
      filePath: finalBackupPath,
      size: fs.statSync(finalBackupPath).size
    };
    
  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    
    await logBackupOperation({
      type,
      backupName,
      status: 'failed',
      error: error.message
    });
    
    throw error;
  }
}

/**
 * Create PostgreSQL database dump
 */
async function createDatabaseDump(backupPath) {
  const dbUrl = new URL(process.env.POSTGRES_URL);
  
  const pgDumpCommand = [
    'pg_dump',
    `--host=${dbUrl.hostname}`,
    `--port=${dbUrl.port || 5432}`,
    `--username=${dbUrl.username}`,
    `--dbname=${dbUrl.pathname.slice(1)}`,
    '--no-password',
    '--format=custom',
    '--compress=9',
    '--verbose',
    '--exclude-table-data=performance_metrics',  // Exclude large monitoring data
    '--exclude-table-data=user_analytics',
    '--exclude-table-data=error_logs',
    `--file=${backupPath}`
  ].join(' ');
  
  // Set password via environment variable
  const env = { ...process.env, PGPASSWORD: dbUrl.password };
  
  try {
    execSync(pgDumpCommand, { 
      env,
      stdio: 'inherit',
      timeout: 600000 // 10 minute timeout
    });
  } catch (error) {
    throw new Error(`pg_dump failed: ${error.message}`);
  }
}

/**
 * Encrypt backup file
 */
async function encryptBackup(backupPath) {
  const encryptedPath = `${backupPath}.gpg`;
  
  const encryptCommand = [
    'gpg',
    '--symmetric',
    '--cipher-algo AES256',
    '--compress-algo 1',
    '--s2k-mode 3',
    '--s2k-digest-algo SHA512',
    '--s2k-count 65011712',
    `--passphrase ${BACKUP_CONFIG.encryption.key}`,
    '--batch',
    '--yes',
    '--output', encryptedPath,
    backupPath
  ].join(' ');
  
  try {
    execSync(encryptCommand, { stdio: 'inherit' });
    return encryptedPath;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Upload backup to S3
 */
async function uploadToS3(filePath, type) {
  const fileName = path.basename(filePath);
  const s3Key = `${type}/${fileName}`;
  
  const awsCommand = [
    'aws s3 cp',
    `"${filePath}"`,
    `s3://${BACKUP_CONFIG.storage.s3Bucket}/${s3Key}`,
    '--storage-class STANDARD_IA',  // Cost-effective storage class
    `--region ${BACKUP_CONFIG.storage.region}`
  ].join(' ');
  
  try {
    execSync(awsCommand, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Verify backup integrity
 */
async function verifyBackup(backupPath) {
  console.log(`🔍 Verifying backup: ${path.basename(backupPath)}`);
  
  try {
    // Create temporary database for restore test
    const testDbName = `zencap_restore_test_${Date.now()}`;
    const dbUrl = new URL(process.env.POSTGRES_URL);
    
    // Create test database
    const createDbCommand = [
      'createdb',
      `--host=${dbUrl.hostname}`,
      `--port=${dbUrl.port || 5432}`,
      `--username=${dbUrl.username}`,
      '--no-password',
      testDbName
    ].join(' ');
    
    execSync(createDbCommand, { 
      env: { ...process.env, PGPASSWORD: dbUrl.password },
      stdio: 'inherit' 
    });
    
    // Test restore
    const restoreCommand = [
      'pg_restore',
      `--host=${dbUrl.hostname}`,
      `--port=${dbUrl.port || 5432}`,
      `--username=${dbUrl.username}`,
      `--dbname=${testDbName}`,
      '--no-password',
      '--verbose',
      backupPath
    ].join(' ');
    
    execSync(restoreCommand, { 
      env: { ...process.env, PGPASSWORD: dbUrl.password },
      stdio: 'inherit' 
    });
    
    // Verify table counts
    const originalCounts = await getTableCounts(dbUrl.pathname.slice(1));
    const restoredCounts = await getTableCounts(testDbName);
    
    const verificationResults = compareTableCounts(originalCounts, restoredCounts);
    
    // Cleanup test database
    const dropDbCommand = [
      'dropdb',
      `--host=${dbUrl.hostname}`,
      `--port=${dbUrl.port || 5432}`,
      `--username=${dbUrl.username}`,
      '--no-password',
      testDbName
    ].join(' ');
    
    execSync(dropDbCommand, { 
      env: { ...process.env, PGPASSWORD: dbUrl.password },
      stdio: 'inherit' 
    });
    
    if (verificationResults.passed) {
      console.log('✅ Backup verification passed');
      return { success: true, results: verificationResults };
    } else {
      console.error('❌ Backup verification failed');
      return { success: false, results: verificationResults };
    }
    
  } catch (error) {
    console.error(`❌ Backup verification error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Get table row counts for verification
 */
async function getTableCounts(database) {
  const tables = [
    'leads', 'newsletter_subscribers', 'insights', 'models', 
    'customers', 'orders', 'users', 'accounts', 'sessions'
  ];
  
  const counts = {};
  
  for (const table of tables) {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
      counts[table] = parseInt(result.rows[0].count);
    } catch (error) {
      counts[table] = 0; // Table might not exist
    }
  }
  
  return counts;
}

/**
 * Compare table counts between original and restored databases
 */
function compareTableCounts(original, restored) {
  const results = {
    passed: true,
    details: {},
    summary: {
      matched: 0,
      mismatched: 0,
      total: 0
    }
  };
  
  for (const [table, originalCount] of Object.entries(original)) {
    const restoredCount = restored[table] || 0;
    const matched = originalCount === restoredCount;
    
    results.details[table] = {
      original: originalCount,
      restored: restoredCount,
      matched
    };
    
    if (matched) {
      results.summary.matched++;
    } else {
      results.summary.mismatched++;
      results.passed = false;
    }
    
    results.summary.total++;
  }
  
  return results;
}

/**
 * Cleanup old backups based on retention policy
 */
async function cleanupOldBackups() {
  console.log('🧹 Cleaning up old backups...');
  
  const now = new Date();
  const retentionPeriods = {
    daily: now.getTime() - (BACKUP_CONFIG.retention.daily * 24 * 60 * 60 * 1000),
    weekly: now.getTime() - (BACKUP_CONFIG.retention.weekly * 7 * 24 * 60 * 60 * 1000),
    monthly: now.getTime() - (BACKUP_CONFIG.retention.monthly * 30 * 24 * 60 * 60 * 1000)
  };
  
  let deletedCount = 0;
  
  for (const [type, retentionTime] of Object.entries(retentionPeriods)) {
    try {
      // List S3 objects
      const listCommand = `aws s3 ls s3://${BACKUP_CONFIG.storage.s3Bucket}/${type}/`;
      const output = execSync(listCommand, { encoding: 'utf-8' });
      
      const files = output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.trim().split(/\s+/);
          const date = parts[0] + ' ' + parts[1];
          const fileName = parts[3];
          return { date: new Date(date), fileName };
        })
        .filter(file => file.date.getTime() < retentionTime);
      
      // Delete old files
      for (const file of files) {
        const deleteCommand = `aws s3 rm s3://${BACKUP_CONFIG.storage.s3Bucket}/${type}/${file.fileName}`;
        execSync(deleteCommand, { stdio: 'inherit' });
        deletedCount++;
      }
      
    } catch (error) {
      console.error(`Failed to cleanup ${type} backups:`, error.message);
    }
  }
  
  console.log(`✅ Cleaned up ${deletedCount} old backups`);
  return { deletedCount };
}

/**
 * Log backup operation to database
 */
async function logBackupOperation(operation) {
  try {
    await sql`
      INSERT INTO security_audit_logs (
        event_id, event_type, action_type, action, result, 
        severity, metadata, timestamp
      ) VALUES (
        ${generateUUID()}, 'backup_operation', 'backup', ${operation.type},
        ${operation.status}, 'info', ${JSON.stringify(operation)}, NOW()
      )
    `;
  } catch (error) {
    console.error('Failed to log backup operation:', error);
  }
}

/**
 * Generate UUID for tracking
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];
  const type = process.argv[3] || 'daily';
  
  try {
    switch (command) {
      case 'create':
        await createDatabaseBackup(type);
        break;
        
      case 'verify':
        const backupPath = process.argv[3];
        if (!backupPath) {
          console.error('❌ Please specify backup file path');
          process.exit(1);
        }
        await verifyBackup(backupPath);
        break;
        
      case 'cleanup':
        await cleanupOldBackups();
        break;
        
      case 'full':
        // Full backup with verification and cleanup
        const backup = await createDatabaseBackup(type);
        if (backup.success) {
          await verifyBackup(backup.filePath);
          await cleanupOldBackups();
        }
        break;
        
      default:
        console.log('Usage: node backup.js [create|verify|cleanup|full] [type|path]');
        console.log('');
        console.log('Commands:');
        console.log('  create [daily|weekly|monthly] - Create new backup');
        console.log('  verify <backup-path>          - Verify backup integrity');
        console.log('  cleanup                       - Remove old backups');
        console.log('  full [type]                   - Create, verify, and cleanup');
        process.exit(1);
    }
    
    console.log('✅ Backup operation completed successfully');
    
  } catch (error) {
    console.error('❌ Backup operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}