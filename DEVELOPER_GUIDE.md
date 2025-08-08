# ZenCap API Developer Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [File Upload Guide](#file-upload-guide)
- [Payment Integration](#payment-integration)
- [Testing Guide](#testing-guide)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)
- [Debugging & Troubleshooting](#debugging--troubleshooting)

## Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/zenithcap/zencap-website.git
cd zencap-website

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment Variables

Create `.env.local` with the following variables:

```env
# Database
POSTGRES_URL="your_postgres_connection_string"
POSTGRES_URL_NON_POOLING="your_non_pooling_postgres_url"

# SendGrid Email
SENDGRID_API_KEY="your_sendgrid_api_key"
FROM_EMAIL="noreply@zenithcapital.com"

# Stripe Payment Processing
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3001"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Analytics
NEXT_PUBLIC_GA_ID="your_google_analytics_id"
```

### 3. Initialize Database
```bash
# Start development server
npm run dev

# Initialize database tables
curl http://localhost:3001/api/init-db

# Verify setup
curl http://localhost:3001/api/health
```

### 4. Test API
```bash
# Test basic endpoints
curl http://localhost:3001/api/insights
curl http://localhost:3001/api/models
curl http://localhost:3001/api/health
```

## Environment Setup

### Development Requirements
- Node.js 18.17.0 or higher
- PostgreSQL database (Vercel Postgres recommended)
- SendGrid account for emails
- Stripe account for payments
- Google OAuth app for authentication

### Database Schema
The system uses 15+ tables including:
- `leads` - Contact form submissions
- `newsletter_subscribers` - Newsletter subscriptions  
- `insights` - Investment research content
- `models` - Financial model catalog
- `orders` - Purchase transactions
- `customers` - Customer records
- `security_audit_logs` - Security events
- `performance_metrics` - System performance data

### File Structure
```
src/
├── pages/api/          # 50+ API endpoints
├── utils/              # Database & utility functions
├── middleware/         # Rate limiting & security
├── components/         # React components
└── config/            # Configuration files
```

## Authentication

### NextAuth Integration
The API uses NextAuth with Google OAuth provider for authentication.

#### Authentication Flow
1. User clicks "Sign In" button
2. Redirect to Google OAuth
3. User grants permissions
4. OAuth callback with authorization code
5. NextAuth exchanges code for tokens
6. Session created and stored
7. Subsequent requests include session token

#### Protecting API Routes
```javascript
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // Check authentication
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Authorized user logic
  const userId = session.user.id;
  // ...
}
```

#### Client-Side Usage
```javascript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p>Not logged in</p>;
  
  return <p>Welcome {session.user.name}!</p>;
}
```

## Rate Limiting

### Rate Limit Configuration
```javascript
// Rate limits by endpoint category
const RateLimits = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 },        // 5/15min
  upload: { windowMs: 60 * 60 * 1000, max: 10 },     // 10/hour  
  api: { windowMs: 60 * 1000, max: 100 },            // 100/min
  public: { windowMs: 60 * 1000, max: 200 },         // 200/min
  admin: { windowMs: 60 * 1000, max: 500 }           // 500/min
};
```

### Implementing Rate Limiting
```javascript
import { withRateLimit } from '@/middleware/rate-limit';

async function handler(req, res) {
  // Your API logic
}

// Apply rate limiting
export default withRateLimit(handler, 'api');
```

### Handling Rate Limits Client-Side
```javascript
async function apiCall(endpoint, options) {
  const response = await fetch(`/api${endpoint}`, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('X-RateLimit-Reset');
    const waitTime = new Date(retryAfter) - new Date();
    
    console.log(`Rate limited. Retry in ${waitTime}ms`);
    
    // Implement exponential backoff
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return apiCall(endpoint, options); // Retry
  }
  
  return response.json();
}
```

## Error Handling

### Standard Error Format
All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-08T14:30:00Z",
  "requestId": "req_a1b2c3d4e5f6g7h8"
}
```

### Error Handling Middleware
```javascript
function errorHandler(error, req, res, next) {
  console.error('API Error:', error);
  
  // Log error to database
  await logError({
    message: error.message,
    stack: error.stack,
    endpoint: req.url,
    method: req.method,
    timestamp: new Date()
  });
  
  // Return appropriate error response
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.details
    });
  }
  
  // Generic server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'SERVER_ERROR',
    requestId: req.id
  });
}
```

### Client-Side Error Handling
```javascript
class APIClient {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new APIError(data.error, data.code, response.status);
      }
      
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError('Network error', 'NETWORK_ERROR', 0);
    }
  }
}

class APIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'APIError';
  }
}
```

## File Upload Guide

### Secure Excel Upload
The system provides comprehensive Excel file security validation:

#### Security Features
- File type validation (.xlsx, .xlsm only)
- File size limits (100MB max)
- Virus scanning
- Malicious formula detection
- Content sanitization
- Encryption at rest

#### Upload Implementation
```javascript
async function uploadExcelFile(file) {
  // Client-side validation
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error('File too large (max 100MB)');
  }
  
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only .xlsx and .xlsm files allowed.');
  }
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  
  // Upload with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(`Upload progress: ${percentComplete}%`);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    };
    
    xhr.onerror = () => reject(new Error('Upload failed'));
    
    xhr.open('POST', '/api/upload-excel');
    xhr.send(formData);
  });
}
```

#### Processing Uploaded Files
```javascript
// Retrieve file data
async function getExcelData(fileId) {
  const response = await fetch(`/api/excel/data/${fileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to retrieve file data');
  }
  
  return response.json();
}

// Download processed file
async function downloadFile(fileId, filename) {
  const response = await fetch(`/api/download-excel?fileId=${fileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Download failed');
  }
  
  // Create download link
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
```

## Payment Integration

### Stripe Checkout Flow

#### 1. Create Checkout Session
```javascript
async function createCheckoutSession(modelData) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      modelId: modelData.id,
      modelTitle: modelData.title,
      modelPrice: modelData.price,
      modelSlug: modelData.slug,
      customerEmail: user.email,
      customerName: user.name
    })
  });
  
  const { url } = await response.json();
  
  // Redirect to Stripe Checkout
  window.location.href = url;
}
```

#### 2. Handle Success/Failure
```javascript
// Success page (pages/purchase/success.js)
export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  
  useEffect(() => {
    if (session_id) {
      // Verify purchase and show download link
      verifyPurchase(session_id);
    }
  }, [session_id]);
  
  async function verifyPurchase(sessionId) {
    const response = await fetch(`/api/orders/${sessionId}`);
    const order = await response.json();
    
    if (order.status === 'completed') {
      // Show success message and download link
      setDownloadUrl(order.downloadUrl);
    }
  }
}
```

#### 3. Webhook Handling
```javascript
// Webhook endpoint processes payment events
export default async function webhook(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleSuccessfulPayment(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handleFailedPayment(event.data.object);
      break;
  }
  
  res.json({ received: true });
}
```

### Customer Portal Integration
```javascript
async function openCustomerPortal() {
  const response = await fetch('/api/stripe/customer-portal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { url } = await response.json();
  window.location.href = url;
}
```

## Testing Guide

### Unit Testing with Jest
```javascript
// __tests__/api/contact.test.js
import handler from '../pages/api/contact';
import { createMocks } from 'node-mocks-http';

describe('/api/contact', () => {
  test('should create lead successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
      }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.leadId).toBeDefined();
  });
  
  test('should validate required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(400);
  });
});
```

### Integration Testing
```javascript
// __tests__/integration/payment-flow.test.js
describe('Payment Flow', () => {
  test('complete purchase flow', async () => {
    // 1. Get model data
    const model = await getModel('test-model');
    expect(model).toBeDefined();
    
    // 2. Create checkout session
    const session = await createCheckoutSession(model);
    expect(session.url).toContain('checkout.stripe.com');
    
    // 3. Simulate successful payment (webhook)
    await simulateWebhook('checkout.session.completed', {
      session_id: session.id,
      payment_status: 'paid'
    });
    
    // 4. Verify order created
    const order = await getOrder(session.id);
    expect(order.status).toBe('completed');
  });
});
```

### API Testing with Postman
Import the provided collection: `zencap-api-collection.json`

```bash
# Install Newman for CLI testing
npm install -g newman

