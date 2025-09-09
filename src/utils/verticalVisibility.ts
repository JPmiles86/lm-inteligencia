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
  hospitality: { ...defaultSettings },
  healthcare: { 
    ...defaultSettings,
    showTestimonials: false, // Hidden by default for healthcare
    showCaseStudies: false,  // Hidden by default for healthcare
    showOptionalAddOns: false, // Hidden by default for healthcare
  },
  tech: { ...defaultSettings },
  athletics: { ...defaultSettings },
};

/**
 * Get visibility settings for a specific vertical
 */
export function getVerticalVisibility(industry: IndustryType | null): VerticalSettings {
  // Load settings from localStorage
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
 * Check if a specific section should be visible for the current vertical
 */
export function isSectionVisible(
  industry: IndustryType | null, 
  section: keyof VerticalSettings
): boolean {
  const settings = getVerticalVisibility(industry);
  return settings[section];
}

/**
 * Get all vertical settings
 */
export function getAllVerticalSettings(): AllVerticalSettings {
  const savedSettings = localStorage.getItem('vertical_visibility_settings');
  return savedSettings ? JSON.parse(savedSettings) : defaultAllSettings;
}

/**
 * Save vertical settings
 */
export function saveVerticalSettings(settings: AllVerticalSettings): void {
  localStorage.setItem('vertical_visibility_settings', JSON.stringify(settings));
  
  // Also update the legacy admin_settings for backward compatibility
  const adminSettings = {
    showStaffSection: settings.hospitality.showStaffSection,
    showBlog: settings.hospitality.showBlog,
  };
  localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
}