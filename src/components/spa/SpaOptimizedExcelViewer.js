// src/components/spa/SpaOptimizedExcelViewer.js - High-Performance Excel Viewer for SPA
import { useState } from 'react';
import { useSpa } from './SpaRouter';
import { OptimizedMotionDiv } from './OptimizedMotion';

// Simple placeholder component for SPA Excel viewer
export default function SpaOptimizedExcelViewer({ 
  file, 
  title,
  className = '',
  ...props 
}) {
  const { isSpaMode } = useSpa();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const content = (
    <div className={`spa-excel-viewer ${className}`}>
      {!isLoaded ? (
        <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100"
             onClick={handleLoad}>
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">Click to load Excel viewer</p>
            {title && <p className="text-gray-400 text-xs mt-1">{title}</p>}
          </div>
        </div>
      ) : (
        <div className="h-64 bg-white rounded-lg border flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">SPA Excel Viewer Active</p>
            <p className="text-gray-500 text-sm">SPA Mode: {isSpaMode ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      )}
    </div>
  );

  return isSpaMode ? (
    <OptimizedMotionDiv animation="fadeIn">
      {content}
    </OptimizedMotionDiv>
  ) : (
    content
  );
}

// Additional exports for compatibility
export const QuickExcelViewer = (props) => (
  <SpaOptimizedExcelViewer 
    autoLoad={true}
    className="h-96"
    {...props}
  />
);

export const LazyExcelViewer = (props) => (
  <SpaOptimizedExcelViewer 
    autoLoad={false}
    className="min-h-64"
    {...props}
  />
);