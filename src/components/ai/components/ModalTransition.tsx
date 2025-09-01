/**
 * Modal Transition Wrapper - Provides consistent animations for all modals
 * Includes fade-in/out, scale, and backdrop blur transitions
 */

import React, { useEffect, useState } from 'react';

interface ModalTransitionProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  disableBackdropClick?: boolean;
  disableEscapeKey?: boolean;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  disableBackdropClick = false,
  disableEscapeKey = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after a brief delay to ensure CSS transition works
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!disableEscapeKey && isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, disableEscapeKey]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with animation */}
      <div 
        className={`
          absolute inset-0 bg-black transition-all duration-300 ease-out
          ${isAnimating 
            ? 'bg-opacity-50 backdrop-blur-sm' 
            : 'bg-opacity-0 backdrop-blur-none'
          }
        `}
        onClick={!disableBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal content with scale and fade animation */}
      <div 
        className={`
          relative transition-all duration-300 ease-out transform
          ${isAnimating 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
          }
        `}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Modal Content Wrapper - Provides consistent styling for modal content
 */
interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className = '',
  maxWidth = '2xl',
}) => {
  const widthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  return (
    <div 
      className={`
        w-full ${widthClasses[maxWidth]} max-h-[90vh] 
        bg-white dark:bg-gray-900 
        rounded-xl shadow-2xl overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * Modal Header - Consistent header styling for modals
 */
interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  closeDisabled = false,
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <button
        onClick={onClose}
        disabled={closeDisabled}
        className={`
          p-2 rounded-lg transition-colors
          ${closeDisabled 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        aria-label="Close modal"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Modal Footer - Consistent footer styling for modals
 */
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`
      flex items-center justify-end gap-3 
      p-6 border-t border-gray-200 dark:border-gray-800 
      bg-gray-50 dark:bg-gray-900/50
      ${className}
    `}>
      {children}
    </div>
  );
};