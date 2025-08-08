# MANUAL PAYMENT TESTING CHECKLIST
## Zenith Capital Advisors - Quality Assurance

**Pre-Launch Manual Testing Checklist for Payment Flow**
*All tests must pass before production launch*

---

## **🎯 CRITICAL TESTS (Must Pass - P0)**

### **✅ 1. STRIPE CHECKOUT FLOW**

#### **1.1 Private Equity Model Purchase ($4,985)**
- [ ] Navigate to `/models/private-equity`
- [ ] Select "Multifamily Real Estate Model" 
- [ ] Verify price displays as $4,985
- [ ] Click "Buy Now" button
- [ ] Verify redirect to checkout page
- [ ] Verify model details pre-filled correctly
- [ ] Fill customer information:
  - First Name: `QA`
  - Last Name: `Tester`  
  - Email: `qa-test@zenithcap.com`
  - Company: `ZenCap QA Team`
- [ ] Click "Complete Purchase" button
- [ ] Verify redirect to Stripe checkout
- [ ] **Expected**: Stripe checkout loads with correct $4,985 amount

#### **1.2 Public Equity Model Purchase ($2,985)**  
- [ ] Navigate to `/models/public-equity`
- [ ] Select "DCF Valuation Tool"
- [ ] Verify price displays as $2,985
- [ ] Follow same checkout process as 1.1
- [ ] **Expected**: Stripe checkout loads with correct $2,985 amount

#### **1.3 Successful Payment Processing**
**Use Test Card**: `4242424242424242`
- [ ] Enter card number: `4242 4242 4242 4242`
- [ ] Enter expiry: `12/26`
- [ ] Enter CVC: `123`
- [ ] Enter ZIP: `12345`
- [ ] Click "Pay" button
- [ ] **Expected**: Payment processes successfully
- [ ] **Expected**: Redirect to `/purchase/success?session_id=cs_xxx`
- [ ] **Expected**: Success page displays order details
- [ ] **Expected**: Download button/link available

---

### **✅ 2. PAYMENT FAILURE HANDLING**

#### **2.1 Declined Card Test**
**Use Test Card**: `4000000000000002`
- [ ] Follow checkout process from Test 1.1
- [ ] Enter declined test card details
- [ ] Click "Pay" button  
- [ ] **Expected**: Error message "Your card was declined"
- [ ] **Expected**: Ability to try different card
- [ ] **Expected**: No order created in system
- [ ] **Expected**: No confirmation email sent

#### **2.2 Insufficient Funds Test**
**Use Test Card**: `4000000000009995`
- [ ] Follow same process with insufficient funds card
- [ ] **Expected**: Appropriate error message displayed
- [ ] **Expected**: Graceful error handling

#### **2.3 Payment Cancellation**
- [ ] Start checkout process
- [ ] On Stripe page, click "Back" or close tab
- [ ] **Expected**: No order created
- [ ] **Expected**: User can restart process
- [ ] **Expected**: No confirmation email sent

---

### **✅ 3. EMAIL CONFIRMATION SYSTEM**

#### **3.1 Successful Purchase Email**
- [ ] Complete successful purchase (Test 1.1)
- [ ] Check email inbox for `qa-test@zenithcap.com`
- [ ] **Expected**: Order confirmation email received within 2 minutes
- [ ] **Expected**: Email contains:
  - [ ] Correct model title
  - [ ] Correct purchase amount
  - [ ] Order ID/session ID
  - [ ] Download instructions
  - [ ] Professional ZenCap branding
  - [ ] Support contact information

#### **3.2 Email Template Verification**
- [ ] Open confirmation email
- [ ] **Expected**: Professional design matching brand
- [ ] **Expected**: All links work correctly
- [ ] **Expected**: Unsubscribe link present
- [ ] **Expected**: Mobile-responsive design
- [ ] **Expected**: No typos or formatting issues

---

### **✅ 4. DOWNLOAD ACCESS & SECURITY**

#### **4.1 Authorized Download**
- [ ] From success page, click "Download Model"
- [ ] **Expected**: Excel file downloads immediately
- [ ] **Expected**: File name indicates correct model
- [ ] **Expected**: File opens properly in Excel
- [ ] **Expected**: File contains financial model content

