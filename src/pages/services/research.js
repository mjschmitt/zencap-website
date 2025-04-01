// src/pages/services/research.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

export default function IndustryResearch() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Industry Research Services",
    "description": "Comprehensive industry research and market analysis for informed investment decisions.",
    "provider": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors"
    },
    "serviceType": "Investment Research",
    "areaServed": "Global"
  };

  return (
    <Layout>
      <SEO
        title="Industry Research"
        description="Comprehensive industry and market research to inform your investment decisions and identify compelling opportunities."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Industry Research
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Actionable insights to power your investment decisions
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
                Informed Decisions Through Deep Research
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                In today's complex investment landscape, surface-level analysis isn't enough. Zenith Capital provides specialized research that goes beyond publicly available information to uncover insights that drive superior investment decisions and identify compelling opportunities.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Whether you're evaluating a specific opportunity, exploring a new market, or developing an investment thesis, our research team combines rigorous analysis with practical investment experience to deliver actionable intelligence tailored to your specific needs.
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Market Opportunity Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive assessments of market size, growth trajectories, competitive dynamics, and entry barriers to identify attractive investment opportunities.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Total addressable market sizing</li>
                  <li>Growth driver identification</li>
                  <li>Competitive intensity assessment</li>
                  <li>Market segmentation analysis</li>
                  <li>Regulatory environment evaluation</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Competitive Landscape Mapping
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Detailed analysis of competitors, their strategies, strengths, weaknesses, and market positioning to identify competitive advantages and potential disruptions.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Competitor profiling and benchmarking</li>
                  <li>Strategic positioning assessment</li>
                  <li>Value chain analysis</li>
                  <li>Competitive advantage identification</li>
                  <li>Future competitive evolution forecasting</li>
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
                  Industry Deep-Dive Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Thorough examination of industry structure, dynamics, trends, and profitability drivers to provide a foundation for investment decision-making.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Industry structure analysis</li>
                  <li>Value chain examination</li>
                  <li>Profitability driver identification</li>
                  <li>Technological disruption assessment</li>
                  <li>Historical evolution and future trends</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 4 */}
            <Motion animation="fade" direction="up" delay={500}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Thematic Investment Research
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Development of investment theses around macro trends, emerging technologies, or market disruptions, identifying the best-positioned companies and sectors.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Trend identification and validation</li>
                  <li>Growth curve projection</li>
                  <li>Winner and loser identification</li>
                  <li>Investment opportunity mapping</li>
                  <li>Risk assessment and mitigation strategies</li>
                </ul>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Approach Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-12 text-center">
              Our Research Approach
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Approach 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md h-full">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 text-center">
                  Comprehensive Data Collection
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We gather information from diverse sources including industry reports, primary research interviews, regulatory filings, academic research, and proprietary datasets to form a complete picture of the market landscape.
                </p>
              </div>
            </Motion>
            
            {/* Approach 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md h-full">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 text-center">
                  Rigorous Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our team applies structured analytical frameworks, quantitative modeling, and scenario analysis to distill complex information into clear insights that drive investment conviction.
                </p>
              </div>
            </Motion>
            
            {/* Approach 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md h-full">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3 text-center">
                  Investment Context
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Unlike academic or general market research, our work is designed specifically for investment applications, focusing on factors that drive financial returns and investment performance.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Examples Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Recent Research Examples
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Example 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="h-full p-6">
                <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium mb-4">
                  Healthcare Technology
                </span>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                  The Future of Remote Patient Monitoring
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Market sizing, growth trajectory analysis, technology assessment, and identification of emerging leaders in the rapidly evolving remote healthcare monitoring sector.
                </p>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>38-page report with interactive market model</span>
                  </div>
                </div>
              </Card>
            </Motion>
            
            {/* Example 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full p-6">
                <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium mb-4">
                  Clean Energy
                </span>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                  Grid-Scale Energy Storage Revolution
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Competitive landscape assessment, cost curve projections, regulatory impact analysis, and identification of winners and losers in the evolving energy storage industry.
                </p>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>42-page report with company positioning matrix</span>
                  </div>
                </div>
              </Card>
            </Motion>
            
            {/* Example 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full p-6">
                <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium mb-4">
                  Financial Services
                </span>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                  Embedded Finance Opportunity Map
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Market segmentation, adoption curve assessment, value chain analysis, and investment opportunity framework for the rapidly growing embedded financial services sector.
                </p>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>35-page report with opportunity sizing model</span>
                  </div>
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
            <h2 className="text-3xl font-bold mb-4">Gain the Research Edge</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let's discuss how our industry research can provide the insights you need to identify and capitalize on compelling investment opportunities.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button href="/contact" variant="accent" size="lg">
                Discuss Your Research Needs
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