// src/components/ui/EnhancedTestimonials.js - Fixed quotes and img tag
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Platform achievements and value propositions - rotating showcase
const TESTIMONIALS = [
  {
    id: 1,
    quote: "Save 100+ hours per deal with institutional-grade financial models that are ready to use out of the box.",
    name: "Time Efficiency",
    title: "Average time saved per transaction",
    avatar: null,
    rating: 5
  },
  {
    id: 2,
    quote: "Professional models used for transactions totaling over $500M in real estate and private equity deals.",
    name: "Proven Track Record",
    title: "Cumulative deal value analyzed",
    avatar: null,
    rating: 5
  },
  {
    id: 3,
    quote: "One-time purchase with lifetime updates. No subscriptions, no hidden fees. Full model ownership.",
    name: "Transparent Pricing",
    title: "100% ownership of your models",
    avatar: null,
    rating: 5
  },
  {
    id: 4,
    quote: "Built by finance professionals with experience at top investment banks and private equity firms.",
    name: "Industry Expertise",
    title: "Created by Wall Street veterans",
    avatar: null,
    rating: 5
  },
  {
    id: 5,
    quote: "7-day money-back guarantee. If our models don't meet your expectations, get a full refund.",
    name: "Risk-Free Purchase",
    title: "100% satisfaction guarantee",
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
        
        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Container */}
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-xl p-2 overflow-hidden">
            {/* Large quote icon */}
            <div className="absolute top-6 left-6 text-teal-100 dark:text-teal-900 opacity-40 pointer-events-none">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
            </div>
            
            <div className="relative pl-16 pr-8 py-12 min-h-[300px]">
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
                  className="absolute inset-0 flex flex-col justify-center p-16"
                >
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-teal-500' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <p className="text-xl text-gray-700 dark:text-gray-200 italic leading-relaxed mb-6">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  
                  <div className="flex items-center mt-auto">
                    <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-teal-700 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-navy-700 dark:text-white text-lg">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Navigation controls */}
          <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 px-4">
            <button
              onClick={prevTestimonial}
              className="bg-white dark:bg-navy-700 rounded-full shadow-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transform transition hover:scale-110"
              aria-label="Previous testimonial"
            >
              <svg className="h-6 w-6 text-navy-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextTestimonial}
              className="bg-white dark:bg-navy-700 rounded-full shadow-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transform transition hover:scale-110"
              aria-label="Next testimonial"
            >
              <svg className="h-6 w-6 text-navy-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Testimonial indicators */}
        <div className="flex justify-center mt-8">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 mx-1 rounded-full transition-all focus:outline-none ${
                index === currentIndex 
                  ? 'w-8 bg-teal-500' 
                  : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Key metrics */}
        <div className="mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">13+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Professional Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">100+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hours Saved Per Deal</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">$500M+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Deals Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">7-Day</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Money-Back Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}