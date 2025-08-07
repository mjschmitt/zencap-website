// src/pages/models/private-equity.js - with larger hero background
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

// Private Equity Models Data
const PRIVATE_EQUITY_MODELS = [
  {
    id: 'multifamily-development-model',
    slug: 'multifamily-development-model',
    title: 'Multifamily Development Model',
    excerpt: 'Comprehensive ground-up development modeling for multifamily projects with detailed construction budgeting and lease-up scenarios.',
    price: 4985,
    imagePlaceholder: 'Multifamily Development Preview',
    features: [
      'Detailed construction budget tracking',
      'Unit mix and lease-up modeling', 
      'Financing scenarios with construction and permanent debt',
      'Investor waterfall distributions',
      'Sensitivity analysis on key variables'
    ],
    featured: true
  },
  {
    id: 'multifamily-acquisition-model',
    slug: 'multifamily-acquisition-model',
    title: 'Multifamily Acquisition Model',
    excerpt: 'Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.',
    price: 4985,
    imagePlaceholder: 'Multifamily Acquisition Preview',
    features: [
      'Unit-by-unit rental analysis',
      'Value-add renovation scenarios',
      'Detailed financing options with sensitivity analysis',
      'Investor waterfall and return calculations',
      'Dynamic charts and reporting'
    ],
    featured: true
  },
  {
    id: 'mixed-use-development-model',
    slug: 'mixed-use-development-model',
    title: 'Mixed-Use Development Model',
    excerpt: 'Ground-up development analysis for mixed-use projects combining retail, office, residential, and other property types.',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Development Preview',
    features: [
      'Multi-component property type modeling',
      'Phased development scenarios',
      'Integrated construction budget tracking',
      'Component-specific lease-up assumptions',
      'Complex financing structures'
    ],
    featured: false
  },
  {
    id: 'mixed-use-acquisition-model',
    slug: 'mixed-use-acquisition-model',
    title: 'Mixed-Use Acquisition Model',
    excerpt: 'Acquisition analysis for properties with multiple components including retail, office, residential, and other property types.',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Acquisition Preview',
    features: [
      'Component-level cash flow analysis',
      'Multi-tenant rollover scheduling',
      'Property-specific renovation budgeting',
      'Cross-collateralized financing options',
      'Blended return metrics by component'
    ],
    featured: false
  },
  {
    id: 'commercial-development-model',
    slug: 'commercial-development-model',
    title: 'Commercial Development Model',
    excerpt: 'Development underwriting for office, retail, industrial and other commercial property types with detailed construction tracking.',
    price: 4985,
    imagePlaceholder: 'Commercial Development Preview',
    features: [
      'Customizable for different commercial property types',
      'Detailed construction draw schedules',
      'Pre-leasing scenarios and tenant improvements',
      'Development fee calculations',
      'Sponsor promote and waterfall structures'
    ],
    featured: false
  },
  {
    id: 'commercial-acquisition-model',
    slug: 'commercial-acquisition-model',
    title: 'Commercial Acquisition Model',
    excerpt: 'Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for commercial property investments.',
    price: 4985,
    imagePlaceholder: 'Commercial Acquisition Preview',
    features: [
      'Tenant-by-tenant lease analysis',
      'Renewal probability scenarios',
      'TI/LC and capital expenditure modeling',
      'Detailed debt and equity structures',
      'Sensitivity analysis dashboard'
    ],
    featured: false
  },
  {
    id: 'hospitality-development-model',
    slug: 'hospitality-development-model',
    title: 'Hospitality Development Model',
    excerpt: 'Ground-up development modeling for hotel and resort properties with ADR, occupancy, and departmental revenue/expense projections.',
    price: 4985,
    imagePlaceholder: 'Hospitality Development Preview',
    features: [
      'Hotel flag/brand assumptions',
      'ADR and occupancy ramp-up modeling',
      'Departmental revenue and expense tracking',
      'FF&E reserve and replacement scheduling',
      'Operator performance incentives'
    ],
    featured: false
  },
  {
    id: 'hospitality-acquisition-model',
    slug: 'hospitality-acquisition-model',
    title: 'Hospitality Acquisition Model',
    excerpt: 'Acquisition analysis for hotel and resort properties with RevPAR modeling, brand conversion scenarios, and renovation budgeting.',
    price: 4985,
    imagePlaceholder: 'Hospitality Acquisition Preview',
    features: [
      'Historical and projected RevPAR analysis',
      'Property improvement plan budgeting',
      'Brand conversion/flag change scenarios',
      'Management agreement modeling',
      'Seasonality and booking pattern analysis'
    ],
    featured: false
  }
];

export default function PrivateEquityModels() {
  // Separate featured and regular models
  const featuredModels = PRIVATE_EQUITY_MODELS.filter(model => model.featured);
  const regularModels = PRIVATE_EQUITY_MODELS.filter(model => !model.featured);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProductCatalog",
    "name": "Private Equity Real Estate Models",
    "description": "Professional financial models for private equity real estate investments including multifamily, commercial, and hospitality properties.",
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
        title="Private Equity Models"
        description="Professional financial models for private equity real estate investments. Multifamily, commercial, hospitality development and acquisition models."
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/models/private-equity/private-equity-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Private Equity Models
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Sophisticated financial models for real estate development, acquisition, and investment analysis
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <Button href="#featured" variant="accent" size="lg">
              Explore Models
            </Button>
          </Motion>
        </div>
      </section>
      
      {/* Overview Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Real Estate Focus
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Models designed specifically for real estate investments across all major property types and investment strategies.
                </p>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Institutional Quality
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Built to institutional standards with sophisticated analysis, detailed documentation, and robust error-checking.
                </p>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Ready to Use
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Immediately usable with comprehensive instructions, sample data, and ongoing support for implementation.
                </p>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Featured Models */}
      <section id="featured" className="py-12 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
              Featured Models
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
                          Private Equity
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
                      <div className="space-y-2 mb-4">
                        {model.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <svg className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </div>
                        ))}
                      </div>
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
      
      {/* All Models */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
              All Private Equity Models
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regularModels.map((model) => (
              <Motion key={model.id} animation="fade" direction="up" delay={200} className="h-full">
                <Link href={`/models/${model.slug}`} className="block h-full">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      [{model.imagePlaceholder}]
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          Private Equity
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
            ))}
          </div>
        </div>
      </section>
      
      {/* Property Types Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Property Types Covered
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our models cover the full spectrum of commercial real estate investment opportunities
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Multifamily
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Apartment complexes, student housing, senior living, and affordable housing developments.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Commercial
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Office buildings, retail centers, industrial properties, and flex/warehouse facilities.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Hospitality
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Hotels, resorts, extended stay properties, and specialized hospitality assets.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={500}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Mixed-Use
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Complex properties combining multiple asset classes in integrated developments.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">
              Need a Custom Real Estate Model?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our team can create bespoke models tailored to your specific property type, investment strategy, and analytical requirements.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Request Custom Model
              </Button>
              <Button href="/models/public-equity" variant="secondary" size="lg">
                View Public Equity Models
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