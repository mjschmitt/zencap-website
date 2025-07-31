# Production-Ready Excel Viewer Improvements

## Critical Improvements for Launch

### 1. Enhanced Error Handling with Retry Logic

```javascript
// utils/retryHandler.js
export class RetryHandler {
  constructor(maxRetries = 3, backoffMultiplier = 2) {
    this.maxRetries = maxRetries;
    this.backoffMultiplier = backoffMultiplier;
    this.baseDelay = 1000; // 1 second
  }

  async executeWithRetry(fn, context = {}) {
    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // Log retry attempt
        console.warn(`Retry attempt ${attempt + 1}/${this.maxRetries}`, {
          error: error.message,
          context
        });
        
        // Wait before retry
        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  isNonRetryableError(error) {
    // Don't retry these errors
    const nonRetryableMessages = [
      'File too large',
      'Invalid file format',
      'Unauthorized',
      'File not found'
    ];
    
    return nonRetryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
}

// Updated useExcelProcessor.js
import { RetryHandler } from '../utils/retryHandler';

export const useExcelProcessor = () => {
  const retryHandler = new RetryHandler();
  
  const loadWorkbook = useCallback(async (arrayBuffer) => {
    return retryHandler.executeWithRetry(async () => {
      const response = await sendMessage('LOAD_WORKBOOK', { arrayBuffer });
      return response.data;
    }, { operation: 'loadWorkbook' });
  }, [sendMessage]);
  
  // ... rest of the implementation
};
```

### 2. Memory Management and Monitoring

```javascript
// utils/memoryManager.js
export class MemoryManager {
  constructor(warningThreshold = 0.8, criticalThreshold = 0.9) {
    this.warningThreshold = warningThreshold;
    this.criticalThreshold = criticalThreshold;
    this.monitors = new Map();
  }

  startMonitoring(id, callback) {
    if (!performance.memory) {
      console.warn('Memory monitoring not available in this browser');
      return;
    }

    const monitor = setInterval(() => {
      const memoryInfo = this.getMemoryInfo();
      
      if (memoryInfo.usage > this.criticalThreshold) {
        callback({
          level: 'critical',
          message: 'Critical memory usage detected',
          ...memoryInfo
        });
      } else if (memoryInfo.usage > this.warningThreshold) {
        callback({
          level: 'warning',
          message: 'High memory usage detected',
          ...memoryInfo
        });
      }
    }, 5000); // Check every 5 seconds

    this.monitors.set(id, monitor);
  }

  stopMonitoring(id) {
    const monitor = this.monitors.get(id);
    if (monitor) {
      clearInterval(monitor);
      this.monitors.delete(id);
    }
  }

  getMemoryInfo() {
    if (!performance.memory) {
      return { available: false };
    }

    const used = performance.memory.usedJSHeapSize;
    const total = performance.memory.totalJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;

    return {
      used: used,
      total: total,
      limit: limit,
      usage: used / limit,
      usedMB: (used / 1024 / 1024).toFixed(2),
      totalMB: (total / 1024 / 1024).toFixed(2),
      limitMB: (limit / 1024 / 1024).toFixed(2)
    };
  }

  async cleanupIfNeeded() {
    const memoryInfo = this.getMemoryInfo();
    
    if (memoryInfo.usage > this.criticalThreshold) {
      // Force cleanup
      if (window.gc) {
        window.gc();
      }
      
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      return true;
    }
    
    return false;
  }
}

// Integration in ExcelJSViewer
const memoryManager = new MemoryManager();

useEffect(() => {
  memoryManager.startMonitoring('excel-viewer', (alert) => {
    if (alert.level === 'critical') {
      showToast('Low memory warning. Large files may not load properly.', 'warning');
      // Optionally reduce viewport size or clear cache
    }
  });

  return () => {
    memoryManager.stopMonitoring('excel-viewer');
  };
}, []);
```

### 3. File Size Validation and Limits

```javascript
// utils/fileSizeValidator.js
export const FILE_SIZE_LIMITS = {
  RECOMMENDED: 50 * 1024 * 1024,  // 50MB
  MAXIMUM: 100 * 1024 * 1024,     // 100MB
  WARNING: 75 * 1024 * 1024       // 75MB
};

export const validateFileSize = (fileSize) => {
  if (fileSize > FILE_SIZE_LIMITS.MAXIMUM) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${FILE_SIZE_LIMITS.MAXIMUM / 1024 / 1024}MB`,
      recommendation: 'Please use a smaller file or contact support for assistance.'
    };
  }

  if (fileSize > FILE_SIZE_LIMITS.WARNING) {
    return {
      valid: true,
      warning: `Large file detected (${(fileSize / 1024 / 1024).toFixed(1)}MB). Loading may be slow.`,
      recommendation: 'For best performance, use files under 50MB.'
    };
  }

  return { valid: true };
};

