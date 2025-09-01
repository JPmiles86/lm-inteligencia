/**
 * Blog Post Validation Schemas
 * Validates blog post creation, updates, and related operations
 */

import { z } from 'zod';

// Blog status enum
export const BlogStatusEnum = z.enum(['draft', 'published', 'archived', 'scheduled']);

// Blog visibility enum
export const BlogVisibilityEnum = z.enum(['public', 'private', 'password']);

// SEO metadata schema
export const SEOMetadataSchema = z.object({
  metaTitle: z.string()
    .max(60, 'Meta title too long (max 60 characters)')
    .optional(),
  
  metaDescription: z.string()
    .max(160, 'Meta description too long (max 160 characters)')
    .optional(),
  
  focusKeyword: z.string()
    .max(50)
    .optional(),
  
  canonicalUrl: z.string()
    .url('Invalid URL format')
    .optional(),
  
  ogTitle: z.string()
    .max(60)
    .optional(),
  
  ogDescription: z.string()
    .max(160)
    .optional(),
  
  ogImage: z.string()
    .url('Invalid image URL')
    .optional(),
});

// Author schema
export const AuthorSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

// Category schema
export const CategorySchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

// Tag schema
export const TagSchema = z.string()
  .min(1, 'Tag cannot be empty')
  .max(30, 'Tag too long (max 30 characters)')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Tag contains invalid characters');

// Image schema
export const BlogImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().max(200),
  caption: z.string().max(500).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

// Main blog post schema
export const BlogPostSchema = z.object({
  // Basic fields
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long (max 200 characters)')
    .transform(val => val.trim()),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  
  content: z.string()
    .min(100, 'Content too short (min 100 characters)')
    .max(100000, 'Content too long (max 100,000 characters)'),
  
  excerpt: z.string()
    .max(500, 'Excerpt too long (max 500 characters)')
    .optional()
    .transform(val => val?.trim()),
  
  // Status and visibility
  status: BlogStatusEnum.default('draft'),
  visibility: BlogVisibilityEnum.default('public'),
  password: z.string()
    .min(6)
    .max(50)
    .optional(),
  
  // Dates
  publishedAt: z.string()
    .datetime()
    .optional(),
  
  scheduledAt: z.string()
    .datetime()
    .optional(),
  
  // Categorization
  verticalId: z.number()
    .positive('Invalid vertical ID'),
  
  categoryId: z.number()
    .positive()
    .optional(),
  
  tags: z.array(TagSchema)
    .max(20, 'Too many tags (max 20)')
    .optional(),
  
  // Media
  featuredImage: BlogImageSchema.optional(),
  images: z.array(BlogImageSchema)
    .max(50, 'Too many images (max 50)')
    .optional(),
  
  // SEO
  seo: SEOMetadataSchema.optional(),
  
  // Author
  authorId: z.number()
    .positive()
    .optional(),
  
  // Settings
  allowComments: z.boolean().default(true),
  isPinned: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  
  // AI metadata
  aiGenerated: z.boolean().default(false),
  aiProvider: z.string().optional(),
  aiModel: z.string().optional(),
  
  // Custom fields
  customFields: z.record(z.string(), z.unknown())
    .optional(),
});

// Blog update schema (all fields optional except ID)
export const BlogUpdateSchema = BlogPostSchema.partial().extend({
  id: z.number().positive('Invalid blog ID'),
});

// Blog search/filter schema
export const BlogFilterSchema = z.object({
  search: z.string().max(100).optional(),
  status: BlogStatusEnum.optional(),
  verticalId: z.number().positive().optional(),
  categoryId: z.number().positive().optional(),
  authorId: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  
  // Date filters
  publishedAfter: z.string().datetime().optional(),
  publishedBefore: z.string().datetime().optional(),
  
  // Pagination
  page: z.number().positive().default(1),
  limit: z.number().min(1).max(100).default(10),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'publishedAt', 'title', 'views', 'likes'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Blog import schema (for bulk imports)
export const BlogImportSchema = z.object({
  blogs: z.array(BlogPostSchema)
    .min(1, 'At least one blog post required')
    .max(100, 'Too many posts (max 100 per import)'),
  
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
  validateContent: z.boolean().default(true),
});

// Blog comment schema
export const BlogCommentSchema = z.object({
  blogId: z.number().positive(),
  
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment too long (max 2,000 characters)'),
  
  authorName: z.string()
    .min(1)
    .max(100)
    .optional(),
  
  authorEmail: z.string()
    .email('Invalid email format')
    .optional(),
  
  parentId: z.number()
    .positive()
    .optional(), // For nested comments
  
  isApproved: z.boolean().default(false),
});

// Blog analytics schema
export const BlogAnalyticsSchema = z.object({
  blogId: z.number().positive(),
  views: z.number().min(0).default(0),
  uniqueViews: z.number().min(0).default(0),
  likes: z.number().min(0).default(0),
  shares: z.number().min(0).default(0),
  avgReadTime: z.number().min(0).optional(), // in seconds
  bounceRate: z.number().min(0).max(100).optional(), // percentage
});

// Type exports
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogUpdate = z.infer<typeof BlogUpdateSchema>;
export type BlogFilter = z.infer<typeof BlogFilterSchema>;
export type BlogImport = z.infer<typeof BlogImportSchema>;
export type BlogComment = z.infer<typeof BlogCommentSchema>;
export type BlogAnalytics = z.infer<typeof BlogAnalyticsSchema>;
export type SEOMetadata = z.infer<typeof SEOMetadataSchema>;
export type Author = z.infer<typeof AuthorSchema>;
export type Category = z.infer<typeof CategorySchema>;