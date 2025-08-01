/**
 * Initialize monitoring database tables
 * Creates all necessary tables for performance, error, and analytics tracking
 */

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create performance metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        component VARCHAR(255) NOT NULL,
        metric_name VARCHAR(255) NOT NULL,
        duration DECIMAL(10, 2) NOT NULL,
        memory_delta BIGINT,
        metadata JSONB DEFAULT '{}',
        exceeds_threshold BOOLEAN DEFAULT false,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_performance_timestamp (timestamp),
        INDEX idx_performance_component (component, metric_name)
      )
    `;

    // Create error logs table
    await sql`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        error_id UUID UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        stack_trace TEXT,
        metadata JSONB DEFAULT '{}',
        url TEXT,
        user_agent TEXT,
        context JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_errors_timestamp (timestamp),
        INDEX idx_errors_category_severity (category, severity),
        INDEX idx_errors_message (message)
      )
    `;

    // Create user analytics table
    await sql`
      CREATE TABLE IF NOT EXISTS user_analytics (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) UNIQUE NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB DEFAULT '{}',
        page_url TEXT,
        context JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_analytics_timestamp (timestamp),
        INDEX idx_analytics_session (session_id),
        INDEX idx_analytics_user (user_id),
        INDEX idx_analytics_event_type (event_type)
      )
    `;

    // Create user journeys table
    await sql`
      CREATE TABLE IF NOT EXISTS user_journeys (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        journey_data JSONB DEFAULT '[]',
        feature_usage JSONB DEFAULT '{}',
        error_count INTEGER DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_journeys_user (user_id),
        INDEX idx_journeys_timestamp (timestamp)
      )
    `;

    // Create monitoring alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS monitoring_alerts (
        id SERIAL PRIMARY KEY,
        alert_id VARCHAR(255) UNIQUE NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        severity_level INTEGER NOT NULL,
        message TEXT NOT NULL,
        metric_data JSONB,
        error_data JSONB,
        pattern_data JSONB,
        metadata JSONB DEFAULT '{}',
        source TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_alerts_timestamp (timestamp),
        INDEX idx_alerts_type_severity (alert_type, severity)
      )
    `;

    // Create incidents table
    await sql`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        incident_id VARCHAR(255) UNIQUE NOT NULL,
        alert_id VARCHAR(255),
        title TEXT NOT NULL,
        description JSONB NOT NULL,
        severity VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        resolution_notes TEXT,
        INDEX idx_incidents_status (status),
        INDEX idx_incidents_created (created_at)
      )
    `;

    // Create error patterns table
    await sql`
      CREATE TABLE IF NOT EXISTS error_patterns (
        id SERIAL PRIMARY KEY,
        pattern_id VARCHAR(255) UNIQUE NOT NULL,
        pattern_type VARCHAR(100) NOT NULL,
        pattern_data JSONB NOT NULL,
        occurrence_count INTEGER DEFAULT 1,
        first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (pattern_type, (pattern_data->>'message'))
      )
    `;

    // Create performance alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS performance_alerts (
        id SERIAL PRIMARY KEY,
        alert_id VARCHAR(255) NOT NULL,
        metric_name VARCHAR(255) NOT NULL,
        threshold_value DECIMAL(10, 2),
        actual_value DECIMAL(10, 2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_perf_alerts_timestamp (timestamp)
      )
    `;

    // Create monitoring summary view
    await sql`
      CREATE OR REPLACE VIEW monitoring_summary AS
      WITH performance_stats AS (
        SELECT 
          COUNT(*) as total_operations,
          AVG(duration) as avg_duration,
          SUM(CASE WHEN exceeds_threshold THEN 1 ELSE 0 END) as threshold_violations
        FROM performance_metrics
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      ),
      error_stats AS (
        SELECT 
          COUNT(*) as total_errors,
          SUM(CASE WHEN severity IN ('critical', 'high') THEN 1 ELSE 0 END) as critical_errors
        FROM error_logs
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      ),
      user_stats AS (
        SELECT 
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT session_id) as unique_sessions,
          COUNT(*) as total_events
        FROM user_analytics
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      )
      SELECT 
        p.total_operations,
        p.avg_duration,
        p.threshold_violations,
        e.total_errors,
        e.critical_errors,
        u.unique_users,
        u.unique_sessions,
        u.total_events
      FROM performance_stats p, error_stats e, user_stats u
    `;

    // Create indexes for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_performance_metrics_composite 
      ON performance_metrics (component, metric_name, timestamp DESC);
      
      CREATE INDEX IF NOT EXISTS idx_error_logs_composite 
      ON error_logs (category, severity, timestamp DESC);
      
      CREATE INDEX IF NOT EXISTS idx_user_analytics_composite 
      ON user_analytics (event_type, timestamp DESC);
    `;

    res.status(200).json({
      success: true,
      message: 'Monitoring database tables created successfully',
      tables: [
        'performance_metrics',
        'error_logs',
        'user_analytics',
        'user_journeys',
        'monitoring_alerts',
        'incidents',
        'error_patterns',
        'performance_alerts',
        'monitoring_summary (view)'
      ]
    });

  } catch (error) {
    console.error('Error creating monitoring tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create monitoring tables',
      details: error.message
    });
  }
}