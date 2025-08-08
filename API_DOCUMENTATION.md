# Zenith Capital Advisors API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication & Security](#authentication--security)
- [Rate Limiting](#rate-limiting)
- [Core Business APIs](#core-business-apis)
- [Payment Processing APIs](#payment-processing-apis)
- [File Management APIs](#file-management-apis)
- [Analytics & Monitoring APIs](#analytics--monitoring-apis)
- [Admin & Management APIs](#admin--management-apis)
- [System & Health APIs](#system--health-apis)
- [Error Handling](#error-handling)
- [Testing Collection](#testing-collection)
- [Developer Guide](#developer-guide)

## Overview

The Zenith Capital Advisors API provides comprehensive backend services for a high-value financial modeling and investment advisory platform. The API handles financial model purchases ($2,985-$4,985), secure Excel file processing, customer management, and premium content delivery.

### Base URLs
- **Production**: `https://zencap-website.vercel.app/api`
- **Development**: `http://localhost:3001/api`

### API Standards
- RESTful architecture
- JSON request/response format
- HTTP status codes for responses
- Rate limiting on all endpoints
- Comprehensive error handling
- Security-first design

---

## Authentication & Security

### Security Headers
All API responses include security headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### NextAuth Integration
Authentication powered by NextAuth with Google OAuth provider.

**Endpoints:**
- `POST /auth/signin` - Initiate authentication
- `POST /auth/signout` - End user session
- `GET /auth/session` - Get current session

---

## Rate Limiting

### Rate Limit Tiers

| Category | Window | Limit | Description |
|----------|--------|-------|-------------|
| **Authentication** | 15 minutes | 5 requests | Login/logout attempts |
| **Upload** | 1 hour | 10 requests | Excel file uploads |
| **API General** | 1 minute | 100 requests | Standard API calls |
| **Public** | 1 minute | 200 requests | Public content access |
| **Admin** | 1 minute | 500 requests | Admin operations |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 2025-08-08T15:30:00.000Z
```

### Rate Limit Response
```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": "2025-08-08T15:30:00.000Z"
}
```

---

## Core Business APIs

### 1. Insights Management

#### GET /insights
Fetch investment insights and research content.

**Query Parameters:**
- `slug` (string, optional): Get specific insight by slug
- `admin` (boolean, optional): Include draft content (admin only)

**Public Request:**
```http
GET /api/insights
```

**Public Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "market-outlook-2025",
      "title": "Market Outlook for 2025",
      "summary": "Comprehensive analysis of market trends...",
      "content": "Full content...",
      "author": "Senior Analyst",
      "cover_image_url": "https://example.com/image.jpg",
      "published_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z",
      "status": "published",
      "tags": "market,outlook,2025",
      "date_published": "2025-01-15"
    }
  ]
}
```

#### POST /insights
Create new investment insight (Admin only).

**Request Body:**
```json
{
  "slug": "new-insight-slug",
  "title": "New Investment Insight",
  "summary": "Brief overview of the insight",
  "content": "Full insight content in HTML",
  "author": "Author Name",
  "cover_image_url": "https://example.com/cover.jpg",
  "status": "draft",
  "tags": "tag1,tag2,tag3",
  "date_published": "2025-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "slug": "new-insight-slug",
    "title": "New Investment Insight",
    "created_at": "2025-08-08T14:30:00Z",
    "status": "draft"
  }
}
```

#### PUT /insights
Update existing insight by slug (Admin only).

**Request Body:**
```json
{
  "slug": "existing-insight-slug",
  "title": "Updated Title",
  "content": "Updated content",
  "status": "published"
}
```

#### DELETE /insights
Delete insight by slug (Admin only).

**Request Body:**
```json
{
  "slug": "insight-to-delete"
}
```

**Response:** `204 No Content`

### 2. Financial Models Management

#### GET /models
Fetch financial models catalog.

**Query Parameters:**
- `slug` (string, optional): Get specific model by slug
- `category` (string, optional): Filter by category (private-equity, public-equity)
- `limit` (number, optional): Limit results (default: 50)

**Request:**
```http
GET /api/models?category=private-equity&limit=10
```

**Response:**
```json
{
  "models": [
    {
      "id": 1,
      "slug": "multifamily-real-estate-model",
      "title": "Multifamily Real Estate Investment Model",
      "description": "Comprehensive financial model for multifamily real estate investments",
      "category": "private-equity",
      "thumbnail_url": "https://example.com/thumbnail.jpg",
      "file_url": "https://secure-storage/model.xlsx",
      "price": 4985.00,
      "published_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z",
      "status": "active",
      "tags": "real-estate,multifamily,dcf",
      "excel_url": "https://secure-storage/preview.xlsx"
    }
  ],
  "total": 1,
  "category": "private-equity",
  "cached": false
}
```

#### POST /models
Create new financial model (Admin only).

**Request Body:**
```json
{
  "slug": "new-model-slug",
  "title": "New Financial Model",
  "description": "Model description",
  "category": "private-equity",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "file_url": "https://example.com/model.xlsx",
  "price": 4985.00,
  "status": "active",
  "tags": "new,model,dcf",
  "excel_url": "https://example.com/preview.xlsx"
}
```

#### PUT /models
Update existing model (Admin only).

#### DELETE /models
Delete model by slug (Admin only).

### 3. Lead Management

#### POST /contact
Submit contact form and generate lead.

**Rate Limit:** 10 submissions per 15 minutes per IP

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "company": "ABC Investment Group",
  "interest": "private-equity",
  "message": "Interested in your real estate models"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "success": true,
  "leadId": 456
}
```

**Error Response:**
```json
{
  "message": "Name, email, and message are required",
  "success": false
}
```

### 4. Newsletter Management

#### POST /newsletter
Subscribe to newsletter.

**Rate Limit:** 5 subscriptions per 15 minutes per IP

**Request Body:**
```json
{
  "email": "subscriber@example.com"
}
```

**Response:**
```json
{
  "message": "Successfully subscribed to newsletter",
  "success": true,
  "subscriberId": 789
}
```

#### GET /newsletter
Get newsletter subscribers (Admin only).

#### PATCH /newsletter
Update subscriber status (Admin only).

#### DELETE /newsletter
Remove subscriber (Admin only).

---

## Payment Processing APIs

### 1. Stripe Checkout Session

#### POST /stripe/create-checkout-session
Create Stripe checkout session for model purchase.

**Request Body:**
```json
{
  "modelId": 1,
  "modelTitle": "Multifamily Real Estate Investment Model",
  "modelPrice": 4985.00,
  "modelSlug": "multifamily-real-estate-model",
  "customerEmail": "buyer@example.com",
  "customerName": "Jane Buyer"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/session/cs_test_...",
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

**Error Response:**
```json
{
  "error": "Missing required fields",
  "details": "modelId, modelTitle, and modelPrice are required"
}
```

### 2. Stripe Webhooks

#### POST /stripe/webhook
Handle Stripe webhook events for payment processing.

**Supported Events:**
- `checkout.session.completed`: Complete purchase and send confirmation
- `payment_intent.succeeded`: Log successful payment

**Webhook Processing:**
1. Verify Stripe signature
2. Create/update customer record
3. Create order record with 7-day download window
4. Send purchase confirmation email
5. Create security audit log

### 3. Customer Portal

#### POST /stripe/customer-portal
Redirect to Stripe customer portal for subscription management.

### 4. Order Management

#### GET /orders/[sessionId]
Retrieve order details by session ID.

**Response:**
```json
{
  "id": 123,
  "stripe_session_id": "cs_test_...",
  "model_title": "Multifamily Real Estate Investment Model",
  "amount": 498500,
  "currency": "usd",
  "status": "completed",
  "download_expires_at": "2025-08-15T14:30:00Z",
  "download_count": 1,
  "max_downloads": 3,
  "created_at": "2025-08-08T14:30:00Z"
}
```

#### GET /account/orders
Get user's order history (requires authentication).

---

## File Management APIs

### 1. Excel Upload & Processing

#### POST /upload-excel
Secure Excel file upload with comprehensive validation.

**Rate Limit:** 10 uploads per hour per IP

**Content-Type:** `multipart/form-data`

**Security Features:**
- File type validation (.xlsx, .xlsm)
- Virus scanning
- Formula validation
- File encryption at rest
- Malware quarantine

**Request:**
```http
POST /api/upload-excel
Content-Type: multipart/form-data

file: [Excel file binary data]
```

**Response:**
```json
{
  "success": true,
  "message": "Excel file uploaded and secured successfully",
  "file": {
    "fileId": "a1b2c3d4e5f6g7h8",
    "originalName": "financial-model.xlsx",
    "size": 2456789,
    "sheets": ["Summary", "Calculations", "Data"],
    "rows": 100,
    "columns": 20,
    "uploadedAt": "2025-08-08T14:30:00Z",
    "securityChecks": ["virus_scan", "format_validation", "content_scan"],
    "warnings": []
  }
}
```

**Error Response:**
```json
{
  "error": "File validation failed",
  "issues": [
    {
      "type": "format",
      "message": "File contains suspicious formulas",
      "severity": "warning"
    }
  ]
}
```

### 2. Excel Data Access

#### GET /excel/data/[fileId]
Retrieve Excel file data securely.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "sheets": {
      "Summary": [
        ["Revenue", 1000000],
        ["Expenses", 750000],
        ["Net Income", 250000]
      ]
    },
    "metadata": {
      "fileId": "a1b2c3d4e5f6g7h8",
      "originalName": "financial-model.xlsx",
      "uploadedAt": "2025-08-08T14:30:00Z"
    }
  }
}
```

### 3. File Download

#### GET /download-excel
Download original Excel file securely.

#### GET /download/[orderId]
Download purchased model file.

**Authentication:** Required (order ownership verified)

**Response:** Binary Excel file with appropriate headers

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="model.xlsx"
```

---

## Analytics & Monitoring APIs

### 1. Business Analytics

#### GET /analytics
Comprehensive business analytics dashboard data.

**Authentication:** Admin required

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": {
      "total": 1250,
      "latest": [...],
      "byDate": [...],
      "bySource": [...],
      "byInterest": [...],
      "recentActivity": [...]
    },
    "newsletter": {
      "subscribers": 3420,
      "recentActivity": [...]
    },
    "models": {
      "total": 12
    },
    "insights": {
      "total": 45
    },
    "summary": {
      "totalLeads": 1250,
      "totalSubscribers": 3420,
      "conversionRate": 73,
      "lastUpdated": "2025-08-08T14:30:00Z"
    }
  }
}
```

### 2. Advanced Analytics

#### GET /analytics/revenue-dashboard
Revenue and business metrics dashboard.

#### GET /analytics/attribution
Marketing attribution analysis.

#### GET /analytics/events
Custom event tracking.

#### POST /analytics/events
Track custom analytics events.

**Request Body:**
```json
{
  "eventType": "model_view",
  "modelSlug": "multifamily-real-estate-model",
  "metadata": {
    "source": "organic_search",
    "duration": 45
  }
}
```

### 3. Social Proof Analytics

#### GET /analytics/social-proof
Social proof metrics for public display.

**Response:**
```json
{
  "stats": {
    "modelsDownloaded": 2547,
    "happyClients": 1250,
    "avgSatisfactionScore": 4.8,
    "yearsExperience": 15
  },
  "testimonials": [...],
  "recentPurchases": [...]
}
```

---

## Admin & Management APIs

### 1. Database Management

#### GET /init-db
Initialize database tables (Development only).

#### GET /migrate-db
Run database migrations.

#### GET /verify-database
Verify database integrity and performance.

**Response:**
```json
{
  "status": "healthy",
  "tables": 15,
  "indexes": 25,
  "connections": {
    "active": 5,
    "idle": 10,
    "total": 15
  },
  "performance": {
    "avgQueryTime": 12.5,
    "slowQueries": 0
  }
}
```

### 2. Security & Auditing

#### GET /admin/backups
Manage database backups (Admin only).

#### POST /admin/backups
Create new backup (Admin only).

#### GET /monitoring/metrics
System performance metrics.

#### GET /monitoring/advanced-metrics
Detailed performance analytics.

#### POST /monitoring/alert
Create system alert.

---

## System & Health APIs

### 1. Health Checks

#### GET /health
Comprehensive system health check.

**Response:**
```json
{
  "success": true,
  "health": {
    "timestamp": "2025-08-08T14:30:00Z",
    "processingTime": 125,
    "overallStatus": "excellent",
    "healthScore": 98,
    "system": {
      "uptime": 86400,
      "nodeVersion": "v18.17.0",
      "memoryUsage": {
        "rss": 45678912,
        "heapTotal": 35651584,
        "heapUsed": 28934176,
        "external": 1456789
      },
      "environment": "production"
    },
    "checks": {
      "database": {
        "status": "healthy",
        "responseTime": 15
      },
      "tables": {
        "models": { "status": "accessible", "responseTime": 8 },
        "orders": { "status": "accessible", "responseTime": 6 },
        "customers": { "status": "accessible", "responseTime": 7 }
      },
      "performance": {
        "recentMetrics": [...],
        "slowOperations": [],
        "status": "good"
      },
      "business": {
        "orders": {
          "total": 45,
          "completed": 43,
          "failed": 2,
          "failureRate": "4%"
        },
        "revenue": 198540.00,
        "avgProcessingTime": "12s",
        "status": "excellent"
      }
    },
    "issues": {
      "errors": [],
      "warnings": [],
      "total": 0
    },
    "recommendations": []
  }
}
```

### 2. Performance Monitoring

#### GET /performance-monitor
Real-time performance monitoring.

#### POST /performance-monitor
Log performance metrics.

### 3. Error Handling

#### GET /errors
System error logs and analysis.

#### POST /errors
Log application errors.

---

## Error Handling

### Standard Error Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-08T14:30:00Z",
  "requestId": "req_a1b2c3d4e5f6g7h8"
}
```

### HTTP Status Codes

| Code | Description | Use Case |
|------|-------------|----------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `204` | No Content | Successful deletion |
| `206` | Partial Content | System degraded but functional |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `405` | Method Not Allowed | HTTP method not supported |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | System unavailable |

### Common Error Codes

| Code | Description |
|------|-------------|
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | User must authenticate |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `FILE_VALIDATION_FAILED` | Uploaded file failed security checks |
| `PAYMENT_FAILED` | Payment processing error |
| `DATABASE_ERROR` | Database operation failed |

---

## Testing Collection

### Postman Collection

```json
{
  "info": {
    "name": "ZenCap API Collection",
    "description": "Comprehensive API testing collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://zencap-website.vercel.app/api"
    },
    {
      "key": "authToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Core Business",
      "item": [
        {
          "name": "Get Insights",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/insights",
              "host": ["{{baseUrl}}"],
              "path": ["insights"]
            }
          }
        },
        {
          "name": "Get Models",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/models?category=private-equity",
              "host": ["{{baseUrl}}"],
              "path": ["models"],
              "query": [
                {
                  "key": "category",
                  "value": "private-equity"
                }
              ]
            }
          }
        },
        {
          "name": "Submit Contact Form",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"company\": \"Test Company\",\n  \"interest\": \"private-equity\",\n  \"message\": \"Test message\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/contact",
              "host": ["{{baseUrl}}"],
              "path": ["contact"]
            }
          }
        }
      ]
    },
    {
      "name": "Payment Processing",
      "item": [
        {
          "name": "Create Checkout Session",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"modelId\": 1,\n  \"modelTitle\": \"Test Model\",\n  \"modelPrice\": 4985,\n  \"modelSlug\": \"test-model\",\n  \"customerEmail\": \"buyer@example.com\",\n  \"customerName\": \"Test Buyer\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/stripe/create-checkout-session",
              "host": ["{{baseUrl}}"],
              "path": ["stripe", "create-checkout-session"]
            }
          }
        }
      ]
    },
    {
      "name": "System Health",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/health",
              "host": ["{{baseUrl}}"],
              "path": ["health"]
            }
          }
        },
        {
          "name": "Analytics",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/analytics",
              "host": ["{{baseUrl}}"],
              "path": ["analytics"]
            }
          }
        }
      ]
    }
  ]
}
```

### cURL Examples

#### Get Public Insights
```bash
curl -X GET "https://zencap-website.vercel.app/api/insights" \
  -H "Accept: application/json"
```

#### Submit Contact Form
```bash
curl -X POST "https://zencap-website.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@company.com",
    "company": "ABC Investment",
    "interest": "private-equity",
    "message": "Interested in your models"
  }'
```

#### Create Payment Session
```bash
curl -X POST "https://zencap-website.vercel.app/api/stripe/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": 1,
    "modelTitle": "Multifamily Real Estate Model",
    "modelPrice": 4985,
    "modelSlug": "multifamily-real-estate-model",
    "customerEmail": "buyer@example.com",
    "customerName": "Jane Buyer"
  }'
```

#### Upload Excel File
```bash
curl -X POST "https://zencap-website.vercel.app/api/upload-excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@financial-model.xlsx"
```

#### Check System Health
```bash
curl -X GET "https://zencap-website.vercel.app/api/health" \
  -H "Accept: application/json"
```

---

## Developer Guide

### Quick Start

1. **Environment Setup**
   ```bash
   # Clone repository
   git clone https://github.com/zenithcap/zencap-website.git
   cd zencap-website
   
   # Install dependencies
   npm install
   
   # Configure environment variables
   cp .env.example .env.local
   ```

2. **Database Setup**
   ```bash
   # Initialize database
   curl http://localhost:3001/api/init-db
   
   # Verify setup
   curl http://localhost:3001/api/verify-database
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # Server runs on http://localhost:3001
   ```

### Authentication Flow

1. User initiates login via NextAuth
2. OAuth redirect to Google
3. User consent and callback
4. Session token created
5. Subsequent API calls include session token
6. Rate limiting applied per authenticated user

### Best Practices

#### API Integration
- Always handle rate limiting responses (429)
- Implement exponential backoff for retries
- Validate all request data client-side
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Include appropriate headers (Content-Type, Authorization)

#### Error Handling
```javascript
// Example error handling
async function callAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('X-RateLimit-Reset');
      throw new Error(`Rate limited. Retry after: ${retryAfter}`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

#### File Upload Security
```javascript
// Secure file upload
async function uploadExcelFile(file) {
  // Client-side validation
  if (file.size > 100 * 1024 * 1024) { // 100MB
    throw new Error('File too large');
  }
  
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  const formData = new FormData();
  formData.append('file', file);

  return await callAPI('/upload-excel', {
    method: 'POST',
    body: formData,
    headers: {} // Don't set Content-Type for FormData
  });
}
```

### Performance Considerations

#### Caching Strategy
- Use ETags for client-side caching
- Implement Redis caching for expensive queries
- Cache static content with appropriate TTL
- Use materialized views for complex analytics

#### Database Optimization
- Use prepared statements (automatic with Vercel Postgres)
- Implement connection pooling
- Add appropriate indexes
- Monitor query performance

#### Rate Limiting Strategy
- Implement tiered rate limits based on user type
- Use sliding window for more accurate limiting
- Apply different limits per endpoint type
- Monitor rate limit metrics

### Monitoring & Debugging

#### Health Monitoring
```bash
# Check system health
curl /api/health

# Monitor performance
curl /api/performance-monitor

# View error logs
curl /api/errors
```

#### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run dev

# Check environment
curl /api/debug-env
```

### Production Deployment

#### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Rate limits configured appropriately
- [ ] Security headers enabled
- [ ] Error tracking configured
- [ ] Health checks passing
- [ ] Performance benchmarks met

#### Monitoring Setup
- Configure Vercel Analytics
- Set up error tracking (Sentry)
- Monitor Stripe webhooks
- Track business metrics
- Alert on critical errors

### Support & Maintenance

#### Logs Location
- Application logs: Vercel Functions logs
- Database logs: Vercel Postgres logs  
- Error logs: `/api/errors` endpoint
- Performance logs: `/api/monitoring/metrics`

#### Common Issues & Solutions

1. **Rate Limit Exceeded**
   - Check rate limit headers
   - Implement proper retry logic
   - Consider upgrading limits

2. **File Upload Failures**
   - Verify file size limits
   - Check security validation
   - Review virus scan logs

3. **Payment Processing Issues**
   - Check Stripe webhook configuration
   - Verify webhook signatures
   - Monitor payment failure rates

4. **Database Connection Issues**
   - Check connection pool status
   - Monitor query performance
   - Verify table accessibility

For additional support, contact: support@zenithcapital.com

---

**Last Updated:** August 8, 2025  
**API Version:** 2.0  
**Documentation Version:** 1.0