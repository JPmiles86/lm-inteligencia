// Domain redirect utility for inteligenciadm.com
// Handles the temporary redirect from main domain to hospitality subdomain

import { getCurrentEnvironment } from '../config/subdomain-mapping';

export const handleDomainRedirect = (): void => {
  // DISABLED: No longer redirecting to hospitality
  // Main domain now shows the landing page with vertical selection
  console.log('Domain redirect disabled - showing main landing page');
  return;
};

// Function to check if redirect should be enabled (can be toggled off later)
export const isRedirectEnabled = (): boolean => {
  // For now, always enabled in production
  // Later this can be controlled by an environment variable or config flag
  return getCurrentEnvironment() === 'production';
};

// Get the correct base URL for the current environment
export const getBaseUrl = (): string => {
  const env = getCurrentEnvironment();
  
  if (env === 'development') {
    return 'http://localhost:3001';
  }
  
  // In production, return the main domain
  return 'https://inteligenciadm.com';
};

// Get the current subdomain from hostname
export const getCurrentSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  console.log('[getCurrentSubdomain] Analyzing hostname:', hostname);
  
  // Handle localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    console.log('[getCurrentSubdomain] Localhost detected, returning null');
    return null;
  }
  
  // Extract subdomain from inteligenciadm.com
  const parts = hostname.split('.');
  console.log('[getCurrentSubdomain] Hostname parts:', parts);
  
  if (parts.length >= 3 && parts[parts.length - 2] === 'inteligenciadm') {
    const subdomain = parts[0] || null;
    console.log('[getCurrentSubdomain] Subdomain extracted:', subdomain);
    return subdomain;
  }
  
  // Handle www and root domain
  if (hostname === 'inteligenciadm.com' || hostname === 'www.inteligenciadm.com') {
    console.log('[getCurrentSubdomain] Main domain detected, returning "main"');
    return 'main';
  }
  
  console.log('[getCurrentSubdomain] No matching pattern, returning null');
  return null;
};