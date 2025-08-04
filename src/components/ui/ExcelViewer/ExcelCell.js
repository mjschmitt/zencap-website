import React, { memo, useMemo } from 'react';
import { useTheme } from './useTheme';
import styles from '../../../styles/ExcelViewer.module.css';

const ExcelCell = memo(({ 
  value, 
  style = {}, 
  row, 
  col,
  columnName = '',
  isSelected = false,
  isHighlighted = false,
  onClick,
  width = 100,
  height = 25,
  darkMode = false,
  isPrintMode = false,
  accessibilityMode = false,
  isMerged = false,
  showGridLines = true,
  isSpilloverCell = false,
  spilloverData = null,
  isSpilloverSource = false,
  zoom = 100
}) => {
  const { cellTheme } = useTheme(darkMode);
  // Determine cell type
  const cellType = useMemo(() => {
    if (style.formula) return 'formula';
    if (style.error) return 'error';
    if (style.readonly) return 'readonly';
    return 'normal';
  }, [style]);

  // Compute actual alignment based on Excel rules
  const computedAlignment = useMemo(() => {
    // If explicit alignment is set, use it
    if (style.alignment?.horizontal) {
      return style.alignment.horizontal;
    }
    
    // Otherwise, determine based on format and value
    const format = style.numberFormat;
    
    // Function to check if format is accounting-style
    const isAccountingFormat = (fmt) => {
      return fmt && (
        fmt.includes('_(') ||  // Accounting format indicator
        fmt.includes('_)') ||  // Accounting format indicator
        fmt.includes('* ') ||  // Accounting spacing
        fmt.includes('_$') ||  // Currency with spacing
        fmt.includes('_€') ||  // Euro with spacing
        fmt.includes('_£')     // Pound with spacing
      );
    };
    
    // Function to check if format is currency (non-accounting)
    const isCurrencyFormat = (fmt) => {
      return fmt && !isAccountingFormat(fmt) && (
        fmt.includes('$') ||
        fmt.includes('€') ||
        fmt.includes('£') ||
        fmt.includes('¥')
      );
    };
    
    // Function to check if format is percentage
    const isPercentageFormat = (fmt) => {
      return fmt && fmt.includes('%');
    };
    
    // Function to check if format is a standard date/time format (not custom)
    const isStandardDateTimeFormat = (fmt) => {
      if (!fmt) return false;
      
      // Common standard date formats that should be right-aligned
      const standardDateFormats = [
        'mm/dd/yyyy', 'dd/mm/yyyy', 'yyyy-mm-dd', 
        'mm/dd/yy', 'dd/mm/yy', 'yy-mm-dd',
        'mmm dd, yyyy', 'dd mmm yyyy', 'd-mmm-yy',
        'mm-dd-yyyy', 'dd-mm-yyyy', 'yyyy/mm/dd',
        'mmmm d, yyyy', 'd mmmm yyyy',
        'h:mm', 'h:mm:ss', 'hh:mm', 'hh:mm:ss',
        'h:mm am/pm', 'h:mm:ss am/pm'
      ];
      
      // Check if it's exactly a standard format (case-insensitive)
      const normalizedFmt = fmt.toLowerCase().replace(/\s+/g, ' ');
      if (standardDateFormats.some(f => normalizedFmt === f)) {
        return true;
      }
      
      // For custom formats like "d-mmm" that are ambiguous, return false
      // This ensures we only right-align clear date/time formats
      return false;
    };
    
    // Apply alignment based on format
    if (isAccountingFormat(format)) {
      return 'right';
    } else if (isCurrencyFormat(format) || isPercentageFormat(format)) {
      return 'right';
    } else if (isStandardDateTimeFormat(format)) {
      // Only right-align standard date formats, not custom formats like "d-mmm"
      return 'right';
    } else if (format && (format.includes('#') || format.includes('0'))) {
      return 'right';
    } else if (format === '@') {
      return 'left';
    } else if (typeof value === 'number' && value !== null && value !== undefined) {
      return 'right';
    } else if (value !== null && value !== undefined && value !== '') {
      return 'left';
    }
    
    // Default: no specific alignment
    return null;
  }, [style.alignment, style.numberFormat, value]);

  // Memoize cell styles to prevent re-renders
  const cellStyle = useMemo(() => {
    const zoomFactor = zoom / 100;
    const baseStyle = {
      width: '100%',
      height: '100%',
      overflow: isSpilloverCell ? 'visible' : 'hidden', // Allow spillover cells to show overflow
      whiteSpace: 'nowrap',
      textOverflow: isSpilloverCell ? 'clip' : 'ellipsis', // Don't ellipsis spillover text
      padding: `${3 * zoomFactor}px ${6 * zoomFactor}px`, // More generous padding like Excel, scaled by zoom
      cursor: 'cell',
      userSelect: 'none',
      boxSizing: 'border-box',
      position: 'relative',
      transition: 'all 0.15s ease-in-out'
    };
    
    // Hide content in very small rows (height <= 5px)
    if (height <= 5) {
      baseStyle.fontSize = '0px';
      baseStyle.lineHeight = '0px';
      baseStyle.padding = '0px';
      baseStyle.overflow = 'hidden';
    }

    // Apply font styles with proper precedence
    if (style.font) {
      // Force font weight to ensure it's applied
      baseStyle.fontWeight = style.font.bold === true ? '700' : '400';
      if (style.font.italic) baseStyle.fontStyle = 'italic';
      
      // Handle underline - accounting formats need special treatment
      if (style.font.underline) {
        // Debug underlines in columns H and I
        // if ((columnName === 'H' || columnName === 'I') && style.font.underline) {
        //   console.log(`[Underline Debug] Column ${columnName}${row}:`, {
        //     underline: style.font.underline,
        //     numberFormat: style.numberFormat,
        //     hasValue: value !== null && value !== undefined,
        //     value: value,
        //     font: style.font
        //   });
        // }
        
        // Check if this cell has accounting format or uses accounting-style underline
        const isAccountingFormat = style.numberFormat && (
          style.numberFormat.includes('_(') ||
          style.numberFormat.includes('_)') ||
          style.numberFormat.includes('* ') ||
          style.numberFormat.includes('_$') ||
          style.numberFormat.includes('_€') ||
          style.numberFormat.includes('_£')
        );
        
        // Also check if the underline value explicitly indicates accounting style
        const isAccountingUnderline = (
          style.font.underline === 'singleAccounting' ||
          style.font.underline === 'doubleAccounting' ||
          style.font.underline === 'accounting'
        );
        
        if (isAccountingFormat || isAccountingUnderline) {
          // For accounting format or accounting underline, we'll use a border-bottom to simulate full-width underline
          // This will be applied later after checking for existing borders
          baseStyle._needsAccountingUnderline = true;
          baseStyle._underlineType = style.font.underline;
          
          // Debug accounting underline application
          // if (columnName === 'H' || columnName === 'I') {
          //   console.log(`[Accounting Underline] Column ${columnName}${row} will use accounting underline`);
          // }
        } else {
          // Regular underline for non-accounting formats
          if (style.font.underline === 'double') {
            baseStyle.textDecoration = 'underline';
            baseStyle.textDecorationStyle = 'double';
          } else {
            baseStyle.textDecoration = 'underline';
          }
          
          // Debug regular underline application
          // if (columnName === 'H' || columnName === 'I') {
          //   console.log(`[Regular Underline] Column ${columnName}${row} will use regular underline`);
          // }
        }
      }
      // Convert Excel points to pixels (1pt = 1.333px) and scale by zoom
      if (style.font.size) {
        const pixels = Math.round(style.font.size * 1.333 * zoomFactor);
        baseStyle.fontSize = `${pixels}px`;
      } else {
        // Default Excel font size is 11pt = ~15px, scaled by zoom
        baseStyle.fontSize = `${15 * zoomFactor}px`;
      }
      // Always apply font colors to maintain Excel fidelity
      if (style.font.color) {
        const color = convertARGBToHex(style.font.color);
        if (color) {
          baseStyle.color = color;
          // In dark mode, if text is too light on dark background, add text shadow for readability
          if (darkMode && isLightColor(color) && !style.fill?.color) {
            baseStyle.textShadow = '0 0 1px rgba(0,0,0,0.5)';
          }
        }
      }
      if (style.font.name) {
        // Map Excel fonts to web-safe alternatives
        const fontMap = {
          'Calibri': 'Calibri, "Segoe UI", Arial, sans-serif',
          'Arial': 'Arial, Helvetica, sans-serif',
          'Times New Roman': '"Times New Roman", Times, serif',
          'Verdana': 'Verdana, Geneva, sans-serif',
          'Tahoma': 'Tahoma, Geneva, sans-serif',
          'Georgia': 'Georgia, serif',
          'Courier New': '"Courier New", Courier, monospace'
        };
        baseStyle.fontFamily = fontMap[style.font.name] || `"${style.font.name}", sans-serif`;
      } else {
        // Default to Calibri like Excel
        baseStyle.fontFamily = 'Calibri, "Segoe UI", Arial, sans-serif';
      }
    } else {
      // Set Excel defaults when no font style is specified
      baseStyle.fontWeight = '400';
      baseStyle.fontSize = `${15 * zoomFactor}px`; // 11pt scaled by zoom
      baseStyle.fontFamily = 'Calibri, "Segoe UI", Arial, sans-serif';
    }

    // Apply fill/background - preserve Excel formatting
    if (style.fill?.color) {
      const bgColor = convertARGBToHex(style.fill.color);
      // Always apply background colors to maintain Excel fidelity
      if (bgColor) {
        baseStyle.backgroundColor = bgColor;
        // Ensure text contrast on colored backgrounds
        if (!style.font?.color && isLightColor(bgColor)) {
          baseStyle.color = '#000000';
        } else if (!style.font?.color && !isLightColor(bgColor)) {
          baseStyle.color = '#FFFFFF';
        }
      }
    }

    // Apply alignment
    if (style.alignment) {
      // Only apply alignment if explicitly set in Excel
      if (style.alignment.horizontal) {
        baseStyle.textAlign = style.alignment.horizontal;
      }
      if (style.alignment.vertical) {
        baseStyle.verticalAlign = style.alignment.vertical;
      }
      if (style.alignment.wrapText) {
        baseStyle.whiteSpace = 'pre-wrap';
        baseStyle.wordWrap = 'break-word';
      }
      if (style.alignment.indent) {
        baseStyle.paddingLeft = `${(4 + style.alignment.indent * 8) * zoomFactor}px`;
      }
    }
    
    // Apply computed alignment if no explicit alignment was set
    if (!style.alignment?.horizontal && computedAlignment) {
      baseStyle.textAlign = computedAlignment;
    }

    // Apply borders with proper styling
    if (style.border && Object.keys(style.border).length > 0) {
      // Apply custom borders from Excel
      ['top', 'bottom', 'left', 'right'].forEach(side => {
        if (style.border[side]) {
          const borderStyle = style.border[side].style || 'solid';
          const borderWidth = getBorderWidth(borderStyle);
          const rawBorderColor = style.border[side].color;
          const borderColor = convertARGBToHex(rawBorderColor) || '#000000';
          
          // Skip white/light borders on filled cells
          // These are often artifacts from Excel that shouldn't be visible
          const isLightBorder = (
            borderColor === '#FFFFFF' || borderColor === '#ffffff' || 
            borderColor === '#F2F2F2' || borderColor === '#f2f2f2' ||
            borderColor === '#E7E6E6' || borderColor === '#e7e6e6' ||
            borderColor === '#D3D3D3' || borderColor === '#d3d3d3' ||
            borderColor === '#C0C0C0' || borderColor === '#c0c0c0' ||
            borderColor === '#FAFAFA' || borderColor === '#fafafa' ||
            borderColor === '#F5F5F5' || borderColor === '#f5f5f5'
          );
          
          if (style.fill?.color && isLightBorder) {
            // Skip this border - it's too light to be intentional on a filled cell
            return;
          }
          
          // Convert Excel border styles to CSS
          let cssBorderStyle = borderStyle;
          if (borderStyle === 'thin' || borderStyle === 'medium' || borderStyle === 'thick' || borderStyle === 'hair') {
            cssBorderStyle = 'solid';
          } else if (borderStyle === 'dotted' || borderStyle === 'dashDot' || borderStyle === 'dashDotDot') {
            cssBorderStyle = 'dotted';
          } else if (borderStyle === 'dashed' || borderStyle === 'mediumDashed' || borderStyle === 'slantDashDot') {
            cssBorderStyle = 'dashed';
          } else if (borderStyle === 'double') {
            cssBorderStyle = 'double';
          }
          
          const borderProp = `border${side.charAt(0).toUpperCase() + side.slice(1)}`;
          baseStyle[borderProp] = `${borderWidth} ${cssBorderStyle} ${borderColor}`;
        }
      });
    } else if (showGridLines && !style.fill?.color && !baseStyle.backgroundColor) {
      // Default borders - use hairline for Excel-like appearance only if:
      // 1. Gridlines are enabled
      // 2. Cell doesn't have a background fill (Excel hides gridlines on filled cells)
      // 3. Cell doesn't have any background color set
      baseStyle.borderRight = darkMode && !isPrintMode ? '1px solid #4b5563' : '1px solid #d1d5db';
      baseStyle.borderBottom = darkMode && !isPrintMode ? '1px solid #4b5563' : '1px solid #d1d5db';
      // Ensure borders are contained within the cell
      baseStyle.borderLeft = '0';
      baseStyle.borderTop = '0';
    } else {
      // No gridlines - remove all default borders
      baseStyle.borderRight = 'none';
      baseStyle.borderBottom = 'none';
      baseStyle.borderLeft = 'none';
      baseStyle.borderTop = 'none';
    }

    // Apply selection style
    if (isSelected) {
      baseStyle.outline = darkMode ? '2px solid #14b8a6' : '2px solid #0d9488';
      baseStyle.outlineOffset = '-1px';
      baseStyle.zIndex = 2;
    }

    // Apply highlight style for search results
    if (isHighlighted && !isSelected) {
      baseStyle.backgroundColor = darkMode ? '#fef08a33' : '#fef08a';
      baseStyle.zIndex = 1;
    }

    // Print mode overrides
    if (isPrintMode) {
      baseStyle.border = '1px solid #d1d5db';
      baseStyle.color = '#000000';
      delete baseStyle.transition;
      delete baseStyle.cursor;
    }
    
    // Apply accounting underline if needed (after borders to ensure it's visible)
    if (baseStyle._needsAccountingUnderline && !style.border?.bottom) {
      // For accounting underline, use border-bottom to span full cell width
      const underlineType = baseStyle._underlineType;
      const underlineColor = style.font?.color ? convertARGBToHex(style.font.color) : (darkMode ? '#e5e7eb' : '#000000');
      
      if (underlineType === 'double' || underlineType === 'doubleAccounting') {
        // Double underline - use a thicker border or double border
        baseStyle.borderBottom = `3px double ${underlineColor}`;
      } else {
        // Single underline - use a thin border
        baseStyle.borderBottom = `1px solid ${underlineColor}`;
      }
      
      // Add some padding to separate the underline from the text (accounting style)
      baseStyle.paddingBottom = '4px';
      
      // Debug accounting underline final application
      // if (columnName === 'H' || columnName === 'I') {
      //   console.log(`[Accounting Underline Applied] Column ${columnName}${row}:`, {
      //     borderBottom: baseStyle.borderBottom,
      //     paddingBottom: baseStyle.paddingBottom,
      //     underlineType: underlineType,
      //     underlineColor: underlineColor
      //   });
      // }
      
      // Clean up temporary properties
      delete baseStyle._needsAccountingUnderline;
      delete baseStyle._underlineType;
    } else if (baseStyle._needsAccountingUnderline && style.border?.bottom) {
      // Debug why accounting underline was skipped
      // if (columnName === 'H' || columnName === 'I') {
      //   console.log(`[Accounting Underline Skipped] Column ${columnName}${row} already has bottom border:`, style.border.bottom);
      // }
      // Clean up temporary properties if they exist
      delete baseStyle._needsAccountingUnderline;
      delete baseStyle._underlineType;
    } else {
      // Clean up temporary properties if they exist
      delete baseStyle._needsAccountingUnderline;
      delete baseStyle._underlineType;
    }

    return baseStyle;
  }, [style, isSelected, isHighlighted, width, height, darkMode, isPrintMode, showGridLines, row, columnName, isSpilloverCell, zoom]);

  // Format the display value
  const displayValue = useMemo(() => {
    // Handle spillover cells - they should show empty content since the visual text will be rendered by CSS
    if (isSpilloverCell) {
      return '';
    }
    
    // Handle spillover source cells - don't show content as it will be rendered by the spillover overlay
    if (isSpilloverSource) {
      return '';
    }
    
    if (value === null || value === undefined) return '';
    
    // Debug D26 at the start
    // if (columnName === 'D' && row === 26) {
    //   console.log('[D26 Initial] Cell D26 data:', 
    //     'value=', value,
    //     'type=', typeof value,
    //     'format=', style.numberFormat
    //   );
    // }
    
    // Apply number formatting if specified
    
    if (style.numberFormat && typeof value === 'number') {
      // console.log('[ExcelCell] About to call formatNumber:', { value, format: style.numberFormat, cell: `${columnName}${row}` });
      const formatted = formatNumber(value, style.numberFormat);
      // console.log('[ExcelCell] formatNumber returned:', { formatted, cell: `${columnName}${row}` });
      
      // if (columnName === 'D' && row === 26) {
      //   console.log(`[D26 Debug] Cell ${columnName}${row}:`, 
      //     'value=', value,
      //     'format=', style.numberFormat,
      //     'result=', formatted,
      //     'typeOfValue=', typeof value
      //   );
      // }
      return formatted;
    }
    
    // Check if value is an object before converting to string
    if (typeof value === 'object' && value !== null) {
      // Handle Date objects first
      if (value instanceof Date || Object.prototype.toString.call(value) === '[object Date]') {
        // If we have a number format, use it to format the date
        if (style.numberFormat) {
          return formatDate(value, style.numberFormat);
        }
        // Otherwise use default date format
        return value.toLocaleDateString();
      }
      
      const stringified = String(value);
      
      // Special detection for [object Object]
      if (stringified === '[object Object]') {
        console.error('[FOUND IT!] Cell showing [object Object] at', `${columnName}${row}:`, {
          value,
          valueType: typeof value,
          valueConstructor: value?.constructor?.name,
          valueKeys: Object.keys(value || {}),
          stringified: stringified,
          hasToString: typeof value?.toString === 'function',
          toStringIsDefault: value?.toString === Object.prototype.toString
        });
        
        // Try to log each property
        for (const key in value) {
          console.log(`  Property "${key}":`, value[key], `(type: ${typeof value[key]})`);
        }
      }
      
      // console.warn('[ExcelCell] Object value detected at cell', `${columnName}${row}:`, {
      //   value,
      //   valueType: typeof value,
      //   valueKeys: Object.keys(value),
      //   stringified: stringified,
      //   formula: value.formula,
      //   result: value.result,
      //   error: value.error,
      //   text: value.text,
      //   richText: value.richText
      // });
      
      // Try to extract meaningful value from common object patterns
      if (value.result !== undefined) return String(value.result);
      if (value.text !== undefined) return String(value.text);
      if (value.value !== undefined) return String(value.value);
      if (value.richText && Array.isArray(value.richText)) {
        return value.richText.map(rt => rt.text || '').join('');
      }
      if (value.hyperlink) {
        return value.text || value.hyperlink;
      }
      if (value.error) {
        return `#${value.error}`;
      }
      // Note: Removed formula check here - formulas are handled in the worker
      // and passed via style.formula, not in the value object
      
      // Check for toString method
      if (typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
        return value.toString();
      }
      
      // Last resort - return empty string for formula objects with no clear value
      if (value.formula && !value.result) {
        return '';
      }
      
      // For any other unhandled object, return empty string
      console.error('[ExcelCell] Unhandled object, returning empty string:', value);
      return '';
    }
    
    const result = String(value);
    
    // Debug logging for dash display
    // if (result === '-') {
    //   console.log(`[ExcelCell] Dash value at ${columnName}${row}:`, {
    //     originalValue: value,
    //     displayValue: result,
    //     numberFormat: style.numberFormat
    //   });
    // }
    
    return result;
  }, [value, style.numberFormat, row, columnName, isSpilloverCell, isSpilloverSource]);

  // Get cell classes based on state
  const cellClasses = useMemo(() => {
    const classes = [styles['excel-cell'], 'excel-cell'];
    
    if (darkMode && !isPrintMode) {
      classes.push(cellTheme.cell);
      if (isSelected) classes.push(cellTheme.cellSelected);
      if (isHighlighted) classes.push(cellTheme.cellHighlight);
      if (cellType === 'formula') classes.push(cellTheme.cellFormula);
      if (cellType === 'error') classes.push(cellTheme.cellError);
      if (cellType === 'readonly') classes.push(cellTheme.cellReadonly);
      if (!isSelected && !isHighlighted) classes.push(cellTheme.cellHover);
    }
    
    if (isPrintMode) {
      classes.push('print:text-black print:bg-white');
    }
    
    return classes.join(' ');
  }, [darkMode, isPrintMode, cellTheme, isSelected, isHighlighted, cellType]);

  return (
    <div
      className={cellClasses}
      style={cellStyle}
      onClick={() => onClick?.(row, col, value)}
      data-row={row}
      data-col={col}
      data-selected={isSelected}
      data-highlighted={isHighlighted}
      data-type={typeof value === 'number' ? 'number' : 'text'}
      data-align={computedAlignment || 'left'}
      data-wrap={style.alignment?.wrapText || false}
      title={displayValue}
      role="gridcell"
      aria-label={`Cell ${columnName}${row}, ${cellType === 'formula' ? 'formula' : 'value'}: ${displayValue || 'empty'}`}
      aria-selected={isSelected}
      aria-readonly={cellType === 'readonly'}
      tabIndex={isSelected ? 0 : -1}
    >
      
      {/* Error indicator */}
      {cellType === 'error' && !isPrintMode && (
        <span className={`${styles.indicator} indicator absolute top-0 right-0 text-xs ${
          darkMode ? 'text-red-400' : 'text-red-600'
        }`} aria-hidden="true">
          ⚠
        </span>
      )}
      
      <span className={isMerged ? 'flex items-center justify-center h-full' : ''}>
        {height > 5 ? displayValue : ''}
      </span>
    </div>
  );
});

