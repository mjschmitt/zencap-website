// src/pages/about.js
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import SEO from '@/components/SEO';

export default function About() {
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Zenith Capital Advisors",
    "description": "Learn about Zenith Capital Advisors' mission, values, and our expert team dedicated to providing financial modeling and advisory services."
  };

  return (
    <Layout>
      <SEO
        title="About Us"
        description="Learn about Zenith Capital Advisors' mission, values, and our expert team dedicated to providing financial modeling and advisory services."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Motion animation="fade" direction="down" duration={800}>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
              About Zenith Capital
            </h1>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200} duration={800}>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Investment expertise for public and private equity markets
            </p>
          </Motion>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-8 mb-12">
            <Motion animation="fade" direction="up">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-6">
                Our Story
              </h2>
            </Motion>
            
            <Motion animation="fade" direction="up" delay={200}>
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                <p className="mb-4">
                  Zenith Capital Advisors was founded with a simple mission: to provide investment professionals 
                  with the analytical tools and frameworks they need to make better decisions. With backgrounds 
                  spanning private equity, investment banking, and asset management, our team brings together deep 
                  expertise in both financial analysis and practical investment decision-making.
                </p>
                <p className="mb-4">
                  The idea for Zenith emerged from our founders' frustration with the limitations of existing financial 
                  models and analytical tools. Too often, these models were either overly simplistic, failing to capture 
                  the nuances of complex investments, or needlessly complicated, obscuring key insights beneath layers 
                  of unnecessary detail.
                </p>
                <p className="mb-4">
                  We set out to create a different approach: financial models and advisory services that combine analytical 
                  rigor with practical usability, designed by investment professionals for investment professionals.
                </p>
                <p>
                  Today, Zenith serves clients across the investment landscape, from boutique real estate investment 
                  firms to global asset managers. Our pre-built models save our clients countless hours of development 
                  time, while our custom services provide tailored solutions for specific investment needs.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-12">
              Our Values
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <Motion animation="fade" direction="up" delay={200}>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md">
                <div className="h-16 w-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-navy-700 dark:text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Analytical Rigor
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe that sound decisions begin with thorough analysis. Our work is grounded in 
                  quantitative precision and careful attention to detail.
                </p>
              </div>
            </Motion>
            
            {/* Value 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md">
                <div className="h-16 w-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-navy-700 dark:text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Client Partnership
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We view our client relationships as partnerships. We succeed when you succeed, 
                  and we're committed to your long-term investment performance.
                </p>
              </div>
            </Motion>
            
            {/* Value 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md">
                <div className="h-16 w-16 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-navy-700 dark:text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Continuous Innovation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  The investment landscape is constantly evolving, and so are we. We continuously 
                  refine our methodologies and incorporate new approaches into our work.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold mb-4">Ready to work with our team?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let's discuss how we can help elevate your investment process
            </p>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={400}>
            <Button href="/contact" variant="accent" size="lg">
              Contact Us
            </Button>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}