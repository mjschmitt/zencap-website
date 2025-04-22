// src/pages/services/financial-modeling.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

export default function FinancialModeling() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Financial Modeling Services",
    "description": "Custom financial modeling services for investment firms and corporate clients.",
    "provider": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors"
    },
    "serviceType": "Financial Advisory",
    "areaServed": "Global"
  };

  return (
    <Layout>
      <SEO
        title="Financial Modeling Services"
        description="Our custom financial modeling services for investment firms and corporations. Build robust models tailored to your specific needs and investment strategy."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Financial Modeling Services
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Bespoke financial models tailored to your investment strategy and decision-making process
            </p>
          </Motion>
        </div>
      </section>
      
      {/* Overview Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="mb-12 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Custom Financial Modeling Solutions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                At Zenith Capital Advisors, we build sophisticated financial models that go beyond standard templates to address your unique investment approach and analytical requirements. Our models are designed to streamline decision-making, reveal key insights, and scale with your organization.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Whether you&apos;re evaluating a specific investment opportunity or building out your entire analytical infrastructure, our team brings both technical expertise and practical investment experience to create solutions that drive better decisions.              </p>
            </div>
          </Motion>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Service 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Acquisition & Valuation Models
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive models for evaluating potential acquisitions and performing detailed valuations across various asset classes and investment types.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>LBO and private equity models</li>
                  <li>DCF and multiples-based valuations</li>
                  <li>Real estate acquisition models</li>
                  <li>Merger and acquisition analysis</li>
                  <li>Scenario and sensitivity testing</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Portfolio Analysis & Reporting
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Sophisticated tools for analyzing portfolio performance, tracking key metrics, and generating customized reports for stakeholders.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Performance attribution models</li>
                  <li>Risk analysis frameworks</li>
                  <li>Automated reporting systems</li>
                  <li>Portfolio optimization tools</li>
                  <li>Investor communication dashboards</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Model Enhancement & Optimization
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Upgrade and optimize your existing financial models to improve performance, add functionality, and increase usability.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Model audit and assessment</li>
                  <li>Performance optimization</li>
                  <li>Formula and structure improvements</li>
                  <li>Automation implementation</li>
                  <li>Documentation and training</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 4 */}
            <Motion animation="fade" direction="up" delay={500}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Financial Training & Knowledge Transfer
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive training and education on financial modeling best practices, ensuring your team can effectively utilize and maintain your models.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Custom training programs</li>
                  <li>Model documentation development</li>
                  <li>Advanced Excel techniques</li>
                  <li>Financial modeling workshops</li>
                  <li>Ongoing support and guidance</li>
                </ul>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Process Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-12 text-center">
              Our Financial Modeling Process
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 mt-4 text-center">
                  Discovery & Requirements
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We begin by deeply understanding your investment strategy, decision-making process, and specific analytical needs to ensure our solution aligns perfectly with your objectives.
                </p>
              </div>
            </Motion>
            
            {/* Step 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 mt-4 text-center">
                  Design & Development
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our team creates a detailed model architecture and builds your solution with meticulous attention to detail, incorporating best practices in financial modeling.
                </p>
              </div>
            </Motion>
            
            {/* Step 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 mt-4 text-center">
                  Testing & Validation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We rigorously test and validate your model against real-world scenarios to ensure accuracy, reliability, and robustness across various conditions.
                </p>
              </div>
            </Motion>
            
            {/* Step 4 */}
            <Motion animation="fade" direction="up" delay={500}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 mt-4 text-center">
                  Implementation & Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We deliver your completed model with comprehensive documentation and training, and provide ongoing support to ensure successful adoption and implementation.
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
            <h2 className="text-3xl font-bold mb-4">Ready to elevate your financial modeling?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let&apos;s discuss how our financial modeling services can transform your investment process.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button href="/contact" variant="accent" size="lg">
                Schedule a Consultation
              </Button>
              <Button href="/services" variant="secondary" size="lg">
                Explore Other Services
              </Button>
            </div>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}