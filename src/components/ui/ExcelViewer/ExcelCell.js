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
  isMerged = false
}) => {
  const { cellTheme } = useTheme(darkMode);
  // Determine cell type
  const cellType = useMemo(() => {
    if (style.formula) return 'formula';
    if (style.error) return 'error';
    if (style.readonly) return 'readonly';
    return 'normal';
  }, [style]);

  // Memoize cell styles to prevent re-renders
  const cellStyle = useMemo(() => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      padding: '3px 6px', // More generous padding like Excel
      cursor: 'cell',
      userSelect: 'none',
      boxSizing: 'border-box',
      position: 'relative',
      transition: 'all 0.15s ease-in-out'
    };

    // Apply font styles with proper precedence
    if (style.font) {
      // Force font weight to ensure it's applied
      baseStyle.fontWeight = style.font.bold === true ? '700' : '400';
      if (style.font.italic) baseStyle.fontStyle = 'italic';
      if (style.font.underline) baseStyle.textDecoration = 'underline';
      // Convert Excel points to pixels (1pt = 1.333px)
      if (style.font.size) {
        const pixels = Math.round(style.font.size * 1.333);
        baseStyle.fontSize = `${pixels}px`;
      } else {
        // Default Excel font size is 11pt = ~15px
        baseStyle.fontSize = '15px';
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
      baseStyle.fontSize = '15px'; // 11pt
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
      baseStyle.textAlign = style.alignment.horizontal || 'left';
      baseStyle.verticalAlign = style.alignment.vertical || 'middle';
      if (style.alignment.wrapText) {
        baseStyle.whiteSpace = 'pre-wrap';
        baseStyle.wordWrap = 'break-word';
      }
      if (style.alignment.indent) {
        baseStyle.paddingLeft = `${4 + style.alignment.indent * 8}px`;
      }
    }

    // Apply borders with proper styling
    if (style.border && Object.keys(style.border).length > 0) {
      // Apply custom borders from Excel
      ['top', 'bottom', 'left', 'right'].forEach(side => {
        if (style.border[side]) {
          const borderStyle = style.border[side].style || 'solid';
          const borderWidth = getBorderWidth(borderStyle);
          const borderColor = convertARGBToHex(style.border[side].color) || '#000000';
          
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
    } else {
      // Default borders - use hairline for Excel-like appearance
      baseStyle.borderRight = darkMode && !isPrintMode ? '1px solid #4b5563' : '1px solid #d1d5db';
      baseStyle.borderBottom = darkMode && !isPrintMode ? '1px solid #4b5563' : '1px solid #d1d5db';
      // Ensure borders are contained within the cell
      baseStyle.borderLeft = '0';
      baseStyle.borderTop = '0';
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

    return baseStyle;
  }, [style, isSelected, isHighlighted, width, height, darkMode, isPrintMode]);

  // Format the display value
  const displayValue = useMemo(() => {
    if (value === null || value === undefined) return '';
    
    // Apply number formatting if specified
    if (style.numberFormat && typeof value === 'number') {
      return formatNumber(value, style.numberFormat);
    }
    
    // Check if value is an object before converting to string
    if (typeof value === 'object') {
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
      
      console.warn('[ExcelCell] Object value detected at cell', `${columnName}${row}:`, {
        value,
        valueType: typeof value,
        valueKeys: Object.keys(value),
        stringified: stringified
      });
      
      // Try to extract meaningful value from common object patterns
      if (value.result !== undefined) return String(value.result);
      if (value.text !== undefined) return String(value.text);
      if (value.value !== undefined) return String(value.value);
      if (value.richText && Array.isArray(value.richText)) {
        return value.richText.map(rt => rt.text || '').join('');
      }
      if (value.formula) {
        return value.result !== undefined ? String(value.result) : `=${value.formula}`;
      }
      if (value.hyperlink) {
        return value.text || value.hyperlink;
      }
      if (value.error) {
        return `#${value.error}`;
      }
      
      // If it's a Date object
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      
      // Try JSON.stringify for debugging
      try {
        const jsonStr = JSON.stringify(value);
        console.error('[ExcelCell] Unhandled object structure:', jsonStr);
        return jsonStr.length > 50 ? jsonStr.substring(0, 47) + '...' : jsonStr;
      } catch (e) {
        return '[Complex Object]';
      }
    }
    
    return String(value);
  }, [value, style.numberFormat, row, columnName]);

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
      data-align={style.alignment?.horizontal || 'left'}
      data-wrap={style.alignment?.wrapText || false}
      title={displayValue}
      role="gridcell"
      aria-label={`Cell ${columnName}${row}, ${cellType === 'formula' ? 'formula' : 'value'}: ${displayValue || 'empty'}`}
      aria-selected={isSelected}
      aria-readonly={cellType === 'readonly'}
      tabIndex={isSelected ? 0 : -1}
    >
      {/* Formula indicator - only show if cell has visible content */}
      {cellType === 'formula' && !isPrintMode && displayValue && displayValue.trim() !== '' && (
        <span className={`${styles.indicator} indicator absolute top-0 left-0 text-xs ${
          darkMode ? 'text-teal-400' : 'text-teal-600'
        }`} aria-hidden="true">
          ƒ
        </span>
      )}
      
      {/* Error indicator */}
      {cellType === 'error' && !isPrintMode && (
        <span className={`${styles.indicator} indicator absolute top-0 right-0 text-xs ${
          darkMode ? 'text-red-400' : 'text-red-600'
        }`} aria-hidden="true">
          ⚠
        </span>
      )}
      
      <span className={isMerged ? 'flex items-center justify-center h-full' : ''}>
        {displayValue}
      </span>
    </div>
  );
});

ExcelCell.displayName = 'ExcelCell';

// Helper functions
function convertARGBToHex(argb) {
  if (!argb) return null;
  
  // Debug logging for color conversion
  const debugColors = false; // Set to true to enable color debugging
  
  // Handle ARGB object format from ExcelJS
  if (typeof argb === 'object' && argb.argb) {
    if (debugColors) console.log('[Color Debug] ARGB object:', argb);
    argb = argb.argb;
  }
  
  // Handle theme colors
  if (typeof argb === 'object' && argb.theme !== undefined) {
    // Map Excel theme colors - extended mapping
    const themeColors = {
      0: '#FFFFFF', // Background 1 (Light 1)
      1: '#000000', // Text 1 (Dark 1)
      2: '#E7E6E6', // Background 2 (Light 2)
      3: '#44546A', // Text 2 (Dark 2)
      4: '#4472C4', // Accent 1
      5: '#ED7D31', // Accent 2
      6: '#A5A5A5', // Accent 3
      7: '#FFC000', // Accent 4
      8: '#5B9BD5', // Accent 5
      9: '#70AD47'  // Accent 6
    };
    
    // Handle theme color with tint
    let baseColor = themeColors[argb.theme] || '#000000';
    
    // Apply tint if present (lightens the color)
    if (argb.tint !== undefined && argb.tint !== 0) {
      baseColor = applyTint(baseColor, argb.tint);
    }
    
    if (debugColors) console.log('[Color Debug] Theme color:', argb.theme, 'tint:', argb.tint, '->', baseColor);
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
      if (debugColors) console.log('[Color Debug] ARGB string:', argb, '->', result);
      return result;
    } else if (cleanHex.length === 6) {
      // Already RGB
      const result = '#' + cleanHex;
      if (debugColors) console.log('[Color Debug] RGB string:', argb, '->', result);
      return result;
    } else if (cleanHex.length === 3) {
      // Short RGB format
      const result = '#' + cleanHex;
      if (debugColors) console.log('[Color Debug] Short RGB:', argb, '->', result);
      return result;
    }
  }
  
  if (debugColors) console.log('[Color Debug] Unhandled color format:', argb);
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
  // Handle Excel number format codes
  if (!format || typeof value !== 'number') return value;
  
  // Accounting format detection
  if (format.includes('_(') || format.includes('_)') || format.includes('* ')) {
    if (value === 0) return '-';
    const formatted = Math.abs(value).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    return value < 0 ? `($${formatted})` : `$${formatted}`;
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
  
  // Date formats (Excel stores dates as numbers)
  if (format.toLowerCase().includes('m') || format.toLowerCase().includes('d') || format.toLowerCase().includes('y')) {
    // Excel date serial number to JS Date
    const excelEpoch = new Date(1900, 0, 1);
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + (value - 2) * msPerDay);
    
    // Simple date formatting
    if (format.toLowerCase().includes('mm/dd/yyyy')) {
      return date.toLocaleDateString('en-US');
    }
    return date.toLocaleDateString();
  }
  
  // Default number formatting
  return value.toLocaleString();
}

export default ExcelCell;