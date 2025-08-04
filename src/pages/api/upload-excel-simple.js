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
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitizedOriginalName = originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/__+/g, '_');
    const newFilename = `${timestamp}_${randomString}_${sanitizedOriginalName}`;
    const newFilepath = path.join(uploadDir, newFilename);
    
    // Move file to final location
    await fs.rename(uploadedFile.filepath, newFilepath);
    
    // Return file info
    const fileInfo = {
      originalName: originalFilename,
      filename: newFilename,
      size: uploadedFile.size,
      path: `/uploads/excel/${newFilename}`,
      uploadedAt: new Date().toISOString()
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