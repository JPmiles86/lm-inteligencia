/**
 * Generation Request Validation Schemas
 * Validates all AI generation-related inputs
 */

import { z } from 'zod';

// Provider enum
export const ProviderEnum = z.enum(['openai', 'anthropic', 'google', 'perplexity']);

// Model validation based on provider
export const ModelSchema = z.string().min(1).max(100);

// Temperature validation (0-2 for most providers)
export const TemperatureSchema = z.number().min(0).max(2).default(0.7);

// Token limits
export const MaxTokensSchema = z.number()
  .min(1)
  .max(150000)
  .default(4000);

// Generation mode
export const GenerationModeEnum = z.enum(['quick', 'structured', 'edit']);

// Main generation request schema
export const GenerationRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(10000, 'Prompt too long (max 10,000 characters)'),
  
  provider: ProviderEnum,
  
  model: ModelSchema,
  
  temperature: TemperatureSchema.optional(),
  
  maxTokens: MaxTokensSchema.optional(),
  
  mode: GenerationModeEnum.optional(),
  
  vertical: z.string()
    .min(1)
    .max(50)
    .optional(),
  
  styleGuideId: z.number()
    .positive()
    .optional(),
  
  contextIds: z.array(z.number().positive())
    .max(10, 'Too many context items (max 10)')
    .optional(),
  
  systemPrompt: z.string()
    .max(5000, 'System prompt too long (max 5,000 characters)')
    .optional(),
  
  streaming: z.boolean()
    .default(false),
  
  metadata: z.record(z.unknown())
    .optional(),
});

// Brainstorming request schema
export const BrainstormingRequestSchema = z.object({
  topic: z.string()
    .min(1, 'Topic is required')
    .max(500, 'Topic too long (max 500 characters)'),
  
  vertical: z.string()
    .min(1)
    .max(50),
  
  count: z.number()
    .min(1)
    .max(20)
    .default(5),
  
  style: z.enum(['creative', 'professional', 'casual', 'academic'])
    .optional(),
  
  provider: ProviderEnum.optional(),
  model: ModelSchema.optional(),
});

// Synopsis generation schema
export const SynopsisRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long (max 200 characters)'),
  
  idea: z.string()
    .min(10, 'Idea too short (min 10 characters)')
    .max(2000, 'Idea too long (max 2,000 characters)'),
  
  targetLength: z.number()
    .min(100)
    .max(1000)
    .default(300),
  
  vertical: z.string().optional(),
  provider: ProviderEnum.optional(),
  model: ModelSchema.optional(),
});

// Outline generation schema
export const OutlineRequestSchema = z.object({
  title: z.string()
    .min(1)
    .max(200),
  
  synopsis: z.string()
    .min(50)
    .max(2000),
  
  sections: z.number()
    .min(3)
    .max(15)
    .default(5),
  
  depth: z.enum(['basic', 'detailed', 'comprehensive'])
    .default('detailed'),
  
  includeIntro: z.boolean().default(true),
  includeConclusion: z.boolean().default(true),
  
  vertical: z.string().optional(),
  provider: ProviderEnum.optional(),
  model: ModelSchema.optional(),
});

// Blog content generation schema
export const BlogGenerationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long (max 200 characters)'),
  
  outline: z.array(z.string().max(500))
    .min(1, 'At least one outline section required')
    .max(20, 'Too many sections (max 20)'),
  
  synopsis: z.string()
    .max(2000)
    .optional(),
  
  targetWordCount: z.number()
    .min(100)
    .max(10000)
    .default(1500),
  
  tone: z.enum(['professional', 'casual', 'academic', 'conversational', 'persuasive'])
    .default('professional'),
  
  includeImages: z.boolean().default(true),
  
  keywords: z.array(z.string().max(50))
    .max(20, 'Too many keywords (max 20)')
    .optional(),
  
  vertical: z.string().optional(),
  styleGuideId: z.number().optional(),
  provider: ProviderEnum.optional(),
  model: ModelSchema.optional(),
});

// Edit request schema
export const EditRequestSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content too long (max 50,000 characters)'),
  
  instructions: z.string()
    .min(1, 'Instructions are required')
    .max(2000, 'Instructions too long (max 2,000 characters)'),
  
  editType: z.enum([
    'grammar',
    'style',
    'tone',
    'expand',
    'condense',
    'rewrite',
    'fact-check',
    'seo-optimize',
  ]).optional(),
  
  preserveFormatting: z.boolean().default(true),
  
  provider: ProviderEnum.optional(),
  model: ModelSchema.optional(),
});

// Multi-vertical generation schema
export const MultiVerticalGenerationSchema = z.object({
  baseContent: z.string()
    .min(100)
    .max(50000),
  
  verticals: z.array(z.string())
    .min(2, 'At least 2 verticals required')
    .max(10, 'Too many verticals (max 10)'),
  
  strategy: z.enum(['parallel', 'sequential', 'hybrid'])
    .default('parallel'),
  
  shareIntro: z.boolean().default(true),
  shareConclusion: z.boolean().default(true),
  
  customizations: z.record(z.string(), z.unknown())
    .optional(),
  
  provider: ProviderEnum.optional(),
  model: ModelSchema.optional(),
});

// Social media generation schema
export const SocialMediaGenerationSchema = z.object({
  content: z.string()
    .min(10)
    .max(50000),
  
  platforms: z.array(z.enum([
    'twitter',
    'facebook',
    'instagram',
    'linkedin',
    'tiktok',
    'youtube',
  ]))
    .min(1, 'At least one platform required')
    .max(6),
  
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
  
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational'])
    .optional(),
  
  callToAction: z.string()
    .max(200)
    .optional(),
  
  provider: ProviderEnum.optional(),
  model: ModelSchema.optional(),
});

// Type exports
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export type BrainstormingRequest = z.infer<typeof BrainstormingRequestSchema>;
export type SynopsisRequest = z.infer<typeof SynopsisRequestSchema>;
export type OutlineRequest = z.infer<typeof OutlineRequestSchema>;
export type BlogGeneration = z.infer<typeof BlogGenerationSchema>;
export type EditRequest = z.infer<typeof EditRequestSchema>;
export type MultiVerticalGeneration = z.infer<typeof MultiVerticalGenerationSchema>;
export type SocialMediaGeneration = z.infer<typeof SocialMediaGenerationSchema>;