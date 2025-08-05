// Excel Processing Web Worker
// Handles all heavy Excel parsing and processing off the main thread

// Remove the ExcelJS variable declaration to avoid shadowing the global
let memoryCheckInterval = null;
let taskCount = 0;
const MAX_TASKS_BEFORE_RECYCLE = 100;

// Load ExcelJS library from local file
try {
  self.importScripts('/js/exceljs.min.js');
  // Verify ExcelJS is available
  if (typeof self.ExcelJS === 'undefined') {
    throw new Error('ExcelJS not found on self after import');
  }
  console.log('ExcelJS loaded successfully:', typeof self.ExcelJS);
} catch (error) {
  console.error('Failed to load ExcelJS:', error);
  self.postMessage({
    type: 'ERROR',
    error: {
      message: 'Failed to load ExcelJS library: ' + error.message,
      stack: error.stack
    }
  });
}

// Memory monitoring
function checkMemory() {
  if (self.performance && self.performance.memory) {
    const memory = self.performance.memory;
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);
    
    // Send memory update
    self.postMessage({
      type: 'MEMORY_UPDATE',
      data: {
        usedMB: usedMB.toFixed(2),
        limitMB: limitMB.toFixed(2),
        percentUsed: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
      }
    });
    
    // Check if we should suggest recycling
    if (usedMB > 512 || taskCount >= MAX_TASKS_BEFORE_RECYCLE) {
      self.postMessage({
        type: 'RECYCLE_SUGGESTED',
        data: {
          reason: usedMB > 512 ? 'high_memory' : 'task_limit',
          memoryUsed: usedMB,
          taskCount: taskCount
        }
      });
    }
  }
}

// Start memory monitoring
memoryCheckInterval = setInterval(checkMemory, 5000);

// Notify that worker is ready
self.postMessage({ type: 'READY' });

self.onmessage = async function(e) {
  const { type, data, id } = e.data;
  
  try {
    taskCount++;
    
    switch (type) {
      case 'LOAD_WORKBOOK':
        await loadWorkbook(data, id);
        break;
      case 'PROCESS_SHEET':
        await processSheet(data, id);
        break;
      case 'GET_CELL_RANGE':
        await getCellRange(data, id);
        break;
      case 'SEARCH_IN_SHEET':
        await searchInSheet(data, id);
        break;
      case 'GET_MEMORY_INFO':
        checkMemory();
        break;
      case 'CLEAR_CACHE':
        clearCache();
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
      id: id
    });
  }
};

async function loadWorkbook(data, id) {
  try {
    const { arrayBuffer } = data;
    // console.log('loadWorkbook called with ArrayBuffer size:', arrayBuffer.byteLength);
    
    // Check if ExcelJS is available
    if (typeof self.ExcelJS === 'undefined' || !self.ExcelJS.Workbook) {
      throw new Error('ExcelJS or ExcelJS.Workbook is not available');
    }
    
    // Initialize ExcelJS
    // console.log('Creating new ExcelJS.Workbook...');
    const workbook = new self.ExcelJS.Workbook();
    
    // Special handling for .xlsm files (macro-enabled workbooks)
    try {
      // console.log('Attempting standard load...');
      await workbook.xlsx.load(arrayBuffer);
      // console.log('Standard load successful');
    } catch (xlsxError) {
      console.warn('Standard load failed:', xlsxError.message);
      // If standard load fails, try with options
      try {
        // console.log('Attempting load with options...');
        await workbook.xlsx.load(arrayBuffer, {
          ignoreVBA: true,
          cellDates: true,
          cellNF: false,
          cellStyles: true
        });
        // console.log('Load with options successful');
      } catch (secondError) {
        console.warn('Load with options failed:', secondError.message);
        // Final fallback - try to parse as buffer
        // console.log('Attempting buffer load...');
        const buffer = new Uint8Array(arrayBuffer);
        await workbook.xlsx.load(buffer);
        // console.log('Buffer load successful');
      }
    }
    
    // Extract basic workbook info including visibility state
    const worksheets = workbook.worksheets.map((sheet, index) => {
      // ExcelJS stores visibility in sheet.state
      // Possible values: 'visible', 'hidden', 'veryHidden'
      // console.log(`Sheet ${index} "${sheet.name}" state:`, sheet.state);
      
      return {
        id: sheet.id,
        name: sheet.name,
        originalIndex: index,  // Store the original index in workbook.worksheets
        rowCount: sheet.actualRowCount || sheet.lastRow?.number || 100,
        columnCount: sheet.actualColumnCount || sheet.lastColumn?.number || 50,
        state: sheet.state || 'visible',  // Default to visible if not specified
        isHidden: sheet.state === 'hidden' || sheet.state === 'veryHidden'
      };
    });
    
    // Include ALL sheets (visible and hidden) but mark their visibility
    // This ensures indices match the original workbook
    const finalWorksheets = worksheets;
    
    // console.log('All worksheets loaded:', finalWorksheets.map(s => ({
    //   index: s.originalIndex,
    //   name: s.name,
    //   state: s.state,
    //   isHidden: s.isHidden
    // })));
    
    // Debug: Check workbook for custom number formats
    // if (workbook.model && workbook.model.styles) {
    //   console.log('[Workbook] Has styles model:', {
    //     numFmts: workbook.model.styles.numFmts,
    //     numFmtCount: workbook.model.styles.numFmts ? Object.keys(workbook.model.styles.numFmts).length : 0
    //   });
    // }
    // if (workbook._themes) {
    //   console.log('[Workbook] Has themes');
    // }
    // if (workbook._styles) {
    //   console.log('[Workbook] Has _styles:', {
    //     numFmts: workbook._styles.numFmts
    //   });
    // }
    
    self.postMessage({
      type: 'WORKBOOK_LOADED',
      data: {
        worksheets: finalWorksheets,
        properties: workbook.properties || {}
      },
      id: id
    });
    
    // Store workbook and sheet mapping for later use
    self.workbook = workbook;
    self.worksheetMapping = finalWorksheets;
    // Clear formula cache when loading new workbook
    self.formulaCache = new Map();
  } catch (error) {
    throw new Error(`Failed to load workbook: ${error.message}`);
  }
}

