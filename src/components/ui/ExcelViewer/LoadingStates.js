import React from 'react';
import { motion } from 'framer-motion';

const LoadingStates = {
  // Main file loading state with progress
  FileLoading: ({ progress = 0, stage = 'initializing', fileName = 'Excel File', darkMode = false }) => {
    const stages = {
      initializing: 'Initializing...',
      downloading: 'Downloading file...',
      parsing: 'Parsing spreadsheet...',
      rendering: 'Rendering data...'
    };

    return (
      <div className={`flex items-center justify-center h-full p-8 ${
        darkMode ? 'bg-navy-900' : 'bg-gray-50'
      }`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Excel icon with animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 mb-4"
            >
              <svg 
                className={`w-16 h-16 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`} 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19H8V15H12M8,8H12V12H8V8M17,12H13V8H17V12M13,13H17V19H13V13Z" />
              </svg>
            </motion.div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-navy-800'
            }`}>
              Loading {fileName}
            </h3>
            
            <p className={`text-sm mb-6 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {stages[stage] || 'Processing...'}
            </p>
          </div>
          
          {/* Progress bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-navy-700' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`h-full rounded-full ${
                darkMode ? 'bg-teal-400' : 'bg-teal-500'
              }`}
            />
          </div>
          
          <p className={`text-center mt-2 text-sm ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {progress}%
          </p>
          
          {/* Loading tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className={`mt-8 p-4 rounded-lg ${
              darkMode ? 'bg-navy-800 border border-navy-700' : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-navy-700'
            }`}>
              <span className="font-medium">Pro tip:</span> Large Excel files may take a moment to load. 
              Once loaded, you can navigate between sheets instantly.
            </p>
          </motion.div>
        </div>
      </div>
    );
  },

  // Sheet loading skeleton
  SheetLoading: ({ darkMode = false }) => (
    <div className={`flex items-center justify-center h-full p-8 ${
      darkMode ? 'bg-navy-900' : 'bg-gray-50'
    }`}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            darkMode ? 'border-teal-400' : 'border-teal-500'
          }`}></div>
        </div>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Loading spreadsheet viewer...
        </p>
      </div>
    </div>
  ),

  // Table skeleton for smooth transitions
  TableSkeleton: ({ rows = 10, cols = 5, darkMode = false }) => (
    <div className="p-4">
      <div className="space-y-2">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-2">
            {[...Array(cols)].map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-8 rounded animate-pulse ${
                  darkMode ? 'bg-navy-800' : 'bg-gray-200'
                }`}
                style={{ 
                  width: colIndex === 0 ? '60px' : `${100 + Math.random() * 100}px`,
                  animationDelay: `${(rowIndex + colIndex) * 0.05}s`
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  ),

  // Cell loading placeholder
  CellSkeleton: ({ darkMode = false }) => (
    <div className={`animate-pulse rounded ${
      darkMode ? 'bg-navy-800' : 'bg-gray-200'
    }`} />
  )
};

export default LoadingStates;