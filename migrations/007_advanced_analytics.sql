-- ZenCap Advanced Analytics Schema
-- Migration 007: Comprehensive Analytics and Conversion Tracking Tables

BEGIN;

-- Analytics Events (Enhanced)
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id VARCHAR(128),
  user_id VARCHAR(64),
  user_segment VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100), 
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Revenue Events (Enhanced Ecommerce)
CREATE TABLE IF NOT EXISTS revenue_events (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  model_id VARCHAR(50),
  model_title VARCHAR(255),
  model_category VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  payment_method VARCHAR(50),
  session_id VARCHAR(128),
  user_segment VARCHAR(50),
  attribution_source VARCHAR(100),
  attribution_medium VARCHAR(100),
  attribution_campaign VARCHAR(100),
  customer_lifetime_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily Revenue Aggregates
CREATE TABLE IF NOT EXISTS daily_revenue (
  date DATE PRIMARY KEY,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  unique_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model Analytics (Performance Tracking)
CREATE TABLE IF NOT EXISTS model_analytics (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(50) NOT NULL,
  model_title VARCHAR(255),
  model_category VARCHAR(100),
  date DATE NOT NULL,
  view_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  preview_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  avg_scroll_depth DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_id, date)
);

-- Conversion Funnel Tracking
CREATE TABLE IF NOT EXISTS conversion_funnel (
  id SERIAL PRIMARY KEY,
  step_name VARCHAR(100) NOT NULL,
  step_number INTEGER NOT NULL,
  date DATE NOT NULL,
  completion_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  avg_time_to_complete INTEGER, -- seconds
  drop_off_rate DECIMAL(5,4) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(step_name, date)
);

-- Lead Attribution and Tracking
CREATE TABLE IF NOT EXISTS conversions_attributed (
  id SERIAL PRIMARY KEY,
  conversion_id VARCHAR(100) UNIQUE NOT NULL,
  conversion_type VARCHAR(50) NOT NULL, -- 'purchase', 'lead', 'signup'
  user_id VARCHAR(64),
  session_id VARCHAR(128),
  conversion_value DECIMAL(10,2),
  attribution_source VARCHAR(100),
  attribution_medium VARCHAR(100), 
  attribution_campaign VARCHAR(100),
  first_touch_source VARCHAR(100),
  first_touch_medium VARCHAR(100),
  last_touch_source VARCHAR(100),
  last_touch_medium VARCHAR(100),
  touchpoints_count INTEGER DEFAULT 1,
  time_to_conversion INTEGER, -- hours
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multi-touch Attribution Touchpoints
CREATE TABLE IF NOT EXISTS touchpoint_attributions (
  id SERIAL PRIMARY KEY,
  conversion_id VARCHAR(100) REFERENCES conversions_attributed(conversion_id),
  touchpoint_number INTEGER NOT NULL,
  source VARCHAR(100),
  medium VARCHAR(100),
  campaign VARCHAR(100),
  page_url TEXT,
  touchpoint_value DECIMAL(10,2), -- attributed value
  attribution_weight DECIMAL(5,4), -- 0-1
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Attribution Source Performance
CREATE TABLE IF NOT EXISTS source_performance (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100) NOT NULL,
  medium VARCHAR(100),
  campaign VARCHAR(100),
  date DATE NOT NULL,
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  pageviews INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  avg_session_duration INTEGER,
  conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(12,2) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0, -- for paid campaigns
  roas DECIMAL(6,2), -- Return on Ad Spend
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, medium, campaign, date)
);

-- Session Tracking for User Journey
CREATE TABLE IF NOT EXISTS session_tracking (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(128) UNIQUE NOT NULL,
  user_id VARCHAR(64),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- seconds
  page_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  source VARCHAR(100),
  medium VARCHAR(100),
  campaign VARCHAR(100),
  device_category VARCHAR(50),
  browser VARCHAR(100),
  operating_system VARCHAR(100),
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  is_conversion BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10,2) DEFAULT 0
);

