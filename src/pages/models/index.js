// src/pages/models/index.js - with larger hero background
import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import LoadingSkeleton, { ModelCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useToast } from '@/components/ui/Toast';
import ModelCard from '@/components/ui/ModelCard';
import OptimizedModelCard from '@/components/ui/OptimizedModelCard';
import { useSpa } from '@/components/spa/SpaRouter';
import { useOptimizedMotion } from '@/components/spa/OptimizedMotion';
import { useKeyboardNavigation } from '@/components/KeyboardNavigation';
import { transitionPresets } from '@/utils/motionVariants';


// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Models' },
  { id: 'private-equity', name: 'Private Equity' },
  { id: 'public-equity', name: 'Public Equity' }
];

// Sort options
const SORT_OPTIONS = [
  { id: 'name', name: 'Name (A-Z)' },
  { id: 'price-low', name: 'Price (Low to High)' },
  { id: 'price-high', name: 'Price (High to Low)' },
  { id: 'newest', name: 'Newest First' }
];

// Price ranges for filtering
const PRICE_RANGES = [
  { id: 'all', name: 'All Prices', min: 0, max: Infinity },
  { id: 'under-3000', name: 'Under $3,000', min: 0, max: 3000 },
  { id: '3000-4000', name: '$3,000 - $4,000', min: 3000, max: 4000 },
  { id: 'over-4000', name: 'Over $4,000', min: 4000, max: Infinity }
];

