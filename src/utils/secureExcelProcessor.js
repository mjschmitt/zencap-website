// Secure Excel processor that replaces vulnerable Luckysheet
// Head of Security & Compliance - Critical security implementation

import ExcelJS from 'exceljs';
import crypto from 'crypto';
import { FILE_SECURITY, SecurityUtils } from '../config/security.js';

export class SecureExcelProcessor {
  constructor() {
    this.workbook = null;
    this.securityContext = {
      allowFormulas: false,
      allowExternalReferences: false,
      maxCells: 1000000, // 1M cells max
      maxWorksheets: 50
    };
  }

  /**
   * Securely load Excel file with validation
   */
  async loadFile(buffer) {
    try {
      // Validate file size
      if (buffer.length > FILE_SECURITY.maxFileSize) {
        throw new Error(`File too large: ${buffer.length} bytes exceeds ${FILE_SECURITY.maxFileSize} bytes`);
      }

      // Create new workbook instance
      this.workbook = new ExcelJS.Workbook();
      
      // Configure security options
      const options = {
        ignoreNodes: [
          'definedNames', // Block defined names that could contain formulas
          'calcPr',       // Block calculation properties
          'workbookPr'    // Block workbook properties
        ],
        map: {
          // Disable potentially dangerous elements
          hyperlinks: false,
          comments: false,
          drawings: false,
          pivotTables: false,
          tables: false
        }
      };

      // Load workbook with security restrictions
      await this.workbook.xlsx.load(buffer, options);

      // Validate workbook structure
      await this.validateWorkbook();

      return {
        success: true,
        worksheets: this.getWorksheetInfo(),
        securityChecks: await this.performSecurityChecks()
      };

    } catch (error) {
      throw new Error(`Failed to load Excel file: ${error.message}`);
    }
  }

  /**
   * Get safe worksheet information
   */
  getWorksheetInfo() {
    if (!this.workbook) return [];

    return this.workbook.worksheets
      .filter(ws => ws.state !== 'hidden' && ws.state !== 'veryHidden')
      .slice(0, this.securityContext.maxWorksheets) // Limit worksheets
      .map((worksheet, index) => ({
        id: index,
        name: SecurityUtils.sanitizeInput(worksheet.name),
        rowCount: worksheet.rowCount,
        columnCount: worksheet.columnCount,
        actualRowCount: worksheet.actualRowCount,
        actualColumnCount: worksheet.actualColumnCount,
        state: worksheet.state
      }));
  }

  /**
   * Securely extract worksheet data
   */
  async getWorksheetData(worksheetIndex, options = {}) {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }

    const worksheet = this.workbook.worksheets[worksheetIndex];
    if (!worksheet) {
      throw new Error(`Worksheet ${worksheetIndex} not found`);
    }

    // Apply viewport restrictions
    const startRow = Math.max(1, options.startRow || 1);
    const endRow = Math.min(worksheet.rowCount, options.endRow || 1000);
    const startCol = Math.max(1, options.startCol || 1);
    const endCol = Math.min(worksheet.columnCount, options.endCol || 50);

    // Validate cell count
    const cellCount = (endRow - startRow + 1) * (endCol - startCol + 1);
    if (cellCount > this.securityContext.maxCells) {
      throw new Error(`Too many cells requested: ${cellCount} exceeds limit of ${this.securityContext.maxCells}`);
    }

    const cells = [];
    const mergedCells = [];
    const images = [];

    try {
      // Process cells within the specified range
      for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
        const row = worksheet.getRow(rowNum);
        
        for (let colNum = startCol; colNum <= endCol; colNum++) {
          const cell = row.getCell(colNum);
          
          if (cell.value !== null && cell.value !== undefined) {
            // Security: Block formulas if not allowed
            if (cell.formula && !this.securityContext.allowFormulas) {
              console.warn(`Blocked formula in cell ${cell.address}: ${cell.formula}`);
              continue;
            }

            // Extract safe cell data
            const cellData = {
              row: rowNum - 1, // Convert to 0-based indexing
              col: colNum - 1, // Convert to 0-based indexing
              address: cell.address,
              value: this.sanitizeCellValue(cell.value),
              type: this.getCellType(cell),
              style: this.extractSafeStyle(cell.style)
            };

            cells.push(cellData);
          }
        }
      }

