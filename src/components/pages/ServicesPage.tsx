// Services Overview Page - Comprehensive services showcase

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIndustryContext } from '../../contexts/IndustryContext';
import { getIndustryName } from '../../types/Industry';
import { SimplifiedPricingSection } from '../sections/SimplifiedPricingSection';

export const ServicesPage: React.FC = () => {
  const { config, industryKey } = useIndustryContext();
  const industryName = getIndustryName(config.industry);

  // Get content from config
  const servicesPageContent = config.content.servicesPageContent;
  
  // Use content from config or fallbacks
  const hero = servicesPageContent?.hero || {
    title: `${industryName} Marketing Services`,
    subtitle: 'Comprehensive digital marketing solutions designed specifically for your industry'
  };
  
  // Define the 7 core services to display for hotels
  const mainServices = industryKey === 'hotels' ? [
    {
      title: 'Hotels Ad Management',
      icon: '🏨',
      description: 'Drive direct bookings with targeted campaigns that reach travelers at the perfect moment.',
      features: [
        'Google Hotel Ads Setup',
        'Direct Booking Optimization',
        'Rate Parity Management',
        'Revenue Performance Tracking'
      ]
    },
    {
      title: 'Meta (Facebook/Instagram) Advertising',
      icon: '📱',
      description: 'Reach leisure travelers on social media with stunning visuals and compelling offers.',
      features: [
        'Facebook Ads Management',
        'Instagram Story Campaigns',
        'Lookalike Audience Building',
        'Dynamic Hotel Ads'
      ]
    },
    {
      title: 'Email Marketing & Funnels',
      icon: '📧',
      description: 'Nurture guest relationships and drive repeat bookings with personalized campaigns.',
      features: [
        'Guest Welcome Series',
        'Pre-Arrival Campaigns',
        'Loyalty Program Emails',
        'Seasonal Promotions'
      ]
    },
    {
      title: 'Marketing Strategy Consulting',
      icon: '📊',
      description: 'Expert guidance on reducing OTA dependency and increasing direct revenue.',
      features: [
        'Revenue Strategy Planning',
        'Channel Mix Optimization',
        'Competitive Analysis',
        'Direct Booking Roadmap'
      ]
    },
    {
      title: 'Event/Launch Campaigns',
      icon: '🚀',
      description: 'Grand openings, renovations, or special events - we ensure maximum visibility.',
      features: [
        'Pre-Launch Buzz Building',
        'Media & Influencer Outreach',
        'Opening Week Campaigns',
        'Post-Launch Momentum'
      ]
    },
    {
      title: 'OTA Optimization & Demand Generation',
      icon: '🌐',
      description: 'Maximize visibility on booking platforms while building direct booking channels.',
      features: [
        'OTA Listing Optimization',
        'Review Management',
        'Ranking Improvement',
        'Channel Performance Analysis'
      ]
    },
    {
      title: 'Restaurant Marketing',
      icon: '🍽️',
      description: 'Fill your hotel restaurant with both guests and locals through targeted campaigns.',
      features: [
        'Local SEO Optimization',
        'Social Media Presence',
        'Event & Special Menus',
        'Guest Dining Campaigns'
      ]
    },
    {
      title: 'Alternative Channel Marketing',
      icon: '🔄',
      description: 'Expand your reach beyond the major platforms with targeted campaigns on alternative channels that fit your audience.',
      features: [
        'Microsoft (Bing Ads)',
        'X (Formerly Twitter) Ads',
        'Snapchat Ads',
        'Niche Platform Campaigns'
      ]
    },
    {
      title: 'Conversion Rate Optimization (CRO)',
      icon: '📈',
      description: 'Turn more clicks into customers with data-driven website and funnel optimization.',
      features: [
        'Landing Page Optimization',
        'A/B Testing',
        'User Experience (UX) Enhancements',
        'Heatmaps & Behavior Analysis'
      ]
    }
  ] : [
    {
      title: 'Google Ads Management',
      icon: '🔍',
      description: 'Expert Google Ads campaigns targeting high-intent customers actively searching for your services.',
      features: [
        'Search Campaign Management',
        'Display & Remarketing',
        'Shopping Campaigns',
        'Performance Max Campaigns'
      ]
    },
    {
      title: 'Meta Ads (Facebook & Instagram)',
      icon: '📱',
      description: 'Targeted social media advertising to reach your ideal customers where they spend their time.',
      features: [
        'Facebook Ads Management',
        'Instagram Advertising',
        'Audience Targeting',
        'Creative Development'
      ]
    },
    {
      title: 'Email Marketing',
      icon: '📧',
      description: 'Strategic email campaigns that nurture leads and drive customer retention.',
      features: [
        'Campaign Strategy',
        'List Management',
        'Automation Setup',
        'Performance Tracking'
      ]
    },
    {
      title: 'Marketing Strategy',
      icon: '📊',
      description: 'Data-driven marketing strategies tailored to your business goals and industry.',
      features: [
        'Market Analysis',
        'Competitor Research',
        'Customer Journey Mapping',
        'Growth Planning'
      ]
    },
    {
      title: 'Launch Campaigns',
      icon: '🚀',
      description: 'Comprehensive launch strategies for new products, services, or locations.',
      features: [
        'Pre-Launch Strategy',
        'Multi-Channel Execution',
        'Launch Event Marketing',
        'Post-Launch Optimization'
      ]
    },
    {
      title: 'SEO & Local Search Optimization',
      icon: '🌐',
      description: 'Maximize your online visibility and attract more local customers through search optimization.',
      features: [
        'Local SEO Strategy',
        'Google My Business Optimization',
        'Content Optimization',
        'Review Management'
      ]
    },
    {
      title: 'Content Marketing & Social Media',
      icon: '📝',
      description: 'Engage your audience with compelling content and build a strong social media presence.',
      features: [
        'Content Strategy Development',
        'Social Media Management',
        'Blog & Article Writing',
        'Community Engagement'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#371657] via-[#9123d1] to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              {hero.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              {hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Simplified Pricing Section - Show Early */}
      <SimplifiedPricingSection />

      {/* Core Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Digital Marketing Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive marketing services work together to drive growth and maximize your ROI.
            </p>
          </motion.div>

          {/* Core Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices && mainServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="text-4xl mb-6 text-center">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#371657] via-[#9123d1] to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your {industryName} Marketing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Let's discuss how our proven strategies can help grow your business. 
              Schedule a free consultation with our {industryName.toLowerCase()} marketing experts today.
            </p>
            <div className="flex justify-center">
              <Link
                to="/contact"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-block"
              >
                Get Your Free Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};