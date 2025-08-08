import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';

// Real-time Revenue Dashboard
export default function RevenueDashboard() {
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    totalRevenue: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    activeUsers: 0,
    recentTransactions: [],
    topModels: [],
    sourcePerformance: [],
    funnelData: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/revenue-dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.dashboard);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading revenue dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
                <p className="text-gray-600">Real-time analytics for Zenith Capital Advisors</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Refresh Controls */}
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={10000}>10s refresh</option>
                  <option value={30000}>30s refresh</option>
                  <option value={60000}>1m refresh</option>
                  <option value={300000}>5m refresh</option>
                </select>
                
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(dashboardData.todayRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Month Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(dashboardData.monthRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Conversion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatPercent(dashboardData.conversionRate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Active Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-teal-600">
                    {dashboardData.activeUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-teal-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts and Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {dashboardData.recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.modelTitle}</p>
                      <p className="text-sm text-gray-600">{new Date(transaction.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                      <p className="text-sm text-gray-500">{transaction.customerLocation}</p>
                    </div>
                  </div>
                ))}
                
                {dashboardData.recentTransactions.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No recent transactions</p>
                )}
              </div>
            </motion.div>

            {/* Top Performing Models */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold mb-4">Top Performing Models</h3>
              <div className="space-y-3">
                {dashboardData.topModels.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{model.title}</p>
                        <p className="text-sm text-gray-600">{model.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatCurrency(model.revenue)}</p>
                      <p className="text-sm text-gray-500">{model.sales} sales</p>
                    </div>
                  </div>
                ))}
                
                {dashboardData.topModels.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No sales data available</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Source Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border mb-8"
          >
            <h3 className="text-lg font-semibold mb-4">Traffic Source Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Source</th>
                    <th className="text-left py-3 px-4">Medium</th>
                    <th className="text-right py-3 px-4">Conversions</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Avg. Order Value</th>
                    <th className="text-right py-3 px-4">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.sourcePerformance.map((source, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{source.source}</td>
                      <td className="py-3 px-4 text-gray-600">{source.medium}</td>
                      <td className="py-3 px-4 text-right">{source.conversions}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(source.revenue)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(source.avgOrderValue)}</td>
                      <td className="py-3 px-4 text-right">{formatPercent(source.conversionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Conversion Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-4">
              {dashboardData.funnelData.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1/4 text-sm font-medium text-gray-700">
                    {step.stepName}
                  </div>
                  <div className="w-1/2 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-full transition-all duration-500"
                      style={{ width: `${step.percentage}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {step.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-1/4 text-right text-sm text-gray-600">
                    {formatPercent(step.percentage / 100)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}