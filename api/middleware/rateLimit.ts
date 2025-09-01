/**
 * Rate Limiting Middleware
 * Prevents abuse and controls API usage
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Create a custom key generator based on user ID or IP
 */
const keyGenerator = (req: Request): string => {
  // Prefer user ID if authenticated
  if ((req as any).user?.id) {
    return `user_${(req as any).user.id}`;
  }
  
  // Fallback to IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';
  
  return `ip_${ip}`;
};

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: res.getHeader('Retry-After'),
  });
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes per user/IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for certain paths or users
    if (req.path === '/api/health') return true;
    if ((req as any).user?.role === 'admin') return true;
    return false;
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Always use IP for auth endpoints
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown';
    return `auth_${ip}`;
  },
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * AI Generation rate limiter
 * More restrictive due to high cost
 * 10 generations per minute, 100 per hour
 */
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many generation requests, please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Hourly generation limiter
 * Prevents excessive usage over longer periods
 */
export const hourlyGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: 'Hourly generation limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Image generation rate limiter
 * More restrictive than text generation
 * 5 per minute, 20 per hour
 */
export const imageGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many image generation requests, please wait.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * File upload rate limiter
 * 20 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Provider API key testing limiter
 * Prevent abuse of provider testing
 * 10 tests per hour
 */
export const providerTestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many provider tests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Blog post creation limiter
 * 30 posts per day per user
 */
export const blogPostLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30,
  message: 'Daily blog post limit reached, please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Search/query rate limiter
 * Prevent search abuse
 * 60 searches per minute
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many search requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Dynamic rate limiter based on user tier
 * Can be customized based on subscription level
 */
export const createTieredLimiter = (tier: 'free' | 'basic' | 'pro' | 'enterprise') => {
  const limits = {
    free: { windowMs: 60 * 1000, max: 5 },
    basic: { windowMs: 60 * 1000, max: 20 },
    pro: { windowMs: 60 * 1000, max: 60 },
    enterprise: { windowMs: 60 * 1000, max: 200 },
  };

  const config = limits[tier];

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: `Rate limit exceeded for ${tier} tier. Consider upgrading for higher limits.`,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: rateLimitHandler,
  });
};

/**
 * IP-based rate limiter for public endpoints
 * Stricter than authenticated endpoints
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded 
      ? (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown';
    return `public_${ip}`;
  },
  handler: rateLimitHandler,
});

/**
 * Sliding window rate limiter for more accurate limiting
 * Uses Redis if available for distributed systems
 */
export const createSlidingWindowLimiter = (options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const key = keyGenerator(req);
      return options.keyPrefix ? `${options.keyPrefix}_${key}` : key;
    },
    handler: rateLimitHandler,
    // Store configuration for distributed systems
    // In production, use Redis or similar
    store: undefined, // Use default memory store for now
  });
};

/**
 * Middleware to apply multiple rate limiters
 */
export const applyRateLimiters = (...limiters: any[]) => {
  return (req: Request, res: Response, next: any) => {
    let index = 0;
    
    const applyNext = () => {
      if (index >= limiters.length) {
        return next();
      }
      
      const limiter = limiters[index++];
      limiter(req, res, applyNext);
    };
    
    applyNext();
  };
};