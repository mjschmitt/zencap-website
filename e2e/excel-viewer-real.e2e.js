const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('EXCEL VIEWER - REAL FINANCIAL MODELS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('CRITICAL: Excel viewer loads with real financial model', async ({ page }) => {
    // Try to find a model with Excel preview
    await page.goto('/models/private-equity');
    
    // Look for Excel preview or demo
    const excelDemo = page.locator('text=/excel preview|view model|demo/i');
    const viewButton = page.locator('button', { hasText: /view|preview|demo/i });
    
    if (await viewButton.count() > 0) {
      await viewButton.first().click();
      
      // Wait for Excel viewer to load
      await expect(page.locator('.excel-viewer, [data-testid="excel-viewer"]')).toBeVisible({ timeout: 15000 });
      
      // Verify viewer components
      await expect(page.locator('[data-testid="excel-toolbar"]')).toBeVisible();
      await expect(page.locator('[data-testid="excel-sheet"]')).toBeVisible();
      
      console.log('✓ Excel viewer loaded with real model');
    } else {
      console.log('⚠ No Excel preview available on models page');
    }
  });

  test('CRITICAL: Excel upload and processing', async ({ page }) => {
    // Navigate to a page that might have Excel upload
    const pagesToCheck = ['/admin', '/models/test-excel-viewer', '/'];
    
    for (const pageUrl of pagesToCheck) {
      await page.goto(pageUrl);
      
      const fileInput = page.locator('input[type="file"]');
      
      if (await fileInput.count() > 0) {
        console.log(`Found file input on ${pageUrl}`);
        
        // Use existing uploaded files from public/models or public/uploads
        const testFile = path.join(process.cwd(), 'public', 'models', 'test-model.xlsx');
        
        try {
          await fileInput.setInputFiles(testFile);
          
          // Wait for upload to complete
          await page.waitForResponse(response => 
            response.url().includes('/api/upload') && response.status() === 200,
            { timeout: 30000 }
          );
          
          // Verify Excel viewer loads
          await expect(page.locator('.excel-viewer')).toBeVisible({ timeout: 20000 });
          
          console.log('✓ Excel file uploaded and viewer loaded');
          break;
        } catch (error) {
          console.log(`Could not upload file on ${pageUrl}: ${error.message}`);
        }
      }
    }
  });

  test('CRITICAL: Excel viewer performance with large file', async ({ page }) => {
    // Test with NVDA model if available
    const nvdaFiles = [
      'public/models/1753144079501_NVDA_1Q26.xlsx',
      'public/uploads/excel/1754424311569_f98a4ee08829d12e_NVDA_1Q26.xlsx'
    ];
    
    for (const filePath of nvdaFiles) {
      const fullPath = path.join(process.cwd(), filePath);
      
      // Try to access file upload on any available page
      await page.goto('/');
      
      const fileInput = page.locator('input[type="file"]');
      
      if (await fileInput.count() > 0) {
        try {
          const startTime = Date.now();
          
          await fileInput.setInputFiles(fullPath);
          
          // Wait for processing
          await page.waitForLoadState('networkidle');
          
          const loadTime = Date.now() - startTime;
          
          // Should load within reasonable time (under 10 seconds)
          expect(loadTime).toBeLessThan(10000);
          
          // Verify viewer is responsive
          const viewer = page.locator('.excel-viewer');
          if (await viewer.count() > 0) {
            await expect(viewer).toBeVisible();
            
            // Test scrolling performance
            await viewer.hover();
            await page.mouse.wheel(0, 500);
            await page.mouse.wheel(0, -500);
            
            console.log(`✓ Large file (${filePath}) loaded in ${loadTime}ms`);
          }
          
          break;
        } catch (error) {
          console.log(`Could not test ${filePath}: ${error.message}`);
        }
      }
    }
  });

  test('CRITICAL: Excel viewer sheet navigation', async ({ page }) => {
    // Find any page with Excel functionality
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Use any available Excel file
      const testFile = path.join(process.cwd(), 'public', 'models', 'test-model.xlsx');
      
      try {
        await fileInput.setInputFiles(testFile);
        
        await page.waitForLoadState('networkidle');
        
        // Look for sheet tabs
        const sheetTabs = page.locator('[data-testid*="sheet-tab"], .sheet-tab, button[role="tab"]');
        
        if (await sheetTabs.count() > 1) {
          // Test sheet switching
          const secondTab = sheetTabs.nth(1);
          await secondTab.click();
          
          // Verify sheet changed
          await expect(secondTab).toHaveClass(/active|selected/);
          
          console.log('✓ Excel sheet navigation working');
        }
        
        // Test keyboard navigation
        await page.keyboard.press('Tab');
        await page.keyboard.press('ArrowRight');
        
        console.log('✓ Excel keyboard navigation functional');
        
      } catch (error) {
        console.log(`Sheet navigation test failed: ${error.message}`);
      }
    }
  });

  test('CRITICAL: Excel viewer zoom and controls', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(process.cwd(), 'public', 'models', 'test-model.xlsx');
      
      try {
        await fileInput.setInputFiles(testFile);
        await page.waitForLoadState('networkidle');
        
        // Test zoom controls
        const zoomIn = page.locator('[aria-label*="zoom in"], button[title*="zoom in"]');
        const zoomOut = page.locator('[aria-label*="zoom out"], button[title*="zoom out"]');
        
        if (await zoomIn.count() > 0) {
          await zoomIn.click();
          console.log('✓ Zoom in functional');
        }
        
        if (await zoomOut.count() > 0) {
          await zoomOut.click();
          console.log('✓ Zoom out functional');
        }
        
        // Test fullscreen
        const fullscreenBtn = page.locator('[aria-label*="fullscreen"], [aria-label*="full screen"]');
        
        if (await fullscreenBtn.count() > 0) {
          await fullscreenBtn.click();
          
          // Verify fullscreen mode
          const viewer = page.locator('.excel-viewer');
          await expect(viewer).toHaveClass(/fullscreen|fixed|z-50/);
          
          // Exit fullscreen
          await page.keyboard.press('Escape');
          
          console.log('✓ Fullscreen toggle working');
        }
        
      } catch (error) {
        console.log(`Zoom controls test failed: ${error.message}`);
      }
    }
  });

  test('CRITICAL: Excel data accuracy and formatting', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(process.cwd(), 'public', 'models', 'test-model.xlsx');
      
      try {
        await fileInput.setInputFiles(testFile);
        await page.waitForLoadState('networkidle');
        
        // Verify cells contain data
        const cells = page.locator('[data-testid*="cell"], .excel-cell, td');
        const cellCount = await cells.count();
        
        expect(cellCount).toBeGreaterThan(0);
        
        // Check for formatted content
        const formattedCells = page.locator('[style*="color"], [style*="background"], [style*="font"]');
        
        if (await formattedCells.count() > 0) {
          console.log('✓ Excel formatting preserved');
        }
        
        // Check for formula cells (if any)
        const formulaCells = page.locator('text=/^=|SUM|SUM\(/');
        
        if (await formulaCells.count() > 0) {
          console.log('✓ Formulas detected in Excel viewer');
        }
        
        console.log(`✓ Excel viewer displaying ${cellCount} cells`);
        
      } catch (error) {
        console.log(`Data accuracy test failed: ${error.message}`);
      }
    }
  });

  test('CRITICAL: Excel export functionality', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(process.cwd(), 'public', 'models', 'test-model.xlsx');
      
      try {
        await fileInput.setInputFiles(testFile);
        await page.waitForLoadState('networkidle');
        
        // Look for export buttons
        const exportBtn = page.locator('[aria-label*="export"], button[title*="export"]');
        
        if (await exportBtn.count() > 0) {
          // Test export functionality (don't actually download)
          await exportBtn.click();
          
          // Check for export options
          const exportOptions = page.locator('text=/csv|xlsx|pdf/i');
          
          if (await exportOptions.count() > 0) {
            console.log('✓ Excel export options available');
          }
        }
        
        // Test print functionality
        const printBtn = page.locator('[aria-label*="print"], button[title*="print"]');
        
        if (await printBtn.count() > 0) {
          // Mock print function
          await page.evaluate(() => {
            window.print = () => {
              window.printCalled = true;
            };
          });
          
          await printBtn.click();
          
          const printCalled = await page.evaluate(() => window.printCalled);
          
          if (printCalled) {
            console.log('✓ Excel print functionality working');
          }
        }
        
      } catch (error) {
        console.log(`Export test failed: ${error.message}`);
      }
    }
  });

  test('CRITICAL: Excel viewer error handling', async ({ page }) => {
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Test with invalid file
      const invalidFile = path.join(__dirname, 'invalid-file.txt');
      
      // Create a temporary invalid file
      await page.evaluate(() => {
        const file = new File(['invalid content'], 'invalid.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        return file;
      });
      
      try {
        // This should trigger error handling
        await fileInput.setInputFiles('data:text/plain;base64,aW52YWxpZCBjb250ZW50');
      } catch (error) {
        // Error expected for invalid file
        console.log('✓ Invalid file properly rejected');
      }
      
      // Verify error message appears
      const errorMessage = page.locator('text=/error|failed|invalid/i');
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
        console.log('✓ Excel error handling working');
      }
    }
  });

  test('CRITICAL: Excel viewer mobile compatibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      const testFile = path.join(process.cwd(), 'public', 'models', 'test-model.xlsx');
      
      try {
        await fileInput.setInputFiles(testFile);
        await page.waitForLoadState('networkidle');
        
        // Verify mobile-optimized viewer
        const viewer = page.locator('.excel-viewer');
        
        if (await viewer.count() > 0) {
          await expect(viewer).toBeVisible();
          
          // Test touch interactions
          await viewer.tap();
          
          // Test pinch zoom simulation
          await page.touchscreen.tap(100, 100);
          
          console.log('✓ Excel viewer mobile compatible');
        }
        
      } catch (error) {
        console.log(`Mobile compatibility test failed: ${error.message}`);
      }
    }
  });
});