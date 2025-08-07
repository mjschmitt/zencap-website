# 📊 Analytics Setup Guide - Track Everything!

## 1. Google Analytics 4 (GA4) - 15 minutes

### Step 1: Create GA4 Property
1. Go to [analytics.google.com](https://analytics.google.com)
2. Admin → Create Property
3. Property name: "Zenith Capital Advisors"
4. Business details:
   - Industry: Financial Services
   - Business size: Small
5. Business objectives: 
   - ✅ Generate leads
   - ✅ Drive online sales
   - ✅ Examine user behavior

### Step 2: Get Measurement ID
1. Admin → Data Streams → Web
2. URL: https://zencap.co
3. Stream name: "ZenCap Website"
4. Copy Measurement ID (G-XXXXXXXXXX)

### Step 3: Add to Vercel
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 4: Set Up Conversions
Track these key events:
1. **purchase_completed** - Model purchase
2. **lead_generated** - Contact form submission
3. **newsletter_signup** - Email subscription
4. **model_viewed** - Product page view
5. **checkout_started** - Begin purchase

### Step 5: Enhanced Ecommerce
1. Admin → Events → Modify events
2. Create events for:
   - view_item (model page)
   - add_to_cart (buy button click)
   - begin_checkout
   - purchase

### Step 6: Custom Dimensions
Add these for better insights:
- model_name
- model_category (private/public equity)
- model_price
- user_type (visitor/lead/customer)

## 2. Google Tag Manager (GTM) - Optional but Powerful

### Benefits:
- No code changes for new tracking
- A/B testing capabilities
- Advanced event tracking
- Third-party integrations

### Quick Setup:
1. Create account at [tagmanager.google.com](https://tagmanager.google.com)
2. Container name: "ZenCap Website"
3. Add container snippet to _app.js
4. Configure GA4 tag in GTM

## 3. Hotjar - User Behavior (10 minutes)

### Setup:
1. Sign up at [hotjar.com](https://hotjar.com) (free tier available)
2. Add site: zencap.co
3. Get tracking code
4. Add to Vercel: `NEXT_PUBLIC_HOTJAR_ID=XXXXXXX`

### Features to Enable:
- **Heatmaps**: See where users click
- **Recordings**: Watch user sessions
- **Feedback**: On-site surveys
- **Funnels**: Track conversion paths

## 4. Microsoft Clarity - Free Alternative to Hotjar

### Setup:
1. Go to [clarity.microsoft.com](https://clarity.microsoft.com)
2. Create project: "Zenith Capital"
3. Get tracking code
4. Add to site

### Benefits:
- 100% free forever
- No traffic limits
- Session recordings
- Heatmaps
- AI insights

## 5. Stripe Analytics - Built-in Revenue Tracking

### Access:
1. Stripe Dashboard → Analytics
2. Track:
   - Revenue by model
   - Conversion rates
   - Customer lifetime value
   - Failed payments

### Connect to GA4:
Use Stripe's dataLayer events to send purchase data to GA4

## 6. Custom Analytics Dashboard

### Create a simple dashboard at `/admin/analytics`:
```javascript
// Key Metrics to Display
- Total Revenue
- Conversion Rate
- Top Models
- Traffic Sources
- User Geography
- Device Types
- Page Performance
```

## 7. Set Up Goals & KPIs

### Primary KPIs:
- **Conversion Rate**: Target 2-3%
- **Average Order Value**: $3,985
- **Cart Abandonment**: <70%
- **Page Load Time**: <2s
- **Bounce Rate**: <50%

### Secondary Metrics:
- Newsletter signups
- Contact form submissions
- Model page engagement time
- Download completion rate

## 8. Privacy Compliance

### Cookie Consent:
```javascript
// Add to _app.js
import CookieConsent from 'react-cookie-consent';

<CookieConsent
  location="bottom"
  buttonText="Accept"
  cookieName="zencap-analytics-consent"
  style={{ background: "#1e3a8a" }}
  buttonStyle={{ background: "#0d9488", color: "white" }}
>
  We use cookies to improve your experience and analyze site traffic.
</CookieConsent>
```

### Update Privacy Policy:
- List all analytics tools
- Explain data collection
- Provide opt-out instructions

## 9. Testing Your Analytics

### Verify Installation:
1. **GA4 DebugView**: Admin → DebugView
2. **GTM Preview**: Click Preview in GTM
3. **Browser Extensions**: GA Debugger

### Test Events:
```javascript
// Test purchase event
gtag('event', 'purchase', {
  transaction_id: '123',
  value: 4985,
  currency: 'USD',
  items: [{
    item_id: 'multifamily-model',
    item_name: 'Multifamily Acquisition Model',
    price: 4985,
    quantity: 1
  }]
});
```

## 10. Monitoring Setup

### Weekly Reports:
- Revenue trends
- Traffic sources
- Conversion funnel
- User behavior

### Alerts to Configure:
- Revenue drops >20%
- Conversion rate <1%
- Page errors spike
- Cart abandonment >80%

## Quick Implementation Code

### Add to your _app.js:
```javascript
// Google Analytics
useEffect(() => {
  const handleRouteChange = (url) => {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  };
  router.events.on('routeChangeComplete', handleRouteChange);
  return () => {
    router.events.off('routeChangeComplete', handleRouteChange);
  };
}, [router.events]);
```

### Track Custom Events:
```javascript
// Track model view
const trackModelView = (model) => {
  gtag('event', 'view_item', {
    currency: 'USD',
    value: model.price,
    items: [{
      item_id: model.slug,
      item_name: model.title,
      item_category: model.category,
      price: model.price
    }]
  });
};

// Track purchase start
const trackCheckoutStart = (model) => {
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: model.price,
    items: [{ item_id: model.slug }]
  });
};
```

## ROI Tracking

### Calculate:
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Return on Ad Spend (ROAS)
- Model profitability

### Formula:
```
Revenue per Model = $3,985 average
Conversion Rate = 2%
Traffic Needed = 50 visitors per sale
CAC = Marketing Spend / Customers
ROI = (Revenue - CAC) / CAC * 100
```

## Next Priority: Launch Marketing!

With analytics in place, you'll know exactly:
- Where customers come from
- What they engage with
- Why they buy (or don't)
- How to optimize for more sales

Ready to set up GA4 now, or continue to launch marketing?