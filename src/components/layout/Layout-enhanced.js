// src/components/layout/Layout.js - Enhanced with advanced performance monitoring
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import PerformanceMonitor from '../PerformanceMonitor';
import Analytics from '../Analytics';
import RealTimePerformanceDashboard from '../monitoring/RealTimePerformanceDashboard';
import performanceMonitor from '@/utils/monitoring/advanced-performance-monitor';

export default function Layout({ 
  children, 
  title = 'Zenith Capital Advisors', 
  description = 'Financial modeling and investment advisory services for public and private equity firms.',
  metaImage = '/images/meta-image.jpg'
}) {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  // Initialize advanced performance monitoring and development mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      // Also clear any scroll restoration
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      
      // Check if in development mode or has performance monitoring enabled
      const devMode = process.env.NODE_ENV === 'development' || 
                     window.location.search.includes('debug=performance') ||
                     localStorage.getItem('enable_performance_monitor') === 'true';
      
      setIsDevelopment(devMode);
      setShowPerformanceDashboard(devMode);
      
      // Initialize advanced performance monitoring
      performanceMonitor.initialize().then(() => {
        console.log('✅ Advanced Performance Monitor initialized in Layout');
      }).catch(error => {
        console.error('❌ Failed to initialize performance monitor:', error);
      });
      
      // Set up keyboard shortcut to toggle performance dashboard (Ctrl+Shift+P)
      const handleKeyPress = (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'P') {
          event.preventDefault();
          setShowPerformanceDashboard(prev => {
            const newValue = !prev;
            localStorage.setItem('enable_performance_monitor', newValue.toString());
            return newValue;
          });
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={metaImage} />
      </Head>
      
      <Header />
      
      <main className="flex-grow dark:text-white transition-colors duration-200">
        {children}
      </main>
      
      <Footer />
      
      <ScrollToTop />
      <PerformanceMonitor />
      <Analytics />
      
      {/* Real-time Performance Dashboard - Shows in development or when enabled */}
      {showPerformanceDashboard && (
        <RealTimePerformanceDashboard
          isVisible={true}
          position="bottom-right"
          onToggle={() => setShowPerformanceDashboard(false)}
        />
      )}
      
      {/* Performance monitoring activation hint for production */}
      {!isDevelopment && typeof window !== 'undefined' && (
        <div className="hidden">
          {/* Hidden hint: Add ?debug=performance to URL or press Ctrl+Shift+P to enable monitoring */}
        </div>
      )}
    </div>
  );
}