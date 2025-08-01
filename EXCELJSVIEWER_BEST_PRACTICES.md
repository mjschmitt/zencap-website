# ExcelJS Viewer Best Practices & Implementation Guide

## Overview
This document contains comprehensive research, fixes, and best practices discovered while implementing the ExcelJS viewer component to accurately replicate Microsoft Excel's appearance in a web environment.

## Core Principles
1. **Excel Fidelity First**: Always prioritize matching Excel's exact appearance
2. **Explicit Over Implicit**: Explicitly set default values to prevent inheritance issues
3. **Isolate Features**: Complex features like spillover should be isolated from core formatting

## Font Formatting Best Practices

### Font Size Conversion
- **Issue**: Excel uses points (pt), web typically uses pixels (px)
- **Solution**: Convert points to pixels using ratio 1pt = 1.333px
```javascript
// Convert Excel font size (in points) to pixels
if (font.size) {
  const pixels = Math.round(font.size * 1.333);
  style.fontSize = `${pixels}px`;
}
```

### Font Weight (Bold) Handling
- **Issue**: Bold formatting bleeding to unintended cells
- **Root Cause**: CSS inheritance and implicit bold application
- **Solution**: Explicitly set font weight for every cell
```javascript
// Only apply bold if explicitly set in Excel
if (font.bold === true) {
  style.fontWeight = 'bold';
} else {
  // Explicitly set normal to prevent inheritance
  style.fontWeight = 'normal';
}
```

### Default Font Size
- **Issue**: Hardcoded defaults overriding Excel formatting
- **Solution**: Check if cell has explicit font size before applying defaults
```javascript
fontSize: cellStyle.fontSize || '11px', // Only use default if not set
```

## Text Spillover Implementation

### Current Issues with Spillover
1. **Too Aggressive**: Triggers for short text (6 characters)
2. **Style Contamination**: Spillover logic affecting cell formatting
3. **Complex Registry System**: Global registry causing timing issues

### Recommended Approach
- **Temporarily Disable**: When debugging formatting issues, disable spillover
- **Conservative Thresholds**: Minimum 15 characters AND width overflow
- **Isolated Rendering**: Spillover should not affect base cell styles

## Style Extraction Architecture

### ExcelJS Cell Structure
```javascript
cell = {
  value: actual_value,        // The raw value
  text: display_text,         // Formatted display text
  style: {
    font: {
      bold: boolean,
      size: number,           // In points
      name: string,          // Font family
      color: { argb: string }
    },
    numFmt: string,          // Number format
    alignment: {},
    fill: {},
    border: {}
  }
}
```

### Style Processing Pipeline
1. **Extract from ExcelJS**: `extractExcelJSStyles()`
2. **Process Cell**: `processCellWithStyles()`
3. **Apply to DOM**: Direct style application

## Common Pitfalls & Solutions

### 1. Style Inheritance
**Problem**: Parent styles bleeding into cells
**Solution**: Reset all style properties explicitly

### 2. Default Overrides
**Problem**: Component defaults overriding Excel values
**Solution**: Always check if Excel provides value first

### 3. Format String Parsing
**Problem**: Complex Excel format strings (accounting, custom)
**Solution**: Comprehensive format parser with fallbacks

### 4. Performance with Large Sheets
**Problem**: Re-rendering on every state change
**Solution**: Memoization and virtualization

## Debugging Techniques

### 1. Cell-Specific Logging
```javascript
if (cellRef === 'K26' || cellRef === 'K41') {
  console.log(`Cell ${cellRef}:`, {
    excelFont: cell.style?.font,
    extractedStyle: style,
    finalStyle: cellStyle
  });
}
```

### 2. Style Comparison
- Compare Excel's XML directly with extracted styles
- Use Excel's developer tools to inspect actual values

### 3. Isolation Testing
- Disable complex features (spillover, merge) to isolate issues
- Test with minimal sheets first

## Implementation Innovations

### 1. Frozen Panes Optimization
- Separate rendering for frozen/scrollable areas
- Synchronized scrolling with transform3d

### 2. Accounting Format Detection
```javascript
const isAccountingFormat = numFmt && (
  numFmt.includes('_(') || 
  numFmt.includes('_)') || 
  numFmt.includes('_-')
);
```

### 3. Date Serial Detection
- Multiple detection methods for reliability
- Handles both 1900 and 1904 date systems

## Future Improvements

### 1. Spillover Redesign
- Move to CSS-only solution using `overflow: visible`
- Eliminate global registry system
- Use CSS Grid for better control

### 2. Performance Optimization
- Virtual scrolling for large sheets
- Web Workers for format processing
- Incremental rendering

### 3. Format String Parser
- Complete Excel format string specification
- Handle all edge cases (colors, conditions)
- Locale-aware formatting

## Testing Checklist

- [ ] Font sizes match Excel exactly
- [ ] Bold/italic formatting correct
- [ ] Number formats display properly
- [ ] Accounting formats show dashes
- [ ] Dates display correctly
- [ ] Merged cells render properly
- [ ] Frozen panes scroll correctly
- [ ] Large sheets perform well

