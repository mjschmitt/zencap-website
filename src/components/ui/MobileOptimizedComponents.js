/**
 * Mobile-Optimized Components for Zenith Capital Advisors
 * Head of Frontend Engineering - Premium mobile experience
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Mobile-first touch-optimized button
export const TouchOptimizedButton = ({ 
  children, 
  onClick, 
  href, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Touch target sizes (minimum 44px)
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-6 py-4 text-base min-h-[48px] min-w-[48px]',
    lg: 'px-8 py-5 text-lg min-h-[52px] min-w-[52px]'
  };

  const variantClasses = {
    primary: 'bg-navy-700 hover:bg-navy-800 active:bg-navy-900 text-white shadow-lg',
    secondary: 'bg-white border-2 border-navy-700 hover:bg-navy-50 active:bg-navy-100 text-navy-700 shadow-md',
    accent: 'bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white shadow-lg',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-navy-700'
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-xl font-semibold
    focus:outline-none focus:ring-4 focus:ring-teal-500/30 
    transition-all duration-200 ease-out transform
    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
    active:scale-95 hover:scale-[1.02]
    relative overflow-hidden
    ${fullWidth ? 'w-full' : ''}
  `;

  const buttonContent = (
    <>
      {loading && (
        <motion.div
          className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      {icon && !loading && (
        <span className="mr-2 flex-shrink-0">{icon}</span>
      )}
      <span className="flex-1">{children}</span>
      
      {/* Touch ripple effect */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-xl"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </>
  );

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);
  const handleClick = (e) => {
    if (disabled || loading) return;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick?.(e);
  };

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href && !disabled) {
    return (
      <Link 
        href={href} 
        className={buttonClasses}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || loading}
      type="button"
    >
      {buttonContent}
    </button>
  );
};

// Mobile-optimized card component
export const MobileOptimizedCard = ({ 
  children, 
  className = '', 
  interactive = false,
  onClick,
  href,
  darkMode = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = `
    rounded-2xl shadow-lg border transition-all duration-200
    ${darkMode ? 'bg-navy-800 border-navy-700' : 'bg-white border-gray-200'}
    ${interactive ? 'cursor-pointer hover:shadow-xl active:shadow-md transform hover:scale-[1.02] active:scale-[0.98]' : ''}
    ${isPressed ? 'shadow-md scale-[0.98]' : ''}
  `;

  const handleTouchStart = () => interactive && setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);
  const handleClick = (e) => {
    if (!interactive) return;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick?.(e);
  };

  const cardContent = (
    <div 
      className={`${baseClasses} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
    </div>
  );

  if (href && interactive) {
    return (
      <Link href={href}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

// Mobile-optimized input component
export const TouchOptimizedInput = ({ 
  label, 
  error, 
  helpText,
  className = '',
  darkMode = false,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputClasses = `
    w-full px-4 py-4 rounded-xl border-2 text-base min-h-[44px]
    focus:outline-none focus:ring-0 transition-all duration-200
    ${error 
      ? 'border-red-500 focus:border-red-600' 
      : isFocused
        ? 'border-teal-500'
        : darkMode
          ? 'border-navy-600 bg-navy-800 text-white'
          : 'border-gray-300 bg-white'
    }
    ${darkMode 
      ? 'placeholder-gray-400' 
      : 'placeholder-gray-500'
    }
  `;

  return (
    <div className={className}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      
      <input
        {...props}
        className={inputClasses}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
      
      {helpText && !error && (
        <p className={`text-sm mt-1 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {helpText}
        </p>
      )}
    </div>
  );
};

// Mobile navigation component
export const MobileNavigation = ({ 
  items = [], 
  activeItem,
  onItemChange,
  darkMode = false 
}) => {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${
      darkMode ? 'bg-navy-800 border-navy-700' : 'bg-white border-gray-200'
    } border-t shadow-lg`}>
      <div className="flex items-center justify-around py-2">
        {items.map((item, index) => {
          const isActive = activeItem === item.id;
          return (
            <TouchOptimizedButton
              key={item.id}
              onClick={() => onItemChange?.(item.id)}
              href={item.href}
              variant="ghost"
              className={`flex-1 flex flex-col items-center py-2 min-h-[60px] ${
                isActive 
                  ? darkMode ? 'text-teal-400' : 'text-teal-600'
                  : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </TouchOptimizedButton>
          );
        })}
      </div>
    </div>
  );
};

// Mobile-optimized modal/sheet
export const MobileSheet = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  darkMode = false 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl max-h-[90vh] ${
              darkMode ? 'bg-navy-800' : 'bg-white'
            }`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className={`w-12 h-1 rounded-full ${
                darkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`} />
            </div>
            
            {/* Content */}
            <div className="px-6 pb-6 overflow-y-auto">
              {title && (
                <h2 className={`text-xl font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h2>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile-optimized loading skeleton
export const MobileLoadingSkeleton = ({ 
  lines = 3, 
  avatar = false,
  darkMode = false 
}) => {
  return (
    <div className="animate-pulse">
      <div className="flex items-start space-x-4">
        {avatar && (
          <div className={`w-12 h-12 rounded-full ${
            darkMode ? 'bg-navy-700' : 'bg-gray-300'
          }`} />
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`h-4 rounded ${
                darkMode ? 'bg-navy-700' : 'bg-gray-300'
              }`}
              style={{ 
                width: i === lines - 1 ? '75%' : '100%' 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Touch-optimized toggle switch
export const TouchToggleSwitch = ({ 
  checked, 
  onChange, 
  label, 
  size = 'md',
  darkMode = false 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7', 
    lg: 'w-14 h-8'
  };
  
  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <label className="flex items-center space-x-3 cursor-pointer select-none min-h-[44px]">
      <div className={`relative ${sizeClasses[size]}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <motion.div
          className={`w-full h-full rounded-full border-2 transition-colors ${
            checked 
              ? 'bg-teal-500 border-teal-500' 
              : darkMode 
                ? 'bg-navy-700 border-navy-600'
                : 'bg-gray-300 border-gray-300'
          }`}
          animate={{
            backgroundColor: checked ? '#14b8a6' : darkMode ? '#374151' : '#d1d5db'
          }}
        />
        <motion.div
          className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow-md ${
            thumbSizeClasses[size]
          }`}
          animate={{
            x: checked ? `calc(100% + 4px)` : 0
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      {label && (
        <span className={`text-sm font-medium ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default {
  TouchOptimizedButton,
  MobileOptimizedCard,
  TouchOptimizedInput,
  MobileNavigation,
  MobileSheet,
  MobileLoadingSkeleton,
  TouchToggleSwitch
};
