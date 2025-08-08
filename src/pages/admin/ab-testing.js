// src/pages/admin/ab-testing.js - A/B Testing Dashboard

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Motion from '@/components/ui/Motion';
import { getAllTests, getActiveTests } from '@/utils/abTesting';

export default function ABTestingDashboard() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [error, setError] = useState(null);

  // Fetch test results from API
  useEffect(() => {
    fetchTestResults();
  }, [selectedPeriod]);

  const fetchTestResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ab-analytics?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setTestResults(data.data);
      } else {
        setError('Failed to fetch test results');
      }
    } catch (err) {
      setError('Network error fetching test results');
      console.error('Error fetching test results:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatisticalSignificance = (controlRate, variantRate, controlSample, variantSample) => {
    if (controlSample < 30 || variantSample < 30) return 'insufficient_data';
    
    // Simple z-test approximation
    const pooledRate = ((controlRate/100 * controlSample) + (variantRate/100 * variantSample)) / (controlSample + variantSample);
    const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlSample + 1/variantSample));
    const z = Math.abs((variantRate/100 - controlRate/100) / se);
    
    if (z > 2.58) return 'very_significant'; // 99% confidence
    if (z > 1.96) return 'significant'; // 95% confidence
    if (z > 1.65) return 'marginally_significant'; // 90% confidence
    return 'not_significant';
  };

  const getSignificanceColor = (significance) => {
    switch (significance) {
      case 'very_significant': return 'text-green-600';
      case 'significant': return 'text-green-500';
      case 'marginally_significant': return 'text-yellow-500';
      case 'not_significant': return 'text-gray-500';
      case 'insufficient_data': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  const getSignificanceLabel = (significance) => {
    switch (significance) {
      case 'very_significant': return '99% Confident';
      case 'significant': return '95% Confident';
      case 'marginally_significant': return '90% Confident';
      case 'not_significant': return 'Not Significant';
      case 'insufficient_data': return 'Need More Data';
      default: return 'Unknown';
    }
  };

  const allTests = getAllTests();
  const activeTests = getActiveTests();

  if (loading) {
    return (
      <Layout title="A/B Testing Dashboard - Zenith Capital Advisors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="A/B Testing Dashboard - Zenith Capital Advisors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Motion animation="fade" direction="up">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-700 dark:text-white mb-2">
              A/B Testing Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor and analyze conversion rate optimization tests to drive $50K/month revenue
            </p>
          </div>
        </Motion>

        {/* Period Selector */}
        <Motion animation="fade" direction="up" delay={100}>
          <Card className="mb-8 bg-white dark:bg-navy-800 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy-700 dark:text-white">
                Analysis Period
              </h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </Card>
        </Motion>

        {/* Summary Stats */}
        {testResults.summary && (
          <Motion animation="fade" direction="up" delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white dark:bg-navy-800 p-6 text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                  {testResults.summary.totalActiveTests}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Active Tests
                </div>
              </Card>
              
              <Card className="bg-white dark:bg-navy-800 p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {testResults.summary.totalExposures?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Exposures
                </div>
              </Card>
              
              <Card className="bg-white dark:bg-navy-800 p-6 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {testResults.summary.totalConversions?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Conversions
                </div>
              </Card>
              
              <Card className="bg-white dark:bg-navy-800 p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {testResults.summary.overallConversionRate?.toFixed(2) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Overall Conversion Rate
                </div>
              </Card>
            </div>
          </Motion>
        )}

        {error && (
          <Motion animation="fade" direction="up">
            <Card className="bg-red-50 border border-red-200 p-6 mb-8">
              <div className="flex items-center text-red-800">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </Card>
          </Motion>
        )}

        {/* Active Tests Results */}
        <Motion animation="fade" direction="up" delay={300}>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
            Test Results
          </h2>
        </Motion>

        {Object.entries(testResults.results || {}).map(([testId, results], index) => {
          const testConfig = allTests[testId];
          if (!testConfig) return null;

          const variants = Object.entries(results.variants || {});
          const controlVariant = variants.find(([name]) => name === 'control');
          const testVariants = variants.filter(([name]) => name !== 'control');

          return (
            <Motion key={testId} animation="fade" direction="up" delay={400 + index * 100}>
              <Card className="mb-8 bg-white dark:bg-navy-800 overflow-hidden">
                {/* Test Header */}
                <div className="border-b border-gray-200 dark:border-gray-600 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-navy-700 dark:text-white mb-2">
                        {testConfig.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {testConfig.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                        {testConfig.status === 'active' ? 'Running' : 'Draft'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants Comparison */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {variants.map(([variantName, variantData]) => {
                      const isControl = variantName === 'control';
                      const controlData = controlVariant?.[1];
                      
                      let significance = 'insufficient_data';
                      let improvement = 0;
                      
                      if (!isControl && controlData && variantData.exposures > 0 && controlData.exposures > 0) {
                        improvement = ((variantData.conversionRate - controlData.conversionRate) / controlData.conversionRate * 100);
                        significance = calculateStatisticalSignificance(
                          controlData.conversionRate,
                          variantData.conversionRate,
                          controlData.exposures,
                          variantData.exposures
                        );
                      }

                      return (
                        <div key={variantName} className={`
                          relative p-4 rounded-lg border-2 
                          ${isControl 
                            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' 
                            : improvement > 0 
                              ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                              : 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          }
                        `}>
                          {/* Variant Label */}
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-navy-700 dark:text-white">
                              {testConfig.variants[variantName]?.name || variantName}
                            </h4>
                            {isControl && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                                Control
                              </span>
                            )}
                          </div>

                          {/* Metrics */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Exposures:</span>
                              <span className="font-medium">{variantData.exposures?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Conversions:</span>
                              <span className="font-medium">{variantData.totalConversions?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Conversion Rate:</span>
                              <span className="font-bold text-lg">{variantData.conversionRate?.toFixed(2) || 0}%</span>
                            </div>
                            {variantData.revenue > 0 && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Revenue:</span>
                                <span className="font-medium">${variantData.revenue?.toLocaleString() || 0}</span>
                              </div>
                            )}
                          </div>

                          {/* Performance vs Control */}
                          {!isControl && controlData && (
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-300">vs Control:</span>
                                <span className={`font-bold ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Confidence:</span>
                                <span className={`text-xs font-medium ${getSignificanceColor(significance)}`}>
                                  {getSignificanceLabel(significance)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Test Actions */}
                <div className="border-t border-gray-200 dark:border-gray-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Last updated: {new Date(results.lastUpdated).toLocaleString()}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => fetchTestResults()}
                        className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        Refresh Data
                      </button>
                      {testConfig.status === 'active' && (
                        <button className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                          Stop Test
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Motion>
          );
        })}

        {Object.keys(testResults.results || {}).length === 0 && !loading && (
          <Motion animation="fade" direction="up">
            <Card className="bg-gray-50 dark:bg-gray-700 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Test Data Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Test data will appear here once users start interacting with active A/B tests.
              </p>
            </Card>
          </Motion>
        )}

        {/* Revenue Impact Analysis */}
        {testResults.summary && testResults.summary.totalConversions > 0 && (
          <Motion animation="fade" direction="up" delay={500}>
            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 p-6 border border-teal-200 dark:border-teal-600">
              <h3 className="text-xl font-semibold text-navy-700 dark:text-white mb-4">
                Revenue Impact Projection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                    ${(testResults.summary.totalConversions * 4200).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Projected Monthly Revenue
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Based on current conversion rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {((testResults.summary.totalConversions * 4200 / 50000) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Progress to $50K Goal
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Monthly revenue target
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {Math.ceil(50000 / 4200 - testResults.summary.totalConversions)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Additional Conversions Needed
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    To reach $50K/month
                  </div>
                </div>
              </div>
            </Card>
          </Motion>
        )}
      </div>
    </Layout>
  );
}