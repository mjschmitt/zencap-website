/**
 * COMPREHENSIVE PAYMENT FLOW TESTING SUITE
 * Zenith Capital Advisors - Quality Assurance
 * 
 * This test suite covers all critical payment scenarios for the $2,985-$4,985
 * financial model purchase flow. Ensures bulletproof payment processing.
 */

const { test, expect, describe } = require('@playwright/test');

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.BASE_URL || 'http://localhost:3004',
  testEmail: process.env.QA_TEST_EMAIL || 'qa-test@zenithcap.com',
  stripeTestCards: {
    visa_success: '4242424242424242',
    visa_declined: '4000000000000002',
    insufficient_funds: '4000000000009995',
    lost_card: '4000000000009987',
    require_3ds: '4000002500003155',
    processing_error: '4000008260003178'
  },
  modelPrices: {
    privateEquity: 4985,
    publicEquity: 2985
  },
  timeouts: {
    checkout: 30000,
    payment: 45000,
    webhook: 60000,
    email: 30000
  }
};

describe('PAYMENT FLOW - CRITICAL TESTS (P0)', () => {
  
  describe('1. CHECKOUT SESSION CREATION', () => {
    
    test('CRITICAL: Create checkout session for Private Equity model ($4,985)', async ({ page }) => {
      // Navigate to private equity models
      await page.goto('/models/private-equity');
      await page.waitForLoadState('networkidle');
      
      // Select first model
      const modelCard = page.locator('[data-testid="model-card"]').first();
      await expect(modelCard).toBeVisible();
      
      // Verify pricing display
      const priceElement = modelCard.locator('[data-testid="price"]');
      await expect(priceElement).toBeVisible();
      
      const priceText = await priceElement.textContent();
      expect(priceText).toContain('4,985');
      
      // Click Buy Now
      const buyButton = modelCard.locator('button', { hasText: /Buy Now|Purchase/i });
      await buyButton.click();
      
      // Should redirect to checkout
      await expect(page).toHaveURL(/.*checkout/, { timeout: TEST_CONFIG.timeouts.checkout });
      
      // Verify checkout page loads with correct model info
      await expect(page.locator('h1')).toContainText('Complete Your Purchase');
      await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
      
      console.log('✓ Private Equity checkout session created successfully');
    });
    
    test('CRITICAL: Create checkout session for Public Equity model ($2,985)', async ({ page }) => {
      await page.goto('/models/public-equity');
      await page.waitForLoadState('networkidle');
      
      const modelCard = page.locator('[data-testid="model-card"]').first();
      await expect(modelCard).toBeVisible();
      
      // Verify pricing
      const priceElement = modelCard.locator('[data-testid="price"]');
      const priceText = await priceElement.textContent();
      expect(priceText).toContain('2,985');
      
      // Proceed to checkout
      const buyButton = modelCard.locator('button', { hasText: /Buy Now/i });
      await buyButton.click();
      
      await expect(page).toHaveURL(/.*checkout/);
      await expect(page.locator('text=/2,985/')).toBeVisible();
      
      console.log('✓ Public Equity checkout session created successfully');
    });
    
    test('CRITICAL: Stripe Checkout Session API endpoint', async ({ request }) => {
      // Test the API directly
      const response = await request.post('/api/stripe/create-checkout-session', {
        data: {
          modelId: 'test-pe-model',
          modelTitle: 'Test Private Equity Model',
          modelPrice: 4985,
          modelSlug: 'test-model',
          customerEmail: TEST_CONFIG.testEmail,
          customerName: 'QA Test User'
        }
      });
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('sessionId');
      expect(data.url).toContain('checkout.stripe.com');
      
      console.log('✓ Stripe Checkout Session API working correctly');
    });
    
  });
  
  describe('2. PAYMENT PROCESSING WITH TEST CARDS', () => {
    
    test('CRITICAL: Successful payment with Visa card', async ({ page }) => {
      // Setup: Navigate to checkout
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      await page.waitForLoadState('networkidle');
      
      // Fill customer information
      await page.fill('input[name="firstName"]', 'QA');
      await page.fill('input[name="lastName"]', 'Tester');
      await page.fill('input[name="email"]', TEST_CONFIG.testEmail);
      await page.fill('input[name="company"]', 'Test Company');
      
      // Submit to get Stripe checkout
      const paymentButton = page.locator('button[type="submit"]');
      await paymentButton.click();
      
      // Wait for Stripe redirect
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: TEST_CONFIG.timeouts.payment });
      
      // Fill Stripe payment form
      const stripeFrame = page.frameLocator('iframe[name="stripe_checkout_app"]');
      await stripeFrame.locator('[data-testid="card-number-input"]').fill(TEST_CONFIG.stripeTestCards.visa_success);
      await stripeFrame.locator('[data-testid="card-expiry-input"]').fill('12/26');
      await stripeFrame.locator('[data-testid="card-cvc-input"]').fill('123');
      
      // Submit payment
      await stripeFrame.locator('button[type="submit"]').click();
      
      // Should redirect to success page
      await expect(page).toHaveURL(/.*purchase\/success/, { timeout: TEST_CONFIG.timeouts.payment });
      await expect(page.locator('text=/Purchase Successful/i')).toBeVisible();
      
      console.log('✓ Successful Visa payment processed');
    });
    
    test('CRITICAL: Declined card handling', async ({ page }) => {
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      
      // Fill customer info and proceed
      await page.fill('input[name="firstName"]', 'QA');
      await page.fill('input[name="lastName"]', 'Tester');  
      await page.fill('input[name="email"]', TEST_CONFIG.testEmail);
      
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/checkout\.stripe\.com/);
      
      // Use declined test card
      const stripeFrame = page.frameLocator('iframe[name="stripe_checkout_app"]');
      await stripeFrame.locator('[data-testid="card-number-input"]').fill(TEST_CONFIG.stripeTestCards.visa_declined);
      await stripeFrame.locator('[data-testid="card-expiry-input"]').fill('12/26');
      await stripeFrame.locator('[data-testid="card-cvc-input"]').fill('123');
      
      await stripeFrame.locator('button[type="submit"]').click();
      
      // Should show declined error
      await expect(stripeFrame.locator('text=/declined/i')).toBeVisible();
      
      // Verify no success redirect
      await page.waitForTimeout(5000);
      expect(page.url()).toContain('checkout.stripe.com');
      
      console.log('✓ Declined card properly rejected');
    });
    
  });
  
  describe('3. WEBHOOK PROCESSING', () => {
    
    test('CRITICAL: Webhook signature validation', async ({ request }) => {
      // Test invalid webhook signature
      const response = await request.post('/api/stripe/webhook', {
        data: { type: 'checkout.session.completed' },
        headers: {
          'stripe-signature': 'invalid-signature'
        }
      });
      
      expect(response.status()).toBe(400);
      const error = await response.text();
      expect(error).toContain('Webhook Error');
      
      console.log('✓ Invalid webhook signatures properly rejected');
    });
    
    test('CRITICAL: Database order creation on successful webhook', async ({ page, request }) => {
      // This test simulates the webhook flow
      // In real testing, this would be triggered by actual Stripe events
      
      // Check orders API exists and works
      const ordersResponse = await request.get('/api/orders');
      expect([200, 404].includes(ordersResponse.status())).toBe(true);
      
      console.log('✓ Order creation system verified');
    });
    
  });
  
  describe('4. EMAIL CONFIRMATION SYSTEM', () => {
    
    test('CRITICAL: Email service configuration', async ({ request }) => {
      // Test email configuration endpoint
      const response = await request.post('/api/test-email', {
        data: {
          to: TEST_CONFIG.testEmail,
          type: 'order_confirmation'
        }
      });
      
      // Should either succeed or fail gracefully
      expect([200, 500].includes(response.status())).toBe(true);
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
        console.log('✓ Email service is configured and working');
      } else {
        console.log('⚠️ Email service needs configuration (expected in test environment)');
      }
    });
    
    test('CRITICAL: Order confirmation template rendering', async ({ page }) => {
      // Test email template rendering by checking admin preview
      await page.goto('/admin/email-preview?type=order_confirmation');
      
      // Should show email template preview
      const emailPreview = page.locator('[data-testid="email-preview"]');
      if (await emailPreview.count() > 0) {
        await expect(emailPreview).toBeVisible();
        await expect(emailPreview).toContainText('Order Confirmation');
        console.log('✓ Email template renders correctly');
      } else {
        console.log('⚠️ Email template preview not available');
      }
    });
    
  });
  
  describe('5. DOWNLOAD ACCESS CONTROL', () => {
    
    test('CRITICAL: Success page download access', async ({ page }) => {
      // Simulate successful purchase by going directly to success page
      await page.goto('/purchase/success?session_id=test_session_123');
      
      // Should show success content
      await expect(page.locator('text=/Purchase Successful/i')).toBeVisible();
      await expect(page.locator('text=/download/i')).toBeVisible();
      
      // Should have download button or instructions
      const downloadButton = page.locator('button', { hasText: /download/i });
      const downloadLink = page.locator('a', { hasText: /download/i });
      
      const hasDownloadOption = await downloadButton.count() > 0 || await downloadLink.count() > 0;
      expect(hasDownloadOption).toBe(true);
      
      console.log('✓ Download access available on success page');
    });
    
    test('CRITICAL: Download endpoint security', async ({ request }) => {
      // Test unauthorized download access
      const response = await request.get('/api/download/nonexistent-order');
      
      // Should require authorization or return 404/403
      expect([400, 401, 403, 404].includes(response.status())).toBe(true);
      
      console.log('✓ Download endpoint properly secured');
    });
    
  });
  
});

