# Monitoring Integration Guide

This document describes the comprehensive monitoring system implemented for the Zenith Capital Advisors investment platform, with a focus on Excel viewer and file system monitoring.

## Overview

The monitoring system provides real-time insights into:
- Performance metrics and bottlenecks
- Error tracking and patterns
- User behavior analytics
- System health and alerts
- Excel viewer specific metrics

## Architecture

### Core Components

1. **Performance Monitor** (`src/utils/monitoring/performance-monitor.js`)
   - Tracks operation duration and memory usage
   - Implements Performance Observer API
   - Automatic threshold violation detection
   - Real-time performance alerts

2. **Error Tracker** (`src/utils/monitoring/error-tracker.js`)
   - Comprehensive error capture and categorization
   - Error pattern detection
   - Severity-based routing
   - React Error Boundary integration

3. **User Analytics** (`src/utils/monitoring/user-analytics.js`)
   - Session-based event tracking
   - User journey analysis
   - Feature usage statistics
   - Engagement metrics

4. **Monitoring APIs**
   - `/api/monitoring/metrics` - Retrieve monitoring data
   - `/api/monitoring/alert` - Handle monitoring alerts
   - `/api/monitoring/init-monitoring-db` - Initialize database tables

5. **Admin Dashboard** (`src/pages/admin/monitoring.js`)
   - Real-time monitoring dashboard
   - Auto-refresh capability
   - Visual performance charts
   - Alert management

## Database Schema

The monitoring system uses the following PostgreSQL tables:

```sql
- performance_metrics     -- Performance data for all operations
- error_logs             -- Comprehensive error logging
- user_analytics         -- User interaction events
- user_journeys          -- Session-based user flows
- monitoring_alerts      -- System alerts and incidents
- incidents              -- Critical incident tracking
- error_patterns         -- Error pattern analysis
- performance_alerts     -- Performance threshold violations
```

## Integration with Excel Viewer

### Using the Monitoring Hook

```javascript
import { useMonitoring } from '@/components/ui/ExcelViewer/hooks/useMonitoring';

function ExcelComponent() {
  const monitoring = useMonitoring('ExcelViewer');

  // Track file operations
  const handleFileUpload = async (file) => {
    return monitoring.trackFileOperation('upload', {
      name: file.name,
      size: file.size,
      type: file.type
    }, async () => {
      // Your upload logic here
      return await uploadFile(file);
    });
  };

  // Track Excel operations
  const handleSheetSwitch = async (sheetIndex) => {
    return monitoring.trackExcelOperation('sheetSwitch', async () => {
      // Your sheet switch logic
      await switchToSheet(sheetIndex);
    }, { sheetIndex });
  };

  // Track user interactions
  const handleCellSelect = (cell) => {
    monitoring.trackUserInteraction(monitoring.EventType.CELL_SELECT, {
      cell,
      timestamp: Date.now()
    });
  };

  // Track render performance
  useEffect(() => {
    const renderStart = performance.now();
    // ... rendering logic ...
    monitoring.trackRenderPerformance({
      renderTime: performance.now() - renderStart,
      cellCount: 1000,
      sheetIndex: 0
    });
  }, [data]);

  // Track errors
  try {
    // risky operation
  } catch (error) {
    monitoring.trackError(error, {
      operation: 'cellCalculation',
      cell: 'A1'
    });
  }
}
```

### Performance Thresholds

Default thresholds (configurable in `performance-monitor.js`):
- File Upload: 5000ms
- File Download: 2000ms
- Excel Render: 3000ms
- Sheet Switch: 500ms
- Search: 1000ms
- Cell Selection: 100ms
- Formula Calculation: 2000ms
- Memory Warning: 100MB
- Memory Critical: 200MB

## Setting Up Monitoring

### 1. Initialize Database Tables

```bash
# Run the database initialization
curl -X POST https://your-domain.com/api/monitoring/init-monitoring-db
```

### 2. Configure Environment Variables

