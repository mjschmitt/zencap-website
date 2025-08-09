// src/components/spa/SpaRouter.js - Hybrid SPA Router System
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const SpaContext = createContext({
  isSpaMode: false,
  toggleSpaMode: () => {},
  prefetchedPages: new Set(),
  navigationState: 'idle'
});

export const useSpa = () => useContext(SpaContext);

// SPA Routes - Pages that benefit most from SPA behavior
const SPA_ROUTES = [
  '/models',
  '/models/[slug]',
  '/admin',
  '/admin/analytics',
  '/admin/error-dashboard',
  '/admin/revenue-dashboard',
  '/insights',
  '/insights/[slug]'
];

// Routes that should remain SSR/SSG for SEO
const SSR_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/solutions',
  '/solutions/[slug]',
  '/privacy',
  '/terms'
];

export default function SpaRouter({ children }) {
  const router = useRouter();
  const [isSpaMode, setIsSpaMode] = useState(false);
  const [prefetchedPages, setPrefetchedPages] = useState(new Set());
  const [navigationState, setNavigationState] = useState('idle');

  // Determine if current route should use SPA behavior
  useEffect(() => {
    const currentRoute = router.pathname;
    const shouldUseSpa = SPA_ROUTES.some(route => {
      if (route.includes('[slug]')) {
        return currentRoute.startsWith(route.replace('/[slug]', ''));
      }
      return currentRoute === route;
    });
    
    setIsSpaMode(shouldUseSpa);
  }, [router.pathname]);

  // Advanced prefetching for SPA routes
  const prefetchPage = async (href) => {
    if (prefetchedPages.has(href)) return;
    
    try {
      setNavigationState('prefetching');
      await router.prefetch(href);
      setPrefetchedPages(prev => new Set([...prev, href]));
    } catch (error) {
      console.warn('Prefetch failed for:', href, error);
    } finally {
      setNavigationState('idle');
    }
  };

  // Intelligent navigation for SPA routes
  const navigateInSpa = async (href, options = {}) => {
    if (!isSpaMode) {
      // Use standard Next.js navigation for SSR routes
      return router.push(href, undefined, options);
    }

    try {
      setNavigationState('navigating');
      
      // For SPA routes, use optimized navigation
      await router.push(href, undefined, {
        shallow: options.shallow || false,
        scroll: options.scroll !== false,
        ...options
      });
    } catch (error) {
      console.error('SPA navigation failed:', error);
      // Fallback to standard navigation
      window.location.href = href;
    } finally {
      setNavigationState('idle');
    }
  };

  // Context value
  const contextValue = {
    isSpaMode,
    toggleSpaMode: () => setIsSpaMode(!isSpaMode),
    prefetchedPages,
    navigationState,
    prefetchPage,
    navigateInSpa,
    isRouteOptimizedForSpa: (route) => SPA_ROUTES.includes(route),
    isRouteSsr: (route) => SSR_ROUTES.includes(route)
  };

  return (
    <SpaContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {isSpaMode ? (
          <motion.div
            key={router.route}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1] // Custom easing for smooth feel
            }}
            className="spa-page-container"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key={router.route}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="ssr-page-container"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </SpaContext.Provider>
  );
}

// Hook for SPA-optimized Link component
export function useSpaLink() {
  const { isSpaMode, navigateInSpa, prefetchPage } = useSpa();
  
  return {
    navigate: navigateInSpa,
    prefetch: prefetchPage,
    isSpaMode
  };
}

// Enhanced Link component for hybrid behavior
export function SpaLink({ href, children, prefetch = true, className, ...props }) {
  const { isSpaMode, navigateInSpa, prefetchPage } = useSpa();

  const handleClick = async (e) => {
    e.preventDefault();
    await navigateInSpa(href);
  };

  const handleMouseEnter = () => {
    if (prefetch && isSpaMode) {
      prefetchPage(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}