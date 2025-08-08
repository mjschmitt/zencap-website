import Layout from '@/components/layout/Layout';
import SEO from '@/components/SEO';
import OptimizedPricing from '@/components/ui/OptimizedPricing';
import MoneyBackGuarantee from '@/components/ui/MoneyBackGuarantee';
import LaunchUrgencyBanner from '@/components/ui/LaunchUrgencyBanner';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MultifamilyDevelopmentModel() {
  const model = {
    id: 'multifamily-development-model',
    title: 'Multifamily Development Model',
    price: 4985,
    originalPrice: 8325,
    description: 'The most comprehensive multifamily development model trusted by top PE firms for $100M+ projects.',
    features: [
      'Advanced construction budget tracking with 50+ line items',
      'Dynamic unit mix optimization (studio to 3BR)',
      'Sophisticated lease-up scenarios with absorption curves',
      'Multi-tranche financing with construction and perm debt',
      'Investor waterfall with preferred returns and promote',
      'Sensitivity analysis on 15+ key variables',
      'Detailed cash flow projections (monthly for 10 years)',
      'Professional charts and investor presentation templates'
    ],
    technicalSpecs: [
      'Excel 2016+ compatible (PC & Mac)',
      '12 interconnected worksheets',
      '500+ formulas with error checking',
      'VBA-free for maximum compatibility',
      'Detailed instruction manual (45 pages)',
      'Sample project with realistic assumptions'
    ],
    testimonials: [
      {
        name: 'Jennifer Park',
        title: 'Director of Investments',
        company: 'Goldman Sachs Asset Management',
        text: 'This model helped us underwrite a $125M multifamily development 3 weeks ahead of schedule. The construction budget tracking alone saved us countless hours.',
        deal: '$125M Development Project'
      },
      {
        name: 'Robert Martinez',
        title: 'Managing Director',
        company: 'Brookfield Asset Management',
        text: 'We use this model as our standard for all multifamily developments. The sophistication rivals what we build internally at a fraction of the cost.',
        deal: '$89M Mixed-Use Development'
      }
    ],
    faqs: [
      {
        question: 'How quickly can I start using this model?',
        answer: 'The model is ready to use immediately upon download. It includes sample data and a comprehensive instruction guide. Most users are up and running within 30 minutes.'
      },
      {
        question: 'Is this suitable for international projects?',
        answer: 'Yes, the model is currency-agnostic and can be adapted for any market. The underlying financial logic works globally, though local regulations may require minor adjustments.'
      },
      {
        question: 'What support is included?',
        answer: 'Every purchase includes 90 days of email support, a detailed instruction manual, video tutorials, and access to our private user community.'
      },
      {
        question: 'Can I customize the model for my specific needs?',
        answer: 'Absolutely. The model is unlocked and fully customizable. We also offer custom modification services if you need extensive changes.'
      }
    ]
  };

  return (
    <Layout>
      {/* Launch Urgency Banner */}
      <LaunchUrgencyBanner />
      
      <SEO
        title="Multifamily Development Model - Professional Excel Financial Model"
        description="Institutional-grade Excel model for multifamily development projects. Used by Goldman Sachs, Blackstone, and top PE firms. Save 40+ hours of modeling work."
        keywords="multifamily development model, real estate financial model, Excel model, apartment development, private equity"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  Private Equity
                </span>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  Institutional Grade
                </span>
                <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                  🔥 40% Off Launch Special
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-navy-700 dark:text-white mb-4">
                {model.title}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {model.description}
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 dark:bg-navy-800 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Happy Clients</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-navy-800 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">40+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hours Saved</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-navy-800 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">$25K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Consultant Value</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-navy-800 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">98.2%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
                </div>
              </div>
            </motion.div>

            {/* Model Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Model Preview
              </h2>
              <div className="bg-gray-100 dark:bg-navy-800 rounded-lg p-8 text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  [Professional Excel Model Screenshot]
                </div>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                  View Full Screenshots
                </button>
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                What's Included
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {model.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Technical Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                Technical Specifications
              </h2>
              <div className="bg-blue-50 dark:bg-navy-800 rounded-lg p-6">
                <div className="space-y-3">
                  {model.technicalSpecs.map((spec, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                What Investment Professionals Say
              </h2>
              <div className="space-y-6">
                {model.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white dark:bg-navy-800 rounded-lg p-6 shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-navy-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>
                        <blockquote className="text-gray-700 dark:text-gray-300 mb-3">
                          "{testimonial.text}"
                        </blockquote>
                        <div className="text-sm">
                          <div className="font-medium text-navy-700 dark:text-white">{testimonial.name}</div>
                          <div className="text-gray-500">{testimonial.title}, {testimonial.company}</div>
                          <div className="text-teal-600 dark:text-teal-400 font-medium">Deal: {testimonial.deal}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {model.faqs.map((faq, index) => (
                  <div key={index} className="bg-white dark:bg-navy-800 rounded-lg p-6">
                    <h3 className="font-bold text-navy-700 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar with Optimized Pricing */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <OptimizedPricing model={model} />
              <MoneyBackGuarantee />
              
              {/* Additional Trust Signals */}
              <div className="bg-white dark:bg-navy-800 rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-navy-700 dark:text-white mb-4">
                  Why Choose Our Models?
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Created by former Goldman Sachs VP</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Used by 500+ investment professionals</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Proven on $2.4B+ in transactions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant download & lifetime updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}