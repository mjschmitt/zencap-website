import React, { memo, useCallback, useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import ExcelCell from './ExcelCell';
import styles from '../../../styles/ExcelViewer.module.css';

const HEADER_HEIGHT = 25;
const ROW_NUMBER_WIDTH = 50;
// Excel column width units: 1 unit = width of one character in default font (Calibri 11pt)
// Excel default column width is 8.43 units (64 pixels)
// Adjusted conversion: 1 Excel unit ≈ 7.0 pixels (better for proportional accuracy)
// This provides better visual match with Excel, especially for wider columns
const DEFAULT_COLUMN_WIDTH = 64; // 8.43 units * 7.5 pixels/unit ≈ 64 pixels
const DEFAULT_ROW_HEIGHT = 20; // Excel default is 15 points = 20 pixels
const EXCEL_COLUMN_WIDTH_TO_PIXEL = 7.0; // Reduced for better proportional accuracy
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
  const [dimensionsReady, setDimensionsReady] = useState(false);
  const cellDataMap = useRef(new Map());
  const spilloverMap = useRef(new Map()); // Map to track spillover data
  const [collapsedGroups, setCollapsedGroups] = useState(new Set()); // Track collapsed column groups
  const [collapsedRowGroups, setCollapsedRowGroups] = useState(new Set()); // Track collapsed row groups

  // Zoom factor
  const zoomFactor = zoom / 100;
  
  // Handle zoom changes - reset grid cache after dimensions are recalculated
  const prevZoomRef = useRef(zoom);
  useEffect(() => {
    // Only log and reset if zoom actually changed
    if (prevZoomRef.current !== zoom) {
      console.log('[ExcelSheet] Zoom changed:', zoom, 'zoomFactor:', zoomFactor);
      
      if (gridRef.current) {
        // Force immediate update - don't wait for requestAnimationFrame
        // This ensures the Grid uses the new dimensions right away
        gridRef.current.resetAfterIndices({
          columnIndex: 0,
          rowIndex: 0,
          shouldForceUpdate: true  // Force update to ensure new dimensions are used
        });
      }
      prevZoomRef.current = zoom;
    }
  }, [zoom, zoomFactor]);

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

  // Process column outline data into groups
  const columnGroups = useMemo(() => {
    if (!data.columnOutlines || data.columnOutlines.length === 0) return [];
    
    // Group columns by their outline level and consecutive ranges
    const groups = [];
    const outlinesByLevel = {};
    
    // First, organize by level and remove duplicates
    const seen = new Set();
    data.columnOutlines.forEach(outline => {
      const key = `${outline.column}-${outline.level}`;
      if (!seen.has(key)) {
        seen.add(key);
        if (!outlinesByLevel[outline.level]) {
          outlinesByLevel[outline.level] = [];
        }
        outlinesByLevel[outline.level].push(outline);
      }
    });
    
    // Then create groups for consecutive columns at each level
    Object.entries(outlinesByLevel).forEach(([level, outlines]) => {
      // Sort by column number
      outlines.sort((a, b) => a.column - b.column);
      
      let currentGroup = null;
      outlines.forEach((outline, index) => {
        if (!currentGroup || outline.column !== currentGroup.endCol + 1) {
          // Start new group - only if there's a real gap
          if (currentGroup) {
            // Save the previous group before starting a new one
            groups.push(currentGroup);
          }
          currentGroup = {
            level: parseInt(level),
            startCol: outline.column,
            endCol: outline.column,
            collapsed: outline.collapsed,
            id: `col-group-${level}-${outline.column}` // Include start column in ID for uniqueness
          };
        } else {
          // Extend current group
          currentGroup.endCol = outline.column;
          // If any column in group is collapsed, mark group as collapsed
          if (outline.collapsed) {
            currentGroup.collapsed = true;
          }
        }
        
        // Add the last group if we're at the end
        if (index === outlines.length - 1 && currentGroup) {
          groups.push(currentGroup);
        }
      });
    });
    
    console.log('[ExcelSheet] Column groups:', {
      outlines: data.columnOutlines,
      outlineColumns: data.columnOutlines.map(o => `${o.column}(L${o.level})`).join(', '),
      groups: groups,
      groupIds: groups.map(g => g.id),
      groupRanges: groups.map(g => `${g.startCol}-${g.endCol}`)
    });
    
    return groups;
  }, [data.columnOutlines]);
  
  // Process row outline data into groups
  const rowGroups = useMemo(() => {
    if (!data.rowOutlines || data.rowOutlines.length === 0) return [];
    
    // Group rows by their outline level and consecutive ranges
    const groups = [];
    const outlinesByLevel = {};
    
    // First, organize by level
    data.rowOutlines.forEach(outline => {
      if (!outlinesByLevel[outline.level]) {
        outlinesByLevel[outline.level] = [];
      }
      outlinesByLevel[outline.level].push(outline);
    });
    
    // Then create groups for consecutive rows at each level
    Object.entries(outlinesByLevel).forEach(([level, outlines]) => {
      // Sort by row number
      outlines.sort((a, b) => a.row - b.row);
      
      let currentGroup = null;
      outlines.forEach(outline => {
        if (!currentGroup || outline.row !== currentGroup.endRow + 1) {
          // Start new group - use the start row for the ID
          const startRow = outline.row;
          currentGroup = {
            level: parseInt(level),
            startRow: startRow,
            endRow: outline.row,
            collapsed: outline.collapsed,
            id: `row-group-${level}-${startRow}` // Use start row for consistent group ID
          };
          groups.push(currentGroup);
        } else {
          // Extend current group - keep same ID
          currentGroup.endRow = outline.row;
          // If any row in group is collapsed, mark group as collapsed
          if (outline.collapsed) {
            currentGroup.collapsed = true;
          }
        }
      });
    });
    
    // Debug log - commented out to reduce noise
    // console.log('[ExcelSheet] Row groups:', {
    //   totalOutlines: data.rowOutlines?.length || 0,
    //   groups: groups
    // });
    
    return groups;
  }, [data.rowOutlines]);
  
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
      // Reduced console logging for performance
      if (debugMode && (data.cells?.length || 0) < 100) {
        console.log('Cell data map updated:', {
          cellCount: data.cells?.length || 0,
          mapSize: newMap.size,
          spilloverCount: newSpilloverMap.size
        });
      }
    }
  }, [data.cells, data.spilloverRanges]);

  // Calculate column widths with zoom - using useMemo for immediate updates
  const columnWidths = useMemo(() => {
    const widths = {};
    if (data.columnWidths) {
      // Debug: Uncomment to see raw column width data
      // console.log('[Column Widths Raw Data]', data.columnWidths);
      Object.entries(data.columnWidths).forEach(([col, width]) => {
        // Excel width units to pixels using proper conversion factor
        // Excel width is in character units, convert to pixels
        // Handle hidden columns (width === 0) the same way as hidden rows
        if (width === 0) {
          widths[col] = 0; // Completely hidden
        } else if (width < 0.5) {
          // Very narrow columns - make them 1px so column exists but content is not visible
          widths[col] = 1;
        } else {
          // For normal columns, use proper conversion with a reasonable maximum
          const calculatedWidth = width * EXCEL_COLUMN_WIDTH_TO_PIXEL * zoomFactor;
          // Cap maximum width at 400px (at 100% zoom) to prevent extremely wide columns
          const maxWidth = 400 * zoomFactor;
          widths[col] = Math.round(Math.min(calculatedWidth, maxWidth));
        }
      });
    }
    
    // Debug: Uncomment to see processed column widths
    // console.log('[Column Widths Processed]', {
    //   widths,
    //   keys: Object.keys(widths),
    //   values: Object.values(widths),
    //   sample: Object.entries(widths).slice(0, 5)
    // });
    
    return widths;
  }, [data.columnWidths, zoomFactor]);
  
  // Mark dimensions as ready
  useEffect(() => {
    if ((columnWidths && Object.keys(columnWidths).length > 0) || data.columnWidths) {
      setDimensionsReady(true);
    }
  }, [columnWidths, data.columnWidths]);

  // Calculate row heights with zoom - using useMemo for immediate updates
  const rowHeights = useMemo(() => {
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
    
    // Debug row height info only on significant changes
    // Commented out to reduce console noise - uncomment if needed for debugging
    // console.log('[ExcelSheet] Row heights recalculated:', {
    //   zoomFactor,
    //   sampleHeights: Object.entries(heights).slice(0, 3)
    // });
    
    return heights;
  }, [data.rowHeights, zoomFactor]);

  // Column width getter for react-window
  const getColumnWidth = useCallback((index) => {
    if (index === 0) return ROW_NUMBER_WIDTH * zoomFactor; // Row number column
    
    // Check if this column is in a collapsed group
    const isInCollapsedGroup = columnGroups.some(group => {
      return collapsedGroups.has(group.id) && 
             index >= group.startCol && 
             index <= group.endCol;
    });
    
    if (isInCollapsedGroup) {
      return 0.1; // Nearly invisible width for collapsed columns
    }
    
    // Use specific column width if available, otherwise use default from Excel or fallback
    // Note: Some Excel files have defaultColWidth of 0, which we should ignore
    const defaultWidth = (data.defaultColWidth && data.defaultColWidth > 0)
      ? data.defaultColWidth * EXCEL_COLUMN_WIDTH_TO_PIXEL 
      : DEFAULT_COLUMN_WIDTH;
    
    // Excel column widths are 1-indexed (1=A, 2=B, etc.)
    // Grid columns are: 0=row header, 1=A, 2=B, etc.
    // So grid column 1 (A) needs Excel column 1, grid column 2 (B) needs Excel column 2
    const excelColumnIndex = index; // Grid index matches Excel index for columns
    const width = columnWidths[excelColumnIndex] !== undefined ? columnWidths[excelColumnIndex] : (defaultWidth * zoomFactor);
    
    // Log first few column widths for debugging with more detail (only in debug mode)
    // Commented out to reduce console noise - uncomment if needed for debugging
    // if (debugMode && index <= 5 && index > 0) {
    //   console.log(`Column ${index} width: ${width}px (has custom: ${!!columnWidths[index]}, stored width: ${columnWidths[index]}, default: ${defaultWidth * zoomFactor})`);
    // }
    
    return width;
  }, [columnWidths, zoomFactor, data.defaultColWidth, columnGroups, collapsedGroups]);

  // Row height getter for react-window
  const getRowHeight = useCallback((index) => {
    if (index === 0) return HEADER_HEIGHT * zoomFactor; // Header row
    
    // Check if this row is in a collapsed group
    const isInCollapsedGroup = rowGroups.some(group => {
      return collapsedRowGroups.has(group.id) && 
             index >= group.startRow && 
             index <= group.endRow;
    });
    
    if (isInCollapsedGroup) {
      return 0.1; // Nearly invisible height for collapsed rows
    }
    
    // Use specific row height if available, otherwise use default from Excel or fallback
    // Excel's defaultRowHeight is already in points (15pt = 20px)
    const defaultHeight = (data.defaultRowHeight && data.defaultRowHeight > 0)
      ? data.defaultRowHeight * EXCEL_ROW_HEIGHT_TO_PIXEL 
      : DEFAULT_ROW_HEIGHT;
    
    // Handle hidden rows (height = 0 from Excel)
    const rowHeight = rowHeights[index];
    if (rowHeight === 0) {
      return 0; // Hidden row
    }
    
    return rowHeight || defaultHeight * zoomFactor;
  }, [rowHeights, zoomFactor, data.defaultRowHeight, rowGroups, collapsedRowGroups]);

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
      // Check if this column is part of a group
      const columnGroup = columnGroups.find(group => 
        columnIndex >= group.startCol && columnIndex <= group.endCol
      );
      
      // Check if this column is in a group (show button on every column in the group)
      const isInGroup = columnGroup !== undefined;
      const isCollapsed = columnGroup && collapsedGroups.has(columnGroup.id);
      
      // Check if this column is in a collapsed group
      const isInCollapsedGroup = columnGroups.some(group => {
        return collapsedGroups.has(group.id) && 
               columnIndex >= group.startCol && 
               columnIndex <= group.endCol;
      });
      
      // Check if this column is right after a collapsed group (for expand button)
      const collapsedGroupBefore = columnGroups.find(group => {
        return collapsedGroups.has(group.id) && 
               columnIndex === group.endCol + 1;
      });
      
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
          } ${isPrintMode ? 'print:bg-gray-100 print:border-gray-300 print:text-black' : ''} ${isInGroup || collapsedGroupBefore ? 'relative' : ''}`}
        >
          {/* Add visual indicator for grouped columns */}
          {columnGroup && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: darkMode ? '#60a5fa' : '#3b82f6',
                pointerEvents: 'none'
              }}
            />
          )}
          {isInCollapsedGroup ? '' : getColumnName(columnIndex)}
          
          {/* Collapse button for columns in a group */}
          {isInGroup && !isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newCollapsed = new Set(collapsedGroups);
                newCollapsed.add(columnGroup.id);
                setCollapsedGroups(newCollapsed);
                // Reset grid cache to update column widths
                if (gridRef.current) {
                  gridRef.current.resetAfterIndices({
                    columnIndex: columnGroup.startCol - 1,
                    rowIndex: 0,
                    shouldForceUpdate: true
                  });
                }
              }}
              className={`hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '16px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                lineHeight: '1',
                cursor: 'pointer',
                zIndex: 2
              }}
              title='Collapse columns'
            >
              -
            </button>
          )}
          
          {/* Expand button for column after a collapsed group */}
          {collapsedGroupBefore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newCollapsed = new Set(collapsedGroups);
                newCollapsed.delete(collapsedGroupBefore.id);
                setCollapsedGroups(newCollapsed);
                // Reset grid cache to update column widths
                if (gridRef.current) {
                  gridRef.current.resetAfterIndices({
                    columnIndex: collapsedGroupBefore.startCol - 1,
                    rowIndex: 0,
                    shouldForceUpdate: true
                  });
                }
              }}
              className={`hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '16px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                lineHeight: '1',
                cursor: 'pointer',
                zIndex: 2
              }}
              title='Expand columns'
            >
              +
            </button>
          )}
        </div>
      );
    }

    // Row numbers
    if (columnIndex === 0) {
      // Check if this row is in a collapsed group
      const isInCollapsedRowGroup = rowGroups.some(group => {
        return collapsedRowGroups.has(group.id) && 
               rowIndex >= group.startRow && 
               rowIndex <= group.endRow;
      });
      
      // Check if this row is part of a group
      const rowGroup = rowGroups.find(group => 
        rowIndex >= group.startRow && rowIndex <= group.endRow
      );
      
      // Check if this row is in a group (show button on every row in the group)
      const isInGroup = rowGroup !== undefined;
      const isRowCollapsed = rowGroup && collapsedRowGroups.has(rowGroup.id);
      
      // Check if this row is right after a collapsed group (for expand button)
      const collapsedRowGroupBefore = rowGroups.find(group => {
        return collapsedRowGroups.has(group.id) && 
               rowIndex === group.endRow + 1;
      });
      
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
          } ${isPrintMode ? 'print:bg-gray-100 print:border-gray-300 print:text-black' : ''} relative`}
        >
          {/* Add visual indicator for grouped rows - similar to columns */}
          {rowGroup && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '2px',
                backgroundColor: darkMode ? '#60a5fa' : '#3b82f6',
                pointerEvents: 'none'
              }}
            />
          )}
          {isInCollapsedRowGroup ? '' : rowIndex}
          
          {/* Collapse button for rows in a group */}
          {isInGroup && !isRowCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newCollapsed = new Set(collapsedRowGroups);
                newCollapsed.add(rowGroup.id);
                setCollapsedRowGroups(newCollapsed);
                // Reset grid cache to update row heights
                if (gridRef.current) {
                  gridRef.current.resetAfterIndices({
                    columnIndex: 0,
                    rowIndex: rowGroup.startRow - 1,
                    shouldForceUpdate: true
                  });
                }
              }}
              className={`hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              style={{
                position: 'absolute',
                top: 0,
                left: '-8px',
                bottom: 0,
                width: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                lineHeight: '1',
                cursor: 'pointer',
                zIndex: 2
              }}
              title='Collapse rows'
            >
              -
            </button>
          )}
          
          {/* Expand button for row after a collapsed group */}
          {collapsedRowGroupBefore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newCollapsed = new Set(collapsedRowGroups);
                newCollapsed.delete(collapsedRowGroupBefore.id);
                setCollapsedRowGroups(newCollapsed);
                // Reset grid cache to update row heights
                if (gridRef.current) {
                  gridRef.current.resetAfterIndices({
                    columnIndex: 0,
                    rowIndex: collapsedRowGroupBefore.startRow - 1,
                    shouldForceUpdate: true
                  });
                }
              }}
              className={`hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              style={{
                position: 'absolute',
                top: 0,
                left: '-8px',
                bottom: 0,
                width: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                lineHeight: '1',
                cursor: 'pointer',
                zIndex: 2
              }}
              title='Expand rows'
            >
              +
            </button>
          )}
        </div>
      );
    }

    // Regular cells - Grid uses 0-based indexing, Excel data uses 1-based indexing
    // Grid row 0 is header, so grid row 1 = Excel row 1
    // Grid col 0 is row numbers, so grid col 1 = Excel col 1
    // CRITICAL FIX: The indices are already 1-based for data cells (after headers/row numbers)
    // This directly maps to Excel's internal 1-based indexing system
    
    // ADDITIONAL SAFETY CHECK: Ensure we're mapping correctly
    // react-window rowIndex/columnIndex are 0-based, but our data cells start at 1,1
    // rowIndex=1,columnIndex=1 should map to Excel A1 which is stored as row:1,col:1
    const cellKey = `${rowIndex}-${columnIndex}`;
    const cellData = cellDataMap.current.get(cellKey);
    const spilloverData = spilloverMap.current.get(cellKey);
    
    // Debug logging to verify correct mapping (only for development)
    if (process.env.NODE_ENV === 'development' && debugMode && cellData) {
      console.log(`[Cell Mapping] Grid(${rowIndex},${columnIndex}) → Excel(${cellData.row || rowIndex},${cellData.col || columnIndex}) = ${getColumnName(columnIndex)}${rowIndex}`);
    }
    
    // Calculate selection and highlight state early
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === columnIndex;
    const isHighlighted = highlightedCells.some(cell => cell.row === rowIndex && cell.col === columnIndex);
    
    // Check if this column is in a collapsed group
    const isInCollapsedGroup = columnGroups.some(group => {
      return collapsedGroups.has(group.id) && 
             columnIndex >= group.startCol && 
             columnIndex <= group.endCol;
    });
    
    // Check if this row is in a collapsed group
    const isInCollapsedRowGroup = rowGroups.some(group => {
      return collapsedRowGroups.has(group.id) && 
             rowIndex >= group.startRow && 
             rowIndex <= group.endRow;
    });
    
    // Render collapsed cells - just empty cells, no interaction
    if (isInCollapsedGroup || isInCollapsedRowGroup) {
      return <div style={style} />;
    }
    
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
              zoom={zoom}
            />
          </div>
        );
      }
    }
    
    if (!cellData && !spilloverData || isInCollapsedGroup) {
      // Empty cell with Excel-like grid lines (also for collapsed columns)
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
          aria-label={`Cell ${getColumnName(columnIndex)}${rowIndex}, ${isInCollapsedGroup ? 'collapsed' : 'empty'}`}
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
          zoom={zoom}
        />
      </div>
    );
  }, [getColumnWidth, getRowHeight, selectedCell, highlightedCells, onCellClick, darkMode, isPrintMode, accessibilityMode, showGridLines, data.spilloverRanges, zoom, columnGroups, collapsedGroups, rowGroups, collapsedRowGroups]);

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
                  zoom={zoom}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }, [data.mergedCells, getColumnWidth, getRowHeight, onCellClick, darkMode, isPrintMode]);

  // Handle images overlay
  const ImagesOverlay = useMemo(() => {
    if (!data.images?.length) return null;

    return (
      <div className="absolute top-0 left-0 pointer-events-none" style={{ zIndex: 15 }}>
        {data.images.map((image, index) => {
          // Image positions from ExcelJS
          // ExcelJS uses 0-based indexing where 0=A, 1=B, etc.
          // Our grid: col 0=row numbers, col 1=A, col 2=B
          // So ExcelJS col 1 (B) needs to map to grid col 2
          const excelTlCol = image.position.tlCol !== undefined ? image.position.tlCol : image.position.startCol;
          const gridTlRow = Math.floor(image.position.tlRow !== undefined ? image.position.tlRow : image.position.startRow);
          const gridTlCol = Math.floor(excelTlCol) + 1; // Back to original mapping
          
          // Calculate the fractional offset within the starting column
          const colFraction = excelTlCol - Math.floor(excelTlCol);
          
          // Debug logs removed - image positioning working correctly
          
          // Excel appears to use 0-based indexing for image positions
          // brCol ~2 means the image ends at column index 2 (column C in 0-based)
          // Our grid: 0=row header, 1=A, 2=B, 3=C
          // So Excel column 2 needs to map to grid column 3
          const excelBrCol = image.position.brCol !== undefined ? image.position.brCol : image.position.endCol;
          
          const gridBrRow = Math.ceil(image.position.brRow !== undefined ? image.position.brRow : image.position.endRow);
          // For the end position, Excel column 2 (C) should map to grid column 3
          const gridBrCol = Math.ceil(excelBrCol) + 1; // Add 1 for row header offset
          
          
          
          
          // Calculate base position for top-left corner
          const columnWidths = Array.from({ length: gridTlCol }, (_, i) => getColumnWidth(i));
          const baseLeft = columnWidths.reduce((a, b) => a + b, 0);
          const baseTop = Array.from({ length: gridTlRow }, (_, i) => getRowHeight(i)).reduce((a, b) => a + b, 0);
          
          // Convert EMU offsets to pixels
          // Excel uses EMUs (English Metric Units) where 914400 EMUs = 1 inch
          // At 96 DPI: 914400 EMUs = 96 pixels, so 1 pixel = 9525 EMUs
          const EMU_PER_PIXEL = 9525;
          
          // Apply native offsets for precise positioning within the cell
          const colOffsetPixels = (image.position.tlColOffset || 0) / EMU_PER_PIXEL;
          const rowOffsetPixels = (image.position.tlRowOffset || 0) / EMU_PER_PIXEL;
          
          // The offsets are relative to the cell position
          // Apply offsets directly - these represent the precise position from Excel
          const left = baseLeft + colOffsetPixels;
          const top = baseTop + rowOffsetPixels;
          
          
          // Calculate the actual width based on Excel's exact positioning
          const startColumn = Math.floor(excelTlCol);
          const endColumn = Math.floor(excelBrCol);
          
          // Calculate precise width using Excel's fractional column positions
          let width;
          if (startColumn === endColumn) {
            // Image is within a single column
            const columnSpan = excelBrCol - excelTlCol;
            width = getColumnWidth(gridTlCol) * columnSpan;
          } else {
            // Image spans multiple columns
            // Calculate width by summing partial and full column widths
            const startColFraction = excelTlCol - Math.floor(excelTlCol);
            const endColFraction = excelBrCol - Math.floor(excelBrCol);
            
            // Width from partial start column
            const startColWidth = getColumnWidth(Math.floor(excelTlCol) + 1) * (1 - startColFraction);
            
            // Width from full columns in between
            let middleColsWidth = 0;
            for (let col = Math.floor(excelTlCol) + 1; col < Math.floor(excelBrCol); col++) {
              middleColsWidth += getColumnWidth(col + 1); // +1 for row header offset
            }
            
            // Width from partial end column
            const endColWidth = getColumnWidth(Math.floor(excelBrCol) + 1) * endColFraction;
            
            width = startColWidth + middleColsWidth + endColWidth;
          }
          
          // Apply a small reduction factor only if the image appears to have padding
          // This is based on the column offset values - if they're small, the image likely has padding
          const hasLikelyPadding = Math.abs(image.position.tlColOffset || 0) < 100000 && 
                                   Math.abs(image.position.brColOffset || 0) > 1000000;
          const reductionFactor = hasLikelyPadding ? 0.85 : 1.0;
          width = width * reductionFactor;
          
          // Keep the original height calculation
          const baseEndTop = Array.from({ length: gridBrRow }, (_, i) => getRowHeight(i)).reduce((a, b) => a + b, 0);
          const endRowOffsetPixels = (image.position.brRowOffset || 0) / EMU_PER_PIXEL;
          const endTop = baseEndTop + endRowOffsetPixels;
          const height = endTop - top;
          
          // For debugging
          const endLeft = left + width;
          
          // Debug: Uncomment to see image dimensions
          // console.log('[Image Dimensions]', {
          //   width,
          //   height,
          //   columnsSpanned: (excelBrCol - excelTlCol).toFixed(3),
          //   reductionFactor
          // });

          // Skip if dimensions are invalid
          if (width <= 0 || height <= 0) return null;

          
          return (
            <div
              key={`image-${index}-${image.id}`}
              className="absolute pointer-events-auto"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                zIndex: 5 // Images should be above cells but below merged cells
              }}
              title={image.name || `Image ${index + 1}`}
            >
              <img
                src={image.dataUrl}
                alt={image.name || `Excel image ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
                onError={(e) => {
                  console.error(`Failed to load image ${image.id}:`, e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }, [data.images, getColumnWidth, getRowHeight]);

  // Create custom inner element that includes spillover overlays and images
  const innerElementType = useMemo(() => {
    const InnerElement = forwardRef(({ children, style, ...rest }, ref) => {
      // Render images inside the scrollable area
      const imagesInGrid = data.images?.map((image, index) => {
        // Image positions from ExcelJS
        // ExcelJS uses 0-based indexing where 0=A, 1=B, etc.
        // Our grid: col 0=row numbers, col 1=A, col 2=B
        // So ExcelJS col 1 (B) needs to map to grid col 2
        const excelTlCol = image.position.tlCol !== undefined ? image.position.tlCol : image.position.startCol;
        const gridTlRow = Math.floor(image.position.tlRow !== undefined ? image.position.tlRow : image.position.startRow);
        const gridTlCol = Math.floor(excelTlCol) + 1; // Back to original mapping
        
        // Calculate the fractional offset within the starting column
        const colFraction = excelTlCol - Math.floor(excelTlCol);
        
        // Excel appears to use 0-based indexing for image positions
        // brCol ~2 means the image ends at column index 2 (column C in 0-based)
        // Our grid: 0=row header, 1=A, 2=B, 3=C
        // So Excel column 2 needs to map to grid column 3
        const excelBrCol = image.position.brCol !== undefined ? image.position.brCol : image.position.endCol;
        
        const gridBrRow = Math.ceil(image.position.brRow !== undefined ? image.position.brRow : image.position.endRow);
        // For the end position, Excel column 2 (C) should map to grid column 3
        const gridBrCol = Math.ceil(excelBrCol) + 1; // Add 1 for row header offset
        
        // Calculate base position for top-left corner
        const columnWidths = Array.from({ length: gridTlCol }, (_, i) => getColumnWidth(i));
        const baseLeft = columnWidths.reduce((a, b) => a + b, 0);
        const baseTop = Array.from({ length: gridTlRow }, (_, i) => getRowHeight(i)).reduce((a, b) => a + b, 0);
        
        // Convert EMU offsets to pixels
        // Excel uses EMUs (English Metric Units) where 914400 EMUs = 1 inch
        // At 96 DPI: 914400 EMUs = 96 pixels, so 1 pixel = 9525 EMUs
        const EMU_PER_PIXEL = 9525;
        
        // Apply native offsets for precise positioning within the cell
        const colOffsetPixels = (image.position.tlColOffset || 0) / EMU_PER_PIXEL;
        const rowOffsetPixels = (image.position.tlRowOffset || 0) / EMU_PER_PIXEL;
        
        // The offsets are relative to the cell position
        // Apply offsets directly - these represent the precise position from Excel
        const left = baseLeft + colOffsetPixels;
        const top = baseTop + rowOffsetPixels;
        
        // Calculate the actual width based on Excel's exact positioning
        const startColumn = Math.floor(excelTlCol);
        const endColumn = Math.floor(excelBrCol);
        
        // Calculate precise width using Excel's fractional column positions
        let width;
        if (startColumn === endColumn) {
          // Image is within a single column
          const columnSpan = excelBrCol - excelTlCol;
          width = getColumnWidth(gridTlCol) * columnSpan;
        } else {
          // Image spans multiple columns
          // Calculate width by summing partial and full column widths
          const startColFraction = excelTlCol - Math.floor(excelTlCol);
          const endColFraction = excelBrCol - Math.floor(excelBrCol);
          
          // Width from partial start column
          const startColWidth = getColumnWidth(Math.floor(excelTlCol) + 1) * (1 - startColFraction);
          
          // Width from full columns in between
          let middleColsWidth = 0;
          for (let col = Math.floor(excelTlCol) + 1; col < Math.floor(excelBrCol); col++) {
            middleColsWidth += getColumnWidth(col + 1); // +1 for row header offset
          }
          
          // Width from partial end column
          const endColWidth = getColumnWidth(Math.floor(excelBrCol) + 1) * endColFraction;
          
          width = startColWidth + middleColsWidth + endColWidth;
        }
        
        // Apply a small reduction factor only if the image appears to have padding
        // This is based on the column offset values - if they're small, the image likely has padding
        const hasLikelyPadding = Math.abs(image.position.tlColOffset || 0) < 100000 && 
                                 Math.abs(image.position.brColOffset || 0) > 1000000;
        const reductionFactor = hasLikelyPadding ? 0.85 : 1.0;
        width = width * reductionFactor;
        
        // Keep the original height calculation
        const baseEndTop = Array.from({ length: gridBrRow }, (_, i) => getRowHeight(i)).reduce((a, b) => a + b, 0);
        const endRowOffsetPixels = (image.position.brRowOffset || 0) / EMU_PER_PIXEL;
        const endTop = baseEndTop + endRowOffsetPixels;
        const height = endTop - top;
        
        // Skip if dimensions are invalid
        if (width <= 0 || height <= 0) return null;
        
        return (
          <div
            key={`image-${index}-${image.id}`}
            className="absolute pointer-events-auto"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`,
              zIndex: 5 // Images should be above cells but below merged cells
            }}
            title={image.name || `Image ${index + 1}`}
          >
            <img
              src={image.dataUrl}
              alt={image.name || `Excel image ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
              onError={(e) => {
                console.error(`Failed to load image ${image.id}:`, e);
                e.target.style.display = 'none';
              }}
            />
          </div>
        );
      });
      
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
        
        // Skip rendering spillover for very small/hidden rows
        if (sourceHeight <= 5) {
          return null;
        }
        
        // Skip rendering spillover if any columns in the range are collapsed
        const isAnyColumnCollapsed = columnGroups.some(group => {
          return collapsedGroups.has(group.id) && 
                 ((spilloverStartCol >= group.startCol && spilloverStartCol <= group.endCol) ||
                  (spilloverEndCol >= group.startCol && spilloverEndCol <= group.endCol) ||
                  (group.startCol >= spilloverStartCol && group.endCol <= spilloverEndCol));
        });
        
        if (isAnyColumnCollapsed) {
          return null;
        }
        
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
        let paddingLeft = 6 * zoomFactor; // Default padding scaled by zoom
        let paddingRight = 6 * zoomFactor;
        
        // Use spillover alignment if available (from worker calculation)
        if (spillRange.alignment) {
          textAlign = spillRange.alignment;
        }
        
        // Handle indentation
        if (alignment.indent) {
          paddingLeft += alignment.indent * 8 * zoomFactor; // Each indent level is roughly 8px, scaled
        }
        
        // Handle text rotation if present
        const textRotation = alignment.textRotation || 0;
        
        // Extract all font properties and scale by zoom
        const baseFontSize = font.size ? Math.round(font.size * 1.333) : 15;
        const fontSize = baseFontSize * zoomFactor;
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
                paddingTop: `${3 * zoomFactor}px`,
                paddingBottom: `${3 * zoomFactor}px`,
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
          {imagesInGrid}
          {spilloverOverlays}
        </div>
      );
    });
    
    InnerElement.displayName = 'ExcelSheetInnerElement';
    return InnerElement;
  }, [data.spilloverRanges, data.images, getColumnWidth, getRowHeight, darkMode, isPrintMode, zoomFactor, columnGroups, collapsedGroups]);

  // Don't render Grid until dimensions are ready to prevent misalignment
  if (!dimensionsReady && data.columnWidths) {
    return (
      <div 
        className={`relative ${darkMode ? 'bg-navy-900' : 'bg-white'} ${isPrintMode ? 'print:bg-white' : ''}`} 
        style={{ width, height }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4"></div>
            <p>Loading sheet...</p>
          </div>
        </div>
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
        key={`grid-${zoom}`}  // Force re-render when zoom changes
        ref={gridRef}
        className={`${styles['excel-grid']} excel-grid`}
        columnCount={totalColumns}
        columnWidth={getColumnWidth}
        height={height}
        rowCount={totalRows}
        rowHeight={getRowHeight}
        width={width}
        onScroll={handleScroll}
        overscanColumnCount={2}  // Reduce from default to minimize memory usage
        overscanRowCount={2}     // Reduce from default to minimize memory usage
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