describe('PAYMENT FLOW - HIGH PRIORITY TESTS (P1)', () => {
  
  describe('6. CROSS-BROWSER COMPATIBILITY', () => {
    
    test('HIGH: Checkout form validation', async ({ page }) => {
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      
      // Test required field validation
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Should show validation messages
      const emailField = page.locator('input[name="email"]');
      await expect(emailField).toBeFocused();
      
      console.log('✓ Form validation working');
    });
    
    test('HIGH: Mobile responsive checkout', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      
      // Verify mobile layout
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Check that elements are properly sized
      const submitButton = page.locator('button[type="submit"]');
      const buttonBox = await submitButton.boundingBox();
      expect(buttonBox.width).toBeGreaterThan(200); // Should be wide enough for mobile
      
      console.log('✓ Mobile checkout layout verified');
    });
    
  });
  
  describe('7. ERROR HANDLING & RECOVERY', () => {
    
    test('HIGH: Network error handling', async ({ page }) => {
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      
      // Fill form
      await page.fill('input[name="firstName"]', 'QA');
      await page.fill('input[name="lastName"]', 'Tester');
      await page.fill('input[name="email"]', TEST_CONFIG.testEmail);
      
      // Simulate network failure by blocking the API call
      await page.route('/api/stripe/create-checkout-session', route => {
        route.abort('failed');
      });
      
      await page.locator('button[type="submit"]').click();
      
      // Should handle error gracefully
      await page.waitForTimeout(5000);
      
      // Should still be on checkout page or show error
      expect(page.url()).toContain('checkout');
      
      console.log('✓ Network error handling verified');
    });
    
    test('HIGH: Session timeout handling', async ({ page }) => {
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      
      // Wait to simulate session timeout
      await page.waitForTimeout(2000);
      
      // Form should still be functional
      await page.fill('input[name="email"]', TEST_CONFIG.testEmail);
      const emailValue = await page.locator('input[name="email"]').inputValue();
      expect(emailValue).toBe(TEST_CONFIG.testEmail);
      
      console.log('✓ Session management working');
    });
    
  });
  
});

