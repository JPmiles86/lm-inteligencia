/**
 * Global Error Boundary Component
 * Catches all unhandled React errors and provides recovery mechanisms
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only affects children, not entire app
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state to trigger fallback UI
    const now = Date.now();
    return {
      hasError: true,
      error,
      lastErrorTime: now,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('Error Boundary Caught:', error, errorInfo);
    
    // Update error count
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error service (will be implemented)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Get browser and context information
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorCount: this.state.errorCount,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      // Store in localStorage as fallback
      const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errors.push(errorLog);
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }
      localStorage.setItem('errorLogs', JSON.stringify(errors));

      // TODO: Send to API endpoint when available
      // await api.logError(errorLog);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              {/* Error Header */}
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    We've encountered an unexpected error
                  </p>
                </div>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Error Details (Development Mode)
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 font-mono mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-white dark:bg-gray-800 rounded overflow-x-auto text-gray-700 dark:text-gray-300">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Error Count Warning */}
              {this.state.errorCount > 2 && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Multiple errors detected ({this.state.errorCount} total). 
                    The application may be unstable. Consider refreshing the page.
                  </p>
                </div>
              )}

              {/* Recovery Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  What would you like to do?
                </h3>
                
                {/* Try Again Button */}
                {!this.props.isolate && (
                  <button
                    onClick={this.handleReset}
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Try Again
                  </button>
                )}

                {/* Reload Page Button */}
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Reload Page
                </button>

                {/* Go Home Button */}
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go to Homepage
                </button>
              </div>

              {/* Support Information */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>
                    If this problem persists, please contact support
                  </span>
                </div>
                {this.state.errorCount > 1 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Error ID: {Date.now()}-{this.state.errorCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}