// Style Guide Content - Extracted from StyleGuideModalEnhanced
// Responsive content component for style guide management within unified modal

import React from 'react';

interface StyleGuideContentProps {
  activeVertical?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export const StyleGuideContent: React.FC<StyleGuideContentProps> = ({
  activeVertical,
  onClose,
  isMobile = false
}) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Style Guide Management
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Content will be migrated from StyleGuideModalEnhanced.tsx
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          This component is under development as part of the modal consolidation effort.
        </p>
      </div>
    </div>
  );
};