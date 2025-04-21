// src/pages/about.js - with taller photo windows
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import SEO from '@/components/SEO';
import Image from 'next/image';

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
              Bridging the gap between financial theory and practical investment decisions
            </p>
          </Motion>
        </div>
      </section>
      
      {/* Mission Statement Section - New */}
      <section className="py-12 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-navy-700 dark:text-white font-serif italic mb-6">
                "To equip investment professionals with powerful analytical tools that transform complex data into actionable insights, driving better decisions and superior returns."
              </p>
              <div className="h-1 w-24 bg-teal-500 mx-auto"></div>
            </div>
          </Motion>
        </div>
      </section>
      
      {/* Our Story Section - Enhanced with taller image container and more content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-8 mb-12">
            <Motion animation="fade" direction="up">
              <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-6">
                Our Story
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2">
                <Motion animation="fade" direction="up" delay={200}>
                  <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                    <p className="mb-4">
                      Zenith Capital Advisors was founded in 2023 by Maximilian Schmitt, drawing on his extensive experience across both private and public equity markets. After witnessing firsthand the limitations of existing financial models – either overly simplistic or unnecessarily complex – Max recognized the need for analytical tools that balanced mathematical rigor with practical usability.
                    </p>
                    <p className="mb-4">
                      Our approach combines rigorous quantitative methods with practical investment experience. We believe that the most effective models are those that provide transparency into key drivers and assumptions, allowing investment professionals to exercise their judgment with better information.
                    </p>
                    <p className="mb-4">
                      What sets Zenith apart is our commitment to creating tools that aren't just technically sound but are genuinely useful in real-world investment settings. Our models strip away unnecessary detail while preserving the sophisticated analysis needed for informed decision-making. We focus on making the important variables clear and actionable, rather than hiding them behind layers of complexity.
                    </p>
                    <p>
                      Today, Zenith serves clients ranging from boutique real estate investment firms to global asset managers, providing both standardized models that save countless development hours and bespoke solutions tailored to specific investment strategies.
                    </p>
                  </div>
                </Motion>
              </div>
              <div className="order-first md:order-last">
                <Motion animation="fade" direction="left" delay={300}>
                  <div className="relative min-h-[400px] rounded-lg overflow-hidden">
                    <Image 
                      src="/images/about/founder.jpg" 
                      alt="Maximilian Schmitt, Founder & CEO"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Motion>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section - Enhanced with images */}
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
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md relative">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/about/analytical-rigor.jpg" 
                    alt="Analytical Rigor"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-navy-900/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="h-8 w-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Analytical Rigor
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe that sound decisions begin with thorough analysis. Our work is grounded in 
                  quantitative precision and careful attention to detail, ensuring every model delivers reliable insights.
                </p>
              </div>
            </Motion>
            
            {/* Value 2 */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md relative">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/about/client-partnership.jpg" 
                    alt="Client Partnership"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-navy-900/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="h-8 w-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Client Partnership
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We view our client relationships as long-term partnerships. We succeed when you succeed, 
                  and we're committed to your continued investment performance beyond any single project.
                </p>
              </div>
            </Motion>
            
            {/* Value 3 */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md relative">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/about/continuous-innovation.jpg" 
                    alt="Continuous Innovation"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-navy-900/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="h-8 w-8 text-white dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-3">
                  Continuous Innovation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  The investment landscape is constantly evolving, and so are we. We continuously 
                  refine our methodologies and incorporate new approaches to stay ahead of market trends.
                </p>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Leadership Section - with three profiles of equal size */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-12 text-center">
              Our Leadership
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Maximilian Schmitt Profile */}
            <Motion animation="fade" direction="up" delay={200}>
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                <div className="relative h-[400px]">
                  <Image 
                    src="/images/about/founder.jpg" 
                    alt="Maximilian Schmitt"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-1">
                    Maximilian Schmitt
                  </h3>
                  <p className="text-teal-500 font-medium mb-4">Founder & CEO</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Max has over 10 years of experience in public and private equity investing, bringing a comprehensive perspective to financial modeling. His career spans senior research roles at Evercore ISI and Macquarie Capital, where he developed innovative analytical frameworks for equity valuation and investment decision-making. Prior to Wall Street, Max underwrote over $1 billion of CRE transactions and helped manage a 2,000 unit multifamily portfolio while working in private equity.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    His multidisciplinary background in both buy-side and sell-side roles provides Zenith with unique insights into the analytical needs across the investment spectrum. Max holds a bachelor's degree in Finance and master's degrees in Entrepreneurship and Real Estate from the University of Florida.
                  </p>
                  <div className="flex space-x-3 mt-auto">
                    <a href="#" className="text-gray-400 hover:text-navy-700 dark:hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-navy-700 dark:hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Motion>
            
            {/* Gediminas Bulota Profile */}
            <Motion animation="fade" direction="up" delay={300}>
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                <div className="relative h-[400px] bg-gray-200 dark:bg-navy-700 flex items-center justify-center">
                  <div className="h-40 w-40 bg-navy-500 rounded-full flex items-center justify-center text-white text-6xl font-bold">
                    GB
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-1">
                    Gediminas Bulota
                  </h3>
                  <p className="text-teal-500 font-medium mb-4">Senior Advisor, Quantitative Finance</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Gediminas brings over 15 years of experience in quantitative finance and derivatives modeling. Previously, he served as Head of Quantitative Strategy at a major global investment bank and led the development of proprietary pricing models for complex structured products.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    He holds a Ph.D. in Financial Mathematics from MIT and has published numerous papers on derivatives pricing and risk management. His expertise in mathematical finance provides an invaluable perspective to Zenith's modeling approach.
                  </p>
                  <div className="flex space-x-3 mt-auto">
                    <a href="#" className="text-gray-400 hover:text-navy-700 dark:hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Motion>
            
            {/* Matthew Yance Profile */}
            <Motion animation="fade" direction="up" delay={400}>
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                <div className="relative h-[400px] bg-gray-200 dark:bg-navy-700 flex items-center justify-center">
                  <div className="h-40 w-40 bg-navy-500 rounded-full flex items-center justify-center text-white text-6xl font-bold">
                    MY
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-1">
                    Matthew Yance
                  </h3>
                  <p className="text-teal-500 font-medium mb-4">Senior Advisor, Private Equity</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Matthew has over two decades of experience in private equity investing, having most recently served as Managing Director at a leading global private equity firm where he led investments in the technology and healthcare sectors with deal sizes ranging from $500M to $5B.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    He holds an MBA from Harvard Business School and a bachelor's degree in Economics from Princeton University. Matthew provides invaluable insights into the practical applications of financial models in the private equity investment process.
                  </p>
                  <div className="flex space-x-3 mt-auto">
                    <a href="#" className="text-gray-400 hover:text-navy-700 dark:hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Expertise Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-12 text-center">
              Our Expertise
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Private Equity Expertise */}
            <Motion animation="fade" direction="right" delay={200}>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md h-full">
                <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                  Private Equity
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Real estate acquisition modeling</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">LBO and buyout analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Waterfall distribution models</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Portfolio performance tracking</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Due diligence frameworks</span>
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                  Our extensive PE background, managing a $600M multifamily portfolio, informs our approach to private market modeling.
                </p>
              </div>
            </Motion>
            
            {/* Public Equity Expertise */}
            <Motion animation="fade" direction="left" delay={300}>
              <div className="bg-white dark:bg-navy-800 p-8 rounded-lg shadow-md h-full">
                <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                  Public Equity
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Discounted cash flow analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Integrated 3-statement modeling</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Relative valuation frameworks</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Scenario and sensitivity analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Portfolio attribution models</span>
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                  Drawing on senior research experience at Evercore ISI and Macquarie Capital, we understand the nuances of public market valuation.
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
            <h2 className="text-3xl font-bold mb-4">Ready to elevate your investment analysis?</h2>
          </Motion>
          
          <Motion animation="fade" direction="up" delay={200}>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let's discuss how Zenith Capital can transform your investment process and decision-making.
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