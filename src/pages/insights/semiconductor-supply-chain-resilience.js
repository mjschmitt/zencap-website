// src/pages/insights/semiconductor-supply-chain-resilience.js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

export default function InsightDetail() {
  const router = useRouter();
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Semiconductor Supply Chain Resilience: Investment Implications",
    "description": "Examining how geopolitical tensions and reshoring efforts are transforming semiconductor manufacturing investments and public equity valuations.",
    "author": {
      "@type": "Person",
      "name": "Maximilian Schmitt"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Zenith Capital Advisors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zencap.co/logo.png"
      }
    },
    "datePublished": "March 8, 2025",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://zencap.co/insights/semiconductor-supply-chain-resilience"
    }
  };

  const content = `
    <h2>Geopolitical Tensions Reshaping Semiconductor Manufacturing</h2>
    <p>The semiconductor industry is undergoing its most significant structural shift in decades, driven by geopolitical tensions, supply chain vulnerabilities exposed during the pandemic, and strategic national initiatives to secure domestic production capabilities. These changes are creating profound investment implications across both public and private semiconductor-related equities.</p>
    
    <p>This analysis examines how reshoring efforts, new subsidy regimes, and the geographical diversification of manufacturing capacity are transforming the semiconductor landscape and creating new investment opportunities.</p>
    
    <h2>The Scale of Semiconductor Reshoring</h2>
    <p>The commitment to semiconductor manufacturing reshoring has reached unprecedented levels, with major public policy initiatives including:</p>
    
    <ul>
      <li>The U.S. CHIPS and Science Act allocating over $52 billion for semiconductor manufacturing and research</li>
      <li>The European Chips Act committing €43 billion to double EU market share in semiconductor production</li>
      <li>Japan's $6.8 billion semiconductor investment initiative</li>
      <li>South Korea's K-Semiconductor Strategy with $450 billion in planned investments</li>
      <li>India's $10 billion incentive program for semiconductor manufacturing</li>
    </ul>
    
    <p>These public investments are catalyzing even larger private capital deployments, with over $210 billion in new semiconductor fabrication projects announced globally since 2023.</p>
    
    <h2>Investment Implications Across the Value Chain</h2>
    <p>This manufacturing transformation is creating varied investment opportunities across different segments of the semiconductor value chain:</p>
    
    <div class="table-container">
      <table class="semiconductor-table">
        <thead>
          <tr>
            <th>Value Chain Segment</th>
            <th>Investment Thesis</th>
            <th>Notable Beneficiaries</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Semiconductor Manufacturing Equipment</td>
            <td>Sustained capex cycle from geographical diversification and leading-edge capacity expansion</td>
            <td>Equipment providers enabling next-generation semiconductor production</td>
          </tr>
          <tr>
            <td>Advanced Materials</td>
            <td>Growing demand for specialized materials required for leading-edge nodes</td>
            <td>High-purity materials suppliers with defensible intellectual property</td>
          </tr>
          <tr>
            <td>Chip Design Tools (EDA)</td>
            <td>Increasing complexity of designs requiring more sophisticated tools</td>
            <td>Software providers with AI-enhanced design capabilities</td>
          </tr>
          <tr>
            <td>Specialty Fabs</td>
            <td>Localized production of specialized chips for critical applications</td>
            <td>Companies focused on mature nodes, analog, and compound semiconductors</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <h2>Public Equity Valuation Divergence</h2>
    <p>The market is increasingly distinguishing between companies that stand to benefit from or are exposed to these supply chain shifts:</p>
    
    <ol>
      <li><strong>Multiple Expansion</strong>: Companies that are direct beneficiaries of reshoring initiatives have seen a valuation premium of 20-35% emerge relative to historical averages and comparable peers.</li>
      <li><strong>Regional Diversification Premium</strong>: Fabless semiconductor companies pursuing multi-sourcing strategies across geographies are commanding higher valuations than those with concentrated supply chains.</li>
      <li><strong>Capex Sensitivity</strong>: The market is rewarding companies that balance growth investments with return of capital, amid concerns about potential overcapacity in certain segments.</li>
      <li><strong>Technology Positioning</strong>: Firms positioned at the leading edge of the most advanced nodes and packaging technologies are seeing the strongest multiple expansion.</li>
    </ol>
    
    <h2>Geographic Implications</h2>
    <p>Different regions present varying investment opportunities:</p>
    
    <ul>
      <li><strong>United States</strong>: Leading-edge logic manufacturing, chip design, equipment, and EDA software</li>
      <li><strong>Europe</strong>: Specialty semiconductors, automotive, industrial, and power electronics</li>
      <li><strong>East Asia</strong>: Advanced packaging, memory, and display technologies</li>
      <li><strong>Emerging Markets</strong>: Assembly, testing, and mature node manufacturing</li>
    </ul>
    
    <h2>Risks and Challenges</h2>
    <p>The semiconductor reshoring thesis is not without significant risks:</p>
    
    <ol>
      <li><strong>Overcapacity Potential</strong>: Simultaneous global expansion could lead to supply gluts in certain segments by 2026-2027</li>
      <li><strong>Talent Constraints</strong>: The specialized workforce required for semiconductor manufacturing cannot scale as quickly as capital deployment</li>
      <li><strong>Cost Structure Challenges</strong>: Reshored manufacturing may carry 25-40% higher operating costs than established Asian hubs</li>
      <li><strong>Policy Continuity Risk</strong>: The multi-year nature of semiconductor investments creates vulnerability to shifting political priorities</li>
    </ol>
    
    <h2>Investment Strategy</h2>
    <p>For investors looking to position portfolios to benefit from semiconductor supply chain transformation, I recommend a balanced approach:</p>
    
    <ul>
      <li>Overweight semiconductor capital equipment providers with broad geographical exposure</li>
      <li>Focus on specialty materials companies with high barriers to entry</li>
      <li>Selectively target fabless semiconductor companies prioritizing supply chain resilience</li>
      <li>Consider the implications for adjacent industries, including industrial gases, factory automation, and clean energy providers</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>The geopolitically-driven transformation of semiconductor manufacturing represents one of the most significant capital reallocation events of the decade. While the transition period will create challenges and potential dislocations, it presents a compelling long-term investment opportunity across multiple segments of the technology value chain.</p>
    
    <p>Investors who can identify the companies best positioned to navigate this structural shift—balancing near-term execution risks with long-term strategic positioning—will find attractive opportunities in both public and private semiconductor-related equities.</p>
  `;

  return (
    <Layout>
      <SEO
        title="Semiconductor Supply Chain Resilience: Investment Implications"
        description="Examining how geopolitical tensions and reshoring efforts are transforming semiconductor manufacturing investments and public equity valuations."
        structuredData={structuredData}
      />
      
      {/* Article Header */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Motion animation="fade" direction="down" duration={800}>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="inline-block px-3 py-1 bg-teal-500 text-white rounded-full text-sm font-medium">
                Public Equity
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-300">March 8, 2025</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-300">9 min read</span>
            </div>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight mb-6 text-white text-center">
              Semiconductor Supply Chain Resilience: Investment Implications
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={300}>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto text-center">
              Examining how geopolitical tensions and reshoring efforts are transforming semiconductor manufacturing investments and public equity valuations.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-navy-700 font-semibold">
                  M
                </span>
              </div>
              <div>
                <p className="font-bold text-white">
                  Maximilian Schmitt
                </p>
                <p className="text-sm text-gray-300">
                  Founder & CEO
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
              [Semiconductor manufacturing]
            </div>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-navy-700 dark:prose-headings:text-white prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-img:rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: content }} />
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
                <Link href="/insights?category=public-equity">
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-700">
                    Public Equity
                  </span>
                </Link>
                <Link href="/insights?category=technology">
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-gray-300 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-700">
                    Technology
                  </span>
                </Link>
              </div>
            </div>
          </div>
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