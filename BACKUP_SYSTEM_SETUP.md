# ZenCap Backup System Setup Guide

## Overview

The ZenCap Backup System is a comprehensive, enterprise-grade backup and disaster recovery solution that ensures business continuity for our financial platform. This system includes automated backups, real-time monitoring, disaster recovery procedures, and continuous verification.

## System Components

### 1. Automated Backup System (`automatedBackupSystem.js`)
- **Database Backups**: Automated PostgreSQL backups with compression and encryption
- **File System Backups**: Excel uploads, images, and configuration files
- **Cloud Storage**: S3 integration with lifecycle policies
- **Scheduling**: Configurable backup intervals (hourly database, 4-hourly files)

### 2. Backup Verification System (`backupVerificationSystem.js`)
- **Integrity Checks**: Checksum verification and format validation
- **Restoration Testing**: Automated test restores to sandbox environments
- **Performance Benchmarks**: Restore speed and data retrieval metrics
- **Security Validation**: Encryption and access control verification

### 3. Backup Monitoring System (`backupMonitoringSystem.js`)
- **Real-time Monitoring**: System health, backup freshness, storage usage
- **Multi-channel Alerting**: Email, Slack, SMS, and webhook notifications
- **Performance Tracking**: Response times, failure rates, and trends
- **Dashboard Analytics**: Comprehensive metrics and reporting

### 4. Restoration Testing System (`backupRestorationTesting.js`)
- **Scheduled Testing**: Daily quick tests, weekly full tests, monthly disaster simulations
- **Test Environments**: Isolated sandbox and staging environments
- **Validation Procedures**: Data integrity and application functionality tests
- **Performance Validation**: RTO/RPO compliance testing

### 5. Disaster Recovery Plan (`disasterRecoveryPlan.js`)
- **Recovery Procedures**: Step-by-step disaster recovery workflows
- **RTO/RPO Management**: 30-minute database, 60-minute files, 2-hour full system
- **Communication Protocols**: Incident notifications and status updates
- **Recovery Verification**: Post-recovery validation and testing

### 6. System Manager (`backupSystemManager.js`)
- **Centralized Control**: Unified management of all backup components
- **Configuration Management**: Environment-specific settings and parameters
- **Health Coordination**: Cross-component health checks and status reporting
- **API Integration**: RESTful API for external management and monitoring

## Installation and Setup

### Prerequisites

1. **Node.js Environment**: Node.js 18+ with npm/yarn
2. **PostgreSQL Database**: Vercel Postgres or compatible PostgreSQL database
3. **AWS Account**: S3 bucket for cloud backup storage (optional but recommended)
4. **Email Service**: SendGrid API key for email notifications
5. **Monitoring Tools**: Slack webhook (optional), SMS service (optional)

### Environment Variables

Add the following variables to your `.env.local` file:

```bash
# Core Database Configuration
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database

# Backup Configuration
BACKUP_S3_BUCKET=your-backup-s3-bucket
BACKUP_LOCAL_DIR=./backups
BACKUP_ENCRYPTION_ENABLED=true
BACKUP_ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# AWS Configuration (for S3 backups)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Notification Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=alerts@zencap.co
BACKUP_ALERT_EMAILS=admin@zencap.co,tech@zencap.co
BACKUP_ESCALATION_EMAILS=cto@zencap.co

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
BACKUP_SLACK_CHANNEL=#alerts

# SMS Alerts (Optional - Twilio)
TWILIO_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
BACKUP_ALERT_PHONE_NUMBERS=+1234567890,+1987654321

# Testing Environment
TEST_POSTGRES_URL=postgresql://test-db-url
STAGING_POSTGRES_URL=postgresql://staging-db-url

# API Security
ADMIN_API_KEY=your-secure-admin-api-key-32-chars-minimum

# Webhook Monitoring (Optional)
BACKUP_MONITORING_WEBHOOK=https://your-monitoring-service.com/webhook
DISASTER_WEBHOOK_URL=https://your-incident-management.com/webhook

# Performance Thresholds
BACKUP_MAX_DURATION_MINUTES=60
BACKUP_MAX_SIZE_GB=10
BACKUP_MIN_SUCCESS_RATE=95
```

### Database Setup

The backup system will automatically create required tables when initialized. However, you can manually run the setup:

```bash
# Access the database initialization API
curl -X POST http://localhost:3000/api/init-db \
  -H "Content-Type: application/json"
```