#### **4.2 Download from Customer Portal**
- [ ] Navigate to `/account/purchases` (if implemented)
- [ ] **Expected**: See purchased model listed
- [ ] **Expected**: Download link available
- [ ] **Expected**: Download works properly

#### **4.3 Download Security**
- [ ] Try accessing download URL without authorization
- [ ] Try modifying download URL parameters
- [ ] **Expected**: Unauthorized access blocked
- [ ] **Expected**: Proper security error messages

---

### **✅ 5. DATABASE INTEGRITY**

#### **5.1 Order Record Creation**
*Admin/Developer to verify*
- [ ] Check `orders` table after successful purchase
- [ ] **Expected**: New order record created
- [ ] **Expected**: Correct customer_id, model_id, amount
- [ ] **Expected**: Status = 'completed'  
- [ ] **Expected**: Created_at timestamp accurate

#### **5.2 Customer Record Creation**
- [ ] Check `customers` table  
- [ ] **Expected**: New customer record or existing updated
- [ ] **Expected**: Correct email, name stored
- [ ] **Expected**: Stripe customer ID stored

---

## **⚠️ HIGH PRIORITY TESTS (Important - P1)**

### **✅ 6. CROSS-BROWSER TESTING**

#### **6.1 Chrome (Latest)**
- [ ] Complete full checkout flow
- [ ] **Expected**: All functionality works perfectly

#### **6.2 Firefox (Latest)**
- [ ] Complete full checkout flow  
- [ ] **Expected**: All functionality works perfectly

#### **6.3 Safari (Latest)**
- [ ] Complete full checkout flow
- [ ] **Expected**: All functionality works perfectly  

#### **6.4 Edge (Latest)**
- [ ] Complete full checkout flow
- [ ] **Expected**: All functionality works perfectly

---

### **✅ 7. MOBILE TESTING**

#### **7.1 iPhone Safari**
- [ ] Complete checkout on iPhone
- [ ] **Expected**: Responsive design
- [ ] **Expected**: Touch interactions work
- [ ] **Expected**: Apple Pay option (if configured)

#### **7.2 Android Chrome**  
- [ ] Complete checkout on Android
- [ ] **Expected**: Responsive design
- [ ] **Expected**: Google Pay option (if configured)

---

### **✅ 8. ERROR HANDLING & EDGE CASES**

#### **8.1 Network Interruption**
- [ ] Start checkout process
- [ ] Disconnect internet during submission
- [ ] Reconnect internet
- [ ] **Expected**: Graceful error handling
- [ ] **Expected**: Ability to retry

#### **8.2 Session Timeout**
- [ ] Start checkout, wait 30+ minutes
- [ ] Try to complete purchase
- [ ] **Expected**: Session handling or renewal

#### **8.3 Duplicate Form Submission**
- [ ] Fill checkout form
- [ ] Click submit button multiple times quickly
- [ ] **Expected**: Only one Stripe session created
- [ ] **Expected**: No duplicate charges

---

### **✅ 9. FORM VALIDATION**

#### **9.1 Required Field Validation**
- [ ] Try submitting with empty required fields
- [ ] **Expected**: Validation messages displayed
- [ ] **Expected**: Form submission prevented

#### **9.2 Email Format Validation**
- [ ] Enter invalid email formats
- [ ] **Expected**: Email validation messages
- [ ] **Expected**: Cannot proceed with invalid email

#### **9.3 Input Sanitization**
- [ ] Try entering HTML/script tags in form fields
- [ ] **Expected**: Input properly sanitized
- [ ] **Expected**: No XSS vulnerabilities

---

## **📊 MEDIUM PRIORITY TESTS (Nice to Have - P2)**

### **✅ 10. PERFORMANCE TESTING**

#### **10.1 Page Load Times**
- [ ] Measure checkout page load time
- [ ] **Expected**: < 3 seconds on good connection
- [ ] **Expected**: < 5 seconds on slow connection

#### **10.2 Stripe Integration Performance** 
- [ ] Measure time from form submit to Stripe redirect
- [ ] **Expected**: < 5 seconds
- [ ] **Expected**: Loading indicators shown

---

