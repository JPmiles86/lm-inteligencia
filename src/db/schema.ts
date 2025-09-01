// Database schema for Inteligencia blog system using Drizzle ORM
// Enhanced with SEO, scheduling, revision support, and AI content generation

import { pgTable, serial, varchar, text, boolean, timestamp, integer, json, pgEnum, uuid, decimal, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Enum for post status
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'published']);

// Enum for change type in revisions
export const changeTypeEnum = pgEnum('change_type', ['auto', 'manual', 'publish']);

// Enhanced blog posts table with SEO, scheduling, and autosave
export const blogPosts = pgTable('blog_posts', {
  // Core fields
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: varchar('featured_image', { length: 500 }),
  category: varchar('category', { length: 100 }).notNull(),
  tags: json('tags').$type<string[]>().default([]),
  featured: boolean('featured').default(false),
  
  // Publishing fields
  published: boolean('published').default(false),
  publishedDate: varchar('published_date', { length: 50 }), // Store as string to match existing format
  status: varchar('status', { length: 20 }).default('draft'),
  scheduledPublishDate: timestamp('scheduled_publish_date'),
  timezone: varchar('timezone', { length: 50 }).default('America/New_York'),
  
  // SEO fields
  metaTitle: varchar('meta_title', { length: 160 }),
  metaDescription: varchar('meta_description', { length: 260 }),
  keywords: json('keywords').$type<string[]>().default([]),
  ogImage: varchar('og_image', { length: 500 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  
  // Autosave fields
  draftContent: text('draft_content'),
  lastAutosave: timestamp('last_autosave'),
  autosaveVersion: integer('autosave_version').default(0),
  
  // Author fields
  authorName: varchar('author_name', { length: 100 }).notNull(),
  authorTitle: varchar('author_title', { length: 150 }),
  authorImage: varchar('author_image', { length: 500 }),
  readTime: integer('read_time').default(5),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Blog revisions table for version history
export const blogRevisions = pgTable('blog_revisions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  metaData: json('meta_data').$type<{
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
    };
    scheduling?: {
      scheduledPublishDate?: string;
      timezone?: string;
    };
  }>(),
  changeType: varchar('change_type', { length: 20 }).notNull(),
  changeSummary: text('change_summary'),
  authorName: varchar('author_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow()
});

// ================================
// AI CONTENT GENERATION SYSTEM
// ================================

// AI Generation Enums
export const styleGuideTypeEnum = pgEnum('style_guide_type', ['brand', 'vertical', 'writing_style', 'persona']);
export const generationNodeTypeEnum = pgEnum('generation_node_type', ['idea', 'title', 'synopsis', 'outline', 'blog', 'social', 'image_prompt', 'analysis']);
export const generationModeEnum = pgEnum('generation_mode', ['structured', 'direct', 'batch', 'multi_vertical', 'edit_existing']);
export const verticalEnum = pgEnum('vertical', ['hospitality', 'healthcare', 'tech', 'athletics']);
export const providerEnum = pgEnum('provider', ['openai', 'anthropic', 'google', 'perplexity']);
export const imageReferenceTypeEnum = pgEnum('image_reference_type', ['style', 'logo', 'persona']);
export const generationStatusEnum = pgEnum('generation_status', ['pending', 'processing', 'completed', 'failed', 'cancelled']);

// Style Guides - Brand, vertical, writing styles, and personas
export const styleGuides: any = pgTable('style_guides', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: styleGuideTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  vertical: verticalEnum('vertical'), // null for brand guide, specific for vertical guides
  content: text('content').notNull(),
  description: text('description'),
  
  // Versioning
  version: integer('version').default(1),
  parentId: uuid('parent_id').references((): any => styleGuides.id),
  
  // Status
  active: boolean('active').default(true),
  isDefault: boolean('is_default').default(false),
  
  // Persona-specific fields
  perspective: varchar('perspective', { length: 255 }), // "female", "technical expert", etc.
  voiceCharacteristics: json('voice_characteristics').$type<string[]>().default([]),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  typeIdx: index('style_guides_type_idx').on(table.type),
  verticalIdx: index('style_guides_vertical_idx').on(table.vertical),
  activeIdx: index('style_guides_active_idx').on(table.active),
}));

