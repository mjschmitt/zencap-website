// src/pages/index.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import TestimonialSlider from '@/components/ui/TestimonialSlider';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import SEO from '@/components/SEO';

export default function Home() {
  const testimonials = [
    {
      quote: "Zenith's financial models gave us the analytical edge we needed to close our latest acquisition. Their attention to detail is unmatched.",
      name: "Sarah Johnson",
      title: "Investment Director, Artemis Partners"
    },
    {
      quote: "The custom model Zenith built for our portfolio valuation has become an essential part of our investment process. Worth every penny.",
      name: "Michael Chen",
      title: "Managing Partner, Horizon Capital"
    },
    {
      quote: "Working with Zenith transformed our approach to deal evaluation. Their team delivered exactly what we needed, on time and on budget.",
      name: "David Rodriguez",
      title: "VP of Acquisitions, Summit Equity"
    }
  ];
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Zenith Capital Advisors",
    "url": "https://zencap.co",
    "logo": "https://zencap.co/logo.png",
    "description": "Financial modeling and investment advisory services for public and private equity investors.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Finance Street",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "postalCode": "10001",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service"
    }
  };

  return (
    <Layout>
      <SEO
        title="Financial Modeling & Investment Advisory"
        description="Precision financial modeling and advisory solutions for public and private equity investors."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              Elevate Your Investment Decisions
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Precision financial modeling and advisory solutions for investors.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/products" variant="accent" size="lg">
                Explore Solutions
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold font-serif text-navy-700 mb-4">
              About Zenith
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Zenith Capital Advisors provides sophisticated financial modeling and investment 
              solutions for asset managers and investment firms.
            </p>
          </Motion>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Card 1 */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="h-12 w-12 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-navy-700 dark:text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy-700 dark:text-white mb-2">Financial Modeling</h3>
                <p className="text-gray-600 dark:text-gray-300">Custom financial models for both public and private equity investments.</p>
              </div>
            </Motion>
            
            {/* Card 2 */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="h-12 w-12 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-navy-700 dark:text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy-700 dark:text-white mb-2">Investment Advisory</h3>
                <p className="text-gray-600 dark:text-gray-300">Strategic guidance for optimizing your investment decisions.</p>
              </div>
            </Motion>
            
            {/* Card 3 */}
            <Motion animation="fade" direction="up" delay={500}>
              <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="h-12 w-12 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-navy-700 dark:text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy-700 dark:text-white mb-2">Research Services</h3>
                <p className="text-gray-600 dark:text-gray-300">Comprehensive industry and market research to inform investment decisions.</p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold font-serif text-navy-700 dark:text-white mb-8 text-center">
              What Our Clients Say
            </h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <TestimonialSlider testimonials={testimonials} />
          </Motion>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <NewsletterSignup dark={false} />
          </Motion>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your investment process?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let's discuss how our financial models and advisory services can help you make better investment decisions.
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <Button href="/contact" variant="accent" size="lg">
              Contact Us Today
            </Button>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}