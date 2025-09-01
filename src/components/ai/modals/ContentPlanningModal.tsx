/**
 * Content Planning Modal - Modal wrapper for the StructuredWorkflow component
 * Provides a 5-step guided workflow for comprehensive blog content creation
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
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
import { StructuredWorkflow } from '../modules/StructuredWorkflow';
import { useAIStore } from '../../../store/aiStore';
import { ModalTransition, ModalContent, ModalHeader, ModalFooter } from '../components/ModalTransition';
import { withErrorBoundary } from '../../ErrorBoundary';
import { ErrorFallback } from '../../errors/ErrorFallback';

interface ContentPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  onContentGenerated?: (content: any) => void;
}

const ContentPlanningModalBase: React.FC<ContentPlanningModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  onContentGenerated
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsGenerating(false);
    }
  }, [isOpen]);


  const handleClose = () => {
    if (isGenerating) {
      addNotification({
        type: 'warning',
        title: 'Generation in Progress',
        message: 'Please wait for the current generation to complete',
        duration: 3000
      });
      return;
    }
    onClose();
  };

  const handleContentGenerated = (content: any) => {
    if (onContentGenerated) {
      onContentGenerated(content);
    }
    addNotification({
      type: 'success',
      title: 'Content Generated',
      message: 'Your blog content has been created successfully',
      duration: 4000
    });
  };

  return (
    <ModalTransition 
      isOpen={isOpen} 
      onClose={handleClose}
      disableBackdropClick={isGenerating}
      disableEscapeKey={isGenerating}
    >
      <ModalContent maxWidth="7xl">
        <ModalHeader
          title="Content Planning Workflow"
          subtitle="5-step guided process for comprehensive blog creation"
          icon={<FileText className="h-6 w-6 text-purple-400" />}
          onClose={handleClose}
          closeDisabled={isGenerating}
        />

        {/* Workflow Steps Indicator */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {['Brainstorm', 'Titles', 'Synopsis', 'Outline', 'Content'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-800 text-gray-500'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-white' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < 4 && (
                  <ChevronRight className={`mx-2 h-4 w-4 ${
                    index < currentStep ? 'text-purple-400' : 'text-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <StructuredWorkflow 
            initialTopic={initialTopic}
            onComplete={handleContentGenerated}
          />
        </div>

        <ModalFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Using {activeProvider} - {activeModel}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentStep(0);
                addNotification({
                  type: 'info',
                  title: 'Workflow Reset',
                  message: 'Starting over from the beginning',
                  duration: 2000
                });
              }}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              disabled={isGenerating}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={isGenerating}
            >
              Close
            </button>
          </div>
        </ModalFooter>
      </ModalContent>
    </ModalTransition>
  );
};

// Export with error boundary
export const ContentPlanningModal = withErrorBoundary(ContentPlanningModalBase, {
  fallback: <ErrorFallback componentName="Content Planning Modal" />,
  isolate: true, // Don't crash entire app if modal fails
  onError: (error, errorInfo) => {
    console.error('ContentPlanningModal Error:', error, errorInfo);
  },
});