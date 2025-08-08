// High-Performance Database Layer for ZenCap Financial Models
// Optimized for $2,985-$4,985 product queries with sub-100ms response times

import { sql } from '@vercel/postgres';
import { Redis } from 'ioredis';

class OptimizedDatabase {
  constructor() {
    this.queryCache = new Map();
    this.connectionPool = null;
    this.redis = null;
    this.queryMetrics = {
      totalQueries: 0,
      cacheHits: 0,
      slowQueries: 0,
      avgResponseTime: 0
    };
    
    // Initialize Redis for caching (if available)
    this.initializeRedis();
    
    // Query performance thresholds
    this.SLOW_QUERY_THRESHOLD = 100; // ms
    this.CACHE_TTL = 300; // 5 minutes for financial data
    this.MAX_CACHE_SIZE = 1000;
  }

  // Initialize Redis connection
  async initializeRedis() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
        
        console.log('[OptimizedDB] Redis cache initialized');
      } catch (error) {
        console.warn('[OptimizedDB] Redis initialization failed, using memory cache:', error);
      }
    }
  }

  // Execute query with caching and performance monitoring
  async executeQuery(query, params = [], options = {}) {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(query, params);
    const { cache = true, ttl = this.CACHE_TTL } = options;

    try {
      // Check cache first
      if (cache) {
        const cachedResult = await this.getFromCache(cacheKey);
        if (cachedResult) {
          this.queryMetrics.cacheHits++;
          this.queryMetrics.totalQueries++;
          return cachedResult;
        }
      }

      // Execute query
      const result = await sql.query(query, params);
      const responseTime = performance.now() - startTime;

      // Update metrics
      this.updateQueryMetrics(responseTime);

      // Cache result
      if (cache && result.rows) {
        await this.setCache(cacheKey, result.rows, ttl);
      }

      return result.rows;

    } catch (error) {
      const responseTime = performance.now() - startTime;
      console.error('[OptimizedDB] Query failed:', {
        query: query.substring(0, 100) + '...',
        params,
        responseTime,
        error: error.message
      });
      throw error;
    }
  }

  // Optimized financial models query
  async getFinancialModels(options = {}) {
    const {
      category = null,
      featured = null,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    let query = `
      SELECT 
        id,
        title,
        slug,
        description,
        price,
        category,
        featured,
        preview_image,
        excel_file,
        created_at,
        updated_at
      FROM models
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (featured !== null) {
      query += ` AND featured = $${paramIndex}`;
      params.push(featured);
      paramIndex++;
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    return this.executeQuery(query, params, { cache: true, ttl: 600 });
  }

  // High-performance model by slug query
  async getModelBySlug(slug) {
    const query = `
      SELECT 
        m.*,
        COUNT(r.id) as review_count,
        AVG(r.rating) as avg_rating
      FROM models m
      LEFT JOIN reviews r ON m.id = r.model_id
      WHERE m.slug = $1
      GROUP BY m.id
    `;

    const results = await this.executeQuery(query, [slug], { cache: true, ttl: 900 });
    return results[0] || null;
  }

  // Optimized insights query with full-text search
  async getInsights(options = {}) {
    const {
      search = null,
      limit = 10,
      offset = 0,
      category = null,
      featured = null
    } = options;

    let query = `
      SELECT 
        id,
        title,
        slug,
        excerpt,
        featured_image,
        category,
        featured,
        published_at,
        read_time,
        ts_rank(search_vector, to_tsquery($1)) as rank
      FROM insights
      WHERE published_at IS NOT NULL
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND search_vector @@ to_tsquery($${paramIndex})`;
      params.push(search.split(' ').join(' & '));
      paramIndex++;
    } else {
      params.push('');
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (featured !== null) {
      query += ` AND featured = $${paramIndex}`;
      params.push(featured);
      paramIndex++;
    }

    if (search) {
      query += ` ORDER BY rank DESC, published_at DESC`;
    } else {
      query += ` ORDER BY published_at DESC`;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    return this.executeQuery(query, params, { cache: true, ttl: 300 });
  }

  // Batch operations for better performance
  async batchGetModels(ids) {
    if (!ids || ids.length === 0) return [];

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    const query = `
      SELECT * FROM models 
      WHERE id IN (${placeholders})
      ORDER BY CASE id ${ids.map((id, index) => `WHEN $${index + 1} THEN ${index}`).join(' ')} END
    `;

    return this.executeQuery(query, ids, { cache: true, ttl: 600 });
  }

  // Newsletter optimization with deduplication
  async addNewsletterSubscriber(email) {
    const query = `
      INSERT INTO newsletter_subscribers (email, subscribed_at)
      VALUES ($1, NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        subscribed_at = NOW(),
        unsubscribed_at = NULL
      RETURNING id, email, subscribed_at
    `;

    return this.executeQuery(query, [email], { cache: false });
  }

  // Contact form with spam detection
  async createContactSubmission(data) {
    const { name, email, message, source = 'website' } = data;
    
    // Basic spam detection
    const spamScore = this.calculateSpamScore(data);
    
    const query = `
      INSERT INTO form_submissions (
        name, email, message, source, spam_score, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, created_at
    `;

    return this.executeQuery(query, [name, email, message, source, spamScore], { cache: false });
  }

  // Analytics aggregation with caching
  async getAnalyticsData(timeframe = '7d') {
    const query = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as total_visits,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(page_load_time) as avg_load_time
      FROM analytics_events 
      WHERE created_at >= NOW() - INTERVAL '${timeframe}'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    return this.executeQuery(query, [], { cache: true, ttl: 1800 }); // 30 min cache
  }

  // Cache management
  async getFromCache(key) {
    try {
      if (this.redis) {
        const result = await this.redis.get(key);
        return result ? JSON.parse(result) : null;
      }
      
      // Fallback to memory cache
      const cached = this.queryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
      
      return null;
    } catch (error) {
      console.warn('[OptimizedDB] Cache get failed:', error);
      return null;
    }
  }

  async setCache(key, data, ttl) {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(data));
        return;
      }
      
      // Fallback to memory cache with size limit
      if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.queryCache.keys().next().value;
        this.queryCache.delete(firstKey);
      }
      
      this.queryCache.set(key, {
        data,
        expires: Date.now() + (ttl * 1000)
      });
    } catch (error) {
      console.warn('[OptimizedDB] Cache set failed:', error);
    }
  }

  // Database connection management
  async ensureConnection() {
    // Vercel Postgres handles connections automatically
    // This method is for future connection pooling implementation
    return true;
  }

  // Performance utilities
  generateCacheKey(query, params) {
    const queryHash = this.hashCode(query);
    const paramsHash = this.hashCode(JSON.stringify(params));
    return `query:${queryHash}:${paramsHash}`;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  updateQueryMetrics(responseTime) {
    this.queryMetrics.totalQueries++;
    
    if (responseTime > this.SLOW_QUERY_THRESHOLD) {
      this.queryMetrics.slowQueries++;
    }
    
    this.queryMetrics.avgResponseTime = 
      (this.queryMetrics.avgResponseTime * (this.queryMetrics.totalQueries - 1) + responseTime) / 
      this.queryMetrics.totalQueries;
  }

  calculateSpamScore(data) {
    let score = 0;
    
    // Simple spam detection heuristics
    if (data.message) {
      const message = data.message.toLowerCase();
      const spamKeywords = ['viagra', 'casino', 'loan', 'bitcoin', 'crypto', 'investment opportunity'];
      score += spamKeywords.filter(keyword => message.includes(keyword)).length * 10;
      
      if (message.length < 10) score += 5;
      if (/https?:\/\//.test(message)) score += 5;
    }
    
    if (data.email && !data.email.includes('@')) score += 20;
    
    return Math.min(score, 100);
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      ...this.queryMetrics,
      cacheHitRate: this.queryMetrics.totalQueries > 0 ? 
        (this.queryMetrics.cacheHits / this.queryMetrics.totalQueries * 100).toFixed(2) : 0,
      memoryCacheSize: this.queryCache.size,
      redisConnected: !!this.redis
    };
  }

  // Cleanup resources
  async cleanup() {
    if (this.redis) {
      await this.redis.disconnect();
    }
    this.queryCache.clear();
  }
}

// Create singleton instance
const optimizedDb = new OptimizedDatabase();

// Export optimized query functions
export const getFinancialModels = (options) => optimizedDb.getFinancialModels(options);
export const getModelBySlug = (slug) => optimizedDb.getModelBySlug(slug);
export const getInsights = (options) => optimizedDb.getInsights(options);
export const batchGetModels = (ids) => optimizedDb.batchGetModels(ids);
export const addNewsletterSubscriber = (email) => optimizedDb.addNewsletterSubscriber(email);
export const createContactSubmission = (data) => optimizedDb.createContactSubmission(data);
export const getAnalyticsData = (timeframe) => optimizedDb.getAnalyticsData(timeframe);
export const getDbMetrics = () => optimizedDb.getPerformanceMetrics();

// Migration utilities for performance optimization
export const performanceMigrations = {
  // Add indexes for common queries
  async createPerformanceIndexes() {
    const indexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_category ON models(category)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_featured ON models(featured)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_slug ON models(slug)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_published_at ON insights(published_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_search_vector ON insights USING gin(search_vector)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email)'
    ];

    for (const indexSQL of indexes) {
      try {
        await sql.query(indexSQL);
        console.log('[Migration] Created index:', indexSQL.split(' ')[5]);
      } catch (error) {
        console.error('[Migration] Index creation failed:', error);
      }
    }
  },

  // Add full-text search support
  async createFullTextSearch() {
    try {
      await sql.query(`
        ALTER TABLE insights 
        ADD COLUMN IF NOT EXISTS search_vector tsvector
      `);

      await sql.query(`
        UPDATE insights 
        SET search_vector = to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(excerpt, ''))
      `);

      await sql.query(`
        CREATE OR REPLACE FUNCTION insights_search_trigger() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector = to_tsvector('english', NEW.title || ' ' || COALESCE(NEW.content, '') || ' ' || COALESCE(NEW.excerpt, ''));
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
      `);

      await sql.query(`
        DROP TRIGGER IF EXISTS insights_search_update ON insights;
        CREATE TRIGGER insights_search_update 
        BEFORE INSERT OR UPDATE ON insights 
        FOR EACH ROW EXECUTE FUNCTION insights_search_trigger();
      `);

      console.log('[Migration] Full-text search configured');
    } catch (error) {
      console.error('[Migration] Full-text search setup failed:', error);
    }
  }
};

export default optimizedDb;