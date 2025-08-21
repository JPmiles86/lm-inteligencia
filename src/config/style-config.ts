// Centralized styling configuration for easy client updates
// This file allows non-technical users to easily update colors, fonts, and themes

export interface StyleTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    gradient: {
      primary: string;
      secondary: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
}

// Pre-defined theme options for easy selection
export const availableThemes: StyleTheme[] = [
  {
    id: 'hospitality-default',
    name: 'Hospitality Purple (Default)',
    description: 'Professional purple theme perfect for hotels and hospitality',
    colors: {
      primary: '#371657',
      secondary: '#f04a9b',
      accent: '#176ab2',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1a202c',
        secondary: '#2d3748',
        muted: '#718096',
        inverse: '#ffffff',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #371657 0%, #f04a9b 100%)',
        secondary: 'linear-gradient(135deg, #176ab2 0%, #371657 100%)',
      },
      status: {
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565',
        info: '#4299e1',
      },
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Poppins, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Elegant gold and black theme for luxury hotels and resorts',
    colors: {
      primary: '#d4af37',
      secondary: '#1a1a1a',
      accent: '#b8860b',
      background: '#ffffff',
      surface: '#fafafa',
      text: {
        primary: '#1a1a1a',
        secondary: '#2c2c2c',
        muted: '#666666',
        inverse: '#ffffff',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
        secondary: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
      },
      status: {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
    fonts: {
      primary: 'Playfair Display, Georgia, serif',
      secondary: 'Source Sans Pro, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming blue theme perfect for beach resorts and coastal properties',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0c4a6e',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f0f9ff',
      text: {
        primary: '#0f172a',
        secondary: '#334155',
        muted: '#64748b',
        inverse: '#ffffff',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        secondary: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)',
      },
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
    fonts: {
      primary: 'Nunito Sans, system-ui, sans-serif',
      secondary: 'Open Sans, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural green theme for eco-lodges and nature-focused properties',
    colors: {
      primary: '#059669',
      secondary: '#064e3b',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: {
        primary: '#0f172a',
        secondary: '#374151',
        muted: '#6b7280',
        inverse: '#ffffff',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        secondary: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
      },
      status: {
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
    fonts: {
      primary: 'Lato, system-ui, sans-serif',
      secondary: 'Roboto, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    description: 'Warm orange and red theme for vibrant, energetic properties',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f97316',
      background: '#ffffff',
      surface: '#fef7ed',
      text: {
        primary: '#1f2937',
        secondary: '#374151',
        muted: '#6b7280',
        inverse: '#ffffff',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
        secondary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      },
      status: {
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
    fonts: {
      primary: 'Montserrat, system-ui, sans-serif',
      secondary: 'Source Sans Pro, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
  },
];

// Export alias for consistency
export const STYLE_THEMES = availableThemes;

// Custom color overrides interface
export interface CustomColorOverrides {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
}

// Style configuration interface
export interface StyleConfig {
  selectedTheme: string;
  customColors?: CustomColorOverrides;
  customFonts?: {
    primary?: string;
    secondary?: string;
  };
  // Section-specific style overrides
  sectionStyles?: {
    hero?: {
      backgroundColor?: string;
      textColor?: string;
      overlayOpacity?: number;
    };
    services?: {
      backgroundColor?: string;
      cardBackgroundColor?: string;
      textColor?: string;
    };
    testimonials?: {
      backgroundColor?: string;
      textColor?: string;
    };
    contact?: {
      backgroundColor?: string;
      textColor?: string;
    };
    footer?: {
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

// Default style configuration
export const defaultStyleConfig: StyleConfig = {
  selectedTheme: 'hospitality-default',
  sectionStyles: {
    hero: {
      overlayOpacity: 0.4,
    },
    services: {
      backgroundColor: '#f8fafc',
      cardBackgroundColor: '#ffffff',
    },
    testimonials: {
      backgroundColor: '#ffffff',
    },
    contact: {
      backgroundColor: '#371657',
      textColor: '#ffffff',
    },
    footer: {
      backgroundColor: '#1a202c',
      textColor: '#ffffff',
    },
  },
};

// Helper functions for theme management
export const getThemeById = (themeId: string): StyleTheme | undefined => {
  return availableThemes.find(theme => theme.id === themeId);
};

export const getCurrentTheme = (config: StyleConfig): StyleTheme => {
  const theme = getThemeById(config.selectedTheme);
  return theme || availableThemes[0]!; // Fallback to first theme (always exists)
};

export const applyCustomColors = (theme: StyleTheme, customColors?: CustomColorOverrides): StyleTheme => {
  if (!customColors) return theme;
  
  return {
    ...theme,
    colors: {
      ...theme.colors,
      ...customColors,
    },
  };
};

// Generate CSS custom properties from theme
export const generateCSSVariables = (config: StyleConfig): string => {
  const theme = getCurrentTheme(config);
  const customizedTheme = applyCustomColors(theme, config.customColors);
  
  return `
    :root {
      /* Primary colors */
      --color-primary: ${customizedTheme.colors.primary};
      --color-secondary: ${customizedTheme.colors.secondary};
      --color-accent: ${customizedTheme.colors.accent};
      --color-background: ${customizedTheme.colors.background};
      --color-surface: ${customizedTheme.colors.surface};
      
      /* Text colors */
      --color-text-primary: ${customizedTheme.colors.text.primary};
      --color-text-secondary: ${customizedTheme.colors.text.secondary};
      --color-text-muted: ${customizedTheme.colors.text.muted};
      --color-text-inverse: ${customizedTheme.colors.text.inverse};
      
      /* Gradients */
      --gradient-primary: ${customizedTheme.colors.gradient.primary};
      --gradient-secondary: ${customizedTheme.colors.gradient.secondary};
      
      /* Status colors */
      --color-success: ${customizedTheme.colors.status.success};
      --color-warning: ${customizedTheme.colors.status.warning};
      --color-error: ${customizedTheme.colors.status.error};
      --color-info: ${customizedTheme.colors.status.info};
      
      /* Fonts */
      --font-primary: ${config.customFonts?.primary || customizedTheme.fonts.primary};
      --font-secondary: ${config.customFonts?.secondary || customizedTheme.fonts.secondary};
      --font-mono: ${customizedTheme.fonts.mono};
    }
  `;
};

// Load style configuration from localStorage
export const loadStyleConfig = (): StyleConfig => {
  try {
    const savedConfig = localStorage.getItem('site_style_config');
    if (savedConfig) {
      return { ...defaultStyleConfig, ...JSON.parse(savedConfig) };
    }
  } catch (error) {
    console.warn('Failed to load style config from localStorage:', error);
  }
  return defaultStyleConfig;
};

// Save style configuration to localStorage
export const saveStyleConfig = (config: StyleConfig): void => {
  try {
    localStorage.setItem('site_style_config', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save style config to localStorage:', error);
  }
};

// Color palette helpers for client reference
export const getColorPalette = () => ({
  professional: [
    '#371657', '#f04a9b', '#176ab2', '#2d3748', '#4a5568'
  ],
  luxury: [
    '#d4af37', '#1a1a1a', '#b8860b', '#2c2c2c', '#666666'
  ],
  ocean: [
    '#0ea5e9', '#0c4a6e', '#06b6d4', '#334155', '#64748b'
  ],
  nature: [
    '#059669', '#064e3b', '#10b981', '#374151', '#6b7280'
  ],
  warm: [
    '#ea580c', '#dc2626', '#f97316', '#374151', '#6b7280'
  ],
  neutral: [
    '#6b7280', '#374151', '#1f2937', '#f9fafb', '#e5e7eb'
  ]
});