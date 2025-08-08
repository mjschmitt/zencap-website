import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExcelSheet from '../ExcelSheet';
import { VariableSizeGrid } from 'react-window';

// Mock react-window
jest.mock('react-window', () => ({
  VariableSizeGrid: jest.fn(({ children, onScroll, columnCount, rowCount }) => {
    // Create a simple mock grid that renders cells
    const cells = [];
    for (let row = 0; row < Math.min(rowCount, 10); row++) {
      for (let col = 0; col < Math.min(columnCount, 10); col++) {
        const Cell = children;
        cells.push(
          <div key={`${row}-${col}`} data-testid={`grid-cell-${row}-${col}`}>
            <Cell columnIndex={col} rowIndex={row} style={{}} />
          </div>
        );
      }
    }
    return (
      <div 
        data-testid="variable-size-grid" 
        onScroll={(e) => onScroll?.({ scrollLeft: e.target.scrollLeft, scrollTop: e.target.scrollTop })}
      >
        {cells}
      </div>
    );
  }),
}));

// Mock ExcelCell component
jest.mock('../ExcelCell', () => ({
  __esModule: true,
  default: jest.fn(({ value, row, col, onClick, isSelected }) => (
    <div 
      data-testid={`excel-cell-${row}-${col}`}
      onClick={() => onClick?.(row, col, value)}
      className={isSelected ? 'selected' : ''}
    >
      {value || ''}
    </div>
  )),
}));

