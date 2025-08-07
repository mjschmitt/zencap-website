// src/pages/models/[slug].js - Database-driven model pages
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import BuyNowButton from '@/components/ui/BuyNowButton';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import dynamic from 'next/dynamic';

const ExcelPreview = dynamic(
  () => import('@/components/ui/ExcelPreview'),
  { 
    ssr: false,
    loading: () => <div className="p-4 text-center text-gray-500">Loading Excel preview...</div>
  }
);

// Import database utilities directly for build time
import { sql } from '@vercel/postgres';

// Fetch models from database - direct database call for build time
async function fetchModels() {
  try {
    // Direct database query during build time
    if (process.env.POSTGRES_URL) {
      const result = await sql`SELECT * FROM models WHERE status = 'active' ORDER BY published_at DESC`;
      return result.rows || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

// Fetch single model by slug - direct database call for build time
async function fetchModelBySlug(slug) {
  try {
    // Direct database query during build time
    if (process.env.POSTGRES_URL) {
      const result = await sql`SELECT * FROM models WHERE slug = ${slug} AND status = 'active'`;
      if (result.rows && result.rows.length > 0) {
        return result.rows[0];
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching model:', error);
    return null;
  }
}

// Convert database features string to array
function parseFeatures(featuresString) {
  if (!featuresString) return [];
  return featuresString.split(',').map(feature => feature.trim());
}

// Generate FAQ from model description (simplified version)
function generateFAQ(model) {
  return [
    {
      question: "Can I customize the model for my specific needs?",
      answer: "Yes, the model is fully unlocked and customizable. You can modify formulas, add sheets, or adapt the model to your specific requirements."
    },
    {
      question: "Does the model include instructions?",
      answer: "Yes, the model includes extensive documentation, including a dedicated instructions sheet and cell-level notes explaining key calculations and inputs."
    },
    {
      question: "What file format is the model delivered in?",
      answer: "The model is delivered as an Excel (.xlsx) file that is compatible with Microsoft Excel 2016 and later, as well as Google Sheets and other spreadsheet applications."
    },
    {
      question: "What support is included with the purchase?",
      answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
    }
  ];
}

// Function to find related models (same category but different model)
const getRelatedModels = (model, allModels) => {
  return allModels.filter(p => 
    p.category === model.category && p.id !== model.id
  ).slice(0, 3);
};

export default function ModelDetail({ model, relatedModels }) {
  const router = useRouter();
  
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
  
  // Parse features from database tags
  const features = parseFeatures(model.tags);
  const faq = generateFAQ(model);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": model.title,
    "description": model.description,
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
        description={model.description ? model.description.replace(/<[^>]*>/g, '').substring(0, 160) : ''}
        structuredData={structuredData}
      />
      
      {/* Model Header with Larger Hero */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/models/model-detail-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 w-full">
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
                  {model.description ? model.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'Professional financial model for investment analysis.'}
                </p>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-3xl font-bold text-white">${model.price.toLocaleString()}</span>
                  <span className="ml-2 text-lg text-gray-300">USD</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <BuyNowButton 
                    modelId={model.id}
                    modelSlug={model.slug}
                    modelTitle={model.title}
                    modelPrice={model.price}
                    variant="accent" 
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Buy Now - ${model.price.toLocaleString()}
                  </BuyNowButton>
                  <Button href="#faq" variant="secondary" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                {model.thumbnail_url ? (
                  <img 
                    src={model.thumbnail_url} 
                    alt={model.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 dark:bg-navy-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                    [{model.title} Preview]
                  </div>
                )}
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      {features.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
                Key Features
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
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
      )}
      
      {/* Model Description */}
      {model.description && (
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
      )}
      
      {/* Interactive Excel Preview */}
      {model.excel_url && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
                  Interactive Model Preview
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Explore this financial model with full interactivity. All formulas and calculations are preserved.
                </p>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={200}>
              <Card className="bg-white dark:bg-navy-800 p-6">
                <ExcelPreview
                  excelFile={model.excel_url}
                  modelId={model.id}
                  title={model.title}
                  height="800px"
                  readonly={true}
                  preferInteractive={false}
                />
              </Card>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={400}>
              <div className="text-center mt-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    This is a preview mode. Purchase to download the full Excel file with all features.
                  </span>
                </div>
              </div>
            </Motion>
          </div>
        </section>
      )}
      
      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
          </Motion>
          
          <div className="space-y-6">
            {faq.map((item, index) => (
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
      {relatedModels && relatedModels.length > 0 && (
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
                      {related.thumbnail_url ? (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                          <img 
                            src={related.thumbnail_url} 
                            alt={related.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                          [{related.title} Preview]
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {related.category}
                          </span>
                          <span className="text-lg font-bold text-teal-500">
                            ${related.price.toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                          {related.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {related.description ? related.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Professional financial model for investment analysis.'}
                        </p>
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
      )}
      
      {/* CTA Section */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Purchase This Model?
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Get instant access to this professional-grade financial model with comprehensive documentation and support.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <BuyNowButton 
                modelId={model.id}
                modelSlug={model.slug}
                modelTitle={model.title}
                modelPrice={model.price}
                variant="accent" 
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Purchase for ${model.price.toLocaleString()}
              </BuyNowButton>
              <Button href="/contact" variant="secondary" size="lg">
                Contact Sales
              </Button>
            </div>
          </Motion>
        </div>
      </section>

      {/* Floating Buy Now Button - Mobile Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-navy-800 border-t border-gray-200 dark:border-navy-600 p-4 z-50 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-navy-700 dark:text-white">
              ${model.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {model.title}
            </div>
          </div>
          <BuyNowButton 
            modelId={model.id}
            modelSlug={model.slug}
            modelTitle={model.title}
            modelPrice={model.price}
            variant="accent" 
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Buy Now
          </BuyNowButton>
        </div>
      </div>
    </Layout>
  );
}

// This function gets called at build time
export async function getStaticPaths() {
  try {
    const models = await fetchModels();
    
    // Generate paths for all models
    const paths = models.map((model) => ({
      params: { slug: model.slug },
    }));

    return { paths, fallback: true };
  } catch (error) {
    console.error('Error fetching models for static paths:', error);
    return { paths: [], fallback: true };
  }
}

// This function gets called at build time
export async function getStaticProps({ params }) {
  try {
    // Fetch the specific model
    const model = await fetchModelBySlug(params.slug);
    
    if (!model) {
      return {
        notFound: true,
      };
    }

    // Fetch all models for related models
    const allModels = await fetchModels();
    const relatedModels = getRelatedModels(model, allModels);

    // Serialize dates to strings to avoid Next.js serialization error
    const serializedModel = {
      ...model,
      created_at: model.created_at ? new Date(model.created_at).toISOString() : null,
      updated_at: model.updated_at ? new Date(model.updated_at).toISOString() : null,
      published_at: model.published_at ? new Date(model.published_at).toISOString() : null,
    };

    const serializedRelatedModels = relatedModels.map(m => ({
      ...m,
      created_at: m.created_at ? new Date(m.created_at).toISOString() : null,
      updated_at: m.updated_at ? new Date(m.updated_at).toISOString() : null,
      published_at: m.published_at ? new Date(m.published_at).toISOString() : null,
    }));

    return {
      props: {
        model: serializedModel,
        relatedModels: serializedRelatedModels,
      },
      // Re-generate the page at most once per hour
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching model data:', error);
    return {
      notFound: true,
    };
  }
}