// Generation Trees - Core structure for all AI generations
export const generationNodes: any = pgTable('generation_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: generationNodeTypeEnum('type').notNull(),
  mode: generationModeEnum('mode'), // Generation mode used
  
  // Content
  content: text('content'),
  structuredContent: json('structured_content').$type<{
    title?: string;
    synopsis?: string;
    outline?: string[];
    tags?: string[];
    metadata?: Record<string, any>;
    imagePrompts?: Array<{
      id: string;
      text: string;
      position: number;
      type: 'hero' | 'section' | 'footer';
    }>;
  }>(),
  
  // Tree relationships
  parentId: uuid('parent_id').references((): any => generationNodes.id),
  rootId: uuid('root_id').references((): any => generationNodes.id), // Top of generation tree
  
  // Selection and visibility
  selected: boolean('selected').default(false),
  visible: boolean('visible').default(true),
  deleted: boolean('deleted').default(false), // Soft delete
  
  // Generation metadata
  vertical: verticalEnum('vertical'),
  provider: providerEnum('provider').notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  prompt: text('prompt'),
  
  // Context used for generation
  contextData: json('context_data').$type<{
    styleGuideIds?: string[];
    referenceBlogIds?: string[];
    referenceImageIds?: string[];
    customContext?: string;
    includeElements?: {
      titles?: boolean;
      synopsis?: boolean;
      content?: boolean;
      tags?: boolean;
      metadata?: boolean;
      images?: boolean;
    };
  }>(),
  
  // Usage metrics
  tokensInput: integer('tokens_input').default(0),
  tokensOutput: integer('tokens_output').default(0),
  cost: decimal('cost', { precision: 10, scale: 6 }).default('0'),
  durationMs: integer('duration_ms'),
  
  // Status
  status: generationStatusEnum('status').default('pending'),
  errorMessage: text('error_message'),
  
  // Blog integration
  publishedBlogId: integer('published_blog_id').references(() => blogPosts.id),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  typeIdx: index('generation_nodes_type_idx').on(table.type),
  parentIdx: index('generation_nodes_parent_idx').on(table.parentId),
  rootIdx: index('generation_nodes_root_idx').on(table.rootId),
  verticalIdx: index('generation_nodes_vertical_idx').on(table.vertical),
  statusIdx: index('generation_nodes_status_idx').on(table.status),
  createdAtIdx: index('generation_nodes_created_at_idx').on(table.createdAt),
  publishedBlogIdx: index('generation_nodes_published_blog_idx').on(table.publishedBlogId),
}));

// AI Provider Settings - Encrypted API keys and configurations
export const providerSettings = pgTable('provider_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: providerEnum('provider').notNull().unique(),
  
  // Encrypted credentials
  apiKeyEncrypted: text('api_key_encrypted').notNull(),
  encryptionSalt: varchar('encryption_salt', { length: 255 }),
  
  // Default model for each provider
  defaultModel: varchar('default_model', { length: 100 }),
  fallbackModel: varchar('fallback_model', { length: 100 }),
  
  // Task-specific model preferences
  taskDefaults: json('task_defaults').$type<Record<string, {
    model: string;
    config?: Record<string, any>;
  }>>(),
  
  // Usage limits and tracking
  monthlyLimit: decimal('monthly_limit', { precision: 10, scale: 2 }),
  currentUsage: decimal('current_usage', { precision: 10, scale: 2 }).default('0'),
  lastResetDate: timestamp('last_reset_date').defaultNow(),
  
  // Provider-specific settings
  settings: json('settings').$type<{
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    betaHeaders?: Record<string, string>;
    customEndpoint?: string;
    rateLimitRpm?: number;
    rateLimitTpm?: number;
  }>(),
  
  // Status
  active: boolean('active').default(true),
  lastTested: timestamp('last_tested'),
  testSuccess: boolean('test_success'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  providerIdx: uniqueIndex('provider_settings_provider_idx').on(table.provider),
}));

// Reference Images - Style references, logos, personas
export const referenceImages = pgTable('reference_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: imageReferenceTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  description: text('description'),
  
  // Categorization
  tags: json('tags').$type<string[]>().default([]),
  vertical: verticalEnum('vertical'), // null for global references
  
  // File metadata
  fileSize: integer('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  width: integer('width'),
  height: integer('height'),
  
  // Usage tracking
  usageCount: integer('usage_count').default(0),
  lastUsed: timestamp('last_used'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  typeIdx: index('reference_images_type_idx').on(table.type),
  verticalIdx: index('reference_images_vertical_idx').on(table.vertical),
  lastUsedIdx: index('reference_images_last_used_idx').on(table.lastUsed),
}));

