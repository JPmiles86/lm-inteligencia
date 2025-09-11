/**
 * Image Generator Module - Generate images using Google's Gemini 2.5 Flash
 * Supports blog-based image generation, custom prompts, and multiple styles
 */

import React, { useState, useEffect } from 'react';
import type { GeneratedImage, ImageGenerationResult } from '@/types/image';
import { 
  Image, 
  Download, 
  RefreshCw, 
  Palette, 
  Sparkles, 
  Eye,
  Heart,
  Trash2,
  Copy,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
  Zap
} from 'lucide-react';
import { useAIStore } from '../../../store/aiStore.js';
import { GeminiImageService } from '../../../services/ai/GeminiImageService.js';

interface ImageGeneratorProps {
  blogContent?: string;
  onImagesGenerated?: (images: any[]) => void;
  onClose?: () => void;
}


export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  blogContent,
  onImagesGenerated,
  onClose,
}) => {
  // State management
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [imageCount, setImageCount] = useState(4);
  const [customPrompt, setCustomPrompt] = useState('');
  const [vertical, setVertical] = useState('general');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [favoriteImages, setFavoriteImages] = useState<Set<string>>(new Set());
  const [apiKey, setApiKey] = useState('');
  
  // Advanced options
  const [imageTypes, setImageTypes] = useState(['hero', 'section', 'illustration']);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quality, setQuality] = useState('high');

  // AI Store
  const {
    addNotification,
    updateAnalytics,
    setGeneratingImages,
    providers
  } = useAIStore();

  // Service instance
  const [geminiService] = useState(() => new GeminiImageService());

  // Available options
  const styleOptions = [
    { value: 'photorealistic', label: 'Photorealistic', description: 'Natural photography style' },
    { value: 'illustration', label: 'Illustration', description: 'Digital illustration with clean lines' },
    { value: 'cartoon', label: 'Cartoon', description: 'Friendly animated style' },
    { value: 'abstract', label: 'Abstract', description: 'Artistic and conceptual' },
    { value: 'infographic', label: 'Infographic', description: 'Data visualization style' }
  ];

  const verticalOptions = [
    { value: 'general', label: 'General Business' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'tech', label: 'Technology' },
    { value: 'athletics', label: 'Sports & Athletics' }
  ];

  const imageTypeOptions = [
    { value: 'hero', label: 'Hero Image', description: 'Main header image' },
    { value: 'section', label: 'Section Image', description: 'Supporting section visuals' },
    { value: 'illustration', label: 'Illustration', description: 'Explanatory diagrams' },
    { value: 'infographic', label: 'Infographic', description: 'Data visualizations' },
    { value: 'footer', label: 'Footer Image', description: 'Concluding visuals' }
  ];

  // Initialize API key from providers
  useEffect(() => {
    const googleProvider = providers.google;
    if (googleProvider?.apiKey) {
      setApiKey(googleProvider.apiKey);
      geminiService.initialize(googleProvider.apiKey);
    }
  }, [providers, geminiService]);

  // Generate images from blog content
  const generateFromBlog = async () => {
    if (!blogContent?.trim()) {
      setError('Blog content is required for generation');
      addNotification({
        type: 'error',
        title: 'Missing Content',
        message: 'Please provide blog content to generate images from',
        duration: 3000
      });
      return;
    }

    if (!apiKey) {
      setError('Gemini API key is required');
      addNotification({
        type: 'error',
        title: 'Missing API Key',
        message: 'Please configure your Gemini API key in provider settings',
        duration: 3000
      });
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratingImages(true);
    
    try {
      console.log('[ImageGenerator] Starting blog image generation');
      
      const result = await geminiService.generateBlogImages(blogContent, {
        imageCount: imageCount,
        style: selectedStyle,
        vertical: vertical,
        imageTypes: imageTypes
      });

      if (result.success && result.images.length > 0) {
        setImages(result.images);
        
        // Select all images by default
        setSelectedImages(new Set(result.images.map((img: GeneratedImage) => img.id)));
        
        // Update analytics
        updateAnalytics({
          tokens: result.tokensUsed || 0,
          cost: result.cost || 0,
          generations: 1
        });

        // Notify parent component
        if (onImagesGenerated) {
          onImagesGenerated(result.images);
        }

        addNotification({
          type: 'success',
          title: 'Images Generated',
          message: `Successfully generated ${result.images.length} images with Gemini 2.5 Flash`,
          duration: 4000
        });

        console.log('[ImageGenerator] Generated images:', result.images.length);
      } else {
        throw new Error(result.error || 'No images were generated');
      }
    } catch (error) {
      console.error('[ImageGenerator] Error generating images:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    } finally {
      setLoading(false);
      setGeneratingImages(false);
    }
  };

  // Generate single image from custom prompt
  const generateFromPrompt = async () => {
    if (!customPrompt.trim()) {
      setError('Custom prompt is required');
      return;
    }

    if (!apiKey) {
      setError('Gemini API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratingImages(true);

    try {
      console.log('[ImageGenerator] Starting custom prompt generation');
      
      const result = await geminiService.generateSingleImage(customPrompt, {
        style: selectedStyle,
        aspectRatio: aspectRatio,
        quality: quality
      });

      if (result.success && result.images && result.images.length > 0) {
        const newImages = [...images, ...result.images];
        setImages(newImages);
        setSelectedImages(prev => new Set([...prev, ...result.images.map((img: GeneratedImage) => img.id)]));

        // Update analytics
        updateAnalytics({
          tokens: result.tokensUsed || 0,
          cost: result.cost || 0,
          generations: 1
        });

        addNotification({
          type: 'success',
          title: 'Image Generated',
          message: 'Successfully generated custom image',
          duration: 3000
        });

        console.log('[ImageGenerator] Generated custom images:', result.images.length);
      } else {
        throw new Error(result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('[ImageGenerator] Error generating custom image:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    } finally {
      setLoading(false);
      setGeneratingImages(false);
    }
  };

  // Download image
  const downloadImage = (image: GeneratedImage) => {
    try {
      geminiService.downloadImage(
        image,
        `${image.style}-${image.placement}-${image.id}.${image.mimeType.split('/')[1]}`
      );
      
      addNotification({
        type: 'success',
        title: 'Download Started',
        message: 'Image download has started',
        duration: 2000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download image',
        duration: 3000
      });
    }
  };

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  // Toggle image favorite
  const toggleImageFavorite = (imageId: string) => {
    setFavoriteImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  // Delete image
  const deleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setFavoriteImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  // Copy image URL
  const copyImageUrl = (image: GeneratedImage) => {
    navigator.clipboard.writeText(image.url).then(() => {
      addNotification({
        type: 'success',
        title: 'Copied',
        message: 'Image URL copied to clipboard',
        duration: 2000
      });
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gemini 2.5 Flash Image Generator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate stunning images with Google's multimodal AI
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Status */}
        {!geminiService.isConfigured() && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  API Key Required
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Configure your Gemini API key in provider settings to start generating images.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Generation Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setCustomPrompt('')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              !customPrompt 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 inline mr-2" />
            From Blog Content
          </button>
          <button
            onClick={() => setCustomPrompt('Enter your image description...')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              customPrompt 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Palette className="h-4 w-4 inline mr-2" />
            Custom Prompt
          </button>
        </div>

        {/* Custom Prompt Input */}
        {customPrompt && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Description
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Basic Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {styleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {!customPrompt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Count
              </label>
              <select
                value={imageCount}
                onChange={(e) => setImageCount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count} image{count > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {verticalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Settings className="h-4 w-4" />
          <span>Advanced Options</span>
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="16:9">16:9 (Wide)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="high">High Quality</option>
                  <option value="standard">Standard Quality</option>
                  <option value="draft">Draft Quality</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={customPrompt ? generateFromPrompt : generateFromBlog}
          disabled={loading || !geminiService.isConfigured() || (!customPrompt && !blogContent)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating Images...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Generate Images with Gemini 2.5 Flash</span>
            </div>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <div className="flex-1 overflow-y-auto p-6">
        {images.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Image className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Images Generated Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {blogContent ? 
                'Click "Generate Images" to create visuals from your blog content' :
                'Add blog content or enter a custom prompt to start generating images'
              }
            </p>
          </div>
        )}

        {images.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Generated Images ({images.length})
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedImages.size} selected • {favoriteImages.size} favorites
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border-2 transition-all duration-200 ${
                    selectedImages.has(image.id)
                      ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={geminiService.getImageDataUrl(image)}
                      alt={image.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleImageSelection(image.id)}
                          className={`p-2 rounded-full ${
                            selectedImages.has(image.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                          title={selectedImages.has(image.id) ? 'Deselect' : 'Select'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleImageFavorite(image.id)}
                          className={`p-2 rounded-full ${
                            favoriteImages.has(image.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                          title={favoriteImages.has(image.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(image)}
                          className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => copyImageUrl(image)}
                          className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Style Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-50 text-white rounded-full">
                        {image.style}
                      </span>
                    </div>

                    {/* Placement Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                        {image.placement}
                      </span>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {image.caption || `${image.style} ${image.placement} image`}
                    </h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span>Gemini 2.5 Flash</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{image.mimeType.split('/')[1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span>${image.cost.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;