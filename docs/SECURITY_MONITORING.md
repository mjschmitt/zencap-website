# Security Monitoring System Documentation

## Overview

This document outlines the comprehensive production security monitoring system implemented for the ZenCap financial advisory platform. The system provides real-time threat detection, incident response, vulnerability assessment, and compliance monitoring.

## System Architecture

### Core Components

1. **SecurityMonitor Class** (`src/utils/security/SecurityMonitor.js`)
   - Real-time security event logging and analysis
   - Threat intelligence management
   - Automated threat detection and response
   - Security metrics collection and reporting

2. **Security Middleware** (`src/middleware/security.js`)
   - Request filtering and threat detection
   - Rate limiting and DDoS protection
   - Input sanitization and validation
   - Session security enhancement

3. **API Endpoints**
   - `/api/security/dashboard` - Real-time security dashboard data
   - `/api/security/vulnerabilities` - Vulnerability scanning
   - `/api/security/incidents` - Incident management
   - `/api/security/init` - System initialization

4. **Security Dashboard** (`src/components/admin/SecurityDashboard.js`)
   - Real-time monitoring interface
   - Threat intelligence visualization
   - Incident management UI
   - Security analytics and reporting

## Database Schema

### Security Events Table
```sql
security_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  threat_level VARCHAR(20) NOT NULL,
  source_ip VARCHAR(45),
  user_id INTEGER,
  user_agent TEXT,
  request_path VARCHAR(500),
  event_data JSONB,
  geo_location JSONB,
  session_id VARCHAR(128),
  timestamp TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE
)
```

### Threat Intelligence Table
```sql
threat_intelligence (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) UNIQUE,
  threat_score INTEGER DEFAULT 0,
  threat_categories JSONB,
  incident_count INTEGER DEFAULT 1,
  blocked BOOLEAN DEFAULT FALSE,
  first_seen TIMESTAMP,
  last_seen TIMESTAMP
)
```

### Security Incidents Table
```sql
security_incidents (
  id VARCHAR(64) PRIMARY KEY,
  incident_type VARCHAR(100),
  severity VARCHAR(10),
  status VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  affected_systems JSONB,
  timeline JSONB,
  resolution_notes TEXT
)
```

## Security Event Types

### Authentication Events
- `LOGIN_SUCCESS` - Successful user login
- `LOGIN_FAILURE` - Failed login attempt
- `LOGIN_BRUTE_FORCE` - Brute force attack detection
- `MFA_BYPASS_ATTEMPT` - MFA bypass attempt
- `SUSPICIOUS_LOGIN_LOCATION` - Login from suspicious location

### Authorization Events
- `UNAUTHORIZED_ACCESS` - Unauthorized resource access
- `PRIVILEGE_ESCALATION` - Privilege escalation attempt
- `ADMIN_ACCESS` - Administrative access

### File Security Events
- `FILE_UPLOAD_MALICIOUS` - Malicious file upload detected
- `FILE_ACCESS_UNAUTHORIZED` - Unauthorized file access
- `EXCEL_MACRO_DETECTED` - Excel macro detection

### API Security Events
- `RATE_LIMIT_EXCEEDED` - Rate limit violation
- `SQL_INJECTION_ATTEMPT` - SQL injection attempt
- `XSS_ATTEMPT` - Cross-site scripting attempt
- `CSRF_ATTACK` - CSRF attack detection

### System Security Events
- `DDOS_ATTACK` - DDoS attack detection
- `VULNERABILITY_EXPLOIT` - Vulnerability exploitation
- `SECURITY_POLICY_VIOLATION` - Security policy violation

## Threat Detection

### SQL Injection Detection
```javascript
const sqlPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|(--)|(\/\*)/gi,
  /'(\s)*(OR|AND)\s*'[^']*'(\s)*=/gi,
  /'(\s)*(OR|AND)\s*\d+(\s)*=/gi,
  /\b(or|and)\b\s+\d+\s*=\s*\d+/gi
];
```

### XSS Detection
```javascript
const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>/gi
];
```

### File Upload Security
- File size limits (100MB max)
- Extension validation
- Virus scanning integration
- Macro detection in Excel files
- Quarantine suspicious files

## Rate Limiting Configuration

### Endpoint-Specific Limits
```javascript
RATE_LIMITS: {
  auth: { windowMs: 900000, max: 5 },      // 15 min, 5 attempts
  api: { windowMs: 60000, max: 100 },      // 1 min, 100 requests  
  upload: { windowMs: 3600000, max: 20 },  // 1 hour, 20 uploads
  public: { windowMs: 60000, max: 200 }    // 1 min, 200 requests
}
```

### DDoS Protection
- 1000 requests per minute threshold
- Automatic IP blocking
- Geographic filtering
- Distributed rate limiting with Redis

## Incident Response

### Severity Levels
- **P1 (Critical)**: 15-minute response time
  - Active attacks, system compromise, data breaches
- **P2 (High)**: 1-hour response time
  - Significant security threats
- **P3 (Medium)**: 4-hour response time
  - Potential security issues
- **P4 (Low)**: 24-hour response time
  - Minor policy violations

### Automated Responses
```javascript
AUTO_RESPONSES: {
  'ddos_attack': ['block_source_ip', 'enable_rate_limiting', 'alert_team'],
  'brute_force_attack': ['block_source_ip', 'disable_account', 'alert_team'],
  'sql_injection_attack': ['block_source_ip', 'alert_team', 'log_detailed'],
  'data_breach': ['isolate_system', 'alert_leadership', 'begin_forensics']
}
```

