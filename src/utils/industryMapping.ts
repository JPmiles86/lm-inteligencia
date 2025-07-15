import { IndustryType } from '../types/Industry';

// Centralized URL path to industry type mapping
// This handles both singular and plural forms for flexibility
export const urlToIndustryMap: Record<string, IndustryType> = {
  // Hospitality - new URL and redirects from old URLs
  'hospitality': 'hospitality',
  'hotel': 'hospitality',
  'hotels': 'hospitality',
  'restaurant': 'hospitality',
  'restaurants': 'hospitality',
  
  // Healthcare - new URL and redirects from old URLs
  'health': 'healthcare',
  'healthcare': 'healthcare',
  'dental': 'healthcare',
  'medical': 'healthcare',
  
  // Tech
  'tech': 'tech',
  'technology': 'tech',
  'ai': 'tech',
  
  // Athletics - new URL and redirects from old URLs
  'sports': 'athletics',
  'sport': 'athletics',
  'athletics': 'athletics',
  'athletic': 'athletics',
  
  // Main/Default
  'inteligencia': 'main',
  'main': 'main'
};

// Reverse mapping: industry type to preferred URL path
export const industryToUrlMap: Record<IndustryType, string> = {
  'hospitality': 'hospitality',
  'healthcare': 'health',
  'tech': 'tech',
  'athletics': 'sports',
  'main': ''
};

// Helper function to get industry type from URL path
export function getIndustryFromPath(path: string): IndustryType | null {
  const segments = path.split('/').filter(Boolean);
  const industryKey = segments[0]?.toLowerCase();
  
  if (!industryKey) return null;
  
  return urlToIndustryMap[industryKey] || null;
}

// Helper function to get URL path from industry type
export function getPathFromIndustry(industry: IndustryType): string {
  return industryToUrlMap[industry] || '';
}

// Helper function to validate if a path segment is a valid industry
export function isValidIndustryPath(path: string): boolean {
  return path.toLowerCase() in urlToIndustryMap;
}

// Helper function to get the default industry if none is specified
export function getDefaultIndustry(): IndustryType {
  return 'hospitality'; // Default to hospitality if no industry is specified
}