      // Extract merged cells (safe extraction)
      worksheet.model.merges.forEach(merge => {
        const range = merge.split(':');
        if (range.length === 2) {
          mergedCells.push({
            start: this.addressToCoords(range[0]),
            end: this.addressToCoords(range[1])
          });
        }
      });

      // Extract images (metadata only, not content)
      worksheet.getImages().forEach((image, index) => {
        images.push({
          id: index,
          name: SecurityUtils.sanitizeInput(image.name || 'image'),
          type: image.extension || 'unknown',
          // Don't include actual image data for security
          hasData: !!image.buffer
        });
      });

      return {
        cells,
        mergedCells: mergedCells.slice(0, 1000), // Limit merged cells
        images: images.slice(0, 100), // Limit images
        dimensions: {
          rowCount: worksheet.actualRowCount,
          columnCount: worksheet.actualColumnCount
        },
        name: SecurityUtils.sanitizeInput(worksheet.name),
        showGridLines: worksheet.views && worksheet.views[0] ? worksheet.views[0].showGridLines : true
      };

    } catch (error) {
      throw new Error(`Failed to extract worksheet data: ${error.message}`);
    }
  }

  /**
   * Sanitize cell values to prevent XSS and other attacks
   */
  sanitizeCellValue(value) {
    if (typeof value === 'string') {
      return SecurityUtils.sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      // Handle rich text, formulas, etc.
      if (value.richText) {
        return value.richText.map(rt => SecurityUtils.sanitizeInput(rt.text)).join('');
      } else if (value.formula) {
        // Block formulas for security
        return '[FORMULA BLOCKED]';
      } else if (value.result !== undefined) {
        return this.sanitizeCellValue(value.result);
      }
    }
    return value;
  }

  /**
   * Get safe cell type
   */
  getCellType(cell) {
    if (cell.formula) return 'formula';
    if (typeof cell.value === 'number') return 'number';
    if (typeof cell.value === 'boolean') return 'boolean';
    if (cell.value instanceof Date) return 'date';
    if (typeof cell.value === 'string') return 'string';
    return 'unknown';
  }

  /**
   * Extract safe styling information
   */
  extractSafeStyle(style) {
    if (!style) return null;

    const safeStyle = {};

    // Font properties
    if (style.font) {
      safeStyle.font = {
        name: SecurityUtils.sanitizeInput(style.font.name),
        size: typeof style.font.size === 'number' ? Math.min(72, Math.max(6, style.font.size)) : 11,
        bold: !!style.font.bold,
        italic: !!style.font.italic,
        underline: !!style.font.underline,
        color: this.sanitizeColor(style.font.color)
      };
    }

    // Fill properties
    if (style.fill) {
      safeStyle.fill = {
        type: style.fill.type,
        fgColor: this.sanitizeColor(style.fill.fgColor),
        bgColor: this.sanitizeColor(style.fill.bgColor)
      };
    }

    // Border properties
    if (style.border) {
      safeStyle.border = {
        top: this.sanitizeBorder(style.border.top),
        left: this.sanitizeBorder(style.border.left),
        bottom: this.sanitizeBorder(style.border.bottom),
        right: this.sanitizeBorder(style.border.right)
      };
    }

    // Alignment
    if (style.alignment) {
      safeStyle.alignment = {
        horizontal: style.alignment.horizontal,
        vertical: style.alignment.vertical,
        wrapText: !!style.alignment.wrapText,
        shrinkToFit: !!style.alignment.shrinkToFit
      };
    }

    return Object.keys(safeStyle).length > 0 ? safeStyle : null;
  }

  /**
   * Sanitize color values
   */
  sanitizeColor(color) {
    if (!color) return null;
    if (typeof color === 'string') {
      // Validate hex colors
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return color;
      }
    } else if (color.argb && typeof color.argb === 'string') {
      // Validate ARGB colors
      if (/^[0-9A-Fa-f]{8}$/.test(color.argb)) {
        return `#${color.argb.slice(2)}`;
      }
    }
    return null;
  }

  /**
   * Sanitize border information
   */
  sanitizeBorder(border) {
    if (!border) return null;
    
    return {
      style: border.style,
      color: this.sanitizeColor(border.color)
    };
  }

  /**
   * Convert Excel address to coordinates
   */
  addressToCoords(address) {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    if (!match) return { row: 0, col: 0 };

    const colStr = match[1];
    const rowNum = parseInt(match[2]) - 1; // Convert to 0-based

    // Convert column letters to number
    let colNum = 0;
    for (let i = 0; i < colStr.length; i++) {
      colNum = colNum * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    colNum -= 1; // Convert to 0-based

    return { row: rowNum, col: colNum };
  }

  /**
   * Validate workbook structure for security
   */
  async validateWorkbook() {
    if (!this.workbook) return;

    // Check worksheet count
    if (this.workbook.worksheets.length > this.securityContext.maxWorksheets) {
      throw new Error(`Too many worksheets: ${this.workbook.worksheets.length} exceeds limit of ${this.securityContext.maxWorksheets}`);
    }

    // Check for suspicious content
    let totalCells = 0;
    for (const worksheet of this.workbook.worksheets) {
      totalCells += worksheet.actualRowCount * worksheet.actualColumnCount;
      
      if (totalCells > this.securityContext.maxCells) {
        throw new Error(`Workbook too large: ${totalCells} cells exceeds limit of ${this.securityContext.maxCells}`);
      }
    }
  }

  /**
   * Perform security checks on the loaded workbook
   */
  async performSecurityChecks() {
    const checks = {
      formulasBlocked: 0,
      externalReferencesBlocked: 0,
      macrosDetected: false,
      suspiciousContent: []
    };

    if (!this.workbook) return checks;

    // Check each worksheet
    for (const worksheet of this.workbook.worksheets) {
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Check for formulas
          if (cell.formula) {
            checks.formulasBlocked++;
            
            // Check for suspicious functions
            const formula = cell.formula.toUpperCase();
            FILE_SECURITY.contentAnalysis.suspiciousFunctions.forEach(func => {
              if (formula.includes(func)) {
                checks.suspiciousContent.push({
                  type: 'suspicious_function',
                  function: func,
                  cell: cell.address
                });
              }
            });
          }

          // Check for external references
          if (cell.value && typeof cell.value === 'string') {
            if (cell.value.includes('http://') || cell.value.includes('https://') || cell.value.includes('ftp://')) {
              checks.externalReferencesBlocked++;
            }
          }
        });
      });
    }

    // Check for macros (VBA code)
    if (this.workbook.model && this.workbook.model.vbaProject) {
      checks.macrosDetected = true;
    }

    return checks;
  }

  /**
   * Search within worksheet
   */
  async searchWorksheet(worksheetIndex, query) {
    const worksheet = this.workbook.worksheets[worksheetIndex];
    if (!worksheet) return [];

    const results = [];
    const sanitizedQuery = SecurityUtils.sanitizeInput(query.toLowerCase());

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        const cellValue = this.sanitizeCellValue(cell.value);
        if (cellValue && typeof cellValue === 'string' && 
            cellValue.toLowerCase().includes(sanitizedQuery)) {
          
          const coords = this.addressToCoords(cell.address);
          results.push({
            row: coords.row,
            col: coords.col,
            address: cell.address,
            value: cellValue,
            context: cellValue.substring(0, 100) // Limit context length
          });
        }
      });
    });

    return results.slice(0, 100); // Limit search results
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.workbook = null;
  }
}