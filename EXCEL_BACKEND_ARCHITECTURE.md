# Excel Backend Architecture Documentation

## Overview

This document describes the comprehensive backend architecture implemented for Zenith Capital Advisors' Excel file processing system. The system is designed to handle large Excel files (up to 200MB) with enterprise-grade security, performance, and reliability.

## Architecture Components

### 1. Authentication System (JWT-based)

**Files:**
- `/src/utils/auth.js` - Core authentication utilities
- `/src/pages/api/auth/[...auth].js` - Authentication endpoints
- `/src/middleware/auth.js` - Authentication middleware

**Features:**
- JWT access tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- Role-based access control (admin, user, viewer)
- Secure password hashing with bcrypt
- Session management with Redis

**Endpoints:**
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify token validity

### 2. Excel Upload System

**Files:**
- `/src/pages/api/excel/upload.js` - Upload endpoint
- `/src/utils/excel-processor.js` - Excel processing logic

**Features:**
- Chunked upload support for large files
- File size limit: 200MB
- Virus scanning integration (ClamAV)
- File type validation
- Progress tracking
- Automatic queuing for processing

**Upload Methods:**
1. **Regular Upload**: Single POST request for files < 10MB
2. **Chunked Upload**: Multiple requests for larger files
   - Headers: `X-Chunk-Index`, `X-Total-Chunks`, `X-File-Id`
   - Automatic chunk reassembly
   - Resume capability

### 3. Asynchronous Processing

**Files:**
- `/src/utils/queue.js` - Job queue management
- `/src/pages/api/excel/process/[jobId].js` - Job status endpoint

**Features:**
- Bull queue for background processing
- Concurrent processing (3 workers)
- Progress tracking
- Automatic retries (3 attempts)
- Job status monitoring
- WebSocket notifications

**Job States:**
- `queued` - Job waiting to be processed
- `processing` - Currently being processed
- `completed` - Successfully processed
- `failed` - Processing failed
- `cancelled` - Job cancelled by user

### 4. Data Storage & Caching

**Files:**
- `/src/utils/redis.js` - Redis client and utilities
- `/src/pages/api/excel/data/[fileId].js` - Data retrieval endpoint

**Redis Usage:**
- Processed data caching (1-hour TTL)
- Job status tracking
- Session management
- Rate limiting counters
- Distributed locks
- WebSocket pub/sub

**Cache Keys:**
- `excel:data:{fileId}` - Processed Excel data
- `excel:job:{jobId}` - Job status
- `session:{userId}` - User sessions
- `ratelimit:{endpoint}:{client}` - Rate limit counters
- `chunks:{fileId}:{index}` - Upload chunks
- `lock:process:{resource}` - Processing locks

### 5. Rate Limiting

**Files:**
- `/src/middleware/rate-limit.js` - Rate limiting middleware

**Configurations:**
- **Auth endpoints**: 5 requests per 15 minutes
- **Upload endpoints**: 10 uploads per hour
- **API endpoints**: 100 requests per minute
- **Public endpoints**: 200 requests per minute
- **Admin endpoints**: 500 requests per minute

**Features:**
- Sliding window algorithm
- IP-based and user-based limiting
- Tiered limits (free, pro, enterprise)
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### 6. Database Schema

**Files:**
- `/src/pages/api/migrate-excel-auth.js` - Migration script

**Tables:**

1. **users**
   ```sql
   - id (SERIAL PRIMARY KEY)
   - email (UNIQUE)
   - password_hash
   - name
   - role (admin, user, viewer)
   - tier (free, pro, enterprise)
   - created_at, updated_at
   ```

2. **excel_files**
   ```sql
   - id (VARCHAR PRIMARY KEY)
   - user_id (REFERENCES users)
   - filename
   - file_path
   - file_size
   - processed (BOOLEAN)
   - sheet_count, row_count
   - created_at, processed_at
   ```

3. **excel_jobs**
   ```sql
   - id (VARCHAR PRIMARY KEY)
   - file_id (REFERENCES excel_files)
   - user_id (REFERENCES users)
   - status
   - progress (0-100)
   - result_summary (JSONB)
   - error_message
   - processing_time
   ```

4. **refresh_tokens**
   ```sql
   - user_id (REFERENCES users)
   - token
   - expires_at
   ```

5. **audit_logs**
   ```sql
   - user_id
   - action
   - resource_type, resource_id
   - ip_address
   - metadata (JSONB)
   ```

## API Endpoints

### Authentication
```
POST   /api/auth/login       - User login
POST   /api/auth/refresh     - Refresh token
POST   /api/auth/logout      - Logout
POST   /api/auth/register    - Register new user
GET    /api/auth/verify      - Verify token
```

### Excel Processing
```
POST   /api/excel/upload     - Upload Excel file
GET    /api/excel/process/:jobId - Get job status
DELETE /api/excel/process/:jobId - Cancel job
GET    /api/excel/data/:fileId - Get processed data
```

### Data Retrieval Options
```
GET /api/excel/data/:fileId?type=summary
    - Get file summary and metadata

GET /api/excel/data/:fileId?type=sheet&sheet=Sheet1&page=1&pageSize=100
    - Get paginated sheet data

GET /api/excel/data/:fileId?type=export&format=json
    - Export data (formats: json, csv, html)
```

## Security Features

1. **Authentication**
   - JWT tokens with short expiry
   - Refresh token rotation
   - Secure cookie storage
   - CSRF protection

