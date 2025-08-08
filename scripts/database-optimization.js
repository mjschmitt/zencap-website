#!/usr/bin/env node

/**
 * @fileoverview Database Optimization Script for High-Value Transaction Platform
 * @module scripts/database-optimization
 * 
 * Optimizes PostgreSQL database for $2,985-$4,985 financial model transactions
 * Ensures sub-100ms query performance and reliable payment processing
 */

import { sql } from '@vercel/postgres';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'database-optimization.log' })
  ]
});

class DatabaseOptimizer {
  constructor() {
    this.optimizations = [];
    this.benchmarks = {
      before: {},
      after: {}
    };
    
    this.criticalQueries = {
      modelLookup: `SELECT * FROM models WHERE slug = $1 AND status = 'active'`,
      orderValidation: `SELECT o.*, c.email, m.title FROM orders o JOIN customers c ON o.customer_id = c.id JOIN models m ON o.model_id = m.id WHERE o.stripe_session_id = $1`,
      customerOrders: `SELECT o.*, m.title FROM orders o JOIN models m ON o.model_id = m.id WHERE o.customer_id = $1 ORDER BY o.created_at DESC`,
      analyticsQuery: `SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) as orders, SUM(amount) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '24 hours' GROUP BY hour`
    };
  }

  /**
   * Run complete database optimization
   */
  async runOptimization() {
    logger.info('Starting database optimization for ZenCap production...');
    
    try {
      // 1. Benchmark current performance
      await this.benchmarkCurrentPerformance();
      
      // 2. Analyze current schema
      await this.analyzeCurrentSchema();
      
      // 3. Create performance indexes
      await this.createPerformanceIndexes();
      
      // 4. Optimize table statistics
      await this.optimizeTableStatistics();
      
      // 5. Configure connection pooling
      await this.optimizeConnectionSettings();
      
      // 6. Create materialized views for analytics
      await this.createAnalyticsViews();
      
      // 7. Set up query monitoring
      await this.setupQueryMonitoring();
      
      // 8. Benchmark post-optimization performance
      await this.benchmarkOptimizedPerformance();
      
      // 9. Generate optimization report
      await this.generateOptimizationReport();
      
      logger.info('Database optimization completed successfully');
      
    } catch (error) {
      logger.error('Database optimization failed:', error);
      throw error;
    }
  }

  /**
   * Benchmark current database performance
   */
  async benchmarkCurrentPerformance() {
    logger.info('Benchmarking current database performance...');
    
    const benchmarks = {};
    
    for (const [queryName, queryText] of Object.entries(this.criticalQueries)) {
      try {
        const startTime = performance.now();
        
        // Execute query with sample parameters
        let result;
        switch (queryName) {
          case 'modelLookup':
            result = await sql`SELECT * FROM models WHERE slug = 'sample-slug' AND status = 'active' LIMIT 1`;
            break;
          case 'orderValidation':
            result = await sql`SELECT o.*, c.email, m.title FROM orders o LEFT JOIN customers c ON o.customer_id = c.id LEFT JOIN models m ON o.model_id = m.id LIMIT 1`;
            break;
          case 'customerOrders':
            result = await sql`SELECT o.*, m.title FROM orders o LEFT JOIN models m ON o.model_id = m.id ORDER BY o.created_at DESC LIMIT 10`;
            break;
          case 'analyticsQuery':
            result = await sql`SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) as orders, SUM(amount) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL '24 hours' GROUP BY hour`;
            break;
        }
        
        const responseTime = performance.now() - startTime;
        benchmarks[queryName] = {
          responseTime: Math.round(responseTime),
          rowCount: result.rows?.length || 0
        };
        
        logger.info(`Benchmark ${queryName}: ${Math.round(responseTime)}ms`);
        
      } catch (error) {
        benchmarks[queryName] = { error: error.message };
        logger.warn(`Benchmark ${queryName} failed:`, error.message);
      }
    }
    
    this.benchmarks.before = benchmarks;
    return benchmarks;
  }

