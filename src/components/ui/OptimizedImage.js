// src/components/ui/OptimizedImage.js
import Image from 'next/image';
import { useState } from 'react';

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
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

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
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={typeof window !== 'undefined' ? generateBlurDataURL(20, 20) : undefined}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
      )}
    </div>
  );
};

export default OptimizedImage;