// src/utils/email.js - Enhanced email utilities with fallback systems
import sgMail from '@sendgrid/mail';

// Conditional import for nodemailer (not always available)
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.log('Nodemailer not available, will use other email methods');
}

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Nodemailer SMTP fallback
let smtpTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  smtpTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Email service configuration
const EMAIL_CONFIG = {
  isDevelopment: process.env.NODE_ENV !== 'production',
  mockMode: !process.env.SENDGRID_API_KEY || 
           process.env.SENDGRID_API_KEY.includes('mock') || 
           process.env.SENDGRID_API_KEY === 'SG.mock-local-key' ||
           (!smtpTransporter && process.env.NODE_ENV !== 'production'),
  fromEmail: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || 'info@zencap.co',
  fromName: process.env.SENDGRID_FROM_NAME || 'Zenith Capital Advisors',
  fallbackEmail: process.env.FALLBACK_CONTACT_EMAIL || 'admin@zencap.co',
};

// Mock email logs for development
const mockEmailLogs = [];

/**
 * Core email sending function with fallback mechanisms
 */
export async function sendEmailWithFallback(to, subject, textContent, htmlContent, options = {}) {
  const emailData = {
    to,
    subject,
    text: textContent,
    html: htmlContent,
    timestamp: new Date().toISOString(),
    ...options
  };

  // Mock mode for development
  if (EMAIL_CONFIG.mockMode) {
    console.log('\n=== MOCK EMAIL SENT ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content Preview: ${textContent?.substring(0, 100) || 'HTML content'}...`);
    console.log('=====================\n');
    
    mockEmailLogs.push(emailData);
    return { success: true, method: 'mock', messageId: `mock-${Date.now()}` };
  }

  // Try SendGrid first (only if real API key)
  if (process.env.SENDGRID_API_KEY && 
      !process.env.SENDGRID_API_KEY.includes('mock') && 
      process.env.SENDGRID_API_KEY !== 'SG.mock-local-key') {
    try {
      const msg = {
        to,
        from: {
          email: EMAIL_CONFIG.fromEmail,
          name: EMAIL_CONFIG.fromName
        },
        subject,
        text: textContent,
        html: htmlContent,
        ...(options.templateId && { templateId: options.templateId }),
        ...(options.dynamicTemplateData && { dynamicTemplateData: options.dynamicTemplateData }),
      };

      const result = await sgMail.send(msg);
      console.log(`Email sent successfully via SendGrid to: ${to}`);
      return { success: true, method: 'sendgrid', messageId: result[0]?.headers?.['x-message-id'] };
    } catch (error) {
      console.error('SendGrid failed:', error.message);
      // Fall through to SMTP
    }
  }

  // Try SMTP fallback
  if (smtpTransporter) {
    try {
      const mailOptions = {
        from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.fromEmail}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      };

      const result = await smtpTransporter.sendMail(mailOptions);
      console.log(`Email sent successfully via SMTP to: ${to}`);
      return { success: true, method: 'smtp', messageId: result.messageId };
    } catch (error) {
      console.error('SMTP failed:', error.message);
      // Fall through to Formspree
    }
  }

  // Final fallback to Formspree
  if (process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT) {
    try {
      const formData = new FormData();
      formData.append('_replyto', to);
      formData.append('_subject', subject);
      formData.append('message', textContent || htmlContent.replace(/<[^>]*>/g, ''));
      formData.append('_format', 'plain');

      const response = await fetch(process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`Email sent successfully via Formspree to: ${to}`);
        return { success: true, method: 'formspree', messageId: `formspree-${Date.now()}` };
      }
    } catch (error) {
      console.error('Formspree failed:', error.message);
    }
  }

  // All methods failed
  throw new Error('All email services failed');
}

/**
 * Get mock email logs for development
 */
export function getMockEmailLogs() {
  return mockEmailLogs;
}

/**
 * Clear mock email logs
 */
export function clearMockEmailLogs() {
  mockEmailLogs.length = 0;
}

/**
 * Send contact form notification email
 */