async function processSheet(data, id) {
  const { sheetIndex, viewportStart, viewportEnd } = data;
  
  // console.log('processSheet called:', { sheetIndex, viewportStart, viewportEnd });
  
  // Debug flag for style debugging
  const debugStyles = self.location?.search?.includes('debug=styles');
  
  if (!self.workbook) {
    throw new Error('No workbook loaded');
  }
  
  // Since we're now keeping all sheets with their original indices,
  // we can directly use the sheetIndex
  const worksheet = self.workbook.worksheets[sheetIndex];
  if (!worksheet) {
    throw new Error(`Sheet at index ${sheetIndex} not found. Available sheets: ${self.workbook.worksheets.length}`);
  }
  
  // Check if this sheet is hidden
  const sheetInfo = self.worksheetMapping?.[sheetIndex];
  if (sheetInfo?.isHidden) {
    console.warn(`Sheet "${worksheet.name}" at index ${sheetIndex} is hidden`);
  }
  
  // console.log(`Processing sheet "${worksheet.name}" (index: ${sheetIndex}, state: ${worksheet.state || 'visible'})`);
  
  // Debug: Check worksheet model for number formats
  // if (worksheet.model && worksheet.model.cols) {
  //   console.log('[Worker] Worksheet has column definitions with potential formats');
  // }
  
  // Get actual data bounds (not full worksheet dimensions)
  // Use actualRowCount/actualColumnCount to get the last row/column with actual data
  // But ensure we always include at least the first row and column (even if empty)
  const actualLastRow = Math.max(worksheet.actualRowCount || worksheet.lastRow?.number || 100, 1);
  const actualLastCol = Math.max(worksheet.actualColumnCount || worksheet.lastColumn?.number || 50, 1);
  
  // Process only the visible viewport for performance
  // Always ensure we include row 1 and column 1 even if viewport starts later
  const startRow = 1; // Always start from row 1 to include header/spacer rows
  const endRow = Math.min(viewportEnd?.row || actualLastRow, actualLastRow);
  const startCol = 1; // Always start from column 1 to include header/spacer columns
  const endCol = Math.min(viewportEnd?.col || actualLastCol, actualLastCol);
  
  // Only log in debug mode to reduce console noise
  // console.log(`[Worker] Processing actual data range: rows ${startRow}-${endRow}, cols ${startCol}-${endCol} (actual bounds: ${actualLastRow}×${actualLastCol})`);
  
  // Debug: Check if D26 is in the viewport
  // const colD = 4; // Column D is the 4th column
  // if (startRow <= 26 && endRow >= 26 && startCol <= colD && endCol >= colD) {
  //   console.log('[Viewport] D26 is in viewport range');
  // } else {
  //   console.log('[Viewport] D26 is NOT in viewport range', {
  //     rowInRange: startRow <= 26 && endRow >= 26,
  //     colInRange: startCol <= colD && endCol >= colD
  //   });
  // }
  
  const processedData = {
    cells: [],
    mergedCells: [],
    columnWidths: {},
    rowHeights: {},
    frozenRows: worksheet.views?.[0]?.ySplit || 0,
    frozenCols: worksheet.views?.[0]?.xSplit || 0,
    defaultColWidth: worksheet.properties?.defaultColWidth,
    defaultRowHeight: worksheet.properties?.defaultRowHeight,
    // Extract gridline visibility setting (default is true in Excel)
    showGridLines: worksheet.views?.[0]?.showGridLines !== false,
    columnOutlines: [], // Store column grouping information
    rowOutlines: [] // Store row grouping information
  };
  
  // console.log('Worksheet properties:', {
  //   defaultColWidth: worksheet.properties?.defaultColWidth,
  //   defaultRowHeight: worksheet.properties?.defaultRowHeight,
  //   outlineProperties: worksheet.properties?.outlineProperties
  // });
  
  // Process column widths, hidden state, and outline levels
  if (worksheet.columns && worksheet.columns.length > 0) {
    // console.log('Processing worksheet.columns:', worksheet.columns.length);
    worksheet.columns.forEach((col, index) => {
      if (col) {
        // Check if column is hidden
        if (col.hidden === true) {
          processedData.columnWidths[index + 1] = 0; // Set width to 0 for hidden columns
          // console.log(`Column ${index + 1} is hidden`);
        } else if (col.width !== undefined && col.width !== null) {
          // Store column widths with 1-based indexing to match Excel
          // Only store if width is different from default
          if (col.width !== worksheet.properties?.defaultColWidth) {
            processedData.columnWidths[index + 1] = col.width;
          }
        }
        
        // Check for outline level (grouping)
        if (col.outlineLevel !== undefined && col.outlineLevel > 0) {
          processedData.columnOutlines.push({
            column: index + 1,
            level: col.outlineLevel,
            collapsed: col.collapsed || false
          });
          // console.log(`Column ${index + 1} has outline level ${col.outlineLevel}`);
        }
      }
    });
  }
  
  // Also check for column info in the worksheet model (different storage format)
  if (worksheet.model && worksheet.model.cols && worksheet.model.cols.length > 0) {
    // console.log('Found worksheet.model.cols:', worksheet.model.cols.length);
    worksheet.model.cols.forEach((colDef) => {
      if (colDef) {
        // Check if column is hidden
        if (colDef.hidden === true) {
          const maxCol = Math.min(colDef.max || colDef.min, 100);
          for (let i = colDef.min; i <= maxCol; i++) {
            processedData.columnWidths[i] = 0; // Set width to 0 for hidden columns
            // console.log(`Column ${i} is hidden (from model)`);
          }
        } else if (colDef.width !== undefined) {
          // Only process columns within reasonable range (up to column 100)
          const maxCol = Math.min(colDef.max || colDef.min, 100);
          for (let i = colDef.min; i <= maxCol; i++) {
            if (!processedData.columnWidths[i]) { // Don't override if already set
              processedData.columnWidths[i] = colDef.width;
            }
          }
        }
        
        // Check for outline level in model columns
        if (colDef.outlineLevel !== undefined && colDef.outlineLevel > 0) {
          const maxCol = Math.min(colDef.max || colDef.min, 100);
          for (let i = colDef.min; i <= maxCol; i++) {
            processedData.columnOutlines.push({
              column: i,
              level: colDef.outlineLevel,
              collapsed: colDef.collapsed || false
            });
            // console.log(`Column ${i} has outline level ${colDef.outlineLevel} (from model)`);
          }
        }
      }
    });
  }
  
  // Log actual column widths found
  // const columnCount = Object.keys(processedData.columnWidths).length;
  // console.log(`Actual column widths set: ${columnCount}`);
  // if (columnCount > 0 && columnCount < 50) {
  //   console.log('Column widths:', processedData.columnWidths);
  // }
  
  // Process rows and cells
  let cellCount = 0;
  const spilloverRanges = []; // Track text spillover ranges
  
  for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
    try {
      const row = worksheet.getRow(rowNum);
      if (row) {
        // Check if row is hidden
        if (row.hidden === true) {
          processedData.rowHeights[rowNum] = 0; // Set height to 0 for hidden rows
          // console.log(`Row ${rowNum} is hidden`);
        } else if (row.height) {
          // ExcelJS provides row height in points (not pixels)
          processedData.rowHeights[rowNum] = row.height;
        }
        
        // Check for outline level (grouping)
        if (row.outlineLevel !== undefined && row.outlineLevel > 0) {
          processedData.rowOutlines.push({
            row: rowNum,
            level: row.outlineLevel,
            collapsed: row.collapsed || false
          });
          // console.log(`Row ${rowNum} has outline level ${row.outlineLevel}`);
        }
      }
      
      // Debug: Check row model for styles
      // if (rowNum <= 5 && row.model && row.model.cells) {
      //   const cellsWithFormats = row.model.cells.filter(c => c && c.style && c.style.numFmt);
      //   if (cellsWithFormats.length > 0) {
      //     console.log(`[Row ${rowNum}] Cells with numFmt in model:`, cellsWithFormats.map(c => ({
      //       address: c.address,
      //       numFmt: c.style.numFmt
      //     })));
      //   }
      // }
      
      for (let colNum = startCol; colNum <= endCol; colNum++) {
        const cell = row.getCell(colNum);
        if (cell) {
          // Add cell address for debugging
          cell.fullAddress = cell.address || `${getColumnName(colNum)}${rowNum}`;
          
          // Debug blue font colors that might not be showing
          if (colNum === 9 && rowNum === 26) { // Cell I26 specifically
            console.log(`========== CELL I26 DEBUG ==========`);
            console.log(`[Font Color Debug] Cell I26:`, {
              hasFont: !!cell.font,
              color: cell.font?.color,
              colorType: typeof cell.font?.color,
              fullFont: cell.font,
              style: cell.style,
              _style: cell._style,
              model: cell.model,
              value: cell.value,
              type: cell.type,
              worksheet: worksheet.name
            });
            
            if (cell.font && cell.font.color) {
              console.log('[I26 Color Details]:', {
                isThemeColor: cell.font.color?.theme !== undefined,
                theme: cell.font.color?.theme,
                tint: cell.font.color?.tint,
                argb: cell.font.color?.argb,
                rgb: cell.font.color?.rgb,
                rawColor: cell.font.color
              });
              console.log('[I26 Raw Color Object]:', JSON.stringify(cell.font.color, null, 2));
              
              // If it's a theme color, we need to resolve it
              if (cell.font.color?.theme !== undefined) {
                console.log('[I26 Theme Color] Need to resolve theme:', cell.font.color.theme, 'with tint:', cell.font.color.tint);
                const resolvedColor = resolveThemeColor(cell.font.color);
                console.log('[I26 Resolved Color]:', resolvedColor);
              }
              
              // If it's an indexed color, resolve it
              if (cell.font.color?.indexed !== undefined) {
                console.log('[I26 Indexed Color] Index:', cell.font.color.indexed);
                const resolvedColor = resolveThemeColor(cell.font.color);
                console.log('[I26 Resolved Indexed Color]:', resolvedColor);
              }
            }
            console.log(`========== END CELL I26 DEBUG ==========`);
          }
          
          // Deep inspection for custom formats
          // if (rowNum <= 10 && colNum <= 10) {
          //   const deepInspect = {
          //     address: cell.fullAddress,
          //     value: cell.value,
          //     type: cell.type,
          //     numFmt: cell.numFmt,
          //     style: cell.style,
          //     _style: cell._style,
          //     model: cell.model,
          //     master: cell.master,
          //     $: cell.$,
          //     _value: cell._value,
          //     _numFmt: cell._numFmt
          //   };
          //   
          //   // Check if any property contains quotes (custom format indicator)
          //   const hasCustomFormat = Object.values(deepInspect).some(v => 
          //     typeof v === 'string' && v.includes('"')
          //   );
          //   
          //   if (hasCustomFormat) {
          //     console.log('[Deep Format Inspection] Found custom format:', deepInspect);
          //   }
          // }
          
          // Check if cell has any formatting even if no value
          const cellStyle = extractCellStyle(cell);
          const hasStyle = cellStyle && Object.keys(cellStyle).length > 0;
          const hasValue = cell.value !== null && cell.value !== undefined;
          
          // Debug D26 inclusion
          if (getColumnName(colNum) === 'D' && rowNum === 26) {
            console.log('========== CELL D26 DEBUG ==========');
            console.log('[D26] Cell properties:', {
              value: cell.value,
              type: cell.type,
              numFmt: cell.numFmt,
              style: cell.style,
              _style: cell._style,
              model: cell.model,
              formula: cell.formula,
              result: cell.result
            });
            console.log('[D26] Extracted style:', cellStyle);
            console.log('[D26] Number format:', cellStyle?.numberFormat);
            console.log('[D26] Inclusion check:', {
              hasValue,
              hasStyle,
              willInclude: hasValue || hasStyle,
              cellValue: cell.value,
              styleKeys: cellStyle ? Object.keys(cellStyle) : []
            });
            console.log('========== END D26 DEBUG ==========');
          }
          
          // Include cell if it has a value OR if it has styling
          if (hasValue || hasStyle) {
            const cellValue = getCellValue(cell);
            
            
            const cellData = {
              row: rowNum,
              col: colNum,
              value: cellValue,
              style: cellStyle,
              formula: cell.formula,
              type: cell.type
            };
            
            // Fix for "Invalid Date" text in formula cells
            if (cell.text === 'Invalid Date' && cell.type === 6 && cell.formula) {
              // Don't use the invalid date text, rely on getCellValue instead
              cellData.value = cellValue;
            }
            
            // Debug log for cells that might display as accounting zeros
            // if (cellValue === 0 && cellStyle.numberFormat && cellStyle.numberFormat.includes('_')) {
            //   console.log(`[Accounting Zero] Cell ${getColumnName(colNum)}${rowNum}:`, {
            //     value: cellValue,
            //     format: cellStyle.numberFormat
            //   });
            // }
            
            // Debug cell D26 specifically
            // if (getColumnName(colNum) === 'D' && rowNum === 26) {
            //   console.log(`[Worker D26] Cell D26 found:`, {
            //     value: cellValue,
            //     format: cellStyle.numberFormat,
            //     hasFormat: !!cellStyle.numberFormat,
            //     cellType: cell.type,
            //     formula: cell.formula,
            //     rawCell: {
            //       value: cell.value,
            //       type: cell.type,
            //       numFmt: cell.numFmt,
            //       style: cell.style
            //     }
            //   });
            // }
            
            // Debug log for format extraction - disabled for performance
            // if (cellStyle.numberFormat && rowNum <= 50 && colNum <= 20) {
            //   console.log(`[Format Debug] Cell ${getColumnName(colNum)}${rowNum}:`, {
            //     format: cellStyle.numberFormat,
            //     value: cellValue,
            //     type: typeof cellValue,
            //     cellNumFmt: cell.numFmt,
            //     cellStyle: cell.style,
            //     cell_style: cell._style,
            //     cellModel: cell.model,
            //     cellDataValidation: cell.dataValidation,
            //     actualNumFmt: cell.actualNumFmt
            //   });
            // }
            
            processedData.cells.push(cellData);
            
            // Debug B4 and B5 alignment specifically
            if (worksheet.name === "Unit Mix - Rent Roll" && colNum === 2 && (rowNum === 4 || rowNum === 5)) {
              console.log(`[Final Cell Data] B${rowNum}:`, {
                value: cellData.value,
                style: cellData.style,
                hasAlignment: !!cellData.style?.alignment,
                alignmentIndent: cellData.style?.alignment?.indent,
                rawCell: cell
              });
              
              // Check if there's any spillover in the same column
              const spilloverInColumn = processedData.spilloverRanges?.find(range => 
                range.sourceCol === colNum || (range.startCol <= colNum && range.endCol >= colNum)
              );
              if (spilloverInColumn) {
                console.log(`[Spillover Check] B${rowNum} has spillover in column:`, spilloverInColumn);
              }
            }
            cellCount++;
            
            // Calculate text spillover if text content exists
            if (cellValue && typeof cellValue === 'string' && cellValue.length > 0) {
              const spillRange = calculateSpilloverRange(cellValue, rowNum, colNum, processedData.columnWidths, worksheet, cellData.style);
              if (spillRange.needsSpillover) {
                spilloverRanges.push(spillRange);
              }
            }
            
            // Log first few cells for debugging
            // if (cellCount <= 5) {
            //   console.log(`Cell [${rowNum},${colNum}]:`, cellData.value || '(empty with style)');
            // }
            
            // Special logging for cells showing [object Object]
            if (String(cellData.value) === '[object Object]') {
              console.error('[WORKER: OBJECT DETECTED] Cell with [object Object]:', {
                address: `${getColumnName(colNum)}${rowNum}`,
                row: rowNum,
                col: colNum,
                rawCell: cell,
                cellValue: cell.value,
                processedValue: cellData.value,
                cellType: cell.type,
                cellModel: cell.model,
                getCellValueResult: getCellValue(cell),
                directValue: cell.value
              });
              
              // Force return a string to fix the issue
              cellData.value = cell.text || cell.value?.toString() || '';
            }
            
            // Debug formula cells to understand value extraction
            if (cell.type === 6 && cell.formula) {
              // Log different ways ExcelJS might store the value
              const debugInfo = {
                formula: cell.formula,
                cellValue: cell.value,
                cellText: cell.text,
                cellResult: cell.result,
                model: cell.model,
                hasSharedFormula: !!(cell.value && cell.value.sharedFormula),
                valueType: typeof cell.value,
                isDate: cell.value instanceof Date,
                isInvalidDate: cell.value instanceof Date && isNaN(cell.value.getTime()),
                // Check if there's a _value property
                _value: cell._value,
                // Check various model properties
                modelValue: cell.model?.value,
                modelSharedValue: cell.model?.sharedValue,
                // Raw cell properties
                rawProperties: Object.keys(cell).filter(k => !k.startsWith('_'))
              };
              
              // Only log for problematic cells or specific debug scenarios
              if (cell.text === 'Invalid Date' || (worksheet.name === "Unit Mix - Rent Roll" && colNum === 2 && (rowNum === 4 || rowNum === 5))) {
                console.log(`[Formula Debug] Cell ${getColumnName(colNum)}${rowNum}:`, debugInfo);
                // Also log the style to check for indentation
                console.log(`[Style Debug] Cell ${getColumnName(colNum)}${rowNum} style:`, cellData.style);
                // Check the raw cell alignment
                if (cell.alignment) {
                  console.log(`[Style Debug] Cell ${getColumnName(colNum)}${rowNum} raw alignment:`, cell.alignment);
                }
              }
            }
            
            // Special logging for cells with background fill but no value (only when debugging)
            // if (debugStyles && !hasValue && cellStyle.fill) {
            //   console.log(`[Background Fill] Empty cell with background at [${rowNum},${colNum}]:`, {
            //     fill: cellStyle.fill,
            //     allStyles: cellStyle
            //   });
            // }
          }
        }
      }
    } catch (rowError) {
      // Skip problematic rows
      console.warn(`Error processing row ${rowNum}:`, rowError);
    }
  }
  
  // Count cells with and without values
  const cellsWithValues = processedData.cells.filter(c => c.value !== null && c.value !== undefined && c.value !== '').length;
  const cellsWithOnlyStyle = processedData.cells.filter(c => (!c.value || c.value === '') && c.style && Object.keys(c.style).length > 0).length;
  const cellsWithBgOnly = processedData.cells.filter(c => (!c.value || c.value === '') && c.style?.fill).length;
  
  // console.log(`Processed ${cellCount} total cells:`);
  // console.log(`  - ${cellsWithValues} cells with values`);
  // console.log(`  - ${cellsWithOnlyStyle} empty cells with formatting`);
  // console.log(`  - ${cellsWithBgOnly} empty cells with background fill`);
  // console.log('Column widths extracted:', Object.keys(processedData.columnWidths).length);
  // console.log('Row heights extracted:', Object.keys(processedData.rowHeights).length);
  
  // Log sample empty cells with background
  // if (cellsWithBgOnly > 0) {
  //   const sampleBgCells = processedData.cells
  //     .filter(c => (!c.value || c.value === '') && c.style?.fill)
  //     .slice(0, 3)
  //     .map(c => ({
  //       position: `[${c.row},${c.col}]`,
  //       fill: c.style.fill
  //     }));
  //   console.log('Sample empty cells with background:', sampleBgCells);
  // }
  
  // Log sample of actual dimensions for debugging
  // const sampleCols = Object.entries(processedData.columnWidths).slice(0, 5);
  // const sampleRows = Object.entries(processedData.rowHeights).slice(0, 5);
  // console.log('Sample column widths:', sampleCols);
  // console.log('Sample row heights:', sampleRows);
  
  // Debug: Log style statistics
  // if (debugStyles) {
  //   const cellsWithStyles = processedData.cells.filter(c => c.style && Object.keys(c.style).length > 0);
  //   console.log('[Worker Style Debug] Transmission stats:', {
  //     totalCells: processedData.cells.length,
  //     cellsWithStyles: cellsWithStyles.length,
  //     styleTypes: {
  //       font: cellsWithStyles.filter(c => c.style.font).length,
  //       fill: cellsWithStyles.filter(c => c.style.fill).length,
  //       border: cellsWithStyles.filter(c => c.style.border).length,
  //       alignment: cellsWithStyles.filter(c => c.style.alignment).length,
  //       numberFormat: cellsWithStyles.filter(c => c.style.numberFormat).length
  //     },
  //     sampleCellsWithStyles: cellsWithStyles.slice(0, 3).map(c => ({
  //       cell: `${c.row}-${c.col}`,
  //       value: c.value,
  //       style: c.style
  //     }))
  //   });
  // }
  
  // Process merged cells in viewport
  if (worksheet.model && worksheet.model.merges) {
    worksheet.model.merges.forEach(merge => {
      try {
        const [startCell, endCell] = merge.split(':');
        const start = parseCellAddress(startCell);
        const end = parseCellAddress(endCell);
        
        if (start.row >= startRow && start.row <= endRow &&
            start.col >= startCol && start.col <= endCol) {
          processedData.mergedCells.push({
            startRow: start.row,
            startCol: start.col,
            endRow: end.row,
            endCol: end.col
          });
        }
      } catch (mergeError) {
        console.warn(`Error processing merge ${merge}:`, mergeError);
      }
    });
  }
  
  // Add spillover ranges to processed data
  processedData.spilloverRanges = spilloverRanges;
  
  console.log(`[Spillover] Found ${spilloverRanges.length} spillover ranges:`, 
    spilloverRanges.map(r => `${getColumnName(r.sourceCol)}${r.sourceRow} (${r.alignment}) → ${getColumnName(r.startCol)}-${getColumnName(r.endCol)}`)
  );
  
  
  self.postMessage({
    type: 'SHEET_PROCESSED',
    data: processedData,
    id: id
  });
}

