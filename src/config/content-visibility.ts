// Content visibility configuration for easy section show/hide management
// This allows non-technical users to easily control which sections appear on the website

export interface SectionVisibility {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  pages: string[]; // Which pages this section appears on
  category: 'navigation' | 'content' | 'footer' | 'admin';
}

export interface ContentVisibilityConfig {
  sections: SectionVisibility[];
  globalSettings: {
    showBlog: boolean;
    showTeamSection: boolean;
    showTestimonials: boolean;
    showCaseStudies: boolean;
    showPricing: boolean;
    showContactForm: boolean;
  };
}

// Default visibility configuration
export const defaultVisibilityConfig: ContentVisibilityConfig = {
  sections: [
    // Navigation sections
    {
      id: 'main-navigation',
      name: 'Main Navigation Menu',
      description: 'Primary navigation menu in the header',
      visible: true,
      pages: ['all'],
      category: 'navigation',
    },
    {
      id: 'mobile-menu',
      name: 'Mobile Menu',
      description: 'Hamburger menu for mobile devices',
      visible: true,
      pages: ['all'],
      category: 'navigation',
    },
    {
      id: 'industry-selector',
      name: 'Industry Selector',
      description: 'Dropdown to switch between different industry verticals',
      visible: true,
      pages: ['home', 'about'],
      category: 'navigation',
    },
    
    // Homepage content sections
    {
      id: 'hero-section',
      name: 'Hero Section',
      description: 'Main hero banner with video background and CTA',
      visible: true,
      pages: ['home'],
      category: 'content',
    },
    {
      id: 'stats-section',
      name: 'Statistics/Results Section',
      description: 'Key metrics and results display',
      visible: true,
      pages: ['home'],
      category: 'content',
    },
    {
      id: 'services-preview',
      name: 'Services Preview',
      description: 'Brief overview of services on homepage',
      visible: true,
      pages: ['home'],
      category: 'content',
    },
    {
      id: 'how-it-works',
      name: 'How It Works Process',
      description: 'Step-by-step process explanation',
      visible: true,
      pages: ['home', 'services'],
      category: 'content',
    },
    {
      id: 'testimonials-section',
      name: 'Client Testimonials',
      description: 'Customer reviews and testimonials',
      visible: true,
      pages: ['home', 'about', 'services'],
      category: 'content',
    },
    {
      id: 'video-cta',
      name: 'Video Call-to-Action',
      description: 'Video section with consultation CTA',
      visible: true,
      pages: ['home'],
      category: 'content',
    },
    
    // About page sections
    {
      id: 'about-hero',
      name: 'About Page Hero',
      description: 'About page introduction and mission',
      visible: true,
      pages: ['about'],
      category: 'content',
    },
    {
      id: 'team-section',
      name: 'Team Section',
      description: 'Team member profiles and bios',
      visible: true,
      pages: ['about'],
      category: 'content',
    },
    {
      id: 'company-values',
      name: 'Company Values',
      description: 'Mission, vision, and values section',
      visible: true,
      pages: ['about'],
      category: 'content',
    },
    {
      id: 'certifications',
      name: 'Certifications & Awards',
      description: 'Professional certifications and recognition',
      visible: true,
      pages: ['about'],
      category: 'content',
    },
    
    // Services page sections
    {
      id: 'services-hero',
      name: 'Services Page Hero',
      description: 'Services page introduction',
      visible: true,
      pages: ['services'],
      category: 'content',
    },
    {
      id: 'detailed-services',
      name: 'Detailed Services List',
      description: 'Comprehensive service descriptions with pricing',
      visible: true,
      pages: ['services'],
      category: 'content',
    },
    {
      id: 'pricing-section',
      name: 'Pricing Tables',
      description: 'Service packages and pricing information',
      visible: true,
      pages: ['services', 'home'],
      category: 'content',
    },
    {
      id: 'add-ons',
      name: 'Add-on Services',
      description: 'Optional additional services',
      visible: true,
      pages: ['services'],
      category: 'content',
    },
    
    // Blog sections
    {
      id: 'blog-listing',
      name: 'Blog Posts List',
      description: 'List of blog articles and posts',
      visible: false, // Disabled by default as requested
      pages: ['blog'],
      category: 'content',
    },
    {
      id: 'blog-navigation',
      name: 'Blog Navigation',
      description: 'Blog menu item in navigation',
      visible: false, // Disabled by default as requested
      pages: ['all'],
      category: 'navigation',
    },
    {
      id: 'recent-posts',
      name: 'Recent Blog Posts Widget',
      description: 'Shows recent blog posts on other pages',
      visible: false,
      pages: ['home', 'about'],
      category: 'content',
    },
    
    // Case studies
    {
      id: 'case-studies-section',
      name: 'Case Studies',
      description: 'Client success stories and detailed case studies',
      visible: true,
      pages: ['home', 'about', 'case-studies'],
      category: 'content',
    },
    {
      id: 'case-study-cta',
      name: 'Case Study Call-to-Action',
      description: 'Links to case studies from other sections',
      visible: true,
      pages: ['services'],
      category: 'content',
    },
    
    // Contact sections
    {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Main contact form for inquiries',
      visible: true,
      pages: ['contact', 'home'],
      category: 'content',
    },
    {
      id: 'contact-info',
      name: 'Contact Information',
      description: 'Phone, email, and address details',
      visible: true,
      pages: ['contact', 'footer'],
      category: 'content',
    },
    {
      id: 'calendly-widget',
      name: 'Calendly Booking Widget',
      description: 'Embedded calendar for appointment booking',
      visible: true,
      pages: ['contact'],
      category: 'content',
    },
    {
      id: 'office-hours',
      name: 'Office Hours',
      description: 'Business hours and availability',
      visible: true,
      pages: ['contact'],
      category: 'content',
    },
    {
      id: 'faq-section',
      name: 'Frequently Asked Questions',
      description: 'Common questions and answers',
      visible: true,
      pages: ['contact', 'services'],
      category: 'content',
    },
    
    // Footer sections
    {
      id: 'footer-main',
      name: 'Main Footer',
      description: 'Primary footer with links and info',
      visible: true,
      pages: ['all'],
      category: 'footer',
    },
    {
      id: 'footer-social',
      name: 'Social Media Links',
      description: 'Social media icons and links in footer',
      visible: true,
      pages: ['all'],
      category: 'footer',
    },
    {
      id: 'footer-newsletter',
      name: 'Newsletter Signup',
      description: 'Email subscription form in footer',
      visible: false, // Disabled by default
      pages: ['all'],
      category: 'footer',
    },
    {
      id: 'copyright',
      name: 'Copyright Notice',
      description: 'Copyright and legal information',
      visible: true,
      pages: ['all'],
      category: 'footer',
    },
    
    // Admin sections
    {
      id: 'admin-panel',
      name: 'Admin Panel Access',
      description: 'Administrative control panel',
      visible: true,
      pages: ['admin'],
      category: 'admin',
    },
    {
      id: 'style-controls',
      name: 'Style Management',
      description: 'Color and theme management tools',
      visible: true,
      pages: ['admin'],
      category: 'admin',
    }
  ],
  
  globalSettings: {
    showBlog: false, // Blog disabled by default per requirements
    showTeamSection: true,
    showTestimonials: true,
    showCaseStudies: true,
    showPricing: true,
    showContactForm: true,
  },
};

