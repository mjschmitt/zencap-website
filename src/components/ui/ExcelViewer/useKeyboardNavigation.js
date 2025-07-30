import { useEffect, useCallback } from 'react';

export const useKeyboardNavigation = ({
  enabled = true,
  onSheetNext,
  onSheetPrev,
  onZoomIn,
  onZoomOut,
  onSearch,
  onFullScreen,
  onPrint,
  onExport,
  onCellNavigation
}) => {
  const handleKeyDown = useCallback((e) => {
    if (!enabled) return;

    // Sheet navigation
    if (e.ctrlKey && e.key === 'PageDown') {
      e.preventDefault();
      onSheetNext?.();
    } else if (e.ctrlKey && e.key === 'PageUp') {
      e.preventDefault();
      onSheetPrev?.();
    }
    
    // Zoom controls
    else if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      onZoomIn?.();
    } else if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      onZoomOut?.();
    } else if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      // Reset zoom to 100%
    }
    
    // Search
    else if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      onSearch?.();
    }
    
    // Full screen
    else if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
      e.preventDefault();
      onFullScreen?.();
    }
    
    // Print
    else if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      onPrint?.();
    }
    
    // Export
    else if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      onExport?.();
    }
    
    // Cell navigation
    else if (onCellNavigation) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onCellNavigation('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onCellNavigation('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onCellNavigation('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onCellNavigation('right');
          break;
        case 'Home':
          if (e.ctrlKey) {
            e.preventDefault();
            onCellNavigation('start');
          }
          break;
        case 'End':
          if (e.ctrlKey) {
            e.preventDefault();
            onCellNavigation('end');
          }
          break;
        case 'PageUp':
          e.preventDefault();
          onCellNavigation('pageUp');
          break;
        case 'PageDown':
          e.preventDefault();
          onCellNavigation('pageDown');
          break;
      }
    }
  }, [enabled, onSheetNext, onSheetPrev, onZoomIn, onZoomOut, onSearch, onFullScreen, onPrint, onExport, onCellNavigation]);

  const registerKeyboardShortcuts = useCallback(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (enabled) {
      const cleanup = registerKeyboardShortcuts();
      return cleanup;
    }
  }, [enabled, registerKeyboardShortcuts]);

  // Keyboard shortcuts help modal content
  const getKeyboardShortcuts = () => [
    { category: 'Navigation', shortcuts: [
      { keys: ['Ctrl', 'PageDown'], description: 'Next sheet' },
      { keys: ['Ctrl', 'PageUp'], description: 'Previous sheet' },
      { keys: ['Arrow Keys'], description: 'Navigate cells' },
      { keys: ['Ctrl', 'Home'], description: 'Go to first cell' },
      { keys: ['Ctrl', 'End'], description: 'Go to last cell' },
      { keys: ['PageUp/PageDown'], description: 'Navigate page' }
    ]},
    { category: 'View', shortcuts: [
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom' },
      { keys: ['F11'], description: 'Toggle full screen' }
    ]},
    { category: 'Actions', shortcuts: [
      { keys: ['Ctrl', 'F'], description: 'Search' },
      { keys: ['Ctrl', 'P'], description: 'Print' },
      { keys: ['Ctrl', 'Shift', 'E'], description: 'Export' },
      { keys: ['F3'], description: 'Find next' },
      { keys: ['Shift', 'F3'], description: 'Find previous' }
    ]}
  ];

  return {
    registerKeyboardShortcuts,
    getKeyboardShortcuts
  };
};