ExcelCell.displayName = 'ExcelCell';

// Helper functions
function convertARGBToHex(argb) {
  if (!argb) return null;
  
  // Debug logging for color conversion
  // const debugColors = false; // Set to true to enable color debugging
  
  // Handle ARGB object format from ExcelJS
  if (typeof argb === 'object' && argb.argb) {
    // if (debugColors) console.log('[Color Debug] ARGB object:', argb);
    argb = argb.argb;
  }
  
  // Handle theme colors
  if (typeof argb === 'object' && argb.theme !== undefined) {
    // Map Excel theme colors - comprehensive mapping
    // Note: Excel uses 0-based indexing for themes internally, but the xlThemeColor constants are 1-based
    const themeColors = {
      0: '#FFFFFF', // Background 1 (Light 1) - xlThemeColorLight1 = 2
      1: '#000000', // Text 1 (Dark 1) - xlThemeColorDark1 = 1
      2: '#E7E6E6', // Background 2 (Light 2) - xlThemeColorLight2 = 4
      3: '#44546A', // Text 2 (Dark 2) - xlThemeColorDark2 = 3
      4: '#4472C4', // Accent 1 - xlThemeColorAccent1 = 5
      5: '#ED7D31', // Accent 2 - xlThemeColorAccent2 = 6
      6: '#A5A5A5', // Accent 3 - xlThemeColorAccent3 = 7
      7: '#FFC000', // Accent 4 - xlThemeColorAccent4 = 8
      8: '#5B9BD5', // Accent 5 - xlThemeColorAccent5 = 9
      9: '#70AD47', // Accent 6 - xlThemeColorAccent6 = 10
      10: '#0563C1', // Hyperlink - xlThemeColorHyperlink = 11 (standard blue hyperlink)
      11: '#954F72'  // Followed Hyperlink - xlThemeColorFollowedHyperlink = 12 (purple)
    };
    
    // Handle theme color with tint
    let baseColor = themeColors[argb.theme] || '#000000';
    
    // Apply tint if present (lightens the color)
    if (argb.tint !== undefined && argb.tint !== 0) {
      baseColor = applyTint(baseColor, argb.tint);
    }
    
    // if (debugColors) console.log('[Color Debug] Theme color:', argb.theme, 'tint:', argb.tint, '->', baseColor);
    return baseColor;
  }
  
  // Convert ARGB string to hex
  if (typeof argb === 'string') {
    // Remove any non-hex characters
    const cleanHex = argb.replace(/[^0-9A-Fa-f]/g, '');
    
    // Handle different formats
    if (cleanHex.length === 8) {
      // ARGB format - remove alpha channel
      const result = '#' + cleanHex.slice(2);
      // if (debugColors) console.log('[Color Debug] ARGB string:', argb, '->', result);
      return result;
    } else if (cleanHex.length === 6) {
      // Already RGB
      const result = '#' + cleanHex;
      // if (debugColors) console.log('[Color Debug] RGB string:', argb, '->', result);
      return result;
    } else if (cleanHex.length === 3) {
      // Short RGB format
      const result = '#' + cleanHex;
      // if (debugColors) console.log('[Color Debug] Short RGB:', argb, '->', result);
      return result;
    }
  }
  
  // if (debugColors) console.log('[Color Debug] Unhandled color format:', argb);
  return null;
}

