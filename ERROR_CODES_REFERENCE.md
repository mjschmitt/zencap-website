# ZenCap API Error Codes Reference

## Overview
This document provides a comprehensive reference for all error codes in the ZenCap API system, including HTTP status codes, custom error codes, troubleshooting steps, and resolution guidance.

## Error Response Format

All API errors follow this consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2025-08-08T14:30:00Z",
  "requestId": "req_a1b2c3d4e5f6g7h8",
  "details": { /* Additional error context */ }
}
```

---

## HTTP Status Codes

### Success Codes (2xx)

| Code | Status | Description | Usage |
|------|--------|-------------|--------|
| 200 | OK | Request successful | Standard successful response |
| 201 | Created | Resource created successfully | After POST operations (leads, insights, models) |
| 204 | No Content | Successful deletion | After DELETE operations |
| 206 | Partial Content | System degraded but functional | Health check with warnings |

### Client Error Codes (4xx)

| Code | Status | Description | Common Causes |
|------|--------|-------------|---------------|
| 400 | Bad Request | Invalid request data | Missing fields, invalid format, validation errors |
| 401 | Unauthorized | Authentication required | Missing/invalid session token |
| 403 | Forbidden | Insufficient permissions | Non-admin accessing admin endpoints |
| 404 | Not Found | Resource not found | Invalid slug, deleted resource |
| 405 | Method Not Allowed | HTTP method not supported | Using GET on POST-only endpoint |
| 413 | Payload Too Large | Request entity too large | File upload exceeds 100MB limit |
| 429 | Too Many Requests | Rate limit exceeded | API rate limit hit |

### Server Error Codes (5xx)

| Code | Status | Description | Action Required |
|------|--------|-------------|----------------|
| 500 | Internal Server Error | Generic server error | Check logs, contact support |
| 502 | Bad Gateway | Upstream service error | Database or external service down |
| 503 | Service Unavailable | System temporarily unavailable | Critical system failure |
| 504 | Gateway Timeout | Request timeout | Slow query or external service timeout |

---

## Custom Error Codes

### Authentication & Authorization (AUTH_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `AUTH_REQUIRED` | Authentication required | 401 | Include valid session token |
| `AUTH_EXPIRED` | Session expired | 401 | Re-authenticate user |
| `AUTH_INVALID` | Invalid credentials | 401 | Check authentication flow |
| `AUTH_FORBIDDEN` | Insufficient permissions | 403 | Verify user role/permissions |
| `AUTH_RATE_LIMITED` | Too many auth attempts | 429 | Wait before retrying |

**Example Response:**
```json
{
  "success": false,
  "error": "Authentication required to access this resource",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-08-08T14:30:00Z"
}
```

### Validation Errors (VALIDATION_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `VALIDATION_REQUIRED_FIELD` | Required field missing | 400 | Include all required fields |
| `VALIDATION_INVALID_FORMAT` | Field format invalid | 400 | Fix field format (email, phone, etc.) |
| `VALIDATION_LENGTH_ERROR` | Field length invalid | 400 | Check min/max length requirements |
| `VALIDATION_TYPE_ERROR` | Wrong data type | 400 | Ensure correct data types |
| `VALIDATION_ENUM_ERROR` | Invalid enum value | 400 | Use valid enumeration values |

**Example Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_REQUIRED_FIELD",
  "details": {
    "field": "email",
    "message": "Email is required"
  }
}
```

### Rate Limiting (RATE_LIMIT_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `RATE_LIMIT_EXCEEDED` | General rate limit hit | 429 | Wait for rate limit reset |
| `RATE_LIMIT_UPLOAD` | Upload rate limit hit | 429 | Wait 1 hour before retry |
| `RATE_LIMIT_AUTH` | Auth rate limit hit | 429 | Wait 15 minutes |
| `RATE_LIMIT_CONTACT` | Contact form rate limit | 429 | Wait 15 minutes |
| `RATE_LIMIT_NEWSLETTER` | Newsletter rate limit | 429 | Wait 15 minutes |

**Example Response:**
```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": "2025-08-08T15:00:00Z",
  "details": {
    "limit": 100,
    "remaining": 0,
    "resetTime": "2025-08-08T15:00:00Z"
  }
}
```

### File Processing (FILE_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `FILE_TOO_LARGE` | File exceeds size limit | 413 | Reduce file size (max 100MB) |
| `FILE_INVALID_TYPE` | Invalid file type | 400 | Use .xlsx or .xlsm files only |
| `FILE_CORRUPTED` | File is corrupted/invalid | 400 | Upload a valid Excel file |
| `FILE_VIRUS_DETECTED` | Malware detected | 400 | File quarantined, use clean file |
| `FILE_PROCESSING_ERROR` | Error processing file | 500 | Retry or contact support |
| `FILE_NOT_FOUND` | File not found | 404 | Check file ID and permissions |
| `FILE_ACCESS_DENIED` | No permission to access file | 403 | Verify file ownership |
| `FILE_EXPIRED` | File access expired | 410 | File retention period exceeded |

