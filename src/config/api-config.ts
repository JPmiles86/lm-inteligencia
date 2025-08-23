// API configuration for the Inteligencia platform

export const apiConfig = {
  baseUrl: import.meta.env.NODE_ENV === 'production' ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api'),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const endpoints = {
  // Industry configuration
  industryConfig: '/industry-config',
  updateIndustryConfig: '/industry-config',
  
  // Content management
  content: '/content',
  contentByIndustry: (industry: string) => `/content/${industry}`,
  csvImport: '/content/csv-import',
  csvExport: '/content/csv-export',
  
  // Image generation
  generateImage: '/images/generate',
  uploadImage: '/images/upload',
  imageGallery: '/images',
  
  // Authentication
  login: '/auth/login',
  logout: '/auth/logout',
  validateToken: '/auth/validate',
  
  // Analytics
  analytics: '/analytics',
  trackEvent: '/analytics/track',
  
  // Platform management
  clientSites: '/platform/sites',
  templates: '/platform/templates',
};

export const imageConfig = {
  uploadUrl: import.meta.env.NODE_ENV === 'production' ? '/api/upload' : (import.meta.env.VITE_IMAGE_UPLOAD_URL || '/api/upload'),
  baseUrl: import.meta.env.NODE_ENV === 'production' ? '/images' : (import.meta.env.VITE_IMAGE_BASE_URL || '/images'),
  maxSize: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE || '10485760'), // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};