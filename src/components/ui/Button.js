import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  href, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  fullWidth = false,
  type = 'button',
  disabled = false,
  loading = false,
  icon = null
}) {
  // Enhanced variant styles with better hover effects
  const variants = {
    primary: 'bg-navy-700 hover:bg-teal-600 text-white shadow-sm hover:shadow-md dark:bg-teal-500 dark:hover:bg-teal-400 transform hover:scale-105 active:scale-95',
    secondary: 'bg-white border border-navy-700 text-navy-700 hover:bg-teal-50 hover:border-teal-600 hover:text-teal-700 shadow-sm hover:shadow-md dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600 transform hover:scale-105 active:scale-95',
    accent: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow-lg transform hover:scale-105 active:scale-95',
    ghost: 'bg-transparent hover:bg-gray-100 text-navy-700 dark:text-gray-300 dark:hover:bg-navy-800 transform hover:scale-105 active:scale-95',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95'
  };
  
  // Enhanced size styles with better touch targets
  const sizes = {
    sm: 'py-2 px-3 text-sm min-h-[36px]', // Improved minimum touch target
    md: 'py-3 px-4 text-base min-h-[44px]', // 44px minimum for mobile
    lg: 'py-4 px-6 text-lg min-h-[52px]'
  };
  
  // Base styles with improved transitions and focus states
  const baseStyles = `
    inline-flex items-center justify-center rounded-lg font-medium 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden
  `;
  
  // Combined styles
  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
  
  const buttonContent = (
    <>
      {loading && (
        <motion.svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </motion.svg>
      )}
      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {/* Ripple effect overlay */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-lg"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
  
  // Return as link or button
  if (href && !disabled) {
    return (
      <Link href={href} className={buttonStyles} aria-disabled={disabled}>
        {buttonContent}
      </Link>
    );
  }
  
  return (
    <motion.button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {buttonContent}
    </motion.button>
  );
}