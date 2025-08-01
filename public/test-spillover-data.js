// Test data for spillover functionality QA testing
// This generates test scenarios for comprehensive spillover testing

export const spilloverTestData = {
  cells: [
    // Test 1: Basic left-aligned spillover
    {
      row: 1,
      col: 1,
      value: "This is a very long text that should spill over to adjacent cells on the right side",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11, bold: false }
      }
    },
    
    // Test 2: Right-aligned spillover
    {
      row: 2,
      col: 5,
      value: "Right aligned text that should spill to the left",
      style: {
        alignment: { horizontal: 'right' },
        font: { name: 'Calibri', size: 11, bold: false }
      }
    },
    
    // Test 3: Center-aligned spillover
    {
      row: 3,
      col: 4,
      value: "Center aligned text that should spill both ways",
      style: {
        alignment: { horizontal: 'center' },
        font: { name: 'Calibri', size: 11, bold: false }
      }
    },
    
    // Test 4: Spillover with blocking cell
    {
      row: 4,
      col: 1,
      value: "This long text should stop when it hits the blocking cell",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    {
      row: 4,
      col: 4,
      value: "BLOCK",
      style: {
        fill: { color: 'FFFF0000' }, // Red background
        font: { name: 'Calibri', size: 11, bold: true, color: 'FFFFFFFF' }
      }
    },
    
    // Test 5: Numbers spillover
    {
      row: 5,
      col: 1,
      value: 123456789012345678901234567890,
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    
    // Test 6: Unicode characters
    {
      row: 6,
      col: 1,
      value: "测试中文字符溢出效果 - Test Chinese character spillover functionality",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    
    // Test 7: Special symbols and emoji
    {
      row: 7,
      col: 1,
      value: "Symbols: →←↑↓★☆♠♥♦♣@#$%^&*() Emoji: 😀😃😄😁😆😅😂🤣😊😇🙂🙃",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    
    // Test 8: Different font sizes
    {
      row: 8,
      col: 1,
      value: "Large font text that should spill over with proper scaling",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 16, bold: true }
      }
    },
    {
      row: 9,
      col: 1,
      value: "Small font text spillover test with tiny characters that should still work",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 8 }
      }
    },
    
    // Test 9: Colored text spillover
    {
      row: 10,
      col: 1,
      value: "Blue colored text that should maintain color in spillover regions",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11, color: 'FF0000FF' } // Blue
      }
    },
    
    // Test 10: Text with background color
    {
      row: 11,
      col: 1,
      value: "Text with yellow background - spillover should not inherit background",
      style: {
        alignment: { horizontal: 'left' },
        fill: { color: 'FFFFFF00' }, // Yellow background
        font: { name: 'Calibri', size: 11 }
      }
    },
    
    // Test 11: Mixed content in same row
    {
      row: 12,
      col: 1,
      value: "First spillover text",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    {
      row: 12,
      col: 6,
      value: "Second spillover text in same row",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    
    // Test 12: Very long text (extreme case)
    {
      row: 13,
      col: 1,
      value: "This is an extremely long text that should test the maximum spillover limit of 15 columns as defined in MAX_SPILLOVER_COLS constant in the worker file and should be truncated appropriately without causing performance issues or visual glitches in the Excel viewer component while maintaining proper text alignment and readability",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    
    // Test 13: Different alignment combinations
    {
      row: 14,
      col: 2,
      value: "Left aligned spillover test with specific positioning",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    {
      row: 15,
      col: 8,
      value: "Right aligned spillover test from column H",
      style: {
        alignment: { horizontal: 'right' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    {
      row: 16,
      col: 5,
      value: "Center aligned spillover from column E",
      style: {
        alignment: { horizontal: 'center' },
        font: { name: 'Calibri', size: 11 }
      }
    },
    
    // Test 14: Empty cells to test spillover space
    // (Intentionally left empty to allow spillover)
    
    // Test 15: Performance test - multiple spillover ranges
    ...Array.from({ length: 10 }, (_, i) => ({
      row: 20 + i,
      col: 1,
      value: `Performance test row ${i + 1}: This is a moderately long text to test spillover performance with multiple ranges`,
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 }
      }
    })),
    
    // Test 16: Bordered cells with spillover
    {
      row: 31,
      col: 1,
      value: "Text with borders that should spill over while maintaining border appearance",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Calibri', size: 11 },
        border: {
          top: { style: 'thin', color: '000000' },
          bottom: { style: 'thin', color: '000000' },
          left: { style: 'thin', color: '000000' },
          right: { style: 'thin', color: '000000' }
        }
      }
    },
    
    // Test 17: Various font families
    {
      row: 32,
      col: 1,
      value: "Arial font spillover test with different font family",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Arial', size: 11 }
      }
    },
    {
      row: 33,
      col: 1,
      value: "Times New Roman spillover test with serif font",
      style: {
        alignment: { horizontal: 'left' },
        font: { name: 'Times New Roman', size: 11 }
      }
    }
  ],
  
  // Column widths to test spillover calculation
  columnWidths: {
    1: 10,   // Very narrow first column
    2: 8,    // Even narrower
    3: 12,   // Slightly wider
    4: 15,   // Normal width
    5: 8.43, // Excel default
    6: 20,   // Wide column
    7: 5,    // Very narrow
    8: 8.43, // Default
    9: 8.43, // Default
    10: 8.43 // Default
  },
  
  // Row heights
  rowHeights: {
    8: 24,  // Taller row for large font
    9: 15   // Shorter row for small font
  },
  
  // Expected spillover ranges (for validation)
  expectedSpilloverRanges: [
    {
      sourceRow: 1,
      sourceCol: 1,
      expectedEndCol: 6, // Approximate
      description: "Basic left-aligned spillover"
    },
    {
      sourceRow: 2,
      sourceCol: 5,
      expectedStartCol: 2, // Approximate
      description: "Right-aligned spillover"
    },
    {
      sourceRow: 3,
      sourceCol: 4,
      expectedStartCol: 2, // Approximate
      expectedEndCol: 6,   // Approximate
      description: "Center-aligned spillover"
    },
    {
      sourceRow: 4,
      sourceCol: 1,
      expectedEndCol: 3, // Should stop at column 4 (BLOCK)
      description: "Spillover with blocking cell"
    },
    {
      sourceRow: 13,
      sourceCol: 1,
      expectedEndCol: 15, // Should hit MAX_SPILLOVER_COLS limit
      description: "Maximum spillover range test"
    }
  ]
};

// Test scenarios for manual testing
export const manualTestScenarios = [
  {
    id: 'basic-spillover',
    title: 'Basic Text Spillover',
    description: 'Enter long text in A1 and verify it spills to adjacent cells',
    steps: [
      'Navigate to Excel viewer',
      'Click cell A1',
      'Enter: "This is a very long text that should spill over"',
      'Verify text appears across multiple columns',
      'Click spillover cells (B1, C1) and verify they remain empty'
    ],
    expectedResult: 'Text visible across columns, spillover cells remain empty when clicked'
  },
  {
    id: 'alignment-spillover',
    title: 'Text Alignment Spillover',
    description: 'Test spillover with different text alignments',
    steps: [
      'Test left-aligned spillover (A2)',
      'Test right-aligned spillover (E2)',
      'Test center-aligned spillover (C3)',
      'Verify each alignment spills in correct direction'
    ],
    expectedResult: 'Left spills right, right spills left, center spills both ways'
  },
  {
    id: 'blocking-cells',
    title: 'Spillover Blocking',
    description: 'Verify spillover stops at non-empty cells',
    steps: [
      'Enter long text in A4',
      'Enter "BLOCK" in D4',
      'Verify spillover stops at D4',
      'No text should appear in E4 or beyond'
    ],
    expectedResult: 'Spillover stops at blocking cell, no text beyond blocker'
  },
  {
    id: 'zoom-levels',
    title: 'Zoom Level Testing',
    description: 'Test spillover at various zoom levels',
    steps: [
      'Set zoom to 50%',
      'Verify spillover still works correctly',
      'Set zoom to 100%',
      'Set zoom to 150%',
      'Set zoom to 200%',
      'Verify spillover maintains alignment at all zoom levels'
    ],
    expectedResult: 'Spillover works correctly at all zoom levels'
  },
  {
    id: 'performance-test',
    title: 'Performance Testing',
    description: 'Test performance with many spillover ranges',
    steps: [
      'Load test data with 20+ spillover ranges',
      'Scroll through the sheet',
      'Verify smooth performance',
      'Check for any lag or visual glitches'
    ],
    expectedResult: 'Smooth scrolling and rendering with multiple spillover ranges'
  },
  {
    id: 'cross-browser',
    title: 'Cross-Browser Compatibility',
    description: 'Test spillover in different browsers',
    steps: [
      'Test in Chrome',
      'Test in Firefox',
      'Test in Safari (if available)',
      'Test in Edge',
      'Verify consistent behavior across browsers'
    ],
    expectedResult: 'Consistent spillover behavior across all browsers'
  }
];

// Validation functions for automated testing
export const spilloverValidation = {
  validateSpilloverRange: (actualRange, expectedRange) => {
    const issues = [];
    
    if (actualRange.sourceRow !== expectedRange.sourceRow) {
      issues.push(`Source row mismatch: expected ${expectedRange.sourceRow}, got ${actualRange.sourceRow}`);
    }
    
    if (actualRange.sourceCol !== expectedRange.sourceCol) {
      issues.push(`Source col mismatch: expected ${expectedRange.sourceCol}, got ${actualRange.sourceCol}`);
    }
    
    if (expectedRange.expectedEndCol && Math.abs(actualRange.endCol - expectedRange.expectedEndCol) > 2) {
      issues.push(`End col significant difference: expected ~${expectedRange.expectedEndCol}, got ${actualRange.endCol}`);
    }
    
    return {
      passed: issues.length === 0,
      issues: issues
    };
  },
  
  validateNoSpilloverBleeding: (cellData, spilloverRanges) => {
    // Check that non-spillover cells don't have text from spillover ranges
    const issues = [];
    
    spilloverRanges.forEach(range => {
      // Check cells outside the spillover range
      cellData.forEach(cell => {
        if (cell.row === range.sourceRow && 
            cell.col > range.endCol && 
            cell.col < range.endCol + 3) { // Check a few cells beyond
          if (cell.value && cell.value.includes(range.text)) {
            issues.push(`Text bleeding detected in cell ${cell.row},${cell.col}`);
          }
        }
      });
    });
    
    return {
      passed: issues.length === 0,
      issues: issues
    };
  },
  
  validateSpilloverStopping: (spilloverRanges, cellData) => {
    // Verify spillover stops at non-empty cells
    const issues = [];
    
    spilloverRanges.forEach(range => {
      // Find any non-empty cells in the potential spillover path
      const blockingCells = cellData.filter(cell => 
        cell.row === range.sourceRow &&
        cell.col > range.sourceCol &&
        cell.col <= range.endCol + 5 && // Check beyond spillover end
        cell.value && cell.value.trim() !== ''
      );
      
      blockingCells.forEach(blocker => {
        if (range.endCol >= blocker.col) {
          issues.push(`Spillover should stop before blocking cell at ${blocker.row},${blocker.col}`);
        }
      });
    });
    
    return {
      passed: issues.length === 0,
      issues: issues
    };
  }
};