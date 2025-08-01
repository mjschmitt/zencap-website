import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExcelJSViewer from '../../ExcelJSViewer';

// Mock file data generator
const createMockExcelFile = (data) => {
  const blob = new Blob([JSON.stringify(data)], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  return URL.createObjectURL(blob);
};

// Mock worker that simulates real Excel processing
class MockExcelWorker {
  constructor() {
    this.onmessage = null;
    this.workbook = null;
  }

  postMessage(message) {
    const { type, data, id } = message;
    
    setTimeout(() => {
      switch (type) {
        case 'LOAD_WORKBOOK':
          this.workbook = {
            worksheets: [
              { name: 'Sheet1', rowCount: 100, columnCount: 26 },
              { name: 'Sheet2', rowCount: 50, columnCount: 10 },
              { name: 'Data', rowCount: 1000, columnCount: 50 }
            ]
          };
          this.onmessage({
            data: { type: 'WORKBOOK_LOADED', data: this.workbook, id }
          });
          break;
          
        case 'PROCESS_SHEET':
          const cells = this.generateSheetData(data.sheetIndex, data.viewportStart, data.viewportEnd);
          this.onmessage({
            data: {
              type: 'SHEET_PROCESSED',
              data: {
                cells,
                columnWidths: { 1: 15, 2: 20, 3: 25 },
                rowHeights: { 1: 30 },
                mergedCells: data.sheetIndex === 0 ? [{ startRow: 1, startCol: 1, endRow: 2, endCol: 2 }] : []
              },
              id
            }
          });
          break;
          
        case 'SEARCH_IN_SHEET':
          const results = this.performSearch(data.sheetIndex, data.query);
          this.onmessage({
            data: { type: 'SEARCH_RESULTS', data: results, id }
          });
          break;
          
        default:
          this.onmessage({
            data: { type: 'ERROR', error: { message: 'Unknown message type' }, id }
          });
      }
    }, 50); // Simulate async processing
  }

  generateSheetData(sheetIndex, viewportStart, viewportEnd) {
    const cells = [];
    const startRow = viewportStart?.row || 1;
    const endRow = Math.min(viewportEnd?.row || 100, 100);
    const startCol = viewportStart?.col || 1;
    const endCol = Math.min(viewportEnd?.col || 26, 26);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cells.push({
          row,
          col,
          value: sheetIndex === 0 
            ? `${String.fromCharCode(64 + col)}${row}`
            : `Data-${row}-${col}`,
          style: row === 1 ? { font: { bold: true } } : {}
        });
      }
    }
    
    return cells;
  }

  performSearch(sheetIndex, query) {
    const results = [];
    // Simulate finding some matches
    if (query.toLowerCase().includes('data')) {
      results.push({ row: 5, col: 3, value: 'Data-5-3' });
      results.push({ row: 10, col: 5, value: 'Data-10-5' });
    }
    return results;
  }

  terminate() {}
}

// Replace global Worker with our mock
global.Worker = MockExcelWorker;

