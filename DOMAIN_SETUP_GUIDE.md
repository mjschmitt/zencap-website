# 🌐 Custom Domain Setup Guide for Zenith Capital Advisors

## Quick Setup (15 minutes)

### Step 1: Add Domain to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `zencap-website` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain (e.g., `zencap.co` or `zenithcapitaladvisors.com`)
6. Click **Add**

### Step 2: Configure DNS Records

Vercel will show you the DNS records to add. Typically:

#### Option A: Root Domain (zencap.co)
Add these A records to your DNS provider:
```
Type: A
Name: @
Value: 76.76.21.21
```

#### Option B: Subdomain (www.zencap.co)
Add this CNAME record:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Recommended Setup (Both root and www):
1. A record for root domain → 76.76.21.21
2. CNAME for www → cname.vercel-dns.com
3. Enable redirect from non-www to www (or vice versa) in Vercel

### Step 3: Update Environment Variables

Add these to Vercel environment variables:
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Step 4: Wait for Propagation
- DNS changes take 5-48 hours to propagate globally
- Vercel will auto-provision SSL certificate (usually within minutes)

### Step 5: Verify Setup
```bash
# Check DNS propagation
nslookup yourdomain.com

# Test the site
curl -I https://yourdomain.com
```

## Popular DNS Providers Setup

### GoDaddy
1. Login to GoDaddy → My Products → DNS
2. Add A record: @ → 76.76.21.21
3. Add CNAME: www → cname.vercel-dns.com

### Namecheap
1. Dashboard → Domain List → Manage → Advanced DNS
2. Add A record: @ → 76.76.21.21
3. Add CNAME: www → cname.vercel-dns.com

### Cloudflare
1. DNS → Records
2. Add A record: @ → 76.76.21.21 (Proxy: OFF)
3. Add CNAME: www → cname.vercel-dns.com (Proxy: OFF)

### Google Domains
1. DNS → Custom records
2. Add A record: @ → 76.76.21.21
3. Add CNAME: www → cname.vercel-dns.com

## Post-Domain Setup Checklist

✅ Domain pointing to Vercel
✅ SSL certificate active (automatic)
✅ Both www and non-www working
✅ Environment variables updated
✅ Test all pages with new domain
✅ Update Stripe webhook URL to new domain
✅ Update any hardcoded URLs in code
✅ Submit sitemap to Google Search Console

## Troubleshooting

**Domain not working after 24 hours?**
- Check DNS records are exactly as shown
- Disable proxy if using Cloudflare
- Verify domain is active (not expired)

**SSL certificate error?**
- Vercel auto-provisions SSL
- May take up to 24 hours
- Check domain verification in Vercel

**Redirect loops?**
- Check Vercel redirect settings
- Ensure no conflicting redirects at DNS level

## Need a Domain?

Recommended registrars:
- **Namecheap**: $8-12/year for .com
- **Google Domains**: $12/year for .com
- **Cloudflare**: $8.57/year for .com (at cost)

Premium options for financial services:
- `.financial` - $50/year
- `.capital` - $50/year
- `.investments` - $100/year
- `.ventures` - $50/year

## Ready to Continue?

Once DNS is configured, we'll move to:
3. ✅ SendGrid Email Setup
4. ✅ Final UI Polish
5. ✅ Analytics Integration
6. ✅ Launch Marketing

Your domain will be live within minutes to hours!