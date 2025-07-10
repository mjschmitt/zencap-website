// src/utils/email.js - SendGrid email utilities
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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

    await sgMail.send(msg);
    console.log('Contact notification email sent successfully');
    return true;
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

    await sgMail.send(msg);
    console.log('Contact confirmation email sent successfully');
    return true;
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

    await sgMail.send(msg);
    console.log('Newsletter welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
    throw error;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration() {
  try {
    const msg = {
      to: process.env.SENDGRID_FROM_EMAIL || 'info@zencap.co',
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@zencap.co',
        name: process.env.SENDGRID_FROM_NAME || 'Zenith Capital Advisors'
      },
      subject: 'Email Configuration Test - Zenith Capital Advisors',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a3a5f;">Email Configuration Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, your SendGrid configuration is working properly!</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('Email configuration test successful');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    throw error;
  }
} 