// Characters - Consistent personas for image generation
export const characters = pgTable('characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  
  // Character attributes
  physicalDescription: text('physical_description'),
  personality: text('personality'),
  role: varchar('role', { length: 100 }), // "CEO", "expert", "customer", etc.
  
  // Reference images
  referenceImageIds: json('reference_image_ids').$type<string[]>().default([]),
  
  // Generated variations
  generatedImageUrls: json('generated_image_urls').$type<Array<{
    url: string;
    prompt: string;
    provider: string;
    createdAt: string;
  }>>().default([]),
  
  // AI embedding for similarity matching
  embedding: text('embedding'), // Store as JSON string for now
  
  // Usage tracking
  usageCount: integer('usage_count').default(0),
  lastUsed: timestamp('last_used'),
  
  // Status
  active: boolean('active').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  nameIdx: index('characters_name_idx').on(table.name),
  activeIdx: index('characters_active_idx').on(table.active),
  lastUsedIdx: index('characters_last_used_idx').on(table.lastUsed),
}));

// Context Templates - Reusable context configurations
export const contextTemplates = pgTable('context_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  // Template configuration
  config: json('config').$type<{
    styleGuideIds: string[];
    defaultVerticals: string[];
    includeElements: {
      titles: boolean;
      synopsis: boolean;
      content: boolean;
      tags: boolean;
      metadata: boolean;
      images: boolean;
    };
    customContext: string;
    referenceImageIds: string[];
  }>().notNull(),
  
  // Usage tracking
  usageCount: integer('usage_count').default(0),
  lastUsed: timestamp('last_used'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  nameIdx: index('context_templates_name_idx').on(table.name),
  lastUsedIdx: index('context_templates_last_used_idx').on(table.lastUsed),
}));

// Generation Analytics - Track performance and usage
export const generationAnalytics = pgTable('generation_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Time period (daily aggregates)
  date: timestamp('date').notNull(),
  vertical: verticalEnum('vertical'),
  provider: providerEnum('provider'),
  model: varchar('model', { length: 100 }),
  
  // Metrics
  totalGenerations: integer('total_generations').default(0),
  successfulGenerations: integer('successful_generations').default(0),
  failedGenerations: integer('failed_generations').default(0),
  
  // Token usage
  totalTokensInput: integer('total_tokens_input').default(0),
  totalTokensOutput: integer('total_tokens_output').default(0),
  
  // Cost tracking
  totalCost: decimal('total_cost', { precision: 10, scale: 6 }).default('0'),
  averageCost: decimal('average_cost', { precision: 10, scale: 6 }).default('0'),
  
  // Performance
  averageDuration: integer('average_duration_ms').default(0),
  minDuration: integer('min_duration_ms'),
  maxDuration: integer('max_duration_ms'),
  
  // Content metrics
  averageContentLength: integer('average_content_length').default(0),
  totalContentLength: integer('total_content_length').default(0),
  
  // Popular tasks
  taskBreakdown: json('task_breakdown').$type<Record<string, number>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  dateIdx: index('generation_analytics_date_idx').on(table.date),
  verticalIdx: index('generation_analytics_vertical_idx').on(table.vertical),
  providerIdx: index('generation_analytics_provider_idx').on(table.provider),
  uniqueDateVerticalProvider: uniqueIndex('generation_analytics_unique_idx').on(table.date, table.vertical, table.provider, table.model),
}));

// Image Prompts - Extracted and editable image prompts
export const imagePrompts = pgTable('image_prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  generationNodeId: uuid('generation_node_id').notNull().references((): any => generationNodes.id, { onDelete: 'cascade' }),
  
  // Prompt content
  originalText: text('original_text').notNull(),
  editedText: text('edited_text'),
  finalText: text('final_text'), // After character/style insertion
  
  // Position and type
  position: integer('position').notNull(), // Order in document
  type: varchar('type', { length: 50 }).default('section'), // hero, section, footer
  
  // Enhancements
  characterIds: json('character_ids').$type<string[]>().default([]),
  styleReferenceIds: json('style_reference_ids').$type<string[]>().default([]),
  
  // Generated images
  generatedImages: json('generated_images').$type<Array<{
    url: string;
    provider: string;
    model: string;
    prompt: string;
    selected: boolean;
    createdAt: string;
    cost: number;
  }>>().default([]),
  
  // Status
  generated: boolean('generated').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  generationNodeIdx: index('image_prompts_generation_node_idx').on(table.generationNodeId),
  positionIdx: index('image_prompts_position_idx').on(table.position),
  generatedIdx: index('image_prompts_generated_idx').on(table.generated),
}));

