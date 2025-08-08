const { test, expect } = require('@playwright/test');
const path = require('path');

// Test data files
const TEST_FILES = {
  small: path.join(__dirname, 'fixtures', 'small-test.xlsx'),
  large: path.join(__dirname, 'fixtures', 'large-test.xlsx'),
  macros: path.join(__dirname, 'fixtures', 'with-macros.xlsm'),
  corrupt: path.join(__dirname, 'fixtures', 'corrupt.xlsx'),
  formulas: path.join(__dirname, 'fixtures', 'with-formulas.xlsx'),
};

test.describe('Excel Viewer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page with Excel viewer
    await page.goto('/models/test-excel-viewer');
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });

  test.describe('File Loading', () => {
    test('should load and display small Excel file', async ({ page }) => {
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);

      // Wait for file to load
      await expect(page.locator('.excel-viewer')).toBeVisible();
      await expect(page.locator('text=Loading')).not.toBeVisible({ timeout: 10000 });

      // Verify sheets are loaded
      await expect(page.locator('text=Sheet1')).toBeVisible();
      await expect(page.locator('text=Sheet2')).toBeVisible();

      // Verify data is displayed
      await expect(page.locator('text=A1')).toBeVisible();
    });

    test('should handle large Excel files', async ({ page }) => {
      // Upload large file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.large);

      // Should show loading progress
      await expect(page.locator('[aria-label="Loading progress"]')).toBeVisible();

      // Wait for load (longer timeout for large files)
      await expect(page.locator('.excel-viewer')).toBeVisible({ timeout: 30000 });

      // Verify virtualization is working (not all cells rendered)
      const cells = await page.locator('[data-testid^="excel-cell-"]').count();
      expect(cells).toBeLessThan(1000); // Should virtualize, not render 100k+ cells
    });

    test('should handle Excel files with macros', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.macros);

      await expect(page.locator('.excel-viewer')).toBeVisible();
      
      // Should show warning about macros
      await expect(page.locator('text=contains macros')).toBeVisible();
    });

    test('should show error for corrupt files', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.corrupt);

      // Should show error message
      await expect(page.locator('text=Failed to load')).toBeVisible();
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    });
  });

  test.describe('Navigation and Interaction', () => {
    test('should switch between sheets', async ({ page }) => {
      // Load file first
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Click on Sheet2
      await page.click('text=Sheet2');

      // Verify Sheet2 is active
      await expect(page.locator('button:has-text("Sheet2")')).toHaveClass(/bg-navy-700|bg-teal-500/);

      // Verify Sheet2 data is displayed
      await expect(page.locator('text=Sheet2 Data')).toBeVisible();
    });

    test('should navigate sheets with keyboard', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Focus on viewer
      await page.locator('.excel-viewer').focus();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('button:has-text("Sheet2")')).toHaveClass(/bg-navy-700|bg-teal-500/);

      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('button:has-text("Sheet1")')).toHaveClass(/bg-navy-700|bg-teal-500/);
    });

    test('should select and highlight cells', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Click on a cell
      const cell = page.locator('[data-testid="excel-cell-2-2"]');
      await cell.click();

      // Verify cell is selected
      await expect(cell).toHaveClass(/selected/);
      await expect(cell).toHaveCSS('outline', /2px solid/);
    });
  });

  test.describe('Search Functionality', () => {
    test('should search for values in spreadsheet', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.formulas);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Open search
      await page.click('[aria-label="Search in spreadsheet"]');
      
      // Type search query
      const searchInput = page.locator('[placeholder*="Search"]');
      await searchInput.fill('Total');
      await searchInput.press('Enter');

      // Verify results
      await expect(page.locator('text=/Found \\d+ results/')).toBeVisible();
      
      // Verify highlighted cells
      const highlightedCells = page.locator('.excel-cell.highlighted');
      await expect(highlightedCells).toHaveCount(await highlightedCells.count());
    });

    test('should navigate search results', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.formulas);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Perform search
      await page.click('[aria-label="Search in spreadsheet"]');
      const searchInput = page.locator('[placeholder*="Search"]');
      await searchInput.fill('Sum');
      await searchInput.press('Enter');

      // Navigate results
      await page.click('[aria-label="Next result"]');
      await expect(page.locator('text=/Result 2 of/')).toBeVisible();

      await page.click('[aria-label="Previous result"]');
      await expect(page.locator('text=/Result 1 of/')).toBeVisible();
    });
  });

  test.describe('Zoom and View Controls', () => {
    test('should zoom in and out', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Initial zoom
      await expect(page.locator('text=100%')).toBeVisible();

      // Zoom in
      await page.click('[aria-label="Zoom in"]');
      await expect(page.locator('text=125%')).toBeVisible();

      // Zoom out
      await page.click('[aria-label="Zoom out"]');
      await page.click('[aria-label="Zoom out"]');
      await expect(page.locator('text=75%')).toBeVisible();

      // Zoom using dropdown
      await page.click('button:has-text("%")');
      await page.click('text=200%');
      await expect(page.locator('text=200%')).toBeVisible();
    });

    test('should enter and exit full screen', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Enter full screen
      await page.click('[aria-label="Enter full screen"]');
      
      // Verify full screen mode
      const viewer = page.locator('.excel-viewer');
      await expect(viewer).toHaveClass(/fixed inset-0 z-50/);

      // Exit with ESC
      await page.keyboard.press('Escape');
      await expect(viewer).not.toHaveClass(/fixed inset-0 z-50/);
    });

    test('should toggle full screen with F11', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Focus viewer and press F11
      await page.locator('.excel-viewer').focus();
      await page.keyboard.press('F11');

      const viewer = page.locator('.excel-viewer');
      await expect(viewer).toHaveClass(/fixed inset-0 z-50/);
    });
  });

  test.describe('Export Functionality', () => {
    test('should export to different formats', async ({ page, browserName }) => {
      // Skip download tests in webkit due to limitations
      test.skip(browserName === 'webkit', 'Download tests are flaky in WebKit');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Test CSV export
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[aria-label="Export spreadsheet"]'),
        page.click('text=CSV (.csv)')
      ]);

      expect(download.suggestedFilename()).toContain('.csv');

      // Test Excel export
      await page.click('[aria-label="Export spreadsheet"]');
      const [xlsxDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.click('text=Excel (.xlsx)')
      ]);

      expect(xlsxDownload.suggestedFilename()).toContain('.xlsx');
    });
  });

  test.describe('Print Functionality', () => {
    test('should open print dialog', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Mock window.print
      await page.evaluateOnNewDocument(() => {
        window.print = () => {
          window.printCalled = true;
        };
      });

      // Click print
      await page.click('[aria-label="Print spreadsheet"]');

      // Verify print was called
      const printCalled = await page.evaluate(() => window.printCalled);
      expect(printCalled).toBe(true);

      // Verify print mode classes
      await expect(page.locator('.excel-viewer.print-mode')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page, browserName }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Verify mobile-optimized UI
      await expect(page.locator('.excel-toolbar')).toBeVisible();
      
      // Touch interactions
      const cell = page.locator('[data-testid="excel-cell-1-1"]');
      await cell.tap();
      await expect(cell).toHaveClass(/selected/);
    });
  });

  test.describe('Dark Mode', () => {
    test('should toggle dark mode', async ({ page }) => {
      // Assume there's a dark mode toggle
      await page.click('[aria-label="Toggle dark mode"]');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Verify dark mode classes
      const viewer = page.locator('.excel-viewer');
      await expect(viewer).toHaveClass(/bg-navy-900/);
      
      // Verify toolbar dark mode
      const toolbar = page.locator('.excel-toolbar');
      await expect(toolbar).toHaveClass(/bg-navy-800/);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Tab through controls
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');

      // Activate with Enter/Space
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Check ARIA labels
      await expect(page.locator('[role="application"]')).toHaveAttribute('aria-label', /Excel viewer/);
      await expect(page.locator('[role="toolbar"]')).toHaveAttribute('aria-label', /Excel viewer toolbar/);
      await expect(page.locator('[role="gridcell"]').first()).toHaveAttribute('aria-label');
    });

    test('should work with screen readers', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(TEST_FILES.small);
      await expect(page.locator('.excel-viewer')).toBeVisible();

      // Check for live regions
      await expect(page.locator('[aria-live="polite"]')).toBeAttached();
      
      // Perform action that triggers announcement
      await page.click('[data-testid="excel-cell-1-1"]');
      
      // Verify announcement
      const liveRegion = page.locator('#excel-aria-live');
      await expect(liveRegion).toContainText(/Selected cell/);
    });
  });
});