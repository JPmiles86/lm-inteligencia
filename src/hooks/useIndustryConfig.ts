// Custom hook for managing industry configuration and theming

import { useState, useEffect } from 'react';
import type { IndustryConfig, IndustryType } from '../types/Industry';
import { applyIndustryTheme } from '../utils/subdomainDetection';
import { defaultIndustryConfigs } from '../config/industry-configs';

interface UseIndustryConfigReturn {
  config: IndustryConfig | null;
  industry: IndustryType;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing industry configuration
 * Handles subdomain detection, configuration loading, and theme application
 */
export const useIndustryConfig = (forcedIndustry?: IndustryType | null): UseIndustryConfigReturn => {
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [industry, setIndustry] = useState<IndustryType>('main');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async (): Promise<void> => {
      // If no industry is forced and none provided, skip loading
      if (!forcedIndustry) {
        setLoading(false);
        setConfig(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // Use forced industry
        const detectedIndustry = forcedIndustry;
        setIndustry(detectedIndustry);

        // Apply industry theme
        applyIndustryTheme(detectedIndustry);

        // Load configuration (for now using defaults, later will fetch from API)
        const industryConfig = defaultIndustryConfigs[detectedIndustry];
        
        if (!industryConfig) {
          throw new Error(`Configuration not found for industry: ${detectedIndustry}`);
        }

        setConfig(industryConfig);
        
        // Update document title and meta tags
        updatePageMetadata(industryConfig);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load industry configuration';
        setError(errorMessage);
        console.error('Industry configuration error:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadConfig();
  }, [forcedIndustry]);

  const refetch = async (): Promise<void> => {
    // Trigger re-render by changing a dummy state
    setLoading(true);
  };

  // Removed popstate listener as it's handled in the main component

  return {
    config,
    industry,
    loading,
    error,
    refetch,
  };
};

/**
 * Updates document metadata based on industry configuration
 */
const updatePageMetadata = (config: IndustryConfig): void => {
  if (typeof document === 'undefined') return;

  // Update document title
  document.title = config.metadata.title;

  // Update meta description
  updateMetaTag('description', config.metadata.description);

  // Update meta keywords
  updateMetaTag('keywords', config.metadata.keywords.join(', '));

  // Update Open Graph tags
  updateMetaTag('og:title', config.metadata.title, 'property');
  updateMetaTag('og:description', config.metadata.description, 'property');
  updateMetaTag('og:type', 'website', 'property');

  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', config.metadata.title);
  updateMetaTag('twitter:description', config.metadata.description);
};

/**
 * Helper function to update or create meta tags
 */
const updateMetaTag = (
  name: string, 
  content: string, 
  attribute: 'name' | 'property' = 'name'
): void => {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};