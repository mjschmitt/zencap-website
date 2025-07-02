// src/pages/solutions/infrastructure.js - with larger hero background
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import Image from 'next/image';
import Link from 'next/link';

export default function InvestmentInfrastructure() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Investment Infrastructure Services",
    "description": "End-to-end investment infrastructure solutions including deal management platforms, portfolio monitoring, and automated reporting systems.",
    "provider": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    },
    "serviceType": "Investment Technology",
    "areaServed": "Global"
  };

  return (
    <Layout>
      <SEO
        title="Investment Infrastructure"
        description="End-to-end investment infrastructure solutions including deal management platforms, portfolio monitoring dashboards, and automated reporting systems."
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/solutions/infrastructure/infrastructure-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Investment Infrastructure
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Integrated systems that enhance decision-making and operational efficiency
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <Button href="#solutions" variant="accent" size="lg">
              Explore Solutions
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
                  Modernize Your Investment Operations
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  In today&apos;s competitive investment landscape, operational efficiency can be the difference between capturing opportunities and missing them. Our investment infrastructure solutions are designed to automate routine tasks, centralize critical information, and provide real-time insights that enable faster, more informed decision-making.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Whether you&apos;re managing a private equity fund, real estate portfolio, or institutional investment program, our technology solutions scale with your needs and integrate seamlessly with your existing workflows.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-500 mb-1">75%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Time Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-500 mb-1">40%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Faster Reporting</div>
                  </div>
                </div>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src="/images/solutions/infrastructure/infrastructure-overview.jpg" 
                  alt="Investment infrastructure and technology"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Solutions Section */}
      <section id="solutions" className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Our Infrastructure Solutions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Comprehensive technology solutions designed to optimize every aspect of your investment operations
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Deal Management Platform */}
            <Motion animation="fade" direction="up" delay={200} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Deal Management Platform
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Centralized platform for tracking deal flow, managing due diligence processes, and coordinating investment committee workflows.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Deal pipeline management
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Due diligence tracking
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Investment committee workflows
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Portfolio Monitoring */}
            <Motion animation="fade" direction="up" delay={300} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Portfolio Monitoring
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Real-time dashboards and analytics for monitoring portfolio performance, tracking key metrics, and identifying trends.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Real-time performance dashboards
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Risk monitoring and alerts
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Benchmark comparisons
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Automated Reporting */}
            <Motion animation="fade" direction="up" delay={400} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Automated Reporting
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Streamlined reporting systems that automatically generate investor reports, regulatory filings, and internal analytics.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Investor reporting automation
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Regulatory compliance reports
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom analytics dashboards
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Data Integration */}
            <Motion animation="fade" direction="up" delay={500} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Data Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Seamless integration with existing systems, data providers, and third-party services to create a unified data ecosystem.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API integrations
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Data validation and cleansing
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Real-time data synchronization
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Compliance & Security */}
            <Motion animation="fade" direction="up" delay={600} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Compliance & Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Enterprise-grade security and compliance frameworks designed to meet regulatory requirements and protect sensitive data.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SOC 2 compliance
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Data encryption and backup
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Audit trails and access controls
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Business Intelligence */}
            <Motion animation="fade" direction="up" delay={700} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Business Intelligence
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Advanced analytics and machine learning capabilities to identify patterns, predict trends, and optimize investment strategies.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Predictive analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Machine learning models
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interactive data visualization
                  </li>
                </ul>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Implementation Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Implementation Process
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our systematic approach ensures smooth deployment and rapid time-to-value
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
                  Discovery & Planning
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Comprehensive assessment of your current systems, workflows, and requirements to design the optimal solution.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">2</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  System Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Custom configuration and integration of platforms, data sources, and user interfaces to match your specific needs.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">3</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Testing & Training
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Rigorous testing with your data and comprehensive training for your team to ensure confident adoption.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={500}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">4</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Launch & Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Seamless go-live with ongoing support, monitoring, and optimization to ensure continued success.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Motion animation="fade" direction="right">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src="/images/solutions/infrastructure-benefits.jpg" 
                  alt="Investment infrastructure benefits and ROI"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div>
                <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-6">
                  Measurable Impact on Your Operations
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Increased Efficiency</h3>
                      <p className="text-gray-600 dark:text-gray-300">Automate routine tasks and eliminate manual processes, freeing up your team to focus on high-value activities.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Enhanced Decision Making</h3>
                      <p className="text-gray-600 dark:text-gray-300">Real-time access to comprehensive data and analytics enables faster, more informed investment decisions.</p>
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
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Risk Mitigation</h3>
                      <p className="text-gray-600 dark:text-gray-300">Comprehensive monitoring and alert systems help identify and address potential issues before they impact performance.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Scalable Growth</h3>
                      <p className="text-gray-600 dark:text-gray-300">Infrastructure that grows with your organization, supporting expansion without compromising performance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Technology Stack */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Technology Partners
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We work with leading technology providers to deliver best-in-class solutions
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              'Salesforce',
              'Microsoft',
              'AWS',
              'Tableau',
              'Snowflake',
              'Python',
              'PostgreSQL',
              'React',
              'Docker',
              'Kubernetes',
              'PowerBI',
              'Zapier'
            ].map((technology, index) => (
              <Motion key={technology} animation="fade" direction="up" delay={index * 50}>
                <div className="text-center p-4 bg-gray-50 dark:bg-navy-800 rounded-lg">
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {technology}
                  </p>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Investment Operations?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let&apos;s discuss how our infrastructure solutions can streamline your workflows and enhance your investment capabilities.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Schedule Discovery Call
              </Button>
              <Button href="/solutions/financial-modeling" variant="secondary" size="lg">
                View Financial Modeling
              </Button>
            </div>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}