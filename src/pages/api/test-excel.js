import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic XLSX functionality
    const testWorkbook = XLSX.utils.book_new();
    const testData = [['Name', 'Value'], ['Test', 123], ['Excel', 456]];
    const testSheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(testWorkbook, testSheet, 'Test');

    return res.status(200).json({ 
      success: true, 
      message: 'Excel functionality is working',
      xlsxVersion: 'Available',
      testSheets: testWorkbook.SheetNames
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Excel functionality failed', 
      details: error.message 
    });
  }
} 