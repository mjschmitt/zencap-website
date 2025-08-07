-- ZenCap Production Database Schema
-- Migration 005: Performance Indexes and Optimization

BEGIN;

-- Core business table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_at_status ON leads(created_at DESC, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_email_lookup ON leads(email) WHERE status != 'deleted';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_interest_date ON leads(interest, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_source ON leads(source);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(email) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscribers(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_status_published ON insights(status, published_at DESC) WHERE status = 'published';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_slug ON insights(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_author ON insights(author);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_category_status ON models(category, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_price ON models(price);

-- Payment system indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email ON customers(email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_download_expiry ON orders(download_expires_at, status) WHERE status = 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_default ON payment_methods(customer_id, is_default) WHERE is_default = true;

-- Authentication indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires ON sessions(expires);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Monitoring and security indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metric_name ON performance_metrics(metric_name, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_threshold ON performance_metrics(exceeds_threshold, timestamp DESC) WHERE exceeds_threshold = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_severity ON error_logs(severity, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_category ON error_logs(category, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_timestamp ON user_analytics(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event_type ON user_analytics(event_type, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_user_id ON user_analytics(user_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_event_type ON security_audit_logs(event_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_user_id ON security_audit_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_severity ON security_audit_logs(severity, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_result ON security_audit_logs(result, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_retention ON security_audit_logs(retention_until) WHERE retention_until IS NOT NULL;

-- Form submissions index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_form_submissions_type_created ON form_submissions(form_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_form_submissions_status ON form_submissions(status, created_at DESC);

COMMIT;