**Example Response:**
```json
{
  "success": false,
  "error": "File validation failed",
  "code": "FILE_VIRUS_DETECTED",
  "details": {
    "threats": ["Trojan.Generic"],
    "action": "File quarantined for security"
  }
}
```

### Payment Processing (PAYMENT_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `PAYMENT_FAILED` | Payment processing failed | 400 | Retry with valid payment method |
| `PAYMENT_DECLINED` | Card declined | 400 | Use different payment method |
| `PAYMENT_INSUFFICIENT_FUNDS` | Insufficient funds | 400 | Check account balance |
| `PAYMENT_EXPIRED` | Payment session expired | 410 | Create new checkout session |
| `PAYMENT_ALREADY_PROCESSED` | Duplicate payment attempt | 409 | Check existing order status |
| `PAYMENT_WEBHOOK_ERROR` | Webhook processing error | 500 | Contact support immediately |

**Example Response:**
```json
{
  "success": false,
  "error": "Payment processing failed",
  "code": "PAYMENT_DECLINED",
  "details": {
    "stripeError": "Your card was declined",
    "declineCode": "generic_decline"
  }
}
```

### Database Operations (DB_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `DB_CONNECTION_ERROR` | Database connection failed | 503 | Check database connectivity |
| `DB_QUERY_ERROR` | Database query failed | 500 | Check query syntax and data |
| `DB_CONSTRAINT_ERROR` | Database constraint violation | 409 | Check for duplicate/invalid data |
| `DB_TIMEOUT` | Database query timeout | 504 | Optimize query or retry |
| `DB_MIGRATION_ERROR` | Database migration failed | 500 | Check migration scripts |

**Example Response:**
```json
{
  "success": false,
  "error": "Database operation failed",
  "code": "DB_CONNECTION_ERROR",
  "details": {
    "message": "Unable to connect to database",
    "retryable": true
  }
}
```

### Business Logic (BUSINESS_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `BUSINESS_INVALID_OPERATION` | Invalid business operation | 400 | Check operation requirements |
| `BUSINESS_RESOURCE_CONFLICT` | Resource conflict | 409 | Check resource state |
| `BUSINESS_QUOTA_EXCEEDED` | Quota/limit exceeded | 429 | Upgrade plan or wait |
| `BUSINESS_FEATURE_DISABLED` | Feature not available | 403 | Check feature availability |
| `BUSINESS_MAINTENANCE_MODE` | System in maintenance | 503 | Wait for maintenance completion |

### External Services (EXTERNAL_*)

| Code | Description | HTTP Status | Resolution |
|------|-------------|-------------|------------|
| `EXTERNAL_SERVICE_ERROR` | External service error | 502 | Service temporarily unavailable |
| `EXTERNAL_STRIPE_ERROR` | Stripe API error | 502 | Check Stripe service status |
| `EXTERNAL_EMAIL_ERROR` | Email service error | 502 | Email delivery may be delayed |
| `EXTERNAL_TIMEOUT` | External service timeout | 504 | Retry after delay |

---

## Error Code Categories by Endpoint

### Contact Form (/api/contact)

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `VALIDATION_REQUIRED_FIELD` | Missing name, email, or message | Include all required fields |
| `VALIDATION_INVALID_FORMAT` | Invalid email format | Use valid email format |
| `RATE_LIMIT_CONTACT` | Too many submissions | Wait 15 minutes |
| `DB_CONNECTION_ERROR` | Database unavailable | Retry or use fallback form |

### File Upload (/api/upload-excel)

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `FILE_TOO_LARGE` | File over 100MB | Compress or split file |
| `FILE_INVALID_TYPE` | Not .xlsx/.xlsm | Use Excel format only |
| `FILE_VIRUS_DETECTED` | Malware found | Scan file, use clean version |
| `RATE_LIMIT_UPLOAD` | Upload limit hit | Wait 1 hour |
| `AUTH_REQUIRED` | No authentication | Login required |

### Payment Processing (/api/stripe/*)

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `PAYMENT_DECLINED` | Card declined | Try different card |
| `PAYMENT_INSUFFICIENT_FUNDS` | Not enough funds | Check balance |
| `VALIDATION_REQUIRED_FIELD` | Missing model/customer data | Include all required fields |
| `BUSINESS_INVALID_OPERATION` | Invalid purchase attempt | Verify model availability |

### Admin Operations (/api/admin/*)

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `AUTH_FORBIDDEN` | Not admin user | Admin access required |
| `VALIDATION_REQUIRED_FIELD` | Missing admin data | Include required fields |
| `DB_CONSTRAINT_ERROR` | Data integrity issue | Check data relationships |

