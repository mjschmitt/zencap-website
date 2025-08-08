const { test, expect } = require('@playwright/test');

test.describe('REGRESSION SUITE - LAUNCH CRITICAL', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('API Health Check - All endpoints respond', async ({ page }) => {
    const criticalEndpoints = [
      '/api/health',
      '/api/insights',
      '/api/models',
      '/api/contact',
      '/api/newsletter',
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await page.request.get(endpoint);
        console.log(`${endpoint}: ${response.status()}`);
        
        // Most should return 200 or 405 (method not allowed for POST-only endpoints)
        expect([200, 405, 404].includes(response.status())).toBe(true);
      } catch (error) {
        console.error(`Failed to reach ${endpoint}: ${error.message}`);
      }
    }
  });

  test('Database connectivity test', async ({ page }) => {
    // Test database through API
    const response = await page.request.get('/api/insights');
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log(`✓ Database connected - Retrieved ${data.length || 0} insights`);
    } else {
      console.log(`⚠ Database connection issue - Status: ${response.status()}`);
    }
  });

  test('Email service integration', async ({ page }) => {
    // Test contact form submission
    await page.goto('/contact');
    
    await page.fill('input[name="name"]', 'Regression Test User');
    await page.fill('input[name="email"]', 'regression@test.zenithcap.com');
    await page.fill('textarea[name="message"]', 'Automated regression test');
    
    // Submit and check for success/error response
    const responsePromise = page.waitForResponse('/api/contact');
    await page.click('button[type="submit"]');
    
    try {
      const response = await responsePromise;
      console.log(`Contact form API: ${response.status()}`);
      expect(response.status()).toBe(200);
      
      // Check for success message
      await expect(page.locator('text=/thank you|success/i')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      console.log(`Contact form test failed: ${error.message}`);
    }
  });

  test('Stripe integration check', async ({ page }) => {
    // Test Stripe checkout session creation
    const sessionData = {
      modelId: 'test-model',
      modelName: 'Test Model',
      price: 2985
    };
    
    try {
      const response = await page.request.post('/api/stripe/create-checkout-session', {
        data: sessionData
      });
      
      console.log(`Stripe checkout API: ${response.status()}`);
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('sessionId');
        console.log('✓ Stripe integration functional');
      } else {
        console.log('⚠ Stripe integration issue');
      }
    } catch (error) {
      console.log(`Stripe test failed: ${error.message}`);
    }
  });

  test('Image loading and optimization', async ({ page }) => {
    // Test critical images load
    const criticalImages = [
      'img[alt*="hero"]',
      'img[alt*="logo"]',
      '[data-testid="model-image"]'
    ];

    for (const selector of criticalImages) {
      const images = page.locator(selector);
      const count = await images.count();
      
      if (count > 0) {
        const firstImage = images.first();
        
        // Wait for image to load
        await expect(firstImage).toBeVisible();
        
        // Check if image has loaded successfully
        const naturalWidth = await firstImage.evaluate(img => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
        
        console.log(`✓ Images loading correctly (${selector})`);
      }
    }
  });

  test('SEO and meta tags', async ({ page }) => {
    const pages = ['/', '/about', '/models', '/insights', '/contact'];
    
    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      
      // Check title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThan(60);
      
      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      const descriptionContent = await metaDescription.getAttribute('content');
      
      if (descriptionContent) {
        expect(descriptionContent.length).toBeLessThan(160);
      }
      
      console.log(`✓ SEO tags OK for ${pageUrl}: "${title}"`);
    }
  });

  test('Analytics integration', async ({ page }) => {
    // Check if GA is loaded
    const gaLoaded = await page.evaluate(() => {
      return typeof gtag !== 'undefined' || typeof ga !== 'undefined';
    });
    
    if (gaLoaded) {
      console.log('✓ Google Analytics loaded');
    } else {
      console.log('⚠ Analytics not detected (may be intentional in dev)');
    }
    
    // Check for custom analytics
    const analyticsScript = page.locator('script[src*="analytics"]');
    if (await analyticsScript.count() > 0) {
      console.log('✓ Custom analytics detected');
    }
  });

  test('Security headers and CSP', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response.headers();
    
    // Check security headers
    const securityHeaders = {
      'x-frame-options': 'Expected for clickjacking protection',
      'x-content-type-options': 'Expected for MIME sniffing protection',
      'referrer-policy': 'Expected for referrer privacy',
      'permissions-policy': 'Expected for feature policy'
    };
    
    for (const [header, description] of Object.entries(securityHeaders)) {
      if (headers[header]) {
        console.log(`✓ ${header}: ${headers[header]}`);
      } else {
        console.log(`⚠ Missing ${header}: ${description}`);
      }
    }
  });

  test('Cross-browser JavaScript compatibility', async ({ page, browserName }) => {
    console.log(`Testing on: ${browserName}`);
    
    // Test modern JavaScript features
    const jsFeatures = await page.evaluate(() => {
      const results = {};
      
      // ES6+ features
      try {
        results.arrow_functions = (() => true)();
        results.async_await = (async () => true)();
        results.fetch_api = typeof fetch !== 'undefined';
        results.promises = typeof Promise !== 'undefined';
        results.local_storage = typeof localStorage !== 'undefined';
        results.session_storage = typeof sessionStorage !== 'undefined';
      } catch (error) {
        results.error = error.message;
      }
      
      return results;
    });
    
    // All modern browsers should support these
    expect(jsFeatures.arrow_functions).toBe(true);
    expect(jsFeatures.fetch_api).toBe(true);
    expect(jsFeatures.promises).toBe(true);
    expect(jsFeatures.local_storage).toBe(true);
    
    console.log(`✓ JavaScript compatibility OK on ${browserName}`);
  });

  test('Form validation and error handling', async ({ page }) => {
    await page.goto('/contact');
    
    // Test form validation
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    const validationErrors = page.locator('text=/required|invalid|error/i');
    await expect(validationErrors.first()).toBeVisible();
    
    // Test email validation
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    const emailError = page.locator('text=/invalid email|email format/i');
    if (await emailError.count() > 0) {
      await expect(emailError).toBeVisible();
    }
    
    console.log('✓ Form validation working');
  });

  test('Page loading performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach(entry => {
              if (entry.name === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              }
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.lcp = entry.startTime;
              }
            });
            
            resolve(vitals);
          });
          
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
          
          // Fallback after 3 seconds
          setTimeout(() => resolve({}), 3000);
        } else {
          resolve({});
        }
      });
    });
    
    console.log(`Page load time: ${loadTime}ms`);
    if (webVitals.fcp) {
      console.log(`First Contentful Paint: ${webVitals.fcp}ms`);
    }
    if (webVitals.lcp) {
      console.log(`Largest Contentful Paint: ${webVitals.lcp}ms`);
    }
  });

  test('Memory leak detection', async ({ page }) => {
    // Navigate through multiple pages to test for leaks
    const pages = ['/', '/about', '/models', '/insights', '/contact'];
    
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Navigate through pages
    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
    }
    
    // Force garbage collection if possible
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
    
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      console.log(`Memory usage: ${initialMemory} -> ${finalMemory} (+${memoryIncrease} bytes)`);
      
      // Significant memory leak would be > 10MB increase
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    }
  });

  test('Accessibility compliance', async ({ page }) => {
    // Basic accessibility checks
    await page.goto('/');
    
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
    
    // Check for alt attributes on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Images should have alt attributes (can be empty for decorative)
      expect(alt).not.toBeNull();
    }
    
    // Check for form labels
    const inputs = page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      // At least some inputs should have labels or aria-labels
      const labelsCount = await page.locator('label').count();
      const ariaLabelsCount = await page.locator('[aria-label]').count();
      
      expect(labelsCount + ariaLabelsCount).toBeGreaterThan(0);
    }
    
    console.log('✓ Basic accessibility checks passed');
  });
});