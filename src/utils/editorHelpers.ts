// Editor Helper Functions - HTML cleanup, validation, and utility functions

export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization for rich text editor content
  // This is a simple implementation - in production, consider using a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '');
};

export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

export const calculateReadTime = (html: string): number => {
  const text = stripHtmlTags(html);
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateExcerpt = (html: string, maxLength: number = 160): string => {
  const text = stripHtmlTags(html);
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

export const validateImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Check if it's an image URL
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = url.split('.').pop()?.toLowerCase();
  
  return imageExtensions.includes(extension || '');
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Count words in HTML content
export const countWords = (html: string): number => {
  const text = stripHtmlTags(html);
  return text.split(/\s+/).filter(word => word.length > 0).length;
};

// Count characters in HTML content (excluding tags)
export const countCharacters = (html: string): number => {
  return stripHtmlTags(html).length;
};

// Extract all image URLs from HTML content
export const extractImageUrls = (html: string): string[] => {
  const imgRegex = /<img[^>]+src\s*=\s*['"]([^'"]*)['"]/gi;
  const urls: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  
  return urls;
};