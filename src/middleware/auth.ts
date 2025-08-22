// Authentication Middleware for Blog API
// Integrates with existing admin authentication system

import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized, sendForbidden } from '../utils/apiResponse.js';

// Extended Request interface to include admin user info
export interface AuthenticatedRequest extends Request {
  admin?: {
    email: string;
    authenticated: boolean;
  };
}

// Admin credentials (in production, this should be in environment variables or a secure backend)
const ADMIN_EMAIL = 'laurie@inteligenciadm.com';
const ADMIN_PASSWORD = 'Inteligencia2025!';

/**
 * Basic authentication middleware using session-based auth
 * Checks for admin session in custom header
 */
export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for session token in headers (matches frontend sessionStorage)
    const sessionToken = req.headers['x-admin-session'] as string;
    const adminEmail = req.headers['x-admin-email'] as string;

    if (!sessionToken || sessionToken !== 'true') {
      return sendUnauthorized(res, 'Admin authentication required');
    }

    if (!adminEmail || adminEmail !== ADMIN_EMAIL) {
      return sendUnauthorized(res, 'Invalid admin credentials');
    }

    // Add admin info to request
    req.admin = {
      email: adminEmail,
      authenticated: true
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Basic authentication middleware using HTTP Basic Auth
 * Alternative authentication method for API clients
 */
export const authenticateBasic = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return sendUnauthorized(res, 'Basic authentication required');
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.slice('Basic '.length);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Add admin info to request
    req.admin = {
      email,
      authenticated: true
    };

    next();
  } catch (error) {
    console.error('Basic authentication error:', error);
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Flexible authentication middleware that supports both session and basic auth
 */
export const authenticateAdminFlexible = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Try session authentication first
  const sessionToken = req.headers['x-admin-session'] as string;
  const adminEmail = req.headers['x-admin-email'] as string;

  if (sessionToken === 'true' && adminEmail === ADMIN_EMAIL) {
    req.admin = {
      email: adminEmail,
      authenticated: true
    };
    return next();
  }

  // Fall back to basic authentication
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const base64Credentials = authHeader.slice('Basic '.length);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        req.admin = {
          email,
          authenticated: true
        };
        return next();
      }
    } catch (error) {
      console.error('Basic auth parsing error:', error);
    }
  }

  return sendUnauthorized(res, 'Admin authentication required');
};

/**
 * API key authentication middleware (for future use)
 */
export const authenticateApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return sendUnauthorized(res, 'API key required');
  }

  // In production, validate API key against database
  const validApiKey = process.env.BLOG_API_KEY;
  
  if (!validApiKey || apiKey !== validApiKey) {
    return sendUnauthorized(res, 'Invalid API key');
  }

  req.admin = {
    email: 'api-access',
    authenticated: true
  };

  next();
};

/**
 * Rate limiting middleware for API endpoints
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientIp);
    
    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      requestCounts.set(clientIp, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    next();
  };
};

/**
 * CORS middleware for blog API
 */
export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:5173',
    'https://inteligenciadm.com',
    'https://www.inteligenciadm.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Session, X-Admin-Email, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };
    
    console.log('API Request:', JSON.stringify(logData));
  });
  
  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Don't cache sensitive endpoints
  if (req.path.startsWith('/api/admin')) {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  
  next();
};