-- ZenCap Production Database Schema
-- Migration 002: Payment System Tables (Stripe Integration)

BEGIN;

-- Customers table for Stripe integration
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Orders table for purchase tracking
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  customer_id INTEGER REFERENCES customers(id),
  model_id INTEGER REFERENCES models(id),
  model_slug VARCHAR(255),
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) DEFAULT 'pending',
  download_expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  type VARCHAR(50) NOT NULL,
  last4 VARCHAR(4),
  brand VARCHAR(50),
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints for data integrity
ALTER TABLE orders ADD CONSTRAINT chk_amount_positive CHECK (amount > 0);
ALTER TABLE orders ADD CONSTRAINT chk_download_count_positive CHECK (download_count >= 0);
ALTER TABLE orders ADD CONSTRAINT chk_max_downloads_positive CHECK (max_downloads > 0);
ALTER TABLE orders ADD CONSTRAINT chk_status_valid CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded'));

COMMIT;