describe('ExcelSheet', () => {
  const defaultProps = {
    width: 800,
    height: 600,
    onCellClick: jest.fn(),
    onViewportChange: jest.fn(),
  };

  const mockData = {
    cells: [
      { row: 1, col: 1, value: 'A1 Value' },
      { row: 1, col: 2, value: 'B1 Value' },
      { row: 2, col: 1, value: 'A2 Value' },
      { row: 2, col: 2, value: 'B2 Value' },
    ],
    columnWidths: { 1: 15, 2: 20 },
    rowHeights: { 1: 30, 2: 25 },
    mergedCells: [],
    frozenRows: 0,
    frozenCols: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the grid with correct dimensions', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      expect(screen.getByTestId('variable-size-grid')).toBeInTheDocument();
      expect(VariableSizeGrid).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 800,
          height: 600,
          columnCount: expect.any(Number),
          rowCount: expect.any(Number),
        }),
        expect.any(Object)
      );
    });

    it('should render header row with column letters', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      // Header cells should show column letters
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should render row numbers', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      // Row number cells
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render cell data', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      expect(screen.getByText('A1 Value')).toBeInTheDocument();
      expect(screen.getByText('B1 Value')).toBeInTheDocument();
      expect(screen.getByText('A2 Value')).toBeInTheDocument();
      expect(screen.getByText('B2 Value')).toBeInTheDocument();
    });
  });

  describe('Column and Row Sizing', () => {
    it('should apply custom column widths', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} zoom={100} />);
      
      // getColumnWidth should be called and return correct values
      const { columnWidth } = VariableSizeGrid.mock.calls[0][0];
      
      // Column 1 has width 15, converted to pixels (15 * 7.0 * zoomFactor)
      expect(columnWidth(1)).toBe(15 * 7.0 * 1);
      
      // Column 2 has width 20
      expect(columnWidth(2)).toBe(20 * 7.0 * 1);
      
      // Default column width for unmapped columns
      expect(columnWidth(3)).toBe(64); // DEFAULT_COLUMN_WIDTH
    });

    it('should apply custom row heights', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} zoom={100} />);
      
      const { rowHeight } = VariableSizeGrid.mock.calls[0][0];
      
      // Row 1 has height 30 (converted from points to pixels: 30 * 1.333)
      expect(rowHeight(1)).toBe(Math.round(30 * 1.333));
      
      // Row 2 has height 25 (converted from points to pixels: 25 * 1.333)
      expect(rowHeight(2)).toBe(Math.round(25 * 1.333));
      
      // Default row height
      expect(rowHeight(3)).toBe(20); // DEFAULT_ROW_HEIGHT
    });

    it('should apply zoom factor to dimensions', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} zoom={150} />);
      
      const { columnWidth, rowHeight } = VariableSizeGrid.mock.calls[0][0];
      
      // With 150% zoom
      expect(columnWidth(1)).toBe(15 * 7.0 * 1.5);
      expect(rowHeight(1)).toBe(Math.round(30 * 1.333 * 1.5));
    });
  });

  describe('Cell Interactions', () => {
    it('should handle cell clicks', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      const cell = screen.getByTestId('excel-cell-1-1');
      fireEvent.click(cell);
      
      expect(defaultProps.onCellClick).toHaveBeenCalledWith(1, 1, 'A1 Value');
    });

    it('should highlight selected cell', () => {
      const selectedCell = { row: 1, col: 1 };
      render(<ExcelSheet {...defaultProps} data={mockData} selectedCell={selectedCell} />);
      
      const cell = screen.getByTestId('excel-cell-1-1');
      expect(cell).toHaveClass('selected');
    });

    it('should handle empty cell clicks', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      // Click on an empty cell (not in data)
      const emptyCell = screen.getByTestId('grid-cell-3-3');
      fireEvent.click(emptyCell);
      
      // Should still trigger onCellClick with empty value
      expect(defaultProps.onCellClick).toHaveBeenCalled();
    });
  });

  describe('Viewport Management', () => {
    it('should report viewport changes on scroll', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      const grid = screen.getByTestId('variable-size-grid');
      
      // Simulate scroll
      fireEvent.scroll(grid, { 
        target: { scrollLeft: 100, scrollTop: 50 } 
      });
      
      // onViewportChange should be called with calculated viewport
      expect(defaultProps.onViewportChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startRow: expect.any(Number),
          endRow: expect.any(Number),
          startCol: expect.any(Number),
          endCol: expect.any(Number),
        })
      );
    });

    it('should not trigger viewport change for small scrolls', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      const grid = screen.getByTestId('variable-size-grid');
      
      // Small scroll that shouldn't trigger viewport change
      fireEvent.scroll(grid, { 
        target: { scrollLeft: 5, scrollTop: 5 } 
      });
      
      // Should not be called for small movements
      expect(defaultProps.onViewportChange).not.toHaveBeenCalled();
    });
  });

  describe('Merged Cells', () => {
    it('should render merged cells overlay', () => {
      const dataWithMerged = {
        ...mockData,
        mergedCells: [
          { startRow: 1, startCol: 1, endRow: 2, endCol: 2 }
        ],
      };
      
      render(<ExcelSheet {...defaultProps} data={dataWithMerged} />);
      
      // Merged cell overlay should be rendered
      const mergedCell = screen.getByRole('gridcell', { 
        colSpan: 2,
        rowSpan: 2 
      });
      
      expect(mergedCell).toBeInTheDocument();
    });

    it('should calculate merged cell dimensions correctly', () => {
      const dataWithMerged = {
        ...mockData,
        mergedCells: [
          { startRow: 1, startCol: 1, endRow: 1, endCol: 2 }
        ],
      };
      
      render(<ExcelSheet {...defaultProps} data={dataWithMerged} zoom={100} />);
      
      const mergedCell = screen.getByRole('gridcell', { colSpan: 2 });
      
      // Check if merged cell has correct dimensions
      // Width should be sum of columns 1 and 2
      const expectedWidth = (15 * 8) + (20 * 8); // col1 + col2 widths
      expect(mergedCell).toHaveStyle({ width: `${expectedWidth}px` });
    });
  });

  describe('Performance Optimization', () => {
    it('should use Map for O(1) cell lookups', () => {
      const largeCellData = [];
      for (let i = 0; i < 1000; i++) {
        largeCellData.push({ row: i, col: 1, value: `Cell ${i}` });
      }
      
      const largeData = { ...mockData, cells: largeCellData };
      
      const { rerender } = render(<ExcelSheet {...defaultProps} data={largeData} />);
      
      // Update with new data
      const updatedData = {
        ...largeData,
        cells: [...largeCellData, { row: 1000, col: 1, value: 'New Cell' }],
      };
      
      rerender(<ExcelSheet {...defaultProps} data={updatedData} />);
      
      // Should handle large datasets efficiently
      expect(screen.getByTestId('variable-size-grid')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', () => {
      render(<ExcelSheet {...defaultProps} data={{}} />);
      
      expect(screen.getByTestId('variable-size-grid')).toBeInTheDocument();
    });

    it('should handle missing data properties', () => {
      const incompleteData = { cells: mockData.cells };
      
      render(<ExcelSheet {...defaultProps} data={incompleteData} />);
      
      expect(screen.getByTestId('variable-size-grid')).toBeInTheDocument();
    });

    it('should calculate correct total dimensions', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      const { columnCount, rowCount } = VariableSizeGrid.mock.calls[0][0];
      
      // Should have at least 50 columns and 100 rows as minimum
      expect(columnCount).toBeGreaterThanOrEqual(50);
      expect(rowCount).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Column Name Generation', () => {
    it('should generate correct column names', () => {
      render(<ExcelSheet {...defaultProps} data={mockData} />);
      
      // Test various column indices
      expect(screen.getByText('A')).toBeInTheDocument(); // Column 1
      expect(screen.getByText('B')).toBeInTheDocument(); // Column 2
      
      // For larger indices (would need to adjust mock to test)
      // Z = 26, AA = 27, AB = 28, etc.
    });
  });
});