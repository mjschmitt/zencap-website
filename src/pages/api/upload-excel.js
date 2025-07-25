import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'excel');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      filter: function ({ name, originalFilename, mimetype }) {
        // Only allow Excel files (including macro-enabled)
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
          'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm (macro-enabled)
          'application/octet-stream' // Sometimes Excel files come through as this
        ];
        
        const allowedExtensions = ['.xlsx', '.xls', '.xlsm'];
        const fileExtension = path.extname(originalFilename || '').toLowerCase();
        
        return allowedTypes.includes(mimetype) || allowedExtensions.includes(fileExtension);
      }
    });

    const [fields, files] = await form.parse(req);
    
    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = files.file[0];
    const originalFilename = uploadedFile.originalFilename;
    const fileExtension = path.extname(originalFilename).toLowerCase();

    // Validate file extension
    if (!['.xlsx', '.xls', '.xlsm'].includes(fileExtension)) {
      // Clean up uploaded file
      fs.unlinkSync(uploadedFile.filepath);
      return res.status(400).json({ error: 'Invalid file type. Please upload an Excel file (.xlsx, .xls, or .xlsm)' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = originalFilename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_');
    const newFilename = `${timestamp}_${sanitizedName}`;
    const newFilepath = path.join(uploadDir, newFilename);

    // Move file to final location
    fs.renameSync(uploadedFile.filepath, newFilepath);

    // Validate the Excel file by trying to read it
    try {
      const workbook = XLSX.readFile(newFilepath);
      
      // Get basic file info
      const sheetNames = workbook.SheetNames;
      const firstSheet = workbook.Sheets[sheetNames[0]];
      const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1:A1');
      
      const fileInfo = {
        filename: newFilename,
        originalName: originalFilename,
        url: `/uploads/excel/${newFilename}`,
        size: fs.statSync(newFilepath).size,
        sheets: sheetNames,
        rows: range.e.r + 1,
        columns: range.e.c + 1,
        uploadedAt: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Excel file uploaded successfully',
        file: fileInfo
      });

    } catch (excelError) {
      // If Excel validation fails, clean up the file
      fs.unlinkSync(newFilepath);
      return res.status(400).json({ 
        error: 'Invalid Excel file format or corrupted file' 
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'File upload failed. Please try again.' 
    });
  }
} 