# Run collection
newman run zencap-api-collection.json \
  --environment production.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export results.html
```

### Load Testing
```javascript
// k6 load testing script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s'
};

export default function() {
  // Test insights endpoint under load
  let response = http.get('https://zencap-website.vercel.app/api/insights');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
}
```

### Performance Testing
```javascript
// Performance benchmark
async function benchmarkAPI() {
  const endpoints = [
    '/api/insights',
    '/api/models',
    '/api/health'
  ];
  
  for (const endpoint of endpoints) {
    const start = performance.now();
    await fetch(`https://zencap-website.vercel.app${endpoint}`);
    const duration = performance.now() - start;
    
    console.log(`${endpoint}: ${duration.toFixed(2)}ms`);
  }
}
```

## Performance Optimization

### Database Query Optimization
```javascript
// Use indexes for frequently queried fields
await sql`CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status)`;
await sql`CREATE INDEX IF NOT EXISTS idx_models_category ON models(category)`;
await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`;

// Use LIMIT for large result sets
const insights = await sql`
  SELECT * FROM insights 
  WHERE status = 'published' 
  ORDER BY published_at DESC 
  LIMIT 50
`;

// Use prepared statements to prevent SQL injection
const getInsightBySlug = async (slug) => {
  return await sql`SELECT * FROM insights WHERE slug = ${slug}`;
};
```

### Caching Strategy
```javascript
// Redis caching for expensive queries
import redis from '@/utils/redis';

async function getCachedInsights() {
  const cacheKey = 'insights:published';
  
  // Try cache first
  let insights = await redis.get(cacheKey);
  
  if (!insights) {
    // Cache miss - query database
    insights = await getAllInsights();
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(insights));
  } else {
    insights = JSON.parse(insights);
  }
  
  return insights;
}
```

### Response Optimization
```javascript
// Set appropriate cache headers
export default function handler(req, res) {
  // Cache public content for 5 minutes
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  
  // Use compression
  res.setHeader('Content-Encoding', 'gzip');
  
  // Optimize response size
  const data = {
    insights: insights.map(insight => ({
      id: insight.id,
      slug: insight.slug,
      title: insight.title,
      summary: insight.summary,
      // Exclude large content field for listings
    }))
  };
  
  res.json(data);
}
```

### Image Optimization
```javascript
// Next.js Image component with optimization
import Image from 'next/image';

function ModelCard({ model }) {
  return (
    <Image
      src={model.thumbnail_url}
      alt={model.title}
      width={400}
      height={300}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
    />
  );
}
```

## Security Best Practices

### Input Validation
```javascript
import Joi from 'joi';

const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  company: Joi.string().max(200).optional(),
  interest: Joi.string().valid('private-equity', 'public-equity', 'general').required(),
  message: Joi.string().min(10).max(2000).required()
});

export default async function handler(req, res) {
  // Validate input
  const { error, value } = contactSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details
    });
  }
  
  // Process validated data
  const lead = await insertLead(value);
  res.json({ success: true, leadId: lead.id });
}
```

