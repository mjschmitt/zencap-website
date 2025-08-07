-- ZenCap Production Database Schema
-- Migration 006: Data Constraints and Business Logic

BEGIN;

-- Add data validation constraints
ALTER TABLE leads ADD CONSTRAINT chk_leads_status_valid 
  CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed', 'deleted'));

ALTER TABLE leads ADD CONSTRAINT chk_leads_interest_valid 
  CHECK (interest IN ('private-equity', 'public-equity', 'financial-modeling', 'investment-advisory', 'research', 'other'));

ALTER TABLE newsletter_subscribers ADD CONSTRAINT chk_newsletter_status_valid 
  CHECK (status IN ('active', 'unsubscribed', 'bounced', 'deleted'));

ALTER TABLE insights ADD CONSTRAINT chk_insights_status_valid 
  CHECK (status IN ('draft', 'published', 'archived', 'deleted'));

ALTER TABLE models ADD CONSTRAINT chk_models_status_valid 
  CHECK (status IN ('active', 'inactive', 'archived', 'deleted'));

ALTER TABLE models ADD CONSTRAINT chk_models_category_valid 
  CHECK (category IN ('private-equity', 'public-equity', 'financial-planning', 'valuation', 'risk-analysis'));

ALTER TABLE models ADD CONSTRAINT chk_models_price_valid 
  CHECK (price >= 0 AND price <= 50000);

-- Email format validation
ALTER TABLE leads ADD CONSTRAINT chk_leads_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE newsletter_subscribers ADD CONSTRAINT chk_newsletter_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE customers ADD CONSTRAINT chk_customers_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- URL validation for models and insights
ALTER TABLE models ADD CONSTRAINT chk_models_file_url_format 
  CHECK (file_url IS NULL OR file_url ~* '^https?://');

ALTER TABLE models ADD CONSTRAINT chk_models_thumbnail_url_format 
  CHECK (thumbnail_url IS NULL OR thumbnail_url ~* '^https?://');

ALTER TABLE insights ADD CONSTRAINT chk_insights_cover_image_url_format 
  CHECK (cover_image_url IS NULL OR cover_image_url ~* '^https?://');

-- Slug format validation (URL-friendly)
ALTER TABLE insights ADD CONSTRAINT chk_insights_slug_format 
  CHECK (slug ~* '^[a-z0-9-]+$');

ALTER TABLE models ADD CONSTRAINT chk_models_slug_format 
  CHECK (slug ~* '^[a-z0-9-]+$');

-- Date constraints
ALTER TABLE orders ADD CONSTRAINT chk_orders_download_expiry_future 
  CHECK (download_expires_at IS NULL OR download_expires_at > created_at);

ALTER TABLE insights ADD CONSTRAINT chk_insights_published_after_created 
  CHECK (published_at IS NULL OR published_at >= created_at);

-- Business logic constraints
ALTER TABLE orders ADD CONSTRAINT chk_orders_download_limit 
  CHECK (download_count <= max_downloads);

-- Set default retention for security logs (1 year)
ALTER TABLE security_audit_logs ALTER COLUMN retention_until 
  SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year');

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for all tables with updated_at columns
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;