## Date Formatting Best Practices

### Common Issues
1. **GMT Timestamps**: ExcelJS sometimes returns dates as GMT strings in `cell.text`
2. **ISO Strings**: Dates may come as ISO format strings
3. **Serial Numbers**: Excel stores dates as serial numbers

### Solution Strategy
```javascript
// Priority order for date formatting:
1. Use Excel's formatted text UNLESS it's a raw timestamp
2. Use Excel's number format if available
3. Apply custom date formatting based on Excel's format string
4. Fall back to mm/dd/yyyy only as last resort
```

### Key Checks
- Detect raw timestamps: `cell.text.includes('GMT')` or `cell.text.match(/^\d{4}-\d{2}-\d{2}T/)`
- Always use `formatDateWithExcelFormat()` when format string is available
- Preserve Excel's intended display format

## Text Overflow & Wrapping

### Excel Behavior Rules
1. **Wrap Text Enabled**: Text wraps within cell boundaries
2. **Left-aligned Text**: Overflows into adjacent empty cells
3. **Center/Right-aligned Text**: Clips at cell boundary
4. **Numbers**: Always clip at cell boundary

### Implementation
```javascript
overflow: cellStyle.whiteSpace === 'pre-wrap' ? 'hidden' : 
         (typeof cellValue === 'string' && (!cellStyle.textAlign || cellStyle.textAlign === 'left')) ? 'visible' : 'hidden'
```

## Cell Indentation

### Excel's Indent Levels
- Excel stores indentation as `alignment.indent` property
- Each indent level typically represents ~10px of left padding
- Formula: `paddingLeft = (indent * 10) + 2px`

### Implementation
```javascript
if (alignment.indent) {
  style.paddingLeft = `${(alignment.indent * 10) + 2}px`;
}
```

## Underline vs Border Bottom

### Key Distinction
- **Font Underline**: Text decoration, sized to content
- **Border Bottom**: Full cell width line (used for section totals)

### Best Practice
```javascript
if (font.underline) {
  // Check if there's a bottom border instead
  if (!cell.style.border || !cell.style.border.bottom) {
    style.textDecoration = 'underline';
  }
  // Let border handle it for full-width effect
}
```

## Debugging Bold Issues

### Common Causes
1. Font.bold property not strictly checked
2. CSS inheritance from parent elements
3. Default styles overriding Excel values

### Debug Strategy
```javascript
if (cellRef && cellRef.startsWith('K')) {
  console.log(`Font: bold=${font.bold}, weight=${style.fontWeight}`);
}
```

## Color Extraction Issues

### Theme Color Tinting
Excel uses theme colors with tints to create variations. Common issues:
1. **White backgrounds getting tinted pink/red**: Theme 1 (Background 1) with small tints
2. **Incorrect color mapping**: Theme colors not matching Excel's scheme

### Solution
```javascript
// Don't tint white backgrounds for small tint values
if (theme === 1 && Math.abs(tint) < 0.1) {
  baseColor = '#FFFFFF';
} else {
  baseColor = applyTintToColor(baseColor, tint);
}
```

## Frozen Panes Row Height Synchronization

### Issue
Row heights in frozen panes not matching non-frozen sections, causing misalignment. Small/hidden rows (< 10px) were expanding to default heights in frozen sections.

### Root Causes
1. CSS Grid layout forcing minimum heights on grid items
2. Container elements not allowing shrinking to content size
3. Row height indexing issues between frozen and non-frozen sections

### Solutions
1. **Grid Layout Fix**: Use `gridTemplateRows: 'auto 1fr'` instead of `grid-rows-[auto_1fr]`
2. **Container Styling**: Add `minHeight: 'auto'` to frozen pane containers
3. **Alignment**: Set `alignItems: 'start'` on grid container
4. **Row Precision**: Round small row heights to 1 decimal place for consistency
5. **Flex Prevention**: Add `flexShrink: 0` to prevent row compression

### Key Principles
- Always use exact Excel row heights without minimums
- Ensure CSS doesn't force expansion of small rows
- Use consistent row height indexing across all sections
- Debug with specific row height logging for frozen vs non-frozen

## Hidden Rows Handling

### Issue
Rows that should be hidden (like row 138) still showing with default height instead of being collapsed.

### Detection Methods
1. **Explicit Hidden Flag**: Check `row.hidden === true`
2. **Very Small Heights**: Heights < 1px should be treated as hidden
3. **Zero Heights**: Any calculated height of 0 should hide the row

### Implementation
```javascript
// Check if row is hidden
const isHidden = row.hidden === true;
if (isHidden) {
  rowHeight = 0;
}

// Also check for very small heights
if (rowHeight < 1) {
  rowHeight = 0;
}

// In rendering:
style={{
  height: isHiddenRow ? '0px' : `${rowHeight}px`,
  minHeight: '0px', // Allow collapse
  visibility: isHiddenRow ? 'hidden' : 'visible',
  overflow: 'hidden'
}}
```

### Key Points
- Don't use `display: none` as it affects row indexing
- Use `visibility: hidden` to hide content while maintaining layout
- Set `minHeight: 0px` to allow rows to fully collapse
- Add specific debug logging for problem rows (e.g., row 138)