// Helper to apply tint to a color (Excel theme colors with tint)
function applyTint(hexColor, tint) {
  if (!hexColor || !hexColor.startsWith('#')) return hexColor;
  
  const hex = hexColor.slice(1);
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Positive tint lightens the color (blend with white)
  // Negative tint darkens the color (blend with black)
  let newR, newG, newB;
  
  if (tint > 0) {
    // Lighten - blend with white
    newR = Math.round(r + (255 - r) * tint);
    newG = Math.round(g + (255 - g) * tint);
    newB = Math.round(b + (255 - b) * tint);
  } else {
    // Darken - blend with black
    const factor = 1 + tint; // tint is negative, so this reduces the color
    newR = Math.round(r * factor);
    newG = Math.round(g * factor);
    newB = Math.round(b * factor);
  }
  
  // Convert back to hex
  const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return '#' + toHex(newR) + toHex(newG) + toHex(newB);
}

// Helper to check if a color is too light for dark mode
function isLightColor(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return false;
  
  const hex = hexColor.slice(1);
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.8;
}

function getBorderWidth(style) {
  switch (style) {
    case 'thin': return '1px';
    case 'medium': return '2px';
    case 'thick': return '3px';
    case 'hair': return '0.5px';
    default: return '1px';
  }
}

function formatNumber(value, format) {
  // Debug entry - log ALL calls to this function
  // console.log('[formatNumber] Called with:', { value, format, valueType: typeof value });
  
  // Handle simple custom formats with quoted text
  // Examples: "Month" 0, "Year" 0, "Quarter" 0, 0 "acres", etc.
  const prefixCustomMatch = format.match(/^"([^"]+)"\s*0+$/);
  if (prefixCustomMatch) {
    const customText = prefixCustomMatch[1];
    return customText + ' ' + value;
  }
  
  // Handle custom formats where text comes after the number
  // Examples: 0 "acres", 0.00 "kg", etc.
  const suffixCustomMatch = format.match(/^0+(?:\.0+)?\s*"([^"]+)"$/);
  if (suffixCustomMatch) {
    const customText = suffixCustomMatch[1];
    const decimalMatch = format.match(/0\.(0+)/);
    const decimals = decimalMatch ? decimalMatch[1].length : 0;
    const formattedValue = value.toFixed(decimals);
    return formattedValue + ' ' + customText;
  }
  
  // Handle Excel number format codes
  if (!format) {
    // console.log('[formatNumber] No format provided, returning value as-is');
    return value;
  }
  
  // Handle dates - enhanced detection - skip if custom format with quotes
  // Only treat as date if it has date-specific patterns like mm, dd, yyyy, etc.
  const datePatterns = /(?:d{1,4}|m{1,4}|y{1,4}|h{1,2}|s{1,2})/i;
  const hasDatePattern = datePatterns.test(format);
  const hasQuotes = format.includes('"');
  const hasNumberPattern = /[#0]/.test(format);
  
  
  if (value instanceof Date || 
      (typeof value === 'number' && hasDatePattern && !hasNumberPattern && !hasQuotes)) {
    return formatDate(value, format);
  }
  
  if (typeof value !== 'number') {
    // if (format === '"Month" 0') {
    //   console.log('[formatNumber] Exiting - value not a number');
    // }
    return value;
  }
  
  // Parse custom text in quotes
  const extractCustomText = (fmt) => {
    const textParts = [];
    const regex = /"([^"]*)"/g;
    let match;
    while ((match = regex.exec(fmt)) !== null) {
      textParts.push(match[1]);
    }
    return textParts;
  };

  // Accounting format detection - more comprehensive
  if (format.includes('_(') || format.includes('_)') || format.includes('* ')) {
    if (value === 0 && format.includes('"-"')) return '-';
    if (value === 0 && format.includes('"–"')) return '–';
    
    // Extract decimal places from format
    const decimalMatch = format.match(/0\.(0+)/);
    const decimals = decimalMatch ? decimalMatch[1].length : 0;
    
    const formatted = Math.abs(value).toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
    
    // Check if format includes currency symbol
    const hasDollar = format.includes('$');
    const prefix = hasDollar ? '$' : '';
    
    if (value < 0) {
      return `(${prefix}${formatted})`;
    }
    return prefix + formatted;
  }
  
  // Currency formats
  if (format.includes('$')) {
    const isNegativeInParens = format.includes('($');
    const decimals = (format.match(/0+\.?(0*)/)?.[0]?.split('.')[1]?.length) || 2;
    const formatted = Math.abs(value).toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
    if (value < 0 && isNegativeInParens) {
      return `($${formatted})`;
    }
    return (value < 0 ? '-' : '') + '$' + formatted;
  }
  
  // Percentage formats
  if (format.includes('%')) {
    const decimals = (format.match(/0+\.?(0*)/)?.[0]?.split('.')[1]?.length) || 0;
    return (value * 100).toFixed(decimals) + '%';
  }
  
  // Number with specific decimal places
  const decimalMatch = format.match(/0+\.?(0*)/);
  if (decimalMatch) {
    const decimals = decimalMatch[0].split('.')[1]?.length || 0;
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }
  
  // Second date check - remove this as we already have better date detection above
  // This was causing issues with formats like "bps" that contain 's'
  
  // Custom formats with text
  if (format.includes('"')) {
    // Parse the format string to extract text and number patterns
    const parts = [];
    let currentPos = 0;
    let inQuotes = false;
    let currentPart = '';
    
    for (let i = 0; i < format.length; i++) {
      const char = format[i];
      
      if (char === '"') {
        if (currentPart) {
          parts.push({ type: inQuotes ? 'text' : 'format', value: currentPart });
          currentPart = '';
        }
        inQuotes = !inQuotes;
      } else {
        currentPart += char;
      }
    }
    
    // Add any remaining part
    if (currentPart) {
      parts.push({ type: inQuotes ? 'text' : 'format', value: currentPart });
    }
    
    // Process each part
    let result = '';
    for (const part of parts) {
      if (part.type === 'text') {
        // Add text without quotes
        result += part.value;
      } else if (part.type === 'format') {
        // Format the number based on the format pattern
        const formatPattern = part.value.trim();
        
        if (formatPattern.includes('#') || formatPattern.includes('0')) {
          // Extract decimal places
          const decimalMatch = formatPattern.match(/0\.(0+)/);
          const decimals = decimalMatch ? decimalMatch[1].length : 0;
          
          // Check for thousands separator
          const hasThousands = formatPattern.includes(',');
          
          const formattedNumber = value.toLocaleString('en-US', {
            useGrouping: hasThousands,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          });
          
          result += formattedNumber;
        } else if (formatPattern) {
          // Non-numeric format part, keep as is
          result += formatPattern;
        }
      }
    }
    
    return result.trim();
  }
  
  // Default number formatting
  return value.toLocaleString();
}

