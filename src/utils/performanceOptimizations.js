// Critical Performance Optimizations for ZenCap Launch
// Target: Reduce bundle size by 40% and achieve sub-2s load times

import { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

// 1. AGGRESSIVE CODE SPLITTING
// Lazy load Excel viewer only when needed
export const LazyExcelViewer = dynamic(
  () => import('../components/ui/ExcelViewer/optimizations/ChunkedExcelProcessor').then(mod => ({
    default: memo(mod.ChunkedExcelProcessor)
  })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
          <div className="text-gray-600">Loading Financial Model...</div>
          <div className="text-sm text-gray-500">Processing Excel data</div>
        </div>
      </div>
    ),
    ssr: false
  }
);

// Lazy load TipTap editor only on admin pages
export const LazyRichTextEditor = dynamic(
  () => import('../components/ui/RichTextEditor'),
  {
    loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded"></div>,
    ssr: false
  }
);

// Lazy load charts only when needed
export const LazyCharts = dynamic(
  () => import('../components/admin/DashboardCharts'),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded"></div>,
    ssr: false
  }
);

// 2. OPTIMIZED FRAMER MOTION
// Load motion components only when animations are needed
export const LazyMotion = dynamic(
  () => import('framer-motion').then(mod => mod.LazyMotion),
  { ssr: false }
);

export const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
);

// 3. RESOURCE PRELOADING STRATEGY
export class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set();
    this.criticalResources = [
      '/js/exceljs.min.js',
      '/_next/static/chunks/framework-*.js',
      '/_next/static/chunks/main-*.js'
    ];
  }

  // Preload critical resources on page load
  preloadCriticalResources() {
    if (typeof window === 'undefined') return;

    this.criticalResources.forEach(resource => {
      if (!this.preloadedResources.has(resource)) {
        this.preloadResource(resource, 'script');
        this.preloadedResources.add(resource);
      }
    });
  }

  // Preload resource with different strategies
  preloadResource(href, as = 'script', crossorigin = 'anonymous') {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;

    // Add error handling
    link.onerror = () => {
      console.warn(`Failed to preload resource: ${href}`);
    };

    document.head.appendChild(link);
  }

  // Intelligent prefetching based on user behavior
  prefetchOnHover(href) {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  // Preconnect to external domains
  preconnectDomains() {
    const domains = [
      'https://fonts.googleapis.com',
      'https://www.google-analytics.com',
      'https://js.stripe.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

// 4. IMAGE OPTIMIZATION UTILITIES
export class ImageOptimizer {
  // Generate optimized image props
  static getOptimizedImageProps(src, options = {}) {
    const {
      width = 800,
      height,
      quality = 75,
      format = 'webp',
      sizes = '(max-width: 768px) 100vw, 50vw'
    } = options;

    return {
      src,
      width,
      height,
      quality,
      format,
      sizes,
      placeholder: 'blur',
      blurDataURL: this.generateBlurDataURL(width, height),
      loading: 'lazy',
      // Performance optimization: decode async
      decoding: 'async'
    };
  }

  // Generate blur placeholder
  static generateBlurDataURL(width = 10, height = 10) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL();
  }

  // Progressive image loading with intersection observer
  static setupProgressiveLoading() {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.classList.remove('loading');
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // Load images 50px before they enter viewport
        threshold: 0.01
      }
    );

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return imageObserver;
  }
}