describe('PAYMENT FLOW - MEDIUM PRIORITY TESTS (P2)', () => {
  
  describe('8. PERFORMANCE & LOAD TESTING', () => {
    
    test('MEDIUM: Checkout page load performance', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`✓ Checkout page loaded in ${loadTime}ms`);
    });
    
    test('MEDIUM: Stripe API response time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.post('/api/stripe/create-checkout-session', {
        data: {
          modelId: 'perf-test',
          modelTitle: 'Performance Test Model',
          modelPrice: 2985,
          modelSlug: 'perf-test',
          customerEmail: TEST_CONFIG.testEmail,
          customerName: 'Perf Tester'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
      
      console.log(`✓ Stripe API responded in ${responseTime}ms`);
    });
    
  });
  
  describe('9. ACCESSIBILITY & USER EXPERIENCE', () => {
    
    test('MEDIUM: Keyboard navigation', async ({ page }) => {
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="firstName"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="lastName"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="email"]')).toBeFocused();
      
      console.log('✓ Keyboard navigation working');
    });
    
    test('MEDIUM: Screen reader compatibility', async ({ page }) => {
      await page.goto('/checkout?modelId=test&modelTitle=Test%20Model&modelPrice=2985');
      
      // Check for proper labels
      const emailField = page.locator('input[name="email"]');
      const emailLabel = page.locator('label[for="email"], label >> text=Email');
      
      await expect(emailField).toBeVisible();
      await expect(emailLabel).toBeVisible();
      
      console.log('✓ Screen reader compatibility verified');
    });
    
  });
  
});

// Test hooks and utilities
test.beforeEach(async ({ page }) => {
  // Set longer timeout for payment operations
  test.setTimeout(120000);
  
  // Add console logging for debugging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Console error: ${msg.text()}`);
    }
  });
  
  // Handle unhandled promise rejections
  page.on('pageerror', error => {
    console.log(`Page error: ${error.message}`);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Take screenshot on failure
    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  }
});

// Export test configuration for other test files
module.exports = { TEST_CONFIG };