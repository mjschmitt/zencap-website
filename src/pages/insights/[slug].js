// src/pages/insights/[slug].js - Individual insight page with database integration
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import SEO from '@/components/SEO';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiShare2 } from 'react-icons/fi';

export default function InsightDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedInsights, setRelatedInsights] = useState([]);

  useEffect(() => {
    if (slug) {
      fetchInsight();
      fetchRelatedInsights();
    }
  }, [slug]);

  const fetchInsight = async () => {
    try {
      const response = await fetch(`/api/insights?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        setInsight(data);
      } else {
        console.error('Insight not found');
        router.push('/insights');
      }
    } catch (error) {
      console.error('Error fetching insight:', error);
      router.push('/insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedInsights = async () => {
    try {
      const response = await fetch('/api/insights');
      const data = await response.json();
      // Filter out current insight and limit to 3
      const related = data
        .filter(item => item.slug !== slug)
        .slice(0, 3);
      setRelatedInsights(related);
    } catch (error) {
      console.error('Error fetching related insights:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const estimateReadTime = (content) => {
    if (!content) return '5 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const shareInsight = () => {
    if (navigator.share) {
      navigator.share({
        title: insight.title,
        text: insight.summary,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
      </Layout>
    );
  }

  if (!insight) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Insight not found
            </h2>
            <Button href="/insights">
              Back to Insights
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${insight.title} | Zenith Capital Advisors`}
        description={insight.summary || 'Read our latest investment insights and market analysis.'}
      />
      
      {/* Article Header */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-navy-900 dark:to-navy-800 pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion variant="fade-in">
            {/* Back Button */}
            <Link href="/insights" className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-8 group">
              <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Insights
            </Link>

            {/* Category Tag */}
            {insight.tags && (
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-sm font-medium rounded-full">
                  {insight.tags.split(',')[0].trim()}
              </span>
            </div>
            )}
          
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {insight.title}
            </h1>

            {/* Summary */}
            {insight.summary && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {insight.summary}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 pb-8 border-b border-gray-200 dark:border-navy-700">
              {insight.author && (
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  <span>{insight.author}</span>
                </div>
              )}
              <div className="flex items-center">
                <FiCalendar className="w-4 h-4 mr-2" />
                <span>{formatDate(insight.published_at)}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="w-4 h-4 mr-2" />
                <span>{estimateReadTime(insight.content)}</span>
              </div>
              <Button
                type="button"
                variant="accent"
                size="md"
                className="flex items-center gap-2 px-4 py-2"
                onClick={shareInsight}
              >
                <FiShare2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="pt-4 pb-16 bg-white dark:bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion variant="fade-in" delay={0.2}>
            {/* Cover Image */}
            {insight.cover_image_url && (
              <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={insight.cover_image_url} 
                  alt={insight.title}
                  className="w-full h-auto"
                />
            </div>
            )}
          
            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none article-content">
              {insight.content ? (
              <div dangerouslySetInnerHTML={{ __html: insight.content }} />
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="mb-6">
                    This insight provides valuable perspectives on {insight.title.toLowerCase()}.
                    Our analysis covers key trends, market dynamics, and investment implications
                    that matter to sophisticated investors.
                  </p>
                  <p className="mb-6">
                    Stay tuned for more detailed content and analysis. In the meantime, explore
                    our other insights or contact us to discuss your specific investment needs.
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {insight.tags && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-navy-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Topics
             </h3>
             <div className="flex flex-wrap gap-2">
                  {insight.tags.split(',').map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tag.trim()}
                 </span>
                  ))}
             </div>
           </div>
            )}
          </Motion>
       </div>
     </section>
     
     {/* Related Insights */}
     {relatedInsights.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-navy-900">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion variant="fade-in">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
               Related Insights
             </h2>
           </Motion>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedInsights.map((related, index) => (
                <Motion 
                  key={related.id} 
                  variant="slide-up" 
                  delay={index * 0.1}
                >
                 <Link href={`/insights/${related.slug}`}>
                    <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 h-full">
                      {related.tags && (
                        <span className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-medium rounded-full mb-3">
                          {related.tags.split(',')[0].trim()}
                         </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                         {related.title}
                       </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                        {related.summary || 'Explore our latest insights and analysis.'}
                       </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(related.published_at)}
                      </div>
                     </div>
                 </Link>
               </Motion>
             ))}
           </div>
         </div>
       </section>
     )}
     
      {/* Newsletter CTA */}
      <section className="py-16 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion variant="fade-in" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Never Miss an Insight
             </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Subscribe to receive our latest research, market analysis, and investment perspectives directly to your inbox.
             </p>
         </Motion>
          <Motion variant="slide-up" delay={0.2}>
            <NewsletterSignup />
         </Motion>
       </div>
     </section>
   </Layout>
 );
}

// Remove static generation for now since we're using dynamic data
export async function getServerSideProps({ params }) {
 return {
    props: {}
 };
}