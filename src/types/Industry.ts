// Core industry types for the multi-industry platform

export type IndustryType = 'hospitality' | 'foodservice' | 'healthcare' | 'athletics' | 'main';

export interface IndustryConfig {
  industry: IndustryType;
  name: string;
  subdomain: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
  };
  content: {
    hero: HeroContent;
    services: ServiceContent[];
    team: TeamContent[];
    testimonials: TestimonialContent[];
    pricing: PricingContent;
    contact: ContactContent;
    about?: AboutContent;
    servicesPage?: ServicesPageContent;
    servicesPageContent?: ServicesPageContent;
    caseStudies?: CaseStudyContent[];
    caseStudiesPageContent?: {
      hero: {
        title: string;
        subtitle: string;
      };
      studies: Array<{
        id: string;
        client: string;
        industry: string;
        timeline: string;
        challenge: string;
        solution: string;
        results: {
          metric1: { label: string; value: string };
          metric2: { label: string; value: string };
          metric3: { label: string; value: string };
        };
        testimonial: {
          quote: string;
          author: string;
          position: string;
        };
        tags: string[];
      }>;
    };
    pricingPageContent?: {
      hero: {
        title: string;
        subtitle: string;
      };
      choosePlanSection: {
        title: string;
        subtitle: string;
      };
      customPricingSection: {
        title: string;
        subtitle: string;
        ctaText: string;
      };
      faqSection: {
        title: string;
        subtitle: string;
        faqs: Array<{
          question: string;
          answer: string;
        }>;
      };
      ctaSection: {
        title: string;
        subtitle: string;
        primaryButton: string;
        secondaryButton: string;
      };
      comparison?: {
        title: string;
        features: Array<{
          name: string;
          starter: boolean | string;
          growth: boolean | string;
          pro: boolean | string;
        }>;
      };
    };
    footer?: FooterContent;
    homepageSections?: HomepageSection[];
    // CTAs for navigation to detailed pages
    servicesViewAllCta?: string;
    testimonialsViewAllCta?: string;
    pricingViewDetailedCta?: string;
    aboutLearnMoreCta?: string;
    caseStudiesViewAllCta?: string;
    // Video CTA Section
    videoCTA?: {
      videoUrl: string;
      headline: string;
      subtitle: string;
      ctaText: string;
      ctaLink: string;
      trustIndicators: string[];
    };
  };
  features: {
    blog: boolean;
    aiWriter: boolean;
    imageGeneration: boolean;
    analytics: boolean;
  };
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Universal content that appears the same across all industries
export interface UniversalContent {
  about: {
    founderStory: {
      title: string;
      description: string;
      extendedStory: string;
      approach: string;
      image: string;
      certifications: string[];
    };
    officeImage: string;
    values: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    team: TeamContent[];
  };
  footer: FooterContent;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  backgroundType: 'image' | 'video';
  backgroundSrc: string;
  ctaText: string;
  ctaLink: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

export interface ServiceContent {
  title: string;
  description: string;
  features?: string[];
  icon: string;
  results?: string | undefined;
  pricing?: {
    startingPrice: string;
    priceType: string;
  };
  // New properties for brief homepage content
  keyBenefit?: string;
  learnMoreLink?: string;
}

export interface ServicesPageContent {
  hero?: {
    title: string;
    subtitle: string;
  };
  coreServices?: {
    title: string;
    description: string;
    services: DetailedServiceContent[];
  };
  industryServices?: {
    title: string;
    description: string;
  };
  services?: DetailedServiceContent[];
  marketingProcess?: Array<{
    step: string;
    title: string;
    description: string;
    icon: string;
  }>;
  coreCapabilities?: Array<{
    title: string;
    description: string;
    features: string[];
    icon: string;
  }>;
  industryBenefits?: string[];
}

export interface CaseStudyContent {
  id: string;
  title: string;
  industry: string;
  client: string;
  challenge: string;
  solution: string;
  results: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  testimonial: {
    quote: string;
    author: string;
    position: string;
    company: string;
  };
  image: string;
  tags: string[];
  timelineData?: Array<{
    date: string;
    event: string;
    metric?: string;
  }>;
}

export interface AboutContent {
  founderStory: {
    title: string;
    description: string;
    extendedStory: string;
    approach: string;
    image: string;
    certifications: string[];
  };
  officeImage: string;
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  team: TeamContent[];
}

export interface FooterContent {
  companyName: string;
  companyDescription: string;
  servicesTitle: string;
  industriesTitle: string;
  industriesList: string[];
  contactTitle: string;
  copyright: string;
}

export interface DetailedServiceContent {
  id: string;
  title: string;
  fullDescription: string;
  features: string[];
  process: string[];
  results: string;
  caseStudyLink: string;
  caseStudyText: string;
  icon: string;
  pricing: {
    starter: {
      name: string;
      price: string;
      duration: string;
      description: string;
      features: string[];
      suitable: string;
    };
    growth: {
      name: string;
      price: string;
      duration: string;
      description: string;
      features: string[];
      recommended?: boolean;
      suitable: string;
    };
    pro: {
      name: string;
      price: string;
      duration: string;
      description: string;
      features: string[];
      suitable: string;
    };
  };
}

export interface TeamContent {
  name: string;
  title: string;
  bio: string;
  image: string;
  certifications?: string[];
  specialties?: string[];
}

export interface TestimonialContent {
  quote: string;
  author: string;
  position: string;
  company: string;
  image?: string;
  rating?: number;
}

export interface PricingContent {
  plans: Array<{
    name: string;
    price: string;
    duration: string;
    description?: string;
    features: string[];
    recommended?: boolean;
    ctaText: string;
    ctaLink: string;
  }>;
  disclaimer?: string;
  addOns?: {
    title: string;
    services: Array<{
      name: string;
      price: string;
    }>;
  };
}

export interface HomepageSection {
  id: string;
  type: 'value-expansion' | 'social-proof' | 'process' | 'interactive';
  headline: string;
  description?: string;
  ctaText?: string;
  content?: {
    points?: Array<{
      title: string;
      description: string;
    }>;
    visual?: string;
  };
  stats?: string[];
  featuredTestimonial?: {
    quote: string;
    author: string;
    company: string;
  };
  steps?: Array<{
    title: string;
    description: string;
  }>;
}

export interface ContactContent {
  title: string;
  subtitle: string;
  calendlyText?: string;
  email: string;
  phone: string;
  address?: string;
  hours?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  // Extended contact page content
  businessTypes?: string[];
  budgetRanges?: string[];
  timelineOptions?: string[];
  formLabels?: {
    contactMethodsTitle: string;
    contactMethodsSubtitle: string;
    formTitle: string;
    formSubtitle: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    businessType: string;
    budget: string;
    timeline: string;
    goals: string;
    message: string;
    submitButton: string;
    privacyText: string;
    placeholders: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      company: string;
      businessType: string;
      budget: string;
      timeline: string;
      goals: string;
      message: string;
    };
  };
  officeHours?: {
    weekdays: string;
    saturday: string;
    sunday: string;
    emergency: string;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}


// Industry mapping for subdomain detection
export const IndustryMapping: Record<string, IndustryType> = {
  'hotels': 'hospitality',
  'restaurants': 'foodservice', 
  'healthcare': 'healthcare',
  'sports': 'athletics',
  'inteligencia': 'main'
};

// Industry display names
export const IndustryNames: Record<IndustryType, string> = {
  hospitality: 'Hotels & Hospitality',
  foodservice: 'Restaurants & Food Service',
  healthcare: 'Healthcare',
  athletics: 'Sports & Recreation',
  main: 'All Industries'
};

// Industry color schemes
export const IndustryColors: Record<IndustryType, { primary: string; secondary: string; accent: string }> = {
  hospitality: {
    primary: '#1e40af', // Blue
    secondary: '#f59e0b', // Gold
    accent: '#dc2626'
  },
  foodservice: {
    primary: '#dc2626', // Red
    secondary: '#f59e0b', // Orange
    accent: '#059669'
  },
  healthcare: {
    primary: '#059669', // Green
    secondary: '#0891b2', // Cyan
    accent: '#7c3aed'
  },
  athletics: {
    primary: '#7c3aed', // Purple
    secondary: '#dc2626', // Red
    accent: '#f59e0b'
  },
  main: {
    primary: '#374151', // Gray
    secondary: '#6b7280', // Light Gray
    accent: '#1e40af'
  }
};

// Helper function to safely get industry name
export function getIndustryName(industry: IndustryType): string {
  return IndustryNames[industry] || 'Industry';
}