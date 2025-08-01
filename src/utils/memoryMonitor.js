/**
 * @fileoverview Memory monitoring utility for Excel viewer
 * @module utils/memoryMonitor
 */

import { PRODUCTION_CONFIG } from '../config/production';

/**
 * Memory monitoring class
 */
export class MemoryMonitor {
  constructor(config = {}) {
    this.config = {
      ...PRODUCTION_CONFIG.memory,
      ...config
    };
    
    this.callbacks = {
      onWarning: null,
      onCritical: null,
      onUpdate: null
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.memoryHistory = [];
    this.maxHistoryLength = 60; // Keep last 60 measurements
  }

  /**
   * Start memory monitoring
   */
  start() {
    if (this.isMonitoring || !this.config.enabled) return;
    
    this.isMonitoring = true;
    this.checkMemory(); // Initial check
    
    this.monitoringInterval = setInterval(() => {
      this.checkMemory();
    }, this.config.checkInterval);
  }

  /**
   * Stop memory monitoring
   */
  stop() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check current memory usage
   */
  async checkMemory() {
    const memoryInfo = await this.getMemoryInfo();
    
    if (!memoryInfo) return;
    
    // Add to history
    this.memoryHistory.push({
      timestamp: Date.now(),
      ...memoryInfo
    });
    
    // Trim history
    if (this.memoryHistory.length > this.maxHistoryLength) {
      this.memoryHistory.shift();
    }
    
    // Trigger callbacks
    if (this.callbacks.onUpdate) {
      this.callbacks.onUpdate(memoryInfo);
    }
    
    // Check thresholds
    if (memoryInfo.usedJSHeapSize >= this.config.criticalThreshold) {
      this.handleCriticalMemory(memoryInfo);
    } else if (memoryInfo.usedJSHeapSize >= this.config.warningThreshold) {
      this.handleWarningMemory(memoryInfo);
    }
    
    // Suggest garbage collection if needed
    if (memoryInfo.usedJSHeapSize >= this.config.gcThreshold) {
      this.suggestGarbageCollection();
    }
  }

  /**
   * Get current memory information
   * @returns {Object|null} Memory information
   */
  async getMemoryInfo() {
    if (typeof window === 'undefined' || !window.performance?.memory) {
      return null;
    }
    
    const memory = window.performance.memory;
    
    return {
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }

  /**
   * Handle warning memory threshold
   * @param {Object} memoryInfo - Memory information
   */
  handleWarningMemory(memoryInfo) {
    console.warn('Memory usage warning:', {
      used: this.formatBytes(memoryInfo.usedJSHeapSize),
      threshold: this.formatBytes(this.config.warningThreshold),
      percentUsed: memoryInfo.percentUsed.toFixed(2) + '%'
    });
    
    if (this.callbacks.onWarning) {
      this.callbacks.onWarning(memoryInfo);
    }
  }

  /**
   * Handle critical memory threshold
   * @param {Object} memoryInfo - Memory information
   */
  handleCriticalMemory(memoryInfo) {
    console.error('Critical memory usage:', {
      used: this.formatBytes(memoryInfo.usedJSHeapSize),
      threshold: this.formatBytes(this.config.criticalThreshold),
      percentUsed: memoryInfo.percentUsed.toFixed(2) + '%'
    });
    
    if (this.callbacks.onCritical) {
      this.callbacks.onCritical(memoryInfo);
    }
  }

  /**
   * Suggest garbage collection
   */
  suggestGarbageCollection() {
    // Note: We can't force GC in JavaScript, but we can log and notify
    console.log('High memory usage detected. Consider clearing unused data.');
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('memory-gc-suggested', {
        detail: { memoryInfo: this.getLatestMemoryInfo() }
      }));
    }
  }

  /**
   * Get latest memory info from history
   * @returns {Object|null} Latest memory information
   */
  getLatestMemoryInfo() {
    return this.memoryHistory[this.memoryHistory.length - 1] || null;
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Memory statistics
   */
  getStatistics() {
    if (this.memoryHistory.length === 0) {
      return null;
    }
    
    const usedMemory = this.memoryHistory.map(m => m.usedJSHeapSize);
    
    return {
      current: this.getLatestMemoryInfo(),
      average: usedMemory.reduce((a, b) => a + b, 0) / usedMemory.length,
      min: Math.min(...usedMemory),
      max: Math.max(...usedMemory),
      trend: this.calculateTrend()
    };
  }

  /**
   * Calculate memory usage trend
   * @returns {string} Trend direction ('increasing', 'decreasing', 'stable')
   */
  calculateTrend() {
    if (this.memoryHistory.length < 3) {
      return 'stable';
    }
    
    const recent = this.memoryHistory.slice(-10);
    const firstHalf = recent.slice(0, 5).map(m => m.usedJSHeapSize);
    const secondHalf = recent.slice(5).map(m => m.usedJSHeapSize);
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (percentChange > 10) return 'increasing';
    if (percentChange < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Set callback for memory updates
   * @param {string} event - Event name ('warning', 'critical', 'update')
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    switch (event) {
      case 'warning':
        this.callbacks.onWarning = callback;
        break;
      case 'critical':
        this.callbacks.onCritical = callback;
        break;
      case 'update':
        this.callbacks.onUpdate = callback;
        break;
      default:
        console.warn(`Unknown event: ${event}`);
    }
  }

  /**
   * Export memory history
   * @returns {Array} Memory history
   */
  exportHistory() {
    return this.memoryHistory.map(entry => ({
      ...entry,
      formattedUsed: this.formatBytes(entry.usedJSHeapSize),
      formattedTotal: this.formatBytes(entry.totalJSHeapSize),
      formattedLimit: this.formatBytes(entry.jsHeapSizeLimit)
    }));
  }

  /**
   * Clear memory history
   */
  clearHistory() {
    this.memoryHistory = [];
  }
}

/**
 * Create singleton memory monitor instance
 */
let monitorInstance = null;

/**
 * Get or create memory monitor instance
 * @param {Object} config - Configuration options
 * @returns {MemoryMonitor} Memory monitor instance
 */
export function getMemoryMonitor(config = {}) {
  if (!monitorInstance) {
    monitorInstance = new MemoryMonitor(config);
  }
  return monitorInstance;
}

/**
 * React hook for memory monitoring
 * @param {Object} config - Configuration options
 * @returns {Object} Memory monitor API
 */
export function useMemoryMonitor(config = {}) {
  // Import React only when needed (for Next.js compatibility)
  const React = require('react');
  
  const [memoryInfo, setMemoryInfo] = React.useState(null);
  const [isWarning, setIsWarning] = React.useState(false);
  const [isCritical, setIsCritical] = React.useState(false);
  const monitorRef = React.useRef(null);
  
  React.useEffect(() => {
    const monitor = getMemoryMonitor(config);
    monitorRef.current = monitor;
    
    // Set up callbacks
    monitor.on('update', (info) => {
      setMemoryInfo(info);
    });
    
    monitor.on('warning', () => {
      setIsWarning(true);
      setIsCritical(false);
    });
    
    monitor.on('critical', () => {
      setIsWarning(false);
      setIsCritical(true);
    });
    
    // Start monitoring
    monitor.start();
    
    return () => {
      monitor.stop();
    };
  }, []);
  
  return {
    memoryInfo,
    isWarning,
    isCritical,
    statistics: monitorRef.current?.getStatistics(),
    formatBytes: monitorRef.current?.formatBytes.bind(monitorRef.current)
  };
}

export default {
  MemoryMonitor,
  getMemoryMonitor,
  useMemoryMonitor
};