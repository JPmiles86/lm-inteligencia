// Import unified types from central location
export { 
  GeneratedImage,
  ImageGenerationResult,
  ImageGenerationOptions,
  BlogImageOptions 
} from '../../types/image.js';

export class GeminiImageService {
  constructor(apiKey?: string | null);
  initialize(apiKey: string): void;
  isConfigured(): boolean;
  generateBlogImages(blogContent: string, options?: BlogImageOptions): Promise<ImageGenerationResult>;
  generateSingleImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
  buildBlogImagePrompt(blogContent: string, imageCount: number, style?: string, vertical?: string, imageTypes?: string[]): string;
  buildSingleImagePrompt(prompt: string, style?: string, aspectRatio?: string, quality?: string): string;
  generateCaption(prompt: string): Promise<string>;
  calculateImageGenerationCost(imageCount: number): number;
  base64ToBlob(base64Data: string, mimeType?: string): Blob;
  downloadImage(image: GeneratedImage, fileName?: string): void;
  getImageDataUrl(image: GeneratedImage): string;
  validateImage(image: GeneratedImage): boolean;
  getStatus(): { configured: boolean; model: string };
}

export const geminiImageService: GeminiImageService;
export default GeminiImageService;