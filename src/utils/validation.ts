/**
 * Validation Helper Functions
 * Utilities for input validation and error handling
 */

import { z, ZodError, ZodSchema } from 'zod';
import { sanitizeText, sanitizeHTML, sanitizeMarkdown } from './sanitization';

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Validate data against a Zod schema
 */
export function validateSchema<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options?: {
    sanitize?: boolean;
    abortEarly?: boolean;
  }
): ValidationResult<T> {
  const { sanitize = true, abortEarly = false } = options || {};

  try {
    // Sanitize data before validation if requested
    const dataToValidate = sanitize ? sanitizeData(data) : data;
    
    // Parse with Zod
    const result = schema.parse(dataToValidate);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      if (abortEarly && errors.length > 0) {
        return {
          success: false,
          errors: [errors[0]],
        };
      }

      return {
        success: false,
        errors,
      };
    }

    // Unknown error
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
        code: 'UNKNOWN_ERROR',
      }],
    };
  }
}

/**
 * Sanitize data recursively before validation
 */
function sanitizeData(data: unknown): unknown {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if ((data as any).hasOwnProperty(key)) {
        sanitized[key] = sanitizeData((data as any)[key]);
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Create a validation middleware for Express
 */
export function createValidationMiddleware<T>(
  schema: ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: any, res: any, next: any) => {
    const result = validateSchema(schema, req[source]);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: result.errors,
      });
    }
    
    // Replace request data with validated and sanitized data
    req[source] = result.data;
    next();
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate phone number (basic international format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Common patterns to avoid
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeated characters');
    score -= 1;
  }

  if (/^(password|12345678|qwerty)/i.test(password)) {
    feedback.push('Password is too common');
    score = 0;
  }

  return {
    isValid: score >= 4 && password.length >= 8,
    score: Math.max(0, Math.min(5, score)),
    feedback,
  };
}

/**
 * Validate file type
 */
export function isValidFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;
  
  return allowedTypes.includes(extension);
}

/**
 * Validate file size
 */
export function isValidFileSize(
  sizeInBytes: number,
  maxSizeInMB: number
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
}

/**
 * Validate date range
 */
export function isValidDateRange(
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  
  // End date should be after start date
  return end > start;
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate IP address (v4 or v6)
 */
export function isValidIPAddress(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) return true;
  
  // IPv6 (simplified)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/;
  return ipv6Regex.test(ip);
}

/**
 * Validate JSON string
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Create a custom error response
 */
export function createValidationError(
  field: string,
  message: string,
  code?: string
): ValidationError {
  return {
    field,
    message,
    code: code || 'VALIDATION_ERROR',
  };
}

/**
 * Batch validate multiple fields
 */
export function batchValidate(
  validations: Array<{
    field: string;
    value: unknown;
    validator: (value: unknown) => boolean;
    message: string;
  }>
): ValidationResult<void> {
  const errors: ValidationError[] = [];
  
  for (const { field, value, validator, message } of validations) {
    if (!validator(value)) {
      errors.push(createValidationError(field, message));
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }
  
  return {
    success: true,
  };
}

/**
 * Format validation errors for user display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return 'Multiple validation errors:\n' + 
    errors.map(e => `• ${e.field}: ${e.message}`).join('\n');
}