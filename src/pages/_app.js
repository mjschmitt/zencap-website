// src/pages/_app.js - With route-based transition customization
import "@/styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { Inter, Playfair_Display } from 'next/font/google';
import PageTransition from '@/components/PageTransitions';
import { useEffect } from 'react';
import { initializeProduction, cleanupProduction } from '@/utils/initProduction';
import { ErrorBoundary } from '@/utils/errorTracking';

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
    <main className={`${inter.variable} ${playfair.variable}`}>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We apologize for the inconvenience. Please refresh the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        }
        errorContext={{ route: router.route }}
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
  );

  // Always wrap with SessionProvider for consistent authentication state
  return (
    <SessionProvider session={pageProps.session}>
      {AppContent}
    </SessionProvider>
  );
}