### **✅ 11. ACCESSIBILITY TESTING**

#### **11.1 Keyboard Navigation**
- [ ] Navigate entire checkout using only keyboard
- [ ] **Expected**: All elements accessible via tab/enter
- [ ] **Expected**: Proper focus indicators

#### **11.2 Screen Reader Compatibility**
- [ ] Test with screen reader software
- [ ] **Expected**: Form labels read correctly  
- [ ] **Expected**: Error messages announced
- [ ] **Expected**: Button purposes clear

---

### **✅ 12. SEO & ANALYTICS**

#### **12.1 Analytics Tracking**
- [ ] Complete purchase and check analytics
- [ ] **Expected**: Purchase events tracked
- [ ] **Expected**: Conversion funnel recorded

#### **12.2 Meta Tags & SEO**
- [ ] Check checkout page source
- [ ] **Expected**: Proper meta tags
- [ ] **Expected**: No index tags on sensitive pages

---

## **🔒 SECURITY TESTS (Critical)**

### **✅ 13. PRICE MANIPULATION PREVENTION**

#### **13.1 Client-Side Price Tampering**
- [ ] Open browser developer tools
- [ ] Navigate to checkout page
- [ ] Modify displayed price in DOM to $1.00
- [ ] Complete checkout process
- [ ] **Expected**: Server charges actual price, not modified price
- [ ] **Expected**: Payment amount matches database price

#### **13.2 URL Parameter Manipulation**
- [ ] Try modifying `modelPrice` parameter in URL
- [ ] **Expected**: Server validates price against database
- [ ] **Expected**: Tampered prices rejected

---

### **✅ 14. SESSION SECURITY**

#### **14.1 Session Hijacking Prevention**
- [ ] Complete purchase with session ID A
- [ ] Try accessing success page with modified session ID B  
- [ ] **Expected**: Unauthorized access blocked
- [ ] **Expected**: No sensitive data leaked

#### **14.2 CSRF Protection**
- [ ] Try submitting checkout form from external site
- [ ] **Expected**: CSRF protection blocks request
- [ ] **Expected**: Proper security headers present

---

## **📝 TESTING NOTES & RESULTS**

### **Test Environment Details**
- **Date Tested**: _______________
- **Tester Name**: _______________  
- **Browser Version**: _______________
- **Operating System**: _______________
- **Screen Resolution**: _______________

### **Critical Issues Found**
| Test Case | Status | Issue Description | Priority | Assigned To |
|-----------|---------|------------------|----------|-------------|
| | ✅/❌ | | P0/P1/P2 | |
| | ✅/❌ | | P0/P1/P2 | |
| | ✅/❌ | | P0/P1/P2 | |

### **Test Results Summary**
- **Total Tests**: _____ 
- **Passed**: _____
- **Failed**: _____  
- **Blocked**: _____
- **Overall Status**: ✅ PASS / ❌ FAIL

---

## **🚀 LAUNCH READINESS CRITERIA**

### **Must Pass for Launch (100% Required)**
- [ ] All P0 Critical tests pass
- [ ] No security vulnerabilities  
- [ ] Email delivery confirmed
- [ ] Database integrity verified
- [ ] Payment processing works in all major browsers

### **Should Pass for Launch (95% Required)**  
- [ ] All P1 High priority tests pass
- [ ] Mobile experience optimized
- [ ] Performance benchmarks met
- [ ] Error handling comprehensive

### **Nice to Have (80% Required)**
- [ ] P2 Medium priority tests pass
- [ ] Accessibility compliance verified
- [ ] Analytics tracking confirmed

---

## **📞 ESCALATION CONTACTS**

**Critical Payment Issues**: [Development Lead]  
**Email/Infrastructure Issues**: [DevOps Team]  
**Security Concerns**: [Security Team]  
**Business Logic Questions**: [Product Owner]

---

**Approval Required Before Launch**

**QA Lead Signature**: _________________ **Date**: _________  
**Security Review**: _________________ **Date**: _________  
**Business Owner**: _________________ **Date**: _________

---

*This checklist ensures comprehensive manual testing of the payment flow before production launch. All P0 tests must pass, and majority of P1 tests should pass for launch approval.*