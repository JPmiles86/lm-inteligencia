/**
 * Security Middleware
 * Comprehensive security measures for the API
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { SECURITY_HEADERS, getCSPHeader, SECURITY_EVENTS } from '../../src/config/security.js';
import { validateSchema } from '../../src/utils/validation.js';
import { sanitizeText, sanitizeJSON } from '../../src/utils/sanitization.js';

/**
 * Apply security headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Custom security headers
 */
export function customSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Add custom security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
}

/**
 * Sanitize request inputs
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeJSON(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value, { maxLength: 1000 });
      } else {
        sanitized[key] = value;
      }
    }
    req.query = sanitized;
  }

  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value, { maxLength: 100 });
      } else {
        sanitized[key] = value;
      }
    }
    req.params = sanitized;
  }

  next();
}

/**
 * Prevent SQL injection
 */
export function preventSQLInjection(req: Request, res: Response, next: NextFunction) {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
    /(--|\||;|\/\*|\*\/|xp_|sp_|0x)/gi,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => checkValue(v));
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    logSecurityEvent(SECURITY_EVENTS.SQL_INJECTION_ATTEMPT, req);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
    });
  }

  next();
}

/**
 * Prevent XSS attacks
 */
export function preventXSS(req: Request, res: Response, next: NextFunction) {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => checkValue(v));
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query)) {
    logSecurityEvent(SECURITY_EVENTS.XSS_ATTEMPT, req);
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
    });
  }

  next();
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.body.apiKey;
  
  if (apiKey && typeof apiKey === 'string') {
    // Check for common leaked key patterns
    const leakedPatterns = [
      /^sk-[0-9a-zA-Z]{48}$/, // Old OpenAI format
      /OPENAI_API_KEY/i,
      /YOUR_API_KEY_HERE/i,
      /\[API_KEY\]/i,
    ];

    if (leakedPatterns.some(pattern => pattern.test(apiKey))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or potentially leaked API key detected',
      });
    }
  }

  next();
}

/**
 * Check for authorization
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Skip auth for public endpoints
  const publicPaths = ['/api/health', '/api/status'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  // Check session or token
  const session = (req as any).session;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!session?.user && !token) {
    logSecurityEvent(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, req);
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  next();
}

/**
 * Validate file uploads
 */
export function validateFileUpload(
  allowedTypes: string[],
  maxSize: number = 10 * 1024 * 1024 // 10MB default
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file || (req as any).files?.[0];
    
    if (!file) {
      return next();
    }

    // Check file size
    if (file.size > maxSize) {
      logSecurityEvent(SECURITY_EVENTS.FILE_UPLOAD_REJECTED, req);
      return res.status(400).json({
        success: false,
        error: `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
      });
    }

    // Check file type
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      logSecurityEvent(SECURITY_EVENTS.FILE_UPLOAD_REJECTED, req);
      return res.status(400).json({
        success: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      });
    }

    // Check for double extensions
    if (file.originalname.split('.').length > 2) {
      logSecurityEvent(SECURITY_EVENTS.FILE_UPLOAD_REJECTED, req);
      return res.status(400).json({
        success: false,
        error: 'Files with multiple extensions are not allowed',
      });
    }

    next();
  };
}

/**
 * Log security events
 */
function logSecurityEvent(event: string, req: Request, details?: any) {
  const logEntry = {
    event,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    details,
  };

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
    console.error('[SECURITY]', JSON.stringify(logEntry));
  } else {
    console.warn('[SECURITY]', logEntry);
  }
}

/**
 * Apply all security middleware
 */
export function applySecurity(app: any) {
  // Basic security headers
  app.use(securityHeaders);
  app.use(customSecurityHeaders);
  
  // Input sanitization
  app.use(sanitizeInputs);
  
  // Attack prevention
  app.use(preventXSS);
  app.use(preventSQLInjection);
  
  // API key validation
  app.use('/api/providers', validateApiKeyFormat);
  
  // File upload validation for specific routes
  app.use('/api/upload', validateFileUpload(['jpg', 'jpeg', 'png', 'gif', 'webp']));
}

export default {
  securityHeaders,
  customSecurityHeaders,
  sanitizeInputs,
  preventSQLInjection,
  preventXSS,
  validateApiKeyFormat,
  requireAuth,
  validateFileUpload,
  applySecurity,
};