// Helper functions for visibility management
export const getSectionById = (config: ContentVisibilityConfig, sectionId: string): SectionVisibility | undefined => {
  return config.sections.find(section => section.id === sectionId);
};

export const isSectionVisible = (config: ContentVisibilityConfig, sectionId: string): boolean => {
  const section = getSectionById(config, sectionId);
  return section?.visible ?? false;
};

export const getSectionsByCategory = (config: ContentVisibilityConfig, category: string): SectionVisibility[] => {
  return config.sections.filter(section => section.category === category);
};

export const getSectionsByPage = (config: ContentVisibilityConfig, pageName: string): SectionVisibility[] => {
  return config.sections.filter(section => 
    section.visible && (section.pages.includes(pageName) || section.pages.includes('all'))
  );
};

export const toggleSectionVisibility = (config: ContentVisibilityConfig, sectionId: string): ContentVisibilityConfig => {
  return {
    ...config,
    sections: config.sections.map(section =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section
    ),
  };
};

export const updateGlobalSetting = (
  config: ContentVisibilityConfig, 
  setting: keyof ContentVisibilityConfig['globalSettings'], 
  value: boolean
): ContentVisibilityConfig => {
  return {
    ...config,
    globalSettings: {
      ...config.globalSettings,
      [setting]: value,
    },
  };
};

// Load visibility configuration from localStorage
export const loadVisibilityConfig = (): ContentVisibilityConfig => {
  try {
    const savedConfig = localStorage.getItem('site_visibility_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Merge with default config to ensure new sections are included
      return {
        ...defaultVisibilityConfig,
        ...parsed,
        sections: [
          ...defaultVisibilityConfig.sections.map(defaultSection => ({
            ...defaultSection,
            visible: parsed.sections?.find((s: SectionVisibility) => s.id === defaultSection.id)?.visible ?? defaultSection.visible
          }))
        ]
      };
    }
  } catch (error) {
    console.warn('Failed to load visibility config from localStorage:', error);
  }
  return defaultVisibilityConfig;
};

// Save visibility configuration to localStorage
export const saveVisibilityConfig = (config: ContentVisibilityConfig): void => {
  try {
    localStorage.setItem('site_visibility_config', JSON.stringify(config));
    
    // Also update the existing admin settings for backwards compatibility
    const adminSettings = {
      showStaffSection: config.globalSettings.showTeamSection,
      showBlog: config.globalSettings.showBlog,
    };
    localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
  } catch (error) {
    console.error('Failed to save visibility config to localStorage:', error);
  }
};

// Quick reference for commonly used sections
export const COMMON_SECTIONS = {
  HERO: 'hero-section',
  SERVICES: 'services-preview',
  TESTIMONIALS: 'testimonials-section',
  TEAM: 'team-section',
  BLOG: 'blog-listing',
  BLOG_NAV: 'blog-navigation',
  CONTACT_FORM: 'contact-form',
  PRICING: 'pricing-section',
  CASE_STUDIES: 'case-studies-section',
} as const;