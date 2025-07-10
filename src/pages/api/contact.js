// src/pages/api/contact.js - Production-ready contact form API endpoint
import { insertLead, logFormSubmission } from '@/utils/database';
import { sendContactNotification, sendContactConfirmation } from '@/utils/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, company, interest, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: 'Name, email, and message are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Get client information
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Prepare lead data
    const leadData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : null,
      interest: interest || 'general',
      message: message.trim(),
      ipAddress,
      userAgent
    };

    // Insert lead into database
    const lead = await insertLead(leadData);

    // Send notification email to admin
    try {
      await sendContactNotification(leadData);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendContactConfirmation(leadData);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Log successful submission
    await logFormSubmission({
      formType: 'contact',
      formData: leadData,
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Return success response
    res.status(200).json({ 
      message: 'Message sent successfully',
      success: true,
      leadId: lead.id
    });

  } catch (error) {
    console.error('Contact form error:', error);

    // Log failed submission
    try {
      await logFormSubmission({
        formType: 'contact',
        formData: req.body,
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'error',
        errorMessage: error.message
      });
    } catch (logError) {
      console.error('Failed to log form submission error:', logError);
    }

    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
} 