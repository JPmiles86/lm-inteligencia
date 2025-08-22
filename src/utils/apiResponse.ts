// API Response Utilities - Standardized response formatting for blog API
import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Send a successful API response
 */
export const sendSuccess = <T>(
  res: Response, 
  data: T, 
  statusCode: number = 200,
  pagination?: PaginationInfo
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(pagination && { pagination })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Send an error API response
 */
export const sendError = (
  res: Response, 
  error: string, 
  statusCode: number = 500,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  
  // In development, include error details
  if (process.env.NODE_ENV === 'development' && details) {
    (response as any).details = details;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 */
export const sendValidationError = (
  res: Response, 
  errors: any
): Response => {
  return sendError(res, 'Validation failed', 400, errors);
};

/**
 * Send a not found error response
 */
export const sendNotFound = (
  res: Response, 
  resource: string = 'Resource'
): Response => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Send an unauthorized error response
 */
export const sendUnauthorized = (
  res: Response, 
  message: string = 'Unauthorized access'
): Response => {
  return sendError(res, message, 401);
};

/**
 * Send a forbidden error response
 */
export const sendForbidden = (
  res: Response, 
  message: string = 'Access forbidden'
): Response => {
  return sendError(res, message, 403);
};

/**
 * Send a conflict error response
 */
export const sendConflict = (
  res: Response, 
  message: string = 'Resource conflict'
): Response => {
  return sendError(res, message, 409);
};

/**
 * Send a created response (201)
 */
export const sendCreated = <T>(
  res: Response, 
  data: T, 
  message?: string
): Response => {
  return sendSuccess(res, data, 201);
};

/**
 * Send a no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send a paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: PaginationInfo,
  statusCode: number = 200
): Response => {
  return sendSuccess(res, data, statusCode, pagination);
};

/**
 * Error handler wrapper for async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (
  error: any,
  req: any,
  res: Response,
  next: any
) => {
  console.error('API Error:', error);

  // Zod validation errors
  if (error.name === 'ZodError') {
    return sendValidationError(res, error.errors);
  }

  // Database errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        return sendConflict(res, 'Resource already exists');
      case '23503': // Foreign key violation
        return sendError(res, 'Referenced resource not found', 400);
      case '23502': // Not null violation
        return sendValidationError(res, 'Required field missing');
      default:
        return sendError(res, 'Database error occurred', 500);
    }
  }

  // Custom application errors
  if (error.message) {
    const statusCode = error.statusCode || 500;
    return sendError(res, error.message, statusCode);
  }

  // Default server error
  return sendError(res, 'Internal server error', 500);
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req: any, res: Response) => {
  return sendNotFound(res, 'API endpoint');
};

/**
 * Rate limiting error handler
 */
export const rateLimitHandler = (req: any, res: Response) => {
  return sendError(res, 'Too many requests, please try again later', 429);
};

/**
 * Format blog post data for API response
 */
export const formatBlogPost = (post: any) => {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    category: post.category,
    tags: post.tags || [],
    featured: post.featured,
    published: post.published,
    publishedDate: post.publishedDate,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: {
      name: post.authorName,
      title: post.authorTitle,
      image: post.authorImage
    },
    readTime: post.readTime,
    editorType: post.editorType
  };
};

/**
 * Format multiple blog posts for API response
 */
export const formatBlogPosts = (posts: any[]) => {
  return posts.map(formatBlogPost);
};

/**
 * Create pagination info object
 */
export const createPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};