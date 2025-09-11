import React, { useState, useEffect } from 'react';
import { ImagePromptCard } from './ImagePromptCard';
import { imagePromptExtractor, ImagePrompt } from '@/services/ai/ImagePromptExtractor';
import { Wand2, Download, Eye, Image as ImageIcon } from 'lucide-react';

interface ImagePromptManagerProps {
  content: string;
  onContentUpdate: (content: string) => void;
  onImagesGenerated?: (images: Array<{ promptId: string; url: string }>) => void;
}

export const ImagePromptManager: React.FC<ImagePromptManagerProps> = ({
  content,
  onContentUpdate,
  onImagesGenerated
}) => {
  const [prompts, setPrompts] = useState<ImagePrompt[]>([]);
  const [contentWithPlaceholders, setContentWithPlaceholders] = useState('');
  const [generatedImages, setGeneratedImages] = useState<Map<string, string>>(new Map());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    // Extract prompts when content changes
    const result = imagePromptExtractor.extractPrompts(content);
    setPrompts(result.prompts);
    setContentWithPlaceholders(result.contentWithPlaceholders);
  }, [content]);
  
  const handleGenerateImage = async (prompt: ImagePrompt) => {
    try {
      // Call appropriate image generation service
      const provider = await selectImageProvider();
      const response = await fetch('/api/ai/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.enhancedPrompt || prompt.originalPrompt,
          provider,
          config: {
            size: prompt.suggestedSize,
            quality: prompt.metadata?.importance === 'primary' ? 'hd' : 'standard'
          }
        })
      });
      
      const data = await response.json();
      if (data.success && data.urls?.length > 0) {
        const newImages = new Map(generatedImages);
        newImages.set(prompt.id, data.urls[0]);
        setGeneratedImages(newImages);
        
        // Update content with image
        updateContentWithImage(prompt.id, data.urls[0]);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    }
  };
  
  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      const images: Array<{ promptId: string; url: string }> = [];
      
      for (const prompt of prompts) {
        if (!generatedImages.has(prompt.id)) {
          await handleGenerateImage(prompt);
          const url = generatedImages.get(prompt.id);
          if (url) {
            images.push({ promptId: prompt.id, url });
          }
        }
      }
      
      if (onImagesGenerated) {
        onImagesGenerated(images);
      }
    } finally {
      setIsGeneratingAll(false);
    }
  };
  
  const handleUpdatePrompt = (updatedPrompt: ImagePrompt) => {
    setPrompts(prompts.map(p => 
      p.id === updatedPrompt.id ? updatedPrompt : p
    ));
  };
  
  const handleDeletePrompt = (promptId: string) => {
    setPrompts(prompts.filter(p => p.id !== promptId));
    
    // Remove from generated images
    const newImages = new Map(generatedImages);
    newImages.delete(promptId);
    setGeneratedImages(newImages);
    
    // Remove placeholder from content
    const placeholder = `{{IMAGE_PLACEHOLDER_${promptId}}}`;
    const updatedContent = contentWithPlaceholders.replace(placeholder, '');
    setContentWithPlaceholders(updatedContent);
  };
  
  const updateContentWithImage = (promptId: string, url: string) => {
    const images = Array.from(generatedImages.entries()).map(([id, imgUrl]) => ({
      promptId: id,
      url: imgUrl
    }));
    
    // Add new image
    images.push({ promptId, url });
    
    // Embed all images into content
    const finalContent = imagePromptExtractor.embedImages(
      contentWithPlaceholders,
      images
    );
    
    onContentUpdate(finalContent);
  };
  
  const selectImageProvider = async (): Promise<string> => {
    // Check available providers with image capability
    const response = await fetch('/api/ai/providers/capabilities');
    const capabilities = await response.json();
    
    // Prefer Google (Gemini) for native image generation
    if (capabilities.google?.image) return 'google';
    // Fallback to OpenAI (DALL-E)
    if (capabilities.openai?.image) return 'openai';
    
    throw new Error('No image generation provider available');
  };
  
  const exportImages = () => {
    const imageData = Array.from(generatedImages.entries()).map(([id, url]) => {
      const prompt = prompts.find(p => p.id === id);
      return {
        id,
        url,
        prompt: prompt?.originalPrompt,
        enhancedPrompt: prompt?.enhancedPrompt
      };
    });
    
    const blob = new Blob([JSON.stringify(imageData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-images.json';
    a.click();
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Image Prompts ({prompts.length})
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          {generatedImages.size > 0 && (
            <button
              onClick={exportImages}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
          <button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || prompts.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            <span>Generate All</span>
          </button>
        </div>
      </div>
      
      {/* Preview */}
      {showPreview && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium mb-2">Content Preview</h4>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: contentWithPlaceholders.replace(
                /{{IMAGE_PLACEHOLDER_[^}]+}}/g,
                '<div class="bg-gray-200 p-4 text-center rounded">Image Placeholder</div>'
              )
            }}
          />
        </div>
      )}
      
      {/* Prompt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map(prompt => (
          <ImagePromptCard
            key={prompt.id}
            prompt={prompt}
            onGenerate={handleGenerateImage}
            onUpdate={handleUpdatePrompt}
            onDelete={handleDeletePrompt}
            imageUrl={generatedImages.get(prompt.id)}
            loading={isGeneratingAll}
          />
        ))}
      </div>
      
      {/* Empty State */}
      {prompts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="h-12 w-12 mx-auto mb-3 text-gray-300">
            <ImageIcon className="h-full w-full" />
          </div>
          <p>No image prompts found in content</p>
          <p className="text-sm mt-1">
            Add [IMAGE_PROMPT: description] to your content
          </p>
        </div>
      )}
    </div>
  );
};