// Function to resolve formula references to get actual values
function resolveFormulaReference(formula) {
  if (!self.workbook || !formula) return null;
  
  // Check cache first
  if (self.formulaCache.has(formula)) {
    return self.formulaCache.get(formula);
  }
  
  // Parse simple cell references like "SheetName!A1" or "SheetName!$A$1"
  const cellRefPattern = /^([^!]+)!(\$?[A-Z]+\$?\d+)$/i;
  const match = formula.match(cellRefPattern);
  
  if (match) {
    const [_, sheetName, cellRef] = match;
    
    try {
      // Find the worksheet
      const worksheet = self.workbook.worksheets.find(ws => ws.name === sheetName);
      if (!worksheet) {
        console.warn(`Sheet "${sheetName}" not found for formula: ${formula}`);
        return null;
      }
      
      // Remove $ signs from cell reference
      const cleanCellRef = cellRef.replace(/\$/g, '');
      
      // Get the cell
      const targetCell = worksheet.getCell(cleanCellRef);
      if (targetCell) {
        // Debug the source cell if it's one we're tracking
        if (sheetName === "Underwriting" && (cleanCellRef === "B96" || cleanCellRef === "B97")) {
          console.log(`[Formula Source] ${sheetName}!${cleanCellRef}:`, {
            value: targetCell.value,
            style: targetCell.style,
            alignment: targetCell.style?.alignment,
            indent: targetCell.style?.alignment?.indent
          });
        }
        
        // Get the actual value, avoiding recursive formula lookups
        let value = null;
        if (targetCell.value !== null && targetCell.value !== undefined) {
          // For non-formula cells or cells with resolved values
          if (targetCell.type !== 6 || typeof targetCell.value !== 'object') {
            value = targetCell.value;
          } else if (targetCell.value && typeof targetCell.value === 'object') {
            // For formula cells, try to get the cached result
            if (targetCell.value.result !== undefined) {
              value = targetCell.value.result;
            }
          }
        }
        
        // Cache the result
        self.formulaCache.set(formula, value);
        return value;
      }
    } catch (error) {
      console.warn(`Error resolving formula reference "${formula}":`, error);
    }
  }
  
  return null;
}

