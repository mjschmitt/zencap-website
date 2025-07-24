import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

const ExcelJSViewerComponent = ({ file, title = "Model Viewer", height = "600px", onSuccess, onError }) => {
  const [workbookData, setWorkbookData] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const processingRef = useRef(false); // Prevent concurrent processing
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side for portal rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Full-screen handlers
  const toggleFullScreen = () => {
    try {
      setIsFullScreen(prev => !prev);
    } catch (error) {
      console.error('Full-screen toggle error:', error);
      setIsFullScreen(false);
    }
  };

  const exitFullScreen = () => {
    try {
      setIsFullScreen(false);
    } catch (error) {
      console.error('Exit full-screen error:', error);
    }
  };

  // Handle ESC key to exit full-screen
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullScreen) {
        exitFullScreen();
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when in full-screen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isFullScreen]);

  // Memoize callbacks to prevent useEffect re-runs
  const handleSuccess = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  const handleError = useCallback((err) => {
    onError?.(err);
  }, [onError]);

  // Memoize the file URL to prevent unnecessary re-processing
  const fileUrl = useMemo(() => file, [file]);

  useEffect(() => {
    if (!fileUrl || processingRef.current) return;

    const loadExcelJS = async () => {
      if (processingRef.current) return; // Double-check for race conditions
      
      try {
        processingRef.current = true; // Set processing lock
        setLoading(true);
        setError(null);

        // Dynamic import of ExcelJS with retry logic
        let ExcelJS;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            ExcelJS = await import('exceljs');
            break; // Success, exit retry loop
          } catch (importError) {
            retryCount++;
            console.warn(`ExcelJS import attempt ${retryCount} failed:`, importError);
            
            if (retryCount >= maxRetries) {
              throw new Error(`Failed to load ExcelJS after ${maxRetries} attempts. Please refresh the page.`);
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        // Fetch the Excel file
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Create workbook and load buffer
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        // Extract images from the workbook
        const extractedImages = [];
        if (workbook.media && workbook.media.length > 0) {
          workbook.media.forEach((media, index) => {
            try {
              // Create blob URL for the image
              const blob = new Blob([media.buffer], { type: `image/${media.extension}` });
              const imageUrl = URL.createObjectURL(blob);
              
              extractedImages.push({
                id: media.name || `image_${index}`,
                url: imageUrl,
                extension: media.extension,
                buffer: media.buffer,
                name: media.name
              });
              
            } catch (err) {
              console.warn(`⚠️ Failed to process image ${index}:`, err);
            }
          });
        }
        
        // Process all worksheets
        const processedSheets = [];
        workbook.eachSheet((worksheet, sheetId) => {
          const sheetData = processSheet(worksheet, extractedImages);
          processedSheets.push(sheetData);
        });

        setWorkbookData({ sheets: processedSheets });
        handleSuccess();
        
      } catch (err) {
        console.error('ExcelJS Viewer Error:', err);
        setError(err.message);
        handleError(err);
      } finally {
        setLoading(false);
        processingRef.current = false; // Release processing lock
      }
    };

    loadExcelJS();
  }, [fileUrl, handleSuccess, handleError]); // processSheet will be stable due to useCallback

  const findActualDataRange = (worksheet) => {
    let startRow = Infinity, startCol = Infinity;
    let endRow = 0, endCol = 0;
    
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
          startRow = Math.min(startRow, rowNumber);
          startCol = Math.min(startCol, colNumber);
          endRow = Math.max(endRow, rowNumber);
          endCol = Math.max(endCol, colNumber);
        }
      });
    });
    
    // Fallback to at least A1 if no data found
    if (startRow === Infinity) {
      return { startRow: 1, startCol: 1, endRow: 1, endCol: 1 };
    }
    
    // Increased limits for financial models which often have many columns and rows
    // Use actual range but with reasonable maximums for performance
    const maxRows = Math.min(endRow, startRow + 500); // Increased from 200 to 500
    const maxCols = Math.min(endCol, startCol + 100); // Increased from 50 to 100
    
    return { startRow, startCol, endRow: maxRows, endCol: maxCols };
  };

  const convertExcelSerialDate = (serialDate) => {
    // Excel serial date: days since January 1, 1900 (with 1900 leap year bug)
    // JavaScript: milliseconds since January 1, 1970
    const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Adjust for Excel's leap year bug (Excel thinks 1900 was a leap year)
    const adjustedSerial = serialDate > 59 ? serialDate - 1 : serialDate;
    
    // Convert to JavaScript date
    const jsDate = new Date(excelEpoch.getTime() + (adjustedSerial - 1) * msPerDay);
    return jsDate;
  };

  const isExcelDateSerial = (value, numFmt) => {
    // Check if it's a number that could be an Excel date serial
    return typeof value === 'number' && 
           value > 1 && value < 2958466 && // Reasonable date range (1900-9999)
           numFmt && (
             numFmt.includes('mm') || 
             numFmt.includes('dd') || 
             numFmt.includes('yy') ||
             numFmt.includes('m/') ||
             numFmt.includes('d/')
           );
  };

  const parseISODateString = useCallback((isoString) => {
    // Handle ISO date strings like "2021-07-31T00:00:00.000Z"
    // Must be a string and match ISO date pattern
    if (typeof isoString !== 'string') return null;
    
    // Check if it matches ISO date pattern (YYYY-MM-DDTHH:mm:ss.sssZ or similar)
    if (!isoString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) return null;
    
    try {
      const date = new Date(isoString);
      // Ensure it's a valid date and not a prehistoric date from number conversion
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        return date;
      }
    } catch (e) {
      // Not a valid ISO date
    }
    return null;
  }, []);

  const extractDateFromObject = useCallback((cellValue) => {
    // Extract date from complex objects with JSON strings
    if (cellValue === null || cellValue === undefined) return null;
    
    let parsedValue = cellValue;
    
    // If it's a string that looks like JSON, try to parse it
    if (typeof cellValue === 'string' && (cellValue.startsWith('{"') || cellValue.startsWith('{'))) {
      try {
        parsedValue = JSON.parse(cellValue);
      } catch (e) {
        return null;
      }
    }
    
    // If it's an object, look for date fields
    if (typeof parsedValue === 'object' && parsedValue !== null) {
      // Look for date in result field
      if (parsedValue.result) {
        const isoDate = parseISODateString(parsedValue.result);
        if (isoDate) {
          return isoDate;
        }
      }
      
      // Look for date in value field
      if (parsedValue.value) {
        const isoDate = parseISODateString(parsedValue.value);
        if (isoDate) {
          return isoDate;
        }
      }
    }
    
    // Also check if the original string value itself is an ISO date
    if (typeof cellValue === 'string' && cellValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      const isoDate = parseISODateString(cellValue);
      if (isoDate) {
        return isoDate;
      }
    }
    
    return null;
  }, [parseISODateString]);

  // ENHANCED Excel Number Format Parser - based on deep research of Excel format codes
  const parseExcelNumberFormat = useCallback((numFmt) => {
    if (!numFmt || typeof numFmt !== 'string') {
      return {
        isPercentage: false,
        decimalPlaces: 3, // Default to 3 for financial models
        hasThousandsSeparator: false,
        isCurrency: false,
        customPattern: null,
        isAccountingFormat: false,
        hasUnderscoreSpacing: false
      };
    }

    // Handle Excel's complex number format structure: POSITIVE;NEGATIVE;ZERO;TEXT
    const sections = numFmt.split(';');
    const positiveFormat = sections[0] || numFmt;

    const formatInfo = {
      isPercentage: false,
      decimalPlaces: 3,
      hasThousandsSeparator: false,
      isCurrency: false,
      customPattern: positiveFormat,
      multiplier: 1,
      isAccountingFormat: false,
      hasUnderscoreSpacing: false
    };

    // ENHANCED: Check for accounting format with underscore spacing
    // Format like: "_(* #,##0_);_(* (#,##0);_(* \"-\"_);_(@_)"
    if (positiveFormat.includes('_') && (positiveFormat.includes('_(') || positiveFormat.includes('_)'))) {
      formatInfo.isAccountingFormat = true;
      formatInfo.hasUnderscoreSpacing = true;
      
      // Count underscore spacing characters for padding calculation
      const underscoreCount = (positiveFormat.match(/_/g) || []).length;
      formatInfo.underscoreSpacing = Math.max(underscoreCount * 4, 8); // 4px per underscore, minimum 8px
    }

    // Check for percentage format
    if (positiveFormat.includes('%')) {
      formatInfo.isPercentage = true;
      formatInfo.multiplier = 100; // Excel percentages are stored as decimals
      
      // Count decimal places in percentage format
      const percentMatch = positiveFormat.match(/0\.(0+)%/);
      if (percentMatch) {
        formatInfo.decimalPlaces = percentMatch[1].length;
      } else if (positiveFormat.includes('0%')) {
        formatInfo.decimalPlaces = 0;
      } else {
        formatInfo.decimalPlaces = 1; // Default for percentages
      }
    }
    // Check for currency formats
    else if (positiveFormat.includes('$') || positiveFormat.includes('USD') || 
             positiveFormat.includes('£') || positiveFormat.includes('€')) {
      formatInfo.isCurrency = true;
      
      // Count decimal places in currency format
      const currencyDecimalMatch = positiveFormat.match(/0\.(0+)/);
      if (currencyDecimalMatch) {
        formatInfo.decimalPlaces = currencyDecimalMatch[1].length;
      } else if (positiveFormat.includes('0.00')) {
        formatInfo.decimalPlaces = 2;
      } else {
        formatInfo.decimalPlaces = 2; // Default for currency
      }
    }
    // Check for number formats with decimal places
    else {
      // Look for decimal place patterns like 0.000, #,##0.00, etc.
      const decimalMatch = positiveFormat.match(/0\.(0+)|#\.(#+)|\.(0+)|\.(\#+)/);
      if (decimalMatch) {
        // Find the longest decimal pattern
        const decimalPart = decimalMatch[1] || decimalMatch[2] || decimalMatch[3] || decimalMatch[4] || '';
        formatInfo.decimalPlaces = decimalPart.length;
      } else if (positiveFormat.includes('.')) {
        formatInfo.decimalPlaces = 2; // Default when decimal point exists
      } else {
        formatInfo.decimalPlaces = 0; // Integer format
      }
    }

    // Check for thousands separator
    if (positiveFormat.includes(',') || positiveFormat.includes('#,##')) {
      formatInfo.hasThousandsSeparator = true;
    }

    // Handle special Excel format codes
    if (positiveFormat.includes('"x"')) {
      formatInfo.customPattern = 'multiplier'; // Like "2.5x"
      formatInfo.decimalPlaces = 1;
    }

    return formatInfo;
  }, []);

  // ENHANCED format cell value using the comprehensive parser
  const formatCellValue = useCallback((cell) => {
    // Handle null/undefined/empty
    if (cell.value === null || cell.value === undefined || cell.value === '') {
      return '';
    }

    // ENHANCED: Handle shared formulas without results (common in complex models)
    if (typeof cell.value === 'object' && cell.value.sharedFormula && !cell.value.result) {
      // For shared formulas without results, return empty string instead of showing formula
      return '';
    }

    // Get the format information - APPLIES TO EVERY CELL
    const numFmt = cell.style?.numFmt;
    const formatInfo = parseExcelNumberFormat(numFmt);

    // ENHANCED: Comprehensive date detection FIRST (before other logic)
    // 1. Native JavaScript Date objects
    if (cell.value instanceof Date) {
      const month = String(cell.value.getMonth() + 1).padStart(2, '0');
      const day = String(cell.value.getDate()).padStart(2, '0');
      const year = cell.value.getFullYear();
      return `${month}/${day}/${year}`;
    }

    // 2. Excel serial number dates
    if (typeof cell.value === 'number' && isExcelDateSerial(cell.value, numFmt)) {
      const dateFromSerial = convertExcelSerialDate(cell.value);
      if (dateFromSerial) {
        const month = String(dateFromSerial.getMonth() + 1).padStart(2, '0');
        const day = String(dateFromSerial.getDate()).padStart(2, '0');
        const year = dateFromSerial.getFullYear();
        return `${month}/${day}/${year}`;
      }
    }

    // 3. Text that looks like dates (GMT, ISO, etc.)
    if (cell.text && typeof cell.text === 'string') {
      // Check for GMT date strings
      if (cell.text.includes('GMT') && numFmt && numFmt.includes('mm-dd')) {
        try {
          const parsedDate = new Date(cell.text);
          if (!isNaN(parsedDate.getTime())) {
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const day = String(parsedDate.getDate()).padStart(2, '0');
            const year = parsedDate.getFullYear();
            return `${month}/${day}/${year}`;
          }
        } catch (e) {
          // Fall through to other logic
        }
      }

      // Check for ISO date strings in text
      const isoDate = parseISODateString(cell.text);
      if (isoDate && !isNaN(isoDate.getTime())) {
        const month = String(isoDate.getMonth() + 1).padStart(2, '0');
        const day = String(isoDate.getDate()).padStart(2, '0');
        const year = isoDate.getFullYear();
        return `${month}/${day}/${year}`;
      }
    }

    // Handle objects and JSON strings - ENHANCED to avoid raw JSON display
    if (typeof cell.value === 'object' && cell.value !== null) {
      // ENHANCED: Handle hyperlinks properly
      if (cell.value.hyperlink && cell.value.text) {
        return cell.value.text; // Display the text, not the hyperlink object
      }
      
      // For objects, try to extract meaningful display value
      if (cell.value.result !== undefined) {
        // Handle formula results with proper formatting
        if (typeof cell.value.result === 'number') {
          return formatNumberWithExcelFormat(cell.value.result, formatInfo, cell);
        } else if (typeof cell.value.result === 'string') {
          const extractedDate = extractDateFromObject(cell.value);
          if (extractedDate) {
            // FIXED: Force mm/dd/yyyy format consistently
            const month = String(extractedDate.getMonth() + 1).padStart(2, '0');
            const day = String(extractedDate.getDate()).padStart(2, '0');
            const year = extractedDate.getFullYear();
            return `${month}/${day}/${year}`;
          }
          return cell.value.result;
        }
      } else if (cell.value.text !== undefined) {
        return cell.value.text;
      } else if (cell.value.value !== undefined) {
        // FIXED: Use proper formatting for numbers in value field
        if (typeof cell.value.value === 'number') {
          return formatNumberWithExcelFormat(cell.value.value, formatInfo, cell);
        }
        return String(cell.value.value);
      }
      
      // ENHANCED: More aggressive extraction before falling back to N/A
      if (cell.text) {
        return cell.text;
      }
      
      // Check for any other meaningful properties in the object
      const objKeys = Object.keys(cell.value).filter(key => 
        cell.value[key] !== null && 
        cell.value[key] !== undefined && 
        cell.value[key] !== ''
      );
      
      if (objKeys.length > 0) {
        // FIXED: Prioritize evaluated results over formula text
        // First, check for any numeric results (including 0)
        for (const key of ['result', 'value']) {
          if (cell.value[key] !== undefined) {
            if (typeof cell.value[key] === 'number') {
              // Use our formatting function for numbers (including 0)
              return formatNumberWithExcelFormat(cell.value[key], formatInfo, cell);
            } else if (typeof cell.value[key] === 'string') {
              return cell.value[key];
            }
          }
        }
        
        // Then check for text representations
        for (const key of ['text', 'richText']) {
          if (cell.value[key] && typeof cell.value[key] === 'string') {
            return cell.value[key];
          }
        }
        
        // ONLY show formula text if no evaluated result exists
        // This prevents showing formulas when they evaluate to 0
        for (const key of ['hyperlink', 'formula', 'sharedFormula']) {
          if (cell.value[key] && typeof cell.value[key] === 'string') {
            // Check if this might be a formula that should show its result instead
            if (key === 'formula' || key === 'sharedFormula') {
              // If the formula exists but we have no result, it might be an error
              // In Excel, formulas that evaluate to 0 should show 0, not the formula
              // FIXED: Use proper formatting for the default 0 value
              return formatNumberWithExcelFormat(0, formatInfo, cell);
            }
            return cell.value[key];
          }
        }
        
        // If it's a simple object with one meaningful property, use that
        if (objKeys.length === 1) {
          const value = cell.value[objKeys[0]];
          if (typeof value === 'number') {
            return formatNumberWithExcelFormat(value, formatInfo, cell);
          } else if (typeof value === 'string') {
            return value;
          }
        }
      }
      
      // Last resort: if absolutely nothing else works, return empty instead of N/A
      return '';
    }

    // Handle JSON strings - ENHANCED to extract meaningful values
    if (typeof cell.value === 'string' && (cell.value.startsWith('{"') || cell.value.startsWith('{'))) {
      try {
        const parsed = JSON.parse(cell.value);
        if (parsed.result !== undefined) {
          if (typeof parsed.result === 'number') {
            return formatNumberWithExcelFormat(parsed.result, formatInfo, cell);
          }
          return String(parsed.result);
        } else if (parsed.text !== undefined) {
          return parsed.text;
        } else if (parsed.value !== undefined) {
          // FIXED: Use proper formatting for numbers in parsed value field
          if (typeof parsed.value === 'number') {
            return formatNumberWithExcelFormat(parsed.value, formatInfo, cell);
          }
          return String(parsed.value);
        }
        // FIXED: Use proper formatting for formula fallback instead of 'Formula' text
        if (cell.text) {
          return cell.text;
        }
        // If we have a formula but no result, default to 0 with proper formatting
        return formatNumberWithExcelFormat(0, formatInfo, cell);
      } catch (e) {
        return cell.text || cell.value;
      }
    }

    // Handle raw numbers - ENHANCED with comprehensive format support
    if (typeof cell.value === 'number') {
      return formatNumberWithExcelFormat(cell.value, formatInfo, cell);
    }

    // For any other string or primitive value
    return String(cell.value);
  }, [parseExcelNumberFormat, extractDateFromObject]);

  // ENHANCED: Number formatting function based on Excel format codes
  const formatNumberWithExcelFormat = useCallback((value, formatInfo, cell) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return String(value);
    }

    // Special handling for percentages
    if (formatInfo.isPercentage) {
      // If cell.text already has %, use it directly (Excel pre-formatted)
      if (cell.text && cell.text.includes('%')) {
        return cell.text;
      }
      
      // Convert decimal to percentage (multiply by 100)
      const percentValue = value * formatInfo.multiplier;
      const formatted = `${percentValue.toFixed(formatInfo.decimalPlaces)}%`;
      return formatted;
    }

    // Special handling for currency
    if (formatInfo.isCurrency) {
      const formatted = `$${value.toLocaleString('en-US', { 
        minimumFractionDigits: formatInfo.decimalPlaces, 
        maximumFractionDigits: formatInfo.decimalPlaces 
      })}`;
      return formatted;
    }

    // Special handling for multiplier patterns (like "2.5x")
    if (formatInfo.customPattern === 'multiplier') {
      const formatted = `${value.toFixed(formatInfo.decimalPlaces)}x`;
      return formatted;
    }

    // Standard number formatting
    const hasExcessiveDecimals = value.toString().includes('.') && 
                                value.toString().split('.')[1]?.length > formatInfo.decimalPlaces;

    let formatted;
    if (formatInfo.hasThousandsSeparator) {
      formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: formatInfo.decimalPlaces,
        maximumFractionDigits: formatInfo.decimalPlaces
      });
    } else {
      if (hasExcessiveDecimals || formatInfo.decimalPlaces > 0) {
        formatted = value.toFixed(formatInfo.decimalPlaces);
      } else {
        formatted = Math.round(value).toString();
      }
    }

    return formatted;
  }, []);

  const processCellWithStyles = useCallback((cell, rowIndex, colIndex) => {
    // Debug logging for key cells only - reduced verbosity
    const cellAddress = `${String.fromCharCode(64 + colIndex)}${rowIndex}`;
    const isDebugCell = false; // Disable detailed cell debugging since it's working well
    
    if (isDebugCell) {
      // Only log date detection for cells that are actually detected as dates
      const extractedDate = extractDateFromObject(cell.value);
      const finalIsDateValue = !!(cell.value instanceof Date || 
                                 (cell.text && cell.text.includes('GMT') && cell.style?.numFmt?.includes('mm-dd')) ||
                                 isExcelDateSerial(cell.value, cell.style?.numFmt) ||
                                 extractedDate);
      
      if (finalIsDateValue) {
      }
    }

    // Extract cell value with simplified ExcelJS handling
    let formattedValue = '';
    
    if (cell.value !== null && cell.value !== undefined) {
      // Use the optimized formatCellValue function
      formattedValue = formatCellValue(cell);
      
      // SAFETY CHECK: Ensure we never display [object Object]
      if (formattedValue === '[object Object]' || formattedValue.toString() === '[object Object]') {
        // Log this case since it indicates an issue

        
        // Fallback for objects that weren't properly handled
        if (typeof cell.value === 'object') {
          // Try to extract meaningful content from objects
          if (cell.value.text) {
            formattedValue = cell.value.text;
          } else if (cell.value.result !== undefined) {
            formattedValue = String(cell.value.result);
          } else if (cell.value.value !== undefined) {
            formattedValue = String(cell.value.value);
          } else {
            formattedValue = cell.text || JSON.stringify(cell.value) || 'N/A';
          }
        } else {
          formattedValue = String(cell.value);
        }
      }
    } else {
      // Empty cell
      formattedValue = '';
    }

    if (isDebugCell && formattedValue) {
    }

    // Extract ExcelJS styles and convert to CSS
    const style = extractExcelJSStyles(cell, cellAddress);

    return {
      address: cellAddress,
      value: cell.value,
      formattedValue,
      style,
      rowIndex,
      colIndex
    };
  }, [extractDateFromObject, formatCellValue]);

  // Helper function to check if cell is part of a merged range
  const getCellMergeInfo = useCallback((worksheet, rowIndex, colIndex) => {
    // FIXED: Handle cases where _merges doesn't exist or isn't iterable
    if (!worksheet._merges || !Array.isArray(worksheet._merges) || worksheet._merges.length === 0) {
      return null;
    }
    
    try {
      for (const merge of worksheet._merges) {
        // Ensure merge object has required properties
        if (!merge || typeof merge.top !== 'number' || typeof merge.bottom !== 'number' || 
            typeof merge.left !== 'number' || typeof merge.right !== 'number') {
          continue;
        }
        
        // Convert merge range to indices (0-based for our viewer)
        const startRow = merge.top;
        const endRow = merge.bottom;
        const startCol = merge.left;
        const endCol = merge.right;
        
        // Check if current cell is within merge range
        if (rowIndex >= startRow && rowIndex <= endRow && 
            colIndex >= startCol && colIndex <= endCol) {
          return {
            isTopLeft: rowIndex === startRow && colIndex === startCol,
            rowSpan: endRow - startRow + 1,
            colSpan: endCol - startCol + 1,
            skip: !(rowIndex === startRow && colIndex === startCol) // Skip cells that aren't top-left
          };
        }
      }
    } catch (error) {
      console.warn('Error processing merged cells:', error);
      return null;
    }
    
    return null;
  }, []);

  // Memoize expensive sheet processing to prevent re-computation
  const processSheet = useCallback((worksheet, extractedImages) => {
    
    // Extract worksheet view settings
    const showGridLines = worksheet.views && worksheet.views[0] ? 
      worksheet.views[0].showGridLines !== false : true; // Default to true if not specified
    
    // Extract freeze pane information from Excel worksheet
    let frozenRows = 0;
    let frozenCols = 0;
    
    if (worksheet.views && worksheet.views[0]) {
      const view = worksheet.views[0];
      
      // ExcelJS stores freeze pane information in the view object
      if (view.state === 'frozen') {
        // Extract frozen rows and columns from the view
        if (view.ySplit !== undefined && view.ySplit > 0) {
          frozenRows = view.ySplit;
        }
        if (view.xSplit !== undefined && view.xSplit > 0) {
          frozenCols = view.xSplit;
        }
      }
      
      // Alternative: Check for freeze pane properties directly
      if (view.pane && view.pane.state === 'frozen') {
        if (view.pane.ySplit !== undefined && view.pane.ySplit > 0) {
          frozenRows = view.pane.ySplit;
        }
        if (view.pane.xSplit !== undefined && view.pane.xSplit > 0) {
          frozenCols = view.pane.xSplit;
        }
      }
      
      // Additional check for freeze state
      if (view.freeze && view.freeze.state === 'frozen') {
        if (view.freeze.ySplit !== undefined && view.freeze.ySplit > 0) {
          frozenRows = view.freeze.ySplit;
        }
        if (view.freeze.xSplit !== undefined && view.freeze.xSplit > 0) {
          frozenCols = view.freeze.xSplit;
        }
      }
    }
    
    // Get column information
    const columns = worksheet.columns || [];
    
    // Calculate column widths (ExcelJS provides actual widths)
    // ENHANCED: Better match actual Excel column widths and handle hidden columns
    const columnWidths = columns.map((col, index) => {
      // ENHANCED: Handle hidden columns (set them to minimal width but visible)
      if (col.hidden) {
        return 20; // Minimal width for hidden columns but still show them
      }
      
      if (col.width) {
        // ENHANCED: Handle very narrow columns (like spacers)
        if (col.width < 2) {
          return Math.max(col.width * 7, 15); // Minimum 15px for very narrow columns
        }
        
        // Use a higher multiplier to better match Excel widths
        // Excel width units are roughly 7 pixels per unit
        const calculatedWidth = col.width * 7;
        
        // Don't cap the width too aggressively - let wide columns be wide
        const minWidth = 60;
        const maxWidth = 400; // Increased from 150 to allow wider columns
        
        const finalWidth = Math.max(Math.min(calculatedWidth, maxWidth), minWidth);
        
        return finalWidth;
      } else {
        // Default width for columns without explicit width
        const excelColumnName = String.fromCharCode(65 + index);
        return 80;
      }
    });
    
    // Find actual data range (optimize performance)
    const range = findActualDataRange(worksheet);
    
    // FIXED: Adjust freeze pane values to account for data range offset
    // Excel freeze panes are based on absolute column/row numbers, but our viewer
    // starts from the actual data range, so we need to adjust accordingly
    const originalFrozenCols = frozenCols;
    const originalFrozenRows = frozenRows;
    
    if (frozenCols > 0) {
      // Adjust frozen columns: subtract the starting column offset
      // If Excel has freeze at column B (xSplit=2) but we start displaying from column B (range.startCol=2),
      // then in our viewer, column B becomes index 0, so frozenCols should be 0
      frozenCols = Math.max(0, frozenCols - range.startCol + 1);
    }
    
    if (frozenRows > 0) {
      // Adjust frozen rows: subtract the starting row offset
      // If Excel has freeze at row 7 (ySplit=7) but we start displaying from row 7 (range.startRow=7),
      // then in our viewer, row 7 becomes index 0, so frozenRows should be 0
      frozenRows = Math.max(0, frozenRows - range.startRow + 1);
    }
    
    // Debug logging for freeze pane adjustment
    if (originalFrozenCols > 0 || originalFrozenRows > 0) {
      console.log(`Freeze pane adjustment for ${worksheet.name}:`, {
        original: { cols: originalFrozenCols, rows: originalFrozenRows },
        adjusted: { cols: frozenCols, rows: frozenRows },
        dataRange: { startCol: range.startCol, startRow: range.startRow }
      });
    }
    
    // IMPORTANT: Adjust columnWidths array to match the data range
    // Only include widths for columns that are actually being displayed
    const adjustedColumnWidths = columnWidths.slice(range.startCol - 1, range.endCol);
    
    const data = [];
    const styles = [];
    
    // Process only the actual data range
    for (let rowNumber = range.startRow; rowNumber <= range.endRow; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData = [];
      const rowStyles = [];
      
      for (let colNumber = range.startCol; colNumber <= range.endCol; colNumber++) {
        const cell = row.getCell(colNumber);
        const processedCell = processCellWithStyles(cell, rowNumber, colNumber);
        
        // ENHANCED: Handle merged cells
        const adjustedRowIndex = rowNumber - range.startRow;
        const adjustedColIndex = colNumber - range.startCol;
        const mergeInfo = getCellMergeInfo(worksheet, rowNumber, colNumber);
        
        if (mergeInfo && mergeInfo.skip) {
          // Skip cells that are part of a merge but not the top-left
          rowData.push('');
          rowStyles.push({ ...processedCell.style, display: 'none' });
        } else {
          rowData.push(processedCell.formattedValue);
          const cellStyle = { ...processedCell.style };
          
          // Add merge information to style for HTML rendering
          if (mergeInfo && mergeInfo.isTopLeft) {
            cellStyle._mergeInfo = {
              rowSpan: mergeInfo.rowSpan,
              colSpan: mergeInfo.colSpan
            };
          }
          
          rowStyles.push(cellStyle);
        }
      }
      
      // ENHANCED: Better row height calculation with spacer row handling
      let rowHeight;
      if (row.height !== undefined && row.height < 10) {
        // Handle small spacer rows - check if they have meaningful content
        const hasContent = rowData.some(cell => cell && cell !== '' && cell !== null && cell !== undefined);
        if (!hasContent) {
          rowHeight = Math.max(row.height * 1.33, 6); // Very small height for empty spacer rows
        } else {
          rowHeight = Math.max(row.height * 1.33, 12); // Small minimum for spacer rows with content
        }
      } else {
        rowHeight = row.height ? Math.max(row.height * 1.33, 18) : 20; // Normal row height
      }
      
      data.push(rowData);
      styles.push({ cells: rowStyles, height: rowHeight });
    }
    
    // Process images for this worksheet
    const worksheetImages = [];
    if (extractedImages && extractedImages.length > 0) {
      // ExcelJS doesn't directly provide image cell positions, but we can make educated guesses
      // Most financial model logos are typically in the top-left area (A1:D4)
      
      // For now, place the first image in the top-left corner (A1 equivalent in our display)
      if (extractedImages.length > 0) {
        const firstImage = extractedImages[0];
        
        // Check if we have data in the top-left area - if A1 is empty, place image there
        const hasTopLeftData = data[0] && data[0][0] && data[0][0].trim() !== '';
        
        if (!hasTopLeftData) {
          worksheetImages.push({
            ...firstImage,
            position: {
              row: 0, // First row in our display
              col: 0, // First column in our display
              rowSpan: 3, // Span 3 rows
              colSpan: 1, // Span 1 column (just the description column)
            },
            displayInCell: true
          });
          
        }
      }
    }
    
    return {
      name: worksheet.name,
      data,
      styles,
      columnWidths: adjustedColumnWidths, // Use adjusted widths that match the data range
      rowHeights: styles.map(s => s.height),
      range,
      images: worksheetImages, // Add images to the sheet data
      showGridLines, // Add gridlines setting
      frozenRows, // Add freeze pane information
      frozenCols
    };
  }, [processCellWithStyles, getCellMergeInfo]);

  // Helper functions for border styling - MOVED UP to fix hoisting issues
  const convertBorderStyle = useCallback((excelStyle) => {
    const styleMap = {
      'thin': 'solid',
      'medium': 'solid',
      'thick': 'solid',
      'dotted': 'dotted',
      'dashed': 'dashed',
      'double': 'double'
    };
    return styleMap[excelStyle] || 'solid';
  }, []);

  // Helper function to apply Excel tint/shade to colors
  const applyTintToColor = useCallback((hexColor, tint) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    let newR, newG, newB;
    
    if (tint > 0) {
      // Lighten the color (tint towards white)
      newR = Math.round(r + (255 - r) * tint);
      newG = Math.round(g + (255 - g) * tint);
      newB = Math.round(b + (255 - b) * tint);
    } else {
      // Darken the color (shade towards black)
      const shade = Math.abs(tint);
      newR = Math.round(r * (1 - shade));
      newG = Math.round(g * (1 - shade));
      newB = Math.round(b * (1 - shade));
    }
    
    // Convert back to hex
    const toHex = (val) => Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0');
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }, []);

  const getBorderColor = useCallback((colorObj) => {
    if (!colorObj) return '#000000';
    if (colorObj.argb) return `#${colorObj.argb.substring(2)}`;
    if (colorObj.rgb) return `#${colorObj.rgb}`;
    // ENHANCED: Handle theme colors
    if (colorObj.theme !== undefined) {
      const themeColors = {
        0: '#000000', // Text 1 (Black)
        1: '#FFFFFF', // Background 1 (White)
        2: '#1F497D', // Text 2 (Dark Blue)
        3: '#EEECE1', // Background 2 (Light Gray)
        4: '#4F81BD', // Accent 1 (Blue)
        5: '#9CBB58', // Accent 2 (Green)
        6: '#F79646', // Accent 3 (Orange)
        7: '#8064A2', // Accent 4 (Purple)
        8: '#4BACC6', // Accent 5 (Light Blue)
        9: '#F15A24'  // Accent 6 (Red-Orange)
      };
      return themeColors[colorObj.theme] || '#000000';
    }
    return '#000000';
  }, []);

  // ENHANCED: Smart numeric cell detection - FIXED to handle format codes with numeric content
  const isNumericCell = useCallback((cell) => {
    const numFmt = cell.style?.numFmt;
    const formatInfo = parseExcelNumberFormat(numFmt);

    // PRIORITY 1: If Excel explicitly defines this as a numeric format, right-align
    if (formatInfo.isPercentage || formatInfo.isCurrency || formatInfo.customPattern === 'multiplier') {
      return true;
    }
    
    // PRIORITY 2: Check if cell.text contains formatted values that clearly indicate numbers
    if (cell.text) {
      const text = cell.text.toString().trim();
      
      // FIXED: Be more specific about percentage patterns
      // Only treat as percentage if it actually looks like a percentage VALUE
      if (text.match(/^\d+(\.\d+)?%$/) || text.match(/^\(\d+(\.\d+)?%\)$/)) {
        return true; // Like "15.5%" or "(12.3%)"
      }
      
      // Currency patterns
      if (text.match(/^\$[\d,]+(\.\d+)?$/) || text.match(/^[\d,]+(\.\d+)?\s*(USD|EUR|GBP)$/)) {
        return true; // Like "$1,000.50" or "1000 USD"
      }
      
      // Multiplier pattern like "2.5x"
      if (text.match(/^\d+(\.\d+)?x$/)) {
        return true;
      }
      
      // Pure number patterns - ENHANCED to be more selective
      if (text.match(/^\d+$/) || // Pure integers: "123"
          text.match(/^\d{1,3}(,\d{3})+$/) || // Formatted integers: "1,000" 
          text.match(/^\d+\.\d+$/) || // Pure decimals: "123.45"
          text.match(/^\d{1,3}(,\d{3})*\.\d+$/)) { // Formatted decimals: "1,000.50"
        return true;
      }
      
      // FIXED: Don't treat text that contains words as numeric
      // If it contains letters (except in specific patterns), it's likely text
      if (text.match(/[a-zA-Z]/) && !text.match(/^\d+(\.\d+)?\s*(USD|EUR|GBP|x)$/)) {
        return false; // Text like "% chg", "Revenue", "EBITDA", etc.
      }
    }

    // PRIORITY 3: Check if the cell value is a number
    if (typeof cell.value === 'number' && !isNaN(cell.value)) {
      return true;
    }

    // PRIORITY 4: FIXED: Be more conservative with string-to-number conversion
    if (typeof cell.value === 'string') {
      const trimmed = cell.value.trim();
      
      // Only treat as numeric if it's clearly a number without letters
      if (trimmed.match(/^[\d\s,$€£%x.,-]+$/) && !isNaN(parseFloat(trimmed)) && isFinite(trimmed)) {
        // Additional check: if it contains letters other than currency symbols, it's probably text
        if (trimmed.match(/[a-zA-Z]/) && !trimmed.match(/^[\d\s,$€£%x.,-]+$/)) {
          return false;
        }
        return true;
      }
      
      return false;
    }

    // PRIORITY 5: Check if the cell value is an object with a numeric result
    if (typeof cell.value === 'object' && cell.value !== null) {
      if (cell.value.result !== undefined && typeof cell.value.result === 'number') {
        return true;
      }
      
      // FIXED: Be more selective about object text/value conversion
      if (cell.value.text !== undefined && typeof cell.value.text === 'string') {
        const trimmed = cell.value.text.trim();
        // Only numeric-looking text in objects
        if (trimmed.match(/^[\d\s,$€£%x.,-]+$/) && !isNaN(parseFloat(trimmed)) && isFinite(trimmed)) {
          return true;
        }
      }
      
      if (cell.value.value !== undefined && typeof cell.value.value === 'number') {
        return true;
      }
    }

    // PRIORITY 6: FIXED: Handle format codes more intelligently
    // If Excel has a numeric format code, check if the content justifies it
    if (numFmt && (numFmt.includes('0') || numFmt.includes('#') || numFmt.includes('.'))) {
      // Check if the cell has numeric content (including 0)
      if (cell.value && typeof cell.value === 'number') {
        return true; // Direct number (including 0)
      }
      
      // Check if cell.text contains numeric content (including formatted 0s)
      if (cell.text) {
        const text = cell.text.toString().trim();
        // Accept formatted numbers, including 0 values
        if (text.match(/^[\d\s,$€£%x.,-]+$/) || 
            text === '0' || 
            text === '$0.00' || 
            text === '0.0%' ||
            text.match(/^0\.\d+%$/) ||
            text.match(/^\$0\.\d+$/)) {
          return true;
        }
      }
      
      // Check if the cell value object has numeric properties
      if (typeof cell.value === 'object' && cell.value !== null) {
        if (cell.value.result !== undefined || 
            cell.value.value !== undefined || 
            cell.value.text !== undefined) {
          // If it has any of these properties, it's likely a formatted cell
          return true;
        }
      }
      
      // FIXED: If we have a numeric format code, treat the cell as numeric
      // This is the key fix - if Excel says it's numeric, trust it
      return true;
    }

    // If none of the above, it's not a numeric cell
    return false;
  }, [parseExcelNumberFormat]);

  // Helper function to calculate luminance for contrast checking
  const getLuminance = useCallback((hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    
    const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }, []);

  const extractExcelJSStyles = useCallback((cell, cellRef) => {
    const style = {};
    
    if (!cell.style) return style;

    // Font styles
    if (cell.style.font) {
      const font = cell.style.font;
      
      if (font.bold) style.fontWeight = 'bold';
      if (font.italic) style.fontStyle = 'italic';
      if (font.underline) style.textDecoration = 'underline';
      if (font.strike) style.textDecoration = 'line-through';
      if (font.size) style.fontSize = `${font.size}pt`;
      if (font.name) style.fontFamily = font.name;
      
      // Font color - ENHANCED to handle theme colors
      if (font.color) {
        if (font.color.argb) {
          const argb = font.color.argb;
          const rgb = argb.length === 8 ? argb.substring(2) : argb;
          style.color = `#${rgb}`;
        } else if (font.color.rgb) {
          style.color = `#${font.color.rgb}`;
        } else if (font.color.indexed !== undefined) {
          // ENHANCED: Handle indexed colors (Excel's color palette)
          const indexed = font.color.indexed;
          if (indexed === 12) {
            // Index 12 is Excel's blue color for input cells - use same blue as ARGB
            style.color = '#0000FF';
          } else {
            // Default for other indexed colors
            style.color = '#000000';
          }
        } else if (font.color.theme !== undefined) {
          // ENHANCED: Handle theme-based colors with automatic contrast
          const theme = font.color.theme;
          const tint = font.color.tint || 0;
          
          // Get background color for contrast checking
          let backgroundColor = null;
          if (cell.style?.fill?.type === 'pattern' && cell.style.fill.fgColor) {
            if (cell.style.fill.fgColor.argb) {
              const argb = cell.style.fill.fgColor.argb;
              const rgb = argb.length === 8 ? argb.substring(2) : argb;
              backgroundColor = `#${rgb}`;
            } else if (cell.style.fill.fgColor.theme !== undefined) {
              // Handle theme-based backgrounds
              const bgTheme = cell.style.fill.fgColor.theme;
              const bgTint = cell.style.fill.fgColor.tint || 0;
              const themeBackgroundColors = {
                0: '#000000', 1: '#FFFFFF', 2: '#1F497D', 3: '#EEECE1',
                4: '#4F81BD', 5: '#9CBB58', 6: '#F79646', 7: '#8064A2',
                8: '#4BACC6', 9: '#F15A24'
              };
              let bgBaseColor = themeBackgroundColors[bgTheme] || '#FFFFFF';
              if (bgTint !== 0) {
                bgBaseColor = applyTintToColor(bgBaseColor, bgTint);
              }
              backgroundColor = bgBaseColor;
            }
          }
          
          // FIXED: Smart theme color interpretation with contrast awareness
          let baseColor;
          switch (theme) {
            case 0: // Text 1 - Auto contrast: white on dark, black on light
              if (backgroundColor && getLuminance(backgroundColor) < 0.5) {
                baseColor = '#FFFFFF'; // White text on dark background
              } else {
                baseColor = '#000000'; // Black text on light background
              }
              break;
            case 1: // Background 1 - When used as TEXT: auto contrast
              if (backgroundColor && getLuminance(backgroundColor) < 0.5) {
                baseColor = '#FFFFFF'; // White text on dark background
              } else {
                baseColor = '#000000'; // Black text on light background
              }
              break;
            case 2: // Text 2 - Dark blue text
              baseColor = '#1F497D';
              break;
            case 3: // Background 2 - When used as TEXT color = BLACK
              baseColor = '#000000';
              break;
            case 4: // Accent 1 - Blue theme for inputs
              baseColor = '#0066CC';
              break;
            case 5: // Accent 2 - Green theme
              baseColor = '#9CBB58';
              break;
            case 6: // Accent 3 - Orange theme
              baseColor = '#F79646';
              break;
            case 7: // Accent 4 - Purple theme
              baseColor = '#8064A2';
              break;
            case 8: // Accent 5 - Light Blue theme
              baseColor = '#4BACC6';
              break;
            case 9: // Accent 6 - Red-Orange theme
              baseColor = '#F15A24';
              break;
            default:
              baseColor = '#000000';
          }
          
          // Apply tint for non-auto-contrast theme colors
          if (tint !== 0 && theme !== 0 && theme !== 1) {
            baseColor = applyTintToColor(baseColor, tint);
          }
          
          // Debug logging for section headers (only for theme 0 with dark backgrounds)
          if (theme === 0 && backgroundColor && getLuminance(backgroundColor) < 0.5) {
            console.log(`🎨 Auto-contrast applied: Cell ${cellRef}, theme ${theme}, bg ${backgroundColor}, text color: ${baseColor}`);
          }
          
          style.color = baseColor;
        }
      }
    }

    // Fill/Background - ENHANCED to handle theme colors
    if (cell.style.fill && cell.style.fill.type === 'pattern') {
      const fill = cell.style.fill;
      if (fill.fgColor) {
        if (fill.fgColor.argb) {
          const argb = fill.fgColor.argb;
          const rgb = argb.length === 8 ? argb.substring(2) : argb;
          style.backgroundColor = `#${rgb}`;
        } else if (fill.fgColor.rgb) {
          style.backgroundColor = `#${fill.fgColor.rgb}`;
        } else if (fill.fgColor.theme !== undefined) {
          // ENHANCED: Handle theme-based background colors with tint support
          const theme = fill.fgColor.theme;
          const tint = fill.fgColor.tint || 0;
          
          // Excel's theme colors for backgrounds
          let baseColor;
          switch (theme) {
            case 0: // Text 1 color used as background (black)
              baseColor = '#000000';
              break;
            case 1: // Background 1 (white)
              baseColor = '#FFFFFF';
              break;
            case 2: // Text 2 color used as background (dark blue)
              baseColor = '#1F497D';
              break;
            case 3: // Background 2 (light gray) - FIXED to be darker
              baseColor = '#D9D9D9'; // Darker gray to match Excel better
              break;
            case 4: // Accent 1 (blue)
              baseColor = '#0066CC';
              break;
            case 5: // Accent 2 (green)
              baseColor = '#9CBB58';
              break;
            case 6: // Accent 3 (orange)
              baseColor = '#F79646';
              break;
            case 7: // Accent 4 (purple)
              baseColor = '#8064A2';
              break;
            case 8: // Accent 5 (light blue)
              baseColor = '#4BACC6';
              break;
            case 9: // Accent 6 (red-orange)
              baseColor = '#F15A24';
              break;
            default:
              baseColor = '#FFFFFF';
          }
          
          // Apply tint/shade modifications if present
          if (tint !== 0) {
            baseColor = applyTintToColor(baseColor, tint);
          }
          
          style.backgroundColor = baseColor;
        }
      }
    }

    // Alignment - ENHANCED to work with new number formatting system and accounting format
    const numFmt = cell.style?.numFmt;
    const formatInfo = parseExcelNumberFormat(numFmt);
    
    if (cell.style.alignment) {
      const alignment = cell.style.alignment;
      if (alignment.horizontal) {
        style.textAlign = alignment.horizontal;
      }
      if (alignment.vertical) {
        style.verticalAlign = alignment.vertical === 'middle' ? 'middle' : alignment.vertical;
      }
      if (alignment.wrapText) {
        style.whiteSpace = 'pre-wrap';
      }
    } else {
      // FIXED: Explicit default alignment for cells with no Excel alignment
      const shouldRightAlign = isNumericCell(cell);
      if (shouldRightAlign) {
        style.textAlign = 'right'; // Numbers, percentages, currency
        // REMOVED: Don't automatically color numeric cells blue
      } else {
        style.textAlign = 'left';   // Text, descriptions, labels
      }
    }
    
    // ENHANCED: Handle Excel accounting format with underscore spacing
    if (formatInfo.hasUnderscoreSpacing && formatInfo.isAccountingFormat) {
      // Apply padding to simulate Excel's underscore spacing characters
      style.paddingLeft = `${formatInfo.underscoreSpacing || 8}px`;
      style.paddingRight = `${Math.max(formatInfo.underscoreSpacing / 2, 4)}px`;
      style.textAlign = 'right'; // Ensure right alignment for accounting format
      
      // Debug logging for accounting format cells
      if (cellRef === 'I9' || cellRef === 'I34') {
        console.log(`🔧 Applied accounting format to ${cellRef}:`, {
          format: numFmt,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          underscoreSpacing: formatInfo.underscoreSpacing
        });
      }
    }

    // Borders
    if (cell.style.border) {
      const border = cell.style.border;
      const borderParts = [];
      
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        if (border[side] && border[side].style) {
          const borderStyle = convertBorderStyle(border[side].style);
          const borderColor = border[side].color ? 
            (border[side].color.argb ? `#${border[side].color.argb.substring(2)}` : '#000000') : '#000000';
          borderParts.push(`${borderStyle} ${borderColor}`);
        }
      });
      
      if (borderParts.length > 0) {
        if (border.top) style.borderTop = `1px ${convertBorderStyle(border.top.style)} ${getBorderColor(border.top.color)}`;
        if (border.right) style.borderRight = `1px ${convertBorderStyle(border.right.style)} ${getBorderColor(border.right.color)}`;
        if (border.bottom) style.borderBottom = `1px ${convertBorderStyle(border.bottom.style)} ${getBorderColor(border.bottom.color)}`;
        if (border.left) style.borderLeft = `1px ${convertBorderStyle(border.left.style)} ${getBorderColor(border.left.color)}`;
      }
    }

    // DISABLED: Remove automatic contrast adjustment - it's causing color inversions
    // Excel's theme colors should be trusted as-is without modification
    // The original colors from theme mapping should be preserved
    
    return style;
  }, [convertBorderStyle, getBorderColor, isNumericCell, applyTintToColor, getLuminance]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Loading ExcelJS viewer...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-medium">ExcelJS Viewer Error</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <div className="mt-3 space-y-2">
          <p className="text-gray-600 text-xs">
            If this error persists, try:
          </p>
          <ul className="text-gray-600 text-xs list-disc list-inside space-y-1">
            <li>Refreshing the page</li>
            <li>Clearing your browser cache</li>
            <li>Checking your internet connection</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!workbookData || !workbookData.sheets.length) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No Excel data available to display.</p>
      </div>
    );
  }

  const currentSheet = workbookData.sheets[activeSheet];

  // Full-screen component
  const FullScreenViewer = () => (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-600 font-medium">✓ ExcelJS</span>
            <span className="text-xs text-gray-500">Full Formatting</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sheet tabs */}
          {workbookData.sheets.length > 1 && (
            <div className="flex space-x-1">
              {workbookData.sheets.map((sheet, index) => (
                <button
                  key={sheet.name}
                  onClick={() => setActiveSheet(index)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    activeSheet === index
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border'
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          )}
          
          {/* Full-screen toggle button */}
          <button
            onClick={toggleFullScreen}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Exit Full Screen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Spreadsheet content */}
      <div className="flex-1 overflow-auto bg-white">
        <FrozenExcelTable sheet={currentSheet} isFullScreen={true} />
      </div>
      
      {/* Footer info */}
      <div className="px-3 py-1 bg-gray-50 border-t text-xs text-gray-500 flex-shrink-0">
        Sheet: {currentSheet.name} • 
        Dimensions: {currentSheet.data.length} rows × {currentSheet.columnWidths.length} columns • 
        <span className="text-green-600 font-medium">ExcelJS Full Formatting</span>
        {currentSheet.images && currentSheet.images.length > 0 && (
          <span> • <span className="text-blue-600 font-medium">📸 {currentSheet.images.length} Image(s)</span></span>
        )}
        <span> • <span className={`font-medium ${currentSheet.showGridLines ? 'text-gray-600' : 'text-teal-600'}`}>
          🔲 Gridlines {currentSheet.showGridLines ? 'ON' : 'OFF'}
        </span></span>
        <span> • <span className="text-purple-600 font-medium">🖥️ Full Screen Mode</span></span>
      </div>
    </div>
  );

  // Normal viewer component
  const NormalViewer = () => (
    <div className="w-full bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-600 font-medium">✓ ExcelJS</span>
            <span className="text-xs text-gray-500">Full Formatting</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sheet tabs */}
          {workbookData.sheets.length > 1 && (
            <div className="flex space-x-1">
              {workbookData.sheets.map((sheet, index) => (
                <button
                  key={sheet.name}
                  onClick={() => setActiveSheet(index)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    activeSheet === index
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border'
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          )}
          
          {/* Full-screen toggle button */}
          <button
            onClick={toggleFullScreen}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Enter Full Screen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Spreadsheet content */}
      <div 
        className="w-full bg-white overflow-auto"
        style={{ 
          height: height,
          minHeight: '500px',
          maxHeight: height
        }}
      >
        <FrozenExcelTable sheet={currentSheet} isFullScreen={false} />
      </div>
      
      {/* Footer info */}
      <div className="px-3 py-1 bg-gray-50 border-t text-xs text-gray-500">
        Sheet: {currentSheet.name} • 
        Dimensions: {currentSheet.data.length} rows × {currentSheet.columnWidths.length} columns • 
        <span className="text-green-600 font-medium">ExcelJS Full Formatting</span>
        {currentSheet.images && currentSheet.images.length > 0 && (
          <span> • <span className="text-blue-600 font-medium">📸 {currentSheet.images.length} Image(s)</span></span>
        )}
        <span> • <span className={`font-medium ${currentSheet.showGridLines ? 'text-gray-600' : 'text-teal-600'}`}>
          🔲 Gridlines {currentSheet.showGridLines ? 'ON' : 'OFF'}
        </span></span>
      </div>
    </div>
  );

  // Render full-screen using portal if on client side
  if (isFullScreen && isClient) {
    return createPortal(<FullScreenViewer />, document.body);
  }

  return <NormalViewer />;
};

const ExcelJSViewer = React.memo(ExcelJSViewerComponent);

// Frozen Table component for freeze panes functionality
const FrozenExcelTable = React.memo(({ sheet, isFullScreen }) => {
  if (!sheet?.data?.length) return null;

  // Use actual data length with a reasonable performance limit (500 rows max)
  // This respects the actual data range from Excel instead of arbitrary cutoff
  const maxVisibleRows = Math.min(sheet.data.length, 500);
  const visibleData = sheet.data.slice(0, maxVisibleRows);
  const hasMoreRows = sheet.data.length > maxVisibleRows;

  // Freeze configuration from Excel file
  const frozenRows = sheet.frozenRows || 0;
  const frozenCols = sheet.frozenCols || 0;

  // If no freeze panes are set, render a simple table
  if (frozenRows === 0 && frozenCols === 0) {
    return (
      <div className="exceljs-simple-table-container h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          <table style={{
            borderCollapse: 'collapse',
            fontSize: '11px',
            tableLayout: 'fixed'
          }}>
            <colgroup>
              {sheet.columnWidths.map((width, index) => (
                <col key={index} style={{ width: `${width}px` }} />
              ))}
            </colgroup>
            <tbody>
              {visibleData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  style={{ 
                    height: `${sheet.rowHeights[rowIndex] || 20}px`
                  }}
                >
                  {row.map((cellValue, colIndex) => {
                    const cellStyle = sheet.styles[rowIndex]?.cells[colIndex] || {};
                    
                    // ENHANCED: Skip rendering cells that should be hidden (merged cells)
                    if (cellStyle.display === 'none') {
                      return null;
                    }
                    
                    const borderClass = sheet.showGridLines ? 'border border-gray-300' : 'border-0';
                    
                    // Check if this cell should display an image
                    const imageForCell = sheet.images?.find(img => 
                      img.position.row === rowIndex && 
                      img.position.col === colIndex &&
                      img.displayInCell
                    );
                    
                    return (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className={`${borderClass} px-1 py-0.5 bg-white relative`}
                        style={{
                          ...cellStyle,
                          position: 'relative',
                          overflow: 'visible',
                          fontSize: '11px',
                          lineHeight: '1.2',
                          verticalAlign: imageForCell ? 'top' : 'middle'
                        }}
                        title={imageForCell ? `Image: ${imageForCell.name}` : cellValue}
                        rowSpan={imageForCell ? imageForCell.position.rowSpan : (cellStyle._mergeInfo ? cellStyle._mergeInfo.rowSpan : 1)}
                        colSpan={imageForCell ? imageForCell.position.colSpan : (cellStyle._mergeInfo ? cellStyle._mergeInfo.colSpan : 1)}
                      >
                        {imageForCell ? (
                            <img 
                              src={imageForCell.url} 
                              alt={imageForCell.name || 'Excel Image'}
                              className="max-w-full h-auto"
                              style={{
                                maxHeight: `${(sheet.rowHeights[rowIndex] || 20) * (imageForCell.position.rowSpan || 1)}px`,
                                maxWidth: '100%',
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                console.warn(`Failed to load image: ${imageForCell.name}`);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (() => {
                            // Check if text should spill over into next empty cells
                            const nextCellValue = row[colIndex + 1];
                            const allowSpillover = !nextCellValue || nextCellValue === '' || nextCellValue === null || nextCellValue === undefined;
                            
                            if (allowSpillover && cellValue && String(cellValue).length > 8) {
                              return (
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: '4px',
                                    top: '2px',
                                    whiteSpace: 'nowrap',
                                    zIndex: 10,
                                    backgroundColor: cellStyle.backgroundColor || 'transparent'
                                  }}
                                >
                                  {cellValue}
                                </div>
                              );
                            } else {
                              return (
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {cellValue}
                                </div>
                              );
                            }
                          })()}
                      </td>
                    );
                  }).filter(Boolean)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {hasMoreRows && (
          <div className="flex-shrink-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            📊 Showing first {maxVisibleRows} rows of {sheet.data.length} total data rows (performance limit: 500)
            {sheet.images && sheet.images.length > 0 && (
              <span> | <span className="font-medium text-purple-600">📸 {sheet.images.length} Image(s) Displayed</span></span>
            )}
            <span> | <span className={`font-medium ${sheet.showGridLines ? 'text-gray-600' : 'text-teal-600'}`}>
              🔲 Gridlines {sheet.showGridLines ? 'ON' : 'OFF'}
            </span></span>
          </div>
        )}
        
        {!hasMoreRows && maxVisibleRows === sheet.data.length && (
          <div className="flex-shrink-0 mt-1 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            ✅ Showing all {sheet.data.length} data rows
            {sheet.images && sheet.images.length > 0 && (
              <span> | <span className="font-medium text-purple-600">📸 {sheet.images.length} Image(s) Displayed</span></span>
            )}
            <span> | <span className={`font-medium ${sheet.showGridLines ? 'text-gray-600' : 'text-teal-600'}`}>
              🔲 Gridlines {sheet.showGridLines ? 'ON' : 'OFF'}
            </span></span>
          </div>
        )}
      </div>
    );
  }

  // Refs for scroll synchronization (only needed when freeze panes are active)
  const topRightRef = React.useRef(null);
  const bottomLeftRef = React.useRef(null);
  const bottomRightRef = React.useRef(null);

  // Split data into quadrants
  const topLeftData = visibleData.slice(0, frozenRows).map(row => row.slice(0, frozenCols));
  const topRightData = visibleData.slice(0, frozenRows).map(row => row.slice(frozenCols));
  const bottomLeftData = visibleData.slice(frozenRows).map(row => row.slice(0, frozenCols));
  const bottomRightData = visibleData.slice(frozenRows).map(row => row.slice(frozenCols));

  // Split styles similarly
  const topLeftStyles = sheet.styles.slice(0, frozenRows).map(rowStyle => ({
    ...rowStyle,
    cells: rowStyle.cells.slice(0, frozenCols)
  }));
  const topRightStyles = sheet.styles.slice(0, frozenRows).map(rowStyle => ({
    ...rowStyle,
    cells: rowStyle.cells.slice(frozenCols)
  }));
  const bottomLeftStyles = sheet.styles.slice(frozenRows).map(rowStyle => ({
    ...rowStyle,
    cells: rowStyle.cells.slice(0, frozenCols)
  }));
  const bottomRightStyles = sheet.styles.slice(frozenRows).map(rowStyle => ({
    ...rowStyle,
    cells: rowStyle.cells.slice(frozenCols)
  }));

  // Split column widths
  const frozenColumnWidths = sheet.columnWidths.slice(0, frozenCols);
  const scrollableColumnWidths = sheet.columnWidths.slice(frozenCols);

  // Scroll synchronization handlers
  const handleHorizontalScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    if (topRightRef.current) topRightRef.current.scrollLeft = scrollLeft;
    if (bottomRightRef.current) bottomRightRef.current.scrollLeft = scrollLeft;
  };

  const handleVerticalScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    if (bottomLeftRef.current) bottomLeftRef.current.scrollTop = scrollTop;
    if (bottomRightRef.current) bottomRightRef.current.scrollTop = scrollTop;
  };

  const handleMainScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const scrollTop = e.target.scrollTop;
    if (topRightRef.current) topRightRef.current.scrollLeft = scrollLeft;
    if (bottomLeftRef.current) bottomLeftRef.current.scrollTop = scrollTop;
  };

  // Common table styles
  const tableStyle = {
    borderCollapse: 'collapse',
    fontSize: '11px',
    tableLayout: 'fixed'
  };

  const renderTableSection = (data, styles, columnWidths, rowOffset = 0, colOffset = 0, isFrozen = false) => {
    const borderClass = sheet.showGridLines ? 'border border-gray-300' : 'border-0';
    
    // Calculate total table width to prevent cutoff
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    
    return (
    <table style={{
      ...tableStyle,
      width: `${totalWidth}px`, // Ensure table has exact width needed
      minWidth: `${totalWidth}px` // Prevent shrinking
    }}>
      <colgroup>
        {columnWidths.map((width, index) => (
          <col key={index} style={{ width: `${width}px` }} />
        ))}
      </colgroup>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr 
            key={rowIndex + rowOffset}
            style={{ 
              height: `${sheet.rowHeights[rowIndex + rowOffset] || 20}px`
            }}
          >
            {row.map((cellValue, colIndex) => {
              const cellStyle = styles[rowIndex]?.cells[colIndex] || {};
              
              // ENHANCED: Skip rendering cells that should be hidden (merged cells)
              if (cellStyle.display === 'none') {
                return null;
              }
              
              const actualRow = rowIndex + rowOffset;
              const actualCol = colIndex + colOffset;
              
              // Check if this cell should display an image
              const imageForCell = sheet.images?.find(img => 
                img.position.row === actualRow && 
                img.position.col === actualCol &&
                img.displayInCell
              );
              
              return (
                <td
                  key={`${actualRow}-${actualCol}`}
                  className={`${borderClass} px-1 py-0.5 ${isFrozen ? 'bg-gray-50' : 'bg-white'} relative`}
                  style={{
                    ...cellStyle,
                    position: 'relative',
                    overflow: 'visible',
                    fontSize: '11px',
                    lineHeight: '1.2',
                    backgroundColor: isFrozen ? (cellStyle.backgroundColor || '#f9fafb') : cellStyle.backgroundColor,
                    verticalAlign: imageForCell ? 'top' : 'middle'
                  }}
                  title={imageForCell ? `Image: ${imageForCell.name}` : cellValue}
                  rowSpan={imageForCell ? imageForCell.position.rowSpan : (cellStyle._mergeInfo ? cellStyle._mergeInfo.rowSpan : 1)}
                  colSpan={imageForCell ? imageForCell.position.colSpan : (cellStyle._mergeInfo ? cellStyle._mergeInfo.colSpan : 1)}
                >
                  {imageForCell ? (
                    <div className="flex items-start justify-start h-full">
                      <img 
                        src={imageForCell.url} 
                        alt={imageForCell.name || 'Excel Image'}
                        className="max-w-full h-auto"
                        style={{
                          maxHeight: `${(sheet.rowHeights[actualRow] || 20) * (imageForCell.position.rowSpan || 1)}px`,
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          console.warn(`Failed to load image: ${imageForCell.name}`);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (() => {
                    // Check if text should spill over into next empty cells
                    const nextCellValue = row[colIndex + 1];
                    const allowSpillover = !nextCellValue || nextCellValue === '' || nextCellValue === null || nextCellValue === undefined;
                    
                    if (allowSpillover && cellValue && String(cellValue).length > 8) {
                      return (
                        <div
                          style={{
                            position: 'absolute',
                            left: '4px',
                            top: '2px',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                            backgroundColor: cellStyle.backgroundColor || 'transparent'
                          }}
                        >
                          {cellValue}
                        </div>
                      );
                    } else {
                      return (
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cellValue}
                        </div>
                      );
                    }
                  })()}
                </td>
              );
            }).filter(Boolean)}
          </tr>
        ))}
      </tbody>
    </table>
    );
  };

  return (
    <div className={`exceljs-frozen-table-container h-full flex flex-col ${isFullScreen ? 'w-full' : 'w-full'}`}>
      <div 
        className="flex-1 relative p-1 w-full" 
        style={{ 
          width: '100%',
          maxWidth: '100%',
          minWidth: '100%',
          overflow: 'hidden',
          height: '100%'
        }}
      >
        {/* Frozen Table Grid Layout - ENHANCED for full width utilization */}
        <div 
          className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] h-full max-h-full"
          style={{ 
            width: '100%',
            maxWidth: '100%',
            minWidth: '100%',
            height: '100%'
          }}
        >
          
          {/* Top-Left: Frozen rows & columns (A1:A2) */}
          <div className="border-r-2 border-b-2 border-gray-400 sticky top-0 left-0 z-30 overflow-hidden bg-gray-100">
            {renderTableSection(topLeftData, topLeftStyles, frozenColumnWidths, 0, 0, true)}
          </div>
          
          {/* Top-Right: Frozen rows, scrollable columns (B1:X2) - ENHANCED for full width */}
          <div 
            ref={topRightRef}
            className="border-b-2 border-gray-400 sticky top-0 z-20 overflow-x-auto overflow-y-hidden bg-gray-100"
            style={{ 
              width: '100%',
              maxWidth: '100%',
              minWidth: 0
            }}
            onScroll={handleHorizontalScroll}
          >
            {renderTableSection(topRightData, topRightStyles, scrollableColumnWidths, 0, frozenCols, true)}
          </div>
          
          {/* Bottom-Left: Frozen columns, scrollable rows (A3:A150) */}
          <div 
            ref={bottomLeftRef}
            className="border-r-2 border-gray-400 sticky left-0 z-20 overflow-y-auto overflow-x-hidden bg-gray-100"
            style={{
              height: '100%'
            }}
            onScroll={handleVerticalScroll}
          >
            {renderTableSection(bottomLeftData, bottomLeftStyles, frozenColumnWidths, frozenRows, 0, true)}
          </div>
          
          {/* Bottom-Right: Scrollable data area (B3:X500) - ENHANCED for full width */}
          <div 
            ref={bottomRightRef}
            className="overflow-auto bg-white"
            style={{ 
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              minWidth: 0
            }}
            onScroll={handleMainScroll}
          >
            {renderTableSection(bottomRightData, bottomRightStyles, scrollableColumnWidths, frozenRows, frozenCols, false)}
          </div>
          
        </div>
      </div>
      
      {hasMoreRows && (
        <div className="flex-shrink-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          📊 Showing first {maxVisibleRows} rows of {sheet.data.length} total data rows (performance limit: 500) | 
          <span className="font-medium text-teal-600"> ❄️ Freeze Panes Active</span> ({frozenCols > 0 ? `${frozenCols} column${frozenCols > 1 ? 's' : ''}` : ''}{frozenCols > 0 && frozenRows > 0 ? ' & ' : ''}{frozenRows > 0 ? `${frozenRows} row${frozenRows > 1 ? 's' : ''}` : ''} frozen)
          {sheet.images && sheet.images.length > 0 && (
            <span> | <span className="font-medium text-purple-600">📸 {sheet.images.length} Image(s) Displayed</span></span>
          )}
          <span> | <span className={`font-medium ${sheet.showGridLines ? 'text-gray-600' : 'text-teal-600'}`}>
            🔲 Gridlines {sheet.showGridLines ? 'ON' : 'OFF'}
          </span></span>
        </div>
      )}
      
      {!hasMoreRows && maxVisibleRows === sheet.data.length && (
        <div className="flex-shrink-0 mt-1 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          ✅ Showing all {sheet.data.length} data rows | 
          <span className="font-medium text-teal-600"> ❄️ Freeze Panes Active</span> ({frozenCols > 0 ? `${frozenCols} column${frozenCols > 1 ? 's' : ''}` : ''}{frozenCols > 0 && frozenRows > 0 ? ' & ' : ''}{frozenRows > 0 ? `${frozenRows} row${frozenRows > 1 ? 's' : ''}` : ''} frozen)
          {sheet.images && sheet.images.length > 0 && (
            <span> | <span className="font-medium text-purple-600">📸 {sheet.images.length} Image(s) Displayed</span></span>
          )}
          <span> | <span className={`font-medium ${sheet.showGridLines ? 'text-gray-600' : 'text-teal-600'}`}>
            🔲 Gridlines {sheet.showGridLines ? 'ON' : 'OFF'}
          </span></span>
        </div>
      )}
    </div>
  );
});

// Add display names for debugging
ExcelJSViewerComponent.displayName = 'ExcelJSViewerComponent';
ExcelJSViewer.displayName = 'ExcelJSViewer';
FrozenExcelTable.displayName = 'FrozenExcelTable';

export default ExcelJSViewer; 