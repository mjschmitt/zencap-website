/**
 * Admin Dashboard - Monitoring Page
 * Real-time monitoring dashboard for Excel viewer and file systems
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ArrowTrendingUpIcon,
  DocumentIcon,
  UserGroupIcon,
  ServerIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Time range options
const TIME_RANGES = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' }
];

// Metric card component
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, status = 'normal' }) => {
  const statusColors = {
    normal: 'border-gray-200',
    warning: 'border-yellow-400 bg-yellow-50',
    error: 'border-red-400 bg-red-50',
    success: 'border-green-400 bg-green-50'
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${statusColors[status]} p-6 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  );
};

// Alert item component
const AlertItem = ({ alert }) => {
  const severityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    warning: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900 animate-pulse'
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded">
      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${severityColors[alert.severity]}`}>
            {alert.severity.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">{alert.type}</span>
        </div>
        <p className="text-sm text-gray-900 mt-1">{alert.message}</p>
      </div>
    </div>
  );
};

// Performance chart component
const PerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No performance data available</div>;
  }

  const maxDuration = Math.max(...data.map(d => d.p95));
  
  return (
    <div className="space-y-4">
      {data.map((metric, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{metric.metric_name}</span>
            <span className="text-gray-500">{metric.count} ops</span>
          </div>
          <div className="relative">
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(metric.avg_duration / maxDuration) * 100}%` }}
              />
              <div 
                className="absolute top-0 h-full bg-orange-500 rounded-full opacity-50"
                style={{ 
                  left: `${(metric.avg_duration / maxDuration) * 100}%`,
                  width: `${((metric.p95 - metric.avg_duration) / maxDuration) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Avg: {metric.avg_duration.toFixed(0)}ms</span>
              <span>P95: {metric.p95.toFixed(0)}ms</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MonitoringDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [data, setData] = useState({
    summary: null,
    performance: null,
    errors: null,
    analytics: null,
    excel: null,
    alerts: []
  });

  // Fetch monitoring data
  const fetchMonitoringData = useCallback(async () => {
    try {
      const response = await fetch(`/api/monitoring/metrics?type=summary&timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch monitoring data');
      
      const result = await response.json();
      setData(prevData => ({
        ...prevData,
        summary: result.data.overview,
        alerts: result.data.alerts || [],
        recommendations: result.data.recommendations || []
      }));

      // Fetch detailed metrics
      const [perfResponse, errorResponse, analyticsResponse, excelResponse] = await Promise.all([
        fetch(`/api/monitoring/metrics?type=performance&timeRange=${timeRange}`),
        fetch(`/api/monitoring/metrics?type=errors&timeRange=${timeRange}&limit=10`),
        fetch(`/api/monitoring/metrics?type=analytics&timeRange=${timeRange}`),
        fetch(`/api/monitoring/metrics?type=excel&timeRange=${timeRange}`)
      ]);

      const [perfData, errorData, analyticsData, excelData] = await Promise.all([
        perfResponse.json(),
        errorResponse.json(),
        analyticsResponse.json(),
        excelResponse.json()
      ]);

      setData({
        summary: result.data.overview,
        performance: perfData.data,
        errors: errorData.data,
        analytics: analyticsData.data,
        excel: excelData.data,
        alerts: result.data.alerts || [],
        recommendations: result.data.recommendations || []
      });

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Set up auto-refresh
  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchMonitoringData, autoRefresh]);

  // Calculate health status
  const getHealthStatus = (score) => {
    if (score >= 90) return { status: 'success', label: 'Healthy' };
    if (score >= 70) return { status: 'warning', label: 'Warning' };
    return { status: 'error', label: 'Critical' };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading monitoring data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const systemHealth = data.summary ? getHealthStatus(data.summary.system_health) : { status: 'normal', label: 'Unknown' };
  const excelHealth = data.summary ? getHealthStatus(data.summary.excel_health) : { status: 'normal', label: 'Unknown' };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <div className="flex items-center space-x-4">
            {/* Time range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {TIME_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-4 py-2 rounded-md ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>

            {/* Manual refresh */}
            <button
              onClick={fetchMonitoringData}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Overview metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="System Health"
            value={`${data.summary?.system_health || 0}%`}
            subtitle={systemHealth.label}
            icon={ServerIcon}
            status={systemHealth.status}
          />
          <MetricCard
            title="Excel Viewer Health"
            value={`${data.summary?.excel_health || 0}%`}
            subtitle={excelHealth.label}
            icon={DocumentIcon}
            status={excelHealth.status}
          />
          <MetricCard
            title="Error Rate"
            value={data.errors?.error_rate?.rate_per_hour?.toFixed(1) || '0'}
            subtitle="Errors per hour"
            icon={ExclamationTriangleIcon}
            status={data.errors?.error_rate?.critical > 0 ? 'error' : 'normal'}
          />
          <MetricCard
            title="Active Users"
            value={data.analytics?.engagement_metrics?.unique_users || '0'}
            subtitle="Unique users"
            icon={UserGroupIcon}
            trend={10}
          />
        </div>

        {/* Alerts section */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            </div>
            <div className="divide-y">
              {data.alerts.map((alert, index) => (
                <AlertItem key={index} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance metrics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
            </div>
            <div className="p-6">
              {data.performance?.metrics && (
                <PerformanceChart data={data.performance.metrics.slice(0, 5)} />
              )}
            </div>
          </div>

          {/* Error summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Top Errors</h2>
            </div>
            <div className="p-6">
              {data.errors?.top_errors && data.errors.top_errors.length > 0 ? (
                <div className="space-y-3">
                  {data.errors.top_errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-gray-900 truncate">{error.message}</p>
                        <p className="text-xs text-gray-500">{error.category}</p>
                      </div>
                      <span className="text-sm font-medium text-red-600">{error.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No errors in this time range</p>
              )}
            </div>
          </div>

          {/* Excel viewer stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Excel Viewer Usage</h2>
            </div>
            <div className="p-6">
              {data.excel?.usage_stats && data.excel.usage_stats.length > 0 ? (
                <div className="space-y-3">
                  {data.excel.usage_stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.event_type.replace('excel_', '').replace('_', ' ')}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                        {stat.avg_duration > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            {stat.avg_duration.toFixed(0)}ms avg
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No Excel viewer activity</p>
              )}
            </div>
          </div>

          {/* User analytics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">User Analytics</h2>
            </div>
            <div className="p-6">
              {data.analytics?.engagement_metrics ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="text-sm font-medium">{data.analytics.engagement_metrics.total_events}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Events per Session</span>
                    <span className="text-sm font-medium">{data.analytics.engagement_metrics.events_per_session.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Events per User</span>
                    <span className="text-sm font-medium">{data.analytics.engagement_metrics.events_per_user.toFixed(1)}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Engagement Score</span>
                      <span className="text-lg font-bold text-blue-600">
                        {data.analytics.engagement_metrics.engagement_score.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">No analytics data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}