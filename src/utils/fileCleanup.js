import fs from 'fs/promises';
import path from 'path';

/**
 * Clean up old uploaded Excel files
 * Keeps only the most recent files and removes duplicates
 * Maintains one backup version per unique file
 */
export async function cleanupOldUploads(options = {}) {
  const {
    directory = './public/uploads/excel',
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    maxFiles = 20, // Keep maximum 20 most recent files
    keepBackups = true, // Keep one previous version of each unique file
    dryRun = false // If true, only log what would be deleted
  } = options;

  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    
    // Get file stats for all files
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime.getTime(),
          age: now - stats.mtime.getTime()
        };
      })
    );

    // Sort by modification time (newest first)
    fileStats.sort((a, b) => b.modified - a.modified);

    const filesToDelete = [];
    const keptFiles = [];
    const filesByBaseName = new Map(); // Track files by base name for backup logic
    const duplicatesByContent = new Map(); // Track exact duplicates by size

    // First pass: Group files by base name
    for (const file of fileStats) {
      // Extract base filename without timestamp and hash
      const match = file.name.match(/^\d+_([a-f0-9]+_)?(.+)$/);
      const baseFileName = match ? match[2] : file.name;
      
      if (!filesByBaseName.has(baseFileName)) {
        filesByBaseName.set(baseFileName, []);
      }
      filesByBaseName.get(baseFileName).push(file);
    }

    // Second pass: Determine what to keep and delete
    let totalKeptCount = 0;
    
    for (const [baseName, versions] of filesByBaseName.entries()) {
      // Sort versions by date (newest first)
      versions.sort((a, b) => b.modified - a.modified);
      
      // Determine how many versions to keep
      let versionsToKeep = 1; // Always keep at least the most recent
      if (keepBackups && versions.length > 1) {
        versionsToKeep = 2; // Keep current + one backup
      }
      
      // Track unique file sizes to detect true duplicates
      const seenSizes = new Set();
      let keptForThisFile = 0;
      
      for (let i = 0; i < versions.length; i++) {
        const file = versions[i];
        let shouldDelete = false;
        let reason = '';
        
        // Check various deletion criteria
        if (totalKeptCount >= maxFiles && i > 0) {
          // Global file limit exceeded (but always keep at least one version)
          shouldDelete = true;
          reason = `Exceeds max file limit (${maxFiles})`;
        } else if (file.age > maxAge && i >= versionsToKeep) {
          // File is too old and we have enough backups
          shouldDelete = true;
          reason = `File is older than ${maxAge / (24 * 60 * 60 * 1000)} days`;
        } else if (keptForThisFile >= versionsToKeep) {
          // We've kept enough versions of this file
          shouldDelete = true;
          reason = `Exceeds backup limit (keeping ${versionsToKeep} version${versionsToKeep > 1 ? 's' : ''})`;
        } else if (seenSizes.has(file.size) && i > 0) {
          // This is an exact duplicate (same size) of a newer version
          shouldDelete = true;
          reason = `Exact duplicate of newer version`;
        }
        
        if (shouldDelete) {
          filesToDelete.push({ ...file, reason, baseName });
        } else {
          keptFiles.push({ ...file, baseName, versionIndex: keptForThisFile });
          seenSizes.add(file.size);
          keptForThisFile++;
          totalKeptCount++;
        }
      }
    }

    // Log cleanup plan
    const uniqueFiles = filesByBaseName.size;
    const backupsKept = keptFiles.filter(f => f.versionIndex === 1).length;
    
    console.log('[FileCleanup] Cleanup summary:', {
      totalFiles: fileStats.length,
      uniqueFiles,
      filesToDelete: filesToDelete.length,
      filesToKeep: keptFiles.length,
      backupsKept,
      totalSize: fileStats.reduce((sum, f) => sum + f.size, 0),
      sizeToDelete: filesToDelete.reduce((sum, f) => sum + f.size, 0),
      keepBackups,
      dryRun
    });

    if (filesToDelete.length > 0) {
      console.log('[FileCleanup] Files to delete:', 
        filesToDelete.map(f => ({
          name: f.name,
          age: Math.round(f.age / (60 * 60 * 1000)) + ' hours',
          reason: f.reason
        }))
      );
    }

    // Delete files if not in dry run mode
    if (!dryRun && filesToDelete.length > 0) {
      const deleteResults = await Promise.allSettled(
        filesToDelete.map(file => fs.unlink(file.path))
      );
      
      const successCount = deleteResults.filter(r => r.status === 'fulfilled').length;
      const failureCount = deleteResults.filter(r => r.status === 'rejected').length;
      
      console.log(`[FileCleanup] Deleted ${successCount} files, ${failureCount} failures`);
      
      if (failureCount > 0) {
        console.error('[FileCleanup] Failed deletions:', 
          deleteResults
            .map((r, i) => r.status === 'rejected' ? filesToDelete[i].name : null)
            .filter(Boolean)
        );
      }
    }

    return {
      success: true,
      totalFiles: fileStats.length,
      deleted: dryRun ? 0 : filesToDelete.length,
      kept: keptFiles.length,
      freedSpace: filesToDelete.reduce((sum, f) => sum + f.size, 0)
    };
  } catch (error) {
    console.error('[FileCleanup] Error during cleanup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Schedule periodic cleanup (for production use with cron jobs or similar)
 */
export function scheduleCleanup(intervalHours = 24) {
  // Initial cleanup
  cleanupOldUploads();
  
  // Schedule recurring cleanup
  setInterval(() => {
    cleanupOldUploads();
  }, intervalHours * 60 * 60 * 1000);
}