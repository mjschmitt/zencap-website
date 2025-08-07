import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Button from './Button';
import Card from './Card';

export default function ModelCard({ 
  model, 
  featured = false, 
  className = '',
  onAddToCart 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine if model is available or coming soon
  const isComingSoon = !model.is_available || model.status === 'coming_soon';
  
  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Contact for Pricing';
    return `$${price.toLocaleString()}`;
  };

  // Truncate description
  const truncateDescription = (text, length = featured ? 150 : 120) => {
    if (!text) return 'Professional financial model for investment analysis.';
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
  };

  return (
    <motion.div
      className={`group h-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`
        h-full overflow-hidden transition-all duration-300 ease-out
        ${isHovered ? 'shadow-xl transform -translate-y-2 scale-[1.02]' : 'shadow-sm hover:shadow-lg'}
        bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700
        ${isHovered ? 'border-teal-200 dark:border-teal-500' : ''}
      `}>
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <Link href={`/models/${model.slug}`}>
            <div className={`relative ${featured ? 'h-56' : 'h-48'} bg-gray-100 dark:bg-navy-700 overflow-hidden`}>
              {model.thumbnail_url ? (
                <>
                  <Image 
                    src={model.thumbnail_url} 
                    alt={model.title}
                    fill
                    className={`
                      object-cover transition-all duration-500 ease-out
                      ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                      ${isHovered ? 'scale-110' : 'scale-100'}
                    `}
                    sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
                    quality={80}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 dark:bg-navy-700 animate-pulse" />
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-navy-700">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              )}
              
              {/* Overlay gradient on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Coming Soon Badge */}
              {isComingSoon && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Featured Badge */}
              {featured && !isComingSoon && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Featured
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Content Section */}
        <div className={`p-${featured ? '6' : '5'} flex flex-col flex-grow`}>
          {/* Header with Category and Price */}
          <div className="flex items-center justify-between mb-3">
            <span className={`
              inline-block px-2 py-1 rounded-full text-xs font-medium
              ${model.category === 'Private Equity' 
                ? 'bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300' 
                : 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
              }
            `}>
              {model.category}
            </span>
            <span className={`font-bold ${featured ? 'text-xl' : 'text-lg'} ${isComingSoon ? 'text-gray-500' : 'text-teal-500'}`}>
              {isComingSoon ? 'TBA' : formatPrice(model.price)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/models/${model.slug}`}>
            <h3 className={`
              ${featured ? 'text-xl' : 'text-lg'} font-bold mb-3 cursor-pointer transition-colors
              text-navy-700 dark:text-white hover:text-teal-600 dark:hover:text-teal-400
              ${isHovered ? 'text-teal-600 dark:text-teal-400' : ''}
            `}>
              {model.title}
            </h3>
          </Link>

          {/* Description */}
          <p className={`
            text-gray-600 dark:text-gray-300 mb-4 flex-grow
            ${featured ? 'text-base' : 'text-sm'}
          `}>
            {truncateDescription(model.description, featured ? 180 : 120)}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 mt-auto">
            <Button
              href={`/models/${model.slug}`}
              variant="ghost"
              size="sm"
              className={`${featured ? 'text-sm' : 'text-xs'} flex-shrink-0`}
            >
              View Details
            </Button>

            {!isComingSoon && (
              <Button
                href={`/checkout?modelId=${model.id}&modelSlug=${model.slug}&modelTitle=${encodeURIComponent(model.title)}&modelPrice=${model.price}`}
                variant="accent"
                size="sm"
                className={`${featured ? 'text-sm' : 'text-xs'} flex items-center flex-shrink-0`}
                icon={
                  <svg className={`${featured ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
              >
                Buy Now
              </Button>
            )}
            
            {isComingSoon && (
              <Button
                variant="secondary"
                size="sm"
                className={`${featured ? 'text-sm' : 'text-xs'} flex items-center flex-shrink-0`}
                disabled
                icon={
                  <svg className={`${featured ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                Coming Soon
              </Button>
            )}
          </div>
        </div>

        {/* Bottom accent line that appears on hover */}
        <motion.div
          className="h-1 bg-gradient-to-r from-teal-500 to-navy-700"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0 }}
        />
      </Card>
    </motion.div>
  );
}