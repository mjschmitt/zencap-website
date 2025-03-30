// src/pages/services.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import SEO from '@/components/SEO';

export default function Services() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Zenith Capital Financial Services",
    "description": "Custom financial modeling and investment advisory services tailored to your specific needs.",
    "provider": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors"
    },
    "serviceType": "Financial Modeling and Investment Advisory",
    "areaServed": "Global"
  };

  return (
    <Layout>
      <SEO
        title="Custom Financial Solutions"
        description="Explore our custom financial modeling and investment advisory services tailored to your specific needs."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Custom Solutions
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Tailored expertise to elevate your investment capabilities and decision-making
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <Button href="/contact" variant="accent" size="lg">
              Schedule a Consultation
            </Button>
          </Motion>
        </div>
      </section>
      
      {/* Financial Modeling Service */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Motion animation="fade" direction="right">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-10 bg-gold-500 mr-4"></div>
                  <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                    Customized Financial Modeling & Valuation
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Bespoke models and valuation frameworks aligned with your investment strategy. Our financial modeling services deliver tailored analytical tools for both public and private equity investments, providing deeper insights and competitive advantage.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Custom Model Development</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Valuation Framework Design</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Model Enhancement & Optimization</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Financial Modeling Training</span>
                  </li>
                </ul>
                <a href="/services/financial-modeling" className="inline-flex items-center font-medium text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-gray-300">
                  Learn more about our modeling services
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="bg-gray-100 dark:bg-navy-700 h-80 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                [Financial Modeling Image]
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Infrastructure Service */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Motion animation="fade" direction="right" className="order-2 md:order-1">
              <div className="bg-gray-100 dark:bg-navy-700 h-80 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                [Investment Infrastructure Image]
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left" className="order-1 md:order-2">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-10 bg-gold-500 mr-4"></div>
                  <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                    Investment Infrastructure Development
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  End-to-end systems for streamlining investment analysis, decision-making, and monitoring. We help investment firms develop comprehensive infrastructure that transforms disparate analyses into cohesive, systematic processes.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Process Assessment & Design</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Data Architecture Development</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Dashboard & Reporting Systems</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Infrastructure Implementation</span>
                  </li>
                </ul>
                <a href="/services/infrastructure" className="inline-flex items-center font-medium text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-gray-300">
                  Learn more about our infrastructure services
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Research Service */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Motion animation="fade" direction="right">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-10 bg-gold-500 mr-4"></div>
                  <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
                    Bespoke Industry & Market Research
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Specialized research to inform investment strategy and identify opportunities. Our research goes beyond publicly available information to provide proprietary insights that drive superior investment decisions.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Market Opportunity Analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Competitive Landscape Mapping</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Industry Deep-Dive</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-gold-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Thematic Investment Research</span>
                  </li>
                </ul>
                <a href="/services/research" className="inline-flex items-center font-medium text-navy-700 dark:text-white hover:text-navy-900 dark:hover:text-gray-300">
                  Learn more about our research services
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="bg-gray-100 dark:bg-navy-700 h-80 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                [Industry Research Image]
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Process Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold text-navy-700 dark:text-white text-center mb-12">
              Our Process
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <div className="text-center">
                <div className="h-16 w-16 bg-navy-700 dark:bg-navy-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Discovery
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We begin by understanding your investment strategy, current processes, and specific needs.
                </p>
              </div>
            </Motion>
            
            {/* Step 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="text-center">
                <div className="h-16 w-16 bg-navy-700 dark:bg-navy-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Solution Design
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our team develops a detailed proposal with a customized solution designed for your needs.
                </p>
              </div>
            </Motion>
            
            {/* Step 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center">
                <div className="h-16 w-16 bg-navy-700 dark:bg-navy-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Development
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We create your solution with meticulous attention to detail, incorporating your feedback.
                </p>
              </div>
            </Motion>
            
            {/* Step 4 */}
            <Motion animation="fade" direction="up" delay={500}>
              <div className="text-center">
                <div className="h-16 w-16 bg-navy-700 dark:bg-navy-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                  Implementation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We deliver your solution with comprehensive documentation and training.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">Ready to elevate your investment process?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Schedule a consultation to discuss your specific needs and how we can help.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <Button href="/contact" variant="accent" size="lg">
              Schedule a Free Consultation
            </Button>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}