describe('ExcelViewer Integration Tests', () => {
  describe('File Upload and Processing', () => {
    it('should complete full file loading workflow', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      const onSuccess = jest.fn();
      
      render(
        <ExcelJSViewer 
          file={mockFile} 
          title="Test.xlsx"
          onSuccess={onSuccess}
        />
      );

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Wait for file to load
      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Should show all sheets
      expect(screen.getByText('Sheet2')).toBeInTheDocument();
      expect(screen.getByText('Data')).toBeInTheDocument();

      // Should display sheet data
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument();
      });

      // Success callback should be called
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle sheet switching workflow', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      
      render(<ExcelJSViewer file={mockFile} title="Test.xlsx" />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Should show Sheet1 data
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument();
      });

      // Switch to Sheet2
      fireEvent.click(screen.getByText('Sheet2'));

      // Should show Sheet2 data
      await waitFor(() => {
        expect(screen.getByText('Data-1-1')).toBeInTheDocument();
      });

      // Switch to Data sheet
      fireEvent.click(screen.getByText('Data'));

      // Should show Data sheet data
      await waitFor(() => {
        expect(screen.queryByText('A1')).not.toBeInTheDocument();
        expect(screen.getByText('Data-1-1')).toBeInTheDocument();
      });
    });

    it('should handle progressive loading on scroll', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      
      render(<ExcelJSViewer file={mockFile} title="Test.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Initial viewport should be loaded
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument();
      });

      // Simulate scroll (this would trigger viewport change in real component)
      const grid = screen.getByTestId('variable-size-grid');
      fireEvent.scroll(grid, { target: { scrollTop: 1000, scrollLeft: 500 } });

      // New data should be requested (implementation dependent)
    });
  });

  describe('Search Functionality Integration', () => {
    it('should perform search across sheet', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      
      render(<ExcelJSViewer file={mockFile} title="Test.xlsx" showSearch={true} />);

      // Wait for file to load
      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Open search
      const searchButton = screen.getByLabelText('Search in spreadsheet');
      fireEvent.click(searchButton);

      // Should show search panel
      await waitFor(() => {
        expect(screen.getByRole('search')).toBeInTheDocument();
      });

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'data');
      
      // Submit search (implementation dependent - might need Enter key or button)
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      // Should show search results
      await waitFor(() => {
        expect(screen.getByText(/Found 2 results/i)).toBeInTheDocument();
      });
    });

    it('should navigate between search results', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      
      render(<ExcelJSViewer file={mockFile} title="Test.xlsx" showSearch={true} />);

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Perform search
      const searchButton = screen.getByLabelText('Search in spreadsheet');
      fireEvent.click(searchButton);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'data');
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Found 2 results/i)).toBeInTheDocument();
      });

      // Navigate to next result
      const nextButton = screen.getByLabelText(/next result/i);
      fireEvent.click(nextButton);

      // Should show result 2 of 2
      await waitFor(() => {
        expect(screen.getByText(/Result 2 of 2/i)).toBeInTheDocument();
      });

      // Navigate to previous result
      const prevButton = screen.getByLabelText(/previous result/i);
      fireEvent.click(prevButton);

      // Should show result 1 of 2
      await waitFor(() => {
        expect(screen.getByText(/Result 1 of 2/i)).toBeInTheDocument();
      });
    });
  });

  describe('Zoom and View Controls', () => {
    it('should handle zoom workflow', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      
      render(<ExcelJSViewer file={mockFile} title="Test.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });

      // Zoom in
      const zoomInButton = screen.getByLabelText('Zoom in');
      fireEvent.click(zoomInButton);

      await waitFor(() => {
        expect(screen.getByText('125%')).toBeInTheDocument();
      });

      // Zoom out multiple times
      const zoomOutButton = screen.getByLabelText('Zoom out');
      fireEvent.click(zoomOutButton);
      fireEvent.click(zoomOutButton);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should handle full screen mode', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      
      render(<ExcelJSViewer file={mockFile} title="Test.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Enter full screen
      const fullScreenButton = screen.getByLabelText('Enter full screen');
      fireEvent.click(fullScreenButton);

      // Should apply full screen classes
      const viewer = screen.getByRole('application');
      expect(viewer).toHaveClass('fixed', 'inset-0', 'z-50');

      // Exit with ESC
      fireEvent.keyDown(document, { key: 'Escape' });

      // Should exit full screen
      expect(viewer).not.toHaveClass('fixed', 'inset-0', 'z-50');
    });
  });

  describe('Export Functionality', () => {
    it('should handle export workflow', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      const mockExport = jest.fn();
      
      render(
        <ExcelJSViewer 
          file={mockFile} 
          title="Test.xlsx"
          onExport={mockExport}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
      });

      // Open export menu
      const exportButton = screen.getByLabelText('Export spreadsheet');
      fireEvent.click(exportButton);

      // Select CSV export
      const csvOption = screen.getByText('CSV (.csv)');
      fireEvent.click(csvOption);

      // Should show export notification
      await waitFor(() => {
        expect(screen.getByText(/Exporting as CSV/i)).toBeInTheDocument();
      });

      // Should show success after export
      await waitFor(() => {
        expect(screen.getByText(/Exported successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle file loading errors gracefully', async () => {
      // Mock fetch failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const onError = jest.fn();
      
      render(
        <ExcelJSViewer 
          file="invalid-file.xlsx" 
          title="Test.xlsx"
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      expect(onError).toHaveBeenCalled();

      // Retry button should be available
      const retryButton = screen.getByText(/retry/i);
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle worker errors', async () => {
      // Create a worker that will error
      global.Worker = class ErrorWorker {
        postMessage(message) {
          setTimeout(() => {
            this.onmessage({
              data: {
                type: 'ERROR',
                error: { message: 'Worker processing failed' },
                id: message.id
              }
            });
          }, 10);
        }
        terminate() {}
      };

      const mockFile = createMockExcelFile({ test: 'data' });
      
      render(<ExcelJSViewer file={mockFile} title="Test.xlsx" />);

      await waitFor(() => {
        expect(screen.getByText(/Worker processing failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const mockFile = createMockExcelFile({ test: 'data' });
      
      const { container } = render(
        <ExcelJSViewer file={mockFile} title="LargeFile.xlsx" />
      );

      await waitFor(() => {
        expect(screen.getByText('Data')).toBeInTheDocument();
      });

      // Switch to large data sheet
      fireEvent.click(screen.getByText('Data'));

      // Should virtualize rendering (only render visible cells)
      await waitFor(() => {
        const cells = container.querySelectorAll('[data-testid^="excel-cell-"]');
        // Should only render visible cells, not all 1000x50
        expect(cells.length).toBeLessThan(1000);
      });
    });
  });
});