-- ZenCap Production Database Schema
-- Migration 004: Monitoring and Security Tables

BEGIN;

-- Performance monitoring table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  component VARCHAR(100),
  duration NUMERIC,
  memory_delta NUMERIC,
  exceeds_threshold BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Error logging table
CREATE TABLE IF NOT EXISTS error_logs (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50),
  severity VARCHAR(20),
  message TEXT,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  session_id VARCHAR(128),
  user_id INTEGER REFERENCES users(id),
  event_data JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security audit logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL UNIQUE,
  event_type VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(128),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  action_type VARCHAR(50),
  action VARCHAR(50),
  result VARCHAR(20),
  severity VARCHAR(20) DEFAULT 'info',
  metadata JSONB DEFAULT '{}'::jsonb,
  error_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  retention_until TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints for data integrity
ALTER TABLE error_logs ADD CONSTRAINT chk_severity_valid CHECK (severity IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE security_audit_logs ADD CONSTRAINT chk_result_valid CHECK (result IN ('success', 'failure', 'error', 'blocked'));
ALTER TABLE security_audit_logs ADD CONSTRAINT chk_audit_severity_valid CHECK (severity IN ('info', 'warning', 'error', 'critical'));

COMMIT;