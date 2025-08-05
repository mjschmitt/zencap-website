import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Backup Manager for Excel uploads
 * Creates a backup before replacing an existing file
 */
export class BackupManager {
  constructor(options = {}) {
    this.backupDir = options.backupDir || './public/uploads/excel/.backups';
    this.maxBackupsPerFile = options.maxBackupsPerFile || 3;
    this.maxBackupAge = options.maxBackupAge || 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  /**
   * Initialize backup directory
   */
  async init() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      // Create .gitignore to exclude backups from git
      const gitignorePath = path.join(this.backupDir, '.gitignore');
      await fs.writeFile(gitignorePath, '*\n!.gitignore\n', 'utf8').catch(() => {});
      return true;
    } catch (error) {
      console.error('[BackupManager] Failed to initialize backup directory:', error);
      return false;
    }
  }

  /**
   * Create a backup of an existing file before it's replaced
   */
  async createBackup(originalFilePath, metadata = {}) {
    try {
      // Check if original file exists
      await fs.access(originalFilePath);
      
      const fileName = path.basename(originalFilePath);
      const timestamp = Date.now();
      const backupName = `${timestamp}_backup_${fileName}`;
      const backupPath = path.join(this.backupDir, backupName);
      
      // Copy file to backup directory
      await fs.copyFile(originalFilePath, backupPath);
      
      // Create metadata file
      const metadataPath = `${backupPath}.json`;
      await fs.writeFile(metadataPath, JSON.stringify({
        originalPath: originalFilePath,
        backupPath,
        timestamp,
        date: new Date(timestamp).toISOString(),
        ...metadata
      }, null, 2));
      
      console.log('[BackupManager] Created backup:', backupName);
      
      // Clean old backups for this file
      await this.cleanOldBackups(fileName);
      
      return {
        success: true,
        backupPath,
        backupName
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Original file doesn't exist, no backup needed
        return {
          success: true,
          skipped: true,
          reason: 'Original file does not exist'
        };
      }
      console.error('[BackupManager] Backup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean old backups for a specific file
   */
  async cleanOldBackups(baseFileName) {
    try {
      const files = await fs.readdir(this.backupDir);
      const now = Date.now();
      
      // Find all backups for this file
      const backups = [];
      for (const file of files) {
        if (file.includes(`backup_${baseFileName}`) && !file.endsWith('.json')) {
          const stats = await fs.stat(path.join(this.backupDir, file));
          backups.push({
            name: file,
            path: path.join(this.backupDir, file),
            modified: stats.mtime.getTime(),
            age: now - stats.mtime.getTime()
          });
        }
      }
      
      // Sort by date (newest first)
      backups.sort((a, b) => b.modified - a.modified);
      
      // Delete old backups
      const toDelete = [];
      for (let i = 0; i < backups.length; i++) {
        const backup = backups[i];
        if (i >= this.maxBackupsPerFile || backup.age > this.maxBackupAge) {
          toDelete.push(backup);
        }
      }
      
      for (const backup of toDelete) {
        await fs.unlink(backup.path).catch(console.error);
        // Also delete metadata file
        await fs.unlink(`${backup.path}.json`).catch(() => {});
        console.log('[BackupManager] Deleted old backup:', backup.name);
      }
      
      return toDelete.length;
    } catch (error) {
      console.error('[BackupManager] Failed to clean old backups:', error);
      return 0;
    }
  }

  /**
   * Restore a backup
   */
  async restoreBackup(backupName, targetPath = null) {
    try {
      const backupPath = path.join(this.backupDir, backupName);
      const metadataPath = `${backupPath}.json`;
      
      // Read metadata
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      const restorePath = targetPath || metadata.originalPath;
      
      // Copy backup to target
      await fs.copyFile(backupPath, restorePath);
      
      console.log('[BackupManager] Restored backup:', {
        backup: backupName,
        to: restorePath
      });
      
      return {
        success: true,
        restoredTo: restorePath,
        metadata
      };
    } catch (error) {
      console.error('[BackupManager] Restore failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all backups
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];
      
      for (const file of files) {
        if (!file.endsWith('.json') && !file.startsWith('.')) {
          const metadataPath = path.join(this.backupDir, `${file}.json`);
          try {
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            const stats = await fs.stat(path.join(this.backupDir, file));
            backups.push({
              name: file,
              size: stats.size,
              created: metadata.date,
              originalPath: metadata.originalPath,
              ...metadata
            });
          } catch (e) {
            // Skip if metadata is missing
          }
        }
      }
      
      // Sort by date (newest first)
      backups.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      return backups;
    } catch (error) {
      console.error('[BackupManager] Failed to list backups:', error);
      return [];
    }
  }
}

// Singleton instance
let backupManager;

export function getBackupManager(options) {
  if (!backupManager) {
    backupManager = new BackupManager(options);
    backupManager.init();
  }
  return backupManager;
}