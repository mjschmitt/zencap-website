# Excel Viewer Performance Test Suite

## Large File Performance Testing

### Test Environment Setup

```javascript
// Performance monitoring utilities
const performanceMonitor = {
  startTime: 0,
  measurements: [],
  
  start(label) {
    this.startTime = performance.now();
    this.measurements.push({
      label,
      startTime: this.startTime,
      startMemory: performance.memory?.usedJSHeapSize
    });
  },
  
  end(label) {
    const endTime = performance.now();
    const measurement = this.measurements.find(m => m.label === label);
    if (measurement) {
      measurement.endTime = endTime;
      measurement.duration = endTime - measurement.startTime;
      measurement.endMemory = performance.memory?.usedJSHeapSize;
      measurement.memoryDelta = measurement.endMemory - measurement.startMemory;
    }
    return measurement;
  },
  
  report() {
    console.table(this.measurements.map(m => ({
      Label: m.label,
      Duration: `${m.duration?.toFixed(2)}ms`,
      Memory: `${(m.memoryDelta / 1024 / 1024)?.toFixed(2)}MB`
    })));
  }
};
```

### Test Files Generation

```javascript
// Generate test files of various sizes
const generateLargeExcelFile = async (rows, cols, sizeMB) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Large Dataset');
  
  // Add headers
  const headers = Array.from({length: cols}, (_, i) => `Column ${i + 1}`);
  worksheet.addRow(headers);
  
  // Add data rows with formulas and formatting
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      if (j === 0) {
        row.push(`Row ${i + 1}`);
      } else if (j < 5) {
        row.push(Math.random() * 1000);
      } else if (j < 10) {
        row.push(`=SUM(B${i+2}:E${i+2})`);
      } else {
        row.push(`Data ${i}-${j}`);
      }
    }
    
    const excelRow = worksheet.addRow(row);
    
    // Add formatting every 10th row
    if (i % 10 === 0) {
      excelRow.font = { bold: true };
      excelRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }
  }
  
  // Add conditional formatting
  worksheet.addConditionalFormatting({
    ref: 'B2:E1000',
    rules: [{
      type: 'cellIs',
      operator: 'greaterThan',
      formulae: [500],
      style: {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          bgColor: { argb: 'FF00FF00' }
        }
      }
    }]
  });
  
  return workbook;
};
```

### Performance Test Scenarios

#### 1. Small File Test (<1MB)
```javascript
const testSmallFile = async () => {
  performanceMonitor.start('small-file-total');
  
  // 1000 rows x 20 columns
  const workbook = await generateLargeExcelFile(1000, 20, 1);
  performanceMonitor.start('small-file-save');
  const buffer = await workbook.xlsx.writeBuffer();
  performanceMonitor.end('small-file-save');
  
  // Test loading
  performanceMonitor.start('small-file-load');
  await loadExcelFile(buffer);
  performanceMonitor.end('small-file-load');
  
  performanceMonitor.end('small-file-total');
  
  return {
    size: buffer.byteLength,
    metrics: performanceMonitor.measurements
  };
};
```

#### 2. Medium File Test (10MB)
```javascript
const testMediumFile = async () => {
  performanceMonitor.start('medium-file-total');
  
  // 10000 rows x 50 columns
  const workbook = await generateLargeExcelFile(10000, 50, 10);
  const buffer = await workbook.xlsx.writeBuffer();
  
  performanceMonitor.start('medium-file-parse');
  await loadExcelFile(buffer);
  performanceMonitor.end('medium-file-parse');
  
  // Test viewport scrolling
  performanceMonitor.start('medium-file-scroll');
  for (let i = 0; i < 10; i++) {
    await scrollToRow(i * 1000);
    await new Promise(r => setTimeout(r, 100));
  }
  performanceMonitor.end('medium-file-scroll');
  
  performanceMonitor.end('medium-file-total');
  
  return performanceMonitor.measurements;
};
```

