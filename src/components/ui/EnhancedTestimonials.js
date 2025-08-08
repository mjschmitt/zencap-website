// src/components/ui/EnhancedTestimonials.js - Fixed quotes and img tag
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Platform value propositions - rotating showcase
const TESTIMONIALS = [
  {
    id: 1,
    quote: "Institutional-grade Excel models for private equity, real estate, and public market investments. Ready to use from day one.",
    name: "Professional Models",
    title: "Built for sophisticated investors",
    avatar: null,
    rating: 5
  },
  {
    id: 2,
    quote: "From acquisition analysis to portfolio valuation, our models accelerate every phase of your investment process.",
    name: "End-to-End Solutions",
    title: "Complete investment toolkit",
    avatar: null,
    rating: 5
  },
  {
    id: 3,
    quote: "One-time purchase with lifetime updates. Full model ownership and customization rights included.",
    name: "Transparent Pricing",
    title: "No subscriptions or hidden fees",
    avatar: null,
    rating: 5
  },
  {
    id: 4,
    quote: "Built by finance professionals with deep experience in investment banking and private equity.",
    name: "Industry Expertise",
    title: "Created by finance professionals",
    avatar: null,
    rating: 5
  },
  {
    id: 5,
    quote: "Custom advisory solutions for unique investment challenges. From model development to infrastructure design.",
    name: "Bespoke Advisory",
    title: "Tailored to your specific needs",
    avatar: null,
    rating: 5
  },
  {
    id: 6,
    quote: "Deploy professional models immediately. No learning curve, no setup time. Focus on deal execution, not model building.",
    name: "Time to Value",
    title: "Accelerate your investment process",
    avatar: null,
    rating: 5
  }
];

export default function EnhancedTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const autoPlayRef = useRef(null);
  
  // Auto-advance testimonials
  useEffect(() => {
    autoPlayRef.current = nextTestimonial;
  });
  
  useEffect(() => {
    const play = () => {
      autoPlayRef.current();
    };
    
    const interval = setInterval(play, 6000);
    return () => clearInterval(interval);
  }, []);
  
  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex === TESTIMONIALS.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? TESTIMONIALS.length - 1 : prevIndex - 1
    );
  };
  
  // Framer motion variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0
    })
  };
  
  // Get current testimonial
  const testimonial = TESTIMONIALS[currentIndex];
  
  return (
    <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-bold font-serif text-navy-700 dark:text-white mb-4 text-center">
            Why Choose Zenith Capital
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 text-center max-w-2xl mx-auto">
            Professional financial models designed to accelerate your investment success
          </p>
        </motion.div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Sophisticated Container with gradient border */}
          <div className="relative bg-gradient-to-br from-teal-500 via-navy-600 to-navy-700 p-[2px] rounded-2xl">
            <div className="bg-white dark:bg-navy-900 rounded-2xl overflow-hidden">
              
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500"></div>
              
              {/* Main content area */}
              <div className="relative px-20 py-12 min-h-[280px]">
                <AnimatePresence custom={direction} initial={false}>
                  <motion.div
                    key={testimonial.id}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.5 }
                    }}
                    className="absolute inset-0 flex flex-col justify-between px-20 py-12"
                  >
                    {/* Category badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
                        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {testimonial.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
                        {currentIndex + 1} / {TESTIMONIALS.length}
                      </span>
                    </div>
                    
                    {/* Main message */}
                    <div className="flex-grow flex items-center">
                      <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed font-light">
                        {testimonial.quote}
                      </p>
                    </div>
                    
                    {/* Bottom section with refined styling */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-navy-800">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-teal-500 rounded-full mr-3 animate-pulse"></div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {testimonial.title}
                        </p>
                      </div>
                      
                      {/* Progress dots */}
                      <div className="flex space-x-2">
                        {TESTIMONIALS.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setDirection(index > currentIndex ? 1 : -1);
                              setCurrentIndex(index);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              index === currentIndex 
                                ? 'w-8 bg-teal-500' 
                                : 'w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Integrated navigation buttons */}
                <button
                  onClick={prevTestimonial}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/80 dark:bg-navy-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-navy-800 transition-all group"
                  aria-label="Previous"
                >
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={nextTestimonial}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/80 dark:bg-navy-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-navy-800 transition-all group"
                  aria-label="Next"
                >
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key metrics */}
        <div className="mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">13+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Professional Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Solution Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">Instant</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Model Deployment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">Custom</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Advisory Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}