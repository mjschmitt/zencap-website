// src/components/ui/FeaturesShowcase.js
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function FeaturesShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-900 z-0" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <motion.div 
          className="absolute h-64 w-64 rounded-full bg-teal-500/30 blur-3xl"
          animate={{
            x: ['-20%', '120%'],
            y: ['10%', '40%']
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
        <motion.div 
          className="absolute h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
          animate={{
            x: ['100%', '0%'],
            y: ['60%', '30%']
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      </div>
      
      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 md:p-4">
          <div className="bg-navy-800/80 rounded-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Text content */}
              <div>
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Ready to transform your investment process?
                </motion.h2>
                
                <motion.p 
                  className="text-gray-300 text-lg mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Join leading investment firms who&apos;ve enhanced their decision-making with our financial models and advisory services.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      href="/contact"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className="relative inline-flex group"
                    >
                      <div className={`absolute -inset-0.5 bg-gradient-to-r from-teal-600 to-teal-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 ${isHovered ? 'animate-pulse' : ''}`}></div>
                      <button className="relative px-8 py-4 bg-teal-500 rounded-lg leading-none flex items-center text-white font-semibold">
                        Schedule a Consultation
                        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </Link>
                    <Link href="/models" className="px-8 py-4 bg-transparent border border-white/30 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300">
                      Explore Our Models
                    </Link>
                  </div>
                </motion.div>
              </div>
              
              {/* Stats/metrics */}
              <div className="grid grid-cols-2 gap-6">
                <motion.div 
                  className="bg-white/10 backdrop-blur rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <p className="text-teal-300 text-4xl font-bold mb-2">95%</p>
                  <p className="text-white text-sm">Client retention rate</p>
                </motion.div>
                <motion.div 
                  className="bg-white/10 backdrop-blur rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <p className="text-teal-300 text-4xl font-bold mb-2">50+</p>
                  <p className="text-white text-sm">Asset managers served</p>
                </motion.div>
                <motion.div 
                  className="bg-white/10 backdrop-blur rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <p className="text-teal-300 text-4xl font-bold mb-2">24hr</p>
                  <p className="text-white text-sm">Average response time</p>
                </motion.div>
                <motion.div 
                  className="bg-white/10 backdrop-blur rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <p className="text-teal-300 text-4xl font-bold mb-2">$2T+</p>
                  <p className="text-white text-sm">Assets modeled</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}