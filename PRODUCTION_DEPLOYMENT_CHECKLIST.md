# ZenCap Production Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables Configuration

Create production `.env.local` with the following variables:

```env
# PRODUCTION DATABASE CONFIGURATION
POSTGRES_URL=postgresql://username:password@host:5432/zencap_production?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:5432/zencap_production?sslmode=require
POSTGRES_HOST=your-production-host
POSTGRES_DATABASE=zencap_production
POSTGRES_USERNAME=zencap_user
POSTGRES_PASSWORD=secure_production_password

# DATABASE CONNECTION POOL
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000
DB_SSL_REQUIRE=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SLOW_QUERY_THRESHOLD=1000

# PRODUCTION INITIALIZATION
PRODUCTION_INIT_TOKEN=your-secure-initialization-token-here
BACKUP_ON_INIT=true

# EMAIL SERVICE
SENDGRID_API_KEY=SG.your-production-sendgrid-key
SENDGRID_FROM_EMAIL=info@zencap.com
SENDGRID_FROM_NAME=Zenith Capital Advisors

# STRIPE PAYMENT PROCESSING
STRIPE_SECRET_KEY=sk_live_your-stripe-live-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-live-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-live-key
STRIPE_WEBHOOK_SECRET=whsec_your-production-webhook-secret

# NEXTAUTH AUTHENTICATION
NEXTAUTH_URL=https://zencap.com
NEXTAUTH_SECRET=your-secure-nextauth-secret-32-chars-minimum

# BACKUP CONFIGURATION
BACKUP_S3_BUCKET=zencap-production-backups
BACKUP_ENCRYPTION_ENABLED=true
BACKUP_ENCRYPTION_KEY=your-32-byte-encryption-key-here
BACKUP_LOCAL_DIR=./backups
AWS_REGION=us-east-1

# MONITORING AND ALERTS
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
EMAIL_ALERTS_ENABLED=true
ALERT_EMAIL_RECIPIENTS=admin@zencap.com,devops@zencap.com

# SECURITY
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret

# SITE CONFIGURATION
NEXT_PUBLIC_SITE_URL=https://zencap.com
NEXT_PUBLIC_BASE_URL=https://zencap.com
NEXT_PUBLIC_SITE_NAME=Zenith Capital Advisors
NEXT_PUBLIC_GA_ID=G-YOUR-PRODUCTION-GA-ID

# NODE ENVIRONMENT
NODE_ENV=production
```

### 2. Package.json Scripts Update

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:migrate": "node migrations/migrate.js up",
    "db:migrate:dry-run": "node migrations/migrate.js up --dry-run",
    "db:migrate:force": "node migrations/migrate.js up --force",
    "db:rollback": "node migrations/migrate.js rollback",
    "db:status": "node migrations/migrate.js status",
    "db:verify": "node migrations/migrate.js verify",
    "db:backup": "node scripts/database/backup.js create daily",
    "db:backup:weekly": "node scripts/database/backup.js create weekly",
    "db:backup:monthly": "node scripts/database/backup.js create monthly",
    "db:backup:verify": "node scripts/database/backup.js verify",
    "db:backup:cleanup": "node scripts/database/backup.js cleanup",
    "db:health": "node scripts/database/health-check.js check",
    "db:monitor": "node scripts/database/health-check.js monitor",
    "production:init": "curl -X POST https://zencap.com/api/production/init-database -H \"Authorization: Bearer $PRODUCTION_INIT_TOKEN\" -H \"Content-Type: application/json\" -d '{\"operation\": \"full_init\"}'",
    "production:health": "curl -X POST https://zencap.com/api/production/init-database -H \"Authorization: Bearer $PRODUCTION_INIT_TOKEN\" -H \"Content-Type: application/json\" -d '{\"operation\": \"health\"}'",
    "production:migrate": "curl -X POST https://zencap.com/api/production/init-database -H \"Authorization: Bearer $PRODUCTION_INIT_TOKEN\" -H \"Content-Type: application/json\" -d '{\"operation\": \"migrate\"}'",
    "production:verify": "curl -X POST https://zencap.com/api/production/init-database -H \"Authorization: Bearer $PRODUCTION_INIT_TOKEN\" -H \"Content-Type: application/json\" -d '{\"operation\": \"verify\"}'",
    "production:status": "curl -X POST https://zencap.com/api/production/init-database -H \"Authorization: Bearer $PRODUCTION_INIT_TOKEN\" -H \"Content-Type: application/json\" -d '{\"operation\": \"status\"}'"
  }
}
```

## Deployment Steps

### Phase 1: Infrastructure Setup

#### 1. Database Provisioning
- [ ] Provision PostgreSQL database (Vercel Postgres, AWS RDS, or DigitalOcean)
- [ ] Configure SSL/TLS encryption
- [ ] Set up connection pooling
- [ ] Create database user with appropriate permissions
- [ ] Configure firewall rules and IP whitelist

#### 2. Backup Infrastructure
- [ ] Create S3 bucket for backups (`zencap-production-backups`)
- [ ] Configure bucket encryption and versioning
- [ ] Set up IAM user with backup permissions
- [ ] Test backup and restore procedures

#### 3. Monitoring Setup
- [ ] Configure Slack webhook for alerts
- [ ] Set up email alert recipients
- [ ] Configure monitoring thresholds

### Phase 2: Database Initialization

#### 1. Pre-Migration Checks
```bash
# Check database connectivity
npm run db:health

