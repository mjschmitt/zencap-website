// src/pages/index.js
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import EnhancedHero from '@/components/ui/EnhancedHero';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import non-critical components for better performance
const EnhancedTestimonials = dynamic(() => import('@/components/ui/EnhancedTestimonials'), {
  loading: () => (
    <div className="py-16 bg-gray-50 dark:bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="h-24 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

const ModernCTA = dynamic(() => import('@/components/ui/ModernCTA'), {
  loading: () => (
    <div className="py-16 bg-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
            <div className="h-12 bg-gray-300 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

export default function Home() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Zenith Capital Advisors",
    "url": "https://zencap.co",
    "logo": "https://zencap.co/logo.png",
    "description": "Financial modeling and investment advisory services for public and private equity investors.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Finance Street",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "postalCode": "10001",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service"
    }
  };

  return (
    <Layout>
      <SEO
        title="Financial Modeling & Investment Advisory"
        description="Precision financial modeling and advisory solutions for public and private equity investors."
        structuredData={structuredData}
      />
      
      {/* Enhanced Hero Section with rotating text */}
      <EnhancedHero />
      
      {/* Our Models Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
              Our Models
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Institutional-grade financial models designed for sophisticated investment analysis
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {/* Private Equity Models */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-48 relative">
                <Image
                  src="/images/home/private-equity-models.jpg"
                  alt="Private Equity Models"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    Private Equity
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">8 Models</span>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Private Equity Models
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Real estate development, acquisition, and investment analysis across all major property types.
                </p>
                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Multifamily & Commercial
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Development & Acquisition
                  </div>
                </div>
                <Link 
                  href="/models/private-equity" 
                  className="inline-flex items-center text-teal-500 hover:text-teal-600 font-medium"
                >
                  Explore Models
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            {/* Public Equity Models */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-48 relative">
                <Image
                  src="/images/home/public-equity-models.jpg"
                  alt="Public Equity Models"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-navy-700 dark:text-green-300 rounded-full text-xs font-medium">
                    Public Equity
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">5 Models</span>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Public Equity Models
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Valuation models and analytical tools for public company analysis and portfolio management.
                </p>
                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    3-Statement Models
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    DCF & Portfolio Analysis
                  </div>
                </div>
                <Link 
                  href="/models/public-equity" 
                  className="inline-flex items-center text-teal-500 hover:text-teal-600 font-medium"
                >
                  Explore Models
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Browse All Models CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <Link 
              href="/models"
              className="inline-flex items-center px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white font-medium rounded-md shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              Browse All Models
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Our Solutions Section */}
      <section className="py-16 bg-white dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
              Our Solutions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive advisory services designed to enhance your investment capabilities
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Financial Modeling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-52 relative">
                <Image 
                  src="/images/home/financial-modeling.jpg"
                  alt="Financial modeling spreadsheet with charts"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Financial Modeling
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Custom financial models that provide deep analytical insights and support better investment decisions.
                </p>
                <Link 
                  href="/solutions/financial-modeling" 
                  className="inline-flex items-center text-teal-500 hover:text-teal-600 font-medium"
                >
                  Learn more
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            {/* Investment Infrastructure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-52 relative">
                <Image 
                  src="/images/home/investment-infrastructure.jpg"
                  alt="Modern investment office with multiple screens displaying data"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Investment Infrastructure
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  End-to-end systems to streamline your investment operations, improve data management, and enhance decision-making.
                </p>
                <Link 
                  href="/solutions/infrastructure" 
                  className="inline-flex items-center text-teal-500 hover:text-teal-600 font-medium"
                >
                  Learn more
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            {/* Industry Research */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-52 relative">
                <Image 
                  src="/images/home/industry-research.jpg"
                  alt="Researcher analyzing market data and reports"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Industry Research
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Specialized research to inform your investment strategy, identify opportunities, and navigate market complexities.
                </p>
                <Link 
                  href="/solutions/research" 
                  className="inline-flex items-center text-teal-500 hover:text-teal-600 font-medium"
                >
                  Learn more
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Testimonials */}
      <EnhancedTestimonials />
      
      {/* Modern CTA Section */}
      <ModernCTA />
    </Layout>
  );
}