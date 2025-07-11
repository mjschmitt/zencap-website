// src/utils/database.js - PostgreSQL database utilities
import { sql } from '@vercel/postgres';

/**
 * Initialize database tables
 */
export async function initializeDatabase() {
  try {
    // Create leads table
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        company VARCHAR(255),
        interest VARCHAR(100),
        message TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'new',
        source VARCHAR(100) DEFAULT 'contact_form'
      );
    `;

    // Create newsletter subscribers table
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        source VARCHAR(100) DEFAULT 'website'
      );
    `;

    // Create form submissions log table
    await sql`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id SERIAL PRIMARY KEY,
        form_type VARCHAR(50) NOT NULL,
        form_data JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'success',
        error_message TEXT
      );
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Insert a new lead into the database
 */
export async function insertLead(leadData) {
  try {
    const { name, email, company, interest, message, ipAddress, userAgent } = leadData;
    
    const result = await sql`
      INSERT INTO leads (name, email, company, interest, message, ip_address, user_agent)
      VALUES (${name}, ${email}, ${company || null}, ${interest}, ${message}, ${ipAddress}, ${userAgent})
      RETURNING id, created_at;
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting lead:', error);
    throw error;
  }
}

/**
 * Insert a new newsletter subscriber
 */
export async function insertNewsletterSubscriber(subscriberData) {
  try {
    const { email, ipAddress, userAgent } = subscriberData;
    
    const result = await sql`
      INSERT INTO newsletter_subscribers (email, ip_address, user_agent)
      VALUES (${email}, ${ipAddress}, ${userAgent})
      ON CONFLICT (email) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        status = 'active'
      RETURNING id, created_at;
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting newsletter subscriber:', error);
    throw error;
  }
}

/**
 * Log form submission
 */
export async function logFormSubmission(submissionData) {
  try {
    const { formType, formData, ipAddress, userAgent, status, errorMessage } = submissionData;
    
    await sql`
      INSERT INTO form_submissions (form_type, form_data, ip_address, user_agent, status, error_message)
      VALUES (${formType}, ${JSON.stringify(formData)}, ${ipAddress}, ${userAgent}, ${status}, ${errorMessage || null});
    `;
  } catch (error) {
    console.error('Error logging form submission:', error);
    // Don't throw error for logging failures
  }
}

/**
 * Get all leads (for admin dashboard)
 */
export async function getAllLeads() {
  try {
    const result = await sql`
      SELECT * FROM leads 
      ORDER BY created_at DESC;
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

/**
 * Get lead by ID
 */
export async function getLeadById(id) {
  try {
    const result = await sql`
      SELECT * FROM leads 
      WHERE id = ${id};
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(id, status) {
  try {
    const result = await sql`
      UPDATE leads 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
}

/**
 * Get newsletter subscribers count
 */
export async function getNewsletterSubscribersCount() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM newsletter_subscribers 
      WHERE status = 'active';
    `;
    
    return result.rows[0].count;
  } catch (error) {
    console.error('Error fetching newsletter subscribers count:', error);
    throw error;
  }
} 