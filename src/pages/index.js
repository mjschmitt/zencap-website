// src/pages/index.js
import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import EnhancedHero from '@/components/ui/EnhancedHero';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getImageWithVersion } from '@/utils/imageUtils';
import LaunchUrgencyBanner from '@/components/ui/LaunchUrgencyBanner';
// import FounderCredibility from '@/components/ui/FounderCredibility'; // Removed fake analyst section
import MoneyBackGuarantee from '@/components/ui/MoneyBackGuarantee';
import BundleOffers from '@/components/ui/BundleOffers';
// import SocialProofTestimonials from '@/components/ui/SocialProofTestimonials'; // Temporarily removed

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
  // Comprehensive structured data for rich search results
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "alternateName": "ZenCap",
      "url": "https://zencap-website.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap-website.vercel.app/images/logo/zenith-capital-logo.png",
        "width": 400,
        "height": 100
      },
      "description": "Professional financial modeling and investment advisory services for private equity, real estate, and public equity investors. Excel-based models ranging from $2,985 to $4,985.",
      "foundingDate": "2023",
      "industry": "Financial Services",
      "numberOfEmployees": "2-10",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "English",
        "email": "contact@zencap-website.vercel.app"
      },
      "sameAs": [
        "https://www.linkedin.com/company/zenith-capital-advisors",
        "https://twitter.com/zenithcapital"
      ],
      "service": [
        {
          "@type": "Service",
          "name": "Financial Modeling",
          "description": "Custom Excel financial models for investment analysis"
        },
        {
          "@type": "Service",
          "name": "Investment Advisory",
          "description": "Professional investment advisory services for institutional clients"
        },
        {
          "@type": "Service",
          "name": "Private Equity Models",
          "description": "Specialized financial models for real estate and private equity investments"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Zenith Capital Advisors",
      "url": "https://zencap-website.vercel.app",
      "description": "Professional financial modeling and investment advisory services",
      "publisher": {
        "@type": "Organization",
        "name": "Zenith Capital Advisors"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://zencap-website.vercel.app/models?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://zencap-website.vercel.app/models",
      "name": "Financial Model Collection",
      "description": "Professional Excel-based financial models for private equity, real estate, and public equity analysis",
      "category": "Financial Software",
      "brand": {
        "@type": "Brand",
        "name": "Zenith Capital Advisors"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "5925",
        "highPrice": "8850",
        "offerCount": "13"
      }
    }
  ];

  return (
    <Layout>
      {/* Launch Urgency Banner */}
      <LaunchUrgencyBanner />
      
      <SEO
        title="Financial Models & Investment Advisory | Zenith Capital"
        description="Professional Excel financial models for private equity & real estate. Premium DCF valuation tools with 40% launch discount. Institutional-grade investment analysis models. Get premium financial modeling services."
        keywords="financial models, investment models, Excel financial models, DCF valuation, private equity models, real estate financial models, investment advisory, financial modeling services"
        ogImage="/images/og/zenith-capital-homepage.jpg"
        structuredData={structuredData}
      />
      
      {/* Enhanced Hero Section with rotating text */}
      <EnhancedHero />
      
      {/* Our Models Section */}
      <section id="our-models-section" className="py-16 bg-gray-50 dark:bg-navy-900/50">
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
            >
              <Link href="/models/private-equity">
                <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src="/images/home/private-equity-models.jpg"
                      alt="Private Equity Models"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        Private Equity
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">8 Models</span>
                    </div>
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
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
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Explore Models
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Public Equity Models */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/models/public-equity">
                <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src="/images/home/public-equity-models.jpg"
                      alt="Public Equity Models"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-navy-700 dark:text-green-300 rounded-full text-xs font-medium">
                        Public Equity
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">5 Models</span>
                    </div>
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
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
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Explore Models
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
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
            >
              <Link href="/solutions/financial-modeling">
                <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <div className="h-52 relative overflow-hidden">
                    <Image 
                      src={getImageWithVersion('/images/home/financial-modeling.jpg', 'v2')}
                      alt="Financial modeling spreadsheet with charts"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Financial Modeling
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Custom financial models that provide deep analytical insights and support better investment decisions.
                    </p>
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Learn more
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Investment Infrastructure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/solutions/infrastructure">
                <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <div className="h-52 relative overflow-hidden">
                    <Image 
                      src="/images/home/investment-infrastructure.jpg"
                      alt="Modern investment office with multiple screens displaying data"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Investment Infrastructure
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      End-to-end systems to streamline your investment operations, improve data management, and enhance decision-making.
                    </p>
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Learn more
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Industry Research */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link href="/solutions/research">
                <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <div className="h-52 relative overflow-hidden">
                    <Image 
                      src="/images/home/industry-research.jpg"
                      alt="Researcher analyzing market data and reports"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Industry Research
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Specialized research to inform your investment strategy, identify opportunities, and navigate market complexities.
                    </p>
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Learn more
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Social Proof Testimonials - TEMPORARILY REMOVED UNTIL WE HAVE REAL TESTIMONIALS */}
      {/* <SocialProofTestimonials /> */}
      
      {/* Founder Credibility Section - REMOVED (was fake analyst) */}
      {/* <FounderCredibility /> */}
      
      {/* Bundle Offers Section */}
      <BundleOffers />
      
      {/* Money Back Guarantee */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <MoneyBackGuarantee />
        </div>
      </section>
      
      {/* Modern CTA Section */}
      <ModernCTA />
    </Layout>
  );
}