```env
# Alert email recipients (comma-separated)
ALERT_EMAIL_RECIPIENTS=admin@zencap.com,ops@zencap.com

# External monitoring service (optional)
EXTERNAL_MONITORING_URL=https://api.monitoring-service.com
EXTERNAL_MONITORING_API_KEY=your-api-key

# Alert webhook (optional)
ALERT_WEBHOOK_URL=https://your-webhook-url.com/alerts
```

### 3. Access the Monitoring Dashboard

Navigate to `/admin/monitoring` to access the real-time monitoring dashboard.

## Alert Configuration

### Alert Types

1. **Performance Alerts**
   - Triggered when operations exceed defined thresholds
   - Includes duration, memory usage, and context

2. **Error Alerts**
   - Categorized by severity (low, medium, high, critical)
   - Pattern detection for recurring errors

3. **Memory Alerts**
   - Warning level: >100MB usage
   - Critical level: >200MB usage

4. **Security Alerts**
   - File validation failures
   - Suspicious patterns
   - Access violations

### Alert Routing

- **Critical Alerts**: Email + External Service + Incident Creation
- **High Alerts**: Email + External Service
- **Medium/Warning**: Dashboard + Logging
- **Low**: Logging only

### Alert Throttling

To prevent alert spam:
- Performance: Max 5 alerts per 5 minutes
- Errors: Max 10 alerts per minute
- Memory: Max 3 alerts per 5 minutes
- Security: No throttling (all alerts sent)

## Monitoring Best Practices

### 1. Performance Optimization

Monitor these key metrics:
- P95 response times for all operations
- Memory usage trends
- Error rates and patterns
- User engagement metrics

### 2. Error Handling

- Wrap all async operations with monitoring
- Use appropriate error categories
- Include relevant context in error metadata
- Monitor error patterns for systemic issues

### 3. User Experience

Track user interactions to understand:
- Feature usage patterns
- Common user flows
- Pain points (high error areas)
- Performance impact on users

### 4. Proactive Monitoring

- Set up alerts for threshold violations
- Review monitoring dashboard daily
- Act on recommendations
- Monitor trends, not just current values

## API Response Examples

### Performance Metrics

```json
GET /api/monitoring/metrics?type=performance&timeRange=24h

{
  "success": true,
  "type": "performance",
  "timeRange": "24h",
  "data": {
    "metrics": [
      {
        "metric_name": "fileUpload",
        "component": "ExcelViewer",
        "count": 142,
        "avg_duration": 2341.5,
        "p50": 2100,
        "p95": 4500,
        "p99": 6200,
        "threshold_violations": 8,
        "performance_score": 82
      }
    ],
    "summary": {
      "total_operations": 1523,
      "avg_performance_score": 87.3,
      "critical_violations": 2
    }
  }
}
```

### Error Summary

```json
GET /api/monitoring/metrics?type=errors&timeRange=24h

{
  "success": true,
  "type": "errors",
  "data": {
    "top_errors": [
      {
        "message": "File size exceeds maximum allowed",
        "category": "file_upload",
        "severity": "medium",
        "count": 23,
        "first_occurrence": "2024-01-15T10:23:45Z",
        "last_occurrence": "2024-01-15T18:45:12Z"
      }
    ],
    "error_rate": {
      "total": 67,
      "critical": 2,
      "rate_per_hour": 2.79
    }
  }
}
```

## Troubleshooting

### High Memory Usage

1. Check for memory leaks in Excel processing
2. Review file size limits
3. Optimize data structures
4. Implement progressive loading

### Slow Performance

1. Review P95 metrics for bottlenecks
2. Check database query performance
3. Optimize Excel rendering
4. Implement caching strategies

### High Error Rates

1. Review top errors in dashboard
2. Check for pattern violations
3. Validate input data
4. Review error handling logic

## Future Enhancements

1. **Machine Learning Integration**
   - Anomaly detection
   - Predictive alerts
   - Auto-scaling recommendations

2. **Advanced Analytics**
   - Cohort analysis
   - Funnel visualization
   - A/B testing support

3. **Enhanced Visualizations**
   - Real-time graphs
   - Heat maps
   - Custom dashboards

4. **Integration Expansion**
   - Slack notifications
   - PagerDuty integration
   - Custom webhook support