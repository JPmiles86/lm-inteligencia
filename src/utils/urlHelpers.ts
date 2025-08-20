// URL helper utilities for subdomain-aware navigation
// Ensures all URLs work correctly on both main domain and subdomains

import { getCurrentSubdomain } from './domainRedirect';

/**
 * Generates a subdomain-aware URL for navigation
 * On hospitality subdomain: returns clean paths without /hotels prefix
 * On main domain or other contexts: returns industry-prefixed paths
 * 
 * @param path - The path to navigate to (e.g., '/services', '/contact')
 * @param industryPrefix - The industry prefix to use on main domain (e.g., 'hotels')
 * @returns Subdomain-aware URL
 */
export const generateSubdomainAwareUrl = (path: string, industryPrefix: string = 'hotels'): string => {
  const subdomain = getCurrentSubdomain();
  const isOnHospitalitySubdomain = subdomain === 'hospitality';
  
  // Remove leading slash if present for consistency
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (isOnHospitalitySubdomain) {
    // On hospitality subdomain, use clean paths
    return `/${cleanPath}`;
  } else {
    // On main domain or other contexts, use industry prefix
    return `/${industryPrefix}/${cleanPath}`;
  }
};

/**
 * Generates a subdomain-aware URL for services with anchor links
 * Handles service-specific URLs like '/services#google-ads'
 * 
 * @param anchor - The anchor/fragment identifier (e.g., 'google-ads')
 * @param industryPrefix - The industry prefix to use on main domain (default: 'hotels')
 * @returns Subdomain-aware services URL with anchor
 */
export const generateServiceUrl = (anchor: string, industryPrefix: string = 'hotels'): string => {
  const basePath = `services#${anchor}`;
  return generateSubdomainAwareUrl(basePath, industryPrefix);
};

/**
 * Generates a subdomain-aware contact URL
 * 
 * @param industryPrefix - The industry prefix to use on main domain (default: 'hotels')
 * @returns Subdomain-aware contact URL
 */
export const generateContactUrl = (industryPrefix: string = 'hotels'): string => {
  return generateSubdomainAwareUrl('contact', industryPrefix);
};

/**
 * Helper to determine if current context needs industry prefix
 * Useful for conditional URL generation logic
 * 
 * @returns boolean indicating if industry prefix is needed
 */
export const needsIndustryPrefix = (): boolean => {
  const subdomain = getCurrentSubdomain();
  return subdomain !== 'hospitality';
};