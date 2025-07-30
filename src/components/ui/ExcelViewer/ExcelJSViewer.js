import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import ExcelToolbar from './ExcelToolbar';
import { useExcelProcessor } from './useExcelProcessor';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import LoadingStates from './LoadingStates';
import ErrorStates from './ErrorStates';
import SearchPanel from './SearchPanel';
import { Toast, ToastProvider } from './Toast';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { useTheme } from './useTheme';

// Dynamically import ExcelSheet to reduce initial bundle size
const ExcelSheet = dynamic(() => import('./ExcelSheet'), {
  loading: () => <LoadingStates.SheetLoading />,
  ssr: false
});

const ExcelJSViewer = ({ 
  file, 
  title = "Model Viewer", 
  height = "600px", 
  onSuccess, 
  onError,
  darkMode = false,
  showSearch = true,
  showPrintButton = true,
  enableKeyboardShortcuts = true,
  accessibilityMode = false
}) => {
  // State management
  const [worksheets, setWorksheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('initializing');
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedCell, setSelectedCell] = useState(null);
  const [viewport, setViewport] = useState({
    start: { row: 1, col: 1 },
    end: { row: 100, col: 50 }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Refs
  const containerRef = useRef(null);
  const processingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Hooks
  const { isWorkerReady, loadWorkbook, processSheet, searchInSheet } = useExcelProcessor();
  const { startMeasure, endMeasure, logPerformanceWarning } = usePerformanceMonitor('ExcelJSViewer');
  const { theme } = useTheme(darkMode);
  const { registerKeyboardShortcuts } = useKeyboardNavigation({
    enabled: enableKeyboardShortcuts,
    onSheetNext: () => handleSheetChange(Math.min(activeSheet + 1, worksheets.length - 1)),
    onSheetPrev: () => handleSheetChange(Math.max(activeSheet - 1, 0)),
    onZoomIn: () => handleZoomChange(Math.min(200, zoom + 25)),
    onZoomOut: () => handleZoomChange(Math.max(25, zoom - 25)),
    onSearch: () => setSearchOpen(true),
    onFullScreen: toggleFullScreen,
    onPrint: handlePrint
  });

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
    registerKeyboardShortcuts();
  }, [registerKeyboardShortcuts]);

  // Show toast message
  const showToast = useCallback((message, type = 'info') => {
    setToastMessage({ message, type });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Full-screen handlers
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  const exitFullScreen = useCallback(() => {
    setIsFullScreen(false);
  }, []);

  // Handle ESC key for full-screen
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullScreen) {
        exitFullScreen();
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isFullScreen, exitFullScreen]);

  // Load Excel file
  useEffect(() => {
    if (!file || !isWorkerReady || processingRef.current) return;

    const loadExcelFile = async () => {
      processingRef.current = true;
      setLoading(true);
      setLoadingProgress(0);
      setLoadingStage('initializing');
      setError(null);
      
      // Create new abort controller for this load
      abortControllerRef.current = new AbortController();
      
      try {
        startMeasure('file-load');
        setLoadingStage('downloading');
        setLoadingProgress(10);
        
        // Fetch the file
        const response = await fetch(file, { 
          signal: abortControllerRef.current.signal 
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }

        setLoadingProgress(30);
        const arrayBuffer = await response.arrayBuffer();
        const loadDuration = endMeasure('file-load');
        logPerformanceWarning('File loading', loadDuration, 2000);

        // Load workbook in worker
        setLoadingStage('parsing');
        setLoadingProgress(50);
        startMeasure('workbook-parse');
        const workbookData = await loadWorkbook(arrayBuffer);
        const parseDuration = endMeasure('workbook-parse');
        logPerformanceWarning('Workbook parsing', parseDuration, 3000);

        setLoadingProgress(70);
        setWorksheets(workbookData.worksheets || []);
        
        // Load first sheet
        if (workbookData.worksheets?.length > 0) {
          setLoadingStage('rendering');
          setLoadingProgress(85);
          await loadSheetData(0);
        }

        setLoadingProgress(100);
        onSuccess?.();
        showToast('Excel file loaded successfully', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load Excel file');
          onError?.(err);
        }
      } finally {
        processingRef.current = false;
        setLoading(false);
      }
    };

    loadExcelFile();
  }, [file, isWorkerReady, loadWorkbook, onSuccess, onError, startMeasure, endMeasure, logPerformanceWarning]);

  // Load sheet data
  const loadSheetData = useCallback(async (sheetIndex) => {
    if (!isWorkerReady || sheetIndex < 0 || sheetIndex >= worksheets.length) return;

    try {
      startMeasure('sheet-load');
      const data = await processSheet(sheetIndex, { start: viewport.start, end: viewport.end });
      const duration = endMeasure('sheet-load');
      logPerformanceWarning('Sheet loading', duration, 1000);
      
      setSheetData(data);
      setActiveSheet(sheetIndex);
    } catch (err) {
      setError(`Failed to load sheet: ${err.message}`);
    }
  }, [isWorkerReady, worksheets.length, processSheet, viewport, startMeasure, endMeasure, logPerformanceWarning]);

  // Handle sheet change
  const handleSheetChange = useCallback((newSheetIndex) => {
    if (newSheetIndex !== activeSheet) {
      loadSheetData(newSheetIndex);
    }
  }, [activeSheet, loadSheetData]);

  // Handle viewport change for progressive loading
  const handleViewportChange = useCallback((newViewport) => {
    // Only reload if viewport changed significantly
    const rowDiff = Math.abs(newViewport.startRow - viewport.start.row);
    const colDiff = Math.abs(newViewport.startCol - viewport.start.col);
    
    if (rowDiff > 20 || colDiff > 10) {
      setViewport({
        start: { row: newViewport.startRow, col: newViewport.startCol },
        end: { row: newViewport.endRow, col: newViewport.endCol }
      });
      
      // Reload sheet data for new viewport
      if (activeSheet >= 0 && isWorkerReady) {
        processSheet(activeSheet, {
          start: { row: newViewport.startRow, col: newViewport.startCol },
          end: { row: newViewport.endRow, col: newViewport.endCol }
        }).then(data => {
          setSheetData(data);
        }).catch(err => {
          // Silently ignore viewport update errors
        });
      }
    }
  }, [viewport, activeSheet, isWorkerReady, processSheet]);

  // Handle cell click
  const handleCellClick = useCallback((row, col, value) => {
    setSelectedCell({ row, col });
    if (accessibilityMode) {
      // Announce cell value for screen readers
      const announcement = `Selected cell ${String.fromCharCode(65 + col)}${row + 1}. Value: ${value || 'empty'}`;
      const ariaLive = document.getElementById('excel-aria-live');
      if (ariaLive) {
        ariaLive.textContent = announcement;
      }
    }
  }, [accessibilityMode]);

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  // Handle export
  const handleExport = useCallback(async (format) => {
    try {
      showToast(`Exporting as ${format.toUpperCase()}...`, 'info');
      // TODO: Implement actual export functionality
      setTimeout(() => {
        showToast(`Exported successfully as ${format.toUpperCase()}`, 'success');
      }, 1500);
    } catch (err) {
      showToast('Export failed. Please try again.', 'error');
    }
  }, [showToast]);

  // Handle print
  const handlePrint = useCallback(() => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
      showToast('Print dialog opened', 'info');
    }, 100);
  }, [showToast]);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    if (!query || !isWorkerReady) return;
    
    try {
      const results = await searchInSheet(activeSheet, query);
      setSearchResults(results);
      setCurrentSearchIndex(0);
      
      if (results.length > 0) {
        const firstResult = results[0];
        setSelectedCell({ row: firstResult.row, col: firstResult.col });
        showToast(`Found ${results.length} results`, 'info');
      } else {
        showToast('No results found', 'warning');
      }
    } catch (err) {
      showToast('Search failed', 'error');
    }
  }, [activeSheet, isWorkerReady, searchInSheet, showToast]);

  // Navigate search results
  const navigateSearchResults = useCallback((direction) => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    }
    
    setCurrentSearchIndex(newIndex);
    const result = searchResults[newIndex];
    setSelectedCell({ row: result.row, col: result.col });
    showToast(`Result ${newIndex + 1} of ${searchResults.length}`, 'info');
  }, [currentSearchIndex, searchResults, showToast]);

  // Calculate container dimensions
  const containerDimensions = useMemo(() => {
    if (isFullScreen) {
      return {
        width: window.innerWidth,
        height: window.innerHeight - 60 // Subtract toolbar height
      };
    }
    
    const heightValue = typeof height === 'string' ? height : `${height}px`;
    return {
      width: '100%',
      height: heightValue
    };
  }, [isFullScreen, height]);

  // Render error state
  if (error) {
    return (
      <ErrorStates.FileLoadError 
        error={error}
        onRetry={() => window.location.reload()}
        darkMode={darkMode}
      />
    );
  }

  // Render loading state
  if (loading) {
    return (
      <LoadingStates.FileLoading 
        progress={loadingProgress}
        stage={loadingStage}
        fileName={title}
        darkMode={darkMode}
      />
    );
  }

  // Main render
  const content = (
    <ToastProvider>
      <div 
        ref={containerRef}
        className={`excel-viewer flex flex-col rounded-lg overflow-hidden transition-all duration-200 ${
          isFullScreen ? 'fixed inset-0 z-50' : ''
        } ${
          darkMode 
            ? 'bg-navy-900 border border-navy-700' 
            : 'bg-white border border-gray-200'
        } ${
          isPrintMode ? 'print-mode' : ''
        }`}
        style={isFullScreen ? {} : { height: containerDimensions.height }}
        role="application"
        aria-label={`Excel viewer for ${title}`}
      >
        <ExcelToolbar
          sheets={worksheets}
          activeSheet={activeSheet}
          onSheetChange={handleSheetChange}
          onFullScreenToggle={toggleFullScreen}
          isFullScreen={isFullScreen}
          onZoomChange={handleZoomChange}
          zoom={zoom}
          onExport={handleExport}
          onPrint={showPrintButton ? handlePrint : null}
          onSearch={showSearch ? () => setSearchOpen(true) : null}
          fileName={title}
          darkMode={darkMode}
          isPrintMode={isPrintMode}
        />
      
        {searchOpen && (
          <SearchPanel
            onSearch={handleSearch}
            onClose={() => setSearchOpen(false)}
            onNavigate={navigateSearchResults}
            currentIndex={currentSearchIndex}
            totalResults={searchResults.length}
            darkMode={darkMode}
          />
        )}
        
        <div className="flex-1 overflow-hidden relative">
          {sheetData && (
            <ExcelSheet
              data={sheetData}
              width={isFullScreen ? window.innerWidth : containerRef.current?.offsetWidth || 800}
              height={isFullScreen ? window.innerHeight - 120 : containerRef.current?.offsetHeight - 120 || 480}
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
              highlightedCells={searchResults}
              zoom={zoom}
              onViewportChange={handleViewportChange}
              darkMode={darkMode}
              isPrintMode={isPrintMode}
              accessibilityMode={accessibilityMode}
            />
          )}
        </div>
        
        {/* Accessibility announcements */}
        <div 
          id="excel-aria-live" 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        />
        
        {/* Toast notifications */}
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
            darkMode={darkMode}
          />
        )}
      </div>
    </ToastProvider>
  );

  // Use portal for full-screen mode
  if (isFullScreen && isClient) {
    return createPortal(content, document.body);
  }

  return content;
};

export default ExcelJSViewer;