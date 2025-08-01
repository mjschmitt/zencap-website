import React, { memo, useCallback, useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import ExcelCell from './ExcelCell';
import styles from '../../../styles/ExcelViewer.module.css';

const HEADER_HEIGHT = 25;
const ROW_NUMBER_WIDTH = 50;
// Excel column width units: 1 unit = width of one character in default font (Calibri 11pt)
// Excel default column width is 8.43 units (64 pixels)
// Better conversion: 1 Excel unit ≈ 8.0 pixels (more accurate for modern displays)
const DEFAULT_COLUMN_WIDTH = 67; // 8.43 units * 8.0 pixels/unit ≈ 67 pixels
const DEFAULT_ROW_HEIGHT = 20; // Excel default is 15 points = 20 pixels
const EXCEL_COLUMN_WIDTH_TO_PIXEL = 8.0; // More accurate conversion factor
const EXCEL_ROW_HEIGHT_TO_PIXEL = 1.333; // Excel stores row height in points, 1pt = 1.333px

const ExcelSheet = memo(forwardRef(({ 
  data = {},
  width = 800,
  height = 600,
  onCellClick,
  selectedCell,
  highlightedCells = [],
  zoom = 100,
  onViewportChange,
  darkMode = false,
  isPrintMode = false,
  accessibilityMode = false,
  debugMode = false,
  showGridLines = true
}, ref) => {
  const gridRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const [dimensionsReady, setDimensionsReady] = useState(false);
  const cellDataMap = useRef(new Map());

  // Zoom factor
  const zoomFactor = zoom / 100;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    scrollToCell: (row, col) => {
      if (gridRef.current) {
        gridRef.current.scrollToItem({
          columnIndex: col,
          rowIndex: row,
          align: 'auto' // 'auto' only scrolls if the item is not visible
        });
      }
    }
  }), []);

  // Process data into a Map for O(1) lookups
  useEffect(() => {
    const newMap = new Map();
    if (data.cells) {
      data.cells.forEach(cell => {
        const key = `${cell.row}-${cell.col}`;
        newMap.set(key, cell);
      });
    }
    cellDataMap.current = newMap;
    
    // Debug logging
    const cellsWithStyles = Array.from(newMap.values()).filter(cell => 
      cell.style && Object.keys(cell.style).length > 0
    );
    const cellsWithBackgroundOnly = Array.from(newMap.values()).filter(cell => 
      (!cell.value || cell.value === '') && cell.style?.fill
    );
    
    if (debugMode) {
      console.log('[ExcelSheet Debug] Cell data map updated:', {
        cellCount: data.cells?.length || 0,
        mapSize: newMap.size,
        cellsWithStyles: cellsWithStyles.length,
        cellsWithBackgroundOnly: cellsWithBackgroundOnly.length,
        sampleKeys: Array.from(newMap.keys()).slice(0, 5),
        sampleCellsWithStyles: cellsWithStyles.slice(0, 3).map(cell => ({
          key: `${cell.row}-${cell.col}`,
          value: cell.value,
          style: cell.style
        })),
        backgroundOnlyCells: cellsWithBackgroundOnly.map(cell => ({
          key: `${cell.row}-${cell.col}`,
          fill: cell.style.fill
        }))
      });
    } else {
      console.log('Cell data map updated:', {
        cellCount: data.cells?.length || 0,
        mapSize: newMap.size,
        cellsWithBackgroundOnly: cellsWithBackgroundOnly.length,
        sampleKeys: Array.from(newMap.keys()).slice(0, 5)
      });
    }
  }, [data.cells]);

  // Calculate column widths with zoom
  useEffect(() => {
    const widths = {};
    if (data.columnWidths) {
      Object.entries(data.columnWidths).forEach(([col, width]) => {
        // Excel width units to pixels using proper conversion factor
        // Excel width is in character units, convert to pixels
        // For very narrow columns (< 1 unit), use a smaller minimum to preserve proportions
        const minWidth = width < 1 ? 7 : 15; // Very narrow columns get 7px min, others 15px
        const calculatedWidth = width * EXCEL_COLUMN_WIDTH_TO_PIXEL * zoomFactor;
        widths[col] = Math.max(minWidth, Math.round(calculatedWidth));
      });
    }
    setColumnWidths(widths);
    
    // Always log column width info for debugging
    console.log('[ExcelSheet] Column widths:', {
      inputWidths: data.columnWidths,
      outputPixelWidths: widths,
      conversionFactor: EXCEL_COLUMN_WIDTH_TO_PIXEL,
      zoomFactor,
      sampleWidths: Object.entries(widths).slice(0, 5),
      allWidths: widths // Show all calculated widths
    });
    
    // Mark dimensions as ready once we have column widths
    if (Object.keys(widths).length > 0 || data.columnWidths) {
      setDimensionsReady(true);
    }
  }, [data.columnWidths, zoomFactor, debugMode]);

  // Calculate row heights with zoom
  useEffect(() => {
    const heights = {};
    if (data.rowHeights) {
      Object.entries(data.rowHeights).forEach(([row, height]) => {
        // Excel row height is in points, convert to pixels
        // Note: Excel might already convert to pixels in some cases
        // If height seems too large, it's already in pixels
        const pixelHeight = height > 100 ? height : height * EXCEL_ROW_HEIGHT_TO_PIXEL;
        heights[row] = Math.round(pixelHeight * zoomFactor);
      });
    }
    setRowHeights(heights);
    
    // Always log row height info for debugging
    console.log('[ExcelSheet] Row heights:', {
      inputHeights: data.rowHeights,
      outputPixelHeights: heights,
      conversionFactor: EXCEL_ROW_HEIGHT_TO_PIXEL,
      zoomFactor,
      sampleHeights: Object.entries(heights).slice(0, 5)
    });
  }, [data.rowHeights, zoomFactor, debugMode]);

  // Column width getter for react-window
  const getColumnWidth = useCallback((index) => {
    if (index === 0) return ROW_NUMBER_WIDTH * zoomFactor; // Row number column
    
    // Use specific column width if available, otherwise use default from Excel or fallback
    // Note: Some Excel files have defaultColWidth of 0, which we should ignore
    const defaultWidth = (data.defaultColWidth && data.defaultColWidth > 0)
      ? data.defaultColWidth * EXCEL_COLUMN_WIDTH_TO_PIXEL 
      : DEFAULT_COLUMN_WIDTH;
    
    const width = columnWidths[index] || defaultWidth * zoomFactor;
    
    // Log first few column widths for debugging with more detail (only in debug mode)
    if (debugMode && index <= 5 && index > 0) {
      console.log(`Column ${index} width: ${width}px (has custom: ${!!columnWidths[index]}, stored width: ${columnWidths[index]}, default: ${defaultWidth * zoomFactor})`);
    }
    
    return width;
  }, [columnWidths, zoomFactor, data.defaultColWidth]);

  // Row height getter for react-window
  const getRowHeight = useCallback((index) => {
    if (index === 0) return HEADER_HEIGHT * zoomFactor; // Header row
    
    // Use specific row height if available, otherwise use default from Excel or fallback
    // Excel's defaultRowHeight is already in points (15pt = 20px)
    const defaultHeight = (data.defaultRowHeight && data.defaultRowHeight > 0)
      ? data.defaultRowHeight * EXCEL_ROW_HEIGHT_TO_PIXEL 
      : DEFAULT_ROW_HEIGHT;
    
    return rowHeights[index] || defaultHeight * zoomFactor;
  }, [rowHeights, zoomFactor, data.defaultRowHeight]);

  // Get total dimensions
  const totalColumns = Math.max(50, ...Object.keys(columnWidths).map(Number), ...(data.cells?.map(c => c.col) || [])) + 1;
  const totalRows = Math.max(100, ...Object.keys(rowHeights).map(Number), ...(data.cells?.map(c => c.row) || [])) + 1;

  // Note: Removed auto-scroll on cell selection to prevent viewport jumping
  // Users can still navigate with keyboard or search which will scroll as needed

  // Debounce timer ref
  const scrollDebounceRef = useRef(null);
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);
  
  // Handle scroll to report viewport with debouncing
  const handleScroll = useCallback(({ scrollLeft, scrollTop }) => {
    if (onViewportChange && gridRef.current) {
      const visibleRange = {
        startRow: Math.floor(scrollTop / (DEFAULT_ROW_HEIGHT * zoomFactor)),
        endRow: Math.ceil((scrollTop + height) / (DEFAULT_ROW_HEIGHT * zoomFactor)),
        startCol: Math.floor(scrollLeft / (DEFAULT_COLUMN_WIDTH * zoomFactor)),
        endCol: Math.ceil((scrollLeft + width) / (DEFAULT_COLUMN_WIDTH * zoomFactor))
      };
      
      // Clear existing timeout
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
      
      // Debounce viewport changes to reduce lag
      scrollDebounceRef.current = setTimeout(() => {
        onViewportChange(visibleRange);
      }, 150); // 150ms debounce
    }
  }, [height, width, zoomFactor, onViewportChange]);

  // Cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    // Header row
    if (rowIndex === 0) {
      if (columnIndex === 0) {
        // Top-left corner cell
        return (
          <div 
          style={{
            ...style,
            borderRight: darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #9ca3af',
            borderBottom: darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #9ca3af',
            backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6',
            // Prevent sub-pixel gaps
            width: 'calc(100% + 1px)',
            height: 'calc(100% + 1px)',
            marginRight: '-1px',
            marginBottom: '-1px'
          }}
          className={`flex items-center justify-center font-medium text-xs ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          } ${isPrintMode ? 'print:bg-gray-100 print:border-gray-300 print:text-black' : ''}`}
        >
          #
        </div>
        );
      }
      // Column headers (A, B, C, etc.)
      return (
        <div 
          style={{
            ...style,
            borderRight: darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #9ca3af',
            borderBottom: darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #9ca3af',
            backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6',
            // Prevent sub-pixel gaps
            width: 'calc(100% + 1px)',
            height: 'calc(100% + 1px)',
            marginRight: '-1px',
            marginBottom: '-1px'
          }}
          className={`flex items-center justify-center font-medium text-xs ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          } ${isPrintMode ? 'print:bg-gray-100 print:border-gray-300 print:text-black' : ''}`}
        >
          {getColumnName(columnIndex)}
        </div>
      );
    }

    // Row numbers
    if (columnIndex === 0) {
      return (
        <div 
          style={{
            ...style,
            borderRight: darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #9ca3af',
            borderBottom: darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #9ca3af',
            backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6',
            // Prevent sub-pixel gaps by slightly expanding the cell
            width: 'calc(100% + 1px)',
            height: 'calc(100% + 1px)',
            marginRight: '-1px',
            marginBottom: '-1px'
          }}
          className={`flex items-center justify-center font-medium text-xs ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          } ${isPrintMode ? 'print:bg-gray-100 print:border-gray-300 print:text-black' : ''}`}
        >
          {rowIndex}
        </div>
      );
    }

    // Regular cells - Grid uses 0-based indexing, Excel data uses 1-based indexing
    // Grid row 0 is header, so grid row 1 = Excel row 1
    // Grid col 0 is row numbers, so grid col 1 = Excel col 1
    // Since we're already past the header (rowIndex > 0) and row numbers (columnIndex > 0),
    // we can use the indices directly as they already map to Excel's 1-based system
    const cellKey = `${rowIndex}-${columnIndex}`;
    const cellData = cellDataMap.current.get(cellKey);
    
    // Debug log for object values
    if (cellData && typeof cellData.value === 'object' && cellData.value !== null && !(cellData.value instanceof Date)) {
      console.warn('[ExcelSheet] Object value found in cellData:', {
        cellKey,
        value: cellData.value,
        valueType: typeof cellData.value,
        valueKeys: Object.keys(cellData.value || {})
      });
    }
    
    if (!cellData) {
      // Empty cell with Excel-like grid lines
      return (
        <div 
          style={{
            ...style,
            borderRight: showGridLines ? (darkMode && !isPrintMode ? '1px solid #4b5563' : '1px solid #d1d5db') : 'none',
            borderBottom: showGridLines ? (darkMode && !isPrintMode ? '1px solid #4b5563' : '1px solid #d1d5db') : 'none',
            cursor: 'cell'
          }}
          className={`${isPrintMode ? 'print:border-gray-200' : ''}`}
          onClick={() => onCellClick?.(rowIndex, columnIndex, '')}
          role="gridcell"
          aria-label={`Cell ${getColumnName(columnIndex)}${rowIndex}, empty`}
        />
      );
    }

    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === columnIndex;
    const isHighlighted = highlightedCells.some(cell => cell.row === rowIndex && cell.col === columnIndex);

    return (
      <div style={{ ...style, overflow: 'hidden', boxSizing: 'border-box' }}>
        <ExcelCell
          value={cellData.value}
          style={cellData.style || {}}
          row={rowIndex}
          col={columnIndex}
          columnName={getColumnName(columnIndex)}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          onClick={onCellClick}
          width={getColumnWidth(columnIndex)}
          height={getRowHeight(rowIndex)}
          darkMode={darkMode}
          isPrintMode={isPrintMode}
          accessibilityMode={accessibilityMode}
          showGridLines={showGridLines}
        />
      </div>
    );
  }, [getColumnWidth, getRowHeight, selectedCell, highlightedCells, onCellClick, darkMode, isPrintMode, accessibilityMode, showGridLines]);

  // Handle merged cells overlay
  const MergedCellsOverlay = useMemo(() => {
    if (!data.mergedCells?.length) return null;

    return (
      <div className="absolute top-0 left-0 pointer-events-none" style={{ zIndex: 10 }}>
        {data.mergedCells.map((merge, index) => {
          const left = Array.from({ length: merge.startCol }, (_, i) => getColumnWidth(i)).reduce((a, b) => a + b, 0);
          const top = Array.from({ length: merge.startRow }, (_, i) => getRowHeight(i)).reduce((a, b) => a + b, 0);
          const width = Array.from({ length: merge.endCol - merge.startCol + 1 }, (_, i) => getColumnWidth(merge.startCol + i)).reduce((a, b) => a + b, 0);
          const height = Array.from({ length: merge.endRow - merge.startRow + 1 }, (_, i) => getRowHeight(merge.startRow + i)).reduce((a, b) => a + b, 0);

          const cellData = cellDataMap.current.get(`${merge.startRow}-${merge.startCol}`);

          return (
            <div
              key={index}
              className={`absolute pointer-events-auto border ${
                darkMode ? 'bg-navy-900 border-navy-600' : 'bg-white border-gray-300'
              } ${isPrintMode ? 'print:bg-white print:border-gray-300' : ''}`}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`
              }}
              role="gridcell"
              aria-colspan={merge.endCol - merge.startCol + 1}
              aria-rowspan={merge.endRow - merge.startRow + 1}
            >
              {cellData && (
                <ExcelCell
                  value={cellData.value}
                  style={cellData.style || {}}
                  row={merge.startRow}
                  col={merge.startCol}
                  columnName={getColumnName(merge.startCol)}
                  width={width}
                  height={height}
                  onClick={onCellClick}
                  darkMode={darkMode}
                  isPrintMode={isPrintMode}
                  isMerged={true}
                  showGridLines={showGridLines}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }, [data.mergedCells, getColumnWidth, getRowHeight, onCellClick, darkMode, isPrintMode]);

  // Don't render Grid until dimensions are ready to prevent misalignment
  if (!dimensionsReady && data.columnWidths) {
    return (
      <div 
        className={`relative ${darkMode ? 'bg-navy-900' : 'bg-white'} ${isPrintMode ? 'print:bg-white' : ''}`} 
        style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading sheet...</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${darkMode ? 'bg-navy-900' : 'bg-white'} ${isPrintMode ? 'print:bg-white' : ''}`} 
      style={{ width, height }}>
      <Grid
        ref={gridRef}
        className={`${styles['excel-grid']} excel-grid`}
        columnCount={totalColumns}
        columnWidth={getColumnWidth}
        height={height}
        rowCount={totalRows}
        rowHeight={getRowHeight}
        width={width}
        onScroll={handleScroll}
        style={{ 
          overflowX: 'auto', 
          overflowY: 'auto',
          backgroundColor: darkMode ? '#111827' : '#ffffff'
        }}
        data-dark={darkMode}
      >
        {Cell}
      </Grid>
      {MergedCellsOverlay}
    </div>
  );
}));

ExcelSheet.displayName = 'ExcelSheet';

// Helper function to convert column index to letter (1 -> A, 2 -> B, etc.)
function getColumnName(index) {
  let name = '';
  while (index > 0) {
    index--;
    name = String.fromCharCode(65 + (index % 26)) + name;
    index = Math.floor(index / 26);
  }
  return name;
}

export default ExcelSheet;