/**
 * Comprehensive Error Boundary for Zenith Capital Advisors
 * Head of Frontend Engineering - Critical error handling for production
 */
import React from 'react';
import { captureError } from '../utils/errorTracking';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Report to error tracking service
    try {
      captureError(error, {
        errorBoundary: true,
        errorId,
        componentStack: errorInfo.componentStack,
        errorInfo: errorInfo,
        retryCount: this.state.retryCount,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        timestamp: new Date().toISOString()
      });
    } catch (trackingError) {
      console.error('Failed to report error:', trackingError);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount } = this.state;
      const { fallback: Fallback, showDetails = false } = this.props;

      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback 
            error={error} 
            errorInfo={errorInfo} 
            retry={this.handleRetry}
            reload={this.handleReload}
            errorId={errorId}
            retryCount={retryCount}
          />
        );
      }

      // Default error UI with professional styling
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-gray-200 dark:border-navy-700 p-8">
              {/* Error Icon */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full">
                <svg 
                  className="w-8 h-8 text-red-600 dark:text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>

              {/* Error Message */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-navy-800 dark:text-white mb-3">
                  Something went wrong
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We encountered an unexpected error. Our team has been notified.
                </p>
                {errorId && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                    Error ID: {errorId}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-navy-700 hover:bg-navy-800 text-white font-medium py-3 px-4 rounded-lg transition-colors min-h-[44px]"
                  style={{ minHeight: '44px' }} // Ensure 44px touch target
                >
                  Try Again {retryCount > 0 && `(${retryCount})`}
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-800 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors min-h-[44px]"
                  style={{ minHeight: '44px' }} // Ensure 44px touch target
                >
                  Reload Page
                </button>
              </div>

              {/* Debug Info (Development Only) */}
              {showDetails && process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6 p-4 bg-gray-100 dark:bg-navy-900 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    Technical Details
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs">
                      <strong className="text-red-600 dark:text-red-400">Error:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                        {error.toString()}
                      </pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div className="text-xs">
                        <strong className="text-red-600 dark:text-red-400">Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Support Contact */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Need help?{' '}
                  <a 
                    href="mailto:support@zenithcapitaladvisors.com" 
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