function getCellValue(cell) {
  if (cell.value === null || cell.value === undefined) return '';
  
  
  // For formula cells, ExcelJS stores the formula in cell.formula and the result in cell.value
  // Type 6 is formula in ExcelJS
  if (cell.formula && cell.type === 6) {
    // Check if value is an Invalid Date first
    if (cell.value instanceof Date && isNaN(cell.value.getTime())) {
      // Try to resolve the formula reference
      const resolvedValue = resolveFormulaReference(cell.formula);
      if (resolvedValue !== null) {
        return resolvedValue;
      }
      return '';
    }
    
    // If value is primitive (string, number, boolean), it's already the calculated result
    if (typeof cell.value !== 'object' || cell.value instanceof Date) {
      // Return the value - this includes 0, false, empty string, etc.
      // Make sure we preserve numeric 0
      return cell.value;
    }
    
    // Handle shared formula case
    if (cell.value && cell.value.sharedFormula) {
      // Check if there's also a result property
      if (cell.value.result !== undefined) {
        // Check if the result is an error object
        if (typeof cell.value.result === 'object' && cell.value.result.error) {
          return cell.value.result.error;
        }
        return cell.value.result;
      }
      // For shared formulas without results, the value might be stored directly
      // Continue to regular object handling instead of returning empty
    }
    
    // If it's an object, try to extract the result
    if (cell.value && cell.value.result !== undefined) {
      // Check if the result itself is an error object
      if (typeof cell.value.result === 'object' && cell.value.result.error) {
        return cell.value.result.error;
      }
      // Debug formula results
      // if (cell.numFmt && cell.numFmt.includes('"')) {
      //   console.log('[getCellValue] Formula cell with custom format:', {
      //     address: cell.fullAddress,
      //     formula: cell.value.formula,
      //     result: cell.value.result,
      //     numFmt: cell.numFmt
      //   });
      // }
      
      // Check if result is an Invalid Date
      if (cell.value.result instanceof Date && isNaN(cell.value.result.getTime())) {
        // Invalid Date - this means ExcelJS couldn't parse the formula result
        // Try to resolve the formula reference to get the actual value
        const resolvedValue = resolveFormulaReference(cell.formula);
        if (resolvedValue !== null) {
          return resolvedValue;
        }
        // If we can't resolve it, return empty string
        return '';
      }
      
      return cell.value.result;
    }
    if (cell.value && cell.value.error) {
      return `#${cell.value.error}`;
    }
    // Continue to object handling below
  }
  
  // First check if cell has a direct result property (for formula cells)
  if (cell.result !== undefined) {
    // Check if the result is an Invalid Date
    if (cell.result instanceof Date && isNaN(cell.result.getTime())) {
      // Return empty string for Invalid Date results
      return '';
    }
    return cell.result;
  }
  
  // Handle different value types
  if (cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join('');
  }
  
  if (cell.value instanceof Date) {
    // Check if it's an Invalid Date
    if (isNaN(cell.value.getTime())) {
      // This is an Invalid Date, which likely means ExcelJS tried to parse
      // a text value as a date. Return empty string to avoid displaying "Invalid Date"
      return '';
    }
    // Convert Date to Excel serial number for proper formatting
    // Excel dates start from Jan 1, 1900 (with leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const msPerDay = 24 * 60 * 60 * 1000;
    const excelSerial = (cell.value.getTime() - excelEpoch.getTime()) / msPerDay;
    return excelSerial;
  }
  
  if (typeof cell.value === 'object' && cell.value.error) {
    return `#${cell.value.error}`;
  }
  
  // Handle formula cells (legacy format where formula is in value object)
  if (typeof cell.value === 'object' && cell.value.formula) {
    // If we have a result, return it (even if it's empty string)
    if (cell.value.result !== undefined) {
      // Check if the result is an error object
      if (typeof cell.value.result === 'object' && cell.value.result.error) {
        return cell.value.result.error;
      }
      return cell.value.result;
    }
    // If no result, return empty string
    return '';
  }
  
  // Handle hyperlink
  if (typeof cell.value === 'object' && cell.value.hyperlink) {
    return cell.value.text || cell.value.hyperlink;
  }
  
  // Handle shared string reference (sometimes appears as object)
  if (typeof cell.value === 'object' && cell.value.sharedString !== undefined) {
    return cell.value.sharedString;
  }
  
  // Check if it's an ExcelJS SharedString object
  if (typeof cell.value === 'object' && cell.value !== null) {
    // ExcelJS sometimes stores values in nested structures
    // Check for _value property (internal ExcelJS structure)
    if (cell.value._value !== undefined) {
      return getCellValue({ value: cell.value._value, fullAddress: cell.fullAddress });
    }
    
    // Check for common object patterns
    if (cell.value.text !== undefined) return cell.value.text;
    if (cell.value.value !== undefined) return cell.value.value;
    
    // Check if it's a shared formula with a numeric result in the reference
    if (cell.value.sharedFormula !== undefined) {
      // Only return empty for shared formulas with no other properties
      if (Object.keys(cell.value).length === 1) {
        return '';
      }
      // Otherwise continue trying to extract the value
    }
    
    // Check if it's a wrapped primitive
    if (cell.value.valueOf && typeof cell.value.valueOf === 'function') {
      const primitiveValue = cell.value.valueOf();
      if (typeof primitiveValue !== 'object') {
        return primitiveValue;
      }
    }
    
    // Log the unexpected object structure for debugging
    console.warn('[Object Value] Unexpected cell value object structure:', {
      cellAddress: cell.fullAddress || `R${cell.row || '?'}C${cell.col || '?'}`,
      rawValue: cell.value,
      valueType: typeof cell.value,
      valueConstructor: cell.value.constructor?.name,
      valueKeys: Object.keys(cell.value || {}),
      cellType: cell.type,
      formula: cell.formula,
      valueString: String(cell.value),
      hasValueOf: typeof cell.value.valueOf === 'function',
      valueOfResult: typeof cell.value.valueOf === 'function' ? cell.value.valueOf() : 'N/A'
    });
    
    // Try toString() method
    if (typeof cell.value.toString === 'function' && cell.value.toString !== Object.prototype.toString) {
      return cell.value.toString();
    }
    
    // Last resort - return empty string for unhandled objects
    console.error('[Worker getCellValue] Unhandled object, returning empty string:', {
      cellAddress: cell.fullAddress || 'unknown',
      value: cell.value
    });
    return '';
  }
  
  // Ensure we always return a primitive
  if (typeof cell.value === 'object') {
    console.error('[Worker getCellValue] WARNING: Returning object value:', cell.value);
  }
  
  return cell.value;
}

