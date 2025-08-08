/**
 * @fileoverview Real-Time Performance Dashboard Component
 * @module components/monitoring/RealTimePerformanceDashboard
 * 
 * CRITICAL PERFORMANCE MONITORING DASHBOARD
 * - Real-time Core Web Vitals display
 * - Performance alerts with severity indicators
 * - Bundle size tracking with visual indicators
 * - Excel viewer memory monitoring
 * - API response time tracking
 * - System health overview
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import performanceMonitor from '@/utils/monitoring/advanced-performance-monitor';

// Performance status indicator component
const StatusIndicator = ({ status, size = 'sm' }) => {
  const colors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    unknown: 'bg-gray-400'
  };
  
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`rounded-full ${colors[status]} ${sizes[size]} animate-pulse`} />
  );
};

// Metric card with real-time updates
const MetricCard = ({ title, value, unit, status, trend, threshold, icon: Icon }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 border-green-200 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'poor': return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const formatValue = (val) => {
    if (typeof val !== 'number') return val;
    if (val > 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toFixed(val < 10 ? 2 : 1);
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor(status)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-5 w-5" />}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <StatusIndicator status={status === 'good' ? 'healthy' : status === 'poor' ? 'critical' : 'warning'} />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">{formatValue(value)}</span>
          <span className="text-sm ml-1">{unit}</span>
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trend > 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      
      {threshold && (
        <div className="mt-2 text-xs opacity-75">
          Target: &lt;{formatValue(threshold)}{unit}
        </div>
      )}
    </div>
  );
};

// Alert item with severity and timestamp
const AlertItem = ({ alert, onDismiss }) => {
  const severityColors = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    critical: 'bg-red-200 text-red-900 border-red-300 animate-pulse'
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`p-3 rounded-lg border ${severityColors[alert.severity]} mb-2 transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">{alert.severity}</span>
            <span className="text-xs opacity-75">{alert.type}</span>
            <span className="text-xs opacity-75">{formatTime(alert.timestamp)}</span>
          </div>
          <p className="text-sm font-medium">{alert.message}</p>
          {alert.value && (
            <p className="text-xs opacity-75 mt-1">
              Value: {typeof alert.value === 'number' ? alert.value.toFixed(1) : alert.value}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert)}
            className="ml-2 text-xs opacity-50 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Core Web Vitals gauge component
const WebVitalGauge = ({ name, value, thresholds }) => {
  if (!thresholds) return null;
  
  const getStatus = (val) => {
    if (val <= thresholds.good) return 'good';
    if (val <= thresholds.needs_improvement) return 'needs-improvement';
    return 'poor';
  };
  
  const status = getStatus(value);
  const percentage = Math.min(100, (value / (thresholds.poor * 1.2)) * 100);
  
  const colors = {
    good: '#10b981',
    'needs-improvement': '#f59e0b',
    poor: '#ef4444'
  };

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={colors[status]}
            strokeWidth="8"
            fill="none"
            strokeDasharray={283}
            strokeDashoffset={283 - (283 * percentage) / 100}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs opacity-75">{name}</div>
          </div>
        </div>
      </div>
      <StatusIndicator status={status === 'good' ? 'healthy' : status === 'poor' ? 'critical' : 'warning'} size="md" />
    </div>
  );
};

// Performance timeline chart
const PerformanceTimeline = ({ data, metric }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw timeline
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = data.slice(-20); // Last 20 data points
    const maxValue = Math.max(...points.map(p => p.value));
    const minValue = Math.min(...points.map(p => p.value));
    const range = maxValue - minValue || 1;
    
    points.forEach((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Add current value indicator
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      const x = width - 10;
      const y = height - ((lastPoint.value - minValue) / range) * height;
      
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    
  }, [data, metric]);
  
  return (
    <div className="bg-gray-50 p-2 rounded">
      <canvas
        ref={canvasRef}
        width={200}
        height={50}
        className="w-full h-12"
      />
      <div className="text-xs text-center mt-1 text-gray-600">{metric} Timeline</div>
    </div>
  );
};

export default function RealTimePerformanceDashboard({ 
  isVisible = true, 
  position = 'bottom-right',
  onToggle 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ score: 0, status: 'unknown' });
  const [lastUpdate, setLastUpdate] = useState(null);
  const updateInterval = useRef(null);

  // Position classes
  const positions = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Update metrics from performance monitor
  const updateMetrics = useCallback(() => {
    const currentMetrics = performanceMonitor.getMetricsSummary();
    const recentAlerts = performanceMonitor.getRecentAlerts(5); // Last 5 minutes
    
    setMetrics(currentMetrics);
    setAlerts(recentAlerts);
    setLastUpdate(Date.now());
    
    // Calculate system health
    const health = performanceMonitor.calculateSystemHealth();
    setSystemHealth(health);
  }, []);

  // Set up real-time updates
  useEffect(() => {
    if (!isVisible) return;

    // Initial update
    updateMetrics();
    
    // Set up interval for updates every 5 seconds
    updateInterval.current = setInterval(updateMetrics, 5000);
    
    // Set up performance monitor alert handler
    const handleAlert = (alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    };
    
    performanceMonitor.addAlertHandler(handleAlert);
    
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [isVisible, updateMetrics]);

  // Dismiss alert
  const dismissAlert = useCallback((alertToDismiss) => {
    setAlerts(prev => prev.filter(alert => alert !== alertToDismiss));
  }, []);

  if (!isVisible) return null;

  // Get current Web Vitals
  const lcp = metrics.vital_LCP?.value || 0;
  const inp = metrics.vital_INP?.value || metrics.vital_FID?.value || 0;
  const cls = metrics.vital_CLS?.value || 0;
  
  // Get thresholds
  const thresholds = performanceMonitor.thresholds;

  return (
    <div className={`fixed ${positions[position]} z-50`}>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`mb-2 p-3 rounded-full shadow-lg transition-all duration-300 ${
          systemHealth.status === 'healthy' ? 'bg-green-500 hover:bg-green-600' :
          systemHealth.status === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
          'bg-red-500 hover:bg-red-600'
        } text-white`}
        title={`System Health: ${systemHealth.score}% (${systemHealth.status})`}
      >
        <BoltIcon className="h-6 w-6" />
        {alerts.filter(a => a.severity === 'critical' || a.severity === 'error').length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            {alerts.filter(a => a.severity === 'critical' || a.severity === 'error').length}
          </div>
        )}
      </button>

      {/* Performance dashboard panel */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Performance Monitor</h3>
              <div className="flex items-center space-x-2">
                <StatusIndicator 
                  status={systemHealth.status === 'healthy' ? 'healthy' : 
                         systemHealth.status === 'warning' ? 'warning' : 'critical'} 
                  size="lg" 
                />
                <span className="text-sm font-medium">{systemHealth.score}%</span>
                {onToggle && (
                  <button
                    onClick={onToggle}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            {lastUpdate && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Core Web Vitals */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3 flex items-center">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Core Web Vitals
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <WebVitalGauge 
                name="LCP" 
                value={Math.round(lcp)} 
                thresholds={thresholds.LCP} 
              />
              <WebVitalGauge 
                name="INP" 
                value={Math.round(inp)} 
                thresholds={thresholds.INP} 
              />
              <WebVitalGauge 
                name="CLS" 
                value={cls.toFixed(3)} 
                thresholds={thresholds.CLS} 
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-sm mb-3 flex items-center">
              <CpuChipIcon className="h-4 w-4 mr-2" />
              System Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Memory"
                value={metrics.memory_usage?.value || 0}
                unit="MB"
                status={metrics.memory_usage?.value > thresholds.MEMORY_USAGE.poor ? 'poor' : 'good'}
                threshold={thresholds.MEMORY_USAGE.good}
                icon={CpuChipIcon}
              />
              <MetricCard
                title="API Avg"
                value={Object.values(metrics)
                  .filter(m => typeof m === 'object' && m.endpoint)
                  .reduce((sum, m) => sum + (m.value || 0), 0) / Math.max(1, Object.keys(metrics).filter(k => k.startsWith('api_')).length)}
                unit="ms"
                status="good"
                threshold={thresholds.API_RESPONSE.good}
                icon={ClockIcon}
              />
            </div>
          </div>

          {/* Excel Viewer Metrics */}
          {(metrics.excel_load_time || metrics.excel_resource_timing) && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <DocumentIcon className="h-4 w-4 mr-2" />
                Excel Viewer
              </h4>
              <div className="space-y-2">
                {metrics.excel_load_time && (
                  <MetricCard
                    title="Load Time"
                    value={metrics.excel_load_time.value}
                    unit="ms"
                    status={metrics.excel_load_time.rating}
                    threshold={thresholds.EXCEL_LOAD.good}
                  />
                )}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="p-4 max-h-48 overflow-y-auto">
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                Active Alerts ({alerts.length})
              </h4>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert, index) => (
                  <AlertItem
                    key={index}
                    alert={alert}
                    onDismiss={dismissAlert}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No alerts message */}
          {alerts.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No performance alerts</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}