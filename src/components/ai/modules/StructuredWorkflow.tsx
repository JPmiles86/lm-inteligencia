// Structured Workflow Component - 5-step guided blog creation workflow
// Integrates BrainstormingModule, TitleGenerator, SynopsisGenerator, OutlineGenerator, and final content generation

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore, StructuredWorkflowState, WorkflowStep, GenerationConfig } from '../../../store/aiStore';
import { StepProgress, defaultBlogWorkflowSteps } from '../components/StepProgress';
import { BrainstormingModule } from './BrainstormingModule';
import { TitleGenerator } from './TitleGenerator';
import { SynopsisGenerator } from './SynopsisGenerator';
import { OutlineGenerator } from './OutlineGenerator';
import { aiGenerationService } from '../../../services/ai/AIGenerationService';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  Play,
  RotateCcw,
  Save,
  Download,
  Eye,
  Edit,
  Zap
} from 'lucide-react';

interface StructuredWorkflowProps {
  initialTopic?: string;
  onComplete?: (result: any) => void;
  className?: string;
}

export const StructuredWorkflow: React.FC<StructuredWorkflowProps> = ({
  initialTopic = '',
  onComplete,
  className = ''
}) => {
  const {
    structuredWorkflows,
    activeWorkflow,
    workflowLoading,
    createWorkflow,
    updateWorkflow,
    setActiveWorkflow,
    updateWorkflowStep,
    updateWorkflowStepData,
    navigateToStep,
    completeWorkflowStep,
    resetWorkflow,
    setWorkflowLoading,
    addNotification,
    updateAnalytics,
    updateProviderUsage,
    activeProvider,
    activeModel
  } = useAIStore();

  // Local state
  const [previewMode, setPreviewMode] = useState(false);
  const [finalContent, setFinalContent] = useState('');
  const [generatingFinal, setGeneratingFinal] = useState(false);

  // Get current workflow
  const workflow = activeWorkflow ? structuredWorkflows[activeWorkflow] : null;
  const currentStep = workflow?.steps.find(step => step.id === workflow.currentStepId);
  const currentStepIndex = workflow?.steps.findIndex(step => step.id === workflow.currentStepId) || 0;

  // Initialize workflow
  useEffect(() => {
    if (!activeWorkflow) {
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionId = `session_${Date.now()}`;
      
      const newWorkflow: StructuredWorkflowState = {
        id: workflowId,
        sessionId,
        steps: defaultBlogWorkflowSteps.map(step => ({ ...step })),
        currentStepId: 'ideation',
        isActive: true,
        startedAt: new Date().toISOString(),
        totalEstimatedMinutes: 16, // Sum of all step estimates
        stepData: {
          ideation: {
            topic: initialTopic
          }
        }
      };

      // Set first step as current
      newWorkflow.steps[0].status = 'current';

      createWorkflow(newWorkflow);
      setActiveWorkflow(workflowId);

      addNotification({
        type: 'info',
        title: 'Workflow Started',
        message: 'Ready to create your blog post step by step',
        duration: 4000
      });
    }
  }, [activeWorkflow, createWorkflow, setActiveWorkflow, initialTopic, addNotification]);

  // Navigation handlers
  const handleStepNavigation = useCallback((stepId: string) => {
    if (!workflow) return;
    
    const targetIndex = workflow.steps.findIndex(step => step.id === stepId);
    const currentIndex = workflow.steps.findIndex(step => step.id === workflow.currentStepId);
    
    // Allow navigation to completed steps or the next step
    if (targetIndex <= currentIndex || workflow.steps[targetIndex].status === 'completed') {
      navigateToStep(workflow.id, stepId);
    } else {
      addNotification({
        type: 'warning',
        title: 'Step Not Available',
        message: 'Complete the current step to proceed to the next one',
        duration: 3000
      });
    }
  }, [workflow, navigateToStep, addNotification]);

  const handleNextStep = useCallback(() => {
    if (!workflow || currentStepIndex >= workflow.steps.length - 1) return;
    
    const nextStep = workflow.steps[currentStepIndex + 1];
    if (nextStep) {
      completeWorkflowStep(workflow.id, workflow.currentStepId);
    }
  }, [workflow, currentStepIndex, completeWorkflowStep]);

  const handlePreviousStep = useCallback(() => {
    if (!workflow || currentStepIndex <= 0) return;
    
    const previousStep = workflow.steps[currentStepIndex - 1];
    if (previousStep) {
      navigateToStep(workflow.id, previousStep.id);
    }
  }, [workflow, currentStepIndex, navigateToStep]);

  // Step completion handlers
  const handleIdeationComplete = useCallback((selectedIdea: any) => {
    if (!workflow) return;
    
    updateWorkflowStepData(workflow.id, 'ideation', {
      selectedIdea,
      topic: selectedIdea.title
    });
    
    updateWorkflowStepData(workflow.id, 'title', {
      topic: selectedIdea.title,
      context: selectedIdea.description
    });
    
    handleNextStep();
  }, [workflow, updateWorkflowStepData, handleNextStep]);

  const handleTitleComplete = useCallback((selectedTitles: any[]) => {
    if (!workflow) return;
    
    updateWorkflowStepData(workflow.id, 'title', {
      selectedTitles,
      topic: workflow.stepData.ideation?.topic || '',
      context: workflow.stepData.ideation?.selectedIdea?.description || ''
    });
    
    updateWorkflowStepData(workflow.id, 'synopsis', {
      topic: workflow.stepData.ideation?.topic || '',
      title: selectedTitles[0]?.title || '',
      context: workflow.stepData.ideation?.selectedIdea?.description || ''
    });
    
    handleNextStep();
  }, [workflow, updateWorkflowStepData, handleNextStep]);

  const handleSynopsisComplete = useCallback((selectedSynopses: any[]) => {
    if (!workflow) return;
    
    updateWorkflowStepData(workflow.id, 'synopsis', {
      selectedSynopses,
      topic: workflow.stepData.ideation?.topic || '',
      title: workflow.stepData.title?.selectedTitles?.[0]?.title || '',
      context: workflow.stepData.ideation?.selectedIdea?.description || ''
    });
    
    updateWorkflowStepData(workflow.id, 'outline', {
      topic: workflow.stepData.ideation?.topic || '',
      title: workflow.stepData.title?.selectedTitles?.[0]?.title || '',
      synopsis: selectedSynopses[0]?.synopsis || '',
      targetWordCount: 1500
    });
    
    handleNextStep();
  }, [workflow, updateWorkflowStepData, handleNextStep]);

  const handleOutlineComplete = useCallback((selectedOutlines: any[]) => {
    if (!workflow) return;
    
    updateWorkflowStepData(workflow.id, 'outline', {
      selectedOutlines,
      topic: workflow.stepData.ideation?.topic || '',
      title: workflow.stepData.title?.selectedTitles?.[0]?.title || '',
      synopsis: workflow.stepData.synopsis?.selectedSynopses?.[0]?.synopsis || '',
      targetWordCount: 1500
    });
    
    updateWorkflowStepData(workflow.id, 'content', {
      generationConfig: {
        idea: workflow.stepData.ideation?.selectedIdea,
        title: workflow.stepData.title?.selectedTitles?.[0]?.title,
        synopsis: workflow.stepData.synopsis?.selectedSynopses?.[0]?.synopsis,
        outline: selectedOutlines[0]
      }
    });
    
    handleNextStep();
  }, [workflow, updateWorkflowStepData, handleNextStep]);

  // Final content generation
  const handleGenerateFinalContent = useCallback(async () => {
    if (!workflow) return;
    
    setGeneratingFinal(true);
    setWorkflowLoading(true);
    
    try {
      const generationConfig: GenerationConfig = {
        mode: 'structured' as const,
        vertical: 'all',
        task: 'blog',
        prompt: `Generate a complete blog post based on the following structured workflow:
        
Title: ${workflow.stepData.title?.selectedTitles?.[0]?.title || ''}
Synopsis: ${workflow.stepData.synopsis?.selectedSynopses?.[0]?.synopsis || ''}
Outline: ${JSON.stringify(workflow.stepData.outline?.selectedOutlines?.[0]?.sections || [])}
        
Create engaging, well-structured content that follows the outline and matches the synopsis.`,
        context: {
          styleGuides: { brand: true, vertical: [], writingStyle: [], persona: [] },
          previousContent: { mode: 'none', includeElements: { titles: true, synopsis: true, content: false, tags: true, metadata: false, images: false } },
          referenceImages: { style: [], logo: [], persona: [] },
          additionalContext: ''
        },
        provider: activeProvider as 'openai' | 'anthropic' | 'google' | 'perplexity',
        model: activeModel,
        outputCount: 1
      };

      const response = await aiGenerationService.generateContent(generationConfig);
      
      if (response.success && response.data) {
        setFinalContent(response.data.content || '');
        
        updateWorkflowStepData(workflow.id, 'content', {
          finalContent: response.data.content,
          generationMetadata: {
            tokensUsed: response.tokensUsed,
            cost: response.cost,
            duration: response.durationMs
          }
        });
        
        // Update analytics
        updateAnalytics({
          tokens: response.tokensUsed,
          cost: response.cost,
          generations: 1
        });

        updateProviderUsage(activeProvider, response.tokensUsed || 0, response.cost || 0);
        
        completeWorkflowStep(workflow.id, workflow.currentStepId);
        
        addNotification({
          type: 'success',
          title: 'Blog Generated',
          message: 'Your complete blog post has been generated successfully!',
          duration: 5000
        });

        // Call completion callback
        onComplete?.({
          workflow,
          content: response.data.content,
          metadata: response.data
        });
        
      } else {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: response.error || 'Failed to generate final content',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('[StructuredWorkflow] Final generation error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate final content. Please try again.',
        duration: 5000
      });
    } finally {
      setGeneratingFinal(false);
      setWorkflowLoading(false);
    }
  }, [workflow, activeProvider, activeModel, updateWorkflowStepData, updateAnalytics, updateProviderUsage, completeWorkflowStep, addNotification, onComplete, setWorkflowLoading]);

  // Reset workflow
  const handleResetWorkflow = useCallback(() => {
    if (!workflow) return;
    
    resetWorkflow(workflow.id);
    setFinalContent('');
    setPreviewMode(false);
    
    addNotification({
      type: 'info',
      title: 'Workflow Reset',
      message: 'Starting fresh with a new workflow',
      duration: 3000
    });
  }, [workflow, resetWorkflow, addNotification]);

  // Save workflow progress
  const handleSaveProgress = useCallback(() => {
    if (!workflow) return;
    
    // In a real app, this would save to backend
    localStorage.setItem(`structured-workflow-${workflow.id}`, JSON.stringify(workflow));
    
    addNotification({
      type: 'success',
      title: 'Progress Saved',
      message: 'Workflow progress saved successfully',
      duration: 3000
    });
  }, [workflow, addNotification]);

  // Export final content
  const handleExportContent = useCallback(() => {
    if (!finalContent) return;
    
    const blob = new Blob([finalContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `structured-blog-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Content Exported',
      message: 'Blog content downloaded successfully',
      duration: 3000
    });
  }, [finalContent, addNotification]);

  if (!workflow) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Initializing structured workflow...</p>
        </div>
      </div>
    );
  }

  const isCompleted = workflow.completedAt !== undefined;
  const canGoNext = currentStepIndex < workflow.steps.length - 1 && currentStep?.status === 'current';
  const canGoPrevious = currentStepIndex > 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Structured Blog Workflow
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step-by-step guided blog creation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </div>
            )}
            
            <button
              onClick={handleSaveProgress}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Save progress"
            >
              <Save className="h-4 w-4" />
            </button>

            <button
              onClick={handleResetWorkflow}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Reset workflow"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {finalContent && (
              <>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Toggle preview"
                >
                  {previewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                <button
                  onClick={handleExportContent}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Export content"
                >
                  <Download className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Step Progress */}
        <StepProgress
          steps={workflow.steps}
          currentStep={workflow.currentStepId}
          onStepClick={handleStepNavigation}
          layout="horizontal"
          showEstimates={true}
          allowNavigation={true}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {previewMode && finalContent ? (
          /* Preview Mode */
          <div className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: finalContent }} />
            </div>
          </div>
        ) : (
          /* Step Content */
          <div className="p-6">
            {currentStep?.id === 'ideation' && (
              <BrainstormingModule
                onConvertToBlogs={(ideas) => {
                  if (ideas.length > 0) {
                    handleIdeationComplete(ideas[0]);
                  }
                }}
                className="border-0 shadow-none"
              />
            )}

            {currentStep?.id === 'title' && (
              <TitleGenerator
                topic={workflow.stepData.ideation?.topic || ''}
                context={workflow.stepData.ideation?.selectedIdea?.description || ''}
                onMultipleTitlesSelected={handleTitleComplete}
                mode="structured"
                className="border-0 shadow-none"
              />
            )}

            {currentStep?.id === 'synopsis' && (
              <SynopsisGenerator
                topic={workflow.stepData.ideation?.topic || ''}
                title={workflow.stepData.title?.selectedTitles?.[0]?.title || ''}
                context={workflow.stepData.ideation?.selectedIdea?.description || ''}
                onMultipleSynopsisSelected={handleSynopsisComplete}
                mode="structured"
                className="border-0 shadow-none"
              />
            )}

            {currentStep?.id === 'outline' && (
              <OutlineGenerator
                topic={workflow.stepData.ideation?.topic || ''}
                title={workflow.stepData.title?.selectedTitles?.[0]?.title || ''}
                synopsis={workflow.stepData.synopsis?.selectedSynopses?.[0]?.synopsis || ''}
                targetWordCount={workflow.stepData.outline?.targetWordCount || 1500}
                onMultipleOutlinesSelected={handleOutlineComplete}
                mode="structured"
                className="border-0 shadow-none"
              />
            )}

            {currentStep?.id === 'content' && (
              <div className="text-center space-y-6">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Ready to Generate Your Blog
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    All steps completed! Generate your final blog post using the structured content you've created.
                  </p>

                  {/* Summary */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8 text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Workflow Summary:
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Topic:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {workflow.stepData.ideation?.topic}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Title:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {workflow.stepData.title?.selectedTitles?.[0]?.title}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Sections:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {workflow.stepData.outline?.selectedOutlines?.[0]?.totalSections || 0} sections
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Est. Words:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          ~{workflow.stepData.outline?.selectedOutlines?.[0]?.estimatedWords || 1500} words
                        </span>
                      </div>
                    </div>
                  </div>

                  {finalContent ? (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                      <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 mb-4">
                        <CheckCircle className="h-6 w-6" />
                        <span className="text-lg font-semibold">Blog Generated Successfully!</span>
                      </div>
                      <p className="text-green-700 dark:text-green-300 mb-4">
                        Your complete blog post is ready. You can preview, edit, or export it.
                      </p>
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() => setPreviewMode(true)}
                          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Blog
                        </button>
                        <button
                          onClick={handleExportContent}
                          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateFinalContent}
                      disabled={generatingFinal}
                      className="flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed min-w-[200px]"
                    >
                      {generatingFinal ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Generate Blog
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      {!previewMode && (
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePreviousStep}
            disabled={!canGoPrevious}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStepIndex + 1} of {workflow.steps.length}
          </div>

          <button
            onClick={handleNextStep}
            disabled={!canGoNext}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};