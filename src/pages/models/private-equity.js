// src/pages/models/private-equity.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import Link from 'next/link';

// Sample model data - in a real app, this would be imported from a data file
const PRIVATE_EQUITY_MODELS = [
  {
    id: 'multi-family-acquisition-model',
    slug: 'multi-family-acquisition-model',
    title: 'Multi-Family Acquisition Model',
    excerpt: 'Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.',
    category: 'Private Equity',
    price: 299,
    imagePlaceholder: 'Multi-Family Model Preview',
    features: [
      'Unit-by-unit rental analysis',
      'Value-add renovation scenarios',
      'Detailed financing options with sensitivity analysis',
      'Investor waterfall and return calculations',
      'Dynamic charts and reporting'
    ]
  },
  {
    id: 'office-property-acquisition-model',
    slug: 'office-property-acquisition-model',
    title: 'Office Property Acquisition Model',
    excerpt: 'Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for office investments.',
    category: 'Private Equity',
    price: 349,
    imagePlaceholder: 'Office Property Model Preview',
    features: [
      'Tenant-by-tenant lease analysis',
      'Renewal probability scenarios',
      'TI/LC and capital expenditure modeling',
      'Detailed debt and equity structures',
      'Sensitivity analysis dashboard'
    ]
  }
];

export default function PrivateEquity() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": PRIVATE_EQUITY_MODELS.map((model, index) => ({
      "@type": "Product",
      "position": index + 1,
      "name": model.title,
      "description": model.excerpt,
      "offers": {
        "@type": "Offer",
        "price": model.price.toString(),
        "priceCurrency": "USD"
      }
    }))
  };

  return (
    <Layout>
      <SEO
        title="Private Equity Models"
        description="Excel-based financial models for private equity investments, including multi-family and office property acquisition models."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Private Equity Models
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Sophisticated Excel-based financial models for private equity investments
            </p>
          </Motion>
        </div>
      </section>
      
      {/* Models Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="mb-12 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Private Equity Models Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Our private equity models are designed to help investment professionals analyze and evaluate potential acquisitions, manage their portfolio, and make better investment decisions. Each model is built with flexibility and thoroughness in mind, allowing you to customize inputs and scenarios while maintaining analytical rigor.
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Map through model data */}
            {PRIVATE_EQUITY_MODELS.map((model, index) => (
              <Motion key={model.id} animation="fade" direction="up" delay={200 + (index * 100)}>
                <Link href={`/models/${model.slug}`} className="block h-full">
                  <Card className="flex flex-col h-full">
                    <div className="h-48 bg-gray-100 dark:bg-navy-700 rounded-t-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                      [{model.imagePlaceholder}]
                    </div>
                    <div className="p-6 flex-grow">
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                        {model.category}
                      </span>
                      <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                        {model.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {model.excerpt}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-navy-700 dark:text-white mb-2">Key Features:</h4>
                        <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                          {model.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-navy-700 dark:text-white text-lg">${model.price}</span>
                        <div className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm">
                          View Details
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Motion>
            ))}
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
                  "The multi-family acquisition model from Zenith Capital has been instrumental in our ability to quickly analyze potential acquisitions. The level of detail and flexibility has impressed both our investment committee and our limited partners."
                </p>
                <div className="flex items-center justify-center">
                  <div className="h-12 w-12 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center mr-3">
                    <span className="text-navy-700 dark:text-white font-semibold">JW</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy-700 dark:text-white">James Wilson</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acquisitions Director, Summit Partners</p>
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
              <Button href="/solutions/financial-modeling" variant="accent" size="lg">
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