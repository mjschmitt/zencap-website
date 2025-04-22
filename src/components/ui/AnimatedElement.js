// src/components/ui/AnimatedElement.js
import { useEffect, useRef, useState } from 'react';

export default function AnimatedElement({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.1,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    const currentRef = elementRef.current; // Store current value
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect(); // No need to check ref again
    };
  }, [threshold]);

  const animations = {
    'fade-in': 'opacity-0 transition-opacity',
    'fade-up': 'opacity-0 translate-y-8 transition-all',
    'fade-down': 'opacity-0 -translate-y-8 transition-all',
    'fade-left': 'opacity-0 translate-x-8 transition-all',
    'fade-right': 'opacity-0 -translate-x-8 transition-all',
    'zoom-in': 'opacity-0 scale-95 transition-all',
    'zoom-out': 'opacity-0 scale-105 transition-all',
  };

  const baseAnimation = animations[animation] || animations['fade-in'];
  
  const animationStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : '',
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={elementRef}
      className={`${baseAnimation} ${className}`}
      style={animationStyle}
    >
      {children}
    </div>
  );
}