// src/components/spa/LazyLoadManager.js - Intelligent Lazy Loading with Prefetch Integration
import { Suspense, lazy, useState, useEffect, createContext, useContext } from 'react';
import { useSpa } from './SpaRouter';
import { useRelatedPagesPrefetch, PREFETCH_STRATEGIES } from './PrefetchUtils';

const LazyLoadContext = createContext({
  loadedComponents: new Set(),
  loadingComponents: new Set(),
  loadComponent: () => {},
  isComponentLoaded: () => false
});

export const useLazyLoad = () => useContext(LazyLoadContext);

// Component loading priorities for optimal UX
const COMPONENT_PRIORITIES = {
  // Critical - Load immediately when needed
  CRITICAL: ['ExcelViewer', 'ModelCard', 'AdminDashboard'],
  // High - Load when user shows intent (hover, scroll)
  HIGH: ['RichTextEditor', 'Charts', 'Analytics'],
  // Medium - Load during idle time
  MEDIUM: ['Testimonials', 'SearchComponent', 'ContactForm'],
  // Low - Load only when absolutely necessary
  LOW: ['ExitIntentPopup', 'SocialProof', 'FounderCredibility']
};

// Lazy component definitions with intelligent loading
const createLazyComponent = (importFn, fallback, priority = 'MEDIUM') => {
  const LazyComponent = lazy(importFn);
  
  const ComponentWithSuspense = (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  ComponentWithSuspense.priority = priority;
  return ComponentWithSuspense;
};

// Optimized lazy components for SPA
export const LazyComponents = {
  // CRITICAL COMPONENTS - Excel System
  ExcelViewer: createLazyComponent(
    () => import('../ui/ExcelViewer/ExcelJSViewer'),
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading Excel Viewer...</div>
    </div>,
    'CRITICAL'
  ),

  ExcelPreview: createLazyComponent(
    () => import('../ui/ExcelPreview'),
    <div className="h-48 bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-gray-400">Loading Preview...</div>
    </div>,
    'CRITICAL'
  ),

  // ADMIN COMPONENTS - High Priority
  RichTextEditor: createLazyComponent(
    () => import('../ui/RichTextEditor'),
    <div className="h-32 bg-gray-50 border rounded animate-pulse">
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>,
    'HIGH'
  ),

  DashboardCharts: createLazyComponent(
    () => import('../admin/DashboardCharts'),
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
      ))}
    </div>,
    'HIGH'
  ),

  AdminAnalytics: createLazyComponent(
    () => import('../../pages/admin/analytics'),
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    </div>,
    'HIGH'
  ),

  // UI COMPONENTS - Medium Priority
  EnhancedTestimonials: createLazyComponent(
    () => import('../ui/EnhancedTestimonials'),
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    'MEDIUM'
  ),

  ModernCTA: createLazyComponent(
    () => import('../ui/ModernCTA'),
    <div className="py-16 bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
          <div className="h-12 bg-gray-700 rounded w-32 mx-auto"></div>
        </div>
      </div>
    </div>,
    'MEDIUM'
  ),

  SearchComponent: createLazyComponent(
    () => import('../ui/SearchComponent'),
    <div className="w-64 h-10 bg-gray-100 rounded animate-pulse"></div>,
    'MEDIUM'
  ),

  // LOW PRIORITY COMPONENTS
  ExitIntentPopup: createLazyComponent(
    () => import('../ui/ExitIntentPopup'),
    null,
    'LOW'
  ),

  SocialProof: createLazyComponent(
    () => import('../ui/SocialProof'),
    <div className="h-16 bg-gray-100 rounded animate-pulse"></div>,
    'LOW'
  )
};

export default function LazyLoadManager({ children }) {
  const { isSpaMode, prefetchPage, getRoutePriority } = useSpa();
  const [loadedComponents, setLoadedComponents] = useState(new Set());
  const [loadingComponents, setLoadingComponents] = useState(new Set());
  
  // Enable related pages prefetching
  useRelatedPagesPrefetch();

  // Preload critical components when entering SPA mode
  useEffect(() => {
    if (isSpaMode) {
      const preloadCritical = async () => {
        const criticalComponents = COMPONENT_PRIORITIES.CRITICAL;
        
        for (const componentName of criticalComponents) {
          if (!loadedComponents.has(componentName)) {
            loadComponent(componentName);
          }
        }
        
        // Also prefetch critical pages based on current context
        const criticalPages = [
          '/models',
          '/admin',
          '/insights'
        ];
        
        criticalPages.forEach(href => {
          const priority = getRoutePriority(href);
          if (priority <= 2) { // CRITICAL or HIGH priority
            prefetchPage(href, priority, 'component-load');
          }
        });
      };

      // Small delay to avoid blocking initial render
      setTimeout(preloadCritical, 100);
    }
  }, [isSpaMode, loadedComponents, getRoutePriority, prefetchPage]);

  // Intelligent component loading based on user interaction
  useEffect(() => {
    if (!isSpaMode) return;

    // Load high-priority components on user interaction
    const handleUserInteraction = () => {
      setTimeout(() => {
        COMPONENT_PRIORITIES.HIGH.forEach(componentName => {
          if (!loadedComponents.has(componentName)) {
            loadComponent(componentName);
          }
        });
      }, 500);
    };

    // Load medium-priority components during idle time
    const handleIdle = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          COMPONENT_PRIORITIES.MEDIUM.forEach(componentName => {
            if (!loadedComponents.has(componentName)) {
              loadComponent(componentName);
            }
          });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          COMPONENT_PRIORITIES.MEDIUM.forEach(componentName => {
            if (!loadedComponents.has(componentName)) {
              loadComponent(componentName);
            }
          });
        }, 2000);
      }
    };

    const events = ['mouseenter', 'touchstart', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    handleIdle();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isSpaMode, loadedComponents]);

  const loadComponent = async (componentName) => {
    if (loadedComponents.has(componentName) || loadingComponents.has(componentName)) {
      return;
    }

    setLoadingComponents(prev => new Set([...prev, componentName]));

    try {
      // Component is already lazily loaded through LazyComponents
      // This just tracks the loading state
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for state updates
      
      setLoadedComponents(prev => new Set([...prev, componentName]));
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
    } finally {
      setLoadingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(componentName);
        return newSet;
      });
    }
  };

  const isComponentLoaded = (componentName) => loadedComponents.has(componentName);

  const contextValue = {
    loadedComponents,
    loadingComponents,
    loadComponent,
    isComponentLoaded
  };

  return (
    <LazyLoadContext.Provider value={contextValue}>
      {children}
    </LazyLoadContext.Provider>
  );
}

// Hook for component-level lazy loading
export function useComponentLoader(componentName, priority = 'MEDIUM') {
  const { loadComponent, isComponentLoaded, loadingComponents } = useLazyLoad();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad && !isComponentLoaded(componentName)) {
      loadComponent(componentName);
    }
  }, [shouldLoad, componentName, loadComponent, isComponentLoaded]);

  const triggerLoad = () => setShouldLoad(true);
  const isLoading = loadingComponents.has(componentName);
  const isLoaded = isComponentLoaded(componentName);

  return { triggerLoad, isLoading, isLoaded };
}