/**
 * Error Fallback Component - Main error display for users
 * Provides user-friendly error messages and recovery options
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  componentName?: string;
  compact?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  componentName,
  compact = false,
}) => {
  if (compact) {
    // Compact version for component-level errors
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {componentName ? `Error in ${componentName}` : 'Component Error'}
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error?.message || 'An unexpected error occurred'}
            </p>
            {resetError && (
              <button
                onClick={resetError}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full page error fallback
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error?.message || 'We encountered an unexpected error. Please try again.'}
        </p>

        <div className="space-y-3">
          {resetError && (
            <button
              onClick={resetError}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};