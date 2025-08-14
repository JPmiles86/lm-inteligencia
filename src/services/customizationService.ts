// Site Customization Service - Handles theme and branding customizations

export interface BrandingSettings {
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
}

export interface TypographySettings {
  primaryFont: string;
  secondaryFont: string;
  fontSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    body: string;
    small: string;
  };
  fontWeights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

export interface LayoutSettings {
  headerStyle: 'minimal' | 'classic' | 'modern';
  footerStyle: 'simple' | 'detailed' | 'minimal';
  contentWidth: 'narrow' | 'medium' | 'wide' | 'full';
  spacing: 'compact' | 'normal' | 'relaxed';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  shadows: 'none' | 'subtle' | 'medium' | 'strong';
}

export interface SiteCustomization {
  branding: BrandingSettings;
  typography: TypographySettings;
  contact: ContactSettings;
  layout: LayoutSettings;
  customCSS: string;
  lastUpdated: string;
  version: string;
}

const defaultBrandingSettings: BrandingSettings = {
  logoUrl: '/public/LM_inteligencia/inteligencia-Logo-transparent.PNG',
  faviconUrl: '/favicon.ico',
  companyName: 'Inteligencia',
  tagline: 'Expert Digital Marketing Solutions',
  colors: {
    primary: '#002643',
    secondary: '#0093a0',
    accent: '#ffffff',
    background: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280'
  }
};

const defaultTypographySettings: TypographySettings = {
  primaryFont: 'Inter, system-ui, sans-serif',
  secondaryFont: 'Inter, system-ui, sans-serif',
  fontSizes: {
    h1: '3.75rem',
    h2: '3rem',
    h3: '2.25rem',
    h4: '1.875rem',
    h5: '1.5rem',
    h6: '1.25rem',
    body: '1rem',
    small: '0.875rem'
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};

const defaultContactSettings: ContactSettings = {
  email: 'laurie@inteligenciadm.com',
  phone: '+506 6200 2747',
  address: {
    street: '123 Business Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'United States'
  },
  socialMedia: {
    facebook: 'https://facebook.com/inteligencia',
    twitter: 'https://twitter.com/inteligencia',
    linkedin: 'https://linkedin.com/company/inteligencia',
    instagram: 'https://instagram.com/inteligencia'
  },
  businessHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  }
};

const defaultLayoutSettings: LayoutSettings = {
  headerStyle: 'modern',
  footerStyle: 'detailed',
  contentWidth: 'medium',
  spacing: 'normal',
  borderRadius: 'medium',
  shadows: 'medium'
};

class CustomizationService {
  private storageKey = 'inteligencia_site_customization';

