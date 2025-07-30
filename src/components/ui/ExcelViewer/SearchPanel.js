import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchPanel = ({ 
  onSearch, 
  onClose, 
  onNavigate, 
  currentIndex = 0, 
  totalResults = 0,
  darkMode = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    await onSearch(searchQuery);
    setIsSearching(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
        e.preventDefault();
        onNavigate('next');
      } else if (e.shiftKey && e.key === 'F3') {
        e.preventDefault();
        onNavigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className={`absolute top-0 left-0 right-0 z-20 p-4 ${
          darkMode ? 'bg-navy-800/95' : 'bg-white/95'
        } backdrop-blur-sm border-b ${
          darkMode ? 'border-navy-700' : 'border-gray-200'
        } shadow-lg`}
      >
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* Search icon */}
            <div className={`p-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Search input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in spreadsheet..."
              className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-navy-700 text-white placeholder-gray-400 focus:ring-teal-400' 
                  : 'bg-gray-100 text-navy-900 placeholder-gray-500 focus:ring-teal-500'
              }`}
              aria-label="Search in spreadsheet"
            />

            {/* Search button */}
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode
                  ? 'bg-teal-500 text-white hover:bg-teal-600 disabled:bg-navy-700 disabled:text-gray-500'
                  : 'bg-navy-700 text-white hover:bg-navy-800 disabled:bg-gray-200 disabled:text-gray-400'
              }`}
              aria-label="Search"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </button>

            {/* Navigation buttons */}
            {totalResults > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onNavigate('prev')}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-navy-900'
                  }`}
                  aria-label="Previous result"
                  title="Previous result (Shift+F3)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className={`text-sm font-medium px-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {currentIndex + 1} / {totalResults}
                </span>
                
                <button
                  type="button"
                  onClick={() => onNavigate('next')}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-navy-900'
                  }`}
                  aria-label="Next result"
                  title="Next result (F3 or Ctrl+G)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-navy-900'
              }`}
              aria-label="Close search"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search options */}
          <div className="flex items-center space-x-4 mt-3 text-sm">
            <label className={`flex items-center space-x-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <input type="checkbox" className="rounded" />
              <span>Match case</span>
            </label>
            
            <label className={`flex items-center space-x-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <input type="checkbox" className="rounded" />
              <span>Whole words</span>
            </label>
            
            <label className={`flex items-center space-x-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <input type="checkbox" className="rounded" />
              <span>Use regex</span>
            </label>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchPanel;