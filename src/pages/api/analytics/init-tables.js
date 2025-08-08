// Initialize analytics database tables
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Creating analytics tables...');

    // Create analytics_events table for general event tracking
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB NOT NULL,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX (event_type),
        INDEX (created_at)
      )
    `;

    // Create revenue_events table for purchase tracking
    await sql`
      CREATE TABLE IF NOT EXISTS revenue_events (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(255) UNIQUE NOT NULL,
        model_id VARCHAR(255) NOT NULL,
        model_title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        customer_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX (model_id),
        INDEX (created_at),
        INDEX (customer_email)
      )
    `;

    // Create daily_revenue table for revenue aggregates
    await sql`
      CREATE TABLE IF NOT EXISTS daily_revenue (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        total_revenue DECIMAL(12,2) DEFAULT 0,
        transaction_count INTEGER DEFAULT 0,
        avg_order_value DECIMAL(10,2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW(),
        INDEX (date)
      )
    `;

    // Create lead_sources table for attribution tracking
    await sql`
      CREATE TABLE IF NOT EXISTS lead_sources (
        id SERIAL PRIMARY KEY,
        source VARCHAR(100) NOT NULL,
        lead_count INTEGER DEFAULT 0,
        total_estimated_value DECIMAL(10,2) DEFAULT 0,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(source, date),
        INDEX (source),
        INDEX (date)
      )
    `;

    // Create model_analytics table for product performance
    await sql`
      CREATE TABLE IF NOT EXISTS model_analytics (
        id SERIAL PRIMARY KEY,
        model_id VARCHAR(255) NOT NULL,
        model_title VARCHAR(255) NOT NULL,
        view_count INTEGER DEFAULT 0,
        total_potential_revenue DECIMAL(12,2) DEFAULT 0,
        category VARCHAR(100),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(model_id, date),
        INDEX (model_id),
        INDEX (category),
        INDEX (date)
      )
    `;

    // Create conversion_funnel table for funnel analysis
    await sql`
      CREATE TABLE IF NOT EXISTS conversion_funnel (
        id SERIAL PRIMARY KEY,
        step_name VARCHAR(100) NOT NULL,
        step_number INTEGER NOT NULL,
        completion_count INTEGER DEFAULT 0,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(step_name, date),
        INDEX (step_number),
        INDEX (date)
      )
    `;

    // Create user_sessions table for session tracking
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        first_visit TIMESTAMP DEFAULT NOW(),
        last_visit TIMESTAMP DEFAULT NOW(),
        page_views INTEGER DEFAULT 1,
        total_session_time INTEGER DEFAULT 0,
        traffic_source VARCHAR(100),
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        conversion_value DECIMAL(10,2) DEFAULT 0,
        ip_address INET,
        user_agent TEXT,
        INDEX (traffic_source),
        INDEX (utm_source),
        INDEX (first_visit)
      )
    `;

    // Create a/b test tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS ab_test_results (
        id SERIAL PRIMARY KEY,
        test_name VARCHAR(100) NOT NULL,
        variant VARCHAR(50) NOT NULL,
        user_session VARCHAR(255),
        conversion_event VARCHAR(100),
        conversion_value DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX (test_name),
        INDEX (variant),
        INDEX (created_at)
      )
    `;

    // Create social_proof_events for tracking social proof interactions
    await sql`
      CREATE TABLE IF NOT EXISTS social_proof_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        model_id VARCHAR(255),
        customer_location VARCHAR(100),
        amount DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        INDEX (event_type),
        INDEX (created_at)
      )
    `;

    console.log('Analytics tables created successfully');

    res.status(200).json({
      success: true,
      message: 'Analytics database tables created successfully',
      tables: [
        'analytics_events',
        'revenue_events', 
        'daily_revenue',
        'lead_sources',
        'model_analytics',
        'conversion_funnel',
        'user_sessions',
        'ab_test_results',
        'social_proof_events'
      ]
    });

  } catch (error) {
    console.error('Failed to create analytics tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create analytics tables',
      details: error.message
    });
  }
}