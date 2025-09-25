// Content Planning Content - Extracted from ContentPlanningModal
// Responsive content component for structured content workflow within unified modal

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Loader2,
  RotateCcw,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { StructuredWorkflow } from '../../modules/StructuredWorkflow';
import { useAIStore } from '../../../../store/aiStore';

interface ContentPlanningContentProps {
  activeVertical?: string;
  onClose?: () => void;
  isMobile?: boolean;
  initialTopic?: string;
}

export const ContentPlanningContent: React.FC<ContentPlanningContentProps> = ({
  activeVertical,
  onClose,
  isMobile = false,
  initialTopic
}) => {
  // State management
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // AI Store
  const {
    addNotification,
    activeProvider,
    activeModel
  } = useAIStore();

  // Reset state when component mounts
  useEffect(() => {
    setCurrentStep(0);
    setIsGenerating(false);
  }, []);

  const handleContentGenerated = (content: any) => {
    addNotification({
      type: 'success',
      title: 'Content Generated',
      message: 'Your blog content has been created successfully',
      duration: 4000
    });
  };

  const handleReset = () => {
    setCurrentStep(0);
    addNotification({
      type: 'info',
      title: 'Workflow Reset',
      message: 'Starting over from the beginning',
      duration: 2000
    });
  };

  const workflowSteps = ['Brainstorm', 'Titles', 'Synopsis', 'Outline', 'Content'];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile header */}
      {isMobile && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content Planning
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  5-step guided workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Steps Indicator */}
      <div className={`flex-shrink-0 ${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200 dark:border-gray-700`}>
        <div className={`${isMobile ? 'space-y-2' : 'flex items-center justify-between'}`}>
          {isMobile ? (
            // Mobile: Vertical layout with current step highlighted
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress: Step {currentStep + 1} of {workflowSteps.length}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / workflowSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-medium">
                  {currentStep + 1}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {workflowSteps[currentStep]}
                </span>
              </div>
            </div>
          ) : (
            // Desktop: Horizontal layout
            workflowSteps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200
                  ${index <= currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm transition-colors duration-200 ${
                  index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step}
                </span>
                {index < workflowSteps.length - 1 && (
                  <ChevronRight className={`mx-3 h-4 w-4 transition-colors duration-200 ${
                    index < currentStep ? 'text-green-400' : 'text-gray-400 dark:text-gray-600'
                  }`} />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area - Structured Workflow */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <StructuredWorkflow
            initialTopic={initialTopic}
            onComplete={handleContentGenerated}
            className="h-full"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="h-4 w-4 text-green-500" />
            <span>Using {activeProvider} - {activeModel}</span>
          </div>

          <div className={`flex items-center gap-3 ${isMobile ? 'w-full justify-center' : ''}`}>
            <button
              onClick={handleReset}
              className={`${
                isMobile ? 'flex-1' : ''
              } px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]`}
              disabled={isGenerating}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>

            {isMobile && onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors min-h-[44px]"
                disabled={isGenerating}
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Mobile-specific additional info */}
        {isMobile && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Guided Workflow
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Follow the step-by-step process to create comprehensive blog content. Each step builds upon the previous ones for optimal results.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};