2. **File Security**
   - Virus scanning with ClamAV
   - File type validation
   - Size limits
   - Secure file storage
   - Access control checks

3. **API Security**
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CORS configuration

4. **Monitoring**
   - Audit logging
   - Error tracking
   - Performance metrics
   - Security alerts

## Performance Optimizations

1. **Upload Optimization**
   - Chunked uploads for large files
   - Resume capability
   - Parallel chunk processing

2. **Processing Optimization**
   - Asynchronous job queue
   - Worker pool (3 concurrent)
   - Progress tracking
   - Caching with Redis

3. **Data Retrieval**
   - Pagination support
   - Data compression
   - ETags for caching
   - Multiple export formats

## WebSocket Integration

**Real-time Updates:**
- Job progress notifications
- Processing completion alerts
- Error notifications

**Channels:**
- `excel:progress:{fileId}` - Progress updates
- `excel:complete:{userId}` - Completion notifications

## Environment Variables

```env
# Database
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=
JWT_REFRESH_SECRET=
ADMIN_EMAIL=admin@zencap.com

# Email
SENDGRID_API_KEY=
FROM_EMAIL=

# File Upload
UPLOAD_DIR=/tmp/excel-uploads

# Security
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
API_KEY=
```

## Usage Examples

### 1. Upload Excel File
```javascript
// Regular upload
const formData = new FormData();
formData.append('file', excelFile);

const response = await fetch('/api/excel/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

// Chunked upload for large files
const chunkSize = 10 * 1024 * 1024; // 10MB chunks
const totalChunks = Math.ceil(file.size / chunkSize);
const fileId = generateFileId();

for (let i = 0; i < totalChunks; i++) {
  const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
  
  await fetch('/api/excel/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Chunk-Index': i,
      'X-Total-Chunks': totalChunks,
      'X-File-Id': fileId,
      'X-File-Name': file.name,
      'X-File-Size': file.size
    },
    body: chunk
  });
}
```

### 2. Monitor Processing Progress
```javascript
// Poll job status
const pollJobStatus = async (jobId) => {
  const response = await fetch(`/api/excel/process/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const { data } = await response.json();
  console.log(`Progress: ${data.progress}%`);
  
  if (data.status === 'completed') {
    // Processing complete
    return data;
  } else if (data.status === 'failed') {
    // Handle error
    throw new Error(data.error);
  } else {
    // Continue polling
    setTimeout(() => pollJobStatus(jobId), 1000);
  }
};

// Or use WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:3000/ws');
ws.on('message', (data) => {
  const update = JSON.parse(data);
  if (update.channel === `excel:progress:${fileId}`) {
    console.log(`Progress: ${update.progress}%`);
  }
});
```

### 3. Retrieve Processed Data
```javascript
// Get file summary
const summary = await fetch(`/api/excel/data/${fileId}?type=summary`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Get paginated sheet data
const sheetData = await fetch(
  `/api/excel/data/${fileId}?type=sheet&sheet=Sheet1&page=1&pageSize=100`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

// Export as CSV
const csvExport = await fetch(
  `/api/excel/data/${fileId}?type=export&format=csv`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

## Deployment Considerations

1. **Redis Setup**
   - Use Redis Cluster for high availability
   - Configure persistence for critical data
   - Set up Redis Sentinel for failover

2. **File Storage**
   - Use cloud storage (S3, Azure Blob) for production
   - Implement file lifecycle policies
   - Regular cleanup of processed files

3. **Security**
   - Use environment-specific secrets
   - Enable HTTPS only
   - Implement IP whitelisting for admin endpoints
   - Regular security audits

4. **Monitoring**
   - Set up application monitoring (New Relic, DataDog)
   - Configure alerts for failures
   - Track processing metrics
   - Monitor resource usage

5. **Scaling**
   - Horizontal scaling for API servers
   - Increase worker processes for heavy loads
   - Use CDN for static assets
   - Database connection pooling

## Maintenance

1. **Regular Tasks**
   - Clean up old jobs: `/api/excel/cleanup`
   - Archive processed files
   - Rotate logs
   - Update virus definitions

2. **Monitoring Metrics**
   - Average processing time
   - Queue length
   - Error rates
   - API response times
   - Resource utilization

3. **Backup Strategy**
   - Database backups (daily)
   - Redis snapshots
   - File storage backups
   - Configuration backups

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check file size limits
   - Verify file type
   - Check rate limits
   - Review virus scan results

2. **Processing Failures**
   - Check job logs
   - Verify file format
   - Check memory usage
   - Review error messages

3. **Performance Issues**
   - Monitor Redis memory
   - Check database indexes
   - Review queue backlog
   - Analyze slow queries

### Debug Commands

```bash
# Check queue status
npm run queue:stats

# Process specific file
npm run process:file -- --fileId=xxx

# Clear Redis cache
npm run cache:clear

# Run migrations
npm run db:migrate
```

## Future Enhancements

1. **Planned Features**
   - Real-time collaborative editing
   - Advanced formula validation
   - Machine learning insights
   - API versioning
   - GraphQL support

2. **Performance Improvements**
   - Streaming parser for huge files
   - GPU acceleration for processing
   - Edge caching
   - Database sharding

3. **Security Enhancements**
   - Two-factor authentication
   - API key rotation
   - Enhanced audit trails
   - Compliance reporting