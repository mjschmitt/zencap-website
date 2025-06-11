// src/pages/models/index.js - with larger hero background
import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

// Sample models data - organized by category
const MODELS = [
  // Private Equity Models
  {
    id: 'multifamily-development-model',
    slug: 'multifamily-development-model',
    title: 'Multifamily Development Model',
    excerpt: 'Comprehensive ground-up development modeling for multifamily projects with detailed construction budgeting and lease-up scenarios.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Multifamily Development Preview',
    featured: true
  },
  {
    id: 'multifamily-acquisition-model',
    slug: 'multifamily-acquisition-model',
    title: 'Multifamily Acquisition Model',
    excerpt: 'Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Multifamily Acquisition Preview',
    featured: true
  },
  {
    id: 'mixed-use-development-model',
    slug: 'mixed-use-development-model',
    title: 'Mixed-Use Development Model',
    excerpt: 'Ground-up development analysis for mixed-use projects combining retail, office, residential, and other property types.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Development Preview',
    featured: false
  },
  {
    id: 'mixed-use-acquisition-model',
    slug: 'mixed-use-acquisition-model',
    title: 'Mixed-Use Acquisition Model',
    excerpt: 'Acquisition analysis for properties with multiple components including retail, office, residential, and other property types.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Acquisition Preview',
    featured: false
  },
  {
    id: 'commercial-development-model',
    slug: 'commercial-development-model',
    title: 'Commercial Development Model',
    excerpt: 'Development underwriting for office, retail, industrial and other commercial property types with detailed construction tracking.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Commercial Development Preview',
    featured: false
  },
  {
    id: 'commercial-acquisition-model',
    slug: 'commercial-acquisition-model',
    title: 'Commercial Acquisition Model',
    excerpt: 'Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for commercial property investments.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Commercial Acquisition Preview',
    featured: false
  },
  {
    id: 'hospitality-development-model',
    slug: 'hospitality-development-model',
    title: 'Hospitality Development Model',
    excerpt: 'Ground-up development modeling for hotel and resort properties with ADR, occupancy, and departmental revenue/expense projections.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Hospitality Development Preview',
    featured: false
  },
  {
    id: 'hospitality-acquisition-model',
    slug: 'hospitality-acquisition-model',
    title: 'Hospitality Acquisition Model',
    excerpt: 'Acquisition analysis for hotel and resort properties with RevPAR modeling, brand conversion scenarios, and renovation budgeting.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Hospitality Acquisition Preview',
    featured: false
  },
  
  // Public Equity Models
  {
    id: 'applovin-3-statement-model',
    slug: 'applovin-3-statement-model',
    title: 'AppLovin (APP) 3-Statement Model',
    excerpt: 'Comprehensive financial model for AppLovin Corporation with integrated income statement, balance sheet, and cash flow projections.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'AppLovin Model Preview',
    featured: true
  },
  {
    id: 'nvidia-3-statement-model',
    slug: 'nvidia-3-statement-model',
    title: 'NVIDIA (NVDA) 3-Statement Model',
    excerpt: 'Integrated financial model for NVIDIA Corporation with segment analysis, growth projections, and valuation framework.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'NVIDIA Model Preview',
    featured: true
  },
  {
    id: 'tesla-3-statement-model',
    slug: 'tesla-3-statement-model',
    title: 'Tesla (TSLA) 3-Statement Model',
    excerpt: 'Detailed financial model for Tesla, Inc. with vehicle delivery forecasts, energy business projections, and manufacturing expansion analysis.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'Tesla Model Preview',
    featured: false
  },
  {
    id: 'dcf-valuation-suite',
    slug: 'dcf-valuation-suite',
    title: 'DCF Valuation Suite',
    excerpt: 'Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.',
    category: 'Public Equity',
    price: 2985,
    imagePlaceholder: 'DCF Model Preview',
    featured: false
  },
  {
    id: 'portfolio-attribution-model',
    slug: 'portfolio-attribution-model',
    title: 'Portfolio Attribution Model',
    excerpt: 'Analyze performance drivers and attribution factors across investment positions.',
    category: 'Public Equity',
    price: 2985,
    imagePlaceholder: 'Portfolio Model Preview',
    featured: false
  }
];

// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Models' },
  { id: 'private-equity', name: 'Private Equity' },
  { id: 'public-equity', name: 'Public Equity' }
];

export default function Models() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Filter models based on selected category
  const filteredModels = activeCategory === 'all'
    ? MODELS
    : MODELS.filter(model => {
        if (activeCategory === 'private-equity') return model.category === 'Private Equity';
        if (activeCategory === 'public-equity') return model.category === 'Public Equity';
        return false;
      });
  
  // Separate featured and regular models
  const featuredModels = filteredModels.filter(model => model.featured);
  const regularModels = filteredModels.filter(model => !model.featured);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProductCatalog",
    "name": "Zenith Capital Financial Models",
    "description": "Professional financial models for private equity real estate and public equity analysis.",
    "publisher": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    }
  };

  return (
    <Layout>
      <SEO
        title="Financial Models"
        description="Professional financial models for private equity real estate and public equity analysis. Excel-based models with comprehensive documentation."
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/models/models-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
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
        </div>
      </section>
      
      {/* Category Filter */}
      <section className="py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Models */}
      {featuredModels.length > 0 && (
        <section id="featured" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
                Featured Models
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredModels.map((model) => (
                <Motion key={model.id} animation="fade" direction="up" delay={200} className="h-full">
                  <Link href={`/models/${model.slug}`} className="block h-full">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{model.imagePlaceholder}]
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {model.category}
                          </span>
                          <span className="text-lg font-bold text-teal-500">
                            ${model.price.toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                          {model.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {model.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                            View Details
                          </span>
                          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Motion>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* All Models */}
      <section className="py-12 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
              {activeCategory === 'all' ? 'All Models' : `${CATEGORIES.find(c => c.id === activeCategory)?.name} Models`}
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regularModels.length > 0 ? (
              regularModels.map((model) => (
                <Motion key={model.id} animation="fade" direction="up" delay={200} className="h-full">
                  <Link href={`/models/${model.slug}`} className="block h-full">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{model.imagePlaceholder}]
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {model.category}
                          </span>
                          <span className="text-lg font-bold text-teal-500">
                            ${model.price.toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                          {model.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {model.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                            View Details
                          </span>
                          <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Motion>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No models found in this category. Please check back later or select a different category.
                </p>
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