# Preview migrations without executing
npm run db:migrate:dry-run

# Check current migration status
npm run db:status
```

#### 2. Run Migrations
```bash
# Execute all pending migrations
npm run db:migrate

# Verify migration integrity
npm run db:verify

# Check final status
npm run db:status
```

#### 3. Initial Data Load
```bash
# The migration system automatically loads seed data
# Verify data was loaded correctly
npm run db:health
```

### Phase 3: Production Deployment

#### 1. Deploy Application
```bash
# Build for production
npm run build

# Deploy to Vercel/your platform
vercel --prod
```

#### 2. Initialize Production Database
```bash
# Initialize database via API
npm run production:init

# Verify initialization
npm run production:verify

# Check health
npm run production:health
```

#### 3. Backup Configuration
```bash
# Create initial backup
npm run db:backup

# Verify backup
npm run db:backup:verify

# Set up automated backups (cron job)
# Add to crontab:
# 0 2 * * * npm run db:backup
# 0 3 * * 0 npm run db:backup:weekly
# 0 4 1 * * npm run db:backup:monthly
```

### Phase 4: Monitoring Setup

#### 1. Health Check Monitoring
```bash
# Start continuous monitoring
npm run db:monitor

# Or set up periodic health checks
# Add to crontab:
# */5 * * * * npm run db:health
```

#### 2. Performance Monitoring
- [ ] Monitor connection pool utilization
- [ ] Set up slow query alerts
- [ ] Configure error rate monitoring
- [ ] Track database growth and performance

## Post-Deployment Verification

### 1. Functional Tests
- [ ] Test user registration/login
- [ ] Test contact form submission
- [ ] Test newsletter signup
- [ ] Test model purchase flow
- [ ] Test download functionality
- [ ] Test admin dashboard access

### 2. Performance Tests
- [ ] Verify API response times < 500ms
- [ ] Test concurrent user load
- [ ] Verify database query performance
- [ ] Test file upload/download speeds

### 3. Security Tests
- [ ] Verify SSL/TLS configuration
- [ ] Test authentication flows
- [ ] Verify input validation
- [ ] Test rate limiting
- [ ] Check for SQL injection vulnerabilities

### 4. Backup Tests
- [ ] Verify automated backups are running
- [ ] Test backup restoration procedure
- [ ] Verify backup encryption
- [ ] Test disaster recovery process

## Monitoring and Maintenance

### Daily Monitoring
- Database health check results
- Backup completion status
- Error rate monitoring
- Performance metrics review

### Weekly Maintenance
- Review slow query logs
- Analyze user analytics
- Check security audit logs
- Verify backup integrity

### Monthly Maintenance
- Database performance optimization
- Review and rotate security keys
- Update database statistics
- Review disaster recovery procedures

## Troubleshooting Guide

### Database Connection Issues
```bash
# Check database health
npm run db:health

# Check connection pool status
curl -X POST https://zencap.com/api/production/init-database \
  -H "Authorization: Bearer $PRODUCTION_INIT_TOKEN" \
  -d '{"operation": "health"}'
```

### Migration Problems
```bash
# Check migration status
npm run db:status

# Verify migration integrity
npm run db:verify

# Force re-run specific migration
npm run db:migrate:force
```

### Performance Issues
```bash
# Monitor database performance
npm run db:monitor

# Check slow queries in logs
tail -f /var/log/postgresql/postgresql.log | grep "duration:"
```

### Backup Issues
```bash
# Verify recent backups
npm run db:backup:verify

# Create manual backup
npm run db:backup

# Clean up old backups
npm run db:backup:cleanup
```

## Emergency Procedures

### Database Outage
1. Check database service status
2. Review recent logs for errors
3. Attempt connection pool restart
4. Escalate to database provider if needed
5. Implement read-only mode if possible

### Data Corruption
1. Stop write operations immediately
2. Identify extent of corruption
3. Restore from latest verified backup
4. Verify data integrity
5. Resume operations gradually

### Security Breach
1. Immediately revoke all API keys
2. Change all database passwords
3. Review security audit logs
4. Implement additional security measures
5. Notify users if data was compromised

## Success Metrics

### Performance Targets
- API response times: < 500ms for 95% of requests
- Database query times: < 100ms for complex queries
- Uptime: 99.9% availability
- Backup success rate: 100%

### Monitoring Targets
- Connection pool utilization: < 80%
- Slow query count: < 10 per hour
- Error rate: < 5 errors per minute
- Disk usage: < 85% capacity

This comprehensive checklist ensures a successful production database deployment for ZenCap with enterprise-grade reliability, security, and performance monitoring.