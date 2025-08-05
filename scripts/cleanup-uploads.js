#!/usr/bin/env node

/**
 * Manual cleanup script for uploaded Excel files
 * Run with: node scripts/cleanup-uploads.js
 * Or dry run: node scripts/cleanup-uploads.js --dry-run
 */

import { cleanupOldUploads } from '../src/utils/fileCleanup.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');
const forceAll = process.argv.includes('--force-all');

async function runCleanup() {
  console.log('========================================');
  console.log('Excel Upload Cleanup Utility');
  console.log('========================================');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Force all: ${forceAll}`);
  console.log('');

  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'excel');
  
  const options = {
    directory: uploadsDir,
    maxAge: forceAll ? 0 : 7 * 24 * 60 * 60 * 1000, // 7 days or immediate if force-all
    maxFiles: forceAll ? 0 : 20, // Keep 20 files or none if force-all
    dryRun: isDryRun
  };

  console.log('Cleanup options:', {
    directory: options.directory,
    maxAge: `${options.maxAge / (24 * 60 * 60 * 1000)} days`,
    maxFiles: options.maxFiles,
    dryRun: options.dryRun
  });
  console.log('');

  try {
    const result = await cleanupOldUploads(options);
    
    console.log('');
    console.log('========================================');
    console.log('Cleanup Complete');
    console.log('========================================');
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Files deleted: ${result.deleted}`);
    console.log(`Files kept: ${result.kept}`);
    console.log(`Space freed: ${(result.freedSpace / (1024 * 1024)).toFixed(2)} MB`);
    
    if (!result.success && result.error) {
      console.error('Error:', result.error);
    }

    if (isDryRun && result.deleted === 0) {
      console.log('\nNo files would be deleted with current settings.');
      console.log('Use --force-all to delete all files in dry run mode.');
    }

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
runCleanup();