// Updated file loading in ExcelJSViewer
const loadExcelFile = async () => {
  try {
    // Check file size first
    const response = await fetch(file, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    
    if (contentLength) {
      const fileSize = parseInt(contentLength);
      const validation = validateFileSize(fileSize);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      if (validation.warning) {
        showToast(validation.warning, 'warning');
      }
    }
    
    // Proceed with loading
    // ...
  } catch (error) {
    // Handle errors
  }
};
```

### 4. Performance Analytics Integration

```javascript
// utils/performanceAnalytics.js
export class PerformanceAnalytics {
  constructor() {
    this.metrics = new Map();
  }

  trackFileLoad(fileName, fileSize, loadTime, success) {
    const metric = {
      event: 'excel_file_load',
      fileName,
      fileSize,
      loadTime,
      success,
      timestamp: Date.now(),
      browser: navigator.userAgent,
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    };

    // Send to analytics
    if (window.gtag) {
      gtag('event', 'excel_load', {
        event_category: 'performance',
        event_label: fileName,
        value: Math.round(loadTime),
        custom_map: {
          dimension1: fileSize,
          dimension2: success ? 'success' : 'failure'
        }
      });
    }

    // Store locally for debugging
    this.metrics.set(`${fileName}-${Date.now()}`, metric);

    // Send to monitoring service
    this.sendToMonitoring(metric);
  }

  trackError(error, context) {
    const errorMetric = {
      event: 'excel_error',
      error: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    };

    if (window.gtag) {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_category: 'excel_viewer',
        error_context: JSON.stringify(context)
      });
    }

    this.sendToMonitoring(errorMetric);
  }

  async sendToMonitoring(metric) {
    try {
      // Send to your monitoring endpoint
      await fetch('/api/monitoring/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  getPerformanceReport() {
    const metrics = Array.from(this.metrics.values());
    
    return {
      totalLoads: metrics.length,
      successRate: metrics.filter(m => m.success).length / metrics.length,
      averageLoadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length,
      errorRate: metrics.filter(m => !m.success).length / metrics.length,
      largeFileLoads: metrics.filter(m => m.fileSize > 50 * 1024 * 1024).length
    };
  }
}
```

### 5. Offline Support and Caching

```javascript
// utils/excelCache.js
export class ExcelCache {
  constructor() {
    this.dbName = 'ExcelViewerCache';
    this.version = 1;
    this.storeName = 'workbooks';
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  async cacheWorkbook(url, data, metadata) {
    await this.init();
    
    // Check cache size
    const currentSize = await this.getCacheSize();
    if (currentSize + data.byteLength > this.maxCacheSize) {
      await this.evictOldest();
    }
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return store.put({
      url,
      data,
      metadata,
      timestamp: Date.now(),
      size: data.byteLength
    });
  }

  async getCachedWorkbook(url) {
    await this.init();
    
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCacheSize() {
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      let totalSize = 0;
      const cursor = store.openCursor();
      
      cursor.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          totalSize += cursor.value.size;
          cursor.continue();
        } else {
          resolve(totalSize);
        }
      };
      
      cursor.onerror = () => reject(cursor.error);
    });
  }

  async evictOldest() {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('timestamp');
    
    const cursor = index.openCursor();
    cursor.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
      }
    };
  }
}

// Integration with Excel viewer
const excelCache = new ExcelCache();

const loadExcelFileWithCache = async (url) => {
  // Check cache first
  const cached = await excelCache.getCachedWorkbook(url);
  
  if (cached && navigator.onLine === false) {
    console.log('Loading from cache (offline mode)');
    return cached.data;
  }
  
  // Fetch from network
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Cache for offline use
    await excelCache.cacheWorkbook(url, arrayBuffer, {
      fileName: url.split('/').pop(),
      cachedAt: new Date().toISOString()
    });
    
    return arrayBuffer;
  } catch (error) {
    // Fallback to cache if network fails
    if (cached) {
      console.log('Network failed, using cached version');
      return cached.data;
    }
    throw error;
  }
};
```

### 6. Enhanced Security Measures

```javascript
// utils/securityValidator.js
export class SecurityValidator {
  constructor() {
    this.allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/vnd.ms-excel'
    ];
    