// Theme colors mapping for Excel - Financial model blue theme
// These map to common financial model themes that use blue color schemes
const THEME_COLORS = {
  0: '#FFFFFF', // Background 1
  1: '#000000', // Text 1
  2: '#E7E6E6', // Background 2
  3: '#44546A', // Text 2
  4: '#4472C4', // Accent 1 (Primary Blue)
  5: '#5B9BD5', // Accent 2 (Light Blue) 
  6: '#264478', // Accent 3 (Navy Blue)
  7: '#7CAFDD', // Accent 4 (Sky Blue)
  8: '#2E5C8A', // Accent 5 (Medium Blue)
  9: '#1E3A5F'  // Accent 6 (Dark Blue)
};

// Excel indexed colors (legacy palette)
const INDEXED_COLORS = {
  0: '#000000',
  1: '#FFFFFF',
  2: '#FF0000',
  3: '#00FF00',
  4: '#0000FF',
  5: '#FFFF00',
  6: '#FF00FF',
  7: '#00FFFF',
  8: '#000000',
  9: '#FFFFFF',
  10: '#FF0000',
  11: '#00FF00',
  12: '#0000FF', // Blue
  13: '#FFFF00',
  14: '#FF00FF',
  15: '#00FFFF',
  16: '#800000',
  17: '#008000',
  18: '#000080',
  19: '#808000',
  20: '#800080',
  21: '#008080',
  22: '#C0C0C0',
  23: '#808080',
  24: '#9999FF',
  25: '#993366',
  26: '#FFFFCC',
  27: '#CCFFFF',
  28: '#660066',
  29: '#FF8080',
  30: '#0066CC',
  31: '#CCCCFF',
  32: '#000080',
  33: '#FF00FF',
  34: '#FFFF00',
  35: '#00FFFF',
  36: '#800080',
  37: '#800000',
  38: '#008080',
  39: '#0000FF',
  40: '#00CCFF',
  41: '#CCFFFF',
  42: '#CCFFCC',
  43: '#FFFF99',
  44: '#99CCFF',
  45: '#FF99CC',
  46: '#CC99FF',
  47: '#FFCC99',
  48: '#3366FF',
  49: '#33CCCC',
  50: '#99CC00',
  51: '#FFCC00',
  52: '#FF9900',
  53: '#FF6600',
  54: '#666699',
  55: '#969696',
  56: '#003366',
  57: '#339966',
  58: '#003300',
  59: '#333300',
  60: '#993300',
  61: '#993366',
  62: '#333399',
  63: '#333333'
};

