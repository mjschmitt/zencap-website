// src/pages/index.js
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import EnhancedHero from '@/components/ui/EnhancedHero';
import FeaturesShowcase from '@/components/ui/FeaturesShowcase';
import EnhancedTestimonials from '@/components/ui/EnhancedTestimonials';
import ModernCTA from '@/components/ui/ModernCTA';
import { motion } from 'framer-motion';

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
      <EnhancedHero backgroundImage="/images/hero-background.jpg" />
      
      {/* Features Showcase Section */}
      <FeaturesShowcase />
      
      {/* Enhanced Testimonials */}
      <EnhancedTestimonials />
      
      {/* Services Section */}
      <section className="py-16 bg-white dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive financial solutions designed to enhance your investment capabilities
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-40 bg-teal-500 flex items-center justify-center text-white">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Financial Modeling
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Custom financial models that provide deep analytical insights and support better investment decisions.
                </p>
                <a 
                  href="/solutions/financial-modeling" 
                  className="inline-flex items-center text-teal-500 hover:text-teal-600 font-medium"
                >
                  Learn more
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Service 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-40 bg-blue-500 flex items-center justify-center text-white">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Investment Infrastructure
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  End-to-end systems to streamline your investment operations, improve data management, and enhance decision-making.
                </p>
                <a 
                  href="/solutions/infrastructure" 
                  className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium"
                >
                  Learn more
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            {/* Service 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-40 bg-purple-500 flex items-center justify-center text-white">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Industry Research
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Specialized research to inform your investment strategy, identify opportunities, and navigate market complexities.
                </p>
                <a 
                  href="/solutions/research" 
                  className="inline-flex items-center text-purple-500 hover:text-purple-600 font-medium"
                >
                  Learn more
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Modern CTA Section */}
      <ModernCTA />
    </Layout>
  );
}