export async function sendContactNotification(leadData) {
  try {
    const { name, email, company, interest, message } = leadData;
    
    const msg = {
      to: process.env.SENDGRID_FROM_EMAIL || 'info@zencap.co',
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@zencap.co',
        name: process.env.SENDGRID_FROM_NAME || 'Zenith Capital Advisors'
      },
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a3a5f; border-bottom: 2px solid #046B4E; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a3a5f; margin-top: 0;">Lead Information</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1a3a5f;">Name:</td>
                <td style="padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1a3a5f;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1a3a5f;">Company:</td>
                <td style="padding: 8px 0;">${company || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1a3a5f;">Interest:</td>
                <td style="padding: 8px 0;">${interest}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a3a5f; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #046B4E; font-weight: bold;">
              ⏰ Submitted: ${new Date().toLocaleString()}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              This email was sent from the contact form on your website.
            </p>
          </div>
        </div>
      `,
    };

    const result = await sendEmailWithFallback(
      process.env.SENDGRID_FROM_EMAIL || 'info@zencap.co',
      `New Contact Form Submission from ${name}`,
      `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || 'Not provided'}\nInterest: ${interest}\nMessage: ${message}\n\nSubmitted: ${new Date().toLocaleString()}`,
      msg.html
    );
    
    console.log('Contact notification email sent successfully');
    return result;
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    throw error;
  }
}

/**
 * Send confirmation email to contact form submitter
 */
export async function sendContactConfirmation(leadData) {
  try {
    const { name, email, interest } = leadData;
    
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@zencap.co',
        name: process.env.SENDGRID_FROM_NAME || 'Zenith Capital Advisors'
      },
      subject: 'Thank you for contacting Zenith Capital Advisors',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a3a5f; border-bottom: 2px solid #046B4E; padding-bottom: 10px;">
            Thank you for reaching out!
          </h2>
          
          <p style="line-height: 1.6; color: #333;">
            Dear ${name},
          </p>
          
          <p style="line-height: 1.6; color: #333;">
            Thank you for contacting Zenith Capital Advisors. We have received your inquiry about <strong>${interest}</strong> and appreciate your interest in our services.
          </p>
          
          <p style="line-height: 1.6; color: #333;">
            Our team will review your message and get back to you within 24 hours with a detailed response and next steps.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a3a5f; margin-top: 0;">What to expect next:</h3>
            <ul style="color: #333; line-height: 1.6;">
              <li>Initial consultation call within 24 hours</li>
              <li>Detailed proposal tailored to your needs</li>
              <li>Clear timeline and deliverables</li>
              <li>Ongoing support throughout the process</li>
            </ul>
          </div>
          
          <p style="line-height: 1.6; color: #333;">
            If you have any urgent questions, please don't hesitate to call us directly at <strong>+1-555-123-4567</strong>.
          </p>
          
          <p style="line-height: 1.6; color: #333;">
            Best regards,<br>
            <strong>The Zenith Capital Advisors Team</strong>
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              Zenith Capital Advisors<br>
              Financial Modeling & Investment Advisory Services
            </p>
          </div>
        </div>
      `,
    };

    const result = await sendEmailWithFallback(
      email,
      'Thank you for contacting Zenith Capital Advisors',
      `Dear ${name},\n\nThank you for contacting Zenith Capital Advisors. We have received your inquiry about ${interest} and appreciate your interest in our services.\n\nOur team will review your message and get back to you within 24 hours with a detailed response and next steps.\n\nBest regards,\nThe Zenith Capital Advisors Team`,
      msg.html
    );
    
    console.log('Contact confirmation email sent successfully');
    return result;
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    throw error;
  }
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcome(email) {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@zencap.co',
        name: process.env.SENDGRID_FROM_NAME || 'Zenith Capital Advisors'
      },
      subject: 'Welcome to Zenith Capital Advisors Newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a3a5f; border-bottom: 2px solid #046B4E; padding-bottom: 10px;">
            Welcome to Our Newsletter!
          </h2>
          
          <p style="line-height: 1.6; color: #333;">
            Thank you for subscribing to the Zenith Capital Advisors newsletter. You're now part of an exclusive community of investment professionals and financial analysts.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a3a5f; margin-top: 0;">What you'll receive:</h3>
            <ul style="color: #333; line-height: 1.6;">
              <li>Weekly market insights and analysis</li>
              <li>Financial modeling tips and best practices</li>
              <li>Investment strategy updates</li>
              <li>Exclusive access to our latest research</li>
              <li>Early access to new financial models</li>
            </ul>
          </div>
          
          <p style="line-height: 1.6; color: #333;">
            Our first newsletter will arrive in your inbox within the next few days. We're excited to share our expertise and help you stay ahead in the investment world.
          </p>
          
          <p style="line-height: 1.6; color: #333;">
            Best regards,<br>
            <strong>The Zenith Capital Advisors Team</strong>
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              You can unsubscribe at any time by clicking the link in our emails.
            </p>
          </div>
        </div>
      `,
    };

    const result = await sendEmailWithFallback(
      email,
      'Welcome to Zenith Capital Advisors Newsletter',
      `Thank you for subscribing to the Zenith Capital Advisors newsletter. You're now part of an exclusive community of investment professionals and financial analysts.\n\nWhat you'll receive:\n- Weekly market insights and analysis\n- Financial modeling tips and best practices\n- Investment strategy updates\n- Exclusive access to our latest research\n- Early access to new financial models\n\nOur first newsletter will arrive in your inbox within the next few days.\n\nBest regards,\nThe Zenith Capital Advisors Team`,
      msg.html
    );
    
    console.log('Newsletter welcome email sent successfully');
    return result;
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
    throw error;
  }
}

/**
 * General purpose email sending function (legacy compatibility)
 */
export async function sendEmail(to, subject, textContent, htmlContent, options = {}) {
  return await sendEmailWithFallback(to, subject, textContent, htmlContent, options);
}

/**
 * Email templates
 */
export const emailTemplates = {
  purchaseConfirmation: (customerName, modelTitle, orderId, downloadUrl = '', purchaseAmount = '') => `
    Dear ${customerName},

    Thank you for your purchase of ${modelTitle}!

    Your order has been processed successfully.
    Order ID: ${orderId}
    ${purchaseAmount ? `Amount Paid: $${(purchaseAmount / 100).toFixed(2)}` : ''}

    ${downloadUrl ? `Download your model: ${downloadUrl}` : 'You can download your financial model from your customer portal at any time.'}

    Your purchase includes:
    - Complete Excel financial model
    - Comprehensive documentation
    - 30-day email support
    - Lifetime access and updates

    If you have any questions or need support, please don't hesitate to contact us at info@zencap.co.

    Best regards,
    The Zenith Capital Advisors Team
  `,
  
  purchaseConfirmationHtml: (customerName, modelTitle, orderId, downloadUrl = '', purchaseAmount = '') => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px; background-color: #1a3a5f; color: white;">
        <h1 style="margin: 0;">Purchase Confirmation</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #1a3a5f;">Thank You for Your Purchase!</h2>
        
        <p style="line-height: 1.6; color: #333;">
          Dear ${customerName},
        </p>
        
        <p style="line-height: 1.6; color: #333;">
          Thank you for purchasing <strong>${modelTitle}</strong>. Your order has been processed successfully.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1a3a5f; margin-top: 0;">Order Details</h3>
          <p><strong>Product:</strong> ${modelTitle}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          ${purchaseAmount ? `<p><strong>Amount Paid:</strong> $${(purchaseAmount / 100).toFixed(2)}</p>` : ''}
          <p><strong>Status:</strong> <span style="color: #046B4E; font-weight: bold;">Complete</span></p>
          <p><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #046B4E;">
          <h3 style="color: #1a3a5f; margin-top: 0;">Next Steps</h3>
          <ol style="color: #333; line-height: 1.6;">
            <li>Access your customer portal to download your model</li>
            <li>Review the included documentation and instructions</li>
            <li>Contact our support team if you need any assistance</li>
          </ol>
        </div>
        
        <p style="line-height: 1.6; color: #333;">
          Your purchase includes:
        </p>
        <ul style="color: #333; line-height: 1.6;">
          <li>Complete Excel financial model</li>
          <li>Comprehensive documentation</li>
          <li>30-day email support</li>
          <li>Lifetime access and updates</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          ${downloadUrl ? `
            <a href="${downloadUrl}" 
               style="background-color: #046B4E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
              Download Model
            </a>
          ` : ''}
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/customer-portal" 
             style="background-color: #1a3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Customer Portal
          </a>
        </div>
        
        <p style="line-height: 1.6; color: #333;">
          If you have any questions or need support, please contact us at 
          <a href="mailto:info@zencap.co">info@zencap.co</a> or visit our 
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contact">contact page</a>.
        </p>
        
        <p style="line-height: 1.6; color: #333;">
          Best regards,<br>
          <strong>The Zenith Capital Advisors Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; font-size: 14px;">
        <p>© 2025 Zenith Capital Advisors. All rights reserved.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="color: #046B4E;">Visit our website</a> | 
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contact" style="color: #046B4E;">Contact Support</a>
        </p>
      </div>
    </div>
  `
};

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken, resetUrl) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a3a5f; border-bottom: 2px solid #046B4E; padding-bottom: 10px;">
          Password Reset Request
        </h2>
        
        <p style="line-height: 1.6; color: #333;">
          We received a request to reset your password for your Zenith Capital Advisors account.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #333;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #046B4E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="margin: 0; color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Important:</strong> This link will expire in 24 hours for security reasons. If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        
        <p style="line-height: 1.6; color: #333;">
          If you continue to have problems, please contact our support team.
        </p>
        
        <p style="line-height: 1.6; color: #333;">
          Best regards,<br>
          <strong>The Zenith Capital Advisors Team</strong>
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            For security reasons, this email was sent from an automated system. Please do not reply.
          </p>
        </div>
      </div>
    `;

    const result = await sendEmailWithFallback(
      email,
      'Password Reset Request - Zenith Capital Advisors',
      `Password Reset Request\n\nWe received a request to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link will expire in 24 hours. If you didn't request this reset, please ignore this email.\n\nBest regards,\nThe Zenith Capital Advisors Team`,
      html
    );
    
    console.log('Password reset email sent successfully');
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(orderData) {
  try {
    const { customerEmail, customerName, modelTitle, orderId, downloadUrl, purchaseAmount } = orderData;
    
    const html = emailTemplates.purchaseConfirmationHtml(customerName, modelTitle, orderId, downloadUrl, purchaseAmount);
    const text = emailTemplates.purchaseConfirmation(customerName, modelTitle, orderId, downloadUrl, purchaseAmount);
    
    const result = await sendEmailWithFallback(
      customerEmail,
      `Order Confirmation - ${modelTitle}`,
      text,
      html
    );
    
    console.log('Order confirmation email sent successfully');
    return result;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
}

/**
 * Test all email configurations
 */
export async function testEmailConfiguration(testEmail = null) {
  const results = {
    timestamp: new Date().toISOString(),
    config: {
      sendgridConfigured: !!process.env.SENDGRID_API_KEY,
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      formspreeConfigured: !!process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT,
      mockMode: EMAIL_CONFIG.mockMode,
    },
    tests: []
  };

  const targetEmail = testEmail || process.env.SENDGRID_FROM_EMAIL || 'test@example.com';

  // Test 1: Basic email sending
  try {
    const basicTestResult = await sendEmailWithFallback(
      targetEmail,
      'Email Configuration Test - Zenith Capital Advisors',
      `This is a test email to verify email configuration.\n\nTimestamp: ${new Date().toISOString()}\n\nTest completed successfully!`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a3a5f;">Email Configuration Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Method:</strong> ${testResult.method}</p>
            <p><strong>Status:</strong> <span style="color: #046B4E;">✓ Success</span></p>
          </div>
          <p>If you received this email, your email configuration is working properly!</p>
        </div>
      `
    );
    
    results.tests.push({
      test: 'Basic Email Sending',
      success: true,
      method: basicTestResult.method,
      messageId: basicTestResult.messageId
    });
  } catch (error) {
    results.tests.push({
      test: 'Basic Email Sending',
      success: false,
      error: error.message
    });
  }

  // Test 2: Contact notification email
  try {
    const testLeadData = {
      name: 'Test User',
      email: targetEmail,
      company: 'Test Company',
      interest: 'Email Configuration Test',
      message: 'This is a test message for email configuration verification.'
    };
    
    const testResult = await sendContactNotification(testLeadData);
    results.tests.push({
      test: 'Contact Notification Email',
      success: true,
      method: testResult.method
    });
  } catch (error) {
    results.tests.push({
      test: 'Contact Notification Email',
      success: false,
      error: error.message
    });
  }

  // Test 3: Newsletter welcome email
  try {
    const testResult = await sendNewsletterWelcome(targetEmail);
    results.tests.push({
      test: 'Newsletter Welcome Email',
      success: true,
      method: testResult.method
    });
  } catch (error) {
    results.tests.push({
      test: 'Newsletter Welcome Email',
      success: false,
      error: error.message
    });
  }

  // Test 4: Mock email logs (if in mock mode)
  if (EMAIL_CONFIG.mockMode) {
    results.mockEmailLogs = mockEmailLogs.slice(-10); // Last 10 emails
  }

  console.log('Email configuration test completed:', results);
  return results;
} 