-- A/B Test Results Tracking
CREATE TABLE IF NOT EXISTS ab_test_results (
  id SERIAL PRIMARY KEY,
  test_name VARCHAR(100) NOT NULL,
  variant VARCHAR(50) NOT NULL,
  user_id VARCHAR(64),
  session_id VARCHAR(128),
  conversion BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  metric_value DECIMAL(10,4), -- Custom metric value
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX(test_name, variant)
);

-- Social Proof Events
CREATE TABLE IF NOT EXISTS social_proof_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'purchase', 'signup', 'download'
  display_message TEXT,
  model_id VARCHAR(50),
  user_location VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_displayed BOOLEAN DEFAULT FALSE,
  display_count INTEGER DEFAULT 0
);

-- Campaign Interactions (Email, Social, Ads)
CREATE TABLE IF NOT EXISTS campaign_interactions (
  id SERIAL PRIMARY KEY,
  campaign_id VARCHAR(100) NOT NULL,
  campaign_type VARCHAR(50), -- 'email', 'social', 'paid_search', 'display'
  interaction_type VARCHAR(50), -- 'click', 'open', 'share', 'conversion'
  user_id VARCHAR(64),
  session_id VARCHAR(128),
  value DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Heat Map Data Storage
CREATE TABLE IF NOT EXISTS heatmap_data (
  id SERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  device_type VARCHAR(50),
  click_x INTEGER,
  click_y INTEGER,
  scroll_depth INTEGER,
  time_on_element INTEGER, -- milliseconds
  element_selector TEXT,
  element_type VARCHAR(50),
  session_id VARCHAR(128),
  user_segment VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Behavior Analytics (Enhanced)
CREATE TABLE IF NOT EXISTS user_behavior (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64),
  session_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  element_id VARCHAR(255),
  element_type VARCHAR(50),
  page_url TEXT,
  scroll_depth INTEGER,
  time_on_page INTEGER,
  click_coordinates JSONB, -- {x: number, y: number}
  form_interactions INTEGER DEFAULT 0,
  video_engagement INTEGER DEFAULT 0, -- seconds watched
  search_queries TEXT[],
  user_segment VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_segment ON analytics_events(user_segment, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_events_date ON revenue_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_events_model ON revenue_events(model_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_events_customer ON revenue_events(customer_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_analytics_date ON model_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_model_analytics_model ON model_analytics(model_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_model_analytics_category ON model_analytics(model_category, date DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_date ON conversion_funnel(date DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_step ON conversion_funnel(step_number, date DESC);

CREATE INDEX IF NOT EXISTS idx_attribution_conversion ON conversions_attributed(conversion_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attribution_source ON conversions_attributed(attribution_source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_touchpoints_conversion ON touchpoint_attributions(conversion_id, touchpoint_number);

CREATE INDEX IF NOT EXISTS idx_source_performance_date ON source_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_source_performance_source ON source_performance(source, date DESC);

CREATE INDEX IF NOT EXISTS idx_session_tracking_date ON session_tracking(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_session_tracking_conversion ON session_tracking(is_conversion, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_heatmap_page_device ON heatmap_data(page_url, device_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_heatmap_coordinates ON heatmap_data(click_x, click_y, page_url);

CREATE INDEX IF NOT EXISTS idx_user_behavior_session ON user_behavior(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_behavior_page_event ON user_behavior(page_url, event_type, created_at DESC);

-- Add constraints and validation
ALTER TABLE revenue_events ADD CONSTRAINT chk_revenue_amount_positive CHECK (amount > 0);
ALTER TABLE daily_revenue ADD CONSTRAINT chk_daily_revenue_positive CHECK (total_revenue >= 0);
ALTER TABLE model_analytics ADD CONSTRAINT chk_conversion_rate_valid CHECK (conversion_rate >= 0 AND conversion_rate <= 1);
ALTER TABLE conversion_funnel ADD CONSTRAINT chk_drop_off_rate_valid CHECK (drop_off_rate >= 0 AND drop_off_rate <= 1);
ALTER TABLE touchpoint_attributions ADD CONSTRAINT chk_attribution_weight_valid CHECK (attribution_weight >= 0 AND attribution_weight <= 1);

COMMIT;