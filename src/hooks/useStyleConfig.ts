// React hook for using the style configuration system
// This makes it easy for components to access and use styling configurations

import React, { useState, useEffect } from 'react';
import {
  StyleConfig,
  loadStyleConfig,
  saveStyleConfig,
  generateCSSVariables,
  getCurrentTheme,
} from '../config/style-config';

import {
  ContentVisibilityConfig,
  loadVisibilityConfig,
  saveVisibilityConfig,
  isSectionVisible,
} from '../config/content-visibility';

// Hook for managing style configuration
export const useStyleConfig = () => {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(loadStyleConfig());

  // Apply CSS variables when style config changes
  useEffect(() => {
    try {
      const cssVariables = generateCSSVariables(styleConfig);
      const styleElement = document.getElementById('dynamic-styles') || document.createElement('style');
      styleElement.id = 'dynamic-styles';
      styleElement.innerHTML = cssVariables;
      document.head.appendChild(styleElement);
    } catch (error) {
      console.warn('Failed to apply CSS variables:', error);
    }
  }, [styleConfig]);

  const updateTheme = (themeId: string) => {
    const newConfig = { ...styleConfig, selectedTheme: themeId };
    setStyleConfig(newConfig);
    saveStyleConfig(newConfig);
  };

  const updateCustomColors = (colors: Record<string, string>) => {
    const newConfig = {
      ...styleConfig,
      customColors: { ...styleConfig.customColors, ...colors },
    };
    setStyleConfig(newConfig);
    saveStyleConfig(newConfig);
  };

  const resetToDefault = () => {
    const defaultConfig = loadStyleConfig();
    setStyleConfig(defaultConfig);
    saveStyleConfig(defaultConfig);
  };

  const currentTheme = getCurrentTheme(styleConfig);

  return {
    styleConfig,
    currentTheme,
    updateTheme,
    updateCustomColors,
    resetToDefault,
  };
};

// Hook for managing visibility configuration
export const useVisibilityConfig = () => {
  const [visibilityConfig, setVisibilityConfig] = useState<ContentVisibilityConfig>(loadVisibilityConfig());

  const toggleSection = (sectionId: string) => {
    const newConfig = {
      ...visibilityConfig,
      sections: visibilityConfig.sections.map(section =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      ),
    };
    setVisibilityConfig(newConfig);
    saveVisibilityConfig(newConfig);
  };

  const isSectionVisibleById = (sectionId: string): boolean => {
    return isSectionVisible(visibilityConfig, sectionId);
  };

  const updateGlobalSetting = (setting: string, value: boolean) => {
    const newConfig = {
      ...visibilityConfig,
      globalSettings: {
        ...visibilityConfig.globalSettings,
        [setting]: value,
      },
    };
    setVisibilityConfig(newConfig);
    saveVisibilityConfig(newConfig);
  };

  return {
    visibilityConfig,
    toggleSection,
    isSectionVisible: isSectionVisibleById,
    updateGlobalSetting,
  };
};

// Combined hook for components that need both style and visibility
export const useAppConfig = () => {
  const styleHook = useStyleConfig();
  const visibilityHook = useVisibilityConfig();

  return {
    ...styleHook,
    ...visibilityHook,
  };
};

// Simple hook for checking if a section should be rendered
export const useIsVisible = (sectionId: string): boolean => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    try {
      const config = loadVisibilityConfig();
      const visible = isSectionVisible(config, sectionId);
      setIsVisible(visible);
    } catch (error) {
      console.warn(`Failed to check visibility for section ${sectionId}:`, error);
      // Default to visible on error
      setIsVisible(true);
    }
  }, [sectionId]);

  return isVisible;
};

// Wrapper component for conditional rendering based on visibility
export const ConditionalSection: React.FC<{
  sectionId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ sectionId, children, fallback = null }) => {
  const isVisible = useIsVisible(sectionId);
  
  return isVisible ? (children as React.ReactElement) : (fallback as React.ReactElement);
};

// Higher-order component for wrapping sections with visibility logic
export const withVisibility = <T extends object>(
  Component: React.ComponentType<T>,
  sectionId: string
) => {
  return (props: T) => {
    const isVisible = useIsVisible(sectionId);
    
    if (!isVisible) {
      return null;
    }
    
    return React.createElement(Component, props);
  };
};

// Hook for getting theme colors easily
export const useThemeColors = () => {
  const { currentTheme, styleConfig } = useStyleConfig();
  
  // Merge theme colors with custom overrides
  const colors = {
    ...currentTheme.colors,
    ...styleConfig.customColors,
  };

  return {
    colors,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    backgroundColor: colors.background,
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textMuted: colors.text.muted,
    textInverse: colors.text.inverse,
  };
};

// Hook for getting CSS variables as an object
export const useCSSVariables = () => {
  const { styleConfig } = useStyleConfig();
  
  const cssVars = generateCSSVariables(styleConfig);
  
  // Convert CSS variables to a JavaScript object
  const variablesObject = cssVars
    .split('\n')
    .filter(line => line.includes(':'))
    .reduce((acc, line) => {
      const [key, value] = line.split(':').map(str => str.trim());
      if (key && value && key.startsWith('--')) {
        const jsKey = key.replace('--', '').replace(/-([a-z])/g, (_: string, g: string) => g.toUpperCase());
        acc[jsKey] = value.replace(';', '');
      }
      return acc;
    }, {} as Record<string, string>);

  return variablesObject;
};