// Step Progress Component - Visual progress indicator for structured workflow
// Shows current step, completion status, and estimated time for each step

import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock,
  ArrowRight,
  Lightbulb,
  Type,
  FileText,
  List,
  Zap,
  AlertCircle
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  estimatedMinutes?: number;
  optional?: boolean;
  icon?: React.ReactNode;
}

interface StepProgressProps {
  steps: WorkflowStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  showEstimates?: boolean;
  showDescriptions?: boolean;
  allowNavigation?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
  layout = 'horizontal',
  showEstimates = true,
  showDescriptions = false,
  allowNavigation = true
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  const getStepIcon = (step: WorkflowStep, index: number) => {
    if (step.icon) {
      return step.icon;
    }

    // Default icons based on step status
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5" />;
    }
    
    if (step.status === 'error') {
      return <AlertCircle className="h-5 w-5" />;
    }

    if (step.status === 'current') {
      return <Circle className="h-5 w-5 animate-pulse" />;
    }

    return <Circle className="h-5 w-5" />;
  };

  const getStepColor = (step: WorkflowStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'current':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return index < currentIndex 
          ? 'text-green-600 bg-green-50 border-green-200'
          : 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getConnectorColor = (fromIndex: number) => {
    const fromStep = steps[fromIndex];
    const toStep = steps[fromIndex + 1];
    
    if (fromStep.status === 'completed' && toStep.status === 'completed') {
      return 'bg-green-200';
    }
    
    if (fromStep.status === 'completed') {
      return 'bg-gradient-to-r from-green-200 to-gray-200';
    }
    
    return 'bg-gray-200';
  };

  const canNavigateToStep = (stepIndex: number) => {
    if (!allowNavigation) return false;
    
    // Can navigate to any completed step or the current step
    return stepIndex <= currentIndex || steps[stepIndex].status === 'completed';
  };

  const handleStepClick = (step: WorkflowStep, index: number) => {
    if (canNavigateToStep(index) && onStepClick) {
      onStepClick(step.id);
    }
  };

  if (layout === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            {/* Step Icon */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!canNavigateToStep(index)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${getStepColor(step, index)}
                  ${canNavigateToStep(index) ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  ${step.status === 'current' ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
                `}
              >
                {getStepIcon(step, index)}
              </button>
              
              {/* Vertical Connector */}
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 mt-2 ${getConnectorColor(index)}`} />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center space-x-2">
                <h3 className={`text-sm font-medium ${
                  step.status === 'current' ? 'text-blue-900' : 
                  step.status === 'completed' ? 'text-green-900' :
                  step.status === 'error' ? 'text-red-900' :
                  'text-gray-700'
                }`}>
                  {step.title}
                  {step.optional && (
                    <span className="ml-1 text-xs text-gray-500">(optional)</span>
                  )}
                </h3>
                
                {showEstimates && step.estimatedMinutes && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {step.estimatedMinutes}m
                  </div>
                )}
              </div>
              
              {showDescriptions && (
                <p className="text-xs text-gray-600 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleStepClick(step, index)}
              disabled={!canNavigateToStep(index)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all mb-2
                ${getStepColor(step, index)}
                ${canNavigateToStep(index) ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                ${step.status === 'current' ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
              `}
              title={step.description}
            >
              {getStepIcon(step, index)}
            </button>
            
            <div className="text-center min-w-0">
              <div className={`text-xs font-medium mb-1 ${
                step.status === 'current' ? 'text-blue-900' : 
                step.status === 'completed' ? 'text-green-900' :
                step.status === 'error' ? 'text-red-900' :
                'text-gray-700'
              }`}>
                {step.title}
                {step.optional && (
                  <span className="block text-gray-500">(optional)</span>
                )}
              </div>
              
              {showEstimates && step.estimatedMinutes && (
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {step.estimatedMinutes}m
                </div>
              )}
              
              {showDescriptions && (
                <p className="text-xs text-gray-600 mt-1 max-w-20">
                  {step.description}
                </p>
              )}
            </div>
          </div>

          {/* Horizontal Connector */}
          {index < steps.length - 1 && (
            <div className="flex-1 flex items-center">
              <div className={`h-0.5 flex-1 ${getConnectorColor(index)}`} />
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Default workflow steps for blog creation
export const defaultBlogWorkflowSteps: WorkflowStep[] = [
  {
    id: 'ideation',
    title: 'Ideation',
    description: 'Generate and select blog post ideas',
    status: 'pending',
    estimatedMinutes: 3,
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: 'title',
    title: 'Title',
    description: 'Create compelling titles with SEO optimization',
    status: 'pending',
    estimatedMinutes: 2,
    icon: <Type className="h-5 w-5" />
  },
  {
    id: 'synopsis',
    title: 'Synopsis',
    description: 'Write engaging summaries and descriptions',
    status: 'pending',
    estimatedMinutes: 2,
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'outline',
    title: 'Outline',
    description: 'Structure content with detailed sections',
    status: 'pending',
    estimatedMinutes: 4,
    icon: <List className="h-5 w-5" />
  },
  {
    id: 'content',
    title: 'Content',
    description: 'Generate complete blog post content',
    status: 'pending',
    estimatedMinutes: 5,
    icon: <Zap className="h-5 w-5" />
  }
];

// Helper functions
export const updateStepStatus = (
  steps: WorkflowStep[], 
  stepId: string, 
  status: WorkflowStep['status']
): WorkflowStep[] => {
  return steps.map(step => 
    step.id === stepId ? { ...step, status } : step
  );
};

export const getNextStep = (steps: WorkflowStep[], currentStepId: string): WorkflowStep | null => {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === steps.length - 1) return null;
  return steps[currentIndex + 1];
};

export const getPreviousStep = (steps: WorkflowStep[], currentStepId: string): WorkflowStep | null => {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  if (currentIndex <= 0) return null;
  return steps[currentIndex - 1];
};

export const getTotalEstimatedTime = (steps: WorkflowStep[]): number => {
  return steps.reduce((total, step) => total + (step.estimatedMinutes || 0), 0);
};

export const getCompletedSteps = (steps: WorkflowStep[]): WorkflowStep[] => {
  return steps.filter(step => step.status === 'completed');
};

export const getProgressPercentage = (steps: WorkflowStep[]): number => {
  const completedCount = getCompletedSteps(steps).length;
  return (completedCount / steps.length) * 100;
};