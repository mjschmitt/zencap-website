// src/components/KeyboardNavigation.js - Professional Power-User Keyboard Navigation System
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const KeyboardNavigationContext = createContext();

// Navigation configuration
const NAVIGATION_CONFIG = {
  // Global shortcuts
  global: {
    '/': { action: 'focusSearch', description: 'Focus search' },
    '?': { action: 'showHelp', description: 'Show keyboard shortcuts' },
    'Escape': { action: 'clearSearch', description: 'Clear search/close modals' },
    'g h': { action: 'goHome', description: 'Go to home' },
    'g m': { action: 'goModels', description: 'Go to models' },
    'g i': { action: 'goInsights', description: 'Go to insights' },
    'g a': { action: 'goAdmin', description: 'Go to admin' },
    'g c': { action: 'goContact', description: 'Go to contact' }
  },
  // Models page specific
  models: {
    'ArrowUp': { action: 'navigateUp', description: 'Navigate up' },
    'ArrowDown': { action: 'navigateDown', description: 'Navigate down' },
    'ArrowLeft': { action: 'navigateLeft', description: 'Navigate left' },
    'ArrowRight': { action: 'navigateRight', description: 'Navigate right' },
    'Enter': { action: 'openFocused', description: 'Open focused model' },
    '1': { action: 'filterAll', description: 'Show all models' },
    '2': { action: 'filterPrivate', description: 'Filter private equity' },
    '3': { action: 'filterPublic', description: 'Filter public equity' },
    's': { action: 'cycleSorting', description: 'Cycle sort options' },
    'r': { action: 'resetFilters', description: 'Reset all filters' }
  }
};