// Generated Images - Store AI-generated images with metadata
export const generatedImages = pgTable('generated_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  blogPostId: integer('blog_post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  promptId: varchar('prompt_id', { length: 255 }).notNull(),
  originalPrompt: text('original_prompt').notNull(),
  enhancedPrompt: text('enhanced_prompt'),
  imageUrl: text('image_url').notNull(),
  storagePath: text('storage_path'),
  thumbnailUrl: text('thumbnail_url'),
  
  // Image metadata
  width: integer('width'),
  height: integer('height'),
  format: varchar('format', { length: 20 }),
  fileSize: integer('file_size'),
  
  // Generation metadata
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }),
  generationTime: integer('generation_time'),
  generationCost: decimal('generation_cost', { precision: 10, scale: 6 }),
  
  // Status and quality
  status: varchar('status', { length: 50 }).default('generated'),
  qualityScore: decimal('quality_score', { precision: 3, scale: 2 }),
  altText: text('alt_text'),
  caption: text('caption'),
  
  // Position in content
  positionInContent: integer('position_in_content'),
  sectionTitle: varchar('section_title', { length: 255 }),
  importance: varchar('importance', { length: 20 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  blogPostIdx: index('generated_images_blog_post_idx').on(table.blogPostId),
  promptIdx: index('generated_images_prompt_idx').on(table.promptId),
  statusIdx: index('generated_images_status_idx').on(table.status),
  providerIdx: index('generated_images_provider_idx').on(table.provider),
  createdAtIdx: index('generated_images_created_at_idx').on(table.createdAt),
}));

// Usage Logs - Detailed logging for debugging and analytics
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Request details
  provider: providerEnum('provider').notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  taskType: varchar('task_type', { length: 100 }),
  vertical: verticalEnum('vertical'),
  
  // Timing
  requestedAt: timestamp('requested_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  durationMs: integer('duration_ms'),
  
  // Usage metrics
  tokensInput: integer('tokens_input').default(0),
  tokensOutput: integer('tokens_output').default(0),
  cost: decimal('cost', { precision: 10, scale: 6 }).default('0'),
  
  // Request/response data (for debugging)
  requestData: json('request_data'),
  responseData: json('response_data'),
  errorData: json('error_data'),
  
  // Success/failure
  success: boolean('success').default(true),
  errorMessage: text('error_message'),
  
  // Relationships
  generationNodeId: uuid('generation_node_id').references((): any => generationNodes.id),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  providerIdx: index('usage_logs_provider_idx').on(table.provider),
  requestedAtIdx: index('usage_logs_requested_at_idx').on(table.requestedAt),
  successIdx: index('usage_logs_success_idx').on(table.success),
  generationNodeIdx: index('usage_logs_generation_node_idx').on(table.generationNodeId),
}));

// Type exports
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type BlogRevision = typeof blogRevisions.$inferSelect;
export type NewBlogRevision = typeof blogRevisions.$inferInsert;

// AI Generation Types
export type StyleGuide = typeof styleGuides.$inferSelect;
export type NewStyleGuide = typeof styleGuides.$inferInsert;
export type GenerationNode = typeof generationNodes.$inferSelect;
export type NewGenerationNode = typeof generationNodes.$inferInsert;
export type ProviderSettings = typeof providerSettings.$inferSelect;
export type NewProviderSettings = typeof providerSettings.$inferInsert;
export type ReferenceImage = typeof referenceImages.$inferSelect;
export type NewReferenceImage = typeof referenceImages.$inferInsert;
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type ContextTemplate = typeof contextTemplates.$inferSelect;
export type NewContextTemplate = typeof contextTemplates.$inferInsert;
export type GenerationAnalytics = typeof generationAnalytics.$inferSelect;
export type NewGenerationAnalytics = typeof generationAnalytics.$inferInsert;
export type ImagePrompt = typeof imagePrompts.$inferSelect;
export type NewImagePrompt = typeof imagePrompts.$inferInsert;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type NewGeneratedImage = typeof generatedImages.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = typeof usageLogs.$inferInsert;

// Extended types for frontend use
export interface BlogPostWithRevisions extends BlogPost {
  revisions?: BlogRevision[];
}

