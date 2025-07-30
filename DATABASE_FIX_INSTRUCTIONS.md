# Database Fix Instructions for ZenCap Website

## Issues Identified
1. Admin dashboard shows "failed to load analytics" - monitoring tables were missing
2. Models page shows "No Models found" - models table was empty
3. Insights page shows "No insights found" - insights table was empty
4. API endpoints were trying to query non-existent monitoring tables

## Solution Implemented

### 1. Updated Database Initialization Script
Updated `src/utils/database.js` to include all necessary tables:
- Core tables: leads, newsletter_subscribers, form_submissions, insights, models
- Monitoring tables: performance_metrics, error_logs, user_analytics, security_audit_logs
- Added proper indexes for performance
- Added missing columns (date_published for insights, excel_url for models)

### 2. Created API Endpoints
- `/api/init-db` - Initializes all database tables
- `/api/init-sample-data` - Populates models and insights with sample data
- `/api/verify-database` - Verifies all tables exist and shows data counts

### 3. Fixed Monitoring API
Updated `/api/monitoring/metrics` to gracefully handle missing tables by:
- Checking if tables exist before querying
- Returning empty data with informative messages when tables are missing
- Preventing crashes from missing table errors

## Steps to Fix the Database

### Step 1: Set Up Environment Variables
Create a `.env.local` file with your Vercel Postgres credentials:
```env
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database?sslmode=require
```

### Step 2: Initialize Database Tables
```bash
# Method 1: Using curl
curl -X POST http://localhost:3001/api/init-db

# Method 2: Using browser
# Visit http://localhost:3001/api/init-db and change to POST request
```

### Step 3: Populate Sample Data
```bash
# Method 1: Using curl
curl -X POST http://localhost:3001/api/init-sample-data

# Method 2: Using browser
# Visit http://localhost:3001/api/init-sample-data and change to POST request
```

### Step 4: Verify Database Status
```bash
# Check all tables and data counts
curl http://localhost:3001/api/verify-database
```

Expected output:
```json
{
  "success": true,
  "results": {
    "tables": {
      "leads": true,
      "newsletter_subscribers": true,
      "form_submissions": true,
      "insights": true,
      "models": true,
      "performance_metrics": true,
      "error_logs": true,
      "user_analytics": true,
      "security_audit_logs": true
    },
    "counts": {
      "models": 4,
      "insights": 3,
      // ... other counts
    }
  }
}
```

### Step 5: Test the Pages
1. Visit `/models` - Should show 4 sample models
2. Visit `/insights` - Should show 3 sample insights
3. Visit `/admin` - Analytics should load without errors

## Production Deployment

### For Vercel Deployment:
1. Add environment variables in Vercel dashboard
2. Deploy the updated code
3. Run initialization endpoints:
   - `https://your-domain.vercel.app/api/init-db` (POST)
   - `https://your-domain.vercel.app/api/init-sample-data` (POST)
4. Verify with `https://your-domain.vercel.app/api/verify-database` (GET)

### Security Notes:
- In production, protect the init endpoints with authentication
- Add `INIT_DB_SECRET` environment variable
- Modify init endpoints to check for this secret

Example secure endpoint:
```javascript
if (process.env.NODE_ENV === 'production') {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.INIT_DB_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
```

## Troubleshooting

### If tables still don't exist:
1. Check Vercel Postgres connection in dashboard
2. Verify environment variables are correct
3. Check browser console for specific error messages
4. Use `/api/verify-database` to see which tables are missing

### If data doesn't appear:
1. Check that status fields are correct (insights need status='published', models need status='active')
2. Verify date_published is set for insights
3. Check API responses in browser DevTools Network tab

### Common Errors:
- "relation does not exist" - Table hasn't been created yet
- "duplicate key value" - Data already exists, safe to ignore
- "connection refused" - Check database credentials

## Monitoring Health
The admin dashboard monitoring will work once tables start collecting data:
- Performance metrics are logged automatically when using the platform
- Error logs capture any application errors
- User analytics track user interactions
- Security audit logs track sensitive operations

Initially, these will be empty but will populate as the platform is used.