export default function Models() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [filterTransitioning, setFilterTransitioning] = useState(false);
  const [showKeyboardIndicator, setShowKeyboardIndicator] = useState(true);
  const { isSpaMode, prefetchPage } = useSpa();
  const { isMotionEnabled } = useOptimizedMotion();
  const { showHelp } = useKeyboardNavigation();
  
  // Initialize filters from URL params
  useEffect(() => {
    const { category, search, sort, price } = router.query;
    if (category && CATEGORIES.find(c => c.id === category)) setActiveCategory(category);
    if (search) setSearchQuery(search);
    if (sort && SORT_OPTIONS.find(s => s.id === sort)) setSortBy(sort);
    if (price && PRICE_RANGES.find(p => p.id === price)) setPriceRange(price);
  }, [router.query]);

  useEffect(() => {
    fetch('/api/models')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch models');
        }
        return res.json();
      })
      .then(data => {
        // Handle both array response and object with models property
        const modelsList = Array.isArray(data) ? data : (data.models || []);
        setModels(modelsList);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching models:', error);
        setError('Failed to load models. Please try again later.');
        setModels([]);
        setLoading(false);
      });
  }, []);
  
  // Update URL when filters change
  const updateURL = useCallback((category, search, sort, price) => {
    const query = {};
    if (category !== 'all') query.category = category;
    if (search) query.search = search;
    if (sort !== 'name') query.sort = sort;
    if (price !== 'all') query.price = price;
    
    router.push({
      pathname: '/models',
      query
    }, undefined, { shallow: true });
  }, [router]);
  
  // Handle category change with smooth transition
  const handleCategoryChange = useCallback(async (categoryId) => {
    if (categoryId === activeCategory) return;
    
    setFilterTransitioning(true);
    setActiveCategory(categoryId);
    updateURL(categoryId, searchQuery, sortBy, priceRange);
    
    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200));
    setFilterTransitioning(false);
  }, [activeCategory, searchQuery, sortBy, priceRange, updateURL]);
  
  // Handle search change
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    updateURL(activeCategory, query, sortBy, priceRange);
  }, [activeCategory, sortBy, priceRange, updateURL]);
  
  // Handle sort change
  const handleSortChange = useCallback((sort) => {
    setSortBy(sort);
    updateURL(activeCategory, searchQuery, sort, priceRange);
  }, [activeCategory, searchQuery, priceRange, updateURL]);
  
  // Handle price range change
  const handlePriceRangeChange = useCallback((price) => {
    setPriceRange(price);
    updateURL(activeCategory, searchQuery, sortBy, price);
  }, [activeCategory, searchQuery, sortBy, updateURL]);

  // Enhanced filtering and sorting logic
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models;
    
    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(model => {
        if (activeCategory === 'private-equity') return model.category === 'Private Equity';
        if (activeCategory === 'public-equity') return model.category === 'Public Equity';
        return false;
      });
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(model => 
        model.title?.toLowerCase().includes(query) ||
        model.description?.toLowerCase().includes(query) ||
        model.category?.toLowerCase().includes(query)
      );
    }
    
    // Price range filter
    if (priceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.id === priceRange);
      if (range) {
        filtered = filtered.filter(model => {
          const price = typeof model.price === 'string' 
            ? parseFloat(model.price.replace(/[^\d.]/g, '')) 
            : model.price;
          return price >= range.min && price <= range.max;
        });
      }
    }
    
    // Sort models
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'price-low':
          const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^\d.]/g, '')) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^\d.]/g, '')) : b.price;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^\d.]/g, '')) : a.price;
          const priceB2 = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^\d.]/g, '')) : b.price;
          return priceB2 - priceA2;
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [models, activeCategory, searchQuery, sortBy, priceRange]);
  
  // Separate featured and regular models (mark first 2 in each category as featured)
  const featuredModels = filteredAndSortedModels.slice(0, 2);
  const regularModels = filteredAndSortedModels.slice(2);
  
  // Get active filters count for display
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'all') count++;
    if (searchQuery) count++;
    if (priceRange !== 'all') count++;
    if (sortBy !== 'name') count++;
    return count;
  }, [activeCategory, searchQuery, priceRange, sortBy]);
  
  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortBy('name');
    setPriceRange('all');
    router.push('/models', undefined, { shallow: true });
  }, [router]);

  // Enhanced structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Financial Models Catalog - Zenith Capital Advisors",
    "description": "Professional Excel financial models for private equity real estate and public equity analysis. Models range from $2,985 to $4,985.",
    "url": "https://zencap-website.vercel.app/models",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Financial Models Collection",
      "description": "Institutional-grade financial models for investment professionals",
      "numberOfItems": models.length,
      "itemListElement": filteredAndSortedModels.slice(0, 10).map((model, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": model.title,
        "description": model.description ? model.description.replace(/<[^>]*>/g, '').substring(0, 200) : 'Professional financial model',
        "category": model.category,
        "offers": {
          "@type": "Offer",
          "price": model.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }))
    },
    "publisher": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap-website.vercel.app/images/logo/zenith-capital-logo.png"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://zencap-website.vercel.app"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Financial Models",
          "item": "https://zencap-website.vercel.app/models"
        }
      ]
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ModelCardSkeleton count={6} />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Models</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Financial Models | Excel Investment Analysis Tools"
        description="Professional Excel financial models for private equity, real estate & public equity. Premium DCF models $2,985-$4,985. Institutional-grade investment analysis tools for professionals."
        keywords="financial models, investment models, Excel financial models, DCF valuation, private equity models, real estate financial models, LBO models, investment analysis tools"
        ogImage="/images/og/financial-models-catalog.jpg"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Financial Models", path: "/models" }
        ]}
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section className="relative bg-navy-700 text-white min-h-[calc(80vh-48px)] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/models/models-hero.jpg"
            alt="Financial Models Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={85}
          />
        </div>
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60 z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-20 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Financial Models
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Institutional-grade tools that transform data into actionable insights
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <Button href="#featured" variant="accent" size="lg">
              Explore Models
            </Button>
          </Motion>

          {/* Keyboard Navigation Indicator */}
          {showKeyboardIndicator && (
            <Motion
              animation="fade"
              direction="up"
              delay={600}
              className="fixed bottom-6 right-6 z-30 hidden lg:block"
            >
              <div className="bg-navy-800/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-xl border border-navy-600">
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <span className="text-teal-400 font-medium">Power navigation:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 text-xs bg-navy-700 rounded border border-navy-500">?</kbd>
                    <span className="text-xs text-gray-300">for shortcuts</span>
                  </div>
                  <button
                    onClick={() => setShowKeyboardIndicator(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close indicator"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </Motion>
          )}
        </div>
      </section>
      
      {/* Enhanced Filters and Search */}
      <section className="py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search models... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.target.blur();
                    if (searchQuery) handleSearchChange('');
                  }
                }}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category</h3>
              <div className="flex flex-wrap items-center gap-3">
                {CATEGORIES.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    data-category={category.id}
                    title={`Keyboard shortcut: ${index + 1}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 relative group ${
                      activeCategory === category.id
                        ? 'bg-teal-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'
                    }`}
                  >
                    {category.name}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price Range and Sort Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range</h3>
                <select
                  value={priceRange}
                  onChange={(e) => handlePriceRangeChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {PRICE_RANGES.map(range => (
                    <option key={range.id} value={range.id}>{range.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                    {filteredAndSortedModels.length} model{filteredAndSortedModels.length !== 1 ? 's' : ''} found
                  </span>
                  <span className="text-sm text-teal-600 dark:text-teal-400">
                    ({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active)
                  </span>
                </div>
                <button
                  onClick={clearAllFilters}
                  data-clear-filters
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Featured Models */}
      {featuredModels.length > 0 && (
        <section id="featured" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
                {searchQuery ? 'Top Results' : 'Featured Models'}
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filterTransitioning ? (
                // Loading skeleton during filter transition
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 mb-4"></div>
                  </div>
                ))
              ) : (
                featuredModels.map((model, index) => (
                  <Motion 
                    key={`${model.id}-${activeCategory}-${searchQuery}`} 
                    animation="fade" 
                    direction="up" 
                    delay={200 + (index * 100)} 
                    className="h-full"
                    transition={transitionPresets.spring}
                  >
                    <div data-model-card data-model-id={model.id}>
                      {isSpaMode ? (
                        <OptimizedModelCard 
                          model={model} 
                          featured={true}
                          priority="high"
                        />
                      ) : (
                        <ModelCard 
                          model={model} 
                          featured={true}
                        />
                      )}
                    </div>
                  </Motion>
                ))
              )}
            </div>
          </div>
        </section>
      )}
      
      {/* All Models */}
      <section className="py-12 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                {searchQuery ? 'Search Results' : (
                  activeCategory === 'all' ? 'All Models' : `${CATEGORIES.find(c => c.id === activeCategory)?.name} Models`
                )}
              </h2>
              {filteredAndSortedModels.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredAndSortedModels.length} model{filteredAndSortedModels.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filterTransitioning ? (
              // Loading skeleton during filter transition
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 mb-4"></div>
                </div>
              ))
            ) : regularModels.length > 0 ? (
              regularModels.map((model, index) => (
                <Motion 
                  key={`${model.id}-${activeCategory}-${searchQuery}-${sortBy}`} 
                  animation="fade" 
                  direction="up" 
                  delay={100 + (index * 50)} 
                  className="h-full"
                  transition={transitionPresets.spring}
                >
                  <div data-model-card data-model-id={model.id}>
                    {isSpaMode ? (
                      <OptimizedModelCard 
                        model={model} 
                        featured={false}
                        priority="medium"
                      />
                    ) : (
                      <ModelCard 
                        model={model} 
                        featured={false}
                      />
                    )}
                  </div>
                </Motion>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 py-12 text-center">
                <Motion animation="fade" direction="up">
                  <div className="max-w-md mx-auto">
                    <div className="text-gray-400 mb-4">
                      {searchQuery ? (
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      ) : (
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery ? 'No Results Found' : 'No Models Available'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchQuery 
                        ? `No models match your search "${searchQuery}". Try adjusting your filters or search terms.`
                        : 'No models found in this category. Please check back later or select a different category.'
                      }
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {searchQuery && (
                        <Button 
                          onClick={() => handleSearchChange('')}
                          variant="secondary"
                        >
                          Clear Search
                        </Button>
                      )}
                      <Button 
                        href="/contact" 
                        variant="primary"
                      >
                        Request Custom Model
                      </Button>
                    </div>
                  </div>
                </Motion>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">
              Need a Custom Model?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our team can create bespoke financial models tailored to your specific investment strategy and requirements.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Request Custom Model
              </Button>
              <Button href="/solutions" variant="secondary" size="lg">
                View Our Services
              </Button>
            </div>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}

// Disable static generation to prevent build errors during prerendering
export const getServerSideProps = async (context) => {
  return {
    props: {}
  };
};