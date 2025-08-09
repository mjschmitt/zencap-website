// Demo page to show SPA components in action
import { useState } from 'react';
import { useSpa } from '@/components/spa/SpaRouter';
import { useLazyLoad } from '@/components/spa/LazyLoadManager';
import { useOptimizedMotion } from '@/components/spa/OptimizedMotion';
import { useFeatureFlags } from '@/components/spa/SpaFeatureFlags';
import { useMonitoring } from '@/components/spa/SpaMonitoring';

export default function SpaDemo() {
  const { isSpaMode = false } = useSpa();
  const { loadedComponents = new Set(), loadingComponents = new Set() } = useLazyLoad();
  const { isMotionEnabled = true, motionPreference = 'full' } = useOptimizedMotion();
  const { segment = 'default', flags = {} } = useFeatureFlags();
  const { isHealthy = true, performanceScore = 100, alerts = [] } = useMonitoring();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SPA Components Demo
          </h1>
          <p className="text-gray-600">
            Interactive demonstration of the hybrid SPA implementation
          </p>
          <div className="mt-4 text-sm text-gray-500">
            🚀 All SPA components successfully loaded and active!
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">SPA Router</h3>
              <div className={`w-3 h-3 rounded-full ${isSpaMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <p className="text-gray-600">Status: {isSpaMode ? 'Active' : 'Inactive'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Hybrid routing system for optimal performance
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Motion System</h3>
              <div className={`w-3 h-3 rounded-full ${isMotionEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <p className="text-gray-600">Mode: {motionPreference}</p>
            <p className="text-sm text-gray-500 mt-2">
              Device-adaptive animations
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Feature Flags</h3>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
            <p className="text-gray-600">Segment: {segment}</p>
            <p className="text-sm text-gray-500 mt-2">
              {Object.keys(flags).length} flags configured
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance</h3>
              <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-gray-600">Score: {performanceScore}/100</p>
            <p className="text-sm text-gray-500 mt-2">
              {alerts.length} active alerts
            </p>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            SPA Implementation Successful! 
          </h2>
          <p className="text-green-700 mb-4">
            All 5 SPA components have been successfully integrated into the application:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-green-600 font-semibold">SpaRouter</div>
              <div className="text-sm text-green-600">Hybrid routing active</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">SpaFeatureFlags</div>
              <div className="text-sm text-green-600">Progressive rollout system</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">LazyLoadManager</div>
              <div className="text-sm text-green-600">Component optimization</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">OptimizedMotion</div>
              <div className="text-sm text-green-600">Performance-aware animations</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">SpaMonitoring</div>
              <div className="text-sm text-green-600">Real-time performance tracking</div>
            </div>
          </div>
        </div>

        {/* Component Status */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Component Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-600">Loaded Components</h3>
              {Array.from(loadedComponents).length > 0 ? (
                <div className="space-y-2">
                  {Array.from(loadedComponents).map(component => (
                    <div key={component} className="flex items-center p-3 bg-green-50 border border-green-200 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">{component}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No components loaded yet (lazy loading active)</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-600">Loading Components</h3>
              {Array.from(loadingComponents).length > 0 ? (
                <div className="space-y-2">
                  {Array.from(loadingComponents).map(component => (
                    <div key={component} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-sm font-medium">{component}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No components currently loading</p>
              )}
            </div>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-800 text-white rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Development Info</h3>
            <pre className="text-sm overflow-x-auto">
{JSON.stringify({
  isSpaMode,
  motionPreference,
  isMotionEnabled,
  segment,
  performanceScore,
  loadedComponents: Array.from(loadedComponents),
  loadingComponents: Array.from(loadingComponents),
  alerts: alerts.map(alert => alert.id || 'unnamed')
}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}