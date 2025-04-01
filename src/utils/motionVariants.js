// src/utils/motionVariants.js - New file with transition variants
export const pageVariants = {
    default: {
      initial: { opacity: 0, y: 20 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -20 },
    },
    fade: {
      initial: { opacity: 0 },
      in: { opacity: 1 },
      out: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 30 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -30 },
    },
    slideLeft: {
      initial: { opacity: 0, x: 30 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: -30 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      in: { opacity: 1, scale: 1 },
      out: { opacity: 0, scale: 1.05 },
    }
  };
  
  export const transitionPresets = {
    default: {
      type: 'tween',
      ease: 'anticipate',
      duration: 0.4
    },
    smooth: {
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.5
    },
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    },
    slow: {
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.8
    }
  };