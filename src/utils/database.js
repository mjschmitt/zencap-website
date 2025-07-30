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

    // Create insights table with date_published field
    await sql`
      CREATE TABLE IF NOT EXISTS insights (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        content TEXT,
        author VARCHAR(100),
        cover_image_url TEXT,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'draft',
        tags TEXT,
        date_published DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create models table with excel_url field
    await sql`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        thumbnail_url TEXT,
        file_url TEXT,
        price NUMERIC,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        tags TEXT,
        excel_url TEXT
      );
    `;

    // Create performance_metrics table for monitoring
    await sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        component VARCHAR(100),
        duration NUMERIC,
        memory_delta NUMERIC,
        exceeds_threshold BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create error_logs table for monitoring
    await sql`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50),
        severity VARCHAR(20),
        message TEXT,
        stack_trace TEXT,
        url TEXT,
        user_agent TEXT,
        metadata JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create user_analytics table for monitoring
    await sql`
      CREATE TABLE IF NOT EXISTS user_analytics (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        session_id VARCHAR(128),
        user_id INTEGER,
        event_data JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create security_audit_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(64) NOT NULL UNIQUE,
        event_type VARCHAR(50) NOT NULL,
        user_id INTEGER,
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_id VARCHAR(128),
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        action_type VARCHAR(50),
        action VARCHAR(50),
        result VARCHAR(20),
        severity VARCHAR(20) DEFAULT 'info',
        metadata JSONB,
        error_details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        retention_until TIMESTAMP WITH TIME ZONE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_event_type ON security_audit_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_user_id ON security_audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_created_at ON security_audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_severity ON security_audit_logs(severity);
      CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_error_timestamp ON error_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON user_analytics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status);
      CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
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

/**
 * Get all published insights
 */
export async function getAllInsights() {
  try {
    const result = await sql`SELECT * FROM insights WHERE status = 'published' ORDER BY published_at DESC;`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
}

/**
 * Get all active models
 */
export async function getAllModels() {
  try {
    const result = await sql`SELECT * FROM models WHERE status = 'active' ORDER BY published_at DESC;`;
    return result.rows;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
} 