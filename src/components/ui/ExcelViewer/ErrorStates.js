import React from 'react';
import { motion } from 'framer-motion';

const ErrorStates = {
  // File load error with retry option
  FileLoadError: ({ error, onRetry, darkMode = false }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-center h-full p-8 ${
        darkMode ? 'bg-navy-900' : 'bg-gray-50'
      }`}
    >
      <div className="text-center max-w-md">
        {/* Error icon */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 mb-6"
        >
          <div className={`rounded-full p-4 ${
            darkMode ? 'bg-red-900/20' : 'bg-red-100'
          }`}>
            <svg 
              className={`w-12 h-12 ${darkMode ? 'text-red-400' : 'text-red-500'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </motion.div>
        
        <h3 className={`text-xl font-semibold mb-3 ${
          darkMode ? 'text-white' : 'text-navy-800'
        }`}>
          Unable to Load Excel File
        </h3>
        
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {error || 'An unexpected error occurred while loading the file.'}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
              darkMode 
                ? 'bg-teal-500 text-white hover:bg-teal-600' 
                : 'bg-navy-700 text-white hover:bg-navy-800'
            }`}
          >
            Try Again
          </button>
          
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            If the problem persists, please contact support.
          </p>
        </div>
      </div>
    </motion.div>
  ),

  // Network error
  NetworkError: ({ onRetry, darkMode = false }) => (
    <div className={`flex items-center justify-center h-full p-8 ${
      darkMode ? 'bg-navy-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md">
        <svg 
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" 
          />
        </svg>
        
        <h3 className={`text-lg font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-navy-800'
        }`}>
          Connection Lost
        </h3>
        
        <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Please check your internet connection and try again.
        </p>
        
        <button
          onClick={onRetry}
          className={`px-4 py-2 rounded-lg font-medium ${
            darkMode 
              ? 'bg-teal-500 text-white hover:bg-teal-600' 
              : 'bg-navy-700 text-white hover:bg-navy-800'
          }`}
        >
          Retry
        </button>
      </div>
    </div>
  ),

  // File format error
  FormatError: ({ fileName, darkMode = false }) => (
    <div className={`flex items-center justify-center h-full p-8 ${
      darkMode ? 'bg-navy-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md">
        <svg 
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-yellow-400' : 'text-yellow-500'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        
        <h3 className={`text-lg font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-navy-800'
        }`}>
          Unsupported File Format
        </h3>
        
        <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {fileName ? `"${fileName}" is not a valid Excel file.` : 'This file format is not supported.'}
        </p>
        
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Please upload a valid .xlsx or .xlsm file.
        </p>
      </div>
    </div>
  ),

  // Permission error
  PermissionError: ({ darkMode = false }) => (
    <div className={`flex items-center justify-center h-full p-8 ${
      darkMode ? 'bg-navy-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md">
        <svg 
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
        
        <h3 className={`text-lg font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-navy-800'
        }`}>
          Access Denied
        </h3>
        
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          You don&apos;t have permission to view this file.
        </p>
      </div>
    </div>
  )
};

export default ErrorStates;