// Enterprise-Scale Performance Optimizations for ZenCap
// Target: Support 1000+ concurrent users with sub-second response times
// Financial models platform scaling architecture

import { Redis } from 'ioredis';

export class ScaleOptimizer {
  constructor() {
    this.redisCluster = null;
    this.loadBalancer = null;
    this.circuitBreaker = new Map();
    this.rateLimiter = new Map();
    this.connectionPool = null;
    
    // Performance thresholds for scaling
    this.thresholds = {
      dbConnectionPool: 50,  // Max DB connections
      cacheHitRate: 85,      // Minimum cache hit rate (%)
      responseTime: 200,     // Max response time (ms)
      concurrentUsers: 1000, // Target concurrent users
      memoryUsage: 70,       // Max memory usage (%)
      cpuUsage: 80          // Max CPU usage (%)
    };
    
    // Scaling metrics
    this.metrics = {
      activeConnections: 0,
      requestsPerSecond: 0,
      cacheHitRate: 0,
      avgResponseTime: 0,
      errorRate: 0,
      memoryUsage: 0
    };

    this.initializeScalingComponents();
  }

  // Initialize enterprise scaling components
  async initializeScalingComponents() {
    await this.setupRedisCluster();
    this.setupConnectionPool();
    this.setupCircuitBreakers();
    this.setupRateLimiting();
    this.startMetricsCollection();
  }

