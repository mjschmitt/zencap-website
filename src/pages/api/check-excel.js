import fs from 'fs/promises';
import path from 'path';
import { query } from '../../utils/database.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { modelId, excelUrl } = req.body;

  if (!modelId || !excelUrl) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Extract filename from URL
    const fileName = excelUrl.split('/').pop();
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'excel', fileName);
    
    // Check if file exists
    try {
      await fs.access(filePath);
      // File exists
      return res.status(200).json({ 
        exists: true, 
        url: excelUrl 
      });
    } catch (error) {
      // File doesn't exist, check for backups
      console.log(`File not found: ${fileName}, checking for backups...`);
      
      // Look for the most recent file with similar name pattern
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'excel');
      const files = await fs.readdir(uploadsDir);
      
      // Extract the base name (removing timestamp and hash)
      const baseNameMatch = fileName.match(/_([^_]+\.xlsm?)$/);
      const baseName = baseNameMatch ? baseNameMatch[1] : null;
      
      if (baseName) {
        // Find files with the same base name
        const similarFiles = files.filter(f => f.endsWith(baseName));
        
        if (similarFiles.length > 0) {
          // Sort by timestamp (newest first)
          similarFiles.sort((a, b) => {
            const timeA = parseInt(a.split('_')[0]) || 0;
            const timeB = parseInt(b.split('_')[0]) || 0;
            return timeB - timeA;
          });
          
          const mostRecentFile = similarFiles[0];
          const newUrl = `/uploads/excel/${mostRecentFile}`;
          
          // Update database with new URL
          await query(
            'UPDATE models SET excel_url = $1 WHERE id = $2',
            [newUrl, modelId]
          );
          
          console.log(`Updated model ${modelId} with new Excel URL: ${newUrl}`);
          
          return res.status(200).json({ 
            exists: true, 
            url: newUrl,
            updated: true,
            message: 'File was missing but found a recent version and updated the database'
          });
        }
      }
      
      // No suitable replacement found
      return res.status(404).json({ 
        exists: false,
        error: 'Excel file not found and no suitable replacement available',
        originalUrl: excelUrl
      });
    }
  } catch (error) {
    console.error('Error checking Excel file:', error);
    return res.status(500).json({ 
      error: 'Failed to check Excel file',
      details: error.message 
    });
  }
}