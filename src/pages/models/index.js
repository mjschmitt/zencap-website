// src/pages/models/index.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import Link from 'next/link';

// Sample product data - in a real app, this would be imported from a data file
const MODELS = [
  // Private Equity Models
  {
    id: 'multifamily-development-model',
    slug: 'multifamily-development-model',
    title: 'Multifamily Development Model',
    excerpt: 'Comprehensive ground-up development modeling for multifamily projects with detailed construction budgeting and lease-up scenarios.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Multifamily Development Preview',
    features: [
      'Detailed construction budget tracking',
      'Unit mix and lease-up modeling',
      'Financing scenarios with construction and permanent debt',
      'Investor waterfall distributions',
      'Sensitivity analysis on key variables'
    ]
  },
  {
    id: 'multifamily-acquisition-model',
    slug: 'multifamily-acquisition-model',
    title: 'Multifamily Acquisition Model',
    excerpt: 'Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Multifamily Acquisition Preview'
  },
  {
    id: 'mixed-use-development-model',
    slug: 'mixed-use-development-model',
    title: 'Mixed-Use Development Model',
    excerpt: 'Ground-up development analysis for mixed-use projects combining retail, office, residential, and other property types.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Development Preview'
  },
  {
    id: 'mixed-use-acquisition-model',
    slug: 'mixed-use-acquisition-model',
    title: 'Mixed-Use Acquisition Model',
    excerpt: 'Acquisition analysis for properties with multiple components including retail, office, residential, and other property types.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Acquisition Preview'
  },
  {
    id: 'commercial-development-model',
    slug: 'commercial-development-model',
    title: 'Commercial Development Model',
    excerpt: 'Development underwriting for office, retail, industrial and other commercial property types with detailed construction tracking.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Commercial Development Preview'
  },
  {
    id: 'commercial-acquisition-model',
    slug: 'commercial-acquisition-model',
    title: 'Commercial Acquisition Model',
    excerpt: 'Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for commercial property investments.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Commercial Acquisition Preview'
  },
  {
    id: 'hospitality-development-model',
    slug: 'hospitality-development-model',
    title: 'Hospitality Development Model',
    excerpt: 'Ground-up development modeling for hotel and resort properties with ADR, occupancy, and departmental revenue/expense projections.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Hospitality Development Preview'
  },
  {
    id: 'hospitality-acquisition-model',
    slug: 'hospitality-acquisition-model',
    title: 'Hospitality Acquisition Model',
    excerpt: 'Acquisition analysis for hotel and resort properties with RevPAR modeling, brand conversion scenarios, and renovation budgeting.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Hospitality Acquisition Preview'
  },
  
  // Public Equity Models
  {
    id: 'applovin-3-statement-model',
    slug: 'applovin-3-statement-model',
    title: 'AppLovin (APP) 3-Statement Model',
    excerpt: 'Comprehensive financial model for AppLovin Corporation with integrated income statement, balance sheet, and cash flow projections.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'AppLovin Model Preview'
  },
  {
    id: 'nvidia-3-statement-model',
    slug: 'nvidia-3-statement-model',
    title: 'NVIDIA (NVDA) 3-Statement Model',
    excerpt: 'Integrated financial model for NVIDIA Corporation with segment analysis, growth projections, and valuation framework.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'NVIDIA Model Preview'
  },
  {
    id: 'tesla-3-statement-model',
    slug: 'tesla-3-statement-model',
    title: 'Tesla (TSLA) 3-Statement Model',
    excerpt: 'Detailed financial model for Tesla, Inc. with vehicle delivery forecasts, energy business projections, and manufacturing expansion analysis.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'Tesla Model Preview'
  },
  {
    id: 'dcf-valuation-suite',
    slug: 'dcf-valuation-suite',
    title: 'DCF Valuation Suite',
    excerpt: 'Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.',
    category: 'Public Equity',
    price: 2985,
    imagePlaceholder: 'DCF Model Preview'
  },
  {
    id: 'portfolio-attribution-model',
    slug: 'portfolio-attribution-model',
    title: 'Portfolio Attribution Model',
    excerpt: 'Analyze performance drivers and attribution factors across investment positions.',
    category: 'Public Equity',
    price: 2985,
    imagePlaceholder: 'Portfolio Model Preview'
  }
];

export default function Models() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": MODELS.map((model, index) => ({
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
            <Card className="p-4 bg-white dark:bg-navy-800">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-medium text-navy-700 dark:text-white">Filter by:</span>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-navy-700 text-white rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500">
                    All Models
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500">
                    Private Equity
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500">
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
            {/* Filter products to show only Private Equity category */}
            {MODELS
              .filter(model => model.category === 'Private Equity')
              .map((model, index) => (
                <Motion key={model.id} animation="fade" direction="up" delay={200 + (index * 100)} className="h-full">
                  <Link href={`/models/${model.slug}`} className="block h-full">
                    <Card className="h-full bg-white dark:bg-navy-800 hover:shadow-lg transition-shadow duration-300">
                      <div className="h-40 bg-gray-100 dark:bg-navy-700 rounded mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{model.imagePlaceholder}]
                      </div>
                      <div className="p-6">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                          {model.category}
                        </span>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                          {model.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                          {model.excerpt}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-navy-700 dark:text-white">${model.price.toLocaleString()}</span>
                          <div className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium text-sm">View Details</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Motion>
            ))}
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
            {/* Filter products to show only Public Equity category */}
            {MODELS
              .filter(model => model.category === 'Public Equity')
              .map((model, index) => (
                <Motion key={model.id} animation="fade" direction="up" delay={200 + (index * 100)} className="h-full">
                  <Link href={`/models/${model.slug}`} className="block h-full">
                    <Card className="h-full bg-white dark:bg-navy-800 hover:shadow-lg transition-shadow duration-300">
                      <div className="h-40 bg-gray-100 dark:bg-navy-700 rounded mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{model.imagePlaceholder}]
                      </div>
                      <div className="p-6">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium mb-2">
                          {model.category}
                        </span>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                          {model.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                          {model.excerpt}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-navy-700 dark:text-white">${model.price.toLocaleString()}</span>
                          <div className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium text-sm">View Details</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Motion>
            ))}
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
            <Button href="/solutions" variant="accent" size="lg">
              Learn About Custom Services
            </Button>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}