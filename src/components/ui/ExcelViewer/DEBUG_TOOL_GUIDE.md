# Excel Worker Debug Tool Guide

## Overview

The debug tool at `/test-excel-worker.html` provides a simple interface to test Excel worker functionality and diagnose issues.

## How to Use the Debug Tool

### 1. Access the Tool
Navigate to: `http://localhost:3001/test-excel-worker.html`

### 2. Available Tests

#### Test Worker Communication
- **Purpose**: Verify worker initialization and basic message passing
- **What it tests**:
  - Worker file loads correctly
  - Messages can be sent to worker
  - Worker responds with proper message format
  - Error handling works

#### Test Excel Load
- **Purpose**: Test loading the specific .xlsm file
- **What it tests**:
  - File fetch from server
  - ArrayBuffer conversion
  - Worker LOAD_WORKBOOK message handling
  - Worksheet detection
  - Error scenarios

### 3. Reading the Log Output

The debug tool provides timestamped logs with color coding:
- **Green**: Successful operations
- **Red**: Errors and failures
- **Black**: Information and progress updates

### 4. Common Issues and Solutions

#### Issue: "Failed to create worker"
**Cause**: Worker file not found or syntax error
**Solution**: 
- Check if `/public/excelWorker.js` exists
- Verify no syntax errors in worker file
- Check browser console for detailed errors

#### Issue: "No response from worker after 2 seconds"
**Cause**: Worker crashed or message handler missing
**Solution**:
- Check worker's onmessage handler
- Verify message type is handled
- Look for errors in worker console

#### Issue: "HTTP 404: Not Found" for Excel file
**Cause**: File doesn't exist at specified path
**Solution**:
- Verify file exists in `/public/uploads/excel/`
- Check file permissions
- Ensure correct file path in test

#### Issue: "Failed to load workbook: ExcelJS is not loaded"
**Cause**: ExcelJS library not loaded in worker
**Solution**:
- Verify `/public/js/exceljs.min.js` exists
- Check importScripts path in worker
- Ensure ExcelJS is compatible version

### 5. Advanced Debugging

#### Enable Verbose Logging
Add to the worker file:
```javascript
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[Worker]', ...args);
  }
}
```

#### Monitor Memory Usage
Add to test functions:
```javascript
if (performance.memory) {
  console.log('Memory:', {
    used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
    total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB'
  });
}
```

#### Test Different File Types
Modify the test file path:
```javascript
// Test different files
const testFiles = [
  '/uploads/excel/test.xlsx',  // Regular Excel
  '/uploads/excel/test.xlsm',  // Macro-enabled
  '/uploads/excel/large.xlsx', // Large file
  '/uploads/excel/corrupt.xlsx' // Corrupted file
];
```

### 6. Performance Testing

Add performance measurements:
```javascript
async function testPerformance() {
  const files = [
    { name: 'Small (1MB)', size: 1 },
    { name: 'Medium (10MB)', size: 10 },
    { name: 'Large (50MB)', size: 50 }
  ];
  
  for (const file of files) {
    const start = performance.now();
    await testExcelLoad(file.path);
    const duration = performance.now() - start;
    
    log(`${file.name}: ${duration.toFixed(0)}ms`, 'info');
  }
}
```

### 7. Testing Error Scenarios

#### Test Network Failure
```javascript
// Simulate offline
async function testOffline() {
  const originalFetch = window.fetch;
  window.fetch = () => Promise.reject(new Error('Network error'));
  
  try {
    await testExcelLoad();
  } finally {
    window.fetch = originalFetch;
  }
}
```

#### Test Timeout
```javascript
// Test with very short timeout
async function testTimeout() {
  const worker = new Worker('/excelWorker.js');
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 100);
  });
  
  try {
    await Promise.race([
      loadWithWorker(worker),
      timeoutPromise
    ]);
  } catch (error) {
    log('Expected timeout: ' + error.message, 'success');
  }
}
```

### 8. Production Debugging

For production issues, add query parameters:
```
/test-excel-worker.html?debug=true&file=specific.xlsx
```

Then modify the test to use URL parameters:
```javascript
const params = new URLSearchParams(window.location.search);
const debugMode = params.get('debug') === 'true';
const testFile = params.get('file') || '1753393926437_111_SW_16th_Ter_debt_.xlsm';
```

## Interpreting Results

### Successful Test Output
```
[10:23:45] Testing Excel file load...
[10:23:45] Fetching Excel file...
[10:23:45] File fetched successfully, converting to ArrayBuffer...
[10:23:45] ArrayBuffer size: 5242880 bytes
[10:23:45] Creating worker...
[10:23:45] Sending LOAD_WORKBOOK message to worker...
[10:23:46] Worker response: {
  "type": "WORKBOOK_LOADED",
  "data": {
    "worksheets": [
      {"name": "Sheet1", "rowCount": 1000, "columnCount": 50}
    ]
  },
  "id": 1
}
[10:23:46] Workbook loaded successfully!
```

### Failed Test Output
```
[10:23:45] Testing Excel file load...
[10:23:45] Fetching Excel file...
[10:23:45] Error: HTTP 404: Not Found
[10:23:45] Stack: Error at testExcelLoad...
```

## Best Practices

1. **Clear logs between tests** to avoid confusion
2. **Test incrementally** - start with worker communication before file loading
3. **Monitor browser console** for additional errors
4. **Test with various file sizes** to identify performance boundaries
5. **Document any issues found** with specific error messages

## Automated Testing

Create automated tests using the debug tool:
```javascript
// automated-excel-tests.js
async function runAllTests() {
  const results = {
    workerInit: false,
    fileLoad: false,
    largeFile: false,
    errorHandling: false
  };
  
  try {
    await testWorker();
    results.workerInit = true;
  } catch (e) {
    console.error('Worker init failed:', e);
  }
  
  try {
    await testExcelLoad();
    results.fileLoad = true;
  } catch (e) {
    console.error('File load failed:', e);
  }
  
  // ... more tests
  
  console.table(results);
  return results;
}
```

This debug tool is essential for diagnosing Excel viewer issues in development and production environments.