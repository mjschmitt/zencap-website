import React, { useState, useEffect } from 'react';

// Only import ExcelJSViewer since it's the only one we need now
const ExcelJSViewer = React.lazy(() => import('./ExcelViewer/ExcelJSViewer'));

const ExcelPreview = ({ file, excelFile, modelId, title = "Model Viewer", height = "100%" }) => {
  const [retryKey, setRetryKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [fileUrl, setFileUrl] = useState(file || excelFile);
  const [isChecking, setIsChecking] = useState(false);
  const [fileNotFound, setFileNotFound] = useState(false);

  // Check if file exists and get updated URL if needed
  useEffect(() => {
    const checkFile = async () => {
      if (!fileUrl || !modelId) return;
      
      setIsChecking(true);
      try {
        const response = await fetch('/api/models/check-excel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modelId, excelUrl: fileUrl })
        });
        
        const data = await response.json();
        
        if (response.ok && data.exists) {
          if (data.updated) {
            console.log('Excel file was updated to:', data.url);
            setFileUrl(data.url);
          }
          setFileNotFound(false);
        } else {
          console.error('Excel file not found:', data.error);
          setFileNotFound(true);
        }
      } catch (error) {
        console.error('Error checking Excel file:', error);
        // Continue with original URL if check fails
      } finally {
        setIsChecking(false);
      }
    };
    
    checkFile();
  }, [file, excelFile, modelId]);

  const handleRetry = () => {
    setHasError(false);
    setFileNotFound(false);
    setRetryKey(prev => prev + 1);
  };

  if (!fileUrl) {
    return (
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No Excel file provided for preview.</p>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Checking Excel file availability...</span>
      </div>
    );
  }

  if (fileNotFound) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <h3 className="text-yellow-800 font-medium">Excel File Not Found</h3>
        <p className="text-yellow-600 text-sm mt-1">
          The Excel file for this model could not be found. This may be due to recent maintenance.
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Please contact support if this issue persists.
        </p>
        <button 
          onClick={handleRetry} 
          className="mt-3 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
        >
          Retry
        </button>
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
    <div 
      className="excel-preview-container flex flex-col"
      style={{ height: height }}
      onClick={(e) => {
        // Prevent any clicks within the Excel viewer from bubbling up to parent forms
        e.stopPropagation();
      }}
      onSubmit={(e) => {
        // Prevent any form submissions from within the Excel viewer
        e.preventDefault();
        e.stopPropagation();
      }}
    >
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
            file={fileUrl}
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
    // Error logged internally, no console output needed
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