// 5. PERFORMANCE MONITORING HOOKS
export function usePerformanceMonitoring(componentName) {
  const startTime = useMemo(() => performance.now(), []);

  const measurePerformance = useCallback((operationName) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 100) { // Log slow operations
      console.warn(`${componentName}: ${operationName} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, [componentName, startTime]);

  const measureAsync = useCallback(async (operationName, asyncFn) => {
    const opStartTime = performance.now();
    
    try {
      const result = await asyncFn();
      const duration = performance.now() - opStartTime;
      
      if (duration > 1000) { // Log slow async operations
        console.warn(`${componentName}: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - opStartTime;
      console.error(`${componentName}: ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, [componentName]);

  return { measurePerformance, measureAsync };
}

// 6. MEMORY OPTIMIZATION UTILITIES
export class MemoryOptimizer {
  constructor() {
    this.cleanupTasks = new Set();
    this.memoryThreshold = 100; // MB
  }

  // Register cleanup task
  registerCleanup(cleanupFn) {
    this.cleanupTasks.add(cleanupFn);
    
    return () => {
      this.cleanupTasks.delete(cleanupFn);
    };
  }

  // Check memory usage and trigger cleanup if needed
  checkMemoryUsage() {
    if (!performance.memory) return false;

    const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
    
    if (usedMB > this.memoryThreshold) {
      console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
      this.triggerCleanup();
      return true;
    }
    
    return false;
  }

  // Execute all registered cleanup tasks
  triggerCleanup() {
    console.log('Triggering memory cleanup...');
    
    this.cleanupTasks.forEach(cleanupFn => {
      try {
        cleanupFn();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Monitor memory usage continuously
  startMemoryMonitoring(interval = 30000) {
    const monitor = setInterval(() => {
      this.checkMemoryUsage();
    }, interval);

    return () => clearInterval(monitor);
  }
}

// 7. BUNDLE ANALYZER UTILITIES
export function analyzeBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const chunks = scripts.filter(script => 
    script.src.includes('/_next/static/chunks/')
  );

  console.group('📊 Bundle Analysis');
  console.log(`Total JavaScript chunks: ${chunks.length}`);
  
  chunks.forEach((chunk, index) => {
    const url = new URL(chunk.src);
    const filename = url.pathname.split('/').pop();
    const size = chunk.getAttribute('data-size') || 'Unknown';
    console.log(`${index + 1}. ${filename} (${size})`);
  });
  
  console.groupEnd();

  // Performance recommendations
  if (chunks.length > 10) {
    console.warn('⚠️ Too many JavaScript chunks. Consider further code splitting.');
  }
}

// 8. CRITICAL CSS UTILITIES
export class CriticalCSSOptimizer {
  // Extract critical CSS for above-the-fold content
  static extractCriticalCSS() {
    if (typeof window === 'undefined') return '';

    const criticalElements = document.querySelectorAll([
      'header',
      'nav',
      '.hero',
      '.above-fold',
      '[data-critical]'
    ].join(','));

    const criticalStyles = [];
    const stylesheets = Array.from(document.styleSheets);

    stylesheets.forEach(stylesheet => {
      try {
        const rules = Array.from(stylesheet.cssRules || []);
        
        rules.forEach(rule => {
          if (rule.type === CSSRule.STYLE_RULE) {
            criticalElements.forEach(element => {
              if (element.matches && element.matches(rule.selectorText)) {
                criticalStyles.push(rule.cssText);
              }
            });
          }
        });
      } catch (e) {
        // Skip external stylesheets due to CORS
      }
    });

    return criticalStyles.join('\n');
  }

  // Inline critical CSS
  static inlineCriticalCSS(css) {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.innerHTML = css;
    style.setAttribute('data-critical', 'true');
    
    const firstLink = document.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      firstLink.parentNode.insertBefore(style, firstLink);
    } else {
      document.head.appendChild(style);
    }
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  const resourcePreloader = new ResourcePreloader();
  const memoryOptimizer = new MemoryOptimizer();

  // Preload critical resources
  resourcePreloader.preloadCriticalResources();
  resourcePreloader.preconnectDomains();

  // Setup progressive image loading
  ImageOptimizer.setupProgressiveLoading();

  // Start memory monitoring
  const stopMemoryMonitoring = memoryOptimizer.startMemoryMonitoring();

  // Bundle analysis in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(analyzeBundleSize, 2000);
  }

  // Return cleanup function
  return () => {
    stopMemoryMonitoring();
  };
}

// Export singleton instances
export const resourcePreloader = new ResourcePreloader();
export const memoryOptimizer = new MemoryOptimizer();