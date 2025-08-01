# Database & Email Integration Setup Guide

## Overview
Your investment advisory website now has a production-ready database and email system integrated with PostgreSQL and SendGrid.

## What's Been Implemented

### ✅ Database Schema
- **Leads Table**: Stores all contact form submissions
- **Newsletter Subscribers Table**: Manages newsletter subscriptions
- **Form Submissions Log**: Tracks all form interactions for analytics

### ✅ Email System
- **Professional Email Templates**: Branded with your company colors
- **Automated Notifications**: Admin gets notified of new leads
- **Confirmation Emails**: Users receive professional confirmations
- **Welcome Emails**: Newsletter subscribers get welcome messages

### ✅ API Routes
- `/api/contact`: Handles contact form submissions
- `/api/newsletter`: Manages newsletter subscriptions
- `/api/init-db`: Initializes database tables

## Setup Instructions

### 1. Database Setup (Choose One)

#### Option A: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select your existing project
3. Go to "Storage" → "Create Database" → "Postgres"
4. Copy the connection details to your `.env.local`

#### Option B: Supabase (Free Tier Available)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string to your `.env.local`

#### Option C: Railway (Simple Setup)
1. Go to [Railway](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection details to your `.env.local`

### 2. SendGrid Setup
1. Go to [SendGrid](https://sendgrid.com)
2. Create a free account (100 emails/day free)
3. Go to Settings → API Keys
4. Create a new API key with "Mail Send" permissions
5. Add your domain for sending emails
6. Copy the API key to your `.env.local`

### 3. Environment Variables
Create a `.env.local` file with:

```env
# Database Configuration
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_HOST=your-postgres-host
POSTGRES_DATABASE=your-database-name
POSTGRES_USERNAME=your-username
POSTGRES_PASSWORD=your-password

# SendGrid Email Service
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=info@zencap.co
SENDGRID_FROM_NAME=Zenith Capital Advisors

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://zencap.co
NEXT_PUBLIC_SITE_NAME=Zenith Capital Advisors

# Database Initialization (optional)
DB_INIT_SECRET=your-secret-key-here
```

### 4. Initialize Database
After setting up your database, run:

```bash
# Test database connection
curl -X POST http://localhost:3000/api/init-db \
  -H "Authorization: Bearer your-secret-key-here" \
  -H "Content-Type: application/json"
```

Or visit: `http://localhost:3000/api/init-db` with proper authorization header.

### 5. Test Email Configuration
Add this to your `.env.local` for testing:

```env
# Test email configuration
SENDGRID_TEST_EMAIL=your-test-email@example.com
```

## Features

### Contact Form
- ✅ Stores leads in database
- ✅ Sends notification email to admin
- ✅ Sends confirmation email to user
- ✅ Tracks analytics events
- ✅ Fallback to Formspree if database fails

### Newsletter Signup
- ✅ Stores subscribers in database
- ✅ Sends welcome email
- ✅ Prevents duplicate subscriptions
- ✅ Tracks analytics events
- ✅ Fallback to Formspree if database fails

### Professional Email Templates
- ✅ Branded with your company colors (navy blue & teal)
- ✅ Mobile-responsive design
- ✅ Professional formatting
- ✅ Clear call-to-actions

## Next Steps

### Phase 2: Admin Dashboard
Create a simple dashboard to view and manage leads:

```bash
# Create admin dashboard
mkdir -p src/pages/admin
touch src/pages/admin/index.js
touch src/pages/admin/leads.js
```

### Phase 3: CRM Integration
Integrate with HubSpot, Salesforce, or other CRM systems.

### Phase 4: Email Marketing
Connect with Mailchimp, ConvertKit, or other email marketing platforms.

## Troubleshooting

### Database Connection Issues
1. Check your `POSTGRES_URL` format
2. Verify database credentials
3. Ensure database is accessible from your deployment platform

### Email Delivery Issues
1. Verify SendGrid API key
2. Check sender email domain verification
3. Review SendGrid activity logs

### Form Submission Errors
1. Check browser console for errors
2. Verify API routes are accessible
3. Review server logs for detailed error messages

## Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different credentials for development and production
- Rotate API keys regularly

### Database Security
- Use connection pooling in production
- Implement proper authentication for admin routes
- Regular database backups

### Email Security
- Verify sender domain in SendGrid
- Implement rate limiting for form submissions
- Monitor for spam/abuse

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test database connection separately
4. Review SendGrid activity logs

## Cost Estimation

### Development (Free)
- Vercel Postgres: Free tier available
- SendGrid: 100 emails/day free
- Supabase: Free tier available

### Production (Monthly)
- Vercel Postgres: $20/month (Pro plan)
- SendGrid: $15/month (1000 emails/day)
- Total: ~$35/month for full production setup

This setup gives you complete control over your data and professional email communication, which is essential for a financial services business. 