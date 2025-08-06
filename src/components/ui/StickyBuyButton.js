import { useState, useEffect } from 'react';
import Button from './Button';

export default function StickyBuyButton({ 
  modelId, 
  modelSlug, 
  modelTitle, 
  modelPrice, 
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky button when user scrolls down more than 500px
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 lg:hidden ${className}`}>
      <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg border border-gray-200 dark:border-navy-600 p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-teal-500">
              ${modelPrice?.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {modelTitle}
            </div>
          </div>
        </div>
        
        <Button
          href={`/checkout?modelId=${modelId}&modelSlug=${modelSlug}&modelTitle=${encodeURIComponent(modelTitle)}&modelPrice=${modelPrice}`}
          variant="accent"
          size="sm"
          fullWidth
          className="flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Buy Now
        </Button>
      </div>
    </div>
  );
}