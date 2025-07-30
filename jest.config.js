module.exports = {
  // Test environment setup
  testEnvironment: 'jsdom',
  
  // Setup files to run after the test framework is installed
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/components/ui/ExcelViewer/**/*.{js,jsx}',
    '!src/components/ui/ExcelViewer/**/*.test.{js,jsx}',
    '!src/components/ui/ExcelViewer/**/__tests__/**',
    '!src/components/ui/ExcelViewer/test.html',
    '!src/components/ui/ExcelViewer/*.md'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/'
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Globals
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react'
      }
    }
  }
};