// src/components/ui/EnhancedHero.js - Updated with better button strategy
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Array of hero text options to cycle through
const heroTextOptions = [
  {
    title: "Elevate Your Investment Decisions",
    subtitle: "Precision financial modeling and advisory solutions for investors."
  },
  {
    title: "Data-Driven Investment Analysis",
    subtitle: "Unlock powerful insights with models designed for modern investors."
  },
  {
    title: "Strategic Investment Clarity",
    subtitle: "Transform complex financial data into actionable intelligence."
  }
];

export default function EnhancedHero() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Cycle through text options
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentTextIndex((prevIndex) => 
          prevIndex === heroTextOptions.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 500);
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background image with CSS background approach */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/images/home/home-hero.jpg)' }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 to-navy-900/60 z-10"></div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Abstract grid pattern */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${i * 10}%`, opacity: 0.1 + (i * 0.02) }}></div>
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${i * 10}%`, opacity: 0.1 + (i * 0.02) }}></div>
          ))}
        </div>
      </div>
      
      {/* Main content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center relative z-20">
        <motion.div
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight mb-6 text-white">
            {heroTextOptions[currentTextIndex].title}
          </h1>
        </motion.div>
        
        <motion.div
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto">
            {heroTextOptions[currentTextIndex].subtitle}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <Link 
            href="/models" 
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
          >
            See Our Models
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link 
            href="/contact" 
            className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-md hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
          >
            Schedule Consultation
          </Link>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}