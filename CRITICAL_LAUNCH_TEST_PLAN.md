# CRITICAL LAUNCH TEST PLAN
**Zenith Capital Advisors - 72 Hour Launch Preparation**

**Date**: January 31, 2025  
**Launch Target**: February 3, 2025  
**QA Lead**: Head of Quality Assurance  

---

## PHASE 1: CRITICAL BLOCKERS (Priority 1 - 24 Hours)

### 1.1 Excel Viewer Data Bug Fix
**Status**: 🔴 BLOCKER  
**Time Required**: 4 hours  
**Risk Level**: CRITICAL  

#### Test Scenarios:
1. **Cell Data Alignment Test**
   ```
   Input: NVDA_1Q26.xlsx with known cell values
   Expected: A1="Company", B1="NVIDIA", etc.
   Current: Data offset by one row
   Validation: Manual verification of 10 sample cells
   ```

2. **Sheet Navigation Test**
   ```
   Input: Multi-sheet Excel file
   Expected: Correct data displayed for each sheet
   Test: Verify first 5 cells on each sheet
   ```

3. **Cell Selection Test**
   ```
   Action: Click on cell B5
   Expected: Cell B5 highlighted with correct value
   Test: Verify selection matches displayed content
   ```

#### Success Criteria:
- [ ] Cell values match Excel desktop application
- [ ] No data offset in any sheet
- [ ] Cell selection shows correct position
- [ ] Search results point to correct cells

#### Test Files:
- `NVDA_1Q26.xlsx` (known reference)
- `111_SW_16th_Ter_debt_.xlsm` (complex model)
- `test-formatting-fixes.xlsx` (edge cases)

---

### 1.2 File Security Implementation
**Status**: 🔴 BLOCKER  
**Time Required**: 6 hours  
**Risk Level**: HIGH  

#### Security Tests:
1. **File Size Limit Test**
   ```javascript
   // Test files of various sizes
   const testCases = [
     { size: '50MB', expected: 'SUCCESS' },
     { size: '100MB', expected: 'SUCCESS' },
     { size: '150MB', expected: 'ERROR: File too large' }
   ];
   ```

2. **Malicious File Upload Test**
   ```
   Test files: .exe, .bat, .scr renamed to .xlsx
   Expected: Rejection with clear error message
   ```

3. **Memory Monitoring Test**
   ```
   Load large file (80MB)
   Monitor: performance.memory.usedJSHeapSize
   Expected: Warning at >90% memory usage
   ```