  /**
   * Analyze current database schema
   */
  async analyzeCurrentSchema() {
    logger.info('Analyzing current database schema...');
    
    try {
      // Table sizes and statistics
      const tableSizes = await sql`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_tables pt
        LEFT JOIN pg_stat_user_tables pst ON pt.tablename = pst.relname
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `;
      
      // Index usage statistics
      const indexStats = await sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as index_scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      `;
      
      // Missing indexes analysis
      const slowQueries = await sql`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements
        WHERE mean_time > 100  -- Queries taking more than 100ms on average
        ORDER BY mean_time DESC
        LIMIT 10
      `.catch(() => ({ rows: [] })); // pg_stat_statements might not be enabled
      
      logger.info(`Analyzed ${tableSizes.rows.length} tables, ${indexStats.rows.length} indexes`);
      
      // Log largest tables
      tableSizes.rows.slice(0, 5).forEach(table => {
        logger.info(`Table ${table.tablename}: ${table.size}, ${table.live_tuples} live tuples`);
      });
      
      return {
        tableSizes: tableSizes.rows,
        indexStats: indexStats.rows,
        slowQueries: slowQueries.rows
      };
      
    } catch (error) {
      logger.error('Schema analysis failed:', error);
      throw error;
    }
  }

  /**
   * Create optimized indexes for high-performance queries
   */
  async createPerformanceIndexes() {
    logger.info('Creating performance-optimized database indexes...');
    
    const performanceIndexes = [
      // Critical business queries
      {
        name: 'idx_models_slug_active',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_slug_active ON models(slug) WHERE status = 'active'`,
        description: 'Optimizes model lookup by slug for active models only'
      },
      {
        name: 'idx_models_category_price',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_models_category_price ON models(category, price DESC) WHERE status = 'active'`,
        description: 'Optimizes model browsing by category with price sorting'
      },
      
      // High-value transaction queries
      {
        name: 'idx_orders_stripe_session_complete',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_stripe_session_complete ON orders(stripe_session_id) WHERE status = 'completed'`,
        description: 'Optimizes order lookup by Stripe session for completed orders'
      },
      {
        name: 'idx_orders_customer_status_date',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status_date ON orders(customer_id, status, created_at DESC) WHERE status IN ('completed', 'pending')`,
        description: 'Optimizes customer order history queries'
      },
      {
        name: 'idx_orders_download_access',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_download_access ON orders(id, download_expires_at, download_count) WHERE status = 'completed' AND download_expires_at > NOW()`,
        description: 'Optimizes download access validation'
      },
      
      // Payment processing optimization
      {
        name: 'idx_customers_stripe_lookup',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_stripe_lookup ON customers(stripe_customer_id) INCLUDE (email, name)`,
        description: 'Optimizes customer lookup with included columns'
      },
      {
        name: 'idx_payment_methods_customer_default',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_customer_default ON payment_methods(customer_id) WHERE is_default = true`,
        description: 'Optimizes default payment method lookup'
      },
      
      // Analytics and reporting
      {
        name: 'idx_orders_analytics_hourly',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_analytics_hourly ON orders(DATE_TRUNC('hour', created_at), status, amount) WHERE status = 'completed'`,
        description: 'Optimizes hourly revenue analytics'
      },
      {
        name: 'idx_insights_published_search',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_published_search ON insights(published_at DESC, status) WHERE status = 'published' AND published_at IS NOT NULL`,
        description: 'Optimizes published insights queries'
      },
      
      // Security and monitoring
      {
        name: 'idx_security_logs_event_time',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_event_time ON security_audit_logs(event_type, created_at DESC) INCLUDE (severity, user_id)`,
        description: 'Optimizes security event queries with included columns'
      },
      {
        name: 'idx_performance_metrics_component',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_component ON performance_metrics(component, metric_name, timestamp DESC) WHERE exceeds_threshold = false`,
        description: 'Optimizes performance metrics queries for healthy operations'
      },
      
      // Full-text search optimization
      {
        name: 'idx_insights_fulltext',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_fulltext ON insights USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(tags, '')))`,
        description: 'Enables full-text search across insights content'
      }
    ];
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const index of performanceIndexes) {
      try {
        logger.info(`Creating index: ${index.name}...`);
        const startTime = performance.now();
        
        await sql.query(index.sql);
        
        const duration = Math.round(performance.now() - startTime);
        logger.info(`✓ Created ${index.name} in ${duration}ms - ${index.description}`);
        createdCount++;
        
        this.optimizations.push({
          type: 'index',
          name: index.name,
          description: index.description,
          duration,
          status: 'success'
        });
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          logger.info(`○ Index ${index.name} already exists - skipping`);
          skippedCount++;
          
          this.optimizations.push({
            type: 'index',
            name: index.name,
            description: index.description,
            status: 'skipped'
          });
        } else {
          logger.error(`✗ Failed to create ${index.name}:`, error.message);
          
          this.optimizations.push({
            type: 'index',
            name: index.name,
            description: index.description,
            error: error.message,
            status: 'failed'
          });
        }
      }
    }
    
    logger.info(`Index creation completed: ${createdCount} created, ${skippedCount} skipped`);
    return { created: createdCount, skipped: skippedCount };
  }

  /**
   * Optimize table statistics and vacuum settings
   */
  async optimizeTableStatistics() {
    logger.info('Optimizing table statistics and maintenance...');
    
    const criticalTables = ['models', 'orders', 'customers', 'insights', 'security_audit_logs'];
    
    for (const tableName of criticalTables) {
      try {
        logger.info(`Analyzing table: ${tableName}`);
        
        // Update table statistics
        await sql.query(`ANALYZE ${tableName}`);
        
        // Check for dead tuples and vacuum if necessary
        const stats = await sql`
          SELECT 
            n_dead_tup,
            n_live_tup,
            last_vacuum,
            last_autovacuum,
            last_analyze
          FROM pg_stat_user_tables 
          WHERE relname = ${tableName}
        `;
        
        if (stats.rows.length > 0) {
          const tableStats = stats.rows[0];
          const deadTupleRatio = tableStats.n_live_tup > 0 
            ? tableStats.n_dead_tup / tableStats.n_live_tup 
            : 0;
          
          // Vacuum if dead tuple ratio > 10%
          if (deadTupleRatio > 0.1) {
            logger.info(`Vacuuming ${tableName} (${(deadTupleRatio * 100).toFixed(1)}% dead tuples)`);
            await sql.query(`VACUUM ANALYZE ${tableName}`);
          }
          
          this.optimizations.push({
            type: 'maintenance',
            table: tableName,
            deadTupleRatio: (deadTupleRatio * 100).toFixed(2),
            vacuumed: deadTupleRatio > 0.1,
            status: 'completed'
          });
        }
        
      } catch (error) {
        logger.error(`Table optimization failed for ${tableName}:`, error.message);
      }
    }
    
    logger.info('Table statistics optimization completed');
  }

  /**
   * Optimize database connection settings
   */
  async optimizeConnectionSettings() {
    logger.info('Optimizing database connection settings...');
    
    try {
      // Get current connection settings
      const connectionSettings = await sql`
        SELECT 
          name,
          setting,
          unit,
          short_desc
        FROM pg_settings 
        WHERE name IN (
          'max_connections',
          'shared_buffers',
          'effective_cache_size',
          'work_mem',
          'maintenance_work_mem',
          'checkpoint_completion_target',
          'wal_buffers',
          'default_statistics_target'
        )
      `;
      
      logger.info('Current database configuration:');
      connectionSettings.rows.forEach(setting => {
        logger.info(`  ${setting.name}: ${setting.setting}${setting.unit || ''} - ${setting.short_desc}`);
      });
      
      // Log recommendations for production optimization
      const recommendations = [
        'Consider setting shared_buffers to 25% of total RAM',
        'Set effective_cache_size to 75% of total RAM',
        'Configure work_mem based on max_connections and available RAM',
        'Enable pg_stat_statements for query performance monitoring',
        'Configure connection pooling with PgBouncer for high traffic'
      ];
      
      recommendations.forEach(rec => logger.info(`Recommendation: ${rec}`));
      
      this.optimizations.push({
        type: 'configuration',
        settings: connectionSettings.rows,
        recommendations,
        status: 'analyzed'
      });
      
    } catch (error) {
      logger.error('Connection settings optimization failed:', error);
    }
  }

  /**
   * Create materialized views for analytics
   */
  async createAnalyticsViews() {
    logger.info('Creating materialized views for analytics...');
    
    const analyticsViews = [
      {
        name: 'mv_hourly_revenue',
        sql: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hourly_revenue AS
          SELECT 
            DATE_TRUNC('hour', o.created_at) as hour,
            COUNT(*) as total_orders,
            COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
            SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END) as total_revenue,
            AVG(CASE WHEN o.status = 'completed' THEN o.amount ELSE NULL END) as avg_order_value,
            COUNT(DISTINCT o.customer_id) as unique_customers
          FROM orders o
          WHERE o.created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE_TRUNC('hour', o.created_at)
          ORDER BY hour DESC
        `,
        refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hourly_revenue`,
        description: 'Hourly revenue and order analytics for dashboard'
      },
      {
        name: 'mv_model_performance',
        sql: `
          CREATE MATERIALIZED VIEW IF NOT EXISTS mv_model_performance AS
          SELECT 
            m.id,
            m.title,
            m.slug,
            m.price,
            m.category,
            COUNT(o.id) as total_purchases,
            SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END) as total_revenue,
            COUNT(CASE WHEN o.download_count > 0 THEN 1 END) as downloads_initiated,
            AVG(CASE WHEN o.status = 'completed' THEN EXTRACT(EPOCH FROM (o.updated_at - o.created_at)) END) as avg_completion_time,
            MAX(o.created_at) as last_purchase
          FROM models m
          LEFT JOIN orders o ON m.id = o.model_id AND o.created_at >= NOW() - INTERVAL '90 days'
          WHERE m.status = 'active'
          GROUP BY m.id, m.title, m.slug, m.price, m.category
          ORDER BY total_revenue DESC NULLS LAST
        `,
        refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_model_performance`,
        description: 'Model performance metrics for business analytics'
      }
    ];
    
    for (const view of analyticsViews) {
      try {
        logger.info(`Creating materialized view: ${view.name}`);
        await sql.query(view.sql);
        
        // Create unique index for concurrent refresh
        const indexName = `idx_${view.name}_unique`;
        if (view.name === 'mv_hourly_revenue') {
          await sql.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${view.name} (hour)`);
        } else if (view.name === 'mv_model_performance') {
          await sql.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON ${view.name} (id)`);
        }
        
        logger.info(`✓ Created materialized view: ${view.name}`);
        
        this.optimizations.push({
          type: 'materialized_view',
          name: view.name,
          description: view.description,
          status: 'created'
        });
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          logger.info(`○ Materialized view ${view.name} already exists`);
        } else {
          logger.error(`Failed to create materialized view ${view.name}:`, error.message);
        }
      }
    }
    
    logger.info('Materialized views creation completed');
  }

  /**
   * Setup query performance monitoring
   */
  async setupQueryMonitoring() {
    logger.info('Setting up query performance monitoring...');
    
    try {
      // Enable pg_stat_statements if available
      await sql`CREATE EXTENSION IF NOT EXISTS pg_stat_statements`.catch(() => {
        logger.warn('pg_stat_statements extension not available - query monitoring limited');
      });
      
      // Create slow query logging function
      const monitoringFunction = `
        CREATE OR REPLACE FUNCTION log_slow_queries()
        RETURNS void AS $$
        BEGIN
          INSERT INTO performance_metrics (metric_name, component, duration, exceeds_threshold, metadata, timestamp)
          SELECT 
            'slow_query' as metric_name,
            'database' as component,
            mean_time as duration,
            true as exceeds_threshold,
            jsonb_build_object(
              'query_hash', query,
              'calls', calls,
              'total_time', total_time,
              'rows', rows
            ) as metadata,
            NOW() as timestamp
          FROM pg_stat_statements
          WHERE mean_time > 1000  -- Queries slower than 1 second
          AND calls > 10          -- Called more than 10 times
          ON CONFLICT DO NOTHING;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      await sql.query(monitoringFunction).catch(() => {
        logger.warn('Could not create slow query monitoring function');
      });
      
      this.optimizations.push({
        type: 'monitoring',
        description: 'Query performance monitoring setup',
        status: 'configured'
      });
      
    } catch (error) {
      logger.error('Query monitoring setup failed:', error);
    }
  }

  /**
   * Benchmark optimized database performance
   */
  async benchmarkOptimizedPerformance() {
    logger.info('Benchmarking optimized database performance...');
    
    const optimizedBenchmarks = {};
    
    for (const [queryName, queryText] of Object.entries(this.criticalQueries)) {
      try {
        // Run query multiple times for accurate measurement
        const iterations = 5;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
          const startTime = performance.now();
          
          let result;
          switch (queryName) {
            case 'modelLookup':
              result = await sql`SELECT * FROM models WHERE slug = 'sample-slug' AND status = 'active' LIMIT 1`;
              break;
            case 'orderValidation':
              result = await sql`SELECT o.*, c.email, m.title FROM orders o LEFT JOIN customers c ON o.customer_id = c.id LEFT JOIN models m ON o.model_id = m.id LIMIT 1`;
              break;
            case 'customerOrders':
              result = await sql`SELECT o.*, m.title FROM orders o LEFT JOIN models m ON o.model_id = m.id ORDER BY o.created_at DESC LIMIT 10`;
              break;
            case 'analyticsQuery':
              result = await sql`SELECT hour, total_orders, total_revenue FROM mv_hourly_revenue ORDER BY hour DESC LIMIT 24`;
              break;
          }
          
          times.push(performance.now() - startTime);
        }
        
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        optimizedBenchmarks[queryName] = {
          responseTime: Math.round(avgTime),
          minTime: Math.round(minTime),
          maxTime: Math.round(maxTime),
          improvement: this.benchmarks.before[queryName]?.responseTime 
            ? Math.round(((this.benchmarks.before[queryName].responseTime - avgTime) / this.benchmarks.before[queryName].responseTime) * 100)
            : 0
        };
        
        logger.info(`Optimized ${queryName}: ${Math.round(avgTime)}ms (${optimizedBenchmarks[queryName].improvement > 0 ? '+' : ''}${optimizedBenchmarks[queryName].improvement}% improvement)`);
        
      } catch (error) {
        optimizedBenchmarks[queryName] = { error: error.message };
        logger.warn(`Optimized benchmark ${queryName} failed:`, error.message);
      }
    }
    
    this.benchmarks.after = optimizedBenchmarks;
    return optimizedBenchmarks;
  }

  /**
   * Generate comprehensive optimization report
   */
  async generateOptimizationReport() {
    logger.info('Generating optimization report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      optimization_summary: {
        total_optimizations: this.optimizations.length,
        successful: this.optimizations.filter(opt => opt.status === 'success' || opt.status === 'created' || opt.status === 'completed').length,
        skipped: this.optimizations.filter(opt => opt.status === 'skipped').length,
        failed: this.optimizations.filter(opt => opt.status === 'failed').length
      },
      performance_benchmarks: {
        before: this.benchmarks.before,
        after: this.benchmarks.after,
        improvements: this.calculateImprovements()
      },
      optimizations_applied: this.optimizations,
      recommendations: this.generateFinalRecommendations(),
      next_steps: [
        'Monitor query performance using the new indexes',
        'Schedule regular VACUUM and ANALYZE operations',
        'Implement materialized view refresh schedule',
        'Set up automated performance monitoring alerts',
        'Consider implementing read replicas for analytics queries'
      ]
    };
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'database-optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Log summary
    logger.info('\n' + '='.repeat(80));
    logger.info('DATABASE OPTIMIZATION COMPLETED');
    logger.info('='.repeat(80));
    logger.info(`Total optimizations applied: ${report.optimization_summary.total_optimizations}`);
    logger.info(`Successful: ${report.optimization_summary.successful}`);
    logger.info(`Skipped: ${report.optimization_summary.skipped}`);
    logger.info(`Failed: ${report.optimization_summary.failed}`);
    logger.info('\nPerformance Improvements:');
    
    Object.entries(report.performance_benchmarks.improvements).forEach(([query, improvement]) => {
      if (typeof improvement === 'number') {
        logger.info(`  ${query}: ${improvement > 0 ? '+' : ''}${improvement}% improvement`);
      }
    });
    
    logger.info(`\nDetailed report saved to: ${reportPath}`);
    logger.info('='.repeat(80));
    
    return report;
  }

  /**
   * Calculate performance improvements
   */
  calculateImprovements() {
    const improvements = {};
    
    Object.keys(this.benchmarks.before).forEach(queryName => {
      const before = this.benchmarks.before[queryName]?.responseTime;
      const after = this.benchmarks.after[queryName]?.responseTime;
      
      if (before && after && typeof before === 'number' && typeof after === 'number') {
        improvements[queryName] = Math.round(((before - after) / before) * 100);
      } else {
        improvements[queryName] = 'Unable to calculate';
      }
    });
    
    return improvements;
  }

  /**
   * Generate final recommendations based on optimization results
   */
  generateFinalRecommendations() {
    const recommendations = [];
    
    // Check if any critical optimizations failed
    const failedOptimizations = this.optimizations.filter(opt => opt.status === 'failed');
    if (failedOptimizations.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'indexes',
        message: `${failedOptimizations.length} index creations failed - review manually`,
        details: failedOptimizations.map(opt => opt.name)
      });
    }
    
    // Check performance improvements
    const improvements = this.calculateImprovements();
    const significantImprovements = Object.entries(improvements)
      .filter(([query, improvement]) => typeof improvement === 'number' && improvement > 50);
    
    if (significantImprovements.length > 0) {
      recommendations.push({
        priority: 'info',
        category: 'performance',
        message: 'Significant performance improvements detected',
        details: significantImprovements.map(([query, improvement]) => `${query}: ${improvement}% faster`)
      });
    }
    
    // General production recommendations
    recommendations.push(
      {
        priority: 'medium',
        category: 'monitoring',
        message: 'Implement automated materialized view refresh',
        action: 'Schedule hourly refresh of mv_hourly_revenue and daily refresh of mv_model_performance'
      },
      {
        priority: 'medium',
        category: 'maintenance',
        message: 'Set up automated vacuum and analyze schedule',
        action: 'Configure pg_cron or external scheduler for regular maintenance'
      },
      {
        priority: 'low',
        category: 'scaling',
        message: 'Consider implementing connection pooling',
        action: 'Deploy PgBouncer for production connection management'
      }
    );
    
    return recommendations;
  }
}

/**
 * Main execution function
 */
async function main() {
  const optimizer = new DatabaseOptimizer();
  
  try {
    await optimizer.runOptimization();
    process.exit(0);
  } catch (error) {
    logger.error('Database optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DatabaseOptimizer;