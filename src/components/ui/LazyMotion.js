// src/components/ui/LazyMotion.js - Lazy-loaded animation component
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion only when needed
const motion = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.motion })),
  { ssr: false }
);

const LazyMotion = ({ 
  children, 
  animation = 'fade', 
  direction = 'up', 
  delay = 0, 
  duration = 0.6,
  className = '',
  threshold = 0.1,
  triggerOnce = true,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef(null);

  // Intersection Observer for performance
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setIsLoaded(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  // Animation variants based on props
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
      scale: animation === 'scale' ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: 'easeOut'
      }
    }
  };

  // Fallback for when motion is not loaded
  if (!isLoaded) {
    return (
      <div ref={ref} className={`transition-opacity duration-300 ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default LazyMotion;