  // Get all customization settings
  getCustomization(): SiteCustomization {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return {
          branding: { ...defaultBrandingSettings, ...parsed.branding },
          typography: { ...defaultTypographySettings, ...parsed.typography },
          contact: { ...defaultContactSettings, ...parsed.contact },
          layout: { ...defaultLayoutSettings, ...parsed.layout },
          customCSS: parsed.customCSS || '',
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          version: parsed.version || '1.0.0'
        };
      }
    } catch (error) {
      console.error('Error loading customization settings:', error);
    }

    // Return defaults if nothing stored or error occurred
    return {
      branding: defaultBrandingSettings,
      typography: defaultTypographySettings,
      contact: defaultContactSettings,
      layout: defaultLayoutSettings,
      customCSS: '',
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // Save customization settings
  saveCustomization(customization: SiteCustomization): void {
    try {
      const updatedCustomization = {
        ...customization,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(updatedCustomization));
      
      // Apply changes to the live site
      this.applyCustomization(updatedCustomization);
    } catch (error) {
      console.error('Error saving customization settings:', error);
      throw new Error('Failed to save customization settings');
    }
  }

  // Update specific section
  updateBranding(branding: BrandingSettings): void {
    const current = this.getCustomization();
    this.saveCustomization({ ...current, branding });
  }

  updateTypography(typography: TypographySettings): void {
    const current = this.getCustomization();
    this.saveCustomization({ ...current, typography });
  }

  updateContact(contact: ContactSettings): void {
    const current = this.getCustomization();
    this.saveCustomization({ ...current, contact });
  }

  updateLayout(layout: LayoutSettings): void {
    const current = this.getCustomization();
    this.saveCustomization({ ...current, layout });
  }

  updateCustomCSS(customCSS: string): void {
    const current = this.getCustomization();
    this.saveCustomization({ ...current, customCSS });
  }

  // Apply customization to the live site
  applyCustomization(customization: SiteCustomization): void {
    this.applyCSSVariables(customization);
    this.applyFonts(customization.typography);
    this.applyCustomCSS(customization.customCSS);
    this.updateFavicon(customization.branding.faviconUrl);
  }

  // Apply CSS variables for colors and spacing
  private applyCSSVariables(customization: SiteCustomization): void {
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--primary-color', customization.branding.colors.primary);
    root.style.setProperty('--secondary-color', customization.branding.colors.secondary);
    root.style.setProperty('--accent-color', customization.branding.colors.accent);
    root.style.setProperty('--background-color', customization.branding.colors.background);
    root.style.setProperty('--text-color', customization.branding.colors.text);
    root.style.setProperty('--text-secondary-color', customization.branding.colors.textSecondary);
    
    // Typography
    root.style.setProperty('--font-primary', customization.typography.primaryFont);
    root.style.setProperty('--font-secondary', customization.typography.secondaryFont);
    
    // Font sizes
    Object.entries(customization.typography.fontSizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    // Font weights
    Object.entries(customization.typography.fontWeights).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });
    
    // Line heights
    Object.entries(customization.typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, value.toString());
    });
    
    // Layout
    const spacing = customization.layout.spacing === 'compact' ? '0.75' : 
                   customization.layout.spacing === 'relaxed' ? '1.5' : '1';
    root.style.setProperty('--spacing-multiplier', spacing);
    
    const borderRadius = customization.layout.borderRadius === 'none' ? '0' :
                        customization.layout.borderRadius === 'small' ? '0.25rem' :
                        customization.layout.borderRadius === 'large' ? '1rem' : '0.5rem';
    root.style.setProperty('--border-radius', borderRadius);
    
    const shadowIntensity = customization.layout.shadows === 'none' ? '0' :
                           customization.layout.shadows === 'subtle' ? '0.05' :
                           customization.layout.shadows === 'strong' ? '0.3' : '0.1';
    root.style.setProperty('--shadow-opacity', shadowIntensity);
  }

  // Load and apply custom fonts
  private applyFonts(typography: TypographySettings): void {
    const fontUrls = this.extractGoogleFontUrls(typography);
    
    // Remove existing font links
    const existingLinks = document.querySelectorAll('link[data-custom-font]');
    existingLinks.forEach(link => link.remove());
    
    // Add new font links
    fontUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-custom-font', 'true');
      document.head.appendChild(link);
    });
  }

  // Extract Google Fonts URLs from font names
  private extractGoogleFontUrls(typography: TypographySettings): string[] {
    const fonts = new Set([typography.primaryFont, typography.secondaryFont]);
    const googleFonts: string[] = [];
    
    fonts.forEach(font => {
      // Check if it's a Google Font (not a system font)
      if (!font.includes('system-ui') && !font.includes('serif') && !font.includes('sans-serif')) {
        const fontName = font.split(',')[0]?.trim().replace(/['"]/g, '') || '';
        if (fontName !== 'Inter') { // Inter is already loaded
          googleFonts.push(fontName);
        }
      }
    });
    
    if (googleFonts.length > 0) {
      const fontQuery = googleFonts.map(font => font.replace(' ', '+')).join('|');
      return [`https://fonts.googleapis.com/css2?family=${fontQuery}:wght@300;400;500;600;700&display=swap`];
    }
    
    return [];
  }

  // Apply custom CSS
  private applyCustomCSS(customCSS: string): void {
    // Remove existing custom CSS
    const existingStyle = document.querySelector('#custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new custom CSS
    if (customCSS.trim()) {
      const style = document.createElement('style');
      style.id = 'custom-css';
      style.textContent = customCSS;
      document.head.appendChild(style);
    }
  }

  // Update favicon
  private updateFavicon(faviconUrl: string): void {
    if (faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = faviconUrl;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }
  }

  // Export customization settings
  exportSettings(): string {
    const customization = this.getCustomization();
    return JSON.stringify(customization, null, 2);
  }

  // Import customization settings
  importSettings(settingsJson: string): void {
    try {
      const settings = JSON.parse(settingsJson);
      this.saveCustomization(settings);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  // Reset to defaults
  resetToDefaults(): void {
    localStorage.removeItem(this.storageKey);
    const defaultSettings = this.getCustomization();
    this.applyCustomization(defaultSettings);
  }

  // Get available font options
  getAvailableFonts(): { name: string; family: string }[] {
    return [
      { name: 'Inter (Default)', family: 'Inter, system-ui, sans-serif' },
      { name: 'System UI', family: 'system-ui, sans-serif' },
      { name: 'Roboto', family: 'Roboto, sans-serif' },
      { name: 'Open Sans', family: 'Open Sans, sans-serif' },
      { name: 'Lato', family: 'Lato, sans-serif' },
      { name: 'Montserrat', family: 'Montserrat, sans-serif' },
      { name: 'Poppins', family: 'Poppins, sans-serif' },
      { name: 'Source Sans Pro', family: 'Source Sans Pro, sans-serif' },
      { name: 'Nunito', family: 'Nunito, sans-serif' },
      { name: 'Playfair Display', family: 'Playfair Display, serif' },
      { name: 'Merriweather', family: 'Merriweather, serif' }
    ];
  }

  // Get color palette suggestions
  getColorPalettes(): { name: string; colors: BrandingSettings['colors'] }[] {
    return [
      {
        name: 'Default Blue',
        colors: defaultBrandingSettings.colors
      },
      {
        name: 'Professional Navy',
        colors: {
          primary: '#1e3a8a',
          secondary: '#3b82f6',
          accent: '#ffffff',
          background: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280'
        }
      },
      {
        name: 'Modern Green',
        colors: {
          primary: '#059669',
          secondary: '#10b981',
          accent: '#ffffff',
          background: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280'
        }
      },
      {
        name: 'Elegant Purple',
        colors: {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#ffffff',
          background: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280'
        }
      },
      {
        name: 'Warm Orange',
        colors: {
          primary: '#ea580c',
          secondary: '#fb923c',
          accent: '#ffffff',
          background: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280'
        }
      }
    ];
  }
}

export const customizationService = new CustomizationService();