### AWS S3 Setup (Recommended)

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://your-backup-bucket-name
   ```

2. **Configure Lifecycle Policies**:
   ```json
   {
     "Rules": [
       {
         "ID": "BackupLifecycle",
         "Status": "Enabled",
         "Transitions": [
           {
             "Days": 30,
             "StorageClass": "STANDARD_IA"
           },
           {
             "Days": 90,
             "StorageClass": "GLACIER"
           },
           {
             "Days": 365,
             "StorageClass": "DEEP_ARCHIVE"
           }
         ]
       }
     ]
   }
   ```

3. **Set Bucket Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::YOUR-ACCOUNT:user/backup-user"
         },
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-backup-bucket/*",
           "arn:aws:s3:::your-backup-bucket"
         ]
       }
     ]
   }
   ```

## System Initialization

### Via API (Recommended)

```javascript
// Initialize the complete backup system
const response = await fetch('/api/admin/backup-system', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`
  },
  body: JSON.stringify({
    action: 'initialize',
    config: {
      // Optional custom configuration
      automatedBackup: {
        intervals: {
          database: 60,     // Every hour
          files: 240,       // Every 4 hours
          fullSystem: 1440  // Daily
        }
      }
    }
  })
});

const result = await response.json();
console.log('Backup system initialized:', result);
```

### Via Code

```javascript
import { initializeCompleteBackupSystem } from './src/utils/backupSystemManager.js';

async function setupBackupSystem() {
  try {
    const backupSystem = await initializeCompleteBackupSystem({
      // Custom configuration options
      environment: process.env.NODE_ENV
    });
    
    console.log('Backup system ready:', backupSystem.getSystemStatus());
  } catch (error) {
    console.error('Failed to initialize backup system:', error);
  }
}

setupBackupSystem();
```

## API Endpoints

### System Management

- `GET /api/admin/backup-system` - System overview
- `GET /api/admin/backup-system?action=status` - System status
- `GET /api/admin/backup-system?action=health` - Health check
- `GET /api/admin/backup-system?action=metrics` - System metrics
- `GET /api/admin/backup-system?action=dashboard` - Dashboard data
- `POST /api/admin/backup-system` - System operations

### Backup Operations

```javascript
// Create manual backup
await fetch('/api/admin/backup-system', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_API_KEY}`
  },
  body: JSON.stringify({
    action: 'backup',
    type: 'full' // or 'database', 'files'
  })
});

// Run restoration test
await fetch('/api/admin/backup-system', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_API_KEY}`
  },
  body: JSON.stringify({
    action: 'test',
    testType: 'quickTest' // or 'fullTest', 'disasterSimulation'
  })
});
```

### Disaster Recovery

```javascript
// Execute disaster recovery (USE WITH EXTREME CAUTION)
await fetch('/api/admin/backup-system', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_API_KEY}`
  },
  body: JSON.stringify({
    action: 'disaster_recovery',
    options: {
      confirmed: true, // Required confirmation
      recoveryType: 'full', // or 'database_only', 'files_only'
      backupTimestamp: '2024-01-01T12:00:00Z' // Optional: specific backup
    }
  })
});
```

## Monitoring and Alerting

### Alert Levels

- **Info**: System status updates, successful operations
- **Warning**: Performance degradation, stale backups
- **Error**: Backup failures, connectivity issues
- **Critical**: System failures, disaster recovery events

### Notification Channels

1. **Email Notifications**
   - Immediate alerts for critical issues
   - Daily/weekly status reports
   - Escalation to management for unresolved issues

2. **Slack Integration**
   - Real-time alerts to operations channel
   - Formatted messages with action buttons
   - Thread discussions for incident resolution

3. **SMS Alerts**
   - Critical alerts only to on-call personnel
   - Escalation after 30 minutes of unresolved critical alerts
   - Off-hours emergency notifications

4. **Webhook Integration**
   - Integration with external monitoring systems
   - Custom alerting workflows
   - Automated ticket creation in ITSM systems

## Scheduled Operations

### Default Schedule

- **Database Backups**: Every 60 minutes
- **File Backups**: Every 4 hours (240 minutes)
- **Quick Verification**: Every 6 hours
- **Comprehensive Verification**: Daily at 2 AM
- **Restoration Tests**: Daily quick test, weekly full test, monthly disaster simulation
- **Health Checks**: Every 5 minutes
- **Cleanup**: Daily at 3 AM (removes backups older than retention period)

