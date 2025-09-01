/**
 * Unified image generation types used across the application
 */

/**
 * Represents a generated image with all metadata
 */
export interface GeneratedImage {
  id: string;
  data: string;           // Base64 encoded image data
  mimeType: string;       // e.g., 'image/png', 'image/jpeg'
  url: string;            // URL if uploaded to storage
  caption: string;        // Description or caption of the image
  placement: string;      // Where in the content this image belongs
  style: string;          // Style used for generation
  provider: string;       // Which AI provider generated this
  model: string;          // Which model was used
  selected: boolean;      // Whether user has selected this image
  createdAt: string;      // ISO timestamp of creation
  timestamp?: number;     // Unix timestamp (for backward compatibility)
  cost: number;           // Cost in USD
  metadata?: {            // Additional metadata
    prompt?: string;
    settings?: Record<string, any>;
    [key: string]: any;
  };
}

/**
 * Result from image generation operations
 */
export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];  // Note: always an array, even for single image
  cost?: number;
  tokensUsed?: number;
  duration?: number;
  error?: string;
}

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  style?: string;
  aspectRatio?: string;
  quality?: string;
  vertical?: string;
  imageTypes?: string[];
}

/**
 * Options specifically for blog image generation
 */
export interface BlogImageOptions {
  imageCount?: number;
  style?: string;
  vertical?: string;
  imageTypes?: string[];
}

/**
 * Image prompt extracted from content
 */
export interface ImagePrompt {
  id: string;
  text: string;
  position: number;
  enhanced?: string;
  style?: string;
  metadata?: Record<string, any>;
}