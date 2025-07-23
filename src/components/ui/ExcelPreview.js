import React, { useState } from 'react';

// Only import ExcelJSViewer since it's the only one we need now
const ExcelJSViewer = React.lazy(() => import('./ExcelJSViewer'));

const ExcelPreview = ({ file, title = "Model Viewer", height = "850px" }) => {
  const [retryKey, setRetryKey] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleRetry = () => {
    setHasError(false);
    setRetryKey(prev => prev + 1);
  };

  if (!file) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No Excel file provided for preview.</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-medium">Failed to Load Excel Viewer</h3>
        <p className="text-red-600 text-sm mt-1">
          There was an issue loading the Excel viewer component.
        </p>
        <div className="mt-3 space-y-2">
          <p className="text-gray-600 text-xs">
            This might be due to:
          </p>
          <ul className="text-gray-600 text-xs list-disc list-inside space-y-1">
            <li>Network connectivity issues</li>
            <li>Browser cache problems</li>
            <li>Temporary server issues</li>
          </ul>
          <button 
            onClick={handleRetry} 
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="excel-preview-container">
      {/* Enhanced error boundary for chunk loading issues */}
      <React.Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2 text-gray-600">Loading Excel viewer...</span>
        </div>
      }>
        <ErrorBoundary onError={() => setHasError(true)}>
          <ExcelJSViewer
            key={retryKey}
            file={file}
            title={title}
            height={height}
            onSuccess={() => setHasError(false)}
            onError={() => setHasError(true)}
          />
        </ErrorBoundary>
      </React.Suspense>
    </div>
  );
};

// Error Boundary component for handling chunk loading errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ExcelJSViewer Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <h3 className="text-red-800 font-medium">Excel Viewer Error</h3>
          <p className="text-red-600 text-sm mt-1">
            The Excel viewer encountered an unexpected error.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ExcelPreview; 