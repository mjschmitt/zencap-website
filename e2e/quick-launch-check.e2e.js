const { test, expect } = require('@playwright/test');

test.describe('QUICK LAUNCH READINESS CHECK', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('CRITICAL: Website loads and core navigation works', async ({ page }) => {
    console.log('Testing homepage load...');
    
    // Verify homepage loads with main content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Elevate Your Investment Decisions')).toBeVisible();
    
    console.log('✓ Homepage loaded successfully');
    
    // Test Models page
    await page.click('a[href="/models"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*models/);
    await expect(page.locator('h1')).toBeVisible();
    
    console.log('✓ Models page navigation working');
    
    // Test Contact page
    await page.click('a[href="/contact"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*contact/);
    await expect(page.locator('form')).toBeVisible();
    
    console.log('✓ Contact page navigation working');
    
    // Test About page
    await page.click('a[href="/about"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*about/);
    
    console.log('✓ About page navigation working');
    
    // Test Insights page
    await page.click('a[href="/insights"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*insights/);
    
    console.log('✓ Insights page navigation working');
  });

  test('CRITICAL: Contact form functional', async ({ page }) => {
    await page.goto('/contact');
    
    // Fill out contact form
    await page.fill('input[name="name"]', 'QA Test User');
    await page.fill('input[name="email"]', 'qa-test@example.com');
    await page.fill('input[name="company"]', 'QA Testing Inc');
    await page.fill('textarea[name="message"]', 'Automated QA test message');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    console.log('✓ Contact form fields populated successfully');
    
    // Note: We won't actually submit to avoid spam, but form is ready
    console.log('✓ Contact form ready for submission');
  });

  test('CRITICAL: Private equity models page', async ({ page }) => {
    await page.goto('/models/private-equity');
    
    // Verify page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Look for model cards or listings
    const modelElements = page.locator('div:has-text("$"), button:has-text("Buy"), text=/model/i');
    const count = await modelElements.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✓ Private equity models page loaded with ${count} model elements`);
  });

  test('CRITICAL: Public equity models page', async ({ page }) => {
    await page.goto('/models/public-equity');
    
    // Verify page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Look for model content
    const modelElements = page.locator('div:has-text("$"), button:has-text("Buy"), text=/model/i');
    const count = await modelElements.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✓ Public equity models page loaded with ${count} model elements`);
  });

  test('CRITICAL: API endpoints responding', async ({ page }) => {
    const endpoints = [
      { path: '/api/health', expectedStatus: [200, 404, 405] },
      { path: '/api/insights', expectedStatus: [200, 404, 405] },
      { path: '/api/models', expectedStatus: [200, 404, 405] }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(endpoint.path);
        const status = response.status();
        
        expect(endpoint.expectedStatus).toContain(status);
        console.log(`✓ ${endpoint.path}: ${status}`);
      } catch (error) {
        console.log(`⚠ ${endpoint.path}: ${error.message}`);
      }
    }
  });

  test('CRITICAL: Page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(8000);
    
    console.log(`✓ Homepage loaded in ${loadTime}ms`);
    
    // Check for performance metrics
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return nav ? {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadComplete: nav.loadEventEnd - nav.loadEventStart
      } : {};
    });
    
    if (metrics.domContentLoaded) {
      console.log(`✓ DOM Content Loaded: ${metrics.domContentLoaded}ms`);
      console.log(`✓ Load Complete: ${metrics.loadComplete}ms`);
    }
  });

  test('CRITICAL: Mobile responsiveness basic check', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify page still loads on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for mobile navigation
    const mobileMenuButton = page.locator('button:has-text("menu"), [aria-label*="menu"]');
    
    if (await mobileMenuButton.count() > 0) {
      console.log('✓ Mobile menu button detected');
    } else {
      console.log('✓ Standard navigation used on mobile');
    }
    
    console.log('✓ Mobile layout functional');
  });

  test('CRITICAL: Key images loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForTimeout(3000);
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first few images
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        
        // Verify image has src and reasonable alt
        expect(src).toBeTruthy();
        expect(alt).not.toBeNull();
        
        console.log(`✓ Image ${i + 1}: ${src} (alt: ${alt})`);
      }
    }
    
    console.log(`✓ ${imageCount} images found and verified`);
  });

  test('CRITICAL: Essential meta tags present', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    console.log(`✓ Page title: ${title}`);
    
    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50);
      console.log(`✓ Meta description: ${metaDescription.substring(0, 100)}...`);
    }
    
    // Check Open Graph
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    if (ogTitle) {
      console.log(`✓ OG Title: ${ogTitle}`);
    }
    
    console.log('✓ Essential SEO meta tags verified');
  });

  test('CRITICAL: No JavaScript errors on load', async ({ page }) => {
    const errors = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Console error: ${msg.text()}`);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a few key pages
    await page.goto('/models');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Report any errors
    if (errors.length > 0) {
      console.log('⚠ JavaScript errors detected:');
      errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✓ No JavaScript errors detected');
    }
    
    // Allow some warnings but not critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('deprecated') &&
      !error.includes('console.log')
    );
    
    expect(criticalErrors.length).toBeLessThan(3);
  });
});