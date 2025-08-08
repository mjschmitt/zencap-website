# A/B Testing Framework Guide
## Zenith Capital Advisors - Conversion Rate Optimization

### Table of Contents
1. [Overview](#overview)
2. [Framework Architecture](#framework-architecture)
3. [Test Implementation Guide](#test-implementation-guide)
4. [Analytics & Tracking](#analytics--tracking)
5. [Dashboard Usage](#dashboard-usage)
6. [Best Practices](#best-practices)
7. [Test Prioritization (ICE Framework)](#test-prioritization-ice-framework)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The A/B Testing Framework is designed to drive Zenith Capital Advisors toward the **$50K/month revenue goal** through systematic conversion rate optimization. The framework includes:

- **Feature Flag System**: Consistent user experience across sessions
- **User Segmentation**: Target specific user groups with relevant tests
- **Conversion Tracking**: Comprehensive event tracking for revenue attribution
- **Statistical Analysis**: Confidence intervals and significance testing
- **Admin Dashboard**: Real-time monitoring and results analysis

### Key Metrics Focus
- **Primary**: Model purchase conversions ($4,985 avg)
- **Secondary**: Email signups, contact form submissions
- **Engagement**: Page views, time on site, Excel preview usage

---

## Framework Architecture

### Core Components

```
src/
├── utils/
│   ├── abTesting.js          # Core A/B testing logic
│   └── conversionTracking.js # Event tracking and analytics
├── components/ui/
│   ├── ABTest.js            # React components for tests
│   └── PricingWithABTest.js # Pricing-specific components
├── pages/api/
│   └── ab-analytics.js      # Analytics API endpoint
├── pages/admin/
│   └── ab-testing.js        # Admin dashboard
```

### Database Schema

```sql
CREATE TABLE ab_test_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,     -- 'ab_test_exposure' or 'ab_conversion'
  test_id VARCHAR(100),                -- Test identifier
  variant VARCHAR(50),                 -- Variant name
  goal VARCHAR(100),                   -- Conversion goal name
  value NUMERIC,                       -- Conversion value (revenue)
  session_id VARCHAR(128) NOT NULL,    -- User session identifier
  user_segment VARCHAR(50),            -- User segment for analysis
  page VARCHAR(500),                   -- Page where event occurred
  test_assignments JSONB,              -- All test assignments for session
  client_ip VARCHAR(45),
  user_agent TEXT,
  additional_data JSONB,               -- Extra event data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Test Implementation Guide

### 1. Creating a New Test

**Step 1**: Define test in `src/utils/abTesting.js`:

```javascript
const NEW_TEST = {
  id: 'homepage_cta_v1',
  name: 'Homepage CTA Button Text',
  description: 'Test different CTA button text variations',
  status: 'active',
  variants: {
    control: {
      name: 'Current CTA',
      weight: 50,
      config: {
        ctaText: 'Explore Models',
        ctaColor: 'teal'
      }
    },
    variant_a: {
      name: 'Action-Oriented CTA',
      weight: 50,
      config: {
        ctaText: 'Start Saving Time Today',
        ctaColor: 'blue'
      }
    }
  },
  targeting: {
    includeNewVisitors: true,
    includeReturningVisitors: true,
    geotargeting: null,
    deviceTypes: ['desktop', 'mobile', 'tablet']
  },
  goals: {
    primary: 'cta_click',
    secondary: ['page_engagement', 'scroll_depth']
  }
};
```

**Step 2**: Add to `ACTIVE_TESTS` object in `abTesting.js`.

**Step 3**: Implement in React component:

```javascript
import { useABTest, ConversionButton } from '@/components/ui/ABTest';

function HomePage() {
  const variant = useABTest('homepage_cta_v1');
  
  return (
    <ConversionButton
      goal="homepage_cta_click"
      className={`px-8 py-4 rounded-lg font-semibold ${
        variant?.config.ctaColor === 'blue' ? 'bg-blue-600' : 'bg-teal-600'
      } text-white`}
    >
      {variant?.config.ctaText || 'Explore Models'}
    </ConversionButton>
  );
}
```

### 2. Pre-Built Test Components

#### Pricing A/B Test
```javascript
import { PricingABTest } from '@/components/ui/ABTest';

<PricingABTest model={model}>
  <span className="text-gray-300">USD</span>
</PricingABTest>
```

#### Email Capture A/B Test  
```javascript
import { EmailCaptureABTest } from '@/components/ui/ABTest';

<EmailCaptureABTest 
  onSubmit={(email, variant) => {
    // Handle email submission
    trackEmailSignup(email, { source: variant });
  }}
/>
```

#### Conversion Button
```javascript
import { ConversionButton } from '@/components/ui/ABTest';

<ConversionButton
  goal="model_purchase_intent"
  value={model.price}
  onClick={() => redirectToCheckout()}
>
  Buy Now - ${model.price.toLocaleString()}
</ConversionButton>
```

---

## Analytics & Tracking

### Event Types

#### 1. Test Exposures
Automatically tracked when user sees a test variant.
```javascript
trackTestExposure(testId, variant, {
  modelSlug: 'nvidia-3-statement-model',
  location: 'hero_section',
  modelPrice: 4985
});
```

#### 2. Conversion Events
Track when users complete desired actions.
```javascript
// Purchase conversion
trackPurchase({
  amount: 4985,
  modelSlug: 'nvidia-3-statement-model',
  modelTitle: 'NVIDIA 3-Statement Model',
  paymentMethod: 'stripe'
});

// Email signup
trackEmailSignup('user@company.com', {
  source: 'lead_magnet',
  incentive: 'Free DCF Template',
  page: '/models/nvidia-3-statement-model'
});

// Model engagement
trackModelEngagement('nvidia-3-statement-model', 'excel_preview', {
  previewDuration: 120,
  sheetsViewed: 3
});
```

### User Segmentation

The system automatically segments users based on behavior:

- **New Visitor**: First-time site visitor
- **Returning Visitor**: Has visited before
- **Engaged User**: 3+ page views in session
- **Price Sensitive**: Viewed pricing multiple times
- **High Intent**: Viewed model details
- **Enterprise**: Corporate email domain
- **Individual**: Personal email domain

### Automatic Tracking

The framework automatically tracks:
- Page views and scroll depth
- Form submissions
- Outbound link clicks
- Time on page milestones
- Email and phone link clicks

---

## Dashboard Usage

Access the A/B testing dashboard at `/admin/ab-testing`.

### Key Metrics

1. **Test Performance**:
   - Exposure count per variant
   - Conversion rate by variant
   - Statistical significance
   - Revenue impact

2. **Summary Statistics**:
   - Total active tests
   - Overall conversion rates
   - Revenue projections
   - Progress toward $50K goal

3. **Confidence Levels**:
   - **99% Confident**: Very significant (z > 2.58)
   - **95% Confident**: Significant (z > 1.96)  
   - **90% Confident**: Marginally significant (z > 1.65)
   - **Not Significant**: Need more data

### Revenue Impact Analysis

The dashboard shows:
- Projected monthly revenue based on current performance
- Progress toward $50K/month goal
- Additional conversions needed to reach target

---

## Best Practices

### 1. Test Design
- **One variable per test**: Isolate what you're testing
- **Sufficient sample size**: Minimum 100 conversions per variant
- **Statistical significance**: Wait for 95% confidence before conclusions
- **Test duration**: Run for at least 1-2 business cycles

### 2. Hypothesis Formation
Always start with a clear hypothesis:
- "I believe changing X will result in Y because Z"
- Base on data, user research, or established CRO principles

### 3. Prioritization
Use the ICE framework (Impact × Confidence × Ease):
- **Impact**: Potential revenue increase
- **Confidence**: How sure you are it will work
- **Ease**: Development effort required

### 4. Revenue-Focused Testing
- Prioritize tests that directly impact purchase conversion
- Test pricing presentation, value propositions, urgency
- Focus on high-traffic pages with purchase intent

### 5. User Experience
- Maintain consistent experience within sessions
- Test meaningful differences, not just cosmetic changes
- Consider mobile vs desktop user behavior

---

## Test Prioritization (ICE Framework)

### Scoring System (1-10 scale)

**Impact Score:**
- 10: Direct purchase conversion optimization
- 8-9: Email capture, pricing page improvements
- 6-7: Engagement features, navigation
- 4-5: Content improvements, social proof
- 1-3: Minor UI changes, footer elements

**Confidence Score:**
- 10: Based on strong data/research, proven principles
- 8-9: Good hypothesis with supporting evidence
- 6-7: Reasonable assumption based on best practices
- 4-5: Educated guess with some rationale
- 1-3: Shot in the dark, no supporting evidence

**Ease Score:**
- 10: Configuration change only
- 8-9: Simple copy/styling changes
- 6-7: New component, moderate development
- 4-5: Complex feature, database changes
- 1-3: Major architectural changes

### Priority Tests Queue

#### High Priority (ICE Score 7-10)
1. **Pricing Display Variations** (Current Test)
   - Impact: 9 | Confidence: 8 | Ease: 8 | **ICE: 8.3**

2. **Email Capture Lead Magnets**
   - Impact: 8 | Confidence: 9 | Ease: 7 | **ICE: 8.0**

3. **Model Page Value Proposition**  
   - Impact: 9 | Confidence: 7 | Ease: 8 | **ICE: 8.0**

4. **Homepage Hero Section**
   - Impact: 8 | Confidence: 8 | Ease: 8 | **ICE: 8.0**

5. **Purchase Flow Optimization**
   - Impact: 10 | Confidence: 8 | Ease: 6 | **ICE: 8.0**

#### Medium Priority (ICE Score 5-7)
6. **Social Proof Elements**
7. **FAQ Section Optimization**
8. **Mobile Experience Enhancement**
9. **Newsletter Signup Placement**
10. **Contact Form Simplification**

---

## Troubleshooting

### Common Issues

#### 1. No Test Data Appearing
**Cause**: Users not being assigned to tests
**Solution**:
- Check test status is 'active' in `abTesting.js`
- Verify targeting criteria aren't too restrictive
- Check browser console for JavaScript errors

#### 2. Statistical Significance Not Reached
**Cause**: Insufficient sample size
**Solution**:
- Increase test traffic allocation
- Run test longer
- Consider testing on higher-traffic pages
- Reduce minimum effect size threshold

#### 3. Inconsistent Results
**Cause**: External factors affecting conversion
**Solution**:
- Check for seasonal variations
- Analyze by user segment
- Look for technical issues during test period
- Consider external marketing campaigns impact

#### 4. Database Connection Issues
**Cause**: API endpoint failures
**Solution**:
- Check PostgreSQL connection
- Verify environment variables
- Check API endpoint `/api/ab-analytics` status
- Review database table permissions

### Debug Mode

Enable debug logging by setting in browser console:
```javascript
localStorage.setItem('ab_debug', 'true');
```

This will log:
- Test assignments
- Conversion tracking events
- API requests/responses
- User segmentation details

---

## Technical Reference

### API Endpoints

#### POST `/api/ab-analytics`
Track test exposures and conversions.

```javascript
// Example payload
{
  "eventType": "ab_conversion",
  "goal": "model_purchase",
  "value": 4985,
  "sessionId": "uuid-string",
  "userSegment": "high_intent",
  "page": "/models/nvidia-3-statement-model",
  "testAssignments": {
    "pricing_display_v1": {
      "variant": "variant_a",
      "assignedAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

#### GET `/api/ab-analytics?period=30`
Retrieve test results and analytics.

### Environment Variables
- `POSTGRES_URL`: Database connection string
- `POSTGRES_URL_NON_POOLING`: Direct database connection
- `NEXT_PUBLIC_GA_ID`: Google Analytics tracking ID

### Performance Considerations
- Test assignments cached in localStorage
- Minimal JavaScript payload impact
- Database queries optimized with indexes
- Graceful degradation if tracking fails

---

## Revenue Optimization Strategy

### Month 1-2: Foundation (Current)
- Implement pricing display test ✓
- Set up tracking and dashboard ✓
- Test email capture strategies

### Month 3-4: Conversion Optimization  
- Purchase flow improvements
- Model page value proposition tests
- Social proof and urgency elements

### Month 5-6: Scale & Retention
- Advanced segmentation tests
- Personalization based on user behavior
- Customer lifecycle optimization

### Target Metrics
- **Month 1**: 2% conversion rate baseline
- **Month 3**: 3.5% conversion rate (+75% improvement)
- **Month 6**: 5% conversion rate (+150% improvement)
- **Revenue Goal**: $50K/month through optimized conversion funnel

---

*Last updated: January 2025*
*Version: 1.0*