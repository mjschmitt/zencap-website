import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SocialProofTestimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      title: 'Managing Partner',
      company: 'Meridian Capital Partners',
      deal: '$125M Multifamily Portfolio',
      image: 'SM',
      rating: 5,
      text: 'The multifamily acquisition model saved us 3 weeks of modeling work and helped us identify a $2.3M value-add opportunity we initially missed. The ROI was immediate.',
      result: 'Closed $125M deal 3 weeks ahead of schedule',
      verification: 'Verified Purchase - December 2024'
    },
    {
      id: 2,
      name: 'David Rodriguez',
      title: 'Senior Vice President',
      company: 'Blackstone Real Estate',
      deal: '$89M Hotel Acquisition',
      image: 'DR',
      rating: 5,
      text: 'These models are institutional quality. We use them for due diligence on major acquisitions. The hospitality model helped us underwrite a complex mixed-use hotel deal.',
      result: 'Identified 15% IRR improvement',
      verification: 'Verified Purchase - January 2025'
    },
    {
      id: 3,
      name: 'Jennifer Park',
      title: 'Director of Investments',
      company: 'Goldman Sachs Asset Management',
      deal: '$200M Development Pipeline',
      image: 'JP',
      rating: 5,
      text: 'The build quality and attention to detail in these models rivals what we build internally. Michael\'s Wall Street experience shows in every formula.',
      result: 'Standardized underwriting across 12 deals',
      verification: 'Verified Purchase - November 2024'
    },
    {
      id: 4,
      name: 'Robert Chen',
      title: 'Portfolio Manager',
      company: 'KKR Real Estate Partners',
      deal: '$75M Office Complex',
      image: 'RC',
      rating: 5,
      text: 'We\'ve purchased 6 different models over the past year. Each one has paid for itself multiple times over. The level of sophistication is unmatched.',
      result: 'Reduced modeling time by 70%',
      verification: 'Verified Purchase - October 2024'
    }
  ];

  const companyLogos = [
    'Goldman Sachs', 'Blackstone', 'KKR', 'Apollo', 'Brookfield', 'CBRE', 'JLL', 'PIMCO'
  ];

  return (
    <section className="py-16 bg-white dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-8 mb-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="font-medium">500+ Happy Clients</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">$2.4B+ Deals Modeled</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">24-Hour Delivery</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-navy-700 dark:text-white mb-4">
            Trusted by Leading Investment Firms
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Join 500+ investment professionals who rely on our models for institutional-quality analysis.
          </p>

          {/* Company Logos */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-12">
            {companyLogos.map((company, index) => (
              <div
                key={company}
                className="px-4 py-2 bg-gray-100 dark:bg-navy-800 rounded text-gray-600 dark:text-gray-400 font-medium text-sm"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div
          key={testimonials[activeTestimonial].id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-navy-50 to-teal-50 dark:from-navy-800 dark:to-navy-800 rounded-2xl p-8 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="w-20 h-20 bg-gradient-to-br from-navy-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto lg:mx-0 mb-4">
                {testimonials[activeTestimonial].image}
              </div>
              <div className="flex justify-center lg:justify-start mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                {testimonials[activeTestimonial].name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {testimonials[activeTestimonial].title}
              </p>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                {testimonials[activeTestimonial].company}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {testimonials[activeTestimonial].verification}
              </div>
            </div>

            <div className="lg:col-span-2">
              <blockquote className="text-xl text-gray-700 dark:text-gray-300 mb-4 font-medium leading-relaxed">
                "{testimonials[activeTestimonial].text}"
              </blockquote>
              <div className="bg-white dark:bg-navy-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-navy-700 dark:text-white">
                      Result: {testimonials[activeTestimonial].result}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deal: {testimonials[activeTestimonial].deal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center space-x-4 mb-8">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => setActiveTestimonial(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === activeTestimonial
                  ? 'bg-teal-500 transform scale-125'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Smaller Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.filter((_, index) => index !== activeTestimonial).slice(0, 2).map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-navy-800 rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {testimonial.image}
                </div>
                <div className="flex-1">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    "{testimonial.text.slice(0, 120)}..."
                  </blockquote>
                  <div>
                    <p className="font-medium text-navy-700 dark:text-white text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}