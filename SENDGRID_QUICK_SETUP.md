# 📧 SendGrid Quick Setup (30 Minutes)

## Step 1: Create SendGrid Account (5 mins)
1. Go to [SendGrid.com](https://sendgrid.com)
2. Click "Start for Free"
3. Sign up with your email
4. Verify your email address

## Step 2: Create API Key (2 mins)
1. Dashboard → Settings → **API Keys**
2. Click **Create API Key**
3. Name: "Zenith Capital Production"
4. Permissions: **Full Access** (or Restricted with Mail Send)
5. Copy the key (starts with `SG.`)
6. **SAVE IT - You won't see it again!**

## Step 3: Add to Vercel (2 mins)
1. Go to Vercel Dashboard → zencap-website → Settings → **Environment Variables**
2. Add new variable:
   - Key: `SENDGRID_API_KEY`
   - Value: `SG.your-actual-key-here`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
3. Click **Save**

## Step 4: Configure Sender Identity (5 mins)
1. SendGrid Dashboard → Settings → **Sender Authentication**
2. Choose: **Single Sender Verification** (fastest)
3. Add sender:
   - From Email: `info@yourdomain.com` or `noreply@yourdomain.com`
   - From Name: `Zenith Capital Advisors`
   - Reply To: `info@yourdomain.com`
4. Verify the email address

## Step 5: Test Email System (2 mins)
```bash
# Test all email templates
curl "https://zencap-website.vercel.app/api/test-email?testType=all&testEmail=your@email.com"

# Test individual templates
curl "https://zencap-website.vercel.app/api/test-email?testType=order-confirmation&testEmail=your@email.com"
curl "https://zencap-website.vercel.app/api/test-email?testType=newsletter-welcome&testEmail=your@email.com"
```

## Step 6: Update Environment Variables (2 mins)
Add these to Vercel:
```
SENDGRID_FROM_EMAIL=info@yourdomain.com
SENDGRID_FROM_NAME=Zenith Capital Advisors
```

## Optional: Domain Authentication (10 mins)
For better deliverability:
1. SendGrid → Settings → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Add DNS records provided by SendGrid
4. Wait for verification (up to 48 hours)

## Email Templates Ready to Use

Your platform has 5 pre-built templates:

1. **Order Confirmation** - Sent after purchase
2. **Contact Form Notification** - Admin alert for new contacts
3. **Contact Form Confirmation** - User confirmation
4. **Newsletter Welcome** - New subscriber welcome
5. **Password Reset** - Account recovery

## Testing Checklist

✅ Send test email via API endpoint
✅ Submit contact form → Receive notification
✅ Newsletter signup → Welcome email
✅ Complete purchase → Order confirmation
✅ Check spam folder (may need domain auth)

## Quick Troubleshooting

**Emails not sending?**
- Verify API key in Vercel
- Check sender email is verified
- Look at Vercel Function logs

**Going to spam?**
- Complete domain authentication
- Add SPF/DKIM records
- Use verified sender address

**Rate limited?**
- Free tier: 100 emails/day
- Upgrade for higher volume

## SendGrid Limits

**Free Tier:**
- 100 emails/day forever

**Essentials ($19.95/month):**
- 50,000 emails/month
- Dedicated IP available

## Ready to Test?

```bash
# Quick test from command line
curl -X POST https://zencap-website.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testType": "basic", "testEmail": "your@email.com"}'
```

## Next Steps
4. ✅ Final UI Polish
5. ✅ Analytics Integration  
6. ✅ Launch Marketing

Your emails will be working in minutes!