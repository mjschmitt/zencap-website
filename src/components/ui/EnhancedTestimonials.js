// src/components/ui/EnhancedTestimonials.js - Fixed quotes and img tag
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Sample testimonial data - replace with your actual testimonials
const TESTIMONIALS = [
  {
    id: 1,
    quote: "Zenith's financial models gave us the analytical edge we needed to close our latest acquisition. Their attention to detail is unmatched.",
    name: "Sarah Johnson",
    title: "Investment Director, Artemis Partners",
    avatar: null, // In a real implementation, add an image path here
    rating: 5
  },
  {
    id: 2,
    quote: "The custom model Zenith built for our portfolio valuation has become an essential part of our investment process. Worth every penny.",
    name: "Michael Chen",
    title: "Managing Partner, Horizon Capital",
    avatar: null,
    rating: 5
  },
  {
    id: 3,
    quote: "Working with Zenith transformed our approach to deal evaluation. Their team delivered exactly what we needed, on time and on budget.",
    name: "David Rodriguez",
    title: "VP of Acquisitions, Summit Equity",
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
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 text-center max-w-2xl mx-auto">
            Trusted by investment professionals worldwide to deliver analytical precision and strategic insight
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
                      {testimonial.avatar ? (
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          <Image 
                            src={testimonial.avatar} 
                            alt={testimonial.name} 
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-teal-700 dark:text-teal-300 font-semibold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      )}
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
        
        {/* Client logos */}
        <div className="mt-16">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
            TRUSTED BY LEADING INVESTMENT FIRMS
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            {/* In a real implementation, replace these divs with actual client logos */}
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">CLIENT LOGO</span>
            </div>
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">CLIENT LOGO</span>
            </div>
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">CLIENT LOGO</span>
            </div>
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">CLIENT LOGO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}