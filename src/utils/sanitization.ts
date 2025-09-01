/**
 * Sanitization Utilities
 * Provides XSS prevention and content sanitization
 */

import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Configure DOMPurify for different contexts
const createDOMPurify = () => {
  if (typeof window !== 'undefined') {
    return DOMPurify(window);
  }
  // For server-side, we need jsdom
  const { JSDOM } = require('jsdom');
  const jsdomWindow = new JSDOM('').window;
  return DOMPurify(jsdomWindow as any);
};

const purify = typeof window !== 'undefined' ? DOMPurify : createDOMPurify();

/**
 * Sanitize HTML content - removes dangerous elements and attributes
 */
export const sanitizeHTML = (dirty: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: string[];
  allowImages?: boolean;
  allowLinks?: boolean;
}): string => {
  const {
    allowedTags,
    allowedAttributes,
    allowImages = true,
    allowLinks = true,
  } = options || {};

  // Default allowed tags
  const defaultTags = [
    'p', 'br', 'strong', 'em', 'u', 's', 'blockquote',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'code', 'pre', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
  ];

  if (allowImages) {
    defaultTags.push('img', 'figure', 'figcaption');
  }

  if (allowLinks) {
    defaultTags.push('a');
  }

  // Default allowed attributes
  const defaultAttributes = ['class', 'id', 'style'];
  
  if (allowImages) {
    defaultAttributes.push('src', 'alt', 'width', 'height', 'loading');
  }
  
  if (allowLinks) {
    defaultAttributes.push('href', 'target', 'rel');
  }

  const config = {
    ALLOWED_TAGS: allowedTags || defaultTags,
    ALLOWED_ATTR: allowedAttributes || defaultAttributes,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
    // Prevent window.open attacks
    ADD_ATTR: allowLinks ? ['target', 'rel'] : [],
  };

  let clean = purify.sanitize(dirty, config);

  // Additional security for links
  if (allowLinks) {
    clean = clean.replace(/<a\s/gi, '<a rel="noopener noreferrer" ');
  }

  return clean;
};

/**
 * Sanitize markdown content before rendering
 */
export const sanitizeMarkdown = (markdown: string): string => {
  // First, sanitize the raw markdown to remove script tags
  let clean = markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers

  // Convert markdown to HTML synchronously
  const html = marked.parse(clean, {
    breaks: true,
    gfm: true,
    async: false,
  }) as string;

  // Sanitize the resulting HTML
  return sanitizeHTML(html);
};

/**
 * Sanitize plain text input - removes HTML and dangerous characters
 */
export const sanitizeText = (text: string, options?: {
  maxLength?: number;
  allowNewlines?: boolean;
  allowSpecialChars?: boolean;
}): string => {
  const {
    maxLength = 10000,
    allowNewlines = true,
    allowSpecialChars = true,
  } = options || {};

  let clean = text;

  // Remove HTML tags
  clean = clean.replace(/<[^>]*>/g, '');

  // Remove zero-width characters and other invisible unicode
  clean = clean.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Handle newlines
  if (!allowNewlines) {
    clean = clean.replace(/[\r\n]+/g, ' ');
  } else {
    // Normalize newlines
    clean = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Limit consecutive newlines
    clean = clean.replace(/\n{3,}/g, '\n\n');
  }

  // Remove control characters except tab and newline
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Optionally remove special characters
  if (!allowSpecialChars) {
    // Keep only alphanumeric, spaces, and basic punctuation
    clean = clean.replace(/[^a-zA-Z0-9\s\-_.,:;!?'"()\[\]{}]/g, '');
  }

  // Trim and limit length
  clean = clean.trim();
  if (maxLength && clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
};

/**
 * Sanitize JSON input - prevents injection in JSON strings
 */
export const sanitizeJSON = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJSON(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize the key
        const cleanKey = sanitizeText(key, { 
          maxLength: 100, 
          allowNewlines: false,
          allowSpecialChars: false,
        });
        // Recursively sanitize the value
        sanitized[cleanKey] = sanitizeJSON(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj; // Numbers, booleans, null
};

/**
 * Sanitize filename - removes dangerous characters from filenames
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts
  let clean = filename.replace(/\.\./g, '');
  
  // Remove directory separators
  clean = clean.replace(/[\/\\]/g, '');
  
  // Remove special characters that could cause issues
  clean = clean.replace(/[^a-zA-Z0-9\-_.]/g, '_');
  
  // Remove leading dots (hidden files)
  clean = clean.replace(/^\.+/, '');
  
  // Limit length
  if (clean.length > 255) {
    const extension = clean.split('.').pop();
    const name = clean.substring(0, 240);
    clean = extension ? `${name}.${extension}` : name;
  }
  
  // Default name if empty
  if (!clean) {
    clean = 'unnamed_file';
  }
  
  return clean;
};

/**
 * Sanitize URL - validates and cleans URLs
 */
export const sanitizeURL = (url: string, options?: {
  allowedProtocols?: string[];
  allowDataURLs?: boolean;
}): string | null => {
  const {
    allowedProtocols = ['http', 'https'],
    allowDataURLs = false,
  } = options || {};

  try {
    // Handle data URLs separately
    if (url.startsWith('data:')) {
      return allowDataURLs ? url : null;
    }

    const parsed = new URL(url);
    
    // Check protocol
    const protocol = parsed.protocol.replace(':', '');
    if (!allowedProtocols.includes(protocol)) {
      return null;
    }
    
    // Remove credentials from URL
    parsed.username = '';
    parsed.password = '';
    
    // Remove dangerous characters
    parsed.hash = parsed.hash.replace(/[<>'"]/g, '');
    
    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string | null => {
  // Basic email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const clean = email.toLowerCase().trim();
  
  if (emailRegex.test(clean) && clean.length <= 254) {
    return clean;
  }
  
  return null;
};

/**
 * Sanitize SQL identifier (table/column names)
 * Note: This is a last resort - always use parameterized queries!
 */
export const sanitizeSQLIdentifier = (identifier: string): string => {
  // Only allow alphanumeric and underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
};

/**
 * Escape HTML entities
 */
export const escapeHTML = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
};

/**
 * Unescape HTML entities
 */
export const unescapeHTML = (text: string): string => {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
  };
  
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;/g, (entity) => map[entity]);
};

/**
 * Create a content security policy for user-generated content
 */
export const getContentSecurityPolicy = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Be more restrictive in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
};

/**
 * Validate and sanitize a complete blog post
 */
export const sanitizeBlogPost = (post: {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
}): {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
} => {
  return {
    title: sanitizeText(post.title, { maxLength: 200, allowNewlines: false }),
    content: sanitizeMarkdown(post.content),
    excerpt: post.excerpt 
      ? sanitizeText(post.excerpt, { maxLength: 500 })
      : undefined,
    tags: post.tags
      ? post.tags.map(tag => sanitizeText(tag, { 
          maxLength: 30, 
          allowNewlines: false,
          allowSpecialChars: false,
        }))
      : undefined,
  };
};