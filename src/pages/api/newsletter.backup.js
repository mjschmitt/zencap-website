// src/pages/api/newsletter.js - Production-ready newsletter subscription API endpoint
import { insertNewsletterSubscriber, logFormSubmission } from '@/utils/database';
import { sendNewsletterWelcome } from '@/utils/email';
import { sql } from '@vercel/postgres';
// Use simple rate limiting without Redis dependency
import { withRateLimit } from '@/middleware/rate-limit-simple';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all newsletter subscribers
      const result = await sql`SELECT id, email, created_at, status, ip_address FROM newsletter_subscribers ORDER BY created_at DESC`;
      return res.status(200).json({ success: true, subscribers: result.rows });
    } catch (error) {
      console.error('Failed to fetch newsletter subscribers:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ success: false, message: 'Missing subscriber id' });
      await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to delete newsletter subscriber:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete subscriber' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ success: false, message: 'Missing id or status' });
      await sql`UPDATE newsletter_subscribers SET status = ${status} WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to update newsletter subscriber status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  }

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
    res.status(500).json({
      message: 'Failed to subscribe to newsletter',
      success: false
    });
  }
}

// Apply rate limiting - 5 subscriptions per 15 minutes per IP
export default withRateLimit(handler, {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many newsletter subscription attempts, please try again later',
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    return `newsletter:${ip}`;
  }
});