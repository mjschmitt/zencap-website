// src/pages/models/public-equity.js - with larger hero background
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

// Public Equity Models Data
const PUBLIC_EQUITY_MODELS = [
  {
    id: 'applovin-3-statement-model',
    slug: 'applovin-3-statement-model',
    title: 'AppLovin (APP) 3-Statement Model',
    excerpt: 'Comprehensive financial model for AppLovin Corporation with integrated income statement, balance sheet, and cash flow projections.',
    price: 14750,
    imagePlaceholder: 'AppLovin Model Preview',
    features: [
      'Detailed revenue breakdown by segment',
      'Historical data and forward projections',
      'Fully integrated 3-statement model',
      'Operating metrics and KPIs dashboard',
      'Sensitivity analysis on key drivers'
    ],
    featured: true
  },
  {
    id: 'nvidia-3-statement-model',
    slug: 'nvidia-3-statement-model',
    title: 'NVIDIA (NVDA) 3-Statement Model',
    excerpt: 'Integrated financial model for NVIDIA Corporation with segment analysis, growth projections, and valuation framework.',
    price: 14750,
    imagePlaceholder: 'NVIDIA Model Preview',
    features: [
      'Revenue modeling by business segment',
      'AI/GPU market growth projections',
      'R&D and capex investment modeling',
      'Competitor performance benchmarking',
      'Multiple valuation methodologies'
    ],
    featured: true
  },
  {
    id: 'tesla-3-statement-model',
    slug: 'tesla-3-statement-model',
    title: 'Tesla (TSLA) 3-Statement Model',
    excerpt: 'Detailed financial model for Tesla, Inc. with vehicle delivery forecasts, energy business projections, and manufacturing expansion analysis.',
    price: 14750,
    imagePlaceholder: 'Tesla Model Preview',
    features: [
      'Vehicle production and delivery forecasts',
      'Gross margin analysis by product line',
      'Energy generation and storage modeling',
      'Factory capacity and capital investments',
      'Cash flow and liquidity analysis'
    ],
    featured: false
  },
  {
    id: 'dcf-valuation-suite',
    slug: 'dcf-valuation-suite',
    title: 'DCF Valuation Suite',
    excerpt: 'Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.',
    price: 14750,
    imagePlaceholder: 'DCF Model Preview',
    features: [
      'Integrated 3-statement model with projections',
      'Multiple valuation methodologies (DCF, Multiples)',
      'Detailed WACC calculation',
      'Flexible scenario analysis',
      'Sensitivity tables and tornado charts'
    ],
    featured: false
  },
  {
    id: 'portfolio-attribution-model',
    slug: 'portfolio-attribution-model',
    title: 'Portfolio Attribution Model',
    excerpt: 'Analyze performance drivers and attribution factors across investment positions.',
    price: 14750,
    imagePlaceholder: 'Portfolio Model Preview',
    features: [
      'Multi-factor attribution analysis',
      'Sector and style performance breakdown',
      'Risk analytics (beta, volatility, Sharpe ratio)',
      'Custom benchmark comparisons',
      'Interactive performance dashboards'
    ],
    featured: false
  }
];

export default function PublicEquityModels() {
  // Separate featured and regular models
  const featuredModels = PUBLIC_EQUITY_MODELS.filter(model => model.featured);
  const regularModels = PUBLIC_EQUITY_MODELS.filter(model => !model.featured);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProductCatalog",
    "name": "Public Equity Financial Models",
    "description": "Professional financial models for public equity analysis including 3-statement models, DCF valuations, and portfolio analytics.",
    "publisher": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    }
  };

  return (
    <Layout>
      <SEO
        title="Public Equity Models | DCF Valuation & Analysis Tools"
        description="Professional Excel financial models for public equity analysis. DCF valuation, 3-statement models & portfolio tools $2,985-$4,985. Company-specific investment analysis models."
        keywords="public equity models, DCF valuation, 3-statement financial models, equity analysis tools, investment valuation models, Excel financial models, portfolio attribution"
        structuredData={structuredData}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/models/public-equity/public-equity-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Public Equity Models
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Comprehensive financial models and valuation tools for public company analysis and portfolio management
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400} duration={800}>
            <Button href="#featured" variant="accent" size="lg">
              Explore Models
            </Button>
          </Motion>
        </div>
      </section>
      
      {/* Overview Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Equity Research Focus
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Models built by former sell-side analysts with deep understanding of equity research methodologies and best practices.
                </p>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Sophisticated Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Advanced modeling capabilities including scenario analysis, Monte Carlo simulations, and comprehensive valuation frameworks.
                </p>
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <Card className="text-center p-6 bg-white dark:bg-navy-800">
                <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Flexible Framework
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Easily adaptable models that can be customized for different industries, company sizes, and analytical approaches.
                </p>
              </Card>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Featured Models */}
      <section id="featured" className="py-12 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
              Featured Models
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {featuredModels.map((model) => (
              <Motion key={model.id} animation="fade" direction="up" delay={200} className="h-full">
                <Link href={`/models/${model.slug}`} className="block h-full">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      [{model.imagePlaceholder}]
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-navy-700 dark:text-green-300 rounded-full text-xs font-medium">
                          Public Equity
                        </span>
                        <span className="text-lg font-bold text-teal-500">
                          ${model.price.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                        {model.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {model.excerpt}
                      </p>
                      <div className="space-y-2 mb-4">
                        {model.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <svg className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                          View Details
                        </span>
                        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* All Models */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8">
              All Public Equity Models
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regularModels.map((model) => (
              <Motion key={model.id} animation="fade" direction="up" delay={200} className="h-full">
                <Link href={`/models/${model.slug}`} className="block h-full">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      [{model.imagePlaceholder}]
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-navy-700 dark:text-green-300 rounded-full text-xs font-medium">
                          Public Equity
                        </span>
                        <span className="text-lg font-bold text-teal-500">
                          ${model.price.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                        {model.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {model.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                          View Details
                        </span>
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* Model Types Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Model Categories
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Comprehensive coverage across equity analysis methodologies and investment approaches
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Motion animation="fade" direction="up" delay={200}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  3-Statement Models
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Integrated financial statement models with historical data and forward projections for comprehensive analysis.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={300}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  DCF Valuations
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Sophisticated discounted cash flow models with multiple valuation methodologies and scenario analysis.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Portfolio Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Performance attribution, risk analytics, and portfolio optimization tools for institutional investors.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={500}>
              <div className="text-center">
                <div className="h-16 w-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                  Industry Specific
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Specialized models for technology, healthcare, energy, and other sectors with unique characteristics.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Industries Covered */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                Industries Covered
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our models span key growth sectors and established industries
              </p>
            </div>
          </Motion>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              'Technology',
              'Healthcare',
              'Financial Services',
              'Consumer Goods',
              'Energy',
              'Industrials',
              'Real Estate',
              'Telecommunications',
              'Materials',
              'Utilities',
              'Transportation',
              'Media & Entertainment'
            ].map((industry, index) => (
              <Motion key={industry} animation="fade" direction="up" delay={index * 50}>
                <div className="text-center p-4 bg-gray-50 dark:bg-navy-800 rounded-lg">
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {industry}
                  </p>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">
              Need a Custom Equity Model?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our team can create bespoke models tailored to your specific company, industry, or analytical requirements.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="accent" size="lg">
                Request Custom Model
              </Button>
              <Button href="/models/private-equity" variant="secondary" size="lg">
                View Private Equity Models
              </Button>
            </div>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}

// Disable static generation to prevent build errors during prerendering
export const getServerSideProps = async (context) => {
  return {
    props: {}
  };
};