#### 3. Large File Test (50MB)
```javascript
const testLargeFile = async () => {
  performanceMonitor.start('large-file-total');
  
  // 50000 rows x 100 columns
  console.log('Generating 50MB file...');
  const workbook = await generateLargeExcelFile(50000, 100, 50);
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Monitor memory during load
  const memorySnapshots = [];
  const memoryInterval = setInterval(() => {
    if (performance.memory) {
      memorySnapshots.push({
        time: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      });
    }
  }, 1000);
  
  performanceMonitor.start('large-file-load');
  await loadExcelFile(buffer);
  performanceMonitor.end('large-file-load');
  
  clearInterval(memoryInterval);
  
  // Test search performance
  performanceMonitor.start('large-file-search');
  await searchInFile('test', { caseSensitive: false });
  performanceMonitor.end('large-file-search');
  
  performanceMonitor.end('large-file-total');
  
  return {
    metrics: performanceMonitor.measurements,
    memoryProfile: memorySnapshots
  };
};
```

#### 4. Very Large File Test (100MB+)
```javascript
const testVeryLargeFile = async () => {
  console.warn('Testing 100MB+ file - this may take several minutes');
  
  performanceMonitor.start('xlarge-file-total');
  
  // 100000 rows x 150 columns
  const workbook = await generateLargeExcelFile(100000, 150, 100);
  
  // Test chunked loading
  performanceMonitor.start('xlarge-file-chunked');
  const chunks = [];
  let offset = 0;
  const chunkSize = 10 * 1024 * 1024; // 10MB chunks
  
  // Simulate chunked processing
  while (offset < buffer.byteLength) {
    const chunk = buffer.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }
  performanceMonitor.end('xlarge-file-chunked');
  
  // Test timeout handling
  performanceMonitor.start('xlarge-file-timeout');
  try {
    await loadExcelFileWithTimeout(buffer, 5000); // 5 second timeout
  } catch (error) {
    console.log('Expected timeout:', error.message);
  }
  performanceMonitor.end('xlarge-file-timeout');
  
  performanceMonitor.end('xlarge-file-total');
  
  return performanceMonitor.measurements;
};
```

### Stress Testing

#### Concurrent File Loading
```javascript
const testConcurrentLoading = async () => {
  const files = await Promise.all([
    generateLargeExcelFile(1000, 20, 1),
    generateLargeExcelFile(5000, 30, 5),
    generateLargeExcelFile(10000, 40, 10)
  ]);
  
  performanceMonitor.start('concurrent-load');
  
  const results = await Promise.allSettled(
    files.map((file, index) => 
      loadExcelFile(file).catch(err => ({
        error: err.message,
        fileIndex: index
      }))
    )
  );
  
  performanceMonitor.end('concurrent-load');
  
  return {
    results,
    metrics: performanceMonitor.measurements
  };
};
```

