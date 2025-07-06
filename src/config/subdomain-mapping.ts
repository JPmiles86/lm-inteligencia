// Subdomain to industry mapping configuration

import type { IndustryType } from '../types/Industry';

// Development URL patterns for localhost testing
export const developmentRoutes = {
  main: '?industry=inteligencia',
  hospitality: '?industry=hotels',
  foodservice: '?industry=restaurants',
  healthcare: '?industry=healthcare',
  athletics: '?industry=sports',
};

// Production subdomain mapping
export const subdomainMapping: Record<string, IndustryType> = {
  'inteligencia': 'main',
  'hotels': 'hospitality',
  'restaurants': 'foodservice',
  'healthcare': 'healthcare',
  'sports': 'athletics',
};

// Reverse mapping for generating URLs
export const industryToSubdomain: Record<IndustryType, string> = {
  main: 'inteligencia',
  hospitality: 'hotels',
  foodservice: 'restaurants',
  healthcare: 'healthcare',
  athletics: 'sports',
};

// Environment configuration
export const environmentConfig = {
  development: {
    baseUrl: 'http://localhost:3001',
    useSubdomains: false,
    useQueryParams: true,
  },
  production: {
    baseUrl: 'https://inteligencia.com',
    useSubdomains: true,
    useQueryParams: false,
  },
};

// Get current environment
export const getCurrentEnvironment = (): 'development' | 'production' => {
  if (typeof window === 'undefined') return 'production';
  
  const hostname = window.location.hostname;
  return hostname.includes('localhost') || hostname.includes('127.0.0.1') 
    ? 'development' 
    : 'production';
};

// Validation helpers
export const isValidSubdomain = (subdomain: string): boolean => {
  return subdomain in subdomainMapping;
};

export const isValidIndustry = (industry: string): industry is IndustryType => {
  return industry in industryToSubdomain;
};