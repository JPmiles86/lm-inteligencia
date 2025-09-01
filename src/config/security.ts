/**
 * Security Configuration
 * Central security settings and policies
 */

// Content Security Policy
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Tighten in production
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': ["'self'", 'https://api.openai.com', 'https://api.anthropic.com', 'https://api.perplexity.ai'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Security Headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// CORS Configuration
export const CORS_OPTIONS = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://inteligenciadm.com', 'https://hospitality.inteligenciadm.com']
    : ['http://localhost:3001', 'http://localhost:4000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Session Configuration
export const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET || 'change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const,
  },
};

// API Key Validation Patterns
export const API_KEY_PATTERNS = {
  openai: /^sk-[a-zA-Z0-9]{48,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9]{40,}$/,
  google: /^AIza[a-zA-Z0-9]{35}$/,
  perplexity: /^pplx-[a-zA-Z0-9]{40,}$/,
};

// Input Limits
export const INPUT_LIMITS = {
  maxPromptLength: 10000,
  maxContentLength: 50000,
  maxTitleLength: 200,
  maxExcerptLength: 500,
  maxTagLength: 30,
  maxTagCount: 10,
  maxImagePromptLength: 500,
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// Rate Limiting Tiers
export const RATE_LIMITS = {
  public: {
    windowMs: 15 * 60 * 1000,
    max: 30,
  },
  authenticated: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  api: {
    windowMs: 1 * 60 * 1000,
    max: 60,
  },
  generation: {
    windowMs: 1 * 60 * 1000,
    max: 10,
  },
  image: {
    windowMs: 1 * 60 * 1000,
    max: 5,
  },
};

// Allowed File Types
export const ALLOWED_FILE_TYPES = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  documents: ['pdf', 'doc', 'docx', 'txt', 'md'],
  data: ['json', 'csv', 'xml'],
};

// Sanitization Options
export const SANITIZATION_OPTIONS = {
  html: {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'code', 'pre', 'a', 'img'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  },
  markdown: {
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false,
  },
};

// Encryption Settings
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyDerivation: 'pbkdf2',
  iterations: 100000,
  saltLength: 32,
  tagLength: 16,
  ivLength: 16,
};

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*(),.?":{}|<>',
};

// Security Event Types for Logging
export const SECURITY_EVENTS = {
  AUTH_SUCCESS: 'auth.success',
  AUTH_FAILURE: 'auth.failure',
  API_KEY_ADDED: 'api_key.added',
  API_KEY_TESTED: 'api_key.tested',
  API_KEY_FAILED: 'api_key.failed',
  RATE_LIMIT_EXCEEDED: 'rate_limit.exceeded',
  INVALID_INPUT: 'input.invalid',
  XSS_ATTEMPT: 'xss.attempt',
  SQL_INJECTION_ATTEMPT: 'sql_injection.attempt',
  UNAUTHORIZED_ACCESS: 'access.unauthorized',
  FILE_UPLOAD_REJECTED: 'file.rejected',
  ENCRYPTION_ERROR: 'encryption.error',
};

// Environment Variable Requirements
export const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'ENCRYPTION_KEY',
  'SESSION_SECRET',
  'NODE_ENV',
];

// Optional but recommended
export const RECOMMENDED_ENV_VARS = [
  'SENTRY_DSN',
  'LOG_LEVEL',
  'RATE_LIMIT_REDIS_URL',
  'BACKUP_ENCRYPTION_KEY',
];

/**
 * Validate environment configuration
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get CSP header string
 */
export function getCSPHeader(): string {
  return Object.entries(CSP_POLICY)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get secure cookie options
 */
export function getSecureCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000,
  };
}