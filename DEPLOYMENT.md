# ZenCap Deployment Guide

## Quick Deployment Commands

### Pre-requisites
```bash
# Install Vercel CLI globally
npm install -g vercel

# Set environment variables
export VERCEL_TOKEN=your_token_here
```

### Environment Setup
1. Copy `env.example` to `.env.local`
2. Fill in required values:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY` 
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXTAUTH_SECRET`
   - `POSTGRES_URL`
   - `SENDGRID_API_KEY`

### Deployment Commands

```bash
# Check deployment readiness
npm run pre-deploy

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Emergency rollback
npm run rollback

# Monitor deployments
npm run monitor

# Quick health check
npm run health-check
```

## GitHub Actions Setup

Add these secrets to your GitHub repository:

### Required Secrets
- `VERCEL_TOKEN`: Your Vercel deployment token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `POSTGRES_URL`: Production database URL
- `SENDGRID_API_KEY`: SendGrid API key
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID

### Environment Variables
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `NEXTAUTH_SECRET`: NextAuth secret (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Production URL

## Manual Deployment Steps

### 1. Staging Deployment
```bash
# Run pre-checks
npm run pre-deploy

# Deploy to staging
vercel --token=$VERCEL_TOKEN

# Test staging deployment
curl -f [staging-url]/api/health
```

### 2. Production Deployment
```bash
# Final checks
npm run pre-deploy
npm run build
npm test

# Deploy to production
vercel --prod --token=$VERCEL_TOKEN

# Verify deployment
curl -f [production-url]/api/health
```

### 3. Emergency Procedures

#### Quick Rollback
```bash
npm run rollback
# or manually
vercel rollback --token=$VERCEL_TOKEN
```

#### Health Check
```bash
# Check all services
curl -f https://your-domain.com/api/health

# Check database
curl -f https://your-domain.com/api/verify-database
```

## Monitoring

### Automated Monitoring
```bash
# Start continuous monitoring
npm run monitor

# Check deployment logs
vercel logs --token=$VERCEL_TOKEN
```

### Health Endpoints
- `/api/health` - Overall system health
- `/api/verify-database` - Database connectivity
- `/health-check` - Redirects to health API

## Environment Configuration

### Development
```bash
npm run dev
```

### Production Build Test
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check `npm run lint`
   - Verify environment variables
   - Clear `.next` directory

2. **Database Issues**
   - Verify `POSTGRES_URL`
   - Run `/api/verify-database`
   - Check connection limits

3. **Deployment Timeouts**
   - Check file sizes
   - Verify Vercel function limits
   - Review build logs

### Emergency Contacts
- DevOps Lead: [Contact Info]
- Database Admin: [Contact Info]
- Vercel Support: [Account Info]

## Security Checklist

- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] File upload limits set
- [ ] Rate limiting enabled

## Performance Targets

- **Build Time**: < 3 minutes
- **Cold Start**: < 5 seconds
- **Health Check**: < 2 seconds
- **Page Load**: < 3 seconds
- **Uptime**: > 99.9%