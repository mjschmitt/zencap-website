// src/pages/_app.js - Enhanced Hybrid SPA Implementation
import "@/styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { Inter, Playfair_Display } from 'next/font/google';
import PageTransition from '@/components/PageTransitions';
import { useEffect } from 'react';
import { initializeProduction, cleanupProduction } from '@/utils/initProduction';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProductionPerformanceMonitor from '@/components/utility/ProductionPerformanceMonitor';

// SPA Components - Progressive rollout with Predictive Prefetching
import SpaRouter from '@/components/spa/SpaRouter';
import LazyLoadManager from '@/components/spa/LazyLoadManager';
import OptimizedMotion from '@/components/spa/OptimizedMotion';
import SpaFeatureFlags from '@/components/spa/SpaFeatureFlags';
import SpaMonitoring from '@/components/spa/SpaMonitoring';
import { CriticalResourcePrefetch, PrefetchDebugger } from '@/components/spa/PrefetchUtils';

// Load fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function App({ Component, pageProps, router }) {
  // Initialize production features
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      initializeProduction({
        errorTracking: true,
        memoryMonitoring: true,
        performanceMonitoring: true,
        config: {
          // Override any default configs here if needed
        }
      });
    }
    
    // Log SPA components initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 SPA Components Initialized:', {
        SpaRouter: '✅ Active',
        SpaFeatureFlags: '✅ Active',
        LazyLoadManager: '✅ Active',
        OptimizedMotion: '✅ Active',
        SpaMonitoring: '✅ Active',
        currentRoute: router.pathname
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (process.env.NODE_ENV === 'production') {
        cleanupProduction();
      }
    };
  }, [router.pathname]);

  // Always use SessionProvider but with different session handling
  const publicPages = [
    '/purchase/success',
    '/checkout/success',
    '/models',
    '/insights',
    '/contact',
    '/about',
    '/',
    '/solutions',
    '/404'
  ];
  
  const isPublicPage = publicPages.some(page => 
    router.pathname === page || router.pathname.startsWith(page + '/')
  );

  // Define different transitions for different sections
  let variant = 'default';
  let transitionPreset = 'default';
  
  // Customize transitions based on route
  if (router.pathname.startsWith('/products')) {
    variant = 'slideLeft';
    transitionPreset = 'spring';
  } else if (router.pathname.startsWith('/services')) {
    variant = 'slideUp';
    transitionPreset = 'smooth';
  } else if (router.pathname === '/contact') {
    variant = 'fade';
    transitionPreset = 'slow';
  } else if (router.pathname === '/about') {
    variant = 'scale';
    transitionPreset = 'smooth';
  }

  const AppContent = (
    <ProductionPerformanceMonitor enabledInProduction={true}>
      <main className={`${inter.variable} ${playfair.variable}`}>
        <ErrorBoundary
          showDetails={process.env.NODE_ENV === 'development'}
        >
          {/* Critical Resource Prefetching for Lightning-Fast Navigation */}
          <CriticalResourcePrefetch />
          
          {/* Prefetch Debug Panel (Development Only) */}
          <PrefetchDebugger enabled={process.env.NODE_ENV === 'development'} />
          
          <AnimatePresence mode="wait">
            <PageTransition 
              key={router.route} 
              variant={variant}
              transitionPreset={transitionPreset}
            >
              <Component {...pageProps} />
            </PageTransition>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </ProductionPerformanceMonitor>
  );

  // SPA Provider Stack - Order is important for proper functionality:
  // 1. SpaMonitoring - Performance monitoring (outermost) - TEMPORARILY DISABLED
  // 2. SpaFeatureFlags - Feature flag system
  // 3. SpaRouter - Hybrid SPA routing
  // 4. LazyLoadManager - Component lazy loading
  // 5. OptimizedMotion - Performance-aware animations
  return (
    <SessionProvider session={pageProps.session}>
      <SpaMonitoring>
        <SpaFeatureFlags>
          <SpaRouter>
            <LazyLoadManager>
              <OptimizedMotion>
                {AppContent}
              </OptimizedMotion>
            </LazyLoadManager>
          </SpaRouter>
        </SpaFeatureFlags>
      </SpaMonitoring>
    </SessionProvider>
  );
}