### SQL Injection Prevention
```javascript
// ALWAYS use parameterized queries
// ✅ SAFE
const user = await sql`SELECT * FROM users WHERE email = ${email}`;

// ❌ DANGEROUS - Never do this
const user = await sql.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### File Upload Security
```javascript
// Comprehensive file validation
function validateUploadedFile(file) {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  // Check file signature (magic numbers)
  const buffer = fs.readFileSync(file.path);
  if (!isValidExcelFile(buffer)) {
    throw new Error('Invalid file format');
  }
}
```

### Authentication Security
```javascript
// Secure session configuration
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  }
});
```

### Content Security Policy
```javascript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self' vercel.live;
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.google.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  img-src 'self' blob: data: *.stripe.com;
  font-src 'self' fonts.gstatic.com;
  connect-src 'self' *.stripe.com *.google.com *.vercel.app;
  frame-src 'self' *.stripe.com;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, '')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ];
  }
};
```

## Debugging & Troubleshooting

### Logging Configuration
```javascript
// utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'zencap-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Error Tracking
```javascript
// Integrate with error tracking service
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Use in API handlers
export default async function handler(req, res) {
  try {
    // Your API logic
  } catch (error) {
    Sentry.captureException(error);
    logger.error('API Error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      requestId: req.id
    });
  }
}
```

### Debug Endpoints
```javascript
// Development-only debug endpoint
export default async function handler(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const debugInfo = {
    environment: process.env.NODE_ENV,
    database: {
      url: process.env.POSTGRES_URL ? '***configured***' : 'missing',
      connected: await testDatabaseConnection()
    },
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY
    },
    auth: {
      configured: !!process.env.NEXTAUTH_SECRET
    }
  };
  
  res.json(debugInfo);
}
```

### Common Issues & Solutions

#### 1. Database Connection Issues
```bash
# Check database connectivity
curl http://localhost:3001/api/health

# Verify environment variables
curl http://localhost:3001/api/debug-env
```

#### 2. Rate Limiting Problems
```javascript
// Check rate limit headers
const response = await fetch('/api/contact', {
  method: 'POST',
  // ... request data
});

console.log('Rate Limit:', response.headers.get('X-RateLimit-Remaining'));
```

#### 3. File Upload Failures
```javascript
// Debug file upload issues
try {
  await uploadFile(file);
} catch (error) {
  if (error.message.includes('validation failed')) {
    console.log('File validation error:', error.issues);
  } else if (error.message.includes('rate limit')) {
    console.log('Upload rate limit reached');
  }
}
```

#### 4. Payment Processing Issues
```bash
# Check Stripe webhook logs
stripe logs tail --filter-types checkout.session.completed

# Verify webhook endpoint
curl -X POST http://localhost:3001/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test-signature" \
  -d '{"type": "checkout.session.completed"}'
```

### Performance Monitoring
```javascript
// Add performance timing to API calls
export default async function handler(req, res) {
  const startTime = performance.now();
  
  try {
    // Your API logic
    const result = await someExpensiveOperation();
    
    const duration = performance.now() - startTime;
    
    // Log slow operations
    if (duration > 1000) {
      logger.warn('Slow operation detected', {
        endpoint: req.url,
        duration: Math.round(duration),
        method: req.method
      });
    }
    
    res.json(result);
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('API Error', { 
      error: error.message, 
      duration: Math.round(duration),
      endpoint: req.url
    });
    
    throw error;
  }
}
```

### Database Query Debugging
```javascript
// Enable query logging in development
if (process.env.NODE_ENV === 'development') {
  sql.on('query', (query) => {
    console.log('Query:', query.text);
    console.log('Params:', query.values);
  });
}
```

## Support & Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Excel Viewer Documentation](./PREMIUM_EXCEL_VIEWER.md)

### Support Channels
- Email: developers@zenithcapital.com
- GitHub Issues: Create issue with API tag
- Internal Slack: #api-support channel

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Stripe API Reference](https://stripe.com/docs/api)
- [NextAuth Documentation](https://next-auth.js.org/)

---

**Last Updated:** August 8, 2025  
**Version:** 2.0  
**Maintainer:** ZenCap Development Team