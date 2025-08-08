// Performance optimization utilities for Zenith Capital Advisors frontend
// Head of Frontend Engineering - Advanced optimization techniques

import { debounce, throttle } from 'lodash';

// Core Web Vitals monitoring
export class WebVitalsMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      FCP: 1800, // First Contentful Paint - 1.8s
      LCP: 2500, // Largest Contentful Paint - 2.5s
      FID: 100,  // First Input Delay - 100ms
      CLS: 0.1,  // Cumulative Layout Shift - 0.1
      TTFB: 800  // Time to First Byte - 800ms
    };
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Web Vitals library integration
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(this.handleMetric.bind(this));
      onFID(this.handleMetric.bind(this));
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));
    });

    // Additional performance monitoring
    this.monitorResourceTiming();
    this.monitorMemoryUsage();
    this.monitorBundleSize();
  }

  handleMetric(metric) {
    this.metrics[metric.name] = metric.value;
    
    // Check if metric exceeds threshold
    if (this.thresholds[metric.name] && metric.value > this.thresholds[metric.name]) {
      console.warn(`Performance Warning: ${metric.name} (${metric.value}) exceeds threshold (${this.thresholds[metric.name]})`);
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        this.reportMetric(metric);
      }
    }
  }

  monitorResourceTiming() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      console.warn('Slow loading resources detected:', slowResources);
    }
  }

  monitorMemoryUsage() {
    if (!window.performance || !window.performance.memory) return;

    const memoryInfo = window.performance.memory;
    const memoryUsageMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
    
    if (memoryUsageMB > 100) { // 100MB threshold
      console.warn(`High memory usage detected: ${Math.round(memoryUsageMB)}MB`);
    }

    // Monitor memory leaks
    this.detectMemoryLeaks();
  }

  monitorBundleSize() {
    // Check if bundle chunks are within acceptable size
    const scripts = document.querySelectorAll('script[src*="/_next/static/chunks/"]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        fetch(src, { method: 'HEAD' })
          .then(response => {
            const size = response.headers.get('content-length');
            if (size && parseInt(size) > 250000) { // 250KB threshold
              console.warn(`Large bundle chunk detected: ${src} (${Math.round(size / 1024)}KB)`);
            }
          })
          .catch(() => {}); // Ignore errors
      }
    });
  }

  detectMemoryLeaks() {
    let baseline = null;
    const measurements = [];

    const measureMemory = () => {
      if (!window.performance.memory) return;
      
      const current = window.performance.memory.usedJSHeapSize;
      
      if (baseline === null) {
        baseline = current;
      } else {
        measurements.push(current);
        
        // Keep only last 10 measurements
        if (measurements.length > 10) {
          measurements.shift();
        }
        
        // Check for consistent memory growth
        if (measurements.length >= 5) {
          const trend = measurements.slice(-5);
          const isIncreasing = trend.every((val, i) => i === 0 || val > trend[i - 1]);
          
          if (isIncreasing && trend[trend.length - 1] - trend[0] > 10 * 1024 * 1024) {
            console.warn('Potential memory leak detected - consistent memory growth');
          }
        }
      }
    };

    // Measure every 30 seconds
    setInterval(measureMemory, 30000);
  }

  reportMetric(metric) {
    // Send to analytics or monitoring service
    if (window.gtag) {
      window.gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: metric.delta
      });
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

// Bundle size optimization utilities
export class BundleOptimizer {
  static createLazyComponent(importFn, fallback = null) {
    const LazyComponent = React.lazy(importFn);
    
    return React.forwardRef((props, ref) => (
      <React.Suspense fallback={fallback}>
        <LazyComponent ref={ref} {...props} />
      </React.Suspense>
    ));
  }

