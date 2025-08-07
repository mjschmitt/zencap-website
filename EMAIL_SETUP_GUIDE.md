# Email System Setup Guide - Zenith Capital Advisors

## Overview

The Zenith Capital Advisors platform includes a comprehensive email system with multiple fallback mechanisms to ensure reliable email delivery. This guide will help you configure and test the email system for production use.

## Email Service Architecture

### Primary Service: SendGrid
- Professional email delivery service
- Advanced analytics and tracking
- High deliverability rates
- Template management

### Fallback Services
1. **SMTP (Nodemailer)** - Secondary option using standard SMTP
2. **Formspree** - Final fallback for critical notifications
3. **Mock Mode** - Development testing without sending real emails

## Quick Setup Checklist

- [ ] 1. Set up SendGrid account and get API key
- [ ] 2. Configure domain authentication (SPF/DKIM)
- [ ] 3. Add environment variables to `.env.local`
- [ ] 4. Test email configuration using `/api/test-email`
- [ ] 5. Verify all email templates work correctly
- [ ] 6. Set up monitoring and alerts

## Detailed Setup Instructions

### 1. SendGrid Setup (Recommended)

#### Create SendGrid Account
1. Visit [SendGrid.com](https://sendgrid.com) and create an account
2. Choose appropriate plan (Free tier supports 100 emails/day)
3. Complete account verification

#### Generate API Key
1. Go to Settings > API Keys
2. Click "Create API Key"
3. Choose "Restricted Access"
4. Grant permissions for:
   - Mail Send (Full Access)
   - Mail Settings (Read Access)
   - Tracking (Read Access)
5. Copy the API key (starts with `SG.`)

#### Domain Authentication (Important for Deliverability)
1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Enter your domain (e.g., `zencap.co`)
4. Add the provided DNS records to your domain
5. Wait for verification (can take up to 48 hours)

### 2. Environment Variables

Add these variables to your `.env.local` file:

```bash
# SendGrid Configuration (Primary)
SENDGRID_API_KEY=SG.your-actual-sendgrid-api-key
SENDGRID_FROM_EMAIL=info@zencap.co
SENDGRID_FROM_NAME=Zenith Capital Advisors

# SMTP Configuration (Fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-business-email@gmail.com
SMTP_PASS=your-app-specific-password

# Formspree Configuration (Final Fallback)
NEXT_PUBLIC_CONTACT_FORM_ENDPOINT=https://formspree.io/f/your-form-id

# Site Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. SMTP Setup (Optional Fallback)

#### Using Gmail
1. Enable 2FA on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security > App passwords
   - Generate password for "Mail"
3. Use the generated password in `SMTP_PASS`

#### Using Other Providers
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom SMTP**: Use your hosting provider's SMTP settings

### 4. Formspree Setup (Final Fallback)

1. Visit [Formspree.io](https://formspree.io)
2. Create a free account
3. Create a new form for contact submissions
4. Copy the form endpoint URL
5. Add to `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`

## Testing Your Email Configuration

### Automated Testing
Use the built-in testing endpoint:

```bash
# Test all email functions
GET /api/test-email?testType=all&testEmail=your@email.com

# Test specific email types
GET /api/test-email?testType=basic&testEmail=your@email.com
GET /api/test-email?testType=contact-notification&testEmail=your@email.com
GET /api/test-email?testType=newsletter-welcome&testEmail=your@email.com
GET /api/test-email?testType=order-confirmation&testEmail=your@email.com

# Check configuration status
GET /api/test-email?action=status
```

### Manual Testing Steps

1. **Basic Email Test**
   ```bash
   curl "http://localhost:3000/api/test-email?testType=basic&testEmail=your@email.com"
   ```

2. **Contact Form Test**
   - Visit your contact page
   - Submit a test form
   - Check both notification and confirmation emails

3. **Newsletter Test**
   - Subscribe to newsletter with test email
   - Verify welcome email is received

4. **Order Confirmation Test**
   ```bash
   curl "http://localhost:3000/api/test-email?testType=order-confirmation&testEmail=your@email.com"
   ```

## Email Templates

### Available Templates
1. **Contact Notification** - Sent to admin when someone contacts
2. **Contact Confirmation** - Sent to user confirming their message
3. **Newsletter Welcome** - Sent when someone subscribes
4. **Order Confirmation** - Sent after successful purchase
5. **Password Reset** - Sent for password reset requests

### Customizing Templates
Templates are located in `src/utils/email.js`. Each template includes:
- Professional HTML formatting
- Zenith Capital branding colors
- Responsive design
- Plain text fallbacks

## Production Deployment

### Environment Variables Checklist
```bash
# Required for production
SENDGRID_API_KEY=SG.your-production-key
SENDGRID_FROM_EMAIL=info@zencap.co
SENDGRID_FROM_NAME=Zenith Capital Advisors
NEXT_PUBLIC_BASE_URL=https://zencap.co

# Optional but recommended
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=backup@zencap.co
SMTP_PASS=your-backup-password
```

### DNS Configuration
Ensure these DNS records are set for `zencap.co`:

```
# SPF Record
TXT @ "v=spf1 include:sendgrid.net ~all"

# DKIM Records (provided by SendGrid)
CNAME s1._domainkey.zencap.co "s1.domainkey.u123456.wl.sendgrid.net"
CNAME s2._domainkey.zencap.co "s2.domainkey.u123456.wl.sendgrid.net"

# DMARC Record (optional but recommended)
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@zencap.co"
```

## Monitoring and Maintenance

### Email Delivery Monitoring
1. **SendGrid Dashboard**
   - Monitor delivery rates
   - Track bounces and spam reports
   - View engagement metrics

2. **Application Logs**
   - Check server logs for email errors
   - Monitor fallback usage
   - Track successful deliveries

### Health Checks
Set up automated health checks:

```bash
# Add to your monitoring service
curl -f "https://zencap.co/api/test-email?action=status" || alert
```

### Regular Maintenance
- [ ] Monthly review of bounce rates
- [ ] Update email templates for new products/services
- [ ] Test all email flows after major updates
- [ ] Review and update DNS records annually

## Troubleshooting

### Common Issues

#### SendGrid Authentication Failed
- **Cause**: Invalid API key or insufficient permissions
- **Fix**: Regenerate API key with proper permissions

#### Emails Going to Spam
- **Cause**: Missing domain authentication or poor content
- **Fix**: Complete SendGrid domain authentication, improve content

#### SMTP Connection Timeout
- **Cause**: Firewall blocking SMTP ports or wrong credentials
- **Fix**: Check firewall settings, verify SMTP credentials

#### Fallback Not Working
- **Cause**: All email services misconfigured
- **Fix**: Check environment variables, test each service separately

### Debug Mode
Enable debug logging in development:

```bash
NODE_ENV=development npm run dev
```

Check `/api/test-email?action=getLogs` for mock email logs.

### Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Authentication failed | Check API keys |
| 413 | Payload too large | Reduce email content size |
| 429 | Rate limit exceeded | Implement rate limiting |
| 500 | Internal server error | Check server logs |

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables only
- Rotate keys regularly (quarterly)
- Use restricted permissions

### Email Content Security
- Sanitize user inputs in email templates
- Validate email addresses before sending
- Use HTTPS links only
- Implement rate limiting

### Privacy Compliance
- Include unsubscribe links
- Honor opt-out requests immediately
- Don't send marketing emails without consent
- Store user preferences securely

## Performance Optimization

### Batch Processing
For high-volume sending:
```javascript
// Use SendGrid's batch sending for newsletters
const personalizations = subscribers.map(email => ({
  to: [{ email }],
  dynamic_template_data: { name: 'User' }
}));
```

### Rate Limiting
Implement rate limiting to prevent abuse:
```javascript
// Example: 10 emails per hour per user
const rateLimit = 10;
const timeWindow = 3600; // 1 hour
```

## Support and Resources

### Documentation Links
- [SendGrid API Documentation](https://docs.sendgrid.com/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Formspree Documentation](https://help.formspree.io/)

### Support Contacts
- **Technical Issues**: Contact your development team
- **SendGrid Issues**: SendGrid Support
- **DNS Issues**: Contact your domain provider

## Conclusion

This email system provides robust, reliable email delivery with multiple fallbacks. The mock mode allows for development without sending real emails, while the production setup ensures professional email delivery.

Remember to test thoroughly before going live and monitor email deliverability regularly to maintain optimal performance.

---

*Generated for Zenith Capital Advisors - Professional Financial Services Platform*