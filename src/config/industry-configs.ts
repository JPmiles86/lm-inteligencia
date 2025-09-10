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
      primaryColor: '#371657',
      secondaryColor: '#f04a9b',
      accentColor: '#176ab2',
    },
    content: {
      hero: {
        title: 'Digital Marketing That Drives Occupancy & Grows RevPAR',
        subtitle: 'Drive direct bookings and reduce OTA dependency with AI-driven Marketing strategies',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        backgroundVideo: 'https://player.vimeo.com/video/1100417251',
        backgroundVideoMobile: 'https://player.vimeo.com/video/1100417904',
        ctaText: 'Book Your Free Consultation',
        ctaLink: '/contact',
        stats: [
          { value: '40%', label: 'Increase in Direct Bookings' },
          { value: '25%', label: 'Reduction in OTA Commissions' },
          { value: '60%', label: 'Better ROI' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      servicesTitle: 'Marketing That Moves The Metrics That Matter',
      servicesSubtitle: 'AI-Driven Strategies for Hotels That Mean Business',
      services: [
        {
          title: 'Hotels Ad Management',
          description: 'Drive direct bookings with targeted campaigns that reach travelers at the perfect moment.',
          keyBenefit: 'Reduce OTA dependency by 35%',
          icon: 'hotel',
          image: '/images/HotelAdsManagement.png',
          learnMoreLink: '/services#google-ads',
        },
        {
          title: 'Meta (Facebook & Instagram) Ads',
          description: 'Showcase your property with visual storytelling that inspires bookings and builds brand loyalty.',
          keyBenefit: 'Turn views into Bookings with Visual Impact',
          icon: 'camera',
          image: '/images/MetaAdvertising.png',
          learnMoreLink: '/services#meta-advertising',
        },
        {
          title: 'Email Marketing & Funnels',
          description: 'Convert inquiries into bookings and guests into repeat customers with automated campaigns.',
          keyBenefit: '40% higher guest lifetime value',
          icon: 'mail',
          image: '/images/EmailMarketing.png',
          learnMoreLink: '/services#email-marketing',
        },
        {
          title: 'Marketing Strategy Consulting',
          description: 'Get expert guidance to optimize your marketing mix and maximize revenue per available room.',
          keyBenefit: 'Increase RevPAR by 25%',
          icon: 'chart-line',
          image: '/images/MarketingStrategy.png',
          learnMoreLink: '/services#strategy-consulting',
        },
        {
          title: 'Event/Launch Campaigns',
          description: 'Fill your property for special events, seasonal promotions, and grand openings with targeted campaigns.',
          keyBenefit: 'Drive 85%+ Occupancy for Events',
          icon: 'calendar',
          image: '/images/EventMarketing.png',
          learnMoreLink: '/services#event-campaigns',
        },
        {
          title: 'OTA Optimization & Demand Generation',
          description: 'Ensure every possible channel generates maximum demand particularly during low seasonal periods',
          keyBenefit: 'Maximize visibility across all booking platforms',
          icon: 'globe',
          image: '/images/OTAOptimization.png',
          learnMoreLink: '/services#strategy-consulting',
        },
        {
          title: 'Restaurant Marketing',
          description: 'Fill every table every night: drive foot traffic and online orders with restaurant marketing that works',
          keyBenefit: 'Increase Restaurant Bookings, Online Orders and ROI',
          icon: 'utensils',
          image: '/images/RestaurantMarketing.png',
          learnMoreLink: '/services#restaurant-marketing',
        },
        // Alternative Channel Marketing and CRO cards removed per client request
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
          quote: 'Laurie helped us build out our online channels, ramping up our initial demand, following this we were able to reduce OTA reliance and implement a Book Direct Strategy that saved us a ton in OTA Commissions. Laurie is great to work with, upbeat, efficient and most importantly, he gets results',
          author: 'Rodney Knotts',
          position: 'Owner',
          company: '40 Acres Farmhouse',
          companyUrl: 'https://www.40acres.co.za/',
          location: 'Magaliesburg, South Africa',
        },
        {
          quote: 'We had a real occupancy issue and needed a lifeline. Laurie built us a website, launched a combination of Hotel Ads and social media campaigns, and optimized our OTA channels. Our occupancy increased by 53% in just two months.',
          author: 'Jason Adelman',
          position: 'Owner',
          company: 'Casa Salita and Suegra',
          companyUrl: 'https://www.sayulitalife.com/salita-6br',
          location: 'Sayulita, Mexico',
        },
        {
          quote: 'We had never run Hotel Ads or Meta campaigns before, and honestly didn\'t know where to start. Laurie came in, set everything up seamlessly, and within weeks we saw a major spike in direct bookings. The Meta ads alone cut our cost-per-booking in half. His strategy just works - efficient, targeted, and totally aligned with our goals.',
          author: 'Stephanie Sitt',
          position: 'Owner',
          company: 'Hotel Amavi',
          companyUrl: 'https://hotelamavi.com/',
          location: 'Jaco, Costa Rica',
        },
      ],
      videoCTA: {
        headline: 'Ready to transform your hospitality business?',
        subtitle: 'Let\'s discuss how AI-powered marketing can revolutionize your hotel\'s performance',
        ctaText: 'Start Your Transformation',
        ctaLink: '/contact',
        trustIndicators: [
          'Free Strategy Consultation',
          'No Long-term Contracts', 
          'Proven Growth Strategies'
        ],
      },
      pricing: {
        plans: [
          {
            name: 'Starter Hospitality',
            price: '$1,500',
            duration: 'per month',
            description: 'Designed for boutique hotels or restaurants looking to boost visibility and drive bookings.',
            features: [
              '1 Paid Channel (Google Ads or Meta Ads)',
              'Up to $5K/month ad spend managed',
              '2 Campaigns per month',
              'Monthly Reporting Dashboard',
              '2 x 30-min Strategy Call / month',
              'Basic Conversion Tracking Setup'
            ],
            ctaText: 'Get Started',
            ctaLink: '/contact',
            suitableFor: 'Independent hotels, B&Bs, Restaurants, or new venues wanting to increase direct bookings or covers.',
          },
          {
            name: 'Growth Hospitality',
            price: '$3,000',
            duration: 'per month',
            description: 'For growing hotels and dining establishments ready to scale and optimize.',
            features: [
              '2 Paid Channels (e.g. Google + Meta)',
              'Up to $20K/month ad spend managed',
              'Funnel & Website Audit (Booking Journey or Menu/Reservation Flow)',
              '4 Campaigns per month (e.g., Midweek Specials, Events, Seasonal Promos)',
              'Bi-weekly 60 min Strategy Calls',
              'Custom Reporting Dashboard',
              'Landing Page UX Consultation (1/month)',
              'Email List Review (Guest Nurture or Promo Campaigns)'
            ],
            recommended: true,
            ctaText: 'Get Started',
            ctaLink: '/contact',
            suitableFor: 'Hotels with 20–100 rooms, fine-dining restaurants, event-focused venues, or multi-location hospitality brands.',
          },
          {
            name: 'Pro+ Hospitality',
            price: '$5,500',
            duration: 'per month+',
            description: 'For luxury or multi-property brands seeking full-funnel revenue growth.',
            features: [
              'Up to 3 Paid Channels (Google, Meta, LinkedIn, Bing, etc.)',
              'Up to $75K/month ad spend managed',
              'Full Funnel Build: from awareness to direct bookings',
              'Weekly Strategy & Performance Calls',
              'Advanced Tracking Setup (GA4, GTM, Booking Pixels, POS Integration)',
              'Creative Direction: Ad Copy + Visual Briefs tailored to your Property',
              'Email Campaigns: Guest Nurture, Offers, Abandon Cart',
              'Dedicated Account Manager',
              'Priority Support & Chat Access'
            ],
            ctaText: 'Get Started',
            ctaLink: '/contact',
            suitableFor: 'Luxury resorts, lifestyle hotel brands, restaurant groups, or hospitality groups with aggressive revenue targets.',
          },
        ],
        addOns: [
          {
            name: 'Landing Page Build (Booking or Promo)',
            price: '$300',
          },
          {
            name: 'Email Funnel Setup (Automated Nurture Sequences)',
            price: '$950',
          },
          {
            name: 'Ad Creative Design',
            price: '$250/ad set',
          },
          {
            name: 'Hospitality Marketing Audit + Strategy (90 min)',
            price: '$399',
          },
        ],
        addOnsTitle: 'Optional Add-Ons (A La Carte)',
      },
      contact: {
        title: 'Ready to Transform Your Hotel\'s Performance?',
        subtitle: 'Get your free hotel marketing audit and discover how to reduce OTA dependency while increasing direct bookings.',
        calendlyText: 'Schedule Your Free Hotel Marketing Consultation',
        email: 'laurie@inteligenciadm.com',
        phone: '+506 6200 2747',
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
            phone: '+506 6200 2747',
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
            answer: 'We focus exclusively on hospitality, healthcare, tech, and sport/media to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
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
      // Services Page Content
      servicesPageContent: {
        hero: {
          title: 'Where Hospitality Meets High-Performance Marketing',
          subtitle: 'Tailored Digital Growth Strategies for Premium Hotels & Resorts'
        }
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
          },
          {
            id: 'alternative-channel-marketing',
            title: 'Alternative Channel Marketing',
            fullDescription: 'Expand your reach beyond the major platforms with targeted campaigns on alternative channels that fit your audience.',
            features: ['Microsoft (Bing Ads)', 'X (Formerly Twitter) Ads', 'Snapchat Ads', 'Niche Platform Campaigns'],
            process: ['Channel analysis & selection', 'Platform setup & optimization', 'Campaign creation & management', 'Cross-channel performance tracking'],
            results: 'Access new audience segments with 20-30% lower competition costs',
            caseStudyLink: '/case-studies#alternative-channels',
            caseStudyText: 'See how boutique hotels found their ideal guests on alternative platforms →',
            icon: '🌐',
            pricing: {
              starter: {
                name: 'Alternative Channels Starter',
                price: '$1,000',
                duration: '/month',
                description: 'Test new channels with focused campaigns',
                features: ['1-2 alternative platform setup', 'Basic campaign management', 'Performance monitoring', 'Channel comparison reports'],
                suitable: 'Small to medium hotels looking to diversify'
              },
              growth: {
                name: 'Alternative Channels Growth',
                price: '$2,200',
                duration: '/month',
                description: 'Multi-platform alternative channel strategy',
                features: ['3-4 platform management', 'Advanced audience targeting', 'Cross-platform optimization', 'Detailed analytics'],
                recommended: true,
                suitable: 'Hotels ready to expand beyond Google/Meta'
              },
              pro: {
                name: 'Alternative Channels Pro+',
                price: '$3,800',
                duration: '/month',
                description: 'Enterprise alternative channel marketing',
                features: ['Full channel diversification', 'Custom platform integrations', 'Advanced attribution', 'Strategic channel consulting'],
                suitable: 'Large hotels, resort chains'
              }
            }
          },
          {
            id: 'conversion-rate-optimization',
            title: 'Conversion Rate Optimization (CRO)',
            fullDescription: 'Turn more clicks into customers with data-driven website and funnel optimization.',
            features: ['Landing Page Optimization', 'A/B Testing', 'User Experience (UX) Enhancements', 'Heatmaps & Behavior Analysis'],
            process: ['Website audit & analysis', 'Conversion funnel mapping', 'Test design & implementation', 'Results analysis & optimization'],
            results: 'Average 25-40% increase in booking conversion rates',
            caseStudyLink: '/case-studies#cro-success',
            caseStudyText: 'Discover how we doubled a resort\'s booking conversion rate →',
            icon: '📊',
            pricing: {
              starter: {
                name: 'CRO Starter',
                price: '$1,200',
                duration: '/month',
                description: 'Essential conversion optimization',
                features: ['Website conversion audit', 'Basic A/B testing', 'Landing page improvements', 'Monthly performance reports'],
                suitable: 'Hotels with existing traffic wanting better conversions'
              },
              growth: {
                name: 'CRO Growth',
                price: '$2,800',
                duration: '/month',
                description: 'Comprehensive conversion optimization',
                features: ['Advanced testing program', 'UX analysis & improvements', 'Heat mapping & user recordings', 'Conversion funnel optimization'],
                recommended: true,
                suitable: 'Hotels focused on maximizing booking rates'
              },
              pro: {
                name: 'CRO Pro+',
                price: '$4,500',
                duration: '/month',
                description: 'Enterprise conversion optimization',
                features: ['Full funnel redesign', 'Personalization engine', 'Advanced analytics', 'Revenue optimization consulting'],
                suitable: 'Large hotels, resort chains with high traffic'
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
          id: 'forty-acres-farmhouse',
          title: '40 Acres Farmhouse Slashes OTA Commissions by 40%',
          industry: 'Hospitality & Lifestyle',
          client: '40 Acres Farmhouse',
          challenge: 'This luxury farmhouse retreat in South Africa was heavily dependent on OTAs, with commission fees eating into profitability. They needed to build direct booking channels while maintaining occupancy rates.',
          solution: 'Implemented a comprehensive digital strategy including Google Hotel Ads, targeted social media campaigns for the local luxury travel market, and a sophisticated email nurture sequence for past guests. Built a "Book Direct" incentive program with exclusive perks.',
          results: [
            {
              metric: 'OTA Commission Savings',
              value: '40%',
              description: 'Reduction in total OTA commission fees'
            },
            {
              metric: 'Direct Bookings',
              value: '+65%',
              description: 'Increase in direct reservation revenue'
            },
            {
              metric: 'Repeat Guest Rate',
              value: '+45%',
              description: 'Growth in returning guest bookings'
            }
          ],
          testimonial: {
            quote: "Laurie helped us build out our online channels, ramping up our initial demand, following this we were able to reduce OTA reliance and implement a Book Direct Strategy that saved us a ton in OTA Commissions. Laurie is great to work with, upbeat, efficient and most importantly, he gets results",
            author: 'Rodney Knotts',
            position: 'Owner',
            company: '40 Acres Farmhouse'
          },
          image: '/images/hospitality/40AcresFarmHouse.jpg',
          tags: ['Boutique Hotels', 'Direct Bookings', 'OTA Optimization', 'South Africa']
        },
        {
          id: 'casa-salita-suegra',
          title: 'Casa Salita Achieves 53% Occupancy Boost in 2 Months',
          industry: 'Hospitality & Lifestyle',
          client: 'Casa Salita and Suegra',
          challenge: 'This boutique property in Sayulita, Mexico had a real occupancy issue and needed a lifeline. Limited online presence and poor visibility across booking platforms were hurting revenue potential.',
          solution: 'Built a new website, launched a combination of Google Hotel Ads and social media campaigns, and optimized their OTA channels. Created targeted campaigns for the Sayulita luxury vacation rental market.',
          results: [
            {
              metric: 'Occupancy Increase',
              value: '+53%',
              description: 'Occupancy improvement in just two months'
            },
            {
              metric: 'Online Visibility',
              value: '+240%',
              description: 'Increase in search impressions and clicks'
            },
            {
              metric: 'Booking Inquiries',
              value: '+180%',
              description: 'Growth in qualified booking requests'
            }
          ],
          testimonial: {
            quote: "We had a real occupancy issue and needed a lifeline. Laurie built us a website, launched a combination of Hotel Ads and social media campaigns, and optimized our OTA channels. Our occupancy increased by 53% in just two months.",
            author: 'Jason Adelman',
            position: 'Owner',
            company: 'Casa Salita and Suegra'
          },
          image: '/images/hospitality/CasaSalitaandSuegra.jpg',
          tags: ['Vacation Rentals', 'Google Hotel Ads', 'Social Media', 'Mexico']
        },
        {
          id: 'hotel-amavi',
          title: 'Hotel Amavi Cuts Cost-per-Booking in Half with Meta Ads',
          industry: 'Hospitality & Lifestyle',
          client: 'Hotel Amavi',
          challenge: 'Hotel Amavi in Jaco, Costa Rica had never run Hotel Ads or Meta campaigns before and didn\'t know where to start. They needed efficient, targeted campaigns aligned with their goals.',
          solution: 'Set up comprehensive Google Hotel Ads and Meta advertising campaigns seamlessly. Developed targeted strategies focused on the Costa Rica luxury hotel market with emphasis on direct bookings and cost efficiency.',
          results: [
            {
              metric: 'Cost-per-Booking',
              value: '-50%',
              description: 'Reduction in cost per booking through Meta ads'
            },
            {
              metric: 'Direct Bookings',
              value: '+85%',
              description: 'Major spike in direct booking volume'
            },
            {
              metric: 'Campaign Efficiency',
              value: '+120%',
              description: 'Improvement in overall campaign performance'
            }
          ],
          testimonial: {
            quote: "We had never run Hotel Ads or Meta campaigns before, and honestly didn't know where to start. Laurie came in, set everything up seamlessly, and within weeks we saw a major spike in direct bookings. The Meta ads alone cut our cost-per-booking in half. His strategy just works - efficient, targeted, and totally aligned with our goals.",
            author: 'Stephanie Sitt',
            position: 'Owner',
            company: 'Hotel Amavi'
          },
          image: '/images/hospitality/hotelamavi.jpeg',
          tags: ['Boutique Hotels', 'Meta Advertising', 'Google Hotel Ads', 'Costa Rica']
        }
      ],
    },
    metadata: {
      title: 'Hotel Marketing Services - Inteligencia',
      description: 'Professional digital marketing services for hotels and hospitality businesses. Increase direct bookings with Google Hotel Ads, social media, and email marketing.',
      keywords: ['hotel marketing', 'hospitality marketing', 'google hotel ads', 'direct bookings', 'hotel social media'],
    },
  },

  // foodservice section commented out - merged into hospitality
  /*
  foodservice: {
    ...baseConfig,
    industry: 'foodservice',
    name: 'Restaurant & Food Service Marketing',
    subdomain: 'restaurants',
    branding: {
      primaryColor: '#371657',
      secondaryColor: '#f04a9b',
      accentColor: '#176ab2',
    },
    content: {
      hero: {
        title: 'Fill Every Table, Every Night',
        subtitle: 'Drive foot traffic and online orders with restaurant marketing that actually works',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        backgroundVideo: 'https://player.vimeo.com/video/1100417251',
        backgroundVideoMobile: 'https://player.vimeo.com/video/1100417904',
        ctaText: 'Get Free Restaurant Marketing Analysis',
        ctaLink: '/contact',
        stats: [
          { value: '65%', label: 'Increase in Reservations' },
          { value: '80%', label: 'Growth in Online Orders' },
          { value: '3.5x', label: 'Return on Ad Spend' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      servicesTitle: 'Marketing That Fills Every Table',
      servicesSubtitle: 'Data-Driven Restaurant Marketing That Delivers Results',
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
        email: 'laurie@inteligenciadm.com',
        phone: '+506 6200 2747',
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
            phone: '+506 6200 2747',
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
            answer: 'We focus exclusively on hospitality, healthcare, tech, and sport/media to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
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
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
          tags: ['Local SEO', 'Social Media', 'Food Photography', 'Delivery Optimization']
        },
        {
          id: 'taco-heaven-chain',
          title: 'Taco Heaven Expands from 2 to 12 Locations',
          industry: 'Restaurants & Food Service',
          client: 'Taco Heaven Fast Casual Chain',
          challenge: 'Family-owned taco shop wanted to expand but lacked brand consistency and marketing systems. Each location operated independently with different menus and pricing.',
          solution: 'Developed unified brand identity, implemented centralized social media management, created location-based Google Ads campaigns, and launched a mobile app with loyalty program.',
          results: [
            {
              metric: 'New Locations',
              value: '10',
              description: 'Successful franchise expansions in 18 months'
            },
            {
              metric: 'Revenue Per Location',
              value: '+85%',
              description: 'Average revenue increase across all locations'
            },
            {
              metric: 'App Downloads',
              value: '45,000+',
              description: 'Active users on loyalty app'
            }
          ],
          testimonial: {
            quote: "Inteligencia didn't just help us market better - they helped us build a scalable brand. We went from a local favorite to a regional powerhouse.",
            author: 'Carlos Martinez',
            position: 'Founder & CEO',
            company: 'Taco Heaven'
          },
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
          tags: ['Franchise Marketing', 'Brand Development', 'Mobile Apps', 'Multi-Location']
        }
      ],
    },
    metadata: {
      title: 'Restaurant Marketing Services - Inteligencia',
      description: 'Digital marketing services for restaurants and food service businesses. Increase customers with local SEO, social media, and online ordering optimization.',
      keywords: ['restaurant marketing', 'food service marketing', 'local seo', 'google my business', 'online ordering'],
    },
  },
  */

  healthcare: {
    ...baseConfig,
    industry: 'healthcare',
    name: 'Health & Wellness Marketing',
    subdomain: 'health',
    branding: {
      primaryColor: '#371657',
      secondaryColor: '#f04a9b',
      accentColor: '#176ab2',
    },
    content: {
      hero: {
        title: 'Grow Your Practice with New Quality Patients',
        subtitle: 'Attract new patients with proven strategies at a competitive cost per acquisition',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        backgroundVideo: 'https://player.vimeo.com/video/1100417251',
        backgroundVideoMobile: 'https://player.vimeo.com/video/1100417904',
        ctaText: 'Schedule Free Consultation',
        ctaLink: '/contact',
        stats: [
          { value: '$ 13.7M', label: 'Google Ads Spend to Date' },
          { value: '55', label: 'Average New Leads per Month per Clinic' },
          { value: '$79', label: 'Average Cost Per Acquisition (CPA)' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      servicesTitle: 'Grow your Brand and Online Presence',
      servicesSubtitle: 'Tailored Digital Campaigns Designed To Drive Steady Growth For your Brand',
      services: [
        {
          title: 'Healthcare Patient Acquisition',
          description: 'Attract quality patients actively searching for health and wellness services with proven digital marketing strategies.',
          keyBenefit: '$79 Average Cost per New Patient Acquisition',
          icon: 'shield-check',
          image: '/images/HealthCare Home Images/patientacquisitioncampaigns.png',
          learnMoreLink: '/health/services#patient-acquisition',
        },
        {
          title: 'Dental Practice Marketing',
          description: 'Proven digital marketing strategies for dental practices to attract new patients',
          keyBenefit: 'Attract new quality patients',
          icon: 'tooth',
          image: '/images/HealthCare Home Images/dentalpracticemarketing.jpg',
          learnMoreLink: '/health/services#dental-marketing',
        },
        {
          title: 'Wellness & Retreat Marketing',
          description: 'Build your brand and fill your retreats with targeted campaigns that resonate with wellness consumers.',
          keyBenefit: 'Increase Awareness & Demand for your Retreats',
          icon: 'heart',
          image: '/images/HealthCare Home Images/wellnessretreatsmarketing.png',
          learnMoreLink: '/health/services#wellness-marketing',
        },
        {
          title: 'Fitness & Gym Marketing',
          description: 'Drive membership growth and build a loyal fitness community with performance-driven marketing strategies.',
          keyBenefit: 'Increase your monthly sign-ups',
          icon: 'activity',
          image: '/images/HealthCare Home Images/FitnessGymMarketing.png',
          learnMoreLink: '/health/services#fitness-marketing',
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
      videoCTA: {
        headline: 'Ready to Generate Demand and Grow your Brand',
        subtitle: 'Let\'s discuss how we can help you achieve your goals with our proven strategies and industry expertise.',
        ctaText: 'Schedule Free Consultation',
        ctaLink: '/contact',
        trustIndicators: [
          'Free Strategy Consultation',
          'No Long-term Contracts', 
          'Proven Growth Strategies'
        ],
      },
      pricing: {
        plans: [
          {
            name: 'Starter Health',
            price: '$1,500',
            duration: 'per month',
            description: 'Great for solo practitioners or small practices',
            features: [
              '1 Paid Channel (Google Ads or Meta Ads)',
              'Up to $5K/month ad spend managed',
              '2 Campaigns per month',
              'Monthly Reporting Dashboard',
              '2 x 30-min Strategy Call / month',
              'Basic Conversion Tracking Setup'
            ],
            ctaText: 'Get Started',
            ctaLink: '/contact',
            suitableFor: 'Solo practitioners, small wellness centers, boutique fitness studios, or new health practices.',
          },
          {
            name: 'Growth Health',
            price: '$3,000',
            duration: 'per month',
            description: 'Ideal for multi-practitioner clinics or established wellness centers',
            features: [
              '2 Paid Channels (e.g. Google + Meta)',
              'Up to $20K/month ad spend managed',
              'Practice Website & Funnel Audit',
              '4 Campaigns per month (e.g., Service Promos, Seasonal Wellness)',
              'Bi-weekly 60 min Strategy Calls',
              'Custom Reporting Dashboard',
              'Landing Page UX Consultation (1/month)',
              'Patient Email Nurture Sequences'
            ],
            recommended: true,
            ctaText: 'Most Popular',
            ctaLink: '/contact',
            suitableFor: 'Multi-practitioner clinics, dental groups, wellness centers, or growing fitness facilities.',
          },
          {
            name: 'Pro+ Health',
            price: '$5,500',
            duration: 'per month+',
            description: 'Perfect for large practices or healthcare organizations',
            features: [
              'Up to 3 Paid Channels (Google, Meta, LinkedIn, etc.)',
              'Up to $75K/month ad spend managed',
              'Full Patient Journey Funnel Build',
              'Weekly Strategy & Performance Calls',
              'Advanced Tracking Setup (GA4, GTM, Patient Journey)',
              'Creative Direction: Healthcare-focused Ad Copy & Visuals',
              'Patient Email Campaigns: Awareness, Education, Demand Generation',
              'Dedicated Account Manager',
              'Priority Support & Chat Access'
            ],
            ctaText: 'Contact Us',
            ctaLink: '/contact',
            suitableFor: 'Large medical groups, hospital systems, multi-location wellness brands, or healthcare organizations with aggressive growth targets.',
          },
        ],
        addOns: [
          {
            name: 'HIPAA Compliance Audit',
            price: '$499',
          },
          {
            name: 'Patient Education Videos',
            price: '$850/video',
          },
          {
            name: 'Automated Appointment Reminders',
            price: '$299/month',
          },
          {
            name: 'Health Content Package',
            price: '$750/month',
          },
        ],
        addOnsTitle: 'Optional Add-Ons (A La Carte)',
      },
      contact: {
        title: 'Ready to Grow Your Practice?',
        subtitle: 'Get your free practice growth analysis and discover how to attract quality patients with HIPAA-compliant marketing.',
        calendlyText: 'Schedule Your Free Practice Growth Consultation',
        email: 'laurie@inteligenciadm.com',
        phone: '+506 6200 2747',
        address: '123 Business Ave, Suite 100, Miami, FL 33101',
        // CONTACT PAGE EXTENDED CONTENT - Business types, budgets, timelines, office hours, FAQs
        businessTypes: ['General Dentistry', 'Dental Specialty', 'Medical Practice', 'Wellness Center', 'Fitness Facility', 'Health Spa/Retreat', 'Urgent Care', 'Healthcare Group', 'Other'],
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
            phone: '+506 6200 2747',
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
            answer: 'We focus exclusively on hospitality, healthcare, tech, and sport/media to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
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
      // Services Page Content
      servicesPageContent: {
        hero: {
          title: 'Where Health & Wellness Meets High-Performance Marketing',
          subtitle: 'Tailored Digital Growth Strategies for Healthcare Providers & Wellness Brands'
        }
      },
      // SERVICES PAGE EXTENDED CONTENT - Comprehensive services with integrated pricing
      servicesPage: {
        // Detailed services with features, pricing, and case study links
        services: [
          {
            id: 'patient-acquisition',
            title: 'Patient Acquisition Campaigns',
            fullDescription: 'Attract quality patients actively searching for health and wellness services with HIPAA-compliant digital marketing campaigns designed to build trust and drive appointments.',
            features: ['HIPAA-compliant Google Ads', 'Healthcare-focused Meta campaigns', 'Local search optimization', 'Patient journey mapping', 'Conversion tracking setup', 'Appointment scheduling integration'],
            process: ['Patient persona development', 'Campaign strategy creation', 'Ad creative development', 'Performance optimization'],
            results: 'Average 120 new patients per month with 3x ROI',
            caseStudyLink: '/case-studies#smile-dental-practice',
            caseStudyText: 'See how Smile Dental acquired 250% more patients →',
            icon: '🏥',
            pricing: {
              starter: {
                name: 'Patient Acquisition Starter',
                price: '$1,500',
                duration: '/month',
                description: 'Essential patient growth for small practices',
                features: ['Google Ads setup & management', 'Basic patient targeting', 'Monthly performance reports', 'HIPAA compliance'],
                suitable: 'Solo practitioners, small clinics'
              },
              growth: {
                name: 'Patient Acquisition Growth',
                price: '$3,000',
                duration: '/month',
                description: 'Comprehensive patient acquisition strategy',
                features: ['Multi-channel campaigns', 'Advanced patient targeting', 'Landing page optimization', 'Call tracking & recording'],
                recommended: true,
                suitable: 'Growing practices, multi-provider clinics'
              },
              pro: {
                name: 'Patient Acquisition Pro+',
                price: '$5,500',
                duration: '/month',
                description: 'Enterprise patient acquisition solution',
                features: ['Full-funnel patient journey', 'Custom integrations', 'Dedicated account team', 'Strategic consulting'],
                suitable: 'Large practices, healthcare organizations'
              }
            }
          },
          {
            id: 'dental-marketing',
            title: 'Dental Practice Marketing',
            fullDescription: 'Specialized marketing strategies for dental practices to attract high-value patients, increase case acceptance, and build a thriving practice with consistent new patient flow.',
            features: ['Cosmetic dentistry campaigns', 'Insurance patient targeting', 'Treatment-specific marketing', 'Before/after showcase ads', 'Referral program development', 'Case acceptance optimization'],
            process: ['Practice analysis', 'Service line optimization', 'Campaign development', 'ROI tracking'],
            results: 'Fill your schedule with 150+ ideal patients monthly',
            caseStudyLink: '/case-studies#smile-dental-practice',
            caseStudyText: 'Discover how we helped expand to 5 locations →',
            icon: '🦷',
            pricing: {
              starter: {
                name: 'Dental Marketing Starter',
                price: '$1,200',
                duration: '/month',
                description: 'Essential dental practice marketing',
                features: ['Local dental SEO', 'Google My Business optimization', 'Review management', 'Basic social media'],
                suitable: 'Single dentist practices'
              },
              growth: {
                name: 'Dental Marketing Growth',
                price: '$2,800',
                duration: '/month',
                description: 'Advanced dental practice growth',
                features: ['Multi-service campaigns', 'Video testimonials', 'Email marketing automation', 'Treatment financing promotion'],
                recommended: true,
                suitable: 'Multi-dentist practices, specialists'
              },
              pro: {
                name: 'Dental Marketing Pro+',
                price: '$4,500',
                duration: '/month',
                description: 'Premium dental marketing solutions',
                features: ['Full practice marketing', 'Brand development', 'Multi-location management', 'Executive advisory'],
                suitable: 'Dental groups, DSOs'
              }
            }
          },
          {
            id: 'wellness-marketing',
            title: 'Wellness & Retreat Marketing',
            fullDescription: 'Build your wellness brand and fill your retreats, workshops, and programs with targeted campaigns that resonate with health-conscious consumers seeking transformation.',
            features: ['Retreat promotion campaigns', 'Wellness influencer partnerships', 'Mindfulness audience targeting', 'Program launch strategies', 'Community building', 'Holistic SEO optimization'],
            process: ['Brand positioning', 'Audience development', 'Content strategy', 'Community engagement'],
            results: 'Achieve 90%+ retreat occupancy and waitlists',
            caseStudyLink: '/case-studies#wellness-medical-center',
            caseStudyText: 'Read how we doubled their patient base →',
            icon: '🧘',
            pricing: {
              starter: {
                name: 'Wellness Marketing Starter',
                price: '$1,000',
                duration: '/month',
                description: 'Basic wellness brand building',
                features: ['Social media presence', 'Email list building', 'Basic content marketing', 'Event promotion'],
                suitable: 'Solo practitioners, small studios'
              },
              growth: {
                name: 'Wellness Marketing Growth',
                price: '$2,500',
                duration: '/month',
                description: 'Comprehensive wellness marketing',
                features: ['Retreat filling campaigns', 'Influencer partnerships', 'Video content creation', 'Community management'],
                recommended: true,
                suitable: 'Wellness centers, retreat hosts'
              },
              pro: {
                name: 'Wellness Marketing Pro+',
                price: '$4,000',
                duration: '/month',
                description: 'Premium wellness brand development',
                features: ['Full brand strategy', 'Multi-channel campaigns', 'Partnership development', 'Expansion consulting'],
                suitable: 'Wellness brands, retreat centers'
              }
            }
          },
          {
            id: 'fitness-marketing',
            title: 'Fitness & Gym Marketing',
            fullDescription: 'Drive membership growth and build a loyal fitness community with performance-driven marketing strategies that get results both online and in your facility.',
            features: ['Membership acquisition campaigns', 'Class and program promotion', 'Retention email sequences', 'Fitness challenge marketing', 'Personal training promotion', 'Community event marketing'],
            process: ['Facility assessment', 'Member journey mapping', 'Campaign execution', 'Retention optimization'],
            results: 'Triple your monthly sign-ups and improve retention by 40%',
            caseStudyLink: '/case-studies#fitness-first-gym',
            caseStudyText: 'See how Fitness First tripled revenue →',
            icon: '💪',
            pricing: {
              starter: {
                name: 'Fitness Marketing Starter',
                price: '$1,200',
                duration: '/month',
                description: 'Essential gym marketing package',
                features: ['Local fitness SEO', 'Social media management', 'New member campaigns', 'Basic email marketing'],
                suitable: 'Boutique studios, small gyms'
              },
              growth: {
                name: 'Fitness Marketing Growth',
                price: '$2,400',
                duration: '/month',
                description: 'Comprehensive fitness marketing',
                features: ['Multi-channel acquisition', 'Retention programs', 'Challenge campaigns', 'Influencer partnerships'],
                recommended: true,
                suitable: 'Growing gyms, fitness studios'
              },
              pro: {
                name: 'Fitness Marketing Pro+',
                price: '$3,800',
                duration: '/month',
                description: 'Enterprise fitness marketing',
                features: ['Full marketing management', 'App integration', 'Franchise support', 'Corporate wellness programs'],
                suitable: 'Gym chains, fitness franchises'
              }
            }
          },
          {
            id: 'reputation-management',
            title: 'Healthcare Reputation Management',
            fullDescription: 'Build trust and credibility with a 5-star online reputation. Our comprehensive reputation management ensures your practice shines across all review platforms.',
            features: ['Review generation automation', 'Negative review mitigation', 'Platform monitoring', 'Patient feedback systems', 'Provider profile optimization', 'Testimonial video production'],
            process: ['Reputation audit', 'Review strategy development', 'Automation setup', 'Ongoing monitoring'],
            results: 'Achieve 4.8+ star average rating across all platforms',
            caseStudyLink: '/case-studies#smile-dental-practice',
            caseStudyText: 'Learn how we built their 5-star reputation →',
            icon: '⭐',
            pricing: {
              starter: {
                name: 'Reputation Starter',
                price: '$600',
                duration: '/month',
                description: 'Basic reputation monitoring',
                features: ['Review monitoring', 'Response templates', 'Monthly reports', 'Basic automation'],
                suitable: 'Small practices'
              },
              growth: {
                name: 'Reputation Growth',
                price: '$1,200',
                duration: '/month',
                description: 'Active reputation management',
                features: ['Automated review requests', 'Multi-platform management', 'Video testimonials', 'Crisis management'],
                recommended: true,
                suitable: 'Most healthcare providers'
              },
              pro: {
                name: 'Reputation Pro+',
                price: '$2,200',
                duration: '/month',
                description: 'Enterprise reputation solutions',
                features: ['Full reputation management', 'Provider profiles', 'PR integration', 'Executive monitoring'],
                suitable: 'Large practices, hospitals'
              }
            }
          },
          {
            id: 'content-marketing',
            title: 'Healthcare Content Marketing',
            fullDescription: 'Educate and engage patients with valuable health content that positions you as the trusted expert while driving organic traffic and patient conversions.',
            features: ['Medical blog writing', 'Patient education videos', 'Infographic creation', 'Email newsletters', 'Social media content', 'SEO optimization'],
            process: ['Content strategy development', 'Editorial calendar creation', 'Content production', 'Performance tracking'],
            results: 'Become the go-to health authority with 500% traffic growth',
            caseStudyLink: '/case-studies#wellness-medical-center',
            caseStudyText: 'See how content marketing transformed their practice →',
            icon: '📚',
            pricing: {
              starter: {
                name: 'Content Marketing Starter',
                price: '$800',
                duration: '/month',
                description: 'Essential content package',
                features: ['4 blog posts/month', 'Social media posts', 'Email newsletter', 'Basic SEO'],
                suitable: 'Small practices'
              },
              growth: {
                name: 'Content Marketing Growth',
                price: '$1,800',
                duration: '/month',
                description: 'Comprehensive content strategy',
                features: ['8 blog posts/month', 'Video content', 'Infographics', 'Advanced SEO'],
                recommended: true,
                suitable: 'Growing practices'
              },
              pro: {
                name: 'Content Marketing Pro+',
                price: '$3,200',
                duration: '/month',
                description: 'Premium content solutions',
                features: ['Unlimited content', 'Multi-format production', 'Thought leadership', 'PR integration'],
                suitable: 'Large healthcare organizations'
              }
            }
          },
          {
            id: 'telehealth-marketing',
            title: 'Telehealth & Digital Solutions',
            fullDescription: 'Expand your reach with virtual care marketing and digital patient engagement strategies that connect you with patients anywhere, anytime.',
            features: ['Telehealth platform promotion', 'Virtual visit campaigns', 'App download campaigns', 'Patient portal adoption', 'Digital health SEO', 'Remote patient acquisition'],
            process: ['Digital assessment', 'Platform optimization', 'Campaign launch', 'Adoption tracking'],
            results: 'Reach patients anywhere with 200% virtual visit growth',
            caseStudyLink: '/case-studies#wellness-medical-center',
            caseStudyText: 'Discover their digital transformation success →',
            icon: '💻',
            pricing: {
              starter: {
                name: 'Telehealth Marketing Starter',
                price: '$1,000',
                duration: '/month',
                description: 'Basic virtual care marketing',
                features: ['Platform promotion', 'Basic campaigns', 'Patient education', 'Adoption tracking'],
                suitable: 'New telehealth providers'
              },
              growth: {
                name: 'Telehealth Marketing Growth',
                price: '$2,200',
                duration: '/month',
                description: 'Advanced digital health marketing',
                features: ['Multi-channel campaigns', 'App marketing', 'Patient onboarding', 'Analytics dashboard'],
                recommended: true,
                suitable: 'Established virtual practices'
              },
              pro: {
                name: 'Telehealth Marketing Pro+',
                price: '$3,800',
                duration: '/month',
                description: 'Enterprise digital solutions',
                features: ['Full digital strategy', 'Custom integrations', 'AI chatbot setup', 'Advanced analytics'],
                suitable: 'Digital health companies'
              }
            }
          }
        ],
        // Step-by-step marketing process displayed on Services page
        marketingProcess: [
          {
            step: '01',
            title: 'Discovery & Analysis',
            description: 'Deep dive into your practice, services, and target patients to identify growth opportunities and challenges.',
            icon: '🔍',
          },
          {
            step: '02', 
            title: 'Strategy Development',
            description: 'Create a comprehensive healthcare marketing strategy focused on patient acquisition and practice growth.',
            icon: '📋',
          },
          {
            step: '03',
            title: 'Campaign Implementation',
            description: 'Execute HIPAA-compliant campaigns across multiple channels to reach patients where they are.',
            icon: '🚀',
          },
          {
            step: '04',
            title: 'Optimization & Growth',
            description: 'Continuously optimize campaigns based on patient data to maximize ROI and practice growth.',
            icon: '📈',
          },
        ],
        // Core marketing capabilities offered
        coreCapabilities: [
          {
            title: 'Paid Advertising',
            description: 'Google Ads, Meta Ads, and healthcare-specific advertising platforms',
            features: ['Search Marketing', 'Social Media Advertising', 'Display & Video Campaigns', 'Retargeting Strategies'],
            icon: '🎯',
          },
          {
            title: 'Patient Experience',
            description: 'Comprehensive patient journey optimization',
            features: ['Online Scheduling Integration', 'Patient Portal Marketing', 'Appointment Reminders', 'Follow-up Automation'],
            icon: '🌱',
          },
          {
            title: 'Content & Education',
            description: 'Patient education and thought leadership',
            features: ['Medical Content Creation', 'Video Production', 'Patient Resources', 'Health Blog Management'],
            icon: '🔄',
          },
          {
            title: 'Analytics & Compliance',
            description: 'HIPAA-compliant tracking and reporting',
            features: ['Patient Analytics', 'ROI Tracking', 'Compliance Monitoring', 'Performance Dashboards'],
            icon: '📊',
          },
        ],
        // Industry-specific benefits
        industryBenefits: [
          'Attract 120+ new patients monthly',
          'Achieve 4.8+ star reputation',
          'Increase patient lifetime value by 40%',
          'Full HIPAA compliance guaranteed',
        ],
      },
      // CASE STUDIES - Success stories for this industry
      caseStudies: [
        {
          id: 'mountain-wellness-retreat',
          title: 'Mountain Wellness Retreat Achieves 95% Occupancy',
          industry: 'Health & Wellness',
          client: 'Mountain Wellness Retreat',
          challenge: 'Luxury wellness retreat struggled to fill programs despite exceptional facilities and services. Limited online presence and difficulty reaching health-conscious consumers seeking transformational experiences.',
          solution: 'Developed comprehensive digital strategy targeting wellness enthusiasts through Instagram and Facebook, created compelling video content showcasing retreat experiences, implemented influencer partnerships, and optimized for health and wellness search terms.',
          results: [
            {
              metric: 'Retreat Occupancy',
              value: '95%',
              description: 'Average occupancy rate across all programs'
            },
            {
              metric: 'Booking Lead Time',
              value: '3 months',
              description: 'Advance booking waitlists for programs'
            },
            {
              metric: 'Revenue Growth',
              value: '+180%',
              description: 'Year-over-year revenue increase'
            }
          ],
          testimonial: {
            quote: "Inteligencia understood our mission of transformational wellness and helped us reach people genuinely seeking life change. Our retreats are now consistently full with passionate participants.",
            author: 'Dr. Amanda Foster',
            position: 'Founder & Wellness Director',
            company: 'Mountain Wellness Retreat'
          },
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          tags: ['Wellness Retreats', 'Instagram Marketing', 'Influencer Partnerships', 'Transformational Wellness']
        },
        {
          id: 'elite-fitness-studio',
          title: 'Elite Fitness Studio Triples Membership in 8 Months',
          industry: 'Health & Wellness',
          client: 'Elite Fitness Studio',
          challenge: 'High-end boutique fitness studio faced intense competition from big box gyms and needed to justify premium pricing while building a loyal community of members.',
          solution: 'Created community-focused marketing campaigns emphasizing personal transformation and small-group training benefits. Launched challenge campaigns, developed member success story content, and implemented retention programs.',
          results: [
            {
              metric: 'Membership Growth',
              value: '+300%',
              description: 'Total active members in 8 months'
            },
            {
              metric: 'Retention Rate',
              value: '89%',
              description: 'Member retention improvement'
            },
            {
              metric: 'Class Utilization',
              value: '92%',
              description: 'Average class capacity filled'
            }
          ],
          testimonial: {
            quote: "They helped us build a true fitness community, not just a gym. Our members are now our biggest advocates, and we have waitlists for most of our classes.",
            author: 'Marcus Thompson',
            position: 'Owner & Head Trainer',
            company: 'Elite Fitness Studio'
          },
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          tags: ['Fitness Marketing', 'Community Building', 'Boutique Gym', 'Member Retention']
        },
        {
          id: 'mind-body-clinic',
          title: 'Mind Body Clinic: 150 New Patients Monthly',
          industry: 'Health & Wellness',
          client: 'Mind Body Clinic',
          challenge: 'Integrative healthcare clinic offering mental health, nutrition counseling, and holistic therapies struggled with patient acquisition and educating the market about their comprehensive approach.',
          solution: 'Implemented HIPAA-compliant digital strategy with educational content marketing, targeted Google Ads for specific conditions, developed patient journey automation, and created trust-building testimonial campaigns.',
          results: [
            {
              metric: 'New Patients',
              value: '150+',
              description: 'Monthly new patient acquisitions'
            },
            {
              metric: 'Online Bookings',
              value: '78%',
              description: 'Patients booking appointments online'
            },
            {
              metric: 'Treatment Acceptance',
              value: '+65%',
              description: 'Increase in comprehensive treatment plan acceptance'
            }
          ],
          testimonial: {
            quote: "They understood both our HIPAA requirements and our holistic approach. Now we're helping more people than ever achieve true mind-body wellness.",
            author: 'Dr. Jennifer Chen',
            position: 'Practice Owner',
            company: 'Mind Body Clinic'
          },
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
          tags: ['Mental Health Marketing', 'HIPAA Compliant', 'Holistic Healthcare', 'Patient Education']
        }
      ],
    },
    metadata: {
      title: 'Health & Wellness Marketing Services - Inteligencia',
      description: 'HIPAA-compliant digital marketing for healthcare practices, dental clinics, wellness centers, and fitness facilities. Attract new patients and members with ethical marketing strategies.',
      keywords: ['health marketing', 'wellness marketing', 'dental marketing', 'fitness marketing', 'healthcare marketing', 'hipaa compliant', 'patient acquisition'],
    },
  },

  athletics: {
    ...baseConfig,
    industry: 'athletics',
    name: 'Sport, Media & Events Marketing',
    subdomain: 'sports',
    branding: {
      primaryColor: '#371657',
      secondaryColor: '#f04a9b',
      accentColor: '#176ab2',
    },
    content: {
      hero: {
        title: 'Fill Your Courts, Grow Your Community',
        subtitle: 'Drive membership growth and tournament participation with sports marketing expertise',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        backgroundVideo: 'https://player.vimeo.com/video/1100417251',
        backgroundVideoMobile: 'https://player.vimeo.com/video/1100417904',
        ctaText: 'Get Free Facility Growth Plan',
        ctaLink: '/contact',
        stats: [
          { value: '200%', label: 'Tournament Participation Growth' },
          { value: '85%', label: 'Facility Utilization Rate' },
          { value: '300+', label: 'New Members This Year' },
        ],
      },
      // HOMEPAGE - Brief overview content only (hooks to drive to Services page)
      servicesTitle: 'Marketing That Fills Your Facilities',
      servicesSubtitle: 'Strategic Sports Marketing That Drives Community Growth',
      services: [
        {
          title: 'Sports Facility Marketing',
          description: 'Fill courts, fields, and facilities with targeted campaigns that attract active participants.',
          keyBenefit: 'Average 85% facility utilization',
          icon: 'building',
          learnMoreLink: '/sports/services#facility-marketing',
        },
        {
          title: 'Tournament & Event Promotion',
          description: 'Fill every tournament bracket and maximize event attendance with targeted marketing.',
          keyBenefit: 'Average 200% increase in participation',
          icon: 'trophy',
          learnMoreLink: '/sports/services#tournament-promotion',
        },
        {
          title: 'Media & Content Distribution',
          description: 'Amplify your sports brand with professional content creation and multi-channel distribution.',
          keyBenefit: '5x increase in media reach',
          icon: 'video',
          learnMoreLink: '/sports/services#media-distribution',
        },
        {
          title: 'Sponsorship & Partnership',
          description: 'Attract and retain valuable sponsors with data-driven partnership marketing strategies.',
          keyBenefit: '40% increase in sponsorship revenue',
          icon: 'handshake',
          learnMoreLink: '/sports/services#sponsorship',
        },
        {
          title: 'Pickleball & Niche Sports',
          description: 'Specialized marketing for emerging sports communities and niche athletic activities.',
          keyBenefit: 'Build 1,000+ member communities',
          icon: 'target',
          learnMoreLink: '/sports/services#niche-sports',
        },
        {
          title: 'Digital Ticketing & Sales',
          description: 'Maximize ticket sales and event revenue with integrated digital sales platforms.',
          keyBenefit: '60% increase in advance sales',
          icon: 'ticket',
          learnMoreLink: '/sports/services#ticketing',
        },
        {
          title: 'Brand & Athlete Marketing',
          description: 'Build powerful personal brands for athletes and sports organizations.',
          keyBenefit: '10x social media growth',
          icon: 'star',
          learnMoreLink: '/sports/services#athlete-branding',
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
            name: 'Starter Sports',
            price: '$1,500',
            duration: 'per month',
            description: 'Perfect for single-court facilities or small recreational centers',
            features: [
              '1 Paid Channel (Google Ads or Meta Ads)',
              'Up to $5K/month ad spend managed',
              'Basic event promotion',
              'Monthly performance reports',
              '2 x 30-min Strategy Calls / month',
              'Social media content calendar'
            ],
            ctaText: 'Get Started',
            ctaLink: '/contact',
            suitableFor: 'Small facilities, local sports clubs, independent gyms',
          },
          {
            name: 'Growth Sports',
            price: '$3,000',
            duration: 'per month',
            description: 'Great for multi-court facilities with tournaments and events',
            features: [
              '2 Paid Channels (e.g. Google + Meta)',
              'Up to $20K/month ad spend managed',
              'Tournament promotion system',
              'Media content creation (4 posts/week)',
              'Bi-weekly 60 min Strategy Calls',
              'Sponsorship deck templates',
              'Email marketing automation',
              'Event ticketing integration'
            ],
            recommended: true,
            ctaText: 'Most Popular',
            ctaLink: '/contact',
            suitableFor: 'Multi-court facilities, sports complexes, regional tournaments',
          },
          {
            name: 'Pro+ Sports',
            price: '$5,500',
            duration: 'per month+',
            description: 'Ideal for major recreational complexes or sports facilities',
            features: [
              'Up to 3 Paid Channels',
              'Up to $75K/month ad spend managed',
              'Full media production team',
              'Sponsorship acquisition support',
              'Weekly Strategy & Performance Calls',
              'Athlete brand development',
              'Custom mobile app integration',
              'Dedicated Account Manager',
              'Priority Support & Chat Access'
            ],
            ctaText: 'Contact Us',
            ctaLink: '/contact',
            suitableFor: 'Major sports complexes, pro facilities, sports franchises',
          },
        ],
        addOns: [
          {
            name: 'Event Photography/Video',
            price: '$1,200/event',
          },
          {
            name: 'Sponsorship Deck Design',
            price: '$800',
          },
          {
            name: 'Live Social Media Coverage',
            price: '$500/day',
          },
          {
            name: 'Athlete Brand Audit',
            price: '$699',
          },
        ],
        addOnsTitle: 'Optional Add-Ons (A La Carte)',
      },
      contact: {
        title: 'Ready to Build Your Sports Community?',
        subtitle: 'Get your free facility growth plan and learn how to maximize membership and tournament participation.',
        calendlyText: 'Schedule Your Free Facility Growth Consultation',
        email: 'laurie@inteligenciadm.com',
        phone: '+506 6200 2747',
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
            phone: '+506 6200 2747',
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
            answer: 'We focus exclusively on hospitality, healthcare, tech, and sport/media to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
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
      // CASE STUDIES - Success stories for this industry
      caseStudies: [
        {
          id: 'championship-sports-complex',
          title: 'Championship Sports Complex Doubles Tournament Revenue',
          industry: 'Sport, Media & Events',
          client: 'Championship Sports Complex',
          challenge: 'Multi-sport facility struggled with low tournament participation and poor facility utilization. Competition from newer facilities and lack of digital marketing presence.',
          solution: 'Launched comprehensive tournament marketing campaigns, built partnerships with sports leagues and organizations, created community engagement programs, and implemented digital booking systems.',
          results: [
            {
              metric: 'Tournament Revenue',
              value: '+200%',
              description: 'Annual tournament and event revenue'
            },
            {
              metric: 'Facility Utilization',
              value: '85%',
              description: 'Average facility booking rate'
            },
            {
              metric: 'Community Events',
              value: '50+',
              description: 'Events hosted annually'
            }
          ],
          testimonial: {
            quote: "Since partnering with Inteligencia, our tournament participation has doubled and we've added 300 new members. Laurie understands the sports community like no other marketer we've worked with.",
            author: 'Mike Thompson',
            position: 'Facility Director',
            company: 'Championship Sports Complex'
          },
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
          tags: ['Sports Facilities', 'Tournament Marketing', 'Community Building', 'Facility Management']
        },
        {
          id: 'coastal-media-group',
          title: 'Coastal Media Group Scales Event Production 400%',
          industry: 'Sport, Media & Events',
          client: 'Coastal Media Group',
          challenge: 'Event production company struggled to book larger venues and attract premium sponsors. Limited reach and difficulty showcasing their production capabilities to enterprise clients.',
          solution: 'Built comprehensive content marketing strategy showcasing event production quality, launched B2B campaigns targeting event planners and sponsors, created case study content, and developed partnership network.',
          results: [
            {
              metric: 'Event Revenue',
              value: '+400%',
              description: 'Annual event production revenue'
            },
            {
              metric: 'Premium Sponsors',
              value: '25+',
              description: 'Enterprise sponsors acquired'
            },
            {
              metric: 'Event Capacity',
              value: '10,000+',
              description: 'Largest event produced'
            }
          ],
          testimonial: {
            quote: "They helped us transform from small local events to major productions with Fortune 500 sponsors. Our event portfolio now includes stadium-level productions.",
            author: 'Carlos Rodriguez',
            position: 'CEO & Executive Producer',
            company: 'Coastal Media Group'
          },
          image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
          tags: ['Event Production', 'B2B Marketing', 'Sponsor Acquisition', 'Media Production']
        },
        {
          id: 'summit-sports-network',
          title: 'Summit Sports Network Reaches 500K Monthly Viewers',
          industry: 'Sport, Media & Events',
          client: 'Summit Sports Network',
          challenge: 'Local sports media company wanted to expand digital reach and monetize content. Limited subscriber base and difficulty attracting advertising sponsors.',
          solution: 'Developed multi-platform content strategy across YouTube, Instagram, and TikTok, created sponsor-friendly content packages, implemented subscription model, and built engaged community around local sports coverage.',
          results: [
            {
              metric: 'Monthly Viewers',
              value: '500K+',
              description: 'Cross-platform monthly audience'
            },
            {
              metric: 'Subscription Revenue',
              value: '+350%',
              description: 'Premium content subscription growth'
            },
            {
              metric: 'Sponsor Deals',
              value: '15+',
              description: 'Local business sponsorship agreements'
            }
          ],
          testimonial: {
            quote: "They understood both sports and media business models. We went from local hobby project to a sustainable sports media business with real revenue streams.",
            author: 'Jessica Park',
            position: 'Founder & Content Director',
            company: 'Summit Sports Network'
          },
          image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop',
          tags: ['Sports Media', 'Content Strategy', 'Digital Marketing', 'Subscription Model']
        }
      ],
    },
    metadata: {
      title: 'Sports Marketing Services - Inteligencia',
      description: 'Digital marketing for sports facilities and athletic communities. Grow memberships, fill tournaments, and build engaged communities.',
      keywords: ['sports marketing', 'athletic facility marketing', 'tournament promotion', 'membership growth', 'sports community'],
    },
  },

  tech: {
    ...baseConfig,
    industry: 'tech',
    name: 'Tech, AI & Digital Innovation Marketing',
    subdomain: 'tech',
    branding: {
      primaryColor: '#371657',
      secondaryColor: '#f04a9b',
      accentColor: '#176ab2',
    },
    content: {
      hero: {
        title: 'Scale Your Tech Business with Data-Driven Marketing',
        subtitle: 'Growth strategies for SaaS, AI startups, and digital innovators',
        backgroundType: 'video',
        backgroundSrc: 'https://www.youtube.com/watch?v=cAyEiF7VzhY',
        backgroundVideo: 'https://player.vimeo.com/video/1100417251',
        backgroundVideoMobile: 'https://player.vimeo.com/video/1100417904',
        ctaText: 'Book Your Growth Strategy Call',
        ctaLink: '/contact',
        stats: [
          { value: '300%', label: 'Average ARR Growth' },
          { value: '50%', label: 'Lower CAC' },
          { value: '85%', label: 'Better Product-Market Fit' },
        ],
      },
      servicesTitle: 'Marketing Built for Tech Companies',
      servicesSubtitle: 'Specialized strategies for SaaS, AI, and digital innovation',
      services: [
        {
          title: 'SaaS Growth Marketing',
          description: 'Drive predictable revenue growth with funnel optimization and data-driven acquisition strategies.',
          keyBenefit: 'Reduce CAC by 50% in 6 months',
          icon: 'chart-line',
          learnMoreLink: '/tech/services#saas-growth',
        },
        {
          title: 'AI & ML Product Marketing',
          description: 'Position your AI solutions effectively and communicate complex value propositions clearly.',
          keyBenefit: 'Achieve 85% product-market fit',
          icon: 'cpu',
          learnMoreLink: '/tech/services#ai-marketing',
        },
        {
          title: 'B2B Demand Generation',
          description: 'Build sustainable pipelines with account-based marketing and enterprise sales enablement.',
          keyBenefit: '3x qualified lead generation',
          icon: 'building',
          learnMoreLink: '/tech/services#b2b-demand',
        },
        {
          title: 'Product Launch Campaigns',
          description: 'Execute flawless go-to-market strategies that capture market attention and drive adoption.',
          keyBenefit: '10,000+ launch week signups',
          icon: 'rocket',
          learnMoreLink: '/tech/services#product-launch',
        },
        {
          title: 'Content & SEO Strategy',
          description: 'Build thought leadership and organic growth with technical content that ranks and converts.',
          keyBenefit: '500% organic traffic growth',
          icon: 'book-open',
          learnMoreLink: '/tech/services#content-seo',
        },
        {
          title: 'Paid Acquisition Mastery',
          description: 'Scale efficiently across Google, LinkedIn, and emerging platforms with advanced attribution.',
          keyBenefit: '3.5x ROAS consistently',
          icon: 'target',
          learnMoreLink: '/tech/services#paid-acquisition',
        },
        {
          title: 'Analytics & Growth Ops',
          description: 'Build data infrastructure and growth processes that scale with your business.',
          keyBenefit: 'Real-time growth insights',
          icon: 'chart-bar',
          learnMoreLink: '/tech/services#growth-ops',
        },
      ],
      team: [
        {
          name: 'Laurie Meiring',
          title: 'Founder & Tech Marketing Strategist',
          bio: 'With deep experience in scaling tech companies, Laurie specializes in growth marketing for SaaS, AI, and digital innovation companies, helping them achieve product-market fit and sustainable growth.',
          certifications: ['Google Ads Certified', 'HubSpot Growth', 'Product Marketing Alliance'],
          image: '/images/team/laurie-meiring.jpg',
        },
      ],
      testimonials: [
        {
          quote: 'Laurie helped us reduce our customer acquisition cost by 60% while tripling our MRR. Their understanding of SaaS metrics and growth levers is exceptional.',
          author: 'David Chen',
          position: 'CEO',
          company: 'CloudSync AI',
          companyUrl: 'https://cloudsync.ai',
          location: 'San Francisco, CA',
        },
        {
          quote: 'Our product launch exceeded all expectations with 15,000 signups in the first week. Inteligencia\'s go-to-market strategy was flawless.',
          author: 'Sarah Johnson',
          position: 'VP Marketing',
          company: 'DataFlow Analytics',
          companyUrl: 'https://dataflow.io',
          location: 'Austin, TX',
        },
        {
          quote: 'They transformed our content strategy from generic blog posts to thought leadership that drives real pipeline. Our organic leads increased 400%.',
          author: 'Michael Torres',
          position: 'Founder',
          company: 'DevOps Pro',
          companyUrl: 'https://devopspro.com',
          location: 'Seattle, WA',
        },
      ],
      videoCTA: {
        headline: 'Ready to accelerate your tech company\'s growth?',
        subtitle: 'Let\'s discuss how data-driven marketing can help you scale faster and more efficiently',
        ctaText: 'Book Your Growth Strategy Call',
        ctaLink: '/tech/contact',
        trustIndicators: [
          'Free Growth Audit',
          'No Long-term Contracts', 
          'ROI in 90 Days'
        ],
      },
      pricing: {
        plans: [
          {
            name: 'Starter Tech',
            price: '$1,500',
            duration: 'per month',
            description: 'Perfect for early-stage startups and MVPs looking to find product-market fit.',
            features: [
              '1 Growth Channel (e.g., Google Ads or Content)',
              'Up to $5K/month ad spend managed',
              'Basic funnel setup & tracking',
              'Monthly growth reports',
              '2 x 30-min Strategy Calls / month',
              'A/B testing framework'
            ],
            ctaText: 'Get Started',
            ctaLink: '/contact',
            suitableFor: 'Pre-seed to seed stage startups, solo founders, MVP validation',
          },
          {
            name: 'Growth Tech',
            price: '$3,000',
            duration: 'per month',
            description: 'Ideal for scaling SaaS companies ready to accelerate growth.',
            features: [
              '2 Growth Channels (e.g., Paid + Content)',
              'Up to $20K/month ad spend managed',
              'Full funnel optimization',
              'Product analytics integration',
              'Bi-weekly 60 min Strategy Calls',
              'Content calendar & SEO strategy',
              'Lead scoring & nurturing',
              'Conversion rate optimization'
            ],
            recommended: true,
            ctaText: 'Most Popular',
            ctaLink: '/contact',
            suitableFor: 'Series A/B SaaS, scaling startups, established tech companies',
          },
          {
            name: 'Pro+ Tech',
            price: '$5,500',
            duration: 'per month+',
            description: 'For high-growth tech companies targeting enterprise or rapid scale.',
            features: [
              'Unlimited Growth Channels',
              'Up to $75K/month ad spend managed',
              'ABM & enterprise demand gen',
              'Weekly Strategy & Performance Calls',
              'Advanced attribution modeling',
              'Growth team augmentation',
              'Custom integrations & APIs',
              'Dedicated Growth Manager',
              'Slack integration & priority support'
            ],
            ctaText: 'Contact Us',
            ctaLink: '/contact',
            suitableFor: 'Series B+, enterprise SaaS, unicorn trajectory companies',
          },
        ],
        addOns: [
          {
            name: 'Technical Case Study',
            price: '$1,500',
          },
          {
            name: 'Developer Community Setup',
            price: '$2,000',
          },
          {
            name: 'Growth Audit & Roadmap',
            price: '$999',
          },
          {
            name: 'API Documentation Marketing',
            price: '$750',
          },
        ],
        addOnsTitle: 'Optional Add-Ons (A La Carte)',
      },
      contact: {
        title: 'Ready to Scale Your Tech Company?',
        subtitle: 'Get your free growth audit and discover untapped opportunities to accelerate your business.',
        calendlyText: 'Schedule Your Free Growth Strategy Session',
        email: 'laurie@inteligenciadm.com',
        phone: '+506 6200 2747',
        address: '123 Business Ave, Suite 100, Miami, FL 33101',
        businessTypes: ['SaaS', 'AI/ML Startup', 'Developer Tools', 'B2B Software', 'MarTech', 'FinTech', 'Other Tech'],
        budgetRanges: ['$1,000 - $2,500/month', '$2,500 - $5,000/month', '$5,000 - $10,000/month', '$10,000+ /month', 'Let\'s discuss'],
        timelineOptions: ['ASAP - I need help now', 'Within 1 month', '1-3 months', '3-6 months', 'Just exploring options'],
        formLabels: {
          contactMethodsTitle: 'Get in Touch',
          contactMethodsSubtitle: 'Ready to discuss your tech company\'s growth? Choose the contact method that works best for you.',
          formTitle: 'Send us a message',
          formSubtitle: 'Fill out the form below and we\'ll get back to you within 24 hours with a customized growth strategy.',
          firstName: 'First Name *',
          lastName: 'Last Name *',
          email: 'Email Address *',
          phone: 'Phone Number',
          company: 'Company Name *',
          businessType: 'Business Type *',
          budget: 'Marketing Budget',
          timeline: 'Timeline',
          goals: 'What are your main growth goals? *',
          message: 'Additional Details',
          submitButton: 'Send Message & Get Free Growth Audit',
          privacyText: 'We respect your privacy and will never share your information.',
          placeholders: {
            firstName: 'Enter your first name',
            lastName: 'Enter your last name',
            email: 'your@email.com',
            phone: '+506 6200 2747',
            company: 'Your Company Name',
            businessType: 'Select your business type',
            budget: 'Select your budget range',
            timeline: 'When do you want to start?',
            goals: 'e.g., Increase MRR, reduce CAC, improve conversion rates...',
            message: 'Tell us more about your product, current metrics, or any specific challenges...'
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
            answer: 'Most tech companies see initial improvements within 30-60 days, with significant growth metrics achieved within 3-6 months. We focus on both quick wins and sustainable long-term growth.',
          },
          {
            question: 'Do you work with companies outside of tech?',
            answer: 'We specialize in tech, hospitality, food service, healthcare, and athletics. Our tech vertical focuses exclusively on SaaS, AI/ML, and digital innovation companies.',
          },
          {
            question: 'What makes your approach different for tech companies?',
            answer: 'We understand SaaS metrics, product-led growth, developer marketing, and the unique challenges of scaling tech companies. Our strategies are data-driven and built on proven tech industry best practices.',
          },
          {
            question: 'Do you require long-term contracts?',
            answer: 'We offer flexible monthly plans with no long-term commitments required. However, we recommend at least 6 months to see meaningful growth and ROI.',
          },
        ],
      },
      servicesPageContent: {
        hero: {
          title: 'Growth Marketing for Tech Innovators',
          subtitle: 'Data-Driven Strategies to Scale Your SaaS, AI, or Tech Startup'
        }
      },
      servicesPage: {
        services: [
          {
            id: 'saas-growth',
            title: 'SaaS Growth Marketing',
            fullDescription: 'Comprehensive growth strategies designed specifically for SaaS businesses. We focus on reducing CAC, improving LTV, and building predictable revenue growth through data-driven marketing.',
            features: ['Funnel optimization', 'Conversion rate optimization', 'Churn reduction strategies', 'Pricing & packaging consulting', 'Product-led growth implementation', 'Revenue operations setup'],
            process: ['Growth audit & benchmarking', 'Funnel mapping & optimization', 'Channel strategy development', 'Continuous experimentation'],
            results: 'Average 300% ARR growth and 50% CAC reduction within 12 months',
            caseStudyLink: '/case-studies#cloudsync-ai',
            caseStudyText: 'See how CloudSync AI tripled their MRR in 6 months →',
            icon: '📈',
            pricing: {
              starter: {
                name: 'SaaS Growth Starter',
                price: '$1,500',
                duration: '/month',
                description: 'Essential growth marketing for early-stage SaaS',
                features: ['Basic funnel optimization', 'Google Ads management', 'Monthly growth reports', 'Conversion tracking setup'],
                suitable: 'Pre-revenue to $10K MRR'
              },
              growth: {
                name: 'SaaS Growth Accelerator',
                price: '$3,000',
                duration: '/month',
                description: 'Comprehensive growth engine for scaling SaaS',
                features: ['Multi-channel growth strategy', 'Advanced funnel optimization', 'A/B testing framework', 'Revenue operations consulting'],
                recommended: true,
                suitable: '$10K - $100K MRR'
              },
              pro: {
                name: 'SaaS Growth Enterprise',
                price: '$5,500',
                duration: '/month',
                description: 'Enterprise growth marketing and RevOps',
                features: ['Full growth team augmentation', 'Advanced attribution', 'ABM strategies', 'Executive advisory'],
                suitable: '$100K+ MRR'
              }
            }
          },
          {
            id: 'ai-marketing',
            title: 'AI & ML Product Marketing',
            fullDescription: 'Specialized marketing for AI and machine learning companies. We help communicate complex technical value propositions, build developer communities, and drive adoption of innovative AI solutions.',
            features: ['Technical content marketing', 'Developer community building', 'API marketing strategies', 'Use case development', 'Thought leadership campaigns', 'Partnership marketing'],
            process: ['Product positioning workshop', 'Audience & use case mapping', 'Content & community strategy', 'Launch & scale execution'],
            results: '85% better product-market fit and 10x developer adoption',
            caseStudyLink: '/case-studies#dataflow-analytics',
            caseStudyText: 'Discover how DataFlow reached 15K developers →',
            icon: '🤖',
            pricing: {
              starter: {
                name: 'AI Marketing Starter',
                price: '$1,800',
                duration: '/month',
                description: 'Basic AI product marketing',
                features: ['Product positioning', 'Basic content strategy', 'Launch planning', 'Developer outreach'],
                suitable: 'MVP to beta stage'
              },
              growth: {
                name: 'AI Marketing Growth',
                price: '$3,500',
                duration: '/month',
                description: 'Full AI go-to-market strategy',
                features: ['Technical content production', 'Developer community management', 'Partnership development', 'Event marketing'],
                recommended: true,
                suitable: 'Growth stage AI companies'
              },
              pro: {
                name: 'AI Marketing Enterprise',
                price: '$6,000',
                duration: '/month',
                description: 'Enterprise AI marketing & partnerships',
                features: ['Executive thought leadership', 'Enterprise ABM', 'Global launch campaigns', 'Analyst relations'],
                suitable: 'Enterprise AI solutions'
              }
            }
          },
          {
            id: 'b2b-demand',
            title: 'B2B Demand Generation',
            fullDescription: 'Build predictable B2B pipelines with account-based marketing, enterprise demand generation, and sales enablement strategies designed for complex B2B sales cycles.',
            features: ['Account-based marketing (ABM)', 'LinkedIn advertising mastery', 'Sales enablement content', 'Lead scoring & nurturing', 'Intent data utilization', 'Pipeline acceleration'],
            process: ['ICP & TAM analysis', 'ABM strategy development', 'Multi-channel orchestration', 'Sales & marketing alignment'],
            results: '3x qualified pipeline and 40% faster sales cycles',
            caseStudyLink: '/case-studies#enterprise-tech',
            caseStudyText: 'Learn how we generated $5M in enterprise pipeline →',
            icon: '🎯',
            pricing: {
              starter: {
                name: 'B2B Demand Starter',
                price: '$2,000',
                duration: '/month',
                description: 'Essential B2B lead generation',
                features: ['LinkedIn advertising', 'Basic lead nurturing', 'Landing page optimization', 'CRM integration'],
                suitable: 'SMB-focused B2B'
              },
              growth: {
                name: 'B2B Demand Growth',
                price: '$4,000',
                duration: '/month',
                description: 'Strategic ABM and demand generation',
                features: ['Full ABM implementation', 'Multi-channel campaigns', 'Sales enablement', 'Advanced nurturing'],
                recommended: true,
                suitable: 'Mid-market B2B'
              },
              pro: {
                name: 'B2B Demand Enterprise',
                price: '$7,000',
                duration: '/month',
                description: 'Enterprise demand generation engine',
                features: ['Enterprise ABM', 'Intent data strategies', 'Executive programs', 'Full martech stack'],
                suitable: 'Enterprise B2B'
              }
            }
          }
        ],
        marketingProcess: [
          {
            step: '01',
            title: 'Growth Audit & Analysis',
            description: 'Deep dive into your metrics, tech stack, and growth opportunities to identify quick wins and long-term strategies.',
            icon: '🔍',
          },
          {
            step: '02', 
            title: 'Strategy & Roadmap',
            description: 'Develop a data-driven growth roadmap with clear KPIs, channel strategies, and experimentation framework.',
            icon: '🗺️',
          },
          {
            step: '03',
            title: 'Rapid Implementation',
            description: 'Execute growth initiatives with agile sprints, continuous testing, and real-time optimization.',
            icon: '🚀',
          },
          {
            step: '04',
            title: 'Scale & Optimize',
            description: 'Double down on winning strategies, automate growth processes, and build sustainable growth engines.',
            icon: '📊',
          },
        ],
        coreCapabilities: [
          {
            title: 'Performance Marketing',
            description: 'Multi-channel paid acquisition with advanced attribution',
            features: ['Google Ads & Shopping', 'LinkedIn & Social Ads', 'Retargeting & Remarketing', 'Attribution Modeling'],
            icon: '💰',
          },
          {
            title: 'Product-Led Growth',
            description: 'Build viral loops and self-serve revenue engines',
            features: ['Onboarding Optimization', 'Feature Adoption', 'Viral Mechanics', 'Usage Analytics'],
            icon: '🚀',
          },
          {
            title: 'Content & SEO',
            description: 'Technical content that ranks and converts',
            features: ['Technical SEO', 'Developer Content', 'Thought Leadership', 'Link Building'],
            icon: '📝',
          },
          {
            title: 'Growth Analytics',
            description: 'Data infrastructure for growth decisions',
            features: ['Custom Dashboards', 'Cohort Analysis', 'Revenue Attribution', 'Predictive Modeling'],
            icon: '📈',
          },
        ],
        industryBenefits: [
          'Reduce CAC by 50%+ in 6 months',
          'Achieve 3x ARR growth',
          'Build predictable revenue engines',
          'Scale with data-driven confidence',
        ],
      },
      caseStudies: [
        {
          id: 'cloudsync-ai',
          title: 'CloudSync AI Achieves 300% ARR Growth',
          industry: 'Tech, AI & Digital Innovation',
          client: 'CloudSync AI',
          challenge: 'Early-stage AI startup struggling with high CAC and unclear product positioning. Limited resources and fierce competition from established players.',
          solution: 'Implemented product-led growth strategy, optimized onboarding funnel, launched targeted content marketing for developers, and built efficient paid acquisition channels.',
          results: [
            {
              metric: 'ARR Growth',
              value: '+300%',
              description: 'Annual recurring revenue increase in 12 months'
            },
            {
              metric: 'CAC Reduction',
              value: '-60%',
              description: 'Customer acquisition cost optimization'
            },
            {
              metric: 'Conversion Rate',
              value: '+150%',
              description: 'Trial to paid conversion improvement'
            }
          ],
          testimonial: {
            quote: "Laurie helped us reduce our customer acquisition cost by 60% while tripling our MRR. Their understanding of SaaS metrics and growth levers is exceptional.",
            author: 'David Chen',
            position: 'CEO',
            company: 'CloudSync AI'
          },
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
          tags: ['SaaS Growth', 'AI Marketing', 'PLG Strategy', 'Funnel Optimization']
        },
        {
          id: 'dataflow-analytics',
          title: 'DataFlow Analytics: 15K Signups in Launch Week',
          industry: 'Tech, AI & Digital Innovation',
          client: 'DataFlow Analytics',
          challenge: 'New analytics platform entering crowded market. Needed to differentiate from competitors and achieve rapid adoption among data teams.',
          solution: 'Orchestrated multi-channel product launch, created technical content series, built developer community on Discord, implemented referral program for growth.',
          results: [
            {
              metric: 'Launch Signups',
              value: '15,000+',
              description: 'Users acquired in first week'
            },
            {
              metric: 'Community Growth',
              value: '5,000+',
              description: 'Active Discord members in 3 months'
            },
            {
              metric: 'Organic Traffic',
              value: '+400%',
              description: 'SEO-driven traffic growth'
            }
          ],
          testimonial: {
            quote: "Our product launch exceeded all expectations with 15,000 signups in the first week. Inteligencia's go-to-market strategy was flawless.",
            author: 'Sarah Johnson',
            position: 'VP Marketing',
            company: 'DataFlow Analytics'
          },
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
          tags: ['Product Launch', 'Developer Marketing', 'Community Building', 'Content Strategy']
        },
        {
          id: 'devops-pro',
          title: 'DevOps Pro Transforms Content into $2M Pipeline',
          industry: 'Tech, AI & Digital Innovation',
          client: 'DevOps Pro',
          challenge: 'B2B DevOps platform struggled with generic blog content that generated little engagement or pipeline. Long sales cycles and difficulty reaching decision makers in enterprise environments.',
          solution: 'Developed thought leadership content strategy targeting CTOs and DevOps leaders. Created technical deep-dives, case studies, and interactive tools. Implemented ABM campaigns for Fortune 500 prospects.',
          results: [
            {
              metric: 'Organic Leads',
              value: '+400%',
              description: 'Qualified leads from content marketing'
            },
            {
              metric: 'Pipeline Value',
              value: '$2M+',
              description: 'Marketing-attributed pipeline generated'
            },
            {
              metric: 'Enterprise Deals',
              value: '+250%',
              description: 'Increase in enterprise deal flow'
            }
          ],
          testimonial: {
            quote: "They transformed our content strategy from generic blog posts to thought leadership that drives real pipeline. Our organic leads increased 400%.",
            author: 'Michael Torres',
            position: 'Founder',
            company: 'DevOps Pro'
          },
          image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
          tags: ['B2B Content', 'Thought Leadership', 'ABM Strategy', 'Enterprise Sales']
        }
      ],
    },
    metadata: {
      title: 'Tech Marketing Services - Inteligencia',
      description: 'Specialized marketing for SaaS, AI, and tech companies. Scale faster with data-driven growth strategies and proven tech marketing expertise.',
      keywords: ['tech marketing', 'saas marketing', 'ai marketing', 'b2b demand generation', 'growth marketing'],
    },
  },

  main: {
    ...baseConfig,
    industry: 'main',
    name: 'Inteligencia - Multi-Industry Marketing',
    subdomain: 'inteligencia',
    branding: {
      primaryColor: '#371657',
      secondaryColor: '#f04a9b',
      accentColor: '#176ab2',
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
        email: 'laurie@inteligenciadm.com',
        phone: '+506 6200 2747',
      },
    },
    metadata: {
      title: 'Inteligencia - Specialized Marketing Solutions',
      description: 'Professional marketing services tailored for hotels, restaurants, healthcare, and sports industries. Choose your industry for specialized solutions.',
      keywords: ['digital marketing', 'industry marketing', 'specialized marketing', 'business growth', 'marketing solutions'],
    },
  },
};