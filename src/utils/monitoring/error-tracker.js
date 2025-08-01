/**
 * Error Tracking System
 * Comprehensive error tracking for Excel viewer and file operations
 */

import { sql } from '@vercel/postgres';

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categories
export const ErrorCategory = {
  FILE_UPLOAD: 'file_upload',
  FILE_DOWNLOAD: 'file_download',
  EXCEL_PARSING: 'excel_parsing',
  EXCEL_RENDER: 'excel_render',
  SECURITY: 'security',
  DATABASE: 'database',
  API: 'api',
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission'
};

export class ErrorTracker {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.errorQueue = [];
    this.isProcessing = false;
    
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  setupGlobalErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        category: ErrorCategory.EXCEL_RENDER,
        severity: ErrorSeverity.HIGH
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH
      });
    });
  }

  // Main error tracking method
  async trackError(errorData) {
    const error = this.normalizeError(errorData);
    
    // Add to queue
    this.errorQueue.push(error);
    
    // Process queue
    if (!this.isProcessing) {
      await this.processErrorQueue();
    }
    
    // Send critical errors immediately
    if (error.severity === ErrorSeverity.CRITICAL) {
      await this.sendCriticalAlert(error);
    }
    
    return error;
  }

  // Normalize error data
  normalizeError(errorData) {
    const normalized = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      category: errorData.category || ErrorCategory.EXCEL_RENDER,
      severity: errorData.severity || ErrorSeverity.MEDIUM,
      message: errorData.message || 'Unknown error',
      stack: errorData.stack || null,
      metadata: errorData.metadata || {},
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      ...this.getContextInfo()
    };

    // Sanitize sensitive data
    normalized.metadata = this.sanitizeMetadata(normalized.metadata);
    
    return normalized;
  }

  // Get context information
  getContextInfo() {
    const context = {
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'
    };

    if (typeof window !== 'undefined') {
      context.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      context.screen = {
        width: window.screen.width,
        height: window.screen.height
      };
      context.memory = performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null;
    }

    return context;
  }

  // Sanitize metadata to remove sensitive information
  sanitizeMetadata(metadata) {
    const sanitized = { ...metadata };
    const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'auth'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  // Process error queue
  async processErrorQueue() {
    if (this.errorQueue.length === 0 || this.isProcessing) return;
    
    this.isProcessing = true;
    const errors = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      // Batch insert errors
      await this.batchLogErrors(errors);
      
      // Group similar errors
      const groupedErrors = this.groupSimilarErrors(errors);
      
      // Check for error patterns
      await this.checkErrorPatterns(groupedErrors);
      
    } catch (error) {
      console.error('Failed to process error queue:', error);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errors);
    } finally {
      this.isProcessing = false;
    }
  }

  // Batch log errors to database
  async batchLogErrors(errors) {
    if (!this.isProduction || errors.length === 0) {
      // In development, just log to console
      errors.forEach(error => {
        console.error(`[${error.severity.toUpperCase()}] ${error.category}:`, error);
      });
      return;
    }

    try {
      const values = errors.map(error => [
        error.id,
        error.category,
        error.severity,
        error.message,
        error.stack,
        JSON.stringify(error.metadata),
        error.url,
        error.userAgent,
        JSON.stringify(error),
        error.timestamp
      ]);

      await sql`
        INSERT INTO error_logs (
          error_id,
          category,
          severity,
          message,
          stack_trace,
          metadata,
          url,
          user_agent,
          context,
          timestamp
        ) 
        SELECT * FROM UNNEST(
          ${values}::record[]
        ) AS t(
          error_id uuid,
          category text,
          severity text,
          message text,
          stack_trace text,
          metadata jsonb,
          url text,
          user_agent text,
          context jsonb,
          timestamp timestamp
        )
      `;
    } catch (dbError) {
      console.error('Failed to log errors to database:', dbError);
      // Fallback to external service
      await this.sendToExternalService(errors);
    }
  }

  // Group similar errors
  groupSimilarErrors(errors) {
    const groups = new Map();
    
    errors.forEach(error => {
      const key = `${error.category}-${error.message}`;
      if (!groups.has(key)) {
        groups.set(key, {
          category: error.category,
          message: error.message,
          count: 0,
          firstOccurrence: error.timestamp,
          lastOccurrence: error.timestamp,
          errors: []
        });
      }
      
      const group = groups.get(key);
      group.count++;
      group.lastOccurrence = error.timestamp;
      group.errors.push(error);
    });
    
    return Array.from(groups.values());
  }

  // Check for error patterns
  async checkErrorPatterns(groupedErrors) {
    for (const group of groupedErrors) {
      // Check for high frequency errors
      if (group.count >= 10) {
        await this.sendErrorPatternAlert({
          type: 'high_frequency',
          group,
          message: `High frequency error detected: ${group.message} (${group.count} occurrences)`
        });
      }
      
      // Check for critical category errors
      if (group.category === ErrorCategory.SECURITY || 
          group.errors.some(e => e.severity === ErrorSeverity.CRITICAL)) {
        await this.sendErrorPatternAlert({
          type: 'critical_category',
          group,
          message: `Critical error in ${group.category}: ${group.message}`
        });
      }
    }
  }

  // Send critical alert
  async sendCriticalAlert(error) {
    try {
      await fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          severity: 'critical',
          error,
          message: `Critical error: ${error.message}`
        })
      });
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }

  // Send error pattern alert
  async sendErrorPatternAlert(pattern) {
    try {
      await fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error_pattern',
          severity: 'warning',
          pattern,
          timestamp: new Date().toISOString()
        })
      });
    } catch (alertError) {
      console.error('Failed to send error pattern alert:', alertError);
    }
  }

  // Send to external service (fallback)
  async sendToExternalService(errors) {
    // This would integrate with Sentry, LogRocket, etc.
    console.error('Sending errors to external service:', errors);
  }

  // Generate unique error ID
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get error summary
  async getErrorSummary(timeRange = '24h', category = null) {
    try {
      const query = category ? 
        sql`
          SELECT 
            category,
            severity,
            COUNT(*) as count,
            COUNT(DISTINCT message) as unique_errors,
            MAX(timestamp) as last_occurrence
          FROM error_logs
          WHERE 
            timestamp > NOW() - INTERVAL ${timeRange}
            AND category = ${category}
          GROUP BY category, severity
          ORDER BY count DESC
        ` :
        sql`
          SELECT 
            category,
            severity,
            COUNT(*) as count,
            COUNT(DISTINCT message) as unique_errors,
            MAX(timestamp) as last_occurrence
          FROM error_logs
          WHERE timestamp > NOW() - INTERVAL ${timeRange}
          GROUP BY category, severity
          ORDER BY count DESC
        `;

      const result = await query;
      return result.rows;
    } catch (error) {
      console.error('Failed to get error summary:', error);
      return [];
    }
  }

  // Get top errors
  async getTopErrors(limit = 10, timeRange = '24h') {
    try {
      const result = await sql`
        SELECT 
          message,
          category,
          severity,
          COUNT(*) as count,
          MIN(timestamp) as first_occurrence,
          MAX(timestamp) as last_occurrence,
          ARRAY_AGG(DISTINCT url) as affected_urls
        FROM error_logs
        WHERE timestamp > NOW() - INTERVAL ${timeRange}
        GROUP BY message, category, severity
        ORDER BY count DESC
        LIMIT ${limit}
      `;

      return result.rows;
    } catch (error) {
      console.error('Failed to get top errors:', error);
      return [];
    }
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// Utility function for tracking Excel-specific errors
export const trackExcelError = (operation, error, metadata = {}) => {
  return errorTracker.trackError({
    category: ErrorCategory.EXCEL_PARSING,
    severity: ErrorSeverity.MEDIUM,
    message: `Excel ${operation} error: ${error.message}`,
    stack: error.stack,
    metadata: {
      operation,
      ...metadata
    }
  });
};

// React error boundary for Excel viewer
export class ExcelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    errorTracker.trackError({
      category: ErrorCategory.EXCEL_RENDER,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      stack: error.stack,
      metadata: {
        componentStack: errorInfo.componentStack,
        component: 'ExcelViewer'
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Excel Viewer Error
          </h2>
          <p className="text-gray-600 mb-4">
            An error occurred while rendering the Excel file.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}