## Column Width Accuracy

### Issue
Columns appearing to auto-size to content rather than using Excel's defined widths.

### Root Causes
1. Min/max width constraints forcing columns into a narrow range
2. Not explicitly setting width on table cells
3. Incorrect Excel unit to pixel conversion

### Solutions
1. **Remove constraints**: Don't apply min/max width limits
2. **Explicit cell widths**: Set width, minWidth, maxWidth on td elements
3. **Correct conversion**: Use factor of 7 pixels per Excel unit
4. **Handle defaults**: Use 8.43 * 7 = ~59px for default column width

### Implementation
```javascript
// Column width calculation
const calculatedWidth = col.width * 7;
const finalWidth = Math.round(calculatedWidth);

// On table cells
style={{
  width: `${sheet.columnWidths[colIndex] || 59}px`,
  minWidth: `${sheet.columnWidths[colIndex] || 59}px`,
  maxWidth: `${sheet.columnWidths[colIndex] || 59}px`
}}
```

## Text Alignment & Indentation Issues

### Problems
1. Numbers in column I showing left-aligned instead of right-aligned
2. Indentation not displaying in column B cells
3. Formula cells showing empty instead of results

### Root Causes
1. Checking formatted string type instead of original numeric value
2. Style properties being overridden during table rendering
3. Formula results not being extracted from cell.text

### Solutions
1. **Numeric Detection**: Add `_wasNumeric` flag during style extraction
2. **Preserve Indentation**: Don't override paddingLeft if it exists
3. **Formula Fallback**: Use cell.text when cell.value is empty for formulas

### Implementation
```javascript
// Preserve numeric status
if (isNumericCell(cell)) {
  style.textAlign = 'right';
  style._wasNumeric = true;
}

// In table rendering
textAlign: cellStyle.textAlign || (cellStyle._wasNumeric ? 'right' : 'left')

// Don't override padding
paddingLeft: cellStyle.paddingLeft || '2px'
```

## Version History

### 2024-01-28 (v12)
- Fixed text alignment issues in column I for numeric cells
- Enhanced _wasNumeric flag propagation to table rendering
- Fixed indentation preservation for column B cells
- Improved formula cell text extraction with debug logging
- Fixed padding preservation in table cells
- Added accounting format numeric flag for right alignment
- Updated justifyContent logic to respect cell alignment

### 2024-01-28 (v11)
- Fixed text alignment for numeric cells in simple table view
- Preserved indentation by not overriding paddingLeft
- Added _wasNumeric flag to track original cell type
- Enhanced formula cell handling to use cell.text fallback
- Fixed padding preservation for all directions

### 2024-01-28 (v10)
- Fixed column width extraction to use Excel's exact widths
- Removed min/max constraints on column widths
- Added explicit width styling to table cells
- Corrected Excel unit to pixel conversion (7px per unit)
- Fixed default column width calculation

### 2024-01-28 (v9)
- Added comprehensive hidden row detection and handling
- Fixed rows with very small heights not collapsing properly
- Added visibility controls for 0-height rows
- Improved debugging for specific row height issues

### 2024-01-28 (v8)
- Fixed row height synchronization in frozen panes
- Added CSS Grid fixes to prevent row expansion
- Improved handling of very small rows (< 10px)
- Added debugging for frozen pane row height issues
- Fixed container styling to allow proper shrinking

### 2024-01-28 (v7)
- Fixed spillover logic causing bold inheritance and missing text
- Temporarily disabled spillover to isolate issues
- Added includeEmpty: true to cell iteration to capture all cells
- Improved cell.text handling for string vs object types
- Added CSS rules to force normal font-weight with specificity

### 2024-01-28 (v6)
- Fixed excessive bold formatting on cells
- Added explicit fontWeight: 'normal' to prevent CSS inheritance
- Set default font weight on table and container elements
- Ensured font weight is always explicitly set for every cell

### 2024-01-28 (v5)
- Fixed white backgrounds showing pink tint
- Improved theme color handling for small tint values
- Fixed text wrapping override in table cells
- Added leftward overflow for right-aligned text

### 2024-01-28 (v4)
- Added support for Excel indent levels
- Fixed underline vs border bottom handling
- Added debug logging for font weight issues
- Preserved padding from Excel for proper indentation

### 2024-01-28 (v3)
- Fixed date formatting to respect Excel's format strings
- Prevented GMT timestamps from displaying raw
- Re-enabled wrapText support from Excel
- Improved text overflow logic for all alignments
- Added comprehensive date formatting function

### 2024-01-28 (v2)
- Fixed underline formatting to use textDecoration (full-width like Excel)
- Implemented proper text overflow (visible for left-aligned text only)
- Fixed row height alignment between frozen/non-frozen panes
- Fixed date formatting to use Excel's actual format
- Removed minimum height constraint on small rows
- Simplified spillover logic to use CSS overflow

### 2024-01-28 (v1)
- Fixed bold formatting inheritance issues
- Converted font sizes from pt to px
- Disabled aggressive spillover logic
- Created this best practices document