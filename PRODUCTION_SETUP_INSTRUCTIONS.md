# PRODUCTION ENVIRONMENT SETUP INSTRUCTIONS
## Zenith Capital Advisors - Critical Setup Guide

### 1. DATABASE SETUP (Vercel Postgres)
1. Go to Vercel Dashboard > Storage > Create Database > Postgres
2. Copy connection strings from Vercel dashboard
3. Update POSTGRES_URL and POSTGRES_URL_NON_POOLING in .env.production

### 2. EMAIL SETUP (SendGrid)
1. Go to SendGrid dashboard > API Keys
2. Create new API key with "Mail Send" permissions
3. Update SENDGRID_API_KEY in .env.production

### 3. STRIPE SETUP (LIVE KEYS)
1. Go to Stripe Dashboard > Developers > API Keys
2. Copy LIVE secret key (starts with sk_live_)
3. Copy LIVE publishable key (starts with pk_live_)
4. Go to Webhooks > Create endpoint > https://zencap.co/api/stripe/webhook
5. Copy webhook secret (starts with whsec_)
6. Update all Stripe variables in .env.production

### 4. GOOGLE ANALYTICS 4
1. Go to Google Analytics > Admin > Property > Data Streams
2. Copy Measurement ID (format: G-XXXXXXXXXX)
3. Update NEXT_PUBLIC_GA_ID in .env.production

### 5. VERCEL DEPLOYMENT
1. Run: vercel env add [VARIABLE_NAME] production
2. Or use the generated vercel-env-setup.sh script
3. Deploy with: vercel --prod

### 6. DOMAIN SETUP
1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Verify HTTPS is working

### 7. VERIFICATION CHECKLIST
- [ ] Database connection tested
- [ ] Email sending works
- [ ] Stripe payments work
- [ ] Analytics tracking active
- [ ] All critical environment variables set
- [ ] HTTPS enabled
- [ ] Performance monitoring active

### 8. MONITORING SETUP
- Set up Vercel Analytics
- Configure error tracking
- Set up uptime monitoring
- Configure performance alerts

### CRITICAL SECURITY NOTES:
- Never commit .env.production to git
- Use strong, unique passwords
- Enable 2FA on all accounts
- Regularly rotate API keys
- Monitor for security alerts

### EMERGENCY CONTACTS:
- DevOps: devops@zencap.co
- Security: security@zencap.co  
- Emergency: emergency@zencap.co
