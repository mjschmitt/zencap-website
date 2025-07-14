// src/pages/solutions/research.js - with larger hero background
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import Image from 'next/image';
import Link from 'next/link';

export default function IndustryResearch() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Industry Research Services",
    "description": "Specialized research and analysis services to inform investment strategy, identify opportunities, and navigate market complexities.",
    "provider": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    },
    "serviceType": "Market Research",
    "areaServed": "Global"
  };

  return (
    <Layout>
      <SEO
        title="Industry Research"
        description="Specialized research and analysis services to inform investment strategy, identify opportunities, and navigate market complexities across multiple sectors."
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/solutions/research/research-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Industry Research
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Deep sector expertise and analytical insights to enhance your investment decision-making and identify emerging opportunities
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <Button href="#research-areas" variant="accent" size="lg">
              Explore Research Areas
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
                  Strategic Intelligence for Investment Excellence
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  In today&apos;s rapidly evolving markets, successful investing requires more than financial analysis—it demands deep understanding of industry dynamics, competitive landscapes, and emerging trends. Our research services provide the strategic intelligence you need to identify opportunities, assess risks, and position portfolios for long-term success.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Our team combines rigorous analytical methods with sector-specific expertise to deliver insights that go beyond surface-level data. Whether you&apos;re evaluating a new investment thesis, conducting due diligence, or seeking to understand market dynamics, our research provides the foundation for confident decision-making.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-500 mb-1">50+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Research Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-500 mb-1">15+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Industry Sectors</div>
                  </div>
                </div>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image 
                  src="/images/solutions/research/research-overview.jpg" 
                  alt="Industry research and market analysis"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Research Areas Section */}
      <section id="research-areas" className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Our Research Capabilities
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Comprehensive research services designed to support every aspect of your investment process
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Market Analysis */}
            <Motion animation="fade" direction="up" delay={200} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Market Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  In-depth analysis of market dynamics, size, growth trends, and key drivers affecting investment opportunities.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Market sizing and segmentation
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Growth trend analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Regulatory impact assessment
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Competitive Intelligence */}
            <Motion animation="fade" direction="up" delay={300} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Competitive Intelligence
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive analysis of competitive landscapes, market positioning, and strategic differentiation factors.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Competitor benchmarking
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Strategic positioning analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Market share dynamics
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Industry Trends */}
            <Motion animation="fade" direction="up" delay={400} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Industry Trends
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Forward-looking analysis of emerging trends, technological disruptions, and structural changes shaping industries.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Technology disruption analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Consumer behavior shifts
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Regulatory evolution
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Due Diligence Support */}
            <Motion animation="fade" direction="up" delay={500} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Due Diligence Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Specialized research to support investment due diligence processes with industry-specific insights and risk assessment.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Industry risk assessment
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Market validation studies
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Commercial due diligence
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* Investment Themes */}
            <Motion animation="fade" direction="up" delay={600} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Investment Themes
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Development of compelling investment themes based on deep research into structural changes and long-term opportunities.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Thematic investment research
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Macro trend identification
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Opportunity assessment
                  </li>
                </ul>
              </Card>
            </Motion>
            
            {/* ESG & Sustainability */}
            <Motion animation="fade" direction="up" delay={700} className="h-full">
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  ESG & Sustainability
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Research on environmental, social, and governance factors that increasingly influence investment outcomes and valuations.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ESG impact assessment
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sustainability trend analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Climate risk evaluation
                  </li>
                </ul>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Research Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Our Research Process
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Rigorous methodology that combines multiple research approaches to deliver comprehensive insights
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
                  Scope Definition
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Work with you to clearly define research objectives, key questions, and success metrics for the project.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">2</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Data Collection
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Gather information from primary and secondary sources, including industry reports, expert interviews, and proprietary databases.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">3</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Analysis & Synthesis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Apply analytical frameworks to synthesize findings, identify patterns, and develop insights that address your key questions.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={500}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-500">4</span>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Recommendations
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Present actionable recommendations and strategic implications in clear, executive-ready formats tailored to your needs.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Sector Expertise */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Sector Expertise
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Deep knowledge across key industries and emerging sectors
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Technology
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Software, semiconductors, AI/ML, cloud computing, cybersecurity, and emerging tech platforms.
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
                  Real Estate
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Commercial, residential, industrial, hospitality, and specialized property sectors across global markets.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Healthcare
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Pharmaceuticals, biotechnology, medical devices, digital health, and healthcare services.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={500}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Financial Services
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Banking, insurance, fintech, asset management, and emerging financial technologies.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={600}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Energy & Utilities
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Renewable energy, traditional energy, utilities, and energy transition technologies.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={700}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Consumer & Retail
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  E-commerce, retail, consumer goods, food & beverage, and direct-to-consumer brands.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={800}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Industrials
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Manufacturing, aerospace & defense, transportation, logistics, and industrial automation.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={900}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Emerging Sectors
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Climate tech, space economy, digital assets, and other rapidly evolving investment themes.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Case Studies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Research Impact
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Examples of how our research has informed strategic decisions and enhanced investment outcomes
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                  Cloud Infrastructure Opportunity
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Our research on AI-driven compute demand helped a client identify a $500M data center investment opportunity 18 months ahead of broader market recognition.
                </p>
                <div className="text-teal-500 font-semibold text-sm">
                  Result: 23% IRR vs. 12% market average
                </div>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                  Healthcare Tech Due Diligence
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Comprehensive analysis of regulatory risks and competitive dynamics prevented a client from pursuing a $200M healthcare software acquisition with significant hidden risks.
                </p>
                <div className="text-teal-500 font-semibold text-sm">
                  Result: Avoided 40%+ potential loss
                </div>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full bg-white dark:bg-navy-800 p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                  ESG Investment Theme
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Our research on climate transition technologies informed the development of a $1B+ thematic investment strategy focused on energy storage and grid modernization.
                </p>
                <div className="text-teal-500 font-semibold text-sm">
                  Result: Top-quartile fund performance
                </div>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Related Insights */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Latest Research Insights
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Explore our recent research and analysis on key investment themes
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [AI Impact Research Preview]
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    AI Impact on SaaS Valuations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    How AI capabilities are reshaping valuation multiples for software companies, with a proposed framework for measuring AI-driven value creation.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">March 2025</span>
                    <Link href="/insights/ai-impact-saas-valuations" className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                      Read More
                    </Link>
                  </div>
                </div>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Semiconductor Supply Chain Preview]
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Semiconductor Supply Chain Resilience
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Examining how geopolitical tensions and reshoring efforts are transforming semiconductor manufacturing investments.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">March 2025</span>
                    <Link href="/insights/semiconductor-supply-chain-resilience" className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                      Read More
                    </Link>
                  </div>
                </div>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Data Centers Research Preview]
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Data Centers: The New Essential CRE
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    How AI computing demands are driving unprecedented growth in data center development and creating compelling investment opportunities.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">March 2025</span>
                    <Link href="/insights/commercial-real-estate-data-centers" className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                      Read More
                    </Link>
                  </div>
                </div>
              </Card>
            </Motion>
          </div>
          
          <Motion animation="fade" direction="up" delay={500}>
            <div className="text-center mt-8">
              <Button href="/insights" variant="primary" size="lg">
                View All Insights
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
              Need Custom Research Support?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let&apos;s discuss how our research capabilities can support your investment thesis development and due diligence processes.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Discuss Research Needs
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