import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let details = undefined;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = err.details || err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  } else if (err.name === 'DatabaseError' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    details = process.env.NODE_ENV === 'development' ? err.message : undefined;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (process.env.NODE_ENV === 'development') {
    // In development, send the actual error message
    message = err.message;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = undefined;
  }

  const errorResponse: any = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  if (details) {
    errorResponse.details = details;
  }

  // Add request ID if available
  if (req.headers['x-request-id']) {
    errorResponse.requestId = req.headers['x-request-id'];
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends Error {
  statusCode = 503;
  constructor(message = 'Database error') {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ProviderError extends Error {
  statusCode = 502;
  constructor(message: string, public provider?: string) {
    super(message);
    this.name = 'ProviderError';
  }
}