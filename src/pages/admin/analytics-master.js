import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';

// Master Analytics Dashboard - Complete Overview
export default function AnalyticsMaster() {
  const [trackingStatus, setTrackingStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [initializingTables, setInitializingTables] = useState(false);

  useEffect(() => {
    verifyTracking();
  }, []);

  const verifyTracking = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/analytics/verify-tracking', {
        method: 'POST'
      });
      const data = await response.json();
      setTrackingStatus(data);
    } catch (error) {
      console.error('Failed to verify tracking:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const initializeTables = async () => {
    setInitializingTables(true);
    try {
      const response = await fetch('/api/analytics/init-all-tables', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Analytics tables initialized successfully!');
        verifyTracking(); // Re-verify after initialization
      } else {
        alert('Failed to initialize tables: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to initialize tables:', error);
      alert('Failed to initialize tables');
    } finally {
      setInitializingTables(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === true) return 'text-green-600 bg-green-100';
    if (status === false) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getStatusIcon = (status) => {
    if (status === true) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (status === false) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Master Dashboard</h1>
                <p className="text-gray-600">Complete analytics implementation for $50K/month revenue target</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={initializeTables}
                  disabled={initializingTables}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {initializingTables ? 'Initializing...' : 'Initialize DB Tables'}
                </button>
                <button
                  onClick={verifyTracking}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Tracking'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Implementation Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-8 mb-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">🚀 Complete Analytics Implementation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">✅</div>
                <p className="text-sm">Enhanced E-commerce Tracking</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">📊</div>
                <p className="text-sm">Revenue Attribution</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">🎯</div>
                <p className="text-sm">Conversion Optimization</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">📈</div>
                <p className="text-sm">Real-time Dashboard</p>
              </div>
            </div>
          </motion.div>

          {/* Features Implemented */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Analytics Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-xl font-semibold mb-4">📈 Analytics Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Enhanced GA4 e-commerce tracking with custom events
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Revenue attribution with UTM parameter tracking
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Conversion funnel analysis for $2,985-$4,985 models
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Multi-touch attribution modeling
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Real-time revenue dashboard with KPIs
                </li>
              </ul>
            </motion.div>

            {/* Conversion Optimization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-xl font-semibold mb-4">🎯 Conversion Optimization</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Social proof widgets with real-time notifications
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Exit-intent popups for lead capture
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  A/B testing framework integration
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Behavioral engagement tracking
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Mobile-optimized exit intent detection
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Tracking Verification Status */}
          {trackingStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border mb-8"
            >
              <h3 className="text-xl font-semibold mb-4">🔍 Tracking Verification Status</h3>
              
              {/* Database Status */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Database Tables</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(trackingStatus.verification.database.tables).map(([table, status]) => (
                    <div key={table} className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="text-xs font-medium">{table}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics Status */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Analytics Components</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(trackingStatus.verification.analytics).map(([component, status]) => (
                    <div key={component} className={`px-4 py-3 rounded-lg flex items-center justify-between ${getStatusColor(status)}`}>
                      <span className="text-sm font-medium">{component}</span>
                      {getStatusIcon(status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* API Endpoints */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">API Endpoints</h4>
                <div className="space-y-2">
                  {Object.entries(trackingStatus.verification.apis.endpoints).map(([endpoint, status]) => (
                    <div key={endpoint} className={`px-4 py-2 rounded-lg flex items-center justify-between ${getStatusColor(status)}`}>
                      <code className="text-sm">{endpoint}</code>
                      {getStatusIcon(status)}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <h3 className="text-xl font-semibold mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/admin/revenue-dashboard"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Revenue Dashboard</h4>
                  <p className="text-sm text-gray-600">Real-time revenue tracking</p>
                </div>
              </a>

              <a
                href="/admin"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Admin Dashboard</h4>
                  <p className="text-sm text-gray-600">Manage content & settings</p>
                </div>
              </a>

              <button
                onClick={() => window.open('https://analytics.google.com', '_blank')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Google Analytics</h4>
                  <p className="text-sm text-gray-600">View GA4 reports</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Implementation Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Implementation Complete!</h3>
            <p className="text-green-700 mb-4">
              All analytics tracking is now deployed and ready to capture data for your $50K/month revenue target.
            </p>
            <div className="text-sm text-green-600 space-y-1">
              <p>✅ Enhanced e-commerce tracking with GA4</p>
              <p>✅ Multi-touch revenue attribution</p>
              <p>✅ Social proof widgets for conversion optimization</p>
              <p>✅ Exit-intent popups for lead capture</p>
              <p>✅ Real-time revenue dashboard</p>
              <p>✅ Complete database schema for analytics</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}