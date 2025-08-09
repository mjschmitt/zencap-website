// src/components/spa/SpaMonitoring.js - Simplified Performance Monitoring for SPA
import { createContext, useContext, useState, useEffect } from 'react';
import { useSpa } from './SpaRouter';

const MonitoringContext = createContext({
  metrics: {},
  alerts: [],
  isHealthy: true,
  performanceScore: 100
});

export const useMonitoring = () => useContext(MonitoringContext);

export default function SpaMonitoring({ children, enableRealTime = true }) {
  const { isSpaMode } = useSpa();
  const [metrics, setMetrics] = useState({
    performance: {},
    lastUpdate: Date.now()
  });
  const [alerts, setAlerts] = useState([]);
  const [isHealthy, setIsHealthy] = useState(true);

  // Basic performance monitoring
  useEffect(() => {
    if (!enableRealTime || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const currentMetrics = {
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : 0,
        timestamp: Date.now(),
        spaMode: isSpaMode
      };
      
      setMetrics(prev => ({
        ...prev,
        performance: currentMetrics,
        lastUpdate: Date.now()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [enableRealTime, isSpaMode]);

  // Calculate performance score
  const calculatePerformanceScore = () => {
    const memUsage = metrics.performance?.memoryUsage || 0;
    let score = 100;
    
    if (memUsage > 50) score -= 20;
    if (memUsage > 100) score -= 30;
    
    return Math.max(0, score);
  };

  const contextValue = {
    metrics,
    alerts,
    isHealthy,
    performanceScore: calculatePerformanceScore()
  };

  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  );
}