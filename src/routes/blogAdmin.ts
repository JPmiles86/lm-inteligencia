// Admin Blog API Routes - Authentication required
// Handles CRUD operations for blog management

import { Router, Response } from 'express';
import { blogDatabaseService } from '../services/blogDatabaseService.js';
import { 
  sendSuccess, 
  sendError, 
  sendNotFound, 
  sendValidationError,
  sendCreated,
  sendNoContent,
  formatBlogPost,
  formatBlogPosts,
  asyncHandler 
} from '../utils/apiResponse.js';
import { 
  validateCreateBlogPost,
  validateUpdateBlogPost,
  validateBlogPostQuery, 
  validateBlogPostId,
  validateBlogPostSlug,
  validateToggleOperation
} from '../schemas/blogSchemas.js';
import { authenticateAdminFlexible, AuthenticatedRequest } from '../middleware/auth.js';
import { ZodError } from 'zod';

const router = Router();

// Apply authentication middleware to all admin routes
router.use(authenticateAdminFlexible);

/**
 * GET /api/admin/blog/posts - Get all blog posts (including drafts) with pagination and filtering
 * Query params: page, limit, category, featured, published, search, tags, sortBy, sortOrder
 */
router.get('/posts', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate query parameters
    const query = validateBlogPostQuery(req.query);
    
    // Build filters (admin can see all posts)
    const filters = {
      ...(query.category && { category: query.category }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.published !== undefined && { published: query.published }),
      ...(query.search && { search: query.search }),
      ...(query.tags && { tags: query.tags })
    };

    // Get paginated results
    const result = await blogDatabaseService.getAllPosts(
      filters,
      { page: query.page, limit: query.limit }
    );

    // Format posts for API response
    const formattedPosts = formatBlogPosts(result.posts);

    return sendSuccess(res, formattedPosts, 200, result.pagination);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error fetching admin posts:', error);
    return sendError(res, 'Failed to fetch blog posts');
  }
}));

/**
 * GET /api/admin/blog/posts/:id - Get a single blog post by ID (includes drafts)
 */
router.get('/posts/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate ID parameter
    const { id } = validateBlogPostId(req.params);

    // Get post by ID
    const post = await blogDatabaseService.getPostById(id);

    if (!post) {
      return sendNotFound(res, 'Blog post');
    }

    // Format post for API response
    const formattedPost = formatBlogPost(post);

    return sendSuccess(res, formattedPost);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error fetching post by ID:', error);
    return sendError(res, 'Failed to fetch blog post');
  }
}));

/**
 * GET /api/admin/blog/posts/slug/:slug - Get a single blog post by slug (includes drafts)
 */
router.get('/posts/slug/:slug', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate slug parameter
    const { slug } = validateBlogPostSlug(req.params);

    // Get post by slug
    const post = await blogDatabaseService.getPostBySlug(slug);

    if (!post) {
      return sendNotFound(res, 'Blog post');
    }

    // Format post for API response
    const formattedPost = formatBlogPost(post);

    return sendSuccess(res, formattedPost);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error fetching post by slug:', error);
    return sendError(res, 'Failed to fetch blog post');
  }
}));

/**
 * POST /api/admin/blog/posts - Create a new blog post
 */
router.post('/posts', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request body
    const postData = validateCreateBlogPost(req.body);

    // Create new post
    const newPost = await blogDatabaseService.createPost(postData);

    // Format post for API response
    const formattedPost = formatBlogPost(newPost);

    return sendCreated(res, formattedPost);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error creating post:', error);
    return sendError(res, 'Failed to create blog post');
  }
}));

/**
 * PUT /api/admin/blog/posts/:id - Update an existing blog post
 */
router.put('/posts/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate ID parameter
    const { id } = validateBlogPostId(req.params);

    // Validate request body
    const updateData = validateUpdateBlogPost(req.body);

    // Update post
    const updatedPost = await blogDatabaseService.updatePost(id, updateData);

    if (!updatedPost) {
      return sendNotFound(res, 'Blog post');
    }

    // Format post for API response
    const formattedPost = formatBlogPost(updatedPost);

    return sendSuccess(res, formattedPost);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error updating post:', error);
    return sendError(res, 'Failed to update blog post');
  }
}));

/**
 * DELETE /api/admin/blog/posts/:id - Delete a blog post
 */
router.delete('/posts/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate ID parameter
    const { id } = validateBlogPostId(req.params);

    // Delete post
    const deleted = await blogDatabaseService.deletePost(id);

    if (!deleted) {
      return sendNotFound(res, 'Blog post');
    }

    return sendNoContent(res);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error deleting post:', error);
    return sendError(res, 'Failed to delete blog post');
  }
}));