#### Implementation Requirements:
```javascript
// Add to ExcelJSViewer.js
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size ${(file.size/1024/1024).toFixed(1)}MB exceeds 100MB limit`);
  }
  // Additional validation...
};
```

#### Success Criteria:
- [ ] Files >100MB rejected with clear error
- [ ] Memory warnings displayed at 90% usage
- [ ] Malicious file types blocked
- [ ] Rate limiting prevents abuse

---

### 1.3 E2E Test Infrastructure Repair
**Status**: 🔴 BLOCKER  
**Time Required**: 8 hours  
**Risk Level**: HIGH  

#### Issues to Fix:
1. **Playwright Module Import Error**
   ```bash
   # Current error: require is not defined
   # Fix: Update playwright.config.js to use CommonJS
   ```

2. **Missing Test Fixtures**
   ```
   Create: /e2e/fixtures/
   - small-test.xlsx (1MB)
   - large-test.xlsx (25MB)
   - with-macros.xlsm
   - corrupt.xlsx
   - with-formulas.xlsx
   ```

3. **Test Environment Setup**
   ```bash
   npm run dev → localhost:3001
   Playwright tests → run against dev server
   Database → use test database
   ```

#### Critical Test Cases to Implement:
1. **Homepage Load Test**
   ```javascript
   test('homepage loads within 3 seconds', async ({ page }) => {
     const startTime = Date.now();
     await page.goto('/');
     await page.waitForLoadState('networkidle');
     const loadTime = Date.now() - startTime;
     expect(loadTime).toBeLessThan(3000);
   });
   ```

2. **Contact Form Submission**
   ```javascript
   test('contact form submits successfully', async ({ page }) => {
     await page.goto('/contact');
     await page.fill('[name="name"]', 'Test User');
     await page.fill('[name="email"]', 'test@example.com');
     await page.fill('[name="message"]', 'Test message');
     await page.click('button[type="submit"]');
     await expect(page.locator('text=Thank you')).toBeVisible();
   });
   ```

3. **Excel File Upload**
   ```javascript
   test('excel file uploads and displays', async ({ page }) => {
     await page.goto('/models/test-excel-viewer');
     await page.setInputFiles('input[type="file"]', 'fixtures/small-test.xlsx');
     await expect(page.locator('.excel-viewer')).toBeVisible();
     await expect(page.locator('text=Sheet1')).toBeVisible();
   });
   ```

#### Success Criteria:
- [ ] All Playwright tests run without errors
- [ ] Test fixtures created and validated
- [ ] Critical user flows covered
- [ ] CI/CD integration ready

---

## PHASE 2: HIGH PRIORITY ISSUES (Priority 2 - 24 Hours)

### 2.1 API Endpoint Testing
**Status**: 🟡 HIGH  
**Time Required**: 8 hours  

#### API Test Suite Creation:
```javascript
// tests/api/contact.test.js
describe('/api/contact', () => {
  test('validates required fields', async () => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }) // missing name, message
    });
    expect(response.status).toBe(400);
  });

  test('stores lead in database', async () => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      })
    });
    expect(response.status).toBe(200);
    // Verify database record created
  });
});
```

#### Endpoints to Test:
1. `/api/contact` - Lead submission
2. `/api/newsletter` - Subscription management
3. `/api/upload-excel` - File processing
4. `/api/insights` - Content management
5. `/api/models` - Model data

---

### 2.2 Database Integration Testing
**Status**: 🟡 HIGH  
**Time Required**: 6 hours  

#### Database Test Scenarios:
1. **Connection Reliability**
   ```javascript
   test('database connection is stable', async () => {
     const result = await sql`SELECT NOW()`;
     expect(result.rows.length).toBe(1);
   });
   ```

2. **CRUD Operations**
   ```javascript
   test('lead insertion and retrieval', async () => {
     const testLead = {
       name: 'Test User',
       email: 'test@example.com',
       message: 'Test message'
     };
     const insertResult = await insertLead(testLead);
     expect(insertResult.id).toBeDefined();
     
     const retrieved = await getLeadById(insertResult.id);
     expect(retrieved.email).toBe(testLead.email);
   });
   ```

3. **Data Integrity**
   ```javascript
   test('prevents duplicate newsletter subscriptions', async () => {
     const email = 'test@example.com';
     await insertNewsletterSubscriber({ email });
     
     // Second attempt should not create duplicate
     const result = await insertNewsletterSubscriber({ email });
     expect(result.exists).toBe(true);
   });
   ```

---

### 2.3 Browser Compatibility Testing
**Status**: 🟡 HIGH  
**Time Required**: 6 hours  

#### Browser Test Matrix:
| Browser | Version | Tests Required |
|---------|---------|----------------|
| Chrome | 121+ | Full test suite |
| Firefox | 122+ | Excel viewer focus |
| Safari | 17+ | Performance optimization |
| Edge | 121+ | Basic functionality |

#### Critical Test Cases:
1. **Excel Viewer Cross-Browser**
   ```javascript
   ['chromium', 'firefox', 'webkit'].forEach(browserName => {
     test(`excel viewer works in ${browserName}`, async ({ page }) => {
       // Test file upload and display in each browser
     });
   });
   ```

2. **Form Submission Cross-Browser**
   ```javascript
   test('contact form works in all browsers', async ({ browserName, page }) => {
     // Test form validation and submission
   });
   ```

---

## PHASE 3: LAUNCH VALIDATION (Priority 3 - 24 Hours)

### 3.1 Performance Testing
**Status**: 🟡 MEDIUM  
**Time Required**: 4 hours  

#### Performance Benchmarks:
```javascript
const performanceTests = [
  { page: '/', target: 3000, description: 'Homepage load time' },
  { page: '/models', target: 3000, description: 'Models page load time' },
  { page: '/insights', target: 3000, description: 'Insights page load time' },
  { page: '/admin', target: 5000, description: 'Admin dashboard (authenticated)' }
];
```

### 3.2 Security Validation
**Status**: 🟡 MEDIUM  
**Time Required**: 4 hours  

#### Security Test Cases:
1. **SQL Injection Prevention**
2. **XSS Protection**
3. **CSRF Token Validation**
4. **File Upload Security**

### 3.3 User Experience Testing
**Status**: 🟡 MEDIUM  
**Time Required**: 4 hours  

#### UX Test Scenarios:
1. **Error Message Clarity**
2. **Loading State Feedback**
3. **Mobile Responsiveness**
4. **Accessibility Compliance**

---

## SUCCESS CRITERIA FOR LAUNCH

### Must Pass (Blockers)
- [ ] Excel viewer displays correct cell data
- [ ] File size limits prevent crashes  
- [ ] E2E tests pass for critical flows
- [ ] Contact form stores leads correctly
- [ ] No JavaScript errors in browser console

### Should Pass (Launch Risk)
- [ ] Newsletter signup works end-to-end
- [ ] Admin dashboard loads within 5 seconds
- [ ] Safari basic functionality working
- [ ] API endpoints handle errors gracefully
- [ ] Database operations are reliable

### Nice to Pass (Post-Launch)
- [ ] Mobile experience optimized
- [ ] Advanced Excel features working
- [ ] Performance optimized for large files
- [ ] Full accessibility compliance

---

## TESTING SCHEDULE

### Day 1 (January 31)
- **09:00-13:00**: Fix Excel viewer indexing bug
- **14:00-20:00**: Implement file security measures
- **Evening**: Begin E2E test infrastructure repair

### Day 2 (February 1)
- **09:00-17:00**: Complete E2E test setup
- **18:00-24:00**: API endpoint testing

### Day 3 (February 2)
- **09:00-15:00**: Database and browser compatibility
- **16:00-20:00**: Performance and security validation
- **21:00-23:00**: Launch decision review

### Launch Day (February 3)
- **Morning**: Final validation and deployment
- **Launch**: Monitor and respond to issues

---

## RISK MITIGATION

### High-Risk Areas:
1. **Excel Viewer**: Keep old version as fallback
2. **File Upload**: Implement graceful degradation
3. **Database**: Monitor connection pooling
4. **Performance**: Set up real-time alerts

### Rollback Plan:
- Previous stable version ready for immediate deployment
- Database schema changes are reversible
- File uploads can be temporarily disabled
- Admin access protected with additional authentication

---

## MONITORING AND ALERTS

### Launch Day Monitoring:
- Error rate alerts (>1%)
- Performance alerts (>5s load time)  
- Database connection alerts
- File upload failure alerts
- User feedback tracking

### Success Metrics:
- Zero critical errors in first 24 hours
- Page load times <3 seconds for 95% of requests
- Contact form success rate >98%
- Excel viewer success rate >95%

---

**Test Plan Approval**:
- [ ] QA Lead
- [ ] Technical Lead  
- [ ] Product Manager

**Document Version**: 1.0  
**Last Updated**: January 31, 2025