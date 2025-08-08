// Optimized Excel Processing Web Worker
// High-performance worker for Zenith Capital Advisors financial models
// Target: Process 10k+ cells in <1 second with memory efficiency

// Use streaming imports for ExcelJS to reduce initial load
let ExcelJS = null;
let isInitialized = false;
let workbookCache = new Map();
let structureCache = new Map();

// Performance monitoring
const workerMetrics = {
  tasksProcessed: 0,
  avgProcessingTime: 0,
  memoryPeakMB: 0,
  cacheHitRate: 0
};

// Lazy load ExcelJS only when needed
async function initializeExcelJS() {
  if (isInitialized) return;
  
  try {
    // Load ExcelJS with streaming support
    importScripts('/js/exceljs.min.js');
    ExcelJS = self.ExcelJS;
    
    if (!ExcelJS) {
      throw new Error('ExcelJS not available after import');
    }
    
    isInitialized = true;
    console.log('[OptimizedWorker] ExcelJS initialized successfully');
  } catch (error) {
    console.error('[OptimizedWorker] Failed to initialize ExcelJS:', error);
    throw error;
  }
}

// Memory monitoring with automatic cleanup
function checkMemoryUsage() {
  if (self.performance && self.performance.memory) {
    const usedMB = self.performance.memory.usedJSHeapSize / 1024 / 1024;
    workerMetrics.memoryPeakMB = Math.max(workerMetrics.memoryPeakMB, usedMB);
    
    // Trigger cleanup if memory usage is high
    if (usedMB > 200) { // 200MB threshold
      triggerMemoryCleanup();
    }
    
    return usedMB;
  }
  return 0;
}

// Aggressive memory cleanup
function triggerMemoryCleanup() {
  console.log('[OptimizedWorker] Triggering memory cleanup...');
  
  // Clear caches
  workbookCache.clear();
  structureCache.clear();
  
  // Force garbage collection if available
  if (self.gc) {
    self.gc();
  }
  
  self.postMessage({
    type: 'MEMORY_CLEANUP',
    memoryUsage: checkMemoryUsage()
  });
}

// High-performance structure-only loading
async function loadWorkbookStructure(arrayBuffer, options = {}) {
  const cacheKey = `structure_${arrayBuffer.byteLength}`;
  
  if (structureCache.has(cacheKey)) {
    workerMetrics.cacheHitRate++;
    return structureCache.get(cacheKey);
  }
  
  try {
    await initializeExcelJS();
    
    const workbook = new ExcelJS.Workbook();
    
    // Fast load with minimal options
    await workbook.xlsx.load(arrayBuffer, {
      ignoreVBA: true,
      cellDates: false, // Skip date parsing for speed
      cellNF: false,    // Skip number formatting for structure load
      cellStyles: false // Skip styles for structure load
    });
    
    // Extract only structure information
    const structure = {
      properties: workbook.properties || {},
      sheets: workbook.worksheets.map((sheet, index) => ({
        id: sheet.id,
        name: sheet.name,
        index: index,
        state: sheet.state || 'visible',
        isHidden: sheet.state === 'hidden' || sheet.state === 'veryHidden',
        lastRow: sheet.actualRowCount || sheet.lastRow?.number || 100,
        lastCol: sheet.actualColumnCount || sheet.lastColumn?.number || 50,
        // Pre-calculate viewport bounds
        defaultViewport: {
          startRow: 1,
          endRow: Math.min(sheet.actualRowCount || 100, 50),
          startCol: 1,
          endCol: Math.min(sheet.actualColumnCount || 50, 20)
        }
      }))
    };
    
    // Cache structure for reuse
    structureCache.set(cacheKey, structure);
    
    return structure;
    
  } catch (error) {
    throw new Error(`Structure loading failed: ${error.message}`);
  }
}

