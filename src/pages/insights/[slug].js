// src/pages/insights/[slug].js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

// Sample insights data - in a real application, this would be fetched from an API or CMS
// This is the same data as in the index.js file, but in a real app it would be imported from a shared source
const INSIGHTS = [
  {
    id: 'earnings-q1-2025-tech-giants',
    slug: 'earnings-q1-2025-tech-giants',
    title: 'Q1 2025 Earnings Snapshot: Major Tech Platforms',
    excerpt: 'Analysis of Q1 earnings reports from leading technology companies, highlighting key trends, surprises, and implications for investors.',
    category: 'Earnings Analysis',
    date: 'March 30, 2025',
    readTime: '8 min read',
    featured: true,
    imagePlaceholder: 'Tech earnings chart',
    author: {
      name: 'Sarah Chen',
      title: 'Senior Analyst',
      avatar: '/images/avatars/sarah.jpg'
    },
    content: `
      <h2>Overview of Q1 2025 Tech Earnings</h2>
      <p>The first quarter of 2025 has shown significant divergence in performance across major technology platforms. While cloud infrastructure providers demonstrated robust growth exceeding market expectations, social media platforms faced headwinds from changing privacy regulations and increased competition for advertising dollars.</p>
      
      <p>Three key themes emerged across the earnings releases:</p>
      <ul>
        <li>Accelerating enterprise digital transformation spending</li>
        <li>Continuing challenges in digital advertising attribution</li>
        <li>Expansion of AI capabilities driving new revenue streams</li>
      </ul>
      
      <h2>Cloud Services Performance</h2>
      <p>Cloud infrastructure services delivered particularly strong results in Q1, with the top three providers reporting the following growth rates:</p>
      
      <div class="table-container">
        <table class="earnings-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Q1 2025 Revenue</th>
              <th>YoY Growth</th>
              <th>vs. Expectations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AWS</td>
              <td>$32.4B</td>
              <td>+28.5%</td>
              <td>+3.2%</td>
            </tr>
            <tr>
              <td>Azure</td>
              <td>$28.9B</td>
              <td>+31.2%</td>
              <td>+4.5%</td>
            </tr>
            <tr>
              <td>Google Cloud</td>
              <td>$17.8B</td>
              <td>+24.3%</td>
              <td>+1.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p>The growth acceleration compared to Q4 2024 suggests enterprise cloud migration continues to be prioritized even amid broader economic uncertainty.</p>
      
      <h2>Social Media Platforms</h2>
      <p>Social media companies presented a more mixed picture in Q1, with most platforms reporting slower growth and challenges with the evolving digital advertising landscape:</p>
      
      <div class="table-container">
        <table class="earnings-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Q1 2025 Revenue</th>
              <th>YoY Growth</th>
              <th>vs. Expectations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Meta</td>
              <td>$38.2B</td>
              <td>+15.3%</td>
              <td>-2.1%</td>
            </tr>
            <tr>
              <td>Snap</td>
              <td>$1.9B</td>
              <td>+11.7%</td>
              <td>-4.3%</td>
            </tr>
            <tr>
              <td>Pinterest</td>
              <td>$0.8B</td>
              <td>+13.5%</td>
              <td>+0.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2>Key Takeaways for Investors</h2>
      <p>Based on Q1 reports, we see several implications for investors:</p>
      <ol>
        <li><strong>Cloud infrastructure remains a strong secular growth story</strong>, with potential for continued margin expansion as economies of scale improve.</li>
        <li><strong>Digital advertising faces near-term headwinds</strong> but companies investing in first-party data solutions are better positioned to navigate the changing landscape.</li>
        <li><strong>AI investment is accelerating</strong> with tangible revenue contribution beginning to materialize across multiple business models.</li>
      </ol>
      
      <h2>Looking Ahead</h2>
      <p>As we move into Q2 2025, we'll be closely monitoring several key metrics:</p>
      <ul>
        <li>Enterprise cloud spending patterns and any signs of optimization or rationalization</li>
        <li>Digital advertising pricing trends and inventory utilization rates</li>
        <li>AI product roadmaps and monetization strategies across platforms</li>
      </ul>
      
      <p>The divergence in performance across subsectors suggests a more selective approach to technology investing will be required in 2025 compared to the broader sector performance of previous years.</p>
    `
  },
  {
    id: 'renewable-energy-investment-trends',
    slug: 'renewable-energy-investment-trends',
    title: 'Investment Trends in Renewable Energy Infrastructure',
    excerpt: 'Examination of capital allocation patterns in renewable energy projects, key growth areas, and emerging investment opportunities.',
    category: 'Market Trends',
    date: 'March 22, 2025',
    readTime: '12 min read',
    featured: true,
    imagePlaceholder: 'Solar panel installation',
    author: {
      name: 'Michael Zhang',
      title: 'Research Director',
      avatar: '/images/avatars/michael.jpg'
    },
    content: `
      <h2>Renewable Energy Investment Landscape</h2>
      <p>Renewable energy infrastructure continues to attract increasing capital allocation, with global investment reaching $755 billion in 2024, a 17% increase from the previous year. This growth trajectory is expected to continue through 2025 and beyond, driven by policy support, technological advances, and economic competitiveness.</p>
      
      <p>This analysis examines current investment patterns, emerging opportunities, and key considerations for investors looking at the renewable energy infrastructure space.</p>
      
      <h2>Capital Allocation by Technology</h2>
      <p>Investment in renewable energy infrastructure has evolved significantly, with changing allocations across technology types:</p>
      
      <div class="table-container">
        <table class="trends-table">
          <thead>
            <tr>
              <th>Technology</th>
              <th>2024 Investment</th>
              <th>YoY Change</th>
              <th>Share of Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Solar PV</td>
              <td>$320B</td>
              <td>+23%</td>
              <td>42%</td>
            </tr>
            <tr>
              <td>Wind (Onshore & Offshore)</td>
              <td>$185B</td>
              <td>+8%</td>
              <td>25%</td>
            </tr>
            <tr>
              <td>Energy Storage</td>
              <td>$112B</td>
              <td>+41%</td>
              <td>15%</td>
            </tr>
            <tr>
              <td>Grid Infrastructure</td>
              <td>$95B</td>
              <td>+19%</td>
              <td>13%</td>
            </tr>
            <tr>
              <td>Other (Hydro, Geothermal, etc.)</td>
              <td>$43B</td>
              <td>-5%</td>
              <td>5%</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p>Energy storage has seen the most dramatic growth, reflecting its critical role in enabling higher penetration of intermittent renewable generation sources. Grid infrastructure investment is also accelerating as transmission constraints increasingly become a bottleneck for renewable deployment.</p>
      
      <h2>Geographic Investment Patterns</h2>
      <p>While renewable energy investment continues to grow globally, regional growth rates and focus areas vary significantly:</p>
      
      <ul>
        <li><strong>North America:</strong> Investment increasingly driven by the Inflation Reduction Act incentives, with particular emphasis on domestic manufacturing and supply chain development.</li>
        <li><strong>Europe:</strong> Focus on accelerated deployment to reduce dependence on imported natural gas, with offshore wind and grid modernization receiving particular emphasis.</li>
        <li><strong>Asia-Pacific:</strong> Continued manufacturing dominance alongside rapidly growing domestic installation markets, with increasing participation from institutional investors.</li>
        <li><strong>Latin America:</strong> Emerging as a high-growth region for utility-scale solar and wind projects, with innovative auction mechanisms attracting international capital.</li>
      </ul>
      
      <h2>Emerging Investment Themes</h2>
      <p>Several new investment themes are gaining traction in the renewable energy infrastructure space:</p>
      
      <ol>
        <li><strong>Green Hydrogen Infrastructure:</strong> Early-stage investments in production facilities, specialized storage, and transportation infrastructure.</li>
        <li><strong>Grid-Enhancing Technologies:</strong> Solutions that increase the capacity of existing transmission infrastructure through advanced monitoring and control systems.</li>
        <li><strong>Virtual Power Plants:</strong> Aggregation platforms that coordinate distributed energy resources to provide grid services traditionally supplied by conventional power plants.</li>
        <li><strong>Recycling and Circular Economy:</strong> Facilities and technologies focused on end-of-life management for solar panels, wind turbines, and battery components.</li>
      </ol>
      
      <h2>Investment Implications</h2>
      <p>For investors considering allocations to renewable energy infrastructure, several factors warrant attention:</p>
      
      <ul>
        <li>Increasing policy support is reducing regulatory risk but creating potential for market oversupply in certain segments</li>
        <li>Supply chain constraints continue to affect project economics and timelines, particularly for grid connection equipment</li>
        <li>Rising interest rates have more significant impact on capital-intensive renewable projects compared to fossil fuel alternatives</li>
        <li>The growing role of corporate procurement as a demand driver introduces new offtake risks and opportunities</li>
      </ul>
      
      <p>As the renewable energy infrastructure market matures, we expect to see continued specialization of investment vehicles, with increasing focus on specific technologies, geographies, or positions in the value chain.</p>
    `
  }
  // Additional insight content would be added similarly for other items
];

