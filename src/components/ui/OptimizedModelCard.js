// src/components/ui/OptimizedModelCard.js - SPA-Optimized Model Card
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSpa, SpaLink } from '../spa/SpaRouter';
import { OptimizedMotionCard } from '../spa/OptimizedMotion';
import { useComponentLoader } from '../spa/LazyLoadManager';

export default function OptimizedModelCard({ model, featured = false, priority = 'medium' }) {
  const { isSpaMode } = useSpa();
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { triggerLoad, isLoaded } = useComponentLoader('ModelCard', 'HIGH');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          triggerLoad();
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [triggerLoad]);

  // Enhanced model data with defaults
  const {
    id,
    title = 'Financial Model',
    description = 'Professional financial analysis tool',
    price = 0,
    originalPrice,
    category = 'Financial',
    image = '/images/models/default-model.jpg',
    slug = id || 'model',
    features = [],
    isNew = false,
    isBestseller = false
  } = model || {};

  // Price formatting
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Card content component
  const CardContent = () => (
    <>
      {/* Image Section with Lazy Loading */}
      <div className={`relative overflow-hidden ${featured ? 'h-48' : 'h-40'}`}>
        {isVisible && (
          <Image
            src={image}
            alt={title}
            fill
            className={`object-cover transition-all duration-700 ${
              imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
            }`}
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            priority={featured && priority === 'high'}
            quality={85}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        
        {/* Image Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
              NEW
            </span>
          )}
          {isBestseller && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
              BESTSELLER
            </span>
          )}
          {originalPrice && originalPrice > price && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              SALE
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            category === 'Private Equity'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className={`font-bold text-navy-700 dark:text-white mb-3 line-clamp-2 ${
            featured ? 'text-xl' : 'text-lg'
          }`}>
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {description.replace(/<[^>]*>/g, '').substring(0, 120)}...
          </p>

          {/* Features List */}
          {features.length > 0 && (
            <div className="mb-4">
              <ul className="space-y-1">
                {features.slice(0, featured ? 4 : 3).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <svg className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-navy-700 dark:text-white ${
                featured ? 'text-2xl' : 'text-xl'
              }`}>
                {formatPrice(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-gray-500 line-through text-sm">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            
            {originalPrice && originalPrice > price && (
              <span className="text-green-600 font-medium text-sm">
                Save {Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className="space-y-2">
            {isSpaMode ? (
              <SpaLink
                href={`/models/${slug}`}
                className="block w-full bg-teal-500 hover:bg-teal-600 text-white text-center py-2 px-4 rounded-md font-medium transition-colors duration-200"
              >
                View Details
              </SpaLink>
            ) : (
              <Link
                href={`/models/${slug}`}
                className="block w-full bg-teal-500 hover:bg-teal-600 text-white text-center py-2 px-4 rounded-md font-medium transition-colors duration-200"
              >
                View Details
              </Link>
            )}
            
            <button className="w-full bg-navy-700 hover:bg-navy-800 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200">
              Quick Buy - {formatPrice(price)}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Render optimized card
  return (
    <div ref={cardRef} className="h-full">
      {isSpaMode ? (
        <OptimizedMotionCard
          className={`bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col ${
            featured ? 'ring-2 ring-teal-500' : ''
          }`}
        >
          <CardContent />
        </OptimizedMotionCard>
      ) : (
        <div
          className={`bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col ${
            featured ? 'ring-2 ring-teal-500' : ''
          }`}
        >
          <CardContent />
        </div>
      )}
    </div>
  );
}

// Skeleton loader for model cards
export function OptimizedModelCardSkeleton({ featured = false }) {
  return (
    <div className={`bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col animate-pulse`}>
      <div className={`bg-gray-200 dark:bg-gray-700 ${featured ? 'h-48' : 'h-40'}`}></div>
      <div className="p-6 flex-1">
        <div className={`h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 ${featured ? 'w-3/4' : 'w-2/3'}`}></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6"></div>
        
        {/* Feature skeleton */}
        <div className="space-y-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}