// Optimized chunk processing with streaming
async function processChunk(workbookData, chunk, options = {}) {
  const startTime = performance.now();
  
  try {
    await initializeExcelJS();
    
    // Get or create workbook instance
    const workbook = await getWorkbookInstance(workbookData);
    const worksheet = workbook.worksheets[chunk.sheetIndex || 0];
    
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }
    
    const processedChunk = {
      cells: [],
      columnWidths: {},
      rowHeights: {},
      mergedCells: [],
      chunkId: `${chunk.startRow}-${chunk.endRow}-${chunk.startCol}-${chunk.endCol}`
    };
    
    // Process cells in mini-batches for memory efficiency
    const MINI_BATCH_SIZE = 50;
    let processedCells = 0;
    
    for (let row = chunk.startRow; row <= chunk.endRow; row += MINI_BATCH_SIZE) {
      const rowEnd = Math.min(row + MINI_BATCH_SIZE - 1, chunk.endRow);
      
      for (let col = chunk.startCol; col <= chunk.endCol; col++) {
        try {
          const cell = worksheet.getCell(row, col);
          
          if (cell && (cell.value !== null && cell.value !== undefined)) {
            const cellData = {
              row,
              col,
              value: getCellValueOptimized(cell),
              type: cell.type
            };
            
            // Only extract styles if requested
            if (options.extractStyles && cell.style) {
              cellData.style = extractMinimalStyle(cell);
            }
            
            processedChunk.cells.push(cellData);
            processedCells++;
            
            // Yield control periodically to prevent blocking
            if (processedCells % 200 === 0) {
              await yieldControl();
              
              // Check memory usage
              if (checkMemoryUsage() > 150) {
                // Process remaining in next chunk
                break;
              }
            }
          }
        } catch (cellError) {
          // Skip problematic cells
          console.warn(`[OptimizedWorker] Cell error at ${row},${col}:`, cellError);
        }
      }
    }
    
    // Extract column/row sizing efficiently
    extractDimensions(worksheet, processedChunk, chunk);
    
    const processingTime = performance.now() - startTime;
    workerMetrics.tasksProcessed++;
    workerMetrics.avgProcessingTime = 
      (workerMetrics.avgProcessingTime * (workerMetrics.tasksProcessed - 1) + processingTime) / 
      workerMetrics.tasksProcessed;
    
    return processedChunk;
    
  } catch (error) {
    throw new Error(`Chunk processing failed: ${error.message}`);
  }
}

// Get or create workbook instance with caching
async function getWorkbookInstance(workbookData) {
  const cacheKey = workbookData.cacheKey || 'default';
  
  if (workbookCache.has(cacheKey)) {
    return workbookCache.get(cacheKey);
  }
  
  // Create new workbook instance
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(workbookData.arrayBuffer, {
    ignoreVBA: true,
    cellDates: true,
    cellNF: true,
    cellStyles: true
  });
  
  // Cache with size limit
  if (workbookCache.size > 2) { // Only keep 2 workbooks in memory
    const firstKey = workbookCache.keys().next().value;
    workbookCache.delete(firstKey);
  }
  
  workbookCache.set(cacheKey, workbook);
  return workbook;
}

// Optimized cell value extraction
function getCellValueOptimized(cell) {
  // Fast path for common types
  if (typeof cell.value === 'string' || typeof cell.value === 'number') {
    return cell.value;
  }
  
  if (cell.value === null || cell.value === undefined) {
    return '';
  }
  
  // Handle dates efficiently
  if (cell.value instanceof Date) {
    if (isNaN(cell.value.getTime())) {
      return '';
    }
    return cell.value;
  }
  
  // Handle formula results
  if (cell.type === 6 && cell.formula) {
    if (typeof cell.value !== 'object') {
      return cell.value;
    }
    
    if (cell.value && cell.value.result !== undefined) {
      return cell.value.result;
    }
    
    // Skip complex formula resolution for performance
    return '';
  }
  
  // Handle objects (rich text, etc.)
  if (typeof cell.value === 'object') {
    if (cell.value.richText) {
      return cell.value.richText.map(rt => rt.text).join('');
    }
    
    if (cell.value.text) {
      return cell.value.text;
    }
    
    // Return empty for complex objects
    return '';
  }
  
  return cell.value;
}

