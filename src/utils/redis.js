/**
 * @fileoverview Redis client configuration and utilities
 * @module utils/redis
 */

import Redis from 'ioredis';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Create Redis client with connection pooling and error handling
 */
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

// Redis event handlers
redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

/**
 * Cache key prefixes for different data types
 */
export const CacheKeys = {
  EXCEL_DATA: 'excel:data:',
  EXCEL_JOB: 'excel:job:',
  USER_SESSION: 'session:',
  RATE_LIMIT: 'ratelimit:',
  FILE_CHUNKS: 'chunks:',
  PROCESSING_LOCK: 'lock:process:'
};

/**
 * Default TTL values in seconds
 */
export const TTL = {
  EXCEL_DATA: 3600, // 1 hour
  JOB_STATUS: 86400, // 24 hours
  SESSION: 900, // 15 minutes
  FILE_CHUNKS: 3600, // 1 hour
  LOCK: 300 // 5 minutes
};

/**
 * Set value with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} [ttl] - Time to live in seconds
 * @returns {Promise<string>} Redis response
 */
export async function setCache(key, value, ttl) {
  try {
    const serialized = JSON.stringify(value);
    if (ttl) {
      return await redis.setex(key, ttl, serialized);
    }
    return await redis.set(key, serialized);
  } catch (error) {
    logger.error('Redis set error:', error);
    throw error;
  }
}

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
export async function getCache(key) {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
}

/**
 * Delete cached value
 * @param {string} key - Cache key
 * @returns {Promise<number>} Number of keys deleted
 */
export async function deleteCache(key) {
  try {
    return await redis.del(key);
  } catch (error) {
    logger.error('Redis delete error:', error);
    throw error;
  }
}

/**
 * Delete multiple keys by pattern
 * @param {string} pattern - Key pattern
 * @returns {Promise<number>} Number of keys deleted
 */
export async function deleteCacheByPattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    logger.error('Redis delete pattern error:', error);
    throw error;
  }
}

/**
 * Check if key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if key exists
 */
export async function exists(key) {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Redis exists error:', error);
    return false;
  }
}

/**
 * Set hash field
 * @param {string} key - Hash key
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @returns {Promise<number>} 1 if new field, 0 if updated
 */
export async function hset(key, field, value) {
  try {
    const serialized = JSON.stringify(value);
    return await redis.hset(key, field, serialized);
  } catch (error) {
    logger.error('Redis hset error:', error);
    throw error;
  }
}

/**
 * Get hash field
 * @param {string} key - Hash key
 * @param {string} field - Field name
 * @returns {Promise<any|null>} Field value or null
 */
export async function hget(key, field) {
  try {
    const value = await redis.hget(key, field);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    logger.error('Redis hget error:', error);
    return null;
  }
}

/**
 * Get all hash fields
 * @param {string} key - Hash key
 * @returns {Promise<Object>} Hash object
 */
export async function hgetall(key) {
  try {
    const hash = await redis.hgetall(key);
    const result = {};
    for (const [field, value] of Object.entries(hash)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value;
      }
    }
    return result;
  } catch (error) {
    logger.error('Redis hgetall error:', error);
    return {};
  }
}

/**
 * Increment counter
 * @param {string} key - Counter key
 * @param {number} [increment=1] - Increment value
 * @returns {Promise<number>} New counter value
 */
export async function incr(key, increment = 1) {
  try {
    return await redis.incrby(key, increment);
  } catch (error) {
    logger.error('Redis incr error:', error);
    throw error;
  }
}

/**
 * Set expiration on key
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<number>} 1 if timeout set, 0 if key doesn't exist
 */
export async function expire(key, ttl) {
  try {
    return await redis.expire(key, ttl);
  } catch (error) {
    logger.error('Redis expire error:', error);
    throw error;
  }
}

/**
 * Acquire distributed lock
 * @param {string} resource - Resource identifier
 * @param {number} [ttl=300] - Lock TTL in seconds
 * @returns {Promise<boolean>} True if lock acquired
 */
export async function acquireLock(resource, ttl = 300) {
  const lockKey = `${CacheKeys.PROCESSING_LOCK}${resource}`;
  const lockValue = Date.now().toString();
  
  try {
    const result = await redis.set(lockKey, lockValue, 'NX', 'EX', ttl);
    return result === 'OK';
  } catch (error) {
    logger.error('Redis lock error:', error);
    return false;
  }
}

/**
 * Release distributed lock
 * @param {string} resource - Resource identifier
 * @returns {Promise<void>}
 */
export async function releaseLock(resource) {
  const lockKey = `${CacheKeys.PROCESSING_LOCK}${resource}`;
  await deleteCache(lockKey);
}

/**
 * Publish message to channel
 * @param {string} channel - Channel name
 * @param {any} message - Message to publish
 * @returns {Promise<number>} Number of subscribers
 */
export async function publish(channel, message) {
  try {
    const serialized = JSON.stringify(message);
    return await redis.publish(channel, serialized);
  } catch (error) {
    logger.error('Redis publish error:', error);
    throw error;
  }
}

/**
 * Subscribe to channel
 * @param {string} channel - Channel name
 * @param {Function} callback - Message handler
 * @returns {Promise<void>}
 */
export async function subscribe(channel, callback) {
  const subscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  });

  await subscriber.subscribe(channel);
  
  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      try {
        const parsed = JSON.parse(message);
        callback(parsed);
      } catch (error) {
        logger.error('Redis message parse error:', error);
      }
    }
  });
  
  return subscriber;
}

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
export async function closeConnection() {
  await redis.quit();
}

export default redis;