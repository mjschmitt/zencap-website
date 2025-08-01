import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExcelCell from '../ExcelCell';

// Mock useTheme hook
jest.mock('../useTheme', () => ({
  useTheme: jest.fn(() => ({
    cellTheme: {
      cell: 'theme-cell',
      cellSelected: 'theme-cell-selected',
      cellHighlight: 'theme-cell-highlight',
      cellFormula: 'theme-cell-formula',
      cellError: 'theme-cell-error',
      cellReadonly: 'theme-cell-readonly',
      cellHover: 'theme-cell-hover',
    },
  })),
}));

describe('ExcelCell', () => {
  const defaultProps = {
    value: 'Test Value',
    row: 1,
    col: 1,
    columnName: 'A',
    onClick: jest.fn(),
    width: 100,
    height: 25,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render cell with value', () => {
      render(<ExcelCell {...defaultProps} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveTextContent('Test Value');
    });

    it('should render empty cell when value is null', () => {
      render(<ExcelCell {...defaultProps} value={null} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveTextContent('');
    });

    it('should apply correct dimensions', () => {
      render(<ExcelCell {...defaultProps} width={150} height={30} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        width: '150px',
        height: '30px',
        minWidth: '150px',
        minHeight: '30px',
        maxWidth: '150px',
        maxHeight: '30px',
      });
    });

    it('should handle click events', () => {
      render(<ExcelCell {...defaultProps} />);
      
      const cell = screen.getByRole('gridcell');
      fireEvent.click(cell);
      
      expect(defaultProps.onClick).toHaveBeenCalledWith(1, 1, 'Test Value');
    });
  });

  describe('Styling', () => {
    it('should apply font styles', () => {
      const style = {
        font: {
          bold: true,
          italic: true,
          underline: true,
          size: 14,
          color: { argb: 'FF0000FF' },
          name: 'Arial',
        },
      };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        fontWeight: 'bold',
        fontStyle: 'italic',
        textDecoration: 'underline',
        fontSize: '14px',
        color: '#0000FF',
        fontFamily: 'Arial',
      });
    });

    it('should apply background color', () => {
      const style = {
        fill: { color: { argb: 'FFFFFF00' } },
      };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        backgroundColor: '#FFFF00',
      });
    });

    it('should apply alignment styles', () => {
      const style = {
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
          indent: 2,
        },
      };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        textAlign: 'center',
        verticalAlign: 'middle',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        paddingLeft: '20px', // 4 + 2 * 8
      });
    });

    it('should apply border styles', () => {
      const style = {
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'medium', color: { argb: 'FF000000' } },
          left: { style: 'thick', color: { argb: 'FF000000' } },
          right: { style: 'hair', color: { argb: 'FF000000' } },
        },
      };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        borderTop: '1px thin #000000',
        borderBottom: '2px medium #000000',
        borderLeft: '3px thick #000000',
        borderRight: '0.5px hair #000000',
      });
    });
  });

  describe('Cell States', () => {
    it('should highlight selected cell', () => {
      render(<ExcelCell {...defaultProps} isSelected={true} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        outline: '2px solid #0d9488',
        outlineOffset: '-1px',
        zIndex: 2,
      });
    });

    it('should highlight search results', () => {
      render(<ExcelCell {...defaultProps} isHighlighted={true} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        backgroundColor: '#fef08a',
        zIndex: 1,
      });
    });

    it('should show formula indicator', () => {
      const style = { formula: 'SUM(A1:A10)' };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      expect(screen.getByText('ƒ')).toBeInTheDocument();
    });

    it('should show error indicator', () => {
      const style = { error: '#DIV/0!' };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      expect(screen.getByText('⚠')).toBeInTheDocument();
    });

    it('should apply readonly styles', () => {
      const style = { readonly: true };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveAttribute('aria-readonly', 'true');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles', () => {
      render(<ExcelCell {...defaultProps} darkMode={true} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveClass('theme-cell');
    });

    it('should override colors in dark mode', () => {
      const style = {
        font: { color: { argb: 'FF0000FF' } },
        fill: { color: { argb: 'FFFFFF00' } },
      };
      
      render(<ExcelCell {...defaultProps} style={style} darkMode={true} />);
      
      const cell = screen.getByRole('gridcell');
      // In dark mode, font color should be ignored
      expect(cell).not.toHaveStyle({ color: '#0000FF' });
    });

    it('should use dark mode border colors', () => {
      render(<ExcelCell {...defaultProps} darkMode={true} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        borderRight: '1px solid #374151',
        borderBottom: '1px solid #374151',
      });
    });
  });

  describe('Print Mode', () => {
    it('should apply print mode styles', () => {
      render(<ExcelCell {...defaultProps} isPrintMode={true} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        border: '1px solid #d1d5db',
        color: '#000000',
      });
      expect(cell).toHaveClass('print:text-black', 'print:bg-white');
    });

    it('should hide indicators in print mode', () => {
      const style = { formula: 'SUM(A1:A10)', error: '#DIV/0!' };
      
      render(<ExcelCell {...defaultProps} style={style} isPrintMode={true} />);
      
      expect(screen.queryByText('ƒ')).not.toBeInTheDocument();
      expect(screen.queryByText('⚠')).not.toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format currency values', () => {
      const style = { numberFormat: '$#,##0.00' };
      
      render(<ExcelCell {...defaultProps} value={1234.5} style={style} />);
      
      expect(screen.getByText('$1,234.50')).toBeInTheDocument();
    });

    it('should format percentage values', () => {
      const style = { numberFormat: '0.00%' };
      
      render(<ExcelCell {...defaultProps} value={0.1234} style={style} />);
      
      expect(screen.getByText('12.34%')).toBeInTheDocument();
    });

    it('should format decimal values', () => {
      const style = { numberFormat: '0.00' };
      
      render(<ExcelCell {...defaultProps} value={123.456} style={style} />);
      
      expect(screen.getByText('123.46')).toBeInTheDocument();
    });

    it('should not format non-numeric values', () => {
      const style = { numberFormat: '$#,##0.00' };
      
      render(<ExcelCell {...defaultProps} value="Text" style={style} />);
      
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ExcelCell {...defaultProps} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveAttribute('aria-label', 'Cell A1, value: Test Value');
      expect(cell).toHaveAttribute('aria-selected', 'false');
      expect(cell).toHaveAttribute('tabIndex', '-1');
    });

    it('should update ARIA attributes when selected', () => {
      render(<ExcelCell {...defaultProps} isSelected={true} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveAttribute('aria-selected', 'true');
      expect(cell).toHaveAttribute('tabIndex', '0');
    });

    it('should indicate formula cells in ARIA label', () => {
      const style = { formula: 'SUM(A1:A10)' };
      
      render(<ExcelCell {...defaultProps} style={style} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveAttribute('aria-label', 'Cell A1, formula: Test Value');
    });

    it('should handle accessibility mode', () => {
      render(<ExcelCell {...defaultProps} accessibilityMode={true} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveAttribute('title', 'Test Value');
    });
  });

  describe('Merged Cells', () => {
    it('should center content in merged cells', () => {
      render(<ExcelCell {...defaultProps} isMerged={true} />);
      
      const content = screen.getByText('Test Value').parentElement;
      expect(content).toHaveClass('flex', 'items-center', 'justify-center', 'h-full');
    });
  });

  describe('Performance', () => {
    it('should memoize cell styles', () => {
      const { rerender } = render(<ExcelCell {...defaultProps} />);
      
      const cell1 = screen.getByRole('gridcell');
      const style1 = cell1.getAttribute('style');
      
      // Rerender with same props
      rerender(<ExcelCell {...defaultProps} />);
      
      const cell2 = screen.getByRole('gridcell');
      const style2 = cell2.getAttribute('style');
      
      // Styles should be the same (memoized)
      expect(style1).toBe(style2);
    });

    it('should memoize display value', () => {
      const { rerender } = render(<ExcelCell {...defaultProps} value={123} />);
      
      expect(screen.getByText('123')).toBeInTheDocument();
      
      // Rerender with same value
      rerender(<ExcelCell {...defaultProps} value={123} />);
      
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined value', () => {
      render(<ExcelCell {...defaultProps} value={undefined} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveTextContent('');
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(100);
      
      render(<ExcelCell {...defaultProps} value={longText} />);
      
      const cell = screen.getByRole('gridcell');
      expect(cell).toHaveStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      });
    });

    it('should handle special characters in value', () => {
      render(<ExcelCell {...defaultProps} value={'<>&"\''} />);
      
      expect(screen.getByText('<>&"\'')).toBeInTheDocument();
    });
  });
});