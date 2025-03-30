// src/pages/products.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Motion from '@/components/ui/Motion';
import SEO from '@/components/SEO';

export default function Products() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Product",
        "position": 1,
        "name": "Multi-Family Acquisition Model",
        "description": "Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.",
        "offers": {
          "@type": "Offer",
          "price": "299",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "Product",
        "position": 2,
        "name": "Office Property Acquisition Model",
        "description": "Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for office investments.",
        "offers": {
          "@type": "Offer",
          "price": "349",
          "priceCurrency": "USD"
        }
      }
    ]
  };

  return (
    <Layout>
      <SEO
        title="Financial Models"
        description="Explore our pre-built financial models for public and private equity investments."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Financial Models
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Pre-built Excel solutions to streamline your investment analysis
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <Button href="/contact" variant="accent" size="lg">
              Request a Custom Model
            </Button>
          </Motion>
        </div>
      </section>
      
      {/* Filter Section */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-medium text-navy-700 dark:text-white">Filter by:</span>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-navy-700 text-white rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500">
                    All Models
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500">
                    Private Equity
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500">
                    Public Equity
                  </button>
                </div>
              </div>
            </Card>
          </Motion>
        </div>
      </section>
      
      {/* Private Equity Models */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
              Private Equity Models
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Product 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <Card>
                <div className="h-40 bg-gray-100 dark:bg-navy-700 rounded mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Excel Preview]
                </div>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                  Private Equity
                </span>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Multi-Family Acquisition Model
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-700 dark:text-white">$299</span>
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm">View Details</a>
                </div>
              </Card>
            </Motion>
            
            {/* Product 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card>
                <div className="h-40 bg-gray-100 dark:bg-navy-700 rounded mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Excel Preview]
                </div>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                  Private Equity
                </span>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Office Property Acquisition Model
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for office investments.
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-700 dark:text-white">$349</span>
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm">View Details</a>
                </div>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Public Equity Models */}
      <section className="py-12 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
              Public Equity Models
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Product 3 */}
            <Motion animation="fade" direction="up" delay={200}>
              <Card>
                <div className="h-40 bg-gray-100 dark:bg-navy-700 rounded mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Excel Preview]
                </div>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                  Public Equity
                </span>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  DCF Valuation Suite
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-700 dark:text-white">$249</span>
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm">View Details</a>
                </div>
              </Card>
            </Motion>
            
            {/* Product 4 */}
            <Motion animation="fade" direction="up" delay={300}>
              <Card>
                <div className="h-40 bg-gray-100 dark:bg-navy-700 rounded mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  [Excel Preview]
                </div>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                  Public Equity
                </span>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Portfolio Attribution Model
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Analyze performance drivers and attribution factors across investment positions.
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-700 dark:text-white">$279</span>
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm">View Details</a>
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
            <h2 className="text-3xl font-bold mb-4">Need Something More Tailored?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our custom financial modeling services can create bespoke solutions for your specific investment needs.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <Button href="/services" variant="accent" size="lg">
              Learn About Custom Services
            </Button>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}