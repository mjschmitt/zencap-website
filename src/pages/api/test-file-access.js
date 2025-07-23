export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileUrl } = req.query;
  
  if (!fileUrl) {
    return res.status(400).json({ error: 'fileUrl parameter required' });
  }

  try {
    console.log('Testing file access for:', fileUrl);
    
    // Construct the full URL
    const fullUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}${fileUrl}`;
    console.log('Full URL:', fullUrl);
    
    const response = await fetch(fullUrl);
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      return res.status(404).json({ 
        error: 'File not accessible',
        status: response.status,
        statusText: response.statusText,
        fileUrl,
        fullUrl
      });
    }

    const buffer = await response.arrayBuffer();
    
    return res.status(200).json({
      success: true,
      message: 'File is accessible',
      fileSize: buffer.byteLength,
      contentType: response.headers.get('content-type'),
      fileUrl,
      fullUrl
    });

  } catch (error) {
    console.error('File access test error:', error);
    return res.status(500).json({
      error: 'Failed to test file access',
      details: error.message,
      fileUrl
    });
  }
} 