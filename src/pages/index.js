// src/pages/index.js
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import EnhancedHero from '@/components/ui/EnhancedHero';
import EnhancedTestimonials from '@/components/ui/EnhancedTestimonials';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

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
                  src="/images/services/financial-modeling.jpg"
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
                  src="/images/services/investment-infrastructure.jpg"
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
                  src="/images/services/industry-research.jpg"
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
      
      {/* Statistics CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-900 z-0" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
          <motion.div 
            className="absolute h-64 w-64 rounded-full bg-teal-500/30 blur-3xl"
            animate={{
              x: ['-20%', '120%'],
              y: ['10%', '40%']
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
          <motion.div 
            className="absolute h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
            animate={{
              x: ['100%', '0%'],
              y: ['60%', '30%']
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        </div>
        
        {/* Content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 md:p-4">
            <div className="bg-navy-800/80 rounded-xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Text content */}
                <div>
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    Ready to transform your investment process?
                  </motion.h2>
                  
                  <motion.p 
                    className="text-gray-300 text-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Join leading investment firms who&apos;ve enhanced their decision-making with our financial models and advisory services.
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="flex flex-wrap gap-4">
                      <Link 
                        href="/contact"
                        className="relative inline-flex group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600 to-teal-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                        <button className="relative px-8 py-4 bg-teal-500 rounded-lg leading-none flex items-center text-white font-semibold">
                          Schedule a Consultation
                          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </Link>
                      <Link href="/models" className="px-8 py-4 bg-transparent border border-white/30 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300">
                        Explore Our Models
                      </Link>
                    </div>
                  </motion.div>
                </div>
                
                {/* Stats/metrics */}
                <div className="grid grid-cols-2 gap-6">
                  <motion.div 
                    className="bg-white/10 backdrop-blur rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <p className="text-teal-300 text-4xl font-bold mb-2">95%</p>
                    <p className="text-white text-sm">Client retention rate</p>
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <p className="text-teal-300 text-4xl font-bold mb-2">50+</p>
                    <p className="text-white text-sm">Asset managers served</p>
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <p className="text-teal-300 text-4xl font-bold mb-2">24hr</p>
                    <p className="text-white text-sm">Average response time</p>
                  </motion.div>
                  <motion.div 
                    className="bg-white/10 backdrop-blur rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <p className="text-teal-300 text-4xl font-bold mb-2">$2T+</p>
                    <p className="text-white text-sm">Assets modeled</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}