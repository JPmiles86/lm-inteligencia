// Complete Industry-specific page component

import React from 'react';
import { motion } from 'framer-motion';
import type { IndustryConfig } from '../../types/Industry';
import { IndustryNavbar } from '../layout/IndustryNavbar';
import { HeroSection } from '../sections/HeroSection';
import { ServicesSection } from '../sections/ServicesSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { VideoCTASection } from '../sections/VideoCTASection';
import { getIndustryName } from '../../types/Industry';

interface IndustryPageProps {
  config: IndustryConfig;
}

export const IndustryPage: React.FC<IndustryPageProps> = ({ config }) => {
  const industryName = getIndustryName(config.industry);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <IndustryNavbar config={config} />

      {/* Hero Section */}
      <HeroSection 
        content={config.content.hero} 
      />

      {/* Services Section */}
      <ServicesSection 
        services={config.content.services} 
        industryTheme={config.industry}
      />

      {/* Testimonials Section */}
      <TestimonialsSection 
        testimonials={config.content.testimonials} 
        industryTheme={config.industry}
      />

      {/* Video CTA Section */}
      <VideoCTASection 
        industry={config.industry}
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
                      <div className="mr-4" style={{ color: '#0f5bfb' }}>
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
                      <div className="mr-4" style={{ color: '#0f5bfb' }}>
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
              <div className="bg-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    rows={4}
                    placeholder="Tell us about your project..."
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">Inteligencia</div>
              <p className="text-gray-400 mb-4">
                Specialized marketing solutions for {industryName.toLowerCase()}.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                {config.content.services.slice(0, 4).map((service, index) => (
                  <li key={index}>{service.title}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Industries</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hotels & Hospitality</li>
                <li>Restaurants & Food Service</li>
                <li>Healthcare</li>
                <li>Sports & Recreation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                {config.content.contact.email && (
                  <div>{config.content.contact.email}</div>
                )}
                {config.content.contact.phone && (
                  <div>{config.content.contact.phone}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Inteligencia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};