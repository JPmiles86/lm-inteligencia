// Universal content that appears the same across all industries
// This content should be identical no matter which industry site the user visits

import type { UniversalContent } from '../types/Industry';

export const universalContent: UniversalContent & {
  navigation: {
    mainMenu: {
      services: string;
      about: string;
      caseStudies: string;
      pricing: string;
      blog: string;
      contact: string;
    };
    industryMenu: {
      hotels: string;
      restaurants: string;
      healthcare: string;
      sports: string;
    };
    buttons: {
      getStarted: string;
      learnMore: string;
      viewAll: string;
      back: string;
    };
  };
  aboutPage: {
    hero: {
      title: string;
      subtitle: string;
    };
    valuesSection: {
      title: string;
      subtitle: string;
    };
    teamSection: {
      title: string;
      subtitle: string;
    };
    ctaSection: {
      title: string;
      subtitle: string;
      primaryButton: string;
      secondaryButton: string;
    };
  };
} = {
  navigation: {
    mainMenu: {
      services: 'Services',
      about: 'About',
      caseStudies: 'Case Studies',
      pricing: 'Pricing',
      blog: 'Blog',
      contact: 'Contact'
    },
    industryMenu: {
      hotels: 'Hotels & Hospitality',
      restaurants: 'Restaurants & Food Service',
      healthcare: 'Healthcare',
      sports: 'Sports & Recreation'
    },
    buttons: {
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      viewAll: 'View All',
      back: 'Back'
    }
  },
  aboutPage: {
    hero: {
      title: 'About Inteligencia',
      subtitle: 'Specialized marketing expertise across multiple industries, backed by proven strategies and industry-specific knowledge that drives real business results.'
    },
    valuesSection: {
      title: 'Our Values',
      subtitle: 'These core principles guide everything we do and shape how we serve our clients.'
    },
    teamSection: {
      title: 'Our Expert Team',
      subtitle: 'Industry specialists with proven track records of delivering exceptional results across hospitality, food service, healthcare, and athletics businesses.'
    },
    ctaSection: {
      title: 'Ready to Work Together?',
      subtitle: 'Let\'s discuss how our specialized expertise can help grow your business with industry-specific marketing solutions.',
      primaryButton: 'Get Started Today',
      secondaryButton: 'View Our Services'
    }
  },
  about: {
    // Laurie's personal story and company background - appears on About page hero
    founderStory: {
      title: 'Meet Laurie Meiring',
      description: 'With over 15 years of experience in digital marketing, Laurie Meiring founded Inteligencia with a simple belief: every industry has unique challenges that require specialized marketing solutions.',
      extendedStory: 'Unlike generic marketing agencies, Inteligencia focuses exclusively on four key industries - hospitality, food service, healthcare, and athletics - allowing us to develop deep expertise and deliver consistently superior results for our clients.',
      approach: 'Laurie\'s approach combines data-driven strategies with industry-specific insights, ensuring that every campaign not only reaches the right audience but speaks their language and addresses their specific needs.',
      image: '/images/team/Laurie Meiring/laurie ai face 1x1.jpg',
      certifications: ['Google Ads Certified', 'Meta Blueprint Certified', 'HIPAA Compliance Expert', 'Local SEO Specialist'],
    },
    
    // Office and company images
    officeImage: '/LM_inteligencia/inteligencia-office.PNG',
    
    // Core company values - displayed as cards on About page
    values: [
      {
        title: 'Industry Expertise',
        description: 'Deep specialization in hospitality, food service, healthcare, and athletics marketing.',
        icon: '🎯',
      },
      {
        title: 'Data-Driven Results',
        description: 'Every campaign is measured, optimized, and designed to deliver measurable ROI.',
        icon: '📊',
      },
      {
        title: 'Ethical Practices',
        description: 'HIPAA compliance, transparent reporting, and honest communication in all client relationships.',
        icon: '🛡️',
      },
      {
        title: 'Long-term Partnership',
        description: 'We build lasting relationships focused on sustainable business growth and success.',
        icon: '🤝',
      },
    ],
    
    // Full team members including Laurie + supporting team
    team: [
      {
        name: 'Laurie Meiring',
        title: 'Founder & CEO',
        bio: 'With over 15 years of experience in digital marketing, Laurie Meiring founded Inteligencia with a simple belief: every industry has unique challenges that require specialized marketing solutions.',
        image: '/images/team/Laurie Meiring/laurie ai face 1x1.jpg',
        certifications: ['Google Ads Certified', 'Meta Blueprint Certified', 'HIPAA Compliance Expert', 'Local SEO Specialist'],
      },
      {
        name: 'Sarah Johnson',
        title: 'Digital Strategy Director',
        bio: 'With over 12 years in digital marketing, Sarah specializes in data-driven growth strategies and conversion optimization across all industry verticals.',
        image: 'https://picsum.photos/400/400?random=2',
        certifications: ['Google Analytics 4 Certified', 'HubSpot Growth Marketing'],
      },
      {
        name: 'Marcus Chen',
        title: 'Creative Director',
        bio: 'Marcus brings artistic vision to marketing campaigns, creating compelling visual content that resonates with target audiences and drives engagement.',
        image: 'https://picsum.photos/400/400?random=3',
        certifications: ['Adobe Certified Expert', 'Brand Strategy Specialist'],
      },
      {
        name: 'Elena Rodriguez',
        title: 'Analytics & Growth Manager',
        bio: 'Elena transforms complex data into actionable insights, helping businesses understand their customers and optimize their marketing performance.',
        image: 'https://picsum.photos/400/400?random=4',
        certifications: ['Google Data Analytics', 'SQL for Marketing'],
      },
      {
        name: 'David Foster',
        title: 'Client Success Manager',
        bio: 'David ensures every client achieves their marketing goals through dedicated support, strategic guidance, and proactive campaign optimization.',
        image: 'https://picsum.photos/400/400?random=5',
        certifications: ['Customer Success Manager', 'Project Management Professional'],
      },
    ],
  },
  
  footer: {
    companyName: 'Inteligencia',
    companyDescription: 'Specialized marketing solutions across multiple industries.',
    servicesTitle: 'Services',
    industriesTitle: 'Industries',
    industriesList: [
      'Hotels & Hospitality',
      'Restaurants & Food Service', 
      'Healthcare',
      'Sports & Recreation'
    ],
    contactTitle: 'Contact',
    copyright: '© 2024 Inteligencia. All rights reserved.'
  }
};