// Domain redirect utility for inteligenciadm.com
// Handles the temporary redirect from main domain to hospitality subdomain

import { getCurrentEnvironment } from '../config/subdomain-mapping';

export const handleDomainRedirect = (): void => {
  // Only run in production environment
  if (getCurrentEnvironment() === 'development') {
    console.log('Skipping redirect in development environment');
    return;
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const search = window.location.search;
  
  console.log('Current hostname:', hostname);
  
  // Check if we're on the main domain (inteligenciadm.com or www.inteligenciadm.com)
  const isMainDomain = hostname === 'inteligenciadm.com' || hostname === 'www.inteligenciadm.com';
  
  // Check if we're already on a subdomain
  const isSubdomain = hostname.includes('.inteligenciadm.com') && hostname !== 'www.inteligenciadm.com';
  
  // TEMPORARY: Redirect main domain to hospitality subdomain
  // Once all verticals are ready, remove this redirect to show all 4 verticals on main domain
  if (isMainDomain && !isSubdomain) {
    // Redirect to hospitality subdomain while preserving the path and query params
    const redirectUrl = `https://hospitality.inteligenciadm.com${pathname}${search}`;
    
    console.log(`Redirecting from ${hostname} to hospitality.inteligenciadm.com`);
    console.log('Redirect URL:', redirectUrl);
    
    // Perform the redirect with both methods for reliability
    window.location.href = redirectUrl;
    window.location.replace(redirectUrl);
  }
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
  
  // In production, return the hospitality subdomain for now
  return 'https://hospitality.inteligenciadm.com';
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