  static preloadRoute(href) {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  static preloadComponent(importFn) {
    // Preload component after idle time
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        importFn();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFn();
      }, 2000);
    }
  }

  static analyzeBundleSize() {
    if (process.env.NODE_ENV !== 'development') return;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const chunks = scripts.filter(script => 
      script.src.includes('/_next/static/chunks/')
    );

    console.group('Bundle Analysis');
    console.log(`Total chunks loaded: ${chunks.length}`);
    
    chunks.forEach(chunk => {
      const url = new URL(chunk.src);
      const filename = url.pathname.split('/').pop();
      console.log(`Chunk: ${filename}`);
    });
    
    console.groupEnd();
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static createOptimizedImageLoader(src, options = {}) {
    const {
      width = 800,
      quality = 75,
      format = 'webp',
      placeholder = 'blur'
    } = options;

    return {
      src: `${src}?w=${width}&q=${quality}&f=${format}`,
      placeholder,
      blurDataURL: this.generateBlurDataURL(src)
    };
  }

  static generateBlurDataURL(src) {
    // Generate a tiny blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 10, 10);
    
    return canvas.toDataURL();
  }

  static lazyLoadImages() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// React component optimization utilities
export class ReactOptimizer {
  static createMemoizedComponent(Component, areEqual = null) {
    return React.memo(Component, areEqual);
  }

  static createOptimizedCallback(callback, deps) {
    return React.useCallback(callback, deps);
  }

  static createOptimizedMemo(factory, deps) {
    return React.useMemo(factory, deps);
  }

  static preventUnnecessaryRenders(Component) {
    return React.memo(Component, (prevProps, nextProps) => {
      // Deep comparison for objects and arrays
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    });
  }

  static createVirtualizedList(items, renderItem, itemHeight = 50) {
    const [startIndex, setStartIndex] = React.useState(0);
    const [endIndex, setEndIndex] = React.useState(50);
    
    const containerRef = React.useRef(null);
    
    const handleScroll = React.useCallback(
      throttle((e) => {
        const scrollTop = e.target.scrollTop;
        const containerHeight = e.target.clientHeight;
        
        const newStartIndex = Math.floor(scrollTop / itemHeight);
        const newEndIndex = Math.min(
          newStartIndex + Math.ceil(containerHeight / itemHeight) + 5,
          items.length
        );
        
        setStartIndex(newStartIndex);
        setEndIndex(newEndIndex);
      }, 100),
      [itemHeight, items.length]
    );
    
    const visibleItems = items.slice(startIndex, endIndex);
    
    return {
      containerRef,
      handleScroll,
      visibleItems,
      startIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }
}

// Performance measurement utilities
export class PerformanceMeasurer {
  static measureRenderTime(componentName) {
    return function(WrappedComponent) {
      return React.forwardRef((props, ref) => {
        const startTime = React.useRef(performance.now());
        
        React.useEffect(() => {
          const endTime = performance.now();
          const renderTime = endTime - startTime.current;
          
          if (renderTime > 16.67) { // More than one frame (60fps)
            console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
          }
          
          // Reset for next render
          startTime.current = performance.now();
        });
        
        return <WrappedComponent ref={ref} {...props} />;
      });
    };
  }

  static debounceHandler(handler, delay = 300) {
    return debounce(handler, delay);
  }

  static throttleHandler(handler, delay = 100) {
    return throttle(handler, delay);
  }

  static measureAsync(name, asyncFn) {
    return async (...args) => {
      const startTime = performance.now();
      
      try {
        const result = await asyncFn(...args);
        const endTime = performance.now();
        
        console.log(`${name} completed in ${(endTime - startTime).toFixed(2)}ms`);
        return result;
      } catch (error) {
        const endTime = performance.now();
        console.error(`${name} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
        throw error;
      }
    };
  }
}

// Export singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();

// Export performance optimization hooks
export const usePerformanceOptimization = () => {
  React.useEffect(() => {
    // Initialize optimizations after component mount
    ImageOptimizer.lazyLoadImages();
    BundleOptimizer.analyzeBundleSize();
  }, []);
  
  const memoizedCallback = React.useCallback(
    PerformanceMeasurer.debounceHandler,
    []
  );
  
  return {
    memoizedCallback,
    measureRenderTime: PerformanceMeasurer.measureRenderTime,
    createVirtualizedList: ReactOptimizer.createVirtualizedList
  };
};

// Export all utilities
export {
  ImageOptimizer,
  ReactOptimizer,
  PerformanceMeasurer
};