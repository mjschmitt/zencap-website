// src/pages/models/index.js - with larger hero background
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';


// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Models' },
  { id: 'private-equity', name: 'Private Equity' },
  { id: 'public-equity', name: 'Public Equity' }
];

export default function Models() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        setModels(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-16 text-center text-gray-500">Loading models...</div>;

  // Filter models based on selected category
  const filteredModels = activeCategory === 'all'
    ? models
    : models.filter(model => {
        if (activeCategory === 'private-equity') return model.category === 'Private Equity';
        if (activeCategory === 'public-equity') return model.category === 'Public Equity';
        return false;
      });
  
  // Separate featured and regular models (mark first 2 in each category as featured)
  const featuredModels = filteredModels.slice(0, 2);
  const regularModels = filteredModels.slice(2);
  
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
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[calc(80vh-48px)] flex items-center"
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
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                    <Link href={`/models/${model.slug}`}>
                      {model.thumbnail_url ? (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                          <img 
                            src={model.thumbnail_url} 
                            alt={model.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                          [{model.title} Preview]
                        </div>
                      )}
                    </Link>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          {model.category}
                        </span>
                        <span className="text-lg font-bold text-teal-500">
                          ${model.price?.toLocaleString() || 'Contact'}
                        </span>
                      </div>
                      <Link href={`/models/${model.slug}`}>
                        <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer">
                          {model.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {model.description ? model.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Professional financial model for investment analysis.'}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <Button
                          href={`/models/${model.slug}`}
                          variant="ghost"
                          size="sm"
                          className="text-sm"
                        >
                          View Details
                        </Button>
                        <Button
                          href={`/checkout?modelId=${model.id}&modelSlug=${model.slug}&modelTitle=${encodeURIComponent(model.title)}&modelPrice=${model.price}`}
                          variant="accent"
                          size="sm"
                          className="flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
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
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                    <Link href={`/models/${model.slug}`}>
                      {model.thumbnail_url ? (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                          <img 
                            src={model.thumbnail_url} 
                            alt={model.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                          [{model.title} Preview]
                        </div>
                      )}
                    </Link>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          {model.category}
                        </span>
                        <span className="text-lg font-bold text-teal-500">
                          ${model.price?.toLocaleString() || 'Contact'}
                        </span>
                      </div>
                      <Link href={`/models/${model.slug}`}>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer">
                          {model.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {model.description ? model.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : 'Professional financial model for investment analysis.'}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-auto">
                        <Button
                          href={`/models/${model.slug}`}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          View Details
                        </Button>
                        <Button
                          href={`/checkout?modelId=${model.id}&modelSlug=${model.slug}&modelTitle=${encodeURIComponent(model.title)}&modelPrice=${model.price}`}
                          variant="accent"
                          size="sm"
                          className="flex items-center text-xs"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </Card>
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