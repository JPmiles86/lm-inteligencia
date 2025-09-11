// Seamless Industry-specific page with unified header

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useIndustryContext } from '../../contexts/IndustryContext';
import { HeroSection } from '../sections/HeroSection';
import { ServicesSection } from '../sections/ServicesSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { VideoCTASection } from '../sections/VideoCTASection';
import { PricingSection } from '../sections/PricingSection';
import { HomepageSectionRenderer } from '../sections/HomepageSectionRenderer';
import { AboutTeaserSection } from '../sections/AboutTeaserSection';
import { BlogSection } from '../sections/BlogSection';
import { VideoBackgroundSection } from '../sections/VideoBackgroundSection';
import { getIndustryName } from '../../types/Industry';
import { isSectionVisibleSync } from '../../utils/verticalVisibility';

export const SeamlessIndustryPage: React.FC = () => {
  const { config, industryKey } = useIndustryContext();
  const industryName = getIndustryName(config.industry);
  const location = useLocation();
  // Removed unused isDirect state variable
  const [showContent, setShowContent] = useState(false);
  
  const industryPath = `/${industryKey}`; // Industry path from context

  useEffect(() => {
    // Check if this is a direct URL access
    // Removed unused isDirect state update
    
    // Show content immediately since header is handled by SharedIndustryLayout
    setShowContent(true);
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: showContent ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
        <HeroSection 
          content={config.content.hero} 
          industryPath={industryPath}
        />

        {/* Full Viewport Video Section */}
        <VideoBackgroundSection 
          desktopVideoUrl={config.content.hero.backgroundVideo || 'https://player.vimeo.com/video/1100417251'}
          mobileVideoUrl={config.content.hero.backgroundVideoMobile || 'https://player.vimeo.com/video/1100417904'}
        />

        {/* Services Section */}
        <ServicesSection 
          services={config.content.services} 
          title={config.content.servicesTitle || 'Marketing That Moves The Metrics That Matter'}
          subtitle={config.content.servicesSubtitle || 'AI-Driven Strategy for Your Business'}
          industryTheme={config.industry}
          viewAllCta={config.content.servicesViewAllCta || ''}
          industryPath={industryPath}
        />

        {/* Homepage Sections - Insert between Services and Testimonials */}
        {config.content.homepageSections && config.content.homepageSections.map((section, index) => (
          <HomepageSectionRenderer 
            key={section.id} 
            section={section} 
            industryTheme={config.industry}
            index={index}
            industryPath={industryPath}
          />
        ))}

        {/* Testimonials Section */}
        {isSectionVisibleSync(config.industry, 'showTestimonials') && (
          <TestimonialsSection 
            testimonials={config.content.testimonials} 
            industryTheme={config.industry}
            viewAllCta={config.content.testimonialsViewAllCta || ''}
            industryPath={industryPath}
          />
        )}

        {/* Pricing Section */}
        <PricingSection 
          pricing={config.content.pricing} 
          industryTheme={config.industry}
          viewDetailedCta={config.content.pricingViewDetailedCta || ''}
          industryPath={industryPath}
        />

        {/* About Teaser Section */}
        {config.content.aboutLearnMoreCta && (
          <AboutTeaserSection 
            team={config.content.team}
            industryTheme={config.industry}
            learnMoreCta={config.content.aboutLearnMoreCta}
            industryPath={industryPath}
          />
        )}

        {/* Blog Section */}
        <BlogSection 
          industryPath={industryPath}
        />

        {/* Video CTA Section */}
        <VideoCTASection 
          industry={config.industry}
          industryPath={industryPath}
          headline={`Ready to transform your ${industryName.toLowerCase()}'s digital presence?`}
        />

        {/* Contact Section */}
        <section className="py-32 bg-white" id="contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-5xl sm:text-6xl font-bold mb-8" style={{ color: '#000', letterSpacing: '-0.02em' }}>
                {config.content.contact.title || 'Ready to Get Started?'}
              </h2>
              <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
                {config.content.contact.subtitle || 'Let\'s discuss how we can help grow your business with specialized marketing strategies.'}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Contact Info */}
                <div className="text-left bg-gray-50 rounded-2xl p-10">
                  <h3 className="text-3xl font-bold mb-8" style={{ color: '#000' }}>Get in Touch</h3>
                  <div className="space-y-4">
                    {config.content.contact.email && (
                      <div className="flex items-center">
                        <div className="mr-4" style={{ color: '#f04a9b' }}>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Email</div>
                          <div className="text-gray-600">{config.content.contact.email}</div>
                        </div>
                      </div>
                    )}
                    
                    {config.content.contact.phone && (
                      <div className="flex items-center">
                        <div className="mr-4" style={{ color: '#f04a9b' }}>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Phone</div>
                          <div className="text-gray-600">{config.content.contact.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <textarea
                      rows={4}
                      placeholder="Tell us about your project..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#f04a9b] hover:bg-[#e0438e] text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
    </motion.div>
  );
};