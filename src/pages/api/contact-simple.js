// Simplified contact form API that works without database tables
import { sql } from '@vercel/postgres';
import { withRateLimit } from '@/middleware/rate-limit-simple';

async function handler(req, res) {
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
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Try to insert into database if table exists
    try {
      const result = await sql`
        INSERT INTO leads (name, email, company, interest, message, ip_address, user_agent, created_at)
        VALUES (${name}, ${email}, ${company || null}, ${interest || 'general'}, ${message}, ${ipAddress}, ${userAgent}, NOW())
        RETURNING id;
      `;
      
      console.log('Lead saved to database:', result.rows[0]?.id);
    } catch (dbError) {
      // If table doesn't exist, log the contact form submission
      console.log('Contact form submission (database unavailable):', {
        name,
        email,
        company,
        interest,
        message,
        timestamp: new Date().toISOString()
      });
      
      // For production, you might want to send this to an email service
      // or save to a file/external service as a fallback
    }

    // Return success response
    // In production, you would send emails here
    res.status(200).json({ 
      message: 'Message sent successfully',
      success: true
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
}

// Apply rate limiting - 10 submissions per 15 minutes
export default withRateLimit(handler, {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many contact form submissions, please try again later'
});