import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExcelToolbar from '../ExcelToolbar';
import { motion, AnimatePresence } from 'framer-motion';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('ExcelToolbar', () => {
  const defaultProps = {
    sheets: [
      { name: 'Sheet1' },
      { name: 'Sheet2' },
      { name: 'Data' },
    ],
    activeSheet: 0,
    onSheetChange: jest.fn(),
    onFullScreenToggle: jest.fn(),
    isFullScreen: false,
    onZoomChange: jest.fn(),
    zoom: 100,
    onExport: jest.fn(),
    onPrint: jest.fn(),
    onSearch: jest.fn(),
    fileName: 'TestSpreadsheet.xlsx',
    darkMode: false,
    isPrintMode: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render toolbar with all elements', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByText('Sheets:')).toBeInTheDocument();
      expect(screen.getByText('TestSpreadsheet.xlsx')).toBeInTheDocument();
      expect(screen.getByText('3 sheets')).toBeInTheDocument();
    });

    it('should not render in print mode', () => {
      render(<ExcelToolbar {...defaultProps} isPrintMode={true} />);
      
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('should apply dark mode styles', () => {
      render(<ExcelToolbar {...defaultProps} darkMode={true} />);
      
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass('bg-navy-800', 'border-navy-700');
    });
  });

  describe('Sheet Navigation', () => {
    it('should render all sheet tabs', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      expect(screen.getByText('Sheet1')).toBeInTheDocument();
      expect(screen.getByText('Sheet2')).toBeInTheDocument();
      expect(screen.getByText('Data')).toBeInTheDocument();
    });

    it('should highlight active sheet', () => {
      render(<ExcelToolbar {...defaultProps} activeSheet={1} />);
      
      const activeTab = screen.getByText('Sheet2');
      expect(activeTab).toHaveClass('bg-navy-700', 'text-white');
    });

    it('should handle sheet changes', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const sheet2Button = screen.getByText('Sheet2');
      fireEvent.click(sheet2Button);
      
      expect(defaultProps.onSheetChange).toHaveBeenCalledWith(1);
    });

    it('should show navigation arrows for many sheets', () => {
      const manySheets = Array.from({ length: 10 }, (_, i) => ({ 
        name: `Sheet${i + 1}` 
      }));
      
      render(<ExcelToolbar {...defaultProps} sheets={manySheets} />);
      
      expect(screen.getByLabelText('Previous sheet')).toBeInTheDocument();
      expect(screen.getByLabelText('Next sheet')).toBeInTheDocument();
    });

    it('should navigate sheets with arrows', () => {
      const manySheets = Array.from({ length: 10 }, (_, i) => ({ 
        name: `Sheet${i + 1}` 
      }));
      
      render(<ExcelToolbar {...defaultProps} sheets={manySheets} activeSheet={5} />);
      
      const prevButton = screen.getByLabelText('Previous sheet');
      const nextButton = screen.getByLabelText('Next sheet');
      
      fireEvent.click(prevButton);
      expect(defaultProps.onSheetChange).toHaveBeenCalledWith(4);
      
      fireEvent.click(nextButton);
      expect(defaultProps.onSheetChange).toHaveBeenCalledWith(6);
    });

    it('should disable navigation at boundaries', () => {
      render(<ExcelToolbar {...defaultProps} sheets={defaultProps.sheets} activeSheet={0} />);
      
      const prevButton = screen.getByLabelText('Previous sheet');
      expect(prevButton).toBeDisabled();
      
      const { rerender } = render(
        <ExcelToolbar {...defaultProps} activeSheet={2} />
      );
      
      const nextButton = screen.getByLabelText('Next sheet');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Zoom Controls', () => {
    it('should render zoom controls', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    });

    it('should handle zoom in/out', () => {
      render(<ExcelToolbar {...defaultProps} zoom={100} />);
      
      const zoomInButton = screen.getByLabelText('Zoom in');
      const zoomOutButton = screen.getByLabelText('Zoom out');
      
      fireEvent.click(zoomInButton);
      expect(defaultProps.onZoomChange).toHaveBeenCalledWith(125);
      
      fireEvent.click(zoomOutButton);
      expect(defaultProps.onZoomChange).toHaveBeenCalledWith(75);
    });

    it('should show zoom dropdown menu', async () => {
      const user = userEvent.setup();
      render(<ExcelToolbar {...defaultProps} />);
      
      const zoomButton = screen.getByText('100%');
      await user.click(zoomButton);
      
      // Check zoom levels
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('125%')).toBeInTheDocument();
      expect(screen.getByText('150%')).toBeInTheDocument();
      expect(screen.getByText('200%')).toBeInTheDocument();
    });

    it('should select zoom level from dropdown', async () => {
      const user = userEvent.setup();
      render(<ExcelToolbar {...defaultProps} />);
      
      const zoomButton = screen.getByText('100%');
      await user.click(zoomButton);
      
      const zoom150 = screen.getByText('150%');
      await user.click(zoom150);
      
      expect(defaultProps.onZoomChange).toHaveBeenCalledWith(150);
    });
  });

  describe('Export Functionality', () => {
    it('should show export button', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const exportButton = screen.getByLabelText('Export spreadsheet');
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toHaveTextContent('Export');
    });

    it('should show export dropdown menu', async () => {
      const user = userEvent.setup();
      render(<ExcelToolbar {...defaultProps} />);
      
      const exportButton = screen.getByLabelText('Export spreadsheet');
      await user.click(exportButton);
      
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
      expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
      expect(screen.getByText('PDF (.pdf)')).toBeInTheDocument();
      expect(screen.getByText('JSON (.json)')).toBeInTheDocument();
    });

    it('should handle export format selection', async () => {
      const user = userEvent.setup();
      render(<ExcelToolbar {...defaultProps} />);
      
      const exportButton = screen.getByLabelText('Export spreadsheet');
      await user.click(exportButton);
      
      const csvOption = screen.getByText('CSV (.csv)');
      await user.click(csvOption);
      
      expect(defaultProps.onExport).toHaveBeenCalledWith('csv');
    });
  });

  describe('Action Buttons', () => {
    it('should render search button when enabled', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const searchButton = screen.getByLabelText('Search in spreadsheet');
      expect(searchButton).toBeInTheDocument();
    });

    it('should not render search button when disabled', () => {
      render(<ExcelToolbar {...defaultProps} onSearch={null} />);
      
      expect(screen.queryByLabelText('Search in spreadsheet')).not.toBeInTheDocument();
    });

    it('should handle search button click', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const searchButton = screen.getByLabelText('Search in spreadsheet');
      fireEvent.click(searchButton);
      
      expect(defaultProps.onSearch).toHaveBeenCalled();
    });

    it('should render print button when enabled', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const printButton = screen.getByLabelText('Print spreadsheet');
      expect(printButton).toBeInTheDocument();
    });

    it('should not render print button when disabled', () => {
      render(<ExcelToolbar {...defaultProps} onPrint={null} />);
      
      expect(screen.queryByLabelText('Print spreadsheet')).not.toBeInTheDocument();
    });

    it('should handle print button click', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const printButton = screen.getByLabelText('Print spreadsheet');
      fireEvent.click(printButton);
      
      expect(defaultProps.onPrint).toHaveBeenCalled();
    });

    it('should handle full screen toggle', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const fullScreenButton = screen.getByLabelText('Enter full screen');
      fireEvent.click(fullScreenButton);
      
      expect(defaultProps.onFullScreenToggle).toHaveBeenCalled();
    });

    it('should show exit full screen button when in full screen', () => {
      render(<ExcelToolbar {...defaultProps} isFullScreen={true} />);
      
      const exitButton = screen.getByLabelText('Exit full screen');
      expect(exitButton).toBeInTheDocument();
    });
  });

  describe('File Information', () => {
    it('should display file name', () => {
      render(<ExcelToolbar {...defaultProps} fileName="Financial Model.xlsx" />);
      
      expect(screen.getByText('Financial Model.xlsx')).toBeInTheDocument();
    });

    it('should display sheet count', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      expect(screen.getByText('3 sheets')).toBeInTheDocument();
    });

    it('should handle singular sheet count', () => {
      render(<ExcelToolbar {...defaultProps} sheets={[{ name: 'Sheet1' }]} />);
      
      expect(screen.getByText('1 sheet')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should show keyboard shortcuts button', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const helpButton = screen.getByLabelText('Show keyboard shortcuts');
      expect(helpButton).toBeInTheDocument();
    });

    it('should display keyboard shortcut hints in tooltips', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      expect(screen.getByTitle('Zoom out (Ctrl+-)')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom in (Ctrl++)')).toBeInTheDocument();
      expect(screen.getByTitle('Search (Ctrl+F)')).toBeInTheDocument();
      expect(screen.getByTitle('Print (Ctrl+P)')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle many sheets gracefully', () => {
      const manySheets = Array.from({ length: 20 }, (_, i) => ({ 
        name: `VeryLongSheetName${i + 1}` 
      }));
      
      render(<ExcelToolbar {...defaultProps} sheets={manySheets} />);
      
      // Should still render without overflow
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('should truncate long file names', () => {
      const longFileName = 'A'.repeat(100) + '.xlsx';
      
      render(<ExcelToolbar {...defaultProps} fileName={longFileName} />);
      
      const fileName = screen.getByText(longFileName);
      expect(fileName).toHaveClass('truncate');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Excel viewer toolbar');
    });

    it('should indicate current sheet with aria-current', () => {
      render(<ExcelToolbar {...defaultProps} />);
      
      const activeSheet = screen.getByText('Sheet1');
      expect(activeSheet).toHaveAttribute('aria-current', 'true');
      
      const inactiveSheet = screen.getByText('Sheet2');
      expect(inactiveSheet).toHaveAttribute('aria-current', 'false');
    });

    it('should have aria-expanded on dropdown buttons', async () => {
      const user = userEvent.setup();
      render(<ExcelToolbar {...defaultProps} />);
      
      const exportButton = screen.getByLabelText('Export spreadsheet');
      expect(exportButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(exportButton);
      expect(exportButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});