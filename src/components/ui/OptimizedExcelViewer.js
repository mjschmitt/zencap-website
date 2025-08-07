import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load heavy Excel components
const ExcelSheet = dynamic(() => import('./ExcelViewer/ExcelSheet'), {
  loading: () => <ExcelLoadingSkeleton />,
  ssr: false
});

const ExcelToolbar = dynamic(() => import('./ExcelViewer/ExcelToolbar'), {
  loading: () => <div className="h-12 bg-gray-100 animate-pulse rounded" />,
  ssr: false
});

const ExcelSheetTabs = dynamic(() => import('./ExcelViewer/ExcelSheetTabs'), {
  loading: () => <div className="h-8 bg-gray-50 animate-pulse" />,
  ssr: false
});

// Optimized loading skeleton
const ExcelLoadingSkeleton = React.memo(() => (
  <div className="w-full h-96 bg-white border border-gray-200 rounded-lg animate-pulse">
    <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4 space-x-2">
      <div className="w-20 h-6 bg-gray-300 rounded"></div>
      <div className="w-20 h-6 bg-gray-300 rounded"></div>
      <div className="w-20 h-6 bg-gray-300 rounded"></div>
    </div>
    <div className="p-4 space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex space-x-2">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="w-16 h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
));

ExcelLoadingSkeleton.displayName = 'ExcelLoadingSkeleton';

// Error fallback component
const ExcelErrorFallback = React.memo(({ error, resetErrorBoundary }) => (
  <div className="w-full h-96 bg-white border border-red-200 rounded-lg flex items-center justify-center">
    <div className="text-center p-6">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Excel Viewer Error
      </h3>
      <p className="text-gray-600 mb-4">
        {error?.message || 'Failed to load Excel file'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
));

ExcelErrorFallback.displayName = 'ExcelErrorFallback';

// Virtual scrolling hook for large datasets
const useVirtualScrolling = (data, itemHeight = 30, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      data.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, data.length]);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return { visibleRange, handleScroll };
};

// Performance monitoring hook
const usePerformanceMonitor = (componentName) => {
  const startTime = useRef(Date.now());
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0
  });
  
  useEffect(() => {
    const endTime = Date.now();
    const renderTime = endTime - startTime.current;
    
    // Monitor memory usage if available
    const memoryUsage = performance.memory?.usedJSHeapSize || 0;
    
    setMetrics({ renderTime, memoryUsage });
    
    // Log performance warnings
    if (renderTime > 2000) {
      console.warn(`${componentName}: Slow render detected (${renderTime}ms)`);
    }
    
    if (memoryUsage > 100 * 1024 * 1024) { // 100MB
      console.warn(`${componentName}: High memory usage detected (${Math.round(memoryUsage / 1024 / 1024)}MB)`);
    }
  }, [componentName]);
  
  return metrics;
};

