// src/components/spa/PrefetchUtils.js - Advanced Prefetching Utilities
import { useEffect, useCallback, useRef } from 'react';
import { useSpa } from './SpaRouter';

// Prefetch strategies
export const PREFETCH_STRATEGIES = {
  IMMEDIATE: 'immediate',
  ON_HOVER: 'hover', 
  IN_VIEWPORT: 'viewport',
  ON_IDLE: 'idle',
  ON_INTERACTION: 'interaction'
};

// Hook for intelligent link prefetching
export function usePrefetchOnHover(delay = 150) {
  const { prefetchPage, getRoutePriority, shouldPrefetch } = useSpa();
  const timeoutRef = useRef(null);
  
  const prefetchOnHover = useCallback((href) => {
    if (!shouldPrefetch(href)) return { onMouseEnter: null, onMouseLeave: null };
    
    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        const priority = getRoutePriority(href);
        prefetchPage(href, priority, 'hover');
      }, delay);
    };
    
    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    return { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave };
  }, [prefetchPage, getRoutePriority, shouldPrefetch, delay]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return prefetchOnHover;
}

// Hook for prefetching multiple links with different strategies
export function useBatchPrefetch(links = [], strategy = PREFETCH_STRATEGIES.ON_IDLE) {
  const { prefetchPage, getRoutePriority, isSpaMode } = useSpa();
  
  useEffect(() => {
    if (!isSpaMode || links.length === 0) return;
    
    const executePrefetch = () => {
      links.forEach(({ href, customPriority }) => {
        if (href) {
          const priority = customPriority || getRoutePriority(href);
          prefetchPage(href, priority, strategy);
        }
      });
    };
    
    switch (strategy) {
      case PREFETCH_STRATEGIES.IMMEDIATE:
        executePrefetch();
        break;
        
      case PREFETCH_STRATEGIES.ON_IDLE:
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(executePrefetch, { timeout: 2000 });
        } else {
          setTimeout(executePrefetch, 1000);
        }
        break;
        
      case PREFETCH_STRATEGIES.ON_INTERACTION:
        const handleInteraction = () => {
          executePrefetch();
          // Remove listeners after first interaction
          ['mousedown', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, handleInteraction);
          });
        };
        
        ['mousedown', 'touchstart', 'keydown'].forEach(event => {
          document.addEventListener(event, handleInteraction, { once: true, passive: true });
        });
        
        return () => {
          ['mousedown', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, handleInteraction);
          });
        };
        
      default:
        break;
    }
  }, [links, strategy, prefetchPage, getRoutePriority, isSpaMode]);
}

// Hook for prefetching related pages based on current route
export function useRelatedPagesPrefetch() {
  const { prefetchPage, getRoutePriority, isSpaMode } = useSpa();
  const { useRouter } = require('next/router');
  const router = useRouter();
  
  // Define related pages for each route
  const relatedPages = {
    '/models': [
      '/models/private-equity-models',
      '/models/public-equity-models',
      '/insights'
    ],
    '/models/private-equity-models': [
      '/models/multifamily-development-model',
      '/models/mixed-use-development-model',
      '/models/commercial-real-estate-model'
    ],
    '/models/public-equity-models': [
      '/models/tesla-dcf-model',
      '/models/amazon-dcf-model',
      '/models/advanced-dcf-model'
    ],
    '/insights': [
      '/models',
      '/solutions',
      '/about'
    ],
    '/admin': [
      '/admin/analytics',
      '/admin/revenue-dashboard',
      '/admin/error-dashboard'
    ]
  };
  
  useEffect(() => {
    if (!isSpaMode) return;
    
    const currentPath = router.pathname;
    const related = relatedPages[currentPath] || [];
    
    if (related.length === 0) return;
    
    // Prefetch related pages during idle time
    const prefetchRelated = () => {
      related.forEach(href => {
        const priority = getRoutePriority(href);
        prefetchPage(href, priority, 'related');
      });
    };
    
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchRelated, { timeout: 3000 });
    } else {
      setTimeout(prefetchRelated, 1500);
    }
  }, [router.pathname, prefetchPage, getRoutePriority, isSpaMode]);
}

