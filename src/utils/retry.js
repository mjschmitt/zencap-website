/**
 * @fileoverview Retry utility with exponential backoff
 * @module utils/retry
 */

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error) => {
    // Retry on network errors and timeouts
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'NetworkError',
      'TimeoutError',
      'AbortError'
    ];
    
    return retryableErrors.some(errType => 
      error.message?.includes(errType) || 
      error.code === errType ||
      error.name === errType
    );
  },
  onRetry: null // Optional callback for retry events
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} config - Retry configuration
 * @returns {Promise<*>} Result of successful function call
 */
export async function retry(fn, config = {}) {
  const options = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;
  let delay = options.initialDelay;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      // Call the function
      const result = await fn(attempt);
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt === options.maxAttempts || !options.shouldRetry(error)) {
        throw error;
      }
      
      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry({
          error,
          attempt,
          nextDelay: delay,
          retriesLeft: options.maxAttempts - attempt
        });
      }
      
      // Wait before next attempt
      await sleep(delay);
      
      // Calculate next delay with exponential backoff
      delay = Math.min(delay * options.backoffFactor, options.maxDelay);
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Retry wrapper for fetch requests
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryConfig - Retry configuration
 * @returns {Promise<Response>} Fetch response
 */
export async function retryFetch(url, options = {}, retryConfig = {}) {
  return retry(
    async (attempt) => {
      const controller = new AbortController();
      const timeout = options.timeout || 30000; // 30 seconds default
      
      // Set up timeout
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check for HTTP errors
        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          error.status = response.status;
          throw error;
        }
        
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Add attempt information to error
        error.attempt = attempt;
        throw error;
      }
    },
    {
      ...retryConfig,
      shouldRetry: (error) => {
        // Don't retry on 4xx errors (client errors)
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        
        // Use default retry logic for other errors
        return DEFAULT_RETRY_CONFIG.shouldRetry(error);
      }
    }
  );
}

/**
 * Retry wrapper for worker operations
 * @param {Function} workerOperation - Worker operation to retry
 * @param {Object} retryConfig - Retry configuration
 * @returns {Promise<*>} Result of worker operation
 */
export async function retryWorker(workerOperation, retryConfig = {}) {
  return retry(
    workerOperation,
    {
      ...retryConfig,
      shouldRetry: (error) => {
        // Retry on worker-specific errors
        const workerRetryableErrors = [
          'Worker timeout',
          'Worker not initialized',
          'Worker error',
          'Failed to load ExcelJS'
        ];
        
        const isWorkerError = workerRetryableErrors.some(errMsg => 
          error.message?.includes(errMsg)
        );
        
        return isWorkerError || DEFAULT_RETRY_CONFIG.shouldRetry(error);
      }
    }
  );
}

/**
 * Create a retry wrapper with custom configuration
 * @param {Object} config - Default configuration for the wrapper
 * @returns {Function} Retry function with preset configuration
 */
export function createRetryWrapper(config = {}) {
  return (fn, overrides = {}) => retry(fn, { ...config, ...overrides });
}

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff calculator
 * @param {number} attempt - Current attempt number (1-based)
 * @param {number} initialDelay - Initial delay in ms
 * @param {number} maxDelay - Maximum delay in ms
 * @param {number} factor - Backoff factor
 * @returns {number} Calculated delay in ms
 */
export function calculateBackoff(attempt, initialDelay = 1000, maxDelay = 10000, factor = 2) {
  const delay = initialDelay * Math.pow(factor, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Create a retry policy for specific error types
 * @param {Array<string>} errorTypes - Error types to retry
 * @returns {Function} Should retry function
 */
export function createRetryPolicy(errorTypes) {
  return (error) => {
    return errorTypes.some(type => 
      error.message?.includes(type) || 
      error.code === type ||
      error.name === type ||
      error.constructor?.name === type
    );
  };
}

export default {
  retry,
  retryFetch,
  retryWorker,
  createRetryWrapper,
  calculateBackoff,
  createRetryPolicy
};