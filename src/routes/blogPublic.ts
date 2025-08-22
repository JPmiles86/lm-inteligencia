// Public Blog API Routes - No authentication required
// Handles public access to published blog content

import { Router, Request, Response } from 'express';
import { blogDatabaseService } from '../services/blogDatabaseService.js';
import { 
  sendSuccess, 
  sendError, 
  sendNotFound, 
  sendValidationError,
  formatBlogPost,
  formatBlogPosts,
  asyncHandler 
} from '../utils/apiResponse.js';
import { 
  validateBlogPostQuery, 
  validateBlogPostSlug,
  BlogPostQuery 
} from '../schemas/blogSchemas.js';
import { ZodError } from 'zod';

const router = Router();

/**
 * GET /api/blog/posts - Get published blog posts with pagination and filtering
 * Query params: page, limit, category, featured, search, tags, sortBy, sortOrder
 */
router.get('/posts', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const query = validateBlogPostQuery(req.query);
    
    // Build filters for published posts only
    const filters = {
      published: true, // Only show published posts
      ...(query.category && { category: query.category }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.search && { search: query.search }),
      ...(query.tags && { tags: query.tags })
    };

    // Get paginated results
    const result = await blogDatabaseService.getAllPublishedPosts(
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
    console.error('Error fetching published posts:', error);
    return sendError(res, 'Failed to fetch blog posts');
  }
}));

/**
 * GET /api/blog/posts/:slug - Get a single published blog post by slug
 */
router.get('/posts/:slug', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate slug parameter
    const { slug } = validateBlogPostSlug(req.params);

    // Get published post by slug
    const post = await blogDatabaseService.getPublishedPostBySlug(slug);

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
 * GET /api/blog/categories - Get all unique categories from published posts
 */
router.get('/categories', asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = await blogDatabaseService.getCategories();
    
    return sendSuccess(res, categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    return sendError(res, 'Failed to fetch categories');
  }
}));

/**
 * GET /api/blog/tags - Get all unique tags from published posts
 */
router.get('/tags', asyncHandler(async (req: Request, res: Response) => {
  try {
    const tags = await blogDatabaseService.getTags();
    
    return sendSuccess(res, tags);

  } catch (error) {
    console.error('Error fetching tags:', error);
    return sendError(res, 'Failed to fetch tags');
  }
}));

/**
 * GET /api/blog/featured - Get featured published posts
 */
router.get('/featured', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get featured posts with default pagination
    const result = await blogDatabaseService.getAllPublishedPosts(
      { featured: true, published: true },
      { page: 1, limit: 6 } // Limit featured posts
    );

    // Format posts for API response
    const formattedPosts = formatBlogPosts(result.posts);

    return sendSuccess(res, formattedPosts, 200, result.pagination);

  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return sendError(res, 'Failed to fetch featured posts');
  }
}));

/**
 * GET /api/blog/recent - Get recent published posts
 */
router.get('/recent', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get recent posts with default pagination
    const result = await blogDatabaseService.getAllPublishedPosts(
      { published: true },
      { page: 1, limit: 5 } // Limit recent posts
    );

    // Format posts for API response
    const formattedPosts = formatBlogPosts(result.posts);

    return sendSuccess(res, formattedPosts, 200, result.pagination);

  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return sendError(res, 'Failed to fetch recent posts');
  }
}));

/**
 * GET /api/blog/search - Search published posts (alias for posts with search)
 */
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  try {
    const query = validateBlogPostQuery(req.query);
    
    if (!query.search) {
      return sendValidationError(res, [{ message: 'Search query is required' }]);
    }

    // Build search filters
    const filters = {
      published: true,
      search: query.search,
      ...(query.category && { category: query.category }),
      ...(query.tags && { tags: query.tags })
    };

    // Get search results
    const result = await blogDatabaseService.getAllPublishedPosts(
      filters,
      { page: query.page, limit: query.limit }
    );

    // Format posts for API response
    const formattedPosts = formatBlogPosts(result.posts);

    return sendSuccess(res, {
      posts: formattedPosts,
      searchQuery: query.search,
      resultCount: result.pagination.total
    }, 200, result.pagination);

  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(res, error.errors);
    }
    console.error('Error searching posts:', error);
    return sendError(res, 'Failed to search blog posts');
  }
}));

/**
 * GET /api/blog/stats - Get public blog statistics
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    const stats = await blogDatabaseService.getStats();
    
    // Return only public stats (no draft counts)
    const publicStats = {
      totalPosts: stats.publishedPosts, // Only show published count
      featuredPosts: stats.featuredPosts,
      categoryCounts: stats.categoryCounts
    };

    return sendSuccess(res, publicStats);

  } catch (error) {
    console.error('Error fetching public stats:', error);
    return sendError(res, 'Failed to fetch blog statistics');
  }
}));

export default router;