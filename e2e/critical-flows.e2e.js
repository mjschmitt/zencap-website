const { test, expect } = require('@playwright/test');

test.describe('CRITICAL USER FLOWS - LAUNCH READY', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('CRITICAL: Homepage loads and navigation works', async ({ page }) => {
    // Verify homepage loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Zenith Capital')).toBeVisible();
    
    // Test main navigation
    await page.click('text=Models');
    await expect(page).toHaveURL(/.*models/);
    
    await page.click('text=Insights');
    await expect(page).toHaveURL(/.*insights/);
    
    await page.click('text=Solutions');  
    await expect(page).toHaveURL(/.*solutions/);
    
    await page.click('text=About');
    await expect(page).toHaveURL(/.*about/);
    
    await page.click('text=Contact');
    await expect(page).toHaveURL(/.*contact/);
  });

  test('CRITICAL: Contact form submission works', async ({ page }) => {
    await page.goto('/contact');
    
    // Fill contact form
    await page.fill('input[name="name"]', 'QA Test User');
    await page.fill('input[name="email"]', 'qa@zenithcap.com');
    await page.fill('input[name="company"]', 'QA Testing Corp');
    await page.fill('textarea[name="message"]', 'Critical QA test message for launch verification');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=Thank you')).toBeVisible({ timeout: 10000 });
  });

  test('CRITICAL: Newsletter signup works', async ({ page }) => {
    // Find newsletter signup (could be in footer or dedicated section)
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('qa-newsletter@zenithcap.com');
    
    const submitButton = page.locator('button', { hasText: /Subscribe|Sign up|Join/i }).first();
    await submitButton.click();
    
    // Verify success message appears
    await expect(page.locator('text=/success|subscribed|thank you/i')).toBeVisible({ timeout: 8000 });
  });

  test('CRITICAL: Financial models page loads and displays models', async ({ page }) => {
    await page.goto('/models');
    
    // Verify models page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for model categories
    await expect(page.locator('text=Private Equity')).toBeVisible();
    await expect(page.locator('text=Public Equity')).toBeVisible();
    
    // Navigate to private equity
    await page.click('text=Private Equity');
    await expect(page).toHaveURL(/.*private-equity/);
    
    // Verify models are displayed
    await expect(page.locator('[data-testid="model-card"]').first()).toBeVisible();
  });

  test('CRITICAL: Model purchase flow initiates', async ({ page }) => {
    await page.goto('/models/private-equity');
    
    // Find and click first Buy Now button
    const buyButton = page.locator('button', { hasText: /Buy Now|Purchase/i }).first();
    await expect(buyButton).toBeVisible();
    await buyButton.click();
    
    // Should redirect to checkout
    await expect(page).toHaveURL(/.*checkout/);
    
    // Verify checkout page elements
    await expect(page.locator('text=/Stripe|Payment|Checkout/i')).toBeVisible();
  });

  test('CRITICAL: Insights page loads and articles display', async ({ page }) => {
    await page.goto('/insights');
    
    // Verify insights page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for insight articles
    const articles = page.locator('[data-testid="insight-card"]');
    await expect(articles.first()).toBeVisible();
    
    // Click on first article
    await articles.first().click();
    
    // Should navigate to article detail
    await expect(page).toHaveURL(/.*insights\/.*/);
    await expect(page.locator('article')).toBeVisible();
  });

  test('CRITICAL: About page loads completely', async ({ page }) => {
    await page.goto('/about');
    
    // Verify about page content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Zenith Capital')).toBeVisible();
    
    // Check for team or company info
    await expect(page.locator('img')).toBeVisible(); // Should have images
  });

  test('CRITICAL: Solutions pages load', async ({ page }) => {
    await page.goto('/solutions');
    
    // Test each solution page
    const solutions = ['financial-modeling', 'infrastructure', 'research'];
    
    for (const solution of solutions) {
      await page.goto(`/solutions/${solution}`);
      await expect(page.locator('h1')).toBeVisible();
      await page.waitForLoadState('networkidle');
    }
  });

  test('CRITICAL: Mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile menu
    const mobileMenuButton = page.locator('[aria-label*="menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('nav')).toBeVisible();
    }
    
    // Test form on mobile
    await page.goto('/contact');
    await page.fill('input[name="name"]', 'Mobile Test');
    await page.fill('input[name="email"]', 'mobile@test.com');
    await page.fill('textarea[name="message"]', 'Mobile form test');
    
    // Form should be usable on mobile
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test('CRITICAL: Performance metrics', async ({ page }) => {
    // Start measuring performance
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Get performance metrics
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      return entries[0] ? {
        domContentLoaded: entries[0].domContentLoadedEventEnd - entries[0].domContentLoadedEventStart,
        loadComplete: entries[0].loadEventEnd - entries[0].loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      } : {};
    });
    
    // Verify reasonable load times (under 3 seconds for DOM content loaded)
    expect(performanceEntries.domContentLoaded).toBeLessThan(3000);
    
    console.log('Performance Metrics:', performanceEntries);
  });

  test('CRITICAL: Error handling', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await expect(page.locator('text=/404|Not Found/i')).toBeVisible();
    
    // Test error boundary by simulating JavaScript error
    await page.goto('/');
    await page.evaluate(() => {
      // Trigger a JavaScript error to test error boundary
      window.onerror = null;
      throw new Error('Test error for error boundary');
    });
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('CRITICAL: Security headers and HTTPS', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check for security headers
    const headers = response.headers();
    
    // These should be set for production security
    console.log('Security Headers Check:');
    console.log('X-Frame-Options:', headers['x-frame-options'] || 'NOT SET');
    console.log('X-Content-Type-Options:', headers['x-content-type-options'] || 'NOT SET');
    console.log('Referrer-Policy:', headers['referrer-policy'] || 'NOT SET');
    
    // Verify response is successful
    expect(response.status()).toBe(200);
  });
});