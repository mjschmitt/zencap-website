// src/pages/insights/index.js
import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

// Updated insights data with tech-focused public equity and commercial real estate private equity content
const INSIGHTS = [
  {
    id: 'earnings-q1-2025-tech-giants',
    slug: 'earnings-q1-2025-tech-giants',
    title: 'Q1 2025 Earnings Snapshot: Major Tech Platforms',
    excerpt: 'Analysis of Q1 earnings reports from leading technology companies, highlighting key trends, surprises, and implications for investors.',
    category: 'Public Equity',
    date: 'March 30, 2025',
    readTime: '8 min read',
    featured: true,
    imagePlaceholder: 'Tech earnings chart',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'ai-impact-saas-valuations',
    slug: 'ai-impact-saas-valuations',
    title: "AI Impact on SaaS Valuations: A New Multiple Framework",
    excerpt: 'How AI capabilities are reshaping valuation multiples for software companies, with a proposed framework for measuring AI-driven value creation.',
    category: 'Public Equity',
    date: 'March 22, 2025',
    readTime: '10 min read',
    featured: true,
    imagePlaceholder: 'AI valuation model',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'multifamily-investment-interest-rates',
    slug: 'multifamily-investment-interest-rates',
    title: 'Multifamily Investments in a Shifting Rate Environment',
    excerpt: 'Analysis of how changing interest rates impact multifamily valuations, cash flows, and investment strategies in the current market.',
    category: 'Private Equity',
    date: 'March 15, 2025',
    readTime: '12 min read',
    featured: false,
    imagePlaceholder: 'Apartment building investments',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'semiconductor-supply-chain-resilience',
    slug: 'semiconductor-supply-chain-resilience',
    title: 'Semiconductor Supply Chain Resilience: Investment Implications',
    excerpt: 'Examining how geopolitical tensions and reshoring efforts are transforming semiconductor manufacturing investments and public equity valuations.',
    category: 'Public Equity',
    date: 'March 8, 2025',
    readTime: '9 min read',
    featured: false,
    imagePlaceholder: 'Semiconductor manufacturing',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'commercial-real-estate-data-centers',
    slug: 'commercial-real-estate-data-centers',
    title: 'Data Centers: The New Essential Commercial Real Estate',
    excerpt: 'How AI computing demands are driving unprecedented growth in data center development and creating compelling investment opportunities.',
    category: 'Private Equity',
    date: 'March 1, 2025',
    readTime: '11 min read',
    featured: false,
    imagePlaceholder: 'Data center infrastructure',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'fintech-embedded-finance-trends',
    slug: 'fintech-embedded-finance-trends',
    title: 'Embedded Finance: The Next Growth Vector for Fintech',
    excerpt: 'Analysis of how non-financial companies are integrating financial services, creating new revenue streams and investment opportunities.',
    category: 'Public Equity',
    date: 'February 22, 2025',
    readTime: '8 min read',
    featured: false,
    imagePlaceholder: 'Embedded finance diagram',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'industrial-real-estate-ecommerce',
    slug: 'industrial-real-estate-ecommerce',
    title: 'Industrial Real Estate: Riding the E-commerce Wave',
    excerpt: 'Examining how continued e-commerce growth is transforming industrial real estate demand, pricing dynamics, and investment strategies.',
    category: 'Private Equity',
    date: 'February 15, 2025',
    readTime: '10 min read',
    featured: false,
    imagePlaceholder: 'Modern logistics facility',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  },
  {
    id: 'cloud-infrastructure-pricing-models',
    slug: 'cloud-infrastructure-pricing-models',
    title: 'Cloud Infrastructure Pricing Models: Implications for Margins',
    excerpt: 'Analysis of how evolving cloud pricing strategies impact the profitability of major providers and influence enterprise technology decisions.',
    category: 'Public Equity',
    date: 'February 8, 2025',
    readTime: '9 min read',
    featured: false,
    imagePlaceholder: 'Cloud pricing dashboard',
    author: {
      name: 'Maximilian Schmitt',
      title: 'Founder & CEO',
      avatar: '/images/about/max-profile.jpg'
    }
  }
];

// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Insights' },
  { id: 'public-equity', name: 'Public Equity' },
  { id: 'private-equity', name: 'Private Equity' },
  { id: 'technology', name: 'Technology' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'financial-markets', name: 'Financial Markets' }
];

export default function Insights() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Filter insights based on selected category
  const filteredInsights = activeCategory === 'all'
    ? INSIGHTS
    : INSIGHTS.filter(insight => {
        if (activeCategory === 'public-equity') return insight.category === 'Public Equity';
        if (activeCategory === 'private-equity') return insight.category === 'Private Equity';
        if (activeCategory === 'technology') return insight.category === 'Public Equity' && (insight.title.includes('Tech') || insight.title.includes('AI') || insight.title.includes('Cloud') || insight.title.includes('Semiconductor'));
        if (activeCategory === 'real-estate') return insight.category === 'Private Equity' && (insight.title.includes('Real Estate') || insight.title.includes('Multifamily') || insight.title.includes('Data Centers'));
        if (activeCategory === 'financial-markets') return insight.title.includes('Interest Rates') || insight.title.includes('Fintech') || insight.title.includes('Finance');
        return false;
      });
  
  // Separate featured and regular insights
  const featuredInsights = filteredInsights.filter(insight => insight.featured);
  const regularInsights = filteredInsights.filter(insight => !insight.featured);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Zenith Capital Insights",
    "description": "Investment analysis, market trends, and earnings snapshots from Zenith Capital Advisors.",
    "publisher": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    },
    "blogPost": INSIGHTS.map(insight => ({
      "@type": "BlogPosting",
      "headline": insight.title,
      "description": insight.excerpt,
      "datePublished": insight.date,
      "author": {
        "@type": "Person",
        "name": insight.author.name
      }
    }))
  };

  return (
    <Layout>
      <SEO
        title="Investment Insights"
        description="Expert analysis of technology trends in public equity markets and commercial real estate opportunities in private equity."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Insights
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Investment analysis, market trends, and earnings snapshots from our research team
            </p>
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
      
      {/* Featured Insights */}
      {featuredInsights.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
                Featured Insights
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredInsights.map((insight) => (
                <Motion key={insight.id} animation="fade" direction="up" delay={200} className="h-full">
                  <Link href={`/insights/${insight.slug}`} className="block h-full">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{ insight.imagePlaceholder }]
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                            {insight.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {insight.date} · {insight.readTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                          {insight.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {insight.excerpt}
                        </p>
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 dark:bg-navy-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-navy-700 dark:text-white font-semibold">
                              {insight.author.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-navy-700 dark:text-white">
                              {insight.author.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {insight.author.title}
                            </p>
                          </div>
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
      
      {/* Regular Insights */}
      <section className="py-12 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
              {activeCategory === 'all' ? 'All Insights' : `${CATEGORIES.find(c => c.id === activeCategory)?.name}`}
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regularInsights.length > 0 ? (
              regularInsights.map((insight) => (
                <Motion key={insight.id} animation="fade" direction="up" delay={200} className="h-full">
                  <Link href={`/insights/${insight.slug}`} className="block h-full">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{ insight.imagePlaceholder }]
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                            {insight.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {insight.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                          {insight.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {insight.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-200 dark:bg-navy-600 rounded-full flex items-center justify-center mr-2">
                              <span className="text-navy-700 dark:text-white font-semibold text-xs">
                                {insight.author.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {insight.author.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {insight.date}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Motion>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No insights found in this category. Please check back later or select a different category.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Stay Informed
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Subscribe to receive our latest insights directly to your inbox.
              </p>
            </div>
          </Motion>
          <Motion animation="fade" direction="up" delay={200}>
            <NewsletterSignup dark={false} />
          </Motion>
        </div>
      </section>
    </Layout>
  );
}