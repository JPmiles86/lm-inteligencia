// Subdomain detection and industry routing logic

import type { IndustryType } from '../types/Industry.js';
import { IndustryMapping } from '../types/Industry.js';

/**
 * Detects the current industry based on URL path, subdomain, or URL parameters
 * Handles both development (localhost) and production environments
 * Priority: 1) URL path, 2) Query parameters (backward compatibility), 3) Subdomain
 */
export const detectIndustry = (): IndustryType => {
  if (typeof window === 'undefined') return 'main';
  
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const search = window.location.search;
  
  // 1. Check URL path first (new path-based routing)
  // Extract first path segment: /hotels/services -> hotels
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0];
    if (firstSegment && firstSegment in IndustryMapping) {
      const mappedIndustry = IndustryMapping[firstSegment];
      if (mappedIndustry) {
        return mappedIndustry;
      }
    }
  }
  
  // 2. Handle localhost development with query parameters (backward compatibility)
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const params = new URLSearchParams(search);
    const industryParam = params.get('industry');
    
    if (industryParam && industryParam in IndustryMapping) {
      const mappedIndustry = IndustryMapping[industryParam];
      if (mappedIndustry) {
        return mappedIndustry;
      }
    }
    
    // Default to main for localhost without parameters
    return 'main';
  }
  
  // 3. Production subdomain detection (fallback)
  const parts = hostname.split('.');
  
  // Handle direct domain access (inteligencia.com)
  if (parts.length <= 2) {
    return 'main';
  }
  
  // Extract subdomain (hotels.inteligencia.com -> hotels)
  const subdomain = parts[0];
  
  // Map subdomain to industry type
  if (subdomain && subdomain in IndustryMapping) {
    const mappedIndustry = IndustryMapping[subdomain];
    return mappedIndustry ?? 'main';
  }
  
  return 'main';
};

/**
 * Generates the appropriate URL for an industry
 * Handles both development and production environments
 * Now generates path-based URLs for development and optionally for production
 */
export const getIndustryUrl = (industry: IndustryType): string => {
  if (typeof window === 'undefined') return '/';
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Handle localhost development with path-based routing
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
    
    if (industry === 'main') {
      return baseUrl;
    }
    
    // Find the subdomain key for the industry and use as path
    const industryKey = Object.keys(IndustryMapping).find(
      key => IndustryMapping[key] === industry
    );
    
    return `${baseUrl}/${industryKey ?? 'inteligencia'}`;
  }
  
  // Production: Check if subdomain routing is enabled, otherwise use path-based
  const useSubdomainRouting = import.meta.env.VITE_USE_SUBDOMAIN_ROUTING === 'true';
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'inteligencia.com';
  
  if (industry === 'main') {
    return `${protocol}//${baseDomain}`;
  }
  
  // Find the subdomain key for the industry
  const industryKey = Object.keys(IndustryMapping).find(
    key => IndustryMapping[key] === industry
  );
  
  if (useSubdomainRouting) {
    // Subdomain routing: hotels.inteligencia.com
    return `${protocol}//${industryKey ?? 'inteligencia'}.${baseDomain}`;
  } else {
    // Path-based routing: inteligencia.com/hotels
    return `${protocol}//${baseDomain}/${industryKey ?? 'inteligencia'}`;
  }
};

/**
 * Gets the current industry path for navigation purposes
 * Returns empty string for main industry, otherwise returns the industry path
 */
export const getIndustryPath = (): string => {
  const industry = detectIndustry();
  
  if (industry === 'main') {
    return '';
  }
  
  // Find the industry key for the current industry
  const industryKey = Object.keys(IndustryMapping).find(
    key => IndustryMapping[key] === industry
  );
  
  return `/${industryKey}`;
};

/**
 * Checks if the current environment is development
 */
export const isDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname.includes('localhost') || hostname.includes('127.0.0.1');
};

/**
 * Gets the display name for the current subdomain
 */
export const getCurrentSubdomainDisplay = (): string => {
  const industry = detectIndustry();
  
  const industryNames: Record<IndustryType, string> = {
    hospitality: 'Hospitality & Lifestyle',
    healthcare: 'Health & Wellness',
    tech: 'Tech, AI & Digital Innovation',
    athletics: 'Sport, Media & Events',
    main: 'All Industries'
  };
  
  return industryNames[industry];
};

/**
 * Applies industry-specific CSS class to document body
 */
export const applyIndustryTheme = (industry: IndustryType): void => {
  if (typeof document === 'undefined') return;
  
  // Remove any existing industry classes
  const body = document.body;
  const existingClasses = Array.from(body.classList).filter(cls => 
    cls.startsWith('industry-')
  );
  body.classList.remove(...existingClasses);
  
  // Add new industry class
  if (industry !== 'main') {
    body.classList.add(`industry-${industry}`);
  }
  
  // Update CSS custom properties for dynamic theming
  const industryColors = {
    hospitality: { primary: '#002643', secondary: '#0093a0', accent: '#FFD700' },
    healthcare: { primary: '#002643', secondary: '#0093a0', accent: '#FFD700' },
    tech: { primary: '#002643', secondary: '#ec4899', accent: '#FFD700' },
    athletics: { primary: '#002643', secondary: '#0093a0', accent: '#FFD700' },
    main: { primary: '#002643', secondary: '#0093a0', accent: '#FFD700' }
  };
  
  const colors = industryColors[industry];
  const root = document.documentElement;
  
  root.style.setProperty('--primary-color', colors.primary);
  root.style.setProperty('--secondary-color', colors.secondary);
  root.style.setProperty('--accent-color', colors.accent);
};