#### Memory Leak Detection
```javascript
const testMemoryLeaks = async () => {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryReadings = [];
  
  // Load and unload files repeatedly
  for (let i = 0; i < 10; i++) {
    console.log(`Memory leak test iteration ${i + 1}/10`);
    
    const workbook = await generateLargeExcelFile(5000, 50, 5);
    const buffer = await workbook.xlsx.writeBuffer();
    
    await loadExcelFile(buffer);
    await new Promise(r => setTimeout(r, 1000));
    
    // Force cleanup
    if (window.viewer) {
      window.viewer.cleanup();
      window.viewer = null;
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    const currentMemory = performance.memory?.usedJSHeapSize || 0;
    memoryReadings.push({
      iteration: i + 1,
      memory: currentMemory,
      delta: currentMemory - initialMemory
    });
  }
  
  // Analyze memory growth
  const memoryGrowth = memoryReadings[9].memory - memoryReadings[0].memory;
  const leakDetected = memoryGrowth > (50 * 1024 * 1024); // 50MB threshold
  
  return {
    leakDetected,
    memoryGrowth: `${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`,
    readings: memoryReadings
  };
};
```

### Performance Benchmarks

```javascript
const runPerformanceBenchmarks = async () => {
  console.log('Starting Excel Viewer Performance Benchmarks...');
  
  const results = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    memory: {
      available: performance.memory?.jsHeapSizeLimit,
      used: performance.memory?.usedJSHeapSize
    },
    tests: {}
  };
  
  // Run all tests
  try {
    console.log('Test 1: Small files (<1MB)');
    results.tests.small = await testSmallFile();
    
    console.log('Test 2: Medium files (10MB)');
    results.tests.medium = await testMediumFile();
    
    console.log('Test 3: Large files (50MB)');
    results.tests.large = await testLargeFile();
    
    console.log('Test 4: Concurrent loading');
    results.tests.concurrent = await testConcurrentLoading();
    
    console.log('Test 5: Memory leak detection');
    results.tests.memoryLeak = await testMemoryLeaks();
    
  } catch (error) {
    console.error('Benchmark failed:', error);
    results.error = error.message;
  }
  
  // Generate report
  generatePerformanceReport(results);
  
  return results;
};
```

### Performance Report Generator

```javascript
const generatePerformanceReport = (results) => {
  const report = `
# Excel Viewer Performance Report

Generated: ${results.timestamp}
Browser: ${results.userAgent}

## Performance Metrics

### File Size Performance
| File Size | Load Time | Memory Usage | Status |
|-----------|-----------|--------------|--------|
| <1MB      | ${results.tests.small?.metrics[1]?.duration.toFixed(0)}ms | ${(results.tests.small?.metrics[1]?.memoryDelta / 1024 / 1024).toFixed(1)}MB | ${results.tests.small?.metrics[1]?.duration < 1000 ? '✅ PASS' : '❌ FAIL'} |
| 10MB      | ${results.tests.medium?.find(m => m.label === 'medium-file-parse')?.duration.toFixed(0)}ms | ${(results.tests.medium?.find(m => m.label === 'medium-file-parse')?.memoryDelta / 1024 / 1024).toFixed(1)}MB | ${results.tests.medium?.find(m => m.label === 'medium-file-parse')?.duration < 3000 ? '✅ PASS' : '❌ FAIL'} |
| 50MB      | ${results.tests.large?.metrics.find(m => m.label === 'large-file-load')?.duration.toFixed(0)}ms | ${(results.tests.large?.metrics.find(m => m.label === 'large-file-load')?.memoryDelta / 1024 / 1024).toFixed(1)}MB | ${results.tests.large?.metrics.find(m => m.label === 'large-file-load')?.duration < 10000 ? '✅ PASS' : '❌ FAIL'} |

### Memory Leak Test
- Initial Memory: ${(results.tests.memoryLeak?.readings[0]?.memory / 1024 / 1024).toFixed(1)}MB
- Final Memory: ${(results.tests.memoryLeak?.readings[9]?.memory / 1024 / 1024).toFixed(1)}MB
- Memory Growth: ${results.tests.memoryLeak?.memoryGrowth}
- Leak Detected: ${results.tests.memoryLeak?.leakDetected ? '❌ YES' : '✅ NO'}

### Recommendations
${generateRecommendations(results)}
  `;
  
  console.log(report);
  return report;
};

const generateRecommendations = (results) => {
  const recommendations = [];
  
  // Check load times
  if (results.tests.large?.metrics.find(m => m.label === 'large-file-load')?.duration > 10000) {
    recommendations.push('- Implement streaming parser for large files');
    recommendations.push('- Add progress chunking for better UX');
  }
  
  // Check memory usage
  if (results.tests.memoryLeak?.leakDetected) {
    recommendations.push('- Fix memory leaks in worker cleanup');
    recommendations.push('- Implement aggressive garbage collection');
  }
  
  // Check concurrent performance
  const failedConcurrent = results.tests.concurrent?.results.filter(r => r.status === 'rejected').length;
  if (failedConcurrent > 0) {
    recommendations.push('- Improve concurrent file handling');
    recommendations.push('- Add queue management for multiple files');
  }
  
  return recommendations.length > 0 
    ? recommendations.join('\\n')
    : '- All performance metrics within acceptable ranges';
};
```

## Usage Instructions

1. **Run Individual Tests**:
```javascript
// Test specific file size
await testSmallFile();
await testMediumFile();
await testLargeFile();
```

2. **Run Full Benchmark Suite**:
```javascript
// Run all performance tests
const results = await runPerformanceBenchmarks();
console.log(JSON.stringify(results, null, 2));
```

3. **Monitor Real-time Performance**:
```javascript
// Add to Excel viewer initialization
if (window.location.search.includes('debug=true')) {
  window.performanceMonitor = performanceMonitor;
  console.log('Performance monitoring enabled');
}
```

## Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Small file load (<1MB) | <1s | TBD | TBD |
| Medium file load (10MB) | <3s | TBD | TBD |
| Large file load (50MB) | <10s | TBD | TBD |
| Memory growth per file | <50MB | TBD | TBD |
| Concurrent files | 3+ | TBD | TBD |
| Search response time | <500ms | TBD | TBD |

## Next Steps

1. Run full benchmark suite on production hardware
2. Test with real-world financial models
3. Implement performance optimizations based on results
4. Set up continuous performance monitoring
5. Create performance regression tests