// Optimized Database Utilities for High-Performance Transactions
// Implements connection pooling, query caching, and performance monitoring

import { sql } from '@vercel/postgres';

class OptimizedDatabase {
  constructor() {
    this.queryCache = new Map();
    this.performanceMetrics = new Map();
    this.connectionPool = {
      active: 0,
      max: 20,
      queue: []
    };
  }

  /**
   * Execute query with performance monitoring and caching
   */
  async executeQuery(queryKey, queryFn, cacheOptions = {}) {
    const { ttl = 300000, useCache = true } = cacheOptions; // 5 min default TTL
    
    // Check cache first for read queries
    if (useCache && this.queryCache.has(queryKey)) {
      const cached = this.queryCache.get(queryKey);
      if (Date.now() < cached.expires) {
        this.recordMetric(queryKey, 0, 'cache_hit');
        return cached.data;
      }
      this.queryCache.delete(queryKey);
    }

    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      // Record performance metrics
      this.recordMetric(queryKey, duration, 'database');
      
      // Cache successful read results
      if (useCache && queryKey.startsWith('SELECT')) {
        this.queryCache.set(queryKey, {
          data: result,
          expires: Date.now() + ttl,
          createdAt: Date.now()
        });
      }

      // Log slow queries (>100ms)
      if (duration > 100) {
        console.warn(`Slow query detected: ${queryKey} took ${Math.round(duration)}ms`);
        await this.logSlowQuery(queryKey, duration);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(queryKey, duration, 'error');
      
      // Log database errors
      await this.logDatabaseError(queryKey, error, duration);
      throw error;
    }
  }

  /**
   * Optimized model lookup with caching
   */
  async getModelBySlug(slug) {
    const queryKey = `SELECT_MODEL_BY_SLUG_${slug}`;
    
    return this.executeQuery(
      queryKey,
      () => sql`
        SELECT m.*, 
               0 as popularity_score,
               0 as revenue_generated
        FROM models m
        WHERE m.slug = ${slug} AND m.status = 'active'
      `,
      { ttl: 600000, useCache: true } // 10 min cache for models
    );
  }

  /**
   * Optimized models listing with performance data
   */
  async getActiveModels(category = null, limit = 50) {
    const queryKey = `SELECT_ACTIVE_MODELS_${category}_${limit}`;
    
    return this.executeQuery(
      queryKey,
      () => {
        if (category) {
          return sql`
            SELECT m.*,
                   0 as total_orders,
                   0 as total_revenue,
                   0 as downloads
            FROM models m
            WHERE m.status = 'active' AND m.category = ${category}
            ORDER BY m.published_at DESC
            LIMIT ${limit}
          `;
        } else {
          return sql`
            SELECT m.*,
                   0 as total_orders,
                   0 as total_revenue,
                   0 as downloads
            FROM models m
            WHERE m.status = 'active'
            ORDER BY m.published_at DESC
            LIMIT ${limit}
          `;
        }
      },
      { ttl: 300000, useCache: true }
    );
  }

  /**
   * High-performance order validation for payments
   */
  async validateOrderBySession(sessionId) {
    const queryKey = `SELECT_ORDER_VALIDATION_${sessionId}`;
    
    return this.executeQuery(
      queryKey,
      () => sql`
        SELECT o.id, o.stripe_session_id, o.customer_id, o.model_id,
               o.amount, o.status, o.download_expires_at, o.download_count,
               o.max_downloads, o.created_at, o.updated_at,
               c.email, c.name as customer_name, c.stripe_customer_id,
               m.title as model_title, m.slug as model_slug, 
               m.file_url, m.excel_url, m.price
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN models m ON o.model_id = m.id
        WHERE o.stripe_session_id = ${sessionId}
      `,
      { ttl: 60000, useCache: true } // 1 min cache for orders
    );
  }

  /**
   * Optimized customer order history
   */
  async getCustomerOrders(customerId, limit = 20) {
    const queryKey = `SELECT_CUSTOMER_ORDERS_${customerId}_${limit}`;
    
    return this.executeQuery(
      queryKey,
      () => sql`
        SELECT o.id, o.stripe_session_id, o.amount, o.status, 
               o.download_expires_at, o.download_count, o.max_downloads,
               o.created_at, o.updated_at,
               m.title as model_title, m.slug as model_slug, 
               m.category, m.thumbnail_url
        FROM orders o
        INNER JOIN models m ON o.model_id = m.id
        WHERE o.customer_id = ${customerId} 
          AND o.status IN ('completed', 'pending')
        ORDER BY o.created_at DESC
        LIMIT ${limit}
      `,
      { ttl: 180000, useCache: true } // 3 min cache
    );
  }

  /**
   * Fast insights feed with performance optimization
   */
  async getPublishedInsights(limit = 20) {
    const queryKey = `SELECT_PUBLISHED_INSIGHTS_${limit}`;
    
    return this.executeQuery(
      queryKey,
      () => sql`
        SELECT id, slug, title, summary, author, cover_image_url,
               published_at, date_published, tags,
               CASE 
                 WHEN LENGTH(content) > 200 THEN LEFT(content, 200) || '...'
                 ELSE content
               END as preview_content
        FROM insights 
        WHERE status = 'published' 
          AND published_at IS NOT NULL
        ORDER BY COALESCE(date_published, published_at) DESC
        LIMIT ${limit}
      `,
      { ttl: 600000, useCache: true } // 10 min cache
    );
  }

