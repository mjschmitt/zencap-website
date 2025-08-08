// src/pages/_app.js - With route-based transition customization
import "@/styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { Inter, Playfair_Display } from 'next/font/google';
import PageTransition from '@/components/PageTransitions';
import { useEffect } from 'react';
import { initializeProduction, cleanupProduction } from '@/utils/initProduction';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProductionPerformanceMonitor from '@/components/utility/ProductionPerformanceMonitor';

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
    
    // Cleanup on unmount
    return () => {
      if (process.env.NODE_ENV === 'production') {
        cleanupProduction();
      }
    };
  }, []);

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

  // Always wrap with SessionProvider for consistent authentication state
  return (
    <SessionProvider session={pageProps.session}>
      {AppContent}
    </SessionProvider>
  );
}