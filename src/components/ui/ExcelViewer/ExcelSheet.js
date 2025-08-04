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
  const spilloverMap = useRef(new Map()); // Map to track spillover data

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
    const newSpilloverMap = new Map();
    
    if (data.cells) {
      data.cells.forEach(cell => {
        const key = `${cell.row}-${cell.col}`;
        newMap.set(key, cell);
      });
    }
    
    // Process spillover ranges
    if (data.spilloverRanges) {
      data.spilloverRanges.forEach(spillRange => {
        // For each cell in the spillover range, mark it as a spillover cell
        for (let col = spillRange.startCol; col <= spillRange.endCol; col++) {
          const spillKey = `${spillRange.sourceRow}-${col}`;
          newSpilloverMap.set(spillKey, {
            sourceRow: spillRange.sourceRow,
            sourceCol: spillRange.sourceCol,
            text: spillRange.text,
            isSpillover: true,
            spilloverIndex: col - spillRange.startCol // Position in spillover sequence
          });
        }
      });
    }
    
    cellDataMap.current = newMap;
    spilloverMap.current = newSpilloverMap;
    
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
        spilloverCount: newSpilloverMap.size,
        spilloverRanges: data.spilloverRanges?.length || 0,
        cellsWithStyles: cellsWithStyles.length,
        cellsWithBackgroundOnly: cellsWithBackgroundOnly.length,
        sampleKeys: Array.from(newMap.keys()).slice(0, 5),
        sampleSpilloverKeys: Array.from(newSpilloverMap.keys()).slice(0, 5),
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
        spilloverCount: newSpilloverMap.size,
        spilloverRanges: data.spilloverRanges?.length || 0,
        cellsWithBackgroundOnly: cellsWithBackgroundOnly.length,
        sampleKeys: Array.from(newMap.keys()).slice(0, 5)
      });
    }
  }, [data.cells, data.spilloverRanges]);

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
        
        // Handle hidden or very small rows
        // In Excel, rows with height 0 are hidden, very small heights (< 5 points) are meant to hide content
        if (height === 0) {
          heights[row] = 0; // Completely hidden
        } else if (height < 5) {
          // Very small height - make it 1px so row exists but content is not visible
          heights[row] = 1;
        } else {
          heights[row] = Math.round(pixelHeight * zoomFactor);
        }
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
            backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6'
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
            backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6'
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
            backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6'
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
    const spilloverData = spilloverMap.current.get(cellKey);
    
    // Calculate selection and highlight state early
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === columnIndex;
    const isHighlighted = highlightedCells.some(cell => cell.row === rowIndex && cell.col === columnIndex);
    
    // Debug log for object values
    if (cellData && typeof cellData.value === 'object' && cellData.value !== null && !(cellData.value instanceof Date)) {
      console.warn('[ExcelSheet] Object value found in cellData:', {
        cellKey,
        value: cellData.value,
        valueType: typeof cellData.value,
        valueKeys: Object.keys(cellData.value || {})
      });
    }
    
    // Handle spillover cells - these should show part of another cell's text
    if (!cellData && spilloverData) {
      const sourceCell = cellDataMap.current.get(`${spilloverData.sourceRow}-${spilloverData.sourceCol}`);
      if (sourceCell) {
        return (
          <div style={{ ...style, overflow: 'hidden', boxSizing: 'border-box' }}>
            <ExcelCell
              value="" // Don't show value in spillover cells - this will be handled by visual spillover
              style={sourceCell.style || {}}
              row={rowIndex}
              col={columnIndex}
              columnName={getColumnName(columnIndex)}
              isSelected={isSelected} // Allow spillover cells to be selected but they remain empty
              isHighlighted={false}
              onClick={onCellClick}
              width={getColumnWidth(columnIndex)}
              height={getRowHeight(rowIndex)}
              darkMode={darkMode}
              isPrintMode={isPrintMode}
              accessibilityMode={accessibilityMode}
              showGridLines={showGridLines}
              isSpilloverCell={true}
              spilloverData={spilloverData}
            />
          </div>
        );
      }
    }
    
    if (!cellData && !spilloverData) {
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

    // Check if this cell is a source cell for spillover
    const isSpilloverSource = data.spilloverRanges?.some(range => 
      range.sourceRow === rowIndex && range.sourceCol === columnIndex
    );

    return (
      <div style={{ ...style, overflow: 'hidden', boxSizing: 'border-box' }}>
        <ExcelCell
          value={cellData.value} // Show actual value in source cells
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
          isSpilloverSource={isSpilloverSource}
        />
      </div>
    );
  }, [getColumnWidth, getRowHeight, selectedCell, highlightedCells, onCellClick, darkMode, isPrintMode, accessibilityMode, showGridLines, data.spilloverRanges]);

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

  // Create custom inner element that includes spillover overlays
  const innerElementType = useMemo(() => {
    return forwardRef(({ children, style, ...rest }, ref) => {
      // Render spillover overlays inside the scrollable area
      const spilloverOverlays = data.spilloverRanges?.map((spillRange, index) => {
        const sourceCell = cellDataMap.current.get(`${spillRange.sourceRow}-${spillRange.sourceCol}`);
        if (!sourceCell) return null;

        // Calculate position and dimensions for the spillover text
        // For right-aligned text, spillover starts from startCol (which may be less than sourceCol)
        const spilloverStartCol = Math.min(spillRange.startCol, spillRange.sourceCol);
        const spilloverEndCol = Math.max(spillRange.endCol, spillRange.sourceCol);
        
        const spilloverLeft = Array.from({ length: spilloverStartCol }, (_, i) => getColumnWidth(i)).reduce((a, b) => a + b, 0);
        const sourceTop = Array.from({ length: spillRange.sourceRow }, (_, i) => getRowHeight(i)).reduce((a, b) => a + b, 0);
        const sourceHeight = getRowHeight(spillRange.sourceRow);
        
        // Calculate total width from start to end of spillover
        const totalWidth = Array.from({ length: spilloverEndCol - spilloverStartCol + 1 }, (_, i) => 
          getColumnWidth(spilloverStartCol + i)
        ).reduce((a, b) => a + b, 0);

        // Get all cell formatting properties
        const cellStyle = sourceCell.style || {};
        const alignment = cellStyle.alignment || {};
        const font = cellStyle.font || {};
        
        // Process text alignment and indentation
        let textAlign = alignment.horizontal || 'left';
        let paddingLeft = 6; // Default padding
        let paddingRight = 6;
        
        // Handle indentation
        if (alignment.indent) {
          paddingLeft += alignment.indent * 8; // Each indent level is roughly 8px
        }
        
        // Handle text rotation if present
        const textRotation = alignment.textRotation || 0;
        
        // Extract all font properties
        const fontSize = font.size ? Math.round(font.size * 1.333) : 15;
        const fontFamily = font.name ? `"${font.name}", sans-serif` : 'Calibri, "Segoe UI", Arial, sans-serif';
        const fontWeight = font.bold ? '700' : '400';
        const fontStyle = font.italic ? 'italic' : 'normal';
        const textDecorationLine = [];
        if (font.underline) textDecorationLine.push('underline');
        if (font.strike) textDecorationLine.push('line-through');
        const textDecoration = textDecorationLine.length > 0 ? textDecorationLine.join(' ') : 'none';
        const fontColor = convertColorForCSS(font.color) || (darkMode ? '#e5e7eb' : '#000000');

        return (
          <div
            key={`spillover-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: `${spilloverLeft}px`,
              top: `${sourceTop}px`,
              width: `${totalWidth}px`,
              height: `${sourceHeight}px`,
              zIndex: 1, // Lower z-index to sit between background and cell content
              opacity: 0.99 // Slightly less than 1 to blend better and prevent doubling
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                paddingTop: '3px',
                paddingBottom: '3px',
                paddingLeft: `${paddingLeft}px`,
                paddingRight: `${paddingRight}px`,
                boxSizing: 'border-box',
                overflow: 'hidden',
                whiteSpace: alignment.wrapText ? 'normal' : 'nowrap',
                wordWrap: alignment.wrapText ? 'break-word' : 'normal',
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                textDecoration: textDecoration,
                color: fontColor,
                textAlign: textAlign,
                verticalAlign: alignment.vertical || 'middle',
                display: 'flex',
                alignItems: alignment.vertical === 'top' ? 'flex-start' : 
                          alignment.vertical === 'bottom' ? 'flex-end' : 'center',
                justifyContent: textAlign === 'center' ? 'center' : 
                               textAlign === 'right' ? 'flex-end' : 'flex-start',
                transform: textRotation ? `rotate(${textRotation}deg)` : 'none',
                transformOrigin: 'center',
                backgroundColor: 'transparent', // Ensure no background
                letterSpacing: font.letterSpacing ? `${font.letterSpacing}px` : 'normal',
                lineHeight: alignment.lineHeight || 'normal',
                textShadow: isPrintMode ? 'none' : undefined
              }}
            >
              {spillRange.text}
            </div>
          </div>
        );
      });

      return (
        <div ref={ref} style={style} {...rest}>
          {children}
          {spilloverOverlays}
        </div>
      );
    });
  }, [data.spilloverRanges, getColumnWidth, getRowHeight, darkMode, isPrintMode]);

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
      {/* Background layer for row/column headers to prevent gaps */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: ROW_NUMBER_WIDTH * zoomFactor,
          height: '100%',
          backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6',
          zIndex: 0
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: HEADER_HEIGHT * zoomFactor,
          backgroundColor: darkMode && !isPrintMode ? '#1f2937' : '#f3f4f6',
          zIndex: 0
        }}
      />
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
          backgroundColor: darkMode ? '#111827' : '#ffffff',
          position: 'relative',
          zIndex: 1
        }}
        data-dark={darkMode}
        innerElementType={innerElementType}
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

// Helper function to convert Excel color objects to CSS color strings
function convertColorForCSS(colorObj) {
  if (!colorObj) return null;
  
  // If it's already a string (hex color), return as-is
  if (typeof colorObj === 'string') {
    return colorObj.startsWith('#') ? colorObj : `#${colorObj}`;
  }
  
  // If it's an object with argb property
  if (colorObj.argb) {
    return colorObj.argb.length === 8 ? `#${colorObj.argb.slice(2)}` : `#${colorObj.argb}`;
  }
  
  // If it's an object with rgb property
  if (colorObj.rgb) {
    return `#${colorObj.rgb}`;
  }
  
  // Handle theme colors (simplified)
  if (colorObj.theme !== undefined) {
    const themeColors = {
      0: '#FFFFFF', 1: '#000000', 2: '#E7E6E6', 3: '#44546A',
      4: '#5B9BD5', 5: '#ED7D31', 6: '#A5A5A5', 7: '#FFC000',
      8: '#4472C4', 9: '#70AD47'
    };
    return themeColors[colorObj.theme] || '#000000';
  }
  
  return null;
}

export default ExcelSheet;