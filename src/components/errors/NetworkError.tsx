/**
 * Network Error Component - Handles network-related errors
 * Provides offline detection and retry mechanisms
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Cloud, AlertTriangle } from 'lucide-react';

interface NetworkErrorProps {
  onRetry?: () => void;
  error?: Error;
  endpoint?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  error,
  endpoint,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      try {
        await onRetry();
      } catch (err) {
        console.error('Retry failed:', err);
      } finally {
        setIsRetrying(false);
      }
    }
  };

  // Determine error type
  const isTimeout = error?.message?.toLowerCase().includes('timeout');
  const isConnectionRefused = error?.message?.toLowerCase().includes('refused');
  const isServerError = error?.message?.includes('50') || error?.message?.includes('500');

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {!isOnline ? (
            <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
          ) : isServerError ? (
            <Cloud className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {!isOnline
              ? 'No Internet Connection'
              : isTimeout
              ? 'Request Timeout'
              : isServerError
              ? 'Server Error'
              : 'Connection Problem'}
          </h3>
          
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {!isOnline ? (
              <p>Please check your internet connection and try again.</p>
            ) : isTimeout ? (
              <p>The request took too long to complete. The server might be busy.</p>
            ) : isServerError ? (
              <p>The server encountered an error. Please try again later.</p>
            ) : (
              <p>{error?.message || 'Unable to connect to the server.'}</p>
            )}
            
            {endpoint && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Endpoint: {endpoint}
              </p>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mt-3 flex items-center text-sm">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-gray-600 dark:text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {retryCount > 0 && (
              <span className="ml-3 text-gray-500 dark:text-gray-500">
                Retry attempts: {retryCount}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center space-x-3">
            {onRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying || !isOnline}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isRetrying || !isOnline
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            )}
            
            {!isOnline && (
              <span className="text-sm text-gray-500 dark:text-gray-500">
                Waiting for connection...
              </span>
            )}
          </div>

          {/* Auto-retry indicator */}
          {isOnline && retryCount < 3 && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              Will automatically retry in a few seconds...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};