/**
 * @fileoverview Advanced Connection Pool Optimization for High-Value Transactions
 * @module utils/connectionPoolOptimizer
 * 
 * Optimizes database connections for $2,985-$4,985 financial model transactions
 * Ensures reliable performance under high concurrent load
 */

import { sql } from '@vercel/postgres';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class ConnectionPoolOptimizer {
  constructor() {
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      poolHits: 0,
      poolMisses: 0,
      connectionErrors: 0,
      averageResponseTime: 0,
      slowQueries: 0
    };
    
    this.config = {
      maxConnections: 20,
      idleTimeout: 30000,
      connectionTimeout: 2000,
      slowQueryThreshold: 1000, // 1 second
      healthCheckInterval: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000
    };
    
    this.queryQueue = [];
    this.isInitialized = false;
    
    // Initialize monitoring
    this.initializeMonitoring();
  }

  /**
   * Initialize connection pool monitoring
   */
  initializeMonitoring() {
    // Health check interval
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    // Metrics logging
    setInterval(() => {
      this.logMetrics();
    }, 60000); // Every minute
  }

  /**
   * Execute query with connection pool optimization
   */
  async executeOptimizedQuery(queryText, params = [], options = {}) {
    const startTime = performance.now();
    const queryId = this.generateQueryId();
    
    try {
      // Queue management for high concurrency
      if (this.metrics.activeConnections >= this.config.maxConnections) {
        await this.waitForConnection();
      }

      this.metrics.activeConnections++;
      this.metrics.totalConnections++;

      // Execute query with retry mechanism
      const result = await this.executeWithRetry(queryText, params, queryId);
      
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, true);

      // Log slow queries
      if (responseTime > this.config.slowQueryThreshold) {
        this.logSlowQuery(queryText, params, responseTime, queryId);
        this.metrics.slowQueries++;
      }

      return result;

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, false);
      this.metrics.connectionErrors++;
      
      logger.error('Query execution failed:', {
        queryId,
        error: error.message,
        responseTime,
        query: queryText.substring(0, 100) + '...'
      });
      
      throw error;
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Execute query with retry mechanism
   */
  async executeWithRetry(queryText, params, queryId, attempt = 1) {
    try {
      const result = await sql.query(queryText, params);
      
      if (attempt > 1) {
        logger.info(`Query succeeded on attempt ${attempt}:`, { queryId });
      }
      
      return result;
      
    } catch (error) {
      if (attempt < this.config.retryAttempts && this.isRetryableError(error)) {
        logger.warn(`Query failed, retrying (attempt ${attempt + 1}):`, {
          queryId,
          error: error.message
        });
        
        await this.delay(this.config.retryDelay * attempt);
        return this.executeWithRetry(queryText, params, queryId, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Optimized queries for high-value transactions
   */
  async getFinancialModelTransaction(slug) {
    const query = `
      SELECT 
        m.id,
        m.title,
        m.slug,
        m.price,
        m.file_url,
        m.excel_url,
        COUNT(o.id) as purchase_count,
        AVG(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completion_rate
      FROM models m
      LEFT JOIN orders o ON m.id = o.model_id
      WHERE m.slug = $1 AND m.status = 'active'
      GROUP BY m.id, m.title, m.slug, m.price, m.file_url, m.excel_url
      LIMIT 1
    `;
    
    return this.executeOptimizedQuery(query, [slug], { 
      cache: true, 
      priority: 'high' 
    });
  }

  async getCustomerOrderHistory(customerId, limit = 10) {
    const query = `
      SELECT 
        o.id,
        o.stripe_session_id,
        o.amount,
        o.status,
        o.created_at,
        o.download_count,
        o.download_expires_at,
        m.title as model_title,
        m.slug as model_slug
      FROM orders o
      JOIN models m ON o.model_id = m.id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
      LIMIT $2
    `;
    
    return this.executeOptimizedQuery(query, [customerId, limit], {
      cache: true,
      priority: 'medium'
    });
  }

  async validatePaymentTransaction(sessionId) {
    const query = `
      SELECT 
        o.id,
        o.status,
        o.amount,
        o.download_expires_at,
        o.download_count,
        o.max_downloads,
        c.email,
        m.title,
        m.file_url
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN models m ON o.model_id = m.id
      WHERE o.stripe_session_id = $1
      AND o.status = 'completed'
      AND o.download_expires_at > NOW()
      AND o.download_count < o.max_downloads
    `;
    
    return this.executeOptimizedQuery(query, [sessionId], {
      priority: 'critical'
    });
  }

  /**
   * Wait for available connection
   */
  async waitForConnection(timeout = 5000) {
    const startTime = Date.now();
    
    while (this.metrics.activeConnections >= this.config.maxConnections) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Connection pool timeout: No connections available');
      }
      
      await this.delay(100);
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const startTime = performance.now();
      await sql`SELECT 1 as health_check`;
      const responseTime = performance.now() - startTime;
      
      logger.info('Database health check passed:', {
        responseTime: Math.round(responseTime),
        activeConnections: this.metrics.activeConnections,
        totalConnections: this.metrics.totalConnections
      });
      
    } catch (error) {
      logger.error('Database health check failed:', {
        error: error.message,
        activeConnections: this.metrics.activeConnections
      });
    }
  }

  /**
   * Update performance metrics
   */
  updateMetrics(responseTime, success) {
    if (success) {
      this.metrics.poolHits++;
    } else {
      this.metrics.poolMisses++;
    }
    
    // Update moving average response time
    const currentAvg = this.metrics.averageResponseTime;
    const totalQueries = this.metrics.poolHits + this.metrics.poolMisses;
    
    this.metrics.averageResponseTime = totalQueries > 1 
      ? ((currentAvg * (totalQueries - 1)) + responseTime) / totalQueries
      : responseTime;
  }

  /**
   * Log slow query for optimization
   */
  logSlowQuery(queryText, params, responseTime, queryId) {
    logger.warn('Slow query detected:', {
      queryId,
      responseTime: Math.round(responseTime),
      threshold: this.config.slowQueryThreshold,
      query: queryText.substring(0, 200) + '...',
      paramCount: params?.length || 0,
      recommendation: this.getOptimizationRecommendation(queryText)
    });
  }

  /**
   * Get optimization recommendation for slow queries
   */
  getOptimizationRecommendation(queryText) {
    const query = queryText.toLowerCase();
    
    if (query.includes('order by') && !query.includes('limit')) {
      return 'Consider adding LIMIT clause to ORDER BY queries';
    }
    
    if (query.includes('left join') && !query.includes('where')) {
      return 'Consider adding WHERE clause to filter JOIN results';
    }
    
    if (query.includes('count(*)') && !query.includes('where')) {
      return 'Consider adding WHERE clause to COUNT queries';
    }
    
    if (query.includes('like') && query.includes('%')) {
      return 'Consider using full-text search instead of LIKE with wildcards';
    }
    
    return 'Review query execution plan for optimization opportunities';
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'connection_failure'
    ];
    
    return retryableCodes.some(code => 
      error.message?.includes(code) || error.code === code
    );
  }

  /**
   * Generate unique query ID for tracking
   */
  generateQueryId() {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility delay function
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log performance metrics
   */
  logMetrics() {
    const hitRate = this.metrics.poolHits > 0 
      ? ((this.metrics.poolHits / (this.metrics.poolHits + this.metrics.poolMisses)) * 100).toFixed(2)
      : 0;

    logger.info('Connection pool metrics:', {
      totalConnections: this.metrics.totalConnections,
      activeConnections: this.metrics.activeConnections,
      hitRate: `${hitRate}%`,
      averageResponseTime: `${Math.round(this.metrics.averageResponseTime)}ms`,
      slowQueries: this.metrics.slowQueries,
      connectionErrors: this.metrics.connectionErrors
    });
  }

  /**
   * Get current metrics for monitoring
   */
  getMetrics() {
    const hitRate = this.metrics.poolHits > 0 
      ? (this.metrics.poolHits / (this.metrics.poolHits + this.metrics.poolMisses)) * 100
      : 0;

    return {
      ...this.metrics,
      hitRate,
      isHealthy: this.metrics.connectionErrors < 5 && this.metrics.averageResponseTime < 1000,
      recommendation: this.getPerformanceRecommendation()
    };
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendation() {
    const metrics = this.metrics;
    
    if (metrics.averageResponseTime > 1000) {
      return 'High response time detected - consider query optimization';
    }
    
    if (metrics.connectionErrors > 10) {
      return 'High connection error rate - check database connectivity';
    }
    
    if (metrics.slowQueries > 50) {
      return 'Multiple slow queries detected - review database indexes';
    }
    
    if (metrics.activeConnections / this.config.maxConnections > 0.8) {
      return 'Connection pool utilization high - consider scaling';
    }
    
    return 'Connection pool performance optimal';
  }
}

// Create singleton instance
const connectionOptimizer = new ConnectionPoolOptimizer();

// Export optimized functions
export const optimizedQuery = (queryText, params, options) => 
  connectionOptimizer.executeOptimizedQuery(queryText, params, options);

export const getFinancialModel = (slug) => 
  connectionOptimizer.getFinancialModelTransaction(slug);

export const getCustomerOrders = (customerId, limit) => 
  connectionOptimizer.getCustomerOrderHistory(customerId, limit);

export const validatePayment = (sessionId) => 
  connectionOptimizer.validatePaymentTransaction(sessionId);

export const getConnectionMetrics = () => 
  connectionOptimizer.getMetrics();

export default connectionOptimizer;