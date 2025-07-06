// Error page component

import React from 'react';
import { motion } from 'framer-motion';

interface ErrorPageProps {
  error?: string;
  onRetry?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ 
  error = 'Something went wrong', 
  onRetry 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="mb-8">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
        </div>
        
        <div className="space-y-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity w-full"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors w-full"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="mb-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <button
          onClick={() => window.location.href = '/'}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Go Home
        </button>
      </motion.div>
    </div>
  );
};