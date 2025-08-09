// src/pages/models/index.js - with larger hero background
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [error, setError] = useState(null);
  const { isSpaMode, prefetchPage } = useSpa();
  const { isMotionEnabled } = useOptimizedMotion();

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
      "itemListElement": filteredModels.slice(0, 10).map((model, index) => ({
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
              {featuredModels.map((model, index) => (
                <Motion 
                  key={model.id} 
                  animation="fade" 
                  direction="up" 
                  delay={200 + (index * 100)} 
                  className="h-full"
                >
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
              regularModels.map((model, index) => (
                <Motion 
                  key={model.id} 
                  animation="fade" 
                  direction="up" 
                  delay={100 + (index * 50)} 
                  className="h-full"
                >
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
                </Motion>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Models Available</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No models found in this category. Please check back later or select a different category.
                  </p>
                  <Button 
                    href="/contact" 
                    variant="primary"
                  >
                    Request Custom Model
                  </Button>
                </div>
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