#!/usr/bin/env node

/**
 * Performance Benchmarks for Excel Viewer
 * 
 * This script runs various performance tests on the Excel viewer component
 * to ensure it meets performance requirements.
 */

import { chromium } from 'playwright';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = process.env.BENCHMARK_URL || 'http://localhost:3001';
const ITERATIONS = 5;
const TEST_FILES = {
  small: path.join(__dirname, '../e2e/fixtures/small-10kb.xlsx'),
  medium: path.join(__dirname, '../e2e/fixtures/medium-1mb.xlsx'),
  large: path.join(__dirname, '../e2e/fixtures/large-10mb.xlsx'),
  xlarge: path.join(__dirname, '../e2e/fixtures/xlarge-50mb.xlsx'),
  complex: path.join(__dirname, '../e2e/fixtures/complex-formulas.xlsx'),
};

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  fileLoad: {
    small: 500,
    medium: 2000,
    large: 5000,
    xlarge: 10000,
  },
  sheetSwitch: 200,
  cellRender: 16, // 60fps
  search: 1000,
  scroll: 16, // 60fps
  zoom: 100,
  export: 3000,
};

class PerformanceBenchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: require('os').cpus().length,
        memory: require('os').totalmem(),
      },
      benchmarks: {},
    };
  }

  async setup() {
    console.log('🚀 Starting Excel Viewer Performance Benchmarks...\n');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage'],
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
  }

  async teardown() {
    await this.context.close();
    await this.browser.close();
  }

  async measurePerformance(name, fn, iterations = ITERATIONS) {
    const measurements = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      measurements.push(end - start);
    }

    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    const median = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

    return { avg, min, max, median, measurements };
  }

  async benchmarkFileLoading() {
    console.log('📊 Benchmarking file loading performance...');
    const results = {};

    for (const [size, filePath] of Object.entries(TEST_FILES)) {
      console.log(`  Testing ${size} file...`);
      
      const metrics = await this.measurePerformance(
        `fileLoad-${size}`,
        async () => {
          const page = await this.context.newPage();
          
          // Start performance trace
          await page.evaluateOnNewDocument(() => {
            window.performanceMarks = {};
            window.markPerformance = (name) => {
              window.performanceMarks[name] = performance.now();
            };
          });

          await page.goto(`${BASE_URL}/test/excel-viewer`);
          
          // Upload file and measure load time
          const fileInput = page.locator('input[type="file"]');
          await fileInput.setInputFiles(filePath);

          // Wait for load complete
          await page.waitForSelector('.excel-viewer:not(.loading)', { timeout: 30000 });

          // Get performance marks
          const marks = await page.evaluate(() => window.performanceMarks);
          
          await page.close();
          
          return marks;
        }
      );

      results[size] = {
        ...metrics,
        threshold: THRESHOLDS.fileLoad[size],
        passed: metrics.avg <= THRESHOLDS.fileLoad[size],
      };
    }

    this.results.benchmarks.fileLoading = results;
  }

  async benchmarkRendering() {
    console.log('\n🎨 Benchmarking rendering performance...');
    
    const page = await this.context.newPage();
    await page.goto(`${BASE_URL}/test/excel-viewer`);
    
    // Load a medium-sized file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.medium);
    await page.waitForSelector('.excel-viewer:not(.loading)');

    // Measure initial render
    const initialRender = await page.evaluate(() => {
      return new Promise(resolve => {
        const start = performance.now();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve(performance.now() - start);
          });
        });
      });
    });

    // Measure scroll performance
    const scrollMetrics = await this.measurePerformance(
      'scroll',
      async () => {
        await page.evaluate(() => {
          const grid = document.querySelector('[data-testid="variable-size-grid"]');
          grid.scrollTop += 100;
        });
        
        // Wait for scroll to complete
        await page.waitForTimeout(50);
      },
      20 // More iterations for scroll
    );

    // Measure cell selection
    const cellSelectMetrics = await this.measurePerformance(
      'cellSelect',
      async () => {
        const randomRow = Math.floor(Math.random() * 50) + 1;
        const randomCol = Math.floor(Math.random() * 10) + 1;
        await page.click(`[data-testid="excel-cell-${randomRow}-${randomCol}"]`);
      }
    );

    await page.close();

    this.results.benchmarks.rendering = {
      initialRender: {
        value: initialRender,
        threshold: 100,
        passed: initialRender <= 100,
      },
      scroll: {
        ...scrollMetrics,
        threshold: THRESHOLDS.scroll,
        passed: scrollMetrics.avg <= THRESHOLDS.scroll,
      },
      cellSelect: {
        ...cellSelectMetrics,
        threshold: 50,
        passed: cellSelectMetrics.avg <= 50,
      },
    };
  }

  async benchmarkOperations() {
    console.log('\n⚡ Benchmarking operations performance...');
    
    const page = await this.context.newPage();
    await page.goto(`${BASE_URL}/test/excel-viewer`);
    
    // Load file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.medium);
    await page.waitForSelector('.excel-viewer:not(.loading)');

    // Benchmark sheet switching
    const sheetSwitchMetrics = await this.measurePerformance(
      'sheetSwitch',
      async () => {
        await page.click('text=Sheet2');
        await page.waitForSelector('[data-testid="excel-sheet"]');
        await page.click('text=Sheet1');
        await page.waitForSelector('[data-testid="excel-sheet"]');
      }
    );

    // Benchmark search
    const searchMetrics = await this.measurePerformance(
      'search',
      async () => {
        await page.click('[aria-label="Search in spreadsheet"]');
        const searchInput = page.locator('[placeholder*="Search"]');
        await searchInput.fill('test');
        await searchInput.press('Enter');
        await page.waitForSelector('text=/Found \\d+ results/');
        await page.press('Escape'); // Close search
      },
      3 // Fewer iterations for search
    );

    // Benchmark zoom
    const zoomMetrics = await this.measurePerformance(
      'zoom',
      async () => {
        await page.click('[aria-label="Zoom in"]');
        await page.waitForSelector('text=125%');
        await page.click('[aria-label="Zoom out"]');
        await page.waitForSelector('text=100%');
      }
    );

    await page.close();

    this.results.benchmarks.operations = {
      sheetSwitch: {
        ...sheetSwitchMetrics,
        threshold: THRESHOLDS.sheetSwitch,
        passed: sheetSwitchMetrics.avg <= THRESHOLDS.sheetSwitch,
      },
      search: {
        ...searchMetrics,
        threshold: THRESHOLDS.search,
        passed: searchMetrics.avg <= THRESHOLDS.search,
      },
      zoom: {
        ...zoomMetrics,
        threshold: THRESHOLDS.zoom,
        passed: zoomMetrics.avg <= THRESHOLDS.zoom,
      },
    };
  }

  async benchmarkMemoryUsage() {
    console.log('\n💾 Benchmarking memory usage...');
    
    const page = await this.context.newPage();
    
    // Enable CDP for memory profiling
    const client = await page.context().newCDPSession(page);
    
    const getMemoryUsage = async () => {
      const metrics = await client.send('Performance.getMetrics');
      const jsHeapUsed = metrics.metrics.find(m => m.name === 'JSHeapUsedSize');
      return jsHeapUsed ? jsHeapUsed.value / 1024 / 1024 : 0; // Convert to MB
    };

    await page.goto(`${BASE_URL}/test/excel-viewer`);
    
    const memoryBaseline = await getMemoryUsage();
    
    // Load large file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILES.large);
    await page.waitForSelector('.excel-viewer:not(.loading)', { timeout: 30000 });
    
    const memoryAfterLoad = await getMemoryUsage();
    
    // Perform operations
    for (let i = 0; i < 5; i++) {
      await page.click('text=Sheet2');
      await page.waitForTimeout(100);
      await page.click('text=Sheet1');
      await page.waitForTimeout(100);
    }
    
    const memoryAfterOperations = await getMemoryUsage();
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });
    await page.waitForTimeout(1000);
    
    const memoryAfterGC = await getMemoryUsage();
    
    await page.close();

    this.results.benchmarks.memory = {
      baseline: memoryBaseline,
      afterLoad: memoryAfterLoad,
      afterOperations: memoryAfterOperations,
      afterGC: memoryAfterGC,
      increase: memoryAfterLoad - memoryBaseline,
      leak: memoryAfterGC - memoryAfterLoad,
      passed: (memoryAfterGC - memoryBaseline) < 200, // Less than 200MB increase
    };
  }

  generateReport() {
    console.log('\n📈 Performance Benchmark Results\n');
    console.log('================================\n');

    let allPassed = true;

    // File Loading Results
    console.log('📁 File Loading Performance:');
    for (const [size, metrics] of Object.entries(this.results.benchmarks.fileLoading)) {
      const status = metrics.passed ? '✅' : '❌';
      console.log(`  ${status} ${size}: ${metrics.avg.toFixed(2)}ms (threshold: ${metrics.threshold}ms)`);
      if (!metrics.passed) allPassed = false;
    }

    // Rendering Results
    console.log('\n🎨 Rendering Performance:');
    for (const [operation, metrics] of Object.entries(this.results.benchmarks.rendering)) {
      const status = metrics.passed ? '✅' : '❌';
      const value = metrics.avg || metrics.value;
      console.log(`  ${status} ${operation}: ${value.toFixed(2)}ms (threshold: ${metrics.threshold}ms)`);
      if (!metrics.passed) allPassed = false;
    }

    // Operations Results
    console.log('\n⚡ Operations Performance:');
    for (const [operation, metrics] of Object.entries(this.results.benchmarks.operations)) {
      const status = metrics.passed ? '✅' : '❌';
      console.log(`  ${status} ${operation}: ${metrics.avg.toFixed(2)}ms (threshold: ${metrics.threshold}ms)`);
      if (!metrics.passed) allPassed = false;
    }

    // Memory Results
    console.log('\n💾 Memory Usage:');
    const memory = this.results.benchmarks.memory;
    const status = memory.passed ? '✅' : '❌';
    console.log(`  ${status} Memory increase: ${memory.increase.toFixed(2)}MB`);
    console.log(`  Memory after GC: ${memory.afterGC.toFixed(2)}MB`);
    console.log(`  Potential leak: ${memory.leak.toFixed(2)}MB`);
    if (!memory.passed) allPassed = false;

    console.log('\n================================');
    console.log(`\nOverall Result: ${allPassed ? '✅ PASS' : '❌ FAIL'}\n`);

    return allPassed;
  }

  async saveResults() {
    const resultsPath = path.join(__dirname, '../test-results/performance-benchmarks.json');
    await fs.mkdir(path.dirname(resultsPath), { recursive: true });
    await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed results saved to: ${resultsPath}`);
  }

  async run() {
    try {
      await this.setup();
      
      await this.benchmarkFileLoading();
      await this.benchmarkRendering();
      await this.benchmarkOperations();
      await this.benchmarkMemoryUsage();
      
      const passed = this.generateReport();
      await this.saveResults();
      
      await this.teardown();
      
      process.exit(passed ? 0 : 1);
    } catch (error) {
      console.error('❌ Benchmark failed:', error);
      await this.teardown();
      process.exit(1);
    }
  }
}

// Run benchmarks
const benchmark = new PerformanceBenchmark();
benchmark.run();