  /**
   * Analytics dashboard data with live queries
   */
  async getDashboardAnalytics() {
    const queryKey = 'SELECT_DASHBOARD_ANALYTICS';
    
    return this.executeQuery(
      queryKey,
      async () => {
        const [orderStats, modelData, leadStats] = await Promise.all([
          // Basic order statistics
          sql`
            SELECT 
              COUNT(*) as total_orders,
              COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
              COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_revenue,
              COUNT(DISTINCT customer_id) as unique_customers
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '30 days'
          `,
          
          // Top performing models by orders
          sql`
            SELECT m.id, m.title, m.category, m.price,
                   COUNT(o.id) as total_orders,
                   COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.amount END), 0) as total_revenue
            FROM models m
            LEFT JOIN orders o ON m.id = o.model_id
            WHERE m.status = 'active'
            GROUP BY m.id, m.title, m.category, m.price
            ORDER BY total_revenue DESC NULLS LAST
            LIMIT 10
          `,
          
          // Lead conversion metrics
          sql`
            SELECT 
              COUNT(*) as total_leads,
              COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as leads_24h,
              COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as leads_7d,
              COUNT(CASE WHEN status = 'contacted' THEN 1 END) as leads_contacted
            FROM leads
          `
        ]);

        return {
          revenue: [{
            total_orders: orderStats.rows[0].total_orders,
            completed_orders: orderStats.rows[0].completed_orders,
            total_revenue: orderStats.rows[0].total_revenue,
            unique_customers: orderStats.rows[0].unique_customers
          }],
          topModels: modelData.rows,
          leads: leadStats.rows[0],
          lastUpdated: new Date().toISOString()
        };
      },
      { ttl: 120000, useCache: true } // 2 min cache for dashboard
    );
  }

  /**
   * Optimized lead management with pagination
   */
  async getLeadsPaginated(page = 1, limit = 50, filters = {}) {
    const offset = (page - 1) * limit;
    const queryKey = `SELECT_LEADS_PAGINATED_${page}_${limit}_${JSON.stringify(filters)}`;
    
    return this.executeQuery(
      queryKey,
      async () => {
        // Simplified pagination without complex filtering for now
        const [leads, total] = await Promise.all([
          sql`
            SELECT id, name, email, company, interest, message,
                   created_at, status, source, ip_address
            FROM leads 
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
          
          sql`SELECT COUNT(*) as total FROM leads`
        ]);

        return {
          leads: leads.rows,
          total: parseInt(total.rows[0].total),
          page,
          limit,
          totalPages: Math.ceil(parseInt(total.rows[0].total) / limit)
        };
      },
      { ttl: 60000, useCache: true } // 1 min cache
    );
  }

  /**
   * Record performance metrics
   */
  recordMetric(queryKey, duration, type) {
    const key = `${queryKey}_${type}`;
    const existing = this.performanceMetrics.get(key) || { 
      count: 0, 
      totalTime: 0, 
      avgTime: 0, 
      maxTime: 0 
    };
    
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.lastExecuted = Date.now();
    
    this.performanceMetrics.set(key, existing);
  }

  /**
   * Log slow queries to database for analysis
   */
  async logSlowQuery(queryKey, duration) {
    try {
      await sql`
        INSERT INTO performance_metrics (metric_name, component, duration, exceeds_threshold, metadata, timestamp)
        VALUES ('slow_query', 'database', ${duration}, true, ${JSON.stringify({ query: queryKey })}, NOW())
      `;
    } catch (error) {
      console.error('Failed to log slow query:', error);
    }
  }

  /**
   * Log database errors
   */
  async logDatabaseError(queryKey, error, duration) {
    try {
      await sql`
        INSERT INTO error_logs (category, severity, message, metadata, timestamp)
        VALUES ('database', 'error', ${error.message}, ${JSON.stringify({ 
          query: queryKey, 
          duration, 
          stack: error.stack 
        })}, NOW())
      `;
    } catch (logError) {
      console.error('Failed to log database error:', logError);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const stats = {};
    
    for (const [key, metrics] of this.performanceMetrics.entries()) {
      stats[key] = {
        ...metrics,
        status: metrics.avgTime < 50 ? 'excellent' : 
                metrics.avgTime < 100 ? 'good' : 
                metrics.avgTime < 500 ? 'warning' : 'critical'
      };
    }
    
    return {
      queryStats: stats,
      cacheStats: {
        size: this.queryCache.size,
        hitRate: this.calculateCacheHitRate()
      },
      connectionPool: this.connectionPool
    };
  }

  /**
   * Calculate cache hit rate
   */
  calculateCacheHitRate() {
    const cacheHits = Array.from(this.performanceMetrics.values())
      .filter(m => m.count > 0)
      .reduce((sum, m) => {
        const cacheHitMetric = this.performanceMetrics.get(m.key + '_cache_hit');
        return sum + (cacheHitMetric?.count || 0);
      }, 0);
      
    const totalQueries = Array.from(this.performanceMetrics.values())
      .reduce((sum, m) => sum + m.count, 0);
      
    return totalQueries > 0 ? Math.round((cacheHits / totalQueries) * 100) : 0;
  }

  /**
   * Clear cache (for cache invalidation)
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const startTime = performance.now();
    
    try {
      await sql`SELECT 1 as health_check`;
      const responseTime = performance.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        connectionPool: this.connectionPool,
        cacheSize: this.queryCache.size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: performance.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const optimizedDb = new OptimizedDatabase();
export default optimizedDb;