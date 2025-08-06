// src/pages/api/download/[orderId].js
import { getSession } from 'next-auth/react';
import { sql } from '@vercel/postgres';
import { incrementDownloadCount } from '@/utils/database';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    const { orderId } = req.query;

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get order details with customer and model info
    const result = await sql`
      SELECT o.*, m.file_url, m.title, c.email, m.excel_url
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN models m ON o.model_id = m.id
      WHERE o.id = ${orderId} 
        AND c.email = ${session.user.email}
        AND o.status = 'completed'
        AND o.download_expires_at > NOW()
        AND o.download_count < o.max_downloads;
    `;

    if (!result.rows[0]) {
      return res.status(404).json({ 
        error: 'Order not found or download not available',
        message: 'This download may have expired or reached the maximum download limit.'
      });
    }

    const order = result.rows[0];
    
    // Increment download count
    const updatedOrder = await incrementDownloadCount(orderId);
    if (!updatedOrder) {
      return res.status(400).json({ 
        error: 'Download limit reached or expired',
        message: 'You have exceeded the maximum number of downloads or the download has expired.'
      });
    }

    // Determine file path - prioritize excel_url, fallback to file_url
    let filePath = null;
    if (order.excel_url) {
      filePath = path.join(process.cwd(), 'public', order.excel_url);
    } else if (order.file_url) {
      filePath = path.join(process.cwd(), 'public', order.file_url);
    }

    if (!filePath || !fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ 
        error: 'File not found',
        message: 'The requested file is currently unavailable. Please contact support.'
      });
    }

    // Set headers for file download
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(fileName);
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (fileExtension === '.xlsx' || fileExtension === '.xlsm') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${order.title.replace(/[^a-zA-Z0-9.-]/g, '_')}${fileExtension}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Log the download
    console.log(`File downloaded by ${session.user.email}: Order ${orderId}, Downloads: ${updatedOrder.download_count}/${updatedOrder.max_downloads}`);

  } catch (error) {
    console.error('Error processing download:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Download failed'
    });
  }
}