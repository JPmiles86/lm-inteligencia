/**
 * Provider Error Component - Handles AI provider-specific errors
 * Provides fallback options and provider switching
 */

import React from 'react';
import { AlertTriangle, Zap, CreditCard, Key, ToggleLeft } from 'lucide-react';
import { useAIStore } from '../../store/aiStore.js';

interface ProviderErrorProps {
  provider: string;
  error: Error;
  onRetry?: () => void;
  onSwitchProvider?: (provider: string) => void;
}

export const ProviderError: React.FC<ProviderErrorProps> = ({
  provider,
  error,
  onRetry,
  onSwitchProvider,
}) => {
  const { providers, setActiveProvider } = useAIStore();
  
  // Determine error type
  const isRateLimit = error.message?.includes('rate') || error.message?.includes('429');
  const isQuotaExceeded = error.message?.includes('quota') || error.message?.includes('limit');
  const isAuthError = error.message?.includes('401') || error.message?.includes('auth');
  const isBillingError = error.message?.includes('billing') || error.message?.includes('payment');
  const isModelError = error.message?.includes('model') || error.message?.includes('404');

  // Get available fallback providers
  const availableProviders = Object.entries(providers)
    .filter(([name, config]) => name !== provider && config.active)
    .map(([name]) => name);

  const handleSwitchProvider = (newProvider: string) => {
    setActiveProvider(newProvider);
    if (onSwitchProvider) {
      onSwitchProvider(newProvider);
    }
  };

  const getErrorIcon = () => {
    if (isRateLimit) return <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
    if (isBillingError) return <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />;
    if (isAuthError) return <Key className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
    return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />;
  };

  const getErrorTitle = () => {
    if (isRateLimit) return 'Rate Limit Exceeded';
    if (isQuotaExceeded) return 'Quota Exceeded';
    if (isAuthError) return 'Authentication Error';
    if (isBillingError) return 'Billing Issue';
    if (isModelError) return 'Model Not Available';
    return `${provider} Error`;
  };

  const getErrorMessage = () => {
    if (isRateLimit) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    if (isQuotaExceeded) {
      return 'You have exceeded your usage quota for this provider.';
    }
    if (isAuthError) {
      return 'Invalid API key or authentication failed. Please check your settings.';
    }
    if (isBillingError) {
      return 'There is a billing issue with this provider. Please check your account.';
    }
    if (isModelError) {
      return 'The requested model is not available or does not exist.';
    }
    return error.message || 'An error occurred with the AI provider.';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">{getErrorIcon()}</div>
        
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {getErrorTitle()}
          </h3>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getErrorMessage()}
          </p>

          {/* Provider Info */}
          <div className="mt-3 flex items-center text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Provider:
            </span>
            <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200">
              {provider}
            </span>
          </div>

          {/* Error Code if available */}
          {error.message && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                {error.message}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="mt-4 space-y-3">
            {/* Retry with same provider */}
            {onRetry && !isAuthError && !isBillingError && (
              <button
                onClick={onRetry}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Zap className="h-4 w-4 mr-2" />
                Retry with {provider}
              </button>
            )}

            {/* Switch to fallback provider */}
            {availableProviders.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Try with a different provider:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableProviders.map(altProvider => (
                    <button
                      key={altProvider}
                      onClick={() => handleSwitchProvider(altProvider)}
                      className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                    >
                      <ToggleLeft className="h-3 w-3 mr-1.5" />
                      Switch to {altProvider}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Settings link for auth errors */}
            {isAuthError && (
              <a
                href="/settings/providers"
                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <Key className="h-4 w-4 mr-1" />
                Go to Provider Settings
              </a>
            )}

            {/* Support message for billing errors */}
            {isBillingError && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please check your {provider} account billing status.
                </p>
              </div>
            )}

            {/* Rate limit timer */}
            {isRateLimit && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Rate limits typically reset within 1-60 seconds. Please wait before retrying.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};