// Apply tint to a hex color
function applyTint(hexColor, tint) {
  if (!tint || tint === 0) return hexColor;
  
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  let newR, newG, newB;
  
  if (tint < 0) {
    // Darken the color
    const factor = 1 + tint;
    newR = Math.round(r * factor);
    newG = Math.round(g * factor);
    newB = Math.round(b * factor);
  } else {
    // Lighten the color
    newR = Math.round(r + (255 - r) * tint);
    newG = Math.round(g + (255 - g) * tint);
    newB = Math.round(b + (255 - b) * tint);
  }
  
  // Convert back to hex
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return '#' + toHex(newR) + toHex(newG) + toHex(newB);
}

// Resolve theme color to actual color
function resolveThemeColor(colorObj) {
  if (!colorObj || typeof colorObj !== 'object') return colorObj;
  
  // If it has argb, return that directly
  if (colorObj.argb) {
    return '#' + colorObj.argb.substr(2); // Remove alpha channel
  }
  
  // If it has rgb, return that
  if (colorObj.rgb) {
    return '#' + colorObj.rgb;
  }
  
  // If it's an indexed color, resolve it
  if (colorObj.indexed !== undefined && INDEXED_COLORS[colorObj.indexed]) {
    return INDEXED_COLORS[colorObj.indexed];
  }
  
  // If it's a theme color, resolve it
  if (colorObj.theme !== undefined && THEME_COLORS[colorObj.theme]) {
    const baseColor = THEME_COLORS[colorObj.theme];
    return applyTint(baseColor, colorObj.tint || 0);
  }
  
  // Return the object as-is if we can't resolve it
  return colorObj;
}

function extractCellStyle(cell) {
  const style = {};
  
  // Debug logging for style extraction
  const debugStyles = self.location?.search?.includes('debug=styles');
  
  // Font styles - extract all properties
  if (cell.font) {
    const resolvedColor = resolveThemeColor(cell.font.color);
    
    // Debug I26 color resolution
    if (cell.fullAddress === 'I26') {
      console.log('[I26 Style Extraction] Original color:', cell.font.color);
      console.log('[I26 Style Extraction] Resolved color:', resolvedColor);
    }
    
    style.font = {
      bold: cell.font.bold || false,
      italic: cell.font.italic || false,
      underline: cell.font.underline || false,
      strike: cell.font.strike || false,
      size: cell.font.size || 11, // Excel default is 11pt
      color: resolvedColor,
      name: cell.font.name || 'Calibri'
    };
    
    // Debug underline values to understand what ExcelJS provides
    // if (cell.font.underline && cell.font.underline !== true && cell.font.underline !== false) {
    //   console.log('[Font Underline] Non-boolean underline value found:', {
    //     cellAddress: cell.fullAddress || cell.address || 'unknown',
    //     underlineValue: cell.font.underline,
    //     underlineType: typeof cell.font.underline,
    //     rawFont: cell.font
    //   });
    // }
    
    
    // if (debugStyles) {
    //   console.log('[Worker Style Debug] Font extracted:', {
    //     cell: `${cell.row}-${cell.col}`,
    //     font: style.font,
    //     original: cell.font
    //   });
    // }
  }
  
  // Fill/background - handle patterns and gradients
  if (cell.fill) {
    // Always log fill info for debugging
    const cellRef = `${cell.row || 0}-${cell.col || 0}`;
    
    // More aggressive fill detection
    let fillColor = null;
    let pattern = 'solid';
    
    // Log what we have (only for debugging specific issues)
    // const debugFills = false; // Set to true when debugging fill issues
    // if (debugFills && (cell.fill.type || cell.fill.fgColor || cell.fill.bgColor)) {
    //   console.log(`[Fill Debug] Cell ${cellRef} fill:`, {
    //     type: cell.fill.type,
    //     pattern: cell.fill.pattern,
    //     fgColor: cell.fill.fgColor,
    //     bgColor: cell.fill.bgColor
    //   });
    // }
    
    // Try all possible color locations
    if (cell.fill.type === 'pattern') {
      pattern = cell.fill.pattern || 'solid';
      
      // Most common: fgColor for solid fills
      if (cell.fill.fgColor) {
        fillColor = cell.fill.fgColor.argb || cell.fill.fgColor;
        // If it's a theme color, include the full object
        if (cell.fill.fgColor.theme !== undefined) {
          fillColor = cell.fill.fgColor;
        }
      }
      // Alternative: bgColor (some files use this)
      else if (cell.fill.bgColor) {
        fillColor = cell.fill.bgColor.argb || cell.fill.bgColor;
        // If it's a theme color, include the full object
        if (cell.fill.bgColor.theme !== undefined) {
          fillColor = cell.fill.bgColor;
        }
      }
    } 
    // Gradient fills
    else if (cell.fill.type === 'gradient' && cell.fill.gradient?.stops?.length > 0) {
      const firstStop = cell.fill.gradient.stops[0];
      if (firstStop?.color) {
        fillColor = firstStop.color.argb || firstStop.color;
      }
    }
    // No type specified but has color properties
    else {
      if (cell.fill.fgColor) {
        fillColor = cell.fill.fgColor.argb || cell.fill.fgColor;
      } else if (cell.fill.bgColor) {
        fillColor = cell.fill.bgColor.argb || cell.fill.bgColor;
      } else if (cell.fill.color) {
        fillColor = cell.fill.color.argb || cell.fill.color;
      }
    }
    
    // If we found a color, add it to style
    if (fillColor) {
      style.fill = {
        color: fillColor,
        pattern: pattern
      };
      
      // Log successful fill extraction (only when debugging)
      // if (debugFills && (!cell.value || cell.value === '')) {
      //   console.log(`[Fill Success] Empty cell ${cellRef} has background:`, fillColor);
      // }
    }
  }
  
  // Alignment - preserve all settings
  if (cell.alignment) {
    style.alignment = {
      horizontal: cell.alignment.horizontal,
      vertical: cell.alignment.vertical,
      wrapText: cell.alignment.wrapText || false,
      indent: cell.alignment.indent || 0,
      textRotation: cell.alignment.textRotation || 0
    };
    
    // Debug alignment extraction for specific cells
    if (cell.fullAddress === 'B4' || cell.fullAddress === 'B5') {
      console.log(`[Alignment Extract] ${cell.fullAddress}:`, {
        rawAlignment: cell.alignment,
        extractedAlignment: style.alignment
      });
    }
  }
  
  // Borders - extract all border properties
  if (cell.border) {
    style.border = {};
    ['top', 'bottom', 'left', 'right', 'diagonal'].forEach(side => {
      if (cell.border[side]) {
        style.border[side] = {
          style: cell.border[side].style || 'thin',
          color: cell.border[side].color?.argb || cell.border[side].color || '000000'
        };
      }
    });
    // Handle diagonal direction
    if (cell.border.diagonal) {
      style.border.diagonalUp = cell.border.diagonalUp;
      style.border.diagonalDown = cell.border.diagonalDown;
    }
  }
  
  // Number format - extract the actual format string
  // Check all possible locations where ExcelJS might store format
  let foundFormat = null;
  
  if (cell.numFmt) {
    foundFormat = cell.numFmt;
  } else if (cell.style && cell.style.numFmt) {
    foundFormat = cell.style.numFmt;
  } else if (cell._style && cell._style.numFmt) {
    foundFormat = cell._style.numFmt;
  } else if (cell.model && cell.model.style && cell.model.style.numFmt) {
    foundFormat = cell.model.style.numFmt;
  } else if (cell.model && cell.model.numFmt) {
    foundFormat = cell.model.numFmt;
  }
  
  if (foundFormat) {
    style.numberFormat = foundFormat;
    // Debug custom formats
    if (foundFormat && foundFormat.includes('"')) {
      const cellRef = typeof cell.fullAddress === 'string' ? cell.fullAddress : 
                      (cell.fullAddress?.address || cell.address || 'unknown');
      // console.log('[Worker] Custom format with text found:', { 
      //   cellRef: cellRef,
      //   format: foundFormat,
      //   value: cell.value
      // });
    }
    // Debug D26 specifically
    if (cell.fullAddress === 'D26') {
      console.log('[D26 Number Format] Found format:', foundFormat);
    }
    // Debug date formats - check for mm-dd-yy pattern
    // Commented out since date format issue is resolved
    // if (foundFormat && foundFormat.toLowerCase().includes('mm-dd-yy')) {
    //   console.log('[Worker] Date format with hyphens detected:', { 
    //     cellRef: `${cell.fullAddress || 'unknown'}`,
    //     numFmt: foundFormat,
    //     value: cell.value
    //   });
    // }
  } else if (cell.style && typeof cell.style === 'number') {
    // Handle built-in format IDs
    const builtInFormats = {
      1: '0',
      2: '0.00',
      3: '#,##0',
      4: '#,##0.00',
      9: '0%',
      10: '0.00%',
      11: '0.00E+00',
      12: '# ?/?',
      13: '# ??/??',
      14: 'mm/dd/yyyy',
      15: 'd-mmm-yy',
      16: 'd-mmm',
      17: 'mmm-yy',
      18: 'h:mm AM/PM',
      19: 'h:mm:ss AM/PM',
      20: 'h:mm',
      21: 'h:mm:ss',
      22: 'm/d/yy h:mm',
      37: '#,##0 ;(#,##0)',
      38: '#,##0 ;[Red](#,##0)',
      39: '#,##0.00;(#,##0.00)',
      40: '#,##0.00;[Red](#,##0.00)',
      44: '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)',
      45: 'mm:ss',
      46: '[h]:mm:ss',
      47: 'mmss.0',
      48: '##0.0E+0',
      49: '@'
    };
    style.numberFormat = builtInFormats[cell.style] || null;
    // Debug built-in format
    // if (cell.style === 14 || cell.style === 15 || cell.style === 16 || cell.style === 17 || cell.style === 22) {
    //   console.log('[Worker] Built-in date format ID used:', { 
    //     cellRef: `${cell.fullAddress || 'unknown'}`,
    //     formatId: cell.style,
    //     mappedFormat: builtInFormats[cell.style],
    //     cellModel: cell.model
    //   });
    // }
  }
  
  // Protection
  if (cell.protection) {
    style.protection = {
      locked: cell.protection.locked,
      hidden: cell.protection.hidden
    };
  }
  
  // Debug: Log complete extracted style
  // if (debugStyles && Object.keys(style).length > 0) {
  //   console.log('[Worker Style Debug] Complete style extracted:', {
  //     cell: `${cell.row || 0}-${cell.col || 0}`,
  //     styleProperties: Object.keys(style),
  //     fullStyle: style
  //   });
  // }
  
  return style;
}