### Custom Scheduling

```javascript
// Custom schedule configuration
const customConfig = {
  automatedBackup: {
    intervals: {
      database: 30,     // Every 30 minutes
      files: 120,       // Every 2 hours
      fullSystem: 720   // Every 12 hours
    }
  },
  monitoring: {
    intervals: {
      healthCheck: 2,   // Every 2 minutes
      backupStatus: 10, // Every 10 minutes
    }
  }
};
```

## Recovery Procedures

### Recovery Time Objectives (RTO)

- **Database Recovery**: 30 minutes maximum
- **File System Recovery**: 60 minutes maximum
- **Full System Recovery**: 120 minutes maximum

### Recovery Point Objectives (RPO)

- **Critical Data**: 15 minutes maximum data loss
- **Database**: 60 minutes maximum data loss
- **Files**: 4 hours maximum data loss

### Manual Recovery Steps

1. **Assess the Situation**
   ```bash
   # Check system status
   curl -H "Authorization: Bearer $ADMIN_API_KEY" \
     "http://localhost:3000/api/admin/backup-system?action=health"
   ```

2. **Identify Latest Backups**
   ```bash
   # Get recent backup operations
   curl -H "Authorization: Bearer $ADMIN_API_KEY" \
     "http://localhost:3000/api/admin/backup-system?action=operations&limit=10"
   ```

3. **Execute Recovery**
   ```bash
   # Perform disaster recovery (CRITICAL - DOUBLE CHECK)
   curl -X POST -H "Authorization: Bearer $ADMIN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"action":"disaster_recovery","options":{"confirmed":true}}' \
     "http://localhost:3000/api/admin/backup-system"
   ```

## Maintenance and Troubleshooting

### Log Locations

- **System Logs**: Database `backup_system_events` table
- **Backup Operations**: Database `backup_operations` table
- **Monitoring Alerts**: Database `backup_monitoring_alerts` table
- **Verification Results**: Database `backup_verifications` table
- **Test Results**: Database `backup_restoration_tests` table

### Common Issues

1. **Backup Failures**
   - Check disk space: `df -h`
   - Verify database connectivity
   - Check S3 credentials and permissions
   - Review error logs in `backup_operations` table

2. **Verification Failures**
   - Check backup file integrity
   - Verify test environment connectivity
   - Review verification logs for specific errors
   - Ensure sufficient resources for test restoration

3. **Alert Notification Issues**
   - Verify SendGrid API key and configuration
   - Check Slack webhook URL and permissions
   - Test SMS service credentials
   - Review notification logs in monitoring tables

### Performance Tuning

1. **Backup Optimization**
   ```javascript
   // Adjust compression and parallelization
   const config = {
     performance: {
       maxConcurrentBackups: 2,
       compressionLevel: 6,
       chunkSize: 1024 * 1024 * 5 // 5MB chunks
     }
   };
   ```

2. **Storage Optimization**
   - Implement S3 lifecycle policies
   - Use appropriate storage classes
   - Regular cleanup of old backups
   - Monitor storage costs

3. **Network Optimization**
   - Use VPC endpoints for S3 access
   - Implement backup compression
   - Schedule large backups during off-peak hours

## Security Considerations

### Encryption

- **At Rest**: AES-256 encryption for stored backups
- **In Transit**: TLS encryption for data transfer
- **Key Management**: Secure key storage and rotation

### Access Control

- **API Authentication**: Bearer token authentication
- **Database Access**: Role-based database permissions
- **S3 Access**: IAM policies with least privilege
- **Audit Trail**: Comprehensive logging of all operations

### Compliance

- **Data Retention**: Configurable retention policies
- **Privacy**: GDPR-compliant data handling
- **Audit**: Comprehensive audit trails
- **Incident Response**: Documented procedures and notifications

## Support and Maintenance

### Regular Tasks

- **Weekly**: Review backup success rates and performance metrics
- **Monthly**: Test disaster recovery procedures
- **Quarterly**: Review and update recovery procedures
- **Annually**: Full system security audit

### Contact Information

- **Technical Issues**: tech@zencap.co
- **Emergency**: Use SMS alert system or call on-call engineer
- **System Administration**: admin@zencap.co

### Documentation Updates

This documentation should be updated whenever:
- New components are added to the backup system
- Configuration options are modified
- Recovery procedures are changed
- Contact information is updated

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintained By**: ZenCap Technical Team