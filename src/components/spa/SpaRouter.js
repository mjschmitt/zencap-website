// src/components/spa/SpaRouter.js - Hybrid SPA Router with Intelligent Predictive Prefetching
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const SpaContext = createContext({
  isSpaMode: false,
  toggleSpaMode: () => {},
  prefetchedPages: new Set(),
  navigationState: 'idle',
  prefetchCache: new Map(),
  prefetchQueue: [],
  viewportLinks: new Set()
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

// Prefetch Priority System
const PREFETCH_PRIORITIES = {
  CRITICAL: 1, // Models and admin pages - prefetch immediately
  HIGH: 2,     // Insights and key pages - prefetch on hover
  MEDIUM: 3,   // Secondary pages - prefetch in viewport
  LOW: 4       // Static pages - prefetch during idle
};

// Route priority mapping for intelligent prefetching
const ROUTE_PRIORITIES = {
  '/models': PREFETCH_PRIORITIES.CRITICAL,
  '/models/[slug]': PREFETCH_PRIORITIES.CRITICAL,
  '/admin': PREFETCH_PRIORITIES.CRITICAL,
  '/admin/[slug]': PREFETCH_PRIORITIES.CRITICAL,
  '/insights': PREFETCH_PRIORITIES.HIGH,
  '/insights/[slug]': PREFETCH_PRIORITIES.HIGH,
  '/solutions': PREFETCH_PRIORITIES.MEDIUM,
  '/solutions/[slug]': PREFETCH_PRIORITIES.MEDIUM,
  '/about': PREFETCH_PRIORITIES.LOW,
  '/contact': PREFETCH_PRIORITIES.LOW,
  '/privacy': PREFETCH_PRIORITIES.LOW,
  '/terms': PREFETCH_PRIORITIES.LOW
};

// Prefetch configuration
const PREFETCH_CONFIG = {
  HOVER_DELAY: 150, // ms delay before prefetching on hover
  VIEWPORT_THRESHOLD: 0.1, // Intersection ratio for viewport prefetching
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes cache TTL
  MAX_CONCURRENT: 3, // Maximum concurrent prefetches
  RESPECT_DATA_SAVER: true
};

export default function SpaRouter({ children }) {
  const router = useRouter();
  const [isSpaMode, setIsSpaMode] = useState(false);
  const [prefetchedPages, setPrefetchedPages] = useState(new Set());
  const [navigationState, setNavigationState] = useState('idle');
  const [prefetchCache, setPrefetchCache] = useState(new Map());
  const [prefetchQueue, setPrefetchQueue] = useState([]);
  const [viewportLinks, setViewportLinks] = useState(new Set());
  const [activePrefetches, setActivePrefetches] = useState(0);
  
  const hoverTimeouts = useRef(new Map());
  const intersectionObserver = useRef(null);
  const observedElements = useRef(new Set());

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

  // Check if user prefers reduced data usage
  const respectsDataSaver = useCallback(() => {
    if (!PREFETCH_CONFIG.RESPECT_DATA_SAVER) return false;
    
    // Check for data saver preference
    if (navigator.connection) {
      return navigator.connection.saveData || 
             navigator.connection.effectiveType === 'slow-2g' ||
             navigator.connection.effectiveType === '2g';
    }
    
    // Check for reduced motion preference as proxy
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Get route priority for intelligent prefetching
  const getRoutePriority = useCallback((href) => {
    const cleanHref = href.split('?')[0].split('#')[0];
    
    // Check exact matches first
    if (ROUTE_PRIORITIES[cleanHref]) {
      return ROUTE_PRIORITIES[cleanHref];
    }
    
    // Check pattern matches
    for (const [pattern, priority] of Object.entries(ROUTE_PRIORITIES)) {
      if (pattern.includes('[slug]')) {
        const basePattern = pattern.replace('/[slug]', '');
        if (cleanHref.startsWith(basePattern) && cleanHref !== basePattern) {
          return priority;
        }
      }
    }
    
    return PREFETCH_PRIORITIES.LOW;
  }, []);

  // Check if URL should be prefetched
  const shouldPrefetch = useCallback((href) => {
    if (!href || typeof href !== 'string') return false;
    
    // Don't prefetch external links
    if (href.startsWith('http') && !href.startsWith(window.location.origin)) {
      return false;
    }
    
    // Don't prefetch if explicitly disabled
    if (href.includes('noprefetch')) return false;
    
    // Don't prefetch if user prefers reduced data
    if (respectsDataSaver()) return false;
    
    // Don't prefetch if already prefetched recently
    const cacheEntry = prefetchCache.get(href);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < PREFETCH_CONFIG.CACHE_TTL) {
      return false;
    }
    
    return true;
  }, [prefetchCache, respectsDataSaver]);

  // Advanced prefetching with priority queue
  const prefetchPage = useCallback(async (href, priority = PREFETCH_PRIORITIES.MEDIUM, source = 'manual') => {
    if (!shouldPrefetch(href) || prefetchedPages.has(href)) return;
    
    // Limit concurrent prefetches
    if (activePrefetches >= PREFETCH_CONFIG.MAX_CONCURRENT) {
      setPrefetchQueue(prev => [...prev, { href, priority, source }].sort((a, b) => a.priority - b.priority));
      return;
    }
    
    try {
      setActivePrefetches(prev => prev + 1);
      if (source === 'manual') setNavigationState('prefetching');
      
      // Prefetch the page
      await router.prefetch(href);
      
      // Update cache and state
      setPrefetchedPages(prev => new Set([...prev, href]));
      setPrefetchCache(prev => new Map([...prev, [href, { timestamp: Date.now(), source, priority }]]));
      
      console.debug(`🚀 Prefetched: ${href} (${source}, priority: ${priority})`);
    } catch (error) {
      console.warn('Prefetch failed for:', href, error);
    } finally {
      setActivePrefetches(prev => prev - 1);
      if (source === 'manual') setNavigationState('idle');
      
      // Process next item in queue
      setPrefetchQueue(prev => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          setTimeout(() => prefetchPage(next.href, next.priority, next.source), 50);
          return rest;
        }
        return prev;
      });
    }
  }, [router, shouldPrefetch, prefetchedPages, activePrefetches, prefetchCache]);

  // Clean up stale cache entries
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setPrefetchCache(prev => {
        const cleaned = new Map();
        for (const [href, entry] of prev.entries()) {
          if (now - entry.timestamp < PREFETCH_CONFIG.CACHE_TTL) {
            cleaned.set(href, entry);
          }
        }
        return cleaned;
      });
    }, 60000); // Clean every minute
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Viewport-based prefetching with Intersection Observer
  useEffect(() => {
    if (!isSpaMode) return;
    
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const link = entry.target;
          const href = link.getAttribute('href');
          
          if (entry.isIntersecting && href) {
            const priority = getRoutePriority(href);
            
            // Only prefetch high-priority routes in viewport
            if (priority <= PREFETCH_PRIORITIES.HIGH) {
              prefetchPage(href, priority, 'viewport');
            }
            
            setViewportLinks(prev => new Set([...prev, href]));
          } else if (!entry.isIntersecting && href) {
            setViewportLinks(prev => {
              const newSet = new Set(prev);
              newSet.delete(href);
              return newSet;
            });
          }
        });
      },
      {
        threshold: PREFETCH_CONFIG.VIEWPORT_THRESHOLD,
        rootMargin: '50px'
      }
    );
    
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, [isSpaMode, getRoutePriority, prefetchPage]);

  // Auto-observe links for viewport prefetching
  const observeLink = useCallback((element) => {
    if (!element || !intersectionObserver.current || observedElements.current.has(element)) {
      return;
    }
    
    const href = element.getAttribute('href');
    if (shouldPrefetch(href)) {
      intersectionObserver.current.observe(element);
      observedElements.current.add(element);
    }
  }, [shouldPrefetch]);

  const unobserveLink = useCallback((element) => {
    if (!element || !intersectionObserver.current) return;
    
    intersectionObserver.current.unobserve(element);
    observedElements.current.delete(element);
  }, []);

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

  // Context value with enhanced prefetching capabilities
  const contextValue = {
    isSpaMode,
    toggleSpaMode: () => setIsSpaMode(!isSpaMode),
    prefetchedPages,
    navigationState,
    prefetchCache,
    prefetchQueue,
    viewportLinks,
    prefetchPage,
    navigateInSpa,
    observeLink,
    unobserveLink,
    getRoutePriority,
    shouldPrefetch,
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

// Enhanced Link component with intelligent prefetching
export function SpaLink({ 
  href, 
  children, 
  prefetch = true, 
  className, 
  priority,
  noPrefetch = false,
  ...props 
}) {
  const { 
    isSpaMode, 
    navigateInSpa, 
    prefetchPage, 
    observeLink, 
    unobserveLink,
    getRoutePriority 
  } = useSpa();
  
  const linkRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  
  // Auto-determine priority if not specified
  const linkPriority = priority || getRoutePriority(href);
  
  useEffect(() => {
    const linkElement = linkRef.current;
    if (!linkElement || noPrefetch || !prefetch || !isSpaMode) return;
    
    // Observe for viewport prefetching
    observeLink(linkElement);
    
    return () => {
      unobserveLink(linkElement);
    };
  }, [href, noPrefetch, prefetch, isSpaMode, observeLink, unobserveLink]);

  const handleClick = async (e) => {
    e.preventDefault();
    
    // Clear any pending hover prefetch
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    await navigateInSpa(href);
  };

  const handleMouseEnter = () => {
    if (!prefetch || !isSpaMode || noPrefetch) return;
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Prefetch with delay for hover intent
    hoverTimeoutRef.current = setTimeout(() => {
      prefetchPage(href, linkPriority, 'hover');
    }, PREFETCH_CONFIG.HOVER_DELAY);
  };
  
  const handleMouseLeave = () => {
    // Clear timeout if user leaves before delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };
  
  // Add rel attribute for external links and prefetch hints
  const relAttribute = (() => {
    const rels = [];
    
    if (noPrefetch) rels.push('noprefetch');
    if (href?.startsWith('http') && !href.startsWith(window.location?.origin)) {
      rels.push('noopener', 'noreferrer');
    }
    
    return rels.length > 0 ? rels.join(' ') : undefined;
  })();

  return (
    <a
      ref={linkRef}
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      rel={relAttribute}
      {...props}
    >
      {children}
    </a>
  );
}