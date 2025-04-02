// src/pages/services/infrastructure.js
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
    "serviceType": "Financial Technology",
    "areaServed": "Global"
  };

  return (
    <Layout>
      <SEO
        title="Investment Infrastructure"
        description="End-to-end investment infrastructure solutions that streamline your investment operations, improve data management, and enhance decision-making."
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
              Comprehensive systems and processes to streamline your investment operations
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
                Building Robust Investment Infrastructure
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Effective investment management requires more than just strong analysis — it demands robust systems and processes that support consistent execution. At Zenith Capital Advisors, we help investment firms develop comprehensive infrastructure that transforms disparate analyses into cohesive, systematic processes.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Our infrastructure solutions integrate data management, analytical tools, and operational workflows into unified systems that enhance decision-making, improve collaboration, and provide critical transparency for both internal teams and external stakeholders.
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Data Architecture & Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Designing robust data systems that centralize and organize investment information from multiple sources into accessible, actionable formats.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Data warehouse design</li>
                  <li>API integration development</li>
                  <li>Source system connectivity</li>
                  <li>Data quality assurance</li>
                  <li>Information security protocols</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Dashboard & Reporting Systems
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Creating comprehensive dashboards and reporting frameworks that deliver key insights to stakeholders in intuitive, actionable formats.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Executive dashboards</li>
                  <li>Investor reporting systems</li>
                  <li>Investment committee materials</li>
                  <li>Performance visualization</li>
                  <li>Automated report generation</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Investment Process Automation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Implementing automated workflows that streamline routine tasks, reduce errors, and free up valuable time for higher-value investment activities.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Workflow automation</li>
                  <li>Document generation</li>
                  <li>Data collection processes</li>
                  <li>Approval systems</li>
                  <li>Integration with existing tools</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 4 */}
            <Motion animation="fade" direction="up" delay={500}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Collaboration & Knowledge Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Developing systems that enhance collaboration across investment teams and preserve institutional knowledge over time.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Centralized research repositories</li>
                  <li>Team collaboration platforms</li>
                  <li>Investment thesis documentation</li>
                  <li>Deal pipeline management</li>
                  <li>Knowledge sharing protocols</li>
                </ul>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-12 text-center">
              Benefits of Robust Investment Infrastructure
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md h-full">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 text-center">
                  Enhanced Decision-Making
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                  Access to comprehensive, timely data and analytics enables faster, more informed investment decisions and reduces cognitive biases.
                </p>
              </div>
            </Motion>
            
            {/* Benefit 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md h-full">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 text-center">
                  Operational Efficiency
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                  Automated processes and streamlined workflows reduce manual efforts, minimize errors, and allow your team to focus on high-value activities.
                </p>
              </div>
            </Motion>
            
            {/* Benefit 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md h-full">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 text-center">
                  Institutional Resilience
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                  Systematic processes and knowledge management create continuity through team changes and market cycles, preserving key insights and methodologies.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Case Study Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-navy-700 text-white p-8 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Case Study</h3>
                    <p className="text-gray-300 italic">Private Equity Firm</p>
                    <div className="mt-6 mb-4 h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto">
                      <div className="h-10 w-10 bg-teal-500" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                    </div>
                    <p className="text-sm text-gray-300">$2.5B AUM</p>
                  </div>
                </div>
                <div className="md:w-2/3 p-8">
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
                    Transforming Deal Pipeline Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    A mid-sized private equity firm came to us struggling with fragmented deal tracking, inconsistent analytics, and limited visibility into their investment pipeline. This led to missed opportunities and inefficient decision processes.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We developed an integrated pipeline management system that combined deal sourcing, preliminary analysis, due diligence tracking, and investment committee materials into a unified platform accessible to all team members.
                  </p>
                  <div className="mt-6 text-navy-700 dark:text-white font-bold">
                    Results:
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 mt-2">
                    <li>40% reduction in time from initial review to final decision</li>
                    <li>65% increase in deal throughput with the same team size</li>
                    <li>Comprehensive visibility across the firm's entire opportunity set</li>
                    <li>Standardized analytical approach ensuring consistent evaluation</li>
                  </ul>
                </div>
              </div>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">Strengthen Your Investment Infrastructure</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let's discuss how our infrastructure solutions can transform your investment processes, enhance decision-making, and drive superior performance.
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