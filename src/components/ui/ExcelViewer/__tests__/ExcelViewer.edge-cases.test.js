import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ExcelJSViewer from '../ExcelJSViewer';

// Mock dependencies
jest.mock('../useExcelProcessor');
jest.mock('../usePerformanceMonitor');
jest.mock('../useKeyboardNavigation');
jest.mock('../useTheme');

const mockUseExcelProcessor = require('../useExcelProcessor').useExcelProcessor;
const mockUsePerformanceMonitor = require('../usePerformanceMonitor').usePerformanceMonitor;
const mockUseKeyboardNavigation = require('../useKeyboardNavigation').useKeyboardNavigation;
const mockUseTheme = require('../useTheme').useTheme;

describe('Excel Viewer Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUsePerformanceMonitor.mockReturnValue({
      startMeasure: jest.fn(),
      endMeasure: jest.fn().mockReturnValue(100),
      logPerformanceWarning: jest.fn(),
    });

    mockUseKeyboardNavigation.mockReturnValue({
      registerKeyboardShortcuts: jest.fn(),
    });

    mockUseTheme.mockReturnValue({
      theme: {},
    });
  });

  describe('Corrupt File Handling', () => {
    it('should handle malformed Excel files', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockRejectedValue(new Error('Invalid file format')),
        processSheet: jest.fn(),
        searchInSheet: jest.fn(),
      });

      const onError = jest.fn();
      render(<ExcelJSViewer file="corrupt.xlsx" onError={onError} />);

      await waitFor(() => {
        expect(screen.getByText(/Invalid file format/)).toBeInTheDocument();
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle files with invalid structure', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: null, // Invalid structure
        }),
        processSheet: jest.fn(),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="invalid.xlsx" />);

      await waitFor(() => {
        expect(screen.queryByText(/sheet/i)).not.toBeInTheDocument();
      });
    });

    it('should handle binary data that is not Excel', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
      });

      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockRejectedValue(new Error('Not a valid Excel file')),
        processSheet: jest.fn(),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="image.png" />);

      await waitFor(() => {
        expect(screen.getByText(/Not a valid Excel file/)).toBeInTheDocument();
      });
    });
  });

  describe('Empty File Handling', () => {
    it('should handle completely empty Excel files', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [],
        }),
        processSheet: jest.fn(),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="empty.xlsx" />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /sheet/i })).not.toBeInTheDocument();
      });
    });

    it('should handle sheets with no data', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Empty Sheet' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [],
          columnWidths: {},
          rowHeights: {},
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="empty-sheet.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('Empty Sheet')).toBeInTheDocument();
      });

      // Should render empty grid
      expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
    });

    it('should handle sheets with only formatting, no values', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Formatted' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { row: 1, col: 1, value: '', style: { font: { bold: true } } },
            { row: 2, col: 1, value: null, style: { fill: { color: 'FF0000' } } },
          ],
          columnWidths: { 1: 20 },
          rowHeights: { 1: 30 },
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="formatted-empty.xlsx" />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });
    });
  });

  describe('Extreme Data Handling', () => {
    it('should handle extremely large number of sheets', async () => {
      const manySheets = Array.from({ length: 1000 }, (_, i) => ({
        name: `Sheet${i + 1}`,
        id: i,
      }));

      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: manySheets,
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [{ row: 1, col: 1, value: 'Test' }],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="many-sheets.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('1000 sheets')).toBeInTheDocument();
      });
    });

    it('should handle cells with extremely long text', async () => {
      const longText = 'A'.repeat(10000);
      
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Sheet1' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [{ row: 1, col: 1, value: longText }],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="long-text.xlsx" />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Text should be truncated with ellipsis
      const cell = screen.getByTestId('cell-1-1');
      expect(cell).toHaveStyle({ textOverflow: 'ellipsis' });
    });

    it('should handle deeply nested merged cells', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Merged' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [],
          mergedCells: [
            { startRow: 1, startCol: 1, endRow: 100, endCol: 100 },
            { startRow: 10, startCol: 10, endRow: 90, endCol: 90 },
            { startRow: 20, startCol: 20, endRow: 80, endCol: 80 },
          ],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="nested-merged.xlsx" />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should handle Unicode characters correctly', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: '中文工作表' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { row: 1, col: 1, value: '你好世界' },
            { row: 2, col: 1, value: '🌍🚀💻' },
            { row: 3, col: 1, value: 'café' },
          ],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="unicode.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('中文工作表')).toBeInTheDocument();
        expect(screen.getByText('你好世界')).toBeInTheDocument();
        expect(screen.getByText('🌍🚀💻')).toBeInTheDocument();
        expect(screen.getByText('café')).toBeInTheDocument();
      });
    });

    it('should handle special Excel characters', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Special' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { row: 1, col: 1, value: "Line1\nLine2" }, // Newline
            { row: 2, col: 1, value: "\tTabbed" }, // Tab
            { row: 3, col: 1, value: "'Leading quote" }, // Excel quote prefix
          ],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="special-chars.xlsx" />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });
    });
  });

  describe('Formula and Error Handling', () => {
    it('should handle circular reference errors', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Formulas' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { row: 1, col: 1, value: '#CIRCULAR!', style: { error: true } },
            { row: 2, col: 1, value: '#DIV/0!', style: { error: true } },
            { row: 3, col: 1, value: '#REF!', style: { error: true } },
          ],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="errors.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('#CIRCULAR!')).toBeInTheDocument();
        expect(screen.getByText('#DIV/0!')).toBeInTheDocument();
        expect(screen.getByText('#REF!')).toBeInTheDocument();
      });
    });

    it('should handle complex nested formulas', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Complex' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { 
              row: 1, 
              col: 1, 
              value: 42, 
              style: { 
                formula: 'IF(AND(A2>0,OR(B2<10,C2=TRUE)),SUM(D2:D100),AVERAGE(E2:E100))' 
              } 
            },
          ],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="complex-formulas.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('ƒ')).toBeInTheDocument(); // Formula indicator
      });
    });
  });

  describe('Date and Time Handling', () => {
    it('should handle various date formats', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Dates' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { row: 1, col: 1, value: '2024-01-01', style: { numberFormat: 'yyyy-mm-dd' } },
            { row: 2, col: 1, value: '01/01/24', style: { numberFormat: 'mm/dd/yy' } },
            { row: 3, col: 1, value: '1 Jan 2024', style: { numberFormat: 'd mmm yyyy' } },
            { row: 4, col: 1, value: 44927, style: { numberFormat: 'date' } }, // Excel date serial
          ],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="dates.xlsx" />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });
    });

    it('should handle 1900 vs 1904 date systems', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'DateSystem' }],
          properties: { date1904: true },
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { row: 1, col: 1, value: 0, style: { numberFormat: 'date' } }, // Should be Jan 1, 1904
          ],
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="date1904.xlsx" />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });
    });
  });

  describe('Hidden Elements', () => {
    it('should handle hidden rows and columns', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Hidden' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [
            { row: 1, col: 1, value: 'Visible' },
            { row: 3, col: 1, value: 'Also Visible' }, // Row 2 is hidden
          ],
          hiddenRows: [2],
          hiddenColumns: [2], // Column B is hidden
        }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="hidden.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('Visible')).toBeInTheDocument();
        expect(screen.getByText('Also Visible')).toBeInTheDocument();
      });
    });

    it('should handle hidden sheets', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [
            { name: 'Visible', state: 'visible' },
            { name: 'Hidden', state: 'hidden' },
            { name: 'VeryHidden', state: 'veryHidden' },
          ],
        }),
        processSheet: jest.fn().mockResolvedValue({ cells: [] }),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="hidden-sheets.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('Visible')).toBeInTheDocument();
        // Hidden sheets might still be shown in the UI
        expect(screen.getByText('Hidden')).toBeInTheDocument();
      });
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle rapid sheet switching', async () => {
      const mockProcessSheet = jest.fn().mockResolvedValue({
        cells: [{ row: 1, col: 1, value: 'Test' }],
      });

      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [
            { name: 'Sheet1' },
            { name: 'Sheet2' },
            { name: 'Sheet3' },
          ],
        }),
        processSheet: mockProcessSheet,
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer file="test.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Rapidly switch sheets
      fireEvent.click(screen.getByText('Sheet2'));
      fireEvent.click(screen.getByText('Sheet3'));
      fireEvent.click(screen.getByText('Sheet1'));
      fireEvent.click(screen.getByText('Sheet2'));

      // Should handle all switches without crashing
      expect(mockProcessSheet).toHaveBeenCalled();
    });

    it('should handle component unmount during loading', async () => {
      let resolveLoad;
      const loadPromise = new Promise(resolve => { resolveLoad = resolve; });

      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn(() => loadPromise),
        processSheet: jest.fn(),
        searchInSheet: jest.fn(),
      });

      const { unmount } = render(<ExcelJSViewer file="test.xlsx" />);

      // Unmount before load completes
      unmount();

      // Complete the load after unmount
      resolveLoad({ worksheets: [{ name: 'Sheet1' }] });

      // Should not cause errors
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle search while loading new sheet', async () => {
      const mockSearch = jest.fn().mockResolvedValue([
        { row: 1, col: 1, value: 'Found' },
      ]);

      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({
          worksheets: [{ name: 'Sheet1' }, { name: 'Sheet2' }],
        }),
        processSheet: jest.fn().mockResolvedValue({
          cells: [{ row: 1, col: 1, value: 'Test' }],
        }),
        searchInSheet: mockSearch,
      });

      render(<ExcelJSViewer file="test.xlsx" showSearch={true} />);

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Start search
      fireEvent.click(screen.getByLabelText('Search in spreadsheet'));
      
      // Switch sheet while search might be running
      fireEvent.click(screen.getByText('Sheet2'));

      // Should handle gracefully
      expect(screen.getByText('Sheet2')).toBeInTheDocument();
    });
  });
});