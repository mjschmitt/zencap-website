// High-Performance Chunked Excel Processor
// Optimized for $2,985-$4,985 financial models
// Target: Sub-second loading with progressive enhancement

export class ChunkedExcelProcessor {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 500; // Process 500 cells at a time
    this.processDelay = options.processDelay || 16; // 60fps targeting
    this.maxMemoryMB = options.maxMemoryMB || 150; // Memory limit
    this.priorityCells = new Set(); // Critical cells to load first
    this.cache = new Map(); // LRU cache for processed chunks
    this.isProcessing = false;
    
    // Performance monitoring
    this.metrics = {
      chunksProcessed: 0,
      totalProcessingTime: 0,
      memoryPeakUsage: 0,
      cacheHitRate: 0
    };
  }

  // Progressive loading with viewport prioritization
  async processWorkbookProgressive(arrayBuffer, viewport) {
    const startTime = performance.now();
    
    try {
      // Phase 1: Load workbook structure only (fast)
      const workbookMeta = await this.loadWorkbookStructure(arrayBuffer);
      
      // Phase 2: Load visible viewport first (priority)
      const visibleData = await this.loadViewportChunked(workbookMeta, viewport);
      
      // Phase 3: Background loading of remaining data
      this.scheduleBackgroundLoading(workbookMeta, viewport);
      
      return {
        meta: workbookMeta,
        initialData: visibleData,
        isComplete: false
      };
      
    } catch (error) {
      throw new Error(`Progressive processing failed: ${error.message}`);
    } finally {
      this.metrics.totalProcessingTime += performance.now() - startTime;
    }
  }

  // Load only workbook structure and sheet info
  async loadWorkbookStructure(arrayBuffer) {
    const worker = new Worker('/optimizedExcelWorker.js');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Workbook structure loading timeout'));
      }, 5000); // 5s timeout for structure
      
      worker.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data.type === 'STRUCTURE_LOADED') {
          worker.terminate();
          resolve(event.data.structure);
        }
      };
      
      worker.onerror = (error) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(error);
      };
      
      worker.postMessage({
        type: 'LOAD_STRUCTURE_ONLY',
        arrayBuffer,
        options: {
          skipCellData: true,
          loadSheetInfo: true,
          loadFormats: false
        }
      });
    });
  }

  // Load viewport in optimized chunks
  async loadViewportChunked(workbookMeta, viewport) {
    const chunks = this.calculateViewportChunks(viewport);
    const results = [];
    
    // Memory-aware processing
    for (const chunk of chunks) {
      if (this.shouldPauseForMemory()) {
        await this.waitForMemoryGC();
      }
      
      const chunkData = await this.processChunk(workbookMeta, chunk);
      results.push(chunkData);
      
      // Yield control to prevent blocking
      await this.yieldToMainThread();
    }
    
    return this.mergeChunkResults(results);
  }

  // Smart chunk calculation based on viewport and cell density
  calculateViewportChunks(viewport) {
    const { startRow, endRow, startCol, endCol } = viewport;
    const totalCells = (endRow - startRow + 1) * (endCol - startCol + 1);
    
    // Adaptive chunk sizing based on total cells
    const adaptiveChunkSize = totalCells > 10000 ? 250 : 
                            totalCells > 5000 ? 500 : 
                            1000;
    
    const chunks = [];
    
    for (let row = startRow; row <= endRow; row += Math.floor(Math.sqrt(adaptiveChunkSize))) {
      for (let col = startCol; col <= endCol; col += Math.floor(Math.sqrt(adaptiveChunkSize))) {
        chunks.push({
          startRow: row,
          endRow: Math.min(row + Math.floor(Math.sqrt(adaptiveChunkSize)) - 1, endRow),
          startCol: col,
          endCol: Math.min(col + Math.floor(Math.sqrt(adaptiveChunkSize)) - 1, endCol),
          priority: this.calculateChunkPriority(row, col, viewport)
        });
      }
    }
    
    // Sort by priority (visible chunks first)
    return chunks.sort((a, b) => b.priority - a.priority);
  }

  // Priority calculation for chunks (center of viewport = highest priority)
  calculateChunkPriority(row, col, viewport) {
    const centerRow = (viewport.startRow + viewport.endRow) / 2;
    const centerCol = (viewport.startCol + viewport.endCol) / 2;
    const distance = Math.sqrt(
      Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
    );
    
    // Inverse distance = higher priority
    return 1000 - distance;
  }

  // Memory-aware processing with GC triggers
  shouldPauseForMemory() {
    if (!performance.memory) return false;
    
    const currentUsageMB = performance.memory.usedJSHeapSize / 1024 / 1024;
    this.metrics.memoryPeakUsage = Math.max(this.metrics.memoryPeakUsage, currentUsageMB);
    
    return currentUsageMB > this.maxMemoryMB;
  }

  // Wait for garbage collection and memory cleanup
  async waitForMemoryGC() {
    // Trigger GC if available
    if (window.gc) {
      window.gc();
    }
    
    // Clear cache if memory is still high
    if (this.shouldPauseForMemory()) {
      this.cache.clear();
    }
    
    // Wait for next animation frame to allow GC
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 100); // Additional 100ms for GC
      });
    });
  }

  // Non-blocking yield to main thread
  async yieldToMainThread() {
    return new Promise(resolve => {
      if (window.scheduler?.postTask) {
        // Use scheduler API if available
        scheduler.postTask(resolve, { priority: 'background' });
      } else {
        // Fallback to setTimeout
        setTimeout(resolve, 0);
      }
    });
  }

  // Process individual chunk with caching
  async processChunk(workbookMeta, chunk) {
    const chunkKey = `${chunk.startRow}-${chunk.endRow}-${chunk.startCol}-${chunk.endCol}`;
    
    // Check cache first
    if (this.cache.has(chunkKey)) {
      this.metrics.cacheHitRate++;
      return this.cache.get(chunkKey);
    }
    
    const worker = new Worker('/optimizedExcelWorker.js');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error(`Chunk processing timeout: ${chunkKey}`));
      }, 2000);
      
      worker.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data.type === 'CHUNK_PROCESSED') {
          worker.terminate();
          
          // Cache result with size limit
          if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
          }
          
          this.cache.set(chunkKey, event.data.chunk);
          this.metrics.chunksProcessed++;
          
          resolve(event.data.chunk);
        }
      };
      
      worker.onerror = (error) => {
        clearTimeout(timeout);
        worker.terminate();
        reject(error);
      };
      
      worker.postMessage({
        type: 'PROCESS_CHUNK',
        workbook: workbookMeta,
        chunk,
        options: {
          includeFormats: true,
          calculateFormulas: false, // Skip formula calc for speed
          extractStyles: true
        }
      });
    });
  }

  // Background loading with requestIdleCallback
  scheduleBackgroundLoading(workbookMeta, viewport) {
    const backgroundChunks = this.calculateBackgroundChunks(workbookMeta, viewport);
    
    const processBackgroundChunk = (deadline) => {
      while (deadline.timeRemaining() > 0 && backgroundChunks.length > 0) {
        const chunk = backgroundChunks.shift();
        this.processChunk(workbookMeta, chunk)
          .then(chunkData => {
            // Emit background data loaded event
            this.emit('backgroundChunkLoaded', chunkData);
          })
          .catch(error => {
            console.warn('Background chunk processing failed:', error);
          });
      }
      
      if (backgroundChunks.length > 0) {
        if (window.requestIdleCallback) {
          requestIdleCallback(processBackgroundChunk);
        } else {
          setTimeout(() => processBackgroundChunk({ timeRemaining: () => 5 }), 1000);
        }
      }
    };
    
    if (window.requestIdleCallback) {
      requestIdleCallback(processBackgroundChunk);
    }
  }

  // Calculate chunks outside viewport for background loading
  calculateBackgroundChunks(workbookMeta, viewport) {
    const allChunks = [];
    const sheet = workbookMeta.sheets[0]; // Assume first sheet for now
    
    // Expand viewport by 50% for background loading
    const expandedViewport = {
      startRow: Math.max(1, viewport.startRow - Math.floor(viewport.startRow * 0.5)),
      endRow: Math.min(sheet.lastRow, viewport.endRow + Math.floor(viewport.endRow * 0.5)),
      startCol: Math.max(1, viewport.startCol - Math.floor(viewport.startCol * 0.5)),
      endCol: Math.min(sheet.lastCol, viewport.endCol + Math.floor(viewport.endCol * 0.5))
    };
    
    return this.calculateViewportChunks(expandedViewport)
      .filter(chunk => !this.isChunkInViewport(chunk, viewport));
  }

  // Check if chunk overlaps with current viewport
  isChunkInViewport(chunk, viewport) {
    return !(
      chunk.endRow < viewport.startRow ||
      chunk.startRow > viewport.endRow ||
      chunk.endCol < viewport.startCol ||
      chunk.startCol > viewport.endCol
    );
  }

  // Merge chunk results efficiently
  mergeChunkResults(chunks) {
    const mergedData = {
      cells: [],
      mergedCells: [],
      columnWidths: {},
      rowHeights: {},
      spilloverRanges: []
    };
    
    // Use efficient merging to avoid memory spikes
    for (const chunk of chunks) {
      mergedData.cells.push(...(chunk.cells || []));
      mergedData.mergedCells.push(...(chunk.mergedCells || []));
      Object.assign(mergedData.columnWidths, chunk.columnWidths || {});
      Object.assign(mergedData.rowHeights, chunk.rowHeights || {});
      mergedData.spilloverRanges.push(...(chunk.spilloverRanges || []));
    }
    
    return mergedData;
  }

  // Event emitter functionality
  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  on(event, callback) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  // Performance metrics getter
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      memoryUsageMB: performance.memory ? 
        Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A'
    };
  }

  // Cleanup
  destroy() {
    this.cache.clear();
    this.listeners = {};
    this.isProcessing = false;
  }
}