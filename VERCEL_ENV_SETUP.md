# Vercel Environment Variables Setup

## Critical Environment Variables for Checkout

To fix the checkout flow, ensure these environment variables are set in your Vercel project:

### 1. Database (Required)
```
POSTGRES_URL=postgresql://username:password@hostname:port/database
POSTGRES_URL_NON_POOLING=postgresql://username:password@hostname:port/database
```

### 2. Stripe (Required)
```
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
```

### 3. NextAuth (Optional - but helps prevent errors)
```
NEXTAUTH_SECRET=your-random-secret-key-at-least-32-chars
NEXTAUTH_URL=https://your-vercel-deployment-url.vercel.app
```

### 4. Email (Optional - for order confirmations)
```
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@yourcompany.com
```

### 5. Application Settings
```
NEXT_PUBLIC_BASE_URL=https://your-vercel-deployment-url.vercel.app
NODE_ENV=production
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" tab
4. Click "Environment Variables" in the sidebar
5. Add each variable above

## Testing the Fix

After adding the environment variables:

1. Redeploy your application
2. Visit `/api/init-nextauth-tables` to initialize database tables
3. Test checkout flow by clicking "Buy Now" on any model
4. Verify successful redirect to Stripe checkout

## Troubleshooting

### If checkout still fails:
- Check Vercel function logs for errors
- Verify all environment variables are set correctly
- Ensure database is accessible from Vercel
- Test Stripe API keys in Stripe dashboard

### If NextAuth errors persist:
- Add NEXTAUTH_SECRET and NEXTAUTH_URL
- Or temporarily rename `/api/auth/[...nextauth].js` to disable auth

## Database Tables Required

The checkout flow needs these tables (auto-created by init script):
- `users` - For optional user accounts
- `sessions` - For NextAuth sessions
- `accounts` - For NextAuth provider accounts  
- `verification_tokens` - For NextAuth email verification
- `orders` - For purchase tracking (guest-friendly)

Run this URL after deployment to create tables:
`https://your-deployment-url.vercel.app/api/init-nextauth-tables`