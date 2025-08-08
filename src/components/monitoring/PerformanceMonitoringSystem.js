/**
 * @fileoverview Comprehensive Performance Monitoring System Integration
 * @module components/monitoring/PerformanceMonitoringSystem
 * 
 * MASTER PERFORMANCE MONITORING COORDINATOR
 * - Integrates all monitoring subsystems
 * - Coordinates alerts and metrics collection
 * - Manages monitoring lifecycle
 * - Provides unified dashboard interface
 */

import { useEffect, useRef, useState } from 'react';
import performanceMonitor from '@/utils/monitoring/advanced-performance-monitor';
import coreWebVitalsTracker from '@/utils/monitoring/core-web-vitals-tracker';
import bundleSizeMonitor from '@/utils/monitoring/bundle-size-monitor';

export default function PerformanceMonitoringSystem({ 
  enableAdvancedMonitoring = true,
  enableBundleMonitoring = true,
  enableWebVitals = true,
  onAlert = null,
  onMetric = null
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState({
    advanced: false,
    webVitals: false,
    bundleSize: false
  });
  const initializationRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeMonitoring = async () => {
      console.log('🚀 Initializing Comprehensive Performance Monitoring System...');
      
      try {
        const initPromises = [];

        // Initialize Core Web Vitals Tracking
        if (enableWebVitals) {
          initPromises.push(
            coreWebVitalsTracker.initialize().then(() => {
              console.log('✅ Core Web Vitals tracking active');
              setMonitoringStatus(prev => ({ ...prev, webVitals: true }));

              // Add callback for web vitals
              coreWebVitalsTracker.onVital((vital) => {
                if (onMetric) onMetric(vital);
                
                // Send critical vitals alerts
                if (vital.rating === 'poor') {
                  const alert = {
                    type: 'core_web_vital_poor',
                    severity: 'warning',
                    message: `Poor ${vital.name} performance: ${vital.value}`,
                    metric: vital
                  };
                  if (onAlert) onAlert(alert);
                }
              });
            })
          );
        }

        // Initialize Advanced Performance Monitor
        if (enableAdvancedMonitoring) {
          initPromises.push(
            performanceMonitor.initialize().then(() => {
              console.log('✅ Advanced performance monitoring active');
              setMonitoringStatus(prev => ({ ...prev, advanced: true }));

              // Add alert handler
              if (onAlert) {
                performanceMonitor.addAlertHandler(onAlert);
              }
            })
          );
        }

        // Initialize Bundle Size Monitor
        if (enableBundleMonitoring) {
          initPromises.push(
            Promise.resolve(bundleSizeMonitor.initialize()).then(() => {
              console.log('✅ Bundle size monitoring active');
              setMonitoringStatus(prev => ({ ...prev, bundleSize: true }));

              // Add callback for bundle events
              bundleSizeMonitor.onBundle((bundleData) => {
                if (onMetric) onMetric(bundleData);
                
                // Send bundle size alerts for critical thresholds
                if (bundleData.size > 300) {
                  const alert = {
                    type: 'large_bundle_detected',
                    severity: bundleData.size > 500 ? 'critical' : 'warning',
                    message: `Large bundle detected: ${bundleData.category} (${bundleData.size.toFixed(1)}KB)`,
                    bundle: bundleData
                  };
                  if (onAlert) onAlert(alert);
                }
              });
            })
          );
        }

        // Wait for all monitoring systems to initialize
        await Promise.all(initPromises);

        // Set up coordinated monitoring
        setupCoordinatedMonitoring();

        setIsInitialized(true);
        console.log('🎉 Performance Monitoring System fully initialized!');

      } catch (error) {
        console.error('❌ Performance Monitoring System initialization failed:', error);
      }
    };

    // Initialize with delay to allow page to settle
    setTimeout(initializeMonitoring, 1000);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Performance Monitoring System');
      initializationRef.current = false;
    };
  }, [enableAdvancedMonitoring, enableBundleMonitoring, enableWebVitals, onAlert, onMetric]);

  /**
   * Set up coordinated monitoring between all subsystems
   */
  const setupCoordinatedMonitoring = () => {
    // Create comprehensive performance report every 60 seconds
    setInterval(() => {
      generateComprehensiveReport();
    }, 60000);

    // Set up cross-system correlation
    setupCrossSystemCorrelation();

    // Initialize business-critical monitoring
    setupBusinessCriticalMonitoring();
  };

  /**
   * Generate comprehensive performance report
   */
  const generateComprehensiveReport = () => {
    if (!isInitialized) return;

    const report = {
      timestamp: Date.now(),
      systems: {}
    };

    // Gather Web Vitals data
    if (monitoringStatus.webVitals) {
      report.systems.webVitals = coreWebVitalsTracker.getPerformanceSummary();
    }

    // Gather Advanced Performance data
    if (monitoringStatus.advanced) {
      report.systems.advanced = {
        metrics: performanceMonitor.getMetricsSummary(),
        alerts: performanceMonitor.getRecentAlerts(60), // Last hour
        health: performanceMonitor.calculateSystemHealth()
      };
    }

    // Gather Bundle Size data
    if (monitoringStatus.bundleSize) {
      report.systems.bundles = bundleSizeMonitor.getBundleSummary();
    }

    // Calculate overall system health
    report.overallHealth = calculateOverallSystemHealth(report.systems);

    // Send comprehensive report
    sendComprehensiveReport(report);

    // Log summary
    console.log('📊 Performance Report:', {
      overall_health: report.overallHealth.score,
      status: report.overallHealth.status,
      systems_active: Object.keys(report.systems).length
    });
  };

  /**
   * Calculate overall system health from all monitoring systems
   */
  const calculateOverallSystemHealth = (systems) => {
    let totalScore = 0;
    let systemCount = 0;
    const issues = [];

    // Web Vitals contribution
    if (systems.webVitals) {
      const vitalsScore = systems.webVitals.summary.overall_score || 0;
      totalScore += vitalsScore;
      systemCount++;
      
      if (vitalsScore < 70) {
        issues.push(`Web Vitals performance degraded (${vitalsScore}%)`);
      }
    }

    // Advanced monitoring contribution
    if (systems.advanced && systems.advanced.health) {
      totalScore += systems.advanced.health.score;
      systemCount++;
      
      if (systems.advanced.health.score < 70) {
        issues.push(`System performance degraded (${systems.advanced.health.score}%)`);
      }
    }

    // Bundle size contribution
    if (systems.bundles) {
      const bundleScore = systems.bundles.performance_score || 0;
      totalScore += bundleScore;
      systemCount++;
      
      if (bundleScore < 70) {
        issues.push(`Bundle performance degraded (${bundleScore}%)`);
      }
    }

    const overallScore = systemCount > 0 ? totalScore / systemCount : 0;
    
    return {
      score: Math.round(overallScore),
      status: overallScore >= 90 ? 'excellent' : 
              overallScore >= 80 ? 'good' : 
              overallScore >= 70 ? 'acceptable' : 
              overallScore >= 50 ? 'poor' : 'critical',
      issues,
      systems_monitored: systemCount
    };
  };

  /**
   * Set up cross-system correlation
   */
  const setupCrossSystemCorrelation = () => {
    // Correlate high memory usage with bundle size
    const correlateMemoryAndBundles = () => {
      if (!monitoringStatus.advanced || !monitoringStatus.bundleSize) return;

      const memoryMetric = performanceMonitor.metrics.get('memory_usage');
      const bundleSummary = bundleSizeMonitor.getBundleSummary();
      
      if (memoryMetric && bundleSummary.total_size > 500 && memoryMetric.value > 200) {
        if (onAlert) {
          onAlert({
            type: 'memory_bundle_correlation',
            severity: 'warning',
            message: `High memory usage (${memoryMetric.value}MB) correlates with large bundle size (${bundleSummary.total_size.toFixed(1)}KB)`,
            correlation: {
              memory: memoryMetric.value,
              bundle_size: bundleSummary.total_size
            }
          });
        }
      }
    };

    // Check correlation every 2 minutes
    setInterval(correlateMemoryAndBundles, 120000);
  };

  /**
   * Set up business-critical monitoring
   */
  const setupBusinessCriticalMonitoring = () => {
    // Monitor Excel viewer performance specifically
    const monitorExcelViewer = () => {
      // Listen for Excel viewer events
      window.addEventListener('excel-viewer-performance', (event) => {
        const { operation, duration, success, error } = event.detail;
        
        if (onMetric) {
          onMetric({
            type: 'excel_business_metric',
            operation,
            duration,
            success,
            timestamp: Date.now()
          });
        }

        // Alert on Excel viewer issues (critical for business)
        if (!success || duration > 5000) {
          if (onAlert) {
            onAlert({
              type: 'excel_business_critical',
              severity: 'critical',
              message: `Excel viewer ${operation} ${success ? 'slow' : 'failed'}: ${duration}ms`,
              business_impact: 'high',
              operation,
              duration,
              success,
              error
            });
          }
        }
      });
    };

    // Monitor payment flow performance
    const monitorPaymentFlow = () => {
      // Track Stripe-related performance
      window.addEventListener('payment-flow-start', () => {
        performance.mark('payment-flow-start');
      });

      window.addEventListener('payment-flow-complete', (event) => {
        performance.mark('payment-flow-complete');
        performance.measure('payment-flow-duration', 'payment-flow-start', 'payment-flow-complete');
        
        const entries = performance.getEntriesByName('payment-flow-duration');
        if (entries.length > 0) {
          const duration = entries[entries.length - 1].duration;
          
          if (onMetric) {
            onMetric({
              type: 'payment_business_metric',
              duration,
              success: event.detail?.success || true,
              timestamp: Date.now()
            });
          }

          // Alert on slow payment processing
          if (duration > 10000) { // 10 seconds
            if (onAlert) {
              onAlert({
                type: 'payment_business_critical',
                severity: 'critical',
                message: `Payment flow taking too long: ${duration.toFixed(1)}ms`,
                business_impact: 'critical',
                duration
              });
            }
          }
        }
      });
    };

    monitorExcelViewer();
    monitorPaymentFlow();
  };

  /**
   * Send comprehensive report to monitoring API
   */
  const sendComprehensiveReport = (report) => {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/comprehensive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      }).catch(error => {
        console.error('Failed to send comprehensive report:', error);
      });
    }
  };

  // Expose monitoring status for external use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__PERFORMANCE_MONITORING_STATUS__ = {
        isInitialized,
        monitoringStatus,
        getReport: generateComprehensiveReport,
        getSystems: () => ({
          advanced: monitoringStatus.advanced ? performanceMonitor : null,
          webVitals: monitoringStatus.webVitals ? coreWebVitalsTracker : null,
          bundles: monitoringStatus.bundleSize ? bundleSizeMonitor : null
        })
      };
    }
  }, [isInitialized, monitoringStatus]);

  // This component doesn't render anything - it's purely for coordination
  return null;
}