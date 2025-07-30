import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import ExcelCell from './ExcelCell';

const HEADER_HEIGHT = 25;
const ROW_NUMBER_WIDTH = 50;
const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 25;

const ExcelSheet = memo(({ 
  data = {},
  width = 800,
  height = 600,
  onCellClick,
  selectedCell,
  zoom = 100,
  onViewportChange
}) => {
  const gridRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const cellDataMap = useRef(new Map());

  // Zoom factor
  const zoomFactor = zoom / 100;

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
  }, [data.cells]);

  // Calculate column widths with zoom
  useEffect(() => {
    const widths = {};
    if (data.columnWidths) {
      Object.entries(data.columnWidths).forEach(([col, width]) => {
        widths[col] = width * 8 * zoomFactor; // Convert Excel width units to pixels
      });
    }
    setColumnWidths(widths);
  }, [data.columnWidths, zoomFactor]);

  // Calculate row heights with zoom
  useEffect(() => {
    const heights = {};
    if (data.rowHeights) {
      Object.entries(data.rowHeights).forEach(([row, height]) => {
        heights[row] = height * zoomFactor;
      });
    }
    setRowHeights(heights);
  }, [data.rowHeights, zoomFactor]);

  // Column width getter for react-window
  const getColumnWidth = useCallback((index) => {
    if (index === 0) return ROW_NUMBER_WIDTH * zoomFactor; // Row number column
    return columnWidths[index] || DEFAULT_COLUMN_WIDTH * zoomFactor;
  }, [columnWidths, zoomFactor]);

  // Row height getter for react-window
  const getRowHeight = useCallback((index) => {
    if (index === 0) return HEADER_HEIGHT * zoomFactor; // Header row
    return rowHeights[index] || DEFAULT_ROW_HEIGHT * zoomFactor;
  }, [rowHeights, zoomFactor]);

  // Get total dimensions
  const totalColumns = Math.max(50, ...Object.keys(columnWidths).map(Number), ...(data.cells?.map(c => c.col) || [])) + 1;
  const totalRows = Math.max(100, ...Object.keys(rowHeights).map(Number), ...(data.cells?.map(c => c.row) || [])) + 1;

  // Handle scroll to report viewport
  const handleScroll = useCallback(({ scrollLeft, scrollTop }) => {
    if (onViewportChange && gridRef.current) {
      const visibleRange = {
        startRow: Math.floor(scrollTop / (DEFAULT_ROW_HEIGHT * zoomFactor)),
        endRow: Math.ceil((scrollTop + height) / (DEFAULT_ROW_HEIGHT * zoomFactor)),
        startCol: Math.floor(scrollLeft / (DEFAULT_COLUMN_WIDTH * zoomFactor)),
        endCol: Math.ceil((scrollLeft + width) / (DEFAULT_COLUMN_WIDTH * zoomFactor))
      };
      onViewportChange(visibleRange);
    }
  }, [height, width, zoomFactor, onViewportChange]);

  // Cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    // Header row
    if (rowIndex === 0) {
      if (columnIndex === 0) {
        // Top-left corner cell
        return (
          <div style={style} className="bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center font-medium text-xs">
            #
          </div>
        );
      }
      // Column headers (A, B, C, etc.)
      return (
        <div style={style} className="bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center font-medium text-xs">
          {getColumnName(columnIndex)}
        </div>
      );
    }

    // Row numbers
    if (columnIndex === 0) {
      return (
        <div style={style} className="bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center font-medium text-xs">
          {rowIndex}
        </div>
      );
    }

    // Regular cells
    const cellKey = `${rowIndex}-${columnIndex}`;
    const cellData = cellDataMap.current.get(cellKey);
    
    if (!cellData) {
      // Empty cell
      return (
        <div 
          style={style} 
          className="border-b border-r border-gray-200"
          onClick={() => onCellClick?.(rowIndex, columnIndex)}
        />
      );
    }

    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === columnIndex;

    return (
      <div style={style}>
        <ExcelCell
          value={cellData.value}
          style={cellData.style || {}}
          row={rowIndex}
          col={columnIndex}
          isSelected={isSelected}
          onClick={onCellClick}
          width={getColumnWidth(columnIndex)}
          height={getRowHeight(rowIndex)}
        />
      </div>
    );
  }, [getColumnWidth, getRowHeight, selectedCell, onCellClick]);

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
                  width={width}
                  height={height}
                  onClick={onCellClick}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }, [data.mergedCells, getColumnWidth, getRowHeight, onCellClick]);

  return (
    <div className="relative bg-white" style={{ width, height }}>
      <Grid
        ref={gridRef}
        className="excel-grid"
        columnCount={totalColumns}
        columnWidth={getColumnWidth}
        height={height}
        rowCount={totalRows}
        rowHeight={getRowHeight}
        width={width}
        onScroll={handleScroll}
        style={{ overflowX: 'auto', overflowY: 'auto' }}
      >
        {Cell}
      </Grid>
      {MergedCellsOverlay}
    </div>
  );
});

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