// Minimal style extraction for performance
function extractMinimalStyle(cell) {
  const style = {};
  
  // Only extract most common styles
  if (cell.font) {
    style.font = {
      bold: cell.font.bold || false,
      size: cell.font.size || 11,
      color: cell.font.color?.argb || cell.font.color?.rgb
    };
  }
  
  if (cell.fill && cell.fill.fgColor) {
    style.fill = {
      color: cell.fill.fgColor.argb || cell.fill.fgColor.rgb
    };
  }
  
  if (cell.alignment) {
    style.alignment = {
      horizontal: cell.alignment.horizontal,
      vertical: cell.alignment.vertical
    };
  }
  
  return style;
}

// Extract dimensions efficiently
function extractDimensions(worksheet, processedChunk, chunk) {
  // Extract column widths
  if (worksheet.columns) {
    worksheet.columns.forEach((col, index) => {
      if (col && col.width && index + 1 >= chunk.startCol && index + 1 <= chunk.endCol) {
        processedChunk.columnWidths[index + 1] = col.width;
      }
    });
  }
  
  // Extract row heights (limited range for performance)
  for (let rowNum = chunk.startRow; rowNum <= Math.min(chunk.endRow, chunk.startRow + 100); rowNum++) {
    try {
      const row = worksheet.getRow(rowNum);
      if (row && row.height) {
        processedChunk.rowHeights[rowNum] = row.height;
      }
    } catch (e) {
      // Skip problematic rows
    }
  }
}

// Non-blocking yield control
async function yieldControl() {
  return new Promise(resolve => {
    if (self.scheduler?.postTask) {
      self.scheduler.postTask(resolve, { priority: 'background' });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

// Message handler with performance optimization
self.onmessage = async function(event) {
  const { type, data, id } = event.data;
  const startTime = performance.now();
  
  try {
    let result;
    
    switch (type) {
      case 'LOAD_STRUCTURE_ONLY':
        result = await loadWorkbookStructure(data.arrayBuffer, data.options);
        self.postMessage({
          type: 'STRUCTURE_LOADED',
          structure: result,
          id,
          processingTime: performance.now() - startTime
        });
        break;
        
      case 'PROCESS_CHUNK':
        result = await processChunk(data.workbook, data.chunk, data.options);
        self.postMessage({
          type: 'CHUNK_PROCESSED',
          chunk: result,
          id,
          processingTime: performance.now() - startTime
        });
        break;
        
      case 'GET_METRICS':
        self.postMessage({
          type: 'WORKER_METRICS',
          metrics: {
            ...workerMetrics,
            memoryUsage: checkMemoryUsage(),
            cacheSize: workbookCache.size + structureCache.size
          },
          id
        });
        break;
        
      case 'CLEANUP':
        triggerMemoryCleanup();
        self.postMessage({
          type: 'CLEANUP_COMPLETE',
          id
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: {
        message: error.message,
        stack: error.stack
      },
      id
    });
  }
};

// Periodic memory monitoring
setInterval(() => {
  const memoryUsage = checkMemoryUsage();
  
  if (memoryUsage > 0) {
    self.postMessage({
      type: 'MEMORY_STATUS',
      memoryUsage,
      metrics: workerMetrics
    });
  }
}, 10000); // Every 10 seconds

// Signal worker is ready
self.postMessage({ 
  type: 'WORKER_READY',
  timestamp: Date.now(),
  capabilities: {
    memoryMonitoring: !!self.performance?.memory,
    scheduler: !!self.scheduler?.postTask,
    gc: !!self.gc
  }
});