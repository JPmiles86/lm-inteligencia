import type { IndustryType } from '../types/Industry';

export interface VerticalSettings {
  showStaffSection: boolean;
  showBlog: boolean;
  showTestimonials: boolean;
  showCaseStudies: boolean;
  showOptionalAddOns: boolean;
}

export interface AllVerticalSettings {
  hospitality: VerticalSettings;
  healthcare: VerticalSettings;
  tech: VerticalSettings;
  athletics: VerticalSettings;
}

const defaultSettings: VerticalSettings = {
  showStaffSection: true,
  showBlog: true,
  showTestimonials: true,
  showCaseStudies: true,
  showOptionalAddOns: true,
};

const defaultAllSettings: AllVerticalSettings = {
  hospitality: { 
    ...defaultSettings,
    showStaffSection: false, // Hidden for hospitality
    showBlog: false, // Hidden for hospitality
  },
  healthcare: { 
    ...defaultSettings,
    showStaffSection: false, // Hidden for healthcare
    showBlog: false, // Hidden for healthcare
    showTestimonials: false, // Hidden for healthcare
    showCaseStudies: false,  // Hidden for healthcare
    showOptionalAddOns: false, // Hidden for healthcare
  },
  tech: { ...defaultSettings },
  athletics: { ...defaultSettings },
};

import { verticalVisibilityCache } from './verticalVisibilityCache';

/**
 * Get visibility settings for a specific vertical from API with fallback to localStorage
 */
export async function getVerticalVisibility(industry: IndustryType | null): Promise<VerticalSettings> {
  try {
    const settings = await getAllVerticalSettings();
    
    // Default to hospitality if no industry specified or if 'main'
    let vertical: keyof AllVerticalSettings = 'hospitality';
    if (industry && industry !== 'main' && industry in settings) {
      vertical = industry as keyof AllVerticalSettings;
    }
    
    // Return settings for the specific vertical
    return settings[vertical] || defaultSettings;
  } catch (error) {
    console.warn('Failed to fetch vertical visibility settings from API, using localStorage fallback:', error);
    return getVerticalVisibilitySync(industry);
  }
}

/**
 * Synchronous version that uses localStorage (for backward compatibility)
 */
export function getVerticalVisibilitySync(industry: IndustryType | null): VerticalSettings {
  // Load settings from localStorage as fallback
  const savedSettings = localStorage.getItem('vertical_visibility_settings');
  const settings: AllVerticalSettings = savedSettings 
    ? JSON.parse(savedSettings) 
    : defaultAllSettings;

  // Default to hospitality if no industry specified or if 'main'
  let vertical: keyof AllVerticalSettings = 'hospitality';
  if (industry && industry !== 'main' && industry in settings) {
    vertical = industry as keyof AllVerticalSettings;
  }
  
  // Return settings for the specific vertical
  return settings[vertical] || defaultSettings;
}

/**
 * Check if a specific section should be visible for the current vertical (async)
 */
export async function isSectionVisible(
  industry: IndustryType | null, 
  section: keyof VerticalSettings
): Promise<boolean> {
  const settings = await getVerticalVisibility(industry);
  return settings[section];
}

/**
 * Check if a specific section should be visible for the current vertical (sync)
 */
export function isSectionVisibleSync(
  industry: IndustryType | null, 
  section: keyof VerticalSettings
): boolean {
  const settings = getVerticalVisibilitySync(industry);
  return settings[section];
}

/**
 * Get all vertical settings from API with caching
 */
export async function getAllVerticalSettings(): Promise<AllVerticalSettings> {
  try {
    return await verticalVisibilityCache.get();
  } catch (error) {
    console.warn('Failed to fetch vertical visibility settings from API, using localStorage fallback:', error);
    
    // Fallback to localStorage
    const savedSettings = localStorage.getItem('vertical_visibility_settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultAllSettings;
  }
}

/**
 * Get all vertical settings synchronously with cache fallback
 * This tries to use cached API data first, then falls back to localStorage
 */
export function getAllVerticalSettingsSync(): AllVerticalSettings {
  // Try to get cached API data first
  const cachedData = verticalVisibilityCache.getCachedData();
  if (cachedData) {
    return cachedData;
  }

  // Fallback to localStorage
  const savedSettings = localStorage.getItem('vertical_visibility_settings');
  const localData = savedSettings ? JSON.parse(savedSettings) : defaultAllSettings;
  
  // Trigger background refresh if cache is empty/stale
  // This ensures next sync call has fresh data
  if (!verticalVisibilityCache.isCacheValid() && !verticalVisibilityCache.isLoading()) {
    verticalVisibilityCache.refresh().catch(() => {
      // Silently fail - we already have fallback data
    });
  }
  
  return localData;
}

/**
 * Save vertical settings to both API and localStorage
 */
export async function saveVerticalSettings(settings: AllVerticalSettings): Promise<void> {
  try {
    // Save each vertical's settings to the API
    const savePromises = Object.entries(settings).map(async ([vertical, verticalSettings]) => {
      const response = await fetch('/api/vertical-visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || 'inteligencia-admin-2025'}`
        },
        body: JSON.stringify({
          vertical,
          ...verticalSettings
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings for ${vertical}: ${response.status}`);
      }
    });

    await Promise.all(savePromises);
    
    // Clear cache to force refresh
    verticalVisibilityCache.clear();
    
  } catch (error) {
    console.error('Failed to save vertical visibility settings to API:', error);
    throw error;
  }
  
  // Also save to localStorage for backward compatibility
  localStorage.setItem('vertical_visibility_settings', JSON.stringify(settings));
  
  // Also update the legacy admin_settings for backward compatibility
  const adminSettings = {
    showStaffSection: settings.hospitality.showStaffSection,
    showBlog: settings.hospitality.showBlog,
  };
  localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
}

/**
 * Save vertical settings synchronously to localStorage only (for backward compatibility)
 */
export function saveVerticalSettingsSync(settings: AllVerticalSettings): void {
  localStorage.setItem('vertical_visibility_settings', JSON.stringify(settings));
  
  // Also update the legacy admin_settings for backward compatibility
  const adminSettings = {
    showStaffSection: settings.hospitality.showStaffSection,
    showBlog: settings.hospitality.showBlog,
  };
  localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
}

/**
 * Clear the settings cache (useful for testing or force refresh)
 */
export function clearSettingsCache(): void {
  verticalVisibilityCache.clear();
}

/**
 * Preload settings cache (useful for app initialization)
 */
export async function preloadVerticalSettings(): Promise<void> {
  try {
    await verticalVisibilityCache.refresh();
  } catch (error) {
    console.warn('Failed to preload vertical visibility settings:', error);
    // Continue without preloaded settings
  }
}