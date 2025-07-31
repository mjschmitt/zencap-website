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
    console.log('loadWorkbook called with ArrayBuffer size:', arrayBuffer.byteLength);
    
    // Check if ExcelJS is available
    if (typeof self.ExcelJS === 'undefined' || !self.ExcelJS.Workbook) {
      throw new Error('ExcelJS or ExcelJS.Workbook is not available');
    }
    
    // Initialize ExcelJS
    console.log('Creating new ExcelJS.Workbook...');
    const workbook = new self.ExcelJS.Workbook();
    
    // Special handling for .xlsm files (macro-enabled workbooks)
    try {
      console.log('Attempting standard load...');
      await workbook.xlsx.load(arrayBuffer);
      console.log('Standard load successful');
    } catch (xlsxError) {
      console.warn('Standard load failed:', xlsxError.message);
      // If standard load fails, try with options
      try {
        console.log('Attempting load with options...');
        await workbook.xlsx.load(arrayBuffer, {
          ignoreVBA: true,
          cellDates: true,
          cellNF: false,
          cellStyles: true
        });
        console.log('Load with options successful');
      } catch (secondError) {
        console.warn('Load with options failed:', secondError.message);
        // Final fallback - try to parse as buffer
        console.log('Attempting buffer load...');
        const buffer = new Uint8Array(arrayBuffer);
        await workbook.xlsx.load(buffer);
        console.log('Buffer load successful');
      }
    }
    
    // Extract basic workbook info including visibility state
    const worksheets = workbook.worksheets.map((sheet, index) => {
      // ExcelJS stores visibility in sheet.state
      // Possible values: 'visible', 'hidden', 'veryHidden'
      console.log(`Sheet ${index} "${sheet.name}" state:`, sheet.state);
      
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
    
    console.log('All worksheets loaded:', finalWorksheets.map(s => ({
      index: s.originalIndex,
      name: s.name,
      state: s.state,
      isHidden: s.isHidden
    })));
    
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
  
  console.log('processSheet called:', { sheetIndex, viewportStart, viewportEnd });
  
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
  
  console.log(`Processing sheet "${worksheet.name}" (index: ${sheetIndex}, state: ${worksheet.state || 'visible'})`);
  
  // Process only the visible viewport for performance
  const startRow = viewportStart?.row || 1;
  const endRow = Math.min(viewportEnd?.row || 1000, worksheet.rowCount || 1000);
  const startCol = viewportStart?.col || 1;
  const endCol = Math.min(viewportEnd?.col || 200, worksheet.columnCount || 200);
  
  console.log(`Processing range: rows ${startRow}-${endRow}, cols ${startCol}-${endCol}`);
  
  const processedData = {
    cells: [],
    mergedCells: [],
    columnWidths: {},
    rowHeights: {},
    frozenRows: worksheet.views?.[0]?.ySplit || 0,
    frozenCols: worksheet.views?.[0]?.xSplit || 0,
    defaultColWidth: worksheet.properties?.defaultColWidth,
    defaultRowHeight: worksheet.properties?.defaultRowHeight
  };
  
  console.log('Worksheet properties:', {
    defaultColWidth: worksheet.properties?.defaultColWidth,
    defaultRowHeight: worksheet.properties?.defaultRowHeight,
    outlineProperties: worksheet.properties?.outlineProperties
  });
  
  // Process column widths
  if (worksheet.columns && worksheet.columns.length > 0) {
    console.log('Processing worksheet.columns:', worksheet.columns.length);
    worksheet.columns.forEach((col, index) => {
      if (col && col.width !== undefined && col.width !== null) {
        // Store column widths with 1-based indexing to match Excel
        // Only store if width is different from default
        if (col.width !== worksheet.properties?.defaultColWidth) {
          processedData.columnWidths[index + 1] = col.width;
          
          if (index < 10) { // Log first few columns for debugging
            console.log(`Column ${index + 1} width:`, col.width);
          }
        }
      }
    });
  }
  
  // Also check for column info in the worksheet model (different storage format)
  if (worksheet.model && worksheet.model.cols && worksheet.model.cols.length > 0) {
    console.log('Found worksheet.model.cols:', worksheet.model.cols.length);
    worksheet.model.cols.forEach((colDef) => {
      if (colDef && colDef.width !== undefined) {
        // Only process columns within reasonable range (up to column 100)
        const maxCol = Math.min(colDef.max || colDef.min, 100);
        for (let i = colDef.min; i <= maxCol; i++) {
          if (!processedData.columnWidths[i]) { // Don't override if already set
            processedData.columnWidths[i] = colDef.width;
          }
        }
        
        if (colDef.min <= 10) {
          console.log(`Column range ${colDef.min}-${maxCol} width:`, colDef.width);
        }
      }
    });
  }
  
  // Log actual column widths found
  const columnCount = Object.keys(processedData.columnWidths).length;
  console.log(`Actual column widths set: ${columnCount}`);
  if (columnCount > 0 && columnCount < 50) {
    console.log('Column widths:', processedData.columnWidths);
  }
  
  // Process rows and cells
  let cellCount = 0;
  for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
    try {
      const row = worksheet.getRow(rowNum);
      if (row && row.height) {
        // ExcelJS provides row height in points (not pixels)
        processedData.rowHeights[rowNum] = row.height;
        
        if (rowNum <= 5) { // Log first few rows for debugging
          console.log(`Row ${rowNum} height:`, row.height, 'points');
        }
      }
      
      for (let colNum = startCol; colNum <= endCol; colNum++) {
        const cell = row.getCell(colNum);
        if (cell) {
          // Add cell address for debugging
          cell.fullAddress = cell.address || `${getColumnName(colNum)}${rowNum}`;
          
          // Check if cell has any formatting even if no value
          const cellStyle = extractCellStyle(cell);
          const hasStyle = cellStyle && Object.keys(cellStyle).length > 0;
          const hasValue = cell.value !== null && cell.value !== undefined;
          
          // Include cell if it has a value OR if it has styling
          if (hasValue || hasStyle) {
            const cellData = {
              row: rowNum,
              col: colNum,
              value: getCellValue(cell),
              style: cellStyle,
              formula: cell.formula,
              type: cell.type
            };
            processedData.cells.push(cellData);
            cellCount++;
            
            // Log first few cells for debugging
            if (cellCount <= 5) {
              console.log(`Cell [${rowNum},${colNum}]:`, cellData.value || '(empty with style)');
            }
            
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
            if (debugStyles && !hasValue && cellStyle.fill) {
              console.log(`[Background Fill] Empty cell with background at [${rowNum},${colNum}]:`, {
                fill: cellStyle.fill,
                allStyles: cellStyle
              });
            }
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
  
  console.log(`Processed ${cellCount} total cells:`);
  console.log(`  - ${cellsWithValues} cells with values`);
  console.log(`  - ${cellsWithOnlyStyle} empty cells with formatting`);
  console.log(`  - ${cellsWithBgOnly} empty cells with background fill`);
  console.log('Column widths extracted:', Object.keys(processedData.columnWidths).length);
  console.log('Row heights extracted:', Object.keys(processedData.rowHeights).length);
  
  // Log sample empty cells with background
  if (cellsWithBgOnly > 0) {
    const sampleBgCells = processedData.cells
      .filter(c => (!c.value || c.value === '') && c.style?.fill)
      .slice(0, 3)
      .map(c => ({
        position: `[${c.row},${c.col}]`,
        fill: c.style.fill
      }));
    console.log('Sample empty cells with background:', sampleBgCells);
  }
  
  // Log sample of actual dimensions for debugging
  const sampleCols = Object.entries(processedData.columnWidths).slice(0, 5);
  const sampleRows = Object.entries(processedData.rowHeights).slice(0, 5);
  console.log('Sample column widths:', sampleCols);
  console.log('Sample row heights:', sampleRows);
  
  // Debug: Log style statistics
  if (debugStyles) {
    const cellsWithStyles = processedData.cells.filter(c => c.style && Object.keys(c.style).length > 0);
    console.log('[Worker Style Debug] Transmission stats:', {
      totalCells: processedData.cells.length,
      cellsWithStyles: cellsWithStyles.length,
      styleTypes: {
        font: cellsWithStyles.filter(c => c.style.font).length,
        fill: cellsWithStyles.filter(c => c.style.fill).length,
        border: cellsWithStyles.filter(c => c.style.border).length,
        alignment: cellsWithStyles.filter(c => c.style.alignment).length,
        numberFormat: cellsWithStyles.filter(c => c.style.numberFormat).length
      },
      sampleCellsWithStyles: cellsWithStyles.slice(0, 3).map(c => ({
        cell: `${c.row}-${c.col}`,
        value: c.value,
        style: c.style
      }))
    });
  }
  
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
  
  self.postMessage({
    type: 'SHEET_PROCESSED',
    data: processedData,
    id: id
  });
}

function getCellValue(cell) {
  if (cell.value === null || cell.value === undefined) return '';
  
  // For formula cells, ExcelJS stores the formula in cell.formula and the result in cell.value
  // So if a cell has a formula, cell.value already contains the calculated result
  if (cell.formula && cell.type === 6) { // Type 6 is formula in ExcelJS
    // The value is already the calculated result, just return it
    if (typeof cell.value === 'object' && !(cell.value instanceof Date)) {
      // If it's still an object, try to extract the value
      if (cell.value.result !== undefined) {
        return cell.value.result;
      }
      if (cell.value.error) {
        return `#${cell.value.error}`;
      }
    }
    // For most cases, cell.value is already the calculated result
    return cell.value;
  }
  
  // Debug logging for all non-primitive values
  if (typeof cell.value === 'object' && !(cell.value instanceof Date)) {
    console.log('[Worker getCellValue] Processing object value:', {
      cellAddress: `${cell.fullAddress || 'unknown'}`,
      valueType: typeof cell.value,
      valueConstructor: cell.value.constructor?.name,
      valueKeys: Object.keys(cell.value || {}),
      value: cell.value,
      formula: cell.formula,
      type: cell.type
    });
  }
  
  // Handle different value types
  if (cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join('');
  }
  
  if (cell.value instanceof Date) {
    return cell.value.toLocaleDateString();
  }
  
  if (typeof cell.value === 'object' && cell.value.error) {
    return `#${cell.value.error}`;
  }
  
  // Handle formula cells (legacy format)
  if (typeof cell.value === 'object' && cell.value.formula) {
    // Return the calculated result if available, otherwise show the formula
    return cell.value.result !== undefined ? cell.value.result : `=${cell.value.formula}`;
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
    
    // Try JSON.stringify as last resort, but limit length
    try {
      const str = JSON.stringify(cell.value);
      return str.length > 50 ? str.substring(0, 47) + '...' : str;
    } catch (e) {
      return '[Complex Object]';
    }
  }
  
  return cell.value;
}

function extractCellStyle(cell) {
  const style = {};
  
  // Debug logging for style extraction
  const debugStyles = self.location?.search?.includes('debug=styles');
  
  // Font styles - extract all properties
  if (cell.font) {
    style.font = {
      bold: cell.font.bold || false,
      italic: cell.font.italic || false,
      underline: cell.font.underline || false,
      strike: cell.font.strike || false,
      size: cell.font.size || 11, // Excel default is 11pt
      color: cell.font.color?.argb || cell.font.color,
      name: cell.font.name || 'Calibri'
    };
    
    if (debugStyles) {
      console.log('[Worker Style Debug] Font extracted:', {
        cell: `${cell.row}-${cell.col}`,
        font: style.font,
        original: cell.font
      });
    }
  }
  
  // Fill/background - handle patterns and gradients
  if (cell.fill) {
    // Always log fill info for debugging
    const cellRef = `${cell.row || 0}-${cell.col || 0}`;
    
    // More aggressive fill detection
    let fillColor = null;
    let pattern = 'solid';
    
    // Log what we have (only for debugging specific issues)
    const debugFills = false; // Set to true when debugging fill issues
    if (debugFills && (cell.fill.type || cell.fill.fgColor || cell.fill.bgColor)) {
      console.log(`[Fill Debug] Cell ${cellRef} fill:`, {
        type: cell.fill.type,
        pattern: cell.fill.pattern,
        fgColor: cell.fill.fgColor,
        bgColor: cell.fill.bgColor
      });
    }
    
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
      if (debugFills && (!cell.value || cell.value === '')) {
        console.log(`[Fill Success] Empty cell ${cellRef} has background:`, fillColor);
      }
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
  if (cell.numFmt) {
    style.numberFormat = cell.numFmt;
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
  }
  
  // Protection
  if (cell.protection) {
    style.protection = {
      locked: cell.protection.locked,
      hidden: cell.protection.hidden
    };
  }
  
  // Debug: Log complete extracted style
  if (debugStyles && Object.keys(style).length > 0) {
    console.log('[Worker Style Debug] Complete style extracted:', {
      cell: `${cell.row || 0}-${cell.col || 0}`,
      styleProperties: Object.keys(style),
      fullStyle: style
    });
  }
  
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