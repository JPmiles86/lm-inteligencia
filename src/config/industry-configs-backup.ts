// Industry-specific configurations

import type { IndustryConfig, IndustryType } from '../types/Industry';

// Base configuration that all industries inherit from
const baseConfig = {
  features: {
    blog: false,
    aiWriter: true,
    imageGeneration: true,
    analytics: true,
  },
};

// Default configurations for each industry
export const defaultIndustryConfigs: Record<IndustryType, IndustryConfig> = {
  hospitality: {
    ...baseConfig,
    industry: 'hospitality',
    name: 'Hotels & Hospitality Marketing',
    subdomain: 'hotels',
    branding: {
      primaryColor: '#002643',
      secondaryColor: '#0093a0',
      accentColor: '#FFD700',
    },
    content: {
      hero: {
        title: 'Transform Your Hotel\'s Digital Presence',
        subtitle: 'Drive direct bookings and reduce OTA dependency with proven advertising strategies',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        ctaText: 'Get Free Hotel Marketing Audit',
        ctaLink: '/contact',
        stats: [
          { value: '40%', label: 'Increase in Direct Bookings' },
          { value: '25%', label: 'Reduction in OTA Commissions' },
          { value: '60%', label: 'Better ROI vs Traditional Marketing' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      services: [
        {
          title: 'Google Hotel Ads',
          description: 'Capture guests at the exact moment they\'re ready to book with AI-optimized campaigns.',
          keyBenefit: 'Reduce OTA dependency by 35%',
          icon: 'hotel',
          learnMoreLink: '/services#google-hotel-ads',
        },
        {
          title: 'Meta Advertising for Hotels',
          description: 'Build awareness and drive bookings with visual storytelling that showcases your property.',
          keyBenefit: '50% lower cost per booking vs OTAs',
          icon: 'camera',
          learnMoreLink: '/services#meta-advertising',
        },
        {
          title: 'Email Marketing & CRM',
          description: 'Turn one-time guests into loyal repeat customers with automated guest journey campaigns.',
          keyBenefit: '25% increase in repeat bookings',
          icon: 'mail',
          learnMoreLink: '/services#email-marketing',
        },
      ],
      // NOTE: About page content moved to universal-content.ts for consistency across all industries
      team: [
        {
          name: 'Laurie Meiring',
          title: 'Founder & Hotel Marketing Strategist',
          bio: 'With 15+ years of experience in hospitality marketing, Laurie specializes in helping hotels reduce OTA dependency and maximize direct bookings through strategic digital advertising campaigns.',
          certifications: ['Google Hotel Ads Certified', 'Meta Blueprint Certified'],
          image: '/images/team/laurie-meiring.jpg',
        },
      ],
      testimonials: [
        {
          quote: 'Laurie\'s Google Hotel Ads strategy helped us reduce OTA commissions by 30% while increasing direct bookings by 45%. Our revenue per available room improved significantly.',
          author: 'Sarah Mitchell',
          position: 'General Manager',
          company: 'Oceanview Resort Miami',
        },
        {
          quote: 'Working with Inteligencia transformed our digital presence. We went from 60% OTA bookings to 60% direct bookings in just 6 months. The ROI has been incredible.',
          author: 'David Chen',
          position: 'Owner',
          company: 'Boutique Hotel Downtown',
        },
        {
          quote: 'The email marketing campaigns Laurie created for our hotel generated over $200K in additional revenue this year alone. The guest retention improvements have been remarkable.',
          author: 'Rachel Green',
          position: 'Marketing Director',
          company: 'Downtown Suites Hotel',
        },
      ],
      pricing: {
        plans: [
          {
            name: 'Starter Package',
            price: '$1,500',
            duration: 'per month',
            description: 'Perfect for boutique hotels (1-50 rooms) looking to reduce OTA dependency',
            features: ['Google Hotel Ads setup', 'Basic website optimization', 'Monthly performance reports'],
            ctaText: 'Get Started',
            ctaLink: '/contact',
          },
          {
            name: 'Growth Package',
            price: '$3,000',
            duration: 'per month',
            description: 'Designed for mid-size hotels (50-200 rooms) with multiple revenue streams',
            features: ['Full advertising suite', 'Email marketing automation', 'Revenue optimization', 'Dedicated account manager'],
            recommended: true,
            ctaText: 'Most Popular',
            ctaLink: '/contact',
          },
          {
            name: 'Pro+ Package',
            price: '$5,500',
            duration: 'per month',
            description: 'Built for large hotels (200+ rooms) or resort properties',
            features: ['Enterprise advertising strategy', 'Advanced automation suite', 'Custom integrations', 'Priority support & consulting'],
            ctaText: 'Contact Us',
            ctaLink: '/contact',
          },
        ],
      },
      contact: {
        title: 'Ready to Transform Your Hotel\'s Performance?',
        subtitle: 'Get your free hotel marketing audit and discover how to reduce OTA dependency while increasing direct bookings.',
        calendlyText: 'Schedule Your Free Hotel Marketing Consultation',
        email: 'hotels@inteligencia.com',
        phone: '(555) 123-4567',
        address: '123 Business Ave, Suite 100, Miami, FL 33101',
        // CONTACT PAGE EXTENDED CONTENT - Business types, budgets, timelines, office hours, FAQs
        businessTypes: ['Boutique Hotel', 'Resort', 'Bed & Breakfast', 'Vacation Rental', 'Hotel Chain', 'Other'],
        budgetRanges: ['$1,000 - $2,500/month', '$2,500 - $5,000/month', '$5,000 - $10,000/month', '$10,000+ /month', 'Let\'s discuss'],
        timelineOptions: ['ASAP - I need help now', 'Within 1 month', '1-3 months', '3-6 months', 'Just exploring options'],
        formLabels: {
          contactMethodsTitle: 'Get in Touch',
          contactMethodsSubtitle: 'Ready to discuss your hospitality marketing goals? Choose the contact method that works best for you.',
          formTitle: 'Send us a message',
          formSubtitle: 'Fill out the form below and we\'ll get back to you within 24 hours with a customized strategy for your business.',
          firstName: 'First Name *',
          lastName: 'Last Name *',
          email: 'Email Address *',
          phone: 'Phone Number',
          company: 'Business Name *',
          businessType: 'Business Type *',
          budget: 'Marketing Budget',
          timeline: 'Timeline',
          goals: 'What are your main marketing goals? *',
          message: 'Additional Details',
          submitButton: 'Send Message & Get Free Consultation',
          privacyText: 'We respect your privacy and will never share your information.',
          placeholders: {
            firstName: 'Enter your first name',
            lastName: 'Enter your last name',
            email: 'your@email.com',
            phone: '(555) 123-4567',
            company: 'Your Business Name',
            businessType: 'Select your business type',
            budget: 'Select your budget range',
            timeline: 'When do you want to start?',
            goals: 'e.g., Increase bookings, drive more customers, improve online presence...',
            message: 'Tell us more about your business, current challenges, or any specific questions you have...'
          }
        },
        officeHours: {
          weekdays: '9:00 AM - 6:00 PM EST',
          saturday: '10:00 AM - 2:00 PM EST', 
          sunday: 'Closed',
          emergency: 'Emergency support available 24/7 for existing clients.',
        },
        faq: [
          {
            question: 'How quickly can I expect to see results?',
            answer: 'Most hotel clients see initial improvements within 30-60 days, with significant direct booking increases typically achieved within 3-6 months. The timeline depends on your current marketing foundation and campaign objectives.',
          },
          {
            question: 'Do you work with hotels outside of these industries?',
            answer: 'We focus exclusively on hospitality, food service, healthcare, and athletics to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
          },
          {
            question: 'What makes your approach different for hotels?',
            answer: 'Unlike generic marketing agencies, we understand the unique challenges of hotel marketing, including OTA dependency, seasonal demand, and direct booking optimization. Our strategies are built on hospitality-specific insights and proven best practices.',
          },
          {
            question: 'Do you require long-term contracts?',
            answer: 'We offer both monthly and annual plans. While we recommend longer commitments for best results, we understand every hotel has different needs and can work with you to find the right arrangement.',
          },
        ],
      },
      // SERVICES PAGE EXTENDED CONTENT - Comprehensive services with integrated pricing
      servicesPage: {
        // Detailed services with features, pricing, and case study links
        services: [
          {
            id: 'google-hotel-ads',
            title: 'Google Hotel Ads Management',
            fullDescription: 'Capture guests at the exact moment they\'re ready to book with AI-optimized Google Hotel Ads campaigns. Our hospitality expertise ensures your property appears prominently when travelers are making booking decisions.',
            features: ['Direct booking optimization', 'Rate parity management', 'Seasonal demand targeting', 'Mobile booking optimization', 'Competitor bid analysis', 'Revenue per available room tracking'],
            process: ['Account audit & setup', 'Campaign structure optimization', 'Bid strategy implementation', 'Performance monitoring'],
            results: 'Average 35% increase in direct bookings within 6 months',
            caseStudyLink: '/case-studies#oceanview-resort',
            caseStudyText: 'See how Oceanview Resort reduced OTA commissions by 30% →',
            icon: '🏨',
            pricing: {
              starter: {
                name: 'Hotel Ads Starter',
                price: '$1,500',
                duration: '/month',
                description: 'Perfect for boutique hotels (1-50 rooms)',
                features: ['Google Hotel Ads setup & optimization', 'Basic booking engine integration', 'Monthly performance reports', 'Rate parity monitoring'],
                suitable: 'Boutique hotels, B&Bs'
              },
              growth: {
                name: 'Hotel Ads Growth',
                price: '$3,000',
                duration: '/month',
                description: 'Ideal for mid-size hotels (50-200 rooms)',
                features: ['Advanced campaign optimization', 'Multi-channel advertising', 'Dedicated account manager', 'Revenue optimization consulting'],
                recommended: true,
                suitable: 'Mid-size hotels, resort properties'
              },
              pro: {
                name: 'Hotel Ads Pro+',
                price: '$5,500',
                duration: '/month',
                description: 'Enterprise solution for large properties (200+ rooms)',
                features: ['Enterprise campaign management', 'Custom integrations', 'Priority support', 'Strategic growth consulting'],
                suitable: 'Large hotels, resort chains'
              }
            }
          },
          {
            id: 'meta-advertising',
            title: 'Meta Advertising for Hotels',
            fullDescription: 'Build awareness and drive bookings with visual storytelling that showcases your property\'s unique appeal. Our Meta advertising strategies target travelers at every stage of their journey.',
            features: ['Property showcase campaigns', 'Local tourism targeting', 'Retargeting website visitors', 'Event and conference promotion', 'User-generated content campaigns', 'Instagram Stories optimization'],
            process: ['Visual content strategy', 'Audience development', 'Campaign creation', 'Performance optimization'],
            results: '50% lower cost per booking compared to OTA advertising',
            caseStudyLink: '/case-studies#oceanview-resort',
            caseStudyText: 'Discover how we increased social media bookings by 60% →',
            icon: '📸',
            pricing: {
              starter: {
                name: 'Social Media Starter',
                price: '$1,200',
                duration: '/month',
                description: 'Essential social media advertising',
                features: ['Facebook & Instagram ads setup', 'Basic visual content creation', 'Audience targeting', 'Monthly reporting'],
                suitable: 'Small properties, limited budget'
              },
              growth: {
                name: 'Social Media Growth',
                price: '$2,500',
                duration: '/month',
                description: 'Comprehensive social media marketing',
                features: ['Advanced campaign strategies', 'Professional content creation', 'Retargeting campaigns', 'Influencer partnerships'],
                recommended: true,
                suitable: 'Most hotel properties'
              },
              pro: {
                name: 'Social Media Pro+',
                price: '$4,000',
                duration: '/month',
                description: 'Premium social media presence',
                features: ['Full content production', 'Video marketing', 'Community management', 'Brand ambassador programs'],
                suitable: 'Luxury properties, resorts'
              }
            }
          },
          {
            id: 'email-marketing',
            title: 'Email Marketing & Guest CRM',
            fullDescription: 'Turn one-time guests into loyal repeat customers with automated email sequences that enhance the guest experience and drive direct bookings.',
            features: ['Pre-arrival welcome sequences', 'Post-stay follow-up campaigns', 'Loyalty program automation', 'Special offers & packages', 'Guest segmentation', 'Lifetime value optimization'],
            process: ['Guest journey mapping', 'Email automation setup', 'Segmentation strategy', 'Performance tracking'],
            results: '25% increase in repeat bookings and 40% higher guest lifetime value',
            caseStudyLink: '/case-studies#oceanview-resort',
            caseStudyText: 'Read how our email campaigns generated $200K additional revenue →',
            icon: '📧',
            pricing: {
              starter: {
                name: 'Email Marketing Starter',
                price: '$800',
                duration: '/month',
                description: 'Basic email automation for small hotels',
                features: ['Welcome series setup', 'Post-stay follow-up', 'Basic segmentation', 'Monthly analytics'],
                suitable: 'Small hotels, B&Bs'
              },
              growth: {
                name: 'Email Marketing Growth',
                price: '$1,800',
                duration: '/month',
                description: 'Advanced email marketing automation',
                features: ['Full guest journey automation', 'Advanced segmentation', 'Loyalty program integration', 'A/B testing'],
                recommended: true,
                suitable: 'Mid-size to large hotels'
              },
              pro: {
                name: 'Email Marketing Pro+',
                price: '$3,200',
                duration: '/month',
                description: 'Enterprise email marketing with CRM',
                features: ['Custom CRM integration', 'Predictive analytics', 'Personalization engine', 'Revenue attribution'],
                suitable: 'Large hotels, resort chains'
              }
            }
          }
        ],
        // Step-by-step marketing process displayed on Services page
        marketingProcess: [
          {
            step: '01',
            title: 'Discovery & Analysis',
            description: 'Deep dive into your hotel operations, competitors, and target guests to identify booking opportunities and challenges.',
            icon: '🔍',
          },
          {
            step: '02', 
            title: 'Strategy Development',
            description: 'Create a comprehensive hotel marketing strategy focused on direct bookings and guest acquisition.',
            icon: '📋',
          },
          {
            step: '03',
            title: 'Campaign Implementation',
            description: 'Execute multi-channel campaigns targeting potential guests at every stage of the booking journey.',
            icon: '🚀',
          },
          {
            step: '04',
            title: 'Optimization & Growth',
            description: 'Continuously optimize campaigns based on booking data to maximize revenue and reduce OTA dependency.',
            icon: '📈',
          },
        ],
        // Core marketing capabilities offered
        coreCapabilities: [
          {
            title: 'Paid Advertising',
            description: 'Google Hotel Ads, Meta Ads, and hospitality-specific advertising platforms',
            features: ['Google Hotel Ads Management', 'Social Media Advertising', 'Display & Video Campaigns', 'Retargeting Strategies'],
            icon: '🎯',
          },
          {
            title: 'Direct Booking Optimization',
            description: 'Website optimization and booking funnel improvement',
            features: ['Booking Engine Optimization', 'Rate Parity Management', 'Mobile Booking Enhancement', 'A/B Testing'],
            icon: '🌱',
          },
          {
            title: 'Guest Experience Marketing',
            description: 'Email marketing and guest journey optimization',
            features: ['Pre-arrival Campaigns', 'Post-stay Follow-up', 'Loyalty Program Development', 'Review Generation'],
            icon: '🔄',
          },
          {
            title: 'Analytics & Reporting',
            description: 'Revenue tracking and performance optimization',
            features: ['Revenue Analytics', 'Booking Source Analysis', 'ROI Tracking', 'Competitive Analysis'],
            icon: '📊',
          },
        ],
        // Industry-specific benefits
        industryBenefits: [
          'Reduce OTA dependency by 30%+',
          'Increase direct bookings by 40%+',
          'Improve guest lifetime value',
          'Enhance online reputation',
        ],
      },
      // CASE STUDIES - Success stories for this industry
      caseStudies: [
        {
          id: 'oceanview-resort',
          title: 'Oceanview Resort Miami Transforms Digital Presence',
          industry: 'Hotels & Hospitality',
          client: 'Oceanview Resort Miami',
          challenge: 'High dependency on OTA platforms was eating into profit margins with commission rates reaching 25%. The resort struggled with low direct booking rates and poor visibility in local search results.',
          solution: 'Implemented a comprehensive digital marketing strategy including Google Hotel Ads optimization, targeted social media campaigns, and a robust email marketing automation system to drive direct bookings.',
          results: [
            {
              metric: 'Direct Bookings',
              value: '+40%',
              description: 'Increase in direct bookings within 6 months'
            },
            {
              metric: 'OTA Commissions',
              value: '-25%', 
              description: 'Reduction in commission fees paid to booking platforms'
            },
            {
              metric: 'Revenue Growth',
              value: '+60%',
              description: 'Increase in total revenue from marketing efforts'
            }
          ],
          testimonial: {
            quote: "Laurie's Google Hotel Ads strategy helped us reduce OTA commissions by 30% while increasing direct bookings by 45%. Our revenue per available room improved significantly.",
            author: 'Sarah Mitchell',
            position: 'General Manager',
            company: 'Oceanview Resort Miami'
          },
          image: 'https://picsum.photos/800/600?random=1',
          tags: ['Google Hotel Ads', 'Direct Bookings', 'Email Marketing', 'OTA Optimization']
        }
      ],
    },
    metadata: {
      title: 'Hotel Marketing Services - Inteligencia',
      description: 'Professional digital marketing services for hotels and hospitality businesses. Increase direct bookings with Google Hotel Ads, social media, and email marketing.',
      keywords: ['hotel marketing', 'hospitality marketing', 'google hotel ads', 'direct bookings', 'hotel social media'],
    },
  },

  foodservice: {
    ...baseConfig,
    industry: 'foodservice',
    name: 'Restaurant & Food Service Marketing',
    subdomain: 'restaurants',
    branding: {
      primaryColor: '#002643',
      secondaryColor: '#0093a0',
      accentColor: '#FFD700',
    },
    content: {
      hero: {
        title: 'Fill Every Table, Every Night',
        subtitle: 'Drive foot traffic and online orders with restaurant marketing that actually works',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        ctaText: 'Get Free Restaurant Marketing Analysis',
        ctaLink: '/contact',
        stats: [
          { value: '65%', label: 'Increase in Reservations' },
          { value: '80%', label: 'Growth in Online Orders' },
          { value: '3.5x', label: 'Return on Ad Spend' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      services: [
        {
          title: 'Local SEO & Google My Business',
          description: 'Dominate local search when hungry customers are looking for a place to eat.',
          keyBenefit: 'Average 45% increase in walk-ins',
          icon: 'map-pin',
          learnMoreLink: '/services#local-seo',
        },
        {
          title: 'Social Media Advertising',
          description: 'Make mouths water with food photography and campaigns that drive orders.',
          keyBenefit: '60% increase in social media orders',
          icon: 'camera',
          learnMoreLink: '/services#social-media',
        },
        {
          title: 'Delivery Platform Management',
          description: 'Optimize your presence on delivery platforms while reducing commission fees.',
          keyBenefit: '30% reduction in delivery fees',
          icon: 'shopping-bag',
          learnMoreLink: '/services#delivery-optimization',
        },
      ],
      // ABOUT PAGE CONTENT - Company story, team, and values
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
            title: 'Founder & Restaurant Marketing Expert',
            bio: 'Passionate about helping restaurant owners build thriving businesses, Laurie combines culinary industry knowledge with proven digital marketing strategies to fill tables and grow customer loyalty.',
            certifications: ['Google Ads Certified', 'Meta Blueprint Certified', 'Local SEO Expert'],
            image: '/images/team/laurie-meiring.jpg',
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
      team: [
        {
          name: 'Laurie Meiring',
          title: 'Founder & Restaurant Marketing Expert',
          bio: 'Passionate about helping restaurant owners build thriving businesses, Laurie combines culinary industry knowledge with proven digital marketing strategies to fill tables and grow customer loyalty.',
          certifications: ['Google Ads Certified', 'Meta Blueprint Certified', 'Local SEO Expert'],
          image: '/images/team/laurie-meiring.jpg',
        },
      ],
      testimonials: [
        {
          quote: 'Working with Inteligencia completely transformed our restaurant\'s digital presence. We went from empty tables to full reservations, and our online orders tripled in just 4 months.',
          author: 'Maria Rodriguez',
          position: 'Owner & Head Chef',
          company: 'Bella Vista Italian Bistro',
        },
        {
          quote: 'Laurie\'s social media campaigns showcasing our dishes brought in so many new customers. Our Instagram following grew by 400% and foot traffic increased by 65%.',
          author: 'Antonio Ricci',
          position: 'Restaurant Manager',
          company: 'Ricci\'s Family Restaurant',
        },
        {
          quote: 'Our delivery orders increased by 80% after Laurie optimized our presence on all the major platforms. The commission savings alone paid for the marketing investment.',
          author: 'Sofia Martinez',
          position: 'Co-Owner',
          company: 'Martinez Brothers Cantina',
        },
      ],
      pricing: {
        plans: [
          {
            name: 'Essential Package',
            price: '$1,500',
            duration: 'per month',
            description: 'Ideal for single-location restaurants wanting to increase local visibility',
            features: ['Google My Business optimization', 'Social media setup', 'Local SEO optimization'],
            ctaText: 'Get Started',
            ctaLink: '/contact',
          },
          {
            name: 'Professional Package',
            price: '$3,000',
            duration: 'per month',
            description: 'Perfect for restaurant groups or high-volume establishments',
            features: ['Multi-platform campaigns', 'Delivery platform optimization', 'Staff training support', 'Menu and pricing strategy'],
            recommended: true,
            ctaText: 'Most Popular',
            ctaLink: '/contact',
          },
          {
            name: 'Enterprise Package',
            price: '$5,500',
            duration: 'per month',
            description: 'Designed for restaurant chains or flagship locations',
            features: ['Multi-location management', 'Corporate account management', 'Franchise support systems', 'Advanced analytics & reporting'],
            ctaText: 'Contact Us',
            ctaLink: '/contact',
          },
        ],
      },
      contact: {
        title: 'Let\'s Fill Your Restaurant Tonight',
        subtitle: 'Get your free restaurant marketing analysis and learn how to increase foot traffic and online orders.',
        calendlyText: 'Schedule Your Free Restaurant Consultation',
        email: 'restaurants@inteligencia.com',
        phone: '(555) 123-4567',
        address: '123 Business Ave, Suite 100, Miami, FL 33101',
        // CONTACT PAGE EXTENDED CONTENT - Business types, budgets, timelines, office hours, FAQs
        businessTypes: ['Fine Dining', 'Casual Dining', 'Fast Casual', 'Coffee Shop', 'Bar/Pub', 'Food Truck', 'Restaurant Chain', 'Other'],
        budgetRanges: ['$1,000 - $2,500/month', '$2,500 - $5,000/month', '$5,000 - $10,000/month', '$10,000+ /month', 'Let\'s discuss'],
        timelineOptions: ['ASAP - I need help now', 'Within 1 month', '1-3 months', '3-6 months', 'Just exploring options'],
        formLabels: {
          contactMethodsTitle: 'Get in Touch',
          contactMethodsSubtitle: 'Ready to discuss your restaurant marketing goals? Choose the contact method that works best for you.',
          formTitle: 'Send us a message',
          formSubtitle: 'Fill out the form below and we\'ll get back to you within 24 hours with a customized strategy for your business.',
          firstName: 'First Name *',
          lastName: 'Last Name *',
          email: 'Email Address *',
          phone: 'Phone Number',
          company: 'Business Name *',
          businessType: 'Business Type *',
          budget: 'Marketing Budget',
          timeline: 'Timeline',
          goals: 'What are your main marketing goals? *',
          message: 'Additional Details',
          submitButton: 'Send Message & Get Free Consultation',
          privacyText: 'We respect your privacy and will never share your information.',
          placeholders: {
            firstName: 'Enter your first name',
            lastName: 'Enter your last name',
            email: 'your@email.com',
            phone: '(555) 123-4567',
            company: 'Your Business Name',
            businessType: 'Select your business type',
            budget: 'Select your budget range',
            timeline: 'When do you want to start?',
            goals: 'e.g., Increase foot traffic, boost online orders, improve local visibility...',
            message: 'Tell us more about your restaurant, current challenges, or any specific questions you have...'
          }
        },
        officeHours: {
          weekdays: '9:00 AM - 6:00 PM EST',
          saturday: '10:00 AM - 2:00 PM EST', 
          sunday: 'Closed',
          emergency: 'Emergency support available 24/7 for existing clients.',
        },
        faq: [
          {
            question: 'How quickly can I expect to see results?',
            answer: 'Most restaurant clients see initial improvements within 30-60 days, with significant foot traffic increases typically achieved within 3-6 months. The timeline depends on your current marketing foundation and campaign objectives.',
          },
          {
            question: 'Do you work with restaurants outside of these industries?',
            answer: 'We focus exclusively on hospitality, food service, healthcare, and athletics to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
          },
          {
            question: 'What makes your approach different for restaurants?',
            answer: 'Unlike generic marketing agencies, we understand the unique challenges of restaurant marketing, including local competition, delivery platforms, and customer retention. Our strategies are built on food service-specific insights and proven best practices.',
          },
          {
            question: 'Do you require long-term contracts?',
            answer: 'We offer both monthly and annual plans. While we recommend longer commitments for best results, we understand every restaurant has different needs and can work with you to find the right arrangement.',
          },
        ],
      },
      // SERVICES PAGE EXTENDED CONTENT - Comprehensive services with integrated pricing
      servicesPage: {
        // Detailed services with features, pricing, and case study links
        services: [
          {
            id: 'local-seo',
            title: 'Local SEO & Google My Business',
            fullDescription: 'Dominate local search results when hungry customers are looking for a place to eat. Our restaurant SEO expertise ensures your establishment appears prominently in local searches and Google Maps.',
            features: ['Google My Business optimization', 'Review management system', 'Local keyword targeting', 'Menu SEO optimization', 'Citation building', 'Local competitor analysis'],
            process: ['Local SEO audit', 'Google My Business optimization', 'Review strategy implementation', 'Performance tracking'],
            results: 'Average 45% increase in walk-in customers within 3 months',
            caseStudyLink: '/case-studies#bella-vista-bistro',
            caseStudyText: 'See how Bella Vista increased foot traffic by 65% →',
            icon: '📍',
            pricing: {
              starter: {
                name: 'Local SEO Starter',
                price: '$800',
                duration: '/month',
                description: 'Essential local visibility for single location',
                features: ['Google My Business optimization', 'Basic review management', 'Local keyword research', 'Monthly reporting'],
                suitable: 'Single location restaurants'
              },
              growth: {
                name: 'Local SEO Growth',
                price: '$1,500',
                duration: '/month',
                description: 'Comprehensive local marketing strategy',
                features: ['Advanced GMB optimization', 'Review generation system', 'Local content creation', 'Citation management'],
                recommended: true,
                suitable: 'Established restaurants, small chains'
              },
              pro: {
                name: 'Local SEO Pro+',
                price: '$2,800',
                duration: '/month',
                description: 'Enterprise local marketing solution',
                features: ['Multi-location optimization', 'Reputation management', 'Local PR strategy', 'Competitive analysis'],
                suitable: 'Restaurant chains, franchises'
              }
            }
          },
          {
            id: 'social-media',
            title: 'Social Media Advertising',
            fullDescription: 'Make mouths water with professional food photography and social media campaigns that drive orders. Our visual storytelling approach showcases your dishes and creates craving that converts.',
            features: ['Instagram & Facebook food campaigns', 'Professional food photography', 'Event promotion', 'User-generated content campaigns', 'Influencer partnerships', 'Story advertising'],
            process: ['Visual content audit', 'Photography planning', 'Campaign development', 'Community management'],
            results: '60% increase in social media-driven orders and 400% follower growth',
            caseStudyLink: '/case-studies#bella-vista-bistro',
            caseStudyText: 'Discover how we tripled online orders through social media →',
            icon: '📸',
            pricing: {
              starter: {
                name: 'Social Media Starter',
                price: '$1,200',
                duration: '/month',
                description: 'Basic social media advertising',
                features: ['Facebook & Instagram ads', 'Basic content creation', 'Audience targeting', 'Performance reporting'],
                suitable: 'Small restaurants, cafes'
              },
              growth: {
                name: 'Social Media Growth',
                price: '$2,000',
                duration: '/month',
                description: 'Professional social media marketing',
                features: ['Professional food photography', 'Advanced campaign strategies', 'Influencer partnerships', 'Community management'],
                recommended: true,
                suitable: 'Most restaurant types'
              },
              pro: {
                name: 'Social Media Pro+',
                price: '$3,500',
                duration: '/month',
                description: 'Premium social media presence',
                features: ['Video content production', 'Brand ambassador programs', 'Crisis management', 'Multi-platform strategy'],
                suitable: 'Fine dining, restaurant groups'
              }
            }
          },
          {
            id: 'delivery-optimization',
            title: 'Delivery Platform Management',
            fullDescription: 'Optimize your presence on delivery platforms while reducing commission fees. Our platform management ensures maximum visibility and profitability across all major delivery services.',
            features: ['Platform fee optimization', 'Menu optimization for delivery', 'Commission negotiation', 'Order volume analysis', 'Platform-specific promotions', 'Customer data analysis'],
            process: ['Platform audit', 'Menu optimization', 'Promotion strategy', 'Performance monitoring'],
            results: '30% reduction in delivery fees and 80% increase in delivery orders',
            caseStudyLink: '/case-studies#bella-vista-bistro',
            caseStudyText: 'Read how we saved $50K annually in commission fees →',
            icon: '🛍️',
            pricing: {
              starter: {
                name: 'Delivery Optimization Starter',
                price: '$600',
                duration: '/month',
                description: 'Basic delivery platform optimization',
                features: ['Single platform optimization', 'Menu optimization', 'Basic analytics', 'Monthly reporting'],
                suitable: 'Single platform restaurants'
              },
              growth: {
                name: 'Delivery Optimization Growth',
                price: '$1,200',
                duration: '/month',
                description: 'Multi-platform delivery management',
                features: ['All major platforms', 'Commission optimization', 'Promotion management', 'Performance tracking'],
                recommended: true,
                suitable: 'Multi-platform restaurants'
              },
              pro: {
                name: 'Delivery Optimization Pro+',
                price: '$2,200',
                duration: '/month',
                description: 'Enterprise delivery strategy',
                features: ['Custom integrations', 'Data analytics platform', 'Commission negotiation', 'Strategic consulting'],
                suitable: 'Restaurant chains, high-volume'
              }
            }
          }
        ],
        // Step-by-step marketing process displayed on Services page
        marketingProcess: [
          {
            step: '01',
            title: 'Discovery & Analysis',
            description: 'Deep dive into your restaurant, competitors, and target customers to identify opportunities and challenges.',
            icon: '🔍',
          },
          {
            step: '02', 
            title: 'Strategy Development',
            description: 'Create a comprehensive restaurant marketing strategy focused on filling tables and increasing orders.',
            icon: '📋',
          },
          {
            step: '03',
            title: 'Campaign Implementation',
            description: 'Execute multi-channel campaigns targeting hungry customers at the perfect moment.',
            icon: '🚀',
          },
          {
            step: '04',
            title: 'Optimization & Growth',
            description: 'Continuously optimize campaigns based on performance data to maximize customer acquisition and retention.',
            icon: '📈',
          },
        ],
        // Core marketing capabilities offered
        coreCapabilities: [
          {
            title: 'Paid Advertising',
            description: 'Google Ads, Meta Ads, and food service-specific advertising platforms',
            features: ['Local Search Marketing', 'Social Media Food Campaigns', 'Display & Video Ads', 'Delivery Platform Ads'],
            icon: '🎯',
          },
          {
            title: 'Local SEO & Visibility',
            description: 'Google My Business optimization and local search dominance',
            features: ['Google My Business Optimization', 'Local Keyword Targeting', 'Review Management', 'Menu SEO'],
            icon: '🌱',
          },
          {
            title: 'Customer Retention',
            description: 'Email marketing and loyalty program development',
            features: ['Email Campaigns', 'Loyalty Program Setup', 'Customer Segmentation', 'Retention Strategies'],
            icon: '🔄',
          },
          {
            title: 'Analytics & Reporting',
            description: 'Customer tracking and performance optimization',
            features: ['Foot Traffic Analytics', 'Order Volume Analysis', 'ROI Tracking', 'Customer Behavior Insights'],
            icon: '📊',
          },
        ],
        // Industry-specific benefits
        industryBenefits: [
          'Increase foot traffic by 50%+',
          'Boost online orders by 70%+',
          'Improve local search visibility',
          'Build customer loyalty',
        ],
      },
      // CASE STUDIES - Success stories for this industry
      caseStudies: [
        {
          id: 'bella-vista-bistro',
          title: 'Bella Vista Bistro Fills Every Table',
          industry: 'Restaurants & Food Service',
          client: 'Bella Vista Italian Bistro',
          challenge: 'Despite serving excellent food, the restaurant struggled with inconsistent foot traffic and relied heavily on walk-in customers. Online ordering was minimal and social media presence was virtually non-existent.',
          solution: 'Launched a comprehensive local SEO campaign, implemented Instagram and Facebook advertising featuring mouth-watering food photography, and optimized their presence on delivery platforms.',
          results: [
            {
              metric: 'Reservations',
              value: '+65%',
              description: 'Increase in table reservations through digital channels'
            },
            {
              metric: 'Online Orders',
              value: '+80%',
              description: 'Growth in delivery and takeout orders'
            },
            {
              metric: 'Social Engagement',
              value: '+400%',
              description: 'Increase in social media following and engagement'
            }
          ],
          testimonial: {
            quote: "Working with Inteligencia completely transformed our restaurant's digital presence. We went from empty tables to full reservations, and our online orders tripled in just 4 months.",
            author: 'Maria Rodriguez',
            position: 'Owner & Head Chef',
            company: 'Bella Vista Italian Bistro'
          },
          image: 'https://picsum.photos/800/600?random=2',
          tags: ['Local SEO', 'Social Media', 'Food Photography', 'Delivery Optimization']
        }
      ],
    },
    metadata: {
      title: 'Restaurant Marketing Services - Inteligencia',
      description: 'Digital marketing services for restaurants and food service businesses. Increase customers with local SEO, social media, and online ordering optimization.',
      keywords: ['restaurant marketing', 'food service marketing', 'local seo', 'google my business', 'online ordering'],
    },
  },

  healthcare: {
    ...baseConfig,
    industry: 'healthcare',
    name: 'Dental & Healthcare Marketing',
    subdomain: 'dental',
    branding: {
      primaryColor: '#002643',
      secondaryColor: '#0093a0',
      accentColor: '#FFD700',
    },
    content: {
      hero: {
        title: 'Grow Your Practice with Quality Patients',
        subtitle: 'Attract new patients and build lasting relationships with HIPAA-compliant marketing',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        ctaText: 'Get Free Practice Growth Analysis',
        ctaLink: '/contact',
        stats: [
          { value: '150+', label: 'New Patients per Month' },
          { value: '95%', label: 'Patient Retention Rate' },
          { value: '$2.8M', label: 'Additional Annual Revenue' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      services: [
        {
          title: 'Patient Acquisition Campaigns',
          description: 'Attract quality patients actively searching for dental services with HIPAA-compliant marketing.',
          keyBenefit: 'Average 120 new patients per month',
          icon: 'shield-check',
          learnMoreLink: '/services#patient-acquisition',
        },
        {
          title: 'Reputation Management',
          description: 'Build trust and credibility with 5-star reviews and professional online presence.',
          keyBenefit: '4.8+ star average rating',
          icon: 'search',
          learnMoreLink: '/services#reputation-management',
        },
        {
          title: 'Practice Growth Consulting',
          description: 'Strategic guidance and systems for sustainable practice expansion and profitability.',
          keyBenefit: 'Average 40% practice growth',
          icon: 'book-open',
          learnMoreLink: '/services#practice-growth',
        },
      ],
      team: [
        {
          name: 'Laurie Meiring',
          title: 'Founder & Healthcare Marketing Specialist',
          bio: 'Specializing in HIPAA-compliant marketing for healthcare providers, Laurie helps dental practices attract quality patients while maintaining the highest standards of privacy and professionalism.',
          certifications: ['Google Ads Certified', 'Healthcare Marketing Certified', 'HIPAA Compliance Expert'],
          image: '/images/team/laurie-meiring.jpg',
        },
      ],
      testimonials: [
        {
          quote: 'Laurie\'s patient acquisition campaigns brought us 150 new patients in our first 6 months working together. The quality of patients is exceptional, and our practice has never been busier.',
          author: 'Dr. Jennifer Chen',
          position: 'Practice Owner',
          company: 'Smile Dental Group',
        },
        {
          quote: 'The reputation management system Laurie implemented helped us achieve a 4.9-star rating across all platforms. New patients frequently mention finding us through positive reviews.',
          author: 'Dr. Michael Foster',
          position: 'Dental Practice Owner',
          company: 'Foster Family Dentistry',
        },
        {
          quote: 'Laurie\'s HIPAA-compliant campaigns brought quality patients who value our comprehensive care. Our practice revenue increased by $500K in the first year.',
          author: 'Dr. Amanda Williams',
          position: 'Practice Manager',
          company: 'Williams Dental Associates',
        },
      ],
      pricing: {
        plans: [
          {
            name: 'Practice Starter',
            price: '$1,500',
            duration: 'per month',
            description: 'Great for solo practitioners or small practices (1-2 dentists)',
            features: ['Patient acquisition campaigns', 'Review management', 'Basic compliance setup'],
            ctaText: 'Get Started',
            ctaLink: '/contact',
          },
          {
            name: 'Practice Growth',
            price: '$3,000',
            duration: 'per month',
            description: 'Ideal for multi-dentist practices or specialty dental services',
            features: ['Advanced patient acquisition', 'Reputation management suite', 'Practice growth consulting', 'Technology integration'],
            recommended: true,
            ctaText: 'Most Popular',
            ctaLink: '/contact',
          },
          {
            name: 'Practice Pro+',
            price: '$5,500',
            duration: 'per month',
            description: 'Perfect for large practices or dental organizations',
            features: ['Advanced practice management', 'Continuing education support', 'Strategic growth planning', 'Executive advisory services'],
            ctaText: 'Contact Us',
            ctaLink: '/contact',
          },
        ],
      },
      contact: {
        title: 'Ready to Grow Your Practice?',
        subtitle: 'Get your free practice growth analysis and discover how to attract quality patients with HIPAA-compliant marketing.',
        calendlyText: 'Schedule Your Free Practice Growth Consultation',
        email: 'dental@inteligencia.com',
        phone: '(555) 123-4567',
        address: '123 Business Ave, Suite 100, Miami, FL 33101',
        // CONTACT PAGE EXTENDED CONTENT - Business types, budgets, timelines, office hours, FAQs
        businessTypes: ['General Dentistry', 'Dental Speciality', 'Medical Practice', 'Urgent Care', 'Healthcare Group', 'Other'],
        budgetRanges: ['$1,000 - $2,500/month', '$2,500 - $5,000/month', '$5,000 - $10,000/month', '$10,000+ /month', 'Let\'s discuss'],
        timelineOptions: ['ASAP - I need help now', 'Within 1 month', '1-3 months', '3-6 months', 'Just exploring options'],
        formLabels: {
          contactMethodsTitle: 'Get in Touch',
          contactMethodsSubtitle: 'Ready to discuss your healthcare practice marketing goals? Choose the contact method that works best for you.',
          formTitle: 'Send us a message',
          formSubtitle: 'Fill out the form below and we\'ll get back to you within 24 hours with a customized strategy for your practice.',
          firstName: 'First Name *',
          lastName: 'Last Name *',
          email: 'Email Address *',
          phone: 'Phone Number',
          company: 'Practice Name *',
          businessType: 'Practice Type *',
          budget: 'Marketing Budget',
          timeline: 'Timeline',
          goals: 'What are your main practice goals? *',
          message: 'Additional Details',
          submitButton: 'Send Message & Get Free Consultation',
          privacyText: 'We respect your privacy and will never share your information. All communications are HIPAA-compliant.',
          placeholders: {
            firstName: 'Enter your first name',
            lastName: 'Enter your last name',
            email: 'your@email.com',
            phone: '(555) 123-4567',
            company: 'Your Practice Name',
            businessType: 'Select your practice type',
            budget: 'Select your budget range',
            timeline: 'When do you want to start?',
            goals: 'e.g., Attract new patients, improve online reputation, increase treatment acceptance...',
            message: 'Tell us more about your practice, current challenges, or any specific questions you have...'
          }
        },
        officeHours: {
          weekdays: '9:00 AM - 6:00 PM EST',
          saturday: '10:00 AM - 2:00 PM EST', 
          sunday: 'Closed',
          emergency: 'Emergency support available 24/7 for existing clients.',
        },
        faq: [
          {
            question: 'How quickly can I expect to see results?',
            answer: 'Most healthcare practices see initial improvements within 30-60 days, with significant patient acquisition typically achieved within 3-6 months. The timeline depends on your current marketing foundation and campaign objectives.',
          },
          {
            question: 'Do you work with practices outside of these industries?',
            answer: 'We focus exclusively on hospitality, food service, healthcare, and athletics to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
          },
          {
            question: 'Is your marketing HIPAA-compliant?',
            answer: 'Yes, all our healthcare marketing campaigns are fully HIPAA-compliant. We understand the unique privacy requirements of medical practices and ensure all patient information is protected according to federal regulations.',
          },
          {
            question: 'Do you require long-term contracts?',
            answer: 'We offer both monthly and annual plans. While we recommend longer commitments for best results, we understand every practice has different needs and can work with you to find the right arrangement.',
          },
        ],
      },
    },
    metadata: {
      title: 'Healthcare Marketing Services - Inteligencia',
      description: 'HIPAA-compliant digital marketing for dental and healthcare practices. Attract new patients with ethical, compliant marketing strategies.',
      keywords: ['healthcare marketing', 'dental marketing', 'hipaa compliant', 'medical marketing', 'patient acquisition'],
    },
  },

  athletics: {
    ...baseConfig,
    industry: 'athletics',
    name: 'Sports & Recreation Marketing',
    subdomain: 'sports',
    branding: {
      primaryColor: '#002643',
      secondaryColor: '#0093a0',
      accentColor: '#FFD700',
    },
    content: {
      hero: {
        title: 'Fill Your Courts, Grow Your Community',
        subtitle: 'Drive membership growth and tournament participation with sports marketing expertise',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        ctaText: 'Get Free Facility Growth Plan',
        ctaLink: '/contact',
        stats: [
          { value: '200%', label: 'Tournament Participation Growth' },
          { value: '85%', label: 'Facility Utilization Rate' },
          { value: '300+', label: 'New Members This Year' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      services: [
        {
          title: 'Tournament & Event Promotion',
          description: 'Fill every tournament bracket and maximize event attendance with targeted marketing.',
          keyBenefit: 'Average 200% increase in participation',
          icon: 'trophy',
          learnMoreLink: '/services#tournament-promotion',
        },
        {
          title: 'Membership Growth Campaigns',
          description: 'Build a thriving sports community that keeps growing with strategic member acquisition.',
          keyBenefit: '300+ new members annually',
          icon: 'users',
          learnMoreLink: '/services#membership-growth',
        },
        {
          title: 'Facility Management & Analytics',
          description: 'Data-driven insights and optimization strategies to maximize facility performance.',
          keyBenefit: '20% increase in facility revenue',
          icon: 'calendar',
          learnMoreLink: '/services#facility-analytics',
        },
      ],
      team: [
        {
          name: 'Laurie Meiring',
          title: 'Founder & Sports Marketing Strategist',
          bio: 'An avid sports enthusiast and marketing expert, Laurie understands the unique challenges of recreational facilities and specializes in building vibrant sporting communities through targeted marketing campaigns.',
          certifications: ['Google Ads Certified', 'Sports Marketing Specialist', 'Event Promotion Expert'],
          image: '/images/team/laurie-meiring.jpg',
        },
      ],
      testimonials: [
        {
          quote: 'Since partnering with Inteligencia, our tournament participation has doubled and we\'ve added 300 new members. Laurie understands the sports community like no other marketer we\'ve worked with.',
          author: 'Mike Thompson',
          position: 'Facility Director',
          company: 'Central Coast Sports Complex',
        },
        {
          quote: 'Our facility utilization improved from 60% to 85% after implementing Laurie\'s membership growth strategies. The community engagement programs have been a game-changer.',
          author: 'Lisa Park',
          position: 'Operations Manager',
          company: 'Elite Sports Center',
        },
        {
          quote: 'The tournament promotion strategies Laurie developed helped us host our largest event ever with 500+ participants. The community response was overwhelming.',
          author: 'James Rodriguez',
          position: 'Event Coordinator',
          company: 'Coastal Recreation Complex',
        },
      ],
      pricing: {
        plans: [
          {
            name: 'Facility Basics',
            price: '$1,500',
            duration: 'per month',
            description: 'Perfect for single-court facilities or small recreational centers',
            features: ['Basic digital marketing setup', 'Membership growth campaigns', 'Event promotion support'],
            ctaText: 'Get Started',
            ctaLink: '/contact',
          },
          {
            name: 'Elite Facility',
            price: '$3,000',
            duration: 'per month',
            description: 'Great for multi-court facilities with tournaments and events',
            features: ['Comprehensive marketing strategy', 'Tournament promotion system', 'Advanced analytics dashboard', 'Community building programs'],
            recommended: true,
            ctaText: 'Most Popular',
            ctaLink: '/contact',
          },
          {
            name: 'Championship Package',
            price: '$5,500',
            duration: 'per month',
            description: 'Ideal for major recreational complexes or sports facilities',
            features: ['Full facility optimization', 'Professional tournament hosting', 'Sponsorship and partnership development', 'Custom facility development'],
            ctaText: 'Contact Us',
            ctaLink: '/contact',
          },
        ],
      },
      contact: {
        title: 'Ready to Build Your Sports Community?',
        subtitle: 'Get your free facility growth plan and learn how to maximize membership and tournament participation.',
        calendlyText: 'Schedule Your Free Facility Growth Consultation',
        email: 'sports@inteligencia.com',
        phone: '(555) 123-4567',
        address: '123 Business Ave, Suite 100, Miami, FL 33101',
        // CONTACT PAGE EXTENDED CONTENT - Business types, budgets, timelines, office hours, FAQs
        businessTypes: ['Tennis Club', 'Pickleball Facility', 'Golf Course', 'Fitness Center', 'Sports Complex', 'Recreation Center', 'Other'],
        budgetRanges: ['$1,000 - $2,500/month', '$2,500 - $5,000/month', '$5,000 - $10,000/month', '$10,000+ /month', 'Let\'s discuss'],
        timelineOptions: ['ASAP - I need help now', 'Within 1 month', '1-3 months', '3-6 months', 'Just exploring options'],
        formLabels: {
          contactMethodsTitle: 'Get in Touch',
          contactMethodsSubtitle: 'Ready to discuss your sports facility marketing goals? Choose the contact method that works best for you.',
          formTitle: 'Send us a message',
          formSubtitle: 'Fill out the form below and we\'ll get back to you within 24 hours with a customized strategy for your facility.',
          firstName: 'First Name *',
          lastName: 'Last Name *',
          email: 'Email Address *',
          phone: 'Phone Number',
          company: 'Facility Name *',
          businessType: 'Facility Type *',
          budget: 'Marketing Budget',
          timeline: 'Timeline',
          goals: 'What are your main facility goals? *',
          message: 'Additional Details',
          submitButton: 'Send Message & Get Free Consultation',
          privacyText: 'We respect your privacy and will never share your information.',
          placeholders: {
            firstName: 'Enter your first name',
            lastName: 'Enter your last name',
            email: 'your@email.com',
            phone: '(555) 123-4567',
            company: 'Your Facility Name',
            businessType: 'Select your facility type',
            budget: 'Select your budget range',
            timeline: 'When do you want to start?',
            goals: 'e.g., Increase membership, fill tournaments, boost facility utilization...',
            message: 'Tell us more about your facility, current challenges, or any specific questions you have...'
          }
        },
        officeHours: {
          weekdays: '9:00 AM - 6:00 PM EST',
          saturday: '10:00 AM - 2:00 PM EST', 
          sunday: 'Closed',
          emergency: 'Emergency support available 24/7 for existing clients.',
        },
        faq: [
          {
            question: 'How quickly can I expect to see results?',
            answer: 'Most sports facilities see initial improvements within 30-60 days, with significant membership growth typically achieved within 3-6 months. The timeline depends on your current marketing foundation and campaign objectives.',
          },
          {
            question: 'Do you work with facilities outside of these industries?',
            answer: 'We focus exclusively on hospitality, food service, healthcare, and athletics to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
          },
          {
            question: 'What makes your approach different for sports facilities?',
            answer: 'Unlike generic marketing agencies, we understand the unique challenges of sports facility marketing, including seasonal participation, community building, and event promotion. Our strategies are built on athletics-specific insights and proven best practices.',
          },
          {
            question: 'Do you require long-term contracts?',
            answer: 'We offer both monthly and annual plans. While we recommend longer commitments for best results, we understand every facility has different needs and can work with you to find the right arrangement.',
          },
        ],
      },
    },
    metadata: {
      title: 'Sports Marketing Services - Inteligencia',
      description: 'Digital marketing for sports facilities and athletic communities. Grow memberships, fill tournaments, and build engaged communities.',
      keywords: ['sports marketing', 'athletic facility marketing', 'tournament promotion', 'membership growth', 'sports community'],
    },
  },

  main: {
    ...baseConfig,
    industry: 'main',
    name: 'Inteligencia - Multi-Industry Marketing',
    subdomain: 'inteligencia',
    branding: {
      primaryColor: '#002643',
      secondaryColor: '#0093a0',
      accentColor: '#FFD700',
    },
    content: {
      hero: {
        title: 'Intelligent Marketing for Every Industry',
        subtitle: 'Choose your industry and discover specialized marketing solutions designed for your business.',
        backgroundType: 'image',
        backgroundSrc: '/images/main-hero-bg.jpg',
        ctaText: 'Choose Your Industry',
        ctaLink: '#industries',
      },
      services: [],
      team: [],
      testimonials: [],
      pricing: { plans: [] },
      contact: {
        title: 'Ready to Get Started?',
        subtitle: 'Contact us to discuss your industry-specific marketing needs.',
        email: 'info@inteligencia.com',
        phone: '(555) 123-4567',
      },
    },
    metadata: {
      title: 'Inteligencia - Specialized Marketing Solutions',
      description: 'Professional marketing services tailored for hotels, restaurants, healthcare, and sports industries. Choose your industry for specialized solutions.',
      keywords: ['digital marketing', 'industry marketing', 'specialized marketing', 'business growth', 'marketing solutions'],
    },
  },
};