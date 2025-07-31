import React, { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExcelToolbar = memo(({ 
  sheets = [], 
  activeSheet = 0, 
  onSheetChange,
  onFullScreenToggle,
  isFullScreen = false,
  onZoomChange,
  zoom = 100,
  onExport,
  onPrint,
  onSearch,
  fileName = "Spreadsheet",
  darkMode = false,
  isPrintMode = false
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const zoomMenuRef = useRef(null);

  // Predefined zoom levels
  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  // Export formats
  const exportFormats = [
    { format: 'xlsx', label: 'Excel (.xlsx)', icon: '📊' },
    { format: 'csv', label: 'CSV (.csv)', icon: '📄' },
    { format: 'pdf', label: 'PDF (.pdf)', icon: '📑' },
    { format: 'json', label: 'JSON (.json)', icon: '{ }' }
  ];
  // Hide toolbar in print mode
  if (isPrintMode) return null;

  return (
    <div className={`excel-toolbar p-3 flex items-center justify-between transition-colors ${
      darkMode 
        ? 'bg-navy-800 border-b border-navy-700' 
        : 'bg-gray-50 border-b border-gray-200'
    }`}
    role="toolbar"
    aria-label="Excel viewer toolbar"
    >
      {/* Left side - File info and zoom */}
      <div className="flex items-center space-x-4">
        {/* File name and sheet count */}
        <div>
          <h1 className={`text-sm font-medium truncate max-w-xs ${
            darkMode ? 'text-white' : 'text-navy-800'
          }`}>
            {fileName}
          </h1>
          <p className={`text-xs ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {sheets.length} sheet{sheets.length !== 1 ? 's' : ''} • Sheet {activeSheet + 1}: {sheets[activeSheet]?.name || 'Untitled'}
          </p>
        </div>
        
        {/* Enhanced zoom controls with dropdown */}
        <div className="relative flex items-center space-x-2 border-l pl-4 ${
          darkMode ? 'border-navy-700' : 'border-gray-300'
        }">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onZoomChange?.(Math.max(25, zoom - 25));
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-200'
            }`}
            title="Zoom out (Ctrl+-)"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowZoomMenu(!showZoomMenu);
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              darkMode 
                ? 'bg-navy-700 text-gray-300 hover:bg-navy-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Zoom level"
            aria-expanded={showZoomMenu}
          >
            {zoom}%
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onZoomChange?.(Math.min(200, zoom + 25));
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-200'
            }`}
            title="Zoom in (Ctrl++)"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {/* Zoom dropdown menu */}
          <AnimatePresence>
            {showZoomMenu && (
              <motion.div
                ref={zoomMenuRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-full mt-2 left-0 z-10 rounded-lg shadow-lg overflow-hidden ${
                  darkMode ? 'bg-navy-700 border border-navy-600' : 'bg-white border border-gray-200'
                }`}
              >
                {zoomLevels.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoomChange?.(level);
                      setShowZoomMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      level === zoom
                        ? darkMode
                          ? 'bg-teal-500 text-white'
                          : 'bg-navy-700 text-white'
                        : darkMode
                          ? 'hover:bg-navy-600 text-gray-300'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center - spacer */}
      <div className="flex-1" />

      {/* Right side - Enhanced actions */}
      <div className="flex items-center space-x-2">
        {/* Search button */}
        {onSearch && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSearch();
            }}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-200 text-gray-600 hover:text-navy-900'
            }`}
            title="Search (Ctrl+F)"
            aria-label="Search in spreadsheet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
        
        {/* Print button */}
        {onPrint && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrint();
            }}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-200 text-gray-600 hover:text-navy-900'
            }`}
            title="Print (Ctrl+P)"
            aria-label="Print spreadsheet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        )}
        
        {/* Export button with dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowExportMenu(!showExportMenu);
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              darkMode
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : 'bg-navy-700 text-white hover:bg-navy-800'
            }`}
            title="Export options"
            aria-label="Export spreadsheet"
            aria-expanded={showExportMenu}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Export</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Export dropdown menu */}
          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                ref={exportMenuRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-full mt-2 right-0 z-10 w-48 rounded-lg shadow-lg overflow-hidden ${
                  darkMode ? 'bg-navy-700 border border-navy-600' : 'bg-white border border-gray-200'
                }`}
              >
                {exportFormats.map(({ format, label }) => (
                  <button
                    key={format}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport?.(format);
                      setShowExportMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center space-x-3 ${
                      darkMode
                        ? 'hover:bg-navy-600 text-gray-300 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-700 hover:text-navy-900'
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Full screen toggle - more prominent */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFullScreenToggle();
          }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
            isFullScreen
              ? darkMode
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-orange-500 text-white hover:bg-orange-600'
              : darkMode
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
          title={isFullScreen ? "Exit full screen (F11 or ESC)" : "Enter full screen (F11)"}
          aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
        >
          {isFullScreen ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">Exit</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="text-sm">Full Screen</span>
            </>
          )}
        </button>
        
        {/* Keyboard shortcuts help */}
        <button
          type="button"
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'hover:bg-navy-700 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-200 text-gray-600 hover:text-navy-900'
          }`}
          title="Keyboard shortcuts"
          aria-label="Show keyboard shortcuts"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
});

ExcelToolbar.displayName = 'ExcelToolbar';

export default ExcelToolbar;