import React, { useEffect, useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast context for managing multiple toasts
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  darkMode = false 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!isVisible) {
      const closeTimer = setTimeout(onClose, 300);
      return () => clearTimeout(closeTimer);
    }
  }, [isVisible, onClose]);

  const getToastStyles = () => {
    const baseStyles = 'px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3';
    
    if (darkMode) {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-teal-900/90 text-teal-100 border border-teal-700`;
        case 'error':
          return `${baseStyles} bg-red-900/90 text-red-100 border border-red-700`;
        case 'warning':
          return `${baseStyles} bg-yellow-900/90 text-yellow-100 border border-yellow-700`;
        default:
          return `${baseStyles} bg-navy-800/90 text-gray-100 border border-navy-600`;
      }
    } else {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-teal-50 text-teal-800 border border-teal-200`;
        case 'error':
          return `${baseStyles} bg-red-50 text-red-800 border border-red-200`;
        case 'warning':
          return `${baseStyles} bg-yellow-50 text-yellow-800 border border-yellow-200`;
        default:
          return `${baseStyles} bg-white text-navy-800 border border-gray-200`;
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={isVisible ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={getToastStyles()}
      role="alert"
      aria-live="polite"
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};