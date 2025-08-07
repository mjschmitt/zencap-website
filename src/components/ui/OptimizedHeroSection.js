// src/components/ui/OptimizedHeroSection.js - Reusable optimized hero component
import Image from 'next/image';
import { motion } from 'framer-motion';

const OptimizedHeroSection = ({ 
  backgroundImage, 
  title, 
  subtitle, 
  children, 
  className = "",
  overlay = "from-navy-900/80 to-navy-900/60",
  priority = false,
  quality = 85,
  minHeight = "min-h-[60vh]"
}) => {
  return (
    <section className={`relative text-white overflow-hidden ${minHeight} flex items-center ${className}`}>
      {/* Background image with optimized Next.js Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={`${title} Background`}
          fill
          className="object-cover"
          priority={priority}
          sizes="100vw"
          quality={quality}
        />
        {/* Gradient overlay for better text readability */}
        <div className={`absolute inset-0 bg-gradient-to-r ${overlay} z-10`}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-20 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-6 text-white">
            {title}
          </h1>
        </motion.div>
        
        {subtitle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              {subtitle}
            </p>
          </motion.div>
        )}
        
        {children && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default OptimizedHeroSection;