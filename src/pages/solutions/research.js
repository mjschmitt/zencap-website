// src/pages/solutions/research.js
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
    "description": "Specialized research services to inform investment strategy and identify opportunities.",
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
        title="Industry Research Services"
        description="Our specialized research services to inform your investment strategy, identify opportunities, and navigate market complexities."
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
              Data-driven insights to inform investment strategy and identify opportunities
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
                Actionable Investment Research
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our research approach focuses on the metrics that matter most to your specific investment strategy. We don&apos;t produce generic reports that sit on shelves – we deliver actionable insights that directly inform investment decisions.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Whether you&apos;re exploring a new market opportunity, evaluating potential acquisitions, or developing a strategic investment thesis, our team provides the data-driven research you need to move forward with confidence.
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Market Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive analysis of market dynamics, trends, and competitive landscapes to inform investment strategy.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Market sizing and growth projections</li>
                  <li>Competitive landscape analysis</li>
                  <li>Market share assessment</li>
                  <li>Customer segment analysis</li>
                  <li>Market entry evaluation</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Industry Deep Dives
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  In-depth analysis of specific industries, including structure, economics, and growth drivers to identify investment opportunities.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Industry value chain analysis</li>
                  <li>Regulatory environment assessment</li>
                  <li>Industry economics and unit economics</li>
                  <li>Technological disruption analysis</li>
                  <li>Industry growth forecasting</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2M3 16V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Company Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Detailed analysis of individual companies, including business model, competitive position, and growth prospects.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Business model assessment</li>
                  <li>Competitive positioning analysis</li>
                  <li>Management team evaluation</li>
                  <li>Product/service differentiation</li>
                  <li>Financial performance benchmarking</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 4 */}
            <Motion animation="fade" direction="up" delay={500}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Thematic Research
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Cross-industry analysis of major trends and themes that drive investment opportunities and risks across portfolios.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Emerging technology impact assessment</li>
                  <li>Demographic trend analysis</li>
                  <li>Macroeconomic factor evaluation</li>
                  <li>ESG impact assessment</li>
                  <li>Regulatory trend analysis</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 5 */}
            <Motion animation="fade" direction="up" delay={600}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Investment Due Diligence
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive research to support investment due diligence across public and private markets.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Commercial due diligence</li>
                  <li>Operational assessment</li>
                  <li>Management interviews</li>
                  <li>Customer and supplier interviews</li>
                  <li>Competitive threat analysis</li>
                </ul>
              </Card>
            </Motion>
            
            {/* Service 6 */}
            <Motion animation="fade" direction="up" delay={700}>
              <Card className="h-full p-6">
                <div className="h-12 w-12 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Custom Research Projects
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Tailored research initiatives to address specific investment questions and support strategic decision-making.
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <li>Proprietary data collection</li>
                  <li>Expert network interviews</li>
                  <li>Targeted industry surveys</li>
                  <li>Alternative data analysis</li>
                  <li>Competitive intelligence gathering</li>
                </ul>
              </Card>
            </Motion>
          </div>
          
          {/* Research Process Section */}
          <Motion animation="fade" direction="up" delay={800}>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-8 mb-12">
              <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-6 text-center">
                Our Research Process
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">1</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Scope Definition
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Collaboratively define research objectives and key questions to ensure alignment with investment needs.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">2</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Data Collection
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Gather relevant data from diverse sources, including proprietary databases, industry experts, and primary research.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">3</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Analysis
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Apply analytical rigor to identify patterns, trends, and insights relevant to your investment thesis.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">4</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Synthesis
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Distill findings into clear, actionable insights that directly inform investment decisions.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-500">5</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                    Delivery & Dialog
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Present findings and engage in collaborative discussion to maximize the value of research insights.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
          
          {/* Differentiators Section */}
          <Motion animation="fade" direction="up" delay={900}>
            <div className="bg-gray-50 dark:bg-navy-800/50 rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                What Sets Our Research Apart
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3 flex items-center">
                    <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Investment Focus
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    We approach every research project through an investor&apos;s lens, focusing on drivers of value creation and risk factors relevant to investment decisions.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3 flex items-center">
                    <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Primary Research
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    We go beyond desk research to conduct primary research, including expert interviews, customer surveys, and field visits, generating proprietary insights for our clients.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-3 flex items-center">
                    <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Quantitative Rigor
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our research combines qualitative insights with quantitative analysis, providing an empirical foundation for investment hypotheses and financial models.
                  </p>
                </div>
              </div>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              What Our Clients Say
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <div className="max-w-4xl mx-auto bg-white dark:bg-navy-800 rounded-lg shadow-lg p-8 relative">
              <svg className="absolute top-8 left-8 h-12 w-12 text-gray-200 dark:text-navy-700" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              
              <div className="text-center pt-8">
                <p className="text-gray-600 dark:text-gray-300 text-lg italic mb-6">
                  &quot;Zenith&apos;s industry research provided us with critical insights that directly informed our investment in the healthcare technology space. Their ability to combine market analysis with deep operational understanding gave us confidence in our investment thesis and helped us identify key value creation levers.&quot;
                </p>
                
                <div className="inline-flex items-center">
                  <div className="h-12 w-12 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center mr-4">
                    <span className="text-navy-700 dark:text-white font-semibold">JT</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy-700 dark:text-white">Janet Thompson</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Managing Director, Vector Growth Partners</p>
                  </div>
                </div>
              </div>
            </div>
          </Motion>
        </div>
      </section>
      
{/* Use Cases Section */}
<section className="py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <Motion animation="fade" direction="up">
      <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
        Research Use Cases
      </h2>
    </Motion>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Use Case 1 */}
      <Motion animation="fade" direction="up" delay={200}>
        <Card className="h-full p-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
            Investment Thesis Development
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            A growth equity firm engages us to develop a comprehensive thesis on the enterprise AI software market. Our research identifies the most attractive subsegments, maps the competitive landscape, and highlights key selection criteria for potential investments.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium">Outcome:</span> The firm can make informed investment decisions in the space, targeting opportunities with the highest growth potential.
          </div>
        </Card>
      </Motion>
      
      {/* Use Case 2 */}
      <Motion animation="fade" direction="up" delay={300}>
        <Card className="h-full p-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
            M&A Target Evaluation
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            A strategic buyer in the industrial technology sector engages us to evaluate a potential acquisition target. Our research assesses the target&apos;s market position, growth trajectory, customer relationships, and competitive differentiation through extensive primary research.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium">Outcome:</span> The client gains critical insights that influence final valuation and post-acquisition integration strategy.
          </div>
        </Card>
      </Motion>
      
      {/* Use Case 3 */}
      <Motion animation="fade" direction="up" delay={400}>
        <Card className="h-full p-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
            Market Entry Strategy
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            A private equity-backed healthcare services provider engages us to evaluate expansion opportunities in adjacent market segments. Our research quantifies the addressable market, analyzes competitive dynamics, and identifies optimal entry strategies.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium">Outcome:</span> The company can execute a data-driven expansion plan targeting the most promising market segments for growth.
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
            <h2 className="text-3xl font-bold mb-4">Ready to gain deeper investment insights?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let&apos;s discuss how our research services can provide the insights you need for better investment decisions.
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