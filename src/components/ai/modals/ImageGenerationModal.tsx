/**
 * Image Generation Modal - Modal wrapper for the ImageGenerator component
 * Provides a dedicated modal interface for image generation workflows
 */

import React, { useState, useEffect } from 'react';
import { X, Image, Sparkles, Download, CheckCircle } from 'lucide-react';
import { ImageGenerator } from '../modules/ImageGenerator';
import { useAIStore } from '../../../store/aiStore';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogContent?: string;
  initialPrompt?: string;
  title?: string;
}

interface ModalStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  blogContent,
  initialPrompt,
  title = 'Generate Images'
}) => {
  // State management
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('generate');
  const [showResults, setShowResults] = useState(false);

  // AI Store
  const { 
    addNotification,
    generatingImages,
    currentGeneration,
    updateGenerationNode
  } = useAIStore();

  // Modal steps
  const steps: ModalStep[] = [
    {
      id: 'generate',
      title: 'Generate Images',
      description: 'Create images using Gemini 2.5 Flash',
      completed: generatedImages.length > 0
    },
    {
      id: 'review',
      title: 'Review & Select',
      description: 'Choose the best images',
      completed: showResults && generatedImages.some(img => img.selected)
    },
    {
      id: 'finalize',
      title: 'Finalize',
      description: 'Save and apply images',
      completed: false
    }
  ];

  // Close modal handler
  const handleClose = () => {
    if (generatingImages) {
      addNotification({
        type: 'warning',
        title: 'Generation in Progress',
        message: 'Please wait for image generation to complete',
        duration: 3000
      });
      return;
    }
    
    onClose();
    
    // Reset state when closing
    setTimeout(() => {
      setGeneratedImages([]);
      setCurrentStep('generate');
      setShowResults(false);
    }, 300);
  };

  // Handle successful image generation
  const handleImagesGenerated = (images: any[]) => {
    setGeneratedImages(images);
    setCurrentStep('review');
    setShowResults(true);
    
    // Update current generation node if available
    if (currentGeneration) {
      updateGenerationNode(currentGeneration.id, {
        structuredContent: {
          ...currentGeneration.structuredContent,
          imagePrompts: images.map((img, index) => ({
            id: img.id,
            originalText: img.caption,
            finalText: img.caption,
            position: index,
            type: img.placement,
            characterIds: [],
            styleReferenceIds: [],
            generatedImages: [img],
            generated: true
          }))
        }
      });
    }

    addNotification({
      type: 'success',
      title: 'Images Ready',
      message: `Generated ${images.length} images. Review and select your favorites.`,
      duration: 4000
    });
  };

  // Save selected images
  const handleSaveImages = () => {
    const selectedImages = generatedImages.filter(img => img.selected);
    
    if (selectedImages.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Images Selected',
        message: 'Please select at least one image to save',
        duration: 3000
      });
      return;
    }

    // Mark finalize step as completed
    setCurrentStep('finalize');
    
    addNotification({
      type: 'success',
      title: 'Images Saved',
      message: `Saved ${selectedImages.length} selected images`,
      duration: 3000
    });

    // Close modal after brief delay
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  // Download all selected images
  const handleDownloadAll = () => {
    const selectedImages = generatedImages.filter(img => img.selected);
    
    if (selectedImages.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Images Selected',
        message: 'Please select images to download',
        duration: 3000
      });
      return;
    }

    // Trigger downloads with delay between each
    selectedImages.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `gemini-image-${index + 1}-${image.style}.${image.mimeType.split('/')[1]}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });

    addNotification({
      type: 'success',
      title: 'Downloads Started',
      message: `Starting download of ${selectedImages.length} images`,
      duration: 3000
    });
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Image className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Powered by Google's Gemini 2.5 Flash
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={generatingImages}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step.completed 
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id 
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${
                      currentStep === step.id 
                        ? 'text-blue-600 dark:text-blue-400'
                        : step.completed
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {currentStep === 'generate' || currentStep === 'review' ? (
              <ImageGenerator
                blogContent={blogContent}
                onImagesGenerated={handleImagesGenerated}
              />
            ) : currentStep === 'finalize' ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Images Successfully Generated!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your images have been generated and are ready to use.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>✓ {generatedImages.length} images generated</p>
                    <p>✓ {generatedImages.filter(img => img.selected).length} images selected</p>
                    <p>✓ Ready for use in your content</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          {showResults && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {generatedImages.filter(img => img.selected).length} of {generatedImages.length} images selected
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownloadAll}
                    disabled={generatedImages.filter(img => img.selected).length === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 inline mr-2" />
                    Download Selected
                  </button>
                  
                  <button
                    onClick={handleSaveImages}
                    disabled={generatedImages.filter(img => img.selected).length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Sparkles className="h-4 w-4 inline mr-2" />
                    Save Images
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationModal;