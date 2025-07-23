// src/pages/insights/index.js - Enhanced insights page with search, filters, and grid layout
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import EnhancedHero from '@/components/ui/EnhancedHero';
import { FiSearch, FiCalendar, FiClock, FiUser } from 'react-icons/fi';

// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Insights' },
  { id: 'public-equity', name: 'Public Equity' },
  { id: 'private-equity', name: 'Private Equity' },
  { id: 'market-analysis', name: 'Market Analysis' },
  { id: 'investment-strategy', name: 'Investment Strategy' },
  { id: 'industry-research', name: 'Industry Research' }
];

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    filterInsights();
  }, [insights, selectedCategory, searchTerm]);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights');
      const data = await response.json();
        setInsights(Array.isArray(data) ? data : []);
        setLoading(false);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([]);
      setLoading(false);
    }
  };

  const filterInsights = () => {
    let filtered = [...insights];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(insight => {
        const tags = insight.tags ? insight.tags.toLowerCase() : '';
        const category = selectedCategory.replace('-', ' ');
        return tags.includes(category);
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(insight => {
        const searchLower = searchTerm.toLowerCase();
        return (
          insight.title.toLowerCase().includes(searchLower) ||
          (insight.summary && insight.summary.toLowerCase().includes(searchLower)) ||
          (insight.author && insight.author.toLowerCase().includes(searchLower)) ||
          (insight.tags && insight.tags.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredInsights(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC' // Use UTC to avoid timezone conversion issues
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const estimateReadTime = (content) => {
    if (!content) return '5 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <Layout>
      <SEO 
        title="Insights | Zenith Capital Advisors"
        description="Expert insights on investment strategies, market analysis, and financial modeling from Zenith Capital Advisors."
      />

      {/* Hero Section */}
      <section 
        className="relative bg-navy-700 text-white bg-cover bg-center bg-no-repeat min-h-[60vh] md:min-h-[70vh] flex items-center"
        style={{ backgroundImage: 'url(/images/insights/insights-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 w-full">
          <Motion variant="fade-in">
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Insights
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Investment analysis, market trends, and earnings snapshots from our research team
            </p>
          </Motion>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900" id="insights-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Insights */}
          {!loading && insights.length > 0 && (
            <Motion variant="fade-in" className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Featured Insights
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Highlighted analysis from our research team
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {insights.slice(0, 2).map((insight, index) => (
                  <Motion
                    key={`featured-${insight.id}`}
                    variant="slide-up"
                    delay={index * 0.1}
                  >
                    <Link href={`/insights/${insight.slug}`}>
                      <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border-2 border-teal-500/20 hover:border-teal-500/40" padding={false}>
                        {/* Featured Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-block px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full">
                            Featured
                          </span>
                        </div>
                        
                        {/* Cover Image */}
                        {insight.cover_image_url && (
                          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-lg">
                            <img 
                              src={insight.cover_image_url} 
                              alt={insight.title}
                              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        {!insight.cover_image_url && (
                          <div className="h-64 bg-gradient-to-br from-teal-500 to-navy-600 rounded-t-lg flex items-center justify-center">
                            <span className="text-white text-4xl font-bold opacity-20">
                              {insight.title.charAt(0)}
                            </span>
                          </div>
                        )}

                        <div className="p-6">
                          {/* Category Tag */}
                          {insight.tags && (
                            <div className="mb-3">
                              <span className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-medium rounded-full">
                                {insight.tags.split(',')[0].trim()}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {insight.title}
                          </h3>

                          {/* Summary */}
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                            {insight.summary || 'Explore our latest insights and analysis on investment strategies and market trends.'}
                          </p>

                          {/* Meta Information */}
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <FiCalendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(insight.date_published)}</span>
                              </div>
                              <div className="flex items-center">
                                <FiClock className="w-4 h-4 mr-1" />
                                <span>{estimateReadTime(insight.content)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Author */}
                          {insight.author && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center">
                                <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {insight.author}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </Motion>
                ))}
              </div>
            </Motion>
          )}

          {/* Search Bar */}
          <Motion variant="fade-in" className="mb-8">
            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-navy-700">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search insights by title, author, or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </Motion>

          {/* Category Filter */}
          <Motion variant="fade-in" className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </Motion>



          {/* All Insights Section */}
          {!loading && filteredInsights.length > 0 && (
            <Motion variant="fade-in" className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  All Insights
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse our complete collection of investment analysis and market research
                </p>
              </div>
            </Motion>
          )}

          {/* Insights Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : filteredInsights.length === 0 ? (
            <Motion variant="fade-in" className="text-center py-20">
              <div className="bg-white dark:bg-navy-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-navy-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No insights found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Check back soon for new insights and analysis'}
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Motion>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInsights.map((insight, index) => (
                <Motion
                  key={insight.id}
                  variant="slide-up"
                  delay={index * 0.1}
                >
                  <Link href={`/insights/${insight.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden" padding={false}>
                      {/* Cover Image Placeholder */}
                      {insight.cover_image_url && (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-lg">
                          <img 
                            src={insight.cover_image_url} 
                            alt={insight.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      {!insight.cover_image_url && (
                        <div className="h-48 bg-gradient-to-br from-teal-500 to-navy-600 rounded-t-lg flex items-center justify-center">
                          <span className="text-white text-4xl font-bold opacity-20">
                            {insight.title.charAt(0)}
                          </span>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Category Tag */}
                        {insight.tags && (
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-medium rounded-full">
                              {insight.tags.split(',')[0].trim()}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                          {insight.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {insight.summary || 'Explore our latest insights and analysis on investment strategies and market trends.'}
                        </p>

                        {/* Meta Information */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(insight.date_published)}</span>
                            </div>
                            <div className="flex items-center">
                              <FiClock className="w-4 h-4 mr-1" />
                              <span>{estimateReadTime(insight.content)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Author */}
                        {insight.author && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-700">
                            <div className="flex items-center">
                              <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {insight.author}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                </Motion>
              ))}
                        </div>
          )}

          {/* Results Count at Bottom */}
          {!loading && filteredInsights.length > 0 && (
            <Motion variant="fade-in" className="mt-12">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Showing {filteredInsights.length} of {insights.length} insights
                </span>
              </div>
            </Motion>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="py-16 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion variant="fade-in" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Subscribe to our newsletter and never miss our latest insights, market analysis, and investment perspectives.
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