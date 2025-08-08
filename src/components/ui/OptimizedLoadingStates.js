/**
 * Optimized Loading States for Zenith Capital Advisors
 * Head of Frontend Engineering - Enhanced UX for premium models
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OptimizedLoadingStates = {
  // Premium Excel Model Loading
  ExcelModelLoading: ({ 
    progress = 0, 
    stage = 'initializing', 
    fileName = '', 
    darkMode = false,
    onCancel 
  }) => {
    const [dots, setDots] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');

    // Animate loading dots
    useEffect(() => {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }, []);

    // Calculate estimated time based on stage and progress
    useEffect(() => {
      const estimates = {
        'initializing': '2-3 seconds',
        'downloading': '5-10 seconds', 
        'parsing': '10-15 seconds',
        'processing': '15-30 seconds',
        'rendering': '5-10 seconds',
        'finalizing': '2-3 seconds'
      };
      setEstimatedTime(estimates[stage] || '< 1 minute');
    }, [stage]);

    const getStageMessage = () => {
      const messages = {
        'initializing': 'Preparing to load your financial model',
        'downloading': 'Downloading Excel file securely',
        'parsing': 'Analyzing spreadsheet structure', 
        'processing': 'Processing formulas and data',
        'rendering': 'Preparing premium viewer',
        'finalizing': 'Almost ready'
      };
      return messages[stage] || 'Loading premium financial model';
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-[400px] flex items-center justify-center p-8 ${darkMode ? 'bg-navy-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}
      >
        <div className="max-w-md w-full text-center">
          {/* Premium Loading Animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`relative w-24 h-24 mx-auto mb-6 rounded-full ${
              darkMode ? 'bg-navy-800' : 'bg-white'
            } shadow-lg flex items-center justify-center`}>
              {/* Rotating Excel Icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className={`w-12 h-12 ${darkMode ? 'text-teal-400' : 'text-green-600'}`}
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  <path d="M10.5,11L11.5,15.5L12.5,11H14.5L12.75,18H10.25L9.5,14.5L8.75,18H6.25L4.5,11H6.5L7.5,15.5L8.5,11H10.5Z" />
                </svg>
              </motion.div>
              
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="4"
                  fill="none"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={darkMode ? '#14b8a6' : '#059669'}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    strokeDasharray: '251.2',
                    strokeDashoffset: 251.2 * (1 - progress / 100)
                  }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Progress Info */}
          <div className="space-y-3">
            <h3 className={`text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-navy-800'
            }`}>
              Loading Financial Model
            </h3>
            
            {fileName && (
              <p className={`text-sm font-medium ${
                darkMode ? 'text-teal-300' : 'text-teal-600'
              }`}>
                {fileName}
              </p>
            )}
            
            <div className="space-y-2">
              <p className={`text-base ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {getStageMessage()}{dots}
              </p>
              
              <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${
                darkMode ? 'bg-navy-700' : 'bg-gray-200'
              }`}>
                <motion.div
                  className="bg-gradient-to-r from-teal-500 to-blue-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(progress, 5)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {Math.round(progress)}% complete
                </span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Est. {estimatedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="mt-6 flex justify-center space-x-2">
            {['initializing', 'downloading', 'parsing', 'processing', 'rendering', 'finalizing'].map((s, index) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s === stage
                    ? 'bg-teal-500 scale-125'
                    : index < ['initializing', 'downloading', 'parsing', 'processing', 'rendering', 'finalizing'].indexOf(stage)
                    ? darkMode ? 'bg-teal-600' : 'bg-teal-400'
                    : darkMode ? 'bg-navy-700' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <motion.button
              onClick={onCancel}
              className={`mt-6 px-4 py-2 text-sm font-medium rounded-lg border transition-colors min-h-[44px] ${
                darkMode 
                  ? 'border-navy-600 text-gray-400 hover:text-white hover:border-gray-400'
                  : 'border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel Loading
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  },

  // Skeleton loader for table data
  TableSkeleton: ({ rows = 5, cols = 4, darkMode = false }) => (
    <div className={`space-y-3 p-4 ${
      darkMode ? 'bg-navy-900' : 'bg-white'
    }`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-3">
          {Array.from({ length: cols }).map((_, j) => (
            <motion.div
              key={j}
              className={`h-8 rounded ${
                darkMode ? 'bg-navy-700' : 'bg-gray-200'
              }`}
              style={{ width: `${Math.random() * 40 + 60}%` }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: (i * cols + j) * 0.1
              }}
            />
          ))}
        </div>
      ))}
    </div>
  ),

  // Button loading state
  ButtonLoading: ({ text = 'Loading...', size = 'md', darkMode = false }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5', 
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center justify-center space-x-2">
        <motion.svg
          className={`${sizeClasses[size]} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </motion.svg>
        <span>{text}</span>
      </div>
    );
  },

  // Page loading overlay
  PageLoadingOverlay: ({ darkMode = false }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        darkMode ? 'bg-navy-900/90' : 'bg-white/90'
      }`}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="text-center">
        <motion.div
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-teal-400' : 'text-navy-700'
          }`}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity }
          }}
        >
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </motion.div>
        <h3 className={`text-xl font-semibold ${
          darkMode ? 'text-white' : 'text-navy-800'
        }`}>
          Loading Zenith Capital
        </h3>
        <p className={`mt-2 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Preparing your premium financial experience
        </p>
      </div>
    </motion.div>
  )
};

export default OptimizedLoadingStates;