export default function InsightDetail() {
  const router = useRouter();
  const { slug } = router.query;
  
  // Find the insight based on the slug
  const insight = INSIGHTS.find(item => item.slug === slug);
  
  // If the page is still loading or insight not found
  if (router.isFallback || !insight) {
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
  
  // Find related insights (same category but different insight)
  const relatedInsights = INSIGHTS.filter(item => 
    item.category === insight.category && item.id !== insight.id
  ).slice(0, 3);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": insight.title,
    "description": insight.excerpt,
    "author": {
      "@type": "Person",
      "name": insight.author.name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    },
    "datePublished": insight.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://zencap.co/insights/${insight.slug}`
    }
  };

  return (
    <Layout>
      <SEO
        title={insight.title}
        description={insight.excerpt}
        structuredData={structuredData}
      />
      
      {/* Article Header */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Motion animation="fade" direction="down" duration={800}>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="inline-block px-3 py-1 bg-teal-500 text-white rounded-full text-sm font-medium">
                {insight.category}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-300">{insight.date}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-300">{insight.readTime}</span>
            </div>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight mb-6 text-white text-center">
              {insight.title}
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={300}>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto text-center">
              {insight.excerpt}
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-navy-700 font-semibold">
                  {insight.author.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-bold text-white">
                  {insight.author.name}
                </p>
                <p className="text-sm text-gray-300">
                  {insight.author.title}
                </p>
              </div>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 mb-10">
              [{ insight.imagePlaceholder }]
            </div>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-navy-700 dark:prose-headings:text-white prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-img:rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: insight.content }} />
            </div>
          </Motion>
        </div>
      </section>
      
      {/* Share and Tags Section */}
      <section className="py-8 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Share this insight
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-navy-700 dark:hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-navy-700 dark:hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-navy-700 dark:hover:text-white">
                  <span className="sr-only">Email</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link href={`/insights?category=${insight.category.toLowerCase().replace(' ', '-')}`}>
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-700">
                    {insight.category}
                  </span>
                </Link>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-700">
                  Investment
                </span>
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-700">
                  Analysis
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Insights */}
      {relatedInsights.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
                Related Insights
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedInsights.map((related) => (
                <Motion key={related.id} animation="fade" direction="up" delay={200} className="h-full">
                  <Link href={`/insights/${related.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{ related.imagePlaceholder }]
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                            {related.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {related.readTime}
                          </span>
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
      
      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Stay Informed
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Subscribe to receive our latest insights directly to your inbox.
              </p>
            </div>
          </Motion>
          <Motion animation="fade" direction="up" delay={200}>
            <NewsletterSignup dark={false} />
          </Motion>
        </div>
      </section>
      
      {/* Back to Insights Button */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <Link href="/insights">
              <Button variant="ghost" size="lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Insights
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
  const paths = INSIGHTS.map((insight) => ({
    params: { slug: insight.slug },
  }));

  return { paths, fallback: true };
}

// This function gets called at build time
export async function getStaticProps({ params }) {
  // In a real app, this would fetch data from an API or CMS
  const insight = INSIGHTS.find((item) => item.slug === params.slug) || null;

  return {
    props: {
      insight,
    },
    // Re-generate the page at most once per hour
    revalidate: 3600,
  };
}