function parseCellAddress(address) {
  const match = address.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: 1, col: 1 };
  
  const colLetters = match[1];
  const rowNum = parseInt(match[2]);
  
  let colNum = 0;
  for (let i = 0; i < colLetters.length; i++) {
    colNum = colNum * 26 + (colLetters.charCodeAt(i) - 64);
  }
  
  return { row: rowNum, col: colNum };
}

// Helper function to convert column number to letter (1 -> A, 2 -> B, etc.)
function getColumnName(index) {
  let name = '';
  while (index > 0) {
    index--;
    name = String.fromCharCode(65 + (index % 26)) + name;
    index = Math.floor(index / 26);
  }
  return name;
}

// Calculate text spillover range for a cell
function calculateSpilloverRange(text, row, col, columnWidths, worksheet, cellStyle) {
  const EXCEL_COLUMN_WIDTH_TO_PIXEL = 8.0;
  const DEFAULT_COLUMN_WIDTH = 67;
  const AVG_CHAR_WIDTH = 8; // Average character width in pixels for Calibri 11pt
  const MAX_SPILLOVER_COLS = 15; // Reasonable limit to prevent performance issues
  
  // Skip if text is empty or very short
  if (!text || typeof text !== 'string' || text.length < 3) {
    return {
      sourceRow: row,
      sourceCol: col,
      startCol: col,
      endCol: col,
      text: text,
      needsSpillover: false
    };
  }
  
  // Get text alignment
  const alignment = cellStyle?.alignment?.horizontal || 'left';
  const isRightAligned = alignment === 'right';
  const isCenterAligned = alignment === 'center';
  
  // Get source cell width
  const sourceWidth = columnWidths[col] 
    ? columnWidths[col] * EXCEL_COLUMN_WIDTH_TO_PIXEL 
    : DEFAULT_COLUMN_WIDTH;
  
  // Estimate text width (this is a rough approximation)
  // Account for padding in cells (6px on each side = 12px total)
  const availableSourceWidth = Math.max(sourceWidth - 12, 20);
  const textWidth = text.length * AVG_CHAR_WIDTH;
  
  // If text fits in source cell, no spillover needed
  if (textWidth <= availableSourceWidth) {
    return {
      sourceRow: row,
      sourceCol: col,
      startCol: col,
      endCol: col,
      text: text,
      needsSpillover: false
    };
  }
  
  // Calculate how many additional columns we need
  let remainingWidth = textWidth - availableSourceWidth;
  let startCol = col;
  let endCol = col;
  
  if (isRightAligned) {
    // For right-aligned text, spillover goes to the left
    for (let checkCol = col - 1; checkCol >= Math.max(1, col - MAX_SPILLOVER_COLS) && remainingWidth > 0; checkCol--) {
      try {
        // Check if this cell has content (would block spillover)
        const blockingCell = worksheet.getCell(row, checkCol);
        if (blockingCell && blockingCell.value !== null && blockingCell.value !== undefined && blockingCell.value !== '') {
          break; // Stop spillover at non-empty cell
        }
        
        // Get width of this column
        const colWidth = columnWidths[checkCol] 
          ? columnWidths[checkCol] * EXCEL_COLUMN_WIDTH_TO_PIXEL 
          : DEFAULT_COLUMN_WIDTH;
        
        const availableColWidth = Math.max(colWidth - 12, 20); // Account for padding
        startCol = checkCol;
        remainingWidth -= availableColWidth;
      } catch (error) {
        // If we can't access the cell, stop spillover here
        console.warn(`[Spillover] Cannot check cell ${getColumnName(checkCol)}${row}:`, error);
        break;
      }
    }
  } else if (isCenterAligned) {
    // For center-aligned text, first check if BOTH adjacent cells are empty
    // This is unique to center alignment - we need space on both sides
    let leftCellEmpty = true;
    let rightCellEmpty = true;
    
    // Check immediate left cell
    if (col > 1) {
      try {
        const leftCell = worksheet.getCell(row, col - 1);
        if (leftCell && leftCell.value !== null && leftCell.value !== undefined && leftCell.value !== '') {
          leftCellEmpty = false;
        }
      } catch (error) {
        leftCellEmpty = false; // Assume blocked if we can't check
      }
    }
    
    // Check immediate right cell
    try {
      const rightCell = worksheet.getCell(row, col + 1);
      if (rightCell && rightCell.value !== null && rightCell.value !== undefined && rightCell.value !== '') {
        rightCellEmpty = false;
      }
    } catch (error) {
      rightCellEmpty = false; // Assume blocked if we can't check
    }
    
    // If either adjacent cell has content, don't spillover for center-aligned text
    if (!leftCellEmpty || !rightCellEmpty) {
      return {
        sourceRow: row,
        sourceCol: col,
        startCol: col,
        endCol: col,
        text: text,
        alignment: alignment,
        needsSpillover: false
      };
    }
    
    // If both adjacent cells are empty, proceed with spillover calculation
    let leftRemainingWidth = remainingWidth / 2;
    let rightRemainingWidth = remainingWidth / 2;
    
    // Check left side for additional spillover space
    for (let checkCol = col - 1; checkCol >= Math.max(1, col - MAX_SPILLOVER_COLS/2) && leftRemainingWidth > 0; checkCol--) {
      try {
        const blockingCell = worksheet.getCell(row, checkCol);
        if (blockingCell && blockingCell.value !== null && blockingCell.value !== undefined && blockingCell.value !== '') {
          rightRemainingWidth += leftRemainingWidth; // Add unused left width to right
          break;
        }
        
        const colWidth = columnWidths[checkCol] 
          ? columnWidths[checkCol] * EXCEL_COLUMN_WIDTH_TO_PIXEL 
          : DEFAULT_COLUMN_WIDTH;
        
        const availableColWidth = Math.max(colWidth - 12, 20);
        startCol = checkCol;
        leftRemainingWidth -= availableColWidth;
      } catch (error) {
        rightRemainingWidth += leftRemainingWidth;
        break;
      }
    }
    
    // Check right side for additional spillover space
    for (let checkCol = col + 1; checkCol <= col + MAX_SPILLOVER_COLS/2 && rightRemainingWidth > 0; checkCol++) {
      try {
        const blockingCell = worksheet.getCell(row, checkCol);
        if (blockingCell && blockingCell.value !== null && blockingCell.value !== undefined && blockingCell.value !== '') {
          break;
        }
        
        const colWidth = columnWidths[checkCol] 
          ? columnWidths[checkCol] * EXCEL_COLUMN_WIDTH_TO_PIXEL 
          : DEFAULT_COLUMN_WIDTH;
        
        const availableColWidth = Math.max(colWidth - 12, 20);
        endCol = checkCol;
        rightRemainingWidth -= availableColWidth;
      } catch (error) {
        break;
      }
    }
  } else {
    // For left-aligned text (default), spillover goes to the right
    for (let checkCol = col + 1; checkCol <= col + MAX_SPILLOVER_COLS && remainingWidth > 0; checkCol++) {
      try {
        // Check if this cell has content (would block spillover)
        const blockingCell = worksheet.getCell(row, checkCol);
        if (blockingCell && blockingCell.value !== null && blockingCell.value !== undefined && blockingCell.value !== '') {
          break; // Stop spillover at non-empty cell
        }
        
        // Get width of this column
        const colWidth = columnWidths[checkCol] 
          ? columnWidths[checkCol] * EXCEL_COLUMN_WIDTH_TO_PIXEL 
          : DEFAULT_COLUMN_WIDTH;
        
        const availableColWidth = Math.max(colWidth - 12, 20); // Account for padding
        endCol = checkCol;
        remainingWidth -= availableColWidth;
      } catch (error) {
        // If we can't access the cell, stop spillover here
        console.warn(`[Spillover] Cannot check cell ${getColumnName(checkCol)}${row}:`, error);
        break;
      }
    }
  }
  
  return {
    sourceRow: row,
    sourceCol: col,
    startCol: startCol,
    endCol: endCol,
    text: text,
    alignment: alignment,
    needsSpillover: startCol < col || endCol > col
  };
}

