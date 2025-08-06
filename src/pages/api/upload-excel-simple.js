import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'excel');

// Ensure upload directory exists
(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
})();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      filter: function ({ name, originalFilename, mimetype }) {
        const ext = path.extname(originalFilename || '').toLowerCase();
        const validExtensions = ['.xlsx', '.xlsm', '.xls'];
        const validMimeTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel.sheet.macroEnabled.12',
          'application/vnd.ms-excel'
        ];
        
        return validExtensions.includes(ext) || validMimeTypes.includes(mimetype);
      }
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = files.file[0];
    const originalFilename = uploadedFile.originalFilename;
    const fileExtension = path.extname(originalFilename).toLowerCase();
    
    // Extract base name for grouping similar files
    const baseName = originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/__+/g, '_');
    
    // Check for existing files with the same base name to maintain backup
    const existingFiles = await fs.readdir(uploadDir);
    const relatedFiles = existingFiles.filter(f => f.endsWith(baseName));
    
    // Sort by timestamp to identify the most recent files
    relatedFiles.sort((a, b) => {
      const timeA = parseInt(a.split('_')[0]) || 0;
      const timeB = parseInt(b.split('_')[0]) || 0;
      return timeB - timeA; // Newest first
    });
    
    // After upload, we want to keep only:
    // 1. The new upload (newest)
    // 2. The current active file as backup (2nd newest)
    // Delete anything older than the 2nd newest
    if (relatedFiles.length >= 1) {
      // Keep only the most recent existing file as backup
      // Delete all others (anything beyond the first existing file)
      const filesToDelete = relatedFiles.slice(1);
      for (const fileToDelete of filesToDelete) {
        try {
          await fs.unlink(path.join(uploadDir, fileToDelete));
          console.log(`Deleted old version: ${fileToDelete}`);
        } catch (err) {
          console.error(`Failed to delete old version ${fileToDelete}:`, err);
        }
      }
      if (relatedFiles.length > 0) {
        console.log(`Keeping as backup: ${relatedFiles[0]}`);
      }
    }
    
    // Generate unique filename for new upload
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const newFilename = `${timestamp}_${randomString}_${baseName}`;
    const newFilepath = path.join(uploadDir, newFilename);
    
    // Move file to final location
    await fs.rename(uploadedFile.filepath, newFilepath);
    
    // Log the backup strategy result
    console.log(`Upload completed for: ${originalFilename}`);
    console.log(`- New file: ${newFilename}`);
    if (relatedFiles.length > 0) {
      console.log(`- Backup kept: ${relatedFiles[0]}`);
      if (relatedFiles.length > 1) {
        console.log(`- Deleted ${relatedFiles.length - 1} old version(s)`);
      }
    } else {
      console.log(`- No previous versions found (first upload)`);
    }
    
    // Return file info
    const fileInfo = {
      originalName: originalFilename,
      filename: newFilename,
      size: uploadedFile.size,
      path: `/uploads/excel/${newFilename}`,
      uploadedAt: new Date().toISOString(),
      backupAvailable: relatedFiles.length > 0,
      backupFile: relatedFiles.length > 0 ? relatedFiles[0] : null
    };

    return res.status(200).json({
      success: true,
      message: 'Excel file uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    return res.status(500).json({ 
      error: 'File upload failed. Please try again.',
      details: error.message
    });
  }
}