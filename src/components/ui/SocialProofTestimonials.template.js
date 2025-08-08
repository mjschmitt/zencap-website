// TEMPLATE FILE - Saved for future use when real testimonials are available
// This component was temporarily removed from the homepage during launch
// To reactivate: rename this file back to SocialProofTestimonials.js and uncomment in index.js

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SocialProofTestimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // REPLACE THESE WITH REAL TESTIMONIALS WHEN AVAILABLE
  const testimonials = [
    {
      id: 1,
      name: 'Client Name',
      title: 'Title',
      company: 'Company Name',
      deal: 'Deal Size/Type',
      image: 'Initials',
      rating: 5,
      text: 'Testimonial text here...',
      result: 'Specific result achieved',
      verification: 'Verified Purchase - Date'
    },
    // Add more real testimonials here
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-navy-900/50 dark:to-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-navy-700 dark:text-white mb-4">
            Trusted By Leading Investment Firms
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join hundreds of investment professionals who rely on our models for critical decisions
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-navy-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Rating Stars */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                "{testimonial.text}"
              </p>

              {/* Result Badge */}
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                ✓ {testimonial.result}
              </div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-navy-700 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.title}, {testimonial.company}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {testimonial.deal}
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {testimonial.verification}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-navy-700 dark:bg-navy-800 rounded-2xl p-8 text-white"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-400">500+</div>
              <div className="text-sm opacity-90">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-400">$2.5B+</div>
              <div className="text-sm opacity-90">Deals Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-400">98%</div>
              <div className="text-sm opacity-90">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-400">24hr</div>
              <div className="text-sm opacity-90">Support Response</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}