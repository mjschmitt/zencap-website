// src/components/spa/OptimizedMotion.js - Performance-optimized Framer Motion
import { useState, useEffect, createContext, useContext } from 'react';
import { LazyMotion, domMax, m } from 'framer-motion';
import { useSpa } from './SpaRouter';

const MotionContext = createContext({
  isMotionEnabled: true,
  motionPreference: 'full',
  toggleMotion: () => {},
  getOptimizedVariants: () => ({})
});

export const useOptimizedMotion = () => useContext(MotionContext);

// Optimized animation variants for different performance levels
const ANIMATION_VARIANTS = {
  // Full motion - for high-performance devices
  full: {
    pageTransition: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.95 }
    },
    cardHover: {
      rest: { scale: 1, y: 0 },
      hover: { scale: 1.02, y: -8, transition: { type: "spring", stiffness: 400 } }
    },
    fadeIn: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 }
    }
  },
  
  // Reduced motion - for medium-performance devices
  reduced: {
    pageTransition: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    cardHover: {
      rest: { scale: 1 },
      hover: { scale: 1.01 }
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    }
  },
  
  // Minimal motion - for low-performance devices or accessibility
  minimal: {
    pageTransition: {
      initial: { opacity: 0.8 },
      animate: { opacity: 1 },
      exit: { opacity: 0.8 }
    },
    cardHover: {
      rest: {},
      hover: {}
    },
    fadeIn: {
      initial: { opacity: 0.9 },
      animate: { opacity: 1 }
    }
  }
};

// Performance detection
const detectDevicePerformance = () => {
  // Check for reduced motion preference first
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return 'minimal';
  }

  // Detect device capabilities
  if (typeof navigator !== 'undefined') {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;

    // High-performance indicators
    const isHighPerf = hardwareConcurrency >= 8 && memory >= 8;
    const isGoodConnection = connection ? connection.effectiveType === '4g' : true;

    // Low-performance indicators
    const isLowPerf = hardwareConcurrency <= 2 || memory <= 2;
    const isSlowConnection = connection ? ['slow-2g', '2g', '3g'].includes(connection.effectiveType) : false;

    if (isLowPerf || isSlowConnection) return 'minimal';
    if (isHighPerf && isGoodConnection) return 'full';
    return 'reduced';
  }

  return 'reduced'; // Conservative default
};

export default function OptimizedMotion({ children, forceMode = null }) {
  const { isSpaMode } = useSpa();
  const [motionPreference, setMotionPreference] = useState('reduced');
  const [isMotionEnabled, setIsMotionEnabled] = useState(true);

  // Detect optimal motion level on mount
  useEffect(() => {
    if (forceMode) {
      setMotionPreference(forceMode);
      return;
    }

    const detected = detectDevicePerformance();
    setMotionPreference(detected);
    setIsMotionEnabled(detected !== 'minimal');

    // Listen for changes in motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = () => {
        if (mediaQuery.matches) {
          setMotionPreference('minimal');
          setIsMotionEnabled(false);
        } else if (!forceMode) {
          const newPreference = detectDevicePerformance();
          setMotionPreference(newPreference);
          setIsMotionEnabled(newPreference !== 'minimal');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [forceMode]);

  const getOptimizedVariants = (animationType) => {
    return ANIMATION_VARIANTS[motionPreference][animationType] || {};
  };

  const getOptimizedTransition = (baseTransition = {}) => {
    switch (motionPreference) {
      case 'full':
        return {
          type: "spring",
          stiffness: 400,
          damping: 30,
          ...baseTransition
        };
      case 'reduced':
        return {
          duration: 0.2,
          ease: "easeOut",
          ...baseTransition
        };
      case 'minimal':
        return {
          duration: 0.1,
          ...baseTransition
        };
      default:
        return baseTransition;
    }
  };

  const toggleMotion = () => {
    setIsMotionEnabled(!isMotionEnabled);
    if (isMotionEnabled) {
      setMotionPreference('minimal');
    } else {
      setMotionPreference(detectDevicePerformance());
    }
  };

  const contextValue = {
    isMotionEnabled,
    motionPreference,
    toggleMotion,
    getOptimizedVariants,
    getOptimizedTransition,
    isSpaMode
  };

  return (
    <MotionContext.Provider value={contextValue}>
      {isMotionEnabled && isSpaMode ? (
        <LazyMotion features={domMax} strict>
          {children}
        </LazyMotion>
      ) : (
        children
      )}
    </MotionContext.Provider>
  );
}

// Optimized motion components
export const OptimizedMotionDiv = ({ children, animation = 'fadeIn', ...props }) => {
  const { getOptimizedVariants, getOptimizedTransition, isMotionEnabled } = useOptimizedMotion();
  
  if (!isMotionEnabled) {
    return <div {...props}>{children}</div>;
  }

  const variants = getOptimizedVariants(animation);
  
  return (
    <m.div
      variants={variants}
      initial="initial"
      animate="animate"
      transition={getOptimizedTransition()}
      {...props}
    >
      {children}
    </m.div>
  );
};

export const OptimizedMotionCard = ({ children, ...props }) => {
  const { getOptimizedVariants, isMotionEnabled } = useOptimizedMotion();
  
  if (!isMotionEnabled) {
    return <div {...props}>{children}</div>;
  }

  const variants = getOptimizedVariants('cardHover');
  
  return (
    <m.div
      variants={variants}
      initial="rest"
      whileHover="hover"
      {...props}
    >
      {children}
    </m.div>
  );
};

// Hook for custom motion components
export function useMotionConfig() {
  const { 
    getOptimizedVariants, 
    getOptimizedTransition, 
    isMotionEnabled, 
    motionPreference 
  } = useOptimizedMotion();

  const createMotionProps = (animationType, customTransition = {}) => {
    if (!isMotionEnabled) return {};
    
    return {
      variants: getOptimizedVariants(animationType),
      transition: getOptimizedTransition(customTransition),
      initial: "initial",
      animate: "animate"
    };
  };

  return {
    isMotionEnabled,
    motionPreference,
    createMotionProps,
    getOptimizedVariants,
    getOptimizedTransition
  };
}

// Performance monitoring for animations
export function useAnimationPerformance() {
  const [frameRate, setFrameRate] = useState(60);
  const [isPerformanceGood, setIsPerformanceGood] = useState(true);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const measureFrameRate = (currentTime) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const currentFrameRate = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFrameRate(currentFrameRate);
        setIsPerformanceGood(currentFrameRate >= 30); // 30 FPS minimum
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFrameRate);
    };

    animationId = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return { frameRate, isPerformanceGood };
}