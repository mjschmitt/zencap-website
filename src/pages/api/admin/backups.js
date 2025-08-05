import { getBackupManager } from '../../../utils/backupManager.js';
import { cleanupOldUploads } from '../../../utils/fileCleanup.js';
import path from 'path';

export default async function handler(req, res) {
  // Simple auth check - in production, use proper authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const backupManager = getBackupManager();
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'excel');

  switch (req.method) {
    case 'GET':
      // List all backups
      try {
        const backups = await backupManager.listBackups();
        return res.status(200).json({
          success: true,
          backups,
          count: backups.length
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

    case 'POST':
      // Perform cleanup or restore backup
      const { action } = req.body;

      if (action === 'cleanup') {
        // Run cleanup with backup preservation
        try {
          const result = await cleanupOldUploads({
            directory: uploadsDir,
            maxAge: req.body.maxAge || 7 * 24 * 60 * 60 * 1000,
            maxFiles: req.body.maxFiles || 30,
            keepBackups: true,
            dryRun: req.body.dryRun || false
          });
          
          return res.status(200).json({
            success: true,
            result
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            error: error.message
          });
        }
      } else if (action === 'restore') {
        // Restore a specific backup
        const { backupName, targetPath } = req.body;
        
        if (!backupName) {
          return res.status(400).json({
            success: false,
            error: 'Backup name is required'
          });
        }
        
        try {
          const result = await backupManager.restoreBackup(backupName, targetPath);
          return res.status(200).json(result);
        } catch (error) {
          return res.status(500).json({
            success: false,
            error: error.message
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use "cleanup" or "restore"'
        });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}