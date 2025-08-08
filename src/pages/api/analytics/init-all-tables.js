// Initialize all analytics database tables with proper schema
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Creating comprehensive analytics database schema...');

    // Create all analytics tables with proper relationships and indexes
    await createAnalyticsTables();
    await createRevenueTables();
    await createAttributionTables();
    await createFunnelTables();
    await createSessionTables();

    res.status(200).json({
      success: true,
      message: 'Complete analytics database schema created successfully',
      tables: [
        'analytics_events',
        'revenue_events', 
        'daily_revenue',
        'model_analytics',
        'conversions_attributed',
        'touchpoint_attributions',
        'source_performance',
        'session_tracking',
        'conversion_funnel',
        'campaign_interactions',
        'social_proof_events',
        'ab_test_results',
        'attribution_events'
      ]
    });

  } catch (error) {
    console.error('Failed to create analytics schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create analytics database schema',
      details: error.message
    });
  }
}

async function createAnalyticsTables() {
  // Main analytics events table
  await sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      event_data JSONB NOT NULL,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events (event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at);
  `;
}

async function createRevenueTables() {
  // Revenue events table
  await sql`
    CREATE TABLE IF NOT EXISTS revenue_events (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(255) UNIQUE NOT NULL,
      model_id VARCHAR(255) NOT NULL,
      model_title VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      customer_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_revenue_events_model_id ON revenue_events (model_id);
    CREATE INDEX IF NOT EXISTS idx_revenue_events_created_at ON revenue_events (created_at);
    CREATE INDEX IF NOT EXISTS idx_revenue_events_customer_email ON revenue_events (customer_email);
  `;

  // Daily revenue aggregates
  await sql`
    CREATE TABLE IF NOT EXISTS daily_revenue (
      id SERIAL PRIMARY KEY,
      date DATE UNIQUE NOT NULL,
      total_revenue DECIMAL(12,2) DEFAULT 0,
      transaction_count INTEGER DEFAULT 0,
      avg_order_value DECIMAL(10,2) DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_daily_revenue_date ON daily_revenue (date);
  `;

  // Model analytics
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
      UNIQUE(model_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_model_analytics_model_id ON model_analytics (model_id);
    CREATE INDEX IF NOT EXISTS idx_model_analytics_category ON model_analytics (category);
    CREATE INDEX IF NOT EXISTS idx_model_analytics_date ON model_analytics (date);
  `;
}

async function createAttributionTables() {
  // Attribution events
  await sql`
    CREATE TABLE IF NOT EXISTS attribution_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      event_data JSONB NOT NULL,
      session_id VARCHAR(255),
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_attribution_events_type ON attribution_events (event_type);
    CREATE INDEX IF NOT EXISTS idx_attribution_events_session ON attribution_events (session_id);
    CREATE INDEX IF NOT EXISTS idx_attribution_events_created_at ON attribution_events (created_at);
  `;

  // Conversions with full attribution
  await sql`
    CREATE TABLE IF NOT EXISTS conversions_attributed (
      id SERIAL PRIMARY KEY,
      conversion_id VARCHAR(255) UNIQUE NOT NULL,
      conversion_type VARCHAR(100) NOT NULL,
      conversion_value DECIMAL(10,2) NOT NULL,
      session_id VARCHAR(255),
      time_to_conversion_ms BIGINT DEFAULT 0,
      total_touchpoints INTEGER DEFAULT 1,
      first_touch_source VARCHAR(100),
      first_touch_medium VARCHAR(100),
      first_touch_campaign VARCHAR(100),
      last_touch_source VARCHAR(100),
      last_touch_medium VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_conversions_attributed_session ON conversions_attributed (session_id);
    CREATE INDEX IF NOT EXISTS idx_conversions_attributed_first_touch ON conversions_attributed (first_touch_source);
    CREATE INDEX IF NOT EXISTS idx_conversions_attributed_last_touch ON conversions_attributed (last_touch_source);
    CREATE INDEX IF NOT EXISTS idx_conversions_attributed_created_at ON conversions_attributed (created_at);
  `;

  // Touchpoint attributions
  await sql`
    CREATE TABLE IF NOT EXISTS touchpoint_attributions (
      id SERIAL PRIMARY KEY,
      conversion_id VARCHAR(255) NOT NULL,
      touchpoint_order INTEGER NOT NULL,
      source VARCHAR(100) NOT NULL,
      medium VARCHAR(100),
      campaign VARCHAR(100),
      attribution_weight DECIMAL(5,4) DEFAULT 0,
      attributed_value DECIMAL(10,2) DEFAULT 0,
      touchpoint_timestamp TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (conversion_id) REFERENCES conversions_attributed(conversion_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_touchpoint_attributions_conversion ON touchpoint_attributions (conversion_id);
    CREATE INDEX IF NOT EXISTS idx_touchpoint_attributions_source ON touchpoint_attributions (source);
  `;

  // Source performance aggregates
  await sql`
    CREATE TABLE IF NOT EXISTS source_performance (
      id SERIAL PRIMARY KEY,
      source VARCHAR(100) NOT NULL,
      medium VARCHAR(100) NOT NULL,
      campaign VARCHAR(100) DEFAULT 'unknown',
      date DATE NOT NULL,
      first_touch_conversions INTEGER DEFAULT 0,
      last_touch_conversions INTEGER DEFAULT 0,
      first_touch_revenue DECIMAL(10,2) DEFAULT 0,
      last_touch_revenue DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(source, medium, campaign, date)
    );
    CREATE INDEX IF NOT EXISTS idx_source_performance_source ON source_performance (source);
    CREATE INDEX IF NOT EXISTS idx_source_performance_date ON source_performance (date);
  `;
}

async function createSessionTables() {
  // Session tracking
  await sql`
    CREATE TABLE IF NOT EXISTS session_tracking (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      first_touch_source VARCHAR(100),
      first_touch_medium VARCHAR(100),
      page_views INTEGER DEFAULT 1,
      last_page_view TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_session_tracking_session ON session_tracking (session_id);
    CREATE INDEX IF NOT EXISTS idx_session_tracking_source ON session_tracking (first_touch_source);
  `;

  // Campaign interactions
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_interactions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255),
      event_name VARCHAR(100) NOT NULL,
      campaign_name VARCHAR(100) NOT NULL,
      interaction_data JSONB,
      first_touch_campaign VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_campaign_interactions_session ON campaign_interactions (session_id);
    CREATE INDEX IF NOT EXISTS idx_campaign_interactions_campaign ON campaign_interactions (campaign_name);
  `;
}

async function createFunnelTables() {
  // Conversion funnel tracking
  await sql`
    CREATE TABLE IF NOT EXISTS conversion_funnel (
      id SERIAL PRIMARY KEY,
      step_name VARCHAR(100) NOT NULL,
      step_number INTEGER NOT NULL,
      completion_count INTEGER DEFAULT 0,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(step_name, date)
    );
    CREATE INDEX IF NOT EXISTS idx_conversion_funnel_step ON conversion_funnel (step_number);
    CREATE INDEX IF NOT EXISTS idx_conversion_funnel_date ON conversion_funnel (date);
  `;

  // Social proof events
  await sql`
    CREATE TABLE IF NOT EXISTS social_proof_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      model_id VARCHAR(255),
      customer_location VARCHAR(100),
      amount DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_social_proof_events_type ON social_proof_events (event_type);
    CREATE INDEX IF NOT EXISTS idx_social_proof_events_created_at ON social_proof_events (created_at);
  `;

  // A/B testing results
  await sql`
    CREATE TABLE IF NOT EXISTS ab_test_results (
      id SERIAL PRIMARY KEY,
      test_name VARCHAR(100) NOT NULL,
      variant VARCHAR(50) NOT NULL,
      user_session VARCHAR(255),
      conversion_event VARCHAR(100),
      conversion_value DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ab_test_results_test ON ab_test_results (test_name);
    CREATE INDEX IF NOT EXISTS idx_ab_test_results_variant ON ab_test_results (variant);
    CREATE INDEX IF NOT EXISTS idx_ab_test_results_created_at ON ab_test_results (created_at);
  `;
}