// Main optimized Excel viewer component
const OptimizedExcelViewer = React.memo(({ 
  file, 
  title = "Model Viewer", 
  height = "600px", 
  onSuccess, 
  onError,
  darkMode = false,
  showSearch = true,
  showPrintButton = true,
  enableKeyboardShortcuts = true,
  maxRows = 10000, // Limit for performance
  maxCols = 100
}) => {
  // Performance monitoring
  const performanceMetrics = usePerformanceMonitor('OptimizedExcelViewer');
  
  // Core state management with useMemo for expensive computations
  const [worksheets, setWorksheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Virtual scrolling state
  const [viewport, setViewport] = useState({
    start: { row: 0, col: 0 },
    end: { row: Math.min(100, maxRows), col: Math.min(50, maxCols) }
  });
  
  // Refs for performance optimization
  const containerRef = useRef(null);
  const processingRef = useRef(false);
  const abortControllerRef = useRef(null);
  
  // Memoized filtered and processed data
  const processedSheetData = useMemo(() => {
    if (!sheetData || !sheetData.cells) return null;
    
    // Only process visible cells for performance
    const visibleCells = {};
    const { start, end } = viewport;
    
    for (let row = start.row; row <= Math.min(end.row, maxRows); row++) {
      for (let col = start.col; col <= Math.min(end.col, maxCols); col++) {
        const cellKey = `${row}_${col}`;
        if (sheetData.cells[cellKey]) {
          visibleCells[cellKey] = sheetData.cells[cellKey];
        }
      }
    }
    
    return {
      ...sheetData,
      cells: visibleCells,
      rowCount: Math.min(sheetData.rowCount || 0, maxRows),
      colCount: Math.min(sheetData.colCount || 0, maxCols)
    };
  }, [sheetData, viewport, maxRows, maxCols]);
  
  // Debounced viewport update to improve scrolling performance
  const updateViewport = useCallback((newViewport) => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    requestAnimationFrame(() => {
      setViewport(newViewport);
      processingRef.current = false;
    });
  }, []);
  
  // Optimized sheet change handler
  const handleSheetChange = useCallback((index) => {
    if (index >= 0 && index < worksheets.length && index !== activeSheet) {
      setActiveSheet(index);
      setSelectedCell(null);
      setViewport({
        start: { row: 0, col: 0 },
        end: { row: Math.min(100, maxRows), col: Math.min(50, maxCols) }
      });
    }
  }, [activeSheet, worksheets.length, maxRows, maxCols]);
  
  // Optimized zoom handler with requestAnimationFrame
  const handleZoomChange = useCallback((newZoom) => {
    requestAnimationFrame(() => {
      setZoom(Math.max(25, Math.min(200, newZoom)));
    });
  }, []);
  
  // Memory-efficient file processing
  const processFile = useCallback(async () => {
    if (!file || processingRef.current) return;
    
    processingRef.current = true;
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();
    
    try {
      setLoadingProgress(10);
      
      // Use Web Worker for file processing if available
      if (typeof Worker !== 'undefined' && window.Worker) {
        const worker = new Worker('/js/excelWorker.js');
        
        worker.postMessage({ file, signal: abortControllerRef.current.signal });
        
        worker.onmessage = (e) => {
          const { type, data, progress } = e.data;
          
          switch (type) {
            case 'progress':
              setLoadingProgress(progress);
              break;
            case 'worksheets':
              setWorksheets(data);
              setLoadingProgress(50);
              break;
            case 'sheetData':
              setSheetData(data);
              setLoadingProgress(100);
              setLoading(false);
              if (onSuccess) onSuccess(data);
              break;
            case 'error':
              throw new Error(data);
            default:
              break;
          }
        };
        
        worker.onerror = (error) => {
          throw new Error(`Worker error: ${error.message}`);
        };
        
        // Cleanup worker after 30 seconds
        setTimeout(() => {
          if (worker) worker.terminate();
        }, 30000);
        
      } else {
        // Fallback to main thread processing
        await processFileInMainThread();
      }
      
    } catch (error) {
      console.error('Excel processing error:', error);
      setError(error);
      setLoading(false);
      if (onError) onError(error);
    } finally {
      processingRef.current = false;
    }
  }, [file, onSuccess, onError]);
  
  // Fallback file processing in main thread
  const processFileInMainThread = useCallback(async () => {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    setLoadingProgress(20);
    
    if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
    } else {
      await workbook.xlsx.readFile(file);
    }
    
    setLoadingProgress(40);
    
    const sheets = workbook.worksheets.map(ws => ({
      name: ws.name,
      id: ws.id,
      rowCount: Math.min(ws.rowCount, maxRows),
      columnCount: Math.min(ws.columnCount, maxCols)
    }));
    
    setWorksheets(sheets);
    setLoadingProgress(60);
    
    // Process first sheet
    if (sheets.length > 0) {
      const worksheet = workbook.worksheets[0];
      const cells = {};
      
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > maxRows) return;
        
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          if (colNumber > maxCols) return;
          
          cells[`${rowNumber - 1}_${colNumber - 1}`] = {
            value: cell.value,
            type: cell.type,
            style: cell.style,
            formula: cell.formula
          };
        });
      });
      
      setSheetData({
        cells,
        rowCount: Math.min(worksheet.rowCount, maxRows),
        colCount: Math.min(worksheet.columnCount, maxCols),
        name: worksheet.name
      });
    }
    
    setLoadingProgress(100);
    setLoading(false);
  }, [maxRows, maxCols]);
  
  // Effect to process file when it changes
  useEffect(() => {
    if (file) {
      processFile();
    }
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [file, processFile]);
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;
    
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomChange(zoom + 10);
            break;
          case '-':
            e.preventDefault();
            handleZoomChange(zoom - 10);
            break;
          case '0':
            e.preventDefault();
            handleZoomChange(100);
            break;
          case 'f':
            e.preventDefault();
            setIsFullScreen(!isFullScreen);
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, zoom, handleZoomChange, isFullScreen]);
  
  // Loading state
  if (loading) {
    return (
      <div className="w-full" style={{ height }}>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="text-lg font-semibold text-gray-900">Loading {title}</div>
            <div className="text-sm text-gray-600 mt-2">Processing Excel file...</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            {loadingProgress}% complete
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <ExcelErrorFallback 
        error={error} 
        resetErrorBoundary={() => {
          setError(null);
          processFile();
        }} 
      />
    );
  }
  
  return (
    <ErrorBoundary 
      FallbackComponent={ExcelErrorFallback}
      onError={(error) => {
        console.error('ExcelViewer Error:', error);
        if (onError) onError(error);
      }}
    >
      <div 
        ref={containerRef}
        className={`excel-viewer-container ${isFullScreen ? 'fixed inset-0 z-50' : 'relative'}`}
        style={{ height: isFullScreen ? '100vh' : height }}
      >
        <div className="h-full bg-white border border-gray-200 rounded-lg flex flex-col">
          <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse" />}>
            <ExcelToolbar
              title={title}
              zoom={zoom}
              onZoomChange={handleZoomChange}
              isFullScreen={isFullScreen}
              onFullScreenToggle={() => setIsFullScreen(!isFullScreen)}
              onPrint={showPrintButton ? () => window.print() : undefined}
              worksheetName={sheetData?.name}
            />
          </Suspense>
          
          <div className="flex-1 flex flex-col min-h-0">
            <Suspense fallback={<div className="h-8 bg-gray-50 animate-pulse" />}>
              <ExcelSheetTabs
                worksheets={worksheets}
                activeSheet={activeSheet}
                onSheetChange={handleSheetChange}
              />
            </Suspense>
            
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<ExcelLoadingSkeleton />}>
                <ExcelSheet
                  data={processedSheetData}
                  zoom={zoom}
                  selectedCell={selectedCell}
                  onCellSelect={setSelectedCell}
                  viewport={viewport}
                  onViewportChange={updateViewport}
                  darkMode={darkMode}
                />
              </Suspense>
            </div>
          </div>
          
          {/* Performance metrics in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-2 border-t border-gray-200 flex justify-between">
              <span>Render: {performanceMetrics.renderTime}ms</span>
              {performanceMetrics.memoryUsage > 0 && (
                <span>Memory: {Math.round(performanceMetrics.memoryUsage / 1024 / 1024)}MB</span>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
});

OptimizedExcelViewer.displayName = 'OptimizedExcelViewer';

export default OptimizedExcelViewer;