function formatDate(value, format) {
  
  // Convert Excel date serial to JS Date
  let date;
  if (typeof value === 'number') {
    // Excel date system: dates are stored as numbers of days since Jan 1, 1900
    // But Excel incorrectly considers 1900 a leap year, so we need to adjust
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const msPerDay = 24 * 60 * 60 * 1000;
    date = new Date(excelEpoch.getTime() + value * msPerDay);
  } else if (value instanceof Date) {
    date = value;
  } else {
    return value;
  }
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Common Excel date format patterns
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  const yy = y.toString().substr(-2);
  
  // Build result by parsing the format string
  let result = '';
  let i = 0;
  
  while (i < format.length) {
    // Check for year patterns
    if (format.substring(i, i + 4).toLowerCase() === 'yyyy') {
      result += y.toString();
      i += 4;
    } else if (format.substring(i, i + 2).toLowerCase() === 'yy') {
      result += yy;
      i += 2;
    }
    // Check for month patterns
    else if (format.substring(i, i + 4).toLowerCase() === 'mmmm') {
      result += monthsFull[date.getMonth()];
      i += 4;
    } else if (format.substring(i, i + 3).toLowerCase() === 'mmm') {
      result += months[date.getMonth()];
      i += 3;
    } else if (format.substring(i, i + 2).toLowerCase() === 'mm') {
      result += m.toString().padStart(2, '0');
      i += 2;
    } else if (format[i].toLowerCase() === 'm' && 
               (i + 1 >= format.length || format[i + 1].toLowerCase() !== 'm')) {
      result += m.toString();
      i += 1;
    }
    // Check for day patterns
    else if (format.substring(i, i + 4).toLowerCase() === 'dddd') {
      result += date.toLocaleDateString('en-US', { weekday: 'long' });
      i += 4;
    } else if (format.substring(i, i + 3).toLowerCase() === 'ddd') {
      result += date.toLocaleDateString('en-US', { weekday: 'short' });
      i += 3;
    } else if (format.substring(i, i + 2).toLowerCase() === 'dd') {
      result += d.toString().padStart(2, '0');
      i += 2;
    } else if (format[i].toLowerCase() === 'd' && 
               (i + 1 >= format.length || format[i + 1].toLowerCase() !== 'd')) {
      result += d.toString();
      i += 1;
    }
    // Not a date pattern, copy the character as-is
    else {
      result += format[i];
      i += 1;
    }
  }
  
  
  // Common patterns like "d-mmm-yy" should now work correctly
  return result;
}

export default ExcelCell;