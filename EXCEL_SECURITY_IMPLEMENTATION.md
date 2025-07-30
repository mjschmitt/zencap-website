# Excel Security Implementation Guide

## Overview

This document outlines the comprehensive security measures implemented for the Excel file upload/download system in the Zenith Capital Advisors investment advisory platform.

## Security Architecture

### 1. File Upload Security

#### Client-Side Validation
- **File Type Validation**: Only `.xlsx`, `.xlsm`, and `.xlsb` files allowed
- **File Size Limits**: Maximum 200MB (configurable)
- **Filename Sanitization**: Removes special characters and path traversal attempts
- **MIME Type Verification**: Validates against allowed MIME types

#### Server-Side Security
- **Magic Number Validation**: Verifies file format by checking file headers
- **Content Scanning**: Scans for dangerous patterns (macros, external references, scripts)
- **Virus Scanning**: Integration with ClamAV, Windows Defender, or VirusTotal
- **Formula Validation**: Blocks dangerous Excel functions (EXEC, SHELL, etc.)
- **Encryption at Rest**: Files encrypted using AES-256-GCM before storage

### 2. API Security

#### Rate Limiting
- **Upload Endpoint**: 10 uploads per hour per user
- **Download Endpoint**: 50 downloads per hour per user
- **General API**: 100 requests per minute

#### Authentication & Authorization
- **JWT Token Validation**: All endpoints require valid authentication
- **Role-Based Access Control (RBAC)**: Different permissions for users/admins
- **File Ownership Verification**: Users can only access their own files
- **Session Security**: Secure cookies with CSRF protection

### 3. Security Headers

```javascript
// Implemented security headers:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy
```

### 4. Audit Logging

All file operations are logged with:
- User identification
- IP address (anonymized for GDPR)
- Timestamp
- Operation type (upload/download/delete)
- Success/failure status
- Security incidents

### 5. GDPR Compliance

- **Data Minimization**: Only necessary data collected
- **Right to Erasure**: Users can delete their files
- **Data Portability**: Export functionality available
- **Audit Trail**: All data access logged
- **Encryption**: All sensitive data encrypted

## Implementation Details

### Secure File Upload Process

1. **Client validates file** (SecureExcelUpload component)
2. **Server validates request** (rate limiting, authentication)
3. **File uploaded to temporary directory**
4. **Security validation performed**:
   - Extension validation
   - MIME type validation
   - Magic number validation
   - Content scanning
   - Virus scanning
5. **File encrypted and stored**
6. **Metadata saved to database**
7. **Audit log created**

### Secure File Download Process

1. **User requests file by ID**
2. **Authentication verified**
3. **Permissions checked**
4. **File decrypted**
5. **Secure headers applied**
6. **File streamed to user**
7. **Access logged**

## API Endpoints

### `/api/upload-excel` (POST)
- Rate limited
- Requires authentication
- Comprehensive file validation
- Returns secure file ID

### `/api/download-excel` (GET)
- Rate limited
- Requires authentication
- Permission-based access
- Secure file streaming

### `/api/excel-metadata` (GET/POST/DELETE)
- Manage file metadata
- CRUD operations
- Access control

### `/api/init-security` (GET)
- Initialize security tables
- Protected endpoint
- Development/deployment use

## Security Configuration

All security settings are centralized in `/src/config/security.js`:

```javascript
export const FILE_SECURITY = {
  maxFileSize: 200 * 1024 * 1024, // 200MB
  allowedMimeTypes: [...],
  allowedExtensions: ['.xlsx', '.xlsm', '.xlsb'],
  // ... more settings
};
```

## Database Schema

### Security Tables

1. **security_audit_logs**: Comprehensive audit trail
2. **excel_file_metadata**: Encrypted file information
3. **excel_file_permissions**: Access control
4. **security_incidents**: Security event tracking

## Usage Examples

### Secure File Upload

```jsx
import SecureExcelUpload from '@/components/ui/SecureExcelUpload';

<SecureExcelUpload
  onUploadSuccess={(file) => console.log('File uploaded:', file)}
  onUploadError={(error) => console.error('Upload failed:', error)}
  maxFileSize={50 * 1024 * 1024} // 50MB
/>
```

### Secure File Download

```javascript
const downloadFile = async (fileId) => {
  const response = await fetch(`/api/download-excel?fileId=${fileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    // Handle file download
  }
};
```

## Security Best Practices

1. **Never trust client-side validation** - Always validate on server
2. **Use encryption for sensitive data** - Files and metadata encrypted
3. **Implement proper access control** - Check permissions for every request
4. **Log all security events** - Comprehensive audit trail
5. **Regular security updates** - Keep dependencies updated
6. **Security monitoring** - Monitor for suspicious activities

## Deployment Checklist

- [ ] Set strong `ENCRYPTION_KEY` environment variable
- [ ] Configure `INIT_SECURITY_TOKEN` for database initialization
- [ ] Set up virus scanning (ClamAV or alternative)
- [ ] Configure CORS allowed origins
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and alerting
- [ ] Review and adjust rate limits
- [ ] Test all security features
- [ ] Set up backup procedures
- [ ] Document incident response plan

## Monitoring and Alerts

Monitor for:
- Failed authentication attempts
- Rate limit violations
- Malware detection
- Suspicious file patterns
- Unauthorized access attempts

## Incident Response

1. **Detection**: Automated alerts for security events
2. **Assessment**: Review audit logs and determine severity
3. **Containment**: Block user/IP if necessary
4. **Eradication**: Remove malicious files
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

## Future Enhancements

1. **Machine Learning**: Detect anomalous upload patterns
2. **Advanced Threat Detection**: Integration with threat intelligence
3. **File Sandboxing**: Execute files in isolated environment
4. **Digital Signatures**: Verify file authenticity
5. **Blockchain Audit Trail**: Immutable security logs