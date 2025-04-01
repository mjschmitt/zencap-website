// src/components/PageTransitions.js - Updated with variants
import { motion } from 'framer-motion';
import { pageVariants, transitionPresets } from '@/utils/motionVariants';

export default function PageTransition({ 
  children, 
  variant = 'default',
  transitionPreset = 'default',
  customVariants = null,
  customTransition = null
}) {
  // Use custom variants/transition if provided, otherwise use preset
  const variants = customVariants || pageVariants[variant];
  const transition = customTransition || transitionPresets[transitionPreset];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}