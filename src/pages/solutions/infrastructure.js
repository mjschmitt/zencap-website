// src/pages/solutions/infrastructure.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

export default function InvestmentInfrastructure() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Investment Infrastructure Services",
    "description": "End-to-end investment infrastructure solutions for asset managers and investment firms.",
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
        title="Investment Infrastructure Solutions"
        description="Our investment infrastructure solutions for asset managers and investment firms. Build end-to-end systems to streamline operations and enhance decision-making."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Investment Infrastructure
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              End-to-end systems to streamline operations and enhance investment decision-making
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
                Comprehensive Investment Infrastructure Solutions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                At Zenith Capital Advisors, we build the technological and analytical backbone that powers modern investment operations. Our solutions connect data, analysis, and decision-making in seamless systems that scale with your organization.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Whether you need to optimize a specific component of your investment process or build a comprehensive infrastructure from the ground up, our team brings both technical expertise and investment knowledge to create solutions that drive better outcomes.
              </p>
            </div>
          </Motion>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Service 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Investment Data Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive solutions for collecting, organizing, and leveraging investment data across your organization.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Data warehouse design and implementation</li>
                  <li>Integration with external data providers</li>
                  <li>Automated data collection and validation</li>
                  <li>Master data management</li>
                  <li>Historical data preservation and access</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Portfolio Management Systems
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Integrated systems for tracking, analyzing, and optimizing investment portfolios across asset classes.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Position tracking and reporting</li>
                  <li>Performance measurement and attribution</li>
                  <li>Risk monitoring and management</li>
                  <li>Trade order management</li>
                  <li>Compliance and restriction monitoring</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Investment Analytics Platforms
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Advanced analytical tools and dashboards that provide actionable insights for investment decision-making.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Custom analytics dashboards</li>
                  <li>Interactive visualization tools</li>
                  <li>Automated reporting systems</li>
                  <li>Investment decision support tools</li>
                  <li>Scenario and sensitivity analysis frameworks</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 4 */}
            <Motion animation="fade" direction="up" delay={500}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  System Integration & Workflow Automation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our Investment Data Management solutions integrate seamlessly with your existing systems, ensuring that you&apos;re always working with up-to-date, accurate information.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>API development and implementation</li>
                  <li>Cross-system data synchronization</li>
                  <li>Investment workflow automation</li>
                  <li>Custom integration solutions</li>
                  <li>Middleware and ETL process design</li>
                </ul>
              </Card>
            </Motion>
          </div>
          
          {/* Additional Benefits Section */}
          <Motion animation="fade" direction="up" delay={600}>
            <div className="bg-gray-50 dark:bg-navy-800/50 rounded-lg shadow-md p-8 mb-12">
              <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                Benefits of Our Infrastructure Solutions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Operational Efficiency
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Our solutions streamline investment processes, reduce manual work, and eliminate data silos, allowing your team to focus on high-value activities rather than administrative tasks.
                  </p>
                  
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Enhanced Decision-Making
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    By providing timely access to accurate data and analytical insights, our infrastructure solutions empower investment teams to make better-informed decisions with confidence.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Scalability
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Our infrastructure solutions are designed to grow with your organization, accommodating increasing data volumes, new asset classes, and expanding investment teams without sacrificing performance.
                  </p>
                  
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Risk Reduction
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    By automating processes, enforcing data governance standards, and providing robust audit trails, our solutions help reduce operational risk and enhance compliance capabilities.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
          
          {/* Implementation Approach Section */}
          <Motion animation="fade" direction="up" delay={700}>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                Our Implementation Approach
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">1</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Assessment
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    We begin by understanding your current processes, systems, and data infrastructure to identify opportunities for improvement and define clear objectives.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">2</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Design
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our team designs a tailored solution that addresses your specific needs, integrates with existing systems, and provides a foundation for future growth.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">3</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Implementation
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    We execute the implementation using an agile approach, delivering value incrementally and adjusting based on feedback to ensure alignment with your objectives.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">4</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Training & Knowledge Transfer
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    We provide comprehensive training to ensure your team can effectively utilize and maintain the new infrastructure, maximizing the return on your investment.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">5</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    Ongoing Support & Evolution
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our relationship continues beyond implementation with ongoing support, regular reviews, and enhancement recommendations to ensure your infrastructure evolves with your needs.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* Case Studies Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Client Success Stories
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Case Study 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="h-full p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Global Asset Manager
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We developed a unified data platform that integrated 12 separate systems, reducing manual data processing by 85% and enabling portfolio managers to access comprehensive investment analytics through a single dashboard.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Results:</span> 60% reduction in reporting time, $1.2M annual cost savings, improved investment decision quality
                </div>
              </Card>
            </Motion>
            
            {/* Case Study 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full p-6">
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Private Equity Firm
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We designed and implemented a deal management system with integrated financial modeling capabilities, automating the flow of data from initial screening through due diligence, investment committee approval, and ongoing portfolio monitoring.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Results:</span> 40% increase in deal assessment capacity, standardized investment processes, enhanced institutional knowledge retention
                </div>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">Ready to upgrade your investment infrastructure?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let&apos;s explore how our investment infrastructure solutions can transform your organization.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <Button href="/contact" variant="accent" size="lg">
              Schedule a Consultation
            </Button>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}