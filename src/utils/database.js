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

    // Create customers table for Stripe integration
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );
    `;

    // Create orders table for purchase tracking
    await sql`
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
        metadata JSONB
      );
    `;

    // Create payment_methods table
    await sql`
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
    `;

    // Create user accounts for NextAuth
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create users table for NextAuth
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        email_verified TIMESTAMP WITH TIME ZONE,
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        stripe_customer_id VARCHAR(255)
      );
    `;

    // Create sessions table for NextAuth
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create verification_tokens table for NextAuth
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `;

    // Create A/B test events table for testing framework
    await sql`
      CREATE TABLE IF NOT EXISTS ab_test_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL, -- 'ab_test_exposure' or 'ab_conversion'
        test_id VARCHAR(100), -- Test identifier
        variant VARCHAR(50), -- Variant name
        goal VARCHAR(100), -- Conversion goal name
        value NUMERIC, -- Conversion value (e.g., revenue)
        session_id VARCHAR(128) NOT NULL, -- User session identifier
        user_segment VARCHAR(50), -- User segment for analysis
        page VARCHAR(500), -- Page where event occurred
        test_assignments JSONB, -- All test assignments for this session
        client_ip VARCHAR(45),
        user_agent TEXT,
        additional_data JSONB, -- Extra event data
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes for better performance (one at a time)
    await sql`CREATE INDEX IF NOT EXISTS idx_event_type ON security_audit_logs(event_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_id ON security_audit_logs(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON security_audit_logs(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_severity ON security_audit_logs(severity);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_error_timestamp ON error_logs(timestamp);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON user_analytics(timestamp);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);`;
    
    // Payment system indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);`;
    
    // NextAuth indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    
    // A/B testing indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_id ON ab_test_events(test_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_session_id ON ab_test_events(session_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_event_type ON ab_test_events(event_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_created_at ON ab_test_events(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ab_variant ON ab_test_events(variant);`;

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
 * Get database connection (for backward compatibility)
 */
export async function getDbConnection() {
  // Return a mock connection object for health checks
  return {
    query: async (queryString) => {
      // For health checks, just run a simple query
      if (queryString === 'SELECT 1') {
        return await sql`SELECT 1`;
      }
      // For other queries, you'd need to use proper sql template literals
      throw new Error('getDbConnection only supports health check queries');
    },
    end: async () => {
      // Connection pooling handled by Vercel
      return Promise.resolve();
    }
  };
}

/**
 * DEPRECATED: Unsafe query function - DO NOT USE
 * This function has been deprecated due to SQL injection vulnerabilities.
 * Use specific database functions or prepared statements instead.
 */
export async function query(queryString, params = []) {
  // Log usage for security monitoring
  console.warn('SECURITY WARNING: Deprecated unsafe query function called', {
    query: queryString?.substring(0, 100) + '...',
    stack: new Error().stack?.split('\n')[2]?.trim()
  });
  
  throw new Error(
    'Unsafe query function is disabled. Use sql`` template literals or specific database functions instead.'
  );
}

/**
 * Safe query function using parameterized queries
 * @param {TemplateStringsArray} strings - SQL template strings
 * @param {...any} values - Parameter values
 * @returns {Promise<Object>} Query results
 */
export async function safeQuery(strings, ...values) {
  try {
    return await sql(strings, ...values);
  } catch (error) {
    console.error('Database query error:', error);
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

/**
 * Payment System Functions
 */

// Create or get customer
export async function createOrGetCustomer(customerData) {
  try {
    const { stripe_customer_id, email, name, metadata = {} } = customerData;
    
    const result = await sql`
      INSERT INTO customers (stripe_customer_id, email, name, metadata)
      VALUES (${stripe_customer_id}, ${email}, ${name}, ${JSON.stringify(metadata)})
      ON CONFLICT (stripe_customer_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating/getting customer:', error);
    throw error;
  }
}

// Create order
export async function createOrder(orderData) {
  try {
    const {
      stripe_session_id,
      stripe_payment_intent_id,
      customer_id,
      model_id,
      model_slug,
      amount,
      currency = 'usd',
      status = 'pending',
      metadata = {}
    } = orderData;
    
    // Set download expiry to 7 days from now
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 7);
    
    const result = await sql`
      INSERT INTO orders (
        stripe_session_id, stripe_payment_intent_id, customer_id, model_id, 
        model_slug, amount, currency, status, download_expires_at, metadata
      )
      VALUES (
        ${stripe_session_id}, ${stripe_payment_intent_id}, ${customer_id}, ${model_id},
        ${model_slug}, ${amount}, ${currency}, ${status}, ${downloadExpiresAt}, ${JSON.stringify(metadata)}
      )
      RETURNING *;
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(sessionId, status, paymentIntentId = null) {
  try {
    const result = await sql`
      UPDATE orders 
      SET status = ${status}, 
          stripe_payment_intent_id = COALESCE(${paymentIntentId}, stripe_payment_intent_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE stripe_session_id = ${sessionId}
      RETURNING *;
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Get order by session ID
export async function getOrderBySessionId(sessionId) {
  try {
    const result = await sql`
      SELECT o.*, m.title as model_title, m.file_url, c.email, c.name as customer_name
      FROM orders o
      LEFT JOIN models m ON o.model_id = m.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.stripe_session_id = ${sessionId};
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching order by session ID:', error);
    throw error;
  }
}

// Get orders by customer
export async function getOrdersByCustomer(customerId) {
  try {
    const result = await sql`
      SELECT o.*, m.title as model_title, m.slug as model_slug
      FROM orders o
      LEFT JOIN models m ON o.model_id = m.id
      WHERE o.customer_id = ${customerId} AND o.status = 'completed'
      ORDER BY o.created_at DESC;
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching orders by customer:', error);
    throw error;
  }
}

// Increment download count
export async function incrementDownloadCount(orderId) {
  try {
    const result = await sql`
      UPDATE orders 
      SET download_count = download_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId} AND download_count < max_downloads AND download_expires_at > NOW()
      RETURNING *;
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error incrementing download count:', error);
    throw error;
  }
}

// Get model by slug
export async function getModelBySlug(slug) {
  try {
    const result = await sql`
      SELECT * FROM models 
      WHERE slug = ${slug} AND status = 'active';
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching model by slug:', error);
    throw error;
  }
}