async function getCellRange(data, id) {
  const { sheetIndex, startRow, endRow, startCol, endCol } = data;
  
  if (!self.workbook) {
    throw new Error('No workbook loaded');
  }
  
  // Use direct indexing since we're keeping all sheets
  const worksheet = self.workbook.worksheets[sheetIndex];
  if (!worksheet) {
    throw new Error(`Sheet at index ${sheetIndex} not found`);
  }
  
  const cells = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      try {
        const cell = worksheet.getCell(row, col);
        if (cell) {
          // Check if cell has any formatting even if no value
          const cellStyle = extractCellStyle(cell);
          const hasStyle = cellStyle && Object.keys(cellStyle).length > 0;
          
          // Debug B2 on Unit Mix - Rent Roll sheet
          if (worksheet.name === "Unit Mix - Rent Roll" && col === 2 && row === 2) {
            console.log(`[B2 Debug] Cell B2:`, {
              value: cell.value,
              style: cellStyle,
              alignment: cellStyle?.alignment,
              hasIndent: cellStyle?.alignment?.indent
            });
          }
          const hasValue = cell.value !== null && cell.value !== undefined;
          
          // Include cell if it has a value OR if it has styling
          if (hasValue || hasStyle) {
            cells.push({
              row,
              col,
              value: getCellValue(cell),
              style: cellStyle
            });
          }
        }
      } catch (cellError) {
        console.warn(`Error getting cell ${row},${col}:`, cellError);
      }
    }
  }
  
  self.postMessage({
    type: 'CELL_RANGE',
    data: { cells },
    id: id
  });
}

async function searchInSheet(data, id) {
  const { sheetIndex, query, caseSensitive = false, exactMatch = false } = data;
  
  if (!self.workbook) {
    throw new Error('No workbook loaded');
  }
  
  // Use direct indexing since we're keeping all sheets
  const worksheet = self.workbook.worksheets[sheetIndex];
  if (!worksheet) {
    throw new Error(`Sheet at index ${sheetIndex} not found`);
  }
  
  const results = [];
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  // Search through all cells (use actual data bounds)
  const maxRow = Math.min(worksheet.actualRowCount || worksheet.lastRow?.number || 1000, 10000); // Limit search to 10k rows
  const maxCol = Math.min(worksheet.actualColumnCount || worksheet.lastColumn?.number || 100, 256); // Limit to 256 columns
  
  for (let row = 1; row <= maxRow; row++) {
    for (let col = 1; col <= maxCol; col++) {
      try {
        const cell = worksheet.getCell(row, col);
        if (cell && cell.value !== null && cell.value !== undefined) {
          const cellValue = String(getCellValue(cell));
          const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();
          
          let match = false;
          if (exactMatch) {
            match = compareValue === searchQuery;
          } else {
            match = compareValue.includes(searchQuery);
          }
          
          if (match) {
            results.push({
              row,
              col,
              value: cellValue
            });
          }
        }
      } catch (cellError) {
        // Skip problematic cells
      }
    }
  }
  
  self.postMessage({
    type: 'SEARCH_RESULTS',
    data: results,
    id: id
  });
}

// Clear cache function
function clearCache() {
  try {
    // Clear workbook reference and mapping
    self.workbook = null;
    self.worksheetMapping = null;
    // Clear formula cache
    if (self.formulaCache) {
      self.formulaCache.clear();
    }
    
    // Force garbage collection if available
    if (self.gc) {
      self.gc();
    }
    
    // Reset task count
    taskCount = 0;
    
    self.postMessage({
      type: 'CACHE_CLEARED',
      data: {
        success: true,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}