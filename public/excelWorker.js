// Excel Processing Web Worker
// Handles all heavy Excel parsing and processing off the main thread

let ExcelJS = null;

// Load ExcelJS library
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js');

self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'LOAD_WORKBOOK':
        await loadWorkbook(data);
        break;
      case 'PROCESS_SHEET':
        await processSheet(data);
        break;
      case 'GET_CELL_RANGE':
        await getCellRange(data);
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
      }
    });
  }
};

async function loadWorkbook(data) {
  try {
    const { arrayBuffer } = data;
    
    // Initialize ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    // Extract basic workbook info
    const worksheets = workbook.worksheets.map((sheet, index) => ({
      id: sheet.id,
      name: sheet.name,
      index: index,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      state: sheet.state
    }));
    
    self.postMessage({
      type: 'WORKBOOK_LOADED',
      data: {
        worksheets,
        properties: workbook.properties
      }
    });
    
    // Store workbook for later use
    self.workbook = workbook;
  } catch (error) {
    throw new Error(`Failed to load workbook: ${error.message}`);
  }
}

async function processSheet(data) {
  const { sheetIndex, viewportStart, viewportEnd } = data;
  
  if (!self.workbook) {
    throw new Error('No workbook loaded');
  }
  
  const worksheet = self.workbook.worksheets[sheetIndex];
  if (!worksheet) {
    throw new Error(`Sheet at index ${sheetIndex} not found`);
  }
  
  // Process only the visible viewport for performance
  const startRow = viewportStart?.row || 1;
  const endRow = Math.min(viewportEnd?.row || 100, worksheet.rowCount);
  const startCol = viewportStart?.col || 1;
  const endCol = Math.min(viewportEnd?.col || 50, worksheet.columnCount);
  
  const processedData = {
    cells: [],
    mergedCells: [],
    columnWidths: {},
    rowHeights: {},
    frozenRows: worksheet.views?.[0]?.ySplit || 0,
    frozenCols: worksheet.views?.[0]?.xSplit || 0
  };
  
  // Process column widths
  worksheet.columns.forEach((col, index) => {
    if (col.width && index >= startCol - 1 && index < endCol) {
      processedData.columnWidths[index] = col.width;
    }
  });
  
  // Process rows and cells
  for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
    const row = worksheet.getRow(rowNum);
    if (row.height) {
      processedData.rowHeights[rowNum] = row.height;
    }
    
    for (let colNum = startCol; colNum <= endCol; colNum++) {
      const cell = row.getCell(colNum);
      if (cell.value !== null && cell.value !== undefined) {
        const cellData = {
          row: rowNum,
          col: colNum,
          value: getCellValue(cell),
          style: extractCellStyle(cell),
          formula: cell.formula,
          type: cell.type
        };
        processedData.cells.push(cellData);
      }
    }
  }
  
  // Process merged cells in viewport
  worksheet.model.merges.forEach(merge => {
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
  });
  
  self.postMessage({
    type: 'SHEET_PROCESSED',
    data: processedData
  });
}

function getCellValue(cell) {
  if (cell.value === null || cell.value === undefined) return '';
  
  // Handle different value types
  if (cell.value.result !== undefined) {
    return cell.value.result;
  }
  
  if (cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join('');
  }
  
  if (cell.value instanceof Date) {
    return cell.value.toLocaleDateString();
  }
  
  if (typeof cell.value === 'object' && cell.value.error) {
    return `#${cell.value.error}`;
  }
  
  return cell.value;
}

function extractCellStyle(cell) {
  const style = {};
  
  // Font styles
  if (cell.font) {
    style.font = {
      bold: cell.font.bold,
      italic: cell.font.italic,
      underline: cell.font.underline,
      strike: cell.font.strike,
      size: cell.font.size,
      color: cell.font.color?.argb,
      name: cell.font.name
    };
  }
  
  // Fill/background
  if (cell.fill && cell.fill.type === 'pattern') {
    style.fill = {
      color: cell.fill.fgColor?.argb,
      pattern: cell.fill.pattern
    };
  }
  
  // Alignment
  if (cell.alignment) {
    style.alignment = {
      horizontal: cell.alignment.horizontal,
      vertical: cell.alignment.vertical,
      wrapText: cell.alignment.wrapText,
      indent: cell.alignment.indent
    };
  }
  
  // Borders
  if (cell.border) {
    style.border = {};
    ['top', 'bottom', 'left', 'right'].forEach(side => {
      if (cell.border[side]) {
        style.border[side] = {
          style: cell.border[side].style,
          color: cell.border[side].color?.argb
        };
      }
    });
  }
  
  // Number format
  if (cell.numFmt) {
    style.numberFormat = cell.numFmt;
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

async function getCellRange(data) {
  const { sheetIndex, startRow, endRow, startCol, endCol } = data;
  
  if (!self.workbook) {
    throw new Error('No workbook loaded');
  }
  
  const worksheet = self.workbook.worksheets[sheetIndex];
  if (!worksheet) {
    throw new Error(`Sheet at index ${sheetIndex} not found`);
  }
  
  const cells = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cell = worksheet.getCell(row, col);
      if (cell.value !== null && cell.value !== undefined) {
        cells.push({
          row,
          col,
          value: getCellValue(cell),
          style: extractCellStyle(cell)
        });
      }
    }
  }
  
  self.postMessage({
    type: 'CELL_RANGE',
    data: { cells }
  });
}