// src/pages/solutions/index.js - with larger hero background
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import Image from 'next/image';
import Link from 'next/link';
import { getImageWithVersion } from '@/utils/imageUtils';

export default function Solutions() {
  // Enhanced structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Investment Advisory Solutions - Zenith Capital",
    "description": "Comprehensive financial modeling, investment infrastructure, and industry research services for institutional investors and private equity firms.",
    "url": "https://zencap-website.vercel.app/solutions",
    "provider": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap-website.vercel.app/images/logo/zenith-capital-logo.png"
      }
    },
    "serviceType": [
      "Financial Modeling",
      "Investment Infrastructure",
      "Industry Research",
      "Investment Advisory"
    ],
    "areaServed": "United States",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Investment Advisory Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Financial Modeling",
            "description": "Bespoke financial models for investment analysis"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Investment Infrastructure",
            "description": "End-to-end systems for investment operations"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Industry Research",
            "description": "Specialized research for investment strategy"
          }
        }
      ]
    }
  };

  return (
    <Layout>
      <SEO
        title="Investment Advisory Solutions - Financial Modeling & Research"
        description="Comprehensive investment advisory solutions including custom financial modeling, infrastructure development, and industry research for institutional investors and private equity firms."
        keywords="investment advisory solutions, financial modeling services, investment infrastructure, industry research, institutional investors, private equity advisory, financial consulting services"
        ogImage="/images/og/solutions-zenith-capital.jpg"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" }
        ]}
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[calc(80vh-48px)] flex items-center"
        style={{ backgroundImage: 'url(/images/solutions/solutions-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Our Solutions
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Custom advisory solutions that streamline investment decision-making
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <Button href="#services" variant="accent" size="lg">
              Explore Services
            </Button>
          </Motion>
        </div>
      </section>
      
      {/* Main Services Section */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Our Core Services
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We provide sophisticated analytical tools and strategic insights to enhance your investment decision-making capabilities
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Financial Modeling */}
            <Motion animation="fade" direction="up" delay={200} className="h-full">
              <Link href="/solutions/financial-modeling">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-navy-800 cursor-pointer group" padding={false}>
                  <div className="h-52 relative overflow-hidden">
                    <Image 
                      src={getImageWithVersion('/images/solutions/financial-modeling-service.jpg', 'v2')}
                      alt="Investment professionals analyzing complex financial models and DCF valuations on multiple screens in luxury advisory office"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Financial Modeling
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Custom financial models designed to meet your specific analytical needs, from DCF valuations to complex real estate development models.
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Custom DCF and valuation models
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Real estate acquisition and development models
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Portfolio and performance attribution analysis
                      </li>
                    </ul>
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Learn more
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            </Motion>
            
            {/* Investment Infrastructure */}
            <Motion animation="fade" direction="up" delay={300} className="h-full">
              <Link href="/solutions/infrastructure">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-navy-800 cursor-pointer group" padding={false}>
                  <div className="h-52 relative overflow-hidden">
                    <Image 
                      src="/images/solutions/investment-infrastructure-service.jpg"
                      alt="Cutting-edge investment infrastructure and technology with integrated data and real-time analytics in modern tropical office setting"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Investment Infrastructure
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      End-to-end systems to streamline your investment operations, improve data management, and enhance decision-making capabilities.
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Deal management platforms
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Portfolio monitoring dashboards
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Automated reporting systems
                      </li>
                    </ul>
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Learn more
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            </Motion>
            
            {/* Industry Research */}
            <Motion animation="fade" direction="up" delay={400} className="h-full">
              <Link href="/solutions/research">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-navy-800 cursor-pointer group" padding={false}>
                  <div className="h-52 relative overflow-hidden">
                    <Image 
                      src="/images/solutions/industry-research-service.jpg"
                      alt="Investment research analysts conducting market analysis with advanced data visualization tools overlooking mountainous coastline from luxury investment office"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Industry Research
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Specialized research to inform your investment strategy, identify opportunities, and navigate market complexities.
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Market trend analysis
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Competitive landscape studies
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Due diligence support
                      </li>
                    </ul>
                    <div className="inline-flex items-center text-teal-500 group-hover:text-teal-600 font-medium">
                      Learn more
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Our Approach Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Motion animation="fade" direction="right">
              <div>
                <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-6">
                  Our Approach
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  We believe that sophisticated analysis shouldn&apos;t come at the expense of usability. Our solutions combine rigorous quantitative methods with intuitive design, ensuring that complex financial concepts are accessible and actionable.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Rigorous Analysis</h3>
                      <p className="text-gray-600 dark:text-gray-300">Every model and recommendation is built on solid quantitative foundations and tested assumptions.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Practical Implementation</h3>
                      <p className="text-gray-600 dark:text-gray-300">Our solutions are designed for real-world application, with clear documentation and ongoing support.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">Client Partnership</h3>
                      <p className="text-gray-600 dark:text-gray-300">We view every engagement as a long-term partnership, adapting our approach to your evolving needs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src="/images/solutions/investment-advisory-approach-collaboration.jpg" 
                  alt="Analytical investment advisory approach for public and private equity solutions"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Industry Focus Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Industry Focus
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our expertise spans multiple asset classes and investment strategies
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Real Estate
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Multifamily, commercial, mixed-use, and hospitality properties
                </p>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Public Equity
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Technology, healthcare, financial services, and growth companies
                </p>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Private Equity
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  LBOs, growth capital, and special situations investments
                </p>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={500}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Alternative Assets
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Infrastructure, credit, and specialized investment strategies
                </p>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">
              Ready to elevate your investment analysis?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let&apos;s discuss how our solutions can transform your investment process and decision-making capabilities.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Schedule Consultation
              </Button>
              <Button href="/models" variant="secondary" size="lg">
                View Our Models
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