# 🔌 STRIPE WEBHOOK SETUP GUIDE

## 📍 DYNAMIC PORT SOLUTION

This guide ensures webhooks work regardless of which port your dev server uses (3000, 3001, 3002, etc.).

---

## 🚀 QUICK START (LOCAL DEVELOPMENT)

### Option 1: Automated Setup Script
```bash
node scripts/setup-stripe-webhook.js
# Select option 1 for local development
```

### Option 2: Manual Setup with Stripe CLI

1. **Install Stripe CLI** (one-time setup)
   - Windows: Download from [GitHub Releases](https://github.com/stripe/stripe-cli/releases)
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Linux: Download from releases page

2. **Login to Stripe** (one-time setup)
   ```bash
   stripe login
   ```

3. **Start Webhook Listener** (run in separate terminal)
   ```bash
   # For port 3001 (default)
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   
   # For custom port
   stripe listen --forward-to localhost:YOUR_PORT/api/stripe/webhook
   
   # Or use the batch file (Windows)
   scripts\stripe-webhook-listener.bat 3001
   ```

4. **Copy the Webhook Secret**
   The CLI will display:
   ```
   Your webhook signing secret is whsec_xxxxxxxxxxxxx
   ```

5. **Add to .env.local**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

6. **Restart Dev Server**
   ```bash
   npm run dev
   ```

---

## 🌐 STAGING/PREVIEW DEPLOYMENT

### Vercel Preview Deployments

1. **Deploy to Vercel**
   ```bash
   vercel
   ```
   Note your preview URL: `your-app-abc123.vercel.app`

2. **Create Webhook in Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - URL: `https://your-app-abc123.vercel.app/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
   - Copy the signing secret

3. **Add to Vercel Environment Variables**
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET
   # Paste the webhook secret when prompted
   ```

---

## 🏭 PRODUCTION DEPLOYMENT

### Live Domain Setup

1. **Switch to LIVE Mode in Stripe**
   Toggle from "Test" to "Live" in Stripe Dashboard

2. **Create Production Webhook**
   - Go to: https://dashboard.stripe.com/webhooks (LIVE mode)
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.failed`
     - `charge.dispute.created`
   - Copy the signing secret

3. **Add to Production Environment**
   In Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Add `STRIPE_WEBHOOK_SECRET` (Production only)
   - Add your live webhook secret

---

## 🧪 TESTING WEBHOOKS

### Local Testing with Stripe CLI
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start webhook listener
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Terminal 3: Trigger test event
stripe trigger payment_intent.succeeded
```

### Test with Real Payment
1. Go to http://localhost:3001/models
2. Click "Buy Now"
3. Use test card: `4242 4242 4242 4242`
4. Check terminal for webhook logs

### Verify Webhook is Working
```bash
# Check your webhook endpoint directly
curl -X POST http://localhost:3001/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'

# Should return: "Webhook signature verification failed"
# This means the endpoint exists and is checking signatures
```

---

## 🔍 TROUBLESHOOTING

### Issue: Port keeps changing
**Solution**: Use our dynamic setup script
```bash
node scripts/setup-stripe-webhook.js
```

### Issue: Webhook signature verification failed
**Causes**:
1. Wrong webhook secret in .env.local
2. Using test secret with live webhook or vice versa
3. Stripe CLI not running (for local testing)

**Fix**:
```bash
# Make sure webhook secret matches
echo $STRIPE_WEBHOOK_SECRET

# Restart Stripe CLI with correct port
stripe listen --forward-to localhost:YOUR_CURRENT_PORT/api/stripe/webhook
```

### Issue: Webhook not receiving events
**Check**:
1. Is Stripe CLI running?
2. Is dev server running?
3. Correct port in webhook URL?
4. Check Stripe Dashboard → Webhooks → Recent deliveries

---

## 📊 WEBHOOK EVENTS EXPLAINED

### Essential Events
- **checkout.session.completed**: Customer completed payment
- **payment_intent.succeeded**: Payment confirmed
- **payment_intent.failed**: Payment failed

### Additional Events (Optional)
- **customer.subscription.created**: For subscriptions
- **customer.subscription.deleted**: Subscription cancelled
- **invoice.payment_succeeded**: Recurring payment successful
- **charge.dispute.created**: Customer disputed charge

---

## 🔒 SECURITY BEST PRACTICES

1. **Always Verify Signatures**
   Our webhook handler already does this:
   ```javascript
   const sig = req.headers['stripe-signature'];
   const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
   ```

2. **Use Environment-Specific Secrets**
   - Development: `whsec_test_xxx`
   - Production: `whsec_live_xxx`
   - Never mix test/live secrets

3. **Idempotency**
   - Webhooks may be sent multiple times
   - Our handler checks if order already exists

4. **Timeout Handling**
   - Respond quickly (< 20 seconds)
   - Process heavy tasks asynchronously

---

## 🚦 QUICK COMMANDS

```bash
# Setup webhook (interactive)
node scripts/setup-stripe-webhook.js

# Start webhook listener (Windows)
scripts\stripe-webhook-listener.bat 3001

# Start webhook listener (Mac/Linux)
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Test webhook
stripe trigger payment_intent.succeeded

# View webhook logs
stripe logs tail
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Stripe CLI installed
- [ ] Logged into Stripe CLI
- [ ] Webhook listener running
- [ ] Webhook secret in .env.local
- [ ] Dev server restarted
- [ ] Test payment successful
- [ ] Webhook logs showing events

Once all items are checked, your webhooks are fully configured!