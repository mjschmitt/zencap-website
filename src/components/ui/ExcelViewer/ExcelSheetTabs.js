import React, { memo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ExcelSheetTabs = memo(({ 
  sheets = [], 
  activeSheet = 0, 
  onSheetChange,
  darkMode = false,
  isPrintMode = false
}) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const tabsContainerRef = useRef(null);
  const tabsRef = useRef(null);

  // Check if tabs overflow and need scroll buttons
  useEffect(() => {
    const checkOverflow = () => {
      if (tabsContainerRef.current && tabsRef.current) {
        const containerWidth = tabsContainerRef.current.offsetWidth;
        const tabsWidth = tabsRef.current.scrollWidth;
        setShowScrollButtons(tabsWidth > containerWidth - 100); // Account for navigation buttons
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [sheets]);

  // Scroll to active tab when it changes
  useEffect(() => {
    if (tabsRef.current && sheets[activeSheet]) {
      const activeTabElement = tabsRef.current.children[activeSheet];
      if (activeTabElement) {
        const tabLeft = activeTabElement.offsetLeft;
        const tabWidth = activeTabElement.offsetWidth;
        const containerWidth = tabsContainerRef.current.offsetWidth - 100;
        const currentScroll = tabsRef.current.scrollLeft;

        // Check if tab is out of view
        if (tabLeft < currentScroll || tabLeft + tabWidth > currentScroll + containerWidth) {
          tabsRef.current.scrollTo({
            left: tabLeft - 50,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeSheet, sheets]);

  const handleScroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 150;
      const newScrollLeft = direction === 'left' 
        ? Math.max(0, tabsRef.current.scrollLeft - scrollAmount)
        : tabsRef.current.scrollLeft + scrollAmount;
      
      tabsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleTabClick = (index) => {
    onSheetChange(index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(index);
    }
  };

  // Hide in print mode
  if (isPrintMode) return null;

  return (
    <div 
      ref={tabsContainerRef}
      className={`excel-sheet-tabs flex items-center h-9 px-1 border-t transition-colors ${
        darkMode 
          ? 'bg-navy-800 border-navy-700' 
          : 'bg-gray-100 border-gray-300'
      }`}
      role="tablist"
      aria-label="Worksheet tabs"
    >
      {/* Left scroll button */}
      {showScrollButtons && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className={`flex-shrink-0 p-1 rounded transition-colors ${
            darkMode
              ? 'hover:bg-navy-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Scroll tabs left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Tab navigation buttons (Excel-style) */}
      <div className="flex items-center mr-2">
        <button
          type="button"
          onClick={() => onSheetChange(0)}
          disabled={activeSheet === 0}
          className={`p-0.5 rounded transition-colors ${
            darkMode
              ? 'hover:bg-navy-700 disabled:opacity-50 text-gray-400'
              : 'hover:bg-gray-200 disabled:opacity-50 text-gray-600'
          }`}
          aria-label="First sheet"
          title="First sheet"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onSheetChange(Math.max(0, activeSheet - 1))}
          disabled={activeSheet === 0}
          className={`p-0.5 rounded transition-colors ${
            darkMode
              ? 'hover:bg-navy-700 disabled:opacity-50 text-gray-400'
              : 'hover:bg-gray-200 disabled:opacity-50 text-gray-600'
          }`}
          aria-label="Previous sheet"
          title="Previous sheet"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onSheetChange(Math.min(sheets.length - 1, activeSheet + 1))}
          disabled={activeSheet === sheets.length - 1}
          className={`p-0.5 rounded transition-colors ${
            darkMode
              ? 'hover:bg-navy-700 disabled:opacity-50 text-gray-400'
              : 'hover:bg-gray-200 disabled:opacity-50 text-gray-600'
          }`}
          aria-label="Next sheet"
          title="Next sheet"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onSheetChange(sheets.length - 1)}
          disabled={activeSheet === sheets.length - 1}
          className={`p-0.5 rounded transition-colors ${
            darkMode
              ? 'hover:bg-navy-700 disabled:opacity-50 text-gray-400'
              : 'hover:bg-gray-200 disabled:opacity-50 text-gray-600'
          }`}
          aria-label="Last sheet"
          title="Last sheet"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/>
          </svg>
        </button>
      </div>

      {/* Sheet tabs container */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={tabsRef}
          className="flex items-center space-x-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sheets.map((sheet, index) => (
            <motion.button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === activeSheet}
              aria-controls={`sheet-panel-${index}`}
              aria-label={sheet.name || `Sheet ${index + 1}`}
              tabIndex={index === activeSheet ? 0 : -1}
              onClick={() => handleTabClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex items-center px-4 py-1 text-xs font-medium whitespace-nowrap
                transition-all duration-200 rounded-t-md
                ${index === activeSheet
                  ? darkMode
                    ? 'bg-navy-900 text-white border-t border-l border-r border-navy-600 -mb-px z-10'
                    : 'bg-white text-navy-900 border-t border-l border-r border-gray-300 -mb-px z-10'
                  : darkMode
                    ? 'bg-navy-700 text-gray-300 hover:bg-navy-600 hover:text-white border border-transparent'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }
              `}
            >
              {/* Sheet icon */}
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" 
                />
              </svg>
              {sheet.name || `Sheet ${index + 1}`}
              
              {/* Active indicator */}
              {index === activeSheet && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    darkMode ? 'bg-teal-400' : 'bg-teal-600'
                  }`}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right scroll button */}
      {showScrollButtons && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className={`flex-shrink-0 p-1 rounded transition-colors ${
            darkMode
              ? 'hover:bg-navy-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Scroll tabs right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* New sheet button (Excel-style) */}
      <button
        type="button"
        className={`flex-shrink-0 ml-2 p-1 rounded transition-colors ${
          darkMode
            ? 'hover:bg-navy-700 text-gray-400 hover:text-white'
            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Add new sheet"
        title="Add new sheet (not available in viewer)"
        disabled
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
});

ExcelSheetTabs.displayName = 'ExcelSheetTabs';

export default ExcelSheetTabs;