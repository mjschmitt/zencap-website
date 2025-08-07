# ZenCap Production Database Setup Guide

## Overview

This guide provides comprehensive instructions for setting up ZenCap's production PostgreSQL database infrastructure with enterprise-grade security, performance optimization, backup strategies, and monitoring.

## Database Architecture

### Production Schema (15 Tables)

1. **Core Business Tables**
   - `leads` - Contact form submissions and lead management
   - `newsletter_subscribers` - Email newsletter management
   - `insights` - Investment insights and content
   - `models` - Financial models catalog
   - `customers` - Customer records linked to Stripe
   - `orders` - Purchase transactions and download tracking
   - `payment_methods` - Stored payment methods

2. **Authentication Tables (NextAuth.js)**
   - `users` - User accounts
   - `accounts` - OAuth provider accounts
   - `sessions` - Active user sessions
   - `verification_tokens` - Email verification tokens

3. **Monitoring & Security Tables**
   - `form_submissions` - Form submission logs
   - `performance_metrics` - Application performance data
   - `error_logs` - Error tracking and debugging
   - `user_analytics` - User behavior analytics
   - `security_audit_logs` - Security event monitoring

## Production Environment Setup

### Option 1: Vercel Postgres (Recommended)
**Best for Next.js deployment on Vercel**

```bash
# 1. Create Vercel project
vercel init

# 2. Add Vercel Postgres
vercel storage create postgres

# 3. Environment variables will be automatically added
```

**Pricing**: $20/month (Hobby Pro), scales to Enterprise

### Option 2: AWS RDS PostgreSQL
**Best for enterprise scalability**

```bash
# Create production RDS instance
aws rds create-db-instance \
  --db-instance-identifier zencap-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username zencap_admin \
  --master-user-password SECURE_PASSWORD \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --multi-az \
  --backup-retention-period 7 \
  --deletion-protection
```

**Pricing**: ~$50-100/month depending on instance size

### Option 3: Digital Ocean Managed PostgreSQL
**Best balance of features and cost**

```bash
# Create via CLI
doctl databases create zencap-prod \
  --engine pg \
  --version 15 \
  --size db-s-2vcpu-4gb \
  --region nyc3 \
  --num-nodes 1
```

**Pricing**: $30/month for 2 vCPU, 4GB RAM

## Connection Configuration

### Environment Variables

```env
# Production Database - Primary Connection
POSTGRES_URL=postgresql://username:password@host:5432/zencap_production?sslmode=require&pool_timeout=10

# Non-pooling connection for migrations
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:5432/zencap_production?sslmode=require

# Connection Pool Configuration
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=10000

# SSL Configuration
DB_SSL_REQUIRE=true
DB_SSL_REJECT_UNAUTHORIZED=true

# Backup Configuration
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=daily
BACKUP_S3_BUCKET=zencap-db-backups
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key

# Monitoring
DB_MONITORING_ENABLED=true
DB_SLOW_QUERY_THRESHOLD=1000
DB_CONNECTION_ALERT_THRESHOLD=15
```

### Connection Pooling (database.js Enhancement)

```javascript
// Enhanced connection pooling configuration
import { Pool } from 'pg';

const poolConfig = {
  connectionString: process.env.POSTGRES_URL,
  min: parseInt(process.env.DB_POOL_MIN) || 5,
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  } : false,
  // Connection health check
  application_name: 'zencap-production'
};

export const pool = new Pool(poolConfig);

// Health check function
export async function checkDatabaseHealth() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].now,
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Database Migration Strategy

### Migration Scripts Structure

```
migrations/
├── 001_initial_schema.sql
├── 002_add_payment_tables.sql
├── 003_add_security_tables.sql
├── 004_add_indexes.sql
├── 005_add_constraints.sql
└── seed/
    ├── initial_insights.sql
    ├── initial_models.sql
    └── admin_users.sql
```

### Migration Execution System

```javascript
// migrations/migrate.js
import fs from 'fs';
import path from 'path';
import { sql } from '@vercel/postgres';

