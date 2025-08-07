# DATABASE INITIALIZATION GUIDE

## Current Status
Your staging deployment is live but has **Vercel Authentication Protection** enabled, which prevents public access and API calls.

## Immediate Actions Required

### 1. Disable Authentication Protection
1. Go to: https://vercel.com/mjschmitts-projects/zencap-website/settings
2. Click "General" in the sidebar
3. Find "Vercel Authentication" section
4. Toggle OFF "Password Protection" or "Vercel Authentication"
5. Save changes

### 2. Initialize Database Tables
Once authentication is disabled, run this command:
```bash
curl -X POST https://zencap-website-q0ay052st-mjschmitts-projects.vercel.app/api/init-db -H "Content-Type: application/json"
```

This will create all necessary tables:
- `customers` - Stripe customer records
- `orders` - Purchase history
- `payment_methods` - Saved payment methods
- `subscriptions` - Monthly subscription data
- `subscription_items` - Subscription line items
- `prices` - Stripe price records
- `products` - Stripe product catalog
- `invoices` - Billing invoices
- `coupons` - Discount codes
- `email_logs` - Email transaction history
- `audit_logs` - Security audit trail

### 3. Verify Database Connection
Your existing Neon Postgres database from 27 days ago should be connected:
- Database: `neondb`
- Host: `ep-twilight-cake-a4vqpjxg.us-east-1.aws.neon.tech`
- Created: 27 days ago

### 4. Test Payment Flow
After initialization:
1. Visit: https://zencap-website-q0ay052st-mjschmitts-projects.vercel.app
2. Navigate to /models
3. Select any model and click "Purchase"
4. Use test card: 4242 4242 4242 4242
5. Any future expiry date and any 3-digit CVC
6. Complete the purchase
7. Verify success page appears
8. Check Stripe Dashboard for payment: https://dashboard.stripe.com/test/payments

## Alternative: Keep Authentication Enabled
If you prefer to keep authentication for security:
1. Visit the staging URL
2. Click "Login with Vercel" 
3. Authenticate with your Vercel account
4. Then manually navigate to: `/api/init-db`
5. Click to trigger the initialization

## Troubleshooting

### If Database Init Fails
Check these environment variables in Vercel:
- `POSTGRES_URL` - Should point to your Neon database
- `POSTGRES_URL_NON_POOLING` - Non-pooling connection string
- `POSTGRES_DATABASE` - Should be "neondb"

### If Payments Don't Work
Verify in Vercel Dashboard:
- `STRIPE_SECRET_KEY` - Starts with sk_test_
- `STRIPE_WEBHOOK_SECRET` - Starts with whsec_
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Starts with pk_test_

## Next Steps
Once database is initialized:
1. Make a test purchase to verify full flow
2. Check database records are created
3. Verify webhook events in Stripe Dashboard
4. Test email notifications (if SendGrid configured)
5. Consider enabling authentication back for security

## Production Launch Checklist
- [ ] Switch to LIVE Stripe keys
- [ ] Configure production domain
- [ ] Enable SSL certificate
- [ ] Setup monitoring (Vercel Analytics)
- [ ] Configure error tracking
- [ ] Setup backup strategy
- [ ] Document admin procedures