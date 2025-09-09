import { useState, useEffect } from 'react';
import type { IndustryType } from '../types/Industry';
import { 
  VerticalSettings, 
  AllVerticalSettings,
  getAllVerticalSettings,
  getVerticalVisibilitySync,
  getAllVerticalSettingsSync
} from '../utils/verticalVisibility';

/**
 * Hook to get vertical visibility settings with API integration
 * Falls back to localStorage if API is not available
 */
export function useVerticalVisibility(industry: IndustryType | null) {
  const [settings, setSettings] = useState<VerticalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get settings from API
        const allSettings = await getAllVerticalSettings();
        
        if (!mounted) return;

        // Default to hospitality if no industry specified or if 'main'
        let vertical: keyof AllVerticalSettings = 'hospitality';
        if (industry && industry !== 'main' && industry in allSettings) {
          vertical = industry as keyof AllVerticalSettings;
        }

        setSettings(allSettings[vertical] || {
          showStaffSection: true,
          showBlog: true,
          showTestimonials: true,
          showCaseStudies: true,
          showOptionalAddOns: true,
        });
      } catch (err: any) {
        if (!mounted) return;
        
        console.warn('Failed to load vertical visibility settings from API, using sync fallback:', err);
        setError(err.message);
        
        // Fallback to sync version
        const syncSettings = getVerticalVisibilitySync(industry);
        setSettings(syncSettings);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [industry]);

  return { settings, loading, error };
}

/**
 * Hook to get all vertical visibility settings
 */
export function useAllVerticalVisibility() {
  const [settings, setSettings] = useState<AllVerticalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const allSettings = await getAllVerticalSettings();
      setSettings(allSettings);
    } catch (err: any) {
      console.warn('Failed to load all vertical visibility settings from API, using sync fallback:', err);
      setError(err.message);
      
      // Fallback to sync version
      const syncSettings = getAllVerticalSettingsSync();
      setSettings(syncSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { settings, loading, error, refresh };
}

/**
 * Hook to check if a specific section should be visible
 */
export function useSectionVisibility(industry: IndustryType | null, section: keyof VerticalSettings) {
  const { settings, loading, error } = useVerticalVisibility(industry);
  
  return {
    isVisible: settings ? settings[section] : true, // Default to visible during loading
    loading,
    error
  };
}