export async function runMigrations() {
  try {
    // Create migrations tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');
      
      // Check if migration already executed
      const exists = await sql`
        SELECT id FROM schema_migrations WHERE version = ${version}
      `;

      if (exists.rows.length === 0) {
        console.log(`Running migration: ${version}`);
        
        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file), 
          'utf8'
        );
        
        await sql.begin(async (sql) => {
          await sql.unsafe(migrationSQL);
          await sql`
            INSERT INTO schema_migrations (version) VALUES (${version})
          `;
        });
        
        console.log(`Completed migration: ${version}`);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
```

## Backup Strategy

### Automated Backup System

#### Daily Automated Backups

```bash
#!/bin/bash
# scripts/backup-database.sh

# Configuration
DB_HOST=${POSTGRES_HOST}
DB_NAME=${POSTGRES_DATABASE}
DB_USER=${POSTGRES_USERNAME}
BACKUP_DIR="/backups/zencap"
S3_BUCKET=${BACKUP_S3_BUCKET}
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="zencap_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Create database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --no-password \
  --format=custom \
  --compress=9 \
  --verbose \
  > $BACKUP_PATH

# Encrypt backup
gpg --symmetric --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
  --s2k-digest-algo SHA512 --s2k-count 65011712 \
  --passphrase $BACKUP_ENCRYPTION_KEY \
  $BACKUP_PATH

# Upload to S3
aws s3 cp "${BACKUP_PATH}.gpg" s3://$S3_BUCKET/daily/

# Clean up local files older than 7 days
find $BACKUP_DIR -name "*.sql.gpg" -mtime +7 -delete

# Clean up S3 files older than retention period
aws s3 ls s3://$S3_BUCKET/daily/ | while read -r line; do
  CREATE_DATE=$(echo $line | awk '{print $1" "$2}')
  CREATE_DATE_SECONDS=$(date -d "$CREATE_DATE" +%s)
  OLDER_THAN=$(date -d "$RETENTION_DAYS days ago" +%s)
  
  if [[ $CREATE_DATE_SECONDS -lt $OLDER_THAN ]]; then
    FILE_NAME=$(echo $line | awk '{print $4}')
    aws s3 rm s3://$S3_BUCKET/daily/$FILE_NAME
  fi
done

echo "Backup completed: $BACKUP_FILE"
```

#### Backup Verification Script

```bash
#!/bin/bash
# scripts/verify-backup.sh

LATEST_BACKUP=$(aws s3 ls s3://$BACKUP_S3_BUCKET/daily/ | sort | tail -n 1 | awk '{print $4}')

if [ -z "$LATEST_BACKUP" ]; then
  echo "ERROR: No backup found"
  exit 1
fi

# Download and test restore
aws s3 cp s3://$BACKUP_S3_BUCKET/daily/$LATEST_BACKUP /tmp/test_backup.sql.gpg

# Decrypt backup
gpg --batch --yes --passphrase $BACKUP_ENCRYPTION_KEY --decrypt /tmp/test_backup.sql.gpg > /tmp/test_backup.sql

# Test restore to temporary database
createdb test_restore_db
pg_restore -d test_restore_db /tmp/test_backup.sql

# Verify table counts
ORIGINAL_COUNT=$(psql -d $POSTGRES_DATABASE -t -c "SELECT COUNT(*) FROM leads;")
RESTORE_COUNT=$(psql -d test_restore_db -t -c "SELECT COUNT(*) FROM leads;")

if [ "$ORIGINAL_COUNT" == "$RESTORE_COUNT" ]; then
  echo "Backup verification SUCCESS"
else
  echo "ERROR: Backup verification FAILED"
fi

# Cleanup
dropdb test_restore_db
rm /tmp/test_backup.*
```

#### Cron Schedule

```bash
# Add to crontab for production server
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/zencap-backup.log 2>&1

# Weekly backup verification at 3 AM Sunday
0 3 * * 0 /path/to/scripts/verify-backup.sh >> /var/log/zencap-backup-verify.log 2>&1

# Monthly cleanup at 4 AM first day of month
0 4 1 * * /path/to/scripts/cleanup-old-backups.sh >> /var/log/zencap-cleanup.log 2>&1
```

## Performance Optimization

### Database Indexes

```sql
-- Critical performance indexes for ZenCap
CREATE INDEX CONCURRENTLY idx_leads_created_at_status ON leads(created_at, status);
CREATE INDEX CONCURRENTLY idx_leads_email_lookup ON leads(email) WHERE status != 'deleted';
CREATE INDEX CONCURRENTLY idx_newsletter_active ON newsletter_subscribers(email) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY idx_models_category_status ON models(category, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_insights_published_date ON insights(published_at DESC) WHERE status = 'published';
CREATE INDEX CONCURRENTLY idx_security_logs_event_date ON security_audit_logs(event_type, created_at);
CREATE INDEX CONCURRENTLY idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX CONCURRENTLY idx_analytics_event_timestamp ON user_analytics(event_type, timestamp);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_leads_interest_date ON leads(interest, created_at DESC);
CREATE INDEX CONCURRENTLY idx_orders_download_expiry ON orders(download_expires_at, status) WHERE status = 'completed';
```

### Query Optimization Configuration

```sql
-- PostgreSQL performance tuning for production
-- Add to postgresql.conf

# Connection settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Write-ahead logging
wal_buffers = 16MB
checkpoint_completion_target = 0.9
wal_writer_delay = 200ms

# Query planning
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging for monitoring
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

# Statistics
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all
```

### Connection Pool Monitoring

```javascript
// utils/db-monitoring.js
export async function monitorConnectionPool() {
  const stats = {
    timestamp: new Date().toISOString(),
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
    maxConnections: pool.options.max,
    connectionUtilization: (pool.totalCount / pool.options.max) * 100
  };

  // Alert if connection utilization > 80%
  if (stats.connectionUtilization > 80) {
    await sendAlert('HIGH_DB_CONNECTION_USAGE', stats);
  }

  // Log metrics
  await sql`
    INSERT INTO performance_metrics (
      metric_name, component, metadata, timestamp
    ) VALUES (
      'connection_pool_stats', 'database', ${JSON.stringify(stats)}, NOW()
    )
  `;

  return stats;
}
```

## Security Configuration

### Database Security Checklist

- [ ] SSL/TLS encryption enabled
- [ ] Connection string uses SSL parameters
- [ ] Database user has minimal required permissions
- [ ] Regular security patches applied
- [ ] Backup encryption enabled
- [ ] IP whitelist configured
- [ ] Connection timeout limits set
- [ ] Query logging enabled for audit

### Security Monitoring

```javascript
// utils/security-monitoring.js
export async function logSecurityEvent(eventData) {
  const event = {
    event_id: generateUUID(),
    event_type: eventData.type,
    user_id: eventData.userId,
    ip_address: eventData.ipAddress,
    user_agent: eventData.userAgent,
    session_id: eventData.sessionId,
    resource_type: eventData.resourceType,
    resource_id: eventData.resourceId,
    action_type: eventData.actionType,
    action: eventData.action,
    result: eventData.result,
    severity: eventData.severity || 'info',
    metadata: eventData.metadata || {},
    error_details: eventData.errorDetails || {},
    retention_until: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) // 1 year
  };

  await sql`
    INSERT INTO security_audit_logs (
      event_id, event_type, user_id, ip_address, user_agent, session_id,
      resource_type, resource_id, action_type, action, result, severity,
      metadata, error_details, retention_until
    ) VALUES (
      ${event.event_id}, ${event.event_type}, ${event.user_id}, 
      ${event.ip_address}, ${event.user_agent}, ${event.session_id},
      ${event.resource_type}, ${event.resource_id}, ${event.action_type},
      ${event.action}, ${event.result}, ${event.severity},
      ${JSON.stringify(event.metadata)}, ${JSON.stringify(event.error_details)},
      ${event.retention_until}
    )
  `;
}
```

## Monitoring & Alerting

### Health Check Endpoints

```javascript
// pages/api/health/database.js
export default async function handler(req, res) {
  try {
    const health = await checkDatabaseHealth();
    const connectionStats = await monitorConnectionPool();
    
    const response = {
      status: health.status,
      timestamp: health.timestamp,
      database: {
        connected: health.status === 'healthy',
        responseTime: health.responseTime,
        connections: connectionStats
      },
      tables: {
        leads: await getTableHealth('leads'),
        orders: await getTableHealth('orders'),
        customers: await getTableHealth('customers')
      }
    };

    res.status(health.status === 'healthy' ? 200 : 503).json(response);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function getTableHealth(tableName) {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM ${sql(tableName)}
    `;
    return {
      accessible: true,
      recordCount: result.rows[0].count
    };
  } catch (error) {
    return {
      accessible: false,
      error: error.message
    };
  }
}
```

### Performance Monitoring

```javascript
// utils/performance-monitoring.js
export async function trackQueryPerformance(queryName, duration, metadata = {}) {
  const isSlowQuery = duration > (process.env.DB_SLOW_QUERY_THRESHOLD || 1000);
  
  await sql`
    INSERT INTO performance_metrics (
      metric_name, component, duration, exceeds_threshold, metadata
    ) VALUES (
      ${queryName}, 'database', ${duration}, ${isSlowQuery}, ${JSON.stringify(metadata)}
    )
  `;

  if (isSlowQuery) {
    await sendAlert('SLOW_QUERY_DETECTED', {
      queryName,
      duration,
      threshold: process.env.DB_SLOW_QUERY_THRESHOLD,
      metadata
    });
  }
}
```

## Deployment Checklist

### Pre-Production Steps

- [ ] Database instance provisioned and configured
- [ ] SSL certificates installed
- [ ] Connection pooling configured
- [ ] Backup system tested
- [ ] Performance indexes created
- [ ] Security audit completed
- [ ] Monitoring alerts configured
- [ ] Migration scripts tested
- [ ] Environment variables set
- [ ] Health checks working

### Launch Day Steps

1. **Database Migration**
   ```bash
   npm run migrate:production
   ```

2. **Initial Data Load**
   ```bash
   npm run seed:production
   ```

3. **Health Check Verification**
   ```bash
   curl https://zencap.co/api/health/database
   ```

4. **Backup Verification**
   ```bash
   ./scripts/verify-backup.sh
   ```

5. **Performance Test**
   ```bash
   npm run test:performance:database
   ```

### Post-Launch Monitoring

- Monitor connection pool utilization
- Review slow query logs daily
- Verify backup completion notifications
- Check security audit logs
- Monitor disk usage trends
- Review error rates and patterns

## Cost Optimization

### Production Cost Breakdown

| Service | Monthly Cost | Description |
|---------|--------------|-------------|
| Vercel Postgres Pro | $20 | Managed PostgreSQL with backups |
| AWS S3 (Backups) | $5 | Encrypted backup storage |
| CloudWatch Monitoring | $10 | Database and application monitoring |
| **Total** | **$35** | **Full production setup** |

### Scaling Costs

| Users | Database Size | Monthly Cost | Configuration |
|-------|---------------|--------------|---------------|
| 0-1K | < 10GB | $35 | Hobby Pro |
| 1K-10K | 10-50GB | $65 | Pro with read replica |
| 10K+ | 50GB+ | $150+ | Enterprise with clustering |

## Disaster Recovery

### Recovery Procedures

#### RTO/RPO Targets
- **Recovery Time Objective (RTO)**: 15 minutes
- **Recovery Point Objective (RPO)**: 24 hours
- **Data Loss Tolerance**: < 1 hour

#### Recovery Steps

1. **Immediate Response**
   ```bash
   # Check database status
   curl https://zencap.co/api/health/database
   
   # Switch to read-only mode if needed
   export DB_READ_ONLY=true
   ```

2. **Database Recovery**
   ```bash
   # Download latest backup
   aws s3 cp s3://zencap-db-backups/daily/latest.sql.gpg ./
   
   # Decrypt and restore
   gpg --decrypt latest.sql.gpg | pg_restore -d zencap_production
   ```

3. **Verification**
   ```bash
   # Verify data integrity
   npm run verify:database
   
   # Resume normal operations
   export DB_READ_ONLY=false
   ```

## Support & Troubleshooting

### Common Issues

#### High Connection Usage
```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE query_start < NOW() - INTERVAL '5 minutes';
```

#### Slow Queries
```bash
# Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

# Analyze query performance
EXPLAIN ANALYZE your_slow_query;
```

#### Backup Issues
```bash
# Check backup logs
tail -f /var/log/zencap-backup.log

# Manual backup verification
./scripts/verify-backup.sh
```

### Emergency Contacts

- **Database Admin**: database@zencap.co
- **Security Team**: security@zencap.co
- **DevOps**: devops@zencap.co
- **On-call**: +1-XXX-XXX-XXXX

This comprehensive setup ensures ZenCap's database infrastructure is production-ready with enterprise-grade security, performance, monitoring, and disaster recovery capabilities.