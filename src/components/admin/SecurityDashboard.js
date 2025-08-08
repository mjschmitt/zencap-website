/**
 * @fileoverview Security Dashboard Component - Real-time Security Monitoring UI
 * @module components/admin/SecurityDashboard
 */

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  FireIcon,
  ClockIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

/**
 * Main Security Dashboard Component
 */
export default function SecurityDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/security/dashboard?metric=overview&range=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch security dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Real-time updates
  useEffect(() => {
    const fetchRealTimeStats = async () => {
      try {
        const response = await fetch('/api/security/dashboard?metric=realtime');
        if (response.ok) {
          const data = await response.json();
          setRealTimeStats(data.data);
        }
      } catch (err) {
        console.error('Real-time stats error:', err);
      }
    };

    // Initial fetch
    fetchRealTimeStats();
    
    // Update every 30 seconds
    const interval = setInterval(fetchRealTimeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <SecurityDashboardSkeleton />;
  }

  if (error) {
    return <SecurityDashboardError error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Real-time security monitoring and threat intelligence
                </p>
              </div>
            </div>
            
            {/* Real-time status indicator */}
            {realTimeStats && (
              <div className="flex items-center space-x-4">
                <SecurityStatusIndicator stats={realTimeStats.realtime} />
                <TimeRangeSelector 
                  value={timeRange} 
                  onChange={setTimeRange} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SecurityMetricCard
            title="Total Events"
            value={dashboardData?.overview?.totalEvents || 0}
            change={realTimeStats?.trends?.eventsTrend || '+0%'}
            icon={EyeIcon}
            color="blue"
          />
          
          <SecurityMetricCard
            title="Active Threats"
            value={realTimeStats?.realtime?.activeThreats || 0}
            change={realTimeStats?.trends?.threatTrend || '+0%'}
            icon={ExclamationTriangleIcon}
            color="red"
          />
          
          <SecurityMetricCard
            title="Blocked IPs"
            value={dashboardData?.overview?.eventsByThreatLevel?.high?.count || 0}
            change="+12%"
            icon={FireIcon}
            color="orange"
          />
          
          <SecurityMetricCard
            title="System Health"
            value="98.5%"
            change="+0.2%"
            icon={ShieldCheckIcon}
            color="green"
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'threats', name: 'Threat Intelligence', icon: FireIcon },
              { id: 'events', name: 'Security Events', icon: EyeIcon },
              { id: 'incidents', name: 'Incidents', icon: ExclamationTriangleIcon },
              { id: 'analytics', name: 'Analytics', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <OverviewTab data={dashboardData} realTime={realTimeStats} />
          )}
          {activeTab === 'threats' && (
            <ThreatIntelligenceTab timeRange={timeRange} />
          )}
          {activeTab === 'events' && (
            <SecurityEventsTab timeRange={timeRange} />
          )}
          {activeTab === 'incidents' && (
            <IncidentsTab timeRange={timeRange} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab data={dashboardData} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Security Status Indicator Component
 */
function SecurityStatusIndicator({ stats }) {
  const getStatusColor = () => {
    if (stats.seriousThreats > 5) return 'red';
    if (stats.seriousThreats > 2) return 'yellow';
    return 'green';
  };

  const statusColor = getStatusColor();
  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${statusColors[statusColor]} animate-pulse`}></div>
      <span className="text-sm text-gray-600">
        {stats.totalEvents} events • {stats.uniqueIPs} IPs • Live
      </span>
    </div>
  );
}

/**
 * Time Range Selector Component
 */
function TimeRangeSelector({ value, onChange }) {
  const ranges = [
    { value: '1h', label: '1H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' }
  ];

  return (
    <div className="flex rounded-md shadow-sm">
      {ranges.map((range, index) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-4 py-2 text-sm font-medium ${
            value === range.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } ${
            index === 0 
              ? 'rounded-l-md' 
              : index === ranges.length - 1 
                ? 'rounded-r-md' 
                : ''
          } border border-gray-300 -ml-px first:ml-0`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Security Metric Card Component
 */
function SecurityMetricCard({ title, value, change, icon: Icon, color }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    red: 'text-red-600 bg-red-100',
    orange: 'text-orange-600 bg-orange-100',
    green: 'text-green-600 bg-green-100'
  };

  const changeColor = change.startsWith('+') 
    ? (color === 'red' || color === 'orange' ? 'text-red-600' : 'text-green-600')
    : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center">
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
            <p className={`ml-2 text-sm ${changeColor}`}>{change}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Overview Tab Component
 */
function OverviewTab({ data, realTime }) {
  if (!data) return <div className="p-6">Loading overview...</div>;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Level Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Threat Level Distribution</h3>
          <div className="space-y-3">
            {Object.entries(data.overview.eventsByThreatLevel || {}).map(([level, info]) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getThreatLevelColor(level)}`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{level}</span>
                </div>
                <span className="text-sm text-gray-500">{info.count} events</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Top Security Events</h3>
          <div className="space-y-3">
            {data.topEvents?.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatEventType(event.eventType)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last: {new Date(event.lastOccurrence).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{event.count} times</span>
              </div>
            )) || <p className="text-sm text-gray-500">No events recorded</p>}
          </div>
        </div>

        {/* Geographic Threats */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Geographic Threat Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.geographicalThreats?.slice(0, 6).map((geo, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{geo.country}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(geo.riskLevel)}`}>
                    {geo.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {geo.threatCount} threats • Avg severity: {geo.averageSeverity}
                </p>
              </div>
            )) || <p className="text-sm text-gray-500">No geographic data available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Threat Intelligence Tab Component
 */
function ThreatIntelligenceTab({ timeRange }) {
  const [threatData, setThreatData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/security/dashboard?metric=threats&range=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setThreatData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch threat intelligence:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreatData();
  }, [timeRange]);

  if (loading) return <div className="p-6">Loading threat intelligence...</div>;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Threats */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Threat IPs</h3>
          <div className="space-y-3">
            {threatData?.topThreats?.slice(0, 10).map((threat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{threat.ip_address}</p>
                  <p className="text-xs text-gray-500">
                    Score: {threat.threat_score} • {threat.incident_count} incidents
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(threat.riskLevel)}`}>
                    {threat.riskLevel}
                  </span>
                  {threat.blocked && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            )) || <p className="text-sm text-gray-500">No threat data available</p>}
          </div>
        </div>

        {/* Threat Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Categories</h3>
          <div className="space-y-3">
            {threatData?.categoryStatistics?.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {category.category.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.ipCount} IPs • Avg score: {category.averageScore}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{category.totalIncidents} incidents</span>
              </div>
            )) || <p className="text-sm text-gray-500">No category data available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Security Events Tab Component
 */
function SecurityEventsTab({ timeRange }) {
  const [eventsData, setEventsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    threatLevel: ''
  });

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          metric: 'events',
          range: timeRange,
          ...filters
        });
        
        const response = await fetch(`/api/security/dashboard?${params}`);
        if (response.ok) {
          const data = await response.json();
          setEventsData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch security events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsData();
  }, [timeRange, filters]);

  if (loading) return <div className="p-6">Loading security events...</div>;

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={filters.eventType}
          onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="">All Event Types</option>
          <option value="login_failure">Login Failures</option>
          <option value="rate_limit_exceeded">Rate Limits</option>
          <option value="sql_injection_attempt">SQL Injections</option>
          <option value="file_upload_malicious">Malicious Uploads</option>
        </select>
        
        <select
          value={filters.threatLevel}
          onChange={(e) => setFilters(prev => ({ ...prev, threatLevel: e.target.value }))}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="">All Threat Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {eventsData?.events?.map((event, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getThreatLevelColor(event.threat_level)}`}>
                    {event.threat_level}
                  </span>
                  <h4 className="text-sm font-medium text-gray-900">
                    {formatEventType(event.event_type)}
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">IP:</span> {event.source_ip || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {event.timeAgo}
                  </div>
                  <div>
                    <span className="font-medium">Path:</span> {event.request_path || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    {event.isResolved ? 'Resolved' : 'Active'}
                  </div>
                </div>
              </div>
              
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View Details
              </button>
            </div>
          </div>
        )) || <p className="text-sm text-gray-500">No security events found</p>}
      </div>

      {/* Pagination */}
      {eventsData?.pagination && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {eventsData.pagination.totalEvents} events
          </p>
          <div className="flex space-x-2">
            {eventsData.pagination.hasPreviousPage && (
              <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                Previous
              </button>
            )}
            {eventsData.pagination.hasNextPage && (
              <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Incidents Tab Component
 */
function IncidentsTab({ timeRange }) {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Security Incidents</h3>
        <p className="text-gray-500">
          No active security incidents at this time. This is a good sign!
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Test Incident
        </button>
      </div>
    </div>
  );
}

/**
 * Analytics Tab Component
 */
function AnalyticsTab({ data }) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Trends */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Threat Trends</h3>
          <div className="space-y-3">
            {data?.threatTrends?.slice(0, 12).map((trend, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">
                  {new Date(trend.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-900">{trend.totalEvents} events</span>
                  <span className="text-sm text-red-600">{trend.seriousThreats} serious</span>
                  <span className="text-sm text-gray-500">{trend.threatRatio}% ratio</span>
                </div>
              </div>
            )) || <p className="text-sm text-gray-500">No trend data available</p>}
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monitoring Active</span>
              <span className="text-sm text-green-600">Yes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Threat Intelligence</span>
              <span className="text-sm text-green-600">Updated</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alert System</span>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
function SecurityDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-md"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Error Component
 */
function SecurityDashboardError({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load security dashboard
        </h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// Helper functions
function getThreatLevelColor(level) {
  const colors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };
  return colors[level] || 'bg-gray-500';
}

function getRiskLevelColor(level) {
  const colors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
}

function formatEventType(eventType) {
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}