## Vulnerability Scanning

### Security Headers Check
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Strict-Transport-Security

### Database Security Assessment
- SSL/TLS enforcement
- Password policy compliance
- Audit logging verification
- Default credential detection
- Sensitive data encryption

### File System Security
- Sensitive file detection
- Permission verification
- Backup file identification
- Upload directory security

### Dependency Security
- Known vulnerability detection
- Outdated package identification
- Security package verification

## Monitoring and Alerting

### Real-Time Metrics
- Total security events
- Active threat count
- Blocked IP addresses
- System health status

### Dashboard Features
- Live threat monitoring
- Geographic threat distribution
- Event type analysis
- Incident tracking
- Performance metrics

### Alert Configuration
```javascript
ESCALATION_CONTACTS: {
  security_team: 'security@zencap.com',
  leadership: 'leadership@zencap.com',
  legal: 'legal@zencap.com'
}
```

## GDPR Compliance

### Data Protection Features
- Consent management
- Data minimization
- Right to deletion
- Data portability
- Breach notification (72-hour requirement)
- Audit trail maintenance

### Privacy Controls
- PII encryption at rest and in transit
- Access logging for all personal data
- Automated data retention policies
- User consent tracking

## API Security

### Authentication & Authorization
- JWT token validation
- Role-based access control (RBAC)
- Multi-factor authentication for admin
- Session management with secure timeouts

### Input Validation
- Request sanitization
- Parameter validation
- File upload validation
- CSRF protection

### Output Security
- Response sanitization
- Error message filtering
- Secure headers
- Content-Type validation

## Performance Optimization

### Database Indexing
```sql
INDEX idx_security_events_type (event_type)
INDEX idx_security_events_timestamp (timestamp)
INDEX idx_threat_intel_ip (ip_address)
INDEX idx_incidents_severity (severity)
```

### Caching Strategy
- Redis for real-time metrics
- Security event caching (5-minute TTL)
- Threat intelligence caching
- Dashboard data optimization

## Deployment Configuration

### Environment Variables
```env
# Security Configuration
SECURITY_INIT_TOKEN=your-secure-initialization-token
WHITELISTED_IPS=admin.ip1,admin.ip2
REDIS_URL=your-redis-connection-string

# Notification Configuration
SECURITY_TEAM_EMAIL=security@zencap.com
LEADERSHIP_EMAIL=leadership@zencap.com
LEGAL_TEAM_EMAIL=legal@zencap.com
```

### Production Setup
1. Initialize security system: `POST /api/security/init`
2. Configure security policies
3. Set up monitoring alerts
4. Verify database indexes
5. Test incident response procedures

## Usage Examples

### Creating Security Events
```javascript
await securityMonitor.logSecurityEvent(
  SECURITY_EVENTS.LOGIN_FAILURE,
  THREAT_LEVELS.MEDIUM,
  {
    ip: '192.168.1.100',
    userId: 123,
    userAgent: 'Mozilla/5.0...',
    path: '/api/auth/login',
    data: { username: 'user@example.com' }
  }
);
```

### Checking for Threats
```javascript
// Check for brute force attacks
const isBruteForce = await securityMonitor.checkBruteForce(ip, userId);

// Validate rate limits
const withinLimits = await securityMonitor.checkRateLimit(ip, path, userId);

// Scan file uploads
const threats = await securityMonitor.scanFileUpload(file, context);
```

### Incident Management
```javascript
// Create incident
const incident = await createIncident({
  incidentType: 'brute_force_attack',
  severity: 'P2',
  title: 'Multiple login failures detected',
  description: 'Suspicious login activity from IP 192.168.1.100',
  sourceIp: '192.168.1.100'
});

// Update incident
await updateIncident(incidentId, {
  status: 'resolved',
  resolutionNotes: 'IP blocked and user notified'
});
```

## Security Best Practices

### Development Guidelines
1. Never log sensitive data (passwords, tokens, PII)
2. Validate all input at API boundaries
3. Use parameterized queries to prevent SQL injection
4. Implement proper error handling
5. Apply principle of least privilege

### Operational Security
1. Regular vulnerability scans
2. Security event review
3. Incident response drills
4. Access control audits
5. Security awareness training

### Monitoring Requirements
1. Real-time threat detection
2. Automated incident response
3. Comprehensive audit logging
4. Performance monitoring
5. Compliance reporting

## Troubleshooting

### Common Issues
1. **High false positive rates**: Adjust threat detection thresholds
2. **Performance impact**: Optimize database queries and add indexes
3. **Alert fatigue**: Fine-tune notification rules
4. **Missing events**: Verify middleware configuration

### Debug Commands
```bash
# Check security system status
curl /api/security/dashboard?metric=realtime

# Run vulnerability scan
curl -X POST /api/security/vulnerabilities?type=full

# View recent incidents
curl /api/security/incidents?timeRange=24h
```

## Future Enhancements

### Planned Features
1. Machine learning threat detection
2. Advanced behavioral analysis
3. Integration with external threat feeds
4. Automated remediation actions
5. Security orchestration platform

### Compliance Extensions
1. SOC 2 Type II compliance
2. PCI DSS for payment processing
3. ISO 27001 certification support
4. Enhanced audit reporting

This security monitoring system provides comprehensive protection for the ZenCap platform, ensuring the safety of financial data and maintaining client trust through robust security controls and monitoring capabilities.