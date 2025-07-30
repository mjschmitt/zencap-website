import React, { memo, useMemo } from 'react';
import { useTheme } from './useTheme';

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
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      maxWidth: `${width}px`,
      maxHeight: `${height}px`,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      padding: '2px 4px',
      cursor: 'cell',
      userSelect: 'none',
      boxSizing: 'border-box',
      position: 'relative',
      transition: 'all 0.15s ease-in-out'
    };

    // Apply font styles
    if (style.font) {
      if (style.font.bold) baseStyle.fontWeight = 'bold';
      if (style.font.italic) baseStyle.fontStyle = 'italic';
      if (style.font.underline) baseStyle.textDecoration = 'underline';
      if (style.font.size) baseStyle.fontSize = `${style.font.size}px`;
      if (style.font.color && !darkMode) baseStyle.color = convertARGBToHex(style.font.color);
      if (style.font.name) baseStyle.fontFamily = style.font.name;
    }

    // Apply fill/background (only in light mode or print mode)
    if (style.fill?.color && (!darkMode || isPrintMode)) {
      baseStyle.backgroundColor = convertARGBToHex(style.fill.color);
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

    // Apply borders
    if (style.border) {
      const borderColor = darkMode && !isPrintMode ? '#4b5563' : null;
      if (style.border.top) {
        baseStyle.borderTop = `${getBorderWidth(style.border.top.style)} ${style.border.top.style} ${borderColor || convertARGBToHex(style.border.top.color) || '#000'}`;
      }
      if (style.border.bottom) {
        baseStyle.borderBottom = `${getBorderWidth(style.border.bottom.style)} ${style.border.bottom.style} ${borderColor || convertARGBToHex(style.border.bottom.color) || '#000'}`;
      }
      if (style.border.left) {
        baseStyle.borderLeft = `${getBorderWidth(style.border.left.style)} ${style.border.left.style} ${borderColor || convertARGBToHex(style.border.left.color) || '#000'}`;
      }
      if (style.border.right) {
        baseStyle.borderRight = `${getBorderWidth(style.border.right.style)} ${style.border.right.style} ${borderColor || convertARGBToHex(style.border.right.color) || '#000'}`;
      }
    } else {
      // Default borders
      baseStyle.borderRight = darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #e0e0e0';
      baseStyle.borderBottom = darkMode && !isPrintMode ? '1px solid #374151' : '1px solid #e0e0e0';
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
    
    return String(value);
  }, [value, style.numberFormat]);

  // Get cell classes based on state
  const cellClasses = useMemo(() => {
    const classes = ['excel-cell'];
    
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
      title={displayValue}
      role="gridcell"
      aria-label={`Cell ${columnName}${row}, ${cellType === 'formula' ? 'formula' : 'value'}: ${displayValue || 'empty'}`}
      aria-selected={isSelected}
      aria-readonly={cellType === 'readonly'}
      tabIndex={isSelected ? 0 : -1}
    >
      {/* Formula indicator */}
      {cellType === 'formula' && !isPrintMode && (
        <span className={`absolute top-0 left-0 text-xs ${
          darkMode ? 'text-teal-400' : 'text-teal-600'
        }`} aria-hidden="true">
          ƒ
        </span>
      )}
      
      {/* Error indicator */}
      {cellType === 'error' && !isPrintMode && (
        <span className={`absolute top-0 right-0 text-xs ${
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
  // Remove 'FF' alpha channel if present and add #
  return '#' + (argb.length === 8 ? argb.slice(2) : argb);
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
  // Basic number formatting - extend as needed
  if (format.includes('0.00')) {
    return value.toFixed(2);
  }
  if (format.includes('$')) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (format.includes('%')) {
    return (value * 100).toFixed(2) + '%';
  }
  return value.toLocaleString();
}

export default ExcelCell;