    this.forbiddenPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /<script/gi,
      /onclick=/gi,
      /onerror=/gi
    ];
  }

  async validateFile(file) {
    const validations = await Promise.all([
      this.validateMimeType(file),
      this.validateFileStructure(file),
      this.scanForMaliciousContent(file)
    ]);

    const failed = validations.filter(v => !v.valid);
    
    return {
      valid: failed.length === 0,
      errors: failed.map(v => v.error)
    };
  }

  validateMimeType(file) {
    const mimeType = file.type || 'application/octet-stream';
    const valid = this.allowedMimeTypes.includes(mimeType);
    
    return {
      valid,
      error: valid ? null : `Invalid file type: ${mimeType}`
    };
  }

  async validateFileStructure(file) {
    try {
      // Read first few bytes to check file signature
      const buffer = await file.slice(0, 8).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Check for ZIP signature (Excel files are ZIP archives)
      const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B;
      
      return {
        valid: isZip,
        error: isZip ? null : 'Invalid Excel file structure'
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate file structure'
      };
    }
  }

  async scanForMaliciousContent(file) {
    // Basic content scanning
    try {
      const text = await file.text();
      const hasMalicious = this.forbiddenPatterns.some(pattern => 
        pattern.test(text)
      );
      
      return {
        valid: !hasMalicious,
        error: hasMalicious ? 'Potentially malicious content detected' : null
      };
    } catch (error) {
      // Binary file, skip text scanning
      return { valid: true };
    }
  }

  sanitizeCellValue(value) {
    if (typeof value !== 'string') return value;
    
    // Remove potentially dangerous content
    let sanitized = value;
    this.forbiddenPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Escape HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    return sanitized;
  }
}
```

## Implementation Priority

### Phase 1: Critical (Before Launch)
1. ✅ File size validation and limits
2. ✅ Basic retry mechanism
3. ✅ Memory monitoring
4. ✅ Error tracking

### Phase 2: Important (First Week)
1. 📋 Performance analytics
2. 📋 Enhanced security validation
3. 📋 Offline caching
4. 📋 Advanced retry logic

### Phase 3: Nice to Have (First Month)
1. 📋 Streaming parser for 100MB+ files
2. 📋 WebAssembly optimization
3. 📋 Advanced memory management
4. 📋 Real-time collaboration features

## Monitoring Dashboard

```javascript
// Create a monitoring dashboard for production
const ExcelViewerMonitor = {
  metrics: {
    totalLoads: 0,
    successfulLoads: 0,
    failedLoads: 0,
    averageLoadTime: 0,
    largeFileLoads: 0,
    memoryWarnings: 0,
    errors: []
  },
  
  init() {
    // Expose to window for debugging
    if (process.env.NODE_ENV === 'development') {
      window.ExcelViewerMonitor = this;
    }
    
    // Set up periodic reporting
    setInterval(() => {
      this.reportMetrics();
    }, 60000); // Every minute
  },
  
  trackLoad(success, loadTime, fileSize) {
    this.metrics.totalLoads++;
    if (success) {
      this.metrics.successfulLoads++;
    } else {
      this.metrics.failedLoads++;
    }
    
    // Update average load time
    this.metrics.averageLoadTime = 
      (this.metrics.averageLoadTime * (this.metrics.totalLoads - 1) + loadTime) / 
      this.metrics.totalLoads;
    
    if (fileSize > 50 * 1024 * 1024) {
      this.metrics.largeFileLoads++;
    }
  },
  
  trackError(error, context) {
    this.metrics.errors.push({
      error: error.message,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }
  },
  
  trackMemoryWarning() {
    this.metrics.memoryWarnings++;
  },
  
  reportMetrics() {
    const report = {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      successRate: this.metrics.totalLoads > 0 
        ? (this.metrics.successfulLoads / this.metrics.totalLoads * 100).toFixed(2) + '%'
        : 'N/A'
    };
    
    console.log('[Excel Viewer Monitor]', report);
    
    // Send to analytics
    if (window.gtag) {
      gtag('event', 'excel_viewer_metrics', {
        event_category: 'monitoring',
        event_label: 'hourly_report',
        value: this.metrics.totalLoads
      });
    }
  }
};
```

## Deployment Checklist

- [ ] File size limits implemented and tested
- [ ] Retry mechanism active for network failures
- [ ] Memory monitoring in place
- [ ] Error tracking configured
- [ ] Performance metrics collection enabled
- [ ] Security validation active
- [ ] Offline support tested
- [ ] Analytics integration verified
- [ ] Monitoring dashboard accessible
- [ ] Production error alerts configured

These improvements ensure the Excel viewer is production-ready with robust error handling, performance monitoring, and security measures in place.