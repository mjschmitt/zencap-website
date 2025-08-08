// Executive Analytics Dashboard for ZenCap
// Comprehensive real-time analytics with KPIs, conversion tracking, and business intelligence

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, RadialBarChart, RadialBar
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Users, DollarSign, 
         Eye, MousePointer, ShoppingCart, Target, Award, Activity } from 'lucide-react';

const ExecutiveAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({});

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchRealTimeUpdates();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/executive-dashboard?range=${dateRange}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeUpdates = async () => {
    try {
      const response = await fetch('/api/analytics/real-time-stats');
      const data = await response.json();
      setRealTimeData(data);
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!dashboardData) return {};

    return {
      totalRevenue: dashboardData.revenue?.total || 0,
      revenueGrowth: dashboardData.revenue?.growth || 0,
      totalLeads: dashboardData.leads?.total || 0,
      leadsGrowth: dashboardData.leads?.growth || 0,
      conversionRate: dashboardData.conversion?.rate || 0,
      conversionGrowth: dashboardData.conversion?.growth || 0,
      avgOrderValue: dashboardData.revenue?.avgOrderValue || 0,
      aovGrowth: dashboardData.revenue?.aovGrowth || 0,
      activeUsers: dashboardData.users?.active || 0,
      userGrowth: dashboardData.users?.growth || 0,
      modelViews: dashboardData.engagement?.modelViews || 0,
      viewsGrowth: dashboardData.engagement?.viewsGrowth || 0
    };
  }, [dashboardData]);

  const COLORS = ['#1e3a8a', '#0d9488', '#059669', '#dc2626', '#ea580c', '#7c3aed'];

  if (loading && !dashboardData) {
    return (
      <div className="p-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-96 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Executive Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into ZenCap's performance and user behavior</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total Revenue"
          value={`$${keyMetrics.totalRevenue?.toLocaleString()}`}
          growth={keyMetrics.revenueGrowth}
          icon={DollarSign}
          color="text-green-600"
        />
        <MetricCard 
          title="Total Leads"
          value={keyMetrics.totalLeads?.toLocaleString()}
          growth={keyMetrics.leadsGrowth}
          icon={Users}
          color="text-blue-600"
        />
        <MetricCard 
          title="Conversion Rate"
          value={`${keyMetrics.conversionRate?.toFixed(2)}%`}
          growth={keyMetrics.conversionGrowth}
          icon={Target}
          color="text-purple-600"
        />
        <MetricCard 
          title="Avg Order Value"
          value={`$${keyMetrics.avgOrderValue?.toLocaleString()}`}
          growth={keyMetrics.aovGrowth}
          icon={Award}
          color="text-orange-600"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'revenue', label: 'Revenue' },
          { key: 'conversion', label: 'Conversion' },
          { key: 'behavior', label: 'User Behavior' },
          { key: 'models', label: 'Model Performance' },
          { key: 'realtime', label: 'Real-time' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Content */}
      {activeTab === 'overview' && <OverviewTab data={dashboardData} />}
      {activeTab === 'revenue' && <RevenueTab data={dashboardData} />}
      {activeTab === 'conversion' && <ConversionTab data={dashboardData} />}
      {activeTab === 'behavior' && <BehaviorTab data={dashboardData} />}
      {activeTab === 'models' && <ModelsTab data={dashboardData} />}
      {activeTab === 'realtime' && <RealTimeTab data={realTimeData} />}
    </div>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, growth, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="flex items-center space-x-1">
        {growth > 0 ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>
    </div>
    <div className="mb-2">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

// Overview Tab Component
const OverviewTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Revenue Trend */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data?.revenueTrend || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    {/* Conversion Funnel */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
      <div className="space-y-4">
        {data?.funnelData?.map((step, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">{step.name}</span>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-bold">{step.count?.toLocaleString()}</span>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${step.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12">{step.percentage?.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Top Models */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Models</h3>
      <div className="space-y-4">
        {data?.topModels?.slice(0, 5).map((model, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-l-4 border-blue-600 bg-blue-50">
            <div>
              <p className="font-medium">{model.title}</p>
              <p className="text-sm text-gray-600">{model.category}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">${model.revenue?.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{model.sales} sales</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Traffic Sources */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data?.trafficSources || []}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {(data?.trafficSources || []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Revenue Tab Component
const RevenueTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Daily Revenue */}
    <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data?.dailyRevenue || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#1e3a8a" strokeWidth={3} />
          <Line type="monotone" dataKey="transactions" stroke="#0d9488" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Revenue by Model Category */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.revenueByCategory || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#1e3a8a" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Customer Segmentation */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segmentation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={data?.customerSegments || []}>
          <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background dataKey="value" />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Conversion Tab Component
const ConversionTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Conversion Rate Trend */}
    <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data?.conversionTrend || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Lead Sources Performance */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources Performance</h3>
      <div className="space-y-4">
        {data?.leadSources?.map((source, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">{source.name}</span>
            <div className="text-right">
              <p className="text-lg font-bold">{source.leads}</p>
              <p className="text-sm text-gray-600">{source.conversionRate}% CVR</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* A/B Test Results */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">A/B Test Results</h3>
      <div className="space-y-4">
        {data?.abTests?.map((test, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{test.name}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                test.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {test.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Control: {test.control.conversionRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Variant: {test.variant.conversionRate}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Behavior Tab Component
const BehaviorTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Page Engagement */}
    <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Engagement Metrics</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Page</th>
              <th className="text-right p-2">Sessions</th>
              <th className="text-right p-2">Avg Time</th>
              <th className="text-right p-2">Bounce Rate</th>
              <th className="text-right p-2">Scroll Depth</th>
            </tr>
          </thead>
          <tbody>
            {data?.pageEngagement?.map((page, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">{page.path}</td>
                <td className="p-2 text-right">{page.sessions}</td>
                <td className="p-2 text-right">{page.avgTime}</td>
                <td className="p-2 text-right">{page.bounceRate}%</td>
                <td className="p-2 text-right">{page.avgScrollDepth}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Device Breakdown */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data?.deviceBreakdown || []}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="sessions"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {(data?.deviceBreakdown || []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* User Flow */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Common User Paths</h3>
      <div className="space-y-3">
        {data?.userPaths?.map((path, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex-1">
              <p className="text-sm text-gray-600">{path.path}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{path.users}</p>
              <p className="text-xs text-gray-500">{path.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Models Tab Component
const ModelsTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Model Performance */}
    <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Model</th>
              <th className="text-right p-2">Views</th>
              <th className="text-right p-2">Downloads</th>
              <th className="text-right p-2">Sales</th>
              <th className="text-right p-2">Revenue</th>
              <th className="text-right p-2">CVR</th>
            </tr>
          </thead>
          <tbody>
            {data?.modelPerformance?.map((model, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">{model.title}</td>
                <td className="p-2 text-right">{model.views}</td>
                <td className="p-2 text-right">{model.downloads}</td>
                <td className="p-2 text-right">{model.sales}</td>
                <td className="p-2 text-right">${model.revenue?.toLocaleString()}</td>
                <td className="p-2 text-right">{model.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Real-time Tab Component
const RealTimeTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Current Activity */}
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Activity</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Active Users</span>
          <span className="text-2xl font-bold text-green-600">{data.activeUsers || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Page Views (5min)</span>
          <span className="text-xl font-bold">{data.recentPageViews || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>New Sessions</span>
          <span className="text-xl font-bold">{data.newSessions || 0}</span>
        </div>
      </div>
    </div>

    {/* Recent Events */}
    <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.recentEvents?.map((event, index) => (
          <div key={index} className="flex items-center p-3 bg-gray-50 rounded">
            <div className="flex-1">
              <p className="font-medium">{event.type}</p>
              <p className="text-sm text-gray-600">{event.details}</p>
            </div>
            <div className="text-sm text-gray-500">
              {event.timeAgo}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ExecutiveAnalyticsDashboard;