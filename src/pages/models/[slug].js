// src/pages/models/[slug].js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

// Sample models data - in a real application, this would be fetched from an API or CMS
const MODELS = [
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
    ],
    description: `
      <h2>Complete Multi-Family Financial Model</h2>
      <p>This multi-family acquisition model provides a comprehensive framework for analyzing apartment complex investments. The model allows for detailed unit-by-unit analysis, incorporating renovation scenarios and tenant turnover projections to accurately model value-add opportunities.</p>
      
      <p>The financing module includes options for senior debt, mezzanine financing, and equity structures, with detailed waterfall calculations to project returns for different investor classes. Sensitivity analysis tools help you understand how changes in key assumptions impact your returns.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Property Analysis:</strong> Detailed unit mix configuration, current rent roll input, market rent comparisons, and renovation planning</li>
        <li><strong>Financial Projections:</strong> 10-year cash flow projections with customizable growth rates for income and expenses</li>
        <li><strong>Financing Structures:</strong> Model multiple debt tranches, interest-only periods, and refinancing scenarios</li>
        <li><strong>Return Analysis:</strong> IRR, equity multiple, cash-on-cash, and detailed investment metrics</li>
        <li><strong>Reporting:</strong> Presentation-ready outputs and charts for investment committee and investor communications</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is ideal for real estate investment firms, private equity groups, asset managers, and individual investors who need a sophisticated but user-friendly tool for evaluating multi-family acquisition opportunities.</p>
      
      <h2>Technical Specifications</h2>
      <ul>
        <li>Excel format compatible with Excel 2016 and newer versions</li>
        <li>No macros or VBA for maximum compatibility and security</li>
        <li>Extensively documented with cell notes and instructions</li>
        <li>Includes sample data that can be easily replaced with your property information</li>
      </ul>
    `,
    faq: [
      {
        question: "Can I customize the model for my specific needs?",
        answer: "Yes, the model is fully unlocked and customizable. You can modify formulas, add sheets, or adapt the model to your specific requirements."
      },
      {
        question: "Does the model include instructions?",
        answer: "Yes, the model includes extensive documentation, including a dedicated instructions sheet and cell-level notes explaining key calculations and inputs."
      },
      {
        question: "Can I use this model for commercial properties?",
        answer: "While this model is specifically designed for multi-family assets, many of the principles can be applied to commercial properties. For optimal results with commercial assets, we recommend our dedicated Office Property or Retail Property acquisition models."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
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
    ],
    description: `
      <h2>Comprehensive Office Property Analysis</h2>
      <p>This office property acquisition model provides a detailed framework for analyzing office building investments. The model features tenant-by-tenant lease tracking, renewal probability modeling, and comprehensive capital expenditure planning to accurately project returns for office property investments.</p>
      
      <p>The financing module supports complex debt structures, including senior debt, mezzanine financing, and preferred equity. Detailed waterfall calculations allow you to model various profit-sharing arrangements with your investment partners.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Tenant Analysis:</strong> Detailed tenant-by-tenant lease tracking with customizable renewal probabilities and TI/LC assumptions</li>
        <li><strong>Vacancy Modeling:</strong> Sophisticated vacancy projections based on market conditions and property-specific factors</li>
        <li><strong>Capital Planning:</strong> Comprehensive CapEx modeling for building systems, tenant improvements, and property enhancements</li>
        <li><strong>Financial Projections:</strong> 10-year cash flow projections with detailed operating expense breakdowns</li>
        <li><strong>Investment Returns:</strong> IRR, equity multiple, cash-on-cash, and detailed investment metrics for various stakeholders</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for real estate investment firms, REITs, private equity groups, and asset managers focused on office property investments. It provides the analytical rigor needed for institutional-quality underwriting.</p>
      
      <h2>Technical Specifications</h2>
      <ul>
        <li>Excel format compatible with Excel 2016 and newer versions</li>
        <li>No macros or VBA for maximum compatibility and security</li>
        <li>Extensively documented with cell notes and instructions</li>
        <li>Includes sample data that can be easily replaced with your property information</li>
      </ul>
    `,
    faq: [
      {
        question: "How many tenants can this model handle?",
        answer: "The standard version of the model supports up to 50 individual tenants. If you need to analyze properties with more tenants, please contact us for a customized version."
      },
      {
        question: "Can I model complex lease structures like percentage rent?",
        answer: "Yes, the model includes functionality for base rent, percentage rent, expense reimbursements (NNN, modified gross, etc.), and other common lease structures."
      },
      {
        question: "Does the model handle mixed-use properties?",
        answer: "The model can accommodate mixed-use properties with office components. You can designate different tenant types and apply appropriate assumptions to each."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'dcf-valuation-suite',
    slug: 'dcf-valuation-suite',
    title: 'DCF Valuation Suite',
    excerpt: 'Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.',
    category: 'Public Equity',
    price: 249,
    imagePlaceholder: 'DCF Model Preview',
    features: [
      'Integrated 3-statement model with projections',
      'Multiple valuation methodologies (DCF, Multiples)',
      'Detailed WACC calculation',
      'Flexible scenario analysis',
      'Sensitivity tables and tornado charts'
    ],
    description: `
      <h2>Professional-Grade DCF Analysis</h2>
      <p>This comprehensive DCF Valuation Suite provides a robust framework for valuing public and private companies. The model integrates a complete three-statement financial model with sophisticated valuation techniques to deliver institutional-quality analysis.</p>
      
      <p>The suite allows you to seamlessly flow historical financial data into your projection period, apply multiple valuation methodologies, and conduct comprehensive sensitivity analysis to understand the key drivers of value.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Financial Projections:</strong> Integrated income statement, balance sheet, and cash flow statement with up to 10 years of projections</li>
        <li><strong>Valuation Methods:</strong> DCF (terminal value via perpetuity or exit multiple), comparable company analysis, precedent transactions, and LBO analysis</li>
        <li><strong>Cost of Capital:</strong> Detailed WACC calculation with customizable risk-free rate, market risk premium, and beta estimation</li>
        <li><strong>Scenario Analysis:</strong> Create, compare, and blend multiple scenarios to reflect different possible outcomes</li>
        <li><strong>Sensitivity Tools:</strong> Dynamic sensitivity tables and tornado charts to identify key value drivers</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for investment professionals, equity research analysts, corporate finance teams, and serious investors who need a comprehensive framework for valuing companies across industries.</p>
      
      <h2>Technical Specifications</h2>
      <ul>
        <li>Excel format compatible with Excel 2016 and newer versions</li>
        <li>No macros or VBA for maximum compatibility and security</li>
        <li>Extensively documented with cell notes and instructions</li>
        <li>Includes sample data that can be easily replaced with your company information</li>
      </ul>
    `,
    faq: [
      {
        question: "How easy is it to incorporate historical financial data?",
        answer: "The model includes a structured input section where you can paste historical financial data. The model automatically calculates historical ratios and uses them as a reference for your projections."
      },
      {
        question: "Can I value companies in different industries?",
        answer: "Yes, the model is designed to be flexible across industries. It includes customizable projection methods for different business models and industry-specific metrics."
      },
      {
        question: "Does the model include industry-specific metrics?",
        answer: "The core model includes common metrics across industries. We also offer industry-specific add-ons for sectors like technology, healthcare, financial services, and consumer goods."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'portfolio-attribution-model',
    slug: 'portfolio-attribution-model',
    title: 'Portfolio Attribution Model',
    excerpt: 'Analyze performance drivers and attribution factors across investment positions.',
    category: 'Public Equity',
    price: 279,
    imagePlaceholder: 'Portfolio Model Preview',
    features: [
      'Multi-factor attribution analysis',
      'Sector and style performance breakdown',
      'Risk analytics (beta, volatility, Sharpe ratio)',
      'Custom benchmark comparisons',
      'Interactive performance dashboards'
    ],
    description: `
      <h2>Sophisticated Performance Attribution</h2>
      <p>This Portfolio Attribution Model provides a comprehensive framework for analyzing the sources of portfolio performance. The model helps you understand how asset allocation, security selection, factor exposures, and market timing contribute to your overall returns.</p>
      
      <p>Whether you're managing a diversified equity portfolio, a balanced fund, or an alternative investment strategy, this model gives you the analytical tools to identify what's working, what's not, and why.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Attribution Analysis:</strong> Break down returns by asset allocation, security selection, factor exposures, and market timing</li>
        <li><strong>Factor Analysis:</strong> Analyze exposure and contribution from factors like size, value, momentum, quality, and volatility</li>
        <li><strong>Sector Analysis:</strong> Understand sector allocation decisions and their impact on performance</li>
        <li><strong>Risk Metrics:</strong> Calculate beta, volatility, Sharpe ratio, information ratio, and other key risk/return measures</li>
        <li><strong>Custom Benchmarks:</strong> Compare performance against standard indices or custom blended benchmarks</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for portfolio managers, investment analysts, wealth managers, and institutional investors who need a sophisticated tool for understanding the drivers of investment performance.</p>
      
      <h2>Technical Specifications</h2>
      <ul>
        <li>Excel format compatible with Excel 2016 and newer versions</li>
        <li>No macros or VBA for maximum compatibility and security</li>
        <li>Extensively documented with cell notes and instructions</li>
        <li>Includes sample data that can be easily replaced with your portfolio information</li>
      </ul>
    `,
    faq: [
      {
        question: "How many securities can this model analyze?",
        answer: "The standard version of the model supports up to 100 individual securities. If you need to analyze larger portfolios, please contact us for a customized version."
      },
      {
        question: "What time periods can be analyzed?",
        answer: "The model supports daily, weekly, monthly, quarterly, and annual data. You can analyze performance over any time period for which you have data available."
      },
      {
        question: "Can I import data from other sources?",
        answer: "Yes, the model includes a structured input section where you can paste data from other sources. We also offer add-ons for direct data feeds from major providers like Bloomberg, Refinitiv, and FactSet."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  }
];

// Function to find related models (same category but different model)
const getRelatedModels = (model) => {
  return MODELS.filter(p => 
    p.category === model.category && p.id !== model.id
  ).slice(0, 3);
};

export default function ModelDetail() {
  const router = useRouter();
  const { slug } = router.query;
  
  // Find the model based on the slug
  const model = MODELS.find(item => item.slug === slug);
  
  // If the page is still loading or model not found
  if (router.isFallback || !model) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-navy-700 rounded w-2/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-navy-700 rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Get related models
  const relatedModels = getRelatedModels(model);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": model.title,
    "description": model.excerpt,
    "category": model.category,
    "offers": {
      "@type": "Offer",
      "price": model.price,
      "priceCurrency": "USD"
    }
  };

  return (
    <Layout>
      <SEO
        title={model.title}
        description={model.excerpt}
        structuredData={structuredData}
      />
      
      {/* Model Header */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <Motion animation="fade" direction="right">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {model.category}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight mb-6 text-white">
                  {model.title}
                </h1>
                
                <p className="text-xl text-gray-200 mb-8">
                  {model.excerpt}
                </p>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-3xl font-bold text-white">${model.price}</span>
                  <span className="ml-2 text-lg text-gray-300">USD</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button href="#" variant="accent" size="lg">
                    Purchase Now
                  </Button>
                  <Button href="#faq" variant="secondary" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 dark:bg-navy-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                [{model.imagePlaceholder}]
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Key Features
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {model.features.map((feature, index) => (
              <Motion key={index} animation="fade" direction="up" delay={index * 100} className="h-full">
                <Card className="h-full bg-white dark:bg-navy-800 p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                  </div>
                </Card>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* Model Description */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <Card className="bg-white dark:bg-navy-800 p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-navy-700 dark:prose-headings:text-white prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-img:rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: model.description }} />
              </div>
            </Card>
          </Motion>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
          </Motion>
          
          <div className="space-y-6">
            {model.faq.map((item, index) => (
              <Motion key={index} animation="fade" direction="up" delay={index * 100}>
                <Card className="bg-white dark:bg-navy-800 p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </p>
                </Card>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* Related Models */}
      {relatedModels.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
                Related Models
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedModels.map((related) => (
                <Motion key={related.id} animation="fade" direction="up" delay={200} className="h-full">
                  <Link href={`/models/${related.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{related.imagePlaceholder}]
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {related.category}
                          </span>
                          <span className="font-bold text-navy-700 dark:text-white">${related.price}</span>
                        </div>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                          {related.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {related.excerpt}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </Motion>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <Card className="bg-white dark:bg-navy-800 p-8">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Ready to elevate your investment analysis?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Purchase {model.title} today and start making better investment decisions.
              </p>
              <Button href="#" variant="accent" size="lg">
                Purchase for ${model.price}
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                30-day satisfaction guarantee. Full support included.
              </p>
            </Card>
          </Motion>
        </div>
      </section>
      
      {/* Back to Models Button */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <Link href="/models">
              <Button variant="ghost" size="lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Models
              </Button>
            </Link>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}

// This function gets called at build time
export async function getStaticPaths() {
  // In a real app, this would fetch data from an API or CMS
  const paths = MODELS.map((model) => ({
    params: { slug: model.slug },
  }));

  return { paths, fallback: true };
}

// This function gets called at build time
export async function getStaticProps({ params }) {
  // In a real app, this would fetch data from an API or CMS
  const model = MODELS.find((item) => item.slug === params.slug) || null;

  return {
    props: {
      model,
    },
    // Re-generate the page at most once per hour
    revalidate: 3600,
  };
}