---

## Troubleshooting Guide

### Client-Side Error Handling

```javascript
async function handleAPICall(endpoint, options) {
  try {
    const response = await fetch(`/api${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new APIError(data.error, data.code, response.status, data.details);
    }
    
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      return handleKnownError(error);
    } else {
      return handleNetworkError(error);
    }
  }
}

function handleKnownError(error) {
  switch (error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      const retryAfter = new Date(error.details?.retryAfter);
      showMessage(`Rate limited. Try again at ${retryAfter.toLocaleTimeString()}`);
      break;
      
    case 'AUTH_REQUIRED':
      redirectToLogin();
      break;
      
    case 'FILE_TOO_LARGE':
      showMessage('File is too large. Maximum size is 100MB.');
      break;
      
    case 'PAYMENT_DECLINED':
      showMessage('Payment declined. Please try a different payment method.');
      break;
      
    default:
      showMessage(error.message || 'An error occurred');
  }
}
```

### Server-Side Error Logging

```javascript
function logError(error, context) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    code: error.code,
    stack: error.stack,
    context: {
      endpoint: context.req?.url,
      method: context.req?.method,
      userId: context.userId,
      requestId: context.requestId
    }
  };
  
  // Log to database
  logToDatabase('error_logs', errorLog);
  
  // Log to monitoring service
  if (error.severity === 'critical') {
    alertingService.sendAlert(errorLog);
  }
}
```

### Rate Limit Troubleshooting

```javascript
// Check rate limit status
function checkRateLimit(response) {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  console.log(`Rate Limit: ${limit - remaining}/${limit} used`);
  console.log(`Resets at: ${new Date(reset).toLocaleTimeString()}`);
  
  if (remaining < 10) {
    console.warn('Approaching rate limit!');
  }
}
```

### Database Error Recovery

```javascript
async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.code === 'DB_CONNECTION_ERROR' && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Error Monitoring & Alerting

### Critical Errors (Immediate Alert)
- `PAYMENT_WEBHOOK_ERROR` - Payment processing failure
- `DB_CONNECTION_ERROR` - Database connectivity lost
- `FILE_VIRUS_DETECTED` - Security threat detected
- `BUSINESS_MAINTENANCE_MODE` - System unavailable

### Warning Errors (Monitor Trends)
- `RATE_LIMIT_EXCEEDED` - High traffic/abuse
- `PAYMENT_DECLINED` - Payment issues
- `FILE_PROCESSING_ERROR` - File handling problems
- `EXTERNAL_SERVICE_ERROR` - Third-party issues

### Informational (Log Only)
- `VALIDATION_*` - User input errors
- `AUTH_REQUIRED` - Normal authentication flow
- `FILE_INVALID_TYPE` - User education needed

---

## Integration Examples

### React Error Boundary
```javascript
class APIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        return <RateLimitMessage retryAfter={error.details?.retryAfter} />;
      }
      
      if (error.code === 'AUTH_REQUIRED') {
        return <LoginPrompt />;
      }
      
      return <GenericError error={error} />;
    }
    
    return this.props.children;
  }
}
```

### Toast Notifications
```javascript
function showErrorToast(error) {
  const toastConfig = {
    'RATE_LIMIT_EXCEEDED': {
      type: 'warning',
      duration: 5000,
      action: 'Show retry timer'
    },
    'FILE_TOO_LARGE': {
      type: 'error',
      duration: 7000,
      action: 'Show size limit info'
    },
    'PAYMENT_DECLINED': {
      type: 'error',
      duration: 8000,
      action: 'Show payment help'
    }
  };
  
  const config = toastConfig[error.code] || { type: 'error', duration: 5000 };
  
  toast(error.message, {
    type: config.type,
    autoClose: config.duration
  });
}
```

---

## Support & Escalation

### Self-Service Resolution
- **4xx errors**: Review API documentation and request format
- **Rate limiting**: Wait for rate limit reset time
- **Validation errors**: Fix input data and retry
- **File errors**: Check file format and size

### Contact Support For:
- **5xx errors**: Server-side issues requiring investigation
- **Payment errors**: Transaction and billing issues  
- **Security errors**: Potential security incidents
- **Persistent 4xx errors**: Possible API bugs

### Emergency Escalation:
- **System outages**: Critical infrastructure failures
- **Security incidents**: Malware detection, data breaches
- **Payment processing down**: Revenue-impacting issues

**Support Email**: api-support@zenithcapital.com  
**Emergency Phone**: +1-800-ZENCAP-HELP  
**Status Page**: https://status.zenithcapital.com

---

**Last Updated:** August 8, 2025  
**Version:** 2.0  
**Document Owner:** ZenCap API Team