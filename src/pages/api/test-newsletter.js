// src/pages/api/test-newsletter.js - Debug endpoint for newsletter subscription
import { insertNewsletterSubscriber } from '@/utils/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Test newsletter endpoint called');
    console.log('Request body:', req.body);
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required',
        error: 'MISSING_EMAIL'
      });
    }

    // Get client information
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log('Client info:', { ipAddress, userAgent });

    // Prepare subscriber data
    const subscriberData = {
      email: email.trim().toLowerCase(),
      ipAddress,
      userAgent
    };

    console.log('Subscriber data:', subscriberData);

    // Insert subscriber into database
    const subscriber = await insertNewsletterSubscriber(subscriberData);

    console.log('Subscriber inserted:', subscriber);

    // Return success response
    res.status(200).json({ 
      message: 'Test newsletter subscription successful',
      success: true,
      subscriberId: subscriber.id,
      subscriber
    });

  } catch (error) {
    console.error('Test newsletter subscription error:', error);
    
    res.status(500).json({ 
      message: 'Internal server error',
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 