// Keyboard shortcuts help modal
const KeyboardHelpModal = ({ isOpen, onClose, currentPage }) => {
  const globalShortcuts = NAVIGATION_CONFIG.global;
  const pageShortcuts = NAVIGATION_CONFIG[currentPage] || {};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-navy-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Global shortcuts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  Global Navigation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(globalShortcuts).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{config.description}</span>
                      <div className="flex items-center space-x-1">
                        {key.includes(' ') ? (
                          // Handle combo keys like 'g h'
                          key.split(' ').map((k, i) => (
                            <React.Fragment key={i}>
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-navy-600 border border-gray-300 dark:border-navy-500 rounded">
                                {k}
                              </kbd>
                              {i < key.split(' ').length - 1 && <span className="text-xs text-gray-500">then</span>}
                            </React.Fragment>
                          ))
                        ) : (
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-navy-600 border border-gray-300 dark:border-navy-500 rounded">
                            {key === ' ' ? 'Space' : key}
                          </kbd>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Page specific shortcuts */}
              {Object.keys(pageShortcuts).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(pageShortcuts).map(([key, config]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{config.description}</span>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-navy-600 border border-gray-300 dark:border-navy-500 rounded">
                          {key.replace('Arrow', '').toLowerCase()}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-navy-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-navy-600 rounded">Escape</kbd> or click outside to close
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main keyboard navigation provider
export const KeyboardNavigationProvider = ({ children }) => {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [focusedModelIndex, setFocusedModelIndex] = useState(-1);
  const [keySequence, setKeySequence] = useState('');
  const keySequenceTimeoutRef = useRef(null);

  // Get current page identifier
  const getCurrentPage = useCallback(() => {
    const path = router.pathname;
    if (path.startsWith('/models')) return 'models';
    if (path.startsWith('/insights')) return 'insights';
    if (path.startsWith('/admin')) return 'admin';
    return 'global';
  }, [router.pathname]);

  // Clear key sequence after timeout
  const clearKeySequence = useCallback(() => {
    if (keySequenceTimeoutRef.current) {
      clearTimeout(keySequenceTimeoutRef.current);
    }
    keySequenceTimeoutRef.current = setTimeout(() => {
      setKeySequence('');
    }, 1500);
  }, []);

  // Navigation actions
  const actions = {
    // Global actions
    focusSearch: () => {
      const searchInput = document.querySelector('input[type="text"], input[placeholder*="search" i], input[placeholder*="Search" i]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },

    showHelp: () => setShowHelp(true),

    clearSearch: () => {
      if (showHelp) {
        setShowHelp(false);
        return;
      }
      
      const searchInput = document.querySelector('input[type="text"], input[placeholder*="search" i], input[placeholder*="Search" i]');
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // Clear any active modals or overlays
      const modals = document.querySelectorAll('[role="dialog"], .modal, [data-modal]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label*="close" i], .close, [data-close]');
        if (closeButton) closeButton.click();
      });
    },

    goHome: () => router.push('/'),
    goModels: () => router.push('/models'),
    goInsights: () => router.push('/insights'),
    goAdmin: () => router.push('/admin'),
    goContact: () => router.push('/contact'),

    // Models page actions
    navigateUp: () => {
      const modelCards = document.querySelectorAll('[data-model-card]');
      if (modelCards.length === 0) return;

      const cols = window.innerWidth >= 768 ? (window.innerWidth >= 1024 ? 3 : 2) : 1;
      const newIndex = Math.max(0, focusedModelIndex - cols);
      setFocusedModelIndex(newIndex);
      focusModelCard(modelCards[newIndex]);
    },

    navigateDown: () => {
      const modelCards = document.querySelectorAll('[data-model-card]');
      if (modelCards.length === 0) return;

      const cols = window.innerWidth >= 768 ? (window.innerWidth >= 1024 ? 3 : 2) : 1;
      const newIndex = Math.min(modelCards.length - 1, focusedModelIndex + cols);
      setFocusedModelIndex(newIndex);
      focusModelCard(modelCards[newIndex]);
    },

    navigateLeft: () => {
      const modelCards = document.querySelectorAll('[data-model-card]');
      if (modelCards.length === 0) return;

      const newIndex = Math.max(0, focusedModelIndex - 1);
      setFocusedModelIndex(newIndex);
      focusModelCard(modelCards[newIndex]);
    },

    navigateRight: () => {
      const modelCards = document.querySelectorAll('[data-model-card]');
      if (modelCards.length === 0) return;

      const newIndex = Math.min(modelCards.length - 1, focusedModelIndex + 1);
      setFocusedModelIndex(newIndex);
      focusModelCard(modelCards[newIndex]);
    },

    openFocused: () => {
      const modelCards = document.querySelectorAll('[data-model-card]');
      if (focusedModelIndex >= 0 && focusedModelIndex < modelCards.length) {
        const card = modelCards[focusedModelIndex];
        const link = card.querySelector('a') || card;
        if (link.href) {
          window.location.href = link.href;
        } else {
          link.click();
        }
      }
    },

    filterAll: () => {
      const allButton = document.querySelector('button[data-category="all"], button:contains("All Models")');
      if (allButton) allButton.click();
    },

    filterPrivate: () => {
      const privateButton = document.querySelector('button[data-category="private-equity"], button:contains("Private Equity")');
      if (privateButton) privateButton.click();
    },

    filterPublic: () => {
      const publicButton = document.querySelector('button[data-category="public-equity"], button:contains("Public Equity")');
      if (publicButton) publicButton.click();
    },

    cycleSorting: () => {
      const sortSelect = document.querySelector('select[value*="sort"], select:contains("Sort")');
      if (sortSelect) {
        const options = Array.from(sortSelect.options);
        const currentIndex = options.findIndex(option => option.selected);
        const nextIndex = (currentIndex + 1) % options.length;
        sortSelect.selectedIndex = nextIndex;
        sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },

    resetFilters: () => {
      const clearButton = document.querySelector('button:contains("Clear All"), button[data-clear-filters]');
      if (clearButton) clearButton.click();
    }
  };

  // Focus model card helper
  const focusModelCard = (card) => {
    if (!card) return;
    
    // Remove previous focus
    document.querySelectorAll('[data-model-card]').forEach(c => {
      c.classList.remove('keyboard-focused');
      c.style.outline = '';
      c.style.boxShadow = '';
    });

    // Add focus styles
    card.classList.add('keyboard-focused');
    card.style.outline = '2px solid #0d9488';
    card.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.2)';
    
    // Scroll into view if needed
    card.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't interfere with form inputs (except for specific cases)
      const activeElement = document.activeElement;
      const isInInput = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
      );

      // Allow certain shortcuts even in inputs
      const allowedInInput = ['Escape', 'F1'];
      if (isInInput && !allowedInInput.includes(event.key)) {
        // Allow '/' to focus search from anywhere
        if (event.key === '/' && !activeElement.value) {
          event.preventDefault();
          actions.focusSearch();
          return;
        }
        return;
      }

      const currentPage = getCurrentPage();
      const key = event.key;
      let handled = false;

      // Handle escape key
      if (key === 'Escape') {
        event.preventDefault();
        actions.clearSearch();
        handled = true;
      }

      // Handle help shortcut
      if (key === '?' && !event.shiftKey) {
        event.preventDefault();
        actions.showHelp();
        handled = true;
      }

      // Handle key sequences (like 'g h', 'g m')
      if (key === 'g') {
        event.preventDefault();
        setKeySequence('g');
        clearKeySequence();
        handled = true;
      } else if (keySequence === 'g') {
        event.preventDefault();
        const sequence = 'g ' + key;
        const globalConfig = NAVIGATION_CONFIG.global[sequence];
        if (globalConfig && actions[globalConfig.action]) {
          actions[globalConfig.action]();
          handled = true;
        }
        setKeySequence('');
      }

      // Handle single key shortcuts
      if (!handled) {
        // Global shortcuts
        const globalConfig = NAVIGATION_CONFIG.global[key];
        if (globalConfig && actions[globalConfig.action]) {
          event.preventDefault();
          actions[globalConfig.action]();
          handled = true;
        }

        // Page-specific shortcuts
        if (!handled && currentPage !== 'global') {
          const pageConfig = NAVIGATION_CONFIG[currentPage]?.[key];
          if (pageConfig && actions[pageConfig.action]) {
            event.preventDefault();
            actions[pageConfig.action]();
            handled = true;
          }
        }
      }

      // Auto-focus first model card on models page
      if (currentPage === 'models' && focusedModelIndex === -1) {
        const modelCards = document.querySelectorAll('[data-model-card]');
        if (modelCards.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
          setFocusedModelIndex(0);
          focusModelCard(modelCards[0]);
        }
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (keySequenceTimeoutRef.current) {
        clearTimeout(keySequenceTimeoutRef.current);
      }
    };
  }, [keySequence, focusedModelIndex, getCurrentPage, clearKeySequence, router]);

  // Reset focus index when route changes
  useEffect(() => {
    setFocusedModelIndex(-1);
    setKeySequence('');
  }, [router.pathname]);

  // Clean up focus styles on unmount or route change
  useEffect(() => {
    return () => {
      document.querySelectorAll('[data-model-card]').forEach(card => {
        card.classList.remove('keyboard-focused');
        card.style.outline = '';
        card.style.boxShadow = '';
      });
    };
  }, [router.pathname]);

  const contextValue = {
    focusedModelIndex,
    setFocusedModelIndex,
    actions,
    showHelp: () => setShowHelp(true)
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      {children}
      
      {/* Key sequence indicator */}
      <AnimatePresence>
        {keySequence && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-40 font-mono"
          >
            {keySequence}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help modal */}
      <KeyboardHelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        currentPage={getCurrentPage()}
      />

      {/* Global styles for keyboard focus */}
      <style jsx global>{`
        .keyboard-focused {
          transition: outline 0.2s ease, box-shadow 0.2s ease !important;
        }
        
        .keyboard-navigation-indicator {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(13, 148, 136, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        
        @media (max-width: 768px) {
          .keyboard-navigation-indicator {
            display: none;
          }
        }
      `}</style>
    </KeyboardNavigationContext.Provider>
  );
};

// Hook to use keyboard navigation
export const useKeyboardNavigation = () => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
};

export default KeyboardNavigationProvider;