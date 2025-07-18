// src/pages/solutions/financial-modeling.js - with larger hero background
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import Image from 'next/image';
import Link from 'next/link';
import { getImageWithVersion } from '@/utils/imageUtils';

export default function FinancialModeling() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Financial Modeling Services",
    "description": "Custom financial models and valuation analysis for investment professionals and institutional clients.",
    "provider": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    },
    "serviceType": "Financial Analysis",
    "areaServed": "Global"
  };

  return (
    <Layout>
      <SEO
        title="Financial Modeling Services"
        description="Custom financial models and valuation analysis for investment professionals. DCF models, real estate development models, and portfolio analysis tools."
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: `url(${getImageWithVersion('/images/solutions/financial-modeling/financial-modeling-hero.jpg', 'v2')})` }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Financial Modeling
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Custom financial models that transform complex data into actionable investment insights
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <Button href="#services" variant="accent" size="lg">
              Explore Our Models
            </Button>
          </Motion>
        </div>
      </section>
      
      {/* Overview Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Motion animation="fade" direction="right">
              <div>
                <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-6">
                  Precision Built for Investment Excellence
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Our financial modeling services combine rigorous quantitative analysis with practical investment experience. We create models that not only perform sophisticated calculations but also provide clear insights into the key drivers of value and risk.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Whether you need a comprehensive DCF valuation model, a complex real estate development analysis, or a portfolio attribution framework, our models are designed to enhance your decision-making process while remaining intuitive and transparent.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-500 mb-1">250+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Models Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-500 mb-1">95%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Client Satisfaction</div>
                  </div>
                </div>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src={getImageWithVersion('/images/solutions/financial-modeling/financial-modeling-overview.jpg', 'v2')}
                  alt="Financial modeling and analysis"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Our Modeling Services
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Comprehensive financial modeling solutions tailored to your specific analytical needs
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* DCF & Valuation Models */}
            <Motion animation="fade" direction="up" delay={200} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  DCF & Valuation Models
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive discounted cash flow models with integrated 3-statement projections, scenario analysis, and sensitivity testing.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Management equity and option modeling
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Returns and exit scenario analysis
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Credit & Fixed Income */}
            <Motion animation="fade" direction="up" delay={600} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Credit & Fixed Income
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Sophisticated credit analysis and fixed income models for bond valuation, credit risk assessment, and structured products.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Credit risk and default modeling
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Bond pricing and yield analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Structured product valuation
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Industry-Specific Models */}
            <Motion animation="fade" direction="up" delay={700} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Industry-Specific Models
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Specialized models for unique industry characteristics including energy, technology, healthcare, and financial services.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Technology and SaaS metrics
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Energy and commodity modeling
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Healthcare and biotech analysis
                  </li>
                </ul>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Process Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Our Modeling Process
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                A systematic approach to delivering models that meet your exact requirements
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">1</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Requirements Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We work closely with you to understand your specific analytical needs, data sources, and output requirements.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">2</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Model Architecture
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We design the model structure and logic, ensuring scalability, flexibility, and robust error-checking capabilities.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">3</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Development & Testing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our team builds and rigorously tests the model, incorporating sensitivity analysis and scenario planning capabilities.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={500}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">4</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Documentation & Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We provide comprehensive documentation and ongoing support to ensure you can effectively use and maintain the model.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Motion animation="fade" direction="right">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src={getImageWithVersion('/images/solutions/financial-modeling/model-features-and-capabilities.jpg', 'v2')}
                  alt="Financial model features and capabilities"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div>
                <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-6">
                  Model Features & Capabilities
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Dynamic Sensitivity Analysis</h3>
                      <p className="text-gray-600 dark:text-gray-300">Built-in tornado charts and data tables to understand how changes in key assumptions impact your results.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Scenario Planning</h3>
                      <p className="text-gray-600 dark:text-gray-300">Multiple scenario capabilities with easy switching between base, upside, and downside cases.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Professional Charting</h3>
                      <p className="text-gray-600 dark:text-gray-300">Presentation-ready charts and graphs that automatically update as you modify assumptions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Error Protection</h3>
                      <p className="text-gray-600 dark:text-gray-300">Comprehensive error-checking and data validation to prevent common modeling mistakes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Related Models Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Popular Model Templates
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Explore our library of professional-grade financial models available for immediate purchase
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [DCF Valuation Model Preview]
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    DCF Valuation Suite
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Comprehensive discounted cash flow analysis with integrated 3-statement projections.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-teal-500">$2,985</span>
                    <Link href="/models/dcf-valuation-suite" className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Real Estate Model Preview]
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Multifamily Acquisition Model
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Comprehensive underwriting for apartment complexes with unit-level analysis.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-teal-500">$4,985</span>
                    <Link href="/models/multifamily-acquisition-model" className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Portfolio Model Preview]
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Portfolio Attribution Model
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Analyze performance drivers and attribution factors across investment positions.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-teal-500">$2,985</span>
                    <Link href="/models/portfolio-attribution-model" className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            </Motion>
          </div>
          
          <Motion animation="fade" direction="up" delay={500}>
            <div className="text-center mt-8">
              <Button href="/models" variant="primary" size="lg">
                View All Models
              </Button>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">
              Ready for a Custom Financial Model?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let&apos;s discuss your specific modeling needs and create a solution that enhances your investment analysis capabilities.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Request Custom Model
              </Button>
              <Button href="/solutions" variant="secondary" size="lg">
                View All Solutions
              </Button>
            </div>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}