export interface BlogPostFormData {
  // Core fields
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  
  // Publishing
  published?: boolean;
  status?: 'draft' | 'scheduled' | 'published';
  scheduledPublishDate?: Date | string;
  timezone?: string;
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  
  // Author
  author?: {
    name: string;
    title?: string;
    image?: string;
  };
}

// ================================
// AI SYSTEM EXTENDED TYPES
// ================================

// Generation workflow types
export interface GenerationRequest {
  mode: 'structured' | 'direct' | 'batch' | 'multi_vertical' | 'edit_existing';
  vertical: 'all' | 'hospitality' | 'healthcare' | 'tech' | 'athletics';
  verticalMode?: 'parallel' | 'sequential' | 'adaptive';
  task: string;
  prompt: string;
  context: ContextSelection;
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  model: string;
  outputCount?: number;
}

export interface ContextSelection {
  styleGuides: {
    brand?: boolean;
    vertical?: string[];
    writingStyle?: string[];
    persona?: string[];
  };
  previousContent: {
    mode: 'none' | 'all' | 'vertical' | 'selected';
    verticalFilter?: string;
    items?: string[];
    includeElements: {
      titles: boolean;
      synopsis: boolean;
      content: boolean;
      tags: boolean;
      metadata: boolean;
      images: boolean;
    };
  };
  referenceImages: {
    style?: string[];
    logo?: string[];
    persona?: string[];
  };
  additionalContext?: string;
}

// Extended generation node with relationships
export interface GenerationNodeWithChildren extends GenerationNode {
  children?: GenerationNode[];
  parent?: GenerationNode;
  alternatives?: GenerationNode[];
  imagePrompts?: ImagePrompt[];
}

// Style guide with versioning
export interface StyleGuideWithVersions extends StyleGuide {
  versions?: StyleGuide[];
  children?: StyleGuide[];
}

// Provider configuration
export interface ProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  apiKey: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    maxOutput?: number;
    pricing: {
      input: number;
      output: number;
      perImage?: number;
    };
    bestFor: string[];
    features: string[];
  }>;
  defaultModel: string;
  fallbackModel?: string;
  taskDefaults: Record<string, {
    model: string;
    config?: Record<string, any>;
  }>;
}

// Image generation types
export interface ImageGenerationRequest {
  prompt: string;
  provider: 'openai' | 'google';
  model: string;
  count?: number;
  size?: string;
  quality?: 'standard' | 'hd';
  style?: string;
  characterIds?: string[];
  styleReferenceIds?: string[];
}

// GeneratedImage type is now defined by the database schema above

// Analytics and reporting
export interface GenerationStats {
  totalGenerations: number;
  successRate: number;
  averageCost: number;
  averageTokens: number;
  popularVerticals: Array<{
    vertical: string;
    count: number;
  }>;
  popularProviders: Array<{
    provider: string;
    count: number;
  }>;
  monthlyCosts: Array<{
    month: string;
    cost: number;
  }>;
}

// Character consistency
export interface CharacterReference {
  character: Character;
  referenceImages: ReferenceImage[];
  generatedVariations: GeneratedImage[];
}

// Context template for reuse
export interface ContextTemplateData {
  styleGuideIds: string[];
  defaultVerticals: string[];
  includeElements: {
    titles: boolean;
    synopsis: boolean;
    content: boolean;
    tags: boolean;
    metadata: boolean;
    images: boolean;
  };
  customContext: string;
  referenceImageIds: string[];
}

// Multi-vertical generation result
export interface MultiVerticalResult {
  baseContent: GenerationNode;
  verticalVariations: Array<{
    vertical: string;
    content: GenerationNode;
    adaptations: string[];
  }>;
}

// Usage and cost tracking
export interface UsageMetrics {
  provider: string;
  model: string;
  tokensUsed: number;
  cost: number;
  duration: number;
  success: boolean;
  timestamp: Date;
}

// Blog enhancement types
export interface BlogWithAIMetadata extends BlogPost {
  generationNode?: GenerationNode;
  aiEnhancements?: {
    generatedFromIdea?: string;
    multiVerticalVariant?: boolean;
    originalVertical?: string;
    styleGuideIds?: string[];
    generationCost?: number;
    providerUsed?: string;
    modelUsed?: string;
  };
}

// Tree navigation helpers
export interface GenerationTreeNode {
  id: string;
  type: string;
  content: string;
  selected: boolean;
  visible: boolean;
  children: GenerationTreeNode[];
  depth: number;
  path: string[];
}