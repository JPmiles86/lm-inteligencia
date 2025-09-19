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
      subtitle: 'At Inteligencia, we fuse AI and Data strategy with human insight to deliver digital marketing that drives results. We\'re not another churn-and-burn agency - we build lean, high-impact campaigns that turn ad dollars into measurable growth.\n\nWe bring the data, creative, and performance power to make it happen. Our founder, Laurie Meiring, brings 10 years of Digital Marketing leadership and hands-on experience - we know how to grow businesses from the inside out.\n\nSmart strategy. Bold execution. Real results. That\'s Inteligencia.'
    },
    valuesSection: {
      title: 'Our Values',
      subtitle: 'These core principles reflect how we think, how we work, and how we show up for our clients - every single time.'
    },
    teamSection: {
      title: 'Our Expert Team',
      subtitle: 'Industry specialists with proven track records of delivering exceptional results across hospitality, healthcare, tech, and sports/media businesses.'
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
      subtitle: 'Founder & Chief Strategist',
      tagline: 'MBA • Agile Marketing Leader • AI‑Driven Digital Innovator • Hospitality Veteran •  Pickleball Pro',
      description: '<a href="https://www.linkedin.com/in/laurie-meiring/" target="_blank" rel="noopener noreferrer" class="text-blue-900 hover:text-blue-700 underline">Laurie Meiring</a> brings over a decade of digital marketing leadership to Inteligencia, backed by an MBA and a career spanning hospitality, healthcare, technology, and sports/media. He has a proven ability to connect with audiences and generate demand through digital marketing tactics tailored to each client.',
      extendedStory: 'Laurie currently oversees online campaigns averaging over $750K+/month in Google Ad spend and $80K+/month in Meta campaigns for over 150 clients located internationally. His strategies consistently help clients drive awareness, generate leads and boost engagement.\n\nLaurie\'s roots in hospitality instilled an exceptional service mindset, and a relentless work ethic. With over five years Leading Digital Marketing for Marriott Hotels, he mastered his craft of driving direct bookings and increasing ancillary revenue. In healthcare, his work has empowered practitioners to attract, educate, and retain patients in highly competitive markets. His tech clients benefit from his early adoption of AI and automation tools to scale demand, while his work in sports and media leverages storytelling and community engagement to build loyal audiences.',
      approach: 'Laurie launched Inteligencia on a core belief: every industry has unique challenges, and marketing strategies must be designed to meet them. Whether growing occupancy, generating patient leads, scaling a tech product, or building a sports brand, Laurie\'s campaigns are built for performance and designed for people.',
      image: '/LM_inteligencia/InteligenciaBioShotFinal.jpg',
      certifications: ['Advanced Digital Marketing Certificate (2023)', 'Ship 30 for 30 Digital Writing Course (2023)', 'MBA – Digital Marketing, Cum Laude (2018)', 'Chef\'s Diploma (2012)', 'Bachelor\'s in Hotel and Restaurant Management (2003)'],
    },
    
    // Office and company images
    officeImage: '/LM_inteligencia/inteligencia-office.PNG',
    
    // Core company values - displayed as cards on About page
    values: [
      // First row - new values
      {
        title: 'Hospitality Work Ethic',
        description: 'Relentless reliability, responsiveness, and attention to detail. Our roots in hospitality mean we show up with integrity, hustle, and a client-first mindset - always.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      },
      {
        title: 'AI-Driven Innovation',
        description: 'We embrace AI as a force multiplier, not a shortcut. From advanced targeting to content generation, we harness cutting-edge tools that keep both us and our clients ahead of the curve.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z"/></svg>',
      },
      {
        title: 'Results Obsessed',
        description: 'We don\'t chase vanity metrics. We build and optimize campaigns around what actually matters: profitability, growth, and long-term value.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>',
      },
      {
        title: 'Creative Firepower',
        description: 'Creativity isn\'t just how things look - it\'s how strategies come to life. From storytelling to campaign structure, we combine artistic instinct with marketing science to produce standout work.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      },
      // Second row - existing values
      {
        title: 'Industry Expertise',
        description: 'Deep specialization in hospitality, healthcare, tech and sports/media marketing.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
      },
      {
        title: 'Data-Driven Results',
        description: 'Every campaign is measured, optimized, and designed to deliver measurable ROI.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
      },
      {
        title: 'Ethical Practices',
        description: 'HIPAA compliance, transparent reporting, and honest communication in all client relationships.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>',
      },
      {
        title: 'Long-term Partnership',
        description: 'We build lasting relationships focused on sustainable business growth and success.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
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
      'Hospitality & Lifestyle',
      'Health & Wellness',
      'Tech, AI & Digital Innovation',
      'Sport, Media & Events'
    ],
    contactTitle: 'Contact',
    copyright: '© 2025 Inteligencia. All rights reserved.'
  }
};