// Component for critical resource prefetching
export function CriticalResourcePrefetch() {
  const { isSpaMode } = useSpa();
  
  useEffect(() => {
    if (!isSpaMode) return;
    
    // Prefetch critical resources that are commonly needed
    const criticalResources = [
      // API endpoints that are frequently used
      { href: '/api/models', as: 'fetch' },
      { href: '/api/insights', as: 'fetch' },
      
      // Critical CSS and JS bundles
      { href: '/_next/static/chunks/models.js', as: 'script' },
      { href: '/_next/static/chunks/admin.js', as: 'script' }
    ];
    
    criticalResources.forEach(({ href, as }) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = as;
      link.href = href;
      document.head.appendChild(link);
    });
    
    return () => {
      // Cleanup prefetch links on unmount
      criticalResources.forEach(({ href }) => {
        const links = document.querySelectorAll(`link[href="${href}"]`);
        links.forEach(link => link.remove());
      });
    };
  }, [isSpaMode]);
  
  return null;
}

// Performance monitoring for prefetching
export function usePrefetchMetrics() {
  const { prefetchCache, prefetchQueue, viewportLinks, navigationState } = useSpa();
  
  const metrics = {
    totalPrefetched: prefetchCache.size,
    queueLength: prefetchQueue.length,
    viewportLinksCount: viewportLinks.size,
    isActivelyPrefetching: navigationState === 'prefetching',
    
    // Get prefetch sources breakdown
    getSourceBreakdown: () => {
      const breakdown = {};
      for (const [, entry] of prefetchCache.entries()) {
        breakdown[entry.source] = (breakdown[entry.source] || 0) + 1;
      }
      return breakdown;
    },
    
    // Get priority breakdown
    getPriorityBreakdown: () => {
      const breakdown = {};
      for (const [, entry] of prefetchCache.entries()) {
        breakdown[entry.priority] = (breakdown[entry.priority] || 0) + 1;
      }
      return breakdown;
    },
    
    // Get cache hit ratio (simplified)
    getCacheEfficiency: () => {
      return prefetchCache.size > 0 ? (prefetchCache.size / (prefetchCache.size + prefetchQueue.length)) : 0;
    }
  };
  
  return metrics;
}

// Development helper for prefetch debugging
export function PrefetchDebugger({ enabled = false }) {
  const metrics = usePrefetchMetrics();
  const { prefetchCache } = useSpa();
  
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;
    
    const logMetrics = () => {
      console.group('🚀 Prefetch Metrics');
      console.log('Total Prefetched:', metrics.totalPrefetched);
      console.log('Queue Length:', metrics.queueLength);
      console.log('Viewport Links:', metrics.viewportLinksCount);
      console.log('Source Breakdown:', metrics.getSourceBreakdown());
      console.log('Priority Breakdown:', metrics.getPriorityBreakdown());
      console.log('Cache Efficiency:', `${(metrics.getCacheEfficiency() * 100).toFixed(1)}%`);
      console.log('Cached Pages:', Array.from(prefetchCache.keys()));
      console.groupEnd();
    };
    
    // Log metrics every 10 seconds
    const interval = setInterval(logMetrics, 10000);
    
    return () => clearInterval(interval);
  }, [enabled, metrics, prefetchCache]);
  
  if (!enabled || process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>Prefetched: {metrics.totalPrefetched}</div>
      <div>Queue: {metrics.queueLength}</div>
      <div>Viewport: {metrics.viewportLinksCount}</div>
      <div>Efficiency: {(metrics.getCacheEfficiency() * 100).toFixed(1)}%</div>
    </div>
  );
}