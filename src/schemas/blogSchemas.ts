// Blog API Validation Schemas using Zod
import { z } from 'zod';

// Base blog post schema
export const BlogPostSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters'),
  excerpt: z.string().nullable(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().url().nullable(),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedDate: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorName: z.string().min(1, 'Author name is required').max(100, 'Author name must be less than 100 characters'),
  authorTitle: z.string().max(150, 'Author title must be less than 150 characters').nullable(),
  authorImage: z.string().url().nullable(),
  readTime: z.number().int().positive().default(5),
  editorType: z.enum(['rich', 'block']).default('rich')
});

// Schema for creating a new blog post
export const CreateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  slug: z.string().max(255, 'Slug must be less than 255 characters').optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().url().optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedDate: z.string().optional(),
  authorName: z.string().min(1, 'Author name is required').max(100, 'Author name must be less than 100 characters'),
  authorTitle: z.string().max(150, 'Author title must be less than 150 characters').optional(),
  authorImage: z.string().url().optional(),
  readTime: z.number().int().positive().optional(),
  editorType: z.enum(['rich', 'block']).default('rich')
});

// Schema for updating a blog post
export const UpdateBlogPostSchema = CreateBlogPostSchema.partial();

// Schema for query parameters when fetching posts
export const BlogPostQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive().max(100)).default('10'),
  category: z.string().optional(),
  featured: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  published: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  search: z.string().optional(),
  tags: z.string().transform(val => val.split(',').filter(Boolean)).pipe(z.array(z.string())).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedDate', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Schema for blog post ID parameter
export const BlogPostIdSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive())
});

// Schema for blog post slug parameter
export const BlogPostSlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required')
});

// Schema for toggle operations (publish/feature)
export const ToggleOperationSchema = z.object({
  value: z.boolean().optional()
});

// Standard API response schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative()
  }).optional()
});

// Pagination response schema
export const PaginatedBlogPostsSchema = z.object({
  posts: z.array(BlogPostSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative()
  })
});

// Blog statistics schema
export const BlogStatsSchema = z.object({
  totalPosts: z.number().int().nonnegative(),
  publishedPosts: z.number().int().nonnegative(),
  draftPosts: z.number().int().nonnegative(),
  featuredPosts: z.number().int().nonnegative(),
  categoryCounts: z.record(z.string(), z.number().int().nonnegative())
});

// Categories and tags response schemas
export const CategoriesSchema = z.array(z.string());
export const TagsSchema = z.array(z.string());

// Type exports for TypeScript
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type CreateBlogPost = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof UpdateBlogPostSchema>;
export type BlogPostQuery = z.infer<typeof BlogPostQuerySchema>;
export type BlogPostId = z.infer<typeof BlogPostIdSchema>;
export type BlogPostSlug = z.infer<typeof BlogPostSlugSchema>;
export type ToggleOperation = z.infer<typeof ToggleOperationSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type PaginatedBlogPosts = z.infer<typeof PaginatedBlogPostsSchema>;
export type BlogStats = z.infer<typeof BlogStatsSchema>;
export type Categories = z.infer<typeof CategoriesSchema>;
export type Tags = z.infer<typeof TagsSchema>;

// Validation helper functions
export const validateCreateBlogPost = (data: unknown) => CreateBlogPostSchema.parse(data);
export const validateUpdateBlogPost = (data: unknown) => UpdateBlogPostSchema.parse(data);
export const validateBlogPostQuery = (data: unknown) => BlogPostQuerySchema.parse(data);
export const validateBlogPostId = (data: unknown) => BlogPostIdSchema.parse(data);
export const validateBlogPostSlug = (data: unknown) => BlogPostSlugSchema.parse(data);
export const validateToggleOperation = (data: unknown) => ToggleOperationSchema.parse(data);