  // Redis cluster for high-availability caching
  async setupRedisCluster() {
    if (!process.env.REDIS_CLUSTER_NODES) {
      console.warn('[ScaleOptimizer] Redis cluster not configured');
      return;
    }

    try {
      const nodes = process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port) };
      });

      this.redisCluster = new Redis.Cluster(nodes, {
        redisOptions: {
          password: process.env.REDIS_PASSWORD,
          connectTimeout: 10000,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
        },
        enableOfflineQueue: false,
        maxRetriesPerRequest: 2,
        retryDelayOnFailover: 200,
      });

      this.redisCluster.on('error', (error) => {
        console.error('[ScaleOptimizer] Redis cluster error:', error);
        this.triggerCircuitBreaker('redis');
      });

      console.log('[ScaleOptimizer] Redis cluster initialized');
    } catch (error) {
      console.error('[ScaleOptimizer] Redis cluster setup failed:', error);
    }
  }

  // Database connection pooling for high concurrency
  setupConnectionPool() {
    // Vercel Postgres handles pooling automatically
    // This is for future implementation with dedicated infrastructure
    this.connectionPool = {
      maxConnections: this.thresholds.dbConnectionPool,
      activeConnections: 0,
      waitingQueue: [],
      
      async getConnection() {
        if (this.activeConnections < this.maxConnections) {
          this.activeConnections++;
          return { id: Date.now(), active: true };
        }
        
        return new Promise((resolve) => {
          this.waitingQueue.push(resolve);
        });
      },
      
      releaseConnection(connection) {
        this.activeConnections--;
        if (this.waitingQueue.length > 0) {
          const waitingResolve = this.waitingQueue.shift();
          this.activeConnections++;
          waitingResolve({ id: Date.now(), active: true });
        }
      }
    };
  }

  // Circuit breaker pattern for resilience
  setupCircuitBreakers() {
    const services = ['database', 'redis', 'excel-processing', 'email'];
    
    services.forEach(service => {
      this.circuitBreaker.set(service, {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        failureCount: 0,
        successCount: 0,
        threshold: 5, // Failures before opening
        timeout: 30000, // 30s timeout before half-open
        lastFailure: null,
        
        async call(operation) {
          const breaker = this.circuitBreaker.get(service);
          
          if (breaker.state === 'OPEN') {
            if (Date.now() - breaker.lastFailure > breaker.timeout) {
              breaker.state = 'HALF_OPEN';
              breaker.successCount = 0;
            } else {
              throw new Error(`Circuit breaker OPEN for ${service}`);
            }
          }
          
          try {
            const result = await operation();
            
            if (breaker.state === 'HALF_OPEN') {
              breaker.successCount++;
              if (breaker.successCount >= 3) {
                breaker.state = 'CLOSED';
                breaker.failureCount = 0;
              }
            }
            
            return result;
          } catch (error) {
            breaker.failureCount++;
            breaker.lastFailure = Date.now();
            
            if (breaker.failureCount >= breaker.threshold) {
              breaker.state = 'OPEN';
            }
            
            throw error;
          }
        }
      });
    });
  }

  // Rate limiting to prevent abuse
  setupRateLimiting() {
    const limits = {
      'api-general': { requests: 100, window: 60000 }, // 100 req/min
      'api-excel': { requests: 10, window: 60000 },    // 10 Excel req/min
      'api-download': { requests: 5, window: 60000 },  // 5 downloads/min
      'contact-form': { requests: 3, window: 60000 },  // 3 submissions/min
    };

    Object.entries(limits).forEach(([key, limit]) => {
      this.rateLimiter.set(key, {
        ...limit,
        requests: new Map() // IP -> { count, resetTime }
      });
    });
  }

  // Check if request is within rate limit
  async checkRateLimit(type, clientIP) {
    const limiter = this.rateLimiter.get(type);
    if (!limiter) return true;

    const now = Date.now();
    const clientData = limiter.requests.get(clientIP) || { count: 0, resetTime: now + limiter.window };

    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + limiter.window;
    }

    if (clientData.count >= limiter.requests) {
      return false;
    }

    clientData.count++;
    limiter.requests.set(clientIP, clientData);
    return true;
  }

  // Trigger circuit breaker for a service
  triggerCircuitBreaker(service) {
    const breaker = this.circuitBreaker.get(service);
    if (breaker) {
      breaker.state = 'OPEN';
      breaker.lastFailure = Date.now();
      console.warn(`[ScaleOptimizer] Circuit breaker opened for ${service}`);
    }
  }

  // High-performance caching with clustering support
  async setCache(key, value, ttl = 300, options = {}) {
    const { compress = true, replicate = true } = options;
    
    try {
      let serializedValue = JSON.stringify(value);
      
      // Compress large values
      if (compress && serializedValue.length > 1024) {
        // Use compression library if available
        // serializedValue = await compress(serializedValue);
      }

      if (this.redisCluster) {
        await this.redisCluster.setex(key, ttl, serializedValue);
        
        // Replicate to multiple nodes for availability
        if (replicate) {
          const nodes = this.redisCluster.nodes('master');
          await Promise.allSettled(
            nodes.map(node => node.setex(`replica:${key}`, ttl, serializedValue))
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('[ScaleOptimizer] Cache set failed:', error);
      this.triggerCircuitBreaker('redis');
      return false;
    }
  }

  async getCache(key, options = {}) {
    const { useReplica = false } = options;
    
    try {
      const cacheKey = useReplica ? `replica:${key}` : key;
      
      if (this.redisCluster) {
        const value = await this.redisCluster.get(cacheKey);
        
        if (value) {
          this.metrics.cacheHitRate++;
          return JSON.parse(value);
        }
      }
      
      return null;
    } catch (error) {
      console.error('[ScaleOptimizer] Cache get failed:', error);
      
      // Try replica if main cache fails
      if (!useReplica) {
        return this.getCache(key, { useReplica: true });
      }
      
      return null;
    }
  }

  // Excel processing with load balancing
  async processExcelWithLoadBalancing(file, options = {}) {
    const workers = this.getAvailableWorkers();
    const selectedWorker = this.selectOptimalWorker(workers);
    
    if (!selectedWorker) {
      throw new Error('No available Excel processing workers');
    }

    const processingKey = `excel:${Date.now()}:${Math.random()}`;
    
    try {
      // Track processing start
      await this.setCache(`processing:${processingKey}`, {
        startTime: Date.now(),
        workerId: selectedWorker.id,
        status: 'processing'
      }, 3600); // 1 hour TTL

      const result = await selectedWorker.process(file, options);
      
      // Cache result for reuse
      if (result && options.cacheResult !== false) {
        const cacheKey = this.generateFileHash(file);
        await this.setCache(`excel:${cacheKey}`, result, 1800); // 30 min cache
      }

      return result;
    } catch (error) {
      await this.setCache(`processing:${processingKey}`, {
        startTime: Date.now(),
        workerId: selectedWorker.id,
        status: 'error',
        error: error.message
      }, 3600);

      throw error;
    }
  }

  // Get available workers with health check
  getAvailableWorkers() {
    // Mock implementation - replace with actual worker management
    return [
      { id: 'worker-1', cpuUsage: 45, memoryUsage: 60, activeJobs: 2 },
      { id: 'worker-2', cpuUsage: 30, memoryUsage: 40, activeJobs: 1 },
      { id: 'worker-3', cpuUsage: 70, memoryUsage: 80, activeJobs: 5 },
    ].filter(worker => 
      worker.cpuUsage < 80 && 
      worker.memoryUsage < 75 && 
      worker.activeJobs < 3
    );
  }

  // Select optimal worker based on current load
  selectOptimalWorker(workers) {
    if (workers.length === 0) return null;

    return workers.reduce((best, current) => {
      const bestScore = best.cpuUsage + best.memoryUsage + (best.activeJobs * 10);
      const currentScore = current.cpuUsage + current.memoryUsage + (current.activeJobs * 10);
      return currentScore < bestScore ? current : best;
    });
  }

  // Generate consistent file hash for caching
  generateFileHash(file) {
    // Simple hash based on file properties
    const hashString = `${file.size}-${file.lastModified}-${file.name}`;
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Auto-scaling triggers
  async checkScalingTriggers() {
    const currentMetrics = await this.collectCurrentMetrics();
    
    // Scale up triggers
    if (currentMetrics.cpuUsage > this.thresholds.cpuUsage ||
        currentMetrics.memoryUsage > this.thresholds.memoryUsage ||
        currentMetrics.avgResponseTime > this.thresholds.responseTime) {
      
      await this.triggerScaleUp(currentMetrics);
    }
    
    // Scale down triggers (cost optimization)
    if (currentMetrics.cpuUsage < 30 &&
        currentMetrics.memoryUsage < 40 &&
        currentMetrics.avgResponseTime < 100) {
      
      await this.triggerScaleDown(currentMetrics);
    }
  }

  // Collect real-time metrics
  async collectCurrentMetrics() {
    const metrics = {
      cpuUsage: this.getCPUUsage(),
      memoryUsage: this.getMemoryUsage(),
      activeConnections: this.connectionPool?.activeConnections || 0,
      avgResponseTime: this.metrics.avgResponseTime,
      errorRate: this.calculateErrorRate(),
      cacheHitRate: this.calculateCacheHitRate(),
      timestamp: Date.now()
    };

    // Store metrics for historical analysis
    await this.setCache(`metrics:${Date.now()}`, metrics, 86400); // 24h retention

    return metrics;
  }

  getCPUUsage() {
    // Mock implementation - replace with actual CPU monitoring
    return Math.random() * 100;
  }

  getMemoryUsage() {
    if (performance.memory) {
      return (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  calculateErrorRate() {
    const totalRequests = this.metrics.requestsPerSecond * 60; // Last minute
    const errors = this.metrics.errorRate || 0;
    return totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
  }

  calculateCacheHitRate() {
    // Implementation depends on cache metrics collection
    return this.metrics.cacheHitRate || 0;
  }

  // Trigger scale up operations
  async triggerScaleUp(metrics) {
    console.log('[ScaleOptimizer] Scaling up based on metrics:', metrics);
    
    // In a real implementation, this would:
    // 1. Increase server instances
    // 2. Add more database connections
    // 3. Scale Redis cluster
    // 4. Notify monitoring systems
    
    // For now, increase local thresholds
    this.thresholds.dbConnectionPool = Math.min(this.thresholds.dbConnectionPool * 1.2, 100);
    
    await this.setCache('scaling:last-up', Date.now(), 3600);
  }

  // Trigger scale down operations
  async triggerScaleDown(metrics) {
    console.log('[ScaleOptimizer] Scaling down based on metrics:', metrics);
    
    // Reduce resources gradually
    this.thresholds.dbConnectionPool = Math.max(this.thresholds.dbConnectionPool * 0.8, 20);
    
    await this.setCache('scaling:last-down', Date.now(), 3600);
  }

  // Start continuous metrics collection
  startMetricsCollection() {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectCurrentMetrics();
    }, 30000);

    // Check scaling triggers every 2 minutes
    setInterval(() => {
      this.checkScalingTriggers();
    }, 120000);

    // Cleanup old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  // Cleanup old metrics to save memory
  async cleanupOldMetrics() {
    try {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      
      if (this.redisCluster) {
        const keys = await this.redisCluster.keys('metrics:*');
        const keysToDelete = keys.filter(key => {
          const timestamp = parseInt(key.split(':')[1]);
          return timestamp < cutoff;
        });
        
        if (keysToDelete.length > 0) {
          await this.redisCluster.del(...keysToDelete);
          console.log(`[ScaleOptimizer] Cleaned up ${keysToDelete.length} old metric entries`);
        }
      }
    } catch (error) {
      console.error('[ScaleOptimizer] Metrics cleanup failed:', error);
    }
  }

  // Get scaling status and recommendations
  getScalingStatus() {
    return {
      currentMetrics: this.metrics,
      thresholds: this.thresholds,
      circuitBreakers: Array.from(this.circuitBreaker.entries()).map(([service, breaker]) => ({
        service,
        state: breaker.state,
        failureCount: breaker.failureCount
      })),
      rateLimits: Array.from(this.rateLimiter.entries()).map(([type, limiter]) => ({
        type,
        activeIPs: limiter.requests.size,
        requestLimit: limiter.requests
      })),
      recommendations: this.generateScalingRecommendations()
    };
  }

  // Generate scaling recommendations based on current state
  generateScalingRecommendations() {
    const recommendations = [];

    if (this.metrics.avgResponseTime > this.thresholds.responseTime) {
      recommendations.push({
        type: 'performance',
        action: 'scale-up',
        reason: 'Response time exceeds threshold',
        priority: 'high'
      });
    }

    if (this.metrics.errorRate > 5) {
      recommendations.push({
        type: 'reliability',
        action: 'investigate',
        reason: 'Error rate above 5%',
        priority: 'critical'
      });
    }

    if (this.metrics.cacheHitRate < this.thresholds.cacheHitRate) {
      recommendations.push({
        type: 'caching',
        action: 'optimize-cache',
        reason: 'Cache hit rate below target',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // Cleanup resources
  async cleanup() {
    if (this.redisCluster) {
      await this.redisCluster.disconnect();
    }
    
    // Clear all intervals and cleanup
    this.circuitBreaker.clear();
    this.rateLimiter.clear();
  }
}

// Export singleton instance
export const scaleOptimizer = new ScaleOptimizer();

// Export utility functions
export const checkRateLimit = (type, clientIP) => scaleOptimizer.checkRateLimit(type, clientIP);
export const processExcelScaled = (file, options) => scaleOptimizer.processExcelWithLoadBalancing(file, options);
export const getScalingMetrics = () => scaleOptimizer.getScalingStatus();
export const setCacheScaled = (key, value, ttl, options) => scaleOptimizer.setCache(key, value, ttl, options);
export const getCacheScaled = (key, options) => scaleOptimizer.getCache(key, options);

export default ScaleOptimizer;