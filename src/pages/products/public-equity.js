// src/pages/products/public-equity.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

export default function PublicEquity() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Product",
        "position": 1,
        "name": "DCF Valuation Suite",
        "description": "Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.",
        "offers": {
          "@type": "Offer",
          "price": "249",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "Product",
        "position": 2,
        "name": "Portfolio Attribution Model",
        "description": "Analyze performance drivers and attribution factors across investment positions.",
        "offers": {
          "@type": "Offer",
          "price": "279",
          "priceCurrency": "USD"
        }
      }
    ]
  };

  return (
    <Layout>
      <SEO
        title="Public Equity Models"
        description="Excel-based financial models for public equity investments, including DCF analysis, portfolio attribution, and valuation tools."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Public Equity Models
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Sophisticated valuation and analysis tools for public market investments
            </p>
          </Motion>
        </div>
      </section>
      
      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="mb-12 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Public Equity Models Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Our public equity models provide institutional-grade analysis tools for evaluating stocks, tracking portfolio performance, and developing investment theses. Built with the professional investor in mind, these models combine analytical rigor with practical usability.
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="flex flex-col h-full">
                <div className="h-48 bg-gray-100 dark:bg-navy-700 rounded-t-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [DCF Model Preview]
                </div>
                <div className="p-6 flex-grow">
                  <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                    Public Equity
                  </span>
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                    DCF Valuation Suite
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-navy-700 dark:text-white mb-2">Key Features:</h4>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                      <li>Integrated 3-statement model with projections</li>
                      <li>Multiple valuation methodologies (DCF, Multiples)</li>
                      <li>Detailed WACC calculation</li>
                      <li>Flexible scenario analysis</li>
                      <li>Sensitivity tables and tornado charts</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-navy-700 dark:text-white text-lg">$249</span>
                    <Button href="#" variant="primary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </Motion>
            
            {/* Product 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="flex flex-col h-full">
                <div className="h-48 bg-gray-100 dark:bg-navy-700 rounded-t-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Portfolio Model Preview]
                </div>
                <div className="p-6 flex-grow">
                  <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                    Public Equity
                  </span>
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                    Portfolio Attribution Model
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Analyze performance drivers and attribution factors across investment positions.
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-navy-700 dark:text-white mb-2">Key Features:</h4>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                      <li>Multi-factor attribution analysis</li>
                      <li>Sector and style performance breakdown</li>
                      <li>Risk analytics (beta, volatility, Sharpe ratio)</li>
                      <li>Custom benchmark comparisons</li>
                      <li>Interactive performance dashboards</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-navy-700 dark:text-white text-lg">$279</span>
                    <Button href="#" variant="primary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
                Client Feedback
              </h2>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md relative">
                <svg className="absolute top-4 left-4 h-8 w-8 text-navy-200 dark:text-navy-700" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-300 text-lg italic mb-6 pt-6">
                  "The DCF Valuation Suite has become an essential tool in our investment process. The ability to quickly model different scenarios and see the impact on valuation has improved both our speed and the depth of our analysis."
                </p>
                <div className="flex items-center justify-center">
                  <div className="h-12 w-12 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center mr-3">
                    <span className="text-navy-700 dark:text-white font-semibold">AP</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy-700 dark:text-white">Alex Peterson</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Senior Analyst, Capital Group</p>
                  </div>
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
            <h2 className="text-3xl font-bold mb-4">Need Something More Tailored?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our custom financial modeling services can create bespoke solutions for your specific investment needs.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button href="/services/financial-modeling" variant="accent" size="lg">
                Learn About Custom Services
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}