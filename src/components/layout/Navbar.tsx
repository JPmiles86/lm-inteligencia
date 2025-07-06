// Navigation Component

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { IndustryType, IndustryConfig } from '../../types/Industry';
import { IndustryNames } from '../../types/Industry';

interface NavbarProps {
  config: IndustryConfig;
  onIndustrySwitch?: (industry: IndustryType) => void;
  currentIndustry?: IndustryType;
}

export const Navbar: React.FC<NavbarProps> = ({ config, onIndustrySwitch, currentIndustry }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // In unified architecture, we scroll to sections instead of navigate
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const otherIndustries = (['hospitality', 'foodservice', 'healthcare', 'athletics'] as IndustryType[])
    .filter(ind => ind !== currentIndustry);




  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="text-2xl font-bold">
                <span style={{ color: config?.branding?.primaryColor || '#0f5bfb' }}>Inteligencia</span>
              </div>
              <div className="hidden sm:block text-sm text-gray-600">
                {config?.name || 'Digital Marketing'}
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('services')}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                Success Stories
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="font-medium transition-colors hover:text-primary text-gray-700"
              >
                Contact
              </button>
              
              {/* Industries Dropdown */}
              <div className="relative group">
                <button className={`font-medium transition-colors hover:text-primary flex items-center ${
                  isScrolled ? 'text-gray-700' : 'text-gray-700'
                }`}>
                  Other Industries
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {otherIndustries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => onIndustrySwitch && onIndustrySwitch(ind)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {IndustryNames[ind]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => scrollToSection('contact')}
                className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: config?.branding?.primaryColor || '#0f5bfb' }}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-md transition-colors ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            height: isMobileMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('services');
              }}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              Services
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('testimonials');
              }}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              Success Stories
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('contact');
              }}
              className="block w-full text-left py-2 transition-colors hover:text-primary text-gray-700"
            >
              Contact
            </button>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm font-medium text-gray-900 mb-3">Other Industries</div>
              {otherIndustries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onIndustrySwitch && onIndustrySwitch(ind);
                  }}
                  className="block w-full text-left py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  {IndustryNames[ind]}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('contact');
              }}
              className="block w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-center"
              style={{ backgroundColor: config?.branding?.primaryColor || '#0f5bfb' }}
            >
              Get Started
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* No spacer needed in unified architecture */}
    </>
  );
};