/**
 * Image Generation and Upload Validation Schemas
 * Validates image generation requests and file uploads
 */

import { z } from 'zod';

// Image style enum
export const ImageStyleEnum = z.enum([
  'realistic',
  'artistic',
  'cartoon',
  'abstract',
  'photographic',
  'digital-art',
  'oil-painting',
  'watercolor',
  'sketch',
  'anime',
  '3d-render',
  'pixel-art',
]);

// Image size enum (common sizes)
export const ImageSizeEnum = z.enum([
  '256x256',
  '512x512',
  '1024x1024',
  '1024x1792', // Portrait
  '1792x1024', // Landscape
  '1920x1080', // HD
  '3840x2160', // 4K
]);

// Image format enum
export const ImageFormatEnum = z.enum(['png', 'jpg', 'jpeg', 'webp', 'gif']);

// Main image generation schema
export const ImageGenerationSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(1000, 'Prompt too long (max 1,000 characters)')
    .transform(val => val.trim()),
  
  negativePrompt: z.string()
    .max(500, 'Negative prompt too long (max 500 characters)')
    .optional()
    .describe('What to avoid in the image'),
  
  style: ImageStyleEnum.default('realistic'),
  
  size: ImageSizeEnum.default('1024x1024'),
  
  count: z.number()
    .min(1)
    .max(4, 'Too many images (max 4)')
    .default(1),
  
  quality: z.enum(['standard', 'hd', 'ultra'])
    .default('standard'),
  
  provider: z.enum(['openai', 'google', 'stability', 'midjourney'])
    .optional(),
  
  model: z.string()
    .optional()
    .describe('Specific model to use (e.g., dall-e-3, stable-diffusion-xl)'),
  
  seed: z.number()
    .optional()
    .describe('Seed for reproducible generation'),
  
  enhancePrompt: z.boolean()
    .default(true)
    .describe('Whether to enhance the prompt with AI'),
  
  metadata: z.object({
    blogId: z.number().optional(),
    section: z.string().optional(),
    placement: z.enum(['hero', 'section', 'footer', 'inline']).optional(),
    altText: z.string().max(200).optional(),
    caption: z.string().max(500).optional(),
  }).optional(),
});

// Image upload validation schema
export const ImageUploadSchema = z.object({
  file: z.object({
    name: z.string(),
    size: z.number()
      .max(10 * 1024 * 1024, 'File too large (max 10MB)'),
    type: z.string()
      .refine(
        (type) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(type),
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'
      ),
  }),
  
  altText: z.string()
    .max(200, 'Alt text too long (max 200 characters)')
    .optional(),
  
  caption: z.string()
    .max(500, 'Caption too long (max 500 characters)')
    .optional(),
  
  category: z.enum(['blog', 'product', 'avatar', 'background', 'icon', 'other'])
    .default('other'),
  
  tags: z.array(z.string().max(30))
    .max(10, 'Too many tags (max 10)')
    .optional(),
  
  compress: z.boolean()
    .default(true)
    .describe('Whether to compress the image'),
  
  resize: z.object({
    width: z.number().min(1).max(4096).optional(),
    height: z.number().min(1).max(4096).optional(),
    maintainAspectRatio: z.boolean().default(true),
  }).optional(),
  
  crop: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1),
    height: z.number().min(1),
  }).optional(),
});

// Image editing schema
export const ImageEditSchema = z.object({
  imageId: z.string()
    .min(1, 'Image ID is required'),
  
  operations: z.array(z.discriminatedUnion('type', [
    z.object({
      type: z.literal('resize'),
      width: z.number().min(1).max(4096).optional(),
      height: z.number().min(1).max(4096).optional(),
      maintainAspectRatio: z.boolean().default(true),
    }),
    z.object({
      type: z.literal('crop'),
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().min(1),
      height: z.number().min(1),
    }),
    z.object({
      type: z.literal('rotate'),
      degrees: z.number().min(-360).max(360),
    }),
    z.object({
      type: z.literal('flip'),
      direction: z.enum(['horizontal', 'vertical']),
    }),
    z.object({
      type: z.literal('filter'),
      filter: z.enum(['grayscale', 'sepia', 'blur', 'sharpen', 'brightness', 'contrast']),
      intensity: z.number().min(0).max(100).optional(),
    }),
    z.object({
      type: z.literal('compress'),
      quality: z.number().min(1).max(100).default(85),
    }),
  ]))
    .min(1, 'At least one operation required')
    .max(10, 'Too many operations (max 10)'),
  
  outputFormat: ImageFormatEnum.optional(),
});

// Image search/filter schema
export const ImageFilterSchema = z.object({
  search: z.string().max(100).optional(),
  
  category: z.enum(['blog', 'product', 'avatar', 'background', 'icon', 'other']).optional(),
  
  tags: z.array(z.string()).optional(),
  
  provider: z.string().optional(),
  
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  
  minWidth: z.number().positive().optional(),
  maxWidth: z.number().positive().optional(),
  minHeight: z.number().positive().optional(),
  maxHeight: z.number().positive().optional(),
  
  page: z.number().positive().default(1),
  limit: z.number().min(1).max(100).default(20),
  
  sortBy: z.enum(['createdAt', 'size', 'width', 'height', 'name'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Image metadata schema
export const ImageMetadataSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  
  filename: z.string(),
  format: ImageFormatEnum,
  size: z.number().positive(), // in bytes
  
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  
  altText: z.string().optional(),
  caption: z.string().optional(),
  
  metadata: z.object({
    provider: z.string().optional(),
    model: z.string().optional(),
    prompt: z.string().optional(),
    style: z.string().optional(),
    cost: z.number().optional(),
  }).optional(),
  
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// Batch image generation schema
export const BatchImageGenerationSchema = z.object({
  requests: z.array(ImageGenerationSchema)
    .min(1, 'At least one request required')
    .max(10, 'Too many requests (max 10)'),
  
  sequential: z.boolean()
    .default(false)
    .describe('Process requests sequentially instead of in parallel'),
  
  stopOnError: z.boolean()
    .default(false)
    .describe('Stop batch processing if an error occurs'),
});

// Image analysis schema (for AI vision)
export const ImageAnalysisSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  
  analysisType: z.array(z.enum([
    'description',
    'tags',
    'text-extraction',
    'object-detection',
    'face-detection',
    'sentiment',
    'nsfw-check',
    'quality-assessment',
  ]))
    .min(1, 'At least one analysis type required'),
  
  provider: z.enum(['openai', 'google', 'azure'])
    .optional(),
  
  detailed: z.boolean()
    .default(false)
    .describe('Return detailed analysis results'),
});

// Type exports
export type ImageGeneration = z.infer<typeof ImageGenerationSchema>;
export type ImageUpload = z.infer<typeof ImageUploadSchema>;
export type ImageEdit = z.infer<typeof ImageEditSchema>;
export type ImageFilter = z.infer<typeof ImageFilterSchema>;
export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;
export type BatchImageGeneration = z.infer<typeof BatchImageGenerationSchema>;
export type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>;