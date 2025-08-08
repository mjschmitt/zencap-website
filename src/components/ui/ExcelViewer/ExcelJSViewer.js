import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import ExcelToolbar from './ExcelToolbar';
import ExcelSheetTabs from './ExcelSheetTabs';
import { useExcelProcessor } from './useExcelProcessor';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import LoadingStates from './LoadingStates';
import ErrorStates from './ErrorStates';
import SearchPanel from './SearchPanel';
import { Toast, ToastProvider } from './Toast';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { useTheme } from './useTheme';
import { retryFetch, retryWorker } from '../../../utils/retry';
import styles from '../../../styles/ExcelViewer.module.css';
import { PRODUCTION_CONFIG } from '../../../config/production';
import { useMemoryMonitor } from '../../../utils/memoryMonitor';
import { captureError, captureMessage } from '../../../utils/errorTracking';

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
  accessibilityMode = false,
  debugMode = false
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
  const [isTransitioningFullscreen, setIsTransitioningFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedCell, setSelectedCell] = useState(null);
  const [viewport, setViewport] = useState({
    start: { row: 0, col: 0 },  // Fixed: Excel uses 0-based indexing internally
    end: { row: 1000, col: 200 }  // Load more data upfront
  });
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [sheetDimensions, setSheetDimensions] = useState({ width: 800, height: 480 });
  const [showGridLines, setShowGridLines] = useState(true); // Default to true, will be updated from Excel

  // Refs
  const containerRef = useRef(null);
  const sheetContainerRef = useRef(null);
  const processingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const loadedFileRef = useRef(null);
  const gridRef = useRef(null);

  // Show toast message
  const showToast = useCallback((message, type = 'info') => {
    setToastMessage({ message, type });
  }, []);

  const handleSheetChange = useCallback((index) => {
    if (index >= 0 && index < worksheets.length && index !== activeSheet && !processingRef.current) {
      console.log(`Switching from sheet ${activeSheet} to ${index}`);
      // Clear current sheet data to prevent rendering issues
      setSheetData(null);
      setSelectedCell(null);
      setSearchResults([]);
      setIsInitialLoadComplete(false); // Reset for new sheet
      // Set new active sheet - this will trigger data loading via useEffect
      setActiveSheet(index);
      setViewport({
        start: { row: 0, col: 0 },  // Fixed: Excel uses 0-based indexing internally
        end: { row: 1000, col: 200 }
      });
    }
  }, [activeSheet, worksheets.length]);

  const handleZoomChange = useCallback((newZoom) => {
    console.log('[ExcelJSViewer] Zoom change requested:', newZoom);
    setZoom(newZoom);
  }, []);

  // Hooks
  const { isWorkerReady, loadWorkbook, processSheet, searchInSheet } = useExcelProcessor();
  const { startMeasure, endMeasure, logPerformanceWarning } = usePerformanceMonitor('ExcelJSViewer');
  const { theme } = useTheme(darkMode);
  const { memoryInfo, isWarning, isCritical } = useMemoryMonitor();
  
  // CRITICAL FIX: Memory monitoring and alerts
  useEffect(() => {
    if (isCritical) {
      showToast('Critical memory usage detected. Performance may be affected. Consider closing other browser tabs.', 'error');
    } else if (isWarning) {
      showToast('High memory usage detected. Performance may be affected.', 'warning');
    }
  }, [isCritical, isWarning, showToast]);

  // Handle print - defined after showToast
  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsPrintMode(true);
      setTimeout(() => {
        window.print();
        setIsPrintMode(false);
        showToast('Print dialog opened', 'info');
      }, 100);
    }
  }, [showToast]);

  // Fullscreen implementation with memory optimization
  const enterFullScreen = useCallback(async () => {
    if (!containerRef.current || processingRef.current) return;
    
    // Prevent re-entry while processing
    processingRef.current = true;
    setIsTransitioningFullscreen(true);
    
    const element = containerRef.current;
    try {
      // Show loading state during transition
      showToast('Entering fullscreen mode...', 'info');
      
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullScreen(true);
      
      // Don't change viewport or reload data - just enter fullscreen
      // The existing data and viewport should work fine
      
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      // Fallback to CSS fullscreen
      setIsFullScreen(true);
    } finally {
      // Delay clearing transition state to allow render to stabilize
      setTimeout(() => {
        setIsTransitioningFullscreen(false);
        processingRef.current = false;
      }, 300);
    }
  }, [showToast]);

  const exitFullScreenMode = useCallback(() => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(false);
  }, []);

  // Define fullscreen toggle handlers
  const toggleFullScreen = useCallback(() => {
    if (isFullScreen) {
      exitFullScreenMode();
    } else {
      enterFullScreen();
    }
  }, [isFullScreen, enterFullScreen, exitFullScreenMode]);

  const exitFullScreen = useCallback(() => {
    exitFullScreenMode();
  }, [exitFullScreenMode]);

  // Track sheet container dimensions with debouncing
  useEffect(() => {
    if (!sheetContainerRef.current) return;

    let timeoutId;
    const updateDimensions = () => {
      // Skip updates during fullscreen transition
      if (isTransitioningFullscreen) return;
      
      // Clear any pending updates
      clearTimeout(timeoutId);
      
      // Debounce dimension updates to prevent rapid re-renders
      timeoutId = setTimeout(() => {
        if (sheetContainerRef.current && !isTransitioningFullscreen) {
          const rect = sheetContainerRef.current.getBoundingClientRect();
          // Validate dimensions to prevent crashes
          const width = rect.width > 0 ? rect.width : 800;
          const height = rect.height > 0 ? rect.height : 480;
          
          // Ensure minimum dimensions
          setSheetDimensions({
            width: Math.max(200, width),
            height: Math.max(200, height)
          });
        }
      }, 150); // Slightly longer delay for stability
    };

    // Initial measurement after short delay
    const initialTimer = setTimeout(updateDimensions, 50);

    // Create ResizeObserver with compatibility check
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && sheetContainerRef.current) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(sheetContainerRef.current);
    }

    // Also listen to window resize as backup
    window.addEventListener('resize', updateDimensions);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [sheetData, isTransitioningFullscreen]); // Re-run when sheet data or transition state changes

  // Handle memory warnings with debouncing to prevent repeated toasts
  const memoryWarningShownRef = useRef(false);
  const criticalWarningShownRef = useRef(false);
  
  useEffect(() => {
    if (isCritical && !criticalWarningShownRef.current) {
      showToast('Critical memory usage detected. Please refresh the page.', 'error');
      captureMessage('Critical memory usage in Excel viewer', 'error', {
        memoryInfo,
        fileSize: file?.size,
        activeSheet
      });
      criticalWarningShownRef.current = true;
      memoryWarningShownRef.current = true; // Also mark regular warning as shown
    } else if (isWarning && !isCritical && !memoryWarningShownRef.current) {
      showToast('High memory usage detected. Performance may be affected.', 'warning');
      memoryWarningShownRef.current = true;
    }
    
    // Reset flags when warnings are cleared
    if (!isWarning && !isCritical) {
      memoryWarningShownRef.current = false;
      criticalWarningShownRef.current = false;
    }
  }, [isWarning, isCritical, memoryInfo, file, activeSheet, showToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[ExcelJSViewer] Component unmounting, cleaning up...');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      processingRef.current = false;
      loadedFileRef.current = null;
    };
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
    // Check if file is already loaded or being processed
    if (!file || processingRef.current || loadedFileRef.current === file) {
      return;
    }
    
    // Wait for worker to be ready
    if (!isWorkerReady) {
      console.log('[ExcelJSViewer] Waiting for worker to be ready...');
      setLoadingStage('waiting for worker');
      return;
    }

    const loadExcelFile = async () => {
      processingRef.current = true;
      loadedFileRef.current = file; // Mark this file as being loaded
      console.log('[ExcelJSViewer] Starting Excel file load...');
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
        
        // Fetch the file with retry logic
        const response = await retryFetch(file, { 
          signal: abortControllerRef.current.signal,
          timeout: PRODUCTION_CONFIG.upload.timeout
        }, {
          maxAttempts: PRODUCTION_CONFIG.upload.maxRetries,
          initialDelay: PRODUCTION_CONFIG.upload.retryDelay,
          backoffFactor: PRODUCTION_CONFIG.upload.backoffMultiplier,
          onRetry: ({ attempt, retriesLeft }) => {
            showToast(`Retrying file download... (${retriesLeft} attempts left)`, 'warning');
            setLoadingStage(`retrying (attempt ${attempt})`);
          }
        });

        setLoadingProgress(30);
        const arrayBuffer = await response.arrayBuffer();
        
        // CRITICAL FIX: File size validation to prevent browser crashes
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit
        if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
          throw new Error(`File size (${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 100MB. Please use a smaller file or contact support for assistance with large models.`);
        }
        
        // Log file size for monitoring
        console.log(`[ExcelJSViewer] File size: ${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB`);
        const loadDuration = endMeasure('file-load');
        logPerformanceWarning('File loading', loadDuration, 2000);

        // Load workbook in worker with retry
        setLoadingStage('parsing');
        setLoadingProgress(50);
        console.log('Starting workbook parse...');
        startMeasure('workbook-parse');
        
        const workbookData = await retryWorker(
          async (attempt) => {
            console.log(`Loading workbook (attempt ${attempt})...`);
            return await loadWorkbook(arrayBuffer);
          },
          {
            maxAttempts: PRODUCTION_CONFIG.retry.processing.maxAttempts,
            initialDelay: PRODUCTION_CONFIG.retry.processing.initialDelay,
            backoffFactor: PRODUCTION_CONFIG.retry.processing.backoffFactor,
            onRetry: ({ attempt, retriesLeft }) => {
              showToast(`Retrying Excel parsing... (${retriesLeft} attempts left)`, 'warning');
              setLoadingStage(`retrying parse (attempt ${attempt})`);
            }
          }
        );
        
        console.log('Workbook data received:', workbookData);
        const parseDuration = endMeasure('workbook-parse');
        logPerformanceWarning('Workbook parsing', parseDuration, 3000);

        setLoadingProgress(70);
        
        // Store all worksheets data including hidden ones
        const allWorksheetsData = workbookData.worksheets || [];
        
        // Filter out hidden worksheets for display
        const visibleWorksheets = allWorksheetsData.filter(sheet => 
          sheet.state !== 'hidden' && sheet.state !== 'veryHidden' && !sheet.isHidden
        );
        
        console.log(`Total sheets: ${allWorksheetsData.length}, Visible sheets: ${visibleWorksheets.length}`);
        console.log('Visible sheets:', visibleWorksheets.map(s => ({ name: s.name, index: s.originalIndex })));
        
        // Store both for reference
        setWorksheets(visibleWorksheets);
        self.allWorksheets = allWorksheetsData; // Store all sheets for worker reference
        
        // Load first visible sheet
        if (visibleWorksheets.length > 0) {
          setLoadingStage('rendering');
          setLoadingProgress(85);
          console.log('Loading first visible sheet...');
          // Set activeSheet to 0 to trigger the loading
          setActiveSheet(0);
          console.log('Set activeSheet to 0 for initial load');
        } else {
          console.warn('No visible worksheets found in workbook');
        }

        setLoadingProgress(100);
        onSuccess?.();
        showToast('Excel file loaded successfully', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[ExcelJSViewer] Error loading Excel file:', err);
          setError(err.message || 'Failed to load Excel file');
          onError?.(err);
          
          // Reset loaded file ref on error
          loadedFileRef.current = null;
          
          // Track error in production
          captureError(err, {
            component: 'ExcelJSViewer',
            action: 'loadExcelFile',
            fileUrl: file,
            stage: loadingStage,
            progress: loadingProgress
          });
        } else {
          console.log('[ExcelJSViewer] File load aborted');
          loadedFileRef.current = null;
        }
      } finally {
        processingRef.current = false;
        setLoading(false);
      }
    };

    loadExcelFile();
  }, [file, isWorkerReady, loadWorkbook, onSuccess, onError, startMeasure, endMeasure, logPerformanceWarning, showToast]);

  // Load sheet data
  const loadSheetData = useCallback(async (sheetIndex) => {
    // Check worker readiness first
    if (!isWorkerReady) {
      console.warn('Cannot load sheet: worker not ready');
      return;
    }
    
    // For initial load, worksheets might not be in state yet
    // This is handled by the calling code passing valid indices
    if (sheetIndex < 0) {
      console.warn('Cannot load sheet: invalid index', sheetIndex);
      return;
    }

    try {
      // Get the actual worksheet index from the visible worksheet
      const worksheet = worksheets[sheetIndex];
      if (!worksheet) {
        console.warn(`Worksheet at index ${sheetIndex} not found`);
        return;
      }
      
      const actualIndex = worksheet.originalIndex;
      console.log(`Loading sheet ${sheetIndex} (actual worksheet index: ${actualIndex})...`);
      startMeasure('sheet-load');
      const data = await processSheet(actualIndex, { start: viewport.start, end: viewport.end });
      const duration = endMeasure('sheet-load');
      logPerformanceWarning('Sheet loading', duration, 1000);
      
      console.log(`Sheet ${sheetIndex} data loaded:`, {
        cellCount: data?.cells?.length || 0,
        hasData: !!data
      });
      
      // Debug mode: Log style information
      if (debugMode && data?.cells) {
        const cellsWithStyles = data.cells.filter(c => c.style && Object.keys(c.style).length > 0);
        console.log('[Debug] Style analysis:', {
          totalCells: data.cells.length,
          cellsWithStyles: cellsWithStyles.length,
          sampleStyles: cellsWithStyles.slice(0, 5).map(c => ({
            position: `R${c.row}C${c.col}`,
            value: c.value,
            style: c.style
          }))
        });
      }
      
      setSheetData(data);
      // Update gridlines setting from Excel file (if provided)
      if (data.showGridLines !== undefined) {
        setShowGridLines(data.showGridLines);
      }
      setIsInitialLoadComplete(true);
      // Don't set activeSheet here as it's already set by handleSheetChange
    } catch (err) {
      console.error(`Failed to load sheet ${sheetIndex}:`, err);
      setError(`Failed to load sheet: ${err.message}`);
      showToast(`Failed to load sheet: ${err.message}`, 'error');
    }
  }, [isWorkerReady, processSheet, viewport, startMeasure, endMeasure, logPerformanceWarning, showToast, debugMode, worksheets]);

  // Update activeSheet to trigger sheet data loading
  useEffect(() => {
    if (activeSheet >= 0 && worksheets.length > 0 && !processingRef.current) {
      console.log(`[ExcelJSViewer] Loading sheet data for activeSheet ${activeSheet}`);
      loadSheetData(activeSheet);
    }
  }, [activeSheet, loadSheetData, worksheets.length]);

  // Debounce timer ref for viewport changes
  const viewportDebounceRef = useRef(null);
  const lastLoadedViewport = useRef(null);
  
  // Handle viewport change for progressive loading with fullscreen optimization
  const handleViewportChange = useCallback((newViewport) => {
    // Skip if this is the same viewport we just loaded
    if (lastLoadedViewport.current &&
        lastLoadedViewport.current.startRow === newViewport.startRow &&
        lastLoadedViewport.current.endRow === newViewport.endRow &&
        lastLoadedViewport.current.startCol === newViewport.startCol &&
        lastLoadedViewport.current.endCol === newViewport.endCol) {
      return;
    }
    
    // Clear any pending viewport update
    if (viewportDebounceRef.current) {
      clearTimeout(viewportDebounceRef.current);
    }
    
    // Debounce viewport changes to prevent rapid reloading
    viewportDebounceRef.current = setTimeout(() => {
      // Only reload if we're going outside the already loaded data range
      const needsReload = !isInitialLoadComplete || 
                         newViewport.endRow > viewport.end.row || 
                         newViewport.endCol > viewport.end.col ||
                         newViewport.startRow < viewport.start.row ||
                         newViewport.startCol < viewport.start.col;
      
      if (needsReload && !processingRef.current) {
        processingRef.current = true;
        
        // Adjust buffer size based on memory status
        // Use adaptive buffers based on memory warnings
        const bufferRows = isCritical ? 30 : (isWarning ? 50 : 100);
        const bufferCols = isCritical ? 15 : (isWarning ? 20 : 30);
        
        const newStart = {
          row: Math.max(0, newViewport.startRow - bufferRows),  // Fixed: Excel uses 0-based indexing internally
          col: Math.max(0, newViewport.startCol - bufferCols)  // Fixed: Excel uses 0-based indexing internally
        };
        const newEnd = {
          row: newViewport.endRow + bufferRows,
          col: newViewport.endCol + bufferCols
        };
        
        // Track this viewport to avoid duplicate loads
        lastLoadedViewport.current = {
          startRow: newViewport.startRow,
          endRow: newViewport.endRow,
          startCol: newViewport.startCol,
          endCol: newViewport.endCol
        };
        
        setViewport({
          start: newStart,
          end: newEnd
        });
        
        // Reload sheet data for new expanded viewport
        if (activeSheet >= 0 && isWorkerReady && worksheets[activeSheet]) {
          const actualIndex = worksheets[activeSheet].originalIndex;
          console.log(`Loading expanded viewport: rows ${newStart.row}-${newEnd.row}, cols ${newStart.col}-${newEnd.col}`);
          
          processSheet(actualIndex, {
            start: newStart,
            end: newEnd
          }).then(data => {
            setSheetData(data);
            // Update gridlines setting from Excel file (if provided)
            if (data.showGridLines !== undefined) {
              setShowGridLines(data.showGridLines);
            }
            setIsInitialLoadComplete(true);
          }).catch(err => {
            console.error('Failed to load viewport data:', err);
          }).finally(() => {
            processingRef.current = false;
          });
        } else {
          processingRef.current = false;
        }
      }
    }, 300); // Slightly longer debounce for stability
  }, [viewport, activeSheet, isWorkerReady, processSheet, worksheets, isInitialLoadComplete, isCritical, isWarning]);

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

  // Handle cell navigation with keyboard
  const handleCellNavigation = useCallback((direction) => {
    if (!sheetData) return;

    // If no cell is selected, start from the first cell
    const currentRow = selectedCell?.row || 0;  // Fixed: Excel uses 0-based indexing internally
    const currentCol = selectedCell?.col || 0;  // Fixed: Excel uses 0-based indexing internally

    let newRow = currentRow;
    let newCol = currentCol;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow - 1);  // Fixed: Excel uses 0-based indexing internally
        break;
      case 'down':
        newRow = currentRow + 1;
        break;
      case 'left':
        newCol = Math.max(0, currentCol - 1);  // Fixed: Excel uses 0-based indexing internally
        break;
      case 'right':
        newCol = currentCol + 1;
        break;
      case 'start':
        newRow = 0;  // Fixed: Excel uses 0-based indexing internally
        newCol = 0;  // Fixed: Excel uses 0-based indexing internally
        break;
      case 'end':
        // Find the last cell with data
        if (sheetData.cells && sheetData.cells.length > 0) {
          const maxRow = Math.max(...sheetData.cells.map(c => c.row));
          const maxCol = Math.max(...sheetData.cells.map(c => c.col));
          newRow = maxRow;
          newCol = maxCol;
        }
        break;
      case 'pageUp':
        newRow = Math.max(0, currentRow - 20);  // Fixed: Excel uses 0-based indexing internally
        break;
      case 'pageDown':
        newRow = currentRow + 20;
        break;
    }

    // Update selected cell
    setSelectedCell({ row: newRow, col: newCol });

    // Scroll to the new cell if it's not visible
    if (gridRef.current && gridRef.current.scrollToCell) {
      gridRef.current.scrollToCell(newRow, newCol);
    }
  }, [selectedCell, sheetData]);

  // Keyboard navigation hook - defined after all handlers
  const { registerKeyboardShortcuts } = useKeyboardNavigation({
    enabled: enableKeyboardShortcuts,
    onSheetNext: () => handleSheetChange(Math.min(activeSheet + 1, worksheets.length - 1)),
    onSheetPrev: () => handleSheetChange(Math.max(activeSheet - 1, 0)),
    onZoomIn: () => handleZoomChange(Math.min(200, zoom + 25)),
    onZoomOut: () => handleZoomChange(Math.max(25, zoom - 25)),
    onSearch: () => setSearchOpen(true),
    onFullScreen: toggleFullScreen,
    onPrint: handlePrint,
    onCellNavigation: handleCellNavigation
  });

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
    registerKeyboardShortcuts();
  }, [registerKeyboardShortcuts]);

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


  // Handle search
  const handleSearch = useCallback(async (query) => {
    if (!query || !isWorkerReady) return;
    
    try {
      // Use the actual worksheet index for search
      const actualIndex = worksheets[activeSheet]?.originalIndex || activeSheet;
      const results = await searchInSheet(actualIndex, query);
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
  }, [activeSheet, isWorkerReady, searchInSheet, showToast, worksheets]);

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

  // Container dimensions - simplified for reliability
  const containerDimensions = useMemo(() => {
    if (isFullScreen) {
      // In fullscreen, use viewport dimensions
      return {
        width: '100vw',
        height: '100vh'
      };
    }
    
    // Normal mode
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
        className={`${styles['excel-viewer']} excel-viewer flex flex-col rounded-lg overflow-hidden transition-all duration-200 ${
          isFullScreen ? 'fixed inset-0 z-50' : ''
        } ${
          darkMode 
            ? 'bg-navy-900 border border-navy-700' 
            : 'bg-white border border-gray-200'
        } ${
          isPrintMode ? 'print-mode' : ''
        }`}
        style={isFullScreen ? { width: '100vw', height: '100vh' } : { height: containerDimensions.height }}
        role="application"
        aria-label={`Excel viewer for ${title}`}
        data-dark={darkMode}
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
          showGridLines={showGridLines}
          onToggleGridLines={() => setShowGridLines(!showGridLines)}
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
        
        <div className="flex-1 overflow-hidden relative" ref={sheetContainerRef}>
          {!sheetData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4"></div>
                <p>Loading sheet data...</p>
              </div>
            </div>
          ) : (
            <ExcelSheet
              ref={gridRef}
              data={sheetData}
              width={sheetDimensions.width}
              height={sheetDimensions.height}
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
              highlightedCells={searchResults}
              zoom={zoom}
              onViewportChange={handleViewportChange}
              darkMode={darkMode}
              showGridLines={showGridLines}
              isPrintMode={isPrintMode}
              accessibilityMode={accessibilityMode}
              debugMode={debugMode}
            />
          )}
        </div>
        
        {/* Excel-style sheet tabs at bottom */}
        <ExcelSheetTabs
          sheets={worksheets}
          activeSheet={activeSheet}
          onSheetChange={handleSheetChange}
          darkMode={darkMode}
          isPrintMode={isPrintMode}
        />
        
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