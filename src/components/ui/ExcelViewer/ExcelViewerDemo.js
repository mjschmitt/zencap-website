import React, { useState } from 'react';
import ExcelJSViewer from './ExcelJSViewer';
import './ExcelViewer.css';

const ExcelViewerDemo = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [showPrint, setShowPrint] = useState(true);
  const [enableKeyboards, setEnableKeyboards] = useState(true);

  // Demo Excel file URL (you would replace this with actual file)
  const demoFileUrl = '/models/sample-financial-model.xlsx';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-navy-900' : 'bg-gray-50'}`}>
      {/* Demo Controls */}
      <div className={`p-6 border-b ${darkMode ? 'bg-navy-800 border-navy-700' : 'bg-white border-gray-200'}`}>
        <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-navy-900'}`}>
          Excel Viewer UI/UX Demo
        </h1>
        
        <div className="flex flex-wrap gap-4">
          {/* Dark Mode Toggle */}
          <label className={`flex items-center space-x-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="rounded"
            />
            <span>Dark Mode</span>
          </label>
          
          {/* Accessibility Mode */}
          <label className={`flex items-center space-x-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={accessibilityMode}
              onChange={(e) => setAccessibilityMode(e.target.checked)}
              className="rounded"
            />
            <span>Accessibility Mode</span>
          </label>
          
          {/* Search Toggle */}
          <label className={`flex items-center space-x-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={showSearch}
              onChange={(e) => setShowSearch(e.target.checked)}
              className="rounded"
            />
            <span>Show Search</span>
          </label>
          
          {/* Print Button Toggle */}
          <label className={`flex items-center space-x-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={showPrint}
              onChange={(e) => setShowPrint(e.target.checked)}
              className="rounded"
            />
            <span>Show Print Button</span>
          </label>
          
          {/* Keyboard Shortcuts */}
          <label className={`flex items-center space-x-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={enableKeyboards}
              onChange={(e) => setEnableKeyboards(e.target.checked)}
              className="rounded"
            />
            <span>Enable Keyboard Shortcuts</span>
          </label>
        </div>
        
        {/* Keyboard Shortcuts Help */}
        <details className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <summary className="cursor-pointer text-sm font-medium">Keyboard Shortcuts</summary>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Navigation</h3>
              <ul className="space-y-1">
                <li><kbd>Ctrl</kbd> + <kbd>PageDown</kbd> - Next sheet</li>
                <li><kbd>Ctrl</kbd> + <kbd>PageUp</kbd> - Previous sheet</li>
                <li><kbd>Arrow Keys</kbd> - Navigate cells</li>
                <li><kbd>Ctrl</kbd> + <kbd>Home</kbd> - First cell</li>
                <li><kbd>Ctrl</kbd> + <kbd>End</kbd> - Last cell</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">View</h3>
              <ul className="space-y-1">
                <li><kbd>Ctrl</kbd> + <kbd>+</kbd> - Zoom in</li>
                <li><kbd>Ctrl</kbd> + <kbd>-</kbd> - Zoom out</li>
                <li><kbd>Ctrl</kbd> + <kbd>0</kbd> - Reset zoom</li>
                <li><kbd>F11</kbd> - Full screen</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Actions</h3>
              <ul className="space-y-1">
                <li><kbd>Ctrl</kbd> + <kbd>F</kbd> - Search</li>
                <li><kbd>Ctrl</kbd> + <kbd>P</kbd> - Print</li>
                <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> - Export</li>
                <li><kbd>F3</kbd> - Find next</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
      
      {/* Excel Viewer */}
      <div className="p-6">
        <div className={`rounded-lg shadow-xl ${darkMode ? 'shadow-black/50' : ''}`}>
          <ExcelJSViewer
            file={demoFileUrl}
            title="Financial Model Q4 2024"
            height="700px"
            darkMode={darkMode}
            showSearch={showSearch}
            showPrintButton={showPrint}
            enableKeyboardShortcuts={enableKeyboards}
            accessibilityMode={accessibilityMode}
            onSuccess={() => console.log('Excel file loaded successfully')}
            onError={(error) => console.error('Error loading Excel file:', error)}
          />
        </div>
      </div>
      
      {/* Feature Highlights */}
      <div className={`p-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-navy-900'}`}>
          New Features Implemented
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">🔄 Loading States</h3>
            <p className="text-sm">Progressive loading with stage indicators and smooth skeleton screens</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">⚠️ Error Handling</h3>
            <p className="text-sm">Contextual error messages with retry options and helpful guidance</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">📱 Responsive Design</h3>
            <p className="text-sm">Optimized layouts for mobile, tablet, and desktop devices</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">🔍 Search Functionality</h3>
            <p className="text-sm">Find and navigate through cells with highlighting and navigation</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">🌙 Dark Mode</h3>
            <p className="text-sm">Professional dark theme optimized for reduced eye strain</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">♿ Accessibility</h3>
            <p className="text-sm">Full ARIA support, keyboard navigation, and screen reader compatibility</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">🖨️ Print Support</h3>
            <p className="text-sm">Optimized print layouts with proper page breaks and formatting</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">💾 Export Options</h3>
            <p className="text-sm">Export to multiple formats including Excel, CSV, PDF, and JSON</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-white'} shadow`}>
            <h3 className="font-semibold mb-2">🔔 Toast Notifications</h3>
            <p className="text-sm">Non-intrusive feedback for user actions and system events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewerDemo;