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
        rowCount: sheet.rowCount || 0,
        columnCount: sheet.columnCount || 0,
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
  
  // Process only the visible viewport for performance
  const startRow = viewportStart?.row || 1;
  const endRow = Math.min(viewportEnd?.row || 1000, worksheet.rowCount || 1000);
  const startCol = viewportStart?.col || 1;
  const endCol = Math.min(viewportEnd?.col || 200, worksheet.columnCount || 200);
  
  // console.log(`Processing range: rows ${startRow}-${endRow}, cols ${startCol}-${endCol}`);
  
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
    showGridLines: worksheet.views?.[0]?.showGridLines !== false
  };
  
  // console.log('Worksheet properties:', {
  //   defaultColWidth: worksheet.properties?.defaultColWidth,
  //   defaultRowHeight: worksheet.properties?.defaultRowHeight,
  //   outlineProperties: worksheet.properties?.outlineProperties
  // });
  
  // Process column widths
  if (worksheet.columns && worksheet.columns.length > 0) {
    // console.log('Processing worksheet.columns:', worksheet.columns.length);
    worksheet.columns.forEach((col, index) => {
      if (col && col.width !== undefined && col.width !== null) {
        // Store column widths with 1-based indexing to match Excel
        // Only store if width is different from default
        if (col.width !== worksheet.properties?.defaultColWidth) {
          processedData.columnWidths[index + 1] = col.width;
          
          // if (index < 10) { // Log first few columns for debugging
          //   console.log(`Column ${index + 1} width:`, col.width);
          // }
        }
      }
    });
  }
  
  // Also check for column info in the worksheet model (different storage format)
  if (worksheet.model && worksheet.model.cols && worksheet.model.cols.length > 0) {
    // console.log('Found worksheet.model.cols:', worksheet.model.cols.length);
    worksheet.model.cols.forEach((colDef) => {
      if (colDef && colDef.width !== undefined) {
        // Only process columns within reasonable range (up to column 100)
        const maxCol = Math.min(colDef.max || colDef.min, 100);
        for (let i = colDef.min; i <= maxCol; i++) {
          if (!processedData.columnWidths[i]) { // Don't override if already set
            processedData.columnWidths[i] = colDef.width;
          }
        }
        
        // if (colDef.min <= 10) {
        //   console.log(`Column range ${colDef.min}-${maxCol} width:`, colDef.width);
        // }
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
      if (row && row.height) {
        // ExcelJS provides row height in points (not pixels)
        processedData.rowHeights[rowNum] = row.height;
        
        // if (rowNum <= 5) { // Log first few rows for debugging
        //   console.log(`Row ${rowNum} height:`, row.height, 'points');
        // }
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
            cellCount++;
            
            // Calculate text spillover if text content exists
            if (cellValue && typeof cellValue === 'string' && cellValue.length > 0) {
              const spillRange = calculateSpilloverRange(cellValue, rowNum, colNum, processedData.columnWidths, worksheet);
              if (spillRange.endCol > colNum) {
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
    spilloverRanges.map(r => `${getColumnName(r.sourceCol)}${r.sourceRow} → ${getColumnName(r.startCol)}-${getColumnName(r.endCol)}`)
  );
  
  self.postMessage({
    type: 'SHEET_PROCESSED',
    data: processedData,
    id: id
  });
}

function getCellValue(cell) {
  if (cell.value === null || cell.value === undefined) return '';
  
  
  // For formula cells, ExcelJS stores the formula in cell.formula and the result in cell.value
  // Type 6 is formula in ExcelJS
  if (cell.formula && cell.type === 6) {
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
      return cell.value.result;
    }
    if (cell.value && cell.value.error) {
      return `#${cell.value.error}`;
    }
    // Continue to object handling below
  }
  
  // First check if cell has a direct result property (for formula cells)
  if (cell.result !== undefined) {
    return cell.result;
  }
  
  // Handle different value types
  if (cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join('');
  }
  
  if (cell.value instanceof Date) {
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

// Theme colors mapping for Excel - these are standard Excel theme colors
const THEME_COLORS = {
  0: '#FFFFFF', // Background 1
  1: '#000000', // Text 1
  2: '#E7E6E6', // Background 2
  3: '#44546A', // Text 2
  4: '#5B9BD5', // Accent 1 (Blue)
  5: '#ED7D31', // Accent 2
  6: '#A5A5A5', // Accent 3
  7: '#FFC000', // Accent 4
  8: '#4472C4', // Accent 5
  9: '#70AD47'  // Accent 6
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
    // Debug date formats
    // if (foundFormat && foundFormat.match(/[dmyhs]/i)) {
    //   console.log('[Worker] Date format found:', { 
    //     cellRef: `${cell.fullAddress || 'unknown'}`,
    //     numFmt: foundFormat 
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
function calculateSpilloverRange(text, row, col, columnWidths, worksheet) {
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
  let endCol = col;
  
  // Check adjacent cells to the right for spillover space
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
  
  return {
    sourceRow: row,
    sourceCol: col,
    startCol: col + 1, // Spillover starts from next column
    endCol: endCol,
    text: text,
    needsSpillover: endCol > col
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
  
  // Search through all cells
  const maxRow = Math.min(worksheet.rowCount || 1000, 10000); // Limit search to 10k rows
  const maxCol = Math.min(worksheet.columnCount || 100, 256); // Limit to 256 columns
  
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