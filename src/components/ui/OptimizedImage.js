// src/components/ui/OptimizedImage.js
import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  sizes = '100vw',
  placeholder = 'blur',
  quality = 75,
  lazy = true,
  fadeIn = true,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy || priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate a simple blur placeholder based on dimensions
  const generateBlurDataURL = (w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#1a3a5f');
    gradient.addColorStop(1, '#046B4E');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isVisible) return;

    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.unobserve(entry.target);
          }
        },
        {
          rootMargin: '50px', // Load image 50px before it's visible
          threshold: 0.1
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsVisible(true);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isVisible]);

  const handleLoad = useCallback((e) => {
    setIsLoading(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(e);
  }, [onError]);

  // Optimized responsive sizes calculation with mobile-first approach
  const getOptimizedSizes = useCallback(() => {
    if (sizes !== '100vw') return sizes;
    
    // Mobile-first responsive sizes for better bandwidth usage
    if (width) {
      if (width <= 640) return '100vw'; // Full width on mobile
      if (width <= 768) return '(max-width: 640px) 100vw, (max-width: 768px) 80vw'; // Mobile optimization
      if (width <= 1024) return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 40vw';
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
    }
    
    return '100vw';
  }, [sizes, width]);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-all duration-500 ${
            fadeIn 
              ? (isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100')
              : ''
          }`}
          priority={priority}
          quality={quality}
          sizes={getOptimizedSizes()}
          placeholder={placeholder}
          blurDataURL={typeof window !== 'undefined' ? generateBlurDataURL(20, 20) : undefined}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : (
        // Placeholder while waiting for intersection
        <div 
          className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse"
          style={{ width, height }}
          aria-label={`Loading ${alt}`}
        />
      )}
      
      {/* Enhanced loading skeleton */}
      {isVisible && isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent dark:via-gray-600 opacity-30 animate-shimmer" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;