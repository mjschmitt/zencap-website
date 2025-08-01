import { useMemo } from 'react';

export const useTheme = (darkMode = false) => {
  const theme = useMemo(() => {
    if (darkMode) {
      return {
        // Dark mode colors
        background: {
          primary: 'bg-navy-900',
          secondary: 'bg-navy-800',
          tertiary: 'bg-navy-700',
          hover: 'hover:bg-navy-700',
          active: 'bg-navy-600'
        },
        text: {
          primary: 'text-white',
          secondary: 'text-gray-300',
          tertiary: 'text-gray-400',
          muted: 'text-gray-500',
          inverse: 'text-navy-900'
        },
        border: {
          primary: 'border-navy-700',
          secondary: 'border-navy-600',
          focus: 'focus:border-teal-400'
        },
        accent: {
          primary: 'bg-teal-500 text-white',
          secondary: 'bg-teal-600 text-white',
          hover: 'hover:bg-teal-600',
          text: 'text-teal-400'
        },
        status: {
          success: 'text-green-400',
          error: 'text-red-400',
          warning: 'text-yellow-400',
          info: 'text-blue-400'
        },
        shadow: 'shadow-2xl shadow-black/50'
      };
    } else {
      return {
        // Light mode colors
        background: {
          primary: 'bg-white',
          secondary: 'bg-gray-50',
          tertiary: 'bg-gray-100',
          hover: 'hover:bg-gray-100',
          active: 'bg-gray-200'
        },
        text: {
          primary: 'text-navy-900',
          secondary: 'text-navy-700',
          tertiary: 'text-gray-600',
          muted: 'text-gray-500',
          inverse: 'text-white'
        },
        border: {
          primary: 'border-gray-200',
          secondary: 'border-gray-300',
          focus: 'focus:border-teal-500'
        },
        accent: {
          primary: 'bg-navy-700 text-white',
          secondary: 'bg-navy-800 text-white',
          hover: 'hover:bg-navy-800',
          text: 'text-teal-600'
        },
        status: {
          success: 'text-green-600',
          error: 'text-red-600',
          warning: 'text-yellow-600',
          info: 'text-blue-600'
        },
        shadow: 'shadow-lg'
      };
    }
  }, [darkMode]);

  // Cell-specific theming
  const cellTheme = useMemo(() => {
    if (darkMode) {
      return {
        header: 'bg-navy-800 text-gray-300 font-semibold',
        rowHeader: 'bg-navy-800 text-gray-400 font-medium',
        cell: 'bg-navy-900 text-white border-navy-700',
        cellHover: 'hover:bg-navy-700',
        cellSelected: 'bg-teal-900/30 border-teal-400',
        cellHighlight: 'bg-yellow-900/30',
        cellReadonly: 'bg-navy-800/50 text-gray-400',
        cellFormula: 'text-teal-400',
        cellError: 'bg-red-900/20 text-red-400'
      };
    } else {
      return {
        header: 'bg-gray-100 text-navy-700 font-semibold',
        rowHeader: 'bg-gray-50 text-gray-600 font-medium',
        cell: 'bg-white text-navy-900 border-gray-200',
        cellHover: 'hover:bg-gray-50',
        cellSelected: 'bg-teal-50 border-teal-500',
        cellHighlight: 'bg-yellow-100',
        cellReadonly: 'bg-gray-50 text-gray-600',
        cellFormula: 'text-teal-600',
        cellError: 'bg-red-50 text-red-600'
      };
    }
  }, [darkMode]);

  // Print mode styles
  const printTheme = useMemo(() => ({
    '@media print': {
      background: 'bg-white',
      text: 'text-black',
      border: 'border-gray-300',
      hideInPrint: 'print:hidden',
      showInPrint: 'print:block',
      pageBreak: 'print:break-inside-avoid'
    }
  }), []);

  return { theme, cellTheme, printTheme };
};