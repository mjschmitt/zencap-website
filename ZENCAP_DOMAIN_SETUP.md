# ⚡ QUICK DOMAIN SETUP FOR ZENCAP.CO (Google Workspace)

## Step 1: Add Domain to Vercel (2 mins)
1. Go to: https://vercel.com/dashboard
2. Click your `zencap-website` project
3. Settings → Domains
4. Type: `zencap.co` → Add
5. Also add: `www.zencap.co` → Add

## Step 2: Configure DNS in Google Domains (5 mins)

### Go to: https://domains.google.com
1. Click `zencap.co`
2. Click **DNS** on the left menu
3. Scroll to **Custom resource records**

### Add these records:

**For root domain (zencap.co):**
```
Name: @
Type: A
TTL: 3600
Data: 76.76.21.21
```

**For www subdomain:**
```
Name: www
Type: CNAME
TTL: 3600
Data: cname.vercel-dns.com
```

### Click "Add" for each record

## Step 3: Update Vercel Environment Variables (2 mins)
1. Vercel Dashboard → Settings → Environment Variables
2. Add/Update:
```
NEXT_PUBLIC_SITE_URL=https://zencap.co
NEXT_PUBLIC_BASE_URL=https://zencap.co
```
3. Click Save

## Step 4: Verify (5-30 mins for DNS)
```bash
# Check DNS propagation
nslookup zencap.co

# Once propagated, your site will be live at:
https://zencap.co
https://www.zencap.co
```

## Step 5: Update Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Update endpoint URL to: `https://zencap.co/api/stripe/webhook`

## That's it! Your domain will be live in 5-30 minutes!

### ✅ SSL Certificate: Automatic (Vercel handles it)
### ✅ Both www and non-www will work
### ✅ Professional domain ready for launch!