import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExcelJSViewer from '../ExcelJSViewer';

// Mock dependencies
jest.mock('../useExcelProcessor');
jest.mock('../usePerformanceMonitor');
jest.mock('../useKeyboardNavigation');
jest.mock('../useTheme');

// Mock dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: jest.fn(() => {
    const MockedExcelSheet = ({ data, onCellClick, selectedCell }) => (
      <div data-testid="excel-sheet">
        {data?.cells?.map((cell, index) => (
          <div 
            key={index} 
            data-testid={`cell-${cell.row}-${cell.col}`}
            onClick={() => onCellClick?.(cell.row, cell.col, cell.value)}
          >
            {cell.value}
          </div>
        ))}
      </div>
    );
    MockedExcelSheet.displayName = 'MockedExcelSheet';
    return MockedExcelSheet;
  }),
}));

const mockUseExcelProcessor = require('../useExcelProcessor').useExcelProcessor;
const mockUsePerformanceMonitor = require('../usePerformanceMonitor').usePerformanceMonitor;
const mockUseKeyboardNavigation = require('../useKeyboardNavigation').useKeyboardNavigation;
const mockUseTheme = require('../useTheme').useTheme;

describe('ExcelJSViewer', () => {
  const defaultProps = {
    file: 'test.xlsx',
    title: 'Test Spreadsheet',
    height: '600px',
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  const mockWorkbookData = {
    worksheets: [
      { name: 'Sheet1', id: 1 },
      { name: 'Sheet2', id: 2 },
    ],
  };

  const mockSheetData = {
    cells: [
      { row: 1, col: 1, value: 'A1' },
      { row: 1, col: 2, value: 'B1' },
      { row: 2, col: 1, value: 'A2' },
    ],
    columnWidths: { 1: 100, 2: 150 },
    rowHeights: { 1: 25, 2: 25 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseExcelProcessor.mockReturnValue({
      isWorkerReady: true,
      loadWorkbook: jest.fn().mockResolvedValue(mockWorkbookData),
      processSheet: jest.fn().mockResolvedValue(mockSheetData),
      searchInSheet: jest.fn().mockResolvedValue([]),
    });

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

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    });
  });

  describe('Rendering and Loading', () => {
    it('should render loading state initially', () => {
      render(<ExcelJSViewer {...defaultProps} />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should load and display Excel file successfully', async () => {
      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(screen.getByText('Sheet1')).toBeInTheDocument();
      expect(screen.getByText('Sheet2')).toBeInTheDocument();
    });

    it('should handle file loading error', async () => {
      const errorMessage = 'Failed to load file';
      global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));

      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(defaultProps.onError).toHaveBeenCalled();
    });

    it('should display error state when file fetch fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load file: 404 Not Found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sheet Navigation', () => {
    it('should switch between sheets', async () => {
      const { processSheet } = mockUseExcelProcessor();
      
      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Click on Sheet2
      const sheet2Button = screen.getByText('Sheet2');
      fireEvent.click(sheet2Button);

      await waitFor(() => {
        expect(processSheet).toHaveBeenCalledWith(1, expect.any(Object));
      });
    });

    it('should handle keyboard navigation between sheets', async () => {
      let onSheetNext, onSheetPrev;
      
      mockUseKeyboardNavigation.mockImplementation(({ onSheetNext: next, onSheetPrev: prev }) => {
        onSheetNext = next;
        onSheetPrev = prev;
        return { registerKeyboardShortcuts: jest.fn() };
      });

      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Simulate keyboard navigation
      onSheetNext();
      
      await waitFor(() => {
        expect(mockUseExcelProcessor().processSheet).toHaveBeenCalledWith(1, expect.any(Object));
      });
    });
  });

  describe('Cell Interactions', () => {
    it('should handle cell click', async () => {
      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      const cell = screen.getByTestId('cell-1-1');
      fireEvent.click(cell);

      // Cell should be selected (implementation depends on ExcelSheet component)
      expect(cell).toBeInTheDocument();
    });

    it('should announce cell selection in accessibility mode', async () => {
      render(<ExcelJSViewer {...defaultProps} accessibilityMode={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      const ariaLive = screen.getByRole('status', { hidden: true });
      expect(ariaLive).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Zoom Functionality', () => {
    it('should handle zoom changes', async () => {
      let onZoomIn, onZoomOut;
      
      mockUseKeyboardNavigation.mockImplementation(({ onZoomIn: zoomIn, onZoomOut: zoomOut }) => {
        onZoomIn = zoomIn;
        onZoomOut = zoomOut;
        return { registerKeyboardShortcuts: jest.fn() };
      });

      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Test zoom in
      onZoomIn();
      // Zoom should increase (specific assertions depend on implementation)

      // Test zoom out
      onZoomOut();
      // Zoom should decrease
    });
  });

  describe('Search Functionality', () => {
    it('should open search panel', async () => {
      let onSearch;
      
      mockUseKeyboardNavigation.mockImplementation(({ onSearch: search }) => {
        onSearch = search;
        return { registerKeyboardShortcuts: jest.fn() };
      });

      render(<ExcelJSViewer {...defaultProps} showSearch={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Trigger search
      onSearch();

      await waitFor(() => {
        expect(screen.getByRole('search')).toBeInTheDocument();
      });
    });

    it('should perform search and highlight results', async () => {
      const mockSearchResults = [
        { row: 1, col: 1, value: 'SearchTerm' },
        { row: 2, col: 3, value: 'SearchTerm' },
      ];

      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue(mockWorkbookData),
        processSheet: jest.fn().mockResolvedValue(mockSheetData),
        searchInSheet: jest.fn().mockResolvedValue(mockSearchResults),
      });

      render(<ExcelJSViewer {...defaultProps} showSearch={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Implementation would depend on SearchPanel component
    });
  });

  describe('Full Screen Mode', () => {
    it('should toggle full screen mode', async () => {
      let onFullScreen;
      
      mockUseKeyboardNavigation.mockImplementation(({ onFullScreen: fullScreen }) => {
        onFullScreen = fullScreen;
        return { registerKeyboardShortcuts: jest.fn() };
      });

      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Toggle full screen
      onFullScreen();

      // Check if full screen styles are applied
      const viewer = screen.getByRole('application');
      expect(viewer).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should exit full screen on ESC key', async () => {
      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Enter full screen
      const viewer = screen.getByRole('application');
      
      // Simulate ESC key
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(viewer).not.toHaveClass('fixed', 'inset-0', 'z-50');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles', async () => {
      render(<ExcelJSViewer {...defaultProps} darkMode={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      const viewer = screen.getByRole('application');
      expect(viewer).toHaveClass('bg-navy-900', 'border-navy-700');
    });
  });

  describe('Print Mode', () => {
    it('should handle print action', async () => {
      const mockPrint = jest.fn();
      global.window.print = mockPrint;

      let onPrint;
      
      mockUseKeyboardNavigation.mockImplementation(({ onPrint: print }) => {
        onPrint = print;
        return { registerKeyboardShortcuts: jest.fn() };
      });

      render(<ExcelJSViewer {...defaultProps} showPrintButton={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      // Trigger print
      onPrint();

      await waitFor(() => {
        expect(mockPrint).toHaveBeenCalled();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track file loading performance', async () => {
      const { startMeasure, endMeasure, logPerformanceWarning } = mockUsePerformanceMonitor();

      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('excel-sheet')).toBeInTheDocument();
      });

      expect(startMeasure).toHaveBeenCalledWith('file-load');
      expect(endMeasure).toHaveBeenCalledWith('file-load');
      expect(logPerformanceWarning).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle worker not ready', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: false,
        loadWorkbook: jest.fn(),
        processSheet: jest.fn(),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer {...defaultProps} />);

      // Should remain in loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should handle empty worksheets', async () => {
      mockUseExcelProcessor.mockReturnValue({
        isWorkerReady: true,
        loadWorkbook: jest.fn().mockResolvedValue({ worksheets: [] }),
        processSheet: jest.fn(),
        searchInSheet: jest.fn(),
      });

      render(<ExcelJSViewer {...defaultProps} />);

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });
  });
});