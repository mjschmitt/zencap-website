// Simplified newsletter API that handles missing database tables gracefully
import { sql } from '@vercel/postgres';
import { withRateLimit } from '@/middleware/rate-limit-simple';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Try to fetch newsletter subscribers if table exists
      const result = await sql`
        SELECT id, email, created_at, status, ip_address 
        FROM newsletter_subscribers 
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ success: true, subscribers: result.rows });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        // Table doesn't exist yet, return empty array
        return res.status(200).json({ 
          success: true, 
          subscribers: [],
          message: 'Newsletter table not yet created' 
        });
      }
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
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Try to insert into database if table exists
    try {
      // First check if email already exists
      const existing = await sql`
        SELECT id FROM newsletter_subscribers 
        WHERE email = ${email.trim().toLowerCase()}
        LIMIT 1
      `;
      
      if (existing.rows.length > 0) {
        return res.status(200).json({ 
          message: 'You are already subscribed to our newsletter',
          success: true,
          alreadySubscribed: true
        });
      }

      // Insert new subscriber
      const result = await sql`
        INSERT INTO newsletter_subscribers (email, ip_address, user_agent, status, created_at)
        VALUES (${email.trim().toLowerCase()}, ${ipAddress}, ${userAgent}, 'active', NOW())
        RETURNING id;
      `;
      
      console.log('Newsletter subscriber saved:', result.rows[0]?.id);
      
      // In production, send welcome email here
      
    } catch (dbError) {
      if (dbError.message.includes('does not exist')) {
        // Table doesn't exist, log the subscription
        console.log('Newsletter subscription (table not created):', {
          email: email.trim().toLowerCase(),
          timestamp: new Date().toISOString()
        });
      } else if (dbError.message.includes('unique constraint')) {
        // Email already exists
        return res.status(200).json({ 
          message: 'You are already subscribed to our newsletter',
          success: true,
          alreadySubscribed: true
        });
      } else {
        // Other database error
        console.error('Newsletter database error:', dbError);
      }
    }

    // Return success response
    res.status(200).json({ 
      message: 'Successfully subscribed to newsletter',
      success: true
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
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
  message: 'Too many newsletter subscription attempts, please try again later'
});