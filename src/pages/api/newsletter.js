// src/pages/api/newsletter.js - Production-ready newsletter subscription API endpoint
import { insertNewsletterSubscriber, logFormSubmission } from '@/utils/database';
import { sendNewsletterWelcome } from '@/utils/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
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

    // Prepare subscriber data
    const subscriberData = {
      email: email.trim().toLowerCase(),
      ipAddress,
      userAgent
    };

    // Insert subscriber into database
    const subscriber = await insertNewsletterSubscriber(subscriberData);

    // Send welcome email
    try {
      await sendNewsletterWelcome(subscriberData.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    // Log successful submission
    await logFormSubmission({
      formType: 'newsletter',
      formData: subscriberData,
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Return success response
    res.status(200).json({ 
      message: 'Successfully subscribed to newsletter',
      success: true,
      subscriberId: subscriber.id
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    // Log failed submission
    try {
      await logFormSubmission({
        formType: 'newsletter',
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