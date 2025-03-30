// src/components/PerformanceMonitor.js
import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;
    
    // Report Web Vitals
    const reportWebVitals = async () => {
      const { getCLS, getFID, getLCP, getFCP, getTTFB } = await import('web-vitals');
      
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getLCP(sendToAnalytics);
      getFCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    };
    
    // Function to send metrics to your analytics service
    const sendToAnalytics = ({ name, delta, id }) => {
      // In a real app, you'd send this to your analytics service
      // For example: gtag('event', name, { value: delta, metric_id: id });
      console.log({ name, delta, id });
    };
    
    reportWebVitals();
  }, []);
  
  return null; // This component doesn't render anything
}