/**
 * PATCH /api/admin/blog/posts/:id/publish - Toggle published status
 */
router.patch('/posts/:id/publish', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate ID parameter
    const { id } = validateBlogPostId(req.params);

    // Toggle published status
    const updatedPost = await blogDatabaseService.togglePublished(id);

    if (!updatedPost) {
      return sendNotFound(res, 'Blog post');
    }

    // Format post for API response
    const formattedPost = formatBlogPost(updatedPost);

    return sendSuccess(res, {
      post: formattedPost,
      action: updatedPost.published ? 'published' : 'unpublished'
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error toggling publish status:', error);
    return sendError(res, 'Failed to update publish status');
  }
}));

/**
 * PATCH /api/admin/blog/posts/:id/feature - Toggle featured status
 */
router.patch('/posts/:id/feature', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate ID parameter
    const { id } = validateBlogPostId(req.params);

    // Toggle featured status
    const updatedPost = await blogDatabaseService.toggleFeatured(id);

    if (!updatedPost) {
      return sendNotFound(res, 'Blog post');
    }

    // Format post for API response
    const formattedPost = formatBlogPost(updatedPost);

    return sendSuccess(res, {
      post: formattedPost,
      action: updatedPost.featured ? 'featured' : 'unfeatured'
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error toggling feature status:', error);
    return sendError(res, 'Failed to update feature status');
  }
}));

/**
 * GET /api/admin/blog/stats - Get comprehensive blog statistics
 */
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await blogDatabaseService.getStats();
    
    return sendSuccess(res, stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return sendError(res, 'Failed to fetch blog statistics');
  }
}));

/**
 * GET /api/admin/blog/categories - Get all categories (including from unpublished posts)
 */
router.get('/categories', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await blogDatabaseService.getCategories();
    
    return sendSuccess(res, categories);

  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return sendError(res, 'Failed to fetch categories');
  }
}));

/**
 * GET /api/admin/blog/tags - Get all tags (including from unpublished posts)
 */
router.get('/tags', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tags = await blogDatabaseService.getTags();
    
    return sendSuccess(res, tags);

  } catch (error) {
    console.error('Error fetching admin tags:', error);
    return sendError(res, 'Failed to fetch tags');
  }
}));

/**
 * GET /api/admin/blog/drafts - Get all draft posts
 */
router.get('/drafts', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate query parameters
    const query = validateBlogPostQuery(req.query);
    
    // Get draft posts only
    const result = await blogDatabaseService.getAllPosts(
      { published: false },
      { page: query.page, limit: query.limit }
    );

    // Format posts for API response
    const formattedPosts = formatBlogPosts(result.posts);

    return sendSuccess(res, formattedPosts, 200, result.pagination);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error fetching drafts:', error);
    return sendError(res, 'Failed to fetch draft posts');
  }
}));

/**
 * GET /api/admin/blog/published - Get all published posts
 */
router.get('/published', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate query parameters
    const query = validateBlogPostQuery(req.query);
    
    // Get published posts only
    const result = await blogDatabaseService.getAllPosts(
      { published: true },
      { page: query.page, limit: query.limit }
    );

    // Format posts for API response
    const formattedPosts = formatBlogPosts(result.posts);

    return sendSuccess(res, formattedPosts, 200, result.pagination);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error fetching published posts:', error);
    return sendError(res, 'Failed to fetch published posts');
  }
}));

/**
 * POST /api/admin/blog/posts/:id/duplicate - Duplicate a blog post
 */
router.post('/posts/:id/duplicate', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate ID parameter
    const { id } = validateBlogPostId(req.params);

    // Get original post
    const originalPost = await blogDatabaseService.getPostById(id);
    
    if (!originalPost) {
      return sendNotFound(res, 'Blog post');
    }

    // Create duplicate with modified title and slug
    const duplicateData = {
      title: `${originalPost.title} (Copy)`,
      slug: `${originalPost.slug}-copy`,
      excerpt: originalPost.excerpt,
      content: originalPost.content,
      featuredImage: originalPost.featuredImage,
      category: originalPost.category,
      tags: originalPost.tags || [],
      featured: false, // Don't duplicate featured status
      published: false, // Always create as draft
      authorName: originalPost.authorName,
      authorTitle: originalPost.authorTitle,
      authorImage: originalPost.authorImage,
      readTime: originalPost.readTime,
      editorType: originalPost.editorType
    };

    // Create duplicate post
    const duplicatePost = await blogDatabaseService.createPost(duplicateData);

    // Format post for API response
    const formattedPost = formatBlogPost(duplicatePost);

    return sendCreated(res, formattedPost);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error duplicating post:', error);
    return sendError(res, 'Failed to duplicate blog post');
  }
}));

export default router;